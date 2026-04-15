'use client'

import { useEffect, useRef, useState } from 'react'

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>
  threshold?: number
}

export function usePullToRefresh({ onRefresh, threshold = 72 }: UsePullToRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY = useRef<number | null>(null)

  useEffect(() => {
    const el = document.scrollingElement ?? document.documentElement

    function onTouchStart(e: TouchEvent) {
      if (el.scrollTop > 0) return
      startY.current = e.touches[0].clientY
      setIsPulling(true)
    }

    function onTouchMove(e: TouchEvent) {
      if (startY.current === null || el.scrollTop > 0) return
      const dy = Math.max(0, e.touches[0].clientY - startY.current)
      const clamped = Math.min(dy * 0.5, threshold * 1.5)
      setPullDistance(clamped)
      if (dy > 0) e.preventDefault()
    }

    function onTouchEnd() {
      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true)
        onRefresh().finally(() => {
          setIsRefreshing(false)
          setPullDistance(0)
        })
      } else {
        setPullDistance(0)
      }
      startY.current = null
      setIsPulling(false)
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [onRefresh, threshold, pullDistance, isRefreshing])

  return { isPulling, pullDistance, isRefreshing }
}
