'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const registrosEjemplo = [
  { tipo: 'Partido', resultado: 'Ganado', fecha: 'Hoy', zor: 8.2, icon: '🏆' },
  { tipo: 'Entrenamiento', resultado: 'Positivo', fecha: 'Hace 2 días', zor: 7.1, icon: '🎾' },
  { tipo: 'Torneo', resultado: 'Perdido', fecha: 'Hace 1 semana', zor: 6.4, icon: '🥇' },
]

export default function HomePage() {
  const router = useRouter()
  const [objetivo, setObjetivo] = useState('Mejorar mi concentración en los puntos decisivos')
  const [editandoObjetivo, setEditandoObjetivo] = useState(false)
  const [objTemp, setObjTemp] = useState(objetivo)

  const partidos = registrosEjemplo.filter(r => r.tipo === 'Partido').length
  const entrenamientos = registrosEjemplo.filter(r => r.tipo === 'Entrenamiento').length
  const torneos = registrosEjemplo.filter(r => r.tipo === 'Torneo').length

  function guardarObjetivo() {
    setObjetivo(objTemp)
    setEditandoObjetivo(false)
  }

  return (
    <main style={{
      minHeight: '100vh',
      fontFamily: 'system-ui, sans-serif',
      color: '#f0f0f0',
      maxWidth: 390,
      margin: '0 auto',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #0a1a0a 60%, #0d2e0d 100%)',
    }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 12px' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Pádel Mental App</div>
          <div style={{ fontSize: 9, color: '#a3e635', letterSpacing: '0.1em' }}>By Ps. Mica Raffe</div>
        </div>
        <div onClick={() => router.push('/')} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(163,230,53,0.15)', border: '1.5px solid rgba(163,230,53,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#a3e635' }}>M</div>
      </div>

      <div style={{ padding: '0 20px 100px' }}>

        {/* SALUDO */}
        <div style={{ paddingBottom: 20 }}>
          <div style={{ display: 'inline-block', background: 'rgba(163,230,53,0.12)', color: '#a3e635', fontSize: 11, padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(163,230,53,0.25)', marginBottom: 8, letterSpacing: '0.08em' }}>✦ Domingo</div>
          <div style={{ fontWeight: 800, fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1.15 }}>Hola, Matías 👋</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>24 de mayo, 2026</div>
        </div>

        {/* OBJETIVO ACTUAL */}
        <div style={{ background: 'rgba(163,230,53,0.06)', border: '1px solid rgba(163,230,53,0.2)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: '#a3e635', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>🎯 Objetivo actual</div>
            <div onClick={() => { setObjTemp(objetivo); setEditandoObjetivo(true) }} style={{ fontSize: 11, color: '#a3e635', cursor: 'pointer' }}>Editar</div>
          </div>
          {editandoObjetivo ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <textarea value={objTemp} onChange={e => setObjTemp(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(163,230,53,0.3)', borderRadius: 8, padding: '10px 12px', color: '#f0f0f0', fontSize: 13, outline: 'none', resize: 'none', minHeight: 60, boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif' }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={guardarObjetivo} style={{ flex: 1, background: '#a3e635', color: '#0a0a0a', border: 'none', borderRadius: 8, padding: '8px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Guardar</button>
                <button onClick={() => setEditandoObjetivo(false)} style={{ flex: 1, background: 'transparent', color: '#888', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 14, lineHeight: 1.5, color: '#f0f0f0' }}>{objetivo}</div>
          )}
        </div>

        {/* CONTADORES DE REGISTROS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
          {[
            { val: partidos, label: 'Partidos', icon: '🏆' },
            { val: entrenamientos, label: 'Entrenos', icon: '🎾' },
            { val: torneos, label: 'Torneos', icon: '🥇' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 22, color: '#a3e635' }}>{s.val}</div>
              <div style={{ fontSize: 10, color: '#666', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ZOR CARD */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ color: '#a3e635', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>⚡ ZOR — Última sesión</div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>Zona Óptima de Rendimiento</div>
            </div>
            <div style={{ background: 'rgba(163,230,53,0.12)', border: '1px solid rgba(163,230,53,0.25)', borderRadius: 20, padding: '4px 10px', fontSize: 11, color: '#a3e635' }}>Óptimo</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Concentración', val: 8, pct: '80%' },
              { label: 'Activación', val: 7, pct: '70%' },
              { label: 'Confianza', val: 8, pct: '80%' },
              { label: 'Desafío', val: 6, pct: '60%' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{m.label}</div>
                <div style={{ fontWeight: 800, fontSize: 20, color: i % 2 === 0 ? '#a3e635' : '#f0f0f0' }}>{m.val}</div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginTop: 8 }}>
                  <div style={{ height: '100%', width: m.pct, background: '#a3e635', borderRadius: 2 }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* INSIGHT */}
        <div style={{ background: 'rgba(255,255,255,0.03)', borderLeft: '3px solid #a3e635', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: '#a3e635', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>✦ Insight de tu psicóloga</div>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>Tus mejores partidos aparecen cuando la confianza está entre 7 y 8. Tu rendimiento baja cuando la activación supera 9.</div>
        </div>

        {/* ÚLTIMOS REGISTROS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888' }}>Últimos registros</div>
          <div onClick={() => router.push('/registrar')} style={{ fontSize: 12, color: '#a3e635', cursor: 'pointer' }}>+ Nuevo →</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {registrosEjemplo.map((r, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(163,230,53,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{r.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{r.tipo}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{r.fecha}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: 18, color: '#a3e635' }}>{r.zor}</div>
                <div style={{
                  fontSize: 10, marginTop: 2, fontWeight: 600,
                  color: r.resultado === 'Ganado' || r.resultado === 'Positivo' ? '#a3e635' : '#f87171'
                }}>{r.resultado}</div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 390, background: 'rgba(10,10,10,0.96)', borderTop: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', padding: '10px 0 20px', zIndex: 100 }}>
        {[
          { icon: '🏠', label: 'Inicio', path: '/home', active: true },
          { icon: '➕', label: 'Registrar', path: '/registrar', active: false },
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