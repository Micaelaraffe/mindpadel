'use client'
import { useState, useEffect } from 'react'

export default function InstalarPWA() {
  const [mostrar, setMostrar] = useState(false)
  const [yaInstalada, setYaInstalada] = useState(false)

  useEffect(() => {
    // Detectar si está corriendo como PWA instalada
    const esPWA = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true
    
    if (esPWA) { setYaInstalada(true); return }

    // Mostrar solo si no la cerró antes
    const cerrado = localStorage.getItem('pwa-banner-cerrado')
    if (!cerrado) setMostrar(true)
  }, [])

  function continuar() {
    localStorage.setItem('pwa-banner-cerrado', '1')
    setMostrar(false)
  }

  if (!mostrar || yaInstalada) return null

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0a0a0a', zIndex: 999, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px', fontFamily: 'system-ui, sans-serif', color: '#f0f0f0', overflowY: 'auto' }}>

      {/* FONDO */}
      <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(163,230,53,0.05)', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '-60px', left: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(163,230,53,0.04)', pointerEvents: 'none' }}></div>

      {/* LOGO */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ width: 72, height: 72, borderRadius: 18, background: 'rgba(163,230,53,0.12)', border: '1.5px solid rgba(163,230,53,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 36 }}>🧠</div>
        <div style={{ fontSize: 9, color: '#a3e635', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>Pádel Mental App</div>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 8 }}>Agregá la App a tu inicio como una aplicación nativa</div>
        <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>Tarda 10 segundos y vas a poder recibir notificaciones y abrirla como cualquier app.</div>
      </div>

      {/* IPHONE */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16, marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(163,230,53,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🍎</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>iPhone / iPad — Safari</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(163,230,53,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#a3e635', flexShrink: 0 }}>1</div>
            <div style={{ fontSize: 12, color: '#ccc' }}>Tocá el botón compartir <span style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 4, padding: '2px 6px', fontSize: 13 }}>⬆️</span> abajo en Safari</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(163,230,53,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#a3e635', flexShrink: 0 }}>2</div>
            <div style={{ fontSize: 12, color: '#ccc' }}>Elegí <span style={{ color: '#a3e635', fontWeight: 600 }}>"Agregar a pantalla de inicio"</span></div>
          </div>
        </div>
      </div>

      {/* ANDROID */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(163,230,53,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🤖</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Android — Chrome</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(163,230,53,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#a3e635', flexShrink: 0 }}>1</div>
            <div style={{ fontSize: 12, color: '#ccc' }}>Tocá los 3 puntos <span style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 4, padding: '2px 6px', fontSize: 13 }}>⋮</span> arriba a la derecha</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(163,230,53,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#a3e635', flexShrink: 0 }}>2</div>
            <div style={{ fontSize: 12, color: '#ccc' }}>Tocá <span style={{ color: '#a3e635', fontWeight: 600 }}>"Agregar a pantalla de inicio"</span></div>
          </div>
        </div>
      </div>

      <button onClick={continuar} style={{ width: '100%', background: '#a3e635', color: '#0a0a0a', border: 'none', borderRadius: 14, padding: 16, fontSize: 15, fontWeight: 800, cursor: 'pointer', marginBottom: 10 }}>
        ✅ Ya la instalé, continuar
      </button>
      <button onClick={continuar} style={{ width: '100%', background: 'transparent', color: '#555', border: 'none', padding: 10, fontSize: 13, cursor: 'pointer' }}>
        Continuar sin instalar
      </button>

    </div>
  )
}