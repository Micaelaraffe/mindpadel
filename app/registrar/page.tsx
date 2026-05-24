'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
  const [emocion, setEmocion] = useState('Enfocado')
  const [guardado, setGuardado] = useState(false)
  const [pensamientos, setPensamientos] = useState('')
  const [autodialogo, setAutodialogo] = useState('')
  const [zor, setZor] = useState({
    concentracion: 7,
    activacion: 6,
    confianza: 8,
    desafio: 7,
    motivacion: 9,
    frustracion: 3,
  })

  function guardar() {
    setGuardado(true)
    setTimeout(() => {
      setGuardado(false)
      router.push('/home')
    }, 2000)
  }

  return (
    <main style={{ background: '#0a0a0a', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#f0f0f0', maxWidth: 390, margin: '0 auto' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 12px' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>MindPádel</div>
          <div style={{ fontSize: 9, color: '#666', letterSpacing: '0.1em' }}>by @micaraffe.psi</div>
        </div>
        <div onClick={() => router.push('/')} style={{ width: 32, height: 32, borderRadius: '50%', background: '#1a1a1a', border: '1.5px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>M</div>
      </div>

      <div style={{ padding: '0 20px 100px' }}>

        {/* TÍTULO */}
        <div style={{ paddingBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em' }}>Nuevo Registro</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Registrá tu estado mental y emocional</div>
        </div>

        {/* BANNER ÉXITO */}
        {guardado && (
          <div style={{ background: 'rgba(163,230,53,0.12)', border: '1px solid rgba(163,230,53,0.25)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 18 }}>✅</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>¡Registro guardado con éxito!</span>
          </div>
        )}

        {/* TIPO DE SESIÓN */}
        <div style={{ fontSize: 11, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Tipo de sesión</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['Entrenamiento', 'Partido', 'Torneo'].map(t => (
            <button key={t} onClick={() => setTipo(t)} style={{
              flex: 1, padding: '10px 6px',
              background: tipo === t ? 'rgba(163,230,53,0.12)' : '#1a1a1a',
              border: tipo === t ? '1px solid rgba(163,230,53,0.4)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, color: tipo === t ? '#a3e635' : '#888',
              fontSize: 11, cursor: 'pointer', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>{t}</button>
          ))}
        </div>

        {/* EMOCIÓN */}
        <div style={{ fontSize: 11, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Emoción predominante</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
          {emociones.map(e => (
            <div key={e.label} onClick={() => setEmocion(e.label)} style={{
              background: emocion === e.label ? 'rgba(163,230,53,0.12)' : '#1a1a1a',
              border: emocion === e.label ? '1px solid rgba(163,230,53,0.4)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12, padding: '12px 6px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 4, cursor: 'pointer'
            }}>
              <span style={{ fontSize: 22 }}>{e.icon}</span>
              <span style={{ fontSize: 9, color: emocion === e.label ? '#a3e635' : '#666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{e.label}</span>
            </div>
          ))}
        </div>

        {/* SEPARADOR */}
        <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.08)', margin: '4px 0 20px' }}></div>

        {/* ZOR SLIDERS */}
        <div style={{ fontSize: 11, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>⚡ ZOR — Zona Óptima de Rendimiento</div>

        <Slider label="Concentración" value={zor.concentracion} onChange={v => setZor({ ...zor, concentracion: v })} />
        <Slider label="Activación" value={zor.activacion} onChange={v => setZor({ ...zor, activacion: v })} />
        <Slider label="Confianza" value={zor.confianza} onChange={v => setZor({ ...zor, confianza: v })} />
        <Slider label="Desafío percibido" value={zor.desafio} onChange={v => setZor({ ...zor, desafio: v })} />
        <Slider label="Motivación" value={zor.motivacion} onChange={v => setZor({ ...zor, motivacion: v })} />
        <Slider label="Frustración" value={zor.frustracion} onChange={v => setZor({ ...zor, frustracion: v })} />

        {/* SEPARADOR */}
        <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.08)', margin: '4px 0 20px' }}></div>

        {/* PENSAMIENTOS */}
        <div style={{ fontSize: 11, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Pensamientos y sensaciones</div>
        <textarea value={pensamientos} onChange={e => setPensamientos(e.target.value)}
          placeholder="¿Cómo te sentiste? ¿Qué pensamientos tuviste? ¿Qué aprendiste hoy?"
          style={{ width: '100%', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '13px 16px', color: '#f0f0f0', fontSize: 14, outline: 'none', resize: 'none', minHeight: 80, lineHeight: 1.5, boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif' }}
        />

        <div style={{ fontSize: 11, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '16px 0 8px' }}>Autodiálogo durante el juego</div>
        <textarea value={autodialogo} onChange={e => setAutodialogo(e.target.value)}
          placeholder="¿Qué te decías a vos mismo/a? ¿Fue positivo o negativo?"
          style={{ width: '100%', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '13px 16px', color: '#f0f0f0', fontSize: 14, outline: 'none', resize: 'none', minHeight: 80, lineHeight: 1.5, boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif' }}
        />

        {/* BOTÓN GUARDAR */}
        <button onClick={guardar} style={{
          width: '100%', background: '#a3e635', color: '#0a0a0a', border: 'none',
          borderRadius: 14, padding: 17, fontSize: 16, fontWeight: 700,
          cursor: 'pointer', marginTop: 16, display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 8
        }}>
          💾 Guardar registro
        </button>

      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 390, background: 'rgba(10,10,10,0.96)', borderTop: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', padding: '10px 0 20px', zIndex: 100 }}>
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