'use client'
import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

const SIMBOLOS = ['🟢', '🔵', '🟡', '🟣']
const TOTAL_GRILLAS = 20

export default function JuegoDiferente({ userId, onSalir }: { userId: string, onSalir: () => void }) {
  const [fase, setFase] = useState<'inicio' | 'jugando' | 'fin'>('inicio')
  const [aciertos, setAciertos] = useState(0)
  const [grilla, setGrilla] = useState<string[]>([])
  const [objetivo, setObjetivo] = useState(0)
  const inicioRef = useRef<number>(0)
  const [tiempoFinal, setTiempoFinal] = useState<number | null>(null)
  const aciertosRef = useRef(0)

  function nuevaGrilla() {
    const base = SIMBOLOS[Math.floor(Math.random() * SIMBOLOS.length)]
    const items = Array(16).fill(base)
    const pos = Math.floor(Math.random() * 16)
    items[pos] = base + '_rot'
    setGrilla(items)
    setObjetivo(pos)
  }

  function empezar() {
    aciertosRef.current = 0
    setAciertos(0)
    setTiempoFinal(null)
    inicioRef.current = Date.now()
    nuevaGrilla()
    setFase('jugando')
  }

  function tocar(i: number) {
    if (fase !== 'jugando') return
    if (i !== objetivo) return
    const nuevosAciertos = aciertosRef.current + 1
    aciertosRef.current = nuevosAciertos
    setAciertos(nuevosAciertos)

    if (nuevosAciertos >= TOTAL_GRILLAS) {
      const tiempo = Math.round((Date.now() - inicioRef.current) / 1000)
      setTiempoFinal(tiempo)
      setFase('fin')
      supabase.from('juegos_resultados').insert({
        user_id: userId,
        juego: 'diferente',
        puntaje: tiempo
      }).then(({ error }) => console.log(error ? error.message : 'guardado OK'))
      return
    }
    nuevaGrilla()
  }

  if (fase === 'inicio') return (
    <main style={{ minHeight: '100vh', fontFamily: 'system-ui', color: '#f0f0f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 50, marginBottom: 16 }}>🎯</div>
      <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Encontrá el diferente</div>
      <div style={{ fontSize: 14, color: '#888', marginBottom: 8, lineHeight: 1.6 }}>
        Uno de los símbolos está rotado. Encontrá los <span style={{ color: '#facc15', fontWeight: 700 }}>20 diferentes</span> lo más rápido posible.
      </div>
      <div style={{ fontSize: 13, color: '#666', marginBottom: 24 }}>Se mide tu tiempo total</div>
      <button onClick={empezar} style={{ background: '#facc15', color: '#0a0a0a', border: 'none', borderRadius: 14, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 12 }}>
        Empezar
      </button>
      <button onClick={onSalir} style={{ background: 'transparent', color: '#666', border: 'none', fontSize: 13, cursor: 'pointer' }}>Volver</button>
    </main>
  )

  if (fase === 'fin') return (
    <main style={{ minHeight: '100vh', fontFamily: 'system-ui', color: '#f0f0f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🏁</div>
      <div style={{ fontSize: 14, color: '#888', marginBottom: 4 }}>Completaste las 20 grillas en</div>
      <div style={{ fontSize: 52, fontWeight: 900, color: '#facc15', lineHeight: 1 }}>{tiempoFinal}s</div>
      <div style={{ fontSize: 13, color: '#888', marginTop: 8, marginBottom: 24 }}>
        {tiempoFinal! <= 15 ? '¡Atención de élite!' : tiempoFinal! <= 25 ? 'Muy buena atención' : tiempoFinal! <= 40 ? 'Buena atención' : 'Seguí practicando'}
      </div>
      <button onClick={empezar} style={{ background: '#facc15', color: '#0a0a0a', border: 'none', borderRadius: 14, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 12 }}>
        Jugar de nuevo
      </button>
      <button onClick={onSalir} style={{ background: 'rgba(250,204,21,0.1)', color: '#facc15', border: '1px solid rgba(250,204,21,0.3)', borderRadius: 12, padding: '12px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
        Ver mi ranking 🏆
      </button>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', fontFamily: 'system-ui', color: '#f0f0f0', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 12px' }}>
        <div onClick={() => { setFase('inicio'); onSalir() }} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(163,230,53,0.15)', border: '1.5px solid rgba(163,230,53,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer', color: '#a3e635' }}>←</div>
        <div style={{ fontWeight: 700, fontSize: 14 }}>🎯 Encontrá el diferente</div>
        <div style={{ width: 32 }}></div>
      </div>
      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
          <div style={{ fontSize: 14, color: '#888' }}>Grilla <span style={{ color: '#facc15', fontWeight: 700 }}>{aciertos + 1}</span> de {TOTAL_GRILLAS}</div>
          <div style={{ fontSize: 14, color: '#a3e635', fontWeight: 700 }}>✓ {aciertos}</div>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ height: '100%', width: `${(aciertos / TOTAL_GRILLAS) * 100}%`, background: '#facc15', borderRadius: 2, transition: 'width 0.2s' }}></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {grilla.map((item, i) => (
            <div key={i} onClick={() => tocar(i)} style={{
              aspectRatio: '1', background: 'rgba(255,255,255,0.04)',
              border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 28,
              transform: item.endsWith('_rot') ? 'rotate(45deg)' : 'none'
            }}>{item.replace('_rot', '')}</div>
          ))}
        </div>
      </div>
    </main>
  )
}