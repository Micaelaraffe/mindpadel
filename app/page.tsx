'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [role, setRole] = useState<'player' | 'manager'>('player')
  const [email, setEmail] = useState('jugador@demo.com')
  const router = useRouter()

  function handleLogin() {
    if (role === 'manager') {
      router.push('/manager')
    } else {
      router.push('/home')
    }
  }

  return (
    <main style={{
      background: '#0a0a0a', minHeight: '100vh', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 28px', fontFamily: 'system-ui, sans-serif', color: '#f0f0f0'
    }}>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, background: 'white', borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <span style={{ fontSize: 36 }}>🎾</span>
        </div>
        <h1 style={{ fontWeight: 800, fontSize: 28, margin: 0 }}>MindPádel</h1>
        <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>Tu bitácora mental deportiva</p>
      </div>

      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontSize: 11, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>Ingresar como</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['player', 'manager'] as const).map(r => (
            <button key={r} onClick={() => {
              setRole(r)
              setEmail(r === 'player' ? 'jugador@demo.com' : 'psicologa@demo.com')
            }} style={{
              flex: 1, padding: '10px 6px',
              background: role === r ? 'rgba(163,230,53,0.12)' : '#1a1a1a',
              border: role === r ? '1px solid rgba(163,230,53,0.4)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, color: role === r ? '#a3e635' : '#888',
              fontSize: 13, cursor: 'pointer', fontWeight: 600
            }}>
              {r === 'player' ? '🎾 Jugador' : '🧠 Psicóloga'}
            </button>
          ))}
        </div>

        <input value={email} onChange={e => setEmail(e.target.value)}
          placeholder="tu@email.com"
          style={{
            background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, padding: '13px 16px', color: '#f0f0f0',
            fontSize: 15, outline: 'none', width: '100%', boxSizing: 'border-box'
          }} />

        <input type="password" defaultValue="demo123"
          placeholder="••••••••"
          style={{
            background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, padding: '13px 16px', color: '#f0f0f0',
            fontSize: 15, outline: 'none', width: '100%', boxSizing: 'border-box'
          }} />

        <button onClick={handleLogin} style={{
          background: '#a3e635', color: '#0a0a0a', border: 'none',
          borderRadius: 12, padding: 15, fontSize: 15, fontWeight: 700,
          cursor: 'pointer', width: '100%'
        }}>
          Ingresar →
        </button>
      </div>
    </main>
  )
}