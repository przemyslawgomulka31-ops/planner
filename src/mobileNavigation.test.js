import test from 'node:test'
import assert from 'node:assert/strict'
import { readRoute, routeHash, keyboardVisible, viewKey } from './mobileNavigation.js'
import { finishStep, getFocus, undoStep } from './plan.js'

test('navigation URLs preserve all screens and Unicode project identifiers', () => {
  for (const route of [{ name:'home' }, {name:'task',id:'projekt/żółty'}, {name:'form',parentId:'parent'}, {name:'form',id:'existing'}, {name:'import'}, {name:'archive'}, {name:'trash'}]) {
    assert.deepEqual(readRoute(routeHash(route)), route)
  }
})
test('malformed and incomplete navigation URLs have a safe home fallback', () => {
  for (const hash of ['', '#/unknown', '#/task', '#/task/%E0%A4%A']) assert.deepEqual(readRoute(hash), {name:'home'})
})
test('scroll positions distinguish projects and parent forms', () => {
  assert.notEqual(viewKey({name:'task',id:'a'}),viewKey({name:'task',id:'b'}))
  assert.notEqual(viewKey({name:'form',parentId:'a'}),viewKey({name:'form',parentId:'b'}))
})
test('browser toolbar changes and zoom do not masquerade as the keyboard', () => {
  assert.equal(keyboardVisible({layoutHeight:852,viewportHeight:780,scale:1,editing:true}),false)
  assert.equal(keyboardVisible({layoutHeight:852,viewportHeight:450,scale:2,editing:true}),false)
  assert.equal(keyboardVisible({layoutHeight:852,viewportHeight:450,scale:1,editing:false}),false)
})
test('focused software keyboard is detected in portrait and landscape', () => {
  assert.equal(keyboardVisible({layoutHeight:852,viewportHeight:510,scale:1,editing:true}),true)
  assert.equal(keyboardVisible({layoutHeight:393,viewportHeight:200,scale:1,editing:true}),true)
  assert.equal(keyboardVisible({layoutHeight:852,viewportHeight:852,scale:1,editing:true}),false)
})
test('undo restores the completed task without losing problems or unrelated history', () => {
  const initial={ planStages:[{id:'s',title:'Etap',steps:[{id:'a',title:'A',done:false},{id:'b',title:'B',done:false}]}],sessions:[{stepId:'old',done:'Poprzednie'}],stepDiscussions:{a:{text:'Sprawdzić',resolved:false}} }
  const completed={...initial,...finishStep(initial,'a')}
  assert.equal(getFocus(completed).step.id,'b')
  const restored={...completed,...undoStep(completed,'a')}
  assert.equal(getFocus(restored).step.id,'a')
  assert.deepEqual(restored.sessions,initial.sessions)
  assert.deepEqual(restored.stepDiscussions,initial.stepDiscussions)
  assert.deepEqual(undoStep(restored,'a'),{})
  assert.deepEqual(undoStep(restored,'missing'),{})
})
