'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

const situaciones = [
  {
    nivel: 'Nivel 1 — Arranque',
    texto: 'Es el primer punto del tie break. Sentís un poco de tensión en el cuerpo. ¿Qué hacés antes de empezar?',
    opciones: [
      { texto: 'Respirás hondo, hacés tu ritual y te decís "primer punto, a jugar"', correcta: true, explicacion: '' },
      { texto: 'Te decís que tenés que ganar sí o sí este punto', correcta: false, explicacion: 'La presión de "ganar sí o sí" activa el sistema de amenaza y reduce tu rendimiento. Mejor foco en el proceso.' },
      { texto: 'Ignorás la tensión y arrancás sin pensar', correcta: false, explicacion: 'Ignorar la activación no la elimina. Usarla con un ritual es más efectivo.' },
    ]
  },
  {
    nivel: 'Nivel 2 — Error propio',
    texto: 'Cometiste un error no forzado. El rival festeja. Quedan 6 puntos por jugar. ¿Qué hacés?',
    opciones: [
      { texto: 'Te retás internamente para no volver a errar', correcta: false, explicacion: 'El autocastigo activa el sistema límbico y baja la concentración. No ayuda.' },
      { texto: 'Respirás, soltás el error y te enfocás en el próximo punto', correcta: true, explicacion: '' },
      { texto: 'Le preguntás algo a tu compañero para distraerte', correcta: false, explicacion: 'Buscar distracción externa no procesa el error. El ritual interno es más eficiente.' },
    ]
  },
  {
    nivel: 'Nivel 3 — Presión externa',
    texto: 'El público está a favor del rival. Cada punto que pierden genera ruido. ¿Cómo manejás el ambiente?',
    opciones: [
      { texto: 'Te enojás con el público y perdés foco', correcta: false, explicacion: 'El enojo desplaza el foco de lo que controlás a lo que no controlás.' },
      { texto: 'Usás el ruido como señal para activarte más', correcta: true, explicacion: '' },
      { texto: 'Te aislás completamente y no procesás nada del exterior', correcta: false, explicacion: 'El aislamiento total genera rigidez. Lo óptimo es filtrar selectivamente.' },
    ]
  },
  {
    nivel: 'Nivel 4 — Ventaja propia',
    texto: 'Ganás 5-3. Estás cerca. Sentís que aflojás un poco. ¿Qué hacés?',
    opciones: [
      { texto: 'Te decís que ya está, que el partido es tuyo', correcta: false, explicacion: 'Anticipar el resultado activa la relajación prematura. Sigue punto a punto.' },
      { texto: 'Mantenés el ritual y jugás cada punto como si fuera 0-0', correcta: true, explicacion: '' },
      { texto: 'Jugás más conservador para no errar', correcta: false, explicacion: 'El juego conservador por miedo al error cambia tu esquema motor y genera más errores.' },
    ]
  },
  {
    nivel: 'Nivel 5 — Desventaja',
    texto: 'Perdés 3-6. Necesitás ganar los últimos 4 puntos seguidos. ¿Qué te decís?',
    opciones: [
      { texto: '"Tenemos que remontar esto sí o sí"', correcta: false, explicacion: 'La presión de remontar de golpe genera ansiedad. Mejor un punto a la vez.' },
      { texto: '"Un punto a la vez. Arrancamos"', correcta: true, explicacion: '' },
      { texto: '"Ya fue, esto está perdido"', correcta: false, explicacion: 'La rendición mental antes del final corta el acceso a tus recursos. Nunca se termina antes del último punto.' },
    ]
  },
  {
    nivel: 'Nivel 6 — Error del compañero',
    texto: 'Tu compañero falla un remate fácil en el punto más importante. ¿Cómo reaccionás?',
    opciones: [
      { texto: 'Lo mirás con cara de reproche', correcta: false, explicacion: 'El reproche no verbal aumenta la presión sobre el compañero y rompe la cohesión del equipo.' },
      { texto: 'Le decís "no pasa nada, siguiente" y seguís', correcta: true, explicacion: '' },
      { texto: 'No decís nada y seguís en silencio', correcta: false, explicacion: 'El silencio puede interpretarse como enojo. Una palabra de apoyo mantiene la conexión.' },
    ]
  },
  {
    nivel: 'Nivel 7 — Punto de partido',
    texto: 'Llegaron al 6-6. Próximo punto define. Sentís que el cuerpo se tensa. ¿Qué hacés?',
    opciones: [
      { texto: 'Respirás profundo, recordás tu frase ancla y confiás en lo que entrenaste', correcta: true, explicacion: '' },
      { texto: 'Te decís que no podés fallar', correcta: false, explicacion: '"No fallar" pone el foco en el error. El cerebro procesa la instrucción sin el "no". Mejor decirte lo que SÍ querés hacer.' },
      { texto: 'Intentás un golpe que nunca practicaste para sorprender', correcta: false, explicacion: 'Bajo presión el cerebro vuelve a lo automatizado. Los movimientos nuevos tienen más margen de error.' },
    ]
  },
]

