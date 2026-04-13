"use client"

import { useState, useCallback } from "react"
import { StudentSidebar } from "@/components/student-sidebar"
import { UserMenu } from "@/components/user-menu"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { printParkingTicket } from "@/lib/parking-ticket"
import { ParkingForecastCard } from "@/components/parking-forecast-card"

// ─── Types ───────────────────────────────────────────────────────────────────
type SlotState = "available" | "occupied" | "reserved"
type VehicleType = "bike" | "car"

interface ParkingSlot {
  id: string
  state: SlotState
  type: VehicleType
}

interface Allocation {
  id: string
  zone: string
  slot: string
  timeSlot: string
  validFrom: string
  validTill: string
  status: "active" | "expired"
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────
function CarIcon({ slotState }: { slotState: SlotState }) {
  const bodyColor =
    slotState === "available"
      ? "#166534"
      : slotState === "occupied"
      ? "#7f1d1d"
      : slotState === "reserved"
      ? "#1e3a5f"
      : "#92400e"
  return (
    <svg viewBox="0 0 48 32" fill="none" className="w-12 h-8">
      <rect fill={bodyColor} x="4" y="12" width="40" height="14" rx="4" />
      <path fill={bodyColor} d="M10 12L14 4h20l4 8" />
      <rect fill="#1e293b" x="15" y="5" width="8" height="6" rx="1.5" />
      <rect fill="#1e293b" x="25" y="5" width="8" height="6" rx="1.5" />
      <circle fill="#1e293b" stroke="#475569" strokeWidth="0.5" cx="12" cy="26" r="4" />
      <circle fill="#1e293b" stroke="#475569" strokeWidth="0.5" cx="36" cy="26" r="4" />
      <rect fill="#fbbf24" x="4" y="16" width="4" height="3" rx="1" />
      <rect fill="#fbbf24" x="40" y="16" width="4" height="3" rx="1" />
    </svg>
  )
}

function BikeIcon({ slotState }: { slotState: SlotState }) {
  const frameColor =
    slotState === "available"
      ? "#166534"
      : slotState === "occupied"
      ? "#7f1d1d"
      : slotState === "reserved"
      ? "#1e3a5f"
      : "#92400e"
  const wheelStroke =
    slotState === "available"
      ? "#4ade80"
      : slotState === "occupied"
      ? "#f87171"
      : slotState === "reserved"
      ? "#60a5fa"
      : "#e78a53"
  return (
    <svg viewBox="0 0 56 32" fill="none" className="w-14 h-8">
      <circle cx="10" cy="22" r="7" fill="none" stroke={wheelStroke} strokeWidth="2.5" />
      <circle cx="46" cy="22" r="7" fill="none" stroke={wheelStroke} strokeWidth="2.5" />
      <circle cx="10" cy="22" r="2.5" fill="#334155" />
      <circle cx="46" cy="22" r="2.5" fill="#334155" />
      <path d="M10 22L22 10L32 22" stroke={frameColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 22L46 22" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32 22L38 12L46 22" stroke={frameColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect fill="#1e293b" x="18" y="8" width="12" height="3" rx="1.5" />
      <path d="M38 10L42 8" stroke={frameColor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// ─── Data helpers ─────────────────────────────────────────────────────────────
const STATES: SlotState[] = ["available", "available", "available", "available", "occupied", "occupied", "reserved"]
const TYPES: VehicleType[] = ["bike", "bike", "car", "car", "bike", "car", "bike", "car", "bike", "car", "bike", "car"]

function generateSlots(loc: string, flr: string): ParkingSlot[] {
  return Array.from({ length: 12 }, (_, i) => ({
    id: `${loc}${flr}-${String(i + 1).padStart(2, "0")}`,
    state: STATES[Math.floor(Math.random() * STATES.length)],
    type: TYPES[i % TYPES.length],
  }))
}

const LOCATIONS: Record<string, { name: string; floors: Record<string, ParkingSlot[]> }> = {
  A: { name: "Student Block A — Gate 1", floors: { G: generateSlots("A", "G"), "1": generateSlots("A", "1"), "2": generateSlots("A", "2") } },
  B: { name: "Student Block B — Gate 2", floors: { G: generateSlots("B", "G"), "1": generateSlots("B", "1"), "2": generateSlots("B", "2") } },
  C: { name: "Faculty Block — Gate 3", floors: { G: generateSlots("C", "G"), "1": generateSlots("C", "1"), "2": generateSlots("C", "2") } },
  D: { name: "Visitor Parking — Main Entrance", floors: { G: generateSlots("D", "G"), "1": generateSlots("D", "1"), "2": generateSlots("D", "2") } },
}

const ALLOCATIONS: Allocation[] = [
  { id: "PK-ST-101", zone: "Student Block A", slot: "A-21", timeSlot: "09:00 AM – 06:00 PM", validFrom: "01 Apr 2026", validTill: "30 Apr 2026", status: "active" },
  { id: "PK-ST-081", zone: "Student Block B", slot: "B-10", timeSlot: "10:00 AM – 05:00 PM", validFrom: "01 Mar 2026", validTill: "01 Apr 2026", status: "expired" },
]

// ─── Slot card ────────────────────────────────────────────────────────────────
function SlotCard({
  slot,
  selected,
  onSelect,
}: {
  slot: ParkingSlot
  selected: boolean
  onSelect: (slot: ParkingSlot) => void
}) {
  const isClickable = slot.state === "available"
  const stateClass = selected ? "selected" : slot.state

  const borderColor =
    selected
      ? "border-[#e78a53] bg-[#2a1508]"
      : slot.state === "available"
      ? "border-green-900 bg-[#0c1e12] hover:border-[#e78a53] hover:bg-[#1e1209] hover:scale-[1.03]"
      : slot.state === "occupied"
      ? "border-red-900 bg-[#1a0a0a] opacity-80 cursor-not-allowed"
      : "border-blue-900 bg-[#0c1220] cursor-not-allowed"

  const idColor =
    selected
      ? "text-[#e78a53]"
      : slot.state === "available"
      ? "text-green-400"
      : slot.state === "occupied"
      ? "text-red-400"
      : "text-blue-400"

  return (
    <div
      onClick={() => isClickable && onSelect(slot)}
      title={`${slot.id} — ${slot.type} — ${slot.state}`}
      className={`relative border rounded-xl p-2 flex flex-col items-center gap-1 min-h-[90px] justify-center transition-all duration-200 ${borderColor} ${isClickable ? "cursor-pointer" : ""}`}
    >
      {selected && (
        <div className="absolute inset-[-1px] rounded-xl border-2 border-[#e78a53] animate-ping opacity-0 pointer-events-none" />
      )}
      <span className={`text-[10px] font-semibold tracking-wide ${idColor}`}>{slot.id}</span>
      {slot.type === "car" ? (
        <CarIcon slotState={selected ? ("selected" as SlotState) : slot.state} />
      ) : (
        <BikeIcon slotState={selected ? ("selected" as SlotState) : slot.state} />
      )}
      <span className="text-[9px] text-zinc-500 tracking-wide">
        {slot.type === "bike" ? "2-WHEELER" : "4-WHEELER"}
      </span>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function StudentParkingPage() {
  const [locationKey, setLocationKey] = useState("A")
  const [floor, setFloor] = useState("G")
  const [filter, setFilter] = useState("all")
  const [slots, setSlots] = useState<Record<string, Record<string, ParkingSlot[]>>>(
    Object.fromEntries(
      Object.entries(LOCATIONS).map(([k, v]) => [k, v.floors])
    )
  )
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null)
  const [vehicleType, setVehicleType] = useState<VehicleType>("bike")
  const [vehicleNumber, setVehicleNumber] = useState("MH12AB1234")
  const [timeSlot, setTimeSlot] = useState("09:00 AM – 06:00 PM")
  const [toast, setToast] = useState("")

  const currentSlots = slots[locationKey][floor]
  const visible =
    filter === "available"
      ? currentSlots.filter((s) => s.state === "available")
      : filter === "bike"
      ? currentSlots.filter((s) => s.type === "bike")
      : filter === "car"
      ? currentSlots.filter((s) => s.type === "car")
      : currentSlots

  const half = Math.ceil(visible.length / 2)
  const leftLane = visible.slice(0, half)
  const rightLane = visible.slice(half)

  const availCount = currentSlots.filter((s) => s.state === "available").length
  const occCount = currentSlots.filter((s) => s.state === "occupied").length

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(""), 3000)
  }

  const handleSelect = useCallback(
    (slot: ParkingSlot) => {
      setSelectedSlot(slot)
      setVehicleType(slot.type)
    },
    []
  )

  const handleBook = () => {
    if (!selectedSlot) return
    setSlots((prev) => ({
      ...prev,
      [locationKey]: {
        ...prev[locationKey],
        [floor]: prev[locationKey][floor].map((s) =>
          s.id === selectedSlot.id ? { ...s, state: "reserved" as SlotState } : s
        ),
      },
    }))
    showToast(`Slot ${selectedSlot.id} booked successfully!`)
    setSelectedSlot(null)
  }

  const locationOptions = [
    { value: "A", label: "Student Block A — Gate 1" },
    { value: "B", label: "Student Block B — Gate 2" },
    { value: "C", label: "Faculty Block — Gate 3" },
    { value: "D", label: "Visitor Parking — Main Entrance" },
  ]
  const floorOptions = [
    { value: "G", label: "Ground Floor" },
    { value: "1", label: "Level 1" },
    { value: "2", label: "Level 2" },
  ]

  const locLabel = locationOptions.find((o) => o.value === locationKey)?.label ?? ""
  const flrLabel = floorOptions.find((o) => o.value === floor)?.label ?? ""

  return (
    <div className="min-h-screen bg-black flex font-sans">
      <StudentSidebar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
          <div className="px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Parking Allocation</h1>
              <p className="text-zinc-400 mt-1 text-sm">Select your spot on the live lot map</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5 text-zinc-400" />
              </Button>
              <UserMenu />
            </div>
          </div>
        </header>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: lot map */}
          <div className="lg:col-span-2 space-y-5">

            {/* Controls */}
            <div className="flex flex-wrap gap-4">
              {[
                { label: "Location", value: locationKey, onChange: (v: string) => { setLocationKey(v); setSelectedSlot(null) }, options: locationOptions },
                { label: "Floor / Level", value: floor, onChange: (v: string) => { setFloor(v); setSelectedSlot(null) }, options: floorOptions },
                {
                  label: "Filter",
                  value: filter,
                  onChange: (v: string) => setFilter(v),
                  options: [
                    { value: "all", label: "All Slots" },
                    { value: "available", label: "Available Only" },
                    { value: "bike", label: "2-Wheeler Slots" },
                    { value: "car", label: "4-Wheeler Slots" },
                  ],
                },
              ].map((ctrl) => (
                <div key={ctrl.label} className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-zinc-500">{ctrl.label}</label>
                  <select
                    value={ctrl.value}
                    onChange={(e) => ctrl.onChange(e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-[#e78a53] transition-colors cursor-pointer"
                  >
                    {ctrl.options.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "AVAILABLE", value: availCount, color: "text-green-400" },
                { label: "OCCUPIED", value: occCount, color: "text-red-400" },
                { label: "TOTAL SLOTS", value: currentSlots.length, color: "text-[#e78a53]" },
              ].map((s) => (
                <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] text-zinc-500 tracking-widest mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-5">
              {[
                { label: "Available", cls: "bg-green-950 border border-green-800" },
                { label: "Occupied", cls: "bg-red-950 border border-red-900" },
                { label: "Your selection", cls: "bg-[#2a1508] border border-[#e78a53]" },
                { label: "Reserved", cls: "bg-blue-950 border border-blue-900" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-2 text-xs text-zinc-400">
                  <div className={`w-3 h-3 rounded-[3px] ${l.cls}`} />
                  {l.label}
                </div>
              ))}
            </div>

            {/* Lot map */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              {/* Entry label */}
              <div className="text-center text-[11px] tracking-[2px] text-zinc-500 mb-5 pb-4 border-b-2 border-dashed border-zinc-800 relative">
                ENTRY / EXIT &mdash; {locLabel.toUpperCase()} &mdash; {flrLabel.toUpperCase()}
                <span className="absolute bottom-[-2px] left-[calc(50%-60px)] w-10 h-0.5 bg-[#e78a53]" />
                <span className="absolute bottom-[-2px] left-[calc(50%+20px)] w-10 h-0.5 bg-[#e78a53]" />
              </div>

              {/* Grid: left lane | divider | right lane */}
              <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 24px 1fr" }}>
                <div className="flex flex-col gap-2">
                  {leftLane.map((slot) => (
                    <SlotCard
                      key={slot.id}
                      slot={slot}
                      selected={selectedSlot?.id === slot.id}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>

                {/* Dashed center lane */}
                <div className="flex justify-center">
                  <div
                    className="w-0.5 h-full"
                    style={{
                      background: "repeating-linear-gradient(to bottom, #3f3f46 0, #3f3f46 8px, transparent 8px, transparent 16px)",
                    }}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  {rightLane.map((slot) => (
                    <SlotCard
                      key={slot.id}
                      slot={slot}
                      selected={selectedSlot?.id === slot.id}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-6">

            {/* Book a spot */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-1">Book a Spot</h2>
              <p className="text-zinc-500 text-xs mb-5">Fill details &amp; tap an available slot</p>

              {/* Vehicle type toggle */}
              <div className="mb-4">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 block mb-2">Vehicle Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "bike" as VehicleType, label: "2-Wheeler" },
                    { value: "car" as VehicleType, label: "4-Wheeler" },
                  ].map((btn) => (
                    <button
                      key={btn.value}
                      onClick={() => setVehicleType(btn.value)}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm border transition-all ${
                        vehicleType === btn.value
                          ? "bg-[#2a1508] border-[#e78a53] text-[#e78a53]"
                          : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"
                      }`}
                    >
                      {btn.value === "bike" ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6h-5l-3 7h11.5M15 6l2.5 5.5"/></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h14l3 5v5a2 2 0 01-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
                      )}
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle number */}
              <div className="mb-4">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 block mb-2">Vehicle Number</label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="e.g. MH12AB1234"
                  className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#e78a53] transition-colors"
                />
              </div>

              {/* Time slot */}
              <div className="mb-4">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 block mb-2">Time Slot</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#e78a53] transition-colors cursor-pointer"
                >
                  <option>09:00 AM – 06:00 PM</option>
                  <option>06:00 AM – 02:00 PM</option>
                  <option>02:00 PM – 10:00 PM</option>
                  <option>All Day Pass</option>
                </select>
              </div>

              {/* Selected slot preview */}
              {selectedSlot && (
                <div className="bg-[#1a0e04] border border-[#3a2010] rounded-xl p-3 mb-4">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Selected Slot</div>
                  <div className="text-[#e78a53] font-bold text-xl">{selectedSlot.id}</div>
                  <div className="text-xs text-zinc-500 mt-1">
                    {selectedSlot.type === "bike" ? "2-Wheeler" : "4-Wheeler"} &middot; {locLabel}
                  </div>
                </div>
              )}

              <button
                disabled={!selectedSlot}
                onClick={handleBook}
                className={`w-full py-3 rounded-xl font-semibold text-sm tracking-wide transition-all ${
                  selectedSlot
                    ? "bg-[#e78a53] text-white hover:bg-[#f0a86d] hover:-translate-y-0.5 active:translate-y-0"
                    : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                }`}
              >
                {selectedSlot ? "Confirm Booking" : "Select a slot to book"}
              </button>
            </div>

            {/* My Allocations */}
            <div>
              <h2 className="text-white font-semibold mb-3">My Allocations</h2>
              <div className="flex flex-col gap-3">
                {ALLOCATIONS.map((item) => (
                  <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-semibold text-sm">{item.id}</span>
                      <span
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-full tracking-widest ${
                          item.status === "active"
                            ? "bg-green-950 text-green-400 border border-green-900"
                            : "bg-red-950 text-red-400 border border-red-900"
                        }`}
                      >
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <svg className="w-3 h-3 text-[#e78a53]" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M6 8.5C3.5 8.5 2 9.5 2 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                      {item.zone} — Slot {item.slot}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-1">
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1"/><path d="M6 3.5V6l1.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>
                      {item.timeSlot} &nbsp;|&nbsp; Till {item.validTill}
                    </div>
                    {item.status === "active" && (
                      <button
                        onClick={() =>
                          printParkingTicket({
                            ticketId: item.id,
                            userType: "student",
                            holderName: "Rahul Sharma",
                            vehicleNumber,
                            vehicleType,
                            zone: item.zone,
                            slot: item.slot,
                            timeSlot: item.timeSlot,
                            validFrom: item.validFrom,
                            validTill: item.validTill,
                          })
                        }
                        className="mt-3 w-full py-2 rounded-lg text-xs text-[#e78a53] border border-[#e78a53] hover:bg-[#1a0a02] transition-colors"
                      >
                        Download Ticket PDF
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Parking Forecast */}
            <ParkingForecastCard />
          </div>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-green-950 border border-green-700 text-green-400 px-5 py-3 rounded-xl text-sm font-medium z-50 animate-in slide-in-from-bottom-4 duration-300">
          {toast}
        </div>
      )}
    </div>
  )
}