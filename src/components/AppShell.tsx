import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthGate'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth()

  return (
    <div className="site-shell">
      <header className="site-header">
        <Link className="brand" to="/" aria-label="返回首页">
          <span className="brand-mark">实</span>
          <span>
            <strong>2026 咨询实务题库</strong>
            <small>现代咨询方法与实务 · 复习工作台</small>
          </span>
        </Link>
        <nav className="main-nav" aria-label="主导航">
          <NavLink to="/" end>章节复习</NavLink>
          <NavLink to="/exams">整卷模考</NavLink>
          <NavLink to="/review">待复习</NavLink>
          <NavLink to="/search">搜索</NavLink>
          <button className="auth-logout" type="button" onClick={logout}>退出</button>
        </nav>
      </header>
      <main className="page-container">{children}</main>
    </div>
  )
}
