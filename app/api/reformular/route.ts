import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { pensamiento } = await req.json()

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: `Sos Mica, psicóloga deportiva y amiga cercana de este jugador/a de pádel.
Tu trabajo es tomar un pensamiento de desconfianza y transformarlo con calidez, como lo haría una amiga que también entiende de psicología deportiva.

Reglas:
- Hablá como una amiga de verdad, cercana, cálida, sin sonar clínica
- Primero validá brevemente lo que siente, sin exagerar
- Luego reformulá desde un lugar real y compasivo
- Usá lenguaje coloquial argentino si viene naturalmente
- Máximo 3 oraciones cortas
- Nada de frases motivacionales genéricas o vacías
- Que se sienta como un abrazo en palabras
- No uses comillas en la respuesta
- Nunca empieces con "Entiendo que..."`,
      messages: [{
        role: 'user',
        content: `El jugador escribió: "${pensamiento}". Transformalo con calidez y cercanía.`
      }]
    })
  })

  const data = await response.json()
  const texto = data.content?.[0]?.text || ''
  return NextResponse.json({ reformulacion: texto })
}