"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StudentSidebar } from "@/components/student-sidebar"
import {
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Building,
  Users,
  Star,
  ExternalLink,
  Search,
  Filter,
  Send,
  BookmarkPlus,
  TrendingUp,
  Mail,
  Phone,
  Globe,
  AlertCircle,
  Upload,
  FileText,
  CheckCircle,
  Loader2,
  X
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useEffect, useState } from "react"

interface Internship {
  _id: string
  title: string
  company: string
  description: string
  requirements: string[]
  responsibilities: string[]
  skills: string[]
  location: string
  locationType: 'onsite' | 'remote' | 'hybrid'
  duration: string
  stipend?: string
  applicationDeadline: string
  startDate?: string
  endDate?: string
  contactEmail: string
  contactPhone?: string
  companyWebsite?: string
  applicationUrl?: string
  status: 'active' | 'closed' | 'draft'
  category?: 'engineering' | 'design' | 'marketing' | 'sales' | 'hr' | 'finance' | 'other'
  experienceLevel: 'fresher' | 'experienced'
  isRemote: boolean
  applicationCount: number
  createdAt: string
  updatedAt: string
}

const mockInternships: Internship[] = [
  { _id:"mi1", title:"Software Engineering Intern", company:"TechCorp India", description:"Work on scalable backend systems using Node.js and AWS. Opportunity to work with senior engineers.", requirements:["B.Tech CS/IT","CGPA ≥ 7.0"], responsibilities:["Build REST APIs","Write unit tests","Code reviews"], skills:["Node.js","AWS","MongoDB"], location:"Mumbai", locationType:"hybrid", duration:"6 months", stipend:"₹25,000/mo", applicationDeadline: new Date(Date.now()+12*86400000).toISOString(), contactEmail:"hr@techcorp.in", status:"active", category:"engineering", experienceLevel:"fresher", isRemote:false, applicationCount:34, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() },
  { _id:"mi2", title:"Frontend Developer Intern", company:"DesignHub", description:"Create pixel-perfect UI using React and Tailwind CSS for SaaS products.", requirements:["Any CS background","Portfolio preferred"], responsibilities:["Implement UI designs","Optimize performance"], skills:["React","TypeScript","Tailwind CSS"], location:"Remote", locationType:"remote", duration:"3 months", stipend:"₹15,000/mo", applicationDeadline: new Date(Date.now()+5*86400000).toISOString(), contactEmail:"careers@designhub.io", status:"active", category:"engineering", experienceLevel:"fresher", isRemote:true, applicationCount:61, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() },
  { _id:"mi3", title:"Data Science Intern", company:"DataMinds Analytics", description:"Analyse large datasets and build ML models to predict customer churn.", requirements:["Python proficiency","Statistics fundamentals"], responsibilities:["Data cleaning","Model training","Dashboard creation"], skills:["Python","Pandas","Scikit-learn","SQL"], location:"Pune", locationType:"onsite", duration:"4 months", stipend:"₹20,000/mo", applicationDeadline: new Date(Date.now()+20*86400000).toISOString(), contactEmail:"intern@dataminds.co", status:"active", category:"engineering", experienceLevel:"fresher", isRemote:false, applicationCount:28, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() },
  { _id:"mi4", title:"UI/UX Design Intern", company:"CreativeStudio", description:"Design user-centered experiences for mobile and web products. Collaborate with product managers.", requirements:["Figma expertise","Portfolio required"], responsibilities:["Wireframes","Prototypes","User research"], skills:["Figma","Adobe XD","User Research"], location:"Bangalore", locationType:"hybrid", duration:"3 months", stipend:"₹18,000/mo", applicationDeadline: new Date(Date.now()+8*86400000).toISOString(), contactEmail:"design@creativestudio.in", status:"active", category:"design", experienceLevel:"fresher", isRemote:false, applicationCount:47, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() },
  { _id:"mi5", title:"Digital Marketing Intern", company:"GrowFast Startup", description:"Run and optimise social media campaigns, SEO, and paid ads to grow brand awareness.", requirements:["Any background","Social media savvy"], responsibilities:["Content creation","Ad campaigns","Analytics reporting"], skills:["Google Ads","SEO","Content Writing","Analytics"], location:"Remote", locationType:"remote", duration:"2 months", stipend:"₹10,000/mo", applicationDeadline: new Date(Date.now()+30*86400000).toISOString(), contactEmail:"marketing@growfast.co", status:"active", category:"marketing", experienceLevel:"fresher", isRemote:true, applicationCount:52, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() },
]

