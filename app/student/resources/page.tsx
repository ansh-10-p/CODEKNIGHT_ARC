"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StudentSidebar } from "@/components/student-sidebar"
import {
  BookOpen, Download, FileText, Search, Eye,
  Wrench, Building, Calendar, BookMarked, Presentation,
  ClipboardList, User, Printer, Star,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useEffect, useState } from "react"

/* ─── Campus resource (books/equipment/facility) ─── */
interface CampusResource {
  _id: string; name: string; description: string
  category: "book" | "equipment" | "facility"
  location: string; isAvailable: boolean
  condition: "excellent" | "good" | "fair" | "damaged"
  author?: string; brand?: string; totalCopies?: number; availableCopies?: number
  capacity?: number; totalBorrows: number; createdAt: string
}

/* ─── Teacher-posted document ─── */
interface TeacherDoc {
  _id: string; title: string; subject: string; description: string; content: string
  category: "notes" | "slides" | "assignment" | "reference"
  postedByName: string; downloads: number; createdAt: string
}

/* ─── Mock campus resources ─── */
const mockCampus: CampusResource[] = [
  { _id:"cr1", name:"Introduction to Algorithms (3rd Ed.)", description:"CLRS – the definitive textbook on algorithms and data structures.", category:"book", location:"Library — Section A, Row 3", isAvailable:true, condition:"excellent", author:"Cormen, Leiserson, Rivest, Stein", totalCopies:5, availableCopies:3, totalBorrows:128, createdAt:new Date().toISOString() },
  { _id:"cr2", name:"Database System Concepts (7th Ed.)", description:"Silberschatz – covers relational models, SQL, transactions and storage.", category:"book", location:"Library — Section B, Row 1", isAvailable:true, condition:"good", author:"Silberschatz, Korth, Sudarshan", totalCopies:4, availableCopies:2, totalBorrows:95, createdAt:new Date().toISOString() },
  { _id:"cr3", name:"Raspberry Pi 4 Kit", description:"Microcontroller kit with sensors for IoT lab experiments.", category:"equipment", location:"Electronics Lab — Cabinet 2", isAvailable:true, condition:"excellent", brand:"Raspberry Pi Foundation", totalBorrows:37, createdAt:new Date().toISOString() },
  { _id:"cr4", name:"Computer Networks (6th Ed.)", description:"Tanenbaum – covers OSI model, TCP/IP, security and wireless networking.", category:"book", location:"Library — Section C, Row 2", isAvailable:false, condition:"good", author:"Andrew Tanenbaum", totalCopies:3, availableCopies:0, totalBorrows:82, createdAt:new Date().toISOString() },
  { _id:"cr5", name:"Seminar Hall A101", description:"Air-conditioned seminar hall with projector and whiteboard. Seats 60.", category:"facility", location:"Block A — First Floor", isAvailable:true, condition:"excellent", capacity:60, totalBorrows:210, createdAt:new Date().toISOString() },
]

