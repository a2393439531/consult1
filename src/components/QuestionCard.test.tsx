import { fireEvent, render, screen } from '@testing-library/react'
import { QuestionCard } from './QuestionCard'
import type { CaseQuestion } from '../domain/types'

const question: CaseQuestion = { id: 'case-1', title: '逻辑框架案例', chapter_id: '1', topics: ['逻辑框架'], question_type: '案例题', difficulty: '中', background: '某项目背景材料。', subquestions: [{ id: 'q1', prompt: '列出目标层次。', answer: { reference: '投入、产出、目的、目标。', analysis: '按垂直逻辑判断。', scoring_points: ['四个层次'], pitfalls: [] } }], sources: [{ source_id: 's1', file_name: '第一章.pdf', pages: [2] }], exam_ids: [], needs_review: false, review_notes: [] }

test('hides answers until the learner reveals them and saves a draft', () => {
  render(<QuestionCard question={question} />)
  expect(screen.queryByText('投入、产出、目的、目标。')).not.toBeInTheDocument()
  fireEvent.change(screen.getByLabelText('你的作答草稿'), { target: { value: '我的答案' } })
  fireEvent.click(screen.getByRole('button', { name: '展开答案与解析' }))
  expect(screen.getByText('投入、产出、目的、目标。')).toBeInTheDocument()
})
