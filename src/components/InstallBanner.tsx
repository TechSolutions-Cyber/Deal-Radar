'use client'

import { useEffect, useState } from 'react'

type InstallState = 'idle' | 'android' | 'ios' | 'dismissed'

// Extend window for the non-standard BeforeInstallPromptEvent
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
  interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
  }
}

export default function InstallBanner() {
  const [state, setState] = useState<InstallState>('idle')
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Don't show if already installed (standalone)
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if ((navigator as { standalone?: boolean }).standalone) return

    const dismissed = sessionStorage.getItem('pwa-banner-dismissed')
    if (dismissed) return

    // Android/Chrome: listen for install prompt
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setState('android')
    }
    window.addEventListener('beforeinstallprompt', handler)

    // iOS Safari detection (no beforeinstallprompt)
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isSafari = /safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent)
    if (isIos && isSafari) {
      setState('ios')
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    sessionStorage.setItem('pwa-banner-dismissed', '1')
    setState('dismissed')
  }

  async function handleAndroidInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setState('dismissed')
    else dismiss()
    setDeferredPrompt(null)
  }

  if (state === 'idle' || state === 'dismissed') return null

  return (
    <div
      role="banner"
      className="fixed bottom-16 sm:bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 bg-[#2a2a3e] border border-white/10 rounded-2xl p-4 shadow-2xl flex items-start gap-3 animate-in slide-in-from-bottom-4 duration-300"
    >
      <span className="text-3xl flex-shrink-0">📡</span>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm">Deal Radar installieren</p>
        {state === 'android' && (
          <>
            <p className="text-gray-400 text-xs mt-0.5">Für schnelleren Zugriff auf dem Homescreen.</p>
            <button
              onClick={handleAndroidInstall}
              className="mt-2 text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              Installieren
            </button>
          </>
        )}
        {state === 'ios' && (
          <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">
            Tippe auf{' '}
            <span className="text-white">Teilen</span>{' '}
            und dann{' '}
            <span className="text-white">„Zum Home-Bildschirm"</span>.
          </p>
        )}
      </div>
      <button
        onClick={dismiss}
        className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0 -mt-1 -mr-1 p-1"
        aria-label="Schließen"
      >
        ✕
      </button>
    </div>
  )
}
