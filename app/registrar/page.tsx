'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

const emociones = [
  { icon: '😊', label: 'Alegría' },
  { icon: '😠', label: 'Enojo' },
  { icon: '😨', label: 'Miedo' },
  { icon: '😰', label: 'Ansiedad' },
  { icon: '😳', label: 'Vergüenza' },
  { icon: '💪', label: 'Motivación' },
  { icon: '😤', label: 'Frustración' },
  { icon: '🦁', label: 'Confianza' },
  { icon: '😌', label: 'Tranquilidad' },
  { icon: '😴', label: 'Agotamiento' },
  { icon: '😞', label: 'Desánimo' },
  { icon: '🤔', label: 'Duda' },
]

function colorSlider(label: string, val: number) {
  if (label === 'Frustración') return '#f87171'
  if (label === '¿Qué tan difícil lo sentiste?') return val > 6 ? '#f87171' : '#facc15'
  return '#a3e635'
}

export default function RegistrarPage() {
  const router = useRouter()
  const [tipo, setTipo] = useState<'Entrenamiento' | 'Partido' | ''>('')
  const [subtipo, setSubtipo] = useState('')
  const [rendimiento, setRendimiento] = useState(5)
  const [emocionesSeleccionadas, setEmocionesSeleccionadas] = useState<string[]>([])
  const [zor, setZor] = useState({ concentracion: 5, activacion: 5, confianza: 5, desafio: 5, motivacion: 5, frustracion: 5 })
  const [pensamientos, setPensamientos] = useState('')
  const [fraseAyudo, setFraseAyudo] = useState('')
  const [aprendizajes, setAprendizajes] = useState('')
  const [resultadoPartido, setResultadoPartido] = useState<'gane' | 'perdi' | 'empate' | ''>('')
const [marcador, setMarcador] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState('')
  const [tiempoInicio] = useState<number>(Date.now())
  const [fechaSesion, setFechaSesion] = useState<string>(new Date().toISOString().split('T')[0])

  function toggleEmocion(label: string) {
    setEmocionesSeleccionadas(prev =>
      prev.includes(label) ? prev.filter(e => e !== label) : [...prev, label]
    )
  }

  function colorRendimiento(val: number) {
    if (val >= 8) return '#a3e635'
    if (val >= 5) return '#facc15'
    return '#f87171'
  }

  function labelRendimiento(val: number) {
    if (val >= 9) return 'Increíble 🔥'
    if (val >= 7) return 'Muy bien 💪'
    if (val >= 5) return 'Regular 😐'
    if (val >= 3) return 'Flojo 😕'
    return 'Muy mal 😔'
  }



  async function guardar() {
  
    if (!tipo) { setError('Seleccioná el tipo de sesión'); return }
    if (emocionesSeleccionadas.length === 0) { setError('Seleccioná al menos una emoción'); return }
    setGuardando(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    

    const { error: insertError } = await supabase.from('registros').insert({
      resultado_partido: resultadoPartido || null,
marcador: marcador.trim() || null,
      user_id: user.id,
      tipo: subtipo || tipo,
      resultado: String(rendimiento),
      emocion: emocionesSeleccionadas.join(', '),
      concentracion: zor.concentracion,
      activacion: zor.activacion,
      confianza: zor.confianza,
      desafio: zor.desafio,
      motivacion: zor.motivacion,
      frustracion: zor.frustracion,
      pensamientos,
      autodialogo: fraseAyudo,
      frase_ayudo: fraseAyudo,
      aprendizajes,
      tiempo_segundos: Math.floor((Date.now() - tiempoInicio) / 1000),
       created_at: fechaSesion + 'T12:00:00.000Z',
    })

    setGuardando(false)
    if (insertError) { setError('Error al guardar. Intentá de nuevo.'); return }
    setGuardado(true)
    setTimeout(() => router.push('/home'), 1800)
  }

  const mmEstimados = 10 + (pensamientos.trim().length > 10 ? 5 : 0) + (fraseAyudo.trim().length > 3 ? 2 : 0) + (aprendizajes.trim().length > 3 ? 3 : 0)

  if (guardado) return (
    <main style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#f0f0f0', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: '0 20px' }}>
      <div style={{ fontSize: 64 }}>🧠</div>
      <div style={{ fontWeight: 800, fontSize: 26, textAlign: 'center' }}>¡Registro guardado!</div>
      <div style={{ fontSize: 15, color: '#a3e635', fontWeight: 700 }}>+{mmEstimados} MM sumados a tu semana</div>
      <div style={{ fontSize: 13, color: '#666', textAlign: 'center' }}>Volviendo al inicio...</div>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#f0f0f0', width: '100%', position: 'relative', overflow: 'hidden' }}>

      {/* FONDO CANCHA */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', width: '0.5px', height: '100%', background: 'rgba(163,230,53,0.04)' }}></div>
        <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '0.5px', background: 'rgba(163,230,53,0.04)' }}></div>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '280px', height: '280px', borderRadius: '50%', border: '0.5px solid rgba(163,230,53,0.04)' }}></div>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '140px', height: '140px', borderRadius: '50%', border: '0.5px solid rgba(163,230,53,0.04)' }}></div>
        <div style={{ position: 'absolute', top: 0, left: '20%', width: '0.5px', height: '100%', background: 'rgba(163,230,53,0.025)' }}></div>
        <div style={{ position: 'absolute', top: 0, left: '80%', width: '0.5px', height: '100%', background: 'rgba(163,230,53,0.025)' }}></div>
        <div style={{ position: 'absolute', top: '25%', left: 0, width: '100%', height: '0.5px', background: 'rgba(163,230,53,0.025)' }}></div>
        <div style={{ position: 'absolute', top: '75%', left: 0, width: '100%', height: '0.5px', background: 'rgba(163,230,53,0.025)' }}></div>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 12px' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>Pádel Mental App</div>
            <div style={{ fontSize: 9, color: '#a3e635', letterSpacing: '0.1em' }}>By Ps. Mica Raffe</div>
          </div>
          <div onClick={() => router.push('/home')} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(163,230,53,0.15)', border: '1.5px solid rgba(163,230,53,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer', color: '#a3e635' }}>←</div>
        </div>

        <div style={{ padding: '0 20px 100px' }}>

          <div style={{ marginBottom: 20 }}>
  <div style={{ fontSize: 11, color: '#555', marginBottom: 3 }}>Registrá tu estado mental y emocional</div>
  <div style={{ fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em' }}>Nuevo Registro</div>
</div>

{error && (
  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171', marginBottom: 16 }}>
    {error}
  </div>
)}

{/* FECHA */}
<div style={{ marginBottom: 16 }}>
  <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 10 }}>Fecha del entrenamiento o partido</div>
  <input type="date" value={fechaSesion} onChange={e => setFechaSesion(e.target.value)}
    max={new Date().toISOString().split('T')[0]}
    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }}
  />
