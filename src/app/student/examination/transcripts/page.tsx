"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StudentSidebar } from "@/components/student-sidebar"
import { UserMenu } from "@/components/user-menu"
import { Download, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Course {
  courseCode: string
  courseName: string
  credits: number
  grade: string
  gpa: number
  marks: number
}

interface Transcript {
  _id: string
  academicYear: string
  semester: number
  courses: Course[]
  sgpa: number
  cgpa: number
  totalCreditsEarned: number
  status: string
}

export default function TranscriptsPage() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTranscript, setSelectedTranscript] = useState<Transcript | null>(null)

  useEffect(() => {
    fetchTranscripts()
  }, [])

  const fetchTranscripts = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/student/exam/transcripts")
      const data = await res.json()
      setTranscripts(data.transcripts || [])
    } catch (error) {
      console.error("Failed to fetch transcripts:", error)
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = (transcript: Transcript) => {
    const printWin = window.open("", "_blank")
    if (printWin) {
      printWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Transcript</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            h1 { margin: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .summary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 20px; }
            .summary-item { border: 1px solid #ddd; padding: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ACADEMIC TRANSCRIPT</h1>
            <p>Semester ${transcript.semester} — ${transcript.academicYear}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Credits</th>
                <th>Marks</th>
                <th>Grade</th>
                <th>GPA</th>
              </tr>
            </thead>
            <tbody>
              ${transcript.courses.map(c => `
                <tr>
                  <td>${c.courseCode}</td>
                  <td>${c.courseName}</td>
                  <td>${c.credits}</td>
                  <td>${c.marks}</td>
                  <td>${c.grade}</td>
                  <td>${c.gpa}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          
          <div class="summary">
            <div class="summary-item">
              <strong>SGPA:</strong><br>${transcript.sgpa}
            </div>
            <div class="summary-item">
              <strong>CGPA:</strong><br>${transcript.cgpa}
            </div>
            <div class="summary-item">
              <strong>Total Credits:</strong><br>${transcript.totalCreditsEarned}
            </div>
          </div>
        </body>
        </html>
      `)
      printWin.document.close()
      printWin.print()
    }
  }

  const gradeColor = (grade: string) => {
    if (grade.includes("A")) return "bg-green-500/10 text-green-400 border-green-500/20"
    if (grade.includes("B")) return "bg-blue-500/10 text-blue-400 border-blue-500/20"
    if (grade.includes("C")) return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
    return "bg-red-500/10 text-red-400 border-red-500/20"
  }

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
                <h1 className="text-2xl font-bold text-white">Transcripts</h1>
                <p className="text-zinc-500 text-sm mt-0.5">View your academic transcripts</p>
              </div>
            </div>
            <UserMenu />
          </div>
        </header>

        <div className="p-6 space-y-6">
          {loading ? (
            <p className="text-zinc-400">Loading...</p>
          ) : transcripts.length === 0 ? (
            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardContent className="p-8">
                <p className="text-zinc-400 text-center">No transcripts available</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {transcripts.map((transcript) => (
                <Card key={transcript._id} className="bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-white font-semibold text-lg">Semester {transcript.semester} — {transcript.academicYear}</p>
                        <p className="text-zinc-400 text-sm">SGPA: {transcript.sgpa} | CGPA: {transcript.cgpa}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadPDF(transcript)}
                          className="border-zinc-700 text-white hover:bg-zinc-800"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTranscript(transcript)}
                          className="border-zinc-700 text-white hover:bg-zinc-800"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>

                    {/* Courses Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-zinc-700">
                            <th className="text-zinc-400 text-xs font-semibold text-left py-2">Course</th>
                            <th className="text-zinc-400 text-xs font-semibold text-right py-2">Credits</th>
                            <th className="text-zinc-400 text-xs font-semibold text-right py-2">Marks</th>
                            <th className="text-zinc-400 text-xs font-semibold text-right py-2">Grade</th>
                            <th className="text-zinc-400 text-xs font-semibold text-right py-2">GPA</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transcript.courses.map((course, idx) => (
                            <tr key={idx} className="border-b border-zinc-800">
                              <td className="py-2 text-white">{course.courseCode} — {course.courseName}</td>
                              <td className="text-right text-zinc-300">{course.credits}</td>
                              <td className="text-right text-zinc-300">{course.marks}</td>
                              <td className="text-right">
                                <Badge className={gradeColor(course.grade)}>{course.grade}</Badge>
                              </td>
                              <td className="text-right text-zinc-300">{course.gpa.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Preview Dialog */}
      {selectedTranscript && (
        <Dialog open={!!selectedTranscript} onOpenChange={() => setSelectedTranscript(null)}>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-white">Transcript — Semester {selectedTranscript.semester}</DialogTitle>
            </DialogHeader>
            <div className="bg-white text-black p-6 rounded-lg">
              <div className="text-center border-b pb-4 mb-4">
                <h1 className="text-xl font-bold">ACADEMIC TRANSCRIPT</h1>
                <p className="text-sm text-gray-600">Semester {selectedTranscript.semester} — {selectedTranscript.academicYear}</p>
              </div>

              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2 text-left">Course</th>
                    <th className="border p-2 text-right">Credits</th>
                    <th className="border p-2 text-right">Marks</th>
                    <th className="border p-2 text-center">Grade</th>
                    <th className="border p-2 text-right">GPA</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTranscript.courses.map((course, idx) => (
                    <tr key={idx}>
                      <td className="border p-2">{course.courseCode} — {course.courseName}</td>
                      <td className="border p-2 text-right">{course.credits}</td>
                      <td className="border p-2 text-right">{course.marks}</td>
                      <td className="border p-2 text-center font-bold">{course.grade}</td>
                      <td className="border p-2 text-right">{course.gpa.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-gray-100 rounded">
                <div>
                  <p className="text-xs text-gray-600">SGPA</p>
                  <p className="font-bold text-lg">{selectedTranscript.sgpa}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">CGPA</p>
                  <p className="font-bold text-lg">{selectedTranscript.cgpa}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total Credits</p>
                  <p className="font-bold text-lg">{selectedTranscript.totalCreditsEarned}</p>
                </div>
              </div>

              <Button
                onClick={() => downloadPDF(selectedTranscript)}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
