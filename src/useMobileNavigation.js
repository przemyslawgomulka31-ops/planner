import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { keyboardVisible, readRoute, routeHash, viewKey } from './mobileNavigation'

export function useNavigation() {
  const [view, setView] = useState(() => readRoute(window.location.hash))
  const current = useRef(view), positions = useRef(new Map())
  useEffect(() => {
    const previous = history.scrollRestoration
    history.scrollRestoration = 'manual'
    const changed = () => {
      const next = readRoute(window.location.hash)
      if (viewKey(next) === viewKey(current.current)) return
      positions.current.set(viewKey(current.current), window.scrollY)
      document.activeElement?.blur?.()
      current.current = next; setView(next)
    }
    window.addEventListener('hashchange', changed)
    return () => { window.removeEventListener('hashchange', changed); history.scrollRestoration = previous }
  }, [])
  useLayoutEffect(() => { window.scrollTo({ top: positions.current.get(viewKey(view)) || 0, behavior: 'instant' }) }, [view])
  const nav = next => {
    if (viewKey(next) === viewKey(current.current)) return
    positions.current.set(viewKey(current.current), window.scrollY)
    document.activeElement?.blur?.()
    history.pushState(null, '', routeHash(next))
    current.current = next; setView(next)
  }
  return [view, nav]
}

export function useMobileKeyboard() {
  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return
    let frame
    const update = () => {
      const editing = document.activeElement?.matches('input:not([type=checkbox]):not([type=radio]):not([type=file]),textarea,[contenteditable=true]') || false
      document.documentElement.dataset.keyboard = String(keyboardVisible({ layoutHeight: window.innerHeight, viewportHeight: viewport.height, scale: viewport.scale, editing }))
    }
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update) }
    viewport.addEventListener('resize', schedule)
    document.addEventListener('focusin', schedule); document.addEventListener('focusout', schedule)
    update()
    return () => {
      cancelAnimationFrame(frame); viewport.removeEventListener('resize', schedule)
      document.removeEventListener('focusin', schedule); document.removeEventListener('focusout', schedule)
      delete document.documentElement.dataset.keyboard
    }
  }, [])
}
