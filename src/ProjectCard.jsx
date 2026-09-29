import { useRef, useState } from 'react'
import { getFocus } from './plan'
import { SWIPE_WIDTH, swipeAxis, swipeOffset, swipeSnap } from './swipe'

export default function ProjectCard({ task, onOpen, onComplete }) {
  const [offset, setOffset] = useState(0), [dragging, setDragging] = useState(false)
  const gesture = useRef(null), suppressClick = useRef(false)
  const focus = getFocus(task)
  const open = offset === -SWIPE_WIDTH
  const reset = () => { gesture.current = null; setDragging(false) }
  return <div className="project-swipe">
    <button className="project-finish" tabIndex={open ? 0 : -1} aria-hidden={!open} aria-label={`Zakończ projekt: ${task.title}`} onClick={onComplete}>✓<span>Zakończ</span></button>
    <div className={`project-swipe-front ${dragging ? 'is-dragging' : ''}`} style={{ transform: `translateX(${offset}px)` }}
      onPointerDown={e => {
        if (!e.isPrimary || e.button !== 0 || e.target.closest('.project-options')) return
        suppressClick.current = false
        gesture.current = { id: e.pointerId, x: e.clientX, y: e.clientY, initial: offset, offset, axis: null }
      }}
      onPointerMove={e => {
        const g = gesture.current
        if (!g || g.id !== e.pointerId) return
        const dx = e.clientX - g.x, dy = e.clientY - g.y
        g.axis ||= swipeAxis(dx, dy)
        if (g.axis !== 'x') return
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.setPointerCapture(e.pointerId)
        suppressClick.current = true; setDragging(true)
        g.offset = swipeOffset(g.initial, dx); setOffset(g.offset)
      }}
      onPointerUp={e => {
        const g = gesture.current
        if (!g || g.id !== e.pointerId) return
        if (g.axis === 'x') setOffset(swipeSnap(g.offset))
        if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
        reset()
      }}
      onPointerCancel={() => { if (gesture.current) setOffset(gesture.current.initial); reset() }}
      onKeyDown={e => { if (e.key === 'Escape') setOffset(0) }}>
      <button className="project-card" onClick={() => {
        if (suppressClick.current) { suppressClick.current = false; return }
        if (offset < 0) setOffset(0); else onOpen()
      }}><span><strong>{task.title}</strong><span>{focus.step?.title || (focus.complete ? 'Plan wykonany ✓' : 'Ułóż zadania w Planie')}</span></span></button>
      <button className="project-options" aria-label={`Opcje projektu: ${task.title}`} aria-expanded={open} onClick={() => { suppressClick.current = false; setOffset(open ? 0 : -SWIPE_WIDTH) }}>•••</button>
    </div>
  </div>
}
