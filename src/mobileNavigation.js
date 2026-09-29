export const viewKey = view => [view.name, view.id || '', view.parentId || ''].join(':')
export function readRoute(hash) {
  try {
    const [name, id, parentId] = hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent)
    if (!['home', 'task', 'form', 'import', 'archive', 'trash'].includes(name)) return { name: 'home' }
    if (name === 'task' && !id) return { name: 'home' }
    return { name, ...(id ? { id } : {}), ...(parentId ? { parentId } : {}) }
  } catch { return { name: 'home' } }
}
export const routeHash = view => '#/' + [view.name, view.id || '', view.parentId || ''].map(encodeURIComponent).join('/').replace(/\/+$/, '')
export const keyboardVisible = ({ layoutHeight, viewportHeight, scale, editing }) => editing && Math.abs(scale - 1) < 0.05 && layoutHeight - viewportHeight > 150

// Visual viewport coordinates are relative to the layout viewport used by fixed bars.
// Ignore pinch zoom and the keyboard instead of chasing their changing bounds.
export function visibleBottom({ height, offsetTop = 0, scale = 1, keyboard = false }) {
  if (keyboard || Math.abs(scale - 1) > 0.05 || !Number.isFinite(height) || height <= 0) return null
  return Math.round(height + Math.max(0, offsetTop))
}
