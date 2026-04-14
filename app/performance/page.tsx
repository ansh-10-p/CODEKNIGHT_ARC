"use client"

import { FormEvent, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type PredictionLabel = "at_risk" | "average" | "high_performer"

type PredictionResponse = {
  prediction: PredictionLabel
  confidence?: string
  reason?: string[] | string
  error?: string
}

type FormValues = {
  study_hours: string
  attendance: string
  internal_marks: string
  assignments: string
}

const initialValues: FormValues = {
  study_hours: "",
  attendance: "",
  internal_marks: "",
  assignments: "",
}

const predictionStyles: Record<PredictionLabel, { chip: string; text: string; title: string }> = {
  at_risk: {
    chip: "bg-red-500/20 border border-red-500/40",
    text: "text-red-300",
    title: "At Risk",
  },
  average: {
    chip: "bg-yellow-500/20 border border-yellow-500/40",
    text: "text-yellow-300",
    title: "Average",
  },
  high_performer: {
    chip: "bg-green-500/20 border border-green-500/40",
    text: "text-green-300",
    title: "High Performer",
  },
}

export default function PerformancePage() {
  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({})
  const [apiError, setApiError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<PredictionResponse | null>(null)

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors])

  const updateValue = (field: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
    setApiError("")
  }

  const validate = () => {
    const nextErrors: Partial<Record<keyof FormValues, string>> = {}

    const studyHours = Number(values.study_hours)
    const attendance = Number(values.attendance)
    const internalMarks = Number(values.internal_marks)
    const assignments = Number(values.assignments)

    if (values.study_hours === "" || Number.isNaN(studyHours) || studyHours < 0 || studyHours > 24) {
      nextErrors.study_hours = "Study hours must be between 0 and 24."
    }
    if (values.attendance === "" || Number.isNaN(attendance) || attendance < 0 || attendance > 100) {
      nextErrors.attendance = "Attendance must be between 0 and 100."
    }
    if (values.internal_marks === "" || Number.isNaN(internalMarks) || internalMarks < 0 || internalMarks > 100) {
      nextErrors.internal_marks = "Internal marks must be between 0 and 100."
    }
    if (values.assignments === "" || Number.isNaN(assignments) || assignments < 0 || assignments > 100) {
      nextErrors.assignments = "Assignments score must be between 0 and 100."
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setResult(null)
    setApiError("")

    if (!validate()) return

    setIsLoading(true)
    try {
      const payload = {
        study_hours: Number(values.study_hours),
        attendance: Number(values.attendance),
        internal_marks: Number(values.internal_marks),
        assignments: Number(values.assignments),
      }

      const response = await fetch("/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = (await response.json()) as PredictionResponse

      if (!response.ok) {
        setApiError(data?.error || "Prediction service is currently unavailable.")
        return
      }

      setResult(data)
    } catch {
      setApiError("Unable to connect to prediction service. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const reasons = Array.isArray(result?.reason)
    ? result?.reason
    : result?.reason
      ? [result.reason]
      : []

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-[#e78a53]">Student Performance Predictor</h1>
            <p className="mt-1 text-zinc-400">Estimate whether a student is at risk, average, or high performing.</p>
          </div>
          <Link href="/teacher/classroom/attendance" className="text-sm text-zinc-300 hover:text-[#e78a53]">
            Back to Attendance
          </Link>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="study_hours">Study Hours</Label>
                <Input
                  id="study_hours"
                  type="number"
                  min="0"
                  max="24"
                  step="0.1"
                  value={values.study_hours}
                  onChange={(e) => updateValue("study_hours", e.target.value)}
                  placeholder="e.g. 6"
                  className="bg-zinc-800/60 border-zinc-700"
                />
                {errors.study_hours && <p className="text-sm text-red-300">{errors.study_hours}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="attendance">Attendance (%)</Label>
                <Input
                  id="attendance"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={values.attendance}
                  onChange={(e) => updateValue("attendance", e.target.value)}
                  placeholder="e.g. 78"
                  className="bg-zinc-800/60 border-zinc-700"
                />
                {errors.attendance && <p className="text-sm text-red-300">{errors.attendance}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="internal_marks">Internal Marks</Label>
                <Input
                  id="internal_marks"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={values.internal_marks}
                  onChange={(e) => updateValue("internal_marks", e.target.value)}
                  placeholder="e.g. 64"
                  className="bg-zinc-800/60 border-zinc-700"
                />
                {errors.internal_marks && <p className="text-sm text-red-300">{errors.internal_marks}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignments">Assignments Score</Label>
                <Input
                  id="assignments"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={values.assignments}
                  onChange={(e) => updateValue("assignments", e.target.value)}
                  placeholder="e.g. 71"
                  className="bg-zinc-800/60 border-zinc-700"
                />
                {errors.assignments && <p className="text-sm text-red-300">{errors.assignments}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={isLoading || hasErrors} className="bg-[#e78a53] hover:bg-[#e78a53]/90 text-white">
                {isLoading ? "Predicting..." : "Predict"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800"
                onClick={() => {
                  setValues(initialValues)
                  setErrors({})
                  setApiError("")
                  setResult(null)
                }}
              >
                Reset
              </Button>
            </div>
          </form>

          {apiError && (
            <div className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {apiError}
            </div>
          )}

          {result?.prediction && (
            <div className="mt-6 rounded-xl border border-zinc-700 bg-zinc-950/70 p-5">
              <p className="text-sm uppercase tracking-wide text-zinc-400">Prediction</p>
              <div className={`mt-2 inline-flex rounded-full px-4 py-2 text-lg font-semibold ${predictionStyles[result.prediction].chip} ${predictionStyles[result.prediction].text}`}>
                {predictionStyles[result.prediction].title}
              </div>

              {result.confidence && (
                <p className="mt-3 text-sm text-zinc-300">
                  Confidence: <span className="font-medium text-white">{result.confidence}</span>
                </p>
              )}

              <div className="mt-4">
                <p className="text-sm font-medium text-zinc-200">Reasoning</p>
                {reasons.length > 0 ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-300">
                    {reasons.map((reason, index) => (
                      <li key={`${reason}-${index}`}>{reason}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-zinc-400">No additional factors provided by the model.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
