"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, UtensilsCrossed, UserCheck, Settings, LogOut, Users, BookOpen, ClipboardList, Car, Upload } from "lucide-react"

interface SidebarProps {
    className?: string
}

export function TeacherSidebar({ className = "" }: SidebarProps) {
    const pathname = usePathname()
    const isActive = (path: string) => pathname === path

    const navItems = [
        { href: "/teacher/dashboard", icon: Users, label: "Dashboard" },
        // { href: "/teacher/timetable", icon: Calendar, label: "Timetable" },
        { href: "/teacher/classroom", icon: UserCheck, label: "Classroom" },
        // { href: "/teacher/attendance-management", icon: UserCheck, label: "Attendance" },
        { href: "/teacher/food", icon: UtensilsCrossed, label: "Food" },
        { href: "/teacher/classroom/attendance", icon: UserCheck, label: "Attendance" },
        { href: "/teacher/classroom/materials", icon: ClipboardList, label: "Tests & Exams" },
        { href: "/teacher/classroom/schedule", icon: ClipboardList, label: "Schedule" },
        { href: "/teacher/resources", icon: Upload, label: "Resources" },
        { href: "/teacher/parking", icon: Car, label: "Parking" },
    ]

    return (
        <aside className={`w-64 bg-zinc-900/50 backdrop-blur-sm border-r border-zinc-800 flex flex-col ${className}`}>
            <div className="p-6">
                <Link href="/teacher/dashboard" className="text-[#e78a53] font-bold text-xl">
                    A.R Campus
                </Link>
                <p className="text-zinc-400 text-sm mt-1">Teacher Portal</p>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon as any
                    const active = isActive(item.href)
                    return (
                        <Link key={item.href} href={item.href}>
                            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active
                                ? 'text-white bg-[#e78a53]/10 border-l-2 border-[#e78a53]'
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                                }`}>
                                <Icon className={`h-5 w-5 ${active ? 'text-[#e78a53]' : ''}`} />
                                <span>{item.label}</span>
                            </div>
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-zinc-800">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon">
                        <Settings className="h-5 w-5 text-zinc-400" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <LogOut className="h-5 w-5 text-zinc-400" />
                    </Button>
                </div>
            </div>
        </aside>
    )
}


