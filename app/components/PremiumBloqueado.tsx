'use client'

export default function PremiumBloqueado({ onSolicitar }: { onSolicitar?: () => void }) {
  return (
    <div style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.2)', borderRadius: 16, padding: 24, textAlign: 'center', margin: '16px 0' }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>⭐</div>
      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Contenido Premium</div>
      <div style={{ fontSize: 13, color: '#888', lineHeight: 1.6, marginBottom: 16 }}>
        Esta sección es exclusiva para jugadores con acceso Premium. Pedile a Ps. Mica Raffe que te habilite el acceso.
      </div>
      {onSolicitar && (
        <button onClick={onSolicitar} style={{ background: '#facc15', color: '#0a0a0a', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          Solicitar acceso Premium
        </button>
      )}
    </div>
  )
}