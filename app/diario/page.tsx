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
  const [fortalezasSeleccionadas, setFortalezasSeleccionadas] = useState<string[]>([])
  const [pensamientoNegativo, setPensamientoNegativo] = useState('')
  const [reformulacion, setReformulacion] = useState('')
  const [cargandoIA, setCargandoIA] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [totalRegistros, setTotalRegistros] = useState(0)
  const [historialFortalezas, setHistorialFortalezas] = useState<Record<string, number>>({})
  const [error, setError] = useState('')
  const [logro, setLogro] = useState('')
  const [mostrarInfo, setMostrarInfo] = useState(false)
  const [tesoroAbierto, setTesoroAbierto] = useState(false)

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
    await new Promise(resolve => setTimeout(resolve, 1200))
    const texto = pensamientoNegativo.toLowerCase()
    const respuestas = [
      { palabras: ['no soy suficiente', 'no soy bueno', 'no sirvo', 'no valgo', 'soy malo'], respuesta: 'Que lo hayas sentido hoy no significa que sea verdad. Estás acá, entrenando, intentando — eso ya dice mucho de quién sos.' },
      { palabras: ['me equivoqué', 'cometí errores', 'fallé', 'no salió', 'salió mal'], respuesta: 'Messi erró penales en finales. Y encima del mundial. Igual le dicen el mejor de la historia. Seguí.' },
      { palabras: ['no puedo', 'no voy a poder', 'es imposible'], respuesta: 'Michael Jordan fue cortado del equipo del colegio. Spoiler: mejoró un poco después.' },
      { palabras: ['perdí', 'me ganaron', 'perdimos'], respuesta: 'Federer perdió más de 250 partidos en su carrera. Igual le dicen el mejor de la historia.' },
      { palabras: ['nervioso', 'nerviosa', 'ansiedad', 'miedo'], respuesta: 'Simone Biles se bajó de los Juegos Olímpicos. Nadie la llamó cobarde. Volvió y ganó.' },
      { palabras: ['frustrado', 'frustrada', 'frustración'], respuesta: 'La frustración aparece cuando querés mejorar y todavía no llegaste. Eso no es un defecto — es ambición.' },
      { palabras: ['cansado', 'cansada', 'agotado', 'sin energía'], respuesta: 'Descansar sin culpa también es parte del rendimiento. Tu cuerpo te está pidiendo algo.' },
      { palabras: ['no mejoro', 'no avanzo', 'estancado'], respuesta: 'Messi tardó 15 años en ganar el mundial. Vos llevás... ¿cuánto tiempo jugando?' },
      { palabras: ['me comparo', 'los demás son mejores', 'todos son mejores'], respuesta: '¿Qué sería Rayo McQueen si se fijaba solo en Mate? Exacto.' },
      { palabras: ['no confío', 'dudo de mí'], respuesta: 'La confianza no llega antes de actuar — llega después. Cada vez que jugás aunque dudes, la construís.' },
      { palabras: ['inferior', 'tonto', 'débil', 'critica', 'crítica'], respuesta: 'La opinión de otros es tan cambiante como un par de medias 🧦 La tuya es la que importa.' },
    ]
    const frasesVacias = ['no', 'nada', 'ninguno', 'ninguna', 'hoy no', 'bien', 'todo bien', 'ok']
    const esVacio = frasesVacias.some(f => texto.trim() === f) || texto.trim().length < 5
    let ref = ''
    if (esVacio) {
      const pos = ['Que no haya pensamientos negativos hoy ya es una señal positiva.', 'Sin ruido mental hoy — eso es más valioso de lo que parece.', 'Un día sin inseguridades es un depósito enorme. Guardalo bien.']
      ref = pos[Math.floor(Math.random() * pos.length)]
    } else {
      for (const r of respuestas) {
        if (r.palabras.some(p => texto.includes(p))) { ref = r.respuesta; break }
      }
    }
    if (!ref) ref = 'Ese pensamiento que sentís es válido, pero no es toda la verdad. Lo que sentís hoy no define lo que podés mañana.'
    setReformulacion(ref)
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
    if (insertError) { setError('Error al guardar. Intentá de nuevo.'); return }
    setTotalRegistros(prev => prev + 1)
    fortalezasSeleccionadas.forEach(f => {
      setHistorialFortalezas(prev => ({ ...prev, [f]: (prev[f] || 0) + 1 }))
    })
    setGuardado(true)
  }

  const fortalezasOrdenadas = Object.entries(historialFortalezas).sort((a, b) => b[1] - a[1])
  const progresoPct = Math.min(100, (totalRegistros / 100) * 100)

  if (guardado) return (
    <main style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#f0f0f0', width: '100%', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(250,204,21,0.04)' }}></div>
        <div style={{ position: 'absolute', bottom: '100px', left: '-80px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(250,204,21,0.03)' }}></div>
      </div>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 12px' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Pádel Mental App</div>
          <div style={{ fontSize: 9, color: '#a3e635', letterSpacing: '0.1em' }}>By Ps. Mica Raffe</div>
        </div>
        <div onClick={() => router.push('/home')} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(163,230,53,0.15)', border: '1.5px solid rgba(163,230,53,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer', color: '#a3e635' }}>←</div>
      </div>
      <div style={{ position: 'relative', zIndex: 1, padding: '0 20px 100px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16, marginTop: 20 }}>💛</div>
        <div style={{ fontWeight: 800, fontSize: 28, letterSpacing: '-0.02em', marginBottom: 8 }}>¡Depósito realizado!</div>
        <div style={{ fontSize: 14, color: '#888', marginBottom: 24, lineHeight: 1.6 }}>Tu banco de confianza sigue creciendo.</div>
        <div style={{ background: '#071a07', border: '1px solid rgba(163,230,53,0.25)', borderRadius: 20, padding: '20px 40px', marginBottom: 20, width: '100%', boxSizing: 'border-box' }}>
          <div style={{ fontSize: 11, color: '#a3e635', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Saldo de confianza</div>
          <div style={{ fontWeight: 900, fontSize: 56, color: '#a3e635', lineHeight: 1 }}>{totalRegistros}</div>
          <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>depósitos realizados</div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', marginTop: 12 }}>
            <div style={{ height: '100%', width: progresoPct + '%', background: '#a3e635', borderRadius: 3 }}></div>
          </div>
          <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>{totalRegistros} / 100 depósitos</div>
        </div>
        {reformulacion && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, marginBottom: 20, textAlign: 'left', width: '100%' }}>
            <div style={{ fontSize: 11, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontWeight: 700 }}>✦ Tu reformulación</div>
            <div style={{ fontSize: 14, lineHeight: 1.7, color: '#f0f0f0', fontStyle: 'italic' }}>{reformulacion}</div>
          </div>
        )}
        {fortalezasOrdenadas.length > 0 && (
          <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, marginBottom: 20, textAlign: 'left', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 18 }}>🔐</span>
              <div style={{ fontSize: 12, fontWeight: 800 }}>Tu tesoro de fortalezas mentales</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {fortalezasOrdenadas.slice(0, 5).map(([fortaleza, cantidad], i) => {
                const f = fortalezas.find(f => f.label === fortaleza)
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: i === 0 ? 'rgba(250,204,21,0.1)' : 'rgba(255,255,255,0.04)', border: i === 0 ? '1px solid rgba(250,204,21,0.3)' : '0.5px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '5px 12px' }}>
                    <span style={{ fontSize: 13 }}>{f?.icon || '⭐'}</span>
                    <span style={{ fontSize: 12, color: i === 0 ? '#facc15' : '#888' }}>{fortaleza}</span>
                    <span style={{ fontSize: 11, color: i === 0 ? '#facc15' : '#555', fontWeight: 700 }}>{cantidad}x</span>
                  </div>
                )
              })}
            </div>
            <div style={{ fontSize: 11, color: '#555' }}>Estas fortalezas están desarrolladas y no te las quitan fácil</div>
          </div>
        )}
        <button onClick={() => router.push('/home')} style={{ width: '100%', background: '#facc15', color: '#0a0a0a', border: 'none', borderRadius: 14, padding: 16, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 8 }}>Volver al inicio</button>
        <button onClick={() => { setGuardado(false); setFortalezasSeleccionadas([]); setPensamientoNegativo(''); setReformulacion(''); setNivelConfianza(5) }}
          style={{ width: '100%', background: 'transparent', color: '#666', border: 'none', padding: 12, fontSize: 13, cursor: 'pointer' }}>
          Hacer otro depósito
        </button>
      </div>
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: 'rgba(10,10,10,0.96)', borderTop: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', padding: '10px 0 20px', zIndex: 100 }}>
        {[{ icon: '🏠', label: 'Inicio', path: '/home' }, { icon: '➕', label: 'Registrar', path: '/registrar' }, { icon: '💛', label: 'Confianza', path: '/diario' }, { icon: '📊', label: 'Gráficos', path: '/graficos' }, { icon: '📚', label: 'Biblioteca', path: '/biblioteca' }].map((t, i) => (
          <div key={i} onClick={() => router.push(t.path)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '4px 0' }}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span style={{ fontSize: 9, color: t.path === '/diario' ? '#facc15' : '#666' }}>{t.label}</span>
          </div>
        ))}
      </div>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#f0f0f0', width: '100%', position: 'relative', overflow: 'hidden' }}>

      {/* FONDO */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(250,204,21,0.04)' }}></div>
        <div style={{ position: 'absolute', top: '300px', left: '-80px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(250,204,21,0.03)' }}></div>
        <div style={{ position: 'absolute', top: '600px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(163,230,53,0.025)' }}></div>
      </div>

      {/* POPUP INFO */}
      {mostrarInfo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setMostrarInfo(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#111', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px', width: '100%', maxWidth: 390 }}>
            <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 20px' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 24 }}>🏛️</span>
              <div style={{ fontWeight: 800, fontSize: 16 }}>¿Qué es el Banco de Confianza?</div>
            </div>
            <div style={{ fontSize: 14, color: '#ccc', lineHeight: 1.7 }}>
              Desde la psicología deportiva y neurociencia entendemos que la confianza se construye. Este <span style={{ color: '#facc15', fontWeight: 700 }}>"banco de confianza"</span> te va a permitir valorar más tus fortalezas y lo que hacés bien.
            </div>
            <div style={{ fontSize: 14, color: '#ccc', lineHeight: 1.7, marginTop: 12 }}>
              Así se crea una confianza sólida e interna que <span style={{ color: '#a3e635', fontWeight: 700 }}>no depende solo de que todo salga bien</span>.
            </div>
            <button onClick={() => setMostrarInfo(false)} style={{ width: '100%', background: '#facc15', color: '#0a0a0a', border: 'none', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 20 }}>
              Entendido 💛
            </button>
          </div>
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 12px' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>Pádel Mental App</div>
            <div style={{ fontSize: 9, color: '#a3e635', letterSpacing: '0.1em' }}>By Ps. Mica Raffe</div>
          </div>
          <div onClick={() => router.push('/home')} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(163,230,53,0.15)', border: '1.5px solid rgba(163,230,53,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer', color: '#a3e635' }}>←</div>
        </div>

        <div style={{ padding: '0 20px 100px' }}>

          <div style={{ paddingBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em' }}>Banco de Confianza 💛</div>
              <div onClick={() => setMostrarInfo(true)} style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(250,204,21,0.15)', border: '1px solid rgba(250,204,21,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#facc15', cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}>?</div>
            </div>
          </div>

          {/* PANEL VERDE OSCURO */}
          <div style={{ background: '#071a07', border: '1px solid rgba(163,230,53,0.2)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: '#a3e635', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Saldo de confianza</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: '#a3e635', lineHeight: 1 }}>{totalRegistros}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>depósitos</div>
                </div>
              </div>
              <div style={{ background: 'rgba(163,230,53,0.1)', border: '1px solid rgba(163,230,53,0.2)', borderRadius: 10, padding: '8px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 20 }}>🏛️</div>
                <div style={{ fontSize: 9, color: '#a3e635', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Banco</div>
              </div>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', position: 'relative', marginBottom: 4 }}>
              <div style={{ height: '100%', width: progresoPct + '%', background: '#a3e635', borderRadius: 4 }}></div>
              <div style={{ position: 'absolute', left: '25%', top: 0, width: '1px', height: '100%', background: 'rgba(0,0,0,0.3)' }}></div>
              <div style={{ position: 'absolute', left: '50%', top: 0, width: '1px', height: '100%', background: 'rgba(0,0,0,0.3)' }}></div>
              <div style={{ position: 'absolute', left: '75%', top: 0, width: '1px', height: '100%', background: 'rgba(0,0,0,0.3)' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 9, color: '#555' }}>0</span>
              <span style={{ fontSize: 9, color: '#555' }}>25</span>
              <span style={{ fontSize: 9, color: '#555' }}>50</span>
              <span style={{ fontSize: 9, color: '#555' }}>75</span>
              <span style={{ fontSize: 9, color: '#a3e635', fontWeight: 700 }}>100 🏅</span>
            </div>
            <div style={{ borderTop: '0.5px solid rgba(163,230,53,0.1)', paddingTop: 10 }}>
              <div style={{ fontSize: 10, color: '#555', marginBottom: 6 }}>Historial</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {Array.from({ length: Math.min(totalRegistros, 20) }).map((_, i) => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#a3e635' }}></div>
                ))}
                {Array.from({ length: Math.max(0, 20 - totalRegistros) }).map((_, i) => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }}></div>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171', marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div style={{ fontSize: 10, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 10 }}>⚡ Modo express · 30 seg</div>

          {/* P1 CONFIANZA */}
          <div style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)', borderRadius: 12, padding: 14, marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>¿Cómo está tu confianza hoy?</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 32 }}>{emojiConfianza(nivelConfianza)}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: colorConfianza(nivelConfianza), fontWeight: 700 }}>{labelConfianza(nivelConfianza)}</span>
                  <span style={{ fontSize: 20, fontWeight: 900, color: colorConfianza(nivelConfianza) }}>{nivelConfianza}</span>
                </div>
                <input type="range" min={1} max={10} step={1} value={nivelConfianza}
                  onChange={e => setNivelConfianza(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#facc15', height: 4, cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>

{/* LOGRO */}
<div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 14, marginBottom: 8 }}>
  <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>¿Qué hiciste bien hoy?</div>
  <div style={{ fontSize: 11, color: '#555', marginBottom: 10 }}>Aunque sea chiquito, escribí algo que pudiste hacer</div>
  <textarea value={logro} onChange={e => setLogro(e.target.value)}
    placeholder="Hoy hice bien..."
    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 12px', color: '#f0f0f0', fontSize: 13, outline: 'none', resize: 'none', minHeight: 60, lineHeight: 1.5, boxSizing: 'border-box', fontFamily: 'system-ui' }}
  />
</div>

          {/* P2 FORTALEZAS */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 14, marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>¿Qué fortalezas tuviste hoy?</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {fortalezas.map(f => (
                <div key={f.label} onClick={() => toggleFortaleza(f.label)} style={{
                  background: fortalezasSeleccionadas.includes(f.label) ? 'rgba(250,204,21,0.15)' : 'rgba(255,255,255,0.03)',
                  border: fortalezasSeleccionadas.includes(f.label) ? '1.5px solid rgba(250,204,21,0.5)' : '0.5px solid rgba(255,255,255,0.08)',
                  borderRadius: 10, padding: '8px 4px', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 3, cursor: 'pointer'
                }}>
                  <span style={{ fontSize: 18 }}>{f.icon}</span>
                  <span style={{ fontSize: 8, color: fortalezasSeleccionadas.includes(f.label) ? '#facc15' : '#555', textTransform: 'uppercase', letterSpacing: '0.02em', textAlign: 'center', lineHeight: 1.2 }}>
                    {f.label.length > 8 ? f.label.substring(0, 7) + '.' : f.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* P3 PENSAMIENTO */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: '#888' }}>¿Pensamiento de inseguridad? Escribilo sin filtro 🔥</div>
              <div style={{ fontSize: 10, color: '#555', background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '3px 8px', flexShrink: 0 }}>opcional</div>
            </div>
            <textarea value={pensamientoNegativo} onChange={e => { setPensamientoNegativo(e.target.value); setReformulacion('') }}
              placeholder="Hoy siento que..."
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 12px', color: '#f0f0f0', fontSize: 13, outline: 'none', resize: 'none', minHeight: 60, lineHeight: 1.5, boxSizing: 'border-box', fontFamily: 'system-ui' }}
            />
            {pensamientoNegativo.trim() && !reformulacion && (
              <button onClick={generarReformulacion} disabled={cargandoIA} style={{ width: '100%', background: cargandoIA ? '#333' : 'rgba(239,68,68,0.08)', color: cargandoIA ? '#888' : '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 700, cursor: cargandoIA ? 'not-allowed' : 'pointer', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {cargandoIA ? '🔥 Quemando...' : '🔥 Quemar este pensamiento'}
              </button>
            )}
            {reformulacion && (
              <div style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)', borderRadius: 8, padding: 12, marginTop: 8 }}>
                <div style={{ fontSize: 10, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontWeight: 700 }}>✦ Tu reformulación</div>
                <div style={{ fontSize: 13, lineHeight: 1.6, color: '#f0f0f0', fontStyle: 'italic' }}>{reformulacion}</div>
              </div>
            )}
          </div>

          {/* BOTÓN */}
          <button onClick={guardar} disabled={guardando} style={{
            width: '100%', background: guardando ? '#333' : '#facc15',
            color: guardando ? '#888' : '#0a0a0a', border: 'none',
            borderRadius: 14, padding: '16px 20px', fontSize: 16, fontWeight: 700,
            cursor: guardando ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 12
          }}>
            <div style={{ textAlign: 'left' }}>
              <div>{guardando ? 'Guardando...' : 'Depositar 💛'}</div>
              <div style={{ fontSize: 11, color: guardando ? '#666' : 'rgba(0,0,0,0.45)', marginTop: 1 }}>+15 MM · depósito #{totalRegistros + 1}</div>
            </div>
            <div style={{ fontSize: 22 }}>🏛️</div>
          </button>

          {/* TESORO MENTAL COLAPSABLE */}
          <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
            <div onClick={() => setTesoroAbierto(!tesoroAbierto)} style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>🔐</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>Tu tesoro de fortalezas mentales</div>
                  {!tesoroAbierto && fortalezasOrdenadas.length > 0 && (
                    <div style={{ fontSize: 10, color: '#555', marginTop: 1 }}>
                      {fortalezasOrdenadas.slice(0, 3).map(([f, c]) => `${f} ${c}x`).join(' · ')}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#555', transform: tesoroAbierto ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</div>
            </div>

            {tesoroAbierto && (
              <div style={{ padding: '0 16px 16px' }}>
                <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.06)', marginBottom: 12 }}></div>
                {fortalezasOrdenadas.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#555', textAlign: 'center', padding: '10px 0' }}>Hacé tu primer depósito para ver tus fortalezas</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {fortalezasOrdenadas.slice(0, 3).map(([fortaleza, cantidad], i) => {
                      const f = fortalezas.find(f => f.label === fortaleza)
                      const esTop = i === 0
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: esTop ? 'rgba(250,204,21,0.07)' : 'rgba(255,255,255,0.02)', border: esTop ? '1px solid rgba(250,204,21,0.2)' : '0.5px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 16 }}>{f?.icon || '⭐'}</span>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: esTop ? 700 : 500, color: esTop ? '#f0f0f0' : '#888' }}>{fortaleza}</div>
                              <div style={{ fontSize: 10, color: '#444' }}>{i === 0 ? 'reserva principal 🔒' : i === 1 ? 'reserva sólida 🔒' : 'en construcción 🔓'}</div>
                            </div>
                          </div>
                          <div style={{ background: esTop ? '#facc15' : 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '4px 10px' }}>
                            <div style={{ fontSize: 14, fontWeight: 900, color: esTop ? '#0a0a0a' : '#555' }}>{cantidad}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                <div style={{ fontSize: 10, color: '#444', textAlign: 'center', marginTop: 10 }}>Estas fortalezas están desarrolladas y no te las quitan fácil</div>
              </div>
            )}
          </div>

        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: 'rgba(10,10,10,0.96)', borderTop: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', padding: '10px 0 20px', zIndex: 100 }}>
        {[{ icon: '🏠', label: 'Inicio', path: '/home' }, { icon: '➕', label: 'Registrar', path: '/registrar' }, { icon: '💛', label: 'Confianza', path: '/diario' }, { icon: '📊', label: 'Gráficos', path: '/graficos' }, { icon: '📚', label: 'Biblioteca', path: '/biblioteca' }].map((t, i) => (
          <div key={i} onClick={() => router.push(t.path)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '4px 0' }}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span style={{ fontSize: 9, color: t.path === '/diario' ? '#facc15' : '#666' }}>{t.label}</span>
          </div>
        ))}
      </div>
    </main>
  )
}