'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

const fortalezas = [
  { icon: '🔥', label: 'Persistencia' },
  { icon: '🦁', label: 'Valentía' },
  { icon: '🎯', label: 'Foco' },
  { icon: '🌊', label: 'Calma' },
  { icon: '💡', label: 'Creatividad' },
  { icon: '👑', label: 'Liderazgo' },
  { icon: '💪', label: 'Resiliencia' },
  { icon: '⚡', label: 'Actitud' },
  { icon: '🤝', label: 'Compañerismo' },
  { icon: '🧠', label: 'Inteligencia' },
  { icon: '🌟', label: 'Constancia' },
  { icon: '🎾', label: 'Técnica' },
]

function emojiConfianza(val: number) {
  if (val <= 2) return '😔'
  if (val <= 4) return '😕'
  if (val <= 6) return '😐'
  if (val <= 8) return '😊'
  return '🔥'
}

function labelConfianza(val: number) {
  if (val <= 2) return 'Muy baja'
  if (val <= 4) return 'Baja'
  if (val <= 6) return 'Moderada'
  if (val <= 8) return 'Alta'
  return '¡En llamas!'
}

function colorConfianza(val: number) {
  if (val <= 3) return '#f87171'
  if (val <= 6) return '#facc15'
  return '#a3e635'
}

