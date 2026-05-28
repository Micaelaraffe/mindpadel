'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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

  // Emociones en sesiones buenas (rendimiento >= 7)
  const sesionesBuenas = registros.filter(r => Number(r.resultado) >= 7)
  const emocionBuenaCount: Record<string, number> = {}
  sesionesBuenas.forEach(r => {
    if (r.emocion) {
      r.emocion.split(', ').forEach(e => {
        emocionBuenaCount[e] = (emocionBuenaCount[e] || 0) + 1
      })
    }
  })
  const emocionBuenaData = Object.entries(emocionBuenaCount)
    .map(([emocion, cantidad]) => ({ emocion, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 6)

  const emocionTop = emocionBuenaData[0]?.emocion || null

  // Emociones del mes — todos los registros
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

  // Patrón detectado — promedio de ZOR en sesiones buenas
  function detectarPatron() {
    if (sesionesBuenas.length < 2) return null
    const promActivacion = (sesionesBuenas.reduce((s, r) => s + r.activacion, 0) / sesionesBuenas.length).toFixed(1)
    const promConcentracion = (sesionesBuenas.reduce((s, r) => s + r.concentracion, 0) / sesionesBuenas.length).toFixed(1)
    const promConfianza = (sesionesBuenas.reduce((s, r) => s + r.confianza, 0) / sesionesBuenas.length).toFixed(1)
    const promDesafio = (sesionesBuenas.reduce((s, r) => s + r.desafio, 0) / sesionesBuenas.length).toFixed(1)
    return { promActivacion, promConcentracion, promConfianza, promDesafio }
  }

  const patron = detectarPatron()

  // Frases y aprendizajes
  const frases = registros
    .filter(r => r.frase_ayudo && r.frase_ayudo.trim() !== '')
    .map(r => ({ texto: r.frase_ayudo, fecha: r.created_at, tipo: 'Frase' }))

  const aprendizajesList = registros
    .filter(r => r.aprendizajes && r.aprendizajes.trim() !== '')
    .map(r => ({ texto: r.aprendizajes, fecha: r.created_at, tipo: 'Aprendizaje' }))

  const bibliotecaPersonal = [...frases, ...aprendizajesList]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

  function formatFecha(fecha: string) {
    return new Date(fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
  }

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
            {/* EMOCIONES EN SESIONES BUENAS */}
            {emocionBuenaData.length > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888', marginBottom: 4 }}>🏆 Emociones en tus mejores sesiones</div>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>Registros con rendimiento 7 o más</div>

                {emocionTop && (
                  <div style={{ background: 'rgba(163,230,53,0.08)', border: '1px solid rgba(163,230,53,0.2)', borderRadius: 12, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>⭐</span>
                    <span style={{ fontSize: 13, color: '#f0f0f0' }}>Tu emoción más frecuente en sesiones buenas: <span style={{ color: '#a3e635', fontWeight: 700 }}>{emocionTop}</span></span>
                  </div>
                )}

                <ResponsiveContainer width="100%" height={Math.max(160, emocionBuenaData.length * 36)}>
                  <BarChart data={emocionBuenaData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="emocion" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="cantidad" fill="#a3e635" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* PATRÓN DETECTADO */}
            {patron && (
              <div style={{ background: 'rgba(255,255,255,0.03)', borderLeft: '3px solid #a3e635', borderRadius: 12, padding: '16px', marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: '#a3e635', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>✦ Patrón detectado</div>
                <div style={{ fontSize: 13, color: '#888', marginBottom: 12, lineHeight: 1.5 }}>
                  En tus {sesionesBuenas.length} mejores sesiones, tu ZOR promedio fue:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { label: 'Activación', val: patron.promActivacion },
                    { label: 'Concentración', val: patron.promConcentracion },
                    { label: 'Confianza', val: patron.promConfianza },
                    { label: 'Desafío percibido', val: patron.promDesafio },
                  ].map((m, i) => (
                    <div key={i} style={{ background: 'rgba(163,230,53,0.06)', border: '1px solid rgba(163,230,53,0.15)', borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{m.label}</div>
                      <div style={{ fontWeight: 800, fontSize: 22, color: '#a3e635' }}>{m.val}</div>
                      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginTop: 6 }}>
                        <div style={{ height: '100%', width: `${Number(m.val) * 10}%`, background: '#a3e635', borderRadius: 2 }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            
          </>
        )}

{/* FORTALEZAS BANCO DE CONFIANZA */}
{(() => {
  const listaFortalezas = [
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

  const conteo: Record<string, number> = {}
  // Esto se carga desde el estado — ver abajo
  return null
})()}
{/* MOTIVACIÓN Y FRUSTRACIÓN */}
{registros.length >= 2 && (() => {
  const datos = registros.map((r, i) => ({
    sesion: `S${i + 1}`,
    motivacion: r.motivacion || 0,
    frustracion: r.frustracion || 0,
  }))

  const promMotivacion = (registros.reduce((s, r) => s + (r.motivacion || 0), 0) / registros.length).toFixed(1)
  const promFrustracion = (registros.reduce((s, r) => s + (r.frustracion || 0), 0) / registros.length).toFixed(1)

  return (
    <>
      {/* MOTIVACIÓN */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888' }}>💪 Evolución de Motivación</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 3 }}>Sesión a sesión</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Promedio</div>
            <div style={{ fontWeight: 800, fontSize: 22, color: '#a3e635' }}>{promMotivacion}</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={datos}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="sesion" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 10]} tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="motivacion" fill="#a3e635" radius={[4, 4, 0, 0]} name="Motivación" />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(163,230,53,0.06)', border: '1px solid rgba(163,230,53,0.15)', borderRadius: 10 }}>
          <div style={{ fontSize: 12, color: '#ccc', lineHeight: 1.5 }}>
            {Number(promMotivacion) >= 7
              ? '✦ Tu motivación promedio es alta. Estás en un buen momento.'
              : Number(promMotivacion) >= 5
              ? '✦ Tu motivación es moderada. Hay espacio para crecer.'
              : '✦ Tu motivación promedio es baja. Vale la pena trabajarlo con tu psicóloga.'}
          </div>
        </div>
      </div>

      {/* FRUSTRACIÓN */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888' }}>😤 Evolución de Frustración</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 3 }}>Sesión a sesión</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Promedio</div>
            <div style={{ fontWeight: 800, fontSize: 22, color: Number(promFrustracion) >= 7 ? '#f87171' : Number(promFrustracion) >= 5 ? '#facc15' : '#a3e635' }}>{promFrustracion}</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={datos}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="sesion" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 10]} tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="frustracion" fill="#f87171" radius={[4, 4, 0, 0]} name="Frustración" />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ marginTop: 12, padding: '10px 12px', background: Number(promFrustracion) >= 7 ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.03)', border: `1px solid ${Number(promFrustracion) >= 7 ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 10 }}>
          <div style={{ fontSize: 12, color: '#ccc', lineHeight: 1.5 }}>
            {Number(promFrustracion) >= 7
              ? '⚠️ Tu frustración promedio es alta. Es importante trabajarlo con tu psicóloga.'
              : Number(promFrustracion) >= 5
              ? '✦ Tu frustración es moderada. Seguí monitoreándola.'
              : '✦ Tu frustración promedio es baja. ¡Muy bien!'}
          </div>
        </div>
      </div>
    </>
  )
})()}

{/* PARTIDOS VS ENTRENAMIENTOS */}
{registros.length >= 2 && (() => {
  const partidos = registros.filter(r => r.tipo === 'Partido amistoso' || r.tipo === 'Torneo' || r.tipo === 'Partido')
  const entrenos = registros.filter(r => r.tipo === 'Entrenamiento')

  if (partidos.length === 0 || entrenos.length === 0) return null

  function promZor(regs: typeof registros) {
    return {
      activacion: Number((regs.reduce((s, r) => s + r.activacion, 0) / regs.length).toFixed(1)),
      concentracion: Number((regs.reduce((s, r) => s + r.concentracion, 0) / regs.length).toFixed(1)),
      confianza: Number((regs.reduce((s, r) => s + r.confianza, 0) / regs.length).toFixed(1)),
      desafio: Number((regs.reduce((s, r) => s + r.desafio, 0) / regs.length).toFixed(1)),
    }
  }

  const zorPartidos = promZor(partidos)
  const zorEntrenos = promZor(entrenos)

  const comparacionData = [
    { metrica: 'Activación', Partidos: zorPartidos.activacion, Entrenos: zorEntrenos.activacion },
    { metrica: 'Concentración', Partidos: zorPartidos.concentracion, Entrenos: zorEntrenos.concentracion },
    { metrica: 'Confianza', Partidos: zorPartidos.confianza, Entrenos: zorEntrenos.confianza },
    { metrica: 'Desafío', Partidos: zorPartidos.desafio, Entrenos: zorEntrenos.desafio },
  ]

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888', marginBottom: 4 }}>🎾 Partidos vs Entrenamientos</div>
      <div style={{ fontSize: 12, color: '#666', marginBottom: 14 }}>Promedio ZOR en cada contexto</div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: '#a3e635' }}></div>
          <span style={{ fontSize: 11, color: '#888' }}>Partidos ({partidos.length})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: '#60a5fa' }}></div>
          <span style={{ fontSize: 11, color: '#888' }}>Entrenamientos ({entrenos.length})</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={comparacionData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="metrica" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 10]} tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="Partidos" fill="#a3e635" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Entrenos" fill="#60a5fa" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {comparacionData.map((m, i) => {
          const diff = m.Partidos - m.Entrenos
          const mejor = diff > 0 ? 'partidos' : diff < 0 ? 'entrenamientos' : null
          if (!mejor || Math.abs(diff) < 0.5) return null
          return (
            <div key={i} style={{ fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#a3e635' }}>→</span>
              <span>Tu <span style={{ color: '#f0f0f0', fontWeight: 600 }}>{m.metrica}</span> es mayor en <span style={{ color: '#a3e635', fontWeight: 600 }}>{mejor}</span> ({Math.abs(diff).toFixed(1)} pts de diferencia)</span>
            </div>
          )
        })}
      </div>
    </div>
  )
})()}


        {/* FRASES Y APRENDIZAJES */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888', marginBottom: 4 }}>✦ Mis frases y aprendizajes</div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>Historial de lo que anotaste en tus registros</div>
        </div>

        {bibliotecaPersonal.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 20px', color: '#555', fontSize: 13 }}>
            Todavía no tenés frases ni aprendizajes guardados.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {bibliotecaPersonal.map((item, i) => (
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