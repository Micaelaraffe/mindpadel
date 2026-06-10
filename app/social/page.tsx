'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

const EMOJIS = ['😤', '🔥', '😰', '😊', '💪', '😞', '🎯', '🤝', '😅', '👑']

type Experiencia = {
  id: string
  emoji: string
  texto: string
  created_at: string
  likes: number
  mePaso: number
  yoDiLike: boolean
  yoDiMePaso: boolean
}

type Pregunta = {
  id: string
  pregunta: string
  opciones: string[]
}

export default function SocialPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'pregunta' | 'experiencias'>('pregunta')
  const [userId, setUserId] = useState<string>('')
  const [experiencias, setExperiencias] = useState<Experiencia[]>([])
  const [pregunta, setPregunta] = useState<Pregunta | null>(null)
  const [respuestas, setRespuestas] = useState<Record<string, number>>({})
  const [miRespuesta, setMiRespuesta] = useState<string | null>(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [nuevoEmoji, setNuevoEmoji] = useState('🔥')
  const [nuevoTexto, setNuevoTexto] = useState('')
  const [publicando, setPublicando] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { cargarDatos() }, [])

  async function cargarDatos() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    setUserId(user.id)

    const { data: exps } = await supabase
      .from('experiencias').select('*').order('created_at', { ascending: false }).limit(20)

    if (exps) {
      const { data: reacciones } = await supabase
        .from('reacciones_experiencias').select('experiencia_id, tipo, user_id')
      const expConReacciones = exps.map(e => {
        const reacs = reacciones?.filter(r => r.experiencia_id === e.id) || []
        return {
          ...e,
          likes: reacs.filter(r => r.tipo === 'like').length,
          mePaso: reacs.filter(r => r.tipo === 'mepaso').length,
          yoDiLike: reacs.some(r => r.tipo === 'like' && r.user_id === user.id),
          yoDiMePaso: reacs.some(r => r.tipo === 'mepaso' && r.user_id === user.id),
        }
      })
      setExperiencias(expConReacciones)
    }

    const { data: preguntas } = await supabase
      .from('preguntas_dia').select('*').eq('activa', true).order('created_at', { ascending: true })

    if (preguntas && preguntas.length > 0) {
      const diasDesde2024 = Math.floor((Date.now() - new Date('2024-01-01').getTime()) / (1000 * 60 * 60 * 24))
      const indice = Math.floor(diasDesde2024 / 3) % preguntas.length
      const p = preguntas[indice]
      setPregunta(p)
      const { data: resps } = await supabase
        .from('respuestas_pregunta').select('opcion').eq('pregunta_id', p.id)
      const conteo: Record<string, number> = {}
      resps?.forEach(r => { conteo[r.opcion] = (conteo[r.opcion] || 0) + 1 })
      setRespuestas(conteo)
      const { data: miVoto } = await supabase
        .from('respuestas_pregunta').select('opcion')
        .eq('pregunta_id', p.id).eq('user_id', user.id).single()
      if (miVoto) setMiRespuesta(miVoto.opcion)
    }

    setLoading(false)
  }

  async function votar(opcion: string) {
    if (!pregunta || miRespuesta) return
    await supabase.from('respuestas_pregunta').upsert({ pregunta_id: pregunta.id, user_id: userId, opcion })
    setMiRespuesta(opcion)
    setRespuestas(prev => ({ ...prev, [opcion]: (prev[opcion] || 0) + 1 }))
  }

  async function reaccionar(expId: string, tipo: 'like' | 'mepaso') {
    const exp = experiencias.find(e => e.id === expId)
    if (!exp) return
    const yaDio = tipo === 'like' ? exp.yoDiLike : exp.yoDiMePaso
    if (yaDio) {
      await supabase.from('reacciones_experiencias')
        .delete().eq('experiencia_id', expId).eq('user_id', userId).eq('tipo', tipo)
    } else {
      await supabase.from('reacciones_experiencias')
        .insert({ experiencia_id: expId, user_id: userId, tipo })
    }
    setExperiencias(prev => prev.map(e => {
      if (e.id !== expId) return e
      if (tipo === 'like') return { ...e, likes: yaDio ? e.likes - 1 : e.likes + 1, yoDiLike: !yaDio }
      return { ...e, mePaso: yaDio ? e.mePaso - 1 : e.mePaso + 1, yoDiMePaso: !yaDio }
    }))
  }

  async function publicar() {
    if (!nuevoTexto.trim() || nuevoTexto.length > 280) return
    setPublicando(true)
    const { data } = await supabase.from('experiencias').insert({
      user_id: userId, emoji: nuevoEmoji, texto: nuevoTexto
    }).select().single()
    if (data) {
      setExperiencias(prev => [{ ...data, likes: 0, mePaso: 0, yoDiLike: false, yoDiMePaso: false }, ...prev])
      setNuevoTexto('')
      setNuevoEmoji('🔥')
      setMostrarForm(false)
    }
    setPublicando(false)
  }

  function formatTiempo(fecha: string) {
    const diff = Math.floor((Date.now() - new Date(fecha).getTime()) / 1000)
    if (diff < 60) return 'ahora'
    if (diff < 3600) return 'hace ' + Math.floor(diff / 60) + 'm'
    if (diff < 86400) return 'hace ' + Math.floor(diff / 3600) + 'h'
    return 'hace ' + Math.floor(diff / 86400) + 'd'
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a3e635', fontFamily: 'system-ui' }}>Cargando...</div>
  )

  return (
    <main style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#f0f0f0', width: '100%' }}>

      {mostrarForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setMostrarForm(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#111', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px', width: '100%', maxWidth: 390 }}>
            <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 20px' }}></div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Compartir experiencia</div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>Anonima — nadie sabe que sos vos</div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Como te sentis?</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {EMOJIS.map(e => (
                <div key={e} onClick={() => setNuevoEmoji(e)} style={{
                  width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, cursor: 'pointer',
                  background: nuevoEmoji === e ? 'rgba(163,230,53,0.15)' : 'rgba(255,255,255,0.05)',
                  border: nuevoEmoji === e ? '1.5px solid rgba(163,230,53,0.4)' : '0.5px solid rgba(255,255,255,0.08)',
                }}>{e}</div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tu experiencia</div>
            <textarea value={nuevoTexto} onChange={e => setNuevoTexto(e.target.value.slice(0, 280))}
              placeholder="Conta algo que te paso en la cancha..."
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none', resize: 'none', minHeight: 100, lineHeight: 1.6, boxSizing: 'border-box', fontFamily: 'system-ui', marginBottom: 6 }}
            />
            <div style={{ fontSize: 11, color: nuevoTexto.length > 250 ? '#f87171' : '#555', textAlign: 'right', marginBottom: 14 }}>{nuevoTexto.length}/280</div>
            <button onClick={publicar} disabled={publicando || !nuevoTexto.trim()} style={{
              width: '100%', background: publicando || !nuevoTexto.trim() ? '#333' : '#a3e635',
              color: publicando || !nuevoTexto.trim() ? '#888' : '#0a0a0a',
              border: 'none', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer'
            }}>
              {publicando ? 'Publicando...' : 'Publicar anonimamente'}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 12px' }}>
        <div onClick={() => router.push('/home')} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(163,230,53,0.15)', border: '1.5px solid rgba(163,230,53,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer', color: '#a3e635' }}>←</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Social Padel</div>
          <div style={{ fontSize: 10, color: '#666', marginTop: 1 }}>La comunidad de Padel Mental</div>
        </div>
        <div onClick={() => setMostrarForm(true)} style={{ background: '#a3e635', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 700, color: '#0a0a0a', cursor: 'pointer' }}>+ Compartir</div>
      </div>

      <div style={{ padding: '0 20px 100px' }}>

        <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { id: 'pregunta', label: 'Pregunta del dia' },
            { id: 'experiencias', label: 'Experiencias' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)} style={{
              flex: 1, padding: '12px 8px', background: 'transparent', border: 'none',
              borderBottom: tab === t.id ? '2px solid #a3e635' : '2px solid transparent',
              color: tab === t.id ? '#f0f0f0' : '#666',
              fontSize: 13, fontWeight: tab === t.id ? 700 : 400, cursor: 'pointer'
            }}>{t.label}</button>
          ))}
        </div>

        {tab === 'pregunta' && (
  <div>
    {pregunta && (
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 14 }}>Responde y mira lo que votaron otros jugadores</div>
        <div style={{ background: 'linear-gradient(135deg, rgba(96,165,250,0.08), rgba(168,85,247,0.08))', border: '1px solid rgba(96,165,250,0.25)', borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 10, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 10 }}>Pregunta del dia</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, lineHeight: 1.4 }}>{pregunta.pregunta}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pregunta.opciones.map((opcion, i) => {
              const total = Object.values(respuestas).reduce((a, b) => a + b, 0)
              const votos = respuestas[opcion] || 0
              const pct = total > 0 ? Math.round((votos / total) * 100) : 0
              const esMia = miRespuesta === opcion
              const yaVote = !!miRespuesta
              return (
                <div key={i} onClick={() => !yaVote && votar(opcion)} style={{
                  background: esMia ? 'rgba(163,230,53,0.12)' : 'rgba(255,255,255,0.03)',
                  border: esMia ? '1px solid rgba(163,230,53,0.3)' : '0.5px solid rgba(255,255,255,0.08)',
                  borderRadius: 10, padding: '10px 12px', cursor: yaVote ? 'default' : 'pointer'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: yaVote ? 6 : 0 }}>
                    <div style={{ fontSize: 13, fontWeight: esMia ? 700 : 400, color: esMia ? '#a3e635' : '#ccc' }}>
                      {opcion} {esMia ? 'v' : ''}
                    </div>
                    {yaVote && <div style={{ fontSize: 12, fontWeight: 700, color: esMia ? '#a3e635' : '#888' }}>{pct}%</div>}
                  </div>
                  {yaVote && (
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: pct + '%', background: esMia ? '#a3e635' : '#60a5fa', borderRadius: 2 }}></div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )}

    {/* EXPERIENCIAS DEBAJO */}
    <div style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>Experiencias de la comunidad</div>
    {experiencias.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '30px 20px', color: '#555' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🎾</div>
        <div style={{ fontSize: 13 }}>Todavia no hay experiencias.</div>
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {experiencias.map((exp, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>{exp.emoji}</span>
              <div style={{ fontSize: 11, color: '#555' }}>Jugador anonimo · {formatTiempo(exp.created_at)}</div>
            </div>
            <div style={{ fontSize: 13, color: '#ccc', lineHeight: 1.6, marginBottom: 12 }}>{exp.texto}</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div onClick={() => reaccionar(exp.id, 'like')} style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', background: exp.yoDiLike ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)', border: exp.yoDiLike ? '1px solid rgba(239,68,68,0.3)' : '0.5px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '5px 12px' }}>
                <span style={{ fontSize: 15 }}>❤️</span>
                <span style={{ fontSize: 12, color: exp.yoDiLike ? '#f87171' : '#888', fontWeight: exp.yoDiLike ? 700 : 400 }}>{exp.likes}</span>
              </div>
              <div onClick={() => reaccionar(exp.id, 'mepaso')} style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', background: exp.yoDiMePaso ? 'rgba(163,230,53,0.1)' : 'rgba(255,255,255,0.04)', border: exp.yoDiMePaso ? '1px solid rgba(163,230,53,0.3)' : '0.5px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '5px 12px' }}>
                <span style={{ fontSize: 15 }}>☝️</span>
                <span style={{ fontSize: 12, color: exp.yoDiMePaso ? '#a3e635' : '#888', fontWeight: exp.yoDiMePaso ? 700 : 400 }}>{exp.mePaso}</span>
                <span style={{ fontSize: 11, color: exp.yoDiMePaso ? '#a3e635' : '#555' }}>Me paso</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}

      </div>

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: 'rgba(10,10,10,0.96)', borderTop: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', padding: '10px 0 20px', zIndex: 100 }}>
        {[
          { icon: '🏠', label: 'Inicio', path: '/home' },
          { icon: '➕', label: 'Registrar', path: '/registrar' },
          { icon: '💛', label: 'Confianza', path: '/diario' },
          { icon: '📊', label: 'Graficos', path: '/graficos' },
          { icon: '📚', label: 'Biblioteca', path: '/biblioteca' },
        ].map((t, i) => (
          <div key={i} onClick={() => router.push(t.path)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '4px 0' }}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span style={{ fontSize: 9, color: '#666' }}>{t.label}</span>
          </div>
        ))}
      </div>
    </main>
  )
}