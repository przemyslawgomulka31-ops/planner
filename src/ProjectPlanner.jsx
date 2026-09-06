import { useState } from 'react'

export default function ProjectPlanner({ task, onPatch, onComplete, children }) {
  const [tab, setTab] = useState('now')
  const [editing, setEditing] = useState(false)
  const [justDone, setJustDone] = useState(false)
  const milestones = task.milestones || []
  const saveStep = e => {
    e.preventDefault()
    const text = new FormData(e.currentTarget).get('step').trim()
    if (!text) return
    onPatch({ nextAction: text })
    setEditing(false); setJustDone(false)
  }
  const complete = () => {
    if (!task.nextAction) return
    onPatch({ nextAction: '', sessions: [{ date: new Date().toISOString(), done: task.nextAction }, ...(task.sessions || [])] })
    setJustDone(true); setEditing(false)
  }
  return <div className="simple-project">
    <div className="project-tabs" role="tablist" aria-label="Widok projektu">
      {[['now', 'Teraz'], ['plan', 'Plan'], ['history', 'Historia']].map(([id, label]) => <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{label}</button>)}
    </div>
    {tab === 'now' && <section className="focus-step" role="tabpanel" aria-label="Teraz">
      {task.nextAction && !editing ? <>
        <p className="step-caption">Następny krok</p>
        <h1>{task.nextAction}</h1>
        <button className="primary" onClick={complete}>Zrobione ✓</button>
        <button className="text-button" onClick={() => setEditing(true)}>Zmień krok</button>
      </> : <form onSubmit={saveStep}>
        {justDone && <p className="completion-note" role="status">✓ Krok zapisany w historii</p>}
        <label className="step-question" htmlFor="next-step">{editing ? 'Zmień krok' : justDone ? 'Co dalej?' : 'Co robisz teraz?'}</label>
        <textarea id="next-step" name="step" autoFocus required key={editing ? 'edit' : 'new'} defaultValue={editing ? task.nextAction : ''} placeholder="Np. zrobić pierwsze ćwiczenie" rows="3"/>
        <button className="primary">Zapisz krok</button>
        {editing && <button type="button" className="text-button" onClick={() => setEditing(false)}>Anuluj</button>}
      </form>}
    </section>}
    {tab === 'plan' && <section className="simple-plan" role="tabpanel" aria-label="Plan">
      <form key={task.id} onSubmit={e => { e.preventDefault(); const data = Object.fromEntries(new FormData(e.currentTarget)); if (!data.title.trim()) return; onPatch({ ...data, title: data.title.trim() }); setTab('now') }}>
        <label>Nazwa projektu<input name="title" defaultValue={task.title} required/></label>
        <label>Cel<input name="goal" defaultValue={task.goal || ''} placeholder="Co chcesz osiągnąć?"/></label>
        <details><summary>Więcej szczegółów</summary>
          <label>Gotowe, kiedy<input name="win" defaultValue={task.win || ''}/></label>
          <label>Dlaczego<input name="why" defaultValue={task.why || ''}/></label>
          <label>Termin / horyzont<input name="horizon" defaultValue={task.horizon || task.dueDate || ''}/></label>
        </details>
        <button className="secondary" type="submit">Zapisz plan</button>
      </form>
      <div className="simple-stages"><h2>Etapy</h2>
        {milestones.map((m, i) => <div className="stage-row" key={m.id}><input aria-label={`Ukończ etap: ${m.title || i + 1}`} type="checkbox" checked={m.done} onChange={e => onPatch({ milestones: milestones.map(x => x.id === m.id ? { ...x, done: e.target.checked } : x) })}/><span className={m.done ? 'is-done' : ''}>{m.title || `Etap ${i + 1}`}</span><button type="button" aria-label={`Usuń etap ${m.title || i + 1}`} onClick={() => onPatch({ milestones: milestones.filter(x => x.id !== m.id) })}>×</button></div>)}
        <form className="add-stage" onSubmit={e => { e.preventDefault(); const title = new FormData(e.currentTarget).get('stage').trim(); if (!title) return; onPatch({ milestones: [...milestones, { id: crypto.randomUUID(), title, done: false }] }); e.currentTarget.reset() }}><input name="stage" aria-label="Nowy etap" placeholder="Nowy etap" required/><button className="secondary">Dodaj</button></form>
      </div>
      {children}
      <button className="text-button" onClick={() => { onComplete(); setTab('now') }}>{task.completed ? 'Przywróć projekt' : 'Zakończ cały projekt'}</button>
    </section>}
    {tab === 'history' && <section className="step-history" role="tabpanel" aria-label="Historia">
      {!task.sessions?.length && <p className="muted-value">Wykonane kroki pojawią się tutaj.</p>}
      {(task.sessions || []).map((s, i) => <article key={i}><span className="history-check">✓</span><div><p>{s.done}</p><small>{new Date(s.date).toLocaleString('pl-PL')}</small>{(s.blocked || s.next) && <details><summary>Szczegóły</summary>{s.blocked && <p>{s.blocked}</p>}{s.next && <p>Następny krok: {s.next}</p>}</details>}</div></article>)}
      {(task.weekReviews?.length > 0 || task.weekActions?.some(a => a.text) || task.weekPriority || task.trigger || task.routine || task.place || task.minutes) && <details className="previous-plan"><summary>Wcześniejsze plany</summary>
        {task.weekPriority && <p>{task.weekPriority}</p>}{(task.weekActions || []).filter(a => a.text).map((a, i) => <p key={i}>{a.done ? '✓' : '○'} {a.text}</p>)}
        {[task.trigger, task.routine, task.place, task.minutes && `${task.minutes} min`].filter(Boolean).length > 0 && <p>{[task.trigger, task.routine, task.place, task.minutes && `${task.minutes} min`].filter(Boolean).join(' · ')}</p>}
        {(task.weekReviews || []).map((r, i) => <article key={i}><div><small>{new Date(r.date).toLocaleDateString('pl-PL')}</small><p>{r.progress}</p>{r.obstacles && <p>{r.obstacles}</p>}{r.priority && <p>{r.priority}</p>}{(r.actions || []).filter(a => a.text).map((a, j) => <p key={j}>{a.done ? '✓' : '○'} {a.text}</p>)}</div></article>)}
      </details>}
    </section>}
  </div>
}
