"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import { UserMenu } from "@/components/user-menu"
import { OrderDialog } from "@/components/order-dialog"
import { OrderReceipt } from "@/components/order-receipt"
import { Input } from "@/components/ui/input"
import { 
  ShoppingCart, 
  Clock, 
  Star, 
  Calendar, 
  Leaf, 
  Flame, 
  Search, 
  Filter, 
  IndianRupee, 
  Bell,
  Camera,
  Store,
  Timer,
  RefreshCw,
  CreditCard,
  Wallet
} from "lucide-react"

interface MenuItem {
  _id: string
  name: string
  description: string
  price: number
  category: string
  image: string | null
  isVeg: boolean
  isSpicy: boolean
  prepTime: number
  rating: number
  isAvailable: boolean
  canteenName: string
  canteenId: string
}

export default function TeacherFoodPage() {
  const demoMenuItems: MenuItem[] = [
    {
      _id: "demo-tm1",
      name: "Paneer Roll",
      description: "Fresh paneer roll with green chutney.",
      price: 85,
      category: "Snacks",
      image: null,
      isVeg: true,
      isSpicy: true,
      prepTime: 8,
      rating: 4.4,
      isAvailable: true,
      canteenName: "Faculty Cafe",
      canteenId: "canteen-demo-3",
    },
    {
      _id: "demo-tm2",
      name: "Cold Coffee",
      description: "Chilled coffee with cream topping.",
      price: 70,
      category: "Beverages",
      image: null,
      isVeg: true,
      isSpicy: false,
      prepTime: 5,
      rating: 4.2,
      isAvailable: true,
      canteenName: "Faculty Cafe",
      canteenId: "canteen-demo-3",
    },
  ]
  const demoRecentOrders = [
    {
      _id: "demo-to1",
      orderId: "ORD-TD-201",
      createdAt: new Date().toISOString(),
      canteenName: "Faculty Cafe",
      items: [{ name: "Paneer Roll", quantity: 1, price: 85, isVeg: true, isSpicy: true }],
      totalAmount: 85,
      status: "preparing",
      paymentMethod: "offline",
    },
  ]
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<any>(null)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Get current user info
  useEffect(() => {
    try {
      const user = localStorage.getItem('currentUser')
      if (user) {
        const userData = JSON.parse(user)
        setCurrentUser(userData)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }, [])

  // Fetch menu items from API
  useEffect(() => {
    fetchMenuItems()
  }, [])

  // Fetch recent orders when user is available
  useEffect(() => {
    if (currentUser?.id) {
      fetchRecentOrders()
    }
  }, [currentUser])

  const fetchMenuItems = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/menu/available')
      const result = await response.json()
      
      if (response.ok) {
        setMenuItems(result.data?.length ? result.data : demoMenuItems)
      } else {
        console.error('Error fetching menu items:', result.error)
        setMenuItems(demoMenuItems)
      }
    } catch (error) {
      console.error('Error fetching menu items:', error)
      setMenuItems(demoMenuItems)
    } finally {
      setIsLoading(false)
    }
  }

  // Get unique categories from menu items
  const categories = ["All", ...Array.from(new Set(menuItems.map(item => item.category)))]

  // Filter menu items based on search and category
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.canteenName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Calculate stats
  const stats = {
    totalItems: menuItems.length,
    availableItems: menuItems.filter(item => item.isAvailable).length,
    avgRating: menuItems.length > 0 ? (menuItems.reduce((sum, item) => sum + item.rating, 0) / menuItems.length).toFixed(1) : "0",
    avgPrepTime: menuItems.length > 0 ? Math.round(menuItems.reduce((sum, item) => sum + item.prepTime, 0) / menuItems.length) : 0,
    canteenCount: new Set(menuItems.map(item => item.canteenId)).size
  }

  const fetchRecentOrders = async () => {
    if (!currentUser?.id) return
    
    try {
      const response = await fetch(`/api/orders/user?userId=${currentUser.id}&userType=teacher`)
      const result = await response.json()
      
      if (response.ok) {
        setRecentOrders(result.orders?.length ? result.orders : demoRecentOrders)
      } else {
        console.error('Error fetching recent orders:', result.error)
        setRecentOrders(demoRecentOrders)
      }
    } catch (error) {
      console.error('Error fetching recent orders:', error)
      setRecentOrders(demoRecentOrders)
    }
  }

  const handleOrderSuccess = (order: any) => {
    setCurrentOrder(order)
    setIsReceiptOpen(true)
    // Refresh menu items and recent orders
    fetchMenuItems()
    fetchRecentOrders()
  }

  const getStatusColor = (status: string) => {
    const colors = {
      placed: "bg-blue-500/10 border-blue-500/30 text-blue-400",
      confirmed: "bg-green-500/10 border-green-500/30 text-green-400",
      preparing: "bg-orange-500/10 border-orange-500/30 text-orange-400",
      ready: "bg-[#e78a53]/10 border-[#e78a53]/30 text-[#e78a53]",
      completed: "bg-green-500/10 border-green-500/30 text-green-400",
      cancelled: "bg-red-500/10 border-red-500/30 text-red-400"
    }
    return colors[status as keyof typeof colors] || "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) {
      return `Today, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffDays === 2) {
      return `Yesterday, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString('en-IN', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  return (
    <div className="min-h-screen bg-black flex">
      <TeacherSidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Food Ordering</h1>
                <p className="text-zinc-400">Order delicious food from the campus canteen</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                  <Input 
                    placeholder="Search food items..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-400" 
                  />
                </div>
                <Button 
                  variant="outline" 
                  className="border-zinc-700 text-zinc-400 hover:text-white"
                  onClick={fetchMenuItems}
                  disabled={isLoading}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {isLoading ? "Loading..." : "Refresh"}
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
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-[#e78a53]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.availableItems}</p>
                    <p className="text-zinc-400 text-sm">Items Available</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                    <Clock className="h-6 w-6 text-[#e78a53]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.avgPrepTime}</p>
                    <p className="text-zinc-400 text-sm">Min Avg Wait</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                    <Star className="h-6 w-6 text-[#e78a53]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.avgRating}</p>
                    <p className="text-zinc-400 text-sm">Avg Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                    <Store className="h-6 w-6 text-[#e78a53]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.canteenCount}</p>
                    <p className="text-zinc-400 text-sm">Active Canteens</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Categories */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Categories</h2>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <Badge 
                  key={category} 
                  variant="outline" 
                  className={`px-4 py-2 cursor-pointer transition-colors ${
                    category === selectedCategory 
                      ? 'bg-[#e78a53]/10 border-[#e78a53]/30 text-[#e78a53]' 
                      : 'border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600'
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Food Items Grid */}
          {isLoading ? (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#e78a53] mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-white mb-2">Loading menu items...</h3>
                <p className="text-zinc-400">Please wait while we fetch the latest menu.</p>
              </CardContent>
            </Card>
          ) : filteredItems.length === 0 ? (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-12 text-center">
                <ShoppingCart className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No menu items found</h3>
                <p className="text-zinc-400 mb-6">
                  {menuItems.length === 0 
                    ? "No canteens have added menu items yet."
                    : "Try adjusting your search or filter criteria."
                  }
                </p>
                <Button 
                  className="bg-[#e78a53] hover:bg-[#e78a53]/90"
                  onClick={fetchMenuItems}
                >
                  Refresh Menu
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <Card key={item._id} className={`bg-zinc-900/50 border-zinc-800 transition-all hover:bg-zinc-900/70 ${!item.isAvailable ? 'opacity-60' : ''}`}>
                  <CardContent className="p-0">
                    <div className="relative">
                      <div className="h-48 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center overflow-hidden">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Camera className="h-16 w-16 text-zinc-600" />
                        )}
                      </div>
                      <div className="absolute top-3 left-3 flex gap-2">
                        {item.isVeg && (
                          <Badge className="bg-green-500/10 border-green-500/30 text-green-400">
                            <Leaf className="h-3 w-3 mr-1" />
                            Veg
                          </Badge>
                        )}
                        {item.isSpicy && (
                          <Badge className="bg-red-500/10 border-red-500/30 text-red-400">
                            <Flame className="h-3 w-3 mr-1" />
                            Spicy
                          </Badge>
                        )}
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-black/50 text-white">
                          <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                          {item.rating}
                        </Badge>
                      </div>
                      {!item.isAvailable && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Badge variant="destructive">Currently Unavailable</Badge>
                        </div>
                      )}
                      
                      {/* Canteen Badge */}
                      <div className="absolute bottom-3 left-3">
                        <Badge className="bg-black/70 text-white border-zinc-600">
                          <Store className="h-3 w-3 mr-1" />
                          {item.canteenName}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                          <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs">
                            {item.category}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-[#e78a53] font-bold text-xl">
                            <IndianRupee className="h-5 w-5" />
                            {item.price}
                          </div>
                        </div>
                      </div>
                      <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{item.description}</p>
                      <div className="flex items-center gap-2 mb-4">
                        <Timer className="h-4 w-4 text-zinc-400" />
                        <span className="text-zinc-400 text-sm">{item.prepTime} min</span>
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          className="flex-1 bg-[#e78a53] hover:bg-[#e78a53]/90" 
                          disabled={!item.isAvailable}
                          onClick={() => {
                            setSelectedMenuItem(item)
                            setIsOrderDialogOpen(true)
                          }}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Order Now
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 border-zinc-700 text-zinc-400 hover:text-white" 
                          disabled={!item.isAvailable}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Recent Orders */}
          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Your Recent Orders</h2>
              <Button 
                variant="outline" 
                size="sm"
                className="border-zinc-700 text-zinc-400 hover:text-white"
                onClick={fetchRecentOrders}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            
            {recentOrders.length === 0 ? (
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-8 text-center">
                  <ShoppingCart className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No recent orders</h3>
                  <p className="text-zinc-400">Your order history will appear here once you place your first order.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentOrders.map((order) => (
                  <Card key={order._id} className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">{order.orderId}</CardTitle>
                      <div className="flex justify-between items-center">
                        <p className="text-zinc-400">{formatDate(order.createdAt)}</p>
                        <Badge className="bg-zinc-700 text-zinc-300">
                          <Store className="h-3 w-3 mr-1" />
                          {order.canteenName}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {order.items.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-300">{item.name} x{item.quantity}</span>
                              {item.isVeg && (
                                <div className="w-3 h-3 border border-green-500 rounded-sm flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                </div>
                              )}
                              {item.isSpicy && <span className="text-red-500 text-xs">🌶️</span>}
                            </div>
                            <span className="text-zinc-400">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                        <div className="border-t border-zinc-800 pt-2 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span className="text-white">Total</span>
                            <span className="text-[#e78a53]">₹{order.totalAmount}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <Badge className={`${getStatusColor(order.status)} border`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-zinc-400">
                          {order.paymentMethod === 'online' ? (
                            <CreditCard className="h-3 w-3" />
                          ) : (
                            <Wallet className="h-3 w-3" />
                          )}
                          <span>{order.paymentMethod === 'online' ? 'Paid Online' : 'Pay at Counter'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order Dialog */}
        <OrderDialog
          isOpen={isOrderDialogOpen}
          onClose={() => {
            setIsOrderDialogOpen(false)
            setSelectedMenuItem(null)
          }}
          menuItem={selectedMenuItem}
          onOrderSuccess={handleOrderSuccess}
        />

        {/* Order Receipt */}
        <OrderReceipt
          isOpen={isReceiptOpen}
          onClose={() => {
            setIsReceiptOpen(false)
            setCurrentOrder(null)
          }}
          order={currentOrder}
        />
      </main>
    </div>
  )
}