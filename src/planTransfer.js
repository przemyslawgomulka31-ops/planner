import { getStages } from './plan.js'

export const MAX_PLAN_BYTES = 2 * 1024 * 1024
const object = (v, label) => { if (!v || typeof v !== 'object' || Array.isArray(v)) throw Error(`Nieprawidłowe dane: ${label}.`); return v }
const text = (v, label, required = false) => {
  if (v == null && !required) return ''
  if (typeof v !== 'string' || v.length > 20000 || (required && !v.trim())) throw Error(`Sprawdź pole: ${label}.`)
  return v.trim()
}
const list = (v, label, limit = 1000) => { if (!Array.isArray(v) || v.length > limit) throw Error(`Nieprawidłowa lista: ${label}.`); return v }
const date = v => typeof v === 'string' && Number.isFinite(Date.parse(v)) ? v : new Date().toISOString()
const notes = v => list(v || [], 'uwagi').map(n => { object(n, 'uwaga'); return { id: typeof n.id === 'string' ? n.id : crypto.randomUUID(), kind: ['problem', 'note', 'decision'].includes(n.kind) ? n.kind : 'note', text: text(n.text, 'treść uwagi', true), createdAt: date(n.createdAt), resolved: n.resolved === true } })
export function parsePlan(source) {
  if (new TextEncoder().encode(source).length > MAX_PLAN_BYTES) throw Error('Plik jest za duży. Maksymalny rozmiar to 2 MB.')
  let envelope
  try { envelope = JSON.parse(source.replace(/^\uFEFF/, '')) } catch { throw Error('Nie można odczytać pliku JSON. Wybierz plik planu wygenerowany dla aplikacji.') }
  object(envelope, 'plik')
  if (envelope.format !== 'planner-plan' || envelope.version !== 1) throw Error('Nieobsługiwany format planu. Wymagany jest planner-plan w wersji 1.')
  const p = object(envelope.project, 'projekt'), ids = new Set()
  const id = v => {
    const value = v == null ? crypto.randomUUID() : text(v, 'identyfikator', true)
    if (ids.has(value)) throw Error('Plan zawiera powtarzające się identyfikatory etapów lub zadań.')
    ids.add(value); return value
  }
  const planStages = list(p.planStages, 'etapy', 100).map(s => {
    object(s, 'etap')
    return { id: id(s.id), title: text(s.title, 'nazwa etapu', true), done: s.done === true, planNotes: notes(s.planNotes), steps: list(s.steps, 'zadania').map(t => {
      object(t, 'zadanie')
      return { id: id(t.id), title: text(t.title, 'nazwa zadania', true), description: text(t.description, 'instrukcja'), done: t.done === true }
    }) }
  })
  const stepDiscussions = Object.fromEntries(Object.entries(object(p.stepDiscussions || {}, 'problemy')).map(([key, value]) => {
    object(value, 'problem'); return [key, { text: text(value.text, 'problem', true), next: text(value.next, 'co dalej'), resolved: value.resolved === true }]
  }))
  return {
    title: text(p.title, 'nazwa projektu', true), goal: text(p.goal, 'cel'), why: text(p.why, 'dlaczego'), win: text(p.win, 'gotowe kiedy'), horizon: text(p.horizon, 'horyzont'), description: text(p.description, 'opis'), notes: text(p.notes, 'notatki'),
    planStages, planNotes: notes(p.planNotes), stepDiscussions,
    sessions: list(p.sessions || [], 'historia').map(s => { object(s, 'wpis historii'); return { done: text(s.done, 'wykonane zadanie', true), date: date(s.date), stepId: text(s.stepId, 'zadanie historii'), stageTitle: text(s.stageTitle, 'etap historii'), blocked: text(s.blocked, 'przeszkody'), next: text(s.next, 'następny krok') } }),
    selectedStepId: text(p.selectedStepId, 'wybrane zadanie') || null,
  }
}
export function exportPlan(project) {
  return JSON.stringify({ format: 'planner-plan', version: 1, project: parsePlan(JSON.stringify({ format: 'planner-plan', version: 1, project: { ...project, planStages: getStages(project) } })) }, null, 2)
}
export function downloadPlan(project) {
  const blob = new Blob([exportPlan(project)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob), link = document.createElement('a')
  link.href = url; link.download = `${project.title.replace(/[^\p{L}\p{N}-]+/gu, '-').slice(0, 80) || 'plan'}.json`
  document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000)
}
