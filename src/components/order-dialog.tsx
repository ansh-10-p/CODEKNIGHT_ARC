"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Minus,
  CreditCard,
  Wallet,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string | null;
  isVeg: boolean;
  isSpicy: boolean;
  prepTime: number;
  rating: number;
  isAvailable: boolean;
  canteenName: string;
  canteenId?: string;
}

interface OrderItem extends MenuItem {
  quantity: number;
}

interface OrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  menuItem: MenuItem | null;
  onOrderSuccess: (order: any) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const DEMO_RAZORPAY_KEY_ID =
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SbORfjGVKnaETk";

export function OrderDialog({
  isOpen,
  onClose,
  menuItem,
  onOrderSuccess,
}: OrderDialogProps) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "offline">(
    "online"
  );
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    specialInstructions: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Load user info on mount
  useEffect(() => {
    try {
      const user = localStorage.getItem("currentUser");
      if (user) {
        const userData = JSON.parse(user);
        setCurrentUser(userData);
        setCustomerInfo((prev) => ({
          ...prev,
          name: userData.name || "",
          email: userData.email || "",
        }));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, []);

  // Initialize order items when menu item changes
  useEffect(() => {
    if (menuItem && isOpen) {
      setOrderItems([{ ...menuItem, quantity: 1 }]);
      setPaymentError(null);
    }
  }, [menuItem, isOpen]);

  // Load Razorpay script
  useEffect(() => {
    if (isOpen && !window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [isOpen]);

  const updateQuantity = (itemId: string, change: number) => {
    setOrderItems((prev) =>
      prev.map((item) => {
        if (item._id === itemId) {
          const newQuantity = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const calculateTotals = () => {
    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = 0;
    const deliveryFee = 0;
    const total = subtotal + tax + deliveryFee;
    return { subtotal, tax, deliveryFee, total };
  };

  const buildDemoOrder = () => {
    const { subtotal, tax, deliveryFee, total } = calculateTotals();
    const maxPrepMinutes = Math.max(...orderItems.map((item) => item.prepTime || 15), 15);
    const estimatedTime = new Date(
      Date.now() + (maxPrepMinutes + 10) * 60 * 1000
    ).toISOString();
    const orderId = `ORD-${Date.now()}`;

    return {
      _id: `demo-${orderId}`,
      orderId,
      customerId: currentUser?._id || currentUser?.id,
      customerName: customerInfo.name,
      customerRole: currentUser?.role || "student",
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      canteenId: menuItem?.canteenId || "",
      canteenName: menuItem?.canteenName || "Campus Canteen",
      items: orderItems.map((item) => ({
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        isVeg: item.isVeg,
        isSpicy: item.isSpicy,
        prepTime: item.prepTime,
      })),
      subtotal,
      tax,
      deliveryFee,
      discount: 0,
      totalAmount: total,
      paymentMethod,
      paymentStatus: paymentMethod === "online" ? "paid" : "pending",
      status: "placed",
      estimatedTime,
      specialInstructions: customerInfo.specialInstructions,
      createdAt: new Date().toISOString(),
      statusHistory: [
        {
          status: "placed",
          timestamp: new Date().toISOString(),
          note:
            paymentMethod === "online"
              ? "Demo Razorpay payment completed"
              : "Offline demo order created",
        },
      ],
    };
  };

  const ensureRazorpayLoaded = async () => {
    if (window.Razorpay) {
      return true;
    }

    await new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      ) as HTMLScriptElement | null;

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(), { once: true });
        existingScript.addEventListener(
          "error",
          () => reject(new Error("Razorpay SDK failed to load.")),
          { once: true }
        );
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("Razorpay SDK failed to load."));
      document.body.appendChild(script);
    });

    return Boolean(window.Razorpay);
  };

  const handleRazorpayPayment = async () => {
    const sdkReady = await ensureRazorpayLoaded();

    if (!sdkReady || !window.Razorpay) {
      throw new Error("Razorpay SDK is unavailable. Please refresh and try again.");
    }

    const demoOrder = buildDemoOrder();
    const amountInPaisa = Math.round(demoOrder.totalAmount * 100);

    const options = {
      key: DEMO_RAZORPAY_KEY_ID,
      amount: amountInPaisa,
      currency: "INR",
      name: "Arc Campus Food",
      description: `Order ${demoOrder.orderId}`,
      handler: (response: any) => {
        const paidOrder = {
          ...demoOrder,
          paymentStatus: "paid",
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id || `demo_rzp_${Date.now()}`,
          razorpaySignature: response.razorpay_signature,
        };

        onOrderSuccess(paidOrder);
        onClose();
        setIsLoading(false);
      },
      prefill: {
        name: customerInfo.name,
        email: customerInfo.email,
        contact: customerInfo.phone,
      },
      theme: {
        color: "#e78a53",
      },
      modal: {
        ondismiss: () => {
          setIsLoading(false);
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const handlePlaceOrder = async () => {
    if (!currentUser) {
      setPaymentError("Please login to place an order.");
      return;
    }

    if (orderItems.length === 0) {
      setPaymentError("Please add at least one item to your order.");
      return;
    }

    if (!customerInfo.name || !customerInfo.email) {
      setPaymentError("Please fill in your contact information.");
      return;
    }

    setPaymentError(null);
    setIsLoading(true);

    try {
      if (paymentMethod === "online") {
        await handleRazorpayPayment();
      } else {
        const offlineOrder = buildDemoOrder();
        onOrderSuccess(offlineOrder);
        onClose();
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setPaymentError(
        error instanceof Error
          ? error.message
          : "Error placing order. Please try again."
      );
      setIsLoading(false);
    }
  };

  const { subtotal, tax, deliveryFee, total } = calculateTotals();
  const maxPrepTime = Math.max(...orderItems.map((item) => item.prepTime), 0);

  if (!menuItem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#e78a53]" />
                  Place Order
                </DialogTitle>
                <p className="text-sm text-zinc-400 mt-2">
                  Review your order, choose a payment method, and confirm pickup from {menuItem.canteenName}.
                </p>
              </div>
              <Badge className="bg-[#e78a53]/10 border border-[#e78a53]/30 text-[#e78a53]">
                ETA {maxPrepTime + 10} min
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-zinc-800 bg-black/30 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Canteen</p>
                <p className="text-sm font-medium text-white mt-2">{menuItem.canteenName}</p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-black/30 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Items</p>
                <p className="text-sm font-medium text-white mt-2">{orderItems.length} selected</p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-black/30 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Total</p>
                <p className="text-sm font-medium text-[#e78a53] mt-2">₹{total}</p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Items */}
          <div className="space-y-4 rounded-xl border border-zinc-800 bg-black/30 p-5">
            <h3 className="text-lg font-semibold">Order Items</h3>
            {orderItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-4 p-4 bg-zinc-800/30 rounded-xl border border-zinc-800"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-zinc-400">₹{item.price} each</p>
                  <div className="flex items-center gap-2 mt-1">
                    {item.isVeg && (
                      <Badge className="bg-green-500/10 text-green-400 text-xs">
                        Veg
                      </Badge>
                    )}
                    {item.isSpicy && (
                      <Badge className="bg-red-500/10 text-red-400 text-xs">
                        Spicy
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item._id, -1)}
                    disabled={item.quantity <= 1}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item._id, 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{item.price * item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Customer Information */}
          <div className="space-y-4 rounded-xl border border-zinc-800 bg-black/30 p-5">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Name *
                </Label>
                <Input
                  value={customerInfo.name}
                  onChange={(e) =>
                    setCustomerInfo((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="bg-zinc-800/50 border-zinc-700"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email *
                </Label>
                <Input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) =>
                    setCustomerInfo((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="bg-zinc-800/50 border-zinc-700"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone (Optional)
              </Label>
              <Input
                value={customerInfo.phone}
                onChange={(e) =>
                  setCustomerInfo((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                className="bg-zinc-800/50 border-zinc-700"
              />
            </div>
            <div className="space-y-2">
              <Label>Special Instructions (Optional)</Label>
              <Textarea
                value={customerInfo.specialInstructions}
                onChange={(e) =>
                  setCustomerInfo((prev) => ({
                    ...prev,
                    specialInstructions: e.target.value,
                  }))
                }
                placeholder="Any special requests or dietary requirements..."
                className="bg-zinc-800/50 border-zinc-700"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-4 rounded-xl border border-zinc-800 bg-black/30 p-5">
            <h3 className="text-lg font-semibold">Payment Method</h3>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value: "online" | "offline") =>
                setPaymentMethod(value)
              }
            >
              <div
                className={`flex items-center space-x-2 p-4 rounded-xl border transition-colors ${
                  paymentMethod === "online"
                    ? "border-[#e78a53]/40 bg-[#e78a53]/10"
                    : "border-zinc-700 bg-zinc-800/20"
                }`}
              >
                <RadioGroupItem value="online" id="online" />
                <Label
                  htmlFor="online"
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <CreditCard className="h-4 w-4 text-[#e78a53]" />
                  <div>
                    <p className="font-medium">Pay Online</p>
                    <p className="text-sm text-zinc-400">
                      Pay securely with Razorpay
                    </p>
                  </div>
                </Label>
                <Badge className="bg-zinc-900 border border-zinc-700 text-zinc-300">
                  Recommended
                </Badge>
              </div>
              <div
                className={`flex items-center space-x-2 p-4 rounded-xl border transition-colors ${
                  paymentMethod === "offline"
                    ? "border-[#e78a53]/40 bg-[#e78a53]/10"
                    : "border-zinc-700 bg-zinc-800/20"
                }`}
              >
                <RadioGroupItem value="offline" id="offline" />
                <Label
                  htmlFor="offline"
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <Wallet className="h-4 w-4 text-[#e78a53]" />
                  <div>
                    <p className="font-medium">Pay at Canteen</p>
                    <p className="text-sm text-zinc-400">
                      Pay when you collect your order
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            <div className="rounded-xl border border-zinc-800 bg-zinc-800/30 p-4">
              <div className="flex items-start gap-3">
                {paymentMethod === "online" ? (
                  <CreditCard className="h-5 w-5 text-[#e78a53] mt-0.5" />
                ) : (
                  <Wallet className="h-5 w-5 text-[#e78a53] mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-medium text-white">
                    {paymentMethod === "online"
                      ? "Secure online payment"
                      : "Pay during pickup"}
                  </p>
                  <p className="text-sm text-zinc-400 mt-1">
                    {paymentMethod === "online"
                      ? "Razorpay checkout will open in a modal and return you here after payment."
                      : "Your order will be confirmed now and payment can be made at the canteen counter."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4 rounded-xl border border-zinc-800 bg-black/30 p-5">
            <h3 className="text-lg font-semibold">Order Summary</h3>
            <div className="p-5 bg-zinc-800/30 rounded-xl border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <Badge className="bg-[#e78a53]/10 border border-[#e78a53]/30 text-[#e78a53]">
                  {orderItems.length} {orderItems.length === 1 ? "item" : "items"}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Clock className="h-4 w-4" />
                  <span>ETA {maxPrepTime + 10} min</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {tax > 0 && (
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₹{tax}</span>
                </div>
              )}
              {deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee}</span>
                </div>
              )}
              <Separator className="bg-zinc-700" />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-[#e78a53]">₹{total}</span>
              </div>
            </div>
          </div>

          {paymentError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-200">Payment could not be started</p>
                  <p className="mt-1">{paymentError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-zinc-700 text-zinc-400 hover:text-white"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePlaceOrder}
              disabled={isLoading || orderItems.length === 0}
              className="flex-1 bg-[#e78a53] hover:bg-[#e78a53]/90 text-black font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {paymentMethod === "online" ? "Opening Razorpay..." : "Confirming Order..."}
                </>
              ) : (
                <>
                  {paymentMethod === "online" ? (
                    <CreditCard className="h-4 w-4 mr-2" />
                  ) : (
                    <Wallet className="h-4 w-4 mr-2" />
                  )}
                  {paymentMethod === "online" ? `Pay Now (₹${total})` : `Confirm Order (₹${total})`}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
