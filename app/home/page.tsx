'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

type Registro = {
  id: string
  tipo: string
  resultado: string
  emocion: string
  confianza: number
  concentracion: number
  activacion: number
  desafio: number
  frase_ayudo: string
  pensamientos: string
  aprendizajes: string
  created_at: string
}

type Profile = {
  nombre: string
  objetivo: string
  insight_manager: string
}

type Evento = {
  id: string
  titulo: string
  tipo: string
  fecha: string
}

type DiarioFecha = {
  created_at: string
  fortalezas: string
}

const NIVELES = [
  { mm: 10, nombre: 'Grow Mental', icon: '🌱' },
  { mm: 50, nombre: 'Power Mental', icon: '⚡' },
  { mm: 100, nombre: 'Focus Mode', icon: '🎯' },
  { mm: 175, nombre: 'Mente fuerte', icon: '🦁' },
  { mm: 260, nombre: 'Mental Beast', icon: '🔥' },
  { mm: 350, nombre: 'Élite Mental', icon: '👑' },
]

const META_SEMANAL = 350

function getLunesActual() {
  const hoy = new Date()
  const dia = hoy.getDay()
  const diff = dia === 0 ? -6 : 1 - dia
  const lunes = new Date(hoy)
  lunes.setDate(hoy.getDate() + diff)
  lunes.setHours(0, 0, 0, 0)
  return lunes
}

function calcularMMSemana(registros: Registro[], diariosConFecha: DiarioFecha[]) {
  const lunes = getLunesActual()
  const regsEsta = registros.filter(r => new Date(r.created_at) >= lunes)
  const depositosEsta = diariosConFecha.filter(d => new Date(d.created_at) >= lunes).length
  const mm = regsEsta.reduce((total, r) => {
    let puntos = 10
    if (r.pensamientos && r.pensamientos.trim().length > 10) puntos += 5
    if (r.frase_ayudo && r.frase_ayudo.trim().length > 3) puntos += 2
    if (r.aprendizajes && r.aprendizajes.trim().length > 3) puntos += 3
    return total + puntos
  }, 0) + (depositosEsta * 15)
  return mm
}

function calcularMMHistorico(registros: Registro[], totalDepositos: number) {
  const mm = registros.reduce((total, r) => {
    let puntos = 10
    if (r.pensamientos && r.pensamientos.trim().length > 10) puntos += 5
    if (r.frase_ayudo && r.frase_ayudo.trim().length > 3) puntos += 2
    if (r.aprendizajes && r.aprendizajes.trim().length > 3) puntos += 3
    return total + puntos
  }, 0) + (totalDepositos * 15)
  return mm
}

function compartirSemana(mm: number, nivel: typeof NIVELES[0] | null, nombre: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1920
  const ctx = canvas.getContext('2d')!

  const grad = ctx.createLinearGradient(0, 0, 0, 1920)
  grad.addColorStop(0, '#0a0a0a')
  grad.addColorStop(0.6, '#0a1a0a')
  grad.addColorStop(1, '#0d2e0d')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 1080, 1920)

  ctx.beginPath()
  ctx.arc(540, 580, 380, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(163,230,53,0.05)'
  ctx.fill()

  ctx.beginPath()
  ctx.arc(540, 580, 260, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(163,230,53,0.08)'
  ctx.fill()

  ctx.font = '120px system-ui'
  ctx.textAlign = 'center'
  ctx.fillText('🎾🧠', 540, 480)

  ctx.font = '80px system-ui'
ctx.fillText('🏅', 540, 1480)

  ctx.fillStyle = '#a3e635'
  ctx.font = 'bold 200px system-ui'
  ctx.fillText(String(mm), 540, 700)

  ctx.fillStyle = 'rgba(163,230,53,0.7)'
  ctx.font = '46px system-ui'
  ctx.fillText('Minutos Mentales esta semana', 540, 780)

  if (nivel) {
    ctx.fillStyle = '#f0f0f0'
    ctx.font = 'bold 58px system-ui'
    ctx.fillText(nivel.icon + '  ' + nivel.nombre, 540, 880)
  }

  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.font = '42px system-ui'
  ctx.fillText(nombre, 540, 960)

  ctx.strokeStyle = 'rgba(163,230,53,0.3)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(200, 1030)
  ctx.lineTo(880, 1030)
  ctx.stroke()

  const pct = Math.min(1, mm / META_SEMANAL)
  ctx.fillStyle = 'rgba(255,255,255,0.07)'
  ctx.beginPath()
  ctx.roundRect(140, 1068, 800, 22, 11)
  ctx.fill()

  const barGrad = ctx.createLinearGradient(140, 0, 940, 0)
  barGrad.addColorStop(0, '#a3e635')
  barGrad.addColorStop(1, '#84cc16')
  ctx.fillStyle = barGrad
  ctx.beginPath()
  ctx.roundRect(140, 1068, 800 * pct, 22, 11)
  ctx.fill()

  ctx.fillStyle = '#a3e635'
  ctx.font = 'bold 48px system-ui'
  ctx.fillText('Pádel Mental App', 540, 1200)

  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.font = '34px system-ui'
  ctx.fillText('by @micaraffe.psi', 540, 1250)

  const lunes = getLunesActual()
  const domingo = new Date(lunes)
  domingo.setDate(lunes.getDate() + 6)
  const semanaStr = lunes.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) +
    ' — ' + domingo.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.font = '32px system-ui'
  ctx.fillText(semanaStr, 540, 1320)

 

  const link = document.createElement('a')
  link.download = 'mi-semana-mental.png'
  link.href = canvas.toDataURL('image/png')
  link.click()
}

