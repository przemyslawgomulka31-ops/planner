// The plan is the source of truth for both the project card and the Now view.
export function getStages(project) {
  if (Array.isArray(project.planStages)) return project.planStages
  const stages = (project.milestones || []).map(m => ({ ...m, steps: [] }))
  if (project.nextAction?.trim()) {
    let stage = stages.find(s => !s.done)
    if (!stage) { stage = { id: 'legacy-stage', title: 'Pierwsze kroki', steps: [] }; stages.push(stage) }
    stage.steps.push({ id: 'legacy-step', title: project.nextAction, done: false })
  }
  return stages
}
export const stageDone = stage => stage.steps.length ? stage.steps.every(s => s.done) : !!stage.done
export function getFocus(project) {
  const stages = getStages(project)
  const selectedStage = stages.find(s => s.steps.some(t => t.id === project.selectedStepId && !t.done))
  const stage = selectedStage || stages.find(s => !stageDone(s))
  const step = stage?.steps.find(s => s.id === project.selectedStepId && !s.done) || stage?.steps.find(s => !s.done)
  return { stages, stage, step, complete: stages.length > 0 && stages.every(stageDone) }
}
export function finishStep(project, stepId, date = new Date().toISOString()) {
  const stages = getStages(project)
  const stage = stages.find(s => s.steps.some(t => t.id === stepId))
  const step = stage?.steps.find(t => t.id === stepId)
  if (!step || step.done) return {}
  return {
    planStages: stages.map(s => ({ ...s, steps: s.steps.map(t => t.id === stepId ? { ...t, done: true } : t) })),
    selectedStepId: null,
    nextAction: '',
    sessions: [{ date, done: step.title, stageTitle: stage.title, stepId }, ...(project.sessions || [])],
  }
}
export function moveItem(items, index, direction) {
  const next = index + direction
  if (index < 0 || next < 0 || index >= items.length || next >= items.length) return items
  const result = [...items]
  ;[result[index], result[next]] = [result[next], result[index]]
  return result
}
