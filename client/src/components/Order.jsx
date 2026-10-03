import { useState, useEffect } from 'react'
import { api } from '../api'

function Order() {
  const [menu, setMenu] = useState([])
  const [tables, setTables] = useState([])
  const [orders, setOrders] = useState([])
  const [tableId, setTableId] = useState('')
  const [quantities, setQuantities] = useState({})
  const [message, setMessage] = useState(null)

  useEffect(() => {
    const load = () => {
      api.get('/tables').then(setTables).catch(console.error)
      api.get('/orders').then(setOrders).catch(console.error)
    }
    api.get('/menu').then(setMenu).catch(console.error)
    load()
    const timer = setInterval(load, 5000)
    return () => clearInterval(timer)
  }, [])

  async function refresh() {
    setTables(await api.get('/tables'))
    setOrders(await api.get('/orders'))
  }

  function changeQty(id, delta) {
    const next = Math.max(0, (quantities[id] || 0) + delta)
    setQuantities({ ...quantities, [id]: next })
  }

  const freeTables = tables.filter((t) => t.status === 'free')
  const availableMenu = menu.filter((m) => m.available)
  const total = availableMenu.reduce(
    (sum, m) => sum + Number(m.price) * (quantities[m.id] || 0),
    0
  )

  async function placeOrder() {
    const items = Object.entries(quantities)
      .filter(([, q]) => q > 0)
      .map(([id, q]) => ({ menu_item_id: Number(id), quantity: q }))

    if (!tableId || items.length === 0) {
      setMessage({ type: 'error', text: 'Pick a table and at least one item' })
      return
    }

    try {
      await api.post('/orders', { table_id: Number(tableId), items })
      setTableId('')
      setQuantities({})
      setMessage({ type: 'success', text: 'Order placed!' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
    refresh()
  }

  async function payBill(orderId) {
    try {
      const bill = await api.post(`/orders/${orderId}/bill`)
      setMessage({
        type: 'success',
        text: `Paid ₹${bill.total} (₹${bill.subtotal} + 5% tax ₹${bill.tax}). Your table is free again.`,
      })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
    refresh()
  }

  return (
    <div>
      <h2>Place an order</h2>

      {message && (
        <div className={message.type === 'error' ? 'error' : 'success'}>{message.text}</div>
      )}

      <div className="panel">
        <select className="field" value={tableId} onChange={(e) => setTableId(e.target.value)}>
          <option value="">
            {freeTables.length ? 'Select a free table' : 'No free tables right now'}
          </option>
          {freeTables.map((t) => (
            <option key={t.id} value={t.id}>
              Table {t.table_number} ({t.seats} seats)
            </option>
          ))}
        </select>

        {availableMenu.map((m) => (
          <div key={m.id} className="order-row">
            <div>
              <strong>{m.name}</strong>
              <div className="muted">₹{Number(m.price)}</div>
            </div>
            <div className="qty">
              <button onClick={() => changeQty(m.id, -1)}>−</button>
              <span>{quantities[m.id] || 0}</span>
              <button onClick={() => changeQty(m.id, 1)}>+</button>
            </div>
          </div>
        ))}

        <div className="total-bar">
          <span>
            Subtotal: <span className="price">₹{total}</span>
          </span>
          <button className="btn" onClick={placeOrder}>Place order</button>
        </div>
      </div>

      <h2>My orders</h2>
      {orders.length === 0 && <p className="muted">No orders yet.</p>}
      <div className="grid">
        {orders.map((o) => (
          <div key={o.id} className="card">
            <h3>Order #{o.id}</h3>
            <p className="muted">Table {o.table_number}</p>
            <p className="price">₹{Number(o.subtotal)}</p>
            <p><span className={`badge ${o.status}`}>{o.status}</span></p>
            {o.status === 'open' && (
              <button className="btn" onClick={() => payBill(o.id)} style={{ marginTop: 8 }}>
                Pay bill
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Order