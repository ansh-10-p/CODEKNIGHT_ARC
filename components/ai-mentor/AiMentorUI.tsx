"use client";

import React, { useState, useEffect } from 'react';
import useVapi from '@/hooks/useVapi';
import { Mic, MicOff, Phone, MessageSquare, ChevronRight, HeadphonesIcon, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import MessageList from './MessageList';
import Image from "next/image";
import CallButton from "./CallButton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ weight: "600", subsets: ["latin"] });

interface AiMentorUIProps {
  assistantId?: string;
}

const AiMentorUI: React.FC<AiMentorUIProps> = ({ assistantId }) => {
  const {
    volumeLevel,
    isCallActive,
    messages,
    isLoading,
    toggleCall,
  } = useVapi(assistantId);

  // Get the most recent message for the caption
  const latestMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  // Dynamic ripple size based on breathing effect
  const [breathScale, setBreathScale] = useState(1);

  // Continuous breathing effect for ripple
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isCallActive) {
      interval = setInterval(() => {
        setBreathScale(prev => prev === 1 ? 1.08 : 1);
      }, 1000); // 1 second breathing cycle
    } else {
      setBreathScale(1);
    }

    return () => clearInterval(interval);
  }, [isCallActive]);

  // Add CSS keyframes for animations
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes textPulse {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
      }
      
      @keyframes gradientMove {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      
      @keyframes blob {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      
      .animate-blob {
        animation: blob 7s infinite;
      }
      
      .animation-delay-2000 {
        animation-delay: 2s;
      }
      
      .animation-delay-4000 {
        animation-delay: 4s;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Transform messages to match MessageList expected format
  const formattedMessages = messages.map((msg: any) => ({
    role: msg.role,
    text: msg.text,
    type: msg.role === 'user' ? 'transcript' : 'message'
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9ff] to-[#f1f5ff]">
      {/* Hero section with blurred gradient background */}
      <div className="relative overflow-hidden py-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#5C5FFF]/5 via-transparent to-[#00C2D1]/5" />
          <div className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(92, 95, 255, 0.08) 1px, transparent 1px)`,
              backgroundSize: '24px 24px'
            }}
          />
        </div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#5C5FFF]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-48 -right-24 w-96 h-96 bg-[#FF647C]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-24 left-48 w-96 h-96 bg-[#00C2D1]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Logo and Hero Content */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center z-10">
          <h1 className={cn("text-4xl font-bold tracking-tight mb-6", montserrat.className)}>
            <span className="text-[#5C5FFF] drop-shadow-[0_0_8px_rgba(92,95,255,0.2)]">AI</span>
            <span className="text-[#FF647C] drop-shadow-[0_0_8px_rgba(255,100,124,0.2)]"> Mentor</span>
            <span className="text-[#00C2D1] drop-shadow-[0_0_8px_rgba(0,194,209,0.2)]"> Call</span>
          </h1>
          <p className="text-xl text-slate-700 max-w-2xl">Connect with your AI mentor through a live phone conversation for personalized guidance and learning support.</p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Call initiation card */}
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-[#5C5FFF] text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Start Conversation
              </CardTitle>
              <CardDescription className="text-white/80">
                Enter your number and receive a call from your AI Mentor
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <CallButton assistantId={assistantId} />
            </CardContent>
            <CardFooter className="border-t bg-gray-50 text-sm text-gray-500 rounded-b-lg">
              Your phone number is only used to initiate the current call.
            </CardFooter>
          </Card>

          {/* Conversation preview card */}
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-[#FF647C] text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                How It Works
              </CardTitle>
              <CardDescription className="text-white/80">
                Experience real-time conversation with advanced AI
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-[#5C5FFF]/20 rounded-full p-2 text-[#5C5FFF]">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-medium">Enter Your Number</h3>
                    <p className="text-sm text-gray-500">Provide your phone number in international format</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-[#FF647C]/20 rounded-full p-2 text-[#FF647C]">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-medium">Receive AI Call</h3>
                    <p className="text-sm text-gray-500">Our AI system will call you within seconds</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-[#00C2D1]/20 rounded-full p-2 text-[#00C2D1]">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-medium">Start Conversing</h3>
                    <p className="text-sm text-gray-500">Speak naturally - the AI understands and responds</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-gray-50 rounded-b-lg">
              <div className="w-full flex justify-end">
                <a href="#faq" className="text-[#5C5FFF] hover:text-[#5C5FFF]/80 font-medium flex items-center gap-1 text-sm">
                  Learn more <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Toast notifications container */}
      <Toaster />
    </div>
  );
};

export default AiMentorUI; 