export default function DiarioPage() {
  const router = useRouter()
  const [nivelConfianza, setNivelConfianza] = useState(5)
  const [logro, setLogro] = useState('')
  const [fortalezasSeleccionadas, setFortalezasSeleccionadas] = useState<string[]>([])
  const [pensamientoNegativo, setPensamientoNegativo] = useState('')
  const [reformulacion, setReformulacion] = useState('')
  const [cargandoIA, setCargandoIA] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [totalRegistros, setTotalRegistros] = useState(0)
  const [historialFortalezas, setHistorialFortalezas] = useState<Record<string, number>>({})
  const [error, setError] = useState('')

  useEffect(() => { cargarDatos() }, [])

  async function cargarDatos() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, count } = await supabase
      .from('diario_confianza')
      .select('fortalezas', { count: 'exact' })
      .eq('user_id', user.id)

    setTotalRegistros(count || 0)

    const conteo: Record<string, number> = {}
    data?.forEach(r => {
      if (r.fortalezas) {
        r.fortalezas.split(', ').forEach((f: string) => {
          if (f) conteo[f] = (conteo[f] || 0) + 1
        })
      }
    })
    setHistorialFortalezas(conteo)
  }

  function toggleFortaleza(label: string) {
    setFortalezasSeleccionadas(prev =>
      prev.includes(label) ? prev.filter(f => f !== label) : [...prev, label]
    )
  }

  async function generarReformulacion() {
  if (!pensamientoNegativo.trim()) return
  setCargandoIA(true)
  setError('')

  const texto = pensamientoNegativo.toLowerCase()

  const respuestas = [
    {
      palabras: ['no soy suficiente', 'no soy bueno', 'no sirvo', 'no valgo', 'soy malo', 'suficiente'],
      respuesta: 'Un pensamiento no es una verdad. Pensá, estás acá, entrenando, intentando — eso ya dice mucho de quién sos y de verdadero valor. La confianza se construye en la insistencia, con cada pequeño paso.'
    },
    {
      palabras: ['me equivoqué', 'cometí errores', 'fallé', 'no salió', 'salió mal', 'todo mal'],
      respuesta: 'Equivocarse es parte del proceso, no una señal de que no podés. Cada error te está enseñando algo que no sabías antes. Lo importante es que seguís en cancha. '
    },
    {
      palabras: ['no puedo', 'no voy a poder', 'es imposible', 'no lo voy a lograr'],
      respuesta: 'Ese "no puedo" muchas veces es el cerebro protegiéndote del miedo a intentar. Pero ya lo hiciste antes — y podés volver a hacerlo. De a un punto a la vez. Sabías que a Michael Jordan lo sacaron del equipo del colegio? Spoiler: mejoró un poco después.'
    },
    {
      palabras: ['perdí', 'me ganaron', 'perdimos'],
      respuesta: 'Perder duele, y está bien que duela — significa que te importa. Pero una derrota no define lo que sos como jugador/a. Lo que hacés después de perder, sí. Messi tardó 15 años en ganar el mundial. '
    },
    {
      palabras: ['nervioso', 'nerviosa', 'ansiedad', 'ansiosa', 'ansioso', 'miedo'],
      respuesta: 'Los nervios son una señal de que algo te importa. Tu cuerpo se está preparando para dar lo mejor. Respirá, confiá en lo que entrenaste — ya lo tenés adentro.'
    },
    {
      palabras: ['frustrado', 'frustrada', 'frustración', 'me frustra', 'estoy frustrado'],
      respuesta: 'La frustración aparece cuando querés mejorar y todavía no llegaste. Eso no es un defecto — es que tenés ambición. Usala como combustible, no como freno.'
    },
    {
      palabras: ['cansado', 'cansada', 'agotado', 'agotada', 'sin energía', 'no tengo ganas'],
      respuesta: 'El cansancio a veces no es físico — es señal de que necesitás recargarte. Escuchá tu cuerpo, descansá sin culpa. Volver con energía es también parte del rendimiento.'
    },
    {
      palabras: ['no mejoro', 'no avanzo', 'estoy estancado', 'estancada', 'no progreso'],
      respuesta: 'El progreso no siempre se ve en el momento. A veces estás consolidando lo que ya aprendiste antes de dar el próximo salto. Seguí confiando en el proceso.'
    },
    {
      palabras: ['me comparo', 'los demás son mejores', 'todos son mejores', 'soy el peor', 'la peor'],
      respuesta: 'Compararte con otros es la forma más rápida de perder de vista tu propio camino. Vos competís contra quien eras ayer — y esa es la única comparación que vale. ¿Qué sería Rayo McQueen si se fijaba solo en Mate? Exacto.'
    },
    {
      palabras: ['no confío', 'desconfianza', 'no me creo', 'no me creo capaz', 'dudo de mí'],
      respuesta: 'La confianza no llega antes de actuar — llega después de hacerlo. Cada vez que salís a jugar aunque dudes, estás construyendo confianza real. Eso es valentía.'
    },
    {
      palabras: ['inferior', 'tonto', 'malo', 'burro', 'débil', 'debil', 'critica', 'crítica'],
      respuesta: 'La verdadera opinión que importa es la tuya, vos sabés todo lo que hacés y la opinión de otros es tan cambiante como un par de medias'
    },
  ]

  await new Promise(resolve => setTimeout(resolve, 1200))

  let reformulacionFinal = ''

  for (const r of respuestas) {
    if (r.palabras.some(p => texto.includes(p))) {
      reformulacionFinal = r.respuesta
      break
    }
  }

  if (!reformulacionFinal) {
    reformulacionFinal = 'Ese pensamiento que sentís es válido, pero no es toda la verdad. Lo que sentís hoy no define lo que podés mañana. Seguí apostando a vos — vale la pena.'
  }

  setReformulacion(reformulacionFinal)
  setCargandoIA(false)
}

  async function guardar() {
    setGuardando(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }

    const { error: insertError } = await supabase.from('diario_confianza').insert({
      user_id: user.id,
      nivel_confianza: nivelConfianza,
      logro,
      fortalezas: fortalezasSeleccionadas.join(', '),
      pensamiento_negativo: pensamientoNegativo,
      reformulacion_ia: reformulacion,
    })

    setGuardando(false)

    if (insertError) {
      setError('Error al guardar. Intentá de nuevo.')
      return
    }

    setTotalRegistros(prev => prev + 1)
    fortalezasSeleccionadas.forEach(f => {
      setHistorialFortalezas(prev => ({ ...prev, [f]: (prev[f] || 0) + 1 }))
    })
    setGuardado(true)
  }

  const fortalezasOrdenadas = Object.entries(historialFortalezas)
    .sort((a, b) => b[1] - a[1])

  if (guardado) return (
    <main style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#f0f0f0', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 12px' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Pádel Mental App</div>
          <div style={{ fontSize: 9, color: '#a3e635', letterSpacing: '0.1em' }}>By Ps. Mica Raffe</div>
        </div>
        <div onClick={() => router.push('/home')} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(163,230,53,0.15)', border: '1.5px solid rgba(163,230,53,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer', color: '#a3e635' }}>←</div>
      </div>

      <div style={{ padding: '0 20px 100px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 16, marginTop: 20 }}>💛</div>
        <div style={{ fontWeight: 800, fontSize: 28, letterSpacing: '-0.02em', marginBottom: 8 }}>¡Depósito realizado!</div>
        <div style={{ fontSize: 15, color: '#888', marginBottom: 28, lineHeight: 1.6 }}>Tu banco de confianza sigue creciendo.</div>

        <div style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)', borderRadius: 20, padding: '20px 48px', marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Tu banco de confianza</div>
          <div style={{ fontWeight: 900, fontSize: 60, color: '#facc15', lineHeight: 1 }}>{totalRegistros}</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>depósitos realizados</div>
        </div>

        {reformulacion && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, marginBottom: 20, textAlign: 'left', width: '100%' }}>
            <div style={{ fontSize: 11, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontWeight: 700 }}>✦ Tu reformulación</div>
            <div style={{ fontSize: 14, lineHeight: 1.7, color: '#f0f0f0', fontStyle: 'italic' }}>{reformulacion}</div>
          </div>
        )}

        {fortalezasOrdenadas.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, marginBottom: 20, textAlign: 'left', width: '100%' }}>
            <div style={{ fontSize: 11, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, fontWeight: 700 }}>💪 Tus mayores fortalezas son</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {fortalezasOrdenadas.slice(0, 5).map(([fortaleza, cantidad], i) => {
                const f = fortalezas.find(f => f.label === fortaleza)
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)', borderRadius: 20, padding: '6px 12px' }}>
                    <span style={{ fontSize: 14 }}>{f?.icon || '⭐'}</span>
                    <span style={{ fontSize: 12, color: '#f0f0f0' }}>{fortaleza}</span>
                    <span style={{ fontSize: 11, color: '#facc15', fontWeight: 700 }}>{cantidad}x</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <button onClick={() => router.push('/home')} style={{ width: '100%', background: '#facc15', color: '#0a0a0a', border: 'none', borderRadius: 14, padding: 16, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 8 }}>
          Volver al inicio
        </button>
        <button onClick={() => { setGuardado(false); setLogro(''); setFortalezasSeleccionadas([]); setPensamientoNegativo(''); setReformulacion(''); setNivelConfianza(5) }}
          style={{ width: '100%', background: 'transparent', color: '#666', border: 'none', padding: 12, fontSize: 13, cursor: 'pointer' }}>
          Hacer otro depósito
        </button>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: 'rgba(10,10,10,0.96)', borderTop: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', padding: '10px 0 20px', zIndex: 100 }}>
        {[
          { icon: '🏠', label: 'Inicio', path: '/home' },
          { icon: '➕', label: 'Registrar', path: '/registrar' },
          { icon: '💛', label: 'Confianza', path: '/diario' },
          { icon: '📊', label: 'Gráficos', path: '/graficos' },
          { icon: '📚', label: 'Biblioteca', path: '/biblioteca' },
        ].map((t, i) => (
          <div key={i} onClick={() => router.push(t.path)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '4px 0' }}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span style={{ fontSize: 9, color: t.path === '/diario' ? '#facc15' : '#666' }}>{t.label}</span>
          </div>
        ))}
      </div>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#f0f0f0', width: '100%' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 12px' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Pádel Mental App</div>
          <div style={{ fontSize: 9, color: '#a3e635', letterSpacing: '0.1em' }}>By Ps. Mica Raffe</div>
        </div>
        <div onClick={() => router.push('/home')} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(163,230,53,0.15)', border: '1.5px solid rgba(163,230,53,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer', color: '#a3e635' }}>←</div>
      </div>

      <div style={{ padding: '0 20px 100px' }}>

        <div style={{ paddingBottom: 20 }}>
          <div style={{ display: 'inline-block', background: 'rgba(250,204,21,0.12)', color: '#facc15', fontSize: 11, padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(250,204,21,0.25)', marginBottom: 8 }}>
            💛 Este es tu Banco de Confianza
          </div>
          <div style={{ fontSize: 13, color: '#ccc', marginTop: 6, lineHeight: 1.6 }}>
            Cada vez que hagas un depósito (completes este registro) tu confianza crece y se vuelve más sólida.
          </div>
        </div>

        <div style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.15)', borderRadius: 14, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontWeight: 900, fontSize: 32, color: '#facc15', lineHeight: 1 }}>{totalRegistros}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f0' }}>depósitos realizados</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>en tu banco de confianza</div>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, fontWeight: 700 }}>¿Cómo está tu confianza hoy?</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <span style={{ fontSize: 40 }}>{emojiConfianza(nivelConfianza)}</span>
            <div>
              <div style={{ fontWeight: 900, fontSize: 40, color: colorConfianza(nivelConfianza), lineHeight: 1 }}>{nivelConfianza}</div>
              <div style={{ fontSize: 13, color: colorConfianza(nivelConfianza), fontWeight: 600 }}>{labelConfianza(nivelConfianza)}</div>
            </div>
          </div>
          <input type="range" min={1} max={10} step={1} value={nivelConfianza}
            onChange={e => setNivelConfianza(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#facc15', height: 4, cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: '#666' }}>Muy baja</span>
            <span style={{ fontSize: 10, color: '#666' }}>¡En llamas!</span>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontWeight: 700 }}>🏆 ¿Qué hiciste bien hoy?</div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 12, lineHeight: 1.5 }}>No importa qué tan pequeño sea. El cerebro necesita evidencia real para construir confianza.</div>
          <textarea value={logro} onChange={e => setLogro(e.target.value)}
            placeholder="Hoy hice bien..."
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none', resize: 'none', minHeight: 90, lineHeight: 1.6, boxSizing: 'border-box', fontFamily: 'system-ui' }}
          />
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontWeight: 700 }}>💪 ¿Qué fortalezas aparecieron?</div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 14, lineHeight: 1.5 }}>Elegí las que aparecieron hoy, aunque sea un poquito.</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {fortalezas.map(f => (
              <div key={f.label} onClick={() => toggleFortaleza(f.label)} style={{
                background: fortalezasSeleccionadas.includes(f.label) ? 'rgba(250,204,21,0.15)' : 'rgba(255,255,255,0.03)',
                border: fortalezasSeleccionadas.includes(f.label) ? '1px solid rgba(250,204,21,0.5)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, padding: '12px 6px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 5, cursor: 'pointer', transition: 'all 0.15s'
              }}>
                <span style={{ fontSize: 22 }}>{f.icon}</span>
                <span style={{ fontSize: 9, color: fortalezasSeleccionadas.includes(f.label) ? '#facc15' : '#666', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center', lineHeight: 1.3 }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontWeight: 700 }}>✦ ¿Algún pensamiento de inseguridad?</div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 12, lineHeight: 1.5 }}>Escribilo sin filtro. La app lo va a transformar en algo más "real" para vos.</div>
          <textarea value={pensamientoNegativo} onChange={e => { setPensamientoNegativo(e.target.value); setReformulacion('') }}
            placeholder="Hoy siento que..."
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none', resize: 'none', minHeight: 90, lineHeight: 1.6, boxSizing: 'border-box', fontFamily: 'system-ui', marginBottom: 12 }}
          />
          {pensamientoNegativo.trim() && !reformulacion && (
            <button onClick={generarReformulacion} disabled={cargandoIA} style={{ width: '100%', background: cargandoIA ? '#333' : 'rgba(250,204,21,0.15)', color: cargandoIA ? '#888' : '#facc15', border: '1px solid rgba(250,204,21,0.3)', borderRadius: 10, padding: '12px', fontSize: 13, fontWeight: 700, cursor: cargandoIA ? 'not-allowed' : 'pointer' }}>
              {cargandoIA ? '✨ Pensando...' : '✨ Transformar este pensamiento'}
            </button>
          )}
          {reformulacion && (
            <div style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.2)', borderRadius: 12, padding: 16, marginTop: 4 }}>
              <div style={{ fontSize: 10, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontWeight: 700 }}>✦ Tu reformulación</div>
              <div style={{ fontSize: 14, lineHeight: 1.7, color: '#f0f0f0' }}>{reformulacion}</div>
            </div>
          )}
        </div>

        {fortalezasOrdenadas.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontWeight: 700 }}>💪 Tus mayores fortalezas</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {fortalezasOrdenadas.slice(0, 5).map(([fortaleza, cantidad], i) => {
                const f = fortalezas.find(f => f.label === fortaleza)
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)', borderRadius: 20, padding: '6px 12px' }}>
                    <span style={{ fontSize: 14 }}>{f?.icon || '⭐'}</span>
                    <span style={{ fontSize: 12, color: '#f0f0f0' }}>{fortaleza}</span>
                    <span style={{ fontSize: 11, color: '#facc15', fontWeight: 700 }}>{cantidad}x</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <button onClick={guardar} disabled={guardando} style={{
          width: '100%', background: guardando ? '#333' : '#facc15',
          color: guardando ? '#888' : '#0a0a0a', border: 'none',
          borderRadius: 14, padding: 17, fontSize: 16, fontWeight: 700,
          cursor: guardando ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
        }}>
          {guardando ? 'Guardando...' : '💛 Hacer el depósito'}
        </button>

      </div>

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: 'rgba(10,10,10,0.96)', borderTop: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', padding: '10px 0 20px', zIndex: 100 }}>
        {[
          { icon: '🏠', label: 'Inicio', path: '/home' },
          { icon: '➕', label: 'Registrar', path: '/registrar' },
          { icon: '💛', label: 'Confianza', path: '/diario' },
          { icon: '📊', label: 'Gráficos', path: '/graficos' },
          { icon: '📚', label: 'Biblioteca', path: '/biblioteca' },
        ].map((t, i) => (
          <div key={i} onClick={() => router.push(t.path)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '4px 0' }}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span style={{ fontSize: 9, color: t.path === '/diario' ? '#facc15' : '#666' }}>{t.label}</span>
          </div>
        ))}
      </div>

    </main>
  )
}