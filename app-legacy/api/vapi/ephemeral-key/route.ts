import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const apiKey = process.env.VAPI_API_KEY
  const assistantId = process.env.VAPI_ASSISTANT_ID
  if (!apiKey || !assistantId) {
    return NextResponse.json({ error: 'VAPI_API_KEY or VAPI_ASSISTANT_ID missing' }, { status: 400 })
  }
  try {
    const r = await fetch('https://api.vapi.ai/ephemeral-keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ assistantId }),
    })
    if (!r.ok) {
      return NextResponse.json({ error: 'Failed to create ephemeral key', status: r.status }, { status: 500 })
    }
    const data = await r.json()
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
