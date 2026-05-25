'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { Suspense } from 'react'

type Registro = {
  id: string
  tipo: string
  resultado: string
  emocion: string
  concentracion: number
  activacion: number
  confianza: number
  desafio: number
  motivacion: number
  frustracion: number
  pensamientos: string
  frase_ayudo: string
  aprendizajes: string
  created_at: string
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

function BarZor({ label, value }: { label: string, value: number }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: '#f0f0f0' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#a3e635' }}>{value}/10</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value * 10}%`, background: '#a3e635', borderRadius: 3, transition: 'width 0.8s ease' }}></div>
      </div>
    </div>
  )
}

function RegistroDetalle() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [registro, setRegistro] = useState<Registro | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) loadRegistro(id)
  }, [id])

  async function loadRegistro(registroId: string) {
    const { data } = await supabase
      .from('registros')
      .select('*')
      .eq('id', registroId)
      .single()
    if (data) setRegistro(data)
    setLoading(false)
  }

  function formatFecha(fecha: string) {
    return new Date(fecha).toLocaleDateString('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  function iconTipo(tipo: string) {
    if (tipo === 'Partido amistoso') return '🏆'
    if (tipo === 'Torneo') return '🥇'
    return '🎾'
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a3e635', fontFamily: 'system-ui, sans-serif' }}>
      Cargando...
    </div>
  )

  if (!registro) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontFamily: 'system-ui, sans-serif', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 32 }}>😕</div>
      <div>Registro no encontrado</div>
      <button onClick={() => router.push('/home')} style={{ background: '#a3e635', color: '#0a0a0a', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}>Volver</button>
    </div>
  )

  const emociones = registro.emocion ? registro.emocion.split(', ') : []
const rendimiento = Number(registro.resultado) || 0
  return (
    <main style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#f0f0f0', width: '100%' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 12px' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Pádel Mental App</div>
          <div style={{ fontSize: 9, color: '#a3e635', letterSpacing: '0.1em' }}>By Ps. Mica Raffe</div>
        </div>
        <div onClick={() => router.push('/home')} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(163,230,53,0.15)', border: '1.5px solid rgba(163,230,53,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer', color: '#a3e635' }}>←</div>
      </div>

      <div style={{ padding: '0 20px 40px' }}>

        {/* TÍTULO Y FECHA */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 28 }}>{iconTipo(registro.tipo)}</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em' }}>{registro.tipo}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2, textTransform: 'capitalize' }}>{formatFecha(registro.created_at)}</div>
            </div>
          </div>
        </div>

        {/* RENDIMIENTO */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>📊 Rendimiento percibido</div>
            <div style={{ fontSize: 13, color: colorRendimiento(rendimiento), fontWeight: 600 }}>{labelRendimiento(rendimiento)}</div>
          </div>
<div style={{ fontWeight: 900, fontSize: 48, color: colorRendimiento(rendimiento), lineHeight: 1 }}>{rendimiento > 0 ? rendimiento : '—'}</div>        </div>

        {/* EMOCIONES */}
        {emociones.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Emociones</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {emociones.map((e, i) => (
                <div key={i} style={{ background: 'rgba(163,230,53,0.1)', border: '1px solid rgba(163,230,53,0.25)', borderRadius: 20, padding: '5px 12px', fontSize: 13, color: '#a3e635', fontWeight: 500 }}>
                  {e}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ZOR */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#a3e635', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16, fontWeight: 700 }}>⚡ ZOR — Zona Óptima de Rendimiento</div>
          <BarZor label="Concentración" value={registro.concentracion} />
          <BarZor label="Activación" value={registro.activacion} />
          <BarZor label="Confianza" value={registro.confianza} />
          <BarZor label="Desafío percibido" value={registro.desafio} />
          <BarZor label="Motivación" value={registro.motivacion} />
          <BarZor label="Frustración" value={registro.frustracion} />
        </div>

        {/* PENSAMIENTOS */}
        {registro.pensamientos && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Pensamientos sobre tu juego</div>
            <div style={{ fontSize: 14, lineHeight: 1.6, color: '#f0f0f0' }}>{registro.pensamientos}</div>
          </div>
        )}

        {/* FRASE */}
        {registro.frase_ayudo && (
          <div style={{ background: 'rgba(163,230,53,0.06)', border: '1px solid rgba(163,230,53,0.2)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: '#a3e635', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontWeight: 700 }}>✦ Frase que te ayudó hoy</div>
            <div style={{ fontSize: 15, lineHeight: 1.6, color: '#f0f0f0', fontStyle: 'italic' }}>"{registro.frase_ayudo}"</div>
          </div>
        )}

        {/* APRENDIZAJES */}
        {registro.aprendizajes && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>💡 Aprendizajes</div>
            <div style={{ fontSize: 14, lineHeight: 1.6, color: '#f0f0f0' }}>{registro.aprendizajes}</div>
          </div>
        )}

        <button onClick={() => router.push('/home')} style={{
          width: '100%', background: 'rgba(255,255,255,0.05)', color: '#f0f0f0',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 15,
          fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8
        }}>
          ← Volver al inicio
        </button>

      </div>
    </main>
  )
}

export default function RegistroPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a3e635', fontFamily: 'system-ui' }}>Cargando...</div>}>
      <RegistroDetalle />
    </Suspense>
  )
}