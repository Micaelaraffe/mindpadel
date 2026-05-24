'use client'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const jugadores = [
  { iniciales: 'MG', nombre: 'Matías García', registros: 12, ultima: 'Hoy', zor: 8.2, color: 'rgba(163,230,53,0.15)', textColor: '#a3e635', estado: 'Óptimo' },
  { iniciales: 'SR', nombre: 'Sofía Rodríguez', registros: 8, ultima: 'Hace 2 días', zor: 6.8, color: 'rgba(96,165,250,0.15)', textColor: '#60a5fa', estado: 'Regular' },
  { iniciales: 'JL', nombre: 'Juan López', registros: 5, ultima: 'Hace 3 días', zor: 7.4, color: 'rgba(251,146,60,0.15)', textColor: '#fb923c', estado: 'Bueno' },
  { iniciales: 'VP', nombre: 'Valentina Pérez', registros: 9, ultima: 'Ayer', zor: 7.9, color: 'rgba(192,132,252,0.15)', textColor: '#c084fc', estado: 'Bueno' },
]

const zorGrupo = [
  { nombre: 'Matías', zor: 8.2 },
  { nombre: 'Sofía', zor: 6.8 },
  { nombre: 'Juan', zor: 7.4 },
  { nombre: 'Valentina', zor: 7.9 },
]

const biblioteca = [
  { tipo: 'pdf', icon: '📄', color: 'rgba(239,68,68,0.15)', titulo: 'Gestión de ansiedad en torneo', meta: 'PDF · 8 páginas · Hace 3 días', tag: 'Torneos' },
  { tipo: 'audio', icon: '🎙️', color: 'rgba(168,85,247,0.15)', titulo: 'Respiración pre-partido', meta: 'Audio · 8 min · Hace 1 semana', tag: 'Activación' },
  { tipo: 'ejercicio', icon: '🧠', color: 'rgba(163,230,53,0.15)', titulo: 'Rutina de visualización', meta: 'Ejercicio · 5 pasos · Hace 2 semanas', tag: 'Concentración' },
]

const tooltipStyle = {
  backgroundColor: '#1a1a1a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: '#f0f0f0',
  fontSize: 12,
}

export default function ManagerPage() {
  const router = useRouter()

  return (
    <main style={{ background: '#0a0a0a', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#f0f0f0', maxWidth: 390, margin: '0 auto' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 12px' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>MindPádel</div>
          <div style={{ fontSize: 9, color: '#666', letterSpacing: '0.1em' }}>@micaraffe.psi</div>
        </div>
        <div onClick={() => router.push('/')} style={{ width: 32, height: 32, borderRadius: '50%', background: '#1a1a1a', border: '1.5px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>P</div>
      </div>

      <div style={{ padding: '0 20px 100px' }}>

        {/* SALUDO */}
        <div style={{ paddingBottom: 20 }}>
          <div style={{ display: 'inline-block', background: 'rgba(163,230,53,0.12)', color: '#a3e635', fontSize: 11, padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(163,230,53,0.25)', marginBottom: 8, letterSpacing: '0.08em' }}>✦ Panel de Psicóloga</div>
          <div style={{ fontWeight: 800, fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1.15 }}>Hola, Micaela 🧠</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Domingo, 24 de mayo</div>
        </div>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
          {[
            { val: '4', label: 'Jugadores', accent: true },
            { val: '34', label: 'Registros', accent: false },
            { val: '7.6', label: 'ZOR grupo', accent: true },
          ].map((s, i) => (
            <div key={i} style={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 12px', textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 22, color: s.accent ? '#a3e635' : '#f0f0f0' }}>{s.val}</div>
              <div style={{ fontSize: 10, color: '#666', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* JUGADORES */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888' }}>Mis jugadores</div>
          <div style={{ fontSize: 12, color: '#a3e635', cursor: 'pointer' }}>+ Agregar</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {jugadores.map((j, i) => (
            <div key={i} style={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: j.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: j.textColor, flexShrink: 0 }}>{j.iniciales}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{j.nombre}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{j.registros} registros · {j.ultima}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: 20, color: '#a3e635' }}>{j.zor}</div>
                <div style={{ fontSize: 10, color: '#666' }}>ZOR</div>
              </div>
            </div>
          ))}
        </div>

        {/* GRÁFICO GRUPO */}
        <div style={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888', marginBottom: 12 }}>ZOR promedio — todos los jugadores</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={zorGrupo}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="nombre" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="zor" fill="#a3e635" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* BIBLIOTECA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888' }}>Biblioteca mental</div>
          <div style={{ fontSize: 12, color: '#a3e635', cursor: 'pointer' }}>+ Subir</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {biblioteca.map((b, i) => (
            <div key={i} style={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start', cursor: 'pointer' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: b.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{b.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{b.titulo}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 3 }}>{b.meta}</div>
                <div style={{ display: 'inline-block', background: '#222', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 20, fontSize: 10, color: '#888', padding: '2px 8px', marginTop: 6 }}>{b.tag}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ALERTAS */}
        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888', marginBottom: 12 }}>Alertas recientes</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.2)', borderRadius: 12, padding: '12px 16px' }}>
            <div style={{ fontSize: 12, color: '#fb923c', fontWeight: 600, marginBottom: 4 }}>⚠️ Atención — Sofía Rodríguez</div>
            <div style={{ fontSize: 13, color: '#f0f0f0', lineHeight: 1.5 }}>Activación alta (9/10) en los últimos 3 registros. Posible sobrecarga emocional.</div>
          </div>
          <div style={{ background: 'rgba(163,230,53,0.08)', border: '1px solid rgba(163,230,53,0.2)', borderRadius: 12, padding: '12px 16px' }}>
            <div style={{ fontSize: 12, color: '#a3e635', fontWeight: 600, marginBottom: 4 }}>✦ Progreso — Matías García</div>
            <div style={{ fontSize: 13, color: '#f0f0f0', lineHeight: 1.5 }}>Confianza en zona óptima (7–8) durante 5 sesiones consecutivas. Excelente evolución.</div>
          </div>
        </div>

      </div>

      {/* BOTTOM NAV MANAGER */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 390, background: 'rgba(10,10,10,0.96)', borderTop: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', padding: '10px 0 20px', zIndex: 100 }}>
        {[
          { icon: '👥', label: 'Jugadores', active: true },
          { icon: '📊', label: 'Métricas', active: false },
          { icon: '📚', label: 'Biblioteca', active: false },
          { icon: '⚙️', label: 'Config.', active: false },
        ].map((t, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '4px 0' }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ fontSize: 10, color: t.active ? '#a3e635' : '#666' }}>{t.label}</span>
          </div>
        ))}
      </div>

    </main>
  )
}