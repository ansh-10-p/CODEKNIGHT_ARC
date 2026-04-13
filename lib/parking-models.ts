import mongoose, { Schema, Document, Model } from "mongoose"

// ─── Counter for auto-increment IDs ──────────────────────────────────────────
const CounterSchema = new Schema({ _id: String, seq: { type: Number, default: 0 } })
const Counter = mongoose.models.Counter || mongoose.model("Counter", CounterSchema)

async function getNextId(name: string, prefix: string): Promise<string> {
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  )
  return `${prefix}-${String(counter.seq).padStart(3, "0")}`
}

// ─── ParkingZone ──────────────────────────────────────────────────────────────
export interface IParkingZone extends Document {
  zoneName: string
  gateLabel: string
  floors: string[]
  bikeSlots: number
  carSlots: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const ParkingZoneSchema = new Schema<IParkingZone>(
  {
    zoneName:  { type: String, required: true, unique: true, trim: true },
    gateLabel: { type: String, required: true, trim: true },
    floors:    { type: [String], default: ["G"] },
    bikeSlots: { type: Number, default: 0 },
    carSlots:  { type: Number, default: 0 },
    isActive:  { type: Boolean, default: true },
  },
  { timestamps: true }
)

export const ParkingZone: Model<IParkingZone> =
  mongoose.models.ParkingZone || mongoose.model<IParkingZone>("ParkingZone", ParkingZoneSchema)

// ─── ParkingSlot ──────────────────────────────────────────────────────────────
export interface IParkingSlot extends Document {
  slotId:      string
  zoneName:    string
  floor:       string
  vehicleType: "bike" | "car"
  state:       "available" | "occupied" | "reserved"
  reservedBy?: string | null
  occupiedBy?: string | null
  createdAt:   Date
  updatedAt:   Date
}

const ParkingSlotSchema = new Schema<IParkingSlot>(
  {
    slotId:      { type: String, required: true, unique: true, trim: true },
    zoneName:    { type: String, required: true, trim: true, index: true },
    floor:       { type: String, required: true, default: "G" },
    vehicleType: { type: String, enum: ["bike", "car"], required: true },
    state:       { type: String, enum: ["available", "occupied", "reserved"], default: "available" },
    reservedBy:  { type: String, default: null },
    occupiedBy:  { type: String, default: null },
  },
  { timestamps: true }
)

ParkingSlotSchema.index({ zoneName: 1, floor: 1 })
ParkingSlotSchema.index({ zoneName: 1, vehicleType: 1, state: 1 })

export const ParkingSlot: Model<IParkingSlot> =
  mongoose.models.ParkingSlot || mongoose.model<IParkingSlot>("ParkingSlot", ParkingSlotSchema)

// ─── ParkingRequest ───────────────────────────────────────────────────────────
export interface IParkingRequest extends Document {
  requestId:          string
  userId:             string
  userName:           string
  userEmail:          string
  userAvatar:         string
  role:               string
  vehicleNumber:      string
  vehicleType:        "bike" | "car"
  zoneName:           string
  requestedSlot:      string
  timeSlot:           string
  status:             "pending" | "approved" | "rejected" | "on_hold"
  assignedSlotId?:    mongoose.Types.ObjectId
  assignedSlotLabel?: string
  rejectionReason?:   string
  adminNote?:         string
  processedBy?:       string
  processedAt?:       Date
  createdAt:          Date
  updatedAt:          Date
}

const ParkingRequestSchema = new Schema<IParkingRequest>(
  {
    requestId:          { type: String, unique: true },
    userId:             { type: String, required: true, index: true },
    userName:           { type: String, required: true },
    userEmail:          { type: String, required: true },
    userAvatar:         { type: String, default: "U" },
    role:               { type: String, default: "student" },
    vehicleNumber:      { type: String, required: true, uppercase: true, trim: true },
    vehicleType:        { type: String, enum: ["bike", "car"], required: true },
    zoneName:           { type: String, required: true },
    requestedSlot:      { type: String, default: "Any" },
    timeSlot:           { type: String, required: true },
    status:             { type: String, enum: ["pending", "approved", "rejected", "on_hold"], default: "pending" },
    assignedSlotId:     { type: Schema.Types.ObjectId, ref: "ParkingSlot" },
    assignedSlotLabel:  { type: String },
    rejectionReason:    { type: String },
    adminNote:          { type: String },
    processedBy:        { type: String },
    processedAt:        { type: Date },
  },
  { timestamps: true }
)

// Auto-generate requestId before saving
ParkingRequestSchema.pre("save", async function (next) {
  if (!this.requestId) {
    this.requestId = await getNextId("parkingRequest", "PKR")
  }
  next()
})

ParkingRequestSchema.index({ status: 1, createdAt: -1 })
ParkingRequestSchema.index({ userId: 1, status: 1 })

export const ParkingRequest: Model<IParkingRequest> =
  mongoose.models.ParkingRequest || mongoose.model<IParkingRequest>("ParkingRequest", ParkingRequestSchema)

// ─── ParkingAllocation ────────────────────────────────────────────────────────
export interface IParkingAllocation extends Document {
  allocationId: string
  userId:       string
  userName:     string
  userEmail:    string
  role:         string
  requestId:    mongoose.Types.ObjectId
  slotId:       mongoose.Types.ObjectId
  slotLabel:    string
  zoneName:     string
  vehicleNumber:string
  vehicleType:  "bike" | "car"
  timeSlot:     string
  validFrom:    Date
  validTill:    Date
  isActive:     boolean
  createdAt:    Date
  updatedAt:    Date
}

const ParkingAllocationSchema = new Schema<IParkingAllocation>(
  {
    allocationId:  { type: String, unique: true },
    userId:        { type: String, required: true, index: true },
    userName:      { type: String, required: true },
    userEmail:     { type: String, required: true },
    role:          { type: String, default: "student" },
    requestId:     { type: Schema.Types.ObjectId, ref: "ParkingRequest", required: true },
    slotId:        { type: Schema.Types.ObjectId, ref: "ParkingSlot", required: true },
    slotLabel:     { type: String, required: true },
    zoneName:      { type: String, required: true },
    vehicleNumber: { type: String, required: true },
    vehicleType:   { type: String, enum: ["bike", "car"], required: true },
    timeSlot:      { type: String, required: true },
    validFrom:     { type: Date, required: true },
    validTill:     { type: Date, required: true },
    isActive:      { type: Boolean, default: true },
  },
  { timestamps: true }
)

ParkingAllocationSchema.pre("save", async function (next) {
  if (!this.allocationId) {
    this.allocationId = await getNextId("parkingAllocation", "PK-ST")
  }
  next()
})

export const ParkingAllocation: Model<IParkingAllocation> =
  mongoose.models.ParkingAllocation || mongoose.model<IParkingAllocation>("ParkingAllocation", ParkingAllocationSchema)