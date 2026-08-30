import type { ExamSession, ExamShard, Mastery } from './types'

export function createExamSession(exam: ExamShard, now = Date.now()): ExamSession {
  return { examId: exam.id, startedAt: now, status: 'active', currentIndex: 0, drafts: {}, mastery: {} }
}

export function elapsedSeconds(session: ExamSession, now = Date.now()): number {
  const end = session.status === 'submitted' ? session.submittedAt ?? now : now
  return Math.max(0, Math.floor((end - session.startedAt) / 1000))
}

export function answerExamQuestion(session: ExamSession, key: string, text: string): ExamSession {
  if (session.status !== 'active') return session
  return { ...session, drafts: { ...session.drafts, [key]: text } }
}

export function setExamMastery(session: ExamSession, key: string, value: Mastery): ExamSession {
  if (session.status !== 'submitted') return session
  return { ...session, mastery: { ...session.mastery, [key]: value } }
}

export function submitExam(session: ExamSession, now = Date.now()): ExamSession {
  if (session.status !== 'active') return session
  return { ...session, status: 'submitted', submittedAt: now }
}
