"use client"
import React, { useState } from 'react'
import OpenAI from 'openai'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { IndianRupee, Upload, Image as ImageIcon, Sparkles, Loader2, Plus } from 'lucide-react'

// Shape for extracted menu item
export interface ExtractedMenuItem {
  id: string
  name: string
  price: number
  category?: string
  confidence?: number
}

interface Props {
  onItemsExtracted?: (items: ExtractedMenuItem[]) => void
  digitalMenuLink?: string
}

/*
  This component lets a manager upload a photo of a printed menu.
  It sends the image to OpenAI GPT-4o and parses a structured list
  of up to 10 items { name, price }. All parsing is client-side as requested.
*/
export const MenuImageExtractor: React.FC<Props> = ({ onItemsExtracted, digitalMenuLink }) => {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [extracted, setExtracted] = useState<ExtractedMenuItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    console.log('File selected:', f.name, f.type)
    setFile(f)
    setExtracted([])
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(f)
  }

  async function extract() {
    if (!file) return
    if (!apiKey) {
      setError('OpenAI API key missing. Set OPENAI_API_KEY in .env')
      return
    }
    console.log('Starting extraction with API key present:', !!apiKey)
    setLoading(true)
    setError(null)

    try {
      const openai = new OpenAI({ apiKey: apiKey as string, dangerouslyAllowBrowser: true })

      const bytes = await file.arrayBuffer()
      const base64 = arrayBufferToBase64(bytes)

      const prompt = `You are extracting structured menu data from a photo of a canteen/restaurant menu.
Return JSON ONLY (no markdown) with array under key items. Each item has: name (string), price (number, only numeric), optional category (string).
Rules:
- Max 10 items.
- If price missing, skip item.
- Clean names (Title Case, no extra dots).`

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: `data:${file.type};base64,${base64}` } }
            ]
          }
        ]
      })

      const text = response.choices[0].message.content?.trim()
      console.log('OpenAI response:', text)
      if (!text) throw new Error('No response from OpenAI')

      const jsonString = extractFirstJson(text)
      if (!jsonString) throw new Error('No JSON found in model response')
      const parsed = JSON.parse(jsonString)
      const itemsRaw = Array.isArray(parsed.items) ? parsed.items : []
      const cleaned: ExtractedMenuItem[] = itemsRaw.slice(0,10).map((it: any, idx: number) => ({
        id: `${Date.now()}-${idx}`,
        name: String(it.name || '').trim(),
        price: Number(String(it.price).replace(/[^0-9.]/g,'')) || 0,
        category: it.category ? String(it.category).trim() : undefined,
      })).filter((i: ExtractedMenuItem) => i.name && i.price > 0)

      setExtracted(cleaned)
      onItemsExtracted?.(cleaned)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to extract items')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-white text-lg">
          <Sparkles className="h-5 w-5 text-[#e78a53]" /> Scan Menu Image
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="border-2 border-dashed border-zinc-700 rounded-lg p-4 text-center">
              {preview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="menu" className="max-h-64 mx-auto rounded" />
                </div>
              ) : (
                <div className="py-8 text-zinc-500 flex flex-col items-center gap-2">
                  <ImageIcon className="h-10 w-10 text-zinc-600" />
                  <p>Upload a photo of the printed menu</p>
                  <p className="text-xs text-zinc-600">Clear, well-lit images work best</p>
                </div>
              )}
              <input id="menu-image" type="file" accept="image/*" onChange={handleFile} className="hidden" />
              <label htmlFor="menu-image">
                <div className="mt-4 inline-flex items-center justify-center px-4 py-2 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-md cursor-pointer transition-colors">
                  <Upload className="h-4 w-4 mr-2" />
                  {preview ? 'Change Image' : 'Upload Image'}
                </div>
              </label>
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <p className="text-sm text-zinc-400">After uploading click Extract to parse up to 10 items (name + price). Everything stays client-side.</p>
            <Button onClick={extract} disabled={!file || loading} className="bg-[#e78a53] hover:bg-[#e78a53]/90 w-full">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Extracting...</> : <><Sparkles className="h-4 w-4 mr-2" /> Extract Items</>}
            </Button>
            {error && <p className="text-sm text-red-400">{error}</p>}
            {extracted.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-white font-semibold text-lg">Extracted Menu Items ({extracted.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {extracted.map(item => (
                    <Card key={item.id} className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900/70 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-white font-semibold text-lg leading-tight">{item.name}</h3>
                        </div>
                        {item.category && (
                          <Badge className="bg-[#e78a53]/10 border-[#e78a53]/30 text-[#e78a53] mb-2">
                            {item.category}
                          </Badge>
                        )}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-1">
                            <IndianRupee className="h-5 w-5 text-[#e78a53]" />
                            <span className="text-[#e78a53] font-bold text-xl">{item.price}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {digitalMenuLink && (
                  <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Digital Menu Created!
                    </h4>
                    <p className="text-green-300 text-sm mb-3">
                      Share this link with customers to view the digital menu:
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={digitalMenuLink}
                        readOnly
                        className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-white text-sm"
                      />
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(digitalMenuLink)
                          // Could add a toast notification here
                        }}
                        size="sm"
                        className="bg-[#e78a53] hover:bg-[#e78a53]/90"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper: extract first JSON object or array from a string
function extractFirstJson(str: string): string | null {
  // Try to find JSON in code blocks
  const codeBlockMatch = str.match(/```(?:json)?\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```/i)
  if (codeBlockMatch) {
    return codeBlockMatch[1]
  }
  // Try to find bare JSON
  const firstBrace = str.indexOf('{')
  if (firstBrace !== -1) {
    let depth = 0
    for (let i = firstBrace; i < str.length; i++) {
      if (str[i] === '{') depth++
      if (str[i] === '}') depth--
      if (depth === 0) {
        return str.slice(firstBrace, i + 1)
      }
    }
  }
  return null
}

// Browser-safe base64 conversion
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return typeof window !== 'undefined' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64')
}
