import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Welcome from './components/Welcome'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import Menu from './components/Menu'
import Tables from './components/Tables'
import Order from './components/Order'

function App() {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  function handleLogin({ token, user }) {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }

  return (
    <Routes>
      <Route path="/" element={<Welcome user={user} />} />
      <Route path="/login" element={<Auth key="login" mode="login" onLogin={handleLogin} />} />
      <Route path="/signup" element={<Auth key="signup" mode="signup" onLogin={handleLogin} />} />

      <Route
        path="/app"
        element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
      >
        <Route index element={<Navigate to="menu" />} />
        <Route path="menu" element={<Menu />} />
        <Route path="tables" element={<Tables />} />
        <Route path="order" element={<Order />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App