import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parsePlan, exportPlan } from './planTransfer.js'
import { finishStep, getFocus } from './plan.js'
const source = readFileSync(new URL('../public/plans/angielski-21-dni.json', import.meta.url), 'utf8')
test('English plan retains 3 weeks, all 21 instructions and missing exam notice', () => {
  const p = parsePlan(source)
  assert.deepEqual(p.planStages.map(s => s.steps.length), [7, 7, 7])
  assert.equal(p.planStages.flatMap(s => s.steps).every(t => t.description.includes('15 minut') && t.description.includes('Zadanie praktyczne:')), true)
  assert.match(p.planNotes[0].text, /nie została dołączona/)
  assert.match(getFocus(p).step.title, /Dzień 1 —/)
})
test('export and reimport preserve progress, instructions, notes and task discussions', () => {
  let p = parsePlan(source)
  p = { ...p, ...finishStep(p, 'day-1'), stepDiscussions: { 'day-1': { text: 'Pytanie', next: 'Omówić', resolved: false } } }
  const restored = parsePlan(exportPlan(p))
  assert.equal(getFocus(restored).step.id, 'day-2')
  assert.deepEqual(restored.planStages, p.planStages)
  assert.deepEqual(restored.stepDiscussions, p.stepDiscussions)
  assert.equal(restored.sessions[0].stepId, 'day-1')
  assert.equal(restored.planNotes[0].text, p.planNotes[0].text)
})
test('invalid files cannot supply task identity or overwrite existing project state', () => {
  for (const input of ['bad', 'null', '[]', '{}', JSON.stringify({ format: 'planner-plan', version: 2 })]) assert.throws(() => parsePlan(input))
  const e = JSON.parse(source); e.project.id = 'existing-project'; e.project.deleted = true
  assert.equal(parsePlan(JSON.stringify(e)).id, undefined)
  assert.equal(parsePlan(JSON.stringify(e)).deleted, undefined)
  e.project.planStages[0].steps[1].id = 'day-1'
  assert.throws(() => parsePlan(JSON.stringify(e)), /identyfikatory/)
})
test('blank names, malformed lists and oversized files are rejected', () => {
  const e = JSON.parse(source); e.project.title = ' '
  assert.throws(() => parsePlan(JSON.stringify(e)))
  e.project.title = 'Plan'; e.project.planStages = 'bad'
  assert.throws(() => parsePlan(JSON.stringify(e)))
  assert.throws(() => parsePlan(' '.repeat(2 * 1024 * 1024 + 1)), /za duży/)
})
