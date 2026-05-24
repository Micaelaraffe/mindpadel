'use client'
import { useRouter } from 'next/navigation'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const zorData = [
  { sesion: 'S1', confianza: 6, activacion: 5, concentracion: 7 },
  { sesion: 'S2', confianza: 7, activacion: 7, concentracion: 6 },
  { sesion: 'S3', confianza: 7, activacion: 8, concentracion: 8 },
  { sesion: 'S4', confianza: 8, activacion: 6, concentracion: 8 },
  { sesion: 'S5', confianza: 6, activacion: 9, concentracion: 7 },
  { sesion: 'S6', confianza: 8, activacion: 7, concentracion: 9 },
  { sesion: 'S7', confianza: 9, activacion: 6, concentracion: 8 },
  { sesion: 'S8', confianza: 8, activacion: 7, concentracion: 8 },
]

const emocionData = [
  { emocion: 'Enfocado', cantidad: 5 },
  { emocion: 'Motivado', cantidad: 4 },
  { emocion: 'Ansioso', cantidad: 2 },
  { emocion: 'En flujo', cantidad: 2 },
  { emocion: 'Frustrado', cantidad: 1 },
]

const semanalData = [
  { semana: 'Sem 1', intensidad: 6.2 },
  { semana: 'Sem 2', intensidad: 7.8 },
  { semana: 'Sem 3', intensidad: 6.5 },
  { semana: 'Sem 4', intensidad: 8.1 },
]

const tooltipStyle = {
  backgroundColor: '#1a1a1a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: '#f0f0f0',
  fontSize: 12,
}

export default function GraficosPage() {
  const router = useRouter()

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
          <div style={{ fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em' }}>Mis Gráficos</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Evolución y patrones mentales</div>
        </div>

        {/* GRÁFICO ZOR */}
        <div style={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888', marginBottom: 8 }}>Evolución ZOR — 8 sesiones</div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            {[
              { color: '#a3e635', label: 'Confianza' },
              { color: '#60a5fa', label: 'Activación' },
              { color: '#fb923c', label: 'Concentración' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }}></div>
                <span style={{ fontSize: 11, color: '#888' }}>{l.label}</span>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={zorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="sesion" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[1, 10]} tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="confianza" stroke="#a3e635" strokeWidth={2} dot={{ fill: '#a3e635', r: 4 }} />
              <Line type="monotone" dataKey="activacion" stroke="#60a5fa" strokeWidth={2} dot={{ fill: '#60a5fa', r: 4 }} />
              <Line type="monotone" dataKey="concentracion" stroke="#fb923c" strokeWidth={2} dot={{ fill: '#fb923c', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* INSIGHT */}
        <div style={{ background: '#1a1a1a', borderLeft: '3px solid #a3e635', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: '#a3e635', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>✦ Patrón detectado</div>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>Tus mejores rendimientos ocurren con confianza entre 7–8 y activación entre 6–7. Cuando la activación supera 9, el rendimiento disminuye.</div>
        </div>

        {/* GRÁFICO EMOCIONES */}
        <div style={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888', marginBottom: 12 }}>Emociones del mes</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={emocionData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="emocion" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="cantidad" fill="#a3e635" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* GRÁFICO SEMANAL */}
        <div style={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888', marginBottom: 12 }}>Intensidad emocional semanal</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={semanalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="semana" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="intensidad" fill="#a3e635" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 390, background: 'rgba(10,10,10,0.96)', borderTop: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', padding: '10px 0 20px', zIndex: 100 }}>
        {[
          { icon: '🏠', label: 'Inicio', path: '/home', active: false },
          { icon: '➕', label: 'Registrar', path: '/registrar', active: false },
          { icon: '📊', label: 'Gráficos', path: '/graficos', active: true },
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