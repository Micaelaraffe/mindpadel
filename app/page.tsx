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
  const [nivel, setNivel] = useState('Amateur')
const [categoria, setCategoria] = useState('4ta')
const [telefono, setTelefono] = useState('')
const [genero, setGenero] = useState('')
  const [aceptoTerminos, setAceptoTerminos] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [mostrarTerminos, setMostrarTerminos] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    setLoading(true)
    setError('')
    setMensaje('')

    if (role === 'manager') {
  if (email !== 'micaraffe@gmail.com') {
    setError('No tenés acceso al panel de psicóloga.')
    setLoading(false)
    return
  }
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
  if (signInError) {
    setError('Email o contraseña incorrectos')
    setLoading(false)
    return
  }
  router.push('/manager')
  return
}

    if (isRegister) {
      if (!nombre.trim()) {
        setError('Por favor escribí tu nombre completo')
        setLoading(false)
        return
      }
      if (!aceptoTerminos) {
        setError('Debés aceptar los términos para continuar')
        setLoading(false)
        return
      }
      const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { nombre } }
})
if (!signUpError && signUpData.user) {
  await supabase.from('profiles').upsert({
  id: signUpData.user.id,
  nombre,
  nivel,
  categoria,
  genero,
  telefono,
  role: 'player',
})
}
      if (signUpError) {
        setError(signUpError.message === 'User already registered'
          ? 'Ya existe una cuenta con ese email'
          : 'Error al crear cuenta. Verificá los datos.')
        setLoading(false)
        return
      }
      setMensaje('¡Cuenta creada! Ya podés ingresar con tu email y contraseña.')
      setLoading(false)
      setIsRegister(false)
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

      {/* MODAL TÉRMINOS */}
      {mostrarTerminos && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: '#111', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px', width: '100%', maxWidth: 390, maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 20px' }}></div>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 16 }}>Términos y Consentimiento</div>

            <div style={{ fontSize: 13, color: '#ccc', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ color: '#a3e635', fontWeight: 700, marginBottom: 4 }}>1. Responsable del tratamiento</div>
                <div>Ps. Micaela Raffe (@micaraffe.psi), psicóloga deportiva matriculada, es la responsable del tratamiento de los datos personales recopilados a través de esta aplicación.</div>
              </div>

              <div>
                <div style={{ color: '#a3e635', fontWeight: 700, marginBottom: 4 }}>2. Datos que se recopilan</div>
                <div>Se recopilan datos personales (nombre, email) y datos de rendimiento deportivo y emocional (registros de sesiones, valoraciones ZOR, emociones, pensamientos y aprendizajes).</div>
              </div>

              <div>
                <div style={{ color: '#a3e635', fontWeight: 700, marginBottom: 4 }}>3. Finalidad del uso</div>
                <div>Los datos se utilizan exclusivamente para el seguimiento del rendimiento mental deportivo en el marco del trabajo psicológico entre el/la jugador/a y la Ps. Micaela Raffe. No serán compartidos con terceros.</div>
              </div>

              <div>
                <div style={{ color: '#a3e635', fontWeight: 700, marginBottom: 4 }}>4. Almacenamiento</div>
                <div>Los datos se almacenan en servidores seguros de Supabase (São Paulo, Brasil) con cifrado y acceso restringido. Solo la psicóloga y el/la propio/a jugador/a pueden acceder a sus datos.</div>
              </div>

              <div>
                <div style={{ color: '#a3e635', fontWeight: 700, marginBottom: 4 }}>5. Derechos del usuario</div>
                <div>En cumplimiento de la Ley 25.326 de Protección de Datos Personales de la República Argentina, tenés derecho a acceder, rectificar y eliminar tus datos en cualquier momento. Para ejercer estos derechos contactá a: micaraffe@gmail.com</div>
              </div>

              <div>
                <div style={{ color: '#a3e635', fontWeight: 700, marginBottom: 4 }}>6. Consentimiento</div>
                <div>Al crear tu cuenta aceptás el tratamiento de tus datos personales para los fines descriptos, conforme a la Ley 25.326 y sus normas complementarias.</div>
              </div>
            </div>

            <button onClick={() => setMostrarTerminos(false)} style={{ width: '100%', background: '#a3e635', color: '#0a0a0a', border: 'none', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 24 }}>
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* LOGO */}
      <div style={{ marginBottom: 36, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 110, height: 110, background: 'white', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 0 40px rgba(163,230,53,0.15)' }}>
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
                flex: 1, padding: '8px', background: 'transparent', border: 'none',
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

{isRegister && role === 'player' && (
  <>
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Nivel</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {['Amateur', 'Profesional'].map(n => (
          <button key={n} type="button" onClick={() => setNivel(n)} style={{
            flex: 1, padding: '10px',
            background: nivel === n ? 'rgba(163,230,53,0.12)' : 'rgba(255,255,255,0.03)',
            border: nivel === n ? '1px solid rgba(163,230,53,0.4)' : '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, color: nivel === n ? '#a3e635' : '#888',
            fontSize: 13, cursor: 'pointer', fontWeight: 600
          }}>{n}</button>
        ))}
      </div>
    </div>

    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Categoría</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {['1ra', '2da', '3ra', '4ta', '5ta', '6ta', '7ma', '8va'].map(c => (
          <button key={c} type="button" onClick={() => setCategoria(c)} style={{
            padding: '10px 4px',
            background: categoria === c ? 'rgba(163,230,53,0.12)' : 'rgba(255,255,255,0.03)',
            border: categoria === c ? '1px solid rgba(163,230,53,0.4)' : '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, color: categoria === c ? '#a3e635' : '#888',
            fontSize: 13, cursor: 'pointer', fontWeight: 600
          }}>{c}</button>
        ))}
      </div>
    </div>
    <div style={{ marginBottom: 12 }}>
  <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Género</div>
  <div style={{ display: 'flex', gap: 8 }}>
    {['Hombre', 'Mujer', 'Otro'].map(g => (
      <button key={g} type="button" onClick={() => setGenero(g)} style={{
        flex: 1, padding: '10px',
        background: genero === g ? 'rgba(163,230,53,0.12)' : 'rgba(255,255,255,0.03)',
        border: genero === g ? '1px solid rgba(163,230,53,0.4)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10, color: genero === g ? '#a3e635' : '#888',
        fontSize: 13, cursor: 'pointer', fontWeight: 600
      }}>{g}</button>
    ))}
  </div>
</div>

<div style={{ marginBottom: 16 }}>
  <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Teléfono</div>
  <input value={telefono} onChange={e => setTelefono(e.target.value)}
    placeholder="Ej: +54 11 1234 5678"
    style={inputStyle}
  />
</div>
  </>
)}



        <input value={email} onChange={e => setEmail(e.target.value)}
          placeholder="tu@email.com" type="email"
          style={inputStyle}
        />

        <input value={password} onChange={e => setPassword(e.target.value)}
          placeholder="••••••••" type="password"
          style={inputStyle}
        />

        {/* CONSENTIMIENTO — solo al registrarse */}
        {isRegister && role === 'player' && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px' }}>
            <div onClick={() => setAceptoTerminos(!aceptoTerminos)} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
              <div style={{
                width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
                background: aceptoTerminos ? '#a3e635' : 'transparent',
                border: aceptoTerminos ? '2px solid #a3e635' : '2px solid rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s'
              }}>
                {aceptoTerminos && <span style={{ color: '#0a0a0a', fontSize: 13, fontWeight: 800 }}>✓</span>}
              </div>
              <div style={{ fontSize: 12, color: '#ccc', lineHeight: 1.6 }}>
                Acepto que mis datos personales y de rendimiento deportivo sean tratados por Ps. Mica Raffe con fines de seguimiento psicológico, conforme a la{' '}
                <span onClick={e => { e.stopPropagation(); setMostrarTerminos(true) }} style={{ color: '#a3e635', textDecoration: 'underline', cursor: 'pointer' }}>
                  Ley 25.326 de Protección de Datos Personales
                </span>.
              </div>
            </div>
          </div>
        )}

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
  <span onClick={async () => {
    if (!email) {
      setError('Escribí tu email arriba primero')
      return
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://mindpadel.vercel.app/reset-password',
    })
    if (error) {
      setError('Error al enviar el email. Verificá que el email sea correcto.')
    } else {
      setMensaje('Te enviamos un email para recuperar tu contraseña. Revisá tu casilla.')
    }
  }} style={{ color: '#a3e635', cursor: 'pointer', textDecoration: 'underline' }}>
    Recuperar
  </span>
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