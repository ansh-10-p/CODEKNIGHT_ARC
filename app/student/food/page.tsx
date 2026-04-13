"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StudentSidebar } from "@/components/student-sidebar"
import { UserMenu } from "@/components/user-menu"
import { OrderDialog } from "@/components/order-dialog"
import { OrderReceipt } from "@/components/order-receipt"
import {
  Clock,
  Star,
  Timer,
  ShoppingCart,
  Calendar,
  IndianRupee,
  Leaf,
  Flame,
  Search,
  Bell,
  Camera,
  Store,
  RefreshCw,
  CreditCard,
  Wallet,
  ArrowRight,
  UtensilsCrossed,
  Plus,
  Minus,
  Trash2,
  History,
  X
} from "lucide-react"
import { Input } from "@/components/ui/input"

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
  isDemo?: boolean
}

export default function StudentFoodPage() {
  const demoMenuItems: MenuItem[] = [
    { _id: "Demo-m1", name: "Veg Thali", description: "Complete meal with rice, dal, paneer curry, roti, and salad.", price: 120, category: "Main Course", image: "/veg-thali.jpg", isVeg: true, isSpicy: false, prepTime: 15, rating: 4.5, isAvailable: true, canteenName: "Campus Cafe", canteenId: "canteen-1", isDemo: true },
    { _id: "Demo-m2", name: "Masala Dosa", description: "Crispy South Indian dosa served with fresh coconut chutney and sambar.", price: 90, category: "South Indian", image: "/masala-dosa.jpg", isVeg: true, isSpicy: true, prepTime: 10, rating: 4.6, isAvailable: true, canteenName: "South Corner", canteenId: "canteen-2", isDemo: true },
    { _id: "Demo-m3", name: "Veg Fried Rice", description: "Classic Indo-Chinese wok-tossed rice with fresh vegetables.", price: 110, category: "Chinese", image: "/fried-rice.jpg", isVeg: true, isSpicy: true, prepTime: 12, rating: 4.3, isAvailable: true, canteenName: "Wok & Roll", canteenId: "canteen-3", isDemo: true },
    { _id: "Demo-m4", name: "Grilled Sandwich", description: "Bombay style grilled veg sandwich with green chutney and cheese.", price: 70, category: "Snacks", image: "/sandwich.jpg", isVeg: true, isSpicy: false, prepTime: 8, rating: 4.4, isAvailable: true, canteenName: "Bite Station", canteenId: "canteen-4", isDemo: true },
    { _id: "Demo-m5", name: "Classic Burger", description: "Aloo tikki patty with fresh lettuce, tomatoes, and house mayo.", price: 85, category: "Fast Food", image: "/burger.jpg", isVeg: true, isSpicy: false, prepTime: 10, rating: 4.2, isAvailable: true, canteenName: "Bite Station", canteenId: "canteen-4", isDemo: true },
    { _id: "Demo-m6", name: "Mumbai Pav Bhaji", description: "Spicy mashed vegetable curry served with buttery toasted pav buns.", price: 95, category: "Street Food", image: "/pavbhaji.jpg", isVeg: true, isSpicy: true, prepTime: 10, rating: 4.7, isAvailable: true, canteenName: "Campus Cafe", canteenId: "canteen-1", isDemo: true },
    { _id: "Demo-m7", name: "Punjabi Samosa", description: "Two crispy pastry shells stuffed with spiced potatoes and peas.", price: 30, category: "Snacks", image: "/samosa.jpg", isVeg: true, isSpicy: true, prepTime: 5, rating: 4.8, isAvailable: true, canteenName: "Campus Cafe", canteenId: "canteen-1", isDemo: true },
    { _id: "Demo-m8", name: "Hakka Noodles", description: "Stir-fried noodles with crunchy cabbage, carrots, and soy sauce.", price: 100, category: "Chinese", image: "/noodles.jpg", isVeg: true, isSpicy: true, prepTime: 12, rating: 4.4, isAvailable: true, canteenName: "Wok & Roll", canteenId: "canteen-3", isDemo: true },
    { _id: "Demo-m9", name: "Margherita Pizza", description: "Classic personal pan pizza with rich tomato sauce and mozzarella.", price: 150, category: "Fast Food", image: "/pizza.jpg", isVeg: true, isSpicy: false, prepTime: 18, rating: 4.5, isAvailable: true, canteenName: "Bite Station", canteenId: "canteen-4", isDemo: true },
    { _id: "Demo-m10", name: "Steamed Idli", description: "Soft and fluffy rice cakes served with sambar and coconut chutney.", price: 50, category: "South Indian", image: "/idli.jpg", isVeg: true, isSpicy: false, prepTime: 5, rating: 4.6, isAvailable: true, canteenName: "South Corner", canteenId: "canteen-2", isDemo: true },
    { _id: "Demo-m11", name: "Mutter Paneer", description: "Cottage cheese and green peas in a rich, creamy tomato gravy. Served with 2 Rotis.", price: 140, category: "Main Course", image: "/mutter-paneer.jpg", isVeg: true, isSpicy: true, prepTime: 15, rating: 4.7, isAvailable: true, canteenName: "Campus Cafe", canteenId: "canteen-1", isDemo: true },
    { _id: "Demo-m12", name: "Vada Pav", description: "The iconic Mumbai snack: spicy potato fritter in a soft bun.", price: 25, category: "Street Food", image: "/vada-pav.jpg", isVeg: true, isSpicy: true, prepTime: 5, rating: 4.9, isAvailable: true, canteenName: "Campus Cafe", canteenId: "canteen-1", isDemo: true },
    { _id: "Demo-m13", name: "Kanda Poha", description: "Light flattened rice cooked with onions, peanuts, and turmeric.", price: 45, category: "Breakfast", image: "/poha.jpg", isVeg: true, isSpicy: false, prepTime: 5, rating: 4.3, isAvailable: true, canteenName: "Campus Cafe", canteenId: "canteen-1", isDemo: true },
    { _id: "Demo-m14", name: "Belgian Waffles", description: "Crispy waffles topped with chocolate syrup and powdered sugar.", price: 110, category: "Desserts", image: "/waffles.jpg", isVeg: true, isSpicy: false, prepTime: 12, rating: 4.6, isAvailable: true, canteenName: "Sweet Cravings", canteenId: "canteen-5", isDemo: true },
    { _id: "Demo-m15", name: "Cold Coffee", description: "Chilled coffee blended with ice cream and served with whipped cream.", price: 70, category: "Beverages", image: "/cold-coffee.jpg", isVeg: true, isSpicy: false, prepTime: 5, rating: 4.8, isAvailable: true, canteenName: "Sweet Cravings", canteenId: "canteen-5", isDemo: true },
    { _id: "Demo-m16", name: "Paneer Roll", description: "Delicious paneer wrapped in a soft paratha with mint chutney.", price: 85, category: "Snacks", image: "/paneer-roll.jpg", isVeg: true, isSpicy: false, prepTime: 5, rating: 4.8, isAvailable: true, canteenName: "Bite Station", canteenId: "canteen-4", isDemo: true },
    { _id: "Demo-m17", name: "Thick Milkshake", description: "Rich and creamy chocolate milkshake blended with vanilla ice cream.", price: 80, category: "Beverages", image: "/milkshake.jpg", isVeg: true, isSpicy: false, prepTime: 5, rating: 4.5, isAvailable: true, canteenName: "Sweet Cravings", canteenId: "canteen-5", isDemo: true },
    { _id: "Demo-m18", name: "Cold Drinks", description: "Chilled assorted carbonated beverages (Cola, Sprite, Thums Up).", price: 40, category: "Beverages", image: "/colddrinks.jpg", isVeg: true, isSpicy: false, prepTime: 2, rating: 4.0, isAvailable: true, canteenName: "Bite Station", canteenId: "canteen-4", isDemo: true },
  ]
  const demoRecentOrders = [
    {
      _id: "demo-o1",
      orderId: "ORD-SD-101",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      canteenName: "Campus Cafe",
      items: [{ name: "Veg Thali", quantity: 1, price: 120, isVeg: true, isSpicy: false }, { name: "Cold Coffee", quantity: 1, price: 70, isVeg: true, isSpicy: false }],
      totalAmount: 190,
      status: "completed",
      paymentMethod: "online",
    },
    {
      _id: "demo-o2",
      orderId: "ORD-SD-102",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      canteenName: "South Corner",
      items: [{ name: "Masala Dosa", quantity: 2, price: 90, isVeg: true, isSpicy: true }],
      totalAmount: 180,
      status: "completed",
      paymentMethod: "offline",
    },
    {
      _id: "demo-o3",
      orderId: "ORD-SD-103",
      createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      canteenName: "Bite Station",
      items: [{ name: "Classic Burger", quantity: 1, price: 85, isVeg: true, isSpicy: false }, { name: "Cold Drinks", quantity: 1, price: 40, isVeg: true, isSpicy: false }],
      totalAmount: 125,
      status: "preparing",
      paymentMethod: "online",
    },
    {
      _id: "demo-o4",
      orderId: "ORD-SD-104",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      canteenName: "Campus Cafe",
      items: [{ name: "Vada Pav", quantity: 3, price: 25, isVeg: true, isSpicy: true }, { name: "Kanda Poha", quantity: 1, price: 45, isVeg: true, isSpicy: false }],
      totalAmount: 120,
      status: "completed",
      paymentMethod: "online",
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
  const [menuLoadFailed, setMenuLoadFailed] = useState(false)
  const [cart, setCart] = useState<{ item: MenuItem; qty: number }[]>([])
  const [historyFilter, setHistoryFilter] = useState<"all" | "completed" | "preparing" | "pending">("all")
  const [showCart, setShowCart] = useState(false)

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.item._id === item._id)
      if (existing) return prev.map(c => c.item._id === item._id ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { item, qty: 1 }]
    })
  }
  const removeFromCart = (id: string) => {
    setCart(prev => {
      const existing = prev.find(c => c.item._id === id)
      if (existing && existing.qty > 1) return prev.map(c => c.item._id === id ? { ...c, qty: c.qty - 1 } : c)
      return prev.filter(c => c.item._id !== id)
    })
  }
  const clearCart = () => setCart([])
  const cartTotal = cart.reduce((sum, c) => sum + c.item.price * c.qty, 0)
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0)

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
        setMenuLoadFailed(false)
        setMenuItems(result.data?.length ? result.data : demoMenuItems)
      } else {
        console.error('Error fetching menu items:', result.error)
        setMenuLoadFailed(true)
        setMenuItems(demoMenuItems)
      }
    } catch (error) {
      console.error('Error fetching menu items:', error)
      setMenuLoadFailed(true)
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
      const response = await fetch(`/api/orders/user?userId=${currentUser.id}&userType=student`)
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
      <StudentSidebar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
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
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
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
                    <Calendar className="h-6 w-6 text-[#e78a53]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.canteenCount}</p>
                    <p className="text-zinc-400 text-sm">Active Canteens</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2.1fr)_minmax(280px,0.9fr)] gap-6 mb-8">
            <Card className="bg-zinc-900/50 border-zinc-800 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <CardTitle className="text-white text-xl">Browse the Menu</CardTitle>
                    <p className="text-sm text-zinc-400 mt-1">
                      Search by dish, canteen, or category and keep the ordering flow in one place.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start">
                    <Badge className="bg-[#e78a53]/10 border border-[#e78a53]/30 text-[#e78a53]">
                      {filteredItems.length} results
                    </Badge>
                    <Button
                      size="sm"
                      className="relative bg-[#e78a53] hover:bg-[#e78a53]/90 text-white"
                      onClick={() => setShowCart(v => !v)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Cart
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-white text-[#e78a53] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Cart Panel */}
                {showCart && (
                  <div className="mt-4 rounded-xl border border-[#e78a53]/30 bg-zinc-900/80 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-[#e78a53]" /> Cart ({cartCount} items)
                      </p>
                      {cart.length > 0 && (
                        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-red-400 h-6 px-2" onClick={clearCart}>
                          <Trash2 className="h-3 w-3 mr-1" /> Clear
                        </Button>
                      )}
                    </div>
                    {cart.length === 0 ? (
                      <p className="text-zinc-500 text-sm text-center py-3">No items in cart yet.</p>
                    ) : (
                      <>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {cart.map(({ item, qty }) => (
                            <div key={item._id} className="flex items-center justify-between gap-2">
                              <span className="text-zinc-300 text-sm truncate flex-1">{item.name}</span>
                              <div className="flex items-center gap-1">
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-zinc-400 hover:text-white" onClick={() => removeFromCart(item._id)}>
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-white text-sm w-4 text-center">{qty}</span>
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-zinc-400 hover:text-white" onClick={() => addToCart(item)}>
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <span className="text-[#e78a53] text-sm w-16 text-right">₹{item.price * qty}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-zinc-700 pt-2 flex items-center justify-between">
                          <span className="text-white font-semibold text-sm">Total</span>
                          <span className="text-[#e78a53] font-bold">₹{cartTotal}</span>
                        </div>
                        <Button className="w-full bg-[#e78a53] hover:bg-[#e78a53]/90 text-white" onClick={() => {
                          if (cart.length > 0) {
                            setSelectedMenuItem(cart[0].item)
                            setIsOrderDialogOpen(true)
                          }
                        }}>
                          Proceed to Order
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-4">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <Input
                      placeholder="Search dishes, descriptions, or canteens..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-zinc-800/40 border-zinc-700 text-white placeholder:text-zinc-500"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    onClick={fetchMenuItems}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh Menu
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">Categories</p>
                    <p className="text-xs text-zinc-500">Tap a badge to filter instantly</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {categories.map((category) => (
                      <Badge
                        key={category}
                        variant="outline"
                        className={`px-4 py-2 cursor-pointer transition-colors ${category === selectedCategory
                            ? "bg-[#e78a53]/10 border-[#e78a53]/30 text-[#e78a53]"
                            : "border-zinc-700 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-zinc-600"
                          }`}
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-xl">Order Flow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-800/30 p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#e78a53]/10">
                      <UtensilsCrossed className="h-5 w-5 text-[#e78a53]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Choose your meal</p>
                      <p className="text-sm text-zinc-400 mt-1">
                        Browse by category and open the order drawer directly from any menu card.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-800/30 p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#e78a53]/10">
                      <CreditCard className="h-5 w-5 text-[#e78a53]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Pay online or at pickup</p>
                      <p className="text-sm text-zinc-400 mt-1">
                        Razorpay stays available for demo payments, while offline checkout remains one tap away.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-800/30 p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#e78a53]/10">
                      <ArrowRight className="h-5 w-5 text-[#e78a53]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Track status from this page</p>
                      <p className="text-sm text-zinc-400 mt-1">
                        Your recent orders and receipt modal follow the same dashboard card system for quick follow-up.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {menuLoadFailed && (
            <Card className="bg-yellow-500/10 border-yellow-500/30 mb-8">
              <CardContent className="p-4 text-sm text-yellow-200">
                Live menu data could not be loaded, so demo items are being shown. You can still open the order flow for UI testing while backend menu data is being fixed.
              </CardContent>
            </Card>
          )}

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
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Menu
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <Card key={item._id} className={`group overflow-hidden bg-zinc-900/50 border-zinc-800 shadow-sm transition-all hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-900/70 ${!item.isAvailable ? 'opacity-60' : ''}`}>
                  <CardContent className="p-0">
                    <div className="relative">
                      <div className="h-44 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <Camera className="h-16 w-16 text-zinc-600" />
                        )}
                      </div>

                      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                        {item.isVeg && (
                          <Badge className="flex items-center gap-1.5 px-3 py-1 bg-green-950/90 border border-green-500/50 text-green-400">
                            <Leaf className="h-3 w-3" />
                            <span className="leading-none mt-0.5">Veg</span>
                          </Badge>
                        )}
                        {item.isSpicy && (
                          <Badge className="flex items-center gap-1.5 px-3 py-1 bg-red-950/90 border border-red-500/50 text-red-400">
                            <Flame className="h-3 w-3" />
                            <span className="leading-none mt-0.5">Spicy</span>
                          </Badge>
                        )}
                      </div>

                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="flex items-center gap-1.5 px-3 py-1 bg-black/80 border border-zinc-700 text-white">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="leading-none mt-0.5">{item.rating}</span>
                        </Badge>
                      </div>

                      {!item.isAvailable && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                          <Badge variant="destructive" className="px-4 py-1.5">Currently Unavailable</Badge>
                        </div>
                      )}

                      <div className="absolute bottom-4 left-4 z-10">
                        <Badge className="flex items-center gap-1.5 px-3 py-1 bg-black/80 border-zinc-600 text-white">
                          <Store className="h-3 w-3" />
                          <span className="leading-none mt-0.5">{item.canteenName}</span>
                        </Badge>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold text-white mb-1 truncate">{item.name}</h3>
                          <Badge variant="outline" className="border-zinc-700 bg-zinc-900/60 text-zinc-400 text-xs">
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

                      <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between gap-3 mb-5 text-sm">
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Timer className="h-4 w-4 text-zinc-400" />
                          <span>{item.prepTime} min</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500">
                          <Store className="h-4 w-4" />
                          <span className="truncate max-w-[120px]">{item.canteenName}</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          className="flex-1 bg-[#e78a53] hover:bg-[#e78a53]/90 text-black font-medium"
                          disabled={!item.isAvailable}
                          onClick={() => addToCart(item)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {(() => { const inCart = cart.find(c => c.item._id === item._id); return inCart ? `In Cart (${inCart.qty})` : 'Add to Cart' })()}
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                          disabled={!item.isAvailable}
                          onClick={() => {
                            setSelectedMenuItem(item)
                            setIsOrderDialogOpen(true)
                          }}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {item.isDemo ? 'Demo Order' : 'Order Now'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Recent Orders */}
          <Card className="mt-12 bg-zinc-900/50 border-zinc-800 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                <div>
                  <CardTitle className="text-white text-xl">Your Recent Orders</CardTitle>
                  <p className="text-sm text-zinc-400 mt-1">
                    Keep track of current preparation status and payment method from the same dashboard-style view.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-zinc-800/60 border border-zinc-700 rounded-lg p-1">
                    {(["all", "completed", "preparing", "pending"] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setHistoryFilter(f)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${historyFilter === f ? "bg-[#e78a53] text-white" : "text-zinc-400 hover:text-white"}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    onClick={fetchRecentOrders}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
            {recentOrders.length === 0 ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-800/30 p-8 text-center">
                <ShoppingCart className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No recent orders</h3>
                <p className="text-zinc-400">Your order history will appear here once you place your first order.</p>
              </div>
            ) : (
              <>
                {recentOrders.filter(o => historyFilter === "all" || o.status === historyFilter).length === 0 ? (
                  <div className="rounded-xl border border-zinc-800 bg-zinc-800/30 p-6 text-center">
                    <History className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-400 text-sm">No <span className="text-[#e78a53]">{historyFilter}</span> orders found.</p>
                  </div>
                ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentOrders.filter(o => historyFilter === "all" || o.status === historyFilter).map((order) => (
                   <Card key={order._id} className="bg-zinc-950/60 border-zinc-800">
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
              </>
            )}
            </CardContent>
          </Card>
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
