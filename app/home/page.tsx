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

function Calendario({
  registros,
  eventos,
  onAgregarEvento,
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
    registros
      .filter(r => {
        const d = new Date(r.created_at)
        return d.getMonth() === mes && d.getFullYear() === anio
      })
      .map(r => new Date(r.created_at).getDate())
  )

  const diasConEvento = new Map<number, Evento[]>()
  eventos
    .filter(e => {
      const d = new Date(e.fecha + 'T00:00:00')
      return d.getMonth() === mes && d.getFullYear() === anio
    })
    .forEach(e => {
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
    return `${anio}-${m}-${d}`
  }

  const celdas = []
  for (let i = 0; i < offset; i++) celdas.push(null)
  for (let i = 1; i <= diasEnMes; i++) celdas.push(i)

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, marginBottom: 16 }}>

      {/* HEADER CALENDARIO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div onClick={() => cambiarMes(-1)} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14, color: '#888' }}>‹</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f0f0', textTransform: 'capitalize' }}>{nombreMes}</div>
        <div onClick={() => cambiarMes(1)} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14, color: '#888' }}>›</div>
      </div>

      {/* DÍAS DE LA SEMANA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 6 }}>
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 10, color: '#555', fontWeight: 600, padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* DÍAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {celdas.map((dia, i) => {
          if (!dia) return <div key={i}></div>
          const esHoy = dia === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear()
          const tieneRegistro = diasConRegistro.has(dia)
          const tieneEvento = diasConEvento.has(dia)
          const esFuturo = new Date(anio, mes, dia) > hoy

          return (
            <div key={i}
              onClick={() => esFuturo && onAgregarEvento(formatFechaParaEvento(dia))}
              style={{
                position: 'relative',
                textAlign: 'center',
                padding: '6px 2px',
                borderRadius: 8,
                cursor: esFuturo ? 'pointer' : 'default',
                background: esHoy ? 'rgba(163,230,53,0.15)' : tieneEvento ? 'rgba(250,204,21,0.08)' : 'transparent',
                border: esHoy ? '1px solid rgba(163,230,53,0.4)' : '1px solid transparent',
              }}>
              <div style={{ fontSize: 12, color: esHoy ? '#a3e635' : tieneRegistro ? '#f0f0f0' : '#555', fontWeight: esHoy ? 700 : 400 }}>
                {dia}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 2 }}>
                {tieneRegistro && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#a3e635' }}></div>}
                {tieneEvento && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#facc15' }}></div>}
              </div>
            </div>
          )
        })}
      </div>

      {/* LEYENDA */}
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

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }

    const { data: prof } = await supabase
      .from('profiles')
      .select('nombre, objetivo, insight_manager')
      .eq('id', user.id)
      .single()
    if (prof) { setProfile(prof); setObjTemp(prof.objetivo || '') }

    const { data: regs } = await supabase
      .from('registros')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
    if (regs) setRegistros(regs)

    const { data: evs } = await supabase
      .from('eventos')
      .select('*')
      .eq('user_id', user.id)
      .order('fecha', { ascending: true })
    if (evs) setEventos(evs)

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
      user_id: user.id,
      titulo: nuevoEvento.titulo,
      tipo: nuevoEvento.tipo,
      fecha: modalEvento,
    }).select().single()

    if (data) setEventos(prev => [...prev, data])
    setGuardandoEvento(false)
    setModalEvento(null)
    setNuevoEvento({ titulo: '', tipo: 'Entrenamiento' })
  }

  async function eliminarRegistro(id: string) {
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

  // Próximos eventos
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const proximosEventos = eventos
    .filter(e => new Date(e.fecha + 'T00:00:00') >= hoy)
    .slice(0, 3)

  function formatFecha(fecha: string) {
    const d = new Date(fecha)
    const ahora = new Date()
    const diff = Math.floor((ahora.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 0) return 'Hoy'
    if (diff === 1) return 'Ayer'
    return `Hace ${diff} días`
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

      {/* MODAL AGREGAR EVENTO */}
      {modalEvento && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setModalEvento(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#111', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px', width: '100%', maxWidth: 390 }}>
            <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 20px' }}></div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Agendar evento</div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>
              {new Date(modalEvento + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>

            <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Tipo</div>
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

            <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Descripción (opcional)</div>
            <input value={nuevoEvento.titulo} onChange={e => setNuevoEvento({ ...nuevoEvento, titulo: e.target.value })}
              placeholder="Ej: Torneo provincial, Club Palermo..."
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'system-ui', marginBottom: 16 }}
            />

            <button onClick={guardarEvento} disabled={guardandoEvento} style={{ width: '100%', background: '#a3e635', color: '#0a0a0a', border: 'none', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              {guardandoEvento ? 'Guardando...' : '📌 Agendar'}
            </button>
            <button onClick={() => setModalEvento(null)} style={{ width: '100%', background: 'transparent', color: '#666', border: 'none', padding: '12px', fontSize: 13, cursor: 'pointer', marginTop: 6 }}>
              Cancelar
            </button>
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
        <div style={{ paddingBottom: 20 }}>
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

        {/* OBJETIVO */}
        <div style={{ background: 'rgba(163,230,53,0.06)', border: '1px solid rgba(163,230,53,0.2)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: '#a3e635', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>🎯 Objetivo actual</div>
            <div onClick={() => { setObjTemp(profile.objetivo); setEditandoObjetivo(true) }} style={{ fontSize: 11, color: '#a3e635', cursor: 'pointer' }}>Editar</div>
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

        {/* CALENDARIO */}
        <Calendario
          registros={registros}
          eventos={eventos}
          onAgregarEvento={(fecha) => setModalEvento(fecha)}
        />

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
              <div key={i} onClick={() => router.push(`/registro?id=${r.id}`)} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 16px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(163,230,53,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{iconTipo(r.tipo)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{r.tipo}</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{formatFecha(r.created_at)}</div>
                  </div>
                  <div style={{ textAlign: 'right', marginRight: 8 }}>
                    <div style={{ fontWeight: 800, fontSize: 20, color: colorRendimiento(Number(r.resultado) || 0) }}>
                      {r.resultado}/10
                    </div>
                    <div style={{ fontSize: 10, color: '#888', marginTop: 1 }}>
                      {labelRendimiento(Number(r.resultado) || 0)}
                    </div>
                  </div>
                  <div onClick={e => { e.stopPropagation(); eliminarRegistro(r.id) }} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}>🗑️</div>
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
          { icon: '📊', label: 'Gráficos', path: '/graficos', active: false },
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