export default function JuegoTieBreak({ userId, onSalir }: { userId: string, onSalir: () => void }) {
  const [fase, setFase] = useState<'intro' | 'jugando' | 'fin'>('intro')
  const [indice, setIndice] = useState(0)
  const [puntos, setPuntos] = useState(0)
  const [rival, setRival] = useState(0)
  const [seleccionado, setSeleccionado] = useState<number | null>(null)
  const [guardado, setGuardado] = useState(false)

  const situacion = situaciones[indice]

  function elegir(i: number) {
    if (seleccionado !== null) return
    setSeleccionado(i)
    const correcta = situacion.opciones[i].correcta
    if (correcta) setPuntos(p => p + 1)
    else setRival(r => r + 1)
  }

  function siguiente() {
    if (indice < situaciones.length - 1) {
      setIndice(i => i + 1)
      setSeleccionado(null)
    } else {
      const puntajeTotal = puntos + (situacion.opciones[seleccionado!].correcta ? 1 : 0)
      if (!guardado) {
        supabase.from('juegos_resultados').insert({
          user_id: userId,
          juego: 'tiebreak',
          puntaje: puntajeTotal
        }).then(({ error }) => console.log(error ? error.message : 'guardado OK'))
        setGuardado(true)
      }
      setFase('fin')
    }
  }

  function reiniciar() {
    setIndice(0)
    setPuntos(0)
    setRival(0)
    setSeleccionado(null)
    setGuardado(false)
    setFase('jugando')
  }

  const puntajeActual = puntos + (seleccionado !== null && situacion.opciones[seleccionado].correcta ? 1 : 0)
  const rivalActual = rival + (seleccionado !== null && !situacion.opciones[seleccionado].correcta ? 1 : 0)

  if (fase === 'intro') return (
    <main style={{ minHeight: '100vh', fontFamily: 'system-ui', color: '#f0f0f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 50, marginBottom: 16 }}>🧠</div>
      <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 8 }}>Tie Break Mental</div>
      <div style={{ fontSize: 14, color: '#888', marginBottom: 6, lineHeight: 1.6 }}>7 situaciones de presión real en el tie break. Tomá decisiones mentales y sumá puntos.</div>
      <div style={{ fontSize: 13, color: '#666', marginBottom: 28 }}>¿Podés cerrar el tie break con la cabeza?</div>
      <button onClick={() => setFase('jugando')} style={{ background: '#a3e635', color: '#0a0a0a', border: 'none', borderRadius: 14, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 12 }}>
        Empezar tie break
      </button>
      <button onClick={onSalir} style={{ background: 'transparent', color: '#666', border: 'none', fontSize: 13, cursor: 'pointer' }}>Volver</button>
    </main>
  )

  if (fase === 'fin') {
    const pFinal = puntos
    let titulo = '', sub = ''
    if (pFinal >= 6) { titulo = '¡Tie break ganado! 🏆'; sub = `Cerraste ${pFinal}-${rival}. Tomaste buenas decisiones bajo presión.` }
    else if (pFinal === rival) { titulo = 'Tie break empatado ⚖️'; sub = `Terminaron ${pFinal}-${rival}. Bien en algunos momentos, con margen para crecer.` }
    else { titulo = 'Tie break perdido... por ahora 💪'; sub = `Quedaste ${pFinal}-${rival}. Los errores mentales de hoy los vas a reconocer en cancha.` }

    return (
      <main style={{ minHeight: '100vh', fontFamily: 'system-ui', color: '#f0f0f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🏁</div>
        <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 12 }}>{titulo}</div>

        <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
          <div style={{ background: 'rgba(163,230,53,0.1)', border: '1px solid rgba(163,230,53,0.3)', borderRadius: 14, padding: '16px 28px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#a3e635' }}>{pFinal}</div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>Tus puntos</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px 28px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#888' }}>{rival}</div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>Rival</div>
          </div>
        </div>

        <div style={{ fontSize: 14, color: '#888', marginBottom: 24, lineHeight: 1.6, maxWidth: 320 }}>{sub}</div>
        <button onClick={reiniciar} style={{ background: '#a3e635', color: '#0a0a0a', border: 'none', borderRadius: 14, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 12 }}>
          Jugar de nuevo
        </button>
        <button onClick={onSalir} style={{ background: 'rgba(163,230,53,0.1)', color: '#a3e635', border: '1px solid rgba(163,230,53,0.3)', borderRadius: 12, padding: '12px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          Ver mi ranking 🏆
        </button>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', fontFamily: 'system-ui', color: '#f0f0f0', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 12px' }}>
        <div onClick={onSalir} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(163,230,53,0.15)', border: '1.5px solid rgba(163,230,53,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer', color: '#a3e635' }}>←</div>
        <div style={{ fontWeight: 700, fontSize: 14 }}>🧠 Tie Break Mental</div>
        <div style={{ fontSize: 12, color: '#888' }}>{indice + 1}/7</div>
      </div>

      {/* MARCADOR */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, padding: '8px 20px 16px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#a3e635' }}>{puntos}</div>
          <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Vos</div>
        </div>
        <div style={{ fontSize: 22, color: '#333', fontWeight: 700, alignSelf: 'center' }}>—</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#888' }}>{rival}</div>
          <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rival</div>
        </div>
      </div>

      <div style={{ padding: '0 20px 40px' }}>
        {/* NIVEL */}
        <div style={{ fontSize: 10, color: '#a3e635', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 8 }}>{situacion.nivel}</div>

        {/* SITUACIÓN */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 15, lineHeight: 1.6, color: '#f0f0f0' }}>{situacion.texto}</div>
        </div>

        {/* OPCIONES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {situacion.opciones.map((op, i) => {
            const estaSeleccionado = seleccionado === i
            const yaRespondio = seleccionado !== null
            const esCorrecta = op.correcta
            let bg = 'rgba(255,255,255,0.03)'
            let border = '0.5px solid rgba(255,255,255,0.08)'
            let color = '#ccc'
            if (yaRespondio) {
              if (esCorrecta) { bg = 'rgba(163,230,53,0.1)'; border = '1px solid rgba(163,230,53,0.4)'; color = '#a3e635' }
              else if (estaSeleccionado) { bg = 'rgba(239,68,68,0.1)'; border = '1px solid rgba(239,68,68,0.3)'; color = '#f87171' }
            }
            return (
              <div key={i} onClick={() => elegir(i)} style={{ background: bg, border, borderRadius: 12, padding: '12px 16px', cursor: yaRespondio ? 'default' : 'pointer' }}>
                <div style={{ fontSize: 13, color, lineHeight: 1.5 }}>{op.texto}</div>
                {yaRespondio && estaSeleccionado && !op.correcta && (
                  <div style={{ fontSize: 12, color: '#f87171', marginTop: 8, lineHeight: 1.5 }}>{op.explicacion}</div>
                )}
                {yaRespondio && esCorrecta && (
                  <div style={{ fontSize: 12, color: '#a3e635', marginTop: 4 }}>✓ Decisión correcta</div>
                )}
              </div>
            )
          })}
        </div>

        {/* BOTÓN SIGUIENTE */}
        {seleccionado !== null && (
          <button onClick={siguiente} style={{ width: '100%', background: '#a3e635', color: '#0a0a0a', border: 'none', borderRadius: 14, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            {indice < situaciones.length - 1 ? 'Siguiente punto →' : 'Ver resultado final'}
          </button>
        )}
      </div>
    </main>
  )
}