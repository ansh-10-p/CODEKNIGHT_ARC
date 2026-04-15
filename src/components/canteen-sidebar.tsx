"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Package,
  ClipboardList,
  Settings,
  LogOut,
  UtensilsCrossed,
  TrendingUp,
  Users,
  Clock,
  QrCode // 1. Imported the new icon
} from "lucide-react"

interface SidebarProps {
  className?: string
}

export function CanteenSidebar({ className = "" }: SidebarProps) {
  const pathname = usePathname()
  
  // 2. State to hold the canteen ID for the dynamic route
  const [canteenId, setCanteenId] = useState("preview")

  // 3. Fetch the canteen ID on mount
  useEffect(() => {
    try {
      const currentUser = localStorage.getItem('currentUser')
      if (currentUser) {
        const user = JSON.parse(currentUser)
        if (user.role === 'canteen' && user.id) {
          setCanteenId(user.id)
        }
      }
    } catch (error) {
      console.error('Error loading canteen ID for sidebar:', error)
    }
  }, [])

  const isActive = (path: string) => pathname === path || (path.includes('/digital-menu') && pathname.includes('/digital-menu'))

  // 4. Added the Digital Menu to the array with the dynamic ID
  const navItems = [
    { href: "/canteen/dashboard", icon: BarChart3, label: "Dashboard" },
    { href: "/canteen/menu", icon: UtensilsCrossed, label: "Menu Management" },
    { href: "/canteen/orders", icon: ClipboardList, label: "Order Management" },
    { href: "/canteen/stocks", icon: Package, label: "Stock Management" },
    
  ]

  return (
    <aside className={`w-64 bg-zinc-900/50 backdrop-blur-sm border-r border-zinc-800 flex flex-col ${className}`}>
      <div className="p-6">
        <Link href="/canteen/dashboard" className="text-[#e78a53] font-bold text-xl tracking-tight">
          A.R Canteen
        </Link>
        <p className="text-zinc-400 text-sm mt-1">Management Portal</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          
          return (
            <Link key={item.label} href={item.href}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                active 
                  ? 'text-white bg-[#e78a53]/10 border-l-4 border-[#e78a53] shadow-sm' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50 border-l-4 border-transparent'
              }`}>
                <Icon className={`h-5 w-5 ${active ? 'text-[#e78a53]' : ''}`} />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800/60 bg-zinc-950/20">
        <div className="flex items-center justify-between gap-4 px-2">
          <Button variant="ghost" size="icon" className="hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors">
            <Settings className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="hover:bg-red-500/10 hover:text-red-400 rounded-xl text-zinc-400 transition-colors"
            onClick={() => {
              localStorage.removeItem('currentUser')
              localStorage.removeItem('isLoggedIn')
              localStorage.removeItem('userRole')
              window.location.href = '/'
            }}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </aside>
  )
}