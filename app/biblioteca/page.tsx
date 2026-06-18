'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import PremiumBloqueado from '../components/PremiumBloqueado'

type Item = {
  id: string
  titulo: string
  descripcion: string
  tipo: string
  url: string
  tag: string
  created_at: string
}

const tipoConfig: Record<string, { icon: string, color: string }> = {
  'PDF': { icon: '📄', color: 'rgba(239,68,68,0.15)' },
  'Audio': { icon: '🎙️', color: 'rgba(168,85,247,0.15)' },
  'Ejercicio': { icon: '🧠', color: 'rgba(163,230,53,0.15)' },
  'Video': { icon: '🎥', color: 'rgba(59,130,246,0.15)' },
  'Artículo': { icon: '📝', color: 'rgba(251,146,60,0.15)' },
}

const tags = ['Todos', 'Torneos', 'Activación', 'Concentración', 'Confianza', 'Ansiedad', 'Motivación']

export default function BibliotecaPage() {
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])
  const [filtro, setFiltro] = useState('Todos')
  const [loading, setLoading] = useState(true)
  const [seleccionado, setSeleccionado] = useState<Item | null>(null)
  const [esPremium, setEsPremium] = useState(false)
  

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }

    const { data } = await supabase
      .from('biblioteca')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setItems(data)
    setLoading(false)
  const { data: perfil } = await supabase
  .from('profiles').select('es_premium').eq('id', user.id).single()
setEsPremium(perfil?.es_premium || false)
  }

  

  const itemsFiltrados = filtro === 'Todos'
    ? items
    : items.filter(i => i.tag === filtro)

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a3e635', fontFamily: 'system-ui, sans-serif' }}>
      Cargando...
    </div>
  )

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

      <div style={{ padding: '0 20px 100px' }}>

        <div style={{ paddingBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em' }}>Biblioteca Mental</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Contenido de tu psicóloga</div>
        </div>

        <div onClick={() => router.push('/juegos')} style={{ background: 'rgba(163,230,53,0.06)', border: '1px solid rgba(163,230,53,0.2)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', marginBottom: 16 }}>
  <div style={{ fontSize: 24 }}>🧠</div>
  <div style={{ flex: 1 }}>
    <div style={{ fontSize: 14, fontWeight: 700, color: '#a3e635' }}>Juegos mentales</div>
    <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>Entrená reacción y atención</div>
  </div>
  <div style={{ color: '#a3e635', fontSize: 16 }}>→</div>
</div>

        {/* FILTROS */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16, marginBottom: 4 }}>
          {tags.map(tag => (
            <button key={tag} onClick={() => setFiltro(tag)} style={{
              flexShrink: 0,
              padding: '7px 14px',
              background: filtro === tag ? 'rgba(163,230,53,0.12)' : 'rgba(255,255,255,0.03)',
              border: filtro === tag ? '1px solid rgba(163,230,53,0.4)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, color: filtro === tag ? '#a3e635' : '#888',
              fontSize: 12, cursor: 'pointer', fontWeight: filtro === tag ? 700 : 400,
              whiteSpace: 'nowrap'
            }}>{tag}</button>
          ))}
        </div>

        {/* MODAL DETALLE */}
        {seleccionado && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
            onClick={() => setSeleccionado(null)}>
            <div onClick={e => e.stopPropagation()} style={{ background: '#111', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px', width: '100%', maxWidth: 390 }}>
              <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 20px' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 50, height: 50, borderRadius: 12, background: tipoConfig[seleccionado.tipo]?.color || 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                  {tipoConfig[seleccionado.tipo]?.icon || '📄'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.3 }}>{seleccionado.titulo}</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{seleccionado.tipo}</div>
                </div>
              </div>
              {seleccionado.tag && (
                <div style={{ display: 'inline-block', background: 'rgba(163,230,53,0.1)', border: '1px solid rgba(163,230,53,0.2)', borderRadius: 20, fontSize: 11, color: '#a3e635', padding: '3px 10px', marginBottom: 12 }}>
                  {seleccionado.tag}
                </div>
              )}
              {seleccionado.descripcion && (
                <div style={{ fontSize: 14, lineHeight: 1.7, color: '#ccc', marginBottom: 20 }}>
                  {seleccionado.descripcion}
                </div>
              )}
              {seleccionado.url && (
                <a href={seleccionado.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', background: '#a3e635', color: '#0a0a0a', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>
                  Abrir contenido →
                </a>
              )}
              <button onClick={() => setSeleccionado(null)} style={{ width: '100%', background: 'transparent', color: '#666', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px', fontSize: 14, cursor: 'pointer', marginTop: 10 }}>
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* LISTA */}
{itemsFiltrados.length === 0 ? (
  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#555' }}>
    <div style={{ fontSize: 32, marginBottom: 12 }}>📚</div>
    <div style={{ fontSize: 14 }}>No hay contenido en esta categoría todavía.</div>
  </div>
) : (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    {(esPremium ? itemsFiltrados : itemsFiltrados.slice(0, 3)).map((item, i) => (
      <div key={i} onClick={() => setSeleccionado(item)} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start', cursor: 'pointer' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: tipoConfig[item.tipo]?.color || 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
          {tipoConfig[item.tipo]?.icon || '📄'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.4 }}>{item.titulo}</div>
          {item.descripcion && (
            <div style={{ fontSize: 12, color: '#888', marginTop: 4, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {item.descripcion}
            </div>
          )}
          <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 20, fontSize: 10, color: '#888', padding: '2px 8px' }}>{item.tipo}</div>
            {item.tag && <div style={{ background: 'rgba(163,230,53,0.08)', border: '0.5px solid rgba(163,230,53,0.2)', borderRadius: 20, fontSize: 10, color: '#a3e635', padding: '2px 8px' }}>{item.tag}</div>}
          </div>
        </div>
        <div style={{ color: '#666', fontSize: 16, flexShrink: 0 }}>→</div>
      </div>
    ))}
    {!esPremium && itemsFiltrados.length > 3 && (
      <PremiumBloqueado />
    )}
  </div>
)}

      </div>

      {/* BOTTOM NAV */}
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
    <span style={{ fontSize: 9, color: t.path === '/registrar' ? '#a3e635' : '#666' }}>{t.label}</span>
  </div>
))}
      </div>

    </main>
  )
}