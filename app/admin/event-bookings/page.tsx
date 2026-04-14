"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AdminSidebar } from "@/components/admin-sidebar"
import {
  CalendarDays,
  Users,
  IndianRupee,
  Receipt,
  Search,
  Filter,
  Download,
  Eye,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  Clock,
  CreditCard,
  FileText,
  X
} from "lucide-react"

interface EventBooking {
  _id: string
  bookingId: string
  studentName: string
  studentEmail: string
  studentPhone: string
  eventTitle: string
  eventDate: string
  eventVenue: string
  totalAmount: number
  paymentStatus: string
  paymentMethod: string
  bookingStatus: string
  razorpayPaymentId?: string
  razorpayOrderId?: string
  razorpaySignature?: string
  specialRequirements?: string
  createdAt: string
  updatedAt: string
  receiptGenerated: boolean
  confirmationEmailSent: boolean
  statusHistory?: Array<{
    status: string
    timestamp: string
    note?: string
  }>
  eventId: {
    title: string
    startDate: string
    venue: string
    eventType: string
    organizer: string
  }
  studentId: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
}

interface PaymentDetails {
  paymentId: string
  orderId: string
  amount: number
  status: string
  method: string
  paidAt: Date
  signature?: string
}

export default function AdminEventBookingsPage() {
  const [bookings, setBookings] = useState<EventBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({ totalBookings: 0, totalRevenue: 0 })
  const [selectedBooking, setSelectedBooking] = useState<EventBooking | null>(null)
  const [showPaymentDetails, setShowPaymentDetails] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [loadingPaymentDetails, setLoadingPaymentDetails] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/event-bookings?limit=100')
      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }
      const data = await response.json()
      setBookings(data.bookings || [])
      setStats(data.stats || { totalBookings: 0, totalRevenue: 0 })
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setError('Failed to load bookings. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const viewPaymentDetails = async (booking: EventBooking) => {
    setSelectedBooking(booking)
    setShowPaymentDetails(true)
    
    if (booking.razorpayPaymentId && booking.paymentStatus === 'paid') {
      setLoadingPaymentDetails(true)
      try {
        const response = await fetch(`/api/payment-details?paymentId=${booking.razorpayPaymentId}`)
        if (response.ok) {
          const data = await response.json()
          setPaymentDetails(data)
        }
      } catch (error) {
        console.error('Error fetching payment details:', error)
      } finally {
        setLoadingPaymentDetails(false)
      }
    }
  }

  const generateReceipt = async (booking: EventBooking) => {
    try {
      const receiptWindow = window.open('', '_blank')
      if (!receiptWindow) return
      
      const receiptHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Payment Receipt - ${booking.bookingId}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .details { margin-bottom: 20px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .amount { font-size: 24px; font-weight: bold; color: #e78a53; }
            .status-paid { color: green; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Payment Receipt</h1>
            <p>Campus Management System</p>
          </div>
          
          <div class="details">
            <h2>Booking Details</h2>
            <div class="row"><span>Booking ID:</span><span>${booking.bookingId}</span></div>
            <div class="row"><span>Event:</span><span>${booking.eventTitle}</span></div>
            <div class="row"><span>Student:</span><span>${booking.studentName}</span></div>
            <div class="row"><span>Email:</span><span>${booking.studentEmail}</span></div>
            <div class="row"><span>Phone:</span><span>${booking.studentPhone}</span></div>
            <div class="row"><span>Event Date:</span><span>${formatEventDate(booking.eventDate)}</span></div>
            <div class="row"><span>Venue:</span><span>${booking.eventVenue}</span></div>
          </div>
          
          <div class="details">
            <h2>Payment Information</h2>
            <div class="row"><span>Amount:</span><span class="amount">₹${booking.totalAmount}</span></div>
            <div class="row"><span>Payment Method:</span><span>${booking.paymentMethod}</span></div>
            <div class="row"><span>Payment Status:</span><span class="status-paid">${booking.paymentStatus.toUpperCase()}</span></div>
            ${booking.razorpayPaymentId ? `<div class="row"><span>Payment ID:</span><span>${booking.razorpayPaymentId}</span></div>` : ''}
            ${booking.razorpayOrderId ? `<div class="row"><span>Order ID:</span><span>${booking.razorpayOrderId}</span></div>` : ''}
            <div class="row"><span>Booking Date:</span><span>${formatDate(booking.createdAt)}</span></div>
          </div>
          
          <div class="footer">
            <p>Thank you for your registration!</p>
            <p>This is a computer generated receipt.</p>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
        </html>
      `
      
      receiptWindow.document.write(receiptHtml)
      receiptWindow.document.close()
      receiptWindow.focus()
      receiptWindow.print()
    } catch (error) {
      console.error('Error generating receipt:', error)
      alert('Failed to generate receipt. Please try again.')
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const searchQuery = searchTerm.toLowerCase()
    return booking.studentName.toLowerCase().includes(searchQuery) ||
           booking.eventTitle.toLowerCase().includes(searchQuery) ||
           booking.bookingId.toLowerCase().includes(searchQuery) ||
           booking.studentEmail.toLowerCase().includes(searchQuery)
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatEventDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      paid: "bg-green-500/10 text-green-400 border-green-500/30",
      pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
      failed: "bg-red-500/10 text-red-400 border-red-500/30",
      refunded: "bg-blue-500/10 text-blue-400 border-blue-500/30"
    }
    return colors[status as keyof typeof colors] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/30"
  }

  const getBookingStatusColor = (status: string) => {
    const colors = {
      confirmed: "bg-green-500/10 text-green-400 border-green-500/30",
      cancelled: "bg-red-500/10 text-red-400 border-red-500/30",
      attended: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      'no-show': "bg-orange-500/10 text-orange-400 border-orange-500/30"
    }
    return colors[status as keyof typeof colors] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/30"
  }

  return (
    <div className="min-h-screen bg-black flex">
      <AdminSidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Event Bookings</h1>
                <p className="text-zinc-400">Manage student event registrations and payments</p>
              </div>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                  <Input 
                    placeholder="Search bookings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-400"
                  />
                </div>
                <Button onClick={fetchBookings} variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white">
                  <Clock className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <CalendarDays className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{loading ? '--' : stats.totalBookings}</p>
                    <p className="text-zinc-400 text-sm">Total Bookings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <Users className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{loading ? '--' : bookings.filter(b => b.paymentStatus === 'paid').length}</p>
                    <p className="text-zinc-400 text-sm">Paid Bookings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                    <IndianRupee className="h-6 w-6 text-[#e78a53]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{loading ? '--' : `₹${stats.totalRevenue}`}</p>
                    <p className="text-zinc-400 text-sm">Total Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <Receipt className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{loading ? '--' : bookings.filter(b => b.paymentStatus === 'pending').length}</p>
                    <p className="text-zinc-400 text-sm">Pending Payments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bookings List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e78a53] mx-auto"></div>
              <p className="text-zinc-400 mt-4">Loading bookings...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={fetchBookings} variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white">
                Try Again
              </Button>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 text-lg">No bookings found</p>
              <p className="text-zinc-500 text-sm mt-2">
                {searchTerm ? 'Try adjusting your search terms' : 'No event bookings have been made yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <Card key={booking._id} className="bg-zinc-900/50 border-zinc-800">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-white">{booking.eventTitle}</h3>
                              <Badge className={`text-xs ${getPaymentStatusColor(booking.paymentStatus)}`}>
                                {booking.paymentStatus.toUpperCase()}
                              </Badge>
                              <Badge className={`text-xs ${getBookingStatusColor(booking.bookingStatus)}`}>
                                {booking.bookingStatus.toUpperCase()}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-zinc-400">
                                  <User className="h-4 w-4 text-[#e78a53]" />
                                  <span>Student: {booking.studentName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-zinc-400">
                                  <Mail className="h-4 w-4 text-[#e78a53]" />
                                  <span>{booking.studentEmail}</span>
                                </div>
                                {booking.studentPhone && (
                                  <div className="flex items-center gap-2 text-zinc-400">
                                    <Phone className="h-4 w-4 text-[#e78a53]" />
                                    <span>{booking.studentPhone}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-zinc-400">
                                  <Calendar className="h-4 w-4 text-[#e78a53]" />
                                  <span>{formatEventDate(booking.eventDate)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-zinc-400">
                                  <MapPin className="h-4 w-4 text-[#e78a53]" />
                                  <span>{booking.eventVenue}</span>
                                </div>
                                <div className="flex items-center gap-2 text-zinc-400">
                                  <Clock className="h-4 w-4 text-[#e78a53]" />
                                  <span>Booked: {formatDate(booking.createdAt)}</span>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <IndianRupee className="h-4 w-4 text-[#e78a53]" />
                                  <span className="text-[#e78a53] font-semibold">₹{booking.totalAmount}</span>
                                </div>
                                <div className="text-zinc-400 text-xs">
                                  ID: {booking.bookingId}
                                </div>
                                {booking.paymentMethod && (
                                  <div className="text-zinc-400 text-xs">
                                    Payment: {booking.paymentMethod}
                                  </div>
                                )}
                                {booking.razorpayPaymentId && (
                                  <div className="text-zinc-400 text-xs">
                                    Payment ID: {booking.razorpayPaymentId}
                                  </div>
                                )}
                              </div>
                            </div>

                            {booking.specialRequirements && (
                              <div className="mt-3 p-3 bg-zinc-800/30 rounded-lg">
                                <p className="text-zinc-400 text-sm">
                                  <strong>Special Requirements:</strong> {booking.specialRequirements}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-zinc-700 text-zinc-400 hover:text-white"
                          onClick={() => viewPaymentDetails(booking)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {booking.paymentStatus === 'paid' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-zinc-700 text-zinc-400 hover:text-white"
                            onClick={() => generateReceipt(booking)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Receipt
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      {/* Payment Details Dialog */}
      <Dialog open={showPaymentDetails} onOpenChange={setShowPaymentDetails}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#e78a53]" />
              Payment Details
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Complete payment and booking information
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6">
              {/* Booking Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-zinc-800/50 border-zinc-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Booking Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Booking ID:</span>
                      <span className="font-mono">{selectedBooking.bookingId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Event:</span>
                      <span className="text-right max-w-[200px] truncate">{selectedBooking.eventTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Amount:</span>
                      <span className="font-semibold text-[#e78a53]">₹{selectedBooking.totalAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Status:</span>
                      <Badge className={`text-xs ${getPaymentStatusColor(selectedBooking.paymentStatus)}`}>
                        {selectedBooking.paymentStatus.toUpperCase()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-zinc-800/50 border-zinc-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Student Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Name:</span>
                      <span>{selectedBooking.studentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Email:</span>
                      <span className="text-right max-w-[200px] truncate">{selectedBooking.studentEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Phone:</span>
                      <span>{selectedBooking.studentPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Booked:</span>
                      <span className="text-right text-sm">{formatDate(selectedBooking.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Payment Transaction Details */}
              {selectedBooking.paymentStatus === 'paid' && selectedBooking.razorpayPaymentId && (
                <Card className="bg-zinc-800/50 border-zinc-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Transaction Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingPaymentDetails ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#e78a53] mx-auto mb-2"></div>
                        <p className="text-zinc-400 text-sm">Loading transaction details...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Payment ID:</span>
                            <span className="font-mono text-sm">{selectedBooking.razorpayPaymentId}</span>
                          </div>
                          {selectedBooking.razorpayOrderId && (
                            <div className="flex justify-between">
                              <span className="text-zinc-400">Order ID:</span>
                              <span className="font-mono text-sm">{selectedBooking.razorpayOrderId}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Method:</span>
                            <span className="capitalize">{selectedBooking.paymentMethod}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {paymentDetails && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Gateway Status:</span>
                                <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                                  {paymentDetails.status}
                                </Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Paid At:</span>
                                <span className="text-sm">{new Date(paymentDetails.paidAt).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Gateway Method:</span>
                                <span className="text-sm">{paymentDetails.method}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {/* Status History */}
              {selectedBooking.statusHistory && selectedBooking.statusHistory.length > 0 && (
                <Card className="bg-zinc-800/50 border-zinc-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Status History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedBooking.statusHistory.map((entry, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-zinc-900/50 rounded-lg">
                          <div className="w-2 h-2 bg-[#e78a53] rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={`text-xs ${getBookingStatusColor(entry.status)}`}>
                                {entry.status.toUpperCase()}
                              </Badge>
                              <span className="text-xs text-zinc-500">
                                {formatDate(entry.timestamp)}
                              </span>
                            </div>
                            {entry.note && (
                              <p className="text-sm text-zinc-400">{entry.note}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Special Requirements */}
              {selectedBooking.specialRequirements && (
                <Card className="bg-zinc-800/50 border-zinc-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-zinc-400">Special Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedBooking.specialRequirements}</p>
                  </CardContent>
                </Card>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
                {selectedBooking.paymentStatus === 'paid' && (
                  <Button 
                    onClick={() => generateReceipt(selectedBooking)}
                    className="bg-[#e78a53] hover:bg-[#e78a53]/90"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => setShowPaymentDetails(false)}
                  className="border-zinc-700 text-zinc-400 hover:text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
