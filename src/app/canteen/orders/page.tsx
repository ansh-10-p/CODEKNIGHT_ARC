"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { CanteenSidebar } from "@/components/canteen-sidebar"
import { UserMenu } from "@/components/user-menu"
import {
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  IndianRupee,
  Search,
  Download,
  CookingPot,
  Truck,
  TrendingUp,
  Bell,
  RefreshCw,
  User,
  Phone,
  Mail,
  CreditCard,
  Flame,
  Wallet,
  Receipt
} from "lucide-react"

interface Order {
  _id: string
  orderId: string
  customerId: string
  customerName: string
  customerRole: string
  customerEmail: string
  customerPhone?: string
  canteenId: string
  canteenName: string
  items: Array<{
    menuItemId: string
    name: string
    price: number
    quantity: number
    image?: string
    isVeg: boolean
    isSpicy: boolean
    prepTime: number
  }>
  subtotal: number
  tax: number
  deliveryFee: number
  discount: number
  totalAmount: number
  paymentMethod: 'online' | 'offline'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  status: 'placed' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  orderDate: string
  estimatedTime: string
  completedAt?: string
  specialInstructions?: string
  createdAt: string
  updatedAt: string
}

export default function CanteenOrdersPage() {
  const demoOrders: Order[] = [
    { _id:"demo-co1", orderId:"ORD-CN-301", customerId:"student-1", customerName:"Rohit Sharma", customerRole:"student", customerEmail:"rohit@student.edu", customerPhone:"9876543210", canteenId:"canteen-demo", canteenName:"Campus Cafe", items:[{menuItemId:"m1",name:"Veg Thali",price:120,quantity:1,isVeg:true,isSpicy:false,prepTime:12},{menuItemId:"m2",name:"Mango Lassi",price:45,quantity:1,isVeg:true,isSpicy:false,prepTime:3}], subtotal:165, tax:8, deliveryFee:0, discount:0, totalAmount:173, paymentMethod:"online", paymentStatus:"paid", status:"completed", orderDate:new Date(Date.now()-10*60000).toISOString(), estimatedTime:"15 mins", specialInstructions:"Less spicy please", createdAt:new Date(Date.now()-10*60000).toISOString(), updatedAt:new Date().toISOString() },
    { _id:"demo-co2", orderId:"ORD-CN-302", customerId:"teacher-1", customerName:"Prof. Priya Verma", customerRole:"teacher", customerEmail:"priya.verma@college.edu", customerPhone:"9823456780", canteenId:"canteen-demo", canteenName:"Campus Cafe", items:[{menuItemId:"m3",name:"Paneer Butter Masala",price:140,quantity:1,isVeg:true,isSpicy:false,prepTime:15},{menuItemId:"m4",name:"Tandoori Roti",price:20,quantity:3,isVeg:true,isSpicy:false,prepTime:5}], subtotal:200, tax:10, deliveryFee:0, discount:0, totalAmount:210, paymentMethod:"offline", paymentStatus:"paid", status:"preparing", orderDate:new Date(Date.now()-5*60000).toISOString(), estimatedTime:"20 mins", specialInstructions:"", createdAt:new Date(Date.now()-5*60000).toISOString(), updatedAt:new Date().toISOString() },
    { _id:"demo-co3", orderId:"ORD-CN-303", customerId:"student-2", customerName:"Sneha Patel", customerRole:"student", customerEmail:"sneha@student.edu", customerPhone:"9765432109", canteenId:"canteen-demo", canteenName:"Campus Cafe", items:[{menuItemId:"m5",name:"Masala Dosa",price:80,quantity:1,isVeg:true,isSpicy:true,prepTime:10},{menuItemId:"m6",name:"Filter Coffee",price:30,quantity:1,isVeg:true,isSpicy:false,prepTime:4}], subtotal:110, tax:5, deliveryFee:0, discount:10, totalAmount:105, paymentMethod:"online", paymentStatus:"paid", status:"ready", orderDate:new Date(Date.now()-3*60000).toISOString(), estimatedTime:"12 mins", specialInstructions:"Extra chutney", createdAt:new Date(Date.now()-3*60000).toISOString(), updatedAt:new Date().toISOString() },
    { _id:"demo-co4", orderId:"ORD-CN-304", customerId:"teacher-2", customerName:"Prof. Rakesh Sharma", customerRole:"teacher", customerEmail:"rakesh.sharma@college.edu", customerPhone:"9811223344", canteenId:"canteen-demo", canteenName:"Campus Cafe", items:[{menuItemId:"m7",name:"Chicken Biryani",price:180,quantity:1,isVeg:false,isSpicy:true,prepTime:20}], subtotal:180, tax:9, deliveryFee:0, discount:0, totalAmount:189, paymentMethod:"online", paymentStatus:"paid", status:"placed", orderDate:new Date(Date.now()-1*60000).toISOString(), estimatedTime:"25 mins", specialInstructions:"Not too spicy", createdAt:new Date(Date.now()-1*60000).toISOString(), updatedAt:new Date().toISOString() },
    { _id:"demo-co5", orderId:"ORD-CN-305", customerId:"student-3", customerName:"Amit Kumar", customerRole:"student", customerEmail:"amit@student.edu", customerPhone:"9934567891", canteenId:"canteen-demo", canteenName:"Campus Cafe", items:[{menuItemId:"m8",name:"Chole Bhature",price:90,quantity:1,isVeg:true,isSpicy:true,prepTime:10},{menuItemId:"m9",name:"Samosa",price:25,quantity:2,isVeg:true,isSpicy:false,prepTime:3}], subtotal:140, tax:7, deliveryFee:0, discount:0, totalAmount:147, paymentMethod:"offline", paymentStatus:"pending", status:"confirmed", orderDate:new Date(Date.now()-8*60000).toISOString(), estimatedTime:"15 mins", specialInstructions:"", createdAt:new Date(Date.now()-8*60000).toISOString(), updatedAt:new Date().toISOString() },
    { _id:"demo-co6", orderId:"ORD-CN-306", customerId:"teacher-3", customerName:"Dr. Anita Desai", customerRole:"teacher", customerEmail:"anita.desai@college.edu", customerPhone:"9745678901", canteenId:"canteen-demo", canteenName:"Campus Cafe", items:[{menuItemId:"m10",name:"Veg Sandwich",price:60,quantity:1,isVeg:true,isSpicy:false,prepTime:7},{menuItemId:"m11",name:"Cold Coffee",price:55,quantity:1,isVeg:true,isSpicy:false,prepTime:5}], subtotal:115, tax:6, deliveryFee:0, discount:0, totalAmount:121, paymentMethod:"online", paymentStatus:"paid", status:"completed", orderDate:new Date(Date.now()-30*60000).toISOString(), estimatedTime:"10 mins", specialInstructions:"", createdAt:new Date(Date.now()-30*60000).toISOString(), updatedAt:new Date().toISOString() },
    { _id:"demo-co7", orderId:"ORD-CN-307", customerId:"student-4", customerName:"Priya Singh", customerRole:"student", customerEmail:"priya.s@student.edu", customerPhone:"9823456701", canteenId:"canteen-demo", canteenName:"Campus Cafe", items:[{menuItemId:"m12",name:"Rajma Chawal",price:100,quantity:1,isVeg:true,isSpicy:false,prepTime:12}], subtotal:100, tax:5, deliveryFee:0, discount:0, totalAmount:105, paymentMethod:"online", paymentStatus:"paid", status:"cancelled", orderDate:new Date(Date.now()-60*60000).toISOString(), estimatedTime:"15 mins", specialInstructions:"", createdAt:new Date(Date.now()-60*60000).toISOString(), updatedAt:new Date().toISOString() },
    { _id:"demo-co8", orderId:"ORD-CN-308", customerId:"student-5", customerName:"Arjun Mehta", customerRole:"student", customerEmail:"arjun@student.edu", customerPhone:"9867890123", canteenId:"canteen-demo", canteenName:"Campus Cafe", items:[{menuItemId:"m7",name:"Chicken Biryani",price:180,quantity:2,isVeg:false,isSpicy:true,prepTime:20},{menuItemId:"m13",name:"Fresh Lime Soda",price:40,quantity:2,isVeg:true,isSpicy:false,prepTime:3}], subtotal:440, tax:22, deliveryFee:0, discount:0, totalAmount:462, paymentMethod:"online", paymentStatus:"paid", status:"completed", orderDate:new Date(Date.now()-90*60000).toISOString(), estimatedTime:"25 mins", specialInstructions:"Extra raita", createdAt:new Date(Date.now()-90*60000).toISOString(), updatedAt:new Date().toISOString() },
  ]
  
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [canteenId, setCanteenId] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedRole, setSelectedRole] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

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
      console.error('Error getting canteen ID:', error)
    }
  }, [])

  useEffect(() => {
    if (canteenId) {
      fetchOrders()
      const interval = setInterval(() => {
        fetchOrders()
      }, 15000)
      return () => clearInterval(interval)
    }
  }, [canteenId])

  const fetchOrders = async () => {
    if (!canteenId) return
    setIsLoading(true)
    try {
      const response = await fetch(`/api/orders?canteenId=${canteenId}&limit=50`)
      const result = await response.json()
      if (response.ok) {
        setOrders(result.data?.length ? result.data : demoOrders)
      } else {
        console.error('Error fetching orders:', result.error)
        setOrders(demoOrders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders(demoOrders)
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string, note?: string) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status, note })
      })
      const result = await response.json()
      if (response.ok) {
        await fetchOrders()
      } else {
        alert('Error updating order: ' + result.error)
      }
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Error updating order. Please try again.')
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus
    const matchesRole = selectedRole === "all" || order.customerRole === selectedRole
    return matchesSearch && matchesStatus && matchesRole
  })

  const stats = {
    pendingOrders: orders.filter(order => ['placed', 'confirmed', 'preparing'].includes(order.status)).length,
    readyOrders: orders.filter(order => order.status === 'ready').length,
    completedToday: orders.filter(order => {
      const today = new Date().toDateString()
      const orderDate = new Date(order.createdAt).toDateString()
      return orderDate === today && order.status === 'completed'
    }).length,
    todayRevenue: orders
      .filter(order => {
        const today = new Date().toDateString()
        const orderDate = new Date(order.createdAt).toDateString()
        return orderDate === today && order.status === 'completed'
      })
      .reduce((sum, order) => sum + order.totalAmount, 0),
    avgOrderValue: orders.length > 0 
      ? Math.round(orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length)
      : 0
  }

  const getStatusColor = (status: string) => {
    const colors = {
      placed: "bg-blue-500/10 border-blue-500/30 text-blue-400",
      confirmed: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      preparing: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      ready: "bg-[#e78a53]/10 border-[#e78a53]/30 text-[#e78a53]",
      completed: "bg-zinc-800/80 border-zinc-700 text-zinc-300",
      cancelled: "bg-red-500/10 border-red-500/30 text-red-400"
    }
    return colors[status as keyof typeof colors] || "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      placed: <Clock className="h-3.5 w-3.5" />,
      confirmed: <CheckCircle className="h-3.5 w-3.5" />,
      preparing: <CookingPot className="h-3.5 w-3.5" />,
      ready: <Bell className="h-3.5 w-3.5" />,
      completed: <CheckCircle className="h-3.5 w-3.5" />,
      cancelled: <XCircle className="h-3.5 w-3.5" />
    }
    return icons[status as keyof typeof icons] || <ClipboardList className="h-3.5 w-3.5" />
  }

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
      paid: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      failed: "bg-red-500/10 border-red-500/30 text-red-400",
      refunded: "bg-blue-500/10 border-blue-500/30 text-blue-400"
    }
    return colors[status as keyof typeof colors] || "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-black flex font-sans">
      <CanteenSidebar />
      
      <main className="flex-1 overflow-auto">
        {/* Sleek Header */}
        <header className="bg-black/60 backdrop-blur-xl border-b border-zinc-800/60 sticky top-0 z-20">
          <div className="px-8 py-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">Order Management</h1>
              <p className="text-zinc-400 text-sm">Process incoming orders and track your kitchen queue</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 group-focus-within:text-[#e78a53] transition-colors" />
                <Input 
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 bg-zinc-900/50 border-zinc-800 text-white placeholder-zinc-500 focus:border-[#e78a53]/50 focus:ring-[#e78a53]/20 transition-all rounded-xl"
                />
              </div>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-zinc-900/50 border border-zinc-800 text-white rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#e78a53]/20 focus:border-[#e78a53]/50 transition-all outline-none appearance-none cursor-pointer min-w-[140px]"
              >
                <option value="all">All Orders</option>
                <option value="placed">New (Placed)</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-zinc-900/50 border border-zinc-800 text-white rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#e78a53]/20 focus:border-[#e78a53]/50 transition-all outline-none appearance-none cursor-pointer min-w-[130px]"
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="teacher">Teachers</option>
              </select>

              <Button 
                variant="outline" 
                className="border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-all"
                onClick={fetchOrders}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button className="bg-[#e78a53] hover:bg-[#d97740] text-white shadow-lg shadow-[#e78a53]/20 rounded-xl transition-all">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              <Button variant="ghost" size="icon" className="hover:bg-zinc-800 rounded-xl">
                <Bell className="h-5 w-5 text-zinc-400" />
              </Button>
              <UserMenu />
            </div>
          </div>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto">
          {/* Premium Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-md hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl shadow-inner">
                    <Clock className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-white tracking-tight">{stats.pendingOrders}</p>
                    <p className="text-zinc-500 font-medium text-sm uppercase tracking-wider">Active Queue</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-md hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shadow-inner">
                    <CheckCircle className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-white tracking-tight">{stats.readyOrders}</p>
                    <p className="text-zinc-500 font-medium text-sm uppercase tracking-wider">Ready for Pickup</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-md hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-[#e78a53]/10 border border-[#e78a53]/20 rounded-xl shadow-inner">
                    <IndianRupee className="h-6 w-6 text-[#e78a53]" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-white tracking-tight">₹{stats.todayRevenue.toLocaleString()}</p>
                    <p className="text-zinc-500 font-medium text-sm uppercase tracking-wider">Today's Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-md hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-violet-500/10 border border-violet-500/20 rounded-xl shadow-inner">
                    <TrendingUp className="h-6 w-6 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-white tracking-tight">₹{stats.avgOrderValue}</p>
                    <p className="text-zinc-500 font-medium text-sm uppercase tracking-wider">Avg Order Value</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Order Tickets <span className="text-zinc-500 text-lg ml-2 font-normal">({filteredOrders.length} visible)</span>
            </h2>
          </div>

          {/* Orders Grid */}
          {isLoading ? (
            <Card className="bg-zinc-900/30 border-dashed border-zinc-800">
              <CardContent className="p-20 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-zinc-800 border-t-[#e78a53] mb-6"></div>
                <h3 className="text-xl font-semibold text-zinc-300 mb-1">Syncing Orders...</h3>
              </CardContent>
            </Card>
          ) : filteredOrders.length === 0 ? (
            <Card className="bg-zinc-900/30 border-dashed border-zinc-800">
              <CardContent className="p-20 text-center">
                <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Receipt className="h-10 w-10 text-zinc-600" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No orders found</h3>
                <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                  {orders.length === 0 
                    ? "Your order queue is currently empty. New orders will appear here automatically."
                    : "No orders match your current filter or search term."
                  }
                </p>
                <Button className="bg-[#e78a53] hover:bg-[#d97740] rounded-xl px-6" onClick={fetchOrders}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Refresh Queue
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
              {filteredOrders.map((order) => (
                <Card key={order._id} className={`relative overflow-hidden bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm hover:border-zinc-700/80 hover:shadow-xl transition-all duration-300 rounded-2xl flex flex-col ${order.status === 'completed' || order.status === 'cancelled' ? 'opacity-70' : ''}`}>
                  
                  {/* Status Accent Bar at top */}
                  <div className={`h-1.5 w-full ${
                    order.status === 'placed' ? 'bg-blue-500' :
                    order.status === 'confirmed' ? 'bg-emerald-500' :
                    order.status === 'preparing' ? 'bg-amber-500' :
                    order.status === 'ready' ? 'bg-[#e78a53]' :
                    order.status === 'cancelled' ? 'bg-red-500' : 'bg-zinc-700'
                  }`} />

                  <CardHeader className="pb-3 border-b border-zinc-800/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white text-xl font-bold font-mono tracking-wide">{order.orderId}</CardTitle>
                        <p className="text-zinc-500 text-sm mt-1">{formatDate(order.createdAt)}</p>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} flex items-center gap-1.5 px-3 py-1 text-xs font-semibold backdrop-blur-md uppercase tracking-wider`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-4 flex-1 flex flex-col">
                    <div className="space-y-5 flex-1">
                      
                      {/* Customer Info Box */}
                      <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="bg-[#e78a53]/20 p-1.5 rounded-md text-[#e78a53]">
                              <User className="h-4 w-4" />
                            </div>
                            <span className="text-zinc-200 font-semibold">{order.customerName}</span>
                          </div>
                          <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 uppercase text-[10px] tracking-widest">
                            {order.customerRole}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 gap-2 ml-10">
                          <div className="flex items-center gap-2 text-sm text-zinc-400">
                            <Mail className="h-3.5 w-3.5" /> <span>{order.customerEmail}</span>
                          </div>
                          {order.customerPhone && (
                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                              <Phone className="h-3.5 w-3.5" /> <span>{order.customerPhone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Items List */}
                      <div>
                        <h4 className="text-zinc-500 text-xs uppercase tracking-widest font-semibold mb-3">Order Details</h4>
                        <div className="space-y-3">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-start">
                              <div className="flex items-start gap-3">
                                <div className="bg-zinc-800/60 text-zinc-300 text-xs font-bold px-2 py-1 rounded">x{item.quantity}</div>
                                <div>
                                  <p className="text-zinc-200 font-medium leading-tight mb-1">{item.name}</p>
                                  <div className="flex items-center gap-1.5">
                                    {item.isVeg ? (
                                      <div className="w-3 h-3 border border-green-500/50 rounded-[2px] flex items-center justify-center"><div className="w-1.5 h-1.5 bg-green-500/80 rounded-full" /></div>
                                    ) : (
                                      <div className="w-3 h-3 border border-red-500/50 rounded-[2px] flex items-center justify-center"><div className="w-1.5 h-1.5 bg-red-500/80 rounded-full" /></div>
                                    )}
                                    {item.isSpicy && <Flame className="h-3 w-3 text-orange-500" />}
                                  </div>
                                </div>
                              </div>
                              <span className="text-zinc-400 font-medium">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Special Instructions */}
                      {order.specialInstructions && (
                        <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg flex gap-3 items-start">
                          <ClipboardList className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                          <p className="text-sm text-amber-200/80 leading-snug">
                            {order.specialInstructions}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Total & Payment Status */}
                    <div className="mt-6 pt-4 border-t border-zinc-800 border-dashed">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          {order.paymentMethod === 'online' ? (
                            <div className="bg-emerald-500/10 p-1.5 rounded-md text-emerald-400"><CreditCard className="h-4 w-4" /></div>
                          ) : (
                            <div className="bg-zinc-800 p-1.5 rounded-md text-zinc-400"><Wallet className="h-4 w-4" /></div>
                          )}
                          <div>
                            <p className="text-xs text-zinc-500 font-medium uppercase">{order.paymentMethod === 'online' ? 'Online Pay' : 'Pay at Counter'}</p>
                            <span className={`text-[10px] uppercase tracking-widest font-bold ${order.paymentStatus === 'paid' ? 'text-emerald-500' : 'text-yellow-500'}`}>
                              • {order.paymentStatus}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-zinc-500 font-medium uppercase mb-0.5">Total Amount</p>
                          <p className="text-[#e78a53] font-black text-2xl leading-none">₹{order.totalAmount}</p>
                        </div>
                      </div>

                      {/* Dynamic Action Buttons */}
                      <div className="flex gap-3 mt-4">
                        {order.status === 'placed' && (
                          <Button 
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 rounded-xl"
                            onClick={() => updateOrderStatus(order.orderId, 'confirmed', 'Order confirmed by canteen')}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" /> Accept Order
                          </Button>
                        )}
                        {order.status === 'confirmed' && (
                          <Button 
                            className="flex-1 bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/20 rounded-xl"
                            onClick={() => updateOrderStatus(order.orderId, 'preparing', 'Started preparing order')}
                          >
                            <CookingPot className="h-4 w-4 mr-2" /> Start Cooking
                          </Button>
                        )}
                        {order.status === 'preparing' && (
                          <Button 
                            className="flex-1 bg-[#e78a53] hover:bg-[#d97740] text-white shadow-lg shadow-[#e78a53]/20 rounded-xl"
                            onClick={() => updateOrderStatus(order.orderId, 'ready', 'Order is ready for pickup')}
                          >
                            <Bell className="h-4 w-4 mr-2" /> Mark Ready
                          </Button>
                        )}
                        {order.status === 'ready' && (
                          <Button 
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 rounded-xl"
                            onClick={() => updateOrderStatus(order.orderId, 'completed', 'Order completed and served')}
                          >
                            <Truck className="h-4 w-4 mr-2" /> Hand Over
                          </Button>
                        )}
                        
                        {/* Cancel Button (Only show for active, non-ready orders) */}
                        {['placed', 'confirmed'].includes(order.status) && (
                          <Button 
                            variant="ghost" 
                            className="bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl px-4"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to cancel this order?')) {
                                updateOrderStatus(order.orderId, 'cancelled', 'Order cancelled by canteen')
                              }
                            }}
                          >
                            <XCircle className="h-5 w-5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}