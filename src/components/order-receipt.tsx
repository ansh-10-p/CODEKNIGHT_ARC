"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  Download,
  Share,
  Store,
  CreditCard,
  Wallet,
  Calendar
} from "lucide-react"

interface OrderReceiptProps {
  isOpen: boolean
  onClose: () => void
  order: any
}

export function OrderReceipt({ isOpen, onClose, order }: OrderReceiptProps) {
  const [shareMessage, setShareMessage] = useState<string | null>(null)

  if (!order) return null

  const getStatusColor = (status: string) => {
    const colors = {
      placed: "bg-blue-500/10 border-blue-500/30 text-blue-400",
      confirmed: "bg-green-500/10 border-green-500/30 text-green-400",
      preparing: "bg-orange-500/10 border-orange-500/30 text-orange-400",
      ready: "bg-[#e78a53]/10 border-[#e78a53]/30 text-[#e78a53]",
      completed: "bg-green-500/10 border-green-500/30 text-green-400",
      cancelled: "bg-red-500/10 border-red-500/30 text-red-400"
    }
    return colors[status as keyof typeof colors] || "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
  }

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
      paid: "bg-green-500/10 border-green-500/30 text-green-400",
      failed: "bg-red-500/10 border-red-500/30 text-red-400",
      refunded: "bg-blue-500/10 border-blue-500/30 text-blue-400"
    }
    return colors[status as keyof typeof colors] || "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDownloadReceipt = () => {
    // Create a simple text receipt
    const receiptText = `
ARC CAMPUS FOOD - ORDER RECEIPT
================================

Order ID: ${order.orderId}
Date: ${formatDate(order.createdAt)}
Customer: ${order.customerName}
Email: ${order.customerEmail}
Canteen: ${order.canteenName}

ITEMS:
${order.items.map((item: any) => 
  `${item.name} x${item.quantity} - ₹${item.price * item.quantity}`
).join('\n')}

PAYMENT SUMMARY:
Subtotal: ₹${order.subtotal}
Tax: ₹${order.tax}
Delivery Fee: ₹${order.deliveryFee}
Discount: ₹${order.discount}
Total: ₹${order.totalAmount}

Payment Method: ${order.paymentMethod === 'online' ? 'Online Payment' : 'Pay at Canteen'}
Payment Status: ${order.paymentStatus}
Order Status: ${order.status}

${order.specialInstructions ? `Special Instructions: ${order.specialInstructions}` : ''}

Thank you for your order!
    `.trim()

    const blob = new Blob([receiptText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${order.orderId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShareReceipt = async () => {
    setShareMessage(null)

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Order Receipt - ${order.orderId}`,
          text: `Order ${order.orderId} from ${order.canteenName} - Total: ₹${order.totalAmount}`,
          url: window.location.href
        })
      } catch (error) {
        console.log('Error sharing:', error)
        setShareMessage('Sharing was cancelled or unavailable on this device.')
      }
    } else {
      const shareText = `Order ${order.orderId} from ${order.canteenName} - Total: ₹${order.totalAmount}`
      navigator.clipboard.writeText(shareText)
      setShareMessage('Receipt details copied to clipboard.')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            Order Receipt
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Header */}
          <div className="text-center p-6 bg-zinc-800/30 rounded-xl border border-zinc-800">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="h-8 w-8 text-green-400" />
              <h2 className="text-2xl font-bold text-green-400">Order Placed Successfully!</h2>
            </div>
            <p className="text-zinc-400">Your order has been received and is being processed</p>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Order Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#e78a53]" />
                  <span className="text-sm text-zinc-400">Order ID:</span>
                  <span className="font-mono font-semibold">{order.orderId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#e78a53]" />
                  <span className="text-sm text-zinc-400">Order Date:</span>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-[#e78a53]" />
                  <span className="text-sm text-zinc-400">Canteen:</span>
                  <span>{order.canteenName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#e78a53]" />
                  <span className="text-sm text-zinc-400">Estimated Time:</span>
                  <span>{formatDate(order.estimatedTime)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Customer Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-[#e78a53]" />
                  <span className="text-sm text-zinc-400">Name:</span>
                  <span>{order.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#e78a53]" />
                  <span className="text-sm text-zinc-400">Email:</span>
                  <span>{order.customerEmail}</span>
                </div>
                {order.customerPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#e78a53]" />
                    <span className="text-sm text-zinc-400">Phone:</span>
                    <span>{order.customerPhone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#e78a53]" />
                  <span className="text-sm text-zinc-400">Pickup:</span>
                  <span>At Canteen</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl border border-zinc-800">
            <div>
              <p className="text-sm text-zinc-400">Order Status</p>
              <Badge className={`${getStatusColor(order.status)} border mt-1`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Payment Status</p>
              <Badge className={`${getPaymentStatusColor(order.paymentStatus)} border mt-1`}>
                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {order.paymentMethod === 'online' ? (
                <CreditCard className="h-5 w-5 text-[#e78a53]" />
              ) : (
                <Wallet className="h-5 w-5 text-[#e78a53]" />
              )}
              <span className="text-sm">
                {order.paymentMethod === 'online' ? 'Online Payment' : 'Pay at Canteen'}
              </span>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-xl border border-zinc-800">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {item.isVeg && (
                        <Badge className="bg-green-500/10 text-green-400 text-xs">Veg</Badge>
                      )}
                      {item.isSpicy && (
                        <Badge className="bg-red-500/10 text-red-400 text-xs">Spicy</Badge>
                      )}
                      <span className="text-xs text-zinc-400">₹{item.price} each</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{item.price * item.quantity}</p>
                    <p className="text-sm text-zinc-400">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payment Summary</h3>
            <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-800 space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₹{order.tax}</span>
                </div>
              )}
              {order.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>₹{order.deliveryFee}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <Separator className="bg-zinc-700" />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total Amount</span>
                <span className="text-[#e78a53]">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          {order.specialInstructions && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Special Instructions</h3>
              <p className="p-3 bg-zinc-800/30 rounded-lg text-zinc-300">
                {order.specialInstructions}
              </p>
            </div>
          )}

          {shareMessage && (
            <div className="rounded-xl border border-[#e78a53]/30 bg-[#e78a53]/10 p-4 text-sm text-[#f3c0a2]">
              {shareMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={handleDownloadReceipt}
              className="flex-1 border-zinc-700 text-zinc-400 hover:text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
            <Button
              variant="outline"
              onClick={handleShareReceipt}
              className="flex-1 border-zinc-700 text-zinc-400 hover:text-white"
            >
              <Share className="h-4 w-4 mr-2" />
              Share Receipt
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-[#e78a53] hover:bg-[#e78a53]/90"
            >
              Close
            </Button>
          </div>

          {/* Footer Note */}
          <div className="text-center p-4 bg-zinc-800/30 rounded-xl border border-zinc-800">
            <p className="text-sm text-zinc-400">
              Please show this receipt when collecting your order at the canteen.
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              For any queries, please contact the canteen directly.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
