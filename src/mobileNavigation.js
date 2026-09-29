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
