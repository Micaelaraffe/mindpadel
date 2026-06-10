'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type Jugador = {
  id: string
  nombre: string
  objetivo: string
  insight_manager: string
  created_at: string
  totalRegistros?: number
  ultimoRegistro?: string
  es_premium: boolean
}

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
  pensamientos: string
  frase_ayudo: string
  aprendizajes: string
  tiempo_segundos: number
  created_at: string
}

type BibliotecaItem = {
  id: string
  titulo: string
  descripcion: string
  tipo: string
  url: string
  tag: string
  created_at: string
}

const tipoConfig: Record<string, { icon: string, color: string }> = {
  'PDF': { icon: '📄', color: 'rgba(239,68,68,0.15)' },
  'Audio': { icon: '🎙️', color: 'rgba(168,85,247,0.15)' },
  'Ejercicio': { icon: '🧠', color: 'rgba(163,230,53,0.15)' },
  'Video': { icon: '🎥', color: 'rgba(59,130,246,0.15)' },
  'Artículo': { icon: '📝', color: 'rgba(251,146,60,0.15)' },
  'Imagen': { icon: '🖼️', color: 'rgba(251,191,36,0.15)' },
}

const tooltipStyle = {
  backgroundColor: '#1a1a1a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: '#f0f0f0',
  fontSize: 12,
}

function formatFecha(fecha: string) {
  const d = new Date(fecha)
  const ahora = new Date()
  const diff = Math.floor((ahora.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Ayer'
  return 'Hace ' + diff + ' días'
}

function colorRendimiento(val: number) {
  if (val >= 8) return '#a3e635'
  if (val >= 5) return '#facc15'
  return '#f87171'
}

function formatTiempo(segundos: number) {
  if (segundos < 60) return segundos + 's'
  return Math.floor(segundos / 60) + 'm ' + (segundos % 60) + 's'
}

export default function ManagerPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'jugadores' | 'biblioteca'>('jugadores')
  const [jugadores, setJugadores] = useState<Jugador[]>([])
  const [biblioteca, setBiblioteca] = useState<BibliotecaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState<Jugador | null>(null)
  const [registrosJugador, setRegistrosJugador] = useState<Registro[]>([])
  const [insight, setInsight] = useState('')
  const [guardandoInsight, setGuardandoInsight] = useState(false)
  const [mostrarFormBiblioteca, setMostrarFormBiblioteca] = useState(false)
  const [subiendo, setSubiendo] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')
  const [depositosBanco, setDepositosBanco] = useState(0)
  const [pensamientos, setPensamientos] = useState<{ pensamiento_negativo: string, created_at: string }[]>([])
  const [tabJugador, setTabJugador] = useState<'registros' | 'graficos'>('registros')
  const fileRef = useRef<HTMLInputElement>(null)

  const [nuevoItem, setNuevoItem] = useState({
    titulo: '', descripcion: '', tipo: 'PDF', tag: '', url: '',
  })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: players } = await supabase
      .from('profiles').select('*').eq('role', 'player').order('created_at', { ascending: false })

    if (players) {
      const jugadoresConStats = await Promise.all(players.map(async (p) => {
        const { data: regs } = await supabase
          .from('registros').select('created_at').eq('user_id', p.id).order('created_at', { ascending: false })
        return { ...p, totalRegistros: regs?.length || 0, ultimoRegistro: regs?.[0]?.created_at || null }
      }))
      setJugadores(jugadoresConStats)
    }

    const { data: bib } = await supabase.from('biblioteca').select('*').order('created_at', { ascending: false })
    if (bib) setBiblioteca(bib)
    setLoading(false)
  }

  async function verJugador(jugador: Jugador) {
    setJugadorSeleccionado(jugador)
    setInsight(jugador.insight_manager || '')
    setTabJugador('registros')

    const { data: regs } = await supabase
      .from('registros').select('*').eq('user_id', jugador.id).order('created_at', { ascending: false })
    if (regs) setRegistrosJugador(regs)

    const { data: diarios, count } = await supabase
      .from('diario_confianza')
      .select('pensamiento_negativo, created_at', { count: 'exact' })
      .eq('user_id', jugador.id)
      .not('pensamiento_negativo', 'eq', '')
      .order('created_at', { ascending: false })

    setDepositosBanco(count || 0)
    setPensamientos(diarios || [])
  }

  async function guardarInsight() {
    if (!jugadorSeleccionado) return
    setGuardandoInsight(true)
    const { error } = await supabase.from('profiles').update({ insight_manager: insight }).eq('id', jugadorSeleccionado.id)
    if (error) {
      setMensajeExito('Error al guardar.')
    } else {
      setJugadores(prev => prev.map(j => j.id === jugadorSeleccionado.id ? { ...j, insight_manager: insight } : j))
     const resNoti = await fetch('/api/notificacion', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    titulo: '✦ Nuevo mensaje de tu psicóloga',
    mensaje: 'Ps. Mica Raffe te dejó un mensaje personalizado. ¡Abrí la app para verlo!',
    jugadorId: jugadorSeleccionado.id,
  })
})
const dataNoti = await resNoti.json()
console.log('Respuesta notificacion:', JSON.stringify(dataNoti))
      setMensajeExito('Insight guardado ✓')
      setTimeout(() => setMensajeExito(''), 2000)
    }
    setGuardandoInsight(false)
  }

  async function subirArchivo(file: File) {
    const ext = file.name.split('.').pop()
    const fileName = 'archivo_' + Date.now() + '.' + ext
    const { error } = await supabase.storage.from('biblioteca').upload(fileName, file, { cacheControl: '3600', upsert: true })
    if (error) return null
    const { data: urlData } = supabase.storage.from('biblioteca').getPublicUrl(fileName)
    return urlData.publicUrl
  }

  function detectarTipo(file: File) {
    if (file.type.includes('pdf')) return 'PDF'
    if (file.type.includes('audio')) return 'Audio'
    if (file.type.includes('image')) return 'Imagen'
    if (file.type.includes('video')) return 'Video'
    return 'Artículo'
  }

  async function handleSubirContenido() {
    if (!nuevoItem.titulo.trim()) return
    setSubiendo(true)
    let urlFinal = nuevoItem.url
    let tipoFinal = nuevoItem.tipo

    if (fileRef.current?.files?.[0]) {
      const file = fileRef.current.files[0]
      tipoFinal = detectarTipo(file)
      const url = await subirArchivo(file)
      if (url) urlFinal = url
      else { setSubiendo(false); setMensajeExito('Error al subir el archivo.'); return }
    }

    const { data, error } = await supabase.from('biblioteca')
      .insert({ titulo: nuevoItem.titulo, descripcion: nuevoItem.descripcion, tipo: tipoFinal, tag: nuevoItem.tag, url: urlFinal })
      .select().single()

    setSubiendo(false)
    if (!error && data) {
      setBiblioteca(prev => [data, ...prev])
      setNuevoItem({ titulo: '', descripcion: '', tipo: 'PDF', tag: '', url: '' })
      if (fileRef.current) fileRef.current.value = ''
      setMostrarFormBiblioteca(false)
      setMensajeExito('¡Contenido subido! ✓')
      setTimeout(() => setMensajeExito(''), 2500)
    }
  }

  async function eliminarItem(id: string) {
    await supabase.from('biblioteca').delete().eq('id', id)
    setBiblioteca(prev => prev.filter(i => i.id !== id))
  }

