import { expect, test } from 'vitest'
import { createSearchIndex, toSearchDocument } from './search'
import type { CaseQuestion } from './types'

const question: CaseQuestion = {
  id: 'case-1', title: '融资方案案例', chapter_id: '9', topics: ['融资', '债务'], question_type: '案例题', difficulty: '中',
  background: '甲公司拟采用银行贷款完成并购。',
  subquestions: [{ id: 'q1', prompt: '说明债务融资特点。', answer: { reference: '按时还本付息。', analysis: '关注财务风险。', scoring_points: [], pitfalls: [] } }],
  sources: [{ source_id: 's1', file_name: '2025年真题解析.pdf', pages: [1] }], exam_ids: [], needs_review: false, review_notes: []
}

test('projects a case into weighted searchable text', () => {
  expect(toSearchDocument(question).answers).toContain('财务风险')
  expect(createSearchIndex([question]).search('银行贷款')).toHaveLength(1)
})
