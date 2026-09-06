import { useState } from 'react'

const weekStart = () => {
  const d = new Date(); d.setDate(d.getDate() - (d.getDay() + 6) % 7)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function Field({ label, value = '', onSave, placeholder, type = 'text' }) {
  return <label className="planner-field">{label}<input key={value} type={type} defaultValue={value} placeholder={placeholder} onBlur={e => { if (e.target.value !== value) onSave(e.target.value.trim()) }} onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}/></label>
}
export default function ProjectPlanner({ task, onPatch }) {
  const [session, setSession] = useState(false)
  const [review, setReview] = useState(false)
  const [notice, setNotice] = useState('')
  const milestones = task.milestones || []
  const actions = task.weekActions || Array.from({ length: 3 }, () => ({ text: '', done: false }))
  const field = (label, name, placeholder, type) => <Field label={label} value={task[name] || ''} placeholder={placeholder} type={type} onSave={value => onPatch({ [name]: value })}/>
  const saveSession = e => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))
    if (!data.next.trim() || !data.done.trim()) return
    onPatch({ nextAction: data.next.trim(), sessions: [{ ...data, date: new Date().toISOString() }, ...(task.sessions || [])] })
    setSession(false); setNotice('Sesja zapisana. Następny krok już na Ciebie czeka.')
  }
  return <div className="planner">
    <section className="next-card">
      <span className="eyebrow">MAŁY KROK. KONKRETNY RUCH.</span>
      <h2>→ Teraz robię</h2>
      {field('Następna fizyczna czynność', 'nextAction', 'Otworzyć rozdział 7 i zrobić ćwiczenia 1–5')}
      <details><summary>Kiedy → to</summary><div className="planner-grid">
        {field('Kiedy / po czym', 'trigger', 'Po kolacji')}{field('Gdzie', 'place', 'Przy biurku')}
        {field('Co robię', 'routine', 'Ćwiczenia z kursu')}{field('Ile minut', 'minutes', '30', 'number')}
      </div></details>
      {task.trigger && <p className="signal">{task.trigger} → {task.routine || task.nextAction || 'Ustal czynność'}{task.minutes ? ` · ${task.minutes} min` : ''}</p>}
      <button className="primary" onClick={() => { setSession(!session); setNotice('') }}>{session ? 'Zamknij podsumowanie' : 'Zakończ sesję'}</button>
    </section>
    {notice && <p role="status" className="planner-notice">✓ {notice}</p>}
    {session && <form className="planner-card session-form" onSubmit={saveSession}><h2>Koniec sesji</h2>
      <label>Zrobiłem<textarea name="done" required placeholder="Co udało się przesunąć?"/></label>
      <label>Utknąłem na <small>opcjonalnie</small><textarea name="blocked"/></label>
      <label>Następnym razem zaczynam od<input name="next" required placeholder="Jedna konkretna czynność"/></label>
      <button className="primary">Zapisz sesję i następny krok</button>
    </form>}
    <section className="planner-card"><div className="planner-heading"><h2>Ten tydzień</h2><span>{actions.filter(a => a.done && a.text).length} / 3</span></div>
      {task.weekOf && <p className="planner-hint">Plan od {task.weekOf}{task.weekOf !== weekStart() ? ' · Czas na przegląd i nowy plan.' : ''}</p>}
      <label className="planner-field">W tym tygodniu przesuwam<select value={task.weekMilestone || ''} onChange={e => onPatch({ weekMilestone: e.target.value })}><option value="">Wybierz etap</option>{milestones.map(m => <option key={m.id} value={m.id}>{m.title || 'Nienazwany etap'}{m.done ? ' ✓' : ''}</option>)}</select></label>
      {field('Priorytet', 'weekPriority', 'Co najbardziej przybliży mnie do celu?')}
      <p className="planner-hint">Trzy najważniejsze działania wystarczą.</p>
      {actions.map((a, i) => <div className="weekly-action" key={i}><input type="checkbox" aria-label={`Wykonano działanie ${i + 1}`} checked={a.done} disabled={!a.text} onChange={e => onPatch({ weekActions: actions.map((x, j) => i === j ? { ...x, done: e.target.checked } : x), weekOf: task.weekOf || weekStart() })}/><Field label={`Działanie ${i + 1}`} value={a.text} placeholder={['Zrobić lekcje 5–7', 'Powtórzyć 50 słów', 'Odbyć dwie rozmowy'][i]} onSave={text => onPatch({ weekActions: actions.map((x, j) => i === j ? { text, done: text === x.text ? x.done : false } : x), weekOf: task.weekOf || weekStart() })}/></div>)}
      <button className="planner-link" onClick={() => setReview(!review)}>Przegląd tygodnia →</button>
      {review && <form className="session-form" onSubmit={e => { e.preventDefault(); const data = Object.fromEntries(new FormData(e.currentTarget)); onPatch({ weekReviews: [{ ...data, actions, priority: task.weekPriority || '', milestone: task.weekMilestone || '', weekOf: task.weekOf || weekStart(), date: new Date().toISOString() }, ...(task.weekReviews || [])], weekActions: Array.from({ length: 3 }, () => ({ text: '', done: false })), weekPriority: '', weekMilestone: '', weekOf: weekStart() }); setReview(false); setNotice('Przegląd zapisany. Wybierz trzy działania na kolejny tydzień.') }}>
        <label>Co ruszyło do przodu?<textarea name="progress" required/></label><label>Co przeszkadzało?<textarea name="obstacles"/></label><p className="planner-hint">Zapiszemy obecny plan w historii i wyczyścimy trzy działania, aby wybrać je ponownie.</p><button className="primary">Zapisz przegląd i rozpocznij nowy plan</button>
      </form>}
    </section>
    <section className="planner-card"><div className="planner-heading"><h2>Moja droga</h2><span>{milestones.filter(m => m.done).length} / {milestones.length}</span></div><p className="planner-hint">START → ETAPY → CEL</p>
      {!milestones.length && <p>Dodaj kilka punktów po drodze. Nie musisz znać wszystkich kroków.</p>}
      {milestones.map((m, i) => <div className={`milestone ${m.done ? 'finished' : ''}`} key={m.id}><input type="checkbox" aria-label={`Ukończ etap ${i + 1}`} checked={m.done} onChange={e => onPatch({ milestones: milestones.map(x => x.id === m.id ? { ...x, done: e.target.checked } : x) })}/><Field label={`M${i + 1}${milestones.find(x => !x.done)?.id === m.id ? ' · TERAZ' : ''}`} value={m.title} placeholder="Po czym poznasz, że ten etap jest gotowy?" onSave={title => onPatch({ milestones: milestones.map(x => x.id === m.id ? { ...x, title } : x) })}/><button className="planner-link" aria-label={`Usuń etap ${i + 1}`} onClick={() => onPatch({ milestones: milestones.filter(x => x.id !== m.id), weekMilestone: task.weekMilestone === m.id ? '' : task.weekMilestone })}>×</button></div>)}
      <button className="planner-link" onClick={() => onPatch({ milestones: [...milestones, { id: crypto.randomUUID(), title: '', done: false }] })}>+ Dodaj etap</button>
    </section>
    <details className="planner-card" open={!task.goal || !task.win}><summary>Kierunek <span>Dokąd idę?</span></summary>
      {field('Chcę', 'goal', 'Co konkretnie chcesz osiągnąć?')}{field('Dlaczego mi na tym zależy', 'why', 'Co to zmieni w moim życiu?')}{field('Uznam cel za osiągnięty, kiedy', 'win', 'Wynik, który da się zmierzyć lub potwierdzić')}{field('Horyzont / termin', 'horizon', 'Np. 6 miesięcy lub grudzień 2026')}
    </details>
    <details className="planner-card"><summary>Historia <span>Sesje i przeglądy</span></summary>
      {!(task.sessions?.length || task.weekReviews?.length) && <p className="planner-hint">Tutaj pojawią się zapisane sesje i przeglądy.</p>}
      {(task.sessions || []).map((s, i) => <article className="history-entry" key={`s${i}`}><small>{new Date(s.date).toLocaleString('pl-PL')} · Sesja</small><p><b>Zrobiłem:</b> {s.done}</p>{s.blocked && <p><b>Przeszkoda:</b> {s.blocked}</p>}<p><b>Następny krok:</b> {s.next}</p></article>)}
      {(task.weekReviews || []).map((r, i) => <article className="history-entry" key={`r${i}`}><small>{new Date(r.date).toLocaleDateString('pl-PL')} · Przegląd tygodnia</small><p>{r.progress}</p>{r.obstacles && <p>Przeszkody: {r.obstacles}</p>}{r.priority && <p>Priorytet: {r.priority}</p>}{r.actions.filter(a => a.text).map((a, j) => <p key={j}>{a.done ? '✓' : '○'} {a.text}</p>)}</article>)}
    </details>
    <p className="planner-hint">Pola zapisują się po wyjściu z pola. Dane są przechowywane w tej przeglądarce.</p>
  </div>
}
