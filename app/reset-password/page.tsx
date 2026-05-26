'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  async function handleReset() {
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError('Error al actualizar la contraseña. Pedí un nuevo link.')
    } else {
      setMensaje('¡Contraseña actualizada! Ya podés ingresar.')
      setTimeout(() => router.push('/'), 2000)
    }
    setLoading(false)
  }

  return (
    <main style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 28px', fontFamily: 'system-ui, sans-serif',
      color: '#f0f0f0', width: '100%', boxSizing: 'border-box'
    }}>
      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 12 }}>

        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{ fontWeight: 800, fontSize: 22 }}>Nueva contraseña</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Escribí tu nueva contraseña</div>
        </div>

        <input value={password} onChange={e => setPassword(e.target.value)}
          type="password" placeholder="Nueva contraseña"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '13px 16px', color: '#f0f0f0', fontSize: 15, outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'system-ui' }}
        />

        <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
          type="password" placeholder="Confirmá la contraseña"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '13px 16px', color: '#f0f0f0', fontSize: 15, outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'system-ui' }}
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

        <button onClick={handleReset} disabled={loading} style={{
          background: loading ? '#333' : '#a3e635',
          color: loading ? '#888' : '#0a0a0a',
          border: 'none', borderRadius: 12, padding: 15,
          fontSize: 15, fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer', width: '100%'
        }}>
          {loading ? 'Actualizando...' : 'Actualizar contraseña'}
        </button>

      </div>
    </main>
  )
}