import mongoose, { Schema, models, model } from "mongoose";

const EventBookingSchema = new Schema(
  {
    bookingId: { type: String, required: true, unique: true }, // Custom booking ID like EVT-2024-0001
    
    // Student Information
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    studentPhone: { type: String, required: true },
    
    // Event Information
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    eventTitle: { type: String, required: true },
    eventDate: { type: Date, required: true },
    eventVenue: { type: String, required: true },
    
    // Booking Details
    registrationDate: { type: Date, default: Date.now },
    attendeeCount: { type: Number, default: 1, min: 1 },
    
    // Payment Information
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['online', 'offline'], required: true },
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'paid', 'failed', 'refunded'], 
      default: 'pending' 
    },
    razorpayOrderId: { type: String }, // For online payments
    razorpayPaymentId: { type: String }, // For successful payments
    razorpaySignature: { type: String }, // For payment verification
    
    // Booking Status
    bookingStatus: { 
      type: String, 
      enum: ['confirmed', 'cancelled', 'attended', 'no-show'], 
      default: 'confirmed' 
    },
    
    // Additional Information
    specialRequirements: { type: String },
    
    // Cancellation
    cancellationReason: { type: String },
    cancelledBy: { type: String, enum: ['student', 'admin', 'system'] },
    cancelledAt: { type: Date },
    
    // Tracking
    statusHistory: [{
      status: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      note: { type: String }
    }],
    
    // Receipt and confirmation
    receiptGenerated: { type: Boolean, default: false },
    confirmationEmailSent: { type: Boolean, default: false },
    
    // Check-in information
    checkedInAt: { type: Date },
    checkedInBy: { type: String }
  },
  { timestamps: true }
);

// Indexes for efficient querying
EventBookingSchema.index({ studentId: 1, createdAt: -1 });
EventBookingSchema.index({ eventId: 1, createdAt: -1 });
EventBookingSchema.index({ bookingId: 1 });
EventBookingSchema.index({ bookingStatus: 1 });
EventBookingSchema.index({ paymentStatus: 1 });
EventBookingSchema.index({ razorpayOrderId: 1 });

// Method to add status to history
EventBookingSchema.methods.addStatusHistory = function(status: string, note?: string) {
  this.statusHistory.push({
    status,
    timestamp: new Date(),
    note
  });
  this.bookingStatus = status;
};

// Method to generate booking ID
EventBookingSchema.statics.generateBookingId = async function() {
  const count = await this.countDocuments();
  const year = new Date().getFullYear();
  const bookingNumber = (count + 1).toString().padStart(4, '0');
  return `EVT-${year}-${bookingNumber}`;
};

export const EventBookingModel = models.EventBooking || model("EventBooking", EventBookingSchema);
