import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadManifest } from '../data/manifest'
import type { ContentManifest } from '../domain/types'
import { EmptyState } from '../components/EmptyState'
import { useStudyStore } from '../store/studyStore'

export function ExamListPage() {
  const [manifest, setManifest] = useState<ContentManifest>()
  const sessions = useStudyStore((state) => state.exams)
  useEffect(() => { loadManifest().then(setManifest).catch(() => setManifest({ version: 1, chapters: [], exams: [], totals: {} as ContentManifest['totals'] })) }, [])
  if (!manifest) return <div className="loading-state">正在加载整卷试题……</div>
  return <div className="exam-list-page"><section className="page-intro"><p className="eyebrow">Full paper mode</p><h1>像正式考试一样，完成一整套。</h1><p>开始后计时，答案在交卷前保持隐藏。整卷完成后，再按小问自评，不追求虚假的自动分数。</p></section>{manifest.exams.length ? <div className="exam-grid">{manifest.exams.map((exam) => { const session = sessions[exam.id]; return <Link className="exam-card" to={`/exams/${exam.id}`} key={exam.id}><div className="exam-card-top"><span className="tag tag-teal">{session?.status === 'submitted' ? '已交卷' : session?.status === 'active' ? '进行中' : '未开始'}</span><span>{exam.duration_minutes} 分钟</span></div><h2>{exam.title}</h2><p>{exam.question_ids.length} 个题组 · 来源：{exam.source.file_name}</p><span className="chapter-arrow">↗</span></Link> })}</div> : <EmptyState title="还没有可用的整卷模考" copy="内容处理完成后，带有“真题”或“模考”标记的 PDF 会出现在这里。" />}</div>
}
