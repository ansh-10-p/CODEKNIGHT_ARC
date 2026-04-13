"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  MapPin,
  UtensilsCrossed,
  BookOpen,
  Users,
  Briefcase,
  Car,
  UserCheck,
  ClipboardList,
  Settings,
  LogOut,
} from "lucide-react"

interface SidebarProps {
  className?: string
}

export function StudentSidebar({ className = "" }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const navItems = [
    { href: "/student/dashboard", icon: Users, label: "Dashboard" },
    { href: "/student/schedule", icon: Calendar, label: "Timetable" },
    { href: "/student/classroom", icon: BookOpen, label: "Classroom" },
    { href: "/student/materials", icon: ClipboardList, label: "Tests & Exams" },
    { href: "/student/events", icon: Users, label: "Events" },
    { href: "/student/food", icon: UtensilsCrossed, label: "Food Ordering" },
     { href: "/student/resources", icon: BookOpen, label: "Resources" },
    { href: "/student/ai-mentor", icon: MapPin, label: "Campus Navigation" },
    { href: "/student/attendance", icon: UserCheck, label: "Attendance" },
    { href: "/student/internships", icon: Briefcase, label: "Internships" },
    { href: "/student/parking", icon: Car, label: "Parking" },
  ]

  return (
    <aside className={`w-64 bg-zinc-900/50 backdrop-blur-sm border-r border-zinc-800 flex flex-col ${className}`}>
      <div className="p-6">
        <Link href="/student/dashboard" className="text-[#e78a53] font-bold text-xl">
          Arc Campus
        </Link>
        <p className="text-zinc-400 text-sm mt-1">Student Portal</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
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