</div>

{/* TIPO */}
<div style={{ marginBottom: 16 }}>
  <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 10 }}>Tipo de sesión</div>
  <div style={{ display: 'flex', gap: 8, marginBottom: tipo === 'Partido' ? 10 : 0 }}>
    {[
      { id: 'Entrenamiento', icon: '🎾', label: 'Entrenamiento' },
      { id: 'Partido', icon: '🏆', label: 'Partido' },
    ].map(t => (
      <div key={t.id} onClick={() => { setTipo(t.id as any); setSubtipo('') }} style={{
        flex: 1, background: tipo === t.id ? 'rgba(163,230,53,0.12)' : 'rgba(255,255,255,0.03)',
        border: tipo === t.id ? '1.5px solid rgba(163,230,53,0.4)' : '0.5px solid rgba(255,255,255,0.08)',
        borderRadius: 12, padding: '14px 10px', textAlign: 'center', cursor: 'pointer'
      }}>
        <div style={{ fontSize: 24, marginBottom: 5 }}>{t.icon}</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: tipo === t.id ? '#a3e635' : '#666' }}>{t.label}</div>
      </div>
    ))}
  </div>
  {tipo === 'Partido' && (
    <div style={{ display: 'flex', gap: 8 }}>
      {['Partido amistoso', 'Torneo'].map(s => (
        <button key={s} onClick={() => setSubtipo(s)} style={{
          flex: 1, padding: '10px',
          background: subtipo === s ? 'rgba(163,230,53,0.12)' : 'rgba(255,255,255,0.03)',
          border: subtipo === s ? '1px solid rgba(163,230,53,0.4)' : '0.5px solid rgba(255,255,255,0.08)',
          borderRadius: 10, color: subtipo === s ? '#a3e635' : '#666',
          fontSize: 12, cursor: 'pointer', fontWeight: 600
        }}>{s}</button>
      ))}
    </div>
  )}