function Calendario({
  registros, eventos, onAgregarEvento,
}: {
  registros: Registro[]
  eventos: Evento[]
  onAgregarEvento: (fecha: string) => void
}) {
  const hoy = new Date()
  const [mes, setMes] = useState(hoy.getMonth())
  const [anio, setAnio] = useState(hoy.getFullYear())

  const diasEnMes = new Date(anio, mes + 1, 0).getDate()
  const primerDia = new Date(anio, mes, 1).getDay()
  const offset = primerDia === 0 ? 6 : primerDia - 1

  const diasConRegistro = new Set(
    registros.filter(r => {
      const d = new Date(r.created_at)
      return d.getMonth() === mes && d.getFullYear() === anio
    }).map(r => new Date(r.created_at).getDate())
  )

  const diasConEvento = new Map<number, Evento[]>()
  eventos.filter(e => {
    const d = new Date(e.fecha + 'T00:00:00')
    return d.getMonth() === mes && d.getFullYear() === anio
  }).forEach(e => {
    const dia = new Date(e.fecha + 'T00:00:00').getDate()
    if (!diasConEvento.has(dia)) diasConEvento.set(dia, [])
    diasConEvento.get(dia)!.push(e)
  })

  const nombreMes = new Date(anio, mes).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

  function cambiarMes(dir: number) {
    const nuevo = new Date(anio, mes + dir)
    setMes(nuevo.getMonth())
    setAnio(nuevo.getFullYear())
  }

  function formatFechaParaEvento(dia: number) {
    const m = String(mes + 1).padStart(2, '0')
    const d = String(dia).padStart(2, '0')
    return anio + '-' + m + '-' + d
  }

  const celdas: (number | null)[] = []
  for (let i = 0; i < offset; i++) celdas.push(null)
  for (let i = 1; i <= diasEnMes; i++) celdas.push(i)

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div onClick={() => cambiarMes(-1)} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14, color: '#888' }}>‹</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f0f0', textTransform: 'capitalize' }}>{nombreMes}</div>
        <div onClick={() => cambiarMes(1)} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14, color: '#888' }}>›</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 6 }}>
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 10, color: '#555', fontWeight: 600, padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {celdas.map((dia, i) => {
          if (!dia) return <div key={i}></div>
          const esHoy = dia === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear()
          const tieneRegistro = diasConRegistro.has(dia)
          const tieneEvento = diasConEvento.has(dia)
          const esFuturo = new Date(anio, mes, dia) > hoy
          return (
            <div key={i} onClick={() => esFuturo && onAgregarEvento(formatFechaParaEvento(dia))} style={{
              position: 'relative', textAlign: 'center', padding: '6px 2px', borderRadius: 8,
              cursor: esFuturo ? 'pointer' : 'default',
              background: esHoy ? 'rgba(163,230,53,0.15)' : tieneEvento ? 'rgba(250,204,21,0.08)' : 'transparent',
              border: esHoy ? '1px solid rgba(163,230,53,0.4)' : '1px solid transparent',
            }}>
              <div style={{ fontSize: 12, color: esHoy ? '#a3e635' : tieneRegistro ? '#f0f0f0' : '#555', fontWeight: esHoy ? 700 : 400 }}>{dia}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 2 }}>
                {tieneRegistro && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#a3e635' }}></div>}
                {tieneEvento && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#facc15' }}></div>}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 14, marginTop: 12, paddingTop: 10, borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#a3e635' }}></div>
          <span style={{ fontSize: 10, color: '#666' }}>Registros</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#facc15' }}></div>
          <span style={{ fontSize: 10, color: '#666' }}>Eventos</span>
        </div>
        <div style={{ fontSize: 10, color: '#555', marginLeft: 'auto' }}>Tocá un día futuro para agendar</div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile>({ nombre: '', objetivo: '', insight_manager: '' })
  const [registros, setRegistros] = useState<Registro[]>([])
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [editandoObjetivo, setEditandoObjetivo] = useState(false)
  const [objTemp, setObjTemp] = useState('')
  const [modalEvento, setModalEvento] = useState<string | null>(null)
  const [nuevoEvento, setNuevoEvento] = useState({ titulo: '', tipo: 'Entrenamiento' })
  const [guardandoEvento, setGuardandoEvento] = useState(false)
  const [topFortalezas, setTopFortalezas] = useState<[string, number][]>([])
  const [depositosBancoHome, setDepositosBancoHome] = useState(0)
  const [diariosConFecha, setDiariosConFecha] = useState<DiarioFecha[]>([])

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }

    const { data: prof } = await supabase
      .from('profiles').select('nombre, objetivo, insight_manager').eq('id', user.id).single()
    if (prof) { setProfile(prof); setObjTemp(prof.objetivo || '') }

    const { data: regs } = await supabase
      .from('registros').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(50)
    if (regs) setRegistros(regs)

    const { data: evs } = await supabase
      .from('eventos').select('*').eq('user_id', user.id).order('fecha', { ascending: true })
    if (evs) setEventos(evs)

    const { data: diarios, count } = await supabase
      .from('diario_confianza').select('fortalezas, created_at', { count: 'exact' }).eq('user_id', user.id)
    setDepositosBancoHome(count || 0)
    setDiariosConFecha(diarios || [])

    const conteo: Record<string, number> = {}
    diarios?.forEach(r => {
      if (r.fortalezas) r.fortalezas.split(', ').forEach((f: string) => {
        if (f) conteo[f] = (conteo[f] || 0) + 1
      })
    })
    setTopFortalezas(Object.entries(conteo).sort((a, b) => b[1] - a[1]).slice(0, 3))

    setLoading(false)
  }

  async function guardarObjetivo() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ objetivo: objTemp }).eq('id', user.id)
    setProfile({ ...profile, objetivo: objTemp })
    setEditandoObjetivo(false)
  }

  async function guardarEvento() {
    if (!nuevoEvento.titulo.trim() || !modalEvento) return
    setGuardandoEvento(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('eventos').insert({
      user_id: user.id, titulo: nuevoEvento.titulo, tipo: nuevoEvento.tipo, fecha: modalEvento,
    }).select().single()
    if (data) setEventos(prev => [...prev, data])
    setGuardandoEvento(false)
    setModalEvento(null)
    setNuevoEvento({ titulo: '', tipo: 'Entrenamiento' })
  }

  async function eliminarRegistro(id: string) {
    const confirmar = window.confirm('¿Seguro que querés eliminar este registro? Esta acción no se puede deshacer.')
    if (!confirmar) return
    await supabase.from('registros').delete().eq('id', id)
    setRegistros(registros.filter(r => r.id !== id))
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const partidos = registros.filter(r => r.tipo === 'Partido' || r.tipo === 'Partido amistoso' || r.tipo === 'Torneo').length
  const entrenamientos = registros.filter(r => r.tipo === 'Entrenamiento').length
  const ultimaFrase = registros.find(r => r.frase_ayudo && r.frase_ayudo.trim() !== '')?.frase_ayudo || ''

  const mmSemana = calcularMMSemana(registros, diariosConFecha)
  const mmHistorico = calcularMMHistorico(registros, depositosBancoHome)
  const progresoPct = Math.min(100, (mmSemana / META_SEMANAL) * 100)
  const nivelActual = [...NIVELES].reverse().find(n => mmHistorico >= n.mm) || null

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const proximosEventos = eventos.filter(e => new Date(e.fecha + 'T00:00:00') >= hoy).slice(0, 3)

  function formatFecha(fecha: string) {
    const d = new Date(fecha)
    const ahora = new Date()
    const diff = Math.floor((ahora.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 0) return 'Hoy'
    if (diff === 1) return 'Ayer'
    return 'Hace ' + diff + ' días'
  }

  function formatFechaEvento(fecha: string) {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  function iconTipo(tipo: string) {
    if (tipo === 'Partido' || tipo === 'Partido amistoso') return '🏆'
    if (tipo === 'Torneo') return '🥇'
    return '🎾'
  }

  function colorRendimiento(val: number) {
    if (val >= 8) return '#a3e635'
    if (val >= 5) return '#facc15'
    return '#f87171'
  }

  function labelRendimiento(val: number) {
    if (val >= 9) return 'Muy alto'
    if (val >= 7) return 'Alto'
    if (val >= 5) return 'Medio'
    if (val >= 3) return 'Bajo'
    return 'Muy bajo'
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a3e635', fontFamily: 'system-ui, sans-serif' }}>
      Cargando...
    </div>
  )

  return (
    <main style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#f0f0f0', width: '100%' }}>

      {/* MODAL EVENTO */}
      {modalEvento && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setModalEvento(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#111', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px', width: '100%', maxWidth: 390 }}>
            <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 20px' }}></div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Agendar evento</div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>
              {new Date(modalEvento + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {['Entrenamiento', 'Partido', 'Torneo'].map(t => (
                <button key={t} onClick={() => setNuevoEvento({ ...nuevoEvento, tipo: t })} style={{
                  flex: 1, padding: '8px 4px',
                  background: nuevoEvento.tipo === t ? 'rgba(163,230,53,0.12)' : 'rgba(255,255,255,0.04)',
                  border: nuevoEvento.tipo === t ? '1px solid rgba(163,230,53,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8, color: nuevoEvento.tipo === t ? '#a3e635' : '#888',
                  fontSize: 11, cursor: 'pointer', fontWeight: 600
                }}>{t}</button>
              ))}
            </div>
            <input value={nuevoEvento.titulo} onChange={e => setNuevoEvento({ ...nuevoEvento, titulo: e.target.value })}
              placeholder="Descripción (opcional)"
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'system-ui', marginBottom: 16 }}
            />
            <button onClick={guardarEvento} disabled={guardandoEvento} style={{ width: '100%', background: '#a3e635', color: '#0a0a0a', border: 'none', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              {guardandoEvento ? 'Guardando...' : '📌 Agendar'}
            </button>
            <button onClick={() => setModalEvento(null)} style={{ width: '100%', background: 'transparent', color: '#666', border: 'none', padding: '12px', fontSize: 13, cursor: 'pointer', marginTop: 6 }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 12px' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Pádel Mental App</div>
          <div style={{ fontSize: 9, color: '#a3e635', letterSpacing: '0.1em' }}>By Ps. Mica Raffe</div>
        </div>
        <div onClick={cerrarSesion} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(163,230,53,0.15)', border: '1.5px solid rgba(163,230,53,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#a3e635' }}>
          {profile.nombre.charAt(0).toUpperCase()}
        </div>
      </div>

      <div style={{ padding: '0 20px 100px' }}>

        {/* SALUDO */}
        <div style={{ paddingBottom: 4 }}>
          <div style={{ display: 'inline-block', background: 'rgba(163,230,53,0.12)', color: '#a3e635', fontSize: 11, padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(163,230,53,0.25)', marginBottom: 8 }}>
            ✦ {new Date().toLocaleDateString('es-AR', { weekday: 'long' })}
          </div>
          <div style={{ fontWeight: 800, fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            Hola, {profile.nombre.split(' ')[0]} 👋
          </div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
            {new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* RECORRIDO MENTAL */}
<div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(250,204,21,0.2)', borderRadius: 16, padding: 14, marginTop: 16, marginBottom: 16 }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
    <div>
      <div style={{ fontSize: 10, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 3 }}>🧠 Tu recorrido mental semanal</div>
      <div style={{ fontSize: 11, color: '#666', lineHeight: 1.4, maxWidth: 190 }}>Cada registro suma Minutos Mentales (MM). Se reinicia cada lunes.</div>
    </div>
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontWeight: 900, fontSize: 26, color: '#facc15', lineHeight: 1 }}>{mmSemana}</div>
      <div style={{ fontSize: 9, color: '#666', marginTop: 2 }}>MM esta semana</div>
    </div>
  </div>

  {/* BARRA */}
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: 14 }}>
          {mmSemana === 0 ? '🌱' :
           mmSemana < 50 ? '⚡' :
           mmSemana < 100 ? '🎯' :
           mmSemana < 175 ? '🦁' :
           mmSemana < 260 ? '🔥' : '👑'}
        </span>
        <span style={{ fontSize: 11, color: '#facc15', fontWeight: 600 }}>
          {mmSemana === 0 ? 'Arrancá tu semana' :
           mmSemana < 50 ? 'Comenzando' :
           mmSemana < 100 ? 'Avanzando' :
           mmSemana < 175 ? 'Buen ritmo' :
           mmSemana < 260 ? 'Mente fuerte' :
           mmSemana < 350 ? '¡Casi élite!' : '👑 Semana élite'}
        </span>
      </div>
      <span style={{ fontSize: 10, color: '#888' }}>{mmSemana}/{META_SEMANAL} MM</span>
    </div>
    <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: progresoPct + '%',
        background: progresoPct >= 100
          ? 'linear-gradient(90deg, #facc15, #f59e0b)'
          : 'linear-gradient(90deg, #888, #facc15)',
        borderRadius: 4, transition: 'width 1s ease',
      }}></div>
    </div>
  </div>

  {/* NIVEL HISTÓRICO */}
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(250,204,21,0.06)', borderRadius: 10, padding: '8px 12px', marginBottom: 10 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 16 }}>{nivelActual?.icon || '🌱'}</span>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#f0f0f0' }}>{nivelActual?.nombre || 'Sin nivel aún'}</div>
        <div style={{ fontSize: 9, color: '#666', marginTop: 1 }}>Nivel histórico · {mmHistorico} MM totales</div>
      </div>
    </div>
  </div>

  {/* INSIGNIAS */}
  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '0.5px solid rgba(255,255,255,0.06)', marginBottom: 10 }}>
    {NIVELES.map((n, i) => (
      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <span style={{ fontSize: 14, opacity: mmHistorico >= n.mm ? 1 : 0.2 }}>{n.icon}</span>
        <div style={{ width: 4, height: 4, borderRadius: '50%', background: mmHistorico >= n.mm ? '#facc15' : 'rgba(255,255,255,0.1)' }}></div>
      </div>
    ))}
  </div>

  <button onClick={() => compartirSemana(mmSemana, nivelActual, profile.nombre.split(' ')[0])} style={{
    width: '100%', background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)',
    borderRadius: 10, padding: '9px', fontSize: 12, fontWeight: 600,
    color: '#facc15', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
  }}>
    Compartir Logro en Redes 🎉🌐
  </button>
</div>

        {/* OBJETIVO */}
        <div style={{ background: 'rgba(163,230,53,0.06)', border: '1px solid rgba(163,230,53,0.2)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: '#a3e635', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>🎯 Objetivo actual</div>
            <div onClick={() => { setObjTemp(profile.objetivo); setEditandoObjetivo(true) }} style={{ fontSize: 11, color: '#a3e635', cursor: 'pointer' }}>Editar</div>
          </div>
          {editandoObjetivo ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <textarea value={objTemp} onChange={e => setObjTemp(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(163,230,53,0.3)', borderRadius: 8, padding: '10px 12px', color: '#f0f0f0', fontSize: 13, outline: 'none', resize: 'none', minHeight: 60, boxSizing: 'border-box', fontFamily: 'system-ui' }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={guardarObjetivo} style={{ flex: 1, background: '#a3e635', color: '#0a0a0a', border: 'none', borderRadius: 8, padding: '8px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Guardar</button>
                <button onClick={() => setEditandoObjetivo(false)} style={{ flex: 1, background: 'transparent', color: '#888', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 14, lineHeight: 1.5, color: profile.objetivo ? '#f0f0f0' : '#666' }}>
              {profile.objetivo || 'Tocá "Editar" para escribir tu objetivo actual'}
            </div>
          )}
        </div>

        {/* FRASE */}
        {ultimaFrase && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(163,230,53,0.2)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: '#a3e635', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>✦ Tu frase de buen rendimiento</div>
            <div style={{ fontSize: 15, lineHeight: 1.6, color: '#f0f0f0', fontStyle: 'italic' }}>"{ultimaFrase}"</div>
          </div>
        )}

        {/* CONTADORES */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {[
            { val: partidos, label: 'Partidos', icon: '🏆' },
            { val: entrenamientos, label: 'Entrenamientos', icon: '🎾' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 26, color: '#a3e635' }}>{s.val}</div>
              <div style={{ fontSize: 11, color: '#666', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* INSIGHT */}
        <div style={{ background: 'rgba(255,255,255,0.03)', borderLeft: '3px solid #f59e0b', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#f59e0b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 700 }}>Mensaje de tu Psicóloga Mica 🙋‍♀️</div>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>{profile.insight_manager || 'Tu psicóloga todavía no escribió un mensaje para vos.'}</div>
        </div>

        {/* FORTALEZAS */}
        {topFortalezas.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontWeight: 700 }}>💪 Tus mayores fortalezas</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {topFortalezas.map(([fortaleza, cantidad], i) => {
                const iconMap: Record<string, string> = {
                  'Persistencia': '🔥', 'Valentía': '🦁', 'Foco': '🎯',
                  'Calma': '🌊', 'Creatividad': '💡', 'Liderazgo': '👑',
                  'Resiliencia': '💪', 'Actitud': '⚡', 'Compañerismo': '🤝',
                  'Inteligencia': '🧠', 'Constancia': '🌟', 'Técnica': '🎾',
                }
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)', borderRadius: 20, padding: '5px 8px' }}>
                    <span style={{ fontSize: 13 }}>{iconMap[fortaleza] || '⭐'}</span>
                    <span style={{ fontSize: 11, color: '#f0f0f0' }}>{fortaleza}</span>
                    <span style={{ fontSize: 10, color: '#facc15', fontWeight: 700 }}>{cantidad}x</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* CALENDARIO */}
        <Calendario registros={registros} eventos={eventos} onAgregarEvento={(fecha) => setModalEvento(fecha)} />

        {/* PRÓXIMOS EVENTOS */}
        {proximosEventos.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888', marginBottom: 10 }}>📌 Próximos eventos</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {proximosEventos.map((e, i) => (
                <div key={i} style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.15)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{iconTipo(e.tipo)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{e.titulo || e.tipo}</div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 2, textTransform: 'capitalize' }}>{formatFechaEvento(e.fecha)}</div>
                  </div>
                  <div onClick={async () => {
                    await supabase.from('eventos').delete().eq('id', e.id)
                    setEventos(prev => prev.filter(ev => ev.id !== e.id))
                  }} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12 }}>🗑️</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ÚLTIMOS REGISTROS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888' }}>Últimos registros</div>
          <div onClick={() => router.push('/registrar')} style={{ fontSize: 12, color: '#a3e635', cursor: 'pointer' }}>+ Nuevo →</div>
        </div>

        {registros.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#555', fontSize: 14 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🎾</div>
            <div>Todavía no tenés registros.</div>
            <div style={{ marginTop: 4 }}>¡Hacé tu primer registro!</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {registros.slice(0, 5).map((r, i) => (
              <div key={i} onClick={() => router.push('/registro?id=' + r.id)} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 16px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(163,230,53,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{iconTipo(r.tipo)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{r.tipo}</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{formatFecha(r.created_at)}</div>
                  </div>
                  <div style={{ textAlign: 'right', marginRight: 8 }}>
                    <div style={{ fontWeight: 800, fontSize: 20, color: colorRendimiento(Number(r.resultado) || 0) }}>{r.resultado}/10</div>
                    <div style={{ fontSize: 10, color: '#888', marginTop: 1 }}>{labelRendimiento(Number(r.resultado) || 0)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <div onClick={e => { e.stopPropagation(); router.push('/editar?id=' + r.id) }} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(163,230,53,0.1)', border: '1px solid rgba(163,230,53,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14 }}>✏️</div>
                    <div onClick={e => { e.stopPropagation(); eliminarRegistro(r.id) }} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14 }}>🗑️</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: 'rgba(10,10,10,0.96)', borderTop: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', padding: '10px 0 20px', zIndex: 100 }}>
        {[
          { icon: '🏠', label: 'Inicio', path: '/home', active: true },
          { icon: '➕', label: 'Registrar', path: '/registrar', active: false },
          { icon: '💛', label: 'Confianza', path: '/diario', active: false },
          { icon: '📊', label: 'Gráficos', path: '/graficos', active: false },
          { icon: '📚', label: 'Biblioteca', path: '/biblioteca', active: false },
        ].map((t, i) => (
          <div key={i} onClick={() => router.push(t.path)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '4px 0' }}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span style={{ fontSize: 9, color: t.active ? '#a3e635' : '#666' }}>{t.label}</span>
          </div>
        ))}
      </div>

    </main>
  )
}