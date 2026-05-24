'use client'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  return (
    <main style={{ background: '#0a0a0a', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#f0f0f0', maxWidth: 390, margin: '0 auto' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 12px' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: '0.05em' }}>MindPádel</div>
          <div style={{ fontSize: 9, color: '#666', letterSpacing: '0.1em' }}>by @micaraffe.psi</div>
        </div>
        <div onClick={() => router.push('/')} style={{
          width: 32, height: 32, borderRadius: '50%', background: '#1a1a1a',
          border: '1.5px solid rgba(255,255,255,0.15)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 12,
          fontWeight: 600, cursor: 'pointer'
        }}>M</div>
      </div>

      {/* CONTENIDO */}
      <div style={{ padding: '0 20px 100px' }}>

        {/* SALUDO */}
        <div style={{ paddingBottom: 20 }}>
          <div style={{
            display: 'inline-block', background: 'rgba(163,230,53,0.12)',
            color: '#a3e635', fontSize: 11, padding: '4px 10px',
            borderRadius: 20, border: '1px solid rgba(163,230,53,0.25)',
            marginBottom: 8, letterSpacing: '0.08em'
          }}>✦ Domingo</div>
          <div style={{ fontWeight: 800, fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1.15 }}>Hola, Matías 👋</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>24 de mayo, 2026</div>
        </div>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
          {[
            { val: '12', label: 'Registros', accent: true },
            { val: '7.4', label: 'ZOR prom.', accent: false },
            { val: '3', label: 'Esta semana', accent: true },
          ].map((s, i) => (
            <div key={i} style={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 12px', textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 22, color: s.accent ? '#a3e635' : '#f0f0f0' }}>{s.val}</div>
              <div style={{ fontSize: 10, color: '#666', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ZOR CARD */}
        <div style={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
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
              <div key={i} style={{ background: '#222', borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{m.label}</div>
                <div style={{ fontWeight: 800, fontSize: 20, color: i % 2 === 0 ? '#a3e635' : '#f0f0f0' }}>{m.val}</div>
                <div style={{ height: 3, background: '#0a0a0a', borderRadius: 2, marginTop: 8 }}>
                  <div style={{ height: '100%', width: m.pct, background: '#a3e635', borderRadius: 2 }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* INSIGHT */}
        <div style={{ background: '#1a1a1a', borderLeft: '3px solid #a3e635', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: '#a3e635', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>✦ Insight de tu psicóloga</div>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>Tus mejores partidos aparecen cuando la confianza está entre 7 y 8. Tu rendimiento baja cuando la activación supera 9.</div>
        </div>

        {/* ÚLTIMOS REGISTROS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888' }}>Últimos registros</div>
          <div onClick={() => router.push('/registrar')} style={{ fontSize: 12, color: '#a3e635', cursor: 'pointer' }}>Ver todos →</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon: '🎾', tipo: 'Entrenamiento', meta: 'Hoy · Concentrado, motivado', score: '8.2', color: 'rgba(163,230,53,0.15)' },
            { icon: '🏆', tipo: 'Partido', meta: 'Hace 2 días · Algo tenso', score: '6.8', color: 'rgba(96,165,250,0.15)' },
            { icon: '🥇', tipo: 'Torneo Regional', meta: 'Hace 1 semana · Enfocado', score: '7.5', color: 'rgba(251,146,60,0.15)' },
          ].map((r, i) => (
            <div key={i} style={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{r.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{r.tipo}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{r.meta}</div>
              </div>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#a3e635' }}>{r.score}</div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: 390, background: 'rgba(10,10,10,0.96)', borderTop: '0.5px solid rgba(255,255,255,0.08)',
        display: 'flex', padding: '10px 0 20px', zIndex: 100
      }}>
        {[
          { icon: '🏠', label: 'Inicio', path: '/home', active: true },
          { icon: '➕', label: 'Registrar', path: '/registrar', active: false },
          { icon: '📊', label: 'Gráficos', path: '/graficos', active: false },
          { icon: '📚', label: 'Biblioteca', path: '/home', active: false },
        ].map((t, i) => (
          <div key={i} onClick={() => router.push(t.path)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 4, cursor: 'pointer', padding: '4px 0'
          }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ fontSize: 10, color: t.active ? '#a3e635' : '#666' }}>{t.label}</span>
          </div>
        ))}
      </div>

    </main>
  )
}