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

export default function HomePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile>({ nombre: '', objetivo: '', insight_manager: '' })
  const [registros, setRegistros] = useState<Registro[]>([])
  const [loading, setLoading] = useState(true)
  const [editandoObjetivo, setEditandoObjetivo] = useState(false)
  const [objTemp, setObjTemp] = useState('')

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
      .limit(20)

    if (regs) setRegistros(regs)
    setLoading(false)
  }

  async function guardarObjetivo() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ objetivo: objTemp }).eq('id', user.id)
    setProfile({ ...profile, objetivo: objTemp })
    setEditandoObjetivo(false)
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

  function formatFecha(fecha: string) {
    const d = new Date(fecha)
    const ahora = new Date()
    const diff = Math.floor((ahora.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 0) return 'Hoy'
    if (diff === 1) return 'Ayer'
    return `Hace ${diff} días`
  }

  function iconTipo(tipo: string) {
    if (tipo === 'Partido') return '🏆'
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

        {/* FRASE DE BUEN RENDIMIENTO */}
        {ultimaFrase && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(163,230,53,0.2)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: '#a3e635', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>✦ Tu frase de buen rendimiento</div>
            <div style={{ fontSize: 15, lineHeight: 1.6, color: '#f0f0f0', fontStyle: 'italic' }}>"{ultimaFrase}"</div>
          </div>
        )}

        {/* CONTADORES — solo Partidos y Entrenamientos */}
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
        <div style={{ background: 'rgba(255,255,255,0.03)', borderLeft: '3px solid #a3e635', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: '#a3e635', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>✦ Insight de tu psicóloga</div>
<div style={{ fontSize: 13, lineHeight: 1.5 }}>{profile.insight_manager || 'Tu psicóloga todavía no escribió un insight para vos.'}</div>        </div>

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
            {registros.slice(0, 10).map((r, i) => (
  <div key={i} onClick={() => router.push(`/registro?id=${r.id}`)} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 16px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(163,230,53,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{iconTipo(r.tipo)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{r.tipo}</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{formatFecha(r.created_at)}</div>
                  </div>
                  <div style={{ textAlign: 'right', marginRight: 8 }}>
                    <div style={{ fontWeight: 800, fontSize: 20, color: colorRendimiento(r.resultado ? Number(r.resultado) : 0) }}>
                      {r.resultado}/10
                    </div>
                    <div style={{ fontSize: 10, color: '#888', marginTop: 1 }}>
                      {labelRendimiento(r.resultado ? Number(r.resultado) : 0)}
                    </div>
                  </div>
                  <div onClick={() => eliminarRegistro(r.id)} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}>🗑️</div>
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