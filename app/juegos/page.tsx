'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

type RankingItem = {
  nombre: string
  puntaje: number
  esYo: boolean
}

export default function JuegosPage() {
  const router = useRouter()
  const [vista, setVista] = useState<'menu' | 'reaccion' | 'diferente'>('menu')
  const [userId, setUserId] = useState('')
  const [mejorReaccion, setMejorReaccion] = useState<number | null>(null)
  const [mejorDiferente, setMejorDiferente] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    setUserId(user.id)

    const { data: reaccion } = await supabase
      .from('juegos_resultados').select('puntaje')
      .eq('user_id', user.id).eq('juego', 'reaccion')
      .order('puntaje', { ascending: true }).limit(1).single()
    if (reaccion) setMejorReaccion(reaccion.puntaje)

    const { data: diferente } = await supabase
      .from('juegos_resultados').select('puntaje')
      .eq('user_id', user.id).eq('juego', 'diferente')
      .order('puntaje', { ascending: false }).limit(1).single()
    if (diferente) setMejorDiferente(diferente.puntaje)

    setLoading(false)
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a3e635', fontFamily: 'system-ui' }}>Cargando...</div>

  if (vista === 'reaccion') return <JuegoReaccion userId={userId} onSalir={() => { setVista('menu'); cargar() }} />
  if (vista === 'diferente') return <JuegoDiferente userId={userId} onSalir={() => { setVista('menu'); cargar() }} />

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
          <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 4 }}>🧠 Juegos mentales</div>
          <div style={{ fontSize: 13, color: '#666' }}>Calentá la mente antes de jugar</div>
        </div>

        <div onClick={() => setVista('reaccion')} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12, cursor: 'pointer' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(163,230,53,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>⚡</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Tiempo de reacción</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>Tocá apenas aparezca el punto</div>
            {mejorReaccion !== null && (
              <div style={{ fontSize: 11, color: '#a3e635', marginTop: 4, fontWeight: 600 }}>Tu mejor: {mejorReaccion} ms</div>
            )}
          </div>
          <div style={{ color: '#666', fontSize: 16 }}>→</div>
        </div>

        <div onClick={() => setVista('diferente')} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, cursor: 'pointer' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(250,204,21,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🎯</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Encontrá el diferente</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>Atención bajo presión, 30 segundos</div>
            {mejorDiferente !== null && (
              <div style={{ fontSize: 11, color: '#facc15', marginTop: 4, fontWeight: 600 }}>Tu mejor: {mejorDiferente} aciertos</div>
            )}
          </div>
          <div style={{ color: '#666', fontSize: 16 }}>→</div>
        </div>

        <RankingSection userId={userId} />
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

function RankingSection({ userId }: { userId: string }) {
  const [tab, setTab] = useState<'reaccion' | 'diferente'>('reaccion')
  const [ranking, setRanking] = useState<RankingItem[]>([])
  const [mostrarEnRanking, setMostrarEnRanking] = useState(false)
  const [cargandoRanking, setCargandoRanking] = useState(true)

  useEffect(() => { cargarRanking() }, [tab])

  async function cargarRanking() {
    setCargandoRanking(true)
    const { data: perfil } = await supabase.from('profiles').select('mostrar_en_ranking').eq('id', userId).single()
    setMostrarEnRanking(perfil?.mostrar_en_ranking || false)

    const ascending = tab === 'reaccion'
    const { data: resultados } = await supabase
      .from('juegos_resultados')
      .select('puntaje, user_id, profiles(nombre, mostrar_en_ranking)')
      .eq('juego', tab)
      .order('puntaje', { ascending })

    if (resultados) {
      const mejoresPorUsuario = new Map<string, any>()
      resultados.forEach((r: any) => {
        const actual = mejoresPorUsuario.get(r.user_id)
        if (!actual || (ascending ? r.puntaje < actual.puntaje : r.puntaje > actual.puntaje)) {
          mejoresPorUsuario.set(r.user_id, r)
        }
      })
      const lista = Array.from(mejoresPorUsuario.values())
        .sort((a, b) => ascending ? a.puntaje - b.puntaje : b.puntaje - a.puntaje)
        .slice(0, 10)
        .map((r: any) => ({
          nombre: r.profiles?.mostrar_en_ranking ? r.profiles.nombre : 'Jugador anónimo',
          puntaje: r.puntaje,
          esYo: r.user_id === userId,
        }))
      setRanking(lista)
    }
    setCargandoRanking(false)
  }

  async function toggleMostrar() {
    const nuevo = !mostrarEnRanking
    await supabase.from('profiles').update({ mostrar_en_ranking: nuevo }).eq('id', userId)
    setMostrarEnRanking(nuevo)
    cargarRanking()
  }

  return (
    <div>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>🏆 Ranking de jugadores</div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={() => setTab('reaccion')} style={{ flex: 1, padding: '8px', background: tab === 'reaccion' ? 'rgba(163,230,53,0.12)' : 'rgba(255,255,255,0.03)', border: tab === 'reaccion' ? '1px solid rgba(163,230,53,0.3)' : '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10, color: tab === 'reaccion' ? '#a3e635' : '#888', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>⚡ Reacción</button>
        <button onClick={() => setTab('diferente')} style={{ flex: 1, padding: '8px', background: tab === 'diferente' ? 'rgba(250,204,21,0.12)' : 'rgba(255,255,255,0.03)', border: tab === 'diferente' ? '1px solid rgba(250,204,21,0.3)' : '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10, color: tab === 'diferente' ? '#facc15' : '#888', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>🎯 Atención</button>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '8px 0', marginBottom: 12 }}>
        {cargandoRanking ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#555', fontSize: 13 }}>Cargando...</div>
        ) : ranking.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#555', fontSize: 13 }}>Todavía no hay resultados. ¡Sé el primero!</div>
        ) : (
          ranking.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: r.esYo ? 'rgba(163,230,53,0.06)' : 'transparent' }}>
              <div style={{ width: 22, fontSize: 13, fontWeight: 700, color: i === 0 ? '#facc15' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#666' }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
              </div>
              <div style={{ flex: 1, fontSize: 13, color: r.esYo ? '#a3e635' : '#ccc', fontWeight: r.esYo ? 700 : 400 }}>
                {r.nombre} {r.esYo ? '(vos)' : ''}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f0f0' }}>
                {tab === 'reaccion' ? `${r.puntaje} ms` : `${r.puntaje} ac.`}
              </div>
            </div>
          ))
        )}
      </div>

      <div onClick={toggleMostrar} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 16px', cursor: 'pointer' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Aparecer con mi nombre en el ranking</div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>Si no, aparecés como "Jugador anónimo"</div>
        </div>
        <div style={{ width: 40, height: 22, borderRadius: 11, background: mostrarEnRanking ? '#a3e635' : 'rgba(255,255,255,0.1)', position: 'relative', flexShrink: 0 }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: mostrarEnRanking ? 20 : 2, transition: 'left 0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}

function JuegoReaccion({ userId, onSalir }: { userId: string, onSalir: () => void }) {
  const [estado, setEstado] = useState<'esperando' | 'listo' | 'activo' | 'resultado' | 'muyrapido' | 'final'>('esperando')
  const [tiempo, setTiempo] = useState<number | null>(null)
  const [intentos, setIntentos] = useState<number[]>([])
  const inicioRef = useRef<number>(0)
  const timeoutRef = useRef<any>(null)

  function empezar() {
    setEstado('listo')
    const delay = 1500 + Math.random() * 2500
    timeoutRef.current = setTimeout(() => {
      inicioRef.current = Date.now()
      setEstado('activo')
    }, delay)
  }

  function reiniciarTodo() {
    setIntentos([])
    setTiempo(null)
    empezar()
  }

  function tocar() {
    if (estado === 'listo') {
      clearTimeout(timeoutRef.current)
      setEstado('muyrapido')
      return
    }
    if (estado === 'activo') {
      const ms = Date.now() - inicioRef.current
      setTiempo(ms)
      const nuevosIntentos = [...intentos, ms]
      setIntentos(nuevosIntentos)

      if (nuevosIntentos.length >= 3) {
        const promedio = Math.round(nuevosIntentos.reduce((a, b) => a + b, 0) / nuevosIntentos.length)
        setEstado('final')
        supabase.from('juegos_resultados').insert({ user_id: userId, juego: 'reaccion', puntaje: promedio })
      } else {
        setEstado('resultado')
      }
    }
  }

  const promedioFinal = intentos.length === 3 ? Math.round(intentos.reduce((a, b) => a + b, 0) / 3) : null

  return (
    <main style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#f0f0f0', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 12px' }}>
        <div onClick={onSalir} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(163,230,53,0.15)', border: '1.5px solid rgba(163,230,53,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer', color: '#a3e635' }}>←</div>
        <div style={{ fontWeight: 700, fontSize: 14 }}>⚡ Tiempo de reacción</div>
        <div style={{ width: 32, textAlign: 'right', fontSize: 12, color: '#888' }}>{estado !== 'esperando' && estado !== 'final' ? `${intentos.length}/3` : ''}</div>
      </div>

      <div onClick={estado === 'esperando' || estado === 'resultado' || estado === 'muyrapido' || estado === 'final' ? undefined : tocar}
        style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16,
          background: estado === 'activo' ? '#a3e635' : estado === 'listo' ? '#1a1a1a' : 'transparent',
          cursor: estado === 'listo' || estado === 'activo' ? 'pointer' : 'default', transition: 'background 0.1s'
        }}>
        {estado === 'esperando' && (
          <>
            <div style={{ fontSize: 50 }}>⚡</div>
            <div style={{ fontSize: 15, color: '#888', textAlign: 'center', padding: '0 40px' }}>Tocá el botón y esperá a que la pantalla se vuelva verde. Tenés 3 intentos.</div>
            <button onClick={reiniciarTodo} style={{ background: '#a3e635', color: '#0a0a0a', border: 'none', borderRadius: 14, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 10 }}>Empezar</button>
          </>
        )}
        {estado === 'listo' && (
          <div style={{ fontSize: 18, color: '#888' }}>Esperá... (intento {intentos.length + 1}/3)</div>
        )}
        {estado === 'activo' && (
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0a0a0a' }}>¡TOCÁ AHORA!</div>
        )}
        {estado === 'muyrapido' && (
          <>
            <div style={{ fontSize: 40 }}>😅</div>
            <div style={{ fontSize: 16, color: '#f87171' }}>Muy rápido, esperá al verde</div>
            <button onClick={empezar} style={{ background: '#a3e635', color: '#0a0a0a', border: 'none', borderRadius: 14, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 10 }}>Reintentar</button>
          </>
        )}
        {estado === 'resultado' && (
          <>
            <div style={{ fontSize: 40 }}>🎯</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#a3e635' }}>{tiempo} ms</div>
            <div style={{ fontSize: 13, color: '#888' }}>Intento {intentos.length}/3</div>
            <button onClick={empezar} style={{ background: '#a3e635', color: '#0a0a0a', border: 'none', borderRadius: 14, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 10 }}>Siguiente intento</button>
          </>
        )}
        {estado === 'final' && (
          <>
            <div style={{ fontSize: 40 }}>🏁</div>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>Promedio de tus 3 intentos</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#a3e635' }}>{promedioFinal} ms</div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
              {promedioFinal! < 250 ? '¡Reflejos de élite!' : promedioFinal! < 350 ? 'Muy buen tiempo' : promedioFinal! < 450 ? 'Buen tiempo' : 'Seguí practicando'}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              {intentos.map((t, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: '#888' }}>{t} ms</div>
              ))}
            </div>
            <button onClick={reiniciarTodo} style={{ background: '#a3e635', color: '#0a0a0a', border: 'none', borderRadius: 14, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 16 }}>Jugar de nuevo</button>
            <button onClick={onSalir} style={{ background: 'transparent', color: '#666', border: 'none', padding: 10, fontSize: 13, cursor: 'pointer' }}>Volver</button>
          </>
        )}
      </div>
    </main>
  )
}

function JuegoDiferente({ userId, onSalir }: { userId: string, onSalir: () => void }) {
  const [estado, setEstado] = useState<'inicio' | 'jugando' | 'fin'>('inicio')
  const [aciertos, setAciertos] = useState(0)
  const [tiempoRestante, setTiempoRestante] = useState(30)
  const [posicionDiferente, setPosicionDiferente] = useState(0)
  const intervalRef = useRef<any>(null)

  const SIMBOLOS = ['🟢', '🔵', '🟡', '🟣']
  const [grilla, setGrilla] = useState<{ simbolo: string, rotado: boolean }[]>([])

  function generarGrilla() {
    const base = SIMBOLOS[Math.floor(Math.random() * SIMBOLOS.length)]
    const total = 16
    const dif = Math.floor(Math.random() * total)
    const nueva = Array.from({ length: total }).map((_, i) => ({
      simbolo: base, rotado: i === dif
    }))
    setGrilla(nueva)
    setPosicionDiferente(dif)
  }

  function empezar() {
  setAciertos(0)
  setTiempoRestante(30)
  generarGrilla()
  setEstado('jugando')
  if (intervalRef.current) clearInterval(intervalRef.current)
  intervalRef.current = setInterval(() => {
    setTiempoRestante(prev => {
      if (prev <= 1) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setEstado('fin')
        return 0
      }
      return prev - 1
    })
  }, 1000)
}

  function elegir(i: number) {
    if (estado !== 'jugando') return
    if (i === posicionDiferente) {
      setAciertos(prev => prev + 1)
      generarGrilla()
    }
  }

  useEffect(() => {
    if (estado === 'fin') {
      clearInterval(intervalRef.current)
      supabase.from('juegos_resultados').insert({ user_id: userId, juego: 'diferente', puntaje: aciertos })
    }
    return () => clearInterval(intervalRef.current)
  }, [estado])

  return (
    <main style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#f0f0f0', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 12px' }}>
        <div onClick={onSalir} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(163,230,53,0.15)', border: '1.5px solid rgba(163,230,53,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer', color: '#a3e635' }}>←</div>
        <div style={{ fontWeight: 700, fontSize: 14 }}>🎯 Encontrá el diferente</div>
        <div style={{ width: 32 }}></div>
      </div>

      <div style={{ padding: '0 20px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {estado === 'inicio' && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 50, marginBottom: 16 }}>🎯</div>
            <div style={{ fontSize: 15, color: '#888', marginBottom: 20, lineHeight: 1.6 }}>Uno de los símbolos está rotado de forma diferente. Encontralo lo más rápido posible. Tenés 30 segundos.</div>
            <button onClick={empezar} style={{ background: '#facc15', color: '#0a0a0a', border: 'none', borderRadius: 14, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Empezar</button>
          </div>
        )}

        {estado === 'jugando' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 20 }}>
              <div style={{ fontSize: 14, color: '#facc15', fontWeight: 700 }}>⏱ {tiempoRestante}s</div>
              <div style={{ fontSize: 14, color: '#a3e635', fontWeight: 700 }}>✓ {aciertos}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, width: '100%' }}>
              {grilla.map((item, i) => (
                <div key={i} onClick={() => elegir(i)} style={{
                  aspectRatio: '1', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)',
                  borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  fontSize: 28, transform: item.rotado ? 'rotate(45deg)' : 'none'
                }}>{item.simbolo}</div>
              ))}
            </div>
          </>
        )}

        {estado === 'fin' && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏁</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#facc15' }}>{aciertos} aciertos</div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 8, marginBottom: 20 }}>
              {aciertos >= 12 ? '¡Atención de élite!' : aciertos >= 8 ? 'Muy buena atención' : aciertos >= 5 ? 'Buena atención' : 'Seguí practicando'}
            </div>
            <button onClick={empezar} style={{ background: '#facc15', color: '#0a0a0a', border: 'none', borderRadius: 14, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Jugar de nuevo</button>
            <button onClick={onSalir} style={{ background: 'transparent', color: '#666', border: 'none', padding: 12, fontSize: 13, cursor: 'pointer', display: 'block', margin: '0 auto' }}>Volver</button>
          </div>
        )}
      </div>
    </main>
  )
}