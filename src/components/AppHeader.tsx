import { NavLink } from 'react-router-dom'

/** 全ページ共通のヘッダー。ロゴ＋タイトルと、通常/比較を切り替えるナビを持つ。 */
export default function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header-brand">
        <img
          className="app-header-logo"
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt="株式会社ズコーシャ"
        />
        <span className="app-header-title">
          <span className="app-header-product">Mimori</span>
          <span className="app-header-for">for 【DEMO】牧場</span>
        </span>
      </div>
      <nav className="app-header-nav">
        <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          通常表示
        </NavLink>
        <NavLink to="/compare" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          左右比較
        </NavLink>
      </nav>
    </header>
  )
}
