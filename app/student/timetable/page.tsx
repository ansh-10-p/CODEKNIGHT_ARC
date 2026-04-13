"use client"

import React from "react"
import Link from "next/link"
import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { StudentSidebar } from "@/components/student-sidebar"

type TimeSlot = string
type Day = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday"

type Entry = {
    day: Day
    time: TimeSlot
    subject: string
    teacher: string
}

const config = {
    timeSlots: [
        "08:00 - 09:00",
        "09:00 - 10:00",
        "10:00 - 11:00",
        "11:00 - 12:00",
        "12:00 - 01:00",
        "01:00 - 02:00",
        "02:00 - 03:00",
        "03:00 - 04:00",
    ] as TimeSlot[],
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as Day[],
    breakSlots: ["12:00 - 01:00"] as TimeSlot[],
    entries: [
        { day: "Monday", time: "08:00 - 09:00", subject: "Data Structures", teacher: "Prof. Amit Sharma" },
        { day: "Monday", time: "09:00 - 10:00", subject: "Mathematics", teacher: "Prof. Priya Verma" },
        { day: "Tuesday", time: "10:00 - 11:00", subject: "Operating Systems", teacher: "Prof. Srinivas Rao" },
        { day: "Wednesday", time: "11:00 - 12:00", subject: "DBMS", teacher: "Dr. Manpreet Singh" },
        { day: "Thursday", time: "12:00 - 01:00", subject: "Computer Networks", teacher: "Prof. Lakshmi Iyer" },
        { day: "Friday", time: "02:00 - 03:00", subject: "Web Development", teacher: "Ms. Ayesha Khan" },
        { day: "Saturday", time: "01:00 - 02:00", subject: "Elective", teacher: "TBD" },
    ] as Entry[],
}

export default function StudentTimetablePage() {
    const matrix = useMemo(() => {
        const map = new Map<string, Entry>()
        for (const e of config.entries) map.set(`${e.day}|${e.time}`, e)
        return map
    }, [])

    return (
        <div className="min-h-screen bg-black flex">
            <StudentSidebar />
            
            <main className="flex-1 overflow-auto">
                <header className="bg-zinc-900/50 backdrop-blur-sm border-b border-zinc-800">
                    <div className="px-8 py-6">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-white">Weekly Timetable</h1>
                        </div>
                        <p className="text-zinc-400 mt-2">Days vertically, time slots horizontally</p>
                    </div>
                </header>

                <div className="p-8">
                    <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
                    <div className="w-full overflow-x-auto">
                        <div className="min-w-[900px]">
                            <div className="grid" style={{ gridTemplateColumns: `180px repeat(${config.timeSlots.length}, minmax(160px, 1fr))` }}>
                                <div className="sticky left-0 z-10 bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 px-4 py-3 text-sm font-semibold text-zinc-300">Day / Time</div>
                                {config.timeSlots.map((slot) => (
                                    <div
                                        key={slot}
                                        className={`border-b border-l border-zinc-800 px-4 py-3 text-sm font-semibold ${config.breakSlots.includes(slot) ? 'text-[#e78a53]' : 'text-zinc-300'}`}
                                    >
                                        {slot}
                                        {config.breakSlots.includes(slot) && (
                                            <span className="ml-2 text-xs text-[#e78a53]/80"></span>
                                        )}
                                    </div>
                                ))}

                                {config.days.map((day) => (
                                    <React.Fragment key={day}>
                                        <div className="sticky left-0 z-10 bg-zinc-900/80 backdrop-blur-sm border-t border-b border-zinc-800 px-4 py-3 text-zinc-200 font-medium">{day}</div>
                                        {config.timeSlots.map((slot) => {
                                            const key = `${day}|${slot}`
                                            const cell = matrix.get(key)
                                            const isBreak = config.breakSlots.includes(slot)
                                            return (
                                                <div key={key} className={`border-t border-l border-zinc-800 px-4 py-3 ${isBreak ? 'bg-zinc-800/40' : ''}`}>
                                                    {isBreak ? (
                                                        <div className="flex items-center justify-center">
                                                            <span className="text-[#e78a53] font-medium">Break</span>
                                                        </div>
                                                    ) : cell ? (
                                                        <div className="space-y-1">
                                                            <div className="text-white font-semibold tracking-wide">{cell.subject}</div>
                                                            <div className="text-xs text-[#e78a53]">{cell.teacher}</div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-zinc-600 text-sm">—</div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>
                    </Card>
                </div>
            </main>
        </div>
    )
}


