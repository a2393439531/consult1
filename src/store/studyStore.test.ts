import { beforeEach, expect, test } from 'vitest'
import { useStudyStore } from './studyStore'

beforeEach(() => {
  useStudyStore.getState().resetLocalData()
  if (typeof localStorage.clear === 'function') localStorage.clear()
})

test('persists drafts, bookmarks, and mastery in the store', () => {
  const store = useStudyStore.getState()
  store.setDraft('case-1', '我的思路')
  store.toggleBookmark('case-1')
  store.setMastery('case-1', 'review')
  expect(useStudyStore.getState()).toMatchObject({ drafts: { 'case-1': '我的思路' }, bookmarks: { 'case-1': true }, mastery: { 'case-1': 'review' } })
})

test('resumes an active mock session and freezes it on submit', () => {
  const store = useStudyStore.getState()
  store.startExam('exam-1', 100)
  store.setExamDraft('exam-1', 'case-1', '答题草稿')
  store.submitExam('exam-1', 500)
  expect(useStudyStore.getState().exams['exam-1']).toMatchObject({ status: 'submitted', startedAt: 100, submittedAt: 500, drafts: { 'case-1': '答题草稿' } })
})
