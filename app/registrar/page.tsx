'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

const emociones = [
  { icon: '😤', label: 'Enfocado' },
  { icon: '😰', label: 'Ansioso' },
  { icon: '💪', label: 'Motivado' },
  { icon: '😤', label: 'Frustrado' },
  { icon: '😌', label: 'Tranquilo' },
  { icon: '🔥', label: 'Activado' },
  { icon: '😟', label: 'Inseguro' },
  { icon: '🌊', label: 'En flujo' },
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
    </div>
  )
}

export default function RegistrarPage() {
  const router = useRouter()
  const [tipo, setTipo] = useState('Entrenamiento')
  const [resultado, setResultado] = useState('')
  const [emocion, setEmocion] = useState('Enfocado')
  const [guardado, setGuardado] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [pensamientos, setPensamientos] = useState('')
  const [autodialogo, setAutodialogo] = useState('')
  const [zor, setZor] = useState({ concentracion: 7, activacion: 6, confianza: 8, desafio: 7, motivacion: 9, frustracion: 3 })

  const opcionesResultado: Record<string, { positivo: string, negativo: string }> = {
    'Entrenamiento': { positivo: '✅ Entrenamiento positivo', negativo: '❌ Entrenamiento negativo' },
    'Partido': { positivo: '🏆 Gané el partido', negativo: '💪 Perdí el partido' },
    'Torneo': { positivo: '🥇 Resultado positivo', negativo: '📈 Resultado a mejorar' },
  }

  async function guardar() {
    if (!resultado) {
      setError('Por favor indicá cómo fue la sesión')
      return
    }
    setGuardando(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }

    const { error: insertError } = await supabase.from('registros').insert({
      user_id: user.id,
      tipo,
      resultado,
      emocion,
      concentracion: zor.concentracion,
      activacion: zor.activacion,
      confianza: zor.confianza,
      desafio: zor.desafio,
      motivacion: zor.motivacion,
      frustracion: zor.frustracion,
      pensamientos,
      autodialogo,
    })

    setGuardando(false)

    if (insertError) {
      setError('Error al guardar. Intentá de nuevo.')
      return
    }

    setGuardado(true)
    setTimeout(() => {
      router.push('/home')
    }, 1500)
  }

  return (
    <main style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#f0f0f0', width: '100%' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 12px' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Pádel Mental App</div>
          <div style={{ fontSize: 9, color: '#a3e635', letterSpacing: '0.1em' }}>By Ps. Mica Raffe</div>
        </div>
        <div onClick={() => router.push('/home')} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(163,230,53,0.15)', border: '1.5px solid rgba(163,230,53,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer' }}>←</div>
      </div>

      <div style={{ padding: '0 20px 100px' }}>

        <div style={{ paddingBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em' }}>Nuevo Registro</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Registrá tu estado mental y emocional</div>
        </div>

        {guardado && (
          <div style={{ background: 'rgba(163,230,53,0.12)', border: '1px solid rgba(163,230,53,0.25)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 18 }}>✅</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>¡Registro guardado con éxito!</span>
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171', marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* TIPO */}
        <div style={{ fontSize: 11, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Tipo de sesión</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['Entrenamiento', 'Partido', 'Torneo'].map(t => (
            <button key={t} onClick={() => { setTipo(t); setResultado('') }} style={{
              flex: 1, padding: '10px 6px',
              background: tipo === t ? 'rgba(163,230,53,0.12)' : 'rgba(255,255,255,0.03)',
              border: tipo === t ? '1px solid rgba(163,230,53,0.4)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, color: tipo === t ? '#a3e635' : '#888',
              fontSize: 11, cursor: 'pointer', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>{t}</button>
          ))}
        </div>

        {/* RESULTADO */}
        <div style={{ fontSize: 11, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>¿Cómo fue?</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[opcionesResultado[tipo].positivo, opcionesResultado[tipo].negativo].map(op => (
            <button key={op} onClick={() => setResultado(op)} style={{
              flex: 1, padding: '12px 8px',
              background: resultado === op ? 'rgba(163,230,53,0.12)' : 'rgba(255,255,255,0.03)',
              border: resultado === op ? '1px solid rgba(163,230,53,0.4)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, color: resultado === op ? '#a3e635' : '#888',
              fontSize: 12, cursor: 'pointer', fontWeight: 600, textAlign: 'center', lineHeight: 1.4
            }}>{op}</button>
          ))}
        </div>

        {/* EMOCIÓN */}
        <div style={{ fontSize: 11, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Emoción predominante</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
          {emociones.map(e => (
            <div key={e.label} onClick={() => setEmocion(e.label)} style={{
              background: emocion === e.label ? 'rgba(163,230,53,0.12)' : 'rgba(255,255,255,0.03)',
              border: emocion === e.label ? '1px solid rgba(163,230,53,0.4)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12, padding: '12px 6px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 4, cursor: 'pointer'
            }}>
              <span style={{ fontSize: 22 }}>{e.icon}</span>
              <span style={{ fontSize: 9, color: emocion === e.label ? '#a3e635' : '#666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{e.label}</span>
            </div>
          ))}
        </div>

        <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.08)', margin: '4px 0 20px' }}></div>
        <div style={{ fontSize: 11, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>⚡ ZOR — Zona Óptima de Rendimiento</div>

        <Slider label="Concentración" value={zor.concentracion} onChange={v => setZor({ ...zor, concentracion: v })} />
        <Slider label="Activación" value={zor.activacion} onChange={v => setZor({ ...zor, activacion: v })} />
        <Slider label="Confianza" value={zor.confianza} onChange={v => setZor({ ...zor, confianza: v })} />
        <Slider label="Desafío percibido" value={zor.desafio} onChange={v => setZor({ ...zor, desafio: v })} />
        <Slider label="Motivación" value={zor.motivacion} onChange={v => setZor({ ...zor, motivacion: v })} />
        <Slider label="Frustración" value={zor.frustracion} onChange={v => setZor({ ...zor, frustracion: v })} />

        <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.08)', margin: '4px 0 20px' }}></div>

        <div style={{ fontSize: 11, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Pensamientos y sensaciones</div>
        <textarea value={pensamientos} onChange={e => setPensamientos(e.target.value)}
          placeholder="¿Cómo te sentiste? ¿Qué pensamientos tuviste? ¿Qué aprendiste hoy?"
          style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '13px 16px', color: '#f0f0f0', fontSize: 14, outline: 'none', resize: 'none', minHeight: 80, lineHeight: 1.5, boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif' }}
        />

        <div style={{ fontSize: 11, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '16px 0 8px' }}>Autodiálogo durante el juego</div>
        <textarea value={autodialogo} onChange={e => setAutodialogo(e.target.value)}
          placeholder="¿Qué te decías a vos mismo/a? ¿Fue positivo o negativo?"
          style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '13px 16px', color: '#f0f0f0', fontSize: 14, outline: 'none', resize: 'none', minHeight: 80, lineHeight: 1.5, boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif' }}
        />

        <button onClick={guardar} disabled={guardando} style={{
          width: '100%', background: guardando ? '#333' : '#a3e635',
          color: guardando ? '#888' : '#0a0a0a', border: 'none',
          borderRadius: 14, padding: 17, fontSize: 16, fontWeight: 700,
          cursor: guardando ? 'not-allowed' : 'pointer', marginTop: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
        }}>
          {guardando ? 'Guardando...' : '💾 Guardar registro'}
        </button>

      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: 'rgba(10,10,10,0.96)', borderTop: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', padding: '10px 0 20px', zIndex: 100 }}>
        {[
          { icon: '🏠', label: 'Inicio', path: '/home', active: false },
          { icon: '➕', label: 'Registrar', path: '/registrar', active: true },
          { icon: '📊', label: 'Gráficos', path: '/graficos', active: false },
          { icon: '📚', label: 'Biblioteca', path: '/home', active: false },
        ].map((t, i) => (
          <div key={i} onClick={() => router.push(t.path)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '4px 0' }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ fontSize: 10, color: t.active ? '#a3e635' : '#666' }}>{t.label}</span>
          </div>
        ))}
      </div>

    </main>
  )
}