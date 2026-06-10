'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import PremiumBloqueado from '../components/PremiumBloqueado'

type Mensaje = {
  id: string
  mensaje: string
  respuesta: string | null
  tipo: string
  audio_url: string | null
  created_at: string
}

export default function MicaPage() {
  const router = useRouter()
  const [esPremium, setEsPremium] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [grabando, setGrabando] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])

  useEffect(() => { cargarDatos() }, [])

  async function cargarDatos() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    const { data: perfil } = await supabase.from('profiles').select('es_premium').eq('id', user.id).single()
    setEsPremium(perfil?.es_premium || false)
    const { data: msgs } = await supabase.from('mensajes_mica').select('*')
      .eq('user_id', user.id).order('created_at', { ascending: true })
    if (msgs) setMensajes(msgs)
    setLoading(false)
  }

  async function enviarMensaje() {
    if (!mensaje.trim()) return
    setEnviando(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('mensajes_mica').insert({
      user_id: user.id, mensaje, tipo: 'texto'
    }).select().single()
    if (data) setMensajes(prev => [...prev, data])
    setMensaje('')
    setEnviando(false)
  }

  async function iniciarGrabacion() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      audioChunks.current = []
      recorder.ondataavailable = e => audioChunks.current.push(e.data)
      recorder.onstop = async () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' })
        const fileName = 'audio_' + Date.now() + '.webm'
        const { error } = await supabase.storage.from('audios').upload(fileName, blob)
        if (!error) {
          const { data: urlData } = supabase.storage.from('audios').getPublicUrl(fileName)
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { data } = await supabase.from('mensajes_mica').insert({
              user_id: user.id, mensaje: '🎤 Audio', tipo: 'audio', audio_url: urlData.publicUrl
            }).select().single()
            if (data) setMensajes(prev => [...prev, data])
          }
        }
        stream.getTracks().forEach(t => t.stop())
      }
      recorder.start()
      setMediaRecorder(recorder)
      setGrabando(true)
    } catch {
      alert('No se pudo acceder al micrófono')
    }
  }

  function detenerGrabacion() {
    mediaRecorder?.stop()
    setGrabando(false)
    setMediaRecorder(null)
  }

  function formatHora(fecha: string) {
    return new Date(fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a3e635', fontFamily: 'system-ui' }}>Cargando...</div>

  return (
    <main style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#f0f0f0', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 12px' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Pádel Mental App</div>
          <div style={{ fontSize: 9, color: '#a3e635', letterSpacing: '0.1em' }}>By Ps. Mica Raffe</div>
        </div>
        <div onClick={() => router.push('/home')} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(163,230,53,0.15)', border: '1.5px solid rgba(163,230,53,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer', color: '#a3e635' }}>←</div>
      </div>

      <div style={{ padding: '0 20px 120px' }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 4 }}>Sesiones con Mica 🙋‍♀️</div>
        </div>

        {/* AGENDAR — SIEMPRE VISIBLE */}
        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 8 }}>📅 Agendar sesión — Gratis</div>
          <div style={{ fontSize: 13, color: '#ccc', lineHeight: 1.6, marginBottom: 12 }}>
            Escribile a Mica para coordinar una sesión. Te va a contactar por WhatsApp o email.
          </div>
          <a href="https://wa.me/549XXXXXXXXXX?text=Hola%20Mica%2C%20quiero%20agendar%20una%20sesi%C3%B3n"
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'block', background: '#25D366', color: '#fff', border: 'none', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 700, cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}>
            📲 Agendar por WhatsApp
          </a>
        </div>

        {/* CHAT PREMIUM */}
        <div style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.15)', borderRadius: 16, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>⭐ Chat con Mica — Premium</div>
          </div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 14 }}>Enviá mensajes o audios y Mica te responde directamente desde la app.</div>

          {!esPremium ? (
            <PremiumBloqueado />
          ) : (
            <>
              {/* MENSAJES */}
              <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 12, marginBottom: 12, maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {mensajes.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: '#555', fontSize: 13 }}>
                    Todavía no hay mensajes. ¡Escribile a Mica!
                  </div>
                ) : (
                  mensajes.map((m, i) => (
                    <div key={i}>
                      {/* Mensaje del jugador */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: m.respuesta ? 6 : 0 }}>
                        <div style={{ background: 'rgba(163,230,53,0.12)', border: '1px solid rgba(163,230,53,0.2)', borderRadius: '14px 14px 4px 14px', padding: '10px 14px', maxWidth: '80%' }}>
                          {m.tipo === 'audio' && m.audio_url ? (
                            <audio controls src={m.audio_url} style={{ width: 180, height: 32 }} />
                          ) : (
                            <div style={{ fontSize: 13, color: '#f0f0f0', lineHeight: 1.5 }}>{m.mensaje}</div>
                          )}
                          <div style={{ fontSize: 10, color: '#666', marginTop: 4, textAlign: 'right' }}>{formatHora(m.created_at)}</div>
                        </div>
                      </div>
                      {/* Respuesta de Mica */}
                      {m.respuesta && (
                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                          <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '14px 14px 14px 4px', padding: '10px 14px', maxWidth: '80%' }}>
                            <div style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700, marginBottom: 4 }}>Mica 🙋‍♀️</div>
                            <div style={{ fontSize: 13, color: '#f0f0f0', lineHeight: 1.5 }}>{m.respuesta}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* INPUT */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <textarea value={mensaje} onChange={e => setMensaje(e.target.value)}
                  placeholder="Escribile a Mica..."
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px', color: '#f0f0f0', fontSize: 13, outline: 'none', resize: 'none', minHeight: 44, maxHeight: 100, lineHeight: 1.5, boxSizing: 'border-box', fontFamily: 'system-ui' }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarMensaje() } }}
                />
                <div onClick={grabando ? detenerGrabacion : iniciarGrabacion} style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: grabando ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)',
                  border: grabando ? '1px solid rgba(239,68,68,0.4)' : '0.5px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer'
                }}>
                  {grabando ? '⏹️' : '🎤'}
                </div>
                <div onClick={enviarMensaje} style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: mensaje.trim() ? '#a3e635' : 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer'
                }}>
                  {enviando ? '⏳' : '➤'}
                </div>
              </div>
              {grabando && (
                <div style={{ fontSize: 12, color: '#f87171', textAlign: 'center', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f87171', animation: 'pulse 1s infinite' }}></div>
                  Grabando... tocá ⏹️ para detener
                </div>
              )}
            </>
          )}
        </div>
      </div>

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
            <span style={{ fontSize: 9, color: '#666' }}>{t.label}</span>
          </div>
        ))}
      </div>
    </main>
  )
}