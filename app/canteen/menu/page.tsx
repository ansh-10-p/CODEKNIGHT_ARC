"use client"

import { useState, useEffect } from "react"
import { MenuImageExtractor } from "@/components/menu-image-extractor"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CanteenSidebar } from "@/components/canteen-sidebar"
import { UserMenu } from "@/components/user-menu"
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Upload,
  Eye,
  EyeOff,
  Star,
  Clock,
  IndianRupee,
  Utensils,
  Bell,
  Save,
  X,
  Camera,
  CheckCircle,
  AlertCircle,
  Database,
  Leaf,
  Flame
} from "lucide-react"

interface MenuItem {
  _id: string
  canteenId: string
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
  createdAt: string
  updatedAt: string
  customId: String,
}

export default function CanteenMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedAvailability, setSelectedAvailability] = useState("all")

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    isVeg: true,
    isSpicy: false,
    prepTime: "",
    isAvailable: true
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const categories = [
    "Main Course",
    "Appetizers", 
    "Beverages",
    "Desserts",
    "Snacks",
    "South Indian",
    "North Indian",
    "Chinese",
    "Fast Food",
    "Healthy Options"
  ]

  const [isLoading, setIsLoading] = useState(false)
  const [canteenId, setCanteenId] = useState<string | null>(null)
  const [currentDigitalMenuId, setCurrentDigitalMenuId] = useState<string | null>(null)
  const [digitalMenuLink, setDigitalMenuLink] = useState<string | null>(null)

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
      fetchMenuItems()
    }
  }, [canteenId])

  const fetchMenuItems = async () => {
    if (!canteenId) return
    setIsLoading(true)
    try {
      const response = await fetch(`/api/canteen/menu?canteenId=${canteenId}`)
      const result = await response.json()
      if (response.ok && result.data && result.data.length > 0) {
        setMenuItems(result.data)
      } else {
        if (!response.ok) console.error('Error fetching menu items:', result.error)
        // Auto-load sample data as fallback when API returns empty or errors
        const { demoMenuItems } = await import("@/lib/sample-menu-data")
        setMenuItems(demoMenuItems)
      }
    } catch (error) {
      console.error('Error fetching menu items:', error)
      // Auto-load sample data as fallback on network/fetch errors
      try {
        const { demoMenuItems } = await import("@/lib/sample-menu-data")
        setMenuItems(demoMenuItems)
      } catch { /* ignore import error */ }
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddExtractedItem = async (item: any, digitalMenuId: string) => {
    if (!canteenId) return alert("Canteen ID not found. Please login again.")
    try {
      const itemData = {
        canteenId: canteenId,
        name: item.name,
        description: `Extracted from menu image`,
        price: item.price,
        category: item.category || "Extracted Items",
        image: null,
        isVeg: true, 
        isSpicy: false, 
        prepTime: 10, 
        isAvailable: true,
        digitalMenuId: digitalMenuId 
      }
      const response = await fetch('/api/canteen/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      })
      if (response.ok) {
        await fetchMenuItems()
      } else {
        const result = await response.json()
        alert('Error adding item: ' + result.error)
      }
    } catch (error) {
      console.error('Error adding extracted item:', error)
    }
  }

  const handleLoadSampleData = async () => {
    if (!canteenId) return alert("Canteen ID not found. Please login again.")
    if (confirm("This will add sample menu items to your database. Continue?")) {
      setIsLoading(true)
      try {
        const { demoMenuItems } = await import("@/lib/sample-menu-data")
        for (const item of demoMenuItems) {
          const itemData = { ...item, canteenId: canteenId, id: undefined }
          await fetch('/api/canteen/menu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemData)
          })
        }
        await fetchMenuItems()
        alert("Sample menu data loaded successfully!")
      } catch (error) {
        console.error('Error loading sample data:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "", description: "", price: "", category: "",
      isVeg: true, isSpicy: false, prepTime: "", isAvailable: true
    })
    setImageFile(null)
    setImagePreview(null)
    setEditingItem(null)
  }

  const openEditDialog = (item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      isVeg: item.isVeg,
      isSpicy: item.isSpicy,
      prepTime: item.prepTime.toString(),
      isAvailable: item.isAvailable
    })
    setImagePreview(item.image)
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.price || !formData.category) {
      return alert("Please fill in all required fields")
    }
    if (!canteenId) return alert("Canteen ID not found. Please login again.")

    setIsLoading(true)
    try {
      const itemData = {
        canteenId: canteenId,
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        image: imagePreview,
        isVeg: formData.isVeg,
        isSpicy: formData.isSpicy,
        prepTime: formData.prepTime,
        isAvailable: formData.isAvailable,
        
      }

      const response = await fetch('/api/canteen/menu', {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem ? { ...itemData, id: editingItem._id } : itemData)
      })
      
      if (response.ok) {
        await fetchMenuItems()
        setIsDialogOpen(false)
        resetForm()
      } else {
        const result = await response.json()
        alert('Error saving menu item: ' + result.error)
      }
    } catch (error) {
      console.error('Error saving menu item:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteItem = async (id: string) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/canteen/menu?id=${id}`, { method: 'DELETE' })
        if (response.ok) {
          await fetchMenuItems()
        }
      } catch (error) {
        console.error('Error deleting menu item:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const toggleAvailability = async (id: string) => {
    const item = menuItems.find(item => item._id === id)
    if (!item) return
    setIsLoading(true)
    try {
      const response = await fetch('/api/canteen/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          id: id,
          isAvailable: !item.isAvailable,
        })
      })
      if (response.ok) {
        await fetchMenuItems()
      }
    } catch (error) {
      console.error('Error updating availability:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    const matchesAvailability = selectedAvailability === "all" || 
                               (selectedAvailability === "available" && item.isAvailable) ||
                               (selectedAvailability === "unavailable" && !item.isAvailable)
    
    return matchesSearch && matchesCategory && matchesAvailability
  })

  const stats = {
    total: menuItems.length,
    available: menuItems.filter(item => item.isAvailable).length,
    unavailable: menuItems.filter(item => !item.isAvailable).length,
    categories: new Set(menuItems.map(item => item.category)).size
  }

  const [showImageScan, setShowImageScan] = useState(false)

  return (
    <div className="min-h-screen bg-black flex font-sans">
      <CanteenSidebar />
      
      <main className="flex-1 overflow-auto">
        {/* Sleek Header */}
        <header className="bg-black/60 backdrop-blur-xl border-b border-zinc-800/60 sticky top-0 z-20">
          <div className="px-8 py-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">Menu Management</h1>
              <p className="text-zinc-400 text-sm">Create, edit, and orchestrate your culinary offerings</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 group-focus-within:text-[#e78a53] transition-colors" />
                <Input 
                  placeholder="Search menu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 bg-zinc-900/50 border-zinc-800 text-white placeholder-zinc-500 focus:border-[#e78a53]/50 focus:ring-[#e78a53]/20 transition-all rounded-xl"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40 bg-zinc-900/50 border-zinc-800 text-white rounded-xl focus:ring-[#e78a53]/20">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 rounded-xl">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
                <SelectTrigger className="w-40 bg-zinc-900/50 border-zinc-800 text-white rounded-xl focus:ring-[#e78a53]/20">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 rounded-xl">
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Add Menu Item Button & Dialog */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#e78a53] hover:bg-[#d97740] text-white shadow-lg shadow-[#e78a53]/20 rounded-xl transition-all" onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-950 border border-zinc-800/80 text-white max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl tracking-tight">
                      {editingItem ? "Edit Menu Item" : "Create New Dish"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-zinc-300">Item Name *</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g. Masala Dosa"
                          className="bg-zinc-900/50 border-zinc-800 text-white focus:border-[#e78a53]/50 rounded-lg"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-300">Price (₹) *</Label>
                        <div className="relative">
                          <IndianRupee className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" />
                          <Input
                            type="number" step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                            placeholder="0.00"
                            className="pl-9 bg-zinc-900/50 border-zinc-800 text-white focus:border-[#e78a53]/50 rounded-lg"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-zinc-300">Description</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe the ingredients and taste..."
                        className="bg-zinc-900/50 border-zinc-800 text-white min-h-[100px] focus:border-[#e78a53]/50 rounded-lg resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-zinc-300">Category *</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-white rounded-lg">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800 rounded-lg">
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-300">Prep Time (minutes)</Label>
                        <div className="relative">
                          <Clock className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" />
                          <Input
                            type="number"
                            value={formData.prepTime}
                            onChange={(e) => setFormData(prev => ({ ...prev, prepTime: e.target.value }))}
                            placeholder="15"
                            className="pl-9 bg-zinc-900/50 border-zinc-800 text-white focus:border-[#e78a53]/50 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-zinc-300">Food Image</Label>
                      <div className="border-2 border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 rounded-xl p-8 text-center transition-colors">
                        {imagePreview ? (
                          <div className="relative group/image">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="w-full h-56 object-cover rounded-lg shadow-md"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <Button
                                  type="button"
                                  variant="destructive"
                                  onClick={() => { setImagePreview(null); setImageFile(null); }}
                                  className="shadow-lg"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" /> Remove Image
                                </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="py-6 flex flex-col items-center">
                            <div className="h-16 w-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                                <Camera className="h-8 w-8 text-zinc-400" />
                            </div>
                            <p className="text-zinc-300 font-medium mb-1">Upload a delicious photo</p>
                            <p className="text-zinc-500 text-sm mb-6">PNG, JPG up to 5MB</p>
                            <input
                              type="file" accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden" id="image-upload"
                            />
                            <label htmlFor="image-upload">
                              <Button type="button" variant="outline" className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg" asChild>
                                <span className="cursor-pointer">
                                  <Upload className="h-4 w-4 mr-2" /> Select Image
                                </span>
                              </Button>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/60">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox" id="isVeg"
                          checked={formData.isVeg}
                          onChange={(e) => setFormData(prev => ({ ...prev, isVeg: e.target.checked }))}
                          className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-green-500 focus:ring-green-500/20 cursor-pointer"
                        />
                        <Label htmlFor="isVeg" className="text-zinc-200 cursor-pointer font-medium">Vegetarian</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox" id="isSpicy"
                          checked={formData.isSpicy}
                          onChange={(e) => setFormData(prev => ({ ...prev, isSpicy: e.target.checked }))}
                          className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-red-500 focus:ring-red-500/20 cursor-pointer"
                        />
                        <Label htmlFor="isSpicy" className="text-zinc-200 cursor-pointer font-medium">Spicy</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox" id="isAvailable"
                          checked={formData.isAvailable}
                          onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                          className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-[#e78a53] focus:ring-[#e78a53]/20 cursor-pointer"
                        />
                        <Label htmlFor="isAvailable" className="text-zinc-200 cursor-pointer font-medium">Available</Label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/80">
                      <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-zinc-400 hover:text-white rounded-lg">
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading} className="bg-[#e78a53] hover:bg-[#d97740] text-white rounded-lg px-8">
                        <Save className="h-4 w-4 mr-2" />
                        {isLoading ? "Saving..." : (editingItem ? "Save Changes" : "Create Item")}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Button variant="ghost" size="icon" className="hover:bg-zinc-800 rounded-xl">
                <Bell className="h-5 w-5 text-zinc-400" />
              </Button>
              <UserMenu />
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {/* Menu Image Scanner Toggle */}
          <div className="mb-8">
            <div className="flex items-center justify-between bg-zinc-900/30 border border-zinc-800/50 p-4 rounded-2xl mb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Camera className="h-5 w-5 text-[#e78a53]" /> AI Menu Scanner
                </h2>
                <p className="text-sm text-zinc-500">Upload a physical menu to auto-extract items</p>
              </div>
              <Button
                variant={showImageScan ? "outline" : "default"}
                className={`rounded-xl ${showImageScan ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'}`}
                onClick={() => {
                  setShowImageScan(!showImageScan)
                  if (!showImageScan) { setDigitalMenuLink(null); setCurrentDigitalMenuId(null); }
                }}
              >
                {showImageScan ? 'Close Scanner' : 'Open Scanner'}
              </Button>
            </div>
            
            {/* Smooth expansion wrapper for Scanner */}
            <div className={`transition-all duration-500 overflow-hidden ${showImageScan ? 'max-h-[1000px] opacity-100 mb-8' : 'max-h-0 opacity-0'}`}>
              <MenuImageExtractor 
                onItemsExtracted={async (items) => {
                  const digitalMenuId = `dm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                  setCurrentDigitalMenuId(digitalMenuId)
                  const link = `${window.location.origin}/digital-menu/${digitalMenuId}`
                  setDigitalMenuLink(link)
                  for (const item of items) { await handleAddExtractedItem(item, digitalMenuId) }
                }}
                digitalMenuLink={digitalMenuLink || undefined}
              />
            </div>
          </div>

          {/* Premium Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-md hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-orange-500/10 border border-orange-500/20 rounded-xl shadow-inner">
                    <Utensils className="h-6 w-6 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-white tracking-tight">{stats.total}</p>
                    <p className="text-zinc-500 font-medium text-sm uppercase tracking-wider">Total Items</p>
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
                    <p className="text-3xl font-black text-white tracking-tight">{stats.available}</p>
                    <p className="text-zinc-500 font-medium text-sm uppercase tracking-wider">Available</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-md hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl shadow-inner">
                    <AlertCircle className="h-6 w-6 text-rose-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-white tracking-tight">{stats.unavailable}</p>
                    <p className="text-zinc-500 font-medium text-sm uppercase tracking-wider">Unavailable</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-md hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl shadow-inner">
                    <Filter className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-white tracking-tight">{stats.categories}</p>
                    <p className="text-zinc-500 font-medium text-sm uppercase tracking-wider">Categories</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Active Roster <span className="text-zinc-500 text-lg ml-2 font-normal">({filteredItems.length} items)</span>
            </h2>
          </div>

          {/* Menu Items Grid */}
          {isLoading ? (
            <Card className="bg-zinc-900/30 border-dashed border-zinc-800">
              <CardContent className="p-20 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-zinc-800 border-t-[#e78a53] mb-6"></div>
                <h3 className="text-xl font-semibold text-zinc-300 mb-1">Syncing Menu...</h3>
              </CardContent>
            </Card>
          ) : filteredItems.length === 0 ? (
            <Card className="bg-zinc-900/30 border-dashed border-zinc-800">
              <CardContent className="p-20 text-center">
                <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Utensils className="h-10 w-10 text-zinc-600" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Your menu is empty</h3>
                <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                  {menuItems.length === 0 
                    ? "Start building your digital menu by adding items manually or scanning a physical menu."
                    : "No items match your current search or filter criteria."
                  }
                </p>
                <div className="flex gap-4 justify-center">
                  <Button className="bg-[#e78a53] hover:bg-[#d97740] rounded-xl px-6" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" /> Add First Item
                  </Button>
                  {menuItems.length === 0 && (
                    <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white rounded-xl px-6" onClick={handleLoadSampleData}>
                      <Database className="h-4 w-4 mr-2" /> Load Demo Data
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
              {filteredItems.map((item) => (
                <Card key={item._id} className="group relative overflow-hidden bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm hover:border-zinc-700/80 hover:bg-zinc-900/80 hover:shadow-2xl hover:shadow-black/60 transition-all duration-500 rounded-2xl flex flex-col">
                  
                  {/* Image Header Area */}
                  <div className="relative h-52 bg-zinc-950 overflow-hidden">
                    {/* Dark gradient overlay at top and bottom for text readability */}
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-zinc-950 via-transparent to-black/60 opacity-80" />
                    
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${!item.isAvailable && 'grayscale-[50%] brightness-75'}`}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center opacity-40">
                        <Camera className="h-10 w-10 text-zinc-500 mb-2" />
                        <span className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">No Image</span>
                      </div>
                    )}
                    
                    {/* Top Left Badges (Veg / Spicy) */}
                    <div className="absolute top-4 left-4 z-20 flex gap-2 items-center">
                      {item.isVeg ? (
                        <Badge className="flex items-center gap-1.5 px-2.5 py-1 bg-green-950/80 backdrop-blur-md border border-green-500/30 text-green-400 font-medium">
                          <div className="w-3 h-3 border border-green-500 rounded-sm flex items-center justify-center bg-transparent"><div className="w-1.5 h-1.5 bg-green-500 rounded-full" /></div>
                          <span className="leading-none mt-0.5">Veg</span>
                        </Badge>
                      ) : (
                        <Badge className="flex items-center gap-1.5 px-2.5 py-1 bg-red-950/80 backdrop-blur-md border border-red-500/30 text-red-400 font-medium">
                          <div className="w-3 h-3 border border-red-500 rounded-sm flex items-center justify-center bg-transparent"><div className="w-1.5 h-1.5 bg-red-500 rounded-full" /></div>
                          <span className="leading-none mt-0.5">Non-Veg</span>
                        </Badge>
                      )}
                      {item.isSpicy && (
                        <Badge className="flex items-center gap-1 px-2.5 py-1 bg-orange-950/80 backdrop-blur-md border border-orange-500/30 text-orange-400 font-medium">
                          <Flame className="h-3 w-3" />
                          <span className="leading-none mt-0.5">Spicy</span>
                        </Badge>
                      )}
                    </div>

                    {/* Top Right Quick Actions (Slide down on hover) */}
                    <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <Button size="icon" className="h-8 w-8 rounded-full bg-black/60 backdrop-blur-md border border-zinc-700 hover:bg-[#e78a53] hover:text-white hover:border-[#e78a53] text-zinc-300 transition-colors shadow-xl" onClick={() => openEditDialog(item)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" className="h-8 w-8 rounded-full bg-black/60 backdrop-blur-md border border-zinc-700 hover:bg-red-500 hover:text-white hover:border-red-500 text-zinc-300 transition-colors shadow-xl" onClick={() => deleteItem(item._id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Bottom Floating Price Tag */}
                    <div className="absolute bottom-4 right-4 z-20">
                      <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 text-[#e78a53] font-bold text-lg px-3 py-1 rounded-xl flex items-center shadow-lg">
                        <IndianRupee className="h-4 w-4 mr-0.5" />{item.price}
                      </div>
                    </div>
                  </div>

                  {/* Content Details Area */}
                  <CardContent className="p-5 flex-1 flex flex-col justify-between z-20 relative bg-zinc-900/40">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-zinc-100 group-hover:text-white transition-colors leading-tight line-clamp-1 pr-2">{item.name}</h3>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-medium text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded-md border border-zinc-700/50">{item.category}</span>
                        <div className="flex items-center gap-1 text-zinc-500 text-xs font-medium">
                          <Clock className="h-3.5 w-3.5" /> {item.prepTime}m prep
                        </div>
                      </div>

                      <p className="text-zinc-500 text-sm mb-5 line-clamp-2 leading-relaxed min-h-[40px]">
                        {item.description || "No description provided."}
                      </p>
                    </div>

                    {/* Bottom Status / Toggle */}
                    <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between mt-auto">
                      <button
                        onClick={() => toggleAvailability(item._id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide transition-colors ${
                          item.isAvailable 
                            ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20" 
                            : "bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 border border-zinc-700/50"
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-zinc-600'}`} />
                        {item.isAvailable ? "AVAILABLE" : "UNAVAILABLE"}
                      </button>

                      {item.rating > 0 && (
                         <div className="flex items-center gap-1.5 text-zinc-400 text-sm font-semibold">
                           <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                           {item.rating}
                         </div>
                      )}
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