import { useState } from 'react'

export default function StepDiscussion({ value, onSave }) {
  const [editing, setEditing] = useState(false)
  if (editing) return <form className="discussion-editor" onSubmit={e => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))
    if (!data.text.trim()) return
    onSave({ ...value, text: data.text.trim(), next: data.next.trim(), resolved: value?.resolved || false, updatedAt: new Date().toISOString() })
    setEditing(false)
  }}>
    <label>Problem / niewiadoma<textarea autoFocus name="text" defaultValue={value?.text || ''} placeholder="Co pozostało do omówienia?" required rows="3"/></label>
    <label>Co dalej z tym zrobić?<textarea name="next" defaultValue={value?.next || ''} placeholder="Np. omówić z Tomkiem na spotkaniu w piątek" rows="2"/></label>
    <div className="note-actions"><button className="secondary">Zapisz problem</button><button className="text-button" type="button" onClick={() => setEditing(false)}>Anuluj</button></div>
  </form>
  if (!value) return <button className="text-button discussion-add" onClick={() => setEditing(true)}>+ Problem do omówienia</button>
  return <div className={`task-discussion ${value.resolved ? 'discussion-resolved' : ''}`}>
    <strong>{value.resolved ? '✓ Problem rozwiązany' : '! Do omówienia'}</strong>
    <p>{value.text}</p><p className="discussion-next"><b>Co dalej:</b> {value.next || 'Do ustalenia'}</p>
    <div className="note-actions"><button className="text-button" onClick={() => setEditing(true)}>Edytuj</button><button className="text-button" onClick={() => onSave({ ...value, resolved: !value.resolved, resolvedAt: value.resolved ? null : new Date().toISOString() })}>{value.resolved ? 'Otwórz ponownie' : 'Rozwiązane ✓'}</button></div>
  </div>
}