/* ─── Mock teacher-posted documents ─── */
const mockTeacherDocs: TeacherDoc[] = [
  { _id:"td1", title:"Data Structures — Week 8 Notes", subject:"CS301 — Data Structures", description:"Complete notes on AVL Trees, Red-Black Trees, and Graph traversal.", content:`# Data Structures — Week 8\n\n## AVL Trees\nAn AVL tree is a self-balancing BST where the height difference is ≤ 1.\n\n### Rotations\n- Left Rotation (LL)\n- Right Rotation (RR)\n- Left-Right (LR)\n- Right-Left (RL)\n\n## Red-Black Trees\nProperties:\n- Every node is Red or Black\n- Root is Black\n- No two adjacent Red nodes\n- Same Black-node count on all root-to-leaf paths\n\n## Graph Traversal\n### BFS — O(V+E), uses Queue, finds shortest path\n### DFS — O(V+E), uses Stack, detects cycles`, category:"notes", postedByName:"Dr. Priya Mehta", downloads:42, createdAt:new Date(Date.now()-2*86400000).toISOString() },
  { _id:"td2", title:"DBMS Slides — Transactions & Concurrency", subject:"CS303 — Database Management", description:"Lecture slides covering ACID properties, serializability and locking protocols.", content:`# Transactions & Concurrency\n\n## ACID Properties\n- Atomicity — all or nothing\n- Consistency — DB remains valid\n- Isolation — concurrent transactions don't interfere\n- Durability — committed changes persist\n\n## Serializability\nA schedule is serializable if it produces same result as some serial schedule.\n\n## Locking Protocols\n- Shared (S) lock — read only\n- Exclusive (X) lock — read + write\n\n## Two-Phase Locking (2PL)\n1. Growing phase: acquire locks only\n2. Shrinking phase: release locks only`, category:"slides", postedByName:"Prof. Rakesh Sharma", downloads:61, createdAt:new Date(Date.now()-5*86400000).toISOString() },
  { _id:"td3", title:"OS Assignment 3 — Scheduling", subject:"CS302 — Operating Systems", description:"Assignment on CPU scheduling algorithms — FCFS, SJF, Round Robin.", content:`# OS Assignment 3 — CPU Scheduling\n\nSubmission Deadline: Friday 11:59 PM\n\n## Question 1\nGiven the following process table:\n| Process | Arrival | Burst |\n|---------|---------|-------|\n| P1      | 0       | 6     |\n| P2      | 1       | 4     |\n| P3      | 2       | 2     |\n\nCalculate:\na) Gantt chart for FCFS\nb) Gantt chart for SJF (non-preemptive)\nc) Gantt chart for Round Robin (quantum = 2)\nd) Average waiting time for each\n\n## Question 2\nCompare the advantages and disadvantages of preemptive vs non-preemptive scheduling.`, category:"assignment", postedByName:"Dr. Anita Desai", downloads:88, createdAt:new Date(Date.now()-1*86400000).toISOString() },
  { _id:"td4", title:"Computer Networks — Reference Sheet", subject:"CS304 — Computer Networks", description:"Quick reference for OSI model, common ports, subnetting, and protocol headers.", content:`# Computer Networks — Quick Reference\n\n## OSI Model (top → bottom)\n7. Application\n6. Presentation\n5. Session\n4. Transport  (TCP / UDP)\n3. Network    (IP, ICMP)\n2. Data Link  (MAC, ARP)\n1. Physical\n\n## Common Ports\n- 22 SSH\n- 25 SMTP\n- 53 DNS\n- 80 HTTP\n- 443 HTTPS\n- 3306 MySQL\n\n## Subnetting\nHosts per subnet = 2^(32 - prefix) - 2\n/24 → 254 hosts, /25 → 126 hosts, /26 → 62 hosts`, category:"reference", postedByName:"Prof. Suresh Nair", downloads:74, createdAt:new Date(Date.now()-7*86400000).toISOString() },
]

const docCatMeta = {
  notes:      { label:"Notes",      icon:BookMarked,  color:"text-blue-400",   bg:"bg-blue-500/10",   border:"border-blue-500/20" },
  slides:     { label:"Slides",     icon:Presentation,color:"text-purple-400", bg:"bg-purple-500/10", border:"border-purple-500/20" },
  assignment: { label:"Assignment", icon:ClipboardList,color:"text-yellow-400",bg:"bg-yellow-500/10", border:"border-yellow-500/20" },
  reference:  { label:"Reference",  icon:FileText,    color:"text-green-400",  bg:"bg-green-500/10",  border:"border-green-500/20" },
}

const campusCatMeta: Record<string,{icon:any,color:string,bg:string}> = {
  book:      { icon:BookOpen, color:"text-blue-400",   bg:"bg-blue-500/10" },
  equipment: { icon:Wrench,   color:"text-green-400",  bg:"bg-green-500/10" },
  facility:  { icon:Building, color:"text-purple-400", bg:"bg-purple-500/10" },
}

const fmt = (d: string) => new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })

interface WebResource {
  title: string
  url: string
  description: string
  type: "book" | "course" | "tutorial" | "documentation" | "article"
  difficulty: "beginner" | "intermediate" | "advanced"
  rating: number
}

type TabType = "documents" | "campus" | "web"

