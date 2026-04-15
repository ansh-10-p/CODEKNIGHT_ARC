"use client"

import React, { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { 
  BookOpen,
  Laptop,
  Building2,
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Loader2,
  AlertCircle,
  Eye,
  MapPin,
  Users,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  Package,
  Camera,
  Upload,
  X
} from "lucide-react"
import { redirectIfNotAuthenticatedAdmin } from '@/lib/auth-middleware'

interface Resource {
  _id: string
  name: string
  description: string
  category: 'book' | 'equipment' | 'facility'
  
  // Common fields
  location: string
  isAvailable: boolean
  condition: 'excellent' | 'good' | 'fair' | 'damaged'
  status: 'active' | 'maintenance' | 'retired'
  tags: string[]
  image?: string
  
  // For Books
  isbn?: string
  author?: string
  publisher?: string
  edition?: string
  totalCopies?: number
  availableCopies?: number
  
  // For Equipment
  serialNumber?: string
  model?: string
  brand?: string
  specifications?: string
  
  // For Facilities (Seminar Halls)
  capacity?: number
  amenities?: string[]
  operatingHours?: {
    start: string
    end: string
  }
  
  // Booking/Borrowing info
  maxBorrowDuration?: number // in days
  requiresApproval: boolean
  currentBorrower?: string
  dueDate?: string
  totalBorrows: number
  
  createdAt: string
  updatedAt: string
}

export default function AdminResourcesPage() {
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [filteredResources, setFilteredResources] = useState<Resource[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  
  // Image handling
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    location: '',
    condition: 'good',
    isAvailable: true,
    status: 'active',
    requiresApproval: false,
    maxBorrowDuration: '',
    tags: '',
    
    // Book fields
    isbn: '',
    author: '',
    publisher: '',
    edition: '',
    totalCopies: '',
    
    // Equipment fields
    serialNumber: '',
    model: '',
    brand: '',
    specifications: '',
    
    // Facility fields
    capacity: '',
    amenities: '',
    operatingHours: { start: '09:00', end: '17:00' }
  })

  useEffect(() => {
    if (!redirectIfNotAuthenticatedAdmin()) {
      return
    }
    
    loadResources()
    setIsPageLoading(false)
  }, [])

  useEffect(() => {
    filterResources()
  }, [resources, searchQuery, statusFilter, categoryFilter])

  const loadResources = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/resources')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load resources')
      }

      setResources(data.resources || [])
    } catch (error: any) {
      setError(error.message || 'Failed to load resources')
    } finally {
      setIsLoading(false)
    }
  }

  const filterResources = () => {
    let filtered = resources

    if (searchQuery) {
      filtered = filtered.filter(resource =>
        resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (resource.author && resource.author.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(resource => resource.status === statusFilter)
    }

    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter(resource => resource.category === categoryFilter)
    }

    setFilteredResources(filtered)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const openModal = (resource?: Resource) => {
    if (resource) {
      setEditingResource(resource)
      setFormData({
        name: resource.name,
        description: resource.description,
        category: resource.category,
        location: resource.location,
        condition: resource.condition,
        isAvailable: resource.isAvailable,
        status: resource.status,
        requiresApproval: resource.requiresApproval,
        maxBorrowDuration: resource.maxBorrowDuration?.toString() || '',
        tags: resource.tags.join(', '),
        
        // Book fields
        isbn: resource.isbn || '',
        author: resource.author || '',
        publisher: resource.publisher || '',
        edition: resource.edition || '',
        totalCopies: resource.totalCopies?.toString() || '',
        
        // Equipment fields
        serialNumber: resource.serialNumber || '',
        model: resource.model || '',
        brand: resource.brand || '',
        specifications: resource.specifications || '',
        
        // Facility fields
        capacity: resource.capacity?.toString() || '',
        amenities: resource.amenities?.join(', ') || '',
        operatingHours: resource.operatingHours || { start: '09:00', end: '17:00' }
      })
      setImagePreview(resource.image || null)
    } else {
      setEditingResource(null)
      setImagePreview(null)
      setImageFile(null)
      setFormData({
        name: '',
        description: '',
        category: '',
        location: '',
        condition: 'good',
        isAvailable: true,
        status: 'active',
        requiresApproval: false,
        maxBorrowDuration: '',
        tags: '',
        
        // Book fields
        isbn: '',
        author: '',
        publisher: '',
        edition: '',
        totalCopies: '',
        
        // Equipment fields
        serialNumber: '',
        model: '',
        brand: '',
        specifications: '',
        
        // Facility fields
        capacity: '',
        amenities: '',
        operatingHours: { start: '09:00', end: '17:00' }
      })
    }
    setModalOpen(true)
    setError(null)
  }

  const saveResource = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const resourceData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        condition: formData.condition,
        isAvailable: formData.isAvailable,
        status: formData.status,
        requiresApproval: formData.requiresApproval,
        maxBorrowDuration: formData.maxBorrowDuration ? parseInt(formData.maxBorrowDuration) : null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        image: imagePreview,
        
        // Category-specific fields
        ...(formData.category === 'book' && {
          isbn: formData.isbn,
          author: formData.author,
          publisher: formData.publisher,
          edition: formData.edition,
          totalCopies: formData.totalCopies ? parseInt(formData.totalCopies) : null,
          availableCopies: formData.totalCopies ? parseInt(formData.totalCopies) : null // Initially all copies available
        }),
        
        ...(formData.category === 'equipment' && {
          serialNumber: formData.serialNumber,
          model: formData.model,
          brand: formData.brand,
          specifications: formData.specifications
        }),
        
        ...(formData.category === 'facility' && {
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          amenities: formData.amenities ? formData.amenities.split(',').map(a => a.trim()).filter(a => a) : [],
          operatingHours: formData.operatingHours
        }),
        
        // Initialize counters for new resources
        ...(!editingResource && {
          totalBorrows: 0,
          currentBorrower: null,
          dueDate: null
        })
      }

      const url = editingResource ? `/api/admin/resources?id=${editingResource._id}` : '/api/admin/resources'
      const method = editingResource ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resourceData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save resource')
      }

      await loadResources()
      setModalOpen(false)
      alert(editingResource ? 'Resource updated successfully' : 'Resource created successfully')
    } catch (error: any) {
      setError(error.message || 'Failed to save resource')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteResource = async (resourceId: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) {
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/resources?id=${resourceId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete resource')
      }

      await loadResources()
      alert('Resource deleted successfully')
    } catch (error: any) {
      setError(error.message || 'Failed to delete resource')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-500/20 border-green-500/30 text-green-400',
      maintenance: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
      retired: 'bg-red-500/20 border-red-500/30 text-red-400'
    }
    return colors[status as keyof typeof colors] || colors.active
  }

  const getCategoryBadge = (category: string) => {
    const colors = {
      facility: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      equipment: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
      book: 'bg-green-500/20 border-green-500/30 text-green-400',
      other: 'bg-gray-500/20 border-gray-500/30 text-gray-400'
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  const getConditionBadge = (condition: string) => {
    const colors = {
      excellent: 'bg-green-500/20 border-green-500/30 text-green-400',
      good: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      fair: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
      'needs-repair': 'bg-red-500/20 border-red-500/30 text-red-400'
    }
    return colors[condition as keyof typeof colors] || colors.good
  }

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#e78a53] mx-auto mb-4" />
          <p className="text-white">Loading resources...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <header className="bg-zinc-900/50 backdrop-blur-sm border-b border-zinc-800">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">Resource Management</h1>
                <p className="text-zinc-400 mt-2">Manage library books, equipment inventory, and facility bookings for students</p>
              </div>
              <Button onClick={() => openModal()} className="bg-[#e78a53] hover:bg-[#e78a53]/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </div>
            
            {error && (
              <Alert className="mt-4 border-red-500/30 bg-red-500/10">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </header>

        <div className="p-8">
          {/* Filters */}
          <Card className="bg-zinc-900/50 border-zinc-800 mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                  <Input
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-zinc-800/50 border-zinc-700 text-white"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="all">All Resources</SelectItem>
                    <SelectItem value="book">Library Books</SelectItem>
                    <SelectItem value="equipment">Lab Equipment</SelectItem>
                    <SelectItem value="facility">Seminar Halls</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                    setCategoryFilter('all')
                  }}
                  className="border-zinc-700 text-zinc-400"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resources List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#e78a53]" />
              </div>
            ) : filteredResources.length === 0 ? (
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-8 text-center">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-zinc-400" />
                  <p className="text-zinc-400">No resources found</p>
                </CardContent>
              </Card>
            ) : (
              filteredResources.map((resource) => (
                <Card key={resource._id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors group">
                  <CardContent className="p-0">
                    {/* Image Section */}
                    <div className="relative h-56 bg-zinc-800 rounded-t-lg overflow-hidden">
                      {resource.image ? (
                        <img 
                          src={resource.image} 
                          alt={resource.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {resource.category === 'book' && <BookOpen className="h-12 w-12 text-zinc-600" />}
                          {resource.category === 'equipment' && <Laptop className="h-12 w-12 text-zinc-600" />}
                          {resource.category === 'facility' && <Building2 className="h-12 w-12 text-zinc-600" />}
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        {resource.isAvailable ? (
                          <Badge className="bg-green-500/20 border-green-500/30 text-green-400">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Available
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500/20 border-red-500/30 text-red-400">
                            <XCircle className="h-3 w-3 mr-1" />
                            {resource.currentBorrower ? 'Borrowed' : 'Unavailable'}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-zinc-900/80 border-zinc-700 text-zinc-300 hover:text-white"
                            onClick={() => {
                              setSelectedResource(resource)
                              setDetailModalOpen(true)
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-zinc-900/80 border-zinc-700 text-zinc-300 hover:text-white"
                            onClick={() => openModal(resource)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30"
                            onClick={() => deleteResource(resource._id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content Section */}
                    <div className="p-7">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-2xl font-semibold text-white leading-tight pr-2">{resource.name}</h3>
                        <div className="flex gap-2 flex-wrap ml-3">
                          <Badge className={getStatusBadge(resource.status)}>
                            {resource.status}
                          </Badge>
                          <Badge className={getCategoryBadge(resource.category)}>
                            {resource.category === 'book' ? 'Library Book' : 
                             resource.category === 'equipment' ? 'Lab Equipment' : 'Seminar Hall'}
                          </Badge>
                          <Badge className={getConditionBadge(resource.condition)}>
                            {resource.condition}
                          </Badge>
                        </div>
                      </div>
                        
                        <p className="text-zinc-400 mb-5 line-clamp-2 text-base">{resource.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                          <div className="flex items-center gap-2 text-zinc-300">
                            <MapPin className="h-4 w-4" />
                            {resource.location}
                          </div>
                          
                          {resource.category === 'book' && resource.author && (
                            <div className="flex items-center gap-2 text-zinc-300">
                              <BookOpen className="h-4 w-4" />
                              by {resource.author}
                            </div>
                          )}
                          
                          {resource.category === 'book' && resource.totalCopies && (
                            <div className="flex items-center gap-2 text-zinc-300">
                              <Package className="h-4 w-4" />
                              {resource.availableCopies}/{resource.totalCopies} available
                            </div>
                          )}
                          
                          {resource.category === 'equipment' && resource.brand && (
                            <div className="flex items-center gap-2 text-zinc-300">
                              <Laptop className="h-4 w-4" />
                              {resource.brand} {resource.model}
                            </div>
                          )}
                          
                          {resource.category === 'facility' && resource.capacity && (
                            <div className="flex items-center gap-2 text-zinc-300">
                              <Users className="h-4 w-4" />
                              {resource.capacity} capacity
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-zinc-300">
                            <Clock className="h-4 w-4" />
                            {resource.totalBorrows} borrows
                          </div>
                        </div>
                        
                        {resource.currentBorrower && resource.dueDate && (
                          <div className="mt-2">
                            <Badge className="bg-orange-500/20 border-orange-500/30 text-orange-400">
                              <Calendar className="h-3 w-3 mr-1" />
                              Due: {new Date(resource.dueDate).toLocaleDateString()}
                            </Badge>
                          </div>
                        )}
                        
                        {resource.requiresApproval && (
                          <div className="mt-2">
                            <Badge className="bg-blue-500/20 border-blue-500/30 text-blue-400">
                              Requires Approval
                            </Badge>
                          </div>
                        )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Create/Edit Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {editingResource ? (
                  <>
                    <Edit className="h-5 w-5 text-blue-400" />
                    Edit Resource
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 text-[#e78a53]" />
                    Add Resource
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {error && (
                <Alert className="border-red-500/30 bg-red-500/10">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Resource Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                    placeholder={formData.category === 'book' ? 'e.g., Introduction to Computer Science' :
                                formData.category === 'equipment' ? 'e.g., Microscope Model XYZ' :
                                formData.category === 'facility' ? 'e.g., Seminar Hall A1' : 'Resource name'}
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                      <SelectValue placeholder="Select what you're adding" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="book">📚 Library Book</SelectItem>
                      <SelectItem value="equipment">🔬 Lab Equipment</SelectItem>
                      <SelectItem value="facility">🏢 Seminar Hall</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label className="text-zinc-300">Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="bg-zinc-800/50 border-zinc-700 text-white"
                  placeholder={formData.category === 'book' ? 'Brief description of the book content...' :
                              formData.category === 'equipment' ? 'Equipment specifications and usage...' :
                              formData.category === 'facility' ? 'Facility features and suitable events...' : 'Resource description'}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Location *</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                    placeholder={formData.category === 'book' ? 'e.g., Library Section A, Shelf 12' :
                                formData.category === 'equipment' ? 'e.g., Physics Lab, Room 201' :
                                formData.category === 'facility' ? 'e.g., Academic Block, 3rd Floor' : 'Location'}
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">Condition</Label>
                  <Select value={formData.condition} onValueChange={(value) => setFormData({...formData, condition: value})}>
                    <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="damaged">Damaged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Image Upload Section */}
              <div className="space-y-4">
                <Label className="text-zinc-300">Resource Image</Label>
                <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setImagePreview(null)
                          setImageFile(null)
                        }}
                        className="absolute top-2 right-2 bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="py-8">
                      <Camera className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                      <p className="text-zinc-400 mb-2">Upload resource image</p>
                      <p className="text-zinc-500 text-sm">{formData.category === 'book' ? 'Book cover image' : 
                                                             formData.category === 'equipment' ? 'Equipment photo' : 
                                                             formData.category === 'facility' ? 'Hall/room photo' : 'PNG, JPG up to 5MB'}</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button type="button" variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white" asChild>
                      <span className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        {imagePreview ? "Change Image" : "Upload Image"}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
              
              {/* Category-Specific Sections */}
              {formData.category === 'book' && (
                <div className="border-t border-zinc-800 pt-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-[#e78a53]" />
                    Book Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-zinc-300">Author *</Label>
                      <Input
                        value={formData.author}
                        onChange={(e) => setFormData({...formData, author: e.target.value})}
                        className="bg-zinc-800/50 border-zinc-700 text-white"
                        placeholder="Author name"
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-300">Publisher</Label>
                      <Input
                        value={formData.publisher}
                        onChange={(e) => setFormData({...formData, publisher: e.target.value})}
                        className="bg-zinc-800/50 border-zinc-700 text-white"
                        placeholder="Publisher name"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <Label className="text-zinc-300">ISBN</Label>
                      <Input
                        value={formData.isbn}
                        onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                        className="bg-zinc-800/50 border-zinc-700 text-white"
                        placeholder="ISBN number"
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-300">Edition</Label>
                      <Input
                        value={formData.edition}
                        onChange={(e) => setFormData({...formData, edition: e.target.value})}
                        className="bg-zinc-800/50 border-zinc-700 text-white"
                        placeholder="e.g., 3rd Edition"
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-300">Total Copies *</Label>
                      <Input
                        type="number"
                        value={formData.totalCopies}
                        onChange={(e) => setFormData({...formData, totalCopies: e.target.value})}
                        className="bg-zinc-800/50 border-zinc-700 text-white"
                        placeholder="Number of copies"
                        min="1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label className="text-zinc-300">Max Borrow Duration (days)</Label>
                      <Input
                        type="number"
                        value={formData.maxBorrowDuration}
                        onChange={(e) => setFormData({...formData, maxBorrowDuration: e.target.value})}
                        className="bg-zinc-800/50 border-zinc-700 text-white"
                        placeholder="14"
                        min="1"
                      />
                    </div>
                    <div className="flex items-center space-x-2 mt-6">
                      <input
                        type="checkbox"
                        id="requiresApproval"
                        checked={formData.requiresApproval}
                        onChange={(e) => setFormData({...formData, requiresApproval: e.target.checked})}
                        className="rounded border-zinc-700 bg-zinc-800"
                      />
                      <Label htmlFor="requiresApproval" className="text-zinc-300">Requires librarian approval</Label>
                    </div>
                  </div>
                </div>
              )}

              {formData.category === 'equipment' && (
                <div className="border-t border-zinc-800 pt-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Laptop className="h-5 w-5 text-[#e78a53]" />
                    Equipment Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-zinc-300">Brand/Manufacturer</Label>
                      <Input
                        value={formData.brand}
                        onChange={(e) => setFormData({...formData, brand: e.target.value})}
                        className="bg-zinc-800/50 border-zinc-700 text-white"
                        placeholder="e.g., Canon, HP, Dell"
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-300">Model</Label>
                      <Input
                        value={formData.model}
                        onChange={(e) => setFormData({...formData, model: e.target.value})}
                        className="bg-zinc-800/50 border-zinc-700 text-white"
                        placeholder="Model number/name"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label className="text-zinc-300">Serial Number</Label>
                      <Input
                        value={formData.serialNumber}
                        onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                        className="bg-zinc-800/50 border-zinc-700 text-white"
                        placeholder="Unique identifier"
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-300">Max Borrow Duration (days)</Label>
                      <Input
                        type="number"
                        value={formData.maxBorrowDuration}
                        onChange={(e) => setFormData({...formData, maxBorrowDuration: e.target.value})}
                        className="bg-zinc-800/50 border-zinc-700 text-white"
                        placeholder="7"
                        min="1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-zinc-300">Specifications</Label>
                    <Textarea
                      value={formData.specifications}
                      onChange={(e) => setFormData({...formData, specifications: e.target.value})}
                      className="bg-zinc-800/50 border-zinc-700 text-white mt-2"
                      placeholder="Technical specifications, features, requirements..."
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-2 mt-4">
                    <input
                      type="checkbox"
                      id="requiresApproval"
                      checked={formData.requiresApproval}
                      onChange={(e) => setFormData({...formData, requiresApproval: e.target.checked})}
                      className="rounded border-zinc-700 bg-zinc-800"
                    />
                    <Label htmlFor="requiresApproval" className="text-zinc-300">Requires lab instructor approval</Label>
                  </div>
                </div>
              )}

              {formData.category === 'facility' && (
                <div className="border-t border-zinc-800 pt-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-[#e78a53]" />
                    Facility Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-zinc-300">Seating Capacity *</Label>
                      <Input
                        type="number"
                        value={formData.capacity}
                        onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                        className="bg-zinc-800/50 border-zinc-700 text-white"
                        placeholder="Number of seats"
                        min="1"
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-300">Max Booking Duration (hours)</Label>
                      <Input
                        type="number"
                        value={formData.maxBorrowDuration}
                        onChange={(e) => setFormData({...formData, maxBorrowDuration: e.target.value})}
                        className="bg-zinc-800/50 border-zinc-700 text-white"
                        placeholder="4"
                        min="1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label className="text-zinc-300">Operating Hours Start</Label>
                      <Input
                        type="time"
                        value={formData.operatingHours.start}
                        onChange={(e) => setFormData({...formData, operatingHours: {...formData.operatingHours, start: e.target.value}})}
                        className="bg-zinc-800/50 border-zinc-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-300">Operating Hours End</Label>
                      <Input
                        type="time"
                        value={formData.operatingHours.end}
                        onChange={(e) => setFormData({...formData, operatingHours: {...formData.operatingHours, end: e.target.value}})}
                        className="bg-zinc-800/50 border-zinc-700 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-zinc-300">Available Amenities</Label>
                    <Input
                      value={formData.amenities}
                      onChange={(e) => setFormData({...formData, amenities: e.target.value})}
                      className="bg-zinc-800/50 border-zinc-700 text-white mt-2"
                      placeholder="projector, microphone, whiteboard, AC (comma separated)"
                    />
                  </div>
                  <div className="flex items-center space-x-2 mt-4">
                    <input
                      type="checkbox"
                      id="requiresApproval"
                      checked={formData.requiresApproval}
                      onChange={(e) => setFormData({...formData, requiresApproval: e.target.checked})}
                      className="rounded border-zinc-700 bg-zinc-800"
                    />
                    <Label htmlFor="requiresApproval" className="text-zinc-300">Requires admin approval</Label>
                  </div>
                </div>
              )}
              
              {/* Common Fields */}
              <div className="border-t border-zinc-800 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-zinc-300">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                      <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="maintenance">Under Maintenance</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-zinc-300">Tags (comma separated)</Label>
                    <Input
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      className="bg-zinc-800/50 border-zinc-700 text-white"
                      placeholder={formData.category === 'book' ? 'programming, textbook, computer science' :
                                  formData.category === 'equipment' ? 'microscope, biology, lab' :
                                  formData.category === 'facility' ? 'presentation, meeting, seminar' : 'Tags'}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setModalOpen(false)}
                  disabled={isLoading}
                  className="border-zinc-700 text-zinc-400 hover:text-white"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={saveResource}
                  className="bg-[#e78a53] hover:bg-[#e78a53]/90"
                  disabled={isLoading || !formData.name || !formData.description || !formData.category || !formData.location ||
                          (formData.category === 'book' && !formData.author) ||
                          (formData.category === 'book' && !formData.totalCopies) ||
                          (formData.category === 'facility' && !formData.capacity)}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Building2 className="h-4 w-4 mr-2" />
                  )}
                  {isLoading 
                    ? (editingResource ? 'Updating...' : 'Creating...')
                    : (editingResource ? 'Update' : 'Create') + ' Resource'
                  }
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Detail Modal */}
        <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-[#e78a53]" />
                Resource Details
              </DialogTitle>
            </DialogHeader>
            
            {selectedResource && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{selectedResource.name}</h3>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    <Badge className={getStatusBadge(selectedResource.status)}>
                      {selectedResource.status}
                    </Badge>
                    <Badge className={getCategoryBadge(selectedResource.category)}>
                      {selectedResource.category}
                    </Badge>
                    <Badge className={getConditionBadge(selectedResource.condition)}>
                      {selectedResource.condition}
                    </Badge>
                    {selectedResource.isAvailable ? (
                      <Badge className="bg-green-500/20 border-green-500/30 text-green-400">
                        Available
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/20 border-red-500/30 text-red-400">
                        Unavailable
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-zinc-400">Category</p>
                    <p className="text-white">{selectedResource.category === 'book' ? 'Library Book' :
                                              selectedResource.category === 'equipment' ? 'Lab Equipment' : 'Seminar Hall'}</p>
                  </div>
                  <div>
                    <p className="text-zinc-400">Location</p>
                    <p className="text-white">{selectedResource.location}</p>
                  </div>
                  <div>
                    <p className="text-zinc-400">Condition</p>
                    <p className="text-white capitalize">{selectedResource.condition}</p>
                  </div>
                  <div>
                    <p className="text-zinc-400">Total Borrows</p>
                    <p className="text-white">{selectedResource.totalBorrows}</p>
                  </div>
                  
                  {/* Book-specific info */}
                  {selectedResource.category === 'book' && (
                    <>
                      {selectedResource.totalCopies && (
                        <div>
                          <p className="text-zinc-400">Copies</p>
                          <p className="text-white">{selectedResource.availableCopies}/{selectedResource.totalCopies} available</p>
                        </div>
                      )}
                      {selectedResource.isbn && (
                        <div>
                          <p className="text-zinc-400">ISBN</p>
                          <p className="text-white">{selectedResource.isbn}</p>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Equipment-specific info */}
                  {selectedResource.category === 'equipment' && (
                    <>
                      {selectedResource.brand && (
                        <div>
                          <p className="text-zinc-400">Brand</p>
                          <p className="text-white">{selectedResource.brand}</p>
                        </div>
                      )}
                      {selectedResource.serialNumber && (
                        <div>
                          <p className="text-zinc-400">Serial Number</p>
                          <p className="text-white">{selectedResource.serialNumber}</p>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Facility-specific info */}
                  {selectedResource.category === 'facility' && selectedResource.capacity && (
                    <div>
                      <p className="text-zinc-400">Capacity</p>
                      <p className="text-white">{selectedResource.capacity} seats</p>
                    </div>
                  )}
                  
                  {selectedResource.maxBorrowDuration && (
                    <div>
                      <p className="text-zinc-400">Max Duration</p>
                      <p className="text-white">{selectedResource.maxBorrowDuration} {selectedResource.category === 'facility' ? 'hours' : 'days'}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <p className="text-zinc-400 mb-2">Description</p>
                  <p className="text-white">{selectedResource.description}</p>
                </div>

                {/* Current borrower info */}
                {selectedResource.currentBorrower && (
                  <div className="border border-orange-500/30 bg-orange-500/10 rounded-lg p-4">
                    <h5 className="text-orange-400 font-semibold mb-2">Currently Borrowed</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-zinc-400">Borrowed by</p>
                        <p className="text-white">{selectedResource.currentBorrower}</p>
                      </div>
                      {selectedResource.dueDate && (
                        <div>
                          <p className="text-zinc-400">Due date</p>
                          <p className="text-white">{new Date(selectedResource.dueDate).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Category-specific details */}
                {selectedResource.category === 'book' && (
                  <div>
                    {selectedResource.author && (
                      <div className="mb-2">
                        <p className="text-zinc-400">Author</p>
                        <p className="text-white">{selectedResource.author}</p>
                      </div>
                    )}
                    {selectedResource.publisher && (
                      <div className="mb-2">
                        <p className="text-zinc-400">Publisher</p>
                        <p className="text-white">{selectedResource.publisher}</p>
                      </div>
                    )}
                    {selectedResource.edition && (
                      <div className="mb-2">
                        <p className="text-zinc-400">Edition</p>
                        <p className="text-white">{selectedResource.edition}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {selectedResource.category === 'equipment' && (
                  <div>
                    {selectedResource.model && (
                      <div className="mb-2">
                        <p className="text-zinc-400">Model</p>
                        <p className="text-white">{selectedResource.model}</p>
                      </div>
                    )}
                    {selectedResource.specifications && (
                      <div className="mb-2">
                        <p className="text-zinc-400">Specifications</p>
                        <p className="text-white">{selectedResource.specifications}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {selectedResource.category === 'facility' && (
                  <div>
                    {selectedResource.operatingHours && selectedResource.operatingHours.start && (
                      <div className="mb-2">
                        <p className="text-zinc-400">Operating Hours</p>
                        <p className="text-white">{selectedResource.operatingHours.start} - {selectedResource.operatingHours.end}</p>
                      </div>
                    )}
                    {selectedResource.amenities && selectedResource.amenities.length > 0 && (
                      <div className="mb-2">
                        <p className="text-zinc-400">Amenities</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedResource.amenities.map((amenity, index) => (
                            <Badge key={index} className="bg-zinc-700 text-zinc-300">{amenity}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Approval requirement */}
                {selectedResource.requiresApproval && (
                  <div className="border border-blue-500/30 bg-blue-500/10 rounded-lg p-3">
                    <p className="text-blue-400 text-sm">
                      ℹ️ This resource requires approval before borrowing/booking
                    </p>
                  </div>
                )}
                
                {selectedResource.tags && selectedResource.tags.length > 0 && (
                  <div>
                    <p className="text-zinc-400 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedResource.tags.map((tag, index) => (
                        <Badge key={index} className="bg-zinc-700 text-zinc-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
