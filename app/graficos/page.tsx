'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

type Registro = {
  id: string
  tipo: string
  resultado: string
  emocion: string
  confianza: number
  concentracion: number
  activacion: number
  desafio: number
  motivacion: number
  frustracion: number
  frase_ayudo: string
  aprendizajes: string
  created_at: string
}

const tooltipStyle = {
  backgroundColor: '#1a1a1a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: '#f0f0f0',
  fontSize: 12,
}

export default function GraficosPage() {
  const router = useRouter()
  const [registros, setRegistros] = useState<Registro[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }

    const { data } = await supabase
      .from('registros')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (data) setRegistros(data)
    setLoading(false)
  }

  // Datos para gráfico de rendimiento
  const zorData = registros.map((r, i) => ({
    sesion: `S${i + 1}`,
    rendimiento: Number(r.resultado),
    confianza: r.confianza,
    concentracion: r.concentracion,
    activacion: r.activacion,
  }))

  // Datos para gráfico de emociones
  const emocionCount: Record<string, number> = {}
  registros.forEach(r => {
    if (r.emocion) {
      r.emocion.split(', ').forEach(e => {
        emocionCount[e] = (emocionCount[e] || 0) + 1
      })
    }
  })
  const emocionData = Object.entries(emocionCount)
    .map(([emocion, cantidad]) => ({ emocion, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)

  // Frases y aprendizajes
  const frases = registros
    .filter(r => r.frase_ayudo && r.frase_ayudo.trim() !== '')
    .map(r => ({ texto: r.frase_ayudo, fecha: r.created_at, tipo: 'Frase' }))

  const aprendizajesList = registros
    .filter(r => r.aprendizajes && r.aprendizajes.trim() !== '')
    .map(r => ({ texto: r.aprendizajes, fecha: r.created_at, tipo: 'Aprendizaje' }))

  const biblioteca = [...frases, ...aprendizajesList]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

  function formatFecha(fecha: string) {
    return new Date(fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
  }

  // Patrón detectado
  function detectarPatron() {
    if (registros.length < 3) return null
    const mejores = registros
      .filter(r => Number(r.resultado) >= 7)
    if (mejores.length === 0) return null
    const promConfianza = mejores.reduce((s, r) => s + r.confianza, 0) / mejores.length
    const promActivacion = mejores.reduce((s, r) => s + r.activacion, 0) / mejores.length
    return { confianza: promConfianza.toFixed(1), activacion: promActivacion.toFixed(1) }
  }

  const patron = detectarPatron()

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a3e635', fontFamily: 'system-ui, sans-serif' }}>
      Cargando...
    </div>
  )

  return (
    <main style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#f0f0f0', width: '100%' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 12px' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Pádel Mental App</div>
          <div style={{ fontSize: 9, color: '#a3e635', letterSpacing: '0.1em' }}>By Ps. Mica Raffe</div>
        </div>
        <div onClick={() => router.push('/home')} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(163,230,53,0.15)', border: '1.5px solid rgba(163,230,53,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer', color: '#a3e635' }}>←</div>
      </div>

      <div style={{ padding: '0 20px 100px' }}>

        <div style={{ paddingBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em' }}>Mis Gráficos</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Evolución y patrones mentales</div>
        </div>

        {registros.length < 2 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#555' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
            <div style={{ fontSize: 15, color: '#888' }}>Necesitás al menos 2 registros para ver gráficos</div>
            <div style={{ fontSize: 13, color: '#666', marginTop: 8 }}>¡Seguí registrando!</div>
          </div>
        ) : (
          <>
            {/* GRÁFICO RENDIMIENTO */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888', marginBottom: 8 }}>📊 Valoración de rendimiento</div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                {[
                  { color: '#a3e635', label: 'Rendimiento' },
                  { color: '#60a5fa', label: 'Confianza' },
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
                  <Line type="monotone" dataKey="rendimiento" stroke="#a3e635" strokeWidth={2} dot={{ fill: '#a3e635', r: 4 }} />
                  <Line type="monotone" dataKey="confianza" stroke="#60a5fa" strokeWidth={2} dot={{ fill: '#60a5fa', r: 4 }} />
                  <Line type="monotone" dataKey="concentracion" stroke="#fb923c" strokeWidth={2} dot={{ fill: '#fb923c', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* PATRÓN DETECTADO */}
            {patron && (
              <div style={{ background: 'rgba(255,255,255,0.03)', borderLeft: '3px solid #a3e635', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: '#a3e635', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>✦ Patrón detectado</div>
                <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                  Tus mejores sesiones ocurren con una confianza promedio de <span style={{ color: '#a3e635', fontWeight: 700 }}>{patron.confianza}/10</span> y una activación de <span style={{ color: '#a3e635', fontWeight: 700 }}>{patron.activacion}/10</span>.
                </div>
              </div>
            )}

            {/* EMOCIONES */}
            {emocionData.length > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888', marginBottom: 12 }}>Emociones del mes</div>
                <ResponsiveContainer width="100%" height={Math.max(180, emocionData.length * 36)}>
                  <BarChart data={emocionData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="emocion" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="cantidad" fill="#a3e635" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {/* FRASES Y APRENDIZAJES */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888', marginBottom: 4 }}>✦ Mis frases y aprendizajes</div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>Historial de lo que anotaste en tus registros</div>
        </div>

        {biblioteca.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 20px', color: '#555', fontSize: 13 }}>
            Todavía no tenés frases ni aprendizajes guardados.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {biblioteca.map((item, i) => (
              <div key={i} style={{
                background: item.tipo === 'Frase' ? 'rgba(163,230,53,0.06)' : 'rgba(255,255,255,0.03)',
                border: item.tipo === 'Frase' ? '1px solid rgba(163,230,53,0.2)' : '0.5px solid rgba(255,255,255,0.08)',
                borderRadius: 14, padding: 16
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 10, color: item.tipo === 'Frase' ? '#a3e635' : '#888', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                    {item.tipo === 'Frase' ? '✦ Frase' : '💡 Aprendizaje'}
                  </div>
                  <div style={{ fontSize: 11, color: '#666' }}>{formatFecha(item.fecha)}</div>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.6, color: '#f0f0f0', fontStyle: item.tipo === 'Frase' ? 'italic' : 'normal' }}>
                  {item.tipo === 'Frase' ? `"${item.texto}"` : item.texto}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: 'rgba(10,10,10,0.96)', borderTop: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', padding: '10px 0 20px', zIndex: 100 }}>
        {[
          { icon: '🏠', label: 'Inicio', path: '/home', active: false },
          { icon: '➕', label: 'Registrar', path: '/registrar', active: false },
          { icon: '📊', label: 'Gráficos', path: '/graficos', active: true },
          { icon: '📚', label: 'Biblioteca', path: '/biblioteca', active: false },
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