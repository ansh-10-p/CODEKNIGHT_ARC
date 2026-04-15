import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StudentSidebar } from "@/components/student-sidebar"
import { UserMenu } from "@/components/user-menu"
import { Award, FileText, CheckCircle } from "lucide-react"

const examTiles = [
  {
    href: "/student/examination/hall-tickets",
    icon: Award,
    title: "Hall Tickets",
    description: "View and download your exam admission tickets.",
  },
  {
    href: "/student/examination/transcripts",
    icon: FileText,
    title: "Transcripts",
    description: "Access your academic transcripts and download reports.",
  },
  {
    href: "/student/examination/results",
    icon: CheckCircle,
    title: "Exam Results",
    description: "Check your marks, grades, and semester performance.",
  },
]

export default function ExamCellPage() {
  return (
    <div className="min-h-screen bg-black flex">
      <StudentSidebar />
      <main className="flex-1 overflow-auto">
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-zinc-400 text-sm">Student Portal</p>
              <h1 className="text-3xl font-bold text-white">Exam Cell</h1>
              <p className="text-zinc-500 mt-1">One place for hall tickets, transcripts, and exam results.</p>
            </div>
            <UserMenu />
          </div>
        </header>

        <div className="p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {examTiles.map((tile) => {
              const Icon = tile.icon
              return (
                <Card key={tile.href} className="bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 transition-colors">
                  <CardHeader className="p-6">
                    <div className="inline-flex items-center justify-center rounded-full bg-[#e78a53]/10 text-[#e78a53] p-3 mb-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl text-white mb-2">{tile.title}</CardTitle>
                    <p className="text-zinc-400 text-sm">{tile.description}</p>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <Link href={tile.href} className="inline-flex items-center justify-center w-full rounded-lg border border-[#e78a53]/20 bg-[#e78a53]/10 px-4 py-3 text-sm font-medium text-[#e78a53] hover:bg-[#e78a53]/15 transition">
                      Open
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardContent className="p-6">
                <h2 className="text-white text-lg font-semibold mb-2">Quick exam support</h2>
                <p className="text-zinc-400 text-sm">Use Exam Cell to quickly jump to ticket downloads, transcript reports, and grade summaries without leaving the student portal.</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardContent className="p-6">
                <h2 className="text-white text-lg font-semibold mb-2">Need help?</h2>
                <p className="text-zinc-400 text-sm">Contact exam support or your academic advisor if you have issues with exam schedules, hall tickets, or results data.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
