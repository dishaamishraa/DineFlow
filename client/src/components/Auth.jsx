import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'

function Auth({ mode, onLogin }) {
  const isSignup = mode === 'signup'
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.post(isSignup ? '/auth/register' : '/auth/login', form)
      onLogin(data)
      navigate('/app/menu')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>{isSignup ? 'Create your account' : 'Welcome back'}</h2>
        <p className="muted" style={{ marginBottom: 20 }}>
          {isSignup ? 'Sign up to order and book a table.' : 'Log in to continue to DineFlow.'}
        </p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <input className="field" name="name" placeholder="Full name" value={form.name} onChange={handleChange} required />
          )}
          <input className="field" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input className="field" name="password" type="password" placeholder="Password (6+ characters)" value={form.password} onChange={handleChange} required />
          <button className="btn" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Please wait...' : isSignup ? 'Sign up' : 'Log in'}
          </button>
        </form>

        <div className="switch">
          {isSignup ? (
            <>Already have an account? <Link to="/login">Log in</Link></>
          ) : (
            <>New here? <Link to="/signup">Create an account</Link></>
          )}
        </div>
      </div>
    </div>
  )
}

export default Auth