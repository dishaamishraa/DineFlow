import { useState, useEffect } from 'react'
import { api } from '../api'

function Menu() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/menu').then(setItems).catch(console.error).finally(() => setLoading(false))
  }, [])

  const categories = [...new Set(items.map((i) => i.category))]

  if (loading) return <p className="muted">Loading menu...</p>

  return (
    <div>
      <h2>Menu</h2>
      {categories.map((cat) => (
        <div key={cat}>
          <div className="category-title">{cat}</div>
          <div className="grid">
            {items
              .filter((i) => i.category === cat)
              .map((item) => (
                <div key={item.id} className="card">
                  <h3>{item.name}</h3>
                  <div className="price">₹{Number(item.price)}</div>
                  {!item.available && <span className="badge occupied">Unavailable</span>}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Menu