export default function StudentInternshipsPage() {
  const [internships, setInternships] = useState<Internship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedLocationType, setSelectedLocationType] = useState('All')
  const [stats, setStats] = useState({ totalActive: 0, totalRemote: 0, totalApplications: 0, closingSoon: 0 })
  
  // Application modal states
  const [applicationModalOpen, setApplicationModalOpen] = useState(false)
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [applicationLoading, setApplicationLoading] = useState(false)
  const [applicationError, setApplicationError] = useState<string | null>(null)
  const [applicationSuccess, setApplicationSuccess] = useState(false)
  const [appliedInternships, setAppliedInternships] = useState<Set<string>>(new Set())
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    // Load current user
    try {
      const user = localStorage.getItem('currentUser')
      if (user) {
        const userData = JSON.parse(user)
        setCurrentUser(userData)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
    
    fetchInternships()
    
    // Set up real-time polling to fetch new data every 30 seconds
    const interval = setInterval(() => {
      fetchInternships()
    }, 30000) // 30 seconds
    
    return () => clearInterval(interval)
  }, [])
  
  useEffect(() => {
    if (currentUser) {
      fetchUserApplications()
    }
  }, [currentUser])

  const fetchInternships = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/student/internships?limit=100')
      if (!response.ok) {
        throw new Error('Failed to fetch internships')
      }
      const data = await response.json()
      setInternships(data.internships || [])
      setStats(data.stats || { totalActive: 0, totalRemote: 0, totalApplications: 0, closingSoon: 0 })
    } catch (error) {
      console.error('Error fetching internships:', error)
      setInternships(mockInternships)
      setStats({ totalActive: mockInternships.length, totalRemote: 2, totalApplications: 87, closingSoon: 2 })
    } finally {
      setLoading(false)
    }
  }
  
  const fetchUserApplications = async () => {
    if (!currentUser) return
    
    try {
      const response = await fetch(`/api/student/internships/apply?studentId=${currentUser._id || currentUser.id}`)
      if (response.ok) {
        const data = await response.json()
        const appliedIds = new Set<string>(data.applications.map((app: any) => app.internshipId._id))
        setAppliedInternships(appliedIds)
      }
    } catch (error) {
      console.error('Error fetching user applications:', error)
    }
  }
  
  const openApplicationModal = (internship: Internship) => {
    setSelectedInternship(internship)
    setApplicationModalOpen(true)
    setApplicationError(null)
    setApplicationSuccess(false)
    setCoverLetter('')
    setResumeFile(null)
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        setApplicationError('Please upload a PDF or DOC/DOCX file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setApplicationError('File size should not exceed 5MB')
        return
      }
      
      setResumeFile(file)
      setApplicationError(null)
    }
  }
  
  const submitApplication = async () => {
    if (!selectedInternship || !resumeFile) {
      setApplicationError('Please upload a resume')
      return
    }
    
    // Get current user from localStorage
    const userStr = localStorage.getItem('currentUser')
    if (!userStr) {
      setApplicationError('Please login to apply for internships')
      return
    }
    
    let userData
    try {
      userData = JSON.parse(userStr)
    } catch (error) {
      setApplicationError('Session error. Please login again.')
      return
    }
    
    setApplicationLoading(true)
    setApplicationError(null)
    
    try {
      const formData = new FormData()
      formData.append('internshipId', selectedInternship._id)
      formData.append('studentId', userData._id || userData.id)
      formData.append('resume', resumeFile)
      formData.append('coverLetter', coverLetter)
      
      const response = await fetch('/api/student/internships/apply', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application')
      }
      
      setApplicationSuccess(true)
      setAppliedInternships(prev => new Set([...prev, selectedInternship._id]))
      
      // Update internship count locally
      setInternships(prev => prev.map(internship => 
        internship._id === selectedInternship._id 
          ? { ...internship, applicationCount: internship.applicationCount + 1 }
          : internship
      ))
      
      setTimeout(() => {
        setApplicationModalOpen(false)
        setApplicationSuccess(false)
      }, 2000)
      
    } catch (error: any) {
      setApplicationError(error.message || 'Failed to submit application')
    } finally {
      setApplicationLoading(false)
    }
  }

  const filteredInternships = internships.filter(internship => {
    const matchesSearch = internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         internship.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         internship.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         internship.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || internship.category === selectedCategory.toLowerCase()
    const matchesLocationType = selectedLocationType === 'All' || internship.locationType === selectedLocationType.toLowerCase()
    return matchesSearch && matchesCategory && matchesLocationType
  })


  const getLocationTypeColor = (locationType: string) => {
    const colors = {
      remote: "bg-green-500/10 border-green-500/30 text-green-400",
      onsite: "bg-blue-500/10 border-blue-500/30 text-blue-400",
      hybrid: "bg-purple-500/10 border-purple-500/30 text-purple-400"
    }
    return colors[locationType as keyof typeof colors] || "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      engineering: "bg-blue-500/10 border-blue-500/30 text-blue-400",
      design: "bg-pink-500/10 border-pink-500/30 text-pink-400",
      marketing: "bg-orange-500/10 border-orange-500/30 text-orange-400",
      sales: "bg-green-500/10 border-green-500/30 text-green-400",
      hr: "bg-purple-500/10 border-purple-500/30 text-purple-400",
      finance: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
      other: "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
    }
    return colors[category as keyof typeof colors] || "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isDeadlineNear = (deadline: string) => {
    const deadlineDate = new Date(deadline)
    const now = new Date()
    const diffTime = deadlineDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 3 && diffDays >= 0
  }

  return (
    <div className="min-h-screen bg-black flex">
      <StudentSidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Internship Portal</h1>
                <p className="text-zinc-400">Discover and apply for amazing internship opportunities</p>
              </div>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                  <Input 
                    placeholder="Search internships..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-400"
                  />
                </div>
                <Button onClick={fetchInternships} variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white" disabled={loading}>
                  <Clock className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Refreshing...' : 'Refresh'}
                </Button>
                <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
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
                    <Briefcase className="h-6 w-6 text-[#e78a53]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{loading ? '--' : stats.totalActive}</p>
                    <p className="text-zinc-400 text-sm">Total Opportunities</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                    <MapPin className="h-6 w-6 text-[#e78a53]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{loading ? '--' : stats.totalRemote}</p>
                    <p className="text-zinc-400 text-sm">Remote Opportunities</p>
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
                    <p className="text-2xl font-bold text-white">{loading ? '--' : stats.totalApplications}</p>
                    <p className="text-zinc-400 text-sm">Total Applications</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-[#e78a53]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{loading ? '--' : stats.closingSoon}</p>
                    <p className="text-zinc-400 text-sm">Closing Soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Categories</h2>
              <div className="flex flex-wrap gap-3">
                {["All", "Engineering", "Design", "Marketing", "Sales", "HR", "Finance", "Other"].map((category) => (
                  <Badge
                    key={category}
                    variant="outline"
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 cursor-pointer transition-colors ${
                      category === selectedCategory
                        ? "bg-[#e78a53]/10 border-[#e78a53]/30 text-[#e78a53]"
                        : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600"
                    }`}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Work Type</h3>
              <div className="flex flex-wrap gap-3">
                {["All", "Remote", "Onsite", "Hybrid"].map((type) => (
                  <Badge
                    key={type}
                    variant="outline"
                    onClick={() => setSelectedLocationType(type)}
                    className={`px-4 py-2 cursor-pointer transition-colors ${
                      type === selectedLocationType
                        ? "bg-[#e78a53]/10 border-[#e78a53]/30 text-[#e78a53]"
                        : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600"
                    }`}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Internship Listings */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e78a53] mx-auto"></div>
              <p className="text-zinc-400 mt-4">Loading internships...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={fetchInternships} variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white">
                Try Again
              </Button>
            </div>
          ) : filteredInternships.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 text-lg">No internships found</p>
              <p className="text-zinc-500 text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {filteredInternships.map((internship) => (
                <Card key={internship._id} className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900/70 transition-all">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex gap-2">
                        <Badge className={getLocationTypeColor(internship.locationType)}>
                          {internship.locationType.charAt(0).toUpperCase() + internship.locationType.slice(1)}
                        </Badge>
                        {internship.category && (
                          <Badge className={getCategoryColor(internship.category)}>
                            {internship.category.charAt(0).toUpperCase() + internship.category.slice(1)}
                          </Badge>
                        )}
                        {isDeadlineNear(internship.applicationDeadline) && (
                          <Badge className="bg-red-500/10 border-red-500/30 text-red-400">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Closing Soon
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <CardTitle className="text-white text-lg mb-2">{internship.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-zinc-400 mb-3">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {internship.company}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {internship.location}
                      </div>
                    </div>
                    
                    <p className="text-zinc-400 text-sm line-clamp-3 mb-3">
                      {internship.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Duration</span>
                        <span className="text-zinc-300">{internship.duration}</span>
                      </div>
                      {internship.stipend && (
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Stipend</span>
                          <span className="text-[#e78a53] font-semibold">{internship.stipend}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Deadline</span>
                        <span className={`text-sm ${isDeadlineNear(internship.applicationDeadline) ? 'text-red-400 font-semibold' : 'text-zinc-300'}`}>
                          {formatDate(internship.applicationDeadline)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Applicants</span>
                        <div className="flex items-center gap-1 text-zinc-300">
                          <Users className="h-3 w-3" />
                          {internship.applicationCount}
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Experience</span>
                        <span className="text-zinc-300 capitalize">{internship.experienceLevel}</span>
                      </div>
                    </div>

                    {internship.requirements && internship.requirements.length > 0 && (
                      <div className="mb-4">
                        <span className="text-zinc-400 text-sm mb-2 block">Requirements</span>
                        <div className="flex flex-wrap gap-1">
                          {internship.requirements.slice(0, 4).map((req) => (
                            <Badge key={req} variant="outline" className="border-zinc-700 text-zinc-400 text-xs">
                              {req}
                            </Badge>
                          ))}
                          {internship.requirements.length > 4 && (
                            <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs">
                              +{internship.requirements.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {internship.skills && internship.skills.length > 0 && (
                      <div className="mb-4">
                        <span className="text-zinc-400 text-sm mb-2 block">Skills</span>
                        <div className="flex flex-wrap gap-1">
                          {internship.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="secondary" className="bg-zinc-800/50 text-zinc-400 text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {internship.skills.length > 3 && (
                            <Badge variant="secondary" className="bg-zinc-800/50 text-zinc-400 text-xs">
                              +{internship.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 mb-4 text-xs text-zinc-400">
                      {internship.contactEmail && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{internship.contactEmail}</span>
                        </div>
                      )}
                      {internship.companyWebsite && (
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          <span>Website</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {appliedInternships.has(internship._id) ? (
                        <Button 
                          className="flex-1 bg-green-600 hover:bg-green-700 cursor-not-allowed"
                          disabled
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Already Applied
                        </Button>
                      ) : (
                        <Button 
                          className="flex-1 bg-[#e78a53] hover:bg-[#e78a53]/90"
                          disabled={new Date(internship.applicationDeadline) < new Date()}
                          onClick={() => openApplicationModal(internship)}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {new Date(internship.applicationDeadline) < new Date() ? 'Expired' : 'Apply Now'}
                        </Button>
                      )}
                      <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white">
                        <BookmarkPlus className="h-4 w-4" />
                      </Button>
                      {internship.applicationUrl || internship.companyWebsite ? (
                        <Button 
                          variant="outline" 
                          className="border-zinc-700 text-zinc-400 hover:text-white"
                          onClick={() => window.open(internship.applicationUrl || internship.companyWebsite, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Application Tips */}
          <Card className="bg-zinc-900/50 border-zinc-800 max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white text-center">Application Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-[#e78a53]/10 border border-[#e78a53]/30 rounded-lg">
                  <h4 className="text-[#e78a53] font-medium mb-2">Resume Optimization</h4>
                  <p className="text-zinc-300 text-sm">Tailor your resume for each application. Highlight relevant skills and projects that match the requirements.</p>
                </div>
                
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <h4 className="text-blue-400 font-medium mb-2">Portfolio Matters</h4>
                  <p className="text-zinc-300 text-sm">Showcase your best work with live demos, detailed case studies, and quantifiable results.</p>
                </div>
                
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <h4 className="text-green-400 font-medium mb-2">Apply Early</h4>
                  <p className="text-zinc-300 text-sm">Don't wait until the deadline. Early applications often get more attention from recruiters.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* Application Modal */}
      <Dialog open={applicationModalOpen} onOpenChange={setApplicationModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-[#e78a53]" />
              Apply for Internship
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Submit your application for {selectedInternship?.title} at {selectedInternship?.company}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {applicationSuccess ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Application Submitted!</h3>
                <p className="text-zinc-400">Your application has been successfully submitted.</p>
              </div>
            ) : (
              <>
                {applicationError && (
                  <Alert className="border-red-500/30 bg-red-500/10">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-400">
                      {applicationError}
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Resume Upload */}
                <div>
                  <Label className="text-zinc-300 mb-2 block">Resume *</Label>
                  <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center">
                    {resumeFile ? (
                      <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-[#e78a53]" />
                          <div className="text-left">
                            <p className="text-white font-medium">{resumeFile.name}</p>
                            <p className="text-zinc-400 text-sm">
                              {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setResumeFile(null)}
                          className="text-zinc-400 hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-zinc-500 mx-auto mb-3" />
                        <p className="text-zinc-400 mb-2">Upload your resume</p>
                        <p className="text-zinc-500 text-sm mb-4">PDF or DOC/DOCX (Max 5MB)</p>
                        <input
                          type="file"
                          id="resume-upload"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label htmlFor="resume-upload">
                          <Button
                            variant="outline"
                            className="border-zinc-700 text-zinc-400 hover:text-white"
                            asChild
                          >
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              Choose File
                            </span>
                          </Button>
                        </label>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Cover Letter */}
                <div>
                  <Label className="text-zinc-300 mb-2 block">Cover Letter (Optional)</Label>
                  <Textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Write a brief cover letter explaining why you're interested in this position..."
                    className="bg-zinc-800/50 border-zinc-700 text-white min-h-[150px]"
                  />
                  <p className="text-zinc-500 text-sm mt-1">
                    {coverLetter.length}/1000 characters
                  </p>
                </div>
                
                {/* Internship Details Summary */}
                {selectedInternship && (
                  <div className="bg-zinc-800/30 rounded-lg p-4 space-y-2">
                    <h4 className="text-white font-semibold">Application Summary</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-zinc-400">Position</p>
                        <p className="text-white">{selectedInternship.title}</p>
                      </div>
                      <div>
                        <p className="text-zinc-400">Company</p>
                        <p className="text-white">{selectedInternship.company}</p>
                      </div>
                      <div>
                        <p className="text-zinc-400">Location</p>
                        <p className="text-white">{selectedInternship.location}</p>
                      </div>
                      <div>
                        <p className="text-zinc-400">Duration</p>
                        <p className="text-white">{selectedInternship.duration}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setApplicationModalOpen(false)}
                    disabled={applicationLoading}
                    className="border-zinc-700 text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={submitApplication}
                    disabled={!resumeFile || applicationLoading}
                    className="bg-[#e78a53] hover:bg-[#e78a53]/90"
                  >
                    {applicationLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
