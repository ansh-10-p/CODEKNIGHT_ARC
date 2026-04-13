"use client"

import { useState, useEffect } from "react"
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
  Package,
  AlertTriangle,
  CheckCircle,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  PackageX,
  Bell,
  Save,
  X,
  RefreshCw,
  Calendar,
  MapPin,
  Truck,
  Database,
  IndianRupee,
  TrendingUp,
  AlertCircle
} from "lucide-react"

interface StockItem {
  _id: string
  canteenId: string
  name: string
  category: string
  currentStock: number
  unit: string
  minimumStock: number
  maximumStock: number
  costPerUnit: number
  supplier: string
  lastRestocked: string
  expiryDate: string | null
  status: 'good' | 'low' | 'critical' | 'out_of_stock'
  description: string
  location: string
  batchNumber: string
  createdAt: string
  updatedAt: string
}

export default function CanteenStocksPage() {
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [canteenId, setCanteenId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<StockItem | null>(null)
  const [restockingItem, setRestockingItem] = useState<StockItem | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const [formData, setFormData] = useState({
    name: "", category: "", currentStock: "", unit: "",
    minimumStock: "", maximumStock: "", costPerUnit: "",
    supplier: "", expiryDate: "", description: "", location: "", batchNumber: ""
  })

  const [restockData, setRestockData] = useState({
    quantity: "", costPerUnit: "", supplier: "", expiryDate: "", batchNumber: ""
  })

  const categories = [
    "Grains", "Vegetables", "Fruits", "Meat", "Dairy", 
    "Oils", "Spices", "Beverages", "Snacks", "Cleaning Supplies", "Other"
  ]

  const units = ["kg", "grams", "liters", "ml", "pieces", "packets", "boxes", "bottles", "cans"]

  useEffect(() => {
    try {
      const currentUser = localStorage.getItem('currentUser')
      if (currentUser) {
        const user = JSON.parse(currentUser)
        if (user.role === 'canteen' && user.id) setCanteenId(user.id)
      }
    } catch (error) {
      console.error('Error getting canteen ID:', error)
    }
  }, [])

  useEffect(() => {
    if (canteenId) fetchStockItems()
  }, [canteenId])

  const fetchStockItems = async () => {
    if (!canteenId) return
    setIsLoading(true)
    try {
      const response = await fetch(`/api/canteen/stocks?canteenId=${canteenId}`)
      const result = await response.json()
      if (response.ok && result.data && result.data.length > 0) {
        setStockItems(result.data)
      } else {
        if (!response.ok) console.error('Error fetching stock items:', result.error)
        // Auto-load sample data as fallback when API returns empty or errors
        const { sampleStockItems } = await import("@/lib/sample-stock-data")
        setStockItems(sampleStockItems)
      }
    } catch (error) {
      console.error('Error fetching stock items:', error)
      // Auto-load sample data as fallback on network/fetch errors
      try {
        const { sampleStockItems } = await import("@/lib/sample-stock-data")
        setStockItems(sampleStockItems)
      } catch { /* ignore import error */ }
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "", category: "", currentStock: "", unit: "",
      minimumStock: "", maximumStock: "", costPerUnit: "",
      supplier: "", expiryDate: "", description: "", location: "", batchNumber: ""
    })
    setEditingItem(null)
  }

  const resetRestockForm = () => {
    setRestockData({ quantity: "", costPerUnit: "", supplier: "", expiryDate: "", batchNumber: "" })
    setRestockingItem(null)
  }

  const openEditDialog = (item: StockItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name, category: item.category, currentStock: item.currentStock.toString(),
      unit: item.unit, minimumStock: item.minimumStock.toString(), maximumStock: item.maximumStock.toString(),
      costPerUnit: item.costPerUnit.toString(), supplier: item.supplier,
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : "",
      description: item.description, location: item.location, batchNumber: item.batchNumber
    })
    setIsDialogOpen(true)
  }

  const openRestockDialog = (item: StockItem) => {
    setRestockingItem(item)
    setRestockData({
      quantity: "", costPerUnit: item.costPerUnit.toString(), supplier: item.supplier,
      expiryDate: "", batchNumber: ""
    })
    setIsRestockDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.category || !formData.currentStock || !formData.unit || 
        !formData.minimumStock || !formData.maximumStock || !formData.costPerUnit) {
      return alert("Please fill in all required fields")
    }
    if (!canteenId) return alert("Canteen ID not found. Please login again.")

    setIsLoading(true)
    try {
      const itemData = {
        canteenId, name: formData.name, category: formData.category,
        currentStock: formData.currentStock, unit: formData.unit,
        minimumStock: formData.minimumStock, maximumStock: formData.maximumStock,
        costPerUnit: formData.costPerUnit, supplier: formData.supplier,
        expiryDate: formData.expiryDate || null, description: formData.description,
        location: formData.location, batchNumber: formData.batchNumber
      }

      const response = await fetch('/api/canteen/stocks', {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem ? { ...itemData, id: editingItem._id } : itemData)
      })
      if (response.ok) {
        await fetchStockItems()
        setIsDialogOpen(false)
        resetForm()
      } else {
        const result = await response.json()
        alert('Error saving stock item: ' + result.error)
      }
    } catch (error) {
      console.error('Error saving stock item:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!restockData.quantity || !restockingItem) return alert("Please enter restock quantity")

    setIsLoading(true)
    try {
      const response = await fetch('/api/canteen/stocks/restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: restockingItem._id, quantity: restockData.quantity,
          costPerUnit: restockData.costPerUnit || restockingItem.costPerUnit,
          supplier: restockData.supplier || restockingItem.supplier,
          expiryDate: restockData.expiryDate || null,
          batchNumber: restockData.batchNumber || restockingItem.batchNumber
        })
      })
      if (response.ok) {
        await fetchStockItems()
        setIsRestockDialogOpen(false)
        resetRestockForm()
      }
    } catch (error) {
      console.error('Error restocking item:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteItem = async (id: string) => {
    if (confirm("Are you sure you want to delete this stock item?")) {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/canteen/stocks?id=${id}`, { method: 'DELETE' })
        if (response.ok) {
          await fetchStockItems()
        }
      } catch (error) {
        console.error('Error deleting stock item:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleLoadSampleData = async () => {
    if (!canteenId) return alert("Canteen ID not found. Please login again.")
    if (confirm("This will add sample stock items to your database. Continue?")) {
      setIsLoading(true)
      try {
        const { sampleStockItems } = await import("@/lib/sample-stock-data")
        for (const item of sampleStockItems) {
          await fetch('/api/canteen/stocks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...item, canteenId })
          })
        }
        await fetchStockItems()
        alert("Sample stock data loaded successfully!")
      } catch (error) {
        console.error('Error loading sample data:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || item.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusColor = (status: string) => {
    const colors = {
      good: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      low: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      critical: "bg-red-500/10 border-red-500/30 text-red-400",
      out_of_stock: "bg-zinc-800/80 border-zinc-700 text-zinc-400"
    }
    return colors[status as keyof typeof colors] || "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      good: <CheckCircle className="h-3.5 w-3.5" />,
      low: <AlertTriangle className="h-3.5 w-3.5" />,
      critical: <AlertCircle className="h-3.5 w-3.5" />,
      out_of_stock: <PackageX className="h-3.5 w-3.5" />
    }
    return icons[status as keyof typeof icons] || <Package className="h-3.5 w-3.5" />
  }

  const stats = {
    total: stockItems.length,
    good: stockItems.filter(item => item.status === 'good').length,
    low: stockItems.filter(item => item.status === 'low').length,
    critical: stockItems.filter(item => item.status === 'critical').length,
    outOfStock: stockItems.filter(item => item.status === 'out_of_stock').length,
    totalValue: stockItems.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0)
  }

  return (
    <div className="min-h-screen bg-black flex font-sans">
      <CanteenSidebar />
      
      <main className="flex-1 overflow-auto">
        {/* Sleek Header */}
        <header className="bg-black/60 backdrop-blur-xl border-b border-zinc-800/60 sticky top-0 z-20">
          <div className="px-8 py-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">Inventory Management</h1>
              <p className="text-zinc-400 text-sm">Monitor stock levels, track suppliers, and manage restocks</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 group-focus-within:text-[#e78a53] transition-colors" />
                <Input 
                  placeholder="Search inventory..."
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

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40 bg-zinc-900/50 border-zinc-800 text-white rounded-xl focus:ring-[#e78a53]/20">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 rounded-xl">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>

              {/* Add Stock Item Dialog */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#e78a53] hover:bg-[#d97740] text-white shadow-lg shadow-[#e78a53]/20 rounded-xl transition-all" onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" /> Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-950 border border-zinc-800/80 text-white max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl tracking-tight mb-4">
                      {editingItem ? "Edit Inventory Item" : "Register New Item"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-zinc-300">Item Name *</Label>
                        <Input
                          value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g. Basmati Rice" className="bg-zinc-900/50 border-zinc-800 focus:border-[#e78a53]/50 rounded-lg" required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-300">Category *</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger className="bg-zinc-900/50 border-zinc-800 rounded-lg"><SelectValue placeholder="Select category" /></SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800 rounded-lg">
                            {categories.map(category => (<SelectItem key={category} value={category}>{category}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="space-y-2">
                        <Label className="text-zinc-300">Current Stock *</Label>
                        <Input
                          type="number" step="0.01" value={formData.currentStock}
                          onChange={(e) => setFormData(prev => ({ ...prev, currentStock: e.target.value }))}
                          placeholder="0" className="bg-zinc-900/50 border-zinc-800 focus:border-[#e78a53]/50 rounded-lg" required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-300">Unit *</Label>
                        <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                          <SelectTrigger className="bg-zinc-900/50 border-zinc-800 rounded-lg"><SelectValue placeholder="Unit" /></SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800 rounded-lg">
                            {units.map(unit => (<SelectItem key={unit} value={unit}>{unit}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-300">Cost per Unit (₹) *</Label>
                        <div className="relative">
                          <IndianRupee className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" />
                          <Input
                            type="number" step="0.01" value={formData.costPerUnit}
                            onChange={(e) => setFormData(prev => ({ ...prev, costPerUnit: e.target.value }))}
                            placeholder="0.00" className="pl-9 bg-zinc-900/50 border-zinc-800 focus:border-[#e78a53]/50 rounded-lg" required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-zinc-900/30 rounded-xl border border-zinc-800/50">
                      <div className="space-y-2">
                        <Label className="text-zinc-300">Minimum Stock Warning Level *</Label>
                        <Input
                          type="number" step="0.01" value={formData.minimumStock}
                          onChange={(e) => setFormData(prev => ({ ...prev, minimumStock: e.target.value }))}
                          placeholder="Alert threshold" className="bg-zinc-950 border-zinc-800 focus:border-[#e78a53]/50 rounded-lg" required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-300">Maximum Stock Capacity *</Label>
                        <Input
                          type="number" step="0.01" value={formData.maximumStock}
                          onChange={(e) => setFormData(prev => ({ ...prev, maximumStock: e.target.value }))}
                          placeholder="Storage limit" className="bg-zinc-950 border-zinc-800 focus:border-[#e78a53]/50 rounded-lg" required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-zinc-300">Supplier Name</Label>
                        <Input
                          value={formData.supplier} onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                          placeholder="e.g. Metro Wholesale" className="bg-zinc-900/50 border-zinc-800 focus:border-[#e78a53]/50 rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-300">Expiry Date</Label>
                        <Input
                          type="date" value={formData.expiryDate} onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                          className="bg-zinc-900/50 border-zinc-800 focus:border-[#e78a53]/50 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-zinc-300">Storage Location</Label>
                        <div className="relative">
                           <MapPin className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" />
                          <Input
                            value={formData.location} onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="e.g., Cold Storage 2" className="pl-9 bg-zinc-900/50 border-zinc-800 focus:border-[#e78a53]/50 rounded-lg"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-300">Batch / Lot Number</Label>
                        <Input
                          value={formData.batchNumber} onChange={(e) => setFormData(prev => ({ ...prev, batchNumber: e.target.value }))}
                          placeholder="e.g. BATCH-2024A" className="bg-zinc-900/50 border-zinc-800 focus:border-[#e78a53]/50 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-zinc-800/80">
                      <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-zinc-400 hover:text-white rounded-lg">Cancel</Button>
                      <Button type="submit" disabled={isLoading} className="bg-[#e78a53] hover:bg-[#d97740] text-white rounded-lg px-8">
                        <Save className="h-4 w-4 mr-2" />
                        {isLoading ? "Saving..." : (editingItem ? "Save Changes" : "Register Item")}
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

        <div className="p-8 max-w-[1600px] mx-auto">
          {/* Premium Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-md hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl shadow-inner">
                    <Package className="h-6 w-6 text-blue-400" />
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
                    <p className="text-3xl font-black text-white tracking-tight">{stats.good}</p>
                    <p className="text-zinc-500 font-medium text-sm uppercase tracking-wider">Good Stock</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-md hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl shadow-inner">
                    <AlertTriangle className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-white tracking-tight">{stats.low}</p>
                    <p className="text-zinc-500 font-medium text-sm uppercase tracking-wider">Low Stock</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-md hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl shadow-inner">
                    <AlertCircle className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-white tracking-tight">{stats.critical + stats.outOfStock}</p>
                    <p className="text-zinc-500 font-medium text-sm uppercase tracking-wider">Critical / Out</p>
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
                    <p className="text-3xl font-black text-white tracking-tight">₹{Math.round(stats.totalValue).toLocaleString()}</p>
                    <p className="text-zinc-500 font-medium text-sm uppercase tracking-wider">Total Value</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Restock Dialog */}
          <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
            <DialogContent className="bg-zinc-950 border border-zinc-800 text-white max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <Truck className="h-5 w-5 text-[#e78a53]" /> Restock Delivery
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRestock} className="space-y-6 mt-4">
                <div className="space-y-4">
                  <div className="p-5 bg-zinc-900/50 border border-zinc-800/60 rounded-xl">
                    <h4 className="text-lg font-bold text-white mb-3">{restockingItem?.name}</h4>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-zinc-400 text-sm">Current Stock:</span>
                      <span className="text-white font-mono bg-zinc-800 px-2 py-0.5 rounded">
                        {restockingItem?.currentStock} {restockingItem?.unit}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-sm">Maximum Capacity:</span>
                      <span className="text-zinc-300 font-mono">
                        {restockingItem?.maximumStock} {restockingItem?.unit}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-300">Quantity Received *</Label>
                    <div className="relative">
                      <Input
                        type="number" step="0.01" value={restockData.quantity}
                        onChange={(e) => setRestockData(prev => ({ ...prev, quantity: e.target.value }))}
                        placeholder={`e.g. 50`} className="pr-16 bg-zinc-900/50 border-zinc-800 focus:border-[#e78a53]/50 rounded-lg text-lg font-semibold" required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium uppercase text-xs">{restockingItem?.unit}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Cost per Unit (₹)</Label>
                      <Input
                        type="number" step="0.01" value={restockData.costPerUnit}
                        onChange={(e) => setRestockData(prev => ({ ...prev, costPerUnit: e.target.value }))}
                        placeholder="Update if changed" className="bg-zinc-900/50 border-zinc-800 focus:border-[#e78a53]/50 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300">New Expiry Date</Label>
                      <Input
                        type="date" value={restockData.expiryDate}
                        onChange={(e) => setRestockData(prev => ({ ...prev, expiryDate: e.target.value }))}
                        className="bg-zinc-900/50 border-zinc-800 focus:border-[#e78a53]/50 rounded-lg"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Batch / Invoice Number</Label>
                    <Input
                      value={restockData.batchNumber}
                      onChange={(e) => setRestockData(prev => ({ ...prev, batchNumber: e.target.value }))}
                      placeholder="Enter new batch number" className="bg-zinc-900/50 border-zinc-800 focus:border-[#e78a53]/50 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-zinc-800/80">
                  <Button type="button" variant="ghost" onClick={() => setIsRestockDialogOpen(false)} className="flex-1 text-zinc-400 hover:text-white rounded-lg">Cancel</Button>
                  <Button type="submit" disabled={isLoading} className="flex-1 bg-[#e78a53] hover:bg-[#d97740] text-white rounded-lg">
                    <RefreshCw className="h-4 w-4 mr-2" /> {isLoading ? "Processing..." : "Confirm Delivery"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Inventory Ledger <span className="text-zinc-500 text-lg ml-2 font-normal">({filteredItems.length} records)</span>
            </h2>
            {stockItems.length === 0 && (
              <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white rounded-xl bg-zinc-900/50" onClick={handleLoadSampleData}>
                <Database className="h-4 w-4 mr-2" /> Load Demo Inventory
              </Button>
            )}
          </div>

          {/* Stock Table */}
          {isLoading && filteredItems.length === 0 ? (
            <Card className="bg-zinc-900/30 border-dashed border-zinc-800">
              <CardContent className="p-20 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-zinc-800 border-t-[#e78a53] mb-6"></div>
                <h3 className="text-xl font-semibold text-zinc-300">Syncing Inventory...</h3>
              </CardContent>
            </Card>
          ) : filteredItems.length === 0 ? (
            <Card className="bg-zinc-900/30 border-dashed border-zinc-800">
              <CardContent className="p-20 text-center">
                <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <PackageX className="h-10 w-10 text-zinc-600" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No stock records found</h3>
                <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                  {stockItems.length === 0 
                    ? "Your storeroom is empty. Register your first ingredient to start tracking."
                    : "No items match your current filter or search term."
                  }
                </p>
                <Button className="bg-[#e78a53] hover:bg-[#d97740] rounded-xl px-6" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" /> Add First Item
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-950/50 border-b border-zinc-800/80">
                      <th className="text-left py-4 px-6 text-zinc-400 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Ingredient</th>
                      <th className="text-left py-4 px-6 text-zinc-400 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Category</th>
                      <th className="text-left py-4 px-6 text-zinc-400 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Current Stock</th>
                      <th className="text-left py-4 px-6 text-zinc-400 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Health Status</th>
                      <th className="text-left py-4 px-6 text-zinc-400 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Total Value</th>
                      <th className="text-left py-4 px-6 text-zinc-400 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Logistics</th>
                      <th className="text-right py-4 px-6 text-zinc-400 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {filteredItems.map((item) => (
                      <tr key={item._id} className="hover:bg-zinc-800/30 transition-colors group">
                        <td className="py-4 px-6">
                          <div>
                            <p className="text-zinc-100 font-bold text-base mb-1">{item.name}</p>
                            <div className="flex items-center gap-3">
                              {item.location && (
                                <p className="text-zinc-500 text-xs flex items-center gap-1 font-medium bg-zinc-800/50 px-2 py-0.5 rounded border border-zinc-700/50">
                                  <MapPin className="h-3 w-3" /> {item.location}
                                </p>
                              )}
                              {item.batchNumber && (
                                <p className="text-zinc-500 text-xs font-mono">Lot: {item.batchNumber}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant="outline" className="bg-zinc-800/50 border-zinc-700 text-zinc-300 font-medium">
                            {item.category}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <div className="flex items-baseline gap-1 mb-1">
                              <span className="text-white font-black text-lg">{item.currentStock}</span>
                              <span className="text-zinc-500 text-xs uppercase font-bold tracking-widest">{item.unit}</span>
                            </div>
                            <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden flex">
                               <div 
                                className={`h-full ${item.status === 'good' ? 'bg-emerald-500' : item.status === 'low' ? 'bg-amber-500' : 'bg-red-500'}`} 
                                style={{ width: `${Math.min(100, Math.max(0, (item.currentStock / item.maximumStock) * 100))}%` }}
                               />
                            </div>
                            <p className="text-zinc-500 text-[10px] mt-1 font-medium uppercase tracking-wider flex justify-between">
                              <span>Min: {item.minimumStock}</span>
                              <span>Max: {item.maximumStock}</span>
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge className={`${getStatusColor(item.status)} border px-2.5 py-1 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit`}>
                            {getStatusIcon(item.status)}
                            {item.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="text-[#e78a53] font-bold text-lg mb-0.5">
                              ₹{Math.round(item.currentStock * item.costPerUnit).toLocaleString()}
                            </p>
                            <p className="text-zinc-500 text-xs font-medium">
                              ₹{item.costPerUnit} / {item.unit}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <p className="text-zinc-300 font-medium text-sm flex items-center gap-2">
                              <Truck className="h-3.5 w-3.5 text-zinc-500" /> 
                              <span className="truncate max-w-[120px]">{item.supplier || 'No Supplier'}</span>
                            </p>
                            {item.expiryDate && (
                              <p className={`text-xs font-medium flex items-center gap-2 ${new Date(item.expiryDate) < new Date() ? 'text-red-400' : 'text-zinc-500'}`}>
                                <Calendar className="h-3.5 w-3.5" /> 
                                Exp: {new Date(item.expiryDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button size="sm" className="bg-[#e78a53] hover:bg-[#d97740] shadow-md shadow-[#e78a53]/20 h-8 text-xs font-semibold px-3" onClick={() => openRestockDialog(item)} disabled={isLoading}>
                              <RefreshCw className="h-3 w-3 mr-1.5" /> Restock
                            </Button>
                            <Button size="icon" variant="outline" className="h-8 w-8 bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800" onClick={() => openEditDialog(item)} disabled={isLoading}>
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="outline" className="h-8 w-8 bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50" onClick={() => deleteItem(item._id)} disabled={isLoading}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}