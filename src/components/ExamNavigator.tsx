export function ExamNavigator({ count, current, answered, onSelect }: { count: number; current: number; answered: boolean[]; onSelect: (index: number) => void }) {
  return <nav className="exam-navigator" aria-label="试卷题号导航">{Array.from({ length: count }, (_, index) => <button key={index} className={`${index === current ? 'current ' : ''}${answered[index] ? 'answered' : ''}`} aria-label={`第 ${index + 1} 题${answered[index] ? '，已作答' : ''}`} aria-current={index === current ? 'step' : undefined} onClick={() => onSelect(index)}>{index + 1}</button>)}</nav>
}
