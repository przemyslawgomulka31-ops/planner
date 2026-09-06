import { useState } from 'react'

const kinds = { problem: 'Problem', note: 'Uwaga', decision: 'Ustalenie' }

export default function PlanNotes({ entries = [], onSave, scope }) {
  const [editing, setEditing] = useState(null)
  const [notice, setNotice] = useState('')
  const unresolved = entries.filter(entry => entry.kind === 'problem' && !entry.resolved).length
  function save(e) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))
    const text = data.text.trim()
    if (!text) return
    const date = new Date().toISOString()
    if (editing) {
      onSave(entries.map(entry => entry.id === editing ? { ...entry, text, updatedAt: date } : entry))
      setEditing(null)
    } else {
      onSave([...entries, { id: crypto.randomUUID(), kind: data.kind, text, createdAt: date, resolved: false }])
      e.currentTarget.reset()
    }
    setNotice('Zapisano')
  }
  return <details className="plan-notes">
    <summary>Problemy i uwagi{entries.length > 0 && <span>{unresolved ? `Do rozwiązania: ${unresolved}` : entries.length}</span>}</summary>
    <div className="note-list">
      {entries.map(entry => <article className={`plan-note ${entry.resolved ? 'resolved-note' : ''}`} key={entry.id}>
        <div className="note-meta"><strong>{kinds[entry.kind] || 'Uwaga'}{entry.kind === 'problem' && (entry.resolved ? ' · rozwiązany' : ' · otwarty')}</strong><time dateTime={entry.createdAt}>{new Date(entry.createdAt).toLocaleDateString('pl-PL')}</time></div>
        {editing === entry.id ? <form onSubmit={save}><textarea name="text" aria-label={`Edytuj wpis: ${scope}`} defaultValue={entry.text} rows="3" required autoFocus/><div className="note-actions"><button className="secondary">Zapisz</button><button className="text-button" type="button" onClick={() => setEditing(null)}>Anuluj</button></div></form> : <>
          <p>{entry.text}</p>
          <div className="note-actions">
            {entry.kind === 'problem' && <button className="text-button" onClick={() => onSave(entries.map(x => x.id === entry.id ? { ...x, resolved: !x.resolved, resolvedAt: x.resolved ? null : new Date().toISOString() } : x))}>{entry.resolved ? 'Otwórz ponownie' : 'Oznacz jako rozwiązany'}</button>}
            <button className="text-button" onClick={() => { setEditing(entry.id); setNotice('') }}>Edytuj</button>
            <button className="text-button" onClick={() => { if (confirm('Usunąć ten wpis?')) onSave(entries.filter(x => x.id !== entry.id)) }}>Usuń</button>
          </div>
        </>}
      </article>)}
    </div>
    {!editing && <form className="new-plan-note" onSubmit={save}>
      <label>Rodzaj wpisu<select name="kind" defaultValue="problem">{Object.entries(kinds).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label>
      <textarea name="text" aria-label={`Treść wpisu: ${scope}`} placeholder="Co warto zapisać?" rows="3" required/>
      <button className="secondary">Dodaj wpis</button>
    </form>}
    {notice && <p className="note-saved" role="status">{notice}</p>}
  </details>
}
