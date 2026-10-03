import { NavLink, Outlet, Link } from 'react-router-dom'

function Dashboard({ user, onLogout }) {
  return (
    <div>
      <header className="navbar">
        <Link to="/" className="brand">
          <span className="gradient-text">DineFlow</span>
        </Link>
        <nav className="nav-links">
          <NavLink to="/app/menu">Menu</NavLink>
          <NavLink to="/app/tables">Tables</NavLink>
          <NavLink to="/app/order">Order</NavLink>
        </nav>
        <div className="nav-right">
          <span>Hi, {user.name}</span>
          <button className="btn btn-ghost" onClick={onLogout}>Log out</button>
        </div>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  )
}

export default Dashboard