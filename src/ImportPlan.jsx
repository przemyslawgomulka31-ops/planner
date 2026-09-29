import { useRef, useState } from 'react'
import { MAX_PLAN_BYTES, parsePlan } from './planTransfer'

export default function ImportPlan({ onImport, onClose }) {
  const [preview, setPreview] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false)
  const request = useRef(0)
  const read = async e => {
    const file = e.target.files?.[0], current = ++request.current
    setPreview(null); setError('')
    if (!file) return
    setBusy(true)
    try {
      if (file.size > MAX_PLAN_BYTES) throw Error('Plik jest za duży. Maksymalny rozmiar to 2 MB.')
      const plan = parsePlan(await file.text())
      if (request.current === current) setPreview(plan)
    } catch (err) { if (request.current === current) setError(err.message) }
    finally { if (request.current === current) setBusy(false) }
  }
  return <section className="import-plan">
    <div className="home-heading"><h1>Importuj plan</h1><button className="text-button" onClick={onClose}>Anuluj</button></div>
    <p>Wybierz plik planu przygotowany przez Codex.</p>
    <label className="file-label">Plik JSON<input type="file" accept=".json,application/json" onChange={read}/></label>
    <a className="example-download" href="/plans/angielski-21-dni.json" download>Pobierz plan: Angielski — 21 dni</a>
    {busy && <p role="status">Odczytywanie planu…</p>}{error && <p role="alert" className="import-error">{error}</p>}
    {preview && <div className="import-preview"><h2>{preview.title}</h2><p>{preview.goal}</p><p>{preview.planStages.length} etapy · {preview.planStages.reduce((n, s) => n + s.steps.length, 0)} zadań</p>
      {preview.planStages.map(s => <details key={s.id}><summary>{s.title} · {s.steps.length}</summary>{s.steps.map(t => <div key={t.id}><h3>{t.title}</h3><p className="step-instructions">{t.description}</p></div>)}</details>)}
      {preview.planNotes.map(n => <p key={n.id} className="import-note">{n.text}</p>)}
      <p>Plan zostanie dodany jako nowy projekt. Obecne projekty pozostaną bez zmian.</p>
      <button className="primary" onClick={() => { try { onImport(preview) } catch (err) { setError(err.message) } }}>Dodaj projekt</button>
    </div>}
  </section>
}
