import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tipo = searchParams.get('tipo')
  const secret = searchParams.get('secret')

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let titulo = ''
  let mensaje = ''

  if (tipo === 'lunes') {
    titulo = '🎾 ¡Arrancó la semana!'
    mensaje = '¿Cómo arrancás esta semana mental? Acordate de registrar tus sesiones 🧠'
  } else if (tipo === 'viernes') {
    titulo = '📊 ¿Cómo fue tu semana?'
    mensaje = 'Viernes de balance mental 🎾 Si no registraste tus sesiones esta semana, ¡todavía estás a tiempo!'
  } else {
    return NextResponse.json({ error: 'Tipo invalido' }, { status: 400 })
  }

  const apiKey = process.env.ONESIGNAL_REST_API_KEY || ''
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || ''
  const authHeader = apiKey.startsWith('os_v2') ? 'Key ' + apiKey : 'Basic ' + apiKey

  const res = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
    },
    body: JSON.stringify({
      app_id: appId,
      included_segments: ['All'],
      headings: { en: titulo, es: titulo },
      contents: { en: mensaje, es: mensaje },
    }),
  })

  const data = await res.json()

  return NextResponse.json({
    ok: true,
    data,
    debug: {
      keyPrefix: apiKey.substring(0, 15),
      appId: appId.substring(0, 8),
    }
  })
}