'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from './lib/supabase'

export default function LoginPage() {
  const [role, setRole] = useState<'player' | 'manager'>('player')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const router = useRouter()

  async function handleLogin() {
    setLoading(true)
    setError('')
    setMensaje('')

    if (role === 'manager') {
      router.push('/manager')
      return
    }

    if (isRegister) {
      if (!nombre.trim()) {
        setError('Por favor escribí tu nombre completo')
        setLoading(false)
        return
      }
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nombre } }
      })
      if (signUpError) {
        setError(signUpError.message === 'User already registered'
          ? 'Ya existe una cuenta con ese email'
          : 'Error al crear cuenta. Verificá los datos.')
        setLoading(false)
        return
      }
      setMensaje('¡Cuenta creada! Revisá tu email para confirmar y luego ingresá.')
      setLoading(false)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }
    router.push('/home')
  }

  return (
    <main style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 28px', fontFamily: 'system-ui, sans-serif', color: '#f0f0f0',
      boxSizing: 'border-box', width: '100%'
    }}>

      {/* LOGO */}
      <div style={{ marginBottom: 36, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 110, height: 110, background: 'white', borderRadius: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', boxShadow: '0 0 40px rgba(163,230,53,0.15)',
        }}>
          <Image src="/logo.png" alt="Logo" width={100} height={100} style={{ objectFit: 'contain' }} />
        </div>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 26, margin: 0, letterSpacing: '-0.02em' }}>Pádel Mental App</h1>
          <p style={{ color: '#a3e635', fontSize: 13, margin: '4px 0 2px', fontWeight: 600 }}>By Ps. Mica Raffe</p>
          <p style={{ color: '#666', fontSize: 12, margin: 0 }}>Tu bitácora mental deportiva</p>
        </div>
      </div>

      {/* FORMULARIO */}
      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 12 }}>

        <p style={{ fontSize: 11, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>Ingresar como</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['player', 'manager'] as const).map(r => (
            <button key={r} onClick={() => setRole(r)} style={{
              flex: 1, padding: '10px 6px',
              background: role === r ? 'rgba(163,230,53,0.12)' : 'rgba(255,255,255,0.03)',
              border: role === r ? '1px solid rgba(163,230,53,0.4)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, color: role === r ? '#a3e635' : '#888',
              fontSize: 13, cursor: 'pointer', fontWeight: 600
            }}>
              {r === 'player' ? '🎾 Jugador' : '🧠 Psicóloga'}
            </button>
          ))}
        </div>

        {role === 'player' && (
          <div style={{ display: 'flex', gap: 8 }}>
            {[false, true].map(reg => (
              <button key={String(reg)} onClick={() => { setIsRegister(reg); setError(''); setMensaje('') }} style={{
                flex: 1, padding: '8px',
                background: 'transparent',
                border: 'none',
                borderBottom: isRegister === reg ? '2px solid #a3e635' : '2px solid transparent',
                color: isRegister === reg ? '#f0f0f0' : '#666',
                fontSize: 13, cursor: 'pointer', fontWeight: 600
              }}>
                {reg ? 'Crear cuenta' : 'Ingresar'}
              </button>
            ))}
          </div>
        )}

        {isRegister && role === 'player' && (
          <input value={nombre} onChange={e => setNombre(e.target.value)}
            placeholder="Tu nombre completo"
            style={inputStyle}
          />
        )}

        <input value={email} onChange={e => setEmail(e.target.value)}
          placeholder="tu@email.com" type="email"
          style={inputStyle}
        />

        <input value={password} onChange={e => setPassword(e.target.value)}
          placeholder="••••••••" type="password"
          style={inputStyle}
        />

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171' }}>
            {error}
          </div>
        )}

        {mensaje && (
          <div style={{ background: 'rgba(163,230,53,0.1)', border: '1px solid rgba(163,230,53,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#a3e635' }}>
            {mensaje}
          </div>
        )}

        <button onClick={handleLogin} disabled={loading} style={{
          background: loading ? '#333' : '#a3e635',
          color: loading ? '#888' : '#0a0a0a',
          border: 'none', borderRadius: 12, padding: 15,
          fontSize: 15, fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          width: '100%', transition: 'all 0.2s'
        }}>
          {loading ? 'Cargando...' : isRegister ? 'Crear cuenta →' : 'Ingresar →'}
        </button>

        <div style={{ textAlign: 'center', fontSize: 12, color: '#555' }}>
          ¿Olvidaste tu contraseña?{' '}
          <span style={{ color: '#a3e635', cursor: 'pointer' }}>Recuperar</span>
        </div>

      </div>
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10, padding: '13px 16px',
  color: '#f0f0f0', fontSize: 15, outline: 'none',
  width: '100%', boxSizing: 'border-box',
  fontFamily: 'system-ui, sans-serif',
}