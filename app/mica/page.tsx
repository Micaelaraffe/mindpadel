'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import PremiumBloqueado from '../components/PremiumBloqueado'

export default function MicaPage() {
  const router = useRouter()
  const [esPremium, setEsPremium] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mensaje, setMensaje] = useState('')
  const [enviado, setEnviado] = useState(false)

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      const { data } = await supabase.from('profiles').select('es_premium').eq('id', user.id).single()
      setEsPremium(data?.es_premium || false)
      setLoading(false)
    }
    cargar()
  }, [])

  async function enviarMensaje() {
    if (!mensaje.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('mensajes_mica').insert({
      user_id: user.id,
      mensaje,
      leido: false,
    })
    setMensaje('')
    setEnviado(true)
    setTimeout(() => setEnviado(false), 3000)
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

      <div style={{ padding: '0 20px 100px' }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 4 }}>Sesiones con Mica 🙋‍♀️</div>
          <div style={{ fontSize: 13, color: '#666' }}>Espacio exclusivo Premium</div>
        </div>

        {!esPremium ? (
          <PremiumBloqueado />
        ) : (
          <>
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 10 }}>📅 Agendar sesión</div>
              <div style={{ fontSize: 13, color: '#ccc', lineHeight: 1.6, marginBottom: 12 }}>Para agendar una sesión con Ps. Mica Raffe, escribile un mensaje y ella te contacta para coordinar.</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#a3e635', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 10 }}>✉️ Escribile a Mica</div>
              {enviado && (
                <div style={{ background: 'rgba(163,230,53,0.1)', border: '1px solid rgba(163,230,53,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#a3e635', marginBottom: 12 }}>
                  ✅ Mensaje enviado. Mica te va a responder pronto.
                </div>
              )}
              <textarea value={mensaje} onChange={e => setMensaje(e.target.value)}
                placeholder="Hola Mica, quería consultarte sobre..."
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none', resize: 'none', minHeight: 100, lineHeight: 1.6, boxSizing: 'border-box', fontFamily: 'system-ui', marginBottom: 12 }}
              />
              <button onClick={enviarMensaje} style={{ width: '100%', background: '#a3e635', color: '#0a0a0a', border: 'none', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                Enviar mensaje
              </button>
            </div>
          </>
        )}
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