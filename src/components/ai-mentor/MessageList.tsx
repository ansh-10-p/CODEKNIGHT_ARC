"use client";

import React, { useEffect, useRef } from 'react';
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: string;
  text: string;
  type?: string;
}

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-muted-foreground">
        <Bot className="h-12 w-12 animate-pulse" />
        <p className="text-lg font-medium">Start a conversation with your AI mentor</p>
        <p className="text-sm">Your messages will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 overflow-y-auto max-h-[500px] p-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
  {messages.map((message: Message, index: number) => (
        <div 
          key={index} 
          className={cn(
            "flex animate-in fade-in slide-in-from-bottom-2 duration-300",
            message.role === 'assistant' ? 'justify-start' : 'justify-end'
          )}
        >
          <div 
            className={cn(
              "flex max-w-[80%] items-start gap-2",
              message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
            )}
          >
            <Avatar
              className={cn(
                "h-8 w-8 ring-2",
                message.role === 'assistant' 
                  ? 'bg-indigo-500 ring-indigo-300' 
                  : 'bg-pink-500 ring-pink-300'
              )}
            >
              {message.role === 'assistant' 
                ? <Bot className="h-4 w-4 text-white" />
                : <User className="h-4 w-4 text-white" />
              }
            </Avatar>
            <div 
              className={cn(
                "p-3 rounded-lg shadow-sm",
                message.role === 'assistant' 
                  ? 'bg-muted/50 text-foreground' 
                  : 'bg-primary text-primary-foreground'
              )}
            >
              {message.role === 'assistant' ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => <p className="text-sm leading-relaxed mb-2">{children}</p>,
                      h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-lg font-semibold mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-base font-medium mb-2">{children}</h3>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                      li: ({ children }) => <li className="text-sm mb-1">{children}</li>,
                      code: ({ children }) => (
                        <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-muted p-2 rounded-lg overflow-x-auto mb-2">
                          {children}
                        </pre>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-primary pl-4 italic my-2">
                          {children}
                        </blockquote>
                      ),
                      a: ({ children, href }) => (
                        <a 
                          href={href} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {message.text}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {message.text}
                </p>
              )}
              {message.type && (
                <p className={cn(
                  "text-xs mt-1.5",
                  message.role === 'assistant' 
                    ? 'text-muted-foreground' 
                    : 'text-primary-foreground/80'
                )}>
                  {message.type === 'transcript' ? 'Transcript' : 'Message'}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList; 