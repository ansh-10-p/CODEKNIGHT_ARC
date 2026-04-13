"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import Vapi from '@vapi-ai/web'

interface MentorMessage { role: 'assistant' | 'user'; text: string }
interface TranscriptMessage {
  type?: string
  role?: 'assistant' | 'user'
  transcriptType?: 'partial' | 'final'
  transcript?: string
}

interface ConversationMessage {
  role?: 'assistant' | 'user' | 'system' | 'tool' | 'function'
  content?: unknown
}

interface ConversationUpdateMessage {
  type?: string
  messages?: ConversationMessage[]
}

interface UseVapiReturn {
  volumeLevel: number
  isCallActive: boolean
  isLoading: boolean
  messages: MentorMessage[]
  toggleCall: () => Promise<void>
}

const publicKey =
  process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ||
  process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN ||
  process.env.NEXT_PUBLIC_VAPI_API_KEY

const defaultAssistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID

function extractTextContent(content: unknown): string {
  if (typeof content === 'string') {
    return content.trim()
  }

  if (!Array.isArray(content)) {
    return ''
  }

  return content
    .map((part) => {
      if (!part || typeof part !== 'object') {
        return ''
      }

      const type = 'type' in part ? part.type : undefined
      const text = 'text' in part ? part.text : undefined

      return type === 'text' && typeof text === 'string' ? text.trim() : ''
    })
    .filter(Boolean)
    .join('\n')
    .trim()
}

export function useVapi(assistantId?: string): UseVapiReturn {
  const vapiRef = useRef<Vapi | null>(null)
  const [isCallActive, setIsCallActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [messages, setMessages] = useState<MentorMessage[]>([])

  const appendMessage = useCallback((message: MentorMessage) => {
    setMessages((currentMessages) => {
      const lastMessage = currentMessages[currentMessages.length - 1]

      if (
        lastMessage &&
        lastMessage.role === message.role &&
        lastMessage.text === message.text
      ) {
        return currentMessages
      }

      return [...currentMessages, message]
    })
  }, [])

  const init = useCallback(async () => {
    if (vapiRef.current) {
      return vapiRef.current
    }

    if (!publicKey) {
      throw new Error('Missing NEXT_PUBLIC_VAPI_PUBLIC_KEY for browser Vapi calls.')
    }

    const vapi = new Vapi(publicKey)

    vapi.on('call-start', () => {
      setIsCallActive(true)
    })

    vapi.on('call-end', () => {
      setIsCallActive(false)
      setVolumeLevel(0)
    })

    vapi.on('volume-level', (level) => {
      setVolumeLevel(typeof level === 'number' ? level : 0)
    })

    vapi.on('message', (message: TranscriptMessage | ConversationUpdateMessage) => {
      if (message?.type === 'transcript' || message?.type === "transcript[transcriptType='final']") {
        const transcriptMessage = message as TranscriptMessage

        if (
          transcriptMessage.transcriptType === 'final' &&
          typeof transcriptMessage.transcript === 'string' &&
          transcriptMessage.transcript.trim()
        ) {
          appendMessage({
            role: transcriptMessage.role === 'assistant' ? 'assistant' : 'user',
            text: transcriptMessage.transcript.trim(),
          })
        }

        return
      }

      const conversationUpdate = message as ConversationUpdateMessage

      if (
        conversationUpdate?.type === 'conversation-update' &&
        Array.isArray(conversationUpdate.messages)
      ) {
        const latestMessage =
          conversationUpdate.messages?.[conversationUpdate.messages.length - 1]
        const text = extractTextContent(latestMessage?.content)

        if ((latestMessage?.role === 'assistant' || latestMessage?.role === 'user') && text) {
          appendMessage({
            role: latestMessage.role,
            text,
          })
        }
      }
    })

    vapi.on('error', (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'Unknown Vapi error'

      setIsCallActive(false)
      appendMessage({ role: 'assistant', text: `Vapi error: ${errorMessage}` })
    })

    vapiRef.current = vapi
    return vapi
  }, [appendMessage])

  const start = useCallback(async () => {
    const resolvedAssistantId = assistantId || defaultAssistantId

    if (!resolvedAssistantId) {
      appendMessage({ role: 'assistant', text: 'Missing Vapi assistant ID.' })
      return
    }

    try {
      setIsLoading(true)
      const vapi = await init()
      await vapi.start(resolvedAssistantId)
    } catch (error) {
      appendMessage({
        role: 'assistant',
        text: `Start error: ${error instanceof Error ? error.message : 'Failed to start call.'}`,
      })
    } finally {
      setIsLoading(false)
    }
  }, [appendMessage, assistantId, init])

  const stop = useCallback(async () => {
    try {
      vapiRef.current?.stop()
      setIsCallActive(false)
      setVolumeLevel(0)
    } catch {}
  }, [])

  const toggleCall = useCallback(async () => {
    if (isCallActive) {
      await stop()
    } else {
      await start()
    }
  }, [isCallActive, start, stop])

  useEffect(() => {
    return () => {
      vapiRef.current?.stop()
      vapiRef.current?.removeAllListeners()
      vapiRef.current = null
    }
  }, [])

  return { volumeLevel, isCallActive, isLoading, messages, toggleCall }
}

export default useVapi
