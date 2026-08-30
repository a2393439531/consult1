import Fuse from 'fuse.js'
import type { CaseQuestion, SearchDocument } from './types'

const yearFromSource = (fileName: string) => fileName.match(/20\d{2}|\d{2}(?=年)/)?.[0] ?? ''

export function toSearchDocument(question: CaseQuestion): SearchDocument {
  const source = question.sources.map((item) => item.file_name).join(' ')
  return {
    id: question.id,
    title: question.title,
    background: question.background,
    prompts: question.subquestions.map((item) => item.prompt).join(' '),
    answers: question.subquestions.map((item) => `${item.answer.reference} ${item.answer.analysis}`).join(' '),
    topics: question.topics.join(' '),
    source,
    year: yearFromSource(source),
    chapterId: question.chapter_id
  }
}

export function createSearchIndex(questions: CaseQuestion[]) {
  return new Fuse(questions.map(toSearchDocument), {
    threshold: 0.34,
    ignoreLocation: true,
    keys: [
      { name: 'title', weight: 3 },
      { name: 'topics', weight: 2.5 },
      { name: 'prompts', weight: 2 },
      { name: 'background', weight: 1.5 },
      { name: 'answers', weight: 1 },
      { name: 'source', weight: 0.7 },
      { name: 'year', weight: 0.7 }
    ]
  })
}
