import { Link } from 'react-router-dom'

function Welcome({ user }) {
  return (
    <div className="hero">
      <h1>
        Welcome to <span className="gradient-text">DineFlow</span>
      </h1>
      <p>Browse the menu, check which tables are free, and order, all in one place.</p>
      <div className="hero-actions">
        {user ? (
          <Link to="/app/menu" className="btn">Go to dashboard</Link>
        ) : (
          <>
            <Link to="/login" className="btn">Log in</Link>
            <Link to="/signup" className="btn btn-ghost">Sign up</Link>
          </>
        )}
      </div>
    </div>
  )
}

export default Welcome