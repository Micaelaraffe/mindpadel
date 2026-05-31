import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { titulo, mensaje, jugadorId } = await req.json()

  const body: any = {
    app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
    headings: { en: titulo, es: titulo },
    contents: { en: mensaje, es: mensaje },
  }

  if (jugadorId) {
    body.filters = [
      { field: 'tag', key: 'user_id', relation: '=', value: jugadorId }
    ]
  } else {
    body.included_segments = ['All']
  }

  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Key ${process.env.ONESIGNAL_REST_API_KEY}`,
    },
    body: JSON.stringify(body),
  })

  const data = await response.json()
  return NextResponse.json(data)
}