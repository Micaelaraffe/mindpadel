'use client'
import { useEffect } from 'react'

declare global {
  interface Window {
    OneSignalDeferred: any[]
  }
}

export default function OneSignalInit() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    window.OneSignalDeferred = window.OneSignalDeferred || []
    window.OneSignalDeferred.push(async function(OneSignal: any) {
      await OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || '',
        notifyButton: { enable: false },
        allowLocalhostAsSecureOrigin: true,
        promptOptions: {
          slidedown: {
            prompts: [
              {
                type: 'push',
                autoPrompt: true,
                text: {
                  actionMessage: '🎾 Activá las notificaciones ayudarte a mantener tu progreso',
                  acceptButton: '¡Activar!',
                  cancelButton: 'Más tarde',
                },
                delay: {
                  pageViews: 1,
                  timeDelay: 3,
                }
              }
            ]
          }
        }
      })
    })

    const script = document.createElement('script')
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'
    script.defer = true
    document.head.appendChild(script)
  }, [])

  return null
}