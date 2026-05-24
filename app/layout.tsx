import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pádel Mental App',
  description: 'Tu bitácora mental deportiva — By Ps. Mica Raffe',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{
        margin: 0,
        padding: 0,
        background: '#0a0a0a',
        display: 'flex',
        justifyContent: 'center',
        minHeight: '100vh',
      }}>
        <div style={{
          width: '100%',
          maxWidth: 390,
          minHeight: '100vh',
          position: 'relative',
          background: 'linear-gradient(180deg, #0a0a0a 0%, #0a1a0a 60%, #0d2e0d 100%)',
        }}>
          {children}
        </div>
      </body>
    </html>
  )
}