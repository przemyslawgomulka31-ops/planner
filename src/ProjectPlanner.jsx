import { useState } from 'react'
import PlanNotes from './PlanNotes'
import StepDiscussion from './StepDiscussion'
import { finishStep, getFocus, moveItem, stageDone } from './plan'

function AddItem({ label, onAdd }) {
  return <form className="add-stage" onSubmit={e => { e.preventDefault(); const title = new FormData(e.currentTarget).get('title').trim(); if (!title) return; onAdd(title); e.currentTarget.reset() }}>
    <input name="title" aria-label={label} placeholder={label} required/><button className="secondary">Dodaj</button>
  </form>
}
function Rename({ value, onSave, label }) {
  const [editing, setEditing] = useState(false)
  return editing ? <form className="rename-item" onSubmit={e => { e.preventDefault(); const title = new FormData(e.currentTarget).get('title').trim(); if (title) { onSave(title); setEditing(false) } }}><input aria-label={label} name="title" defaultValue={value} required autoFocus/><button className="secondary">Zapisz</button><button type="button" className="text-button" onClick={() => setEditing(false)}>Anuluj</button></form> : <button className="rename-title" aria-label={`Edytuj: ${value}`} onClick={() => setEditing(true)}>{value}<span aria-hidden="true"> ✎</span></button>
}
export default function ProjectPlanner({ task, onPatch, onComplete, children }) {
  const [tab, setTab] = useState('now')
  const [notice, setNotice] = useState('')
  const [lastDone, setLastDone] = useState(null)
  const { stages, stage, step, complete } = getFocus(task)
  const saveStages = next => onPatch({ planStages: next, nextAction: '' })
  const updateStage = (id, update) => saveStages(stages.map(s => s.id === id ? { ...s, ...update } : s))
  const total = stages.reduce((n, s) => n + s.steps.length, 0)
  const done = stages.reduce((n, s) => n + s.steps.filter(t => t.done).length, 0)
  const discussion = id => <StepDiscussion key={id} value={task.stepDiscussions?.[id]} onSave={value => onPatch(project => ({ stepDiscussions: { ...project.stepDiscussions, [id]: value } }))}/>
  const openDiscussions = Object.entries(task.stepDiscussions || {}).filter(([, value]) => !value.resolved)
  const otherDiscussions = openDiscussions.filter(([id]) => id !== lastDone && !stage?.steps.some(t => t.id === id && t.done))
  const stepTitle = id => stages.flatMap(s => s.steps).find(t => t.id === id)?.title || task.sessions?.find(s => s.stepId === id)?.done || 'Ukończone zadanie'
  const renderStep = t => <div key={t.id}><div className={`now-step ${step?.id === t.id ? 'current-step' : ''}`}><span>{t.done ? '✓' : step?.id === t.id ? '→' : '○'}</span><span className={t.done ? 'is-done' : ''}>{t.title}</span>{!t.done && step?.id !== t.id && <button className="text-button" onClick={() => onPatch({ selectedStepId: t.id, planStages: stages })}>Zrób teraz</button>}</div>{t.done && t.id !== lastDone && discussion(t.id)}</div>
  return <div className="simple-project">
    <div className="project-tabs" role="tablist" aria-label="Widok projektu">
      {[['now', 'Teraz'], ['plan', 'Plan'], ['history', 'Historia']].map(([id, label]) => <button key={id} role="tab" aria-selected={tab === id} onClick={() => { setTab(id); setNotice('') }}>{label}</button>)}
    </div>
    {tab === 'now' && <section className="planned-now" role="tabpanel" aria-label="Teraz">
      {notice && <p className="completion-note" role="status">{notice}</p>}
      {lastDone && <section className="recent-completion"><small>Ostatnio ukończone</small><h3>✓ {stepTitle(lastDone)}</h3>{discussion(lastDone)}</section>}
      {stage ? <>
        <p className="step-caption">Etap {stages.indexOf(stage) + 1} z {stages.length}</p><h2>{stage.title}</h2>
        <p className="plan-count">{stage.steps.filter(s => s.done).length} / {stage.steps.length} zadań wykonanych</p>
        {step ? <div className="focus-step"><p className="step-caption">Następne zadanie</p><h1>{step.title}</h1><button className="primary" onClick={() => { onPatch(project => finishStep(project, step.id)); setNotice('✓ Zadanie wykonane'); setLastDone(step.id) }}>Zrobione ✓</button></div> : <div className="plan-empty"><p>Ten etap nie ma jeszcze zadań.</p><button className="primary" onClick={() => setTab('plan')}>Dodaj zadania w Planie</button></div>}
        <div className="now-steps">{stage.steps.map(renderStep)}</div>
      </> : <div className="plan-empty"><h1>{complete ? 'Plan wykonany ✓' : 'Zacznij od planu'}</h1><p>{complete ? (openDiscussions.length ? 'Zadania wykonane. Poniżej pozostały problemy do omówienia.' : 'Wszystkie etapy są gotowe.') : 'Dodaj etapy, a w nich zadania do wykonania.'}</p><button className="primary" onClick={complete ? onComplete : () => setTab('plan')}>{complete ? 'Zakończ projekt' : 'Ułóż plan'}</button>{complete && <button className="text-button" onClick={() => setTab('plan')}>Dodaj kolejne zadania</button>}</div>}
      {otherDiscussions.length > 0 && <section className="open-discussions"><h3>Do omówienia · {otherDiscussions.length}</h3>{otherDiscussions.map(([id]) => <div key={id}><h4>✓ {stepTitle(id)}</h4>{discussion(id)}</div>)}</section>}
      {stages.length > 0 && <div className="roadmap"><h3>Cały plan <small>{done} / {total}</small></h3>{stages.map((s, i) => <details key={s.id}><summary><span>{stageDone(s) ? '✓' : `${i + 1}.`} {s.title}</span><small>{s.steps.filter(t => t.done).length}/{s.steps.length}</small></summary>{s.steps.length ? s.steps.map(renderStep) : <button className="text-button" onClick={() => setTab('plan')}>Dodaj zadania</button>}</details>)}</div>}
    </section>}
    {tab === 'plan' && <section className="simple-plan" role="tabpanel" aria-label="Plan">
<section className="project-outline"><h2>Zarys projektu</h2><p className="outline-goal">{task.goal || task.description || task.title}</p>{task.win && <p><b>Gotowe, kiedy:</b> {task.win}</p>}{(task.horizon || task.dueDate) && <p><b>Termin:</b> {task.horizon || task.dueDate}</p>}      <section className="project-note-section"><PlanNotes scope="cały projekt" entries={task.planNotes} onSave={planNotes => onPatch({ planNotes })}/></section>
      <details className="project-settings"><summary>Cel i szczegóły projektu</summary><form onSubmit={e => { e.preventDefault(); const data = Object.fromEntries(new FormData(e.currentTarget)); if (!data.title.trim()) return; onPatch({ ...data, title: data.title.trim() }); setNotice('Zapisano szczegóły projektu') }}>
        <label>Nazwa projektu<input name="title" defaultValue={task.title} required/></label><label>Cel<input name="goal" defaultValue={task.goal || ''}/></label><label>Gotowe, kiedy<input name="win" defaultValue={task.win || ''}/></label><label>Dlaczego<input name="why" defaultValue={task.why || ''}/></label><label>Termin / horyzont<input name="horizon" defaultValue={task.horizon || task.dueDate || ''}/></label><button className="secondary">Zapisz szczegóły</button>{notice && <p role="status">{notice}</p>}
      </form></details>
</section>
      <h2>Etapy i zadania</h2>
      {stages.map((s, i) => <section className="plan-stage" key={s.id}>
        <div className="stage-heading"><span>{i + 1}.</span><Rename value={s.title} label="Nazwa etapu" onSave={title => updateStage(s.id, { title })}/></div>
        <div className="order-controls"><button disabled={i === 0} onClick={() => saveStages(moveItem(stages, i, -1))} aria-label={`Przesuń etap ${s.title} w górę`}>↑</button><button disabled={i === stages.length - 1} onClick={() => saveStages(moveItem(stages, i, 1))} aria-label={`Przesuń etap ${s.title} w dół`}>↓</button><button onClick={() => { if (confirm(`Usunąć etap „${s.title}” wraz z zadaniami?`)) saveStages(stages.filter(x => x.id !== s.id)) }}>Usuń etap</button></div>
        {s.steps.map((t, j) => <div className="plan-task" key={t.id}><div className="plan-task-title"><input type="checkbox" aria-label={`Wykonano: ${t.title}`} checked={t.done} onChange={e => { if (e.target.checked) onPatch(project => finishStep(project, t.id)); else updateStage(s.id, { done: false, steps: s.steps.map(x => x.id === t.id ? { ...x, done: false } : x) }) }}/><Rename value={t.title} label="Nazwa zadania" onSave={title => updateStage(s.id, { steps: s.steps.map(x => x.id === t.id ? { ...x, title } : x) })}/></div><div className="order-controls"><button disabled={j === 0} onClick={() => updateStage(s.id, { steps: moveItem(s.steps, j, -1) })} aria-label={`Przesuń zadanie ${t.title} w górę`}>↑</button><button disabled={j === s.steps.length - 1} onClick={() => updateStage(s.id, { steps: moveItem(s.steps, j, 1) })} aria-label={`Przesuń zadanie ${t.title} w dół`}>↓</button><button onClick={() => { if (confirm(`Usunąć zadanie „${t.title}”?`)) updateStage(s.id, { steps: s.steps.filter(x => x.id !== t.id), done: false }) }}>Usuń</button></div>{t.done && discussion(t.id)}</div>)}
        <AddItem label="Dodaj zadanie do etapu" onAdd={title => updateStage(s.id, { done: false, steps: [...s.steps, { id: crypto.randomUUID(), title, done: false }] })}/>
        <PlanNotes scope={s.title} entries={s.planNotes} onSave={planNotes => updateStage(s.id, { planNotes })}/>
      </section>)}
      <AddItem label="Nazwa nowego etapu" onAdd={title => saveStages([...stages, { id: crypto.randomUUID(), title, steps: [] }])}/>
      {stages.length > 0 && <button className="primary start-plan" onClick={() => setTab('now')}>Przejdź do działania →</button>}
      {children}
      <button className="text-button" onClick={onComplete}>{task.completed ? 'Przywróć projekt' : 'Zakończ cały projekt'}</button>
    </section>}
    {tab === 'history' && <section className="step-history" role="tabpanel" aria-label="Historia">
      {!task.sessions?.length && <p className="muted-value">Wykonane zadania pojawią się tutaj.</p>}
      {(task.sessions || []).map((s, i) => <article key={i}><span className="history-check">✓</span><div><p>{s.done}</p>{s.stepId && discussion(s.stepId)}<small>{s.stageTitle && `${s.stageTitle} · `}{new Date(s.date).toLocaleString('pl-PL')}</small>{(s.blocked || s.next) && <details><summary>Szczegóły</summary>{s.blocked && <p>{s.blocked}</p>}{s.next && <p>Następny krok: {s.next}</p>}</details>}</div></article>)}
      {(task.weekReviews?.length > 0 || task.weekActions?.some(a => a.text) || task.weekPriority || task.trigger || task.routine || task.place || task.minutes) && <details className="previous-plan"><summary>Wcześniejsze plany</summary>{task.weekPriority && <p>{task.weekPriority}</p>}{(task.weekActions || []).filter(a => a.text).map((a, i) => <p key={i}>{a.done ? '✓' : '○'} {a.text}</p>)}<p>{[task.trigger, task.routine, task.place, task.minutes && `${task.minutes} min`].filter(Boolean).join(' · ')}</p>{(task.weekReviews || []).map((r, i) => <article key={i}><div><small>{new Date(r.date).toLocaleDateString('pl-PL')}</small><p>{r.progress}</p>{r.obstacles && <p>{r.obstacles}</p>}{r.priority && <p>{r.priority}</p>}{(r.actions || []).filter(a => a.text).map((a, j) => <p key={j}>{a.done ? '✓' : '○'} {a.text}</p>)}</div></article>)}</details>}
    </section>}
  </div>
}
