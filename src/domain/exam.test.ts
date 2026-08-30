import { expect, test } from 'vitest'
import { answerExamQuestion, createExamSession, elapsedSeconds, setExamMastery, submitExam } from './exam'
import type { ExamShard } from './types'

const exam: ExamShard = { id: 'exam-1', title: '测试模考', duration_minutes: 120, question_ids: ['case-1'], source: { source_id: 'source', file_name: '模考.pdf', pages: [1] } }

test('tracks elapsed time and freezes it after submission', () => {
  const started = createExamSession(exam, 1000)
  const drafted = answerExamQuestion(started, 'case-1:q1', '我的步骤')
  expect(elapsedSeconds(drafted, 61000)).toBe(60)
  const submitted = submitExam(drafted, 91000)
  expect(elapsedSeconds(submitted, 300000)).toBe(90)
  expect(submitted.drafts['case-1:q1']).toBe('我的步骤')
  expect(setExamMastery(submitted, 'case-1:q1', 'review').mastery['case-1:q1']).toBe('review')
})
