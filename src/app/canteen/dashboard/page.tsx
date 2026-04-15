"use client"

import { useState, useEffect } from "react"
import { ArcChatbot } from "@/components/arc-chatbot"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CanteenDemandCard } from "@/components/canteen-demand-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CanteenSidebar } from "@/components/canteen-sidebar"
import { UserMenu } from "@/components/user-menu"
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Package,
  IndianRupee,
  Calendar,
  ArrowUp,
  ArrowDown,
  Filter,
  Download,
  Bell
} from "lucide-react"

export default function CanteenDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  useEffect(() => {
    try {
      const u = localStorage.getItem("currentUser")
      if (u) setCurrentUser(JSON.parse(u))
    } catch {}
  }, [])
  const userId = currentUser?.id ?? null
  const userName = currentUser?.name ?? ""
  const todaysStats = {
    revenue: 15420,
    orders: 89,
    customers: 67,
    avgOrderValue: 173
  }

  const weeklyStats = {
    revenue: 98500,
    orders: 542,
    customers: 389,
    avgOrderValue: 182
  }

  const monthlyStats = {
    revenue: 425000,
    orders: 2340,
    customers: 1456,
    avgOrderValue: 181
  }

  const recentOrders = [
    { id: "#ORD-2024-0089", customer: "Rohit Sharma", amount: 245, status: "completed", time: "2 min ago", items: ["Chicken Biryani", "Fresh Lime Soda"] },
    { id: "#ORD-2024-0088", customer: "Prof. Priya Verma", amount: 95, status: "preparing", time: "5 min ago", items: ["Paneer Butter Masala"] },
    { id: "#ORD-2024-0087", customer: "Amit Kumar", amount: 165, status: "completed", time: "8 min ago", items: ["Masala Dosa", "Samosa x2"] },
    { id: "#ORD-2024-0086", customer: "Sneha Patel", amount: 75, status: "preparing", time: "12 min ago", items: ["Chole Bhature"] },
    { id: "#ORD-2024-0085", customer: "Arjun Mehta", amount: 320, status: "completed", time: "15 min ago", items: ["Chicken Biryani x2", "Fresh Lime Soda"] }
  ]

  const lowStockItems = [
    { name: "Basmati Rice", current: "2.5 kg", minimum: "10 kg", status: "critical" },
    { name: "Chicken", current: "5 kg", minimum: "15 kg", status: "low" },
    { name: "Paneer", current: "3 kg", minimum: "8 kg", status: "low" },
    { name: "Onions", current: "8 kg", minimum: "20 kg", status: "low" }
  ]

  const getStatusColor = (status: string) => {
    const colors = {
      completed: "bg-[#e78a53]/10 border-[#e78a53]/30 text-[#e78a53]",
      preparing: "bg-blue-500/10 border-blue-500/30 text-blue-400",
      cancelled: "bg-red-500/10 border-red-500/30 text-red-400"
    }
    return colors[status as keyof typeof colors] || "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
  }

  const getStockStatusColor = (status: string) => {
    const colors = {
      critical: "bg-red-500/10 border-red-500/30 text-red-400",
      low: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
      good: "bg-[#e78a53]/10 border-[#e78a53]/30 text-[#e78a53]"
    }
    return colors[status as keyof typeof colors] || "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
  }

  return (
    <div className="min-h-screen bg-black flex">
      <CanteenSidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Canteen Dashboard</h1>
                <p className="text-zinc-400">Monitor sales, orders, and inventory in real-time</p>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button className="bg-[#e78a53] hover:bg-[#e78a53]/90">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5 text-zinc-400" />
                </Button>
                <UserMenu />
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Today's Overview */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Today's Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                      <IndianRupee className="h-6 w-6 text-[#e78a53]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">₹{todaysStats.revenue.toLocaleString()}</p>
                      <p className="text-zinc-400 text-sm">Today's Revenue</p>
                      <div className="flex items-center gap-1 text-[#e78a53] text-xs mt-1">
                        <ArrowUp className="h-3 w-3" />
                        <span>+12.5%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                      <ShoppingCart className="h-6 w-6 text-[#e78a53]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{todaysStats.orders}</p>
                      <p className="text-zinc-400 text-sm">Orders Today</p>
                      <div className="flex items-center gap-1 text-[#e78a53] text-xs mt-1">
                        <ArrowUp className="h-3 w-3" />
                        <span>+8.2%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                      <Users className="h-6 w-6 text-[#e78a53]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{todaysStats.customers}</p>
                      <p className="text-zinc-400 text-sm">Unique Customers</p>
                      <div className="flex items-center gap-1 text-[#e78a53] text-xs mt-1">
                        <ArrowUp className="h-3 w-3" />
                        <span>+5.7%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-[#e78a53]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">₹{todaysStats.avgOrderValue}</p>
                      <p className="text-zinc-400 text-sm">Avg Order Value</p>
                      <div className="flex items-center gap-1 text-red-400 text-xs mt-1">
                        <ArrowDown className="h-3 w-3" />
                        <span>-2.1%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Period Comparison */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Performance Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white text-lg">This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Revenue</span>
                      <span className="text-white font-semibold">₹{weeklyStats.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Orders</span>
                      <span className="text-white font-semibold">{weeklyStats.orders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Customers</span>
                      <span className="text-white font-semibold">{weeklyStats.customers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Avg Order</span>
                      <span className="text-white font-semibold">₹{weeklyStats.avgOrderValue}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white text-lg">This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Revenue</span>
                      <span className="text-white font-semibold">₹{monthlyStats.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Orders</span>
                      <span className="text-white font-semibold">{monthlyStats.orders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Customers</span>
                      <span className="text-white font-semibold">{monthlyStats.customers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Avg Order</span>
                      <span className="text-white font-semibold">₹{monthlyStats.avgOrderValue}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full bg-[#e78a53] hover:bg-[#e78a53]/90">
                      <Package className="h-4 w-4 mr-2" />
                      Check Inventory
                    </Button>
                    <Button variant="outline" className="w-full border-zinc-700 text-zinc-400 hover:text-white">
                      <Clock className="h-4 w-4 mr-2" />
                      View Active Orders
                    </Button>
                    <Button variant="outline" className="w-full border-zinc-700 text-zinc-400 hover:text-white">
                      <Calendar className="h-4 w-4 mr-2" />
                      Daily Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="p-4 bg-zinc-800/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-white font-medium">{order.id}</p>
                          <p className="text-zinc-400 text-sm">{order.customer}</p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-zinc-300 text-sm">
                            {order.items.join(", ")}
                          </p>
                          <p className="text-zinc-500 text-xs">{order.time}</p>
                        </div>
                        <p className="text-[#e78a53] font-semibold">₹{order.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Low Stock Alerts */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Stock Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lowStockItems.map((item, index) => (
                    <div key={index} className="p-4 bg-zinc-800/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-white font-medium">{item.name}</p>
                          <p className="text-zinc-400 text-sm">Current: {item.current}</p>
                        </div>
                        <Badge className={getStockStatusColor(item.status)}>
                          {item.status === 'critical' ? (
                            <AlertTriangle className="h-3 w-3 mr-1" />
                          ) : (
                            <Package className="h-3 w-3 mr-1" />
                          )}
                          {item.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-zinc-500 text-sm">Minimum: {item.minimum}</p>
                        <Button size="sm" className="bg-[#e78a53] hover:bg-[#e78a53]/90">
                          Re-stock
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Demand Forecast */}
            <CanteenDemandCard
              orders={recentOrders.flatMap((o) =>
                o.items.map((item) => ({ item, quantity: 1, time: "12:00" }))
              )}
            />
          </div>
        </div>
      </main>
      <ArcChatbot userRole="canteen" />
    </div>
  )
}
