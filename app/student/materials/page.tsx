"use client"

import { useState, useEffect } from "react"
import { StudentSidebar } from "@/components/student-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  ClipboardList, Search, Calendar, Clock, MapPin,
  BookOpen, FileQuestion, GraduationCap, Beaker, PenLine,
  AlertTriangle, Bell,
} from "lucide-react"

interface TestItem {
  _id: string; title: string; subject: string; classroomId: string
  classroomTitle: string; type: "unit-test"|"midterm"|"final"|"quiz"|"practical"
  date: string; time: string; duration: number; venue: string
  totalMarks: number; syllabus: string; instructions: string
  postedBy: string; postedByName: string; createdAt: string
}

const typeMeta = {
  "unit-test": { label:"Unit Test", icon:PenLine,       color:"text-blue-400",   bg:"bg-blue-500/10",   border:"border-blue-500/20"   },
  midterm:     { label:"Midterm",   icon:BookOpen,      color:"text-yellow-400", bg:"bg-yellow-500/10", border:"border-yellow-500/20" },
  final:       { label:"Final",     icon:GraduationCap, color:"text-red-400",    bg:"bg-red-500/10",    border:"border-red-500/20"    },
  quiz:        { label:"Quiz",      icon:FileQuestion,  color:"text-green-400",  bg:"bg-green-500/10",  border:"border-green-500/20"  },
  practical:   { label:"Practical", icon:Beaker,        color:"text-purple-400", bg:"bg-purple-500/10", border:"border-purple-500/20" },
}

const mockTests: TestItem[] = [
  { _id:"t1", title:"Unit Test 1 — Arrays & Linked Lists", subject:"CS301 — Data Structures", classroomId:"mc1", classroomTitle:"Data Structures & Algorithms", type:"unit-test", date:new Date(Date.now()+3*86400000).toISOString(), time:"10:00 AM", duration:60, venue:"Exam Hall A — Block 2", totalMarks:30, syllabus:"Unit 1: Arrays, Strings, Linked Lists (Singly, Doubly, Circular). Unit 2: Stack, Queue.", instructions:"Closed book. No programmable calculators. Write roll number on all sheets. Attempt all questions.", postedBy:"teacher-1", postedByName:"Prof. Priya Verma", createdAt:new Date(Date.now()-2*86400000).toISOString() },
  { _id:"t3", title:"Quiz 2 — CPU Scheduling", subject:"CS302 — Operating Systems", classroomId:"mc3", classroomTitle:"Operating Systems", type:"quiz", date:new Date(Date.now()+1*86400000).toISOString(), time:"02:00 PM", duration:30, venue:"Room 301 — Block 1", totalMarks:15, syllabus:"FCFS, SJF, Round Robin, Priority Scheduling. Gantt charts and waiting time calculations.", instructions:"MCQ + short answers. Online on college portal. Calculator allowed for numerical problems.", postedBy:"teacher-3", postedByName:"Dr. Anita Desai", createdAt:new Date(Date.now()-3*86400000).toISOString() },
  { _id:"t2", title:"Midterm Exam — DBMS", subject:"CS303 — Database Management", classroomId:"mc2", classroomTitle:"Database Management Systems", type:"midterm", date:new Date(Date.now()+7*86400000).toISOString(), time:"09:00 AM", duration:120, venue:"Exam Hall B — Block 3", totalMarks:50, syllabus:"Modules 1–4: ER Diagrams, Relational Model, SQL (DDL/DML), Normalization (1NF–BCNF), Transactions (ACID).", instructions:"Closed book. SQL syntax sheet provided. Attempt 5 out of 7 questions. Each carries 10 marks.", postedBy:"teacher-2", postedByName:"Prof. Rakesh Sharma", createdAt:new Date(Date.now()-1*86400000).toISOString() },
  { _id:"t4", title:"Practical Exam — SQL Lab", subject:"CS303 — Database Management", classroomId:"mc2", classroomTitle:"Database Management Systems", type:"practical", date:new Date(Date.now()+14*86400000).toISOString(), time:"11:00 AM", duration:90, venue:"Computer Lab 2 — Block 4", totalMarks:25, syllabus:"DDL/DML queries, JOINs, subqueries, views, stored procedures, triggers.", instructions:"Individual systems. Internet access blocked. Bring student ID. Login credentials on lab sheet.", postedBy:"teacher-2", postedByName:"Prof. Rakesh Sharma", createdAt:new Date().toISOString() },
]

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { weekday:"short", day:"2-digit", month:"short", year:"numeric" })

