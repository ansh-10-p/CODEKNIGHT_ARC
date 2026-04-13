"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import {
  IndianRupee,
  CreditCard,
  Wallet,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock
} from "lucide-react"

interface Event {
  _id: string
  title: string
  description: string
  eventType: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  venue: string
  organizer: string
  contactEmail?: string
  contactPhone?: string
  maxParticipants?: number
  registrationDeadline?: string
  fee: number
  status: string
  imageUrl?: string
  tags: string[]
  requirements: string[]
  isPublic: boolean
}

interface EventBookingDialogProps {
  isOpen: boolean
  onClose: () => void
  event: Event | null
  onBookingSuccess: (booking: any) => void
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function EventBookingDialog({ isOpen, onClose, event, onBookingSuccess }: EventBookingDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'offline'>('online')
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    email: '',
    phone: '',
    specialRequirements: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Load user info on mount
  useEffect(() => {
    try {
      const user = localStorage.getItem('currentUser')
      if (user) {
        const userData = JSON.parse(user)
        setCurrentUser(userData)
        setStudentInfo(prev => ({
          ...prev,
          name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
          email: userData.email || ''
        }))
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }, [])

  // Load Razorpay script
  useEffect(() => {
    if (isOpen && !window.Razorpay) {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      document.body.appendChild(script)
    }
  }, [isOpen])

  const handleRazorpayPayment = (bookingData: any) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: bookingData.razorpayOrder.amount,
      currency: bookingData.razorpayOrder.currency,
      name: 'A.R Campus Events',
      description: `${event?.title} - Registration`,
      order_id: bookingData.razorpayOrder.id,
      handler: async (response: any) => {
        try {
          // Verify payment
          const verifyResponse = await fetch('/api/event-bookings/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: bookingData.booking.bookingId
            })
          })

          const verifyResult = await verifyResponse.json()
          
          if (verifyResponse.ok) {
            onBookingSuccess(verifyResult.data)
            onClose()
            alert('Payment successful! Your event registration is confirmed.')
          } else {
            alert('Payment verification failed: ' + verifyResult.error)
          }
        } catch (error) {
          console.error('Payment verification error:', error)
          alert('Payment verification failed. Please contact support.')
        } finally {
          setIsLoading(false)
        }
      },
      prefill: {
        name: studentInfo.name,
        email: studentInfo.email,
        contact: studentInfo.phone
      },
      theme: {
        color: '#e78a53'
      },
      modal: {
        ondismiss: () => {
          setIsLoading(false)
        }
      }
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
  }

  const handleBookEvent = async () => {
    if (!currentUser) {
      alert('Please login to register for events')
      return
    }

    if (!event) {
      alert('Event information not available')
      return
    }

    if (!studentInfo.name || !studentInfo.email) {
      alert('Please fill in all required fields')
      return
    }

    setIsLoading(true)

    try {
      const bookingData = {
        studentId: currentUser._id || currentUser.id,
        studentName: studentInfo.name,
        studentEmail: studentInfo.email,
        studentPhone: studentInfo.phone,
        eventId: event._id,
        attendeeCount: 1,
        paymentMethod,
        specialRequirements: studentInfo.specialRequirements,
        totalAmount: event.fee
      }

      const response = await fetch('/api/event-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      })

      const result = await response.json()

      if (!response.ok) {
        alert(result.error || 'Failed to create booking')
        setIsLoading(false)
        return
      }

      if (paymentMethod === 'online' && event.fee > 0) {
        // Process online payment
        if (!window.Razorpay) {
          alert('Payment gateway not loaded. Please try again.')
          setIsLoading(false)
          return
        }
        handleRazorpayPayment(result)
      } else {
        // Free event or offline payment
        onBookingSuccess(result.booking)
        onClose()
        setIsLoading(false)
        alert('Registration successful!')
      }

    } catch (error) {
      console.error('Booking error:', error)
      alert('Failed to create booking. Please try again.')
      setIsLoading(false)
    }
  }

  if (!event) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Register for Event</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Details */}
          <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
            <h3 className="text-lg font-semibold text-white">{event.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-zinc-400">
                <Calendar className="h-4 w-4 text-[#e78a53]" />
                <span>{formatDate(event.startDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <Clock className="h-4 w-4 text-[#e78a53]" />
                <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <MapPin className="h-4 w-4 text-[#e78a53]" />
                <span>{event.venue}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <User className="h-4 w-4 text-[#e78a53]" />
                <span>{event.organizer}</span>
              </div>
            </div>
            <p className="text-zinc-300 text-sm">{event.description}</p>
            {event.fee > 0 && (
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-[#e78a53]" />
                <span className="text-[#e78a53] font-semibold">₹{event.fee}</span>
              </div>
            )}
          </div>

          {/* Student Information */}
          <div className="space-y-4">
            <h4 className="text-white font-medium">Student Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-300">Full Name *</Label>
                <Input
                  id="name"
                  value={studentInfo.name}
                  onChange={(e) => setStudentInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={studentInfo.email}
                  onChange={(e) => setStudentInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-zinc-300">Phone Number</Label>
              <Input
                id="phone"
                value={studentInfo.phone}
                onChange={(e) => setStudentInfo(prev => ({ ...prev, phone: e.target.value }))}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Enter your phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements" className="text-zinc-300">Special Requirements</Label>
              <Textarea
                id="requirements"
                value={studentInfo.specialRequirements}
                onChange={(e) => setStudentInfo(prev => ({ ...prev, specialRequirements: e.target.value }))}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Any dietary restrictions, accessibility needs, etc."
                rows={3}
              />
            </div>
          </div>

          {/* Payment Method */}
          {event.fee > 0 && (
            <div className="space-y-4">
              <h4 className="text-white font-medium">Payment Method</h4>
              
              <RadioGroup value={paymentMethod} onValueChange={(value: 'online' | 'offline') => setPaymentMethod(value)}>
                <div className="flex items-center space-x-2 p-4 border border-zinc-700 rounded-lg">
                  <RadioGroupItem value="online" id="online" className="border-zinc-500" />
                  <div className="flex items-center gap-2 flex-1">
                    <CreditCard className="h-4 w-4 text-[#e78a53]" />
                    <Label htmlFor="online" className="text-white cursor-pointer">
                      Pay Online (Recommended)
                    </Label>
                  </div>
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                    Instant Confirmation
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2 p-4 border border-zinc-700 rounded-lg">
                  <RadioGroupItem value="offline" id="offline" className="border-zinc-500" />
                  <div className="flex items-center gap-2 flex-1">
                    <Wallet className="h-4 w-4 text-[#e78a53]" />
                    <Label htmlFor="offline" className="text-white cursor-pointer">
                      Pay at Venue
                    </Label>
                  </div>
                  <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                    Manual Verification
                  </Badge>
                </div>
              </RadioGroup>
            </div>
          )}

          <Separator className="bg-zinc-700" />

          {/* Order Summary */}
          <div className="space-y-4">
            <h4 className="text-white font-medium">Registration Summary</h4>
            
            <div className="bg-zinc-800/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-400">Event Registration</span>
                <span className="text-white">₹{event.fee}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-zinc-400">Processing Fee</span>
                <span className="text-white">₹0</span>
              </div>
              
              <Separator className="bg-zinc-700" />
              
              <div className="flex justify-between font-semibold">
                <span className="text-white">Total Amount</span>
                <span className="text-[#e78a53]">₹{event.fee}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-zinc-700 text-zinc-400 hover:text-white"
              disabled={isLoading}
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleBookEvent}
              className="flex-1 bg-[#e78a53] hover:bg-[#e78a53]/90 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {paymentMethod === 'online' && event.fee > 0 ? 'Processing...' : 'Registering...'}
                </>
              ) : (
                <>
                  {event.fee > 0 ? (
                    paymentMethod === 'online' ? (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay ₹{event.fee} & Register
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Register Now
                      </>
                    )
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Register for Free
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
