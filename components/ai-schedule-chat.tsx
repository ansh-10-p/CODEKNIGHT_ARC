"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Send, Sparkles, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AIScheduleChatProps {
    isOpen: boolean
    onClose: () => void
    onScheduleGenerated: (schedule: any) => void
    classroomInfo?: {
        title: string
        subject: string
    }
    currentSchedule?: any
}

export function AIScheduleChat({ isOpen, onClose, onScheduleGenerated, classroomInfo, currentSchedule }: AIScheduleChatProps) {
    const [prompt, setPrompt] = useState("")
    const [isListening, setIsListening] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [messages, setMessages] = useState<Array<{ id: string, type: 'user' | 'ai', content: string }>>([])
    const recognitionRef = useRef<SpeechRecognition | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            recognitionRef.current = new SpeechRecognition()

            if (recognitionRef.current) {
                recognitionRef.current.continuous = true
                recognitionRef.current.interimResults = true
                recognitionRef.current.lang = 'en-US'

                recognitionRef.current.onresult = (event) => {
                    let transcript = ''
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        if (event.results[i].isFinal) {
                            transcript += event.results[i][0].transcript
                        }
                    }
                    if (transcript) {
                        setPrompt(prev => prev + transcript + ' ')
                    }
                }

                recognitionRef.current.onerror = (event) => {
                    console.error('Speech recognition error:', event.error)
                    setIsListening(false)
                    toast({
                        title: "Voice recognition error",
                        description: "Please try again or type your message",
                        variant: "destructive"
                    })
                }

                recognitionRef.current.onend = () => {
                    setIsListening(false)
                }
            }
        }
    }, [toast])

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start()
                setIsListening(true)
            } catch (error) {
                console.error('Error starting speech recognition:', error)
                toast({
                    title: "Voice recognition unavailable",
                    description: "Please type your message instead",
                    variant: "destructive"
                })
            }
        }
    }

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop()
            setIsListening(false)
        }
    }

    const generateSchedule = async () => {
        if (!prompt.trim()) {
            toast({
                title: "Please enter a prompt",
                description: "Describe what kind of schedule you want to generate",
                variant: "destructive"
            })
            return
        }

        setIsGenerating(true)

        const userMessage = { id: Date.now().toString(), type: 'user' as const, content: prompt }
        setMessages(prev => [...prev, userMessage])

        try {
            const response = await fetch('/api/ai/generate-schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: prompt.trim(),
                    classroomInfo,
                    currentSchedule
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to generate schedule')
            }

            const data = await response.json()

            if (data.success) {
                const aiMessage = {
                    id: (Date.now() + 1).toString(),
                    type: 'ai' as const,
                    content: "Schedule generated successfully! Click 'Use This Schedule' to apply it to your timetable."
                }
                setMessages(prev => [...prev, aiMessage])

                onScheduleGenerated(data.schedule)
                toast({
                    title: "Schedule generated!",
                    description: "Your AI-generated schedule is ready to use"
                })
            } else {
                throw new Error(data.error || 'Failed to generate schedule')
            }
        } catch (error) {
            console.error('Error generating schedule:', error)
            const errorMessage = {
                id: (Date.now() + 1).toString(),
                type: 'ai' as const,
                content: "Sorry, I couldn't generate a schedule. Please try again with a different prompt."
            }
            setMessages(prev => [...prev, errorMessage])
            toast({
                title: "Generation failed",
                description: "Please try again with a different prompt",
                variant: "destructive"
            })
        } finally {
            setIsGenerating(false)
            setPrompt("")
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            generateSchedule()
        }
    }

    const examplePrompts = currentSchedule && Object.values(currentSchedule).some((day: any) => day?.length > 0) ? [
        "Add a lab session on Friday at 2:00 PM",
        "Add lunch break at 12:00-13:00 every day",
        "Add a practical session on Thursday morning"
    ] : [
        "Create a schedule for Computer Science with 4 classes per week",
        "Generate a Mathematics schedule with lab sessions on Friday",
        "Make a weekly schedule with morning classes and afternoon breaks",
        "Create a schedule for Physics with practical sessions"
    ]

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-500" />
                        AI Schedule Generator
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 flex flex-col gap-4">
                    {classroomInfo && (
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex gap-2">
                                    <Badge variant="outline">{classroomInfo.title}</Badge>
                                    <Badge variant="secondary">{classroomInfo.subject}</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {messages.length === 0 && (
                        <div className="space-y-4">
                            <div className="text-sm text-muted-foreground">
                                {currentSchedule && Object.values(currentSchedule).some((day: any) => day?.length > 0)
                                    ? "Describe what changes you want to make to your current schedule. You can:"
                                    : "Describe what kind of schedule you want to generate. You can specify:"
                                }
                            </div>
                            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                {currentSchedule && Object.values(currentSchedule).some((day: any) => day?.length > 0) ? (
                                    <>
                                        <li>Add new classes, breaks, or lunch periods</li>
                                        <li>Modify existing time slots or rooms</li>
                                        <li>Remove specific entries</li>
                                        <li>Change subjects or add notes</li>
                                    </>
                                ) : (
                                    <>
                                        <li>Number of classes per week</li>
                                        <li>Specific days or times</li>
                                        <li>Special requirements (labs, breaks, etc.)</li>
                                        <li>Room preferences</li>
                                    </>
                                )}
                            </ul>

                            <div className="space-y-2">
                                <div className="text-sm font-medium">Example prompts:</div>
                                <div className="grid gap-2">
                                    {examplePrompts.map((example, index) => (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            size="sm"
                                            className="justify-start text-left h-auto p-2"
                                            onClick={() => setPrompt(example)}
                                        >
                                            {example}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {messages.length > 0 && (
                        <div className="flex-1 space-y-3 max-h-60 overflow-y-auto">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-lg ${message.type === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted'
                                            }`}
                                    >
                                        {message.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <Textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Describe the schedule you want to generate..."
                                className="flex-1"
                                rows={3}
                            />
                            <div className="flex flex-col gap-2">
                                <Button
                                    onClick={isListening ? stopListening : startListening}
                                    variant={isListening ? "destructive" : "outline"}
                                    size="icon"
                                    disabled={isGenerating}
                                >
                                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                </Button>
                                <Button
                                    onClick={generateSchedule}
                                    disabled={isGenerating || !prompt.trim()}
                                    size="icon"
                                >
                                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        {isListening && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                Listening... Speak now
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
