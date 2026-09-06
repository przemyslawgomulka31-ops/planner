import test from 'node:test'
import assert from 'node:assert/strict'
import { getStages, getFocus, finishStep, moveItem } from './plan.js'
const project = () => ({ planStages: [
  { id: 'a', title: 'Podstawy', steps: [{ id: '1', title: 'Lekcja', done: false }, { id: '2', title: 'Ćwiczenia', done: false }] },
  { id: 'b', title: 'Rozmowy', steps: [{ id: '3', title: 'Rozmowa', done: false }] },
], sessions: [{ done: 'Dawna sesja' }], notes: 'Materiały' })
test('completion advances within a stage, then to the next stage, then completes the plan', () => {
  let p = project()
  assert.equal(getFocus(p).step.id, '1')
  p = { ...p, ...finishStep(p, '1') }; assert.equal(getFocus(p).step.id, '2')
  p = { ...p, ...finishStep(p, '2') }; assert.equal(getFocus(p).stage.id, 'b')
  p = { ...p, ...finishStep(p, '3') }; assert.equal(getFocus(p).complete, true)
  assert.equal(getFocus(p).step, undefined)
  assert.equal(p.sessions.length, 4); assert.equal(p.notes, 'Materiały')
})
test('selecting a later task respects choice, then resumes the earliest unfinished task', () => {
  let p = { ...project(), selectedStepId: '3' }
  assert.equal(getFocus(p).step.id, '3')
  p = { ...p, ...finishStep(p, '3') }
  assert.equal(getFocus(p).step.id, '1')
})
test('empty stages require planning rather than falsely completing or skipping', () => {
  const p = { planStages: [{ id: 'empty', steps: [] }, ...project().planStages] }
  assert.equal(getFocus(p).stage.id, 'empty'); assert.equal(getFocus(p).step, undefined)
  assert.equal(getFocus(p).complete, false)
  assert.equal(getFocus({}).complete, false)
})
test('legacy next action is retained inside a stage without mutating old data', () => {
  const p = { nextAction: 'Pierwsza lekcja', milestones: [{ id: 'm', title: 'Podstawy', done: false }] }
  const stages = getStages(p)
  assert.equal(stages[0].steps[0].title, p.nextAction)
  assert.equal(p.milestones[0].steps, undefined)
  assert.deepEqual(getStages({ ...p, planStages: stages }), stages)
})
test('completion is idempotent and keeps history across serialization', () => {
  let p = project(); p = { ...p, ...finishStep(p, '1', '2026-09-06T12:00:00Z') }
  assert.deepEqual(finishStep(p, '1'), {})
  assert.deepEqual(finishStep(p, 'missing'), {})
  const restored = JSON.parse(JSON.stringify(p))
  assert.equal(getFocus(restored).step.id, '2')
  assert.equal(restored.sessions[0].stageTitle, 'Podstawy')
})
test('reordering changes the execution order and ignores out-of-range moves', () => {
  const p = project(); const reordered = moveItem(p.planStages, 1, -1)
  assert.equal(getFocus({ ...p, planStages: reordered }).step.id, '3')
  assert.equal(p.planStages[0].id, 'a')
  assert.deepEqual(moveItem(reordered, 0, -1), reordered)
  const steps = moveItem(p.planStages[0].steps, 1, -1)
  assert.equal(getFocus({ planStages: [{ ...p.planStages[0], steps }] }).step.id, '2')
})
test('stale selection falls back and adding work to a completed stage reopens it', () => {
  const p = { planStages: [{ id: 'a', done: true, steps: [{ id: 'new', done: false }] }], selectedStepId: 'deleted' }
  assert.equal(getFocus(p).step.id, 'new'); assert.equal(getFocus(p).complete, false)
})
