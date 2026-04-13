export interface ParkingTicketData {
  ticketId: string
  userType: "student" | "teacher"
  holderName: string
  vehicleNumber: string
  vehicleType: string
  zone: string
  slot: string
  validFrom: string
  validTill: string
  timeSlot?: string
}

export function printParkingTicket(ticket: ParkingTicketData) {
  if (typeof window === "undefined") return

  // Compact payload encoded into the QR code
  const qrPayload = JSON.stringify({
    id: ticket.ticketId,
    name: ticket.holderName,
    vehicle: ticket.vehicleNumber,
    type: ticket.vehicleType,
    zone: ticket.zone,
    slot: ticket.slot,
    from: ticket.validFrom,
    till: ticket.validTill,
  })

  const ticketHtml = `
    <html>
      <head>
        <title>Parking Ticket ${ticket.ticketId}</title>
        <!-- QRCode.js from CDN — no npm install needed -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }

          body {
            font-family: Arial, sans-serif;
            background: #0a0a0a;
            color: #fff;
            padding: 32px 16px;
          }

          .card {
            max-width: 680px;
            margin: 0 auto;
            border: 1px solid #3f3f46;
            border-radius: 14px;
            background: #18181b;
            overflow: hidden;
          }

          /* Orange header bar */
          .header {
            background: #e78a53;
            padding: 14px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .header .brand {
            font-size: 18px;
            font-weight: bold;
            color: #0a0a0a;
            letter-spacing: 0.5px;
          }
          .header .ticket-id {
            font-size: 12px;
            font-weight: bold;
            color: #0a0a0a;
            background: rgba(0,0,0,0.15);
            padding: 3px 10px;
            border-radius: 99px;
          }

          .body { padding: 24px; }

          /* Holder strip */
          .holder {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .holder-name { font-size: 20px; font-weight: bold; color: #fff; }
          .holder-meta { font-size: 12px; color: #a1a1aa; margin-top: 3px; }
          .badge {
            font-size: 10px;
            font-weight: bold;
            letter-spacing: 1px;
            padding: 4px 10px;
            border-radius: 99px;
            background: #2a1508;
            color: #e78a53;
            border: 1px solid #e78a53;
            text-transform: uppercase;
          }

          /* Info grid */
          .divider {
            border: none;
            border-top: 1px solid #3f3f46;
            margin: 0 0 20px;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 20px;
          }
          .row {
            background: #27272a;
            border-radius: 8px;
            padding: 10px 12px;
          }
          .row.full { grid-column: 1 / -1; }
          .label { color: #a1a1aa; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
          .value { color: #fff; font-weight: 600; font-size: 13px; }

          /* QR section */
          .qr-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            padding: 20px;
            background: #111113;
            border-radius: 10px;
            margin-bottom: 20px;
          }
          .qr-wrapper {
            width: 140px;
            height: 140px;
            background: #fff;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
          }
          .qr-wrapper canvas,
          .qr-wrapper img { display: block; }
          .qr-label {
            font-size: 11px;
            font-weight: bold;
            letter-spacing: 1.5px;
            color: #e78a53;
            text-transform: uppercase;
          }
          .qr-sub { font-size: 10px; color: #71717a; text-align: center; }

          /* Status pill */
          .status-row {
            display: flex;
            justify-content: center;
            margin-bottom: 16px;
          }
          .status-pill {
            font-size: 11px;
            font-weight: bold;
            letter-spacing: 1.5px;
            padding: 4px 16px;
            border-radius: 99px;
            background: #052e16;
            color: #4ade80;
            border: 1px solid #166534;
          }

          /* Footer */
          .footer-bar {
            background: #e78a53;
            padding: 8px 24px;
            font-size: 10px;
            color: #0a0a0a;
            text-align: center;
            letter-spacing: 0.3px;
          }

          /* Print overrides */
          @media print {
            body { background: #fff; color: #000; padding: 0; }
            .card { border: 1px solid #ddd; border-radius: 14px; }
            .header { background: #e78a53 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .header .brand, .header .ticket-id { color: #0a0a0a !important; }
            .body { padding: 20px; }
            .holder-name { color: #000 !important; }
            .holder-meta { color: #555 !important; }
            .row { background: #f4f4f5 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .value { color: #000 !important; }
            .label { color: #555 !important; }
            .qr-section { background: #f9f9f9 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .qr-label { color: #c56d36 !important; }
            .qr-sub { color: #888 !important; }
            .status-pill { background: #f0fdf4 !important; color: #166534 !important; border-color: #166534 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .footer-bar { background: #e78a53 !important; color: #0a0a0a !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .badge { background: #fff3e8 !important; color: #c56d36 !important; border-color: #c56d36 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="card">

          <!-- Header -->
          <div class="header">
            <span class="brand">A.R Campus Parking</span>
            <span class="ticket-id">${ticket.ticketId}</span>
          </div>

          <div class="body">

            <!-- Holder -->
            <div class="holder">
              <div>
                <div class="holder-name">${ticket.holderName}</div>
                <div class="holder-meta">${ticket.vehicleNumber} &middot; ${ticket.vehicleType}</div>
              </div>
              <span class="badge">${ticket.userType}</span>
            </div>

            <hr class="divider" />

            <!-- Info grid -->
            <div class="grid">
              <div class="row">
                <div class="label">Parking Zone</div>
                <div class="value">${ticket.zone}</div>
              </div>
              <div class="row">
                <div class="label">Allocated Slot</div>
                <div class="value">${ticket.slot}</div>
              </div>
              <div class="row full">
                <div class="label">Time Slot</div>
                <div class="value">${ticket.timeSlot || "General Access"}</div>
              </div>
              <div class="row">
                <div class="label">Valid From</div>
                <div class="value">${ticket.validFrom}</div>
              </div>
              <div class="row">
                <div class="label">Valid Till</div>
                <div class="value">${ticket.validTill}</div>
              </div>
            </div>

            <!-- QR Code -->
            <div class="qr-section">
              <div class="qr-wrapper" id="qr-container"></div>
              <div class="qr-label">Scan to Verify Ticket</div>
              <div class="qr-sub">Present this QR at the parking gate for entry / exit</div>
            </div>

            <!-- Status -->
            <div class="status-row">
              <span class="status-pill">&#9679;&nbsp; ACTIVE</span>
            </div>

          </div>

          <!-- Footer -->
          <div class="footer-bar">
            Campus Parking Management System &nbsp;&middot;&nbsp; This ticket is non-transferable
            &nbsp;&middot;&nbsp; Generated: ${new Date().toLocaleString()}
          </div>

        </div>

        <script>
          window.addEventListener("load", function () {
            new QRCode(document.getElementById("qr-container"), {
              text: ${JSON.stringify(qrPayload)},
              width: 124,
              height: 124,
              colorDark: "#000000",
              colorLight: "#ffffff",
              correctLevel: QRCode.CorrectLevel.M,
            });
            // Auto-print after QR canvas paints
            setTimeout(function () { window.print(); }, 500);
          });
        <\/script>
      </body>
    </html>
  `

  const printWindow = window.open("", "_blank", "width=900,height=750")
  if (!printWindow) return
  printWindow.document.write(ticketHtml)
  printWindow.document.close()
  printWindow.focus()
}