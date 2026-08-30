import { HashRouter, Link, Route, Routes } from 'react-router-dom'

export function App() {
  return (
    <HashRouter>
      <div className="site-shell">
        <header className="site-header">
          <Link className="brand" to="/" aria-label="返回首页">
            <span className="brand-mark">实</span>
            <span>
              <strong>2026 咨询实务题库</strong>
              <small>现代咨询方法与实务 · 复习工作台</small>
            </span>
          </Link>
          <nav aria-label="主导航">
            <Link to="/">章节复习</Link>
            <Link to="/exams">整卷模考</Link>
            <Link to="/review">待复习</Link>
          </nav>
        </header>
        <main className="page-container">
          <Routes>
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  )
}

function LandingPage() {
  return (
    <section className="hero-panel" aria-labelledby="hero-title">
      <p className="eyebrow">2026 备考 · 实务</p>
      <h1 id="hero-title">把每一道案例题，<em>练成解题路径。</em></h1>
      <p className="hero-copy">
        以章节为主线，把题干、计算过程、评分关键词和易错点放在同一张题卡里。先写下你的思路，再展开解析。
      </p>
      <div className="hero-actions">
        <Link className="button button-primary" to="/chapters/1">从第一章开始</Link>
        <Link className="button button-secondary" to="/exams">进入整卷模考</Link>
      </div>
      <div className="hero-stats" aria-label="题库概览">
        <div><strong>11</strong><span>章节</span></div>
        <div><strong>60</strong><span>份资料</span></div>
        <div><strong>980</strong><span>页原始内容</span></div>
      </div>
    </section>
  )
}
