"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StudentSidebar } from "@/components/student-sidebar"
import { UserMenu } from "@/components/user-menu"
import {
  IndianRupee, AlertCircle, CheckCircle, Clock, Download, Eye, ArrowRight
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface FeeRecord {
  _id: string
  semester: number
  academicYear: string
  totalFees: number
  paidAmount: number
  dueAmount: number
  paymentStatus: "pending" | "partial" | "paid"
  dueDateLimit: string
  paymentRecords: Array<{
    amount: number
    paymentDate: string
    paymentMethod: string
    transactionId: string
  }>
}

export default function StudentFeesPage() {
  const [fees, setFees] = useState<FeeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null)

  useEffect(() => {
    fetchFees()
  }, [])

  const fetchFees = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/student/fees")
      const data = await res.json()
      setFees(data.fees || [])
    } catch (error) {
      console.error("Failed to fetch fees:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedFee) return

    const formData = new FormData(e.currentTarget)
    const amount = parseInt(formData.get("amount") as string)

    try {
      const res = await fetch("/api/student/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feesId: selectedFee._id,
          amount,
          paymentMethod: "online",
          transactionId: `TXN-${Date.now()}`,
        }),
      })

      if (res.ok) {
        alert("Payment recorded successfully!")
        setShowPaymentForm(false)
        fetchFees()
      }
    } catch (error) {
      alert("Payment failed. Please try again.")
    }
  }

  const statusConfig = {
    paid: { color: "bg-green-500/10 text-green-400 border-green-500/20", icon: CheckCircle, label: "Paid" },
    partial: { color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: Clock, label: "Partial" },
    pending: { color: "bg-red-500/10 text-red-400 border-red-500/20", icon: AlertCircle, label: "Pending" },
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
                <h1 className="text-2xl font-bold text-white">Fees Payment</h1>
                <p className="text-zinc-500 text-sm mt-0.5">Manage and pay your semester fees</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <UserMenu />
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fees.length > 0 && (
              <>
                <Card className="bg-zinc-900/60 border-zinc-800">
                  <CardContent className="p-5">
                    <p className="text-zinc-400 text-sm mb-2">Total Due</p>
                    <p className="text-2xl font-bold text-red-400">₹{fees.reduce((sum, f) => sum + f.dueAmount, 0).toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900/60 border-zinc-800">
                  <CardContent className="p-5">
                    <p className="text-zinc-400 text-sm mb-2">Total Paid</p>
                    <p className="text-2xl font-bold text-green-400">₹{fees.reduce((sum, f) => sum + f.paidAmount, 0).toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900/60 border-zinc-800">
                  <CardContent className="p-5">
                    <p className="text-zinc-400 text-sm mb-2">Total Dues</p>
                    <p className="text-2xl font-bold text-white">₹{fees.reduce((sum, f) => sum + f.totalFees, 0).toLocaleString()}</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Fees Table */}
          <Card className="bg-zinc-900/60 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Your Fee Records</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-zinc-400">Loading...</p>
              ) : fees.length === 0 ? (
                <p className="text-zinc-400">No fees records found</p>
              ) : (
                <div className="space-y-3">
                  {fees.map((fee) => {
                    const config = statusConfig[fee.paymentStatus]
                    const Icon = config.icon
                    return (
                      <div key={fee._id} className="p-4 bg-zinc-800/40 rounded-xl border border-zinc-700 hover:border-zinc-600 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-white font-semibold">Semester {fee.semester} — {fee.academicYear}</p>
                            <p className="text-zinc-400 text-sm">Due: {new Date(fee.dueDateLimit).toLocaleDateString()}</p>
                          </div>
                          <Badge className={config.color}>
                            <Icon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                          <div>
                            <p className="text-zinc-500">Total Fees</p>
                            <p className="text-white font-semibold">₹{fee.totalFees.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-zinc-500">Paid</p>
                            <p className="text-green-400 font-semibold">₹{fee.paidAmount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-zinc-500">Due</p>
                            <p className="text-red-400 font-semibold">₹{fee.dueAmount.toLocaleString()}</p>
                          </div>
                        </div>
                        {fee.dueAmount > 0 && (
                          <Button
                            onClick={() => {
                              setSelectedFee(fee)
                              setShowPaymentForm(true)
                            }}
                            className="w-full bg-[#e78a53] hover:bg-[#e78a53]/90 text-white"
                          >
                            Pay ₹{fee.dueAmount.toLocaleString()}
                          </Button>
                        )}
                        {fee.paymentRecords.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-zinc-700 text-xs text-zinc-400">
                            <p className="mb-2">Payment History:</p>
                            {fee.paymentRecords.map((record, idx) => (
                              <p key={idx} className="text-zinc-500">
                                {new Date(record.paymentDate).toLocaleDateString()} — ₹{record.amount} ({record.paymentMethod})
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Payment Dialog */}
      <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              Pay Fees for Semester {selectedFee?.semester}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePayment} className="space-y-4">
            <div>
              <label className="text-white text-sm mb-2 block">Amount (₹)</label>
              <p className="text-zinc-400 text-sm mb-2">Due: ₹{selectedFee?.dueAmount.toLocaleString()}</p>
              <input
                type="number"
                name="amount"
                defaultValue={selectedFee?.dueAmount}
                max={selectedFee?.dueAmount}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPaymentForm(false)}
                className="flex-1 border-zinc-700 text-white hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-[#e78a53] hover:bg-[#e78a53]/90">
                Proceed to Payment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
