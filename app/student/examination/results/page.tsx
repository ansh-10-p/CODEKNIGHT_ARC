"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StudentSidebar } from "@/components/student-sidebar"
import { UserMenu } from "@/components/user-menu"
import { CheckCircle, AlertCircle } from "lucide-react"

interface ExamResult {
  _id: string
  courseCode: string
  courseName: string
  semester: number
  examType: "mid-term" | "end-term" | "practical" | "continuous"
  totalMarks: number
  marksObtained: number
  grade: string
  gpa: number
  resultDate: string
  status: "pass" | "fail"
  remarks: string
}

export default function ExamResultsPage() {
  const [results, setResults] = useState<ExamResult[]>([])
  const [loading, setLoading] = useState(true)
  const [semesterFilter, setSemesterFilter] = useState<string>("all")

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    setLoading(true)
    try {
      const url = semesterFilter === "all" 
        ? "/api/student/exam/results" 
        : `/api/student/exam/results?semester=${semesterFilter}`
      const res = await fetch(url)
      const data = await res.json()
      setResults(data.results || [])
    } catch (error) {
      console.error("Failed to fetch results:", error)
    } finally {
      setLoading(false)
    }
  }

  const semesters = Array.from(new Set(results.map(r => r.semester)))

  const gradeColor = (grade: string) => {
    if (grade.includes("A")) return "bg-green-500/10 text-green-400 border-green-500/20"
    if (grade.includes("B")) return "bg-blue-500/10 text-blue-400 border-blue-500/20"
    if (grade.includes("C")) return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
    return "bg-red-500/10 text-red-400 border-red-500/20"
  }

  const examTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      "mid-term": "Mid-Term",
      "end-term": "End-Term",
      "practical": "Practical",
      "continuous": "Continuous",
    }
    return labels[type] || type
  }

  const filteredResults = semesterFilter === "all" 
    ? results 
    : results.filter(r => r.semester === parseInt(semesterFilter))

  return (
    <div className="min-h-screen bg-black flex">
      <StudentSidebar />
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10 px-8 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link href="/student/dashboard" className="text-zinc-400 hover:text-white">←</Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Exam Results</h1>
                <p className="text-zinc-500 text-sm mt-0.5">View your examination results</p>
              </div>
            </div>
            <UserMenu />
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Filters */}
          <Card className="bg-zinc-900/60 border-zinc-800">
            <CardContent className="p-4">
              <label className="text-white text-sm mb-3 block">Filter by Semester:</label>
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 text-sm"
              >
                <option value="all">All Semesters</option>
                {semesters.sort((a, b) => a - b).map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Results */}
          {loading ? (
            <p className="text-zinc-400">Loading...</p>
          ) : filteredResults.length === 0 ? (
            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardContent className="p-8">
                <p className="text-zinc-400 text-center">No results available</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredResults.map((result) => (
                <Card key={result._id} className="bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-white font-semibold text-lg">{result.courseCode} — {result.courseName}</p>
                          <Badge className={result.status === "pass" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}>
                            {result.status === "pass" ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <AlertCircle className="h-3 w-3 mr-1" />
                            )}
                            {result.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-zinc-400 text-sm">{examTypeLabel(result.examType)} Exam</p>
                      </div>
                      <Badge className={gradeColor(result.grade)} style={{ fontSize: "16px", padding: "8px 12px" }}>
                        {result.grade}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="p-3 bg-zinc-800/40 rounded">
                        <p className="text-zinc-500 text-xs mb-1">Marks Obtained</p>
                        <p className="text-white font-semibold text-lg">{result.marksObtained}/{result.totalMarks}</p>
                      </div>
                      <div className="p-3 bg-zinc-800/40 rounded">
                        <p className="text-zinc-500 text-xs mb-1">Percentage</p>
                        <p className="text-white font-semibold text-lg">{((result.marksObtained / result.totalMarks) * 100).toFixed(1)}%</p>
                      </div>
                      <div className="p-3 bg-zinc-800/40 rounded">
                        <p className="text-zinc-500 text-xs mb-1">GPA (4.0)</p>
                        <p className="text-white font-semibold text-lg">{result.gpa.toFixed(2)}</p>
                      </div>
                      <div className="p-3 bg-zinc-800/40 rounded">
                        <p className="text-zinc-500 text-xs mb-1">Result Date</p>
                        <p className="text-white font-semibold text-lg">{new Date(result.resultDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-700">
                      <p className="text-zinc-400 text-sm"><strong>Remarks:</strong> {result.remarks || "—"}</p>
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
