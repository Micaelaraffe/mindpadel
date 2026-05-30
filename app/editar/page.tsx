'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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

function Slider({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
        <span style={{ fontWeight: 800, fontSize: 18, color: '#a3e635', minWidth: 24, textAlign: 'right' }}>{value}</span>
      </div>
      <input type="range" min={1} max={10} step={1} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#a3e635', height: 4, cursor: 'pointer' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 10, color: '#666' }}>Muy bajo</span>
        <span style={{ fontSize: 10, color: '#666' }}>Muy alto</span>
      </div>
    </div>
  )
}

function EditarRegistro() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState('')
  const [tipo, setTipo] = useState('Entrenamiento')
  const [subtipo, setSubtipo] = useState('')
  const [rendimiento, setRendimiento] = useState(5)
  const [emocionesSeleccionadas, setEmocionesSeleccionadas] = useState<string[]>([])
  const [pensamientos, setPensamientos] = useState('')
  const [fraseAyudo, setFraseAyudo] = useState('')
  const [aprendizajes, setAprendizajes] = useState('')
  const [zor, setZor] = useState({
    concentracion: 5, activacion: 5, confianza: 5,
    desafio: 5, motivacion: 5, frustracion: 5,
  })

  useEffect(() => { if (id) cargarRegistro(id) }, [id])

  async function cargarRegistro(registroId: string) {
    const { data } = await supabase.from('registros').select('*').eq('id', registroId).single()
    if (data) {
      setTipo(data.tipo === 'Partido amistoso' || data.tipo === 'Torneo' ? 'Partido' : data.tipo)
      setSubtipo(data.tipo === 'Partido amistoso' || data.tipo === 'Torneo' ? data.tipo : '')
      setRendimiento(Number(data.resultado) || 5)
      setEmocionesSeleccionadas(data.emocion ? data.emocion.split(', ').filter(Boolean) : [])
      setPensamientos(data.pensamientos || '')
      setFraseAyudo(data.frase_ayudo || data.autodialogo || '')
      setAprendizajes(data.aprendizajes || '')
      setZor({
        concentracion: data.concentracion || 5,
        activacion: data.activacion || 5,
        confianza: data.confianza || 5,
        desafio: data.desafio || 5,
        motivacion: data.motivacion || 5,
        frustracion: data.frustracion || 5,
      })
    }
    setLoading(false)
  }

  function toggleEmocion(label: string) {
    setEmocionesSeleccionadas(prev =>
      prev.includes(label) ? prev.filter(e => e !== label) : [...prev, label]
    )
  }

  async function guardar() {
    if (emocionesSeleccionadas.length === 0) {
      setError('Por favor seleccioná al menos una emoción')
      return
    }
    setGuardando(true)
    setError('')

    const { error: updateError } = await supabase.from('registros').update({
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
      frase_ayudo: fraseAyudo,
      autodialogo: fraseAyudo,
      aprendizajes,
    }).eq('id', id!)

    setGuardando(false)

    if (updateError) {
      setError('Error al guardar. Intentá de nuevo.')
      return
    }

    setGuardado(true)
    setTimeout(() => router.push('/home'), 1500)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a3e635', fontFamily: 'system-ui' }}>Cargando...</div>
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
          <div style={{ display: 'inline-block', background: 'rgba(163,230,53,0.12)', color: '#a3e635', fontSize: 11, padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(163,230,53,0.25)', marginBottom: 8 }}>✏️ Editando registro</div>
          <div style={{ fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em' }}>Editar Registro</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Modificá los datos de este registro</div>
        </div>

        {guardado && (
          <div style={{ background: 'rgba(163,230,53,0.12)', border: '1px solid rgba(163,230,53,0.25)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 18 }}>✅</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>¡Registro actualizado con éxito!</span>
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171', marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* TIPO */}
        <div style={{ fontSize: 11, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Tipo de sesión</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: tipo === 'Partido' ? 12 : 20 }}>
          {['Entrenamiento', 'Partido'].map(t => (
            <button key={t} onClick={() => { setTipo(t); setSubtipo('') }} style={{
              flex: 1, padding: '12px 6px',
              background: tipo === t ? 'rgba(163,230,53,0.12)' : 'rgba(255,255,255,0.03)',
              border: tipo === t ? '1px solid rgba(163,230,53,0.4)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, color: tipo === t ? '#a3e635' : '#888',
              fontSize: 13, cursor: 'pointer', fontWeight: 600
            }}>{t === 'Entrenamiento' ? '🎾 Entrenamiento' : '🏆 Partido'}</button>
          ))}
        </div>

        {tipo === 'Partido' && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Tipo de partido</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Partido amistoso', 'Torneo'].map(s => (
                <button key={s} onClick={() => setSubtipo(s)} style={{
                  flex: 1, padding: '10px 6px',
                  background: subtipo === s ? 'rgba(163,230,53,0.12)' : 'rgba(255,255,255,0.03)',
                  border: subtipo === s ? '1px solid rgba(163,230,53,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10, color: subtipo === s ? '#a3e635' : '#888',
                  fontSize: 12, cursor: 'pointer', fontWeight: 600
                }}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {/* RENDIMIENTO */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>📊 Valoración del rendimiento</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13 }}>¿Cómo percibiste tu rendimiento?</span>
            <span style={{ fontWeight: 800, fontSize: 20, color: '#a3e635' }}>{rendimiento}</span>
          </div>
          <input type="range" min={1} max={10} step={1} value={rendimiento}
            onChange={e => setRendimiento(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#a3e635', height: 4, cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: '#666' }}>Muy bajo</span>
            <span style={{ fontSize: 10, color: '#666' }}>Muy alto</span>
          </div>
        </div>

        {/* EMOCIONES */}
        <div style={{ fontSize: 11, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Emociones</div>
        <div style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>Podés seleccionar más de una</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
          {emociones.map(e => (
            <div key={e.label} onClick={() => toggleEmocion(e.label)} style={{
              background: emocionesSeleccionadas.includes(e.label) ? 'rgba(163,230,53,0.12)' : 'rgba(255,255,255,0.03)',
              border: emocionesSeleccionadas.includes(e.label) ? '1px solid rgba(163,230,53,0.4)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12, padding: '10px 4px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 4, cursor: 'pointer'
            }}>
              <span style={{ fontSize: 20 }}>{e.icon}</span>
              <span style={{ fontSize: 9, color: emocionesSeleccionadas.includes(e.label) ? '#a3e635' : '#666', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center', lineHeight: 1.3 }}>{e.label}</span>
            </div>
          ))}
        </div>

        {/* ZOR */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: '#a3e635', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4, fontWeight: 700 }}>⚡ ZOR — Zona Óptima de Rendimiento</div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>Indicá para cada uno el nivel predominante en el que jugaste</div>
          <Slider label="Concentración" value={zor.concentracion} onChange={v => setZor({ ...zor, concentracion: v })} />
          <Slider label="Activación" value={zor.activacion} onChange={v => setZor({ ...zor, activacion: v })} />
          <Slider label="Confianza" value={zor.confianza} onChange={v => setZor({ ...zor, confianza: v })} />
          <Slider label="Desafío percibido" value={zor.desafio} onChange={v => setZor({ ...zor, desafio: v })} />
          <Slider label="Motivación" value={zor.motivacion} onChange={v => setZor({ ...zor, motivacion: v })} />
          <Slider label="Frustración" value={zor.frustracion} onChange={v => setZor({ ...zor, frustracion: v })} />
        </div>

        {/* TEXTOS */}
        <div style={{ fontSize: 11, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Pensamientos sobre tu juego</div>
        <textarea value={pensamientos} onChange={e => setPensamientos(e.target.value)}
          placeholder="¿Qué pensamientos tuviste durante el juego?"
          style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '13px 16px', color: '#f0f0f0', fontSize: 14, outline: 'none', resize: 'none', minHeight: 80, lineHeight: 1.5, boxSizing: 'border-box', fontFamily: 'system-ui', marginBottom: 16 }}
        />

        <div style={{ fontSize: 11, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Frase que te ayudó hoy</div>
        <textarea value={fraseAyudo} onChange={e => setFraseAyudo(e.target.value)}
          placeholder="¿Qué frase o pensamiento te ayudó a rendir mejor?"
          style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '13px 16px', color: '#f0f0f0', fontSize: 14, outline: 'none', resize: 'none', minHeight: 80, lineHeight: 1.5, boxSizing: 'border-box', fontFamily: 'system-ui', marginBottom: 16 }}
        />

        <div style={{ fontSize: 11, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Aprendizajes</div>
        <textarea value={aprendizajes} onChange={e => setAprendizajes(e.target.value)}
          placeholder="¿Qué aprendiste hoy?"
          style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '13px 16px', color: '#f0f0f0', fontSize: 14, outline: 'none', resize: 'none', minHeight: 80, lineHeight: 1.5, boxSizing: 'border-box', fontFamily: 'system-ui', marginBottom: 0 }}
        />

        <button onClick={guardar} disabled={guardando} style={{
          width: '100%', background: guardando ? '#333' : '#a3e635',
          color: guardando ? '#888' : '#0a0a0a', border: 'none',
          borderRadius: 14, padding: 17, fontSize: 16, fontWeight: 700,
          cursor: guardando ? 'not-allowed' : 'pointer', marginTop: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
        }}>
          {guardando ? 'Guardando...' : '💾 Guardar cambios'}
        </button>

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
            <span style={{ fontSize: 9, color: '#666' }}>{t.label}</span>
          </div>
        ))}
      </div>

    </main>
  )
}

export default function EditarPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a3e635', fontFamily: 'system-ui' }}>Cargando...</div>}>
      <EditarRegistro />
    </Suspense>
  )
}