export default function StudentResourcesPage() {
  const [campusRes, setCampusRes]   = useState<CampusResource[]>([])
  const [teacherDocs, setTeacherDocs] = useState<TeacherDoc[]>([])
  const [webResources, setWebResources] = useState<WebResource[]>([])
  const [loading, setLoading]       = useState(true)
  const [tab, setTab]               = useState<TabType>("documents")
  const [search, setSearch]         = useState("")
  const [catFilter, setCatFilter]   = useState("all")
  const [preview, setPreview]       = useState<TeacherDoc | null>(null)
  const [searchingWeb, setSearchingWeb] = useState(false)
  const [webSearchTopic, setWebSearchTopic] = useState("")

  useEffect(() => { fetchResources() }, [])

  const fetchResources = async () => {
    setLoading(true)
    try {
      const res  = await fetch("/api/student/resources?limit=100")
      const data = await res.json()
      setCampusRes(data.resources?.length  ? data.resources  : mockCampus)
      setTeacherDocs(data.teacherDocuments?.length ? data.teacherDocuments : mockTeacherDocs)
    } catch {
      setCampusRes(mockCampus)
      setTeacherDocs(mockTeacherDocs)
    } finally { setLoading(false) }
  }

  const searchWebResources = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!webSearchTopic.trim()) return

    setSearchingWeb(true)
    try {
      const res = await fetch("/api/student/resources/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: webSearchTopic }),
      })
      const data = await res.json()
      setWebResources(data.resources || [])
    } catch (error) {
      console.error("Web search failed:", error)
    } finally {
      setSearchingWeb(false)
    }
  }

  /* ─── PDF download via window.print() ─── */
  const downloadAsPDF = (doc: TeacherDoc) => {
    const printWin = window.open("", "_blank")
    if (!printWin) return
    printWin.document.write(`<!DOCTYPE html><html><head>
      <title>${doc.title}</title>
      <style>
        body{font-family:Georgia,serif;max-width:720px;margin:40px auto;color:#111;line-height:1.7}
        h1{font-size:1.6rem;border-bottom:2px solid #e78a53;padding-bottom:8px;margin-bottom:4px}
        h2{font-size:1.2rem;margin-top:24px;color:#333}
        h3{font-size:1rem;color:#555}
        pre{white-space:pre-wrap;font-family:inherit}
        .meta{color:#666;font-size:.85rem;margin-bottom:24px}
        table{border-collapse:collapse;width:100%}
        td,th{border:1px solid #ccc;padding:6px 10px}
        @media print{body{margin:20px}}
      </style>
    </head><body>
      <h1>${doc.title}</h1>
      <div class="meta">
        Subject: ${doc.subject} &nbsp;|&nbsp; By ${doc.postedByName} &nbsp;|&nbsp; ${fmt(doc.createdAt)}
      </div>
      <pre>${doc.content.replace(/</g,"&lt;")}</pre>
    </body></html>`)
    printWin.document.close()
    printWin.focus()
    setTimeout(() => { printWin.print(); printWin.close() }, 400)
  }

  /* ─── Filter helpers ─── */
  const filteredDocs = teacherDocs.filter(d => {
    const ms = d.title.toLowerCase().includes(search.toLowerCase()) || d.subject.toLowerCase().includes(search.toLowerCase())
    const mc = catFilter === "all" || d.category === catFilter
    return ms && mc
  })

  const filteredCampus = campusRes.filter(r => {
    const ms = r.name.toLowerCase().includes(search.toLowerCase()) || (r.author||"").toLowerCase().includes(search.toLowerCase())
    const mc = catFilter === "all" || r.category === catFilter
    return ms && mc
  })

  return (
    <div className="min-h-screen bg-black flex">
      <StudentSidebar />
      <main className="flex-1 overflow-auto">

        {/* Header */}
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10 px-8 py-5">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white">Learning Resources</h1>
              <p className="text-zinc-500 text-sm mt-0.5">Notes, slides, books and campus facilities</p>
            </div>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources..." className="pl-10 w-64 bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-500" />
            </div>
          </div>
        </header>

        <div className="p-6 space-y-5">

          {/* Tabs */}
          <div className="flex gap-2">
            {[
              { key:"documents", label:"Teacher Documents", count:teacherDocs.length },
              { key:"campus",    label:"Campus Resources",  count:campusRes.length  },
              { key:"web",       label:"Web Resources",     count:webResources.length },
            ].map(t => (
              <button key={t.key} onClick={() => { setTab(t.key as TabType); setCatFilter("all") }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${tab === t.key ? "bg-[#e78a53]/10 text-[#e78a53] border-[#e78a53]/30" : "bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-white"}`}>
                {t.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? "bg-[#e78a53]/20 text-[#e78a53]" : "bg-zinc-800 text-zinc-500"}`}>{t.count}</span>
              </button>
            ))}
          </div>

          {/* Category filter */}
          {tab !== "web" && (
          <div className="flex gap-2 flex-wrap">
            {tab === "documents"
              ? ["all","notes","slides","assignment","reference"].map(c => (
                  <button key={c} onClick={() => setCatFilter(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition-all ${catFilter===c ? "bg-[#e78a53]/20 text-[#e78a53] border-[#e78a53]/30" : "bg-zinc-800/60 text-zinc-400 border-zinc-700 hover:text-white"}`}>{c}</button>
                ))
              : ["all","book","equipment","facility"].map(c => (
                  <button key={c} onClick={() => setCatFilter(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition-all ${catFilter===c ? "bg-[#e78a53]/20 text-[#e78a53] border-[#e78a53]/30" : "bg-zinc-800/60 text-zinc-400 border-zinc-700 hover:text-white"}`}>{c}</button>
                ))
            }
          </div>
          )}

          {/* Web Search Form */}
          {tab === "web" && (
            <form onSubmit={searchWebResources} className="flex gap-2">
              <Input
                value={webSearchTopic}
                onChange={(e) => setWebSearchTopic(e.target.value)}
                placeholder="Search for topics (e.g., 'Machine Learning', 'React Framework')"
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-500"
              />
              <Button
                type="submit"
                disabled={searchingWeb || !webSearchTopic.trim()}
                className="bg-[#e78a53] hover:bg-[#e78a53]/90 disabled:opacity-40"
              >
                {searchingWeb ? "Searching..." : "Search"}
              </Button>
            </form>
          )}

          {/* Loading */}
          {loading ? (
            <div className="py-16 text-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#e78a53] mx-auto" /></div>
          ) : tab === "documents" ? (
            /* ── Teacher Documents ── */
            filteredDocs.length === 0 ? (
              <div className="py-16 text-center"><BookOpen className="h-12 w-12 text-zinc-600 mx-auto mb-3" /><p className="text-zinc-400">No documents found</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocs.map(doc => {
                  const meta = docCatMeta[doc.category]
                  const Icon = meta.icon
                  return (
                    <Card key={doc._id} className="bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 transition-all flex flex-col">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <Badge className={`${meta.bg} ${meta.color} ${meta.border} border text-xs gap-1`}><Icon className="h-3 w-3" />{meta.label}</Badge>
                          <span className="text-zinc-600 text-[10px]">{fmt(doc.createdAt)}</span>
                        </div>
                        <CardTitle className="text-white text-base leading-snug mt-2">{doc.title}</CardTitle>
                        <p className="text-zinc-400 text-xs">{doc.subject}</p>
                      </CardHeader>
                      <CardContent className="pt-0 flex-1 flex flex-col justify-between gap-3">
                        <p className="text-zinc-500 text-xs line-clamp-2">{doc.description}</p>
                        <div className="flex items-center justify-between text-xs text-zinc-500">
                          <span className="flex items-center gap-1"><User className="h-3 w-3" />{doc.postedByName}</span>
                          <span className="flex items-center gap-1"><Download className="h-3 w-3 text-green-400" />{doc.downloads} downloads</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setPreview(doc)} className="flex-1 border-zinc-700 text-zinc-300 hover:text-white text-xs gap-1"><Eye className="h-3.5 w-3.5" /> View</Button>
                          <Button size="sm" onClick={() => downloadAsPDF(doc)} className="flex-1 bg-[#e78a53] hover:bg-[#e78a53]/90 text-xs gap-1"><Printer className="h-3.5 w-3.5" /> Download PDF</Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )
          ) : tab === "campus" ? (
            /* ── Campus Resources ── */
            filteredCampus.length === 0 ? (
              <div className="py-16 text-center"><BookOpen className="h-12 w-12 text-zinc-600 mx-auto mb-3" /><p className="text-zinc-400">No campus resources found</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCampus.map(r => {
                  const meta = campusCatMeta[r.category] || { icon:FileText, color:"text-zinc-400", bg:"bg-zinc-800" }
                  const Icon = meta.icon
                  return (
                    <Card key={r._id} className="bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 transition-all flex flex-col">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <Badge className={`${meta.bg} ${meta.color} border border-zinc-700 text-xs gap-1`}><Icon className="h-3 w-3" /><span className="capitalize">{r.category}</span></Badge>
                          <Badge className={r.isAvailable ? "bg-green-500/10 text-green-400 border border-green-500/20 text-xs" : "bg-red-500/10 text-red-400 border border-red-500/20 text-xs"}>{r.isAvailable ? "Available" : "Unavailable"}</Badge>
                        </div>
                        <CardTitle className="text-white text-base leading-snug mt-2">{r.name}</CardTitle>
                        {r.author && <p className="text-zinc-400 text-xs">by {r.author}</p>}
                      </CardHeader>
                      <CardContent className="pt-0 flex-1 flex flex-col justify-between gap-3">
                        <p className="text-zinc-500 text-xs line-clamp-2">{r.description}</p>
                        <div className="text-xs text-zinc-500 space-y-1">
                          <div className="flex justify-between"><span>Location</span><span className="text-zinc-300">{r.location}</span></div>
                          {r.totalCopies && <div className="flex justify-between"><span>Copies</span><span className="text-zinc-300">{r.availableCopies}/{r.totalCopies}</span></div>}
                          {r.capacity && <div className="flex justify-between"><span>Capacity</span><span className="text-zinc-300">{r.capacity} people</span></div>}
                        </div>
                        <Button size="sm" disabled={!r.isAvailable} className="bg-[#e78a53] hover:bg-[#e78a53]/90 disabled:opacity-40 w-full text-xs gap-1">
                          {r.category==="book" ? <><BookOpen className="h-3.5 w-3.5" /> Borrow</> : r.category==="facility" ? <><Calendar className="h-3.5 w-3.5" /> Book</> : <><Download className="h-3.5 w-3.5" /> Request</>}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )
          ) : (
            /* ── Web Resources ── */
            webResources.length === 0 && !searchingWeb ? (
              <div className="py-16 text-center"><Search className="h-12 w-12 text-zinc-600 mx-auto mb-3" /><p className="text-zinc-400">Search for topics to discover relevant web resources</p></div>
            ) : searchingWeb ? (
              <div className="py-16 text-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#e78a53] mx-auto" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {webResources.map((resource) => {
                  const typeColors: Record<string, string> = {
                    book: "bg-blue-500/10 text-blue-400",
                    course: "bg-purple-500/10 text-purple-400",
                    tutorial: "bg-green-500/10 text-green-400",
                    documentation: "bg-yellow-500/10 text-yellow-400",
                    article: "bg-pink-500/10 text-pink-400",
                  }
                  const diffColors: Record<string, string> = {
                    beginner: "bg-green-500/10 text-green-400",
                    intermediate: "bg-yellow-500/10 text-yellow-400",
                    advanced: "bg-red-500/10 text-red-400",
                  }
                  // Use a composite key to avoid index-based keys
                  const key = `${resource.url}-${resource.title}`
                  return (
                    <Card key={key} className="bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 transition-all flex flex-col">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex gap-2 flex-wrap">
                            <Badge className={`${typeColors[resource.type] || "bg-zinc-600 text-zinc-300"} text-xs capitalize`}>{resource.type}</Badge>
                            <Badge className={`${diffColors[resource.difficulty] || "bg-zinc-600 text-zinc-300"} text-xs capitalize`}>{resource.difficulty}</Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs text-yellow-400">{resource.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <CardTitle className="text-white text-base leading-snug">{resource.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 flex-1 flex flex-col justify-between gap-3">
                        <p className="text-zinc-500 text-xs line-clamp-2">{resource.description}</p>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-[#e78a53] hover:underline text-xs truncate">
                          {resource.url}
                        </a>
                        <Button asChild className="bg-[#e78a53] hover:bg-[#e78a53]/90 w-full text-xs gap-1">
                          <a href={resource.url} target="_blank" rel="noopener noreferrer"><Eye className="h-3.5 w-3.5" /> View Resource</a>
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )
          )}

          {/* ── Preview Dialog ── */}
          {preview && (
            <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
              <DialogContent className="bg-zinc-900 border-zinc-700 max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`${docCatMeta[preview.category].bg} ${docCatMeta[preview.category].color} border ${docCatMeta[preview.category].border} text-xs`}>
                      {docCatMeta[preview.category].label}
                    </Badge>
                    <span className="text-zinc-500 text-xs">{preview.subject}</span>
                  </div>
                  <DialogTitle className="text-white mt-1">{preview.title}</DialogTitle>
                  <p className="text-zinc-500 text-xs">
                    By {preview.postedByName} · {fmt(preview.createdAt)}
                  </p>
                </DialogHeader>
                <div className="mt-2 bg-zinc-950 rounded-xl p-5 border border-zinc-800">
                  <pre className="text-zinc-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                    {preview.content}
                  </pre>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <Button variant="outline" onClick={() => setPreview(null)} className="border-zinc-700 text-zinc-300">
                    Close
                  </Button>
                  <Button onClick={() => downloadAsPDF(preview)} className="bg-[#e78a53] hover:bg-[#e78a53]/90 gap-2">
                    <Printer className="h-4 w-4" /> Download PDF
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </main>
    </div>
  )
}