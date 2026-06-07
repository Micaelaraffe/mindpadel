import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { preguntaId, opcion, userId } = await req.json()

  const { error } = await supabase
    .from('respuestas_pregunta')
    .upsert({ pregunta_id: preguntaId, user_id: userId, opcion })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}