</div>

{/* RESULTADO */}
{tipo && (
  <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16, marginBottom: 16 }}>
    <div style={{ fontSize: 10, color: '#a3e635', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 12 }}>🏆 ¿Cómo fue el resultado?</div>
    <div style={{ display: 'flex', gap: 8, marginBottom: tipo === 'Partido' || subtipo ? 14 : 0 }}>
      {[
        { id: 'gane', label: '🥇 Ganado', color: '#a3e635', rgb: '163,230,53' },
        { id: 'perdi', label: '😌 Perdido', color: '#f87171', rgb: '248,113,113' },
        { id: 'empate', label: '🤝 Empate', color: '#facc15', rgb: '250,204,21' },
      ].map(op => (
        <button key={op.id} onClick={() => setResultadoPartido(op.id as any)} style={{
          flex: 1, padding: '10px 4px',
          background: resultadoPartido === op.id ? `rgba(${op.rgb}, 0.12)` : 'rgba(255,255,255,0.03)',
          border: resultadoPartido === op.id ? `1.5px solid rgba(${op.rgb}, 0.4)` : '0.5px solid rgba(255,255,255,0.08)',
          borderRadius: 10, color: resultadoPartido === op.id ? op.color : '#666',
          fontSize: 12, cursor: 'pointer', fontWeight: 600
        }}>{op.label}</button>
      ))}
    </div>
    {(tipo === 'Partido' || subtipo === 'Partido amistoso' || subtipo === 'Torneo') && (
      <>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>Marcador (opcional)</div>
        <input
          type="text"
          value={marcador}
          onChange={e => setMarcador(e.target.value)}
          placeholder="Ej: 6-4, 7-5"
          style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'system-ui' }}
        />
      </>
    )}
  </div>
)}

          {/* RENDIMIENTO */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: '#a3e635', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 12 }}>📊 Nivel de rendimiento alcanzado</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 13, color: '#ccc' }}>Si el 10 es tu máximo rendimiento</div>
                <div style={{ fontSize: 12, color: colorRendimiento(rendimiento), marginTop: 2 }}>{labelRendimiento(rendimiento)}</div>
              </div>
              <div style={{ fontSize: 36, fontWeight: 900, color: colorRendimiento(rendimiento), lineHeight: 1 }}>{rendimiento}</div>
            </div>
            <input type="range" min={1} max={10} step={1} value={rendimiento}
              onChange={e => setRendimiento(Number(e.target.value))}
              style={{ width: '100%', accentColor: colorRendimiento(rendimiento), height: 4, cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 10, color: '#444' }}>Muy bajo</span>
              <span style={{ fontSize: 10, color: '#444' }}>Muy alto</span>
            </div>
          </div>

          {/* EMOCIONES */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: '#a3e635', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 4 }}>Emociones durante el juego</div>
            <div style={{ fontSize: 11, color: '#555', marginBottom: 12 }}>Podés seleccionar más de una</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {emociones.map(e => (
                <div key={e.label} onClick={() => toggleEmocion(e.label)} style={{
                  background: emocionesSeleccionadas.includes(e.label) ? 'rgba(163,230,53,0.12)' : 'rgba(255,255,255,0.03)',
                  border: emocionesSeleccionadas.includes(e.label) ? '1.5px solid rgba(163,230,53,0.4)' : '0.5px solid rgba(255,255,255,0.08)',
                  borderRadius: 12, padding: '10px 4px', textAlign: 'center', cursor: 'pointer'
                }}>
                  <div style={{ fontSize: 22 }}>{e.icon}</div>
                  <div style={{ fontSize: 9, color: emocionesSeleccionadas.includes(e.label) ? '#a3e635' : '#555', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.03em', lineHeight: 1.3 }}>{e.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ZOR */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: '#a3e635', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 4 }}>⚡ ZOR — Zona Óptima de Rendimiento</div>
            <div style={{ fontSize: 11, color: '#555', marginBottom: 16, lineHeight: 1.5 }}>Indicá el nivel con el que jugaste en cada dimensión</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Concentración', key: 'concentracion', val: zor.concentracion },
                { label: 'Activación', key: 'activacion', val: zor.activacion },
                { label: 'Confianza', key: 'confianza', val: zor.confianza },
                { label: '¿Qué tan difícil lo sentiste?', key: 'desafio', val: zor.desafio },
                { label: 'Motivación', key: 'motivacion', val: zor.motivacion },
                { label: 'Frustración', key: 'frustracion', val: zor.frustracion },
              ].map(s => (
                <div key={s.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: '#ccc' }}>{s.label}</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: colorSlider(s.label, s.val), minWidth: 20, textAlign: 'right' }}>{s.val}</span>
                  </div>
                  <input type="range" min={1} max={10} step={1} value={s.val}
                    onChange={e => setZor({ ...zor, [s.key]: Number(e.target.value) })}
                    style={{ width: '100%', accentColor: colorSlider(s.label, s.val), height: 4, cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                    <span style={{ fontSize: 9, color: '#444' }}>Muy bajo</span>
                    <span style={{ fontSize: 9, color: '#444' }}>Muy alto</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* REFLEXIÓN */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: '#a3e635', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 14 }}>✦ Reflexión</div>
            {[
              { label: '¿Qué pensamientos tuviste durante el juego?', placeholder: 'Hoy pensé que...', val: pensamientos, set: setPensamientos, bonus: '+5 MM' },
              { label: '¿Qué frase o pensamiento te ayudó a rendir mejor?', placeholder: 'La frase que me ayudó fue...', val: fraseAyudo, set: setFraseAyudo, bonus: '+2 MM' },
              { label: '¿Qué aprendiste hoy?', placeholder: 'Hoy aprendí que...', val: aprendizajes, set: setAprendizajes, bonus: '+3 MM' },
            ].map((campo, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontSize: 11, color: '#888', flex: 1, lineHeight: 1.4 }}>{campo.label}</div>
                  <div style={{ fontSize: 10, color: '#a3e635', fontWeight: 700, marginLeft: 8, flexShrink: 0 }}>{campo.bonus}</div>
                </div>
                <textarea value={campo.val} onChange={e => campo.set(e.target.value)}
                  placeholder={campo.placeholder}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: campo.val.trim().length > 3 ? '1px solid rgba(163,230,53,0.3)' : '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px', color: '#f0f0f0', fontSize: 13, outline: 'none', resize: 'none', minHeight: 70, lineHeight: 1.5, boxSizing: 'border-box', fontFamily: 'system-ui', transition: 'border 0.2s' }}
                />
              </div>
            ))}
          </div>

          {/* BOTÓN */}
          <div onClick={guardar} style={{
            background: guardando ? '#333' : '#a3e635', borderRadius: 14,
            padding: '16px 20px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', cursor: guardando ? 'not-allowed' : 'pointer'
          }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: guardando ? '#888' : '#0a0a0a' }}>
                {guardando ? 'Guardando...' : 'Guardar registro'}
              </div>
              <div style={{ fontSize: 11, color: guardando ? '#666' : 'rgba(0,0,0,0.45)', marginTop: 1 }}>
                +{mmEstimados} MM a tu semana
              </div>
            </div>
            <div style={{ fontSize: 22 }}>🧠</div>
          </div>

        </div>
      </div>

      {/* BOTTOM NAV */}
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
            <span style={{ fontSize: 9, color: t.path === '/registrar' ? '#a3e635' : '#666' }}>{t.label}</span>
          </div>
        ))}
      </div>
    </main>
  )
}