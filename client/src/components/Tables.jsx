import { useState, useEffect } from 'react'
import { api } from '../api'

function Tables() {
  const [tables, setTables] = useState([])

  useEffect(() => {
    const load = () => api.get('/tables').then(setTables).catch(console.error)
    load()
    const timer = setInterval(load, 5000)
    return () => clearInterval(timer)
  }, [])

  const count = (status) => tables.filter((t) => t.status === status).length

  return (
    <div>
      <h2>Tables</h2>

      <div className="stats">
        <div className="stat"><span className="badge free">Free</span> {count('free')}</div>
        <div className="stat"><span className="badge occupied">Occupied</span> {count('occupied')}</div>
        <div className="stat"><span className="badge reserved">Reserved</span> {count('reserved')}</div>
      </div>

      <div className="grid">
        {tables.map((t) => (
          <div key={t.id} className={`card table-card status-${t.status}`}>
            <h3>Table {t.table_number}</h3>
            <p className="muted">{t.seats} seats</p>
            <span className={`badge ${t.status}`}>{t.status}</span>
          </div>
        ))}
      </div>

      <p className="muted">Updates automatically every 5 seconds.</p>
    </div>
  )
}

export default Tables