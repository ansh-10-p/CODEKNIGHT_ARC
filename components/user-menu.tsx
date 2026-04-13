"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle" 
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Palette, LogOut, User as UserIcon } from "lucide-react"

type User = { name: string; role: string; avatarInitials?: string }

export function UserMenu() {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        try {
            const raw = localStorage.getItem('currentUser')
            if (raw) {
                const parsed = JSON.parse(raw)
                setUser({ 
                    name: parsed.name || 'User', 
                    role: parsed.role || 'student', 
                    avatarInitials: parsed.avatarInitials || '' 
                })
            }
        } catch { }
    }, [])

    const logout = () => {
        localStorage.removeItem('currentUser')
        localStorage.removeItem('isLoggedIn')
        localStorage.removeItem('userRole')
        window.location.href = '/'
    }

    const initials = user?.avatarInitials || (user?.name || 'U').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 hover:bg-zinc-800 rounded-xl px-2 transition-colors">
                    <Avatar className="h-8 w-8 border border-zinc-700 shadow-sm">
                        <AvatarFallback className="bg-[#e78a53] text-white font-semibold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-zinc-300 font-medium hidden sm:inline-block">
                        {user?.name || 'Guest'}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56 bg-zinc-950/90 backdrop-blur-xl border border-zinc-800/80 text-white rounded-xl shadow-2xl p-2">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-bold leading-none text-white">{user?.name || 'Guest'}</p>
                        <p className="text-xs leading-none text-zinc-500 mt-1 uppercase tracking-wider font-semibold">
                            {user?.role === 'canteen' ? 'Canteen Manager' : user?.role || 'Guest'}
                        </p>
                    </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator className="bg-zinc-800/60 my-2" />
                
                {/* Theme Toggle Row */}
                {/* We use stopPropagation so clicking the toggle doesn't close the menu */}
                <div 
                    className="flex items-center justify-between px-2 py-1.5"
                    onClick={(e) => e.stopPropagation()} 
                >
                    <div className="flex items-center gap-2 text-sm text-zinc-300 font-medium">
                        <Palette className="h-4 w-4 text-zinc-400" />
                        <span>Appearance</span>
                    </div>
                    <ThemeToggle />
                </div>
                
                <DropdownMenuSeparator className="bg-zinc-800/60 my-2" />
                
                {/* Logout Row */}
                <DropdownMenuItem 
                    onClick={logout} 
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-300 rounded-lg cursor-pointer transition-colors"
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span className="font-medium">Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}