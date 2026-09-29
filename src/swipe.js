export const SWIPE_WIDTH = 108
export function swipeAxis(dx, dy) {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 12) return null
  return Math.abs(dx) > Math.abs(dy) * 1.25 ? 'x' : 'y'
}
export const swipeOffset = (start, dx) => Math.max(-SWIPE_WIDTH, Math.min(0, start + dx))
export const swipeSnap = offset => offset < -SWIPE_WIDTH / 2 ? -SWIPE_WIDTH : 0