const daysUntil = (d: string) => {
  const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
  if (diff < 0)  return { label:"Past",       color:"text-zinc-500",  ring:"border-zinc-700"   }
  if (diff === 0) return { label:"Today!",     color:"text-red-400",   ring:"border-red-500/30" }
  if (diff === 1) return { label:"Tomorrow",   color:"text-orange-400",ring:"border-orange-500/30" }
  if (diff <= 3)  return { label:`${diff} days`,color:"text-yellow-400",ring:"border-yellow-500/20" }
  return              { label:`${diff} days`, color:"text-green-400", ring:"border-zinc-700"   }
}

export default function StudentTestsPage() {
  const [tests, setTests]         = useState<TestItem[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [preview, setPreview]     = useState<TestItem | null>(null)

  useEffect(() => { fetchTests() }, [])

  const fetchTests = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/student/tests")
      const data = await res.json()
      setTests(data.tests?.length ? data.tests : mockTests)
    } catch {
      setTests(mockTests)
    } finally { setLoading(false) }
  }

  const filtered = tests.filter(t => {
    const ms = t.title.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase())
    const mt = typeFilter === "all" || t.type === typeFilter
    return ms && mt
  })

  const urgent = tests.filter(t => {
    const d = Math.ceil((new Date(t.date).getTime() - Date.now()) / 86400000)
    return d >= 0 && d <= 3
  })

  return (
    <div className="min-h-screen bg-black flex">
      <StudentSidebar />
      <main className="flex-1 overflow-auto">

        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10 px-8 py-5">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white">Tests &amp; Exams</h1>
              <p className="text-zinc-500 text-sm mt-0.5">Upcoming tests, quizzes and exams</p>
            </div>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tests..." className="pl-10 w-64 bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-500" />
            </div>
          </div>
        </header>

        <div className="p-6 space-y-5">

          {/* Urgent banner */}
          {urgent.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-red-300 font-medium text-sm">Upcoming in 3 days</p>
                <p className="text-red-400/80 text-xs mt-0.5">
                  {urgent.map(t => t.title).join(" · ")}
                </p>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label:"Total",     value:tests.length,                                          icon:ClipboardList, color:"text-blue-400",   bg:"bg-blue-500/10"   },
              { label:"This Week", value:tests.filter(t=>{ const d=Math.ceil((new Date(t.date).getTime()-Date.now())/86400000); return d>=0&&d<=7}).length, icon:Calendar,    color:"text-yellow-400", bg:"bg-yellow-500/10" },
              { label:"Quizzes",   value:tests.filter(t=>t.type==="quiz").length,              icon:FileQuestion,  color:"text-green-400",  bg:"bg-green-500/10"  },
              { label:"Exams",     value:tests.filter(t=>["midterm","final","practical"].includes(t.type)).length, icon:GraduationCap, color:"text-red-400", bg:"bg-red-500/10" },
            ].map(s => {
              const Icon = s.icon
              return (
                <Card key={s.label} className="bg-zinc-900/60 border-zinc-800">
                  <CardContent className="p-5 flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${s.bg}`}><Icon className={`h-5 w-5 ${s.color}`} /></div>
                    <div>
                      <p className="text-2xl font-bold text-white">{s.value}</p>
                      <p className="text-zinc-400 text-sm">{s.label}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Type filter */}
          <div className="flex gap-2 flex-wrap">
            {["all","quiz","unit-test","midterm","final","practical"].map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition-all ${typeFilter===t ? "bg-[#e78a53]/20 text-[#e78a53] border-[#e78a53]/30" : "bg-zinc-800/60 text-zinc-400 border-zinc-700 hover:text-white"}`}>
                {t === "unit-test" ? "Unit Test" : t}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-16 text-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#e78a53] mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <ClipboardList className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400">No upcoming tests</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(t => {
                const meta = typeMeta[t.type]
                const Icon = meta.icon
                const countdown = daysUntil(t.date)
                return (
                  <Card key={t._id} className={`bg-zinc-900/60 border transition-all flex flex-col ${countdown.ring}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <Badge className={`${meta.bg} ${meta.color} ${meta.border} border text-xs gap-1`}><Icon className="h-3 w-3" />{meta.label}</Badge>
                        <span className={`text-xs font-semibold ${countdown.color}`}>{countdown.label}</span>
                      </div>
                      <CardTitle className="text-white text-base leading-snug mt-2">{t.title}</CardTitle>
                      <p className="text-zinc-400 text-xs">{t.subject}</p>
                    </CardHeader>
                    <CardContent className="pt-0 flex-1 flex flex-col justify-between gap-3">
                      <div className="space-y-1.5 text-xs text-zinc-500">
                        <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3 text-zinc-400" /><span className="text-zinc-300">{fmtDate(t.date)}</span></div>
                        <div className="flex items-center gap-1.5"><Clock className="h-3 w-3" />{t.time} · {t.duration} min · {t.totalMarks} marks</div>
                        <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{t.venue || "TBA"}</div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setPreview(t)} className="w-full border-zinc-700 text-zinc-300 hover:text-white text-xs gap-1">
                        View Details & Syllabus
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* ── Details Dialog ── */}
      {preview && (
        <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
          <DialogContent className="bg-zinc-900 border-zinc-700 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${typeMeta[preview.type].bg} ${typeMeta[preview.type].color} border ${typeMeta[preview.type].border} text-xs`}>{typeMeta[preview.type].label}</Badge>
                <span className={`text-xs font-semibold ${daysUntil(preview.date).color}`}>{daysUntil(preview.date).label}</span>
              </div>
              <DialogTitle className="text-white mt-1">{preview.title}</DialogTitle>
              <p className="text-zinc-400 text-sm">{preview.subject}</p>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-3 my-2">
              {[
                ["📅 Date", `${fmtDate(preview.date)}`],
                ["⏰ Time", `${preview.time} (${preview.duration} min)`],
                ["📍 Venue", preview.venue || "TBA"],
                ["📊 Total Marks", `${preview.totalMarks} marks`],
                ["🏫 Classroom", preview.classroomTitle || "—"],
                ["👨‍🏫 Posted by", preview.postedByName],
              ].map(([k,v]) => (
                <div key={k} className="bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-zinc-500 text-xs">{k}</p>
                  <p className="text-zinc-200 text-sm font-medium mt-0.5">{v}</p>
                </div>
              ))}
            </div>

            {preview.syllabus && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mt-1">
                <p className="text-blue-300 font-medium text-sm mb-2 flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> Syllabus</p>
                <p className="text-zinc-300 text-sm leading-relaxed">{preview.syllabus}</p>
              </div>
            )}

            {preview.instructions && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mt-1">
                <p className="text-yellow-300 font-medium text-sm mb-2 flex items-center gap-1.5"><Bell className="h-4 w-4" /> Instructions</p>
                <p className="text-zinc-300 text-sm leading-relaxed">{preview.instructions}</p>
              </div>
            )}

            <DialogFooter><Button variant="outline" onClick={() => setPreview(null)} className="border-zinc-700 text-zinc-300">Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