async function togglePremium(jugador: Jugador) {
  const nuevo = !jugador.es_premium
  await supabase.from('profiles').update({ es_premium: nuevo }).eq('id', jugador.id)
  setJugadores(prev => prev.map(j => j.id === jugador.id ? { ...j, es_premium: nuevo } : j))
  if (jugadorSeleccionado?.id === jugador.id) {
    setJugadorSeleccionado({ ...jugadorSeleccionado, es_premium: nuevo })
  }
}

  async function eliminarJugador(id: string) {
    const confirmar = window.confirm('¿Seguro que querés eliminar este jugador?')
    if (!confirmar) return
    await supabase.from('registros').delete().eq('user_id', id)
    await supabase.from('profiles').delete().eq('id', id)
    setJugadores(prev => prev.filter(j => j.id !== id))
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a3e635', fontFamily: 'system-ui' }}>Cargando...</div>
  )

  // PERFIL JUGADOR
  if (jugadorSeleccionado) {
    const regsConTiempo = registrosJugador.filter(r => r.tiempo_segundos > 0)
    const tiempoPromedio = regsConTiempo.length > 0
      ? Math.floor(regsConTiempo.reduce((s, r) => s + r.tiempo_segundos, 0) / regsConTiempo.length) : 0

    const zorData = [...registrosJugador].reverse().map((r, i) => ({
      sesion: 'S' + (i + 1), rendimiento: Number(r.resultado) || 0,
      confianza: r.confianza, concentracion: r.concentracion, activacion: r.activacion,
    }))

    const emocionCount: Record<string, number> = {}
    registrosJugador.forEach(r => {
      if (r.emocion) r.emocion.split(', ').forEach((e: string) => { emocionCount[e] = (emocionCount[e] || 0) + 1 })
    })
    const emocionData = Object.entries(emocionCount).map(([emocion, cantidad]) => ({ emocion, cantidad })).sort((a, b) => b.cantidad - a.cantidad)

    const sesionesBuenas = registrosJugador.filter(r => Number(r.resultado) >= 7)
    const emocionBuenaCount: Record<string, number> = {}
    sesionesBuenas.forEach(r => {
      if (r.emocion) r.emocion.split(', ').forEach((e: string) => { emocionBuenaCount[e] = (emocionBuenaCount[e] || 0) + 1 })
    })
    const emocionBuenaData = Object.entries(emocionBuenaCount).map(([emocion, cantidad]) => ({ emocion, cantidad })).sort((a, b) => b.cantidad - a.cantidad).slice(0, 6)

    const partidos = registrosJugador.filter(r => r.tipo === 'Partido amistoso' || r.tipo === 'Torneo' || r.tipo === 'Partido')
    const entrenos = registrosJugador.filter(r => r.tipo === 'Entrenamiento')
    const comparacionData = partidos.length > 0 && entrenos.length > 0 ? [
      { metrica: 'Activación', Partidos: Number((partidos.reduce((s, r) => s + r.activacion, 0) / partidos.length).toFixed(1)), Entrenos: Number((entrenos.reduce((s, r) => s + r.activacion, 0) / entrenos.length).toFixed(1)) },
      { metrica: 'Concentración', Partidos: Number((partidos.reduce((s, r) => s + r.concentracion, 0) / partidos.length).toFixed(1)), Entrenos: Number((entrenos.reduce((s, r) => s + r.concentracion, 0) / entrenos.length).toFixed(1)) },
      { metrica: 'Confianza', Partidos: Number((partidos.reduce((s, r) => s + r.confianza, 0) / partidos.length).toFixed(1)), Entrenos: Number((entrenos.reduce((s, r) => s + r.confianza, 0) / entrenos.length).toFixed(1)) },
    ] : []

    const motivacionData = [...registrosJugador].reverse().map((r, i) => ({ sesion: 'S' + (i + 1), motivacion: r.motivacion || 0 }))
    const frustracionData = [...registrosJugador].reverse().map((r, i) => ({ sesion: 'S' + (i + 1), frustracion: r.frustracion || 0 }))

    const patron = sesionesBuenas.length >= 2 ? {
      activacion: (sesionesBuenas.reduce((s, r) => s + r.activacion, 0) / sesionesBuenas.length).toFixed(1),
      concentracion: (sesionesBuenas.reduce((s, r) => s + r.concentracion, 0) / sesionesBuenas.length).toFixed(1),
      confianza: (sesionesBuenas.reduce((s, r) => s + r.confianza, 0) / sesionesBuenas.length).toFixed(1),
      desafio: (sesionesBuenas.reduce((s, r) => s + r.desafio, 0) / sesionesBuenas.length).toFixed(1),
    } : null

    return (
      <main style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#f0f0f0', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 12px' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>Pádel Mental App</div>
            <div style={{ fontSize: 9, color: '#a3e635', letterSpacing: '0.1em' }}>Panel Manager</div>
          </div>
          <div onClick={() => { setJugadorSeleccionado(null); setTabJugador('registros') }} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(163,230,53,0.15)', border: '1.5px solid rgba(163,230,53,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer', color: '#a3e635' }}>←</div>
        </div>

        <div style={{ padding: '0 20px 40px' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(163,230,53,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22, color: '#a3e635', flexShrink: 0 }}>
              {jugadorSeleccionado.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 20 }}>{jugadorSeleccionado.nombre}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{jugadorSeleccionado.totalRegistros} registros totales</div>
            </div>
          </div>

          {/* TABS */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            {[{ id: 'registros', label: '📋 Registros' }, { id: 'graficos', label: '📊 Gráficos' }].map(t => (
              <button key={t.id} onClick={() => setTabJugador(t.id as any)} style={{
                flex: 1, padding: '12px 8px', background: 'transparent', border: 'none',
                borderBottom: tabJugador === t.id ? '2px solid #a3e635' : '2px solid transparent',
                color: tabJugador === t.id ? '#f0f0f0' : '#666',
                fontSize: 14, fontWeight: tabJugador === t.id ? 700 : 400, cursor: 'pointer'
              }}>{t.label}</button>
            ))}
          </div>

          {/* TOGGLE PREMIUM */}
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: jugadorSeleccionado.es_premium ? 'rgba(250,204,21,0.08)' : 'rgba(255,255,255,0.03)', border: jugadorSeleccionado.es_premium ? '1px solid rgba(250,204,21,0.3)' : '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <span style={{ fontSize: 20 }}>{jugadorSeleccionado.es_premium ? '⭐' : '🔒'}</span>
    <div>
      <div style={{ fontSize: 13, fontWeight: 700 }}>{jugadorSeleccionado.es_premium ? 'Acceso Premium activo' : 'Sin acceso Premium'}</div>
      <div style={{ fontSize: 11, color: '#666', marginTop: 1 }}>Gráficos avanzados, biblioteca, sesiones con Mica</div>
    </div>
  </div>
  <div onClick={() => togglePremium(jugadorSeleccionado)} style={{
    background: jugadorSeleccionado.es_premium ? '#facc15' : 'rgba(255,255,255,0.08)',
    borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 700,
    color: jugadorSeleccionado.es_premium ? '#0a0a0a' : '#888', cursor: 'pointer'
  }}>
    {jugadorSeleccionado.es_premium ? 'Desactivar' : 'Activar'}
  </div>
</div>

          {/* TAB REGISTROS */}
          {tabJugador === 'registros' && (
            <div>
              {jugadorSeleccionado.objetivo && (
                <div style={{ background: 'rgba(163,230,53,0.06)', border: '1px solid rgba(163,230,53,0.2)', borderRadius: 14, padding: 14, marginBottom: 16 }}>
                  {(jugadorSeleccionado as any).nivel && (
  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
    <div style={{ background: 'rgba(163,230,53,0.08)', border: '1px solid rgba(163,230,53,0.2)', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#a3e635' }}>
      {(jugadorSeleccionado as any).nivel}
    </div>
    <div style={{ background: 'rgba(163,230,53,0.08)', border: '1px solid rgba(163,230,53,0.2)', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#a3e635' }}>
      Categoría {(jugadorSeleccionado as any).categoria}
    </div>
  </div>
)}
                  <div style={{ fontSize: 10, color: '#a3e635', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontWeight: 700 }}>🎯 Objetivo del jugador</div>
                  <div style={{ fontSize: 13, lineHeight: 1.5 }}>{jugadorSeleccionado.objetivo}</div>
                </div>
              )}

              {tiempoPromedio > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>⏱️ Tiempo promedio</div>
                    <div style={{ fontWeight: 800, fontSize: 24, color: '#a3e635' }}>{formatTiempo(tiempoPromedio)}</div>
                    <div style={{ fontSize: 11, color: '#666', marginTop: 3 }}>por registro</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>📋 Con tiempo</div>
                    <div style={{ fontWeight: 800, fontSize: 24, color: '#a3e635' }}>{regsConTiempo.length}</div>
                    <div style={{ fontSize: 11, color: '#666', marginTop: 3 }}>de {registrosJugador.length} registros</div>
                  </div>
                </div>
              )}

              <div style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.15)', borderRadius: 14, padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>💛 Banco de Confianza</div>
                  <div style={{ background: 'rgba(250,204,21,0.15)', border: '1px solid rgba(250,204,21,0.3)', borderRadius: 20, padding: '4px 12px' }}>
                    <span style={{ fontWeight: 800, fontSize: 18, color: '#facc15' }}>{depositosBanco}</span>
                    <span style={{ fontSize: 11, color: '#888', marginLeft: 4 }}>depósitos</span>
                  </div>
                </div>
                {pensamientos.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#555' }}>No hay pensamientos registrados todavía.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {pensamientos.map((p, i) => (
                      <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 14px' }}>
                        <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>
                          {new Date(p.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: 13, color: '#ccc', lineHeight: 1.5, fontStyle: 'italic' }}>"{p.pensamiento_negativo}"</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: '#a3e635', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontWeight: 700 }}>✦ Tu insight para este jugador</div>
                <textarea value={insight} onChange={e => setInsight(e.target.value)}
                  placeholder="Escribí un insight o feedback para este jugador."
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', color: '#f0f0f0', fontSize: 13, outline: 'none', resize: 'none', minHeight: 90, boxSizing: 'border-box', fontFamily: 'system-ui', lineHeight: 1.5 }}
                />
                {mensajeExito && <div style={{ fontSize: 12, color: '#a3e635', marginTop: 6 }}>{mensajeExito}</div>}
                <button onClick={guardarInsight} disabled={guardandoInsight} style={{ width: '100%', background: guardandoInsight ? '#333' : '#a3e635', color: guardandoInsight ? '#888' : '#0a0a0a', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 10 }}>
                  {guardandoInsight ? 'Guardando...' : 'Guardar insight'}
                </button>
              </div>

              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888', marginBottom: 12 }}>Registros del jugador</div>

              {registrosJugador.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#555', fontSize: 13 }}>Todavía no tiene registros.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {registrosJugador.map((r, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{r.tipo}</div>
                          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                            {formatFecha(r.created_at)}
                            {r.tiempo_segundos > 0 && <span style={{ marginLeft: 6, color: '#666' }}>· ⏱️ {formatTiempo(r.tiempo_segundos)}</span>}
                          </div>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 22, color: colorRendimiento(Number(r.resultado)) }}>{r.resultado}/10</div>
                      </div>
                      {r.emocion && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                          {r.emocion.split(', ').map((e: string, j: number) => (
                            <span key={j} style={{ background: 'rgba(163,230,53,0.08)', border: '0.5px solid rgba(163,230,53,0.2)', borderRadius: 20, fontSize: 11, color: '#a3e635', padding: '2px 10px' }}>{e}</span>
                          ))}
                        </div>
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                        {[{ label: 'Conc.', val: r.concentracion }, { label: 'Activ.', val: r.activacion }, { label: 'Conf.', val: r.confianza }].map((m, j) => (
                          <div key={j} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                            <div style={{ fontSize: 10, color: '#666', marginBottom: 2 }}>{m.label}</div>
                            <div style={{ fontWeight: 700, fontSize: 16, color: '#a3e635' }}>{m.val}</div>
                          </div>
                        ))}
                      </div>
                      {r.pensamientos && <div style={{ marginTop: 10, fontSize: 13, color: '#ccc', lineHeight: 1.5, borderTop: '0.5px solid rgba(255,255,255,0.06)', paddingTop: 10 }}><span style={{ color: '#666', fontSize: 11 }}>Pensamientos: </span>{r.pensamientos}</div>}
                      {r.frase_ayudo && <div style={{ marginTop: 8, fontSize: 13, color: '#a3e635', fontStyle: 'italic' }}>"{r.frase_ayudo}"</div>}
                      {r.aprendizajes && <div style={{ marginTop: 8, fontSize: 13, color: '#ccc' }}><span style={{ color: '#666', fontSize: 11 }}>Aprendizaje: </span>{r.aprendizajes}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB GRÁFICOS */}
          {tabJugador === 'graficos' && (
            <div>
              {registrosJugador.length < 2 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#555' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
                  <div style={{ fontSize: 14, color: '#888' }}>Necesita al menos 2 registros para ver gráficos.</div>
                </div>
              ) : (
                <>
                  {emocionBuenaData.length > 0 && (
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888', marginBottom: 12 }}>🏆 Emociones en mejores sesiones</div>
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

                  {patron && (
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderLeft: '3px solid #a3e635', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                      <div style={{ fontSize: 10, color: '#a3e635', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>✦ Patrón ZOR detectado</div>
                      <div style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>En sus {sesionesBuenas.length} mejores sesiones:</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {[
                          { label: 'Activación', val: patron.activacion },
                          { label: 'Concentración', val: patron.concentracion },
                          { label: 'Confianza', val: patron.confianza },
                          { label: 'Desafío', val: patron.desafio },
                        ].map((m, i) => (
                          <div key={i} style={{ background: 'rgba(163,230,53,0.06)', border: '1px solid rgba(163,230,53,0.15)', borderRadius: 10, padding: '10px 12px' }}>
                            <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{m.label}</div>
                            <div style={{ fontWeight: 800, fontSize: 22, color: '#a3e635' }}>{m.val}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {comparacionData.length > 0 && (
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888', marginBottom: 8 }}>🎾 Partidos vs Entrenamientos</div>
                      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: '#a3e635' }}></div><span style={{ fontSize: 11, color: '#888' }}>Partidos ({partidos.length})</span></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: '#60a5fa' }}></div><span style={{ fontSize: 11, color: '#888' }}>Entrenamientos ({entrenos.length})</span></div>
                      </div>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={comparacionData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="metrica" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 10]} tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Bar dataKey="Partidos" fill="#a3e635" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Entrenos" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888' }}>💪 Evolución Motivación</div>
                      <div style={{ fontWeight: 800, fontSize: 20, color: '#a3e635' }}>
                        {(registrosJugador.reduce((s, r) => s + (r.motivacion || 0), 0) / registrosJugador.length).toFixed(1)}
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={motivacionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="sesion" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 10]} tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="motivacion" fill="#a3e635" radius={[4, 4, 0, 0]} name="Motivación" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888' }}>😤 Evolución Frustración</div>
                      <div style={{ fontWeight: 800, fontSize: 20, color: '#f87171' }}>
                        {(registrosJugador.reduce((s, r) => s + (r.frustracion || 0), 0) / registrosJugador.length).toFixed(1)}
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={frustracionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="sesion" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 10]} tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="frustracion" fill="#f87171" radius={[4, 4, 0, 0]} name="Frustración" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {emocionData.length > 0 && (
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888', marginBottom: 12 }}>Todas las emociones</div>
                      <ResponsiveContainer width="100%" height={Math.max(180, emocionData.length * 36)}>
                        <BarChart data={emocionData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                          <XAxis type="number" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="emocion" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Bar dataKey="cantidad" fill="#60a5fa" radius={[0, 6, 6, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#f0f0f0', width: '100%' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 12px' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Pádel Mental App</div>
          <div style={{ fontSize: 9, color: '#a3e635', letterSpacing: '0.1em' }}>Panel Psicóloga</div>
        </div>
        <div onClick={cerrarSesion} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(163,230,53,0.15)', border: '1.5px solid rgba(163,230,53,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, cursor: 'pointer', color: '#a3e635' }}>Salir</div>
      </div>

      <div style={{ padding: '0 20px 100px' }}>

        <div style={{ paddingBottom: 20 }}>
          <div style={{ display: 'inline-block', background: 'rgba(163,230,53,0.12)', color: '#a3e635', fontSize: 11, padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(163,230,53,0.25)', marginBottom: 8 }}>✦ Panel Manager</div>
          <div style={{ fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em' }}>Hola, Micaela 🧠</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
          {[
            { val: jugadores.length, label: 'Jugadores', icon: '👥' },
            { val: jugadores.reduce((s, j) => s + (j.totalRegistros || 0), 0), label: 'Registros totales', icon: '📊' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 26, color: '#a3e635' }}>{s.val}</div>
              <div style={{ fontSize: 11, color: '#666', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {[{ id: 'jugadores', label: '👥 Jugadores' }, { id: 'biblioteca', label: '📚 Biblioteca' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)} style={{
              flex: 1, padding: '12px 8px', background: 'transparent', border: 'none',
              borderBottom: tab === t.id ? '2px solid #a3e635' : '2px solid transparent',
              color: tab === t.id ? '#f0f0f0' : '#666', fontSize: 14,
              fontWeight: tab === t.id ? 700 : 400, cursor: 'pointer'
            }}>{t.label}</button>
          ))}
        </div>

        {tab === 'jugadores' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {jugadores.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#555', fontSize: 14 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
                <div>Todavía no hay jugadores registrados.</div>
              </div>
            ) : (
              jugadores.map((j, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div onClick={() => verJugador(j)} style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(163,230,53,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: '#a3e635', flexShrink: 0, cursor: 'pointer' }}>
                    {j.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div onClick={() => verJugador(j)} style={{ flex: 1, cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
  <div style={{ fontWeight: 600, fontSize: 15 }}>{j.nombre}</div>
  {j.es_premium && (
    <div style={{ background: 'linear-gradient(90deg, #facc15, #f59e0b)', borderRadius: 20, padding: '2px 8px', fontSize: 9, fontWeight: 800, color: '#0a0a0a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Premium</div>
  )}
</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                      {j.totalRegistros} registros · {j.ultimoRegistro ? formatFecha(j.ultimoRegistro) : 'Sin registros'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div onClick={() => verJugador(j)} style={{ color: '#a3e635', fontSize: 18, cursor: 'pointer' }}>→</div>
                    <div onClick={() => eliminarJugador(j.id)} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14 }}>🗑️</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'biblioteca' && (
          <div>
            {mensajeExito && (
              <div style={{ background: 'rgba(163,230,53,0.12)', border: '1px solid rgba(163,230,53,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#a3e635', marginBottom: 14 }}>
                {mensajeExito}
              </div>
            )}

            <button onClick={() => setMostrarFormBiblioteca(!mostrarFormBiblioteca)} style={{ width: '100%', background: mostrarFormBiblioteca ? 'rgba(255,255,255,0.05)' : '#a3e635', color: mostrarFormBiblioteca ? '#888' : '#0a0a0a', border: mostrarFormBiblioteca ? '1px solid rgba(255,255,255,0.1)' : 'none', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 16 }}>
              {mostrarFormBiblioteca ? '✕ Cancelar' : '+ Subir contenido'}
            </button>

            {mostrarFormBiblioteca && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Título</div>
                <input value={nuevoItem.titulo} onChange={e => setNuevoItem({ ...nuevoItem, titulo: e.target.value })}
                  placeholder="Ej: Técnicas de respiración pre-partido"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'system-ui', marginBottom: 12 }}
                />
                <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Descripción</div>
                <textarea value={nuevoItem.descripcion} onChange={e => setNuevoItem({ ...nuevoItem, descripcion: e.target.value })}
                  placeholder="Breve descripción..."
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none', resize: 'none', minHeight: 70, boxSizing: 'border-box', fontFamily: 'system-ui', lineHeight: 1.5, marginBottom: 12 }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Tipo</div>
                    <select value={nuevoItem.tipo} onChange={e => setNuevoItem({ ...nuevoItem, tipo: e.target.value })}
                      style={{ width: '100%', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', color: '#f0f0f0', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}>
                      {['PDF', 'Audio', 'Imagen', 'Video', 'Ejercicio', 'Artículo'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Tag</div>
                    <input value={nuevoItem.tag} onChange={e => setNuevoItem({ ...nuevoItem, tag: e.target.value })}
                      placeholder="Ej: Ansiedad"
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', color: '#f0f0f0', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'system-ui' }}
                    />
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Archivo</div>
                <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.mp3,.mp4,.wav"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', color: '#888', fontSize: 13, boxSizing: 'border-box', marginBottom: 12 }}
                />
                <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>O pegá un link</div>
                <input value={nuevoItem.url} onChange={e => setNuevoItem({ ...nuevoItem, url: e.target.value })}
                  placeholder="https://..."
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', color: '#f0f0f0', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'system-ui', marginBottom: 14 }}
                />
                <button onClick={handleSubirContenido} disabled={subiendo || !nuevoItem.titulo.trim()} style={{ width: '100%', background: subiendo || !nuevoItem.titulo.trim() ? '#333' : '#a3e635', color: subiendo || !nuevoItem.titulo.trim() ? '#888' : '#0a0a0a', border: 'none', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 700, cursor: subiendo || !nuevoItem.titulo.trim() ? 'not-allowed' : 'pointer' }}>
                  {subiendo ? 'Subiendo...' : '⬆️ Subir contenido'}
                </button>
              </div>
            )}

            {biblioteca.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#555', fontSize: 13 }}>Todavía no subiste contenido.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {biblioteca.map((item, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: tipoConfig[item.tipo]?.color || 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                      {tipoConfig[item.tipo]?.icon || '📄'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{item.titulo}</div>
                      {item.tag && <div style={{ display: 'inline-block', background: 'rgba(163,230,53,0.08)', border: '0.5px solid rgba(163,230,53,0.2)', borderRadius: 20, fontSize: 10, color: '#a3e635', padding: '2px 8px', marginTop: 5 }}>{item.tag}</div>}
                    </div>
                    <div onClick={() => eliminarItem(item.id)} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14 }}>🗑️</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: 'rgba(10,10,10,0.96)', borderTop: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', padding: '10px 0 20px', zIndex: 100 }}>
        {[{ icon: '👥', label: 'Jugadores', tab: 'jugadores' }, { icon: '📚', label: 'Biblioteca', tab: 'biblioteca' }].map((t, i) => (
          <div key={i} onClick={() => setTab(t.tab as any)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '4px 0' }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ fontSize: 10, color: tab === t.tab ? '#a3e635' : '#666' }}>{t.label}</span>
          </div>
        ))}
      </div>

    </main>
  )
}