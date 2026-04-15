import mongoose, { Schema, models, model } from "mongoose";

const OrderItemSchema = new Schema({
  menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
  isVeg: { type: Boolean, default: true },
  isSpicy: { type: Boolean, default: false },
  prepTime: { type: Number, default: 15 }
}, { _id: false });

const OrderSchema = new Schema(
  {
    orderId: { type: String, required: true, unique: true }, // Custom order ID like ORD-2024-0001
    customerId: { type: Schema.Types.ObjectId, required: true }, // Student or Teacher ID
    customerName: { type: String, required: true },
    customerRole: { type: String, enum: ['student', 'teacher'], required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String },
    
    canteenId: { type: Schema.Types.ObjectId, ref: 'Canteen', required: true },
    canteenName: { type: String, required: true },
    
    items: [OrderItemSchema],
    
    // Pricing
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    
    // Payment
    paymentMethod: { type: String, enum: ['online', 'offline'], required: true },
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'paid', 'failed', 'refunded'], 
      default: 'pending' 
    },
    razorpayOrderId: { type: String }, // For online payments
    razorpayPaymentId: { type: String }, // For successful payments
    razorpaySignature: { type: String }, // For payment verification
    
    // Order Status
    status: { 
      type: String, 
      enum: ['placed', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'], 
      default: 'placed' 
    },
    
    // Timing
    orderDate: { type: Date, default: Date.now },
    estimatedTime: { type: Date }, // When order will be ready
    completedAt: { type: Date },
    
    // Additional Info
    specialInstructions: { type: String },
    deliveryType: { type: String, enum: ['pickup', 'delivery'], default: 'pickup' },
    deliveryAddress: { type: String },
    
    // Tracking
    statusHistory: [{
      status: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      note: { type: String }
    }],
    
    // Rating (after completion)
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String },
    
    // Cancellation
    cancellationReason: { type: String },
    cancelledBy: { type: String, enum: ['customer', 'canteen', 'system'] },
    cancelledAt: { type: Date }
  },
  { timestamps: true }
);

// Indexes for efficient querying
OrderSchema.index({ customerId: 1, createdAt: -1 });
OrderSchema.index({ canteenId: 1, createdAt: -1 });
OrderSchema.index({ orderId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ razorpayOrderId: 1 });



// Method to add status to history
OrderSchema.methods.addStatusHistory = function(status: string, note?: string) {
  this.statusHistory.push({
    status,
    timestamp: new Date(),
    note
  });
  this.status = status;
};

export const OrderModel = models.Order || model("Order", OrderSchema);