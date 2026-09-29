import test from 'node:test'
import assert from 'node:assert/strict'
import { swipeAxis, swipeOffset, swipeSnap, SWIPE_WIDTH } from './swipe.js'
import { visibleBottom } from './mobileNavigation.js'

test('scrolling vertically does not reveal project actions', () => {
  assert.equal(swipeAxis(-4,35),'y')
  assert.equal(swipeAxis(-24,25),'y')
  assert.equal(swipeAxis(-6,2),null)
  assert.equal(swipeAxis(-40,5),'x')
})
test('swipe is bounded and short gestures close rather than complete a project', () => {
  assert.equal(swipeOffset(0,-400),-SWIPE_WIDTH)
  assert.equal(swipeOffset(0,30),0)
  assert.equal(swipeSnap(-20),0)
  assert.equal(swipeSnap(-70),-SWIPE_WIDTH)
  assert.equal(swipeSnap(swipeOffset(-SWIPE_WIDTH,80)),0)
})
test('footer position follows the visible viewport independently of content height', () => {
  assert.equal(visibleBottom({height:852}),852)
  assert.equal(visibleBottom({height:793}),793)
  assert.equal(visibleBottom({height:793,offsetTop:59}),852)
  assert.equal(visibleBottom({height:393}),393)
})
test('keyboard and zoom do not move the footer into the editing area', () => {
  assert.equal(visibleBottom({height:430,keyboard:true}),null)
  assert.equal(visibleBottom({height:426,scale:2}),null)
  assert.equal(visibleBottom({height:0}),null)
  assert.equal(visibleBottom({height:NaN}),null)
})
