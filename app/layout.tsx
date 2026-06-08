import type { Metadata } from 'next'
import './globals.css'
import InstalarPWA from './components/InstalarPWA'

export const metadata: Metadata = {
  title: 'Pádel Mental App',
  description: 'Tu bitácora mental deportiva — By Ps. Mica Raffe',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Pádel Mental" />
        <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(async function(OneSignal) {
              await OneSignal.init({
                appId: "${process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID}",
                notifyButton: { enable: false },
                allowLocalhostAsSecureOrigin: true,
              });
            });
          `
        }} />
      </head>
      <body style={{
        margin: 0, padding: 0, background: '#0a0a0a',
        display: 'flex', justifyContent: 'center', minHeight: '100vh',
      }}>
        <div style={{
          width: '100%', maxWidth: 390, minHeight: '100vh',
          position: 'relative',
          background: 'linear-gradient(180deg, #0a0a0a 0%, #0a1a0a 60%, #0d2e0d 100%)',
        }}>
          <InstalarPWA />
          {children}
          
        </div>
      </body>
    </html>
  )
}