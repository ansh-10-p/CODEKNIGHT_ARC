"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { StudentSidebar } from "@/components/student-sidebar"
import { UserMenu } from "@/components/user-menu"
import CallButton from "@/components/ai-mentor/CallButton"
import {
  Bell,
  ChevronRight,
  Phone,
  PhoneCall,
  MessageSquare,
  Info,
  CheckCircle2,
  User
} from "lucide-react"

export default function AiMentor() {
  return (
    <div className="min-h-screen bg-black flex">
      <StudentSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">AI Mentor</h1>
                <p className="text-zinc-400">Connect with your AI assistant for personalized help</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5 text-zinc-400" />
                </Button>
                <UserMenu />
              </div>
            </div>
          </div>
        </header>

        {/* AI Mentor Content */}
        <div className="p-8">
          {/* AI Mentor Call Section */}
          <div className="mb-10">
            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-[#e78a53]/40 transition-colors">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left side - Call information */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-3">Connect with your Campus Map AI</h3>
                      <p className="text-zinc-400">
                        Experience a live phone conversation for personalized guidance and learning support.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="phoneNumber" className="text-sm text-zinc-400">
                          Enter your number and receive a call from your AI Mentor
                        </label>
                        <div className="bg-zinc-800/50 rounded-md p-4 border border-[#e78a53]/30">
                          <CallButton />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right side - How it works */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <Info className="h-5 w-5 mr-2 text-[#e78a53]" />
                        How It Works
                      </h3>
                      <p className="text-zinc-400 mb-4">
                        Experience real-time conversation with advanced AI
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-[#e78a53]/20 rounded-full flex items-center justify-center">
                          <span className="text-[#e78a53] font-bold">1</span>
                        </div>
                        <div>
                          <h4 className="text-white font-medium">Enter Your Number</h4>
                          <p className="text-zinc-400 text-sm">Provide your phone number in international format</p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-[#e78a53]/20 rounded-full flex items-center justify-center">
                          <span className="text-[#e78a53] font-bold">2</span>
                        </div>
                        <div>
                          <h4 className="text-white font-medium">Receive AI Call</h4>
                          <p className="text-zinc-400 text-sm">Our AI system will call you within seconds</p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-[#e78a53]/20 rounded-full flex items-center justify-center">
                          <span className="text-[#e78a53] font-bold">3</span>
                        </div>
                        <div>
                          <h4 className="text-white font-medium">Start Conversing</h4>
                          <p className="text-zinc-400 text-sm">Speak naturally - the AI understands and responds</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Use cases section */}
                <div className="mt-8 pt-8 border-t border-zinc-800">
                  <h3 className="text-xl font-semibold text-white mb-6">
                    <MessageSquare className="h-5 w-5 inline-block mr-2 text-[#e78a53]" />
                    Example Use Cases
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Student Use Cases */}
                    <Card className="bg-zinc-900/70 border-zinc-800 hover:border-[#e78a53]/30 transition-colors">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-[#e78a53]/10 text-[#e78a53] border-[#e78a53]/30 border">Student</Badge>
                        </div>
                        <CardTitle className="text-white text-md">🎓 Student Queries</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-zinc-400 text-sm">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#e78a53] mt-0.5" />
                            <span>"Where is the Exam Cell?"</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#e78a53] mt-0.5" />
                            <span>"Mujhe Library ka rasta batao from Main Entrance."</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#e78a53] mt-0.5" />
                            <span>"Today ka timetable kya hai for FE Computer?"</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#e78a53] mt-0.5" />
                            <span>"Can I pre-order Cold Coffee for 1:30?"</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>

                    {/* More Student Use Cases */}
                    <Card className="bg-zinc-900/70 border-zinc-800 hover:border-[#e78a53]/30 transition-colors">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-[#e78a53]/10 text-[#e78a53] border-[#e78a53]/30 border">Student+</Badge>
                        </div>
                        <CardTitle className="text-white text-md">🎓 More Student Queries</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-zinc-400 text-sm">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#e78a53] mt-0.5" />
                            <span>"Freshers' Mixer kab aur kahan ho raha hai?"</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#e78a53] mt-0.5" />
                            <span>"Mera last food order status kya hai?"</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#e78a53] mt-0.5" />
                            <span>"Available internships abhi kaun se hai?"</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Teacher Use Cases */}
                    <Card className="bg-zinc-900/70 border-zinc-800 hover:border-[#e78a53]/30 transition-colors">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-[#e78a53]/10 text-[#e78a53] border-[#e78a53]/30 border">Teacher</Badge>
                        </div>
                        <CardTitle className="text-white text-md">👩‍🏫 Teacher Queries</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-zinc-400 text-sm">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#e78a53] mt-0.5" />
                            <span>"Mark attendance for SE Comp 10 am slot."</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#e78a53] mt-0.5" />
                            <span>"Mere teaching slots Tuesday ko kaunse hain?"</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#e78a53] mt-0.5" />
                            <span>"Can I pre-order Paneer Roll for lunch?"</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Canteen & Admin Use Cases */}
                    <Card className="bg-zinc-900/70 border-zinc-800 hover:border-[#e78a53]/30 transition-colors">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-[#e78a53]/10 text-[#e78a53] border-[#e78a53]/30 border">Canteen & Admin</Badge>
                        </div>
                        <CardTitle className="text-white text-md">🍲 Canteen & 🛠️ Admin</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-zinc-400 text-sm">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#e78a53] mt-0.5" />
                            <span>"How many Veg Sandwiches are in stock?"</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#e78a53] mt-0.5" />
                            <span>"Show me today's queued orders."</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#e78a53] mt-0.5" />
                            <span>"Add a new event on 20th Sept, 2 pm, Seminar Hall."</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#e78a53] mt-0.5" />
                            <span>"Post internship opening for Data Science."</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
