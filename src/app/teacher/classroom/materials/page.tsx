"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import { UserMenu } from "@/components/user-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import {
    Upload,
    FileText,
    Image,
    Download,
    Edit,
    Trash2,
    RefreshCw,
    ArrowLeft,
    Plus,
    Search,
    Filter,
    Calendar,
    Eye
} from "lucide-react"

interface Material {
    _id: string
    teacherId: string
    classroomId: {
        _id: string
        title: string
        subject: string
    }
    title: string
    description: string
    fileName: string
    fileType: 'pdf' | 'image'
    mimeType: string
    fileSize: number
    formattedFileSize: string
    downloadCount: number
    tags: string[]
    createdAt: string
    updatedAt: string
}

interface Classroom {
    _id: string
    title: string
    subject: string
    inviteCode: string
    studentsCount: number
}

interface UploadForm {
    title: string
    description: string
    tags: string
}

export default function TeacherMaterialsPage() {
    const [materials, setMaterials] = useState<Material[]>([])
    const [classrooms, setClassrooms] = useState<Classroom[]>([])
    const [selectedClassroom, setSelectedClassroom] = useState<string>("")
    const [filterType, setFilterType] = useState<string>("")
    const [searchQuery, setSearchQuery] = useState("")
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [currentUser, setCurrentUser] = useState<any>(null)

    // Dialog states
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    // Form states
    const [uploadForm, setUploadForm] = useState<UploadForm>({
        title: "",
        description: "",
        tags: ""
    })
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [filePreview, setFilePreview] = useState<string>("")
    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
    const [deletingMaterial, setDeletingMaterial] = useState<Material | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

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

    useEffect(() => {
        if (currentUser) {
            fetchMaterials(selectedClassroom, filterType)
        }
    }, [currentUser])

    const fetchMaterials = async (classroomId?: string, fileType?: string) => {
        if (!currentUser) return

        setLoading(true)
        try {
            const params = new URLSearchParams({
                teacherId: currentUser._id || currentUser.id,
            })

            if (classroomId) params.append('classroomId', classroomId)
            if (fileType) params.append('fileType', fileType)

            const response = await fetch(`/api/teacher/materials?${params}`)

            if (response.ok) {
                const data = await response.json()
                setMaterials(data.materials || [])
                setClassrooms(data.classrooms || [])
            } else {
                toast({
                    title: "Error",
                    description: "Failed to fetch materials",
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error('Error fetching materials:', error)
            toast({
                title: "Error",
                description: "Network error. Please try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
            setInitialLoading(false)
        }
    }

    const handleClassroomChange = (classroomId: string) => {
        setSelectedClassroom(classroomId)
        fetchMaterials(classroomId, filterType)
    }

    const handleFilterChange = (fileType: string) => {
        setFilterType(fileType)
        fetchMaterials(selectedClassroom, fileType)
    }

    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = error => reject(error)
        })
    }

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            toast({
                title: "Error",
                description: "Only PDF files and images (JPEG, PNG, GIF, WebP) are allowed",
                variant: "destructive"
            })
            return
        }

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024
        if (file.size > maxSize) {
            toast({
                title: "Error",
                description: "File size must be less than 10MB",
                variant: "destructive"
            })
            return
        }

        setSelectedFile(file)

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const preview = URL.createObjectURL(file)
            setFilePreview(preview)
        } else {
            setFilePreview("")
        }

        // Auto-set title from filename if empty
        if (!uploadForm.title) {
            setUploadForm(prev => ({
                ...prev,
                title: file.name.replace(/\.[^/.]+$/, "") // Remove extension
            }))
        }
    }

    const handleUpload = async () => {
        if (!selectedFile || !selectedClassroom || !uploadForm.title || !uploadForm.description) {
            toast({
                title: "Error",
                description: "Please fill in all required fields and select a file",
                variant: "destructive"
            })
            return
        }

        setLoading(true)
        try {
            const base64Data = await convertFileToBase64(selectedFile)
            const tags = uploadForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)

            const response = await fetch('/api/teacher/materials', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    teacherId: currentUser._id || currentUser.id,
                    classroomId: selectedClassroom,
                    title: uploadForm.title,
                    description: uploadForm.description,
                    fileName: selectedFile.name,
                    mimeType: selectedFile.type,
                    fileData: base64Data,
                    tags
                })
            })

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Material uploaded successfully"
                })
                setIsUploadDialogOpen(false)
                resetUploadForm()
                fetchMaterials(selectedClassroom, filterType)
            } else {
                const error = await response.json()
                toast({
                    title: "Error",
                    description: error.error || "Failed to upload material",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to process file. Please try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (material: Material) => {
        setEditingMaterial(material)
        setUploadForm({
            title: material.title,
            description: material.description,
            tags: material.tags.join(', ')
        })
        setIsEditDialogOpen(true)
    }

    const handleUpdate = async () => {
        if (!editingMaterial || !uploadForm.title || !uploadForm.description) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive"
            })
            return
        }

        setLoading(true)
        try {
            const tags = uploadForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)

            const response = await fetch('/api/teacher/materials', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    materialId: editingMaterial._id,
                    teacherId: currentUser._id || currentUser.id,
                    title: uploadForm.title,
                    description: uploadForm.description,
                    tags
                })
            })

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Material updated successfully"
                })
                setIsEditDialogOpen(false)
                setEditingMaterial(null)
                resetUploadForm()
                fetchMaterials(selectedClassroom, filterType)
            } else {
                const error = await response.json()
                toast({
                    title: "Error",
                    description: error.error || "Failed to update material",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Network error. Please try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deletingMaterial) return

        setLoading(true)
        try {
            const response = await fetch(`/api/teacher/materials?materialId=${deletingMaterial._id}&teacherId=${currentUser._id || currentUser.id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Material deleted successfully"
                })
                setIsDeleteDialogOpen(false)
                setDeletingMaterial(null)
                fetchMaterials(selectedClassroom, filterType)
            } else {
                const error = await response.json()
                toast({
                    title: "Error",
                    description: error.error || "Failed to delete material",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Network error. Please try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async (material: Material) => {
        try {
            const response = await fetch(`/api/teacher/materials/${material._id}/download?teacherId=${currentUser._id || currentUser.id}`)

            if (response.ok) {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = material.fileName
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)

                toast({
                    title: "Success",
                    description: "File downloaded successfully"
                })
            } else {
                toast({
                    title: "Error",
                    description: "Failed to download file",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Network error. Please try again.",
                variant: "destructive"
            })
        }
    }

    const resetUploadForm = () => {
        setUploadForm({
            title: "",
            description: "",
            tags: ""
        })
        setSelectedFile(null)
        setFilePreview("")
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const getFileIcon = (fileType: string) => {
        switch (fileType) {
            case 'pdf':
                return <FileText className="h-8 w-8 text-red-400" />
            case 'image':
                return <Image className="h-8 w-8 text-blue-400" />
            default:
                return <FileText className="h-8 w-8 text-zinc-400" />
        }
    }

    const filteredMaterials = materials.filter(material =>
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    return (
        <div className="min-h-screen bg-black flex">
            <TeacherSidebar />

            <main className="flex-1 overflow-auto">
                <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
                    <div className="px-8 py-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <Link href="/teacher/classroom">
                                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                                        <ArrowLeft className="h-5 w-5" />
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className="text-3xl font-bold text-white mb-2">Materials Management</h1>
                                    <p className="text-zinc-400">Upload and manage PDFs and images for your classrooms</p>
                                </div>
                            </div>
                            <UserMenu />
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {initialLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e78a53] mx-auto"></div>
                            <p className="text-zinc-400 mt-2">Loading...</p>
                        </div>
                    ) : (
                        <>
                            {/* Controls */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                <Card className="bg-zinc-900/50 border-zinc-800">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-white text-sm">Select Classroom</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Select value={selectedClassroom} onValueChange={handleClassroomChange}>
                                            <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                                                <SelectValue placeholder="Select a classroom to manage materials" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-800 border-zinc-700">
                                                {classrooms.map((classroom) => (
                                                    <SelectItem key={classroom._id} value={classroom._id} className="text-white hover:bg-zinc-700">
                                                        {classroom.title} ({classroom.subject})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </CardContent>
                                </Card>

                                <Card className="bg-zinc-900/50 border-zinc-800">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-white text-sm">Filter by Type</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <Select value={filterType} onValueChange={handleFilterChange}>
                                                <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                                                    <SelectValue placeholder="Filter by file type" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-zinc-800 border-zinc-700">
                                                    <SelectItem value="pdf" className="text-white hover:bg-zinc-700">PDFs Only</SelectItem>
                                                    <SelectItem value="image" className="text-white hover:bg-zinc-700">Images Only</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {filterType && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleFilterChange("")}
                                                    className="w-full border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                                                >
                                                    Clear Filter
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-zinc-900/50 border-zinc-800">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-white text-sm">Search</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                            <Input
                                                placeholder="Search materials..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10 bg-zinc-800/50 border-zinc-700 text-white"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Action Buttons */}
                            {selectedClassroom && (
                                <div className="flex flex-wrap gap-4 mb-6">
                                    <Button
                                        onClick={() => setIsUploadDialogOpen(true)}
                                        className="bg-[#e78a53] hover:bg-[#e78a53]/90 text-white"
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload Material
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                        onClick={() => fetchMaterials(selectedClassroom, filterType)}
                                        disabled={loading}
                                    >
                                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                        Refresh
                                    </Button>
                                </div>
                            )}

                            {/* Materials List */}
                            {!selectedClassroom ? (
                                <Card className="bg-zinc-900/50 border-zinc-800">
                                    <CardContent className="p-12">
                                        <div className="text-center">
                                            <Upload className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-white mb-2">Select a Classroom</h3>
                                            <p className="text-zinc-400">
                                                Please select a classroom from the dropdown above to upload and manage materials.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : filteredMaterials.length === 0 ? (
                                <Card className="bg-zinc-900/50 border-zinc-800">
                                    <CardContent className="p-12">
                                        <div className="text-center">
                                            <FileText className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-white mb-2">No Materials Found</h3>
                                            <p className="text-zinc-400 mb-4">
                                                {searchQuery ? 'No materials match your search criteria.' : 'No materials uploaded yet for this classroom.'}
                                            </p>
                                            {!searchQuery && (
                                                <Button
                                                    onClick={() => setIsUploadDialogOpen(true)}
                                                    className="bg-[#e78a53] hover:bg-[#e78a53]/90 text-white"
                                                >
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Upload Your First Material
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredMaterials.map((material) => (
                                        <Card key={material._id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        {getFileIcon(material.fileType)}
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-white font-medium truncate">{material.title}</h3>
                                                            <p className="text-zinc-400 text-sm">{material.fileName}</p>
                                                        </div>
                                                    </div>
                                                    <Badge className={material.fileType === 'pdf' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}>
                                                        {material.fileType.toUpperCase()}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-zinc-300 text-sm mb-4 line-clamp-3">{material.description}</p>

                                                {material.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mb-4">
                                                        {material.tags.map((tag, index) => (
                                                            <Badge key={index} variant="outline" className="text-xs border-zinc-600 text-zinc-400">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between text-xs text-zinc-500 mb-4">
                                                    <span>{material.formattedFileSize}</span>
                                                    <span>{material.downloadCount} downloads</span>
                                                    <span>{new Date(material.createdAt).toLocaleDateString()}</span>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleDownload(material)}
                                                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                                                    >
                                                        <Download className="h-3 w-3 mr-1" />
                                                        Download
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleEdit(material)}
                                                        className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setDeletingMaterial(material)
                                                            setIsDeleteDialogOpen(true)
                                                        }}
                                                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Upload Dialog */}
                <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                    <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-white">Upload Material</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div>
                                <Label className="text-white">File *</Label>
                                <div className="mt-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                                        onChange={handleFileSelect}
                                        className="block w-full text-sm text-zinc-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#e78a53] file:text-white hover:file:bg-[#e78a53]/90"
                                    />
                                    <p className="text-zinc-500 text-xs mt-1">
                                        Supported formats: PDF, JPEG, PNG, GIF, WebP (max 10MB)
                                    </p>
                                </div>

                                {selectedFile && (
                                    <div className="mt-4 p-4 bg-zinc-800/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            {getFileIcon(selectedFile.type.startsWith('image/') ? 'image' : 'pdf')}
                                            <div>
                                                <p className="text-white font-medium">{selectedFile.name}</p>
                                                <p className="text-zinc-400 text-sm">
                                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>

                                        {filePreview && (
                                            <div className="mt-3">
                                                <img
                                                    src={filePreview}
                                                    alt="Preview"
                                                    className="max-h-32 rounded border border-zinc-700"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label className="text-white">Title *</Label>
                                <Input
                                    value={uploadForm.title}
                                    onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                                    className="mt-1 bg-zinc-800/50 border-zinc-700 text-white"
                                    placeholder="Enter material title"
                                />
                            </div>

                            <div>
                                <Label className="text-white">Description *</Label>
                                <Textarea
                                    value={uploadForm.description}
                                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                                    className="mt-1 bg-zinc-800/50 border-zinc-700 text-white resize-none"
                                    placeholder="Describe what this material contains..."
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label className="text-white">Tags (Optional)</Label>
                                <Input
                                    value={uploadForm.tags}
                                    onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                                    className="mt-1 bg-zinc-800/50 border-zinc-700 text-white"
                                    placeholder="Enter tags separated by commas (e.g., math, algebra, chapter1)"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => {
                                setIsUploadDialogOpen(false)
                                resetUploadForm()
                            }}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpload}
                                disabled={loading || !selectedFile}
                                className="bg-[#e78a53] hover:bg-[#e78a53]/90"
                            >
                                {loading ? 'Uploading...' : 'Upload Material'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-white">Edit Material</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div>
                                <Label className="text-white">Title *</Label>
                                <Input
                                    value={uploadForm.title}
                                    onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                                    className="mt-1 bg-zinc-800/50 border-zinc-700 text-white"
                                />
                            </div>

                            <div>
                                <Label className="text-white">Description *</Label>
                                <Textarea
                                    value={uploadForm.description}
                                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                                    className="mt-1 bg-zinc-800/50 border-zinc-700 text-white resize-none"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label className="text-white">Tags</Label>
                                <Input
                                    value={uploadForm.tags}
                                    onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                                    className="mt-1 bg-zinc-800/50 border-zinc-700 text-white"
                                    placeholder="Enter tags separated by commas"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => {
                                setIsEditDialogOpen(false)
                                setEditingMaterial(null)
                                resetUploadForm()
                            }}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpdate}
                                disabled={loading}
                                className="bg-[#e78a53] hover:bg-[#e78a53]/90"
                            >
                                {loading ? 'Updating...' : 'Update Material'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Delete Material</AlertDialogTitle>
                            <AlertDialogDescription className="text-zinc-400">
                                Are you sure you want to delete "{deletingMaterial?.title}"? This action cannot be undone and the file will be permanently removed.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-red-500 hover:bg-red-600 text-white"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </main>
        </div>
    )
}
