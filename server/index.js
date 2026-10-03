import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from './db.js'

const app = express()
app.use(cors())
app.use(express.json())

// ---------- AUTH HELPERS ----------
function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '')
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Please log in' })
  }
}

function makeToken(user) {
  return jwt.sign({ id: user.id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

// ---------- AUTH ROUTES ----------
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password || password.length < 6) {
    return res.status(400).json({ error: 'Name, email and a password of 6+ characters are required' })
  }
  const [existing] = await pool.query('SELECT id FROM users WHERE email=?', [email])
  if (existing.length) return res.status(409).json({ error: 'Email already registered' })

  const hash = await bcrypt.hash(password, 10)
  const [r] = await pool.query(
    'INSERT INTO users (name, email, password_hash) VALUES (?,?,?)',
    [name, email, hash]
  )
  const user = { id: r.insertId, name }
  res.status(201).json({ token: makeToken(user), user })
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  const [[user]] = await pool.query('SELECT * FROM users WHERE email=?', [email])
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }
  res.json({ token: makeToken(user), user: { id: user.id, name: user.name } })
})

// ---------- MENU + TABLES (logged-in users, read only) ----------
app.get('/api/menu', auth, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM menu_items ORDER BY category, id')
  res.json(rows)
})

app.get('/api/tables', auth, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM restaurant_tables ORDER BY table_number')
  res.json(rows)
})

// ---------- ORDERS (each user sees only their own) ----------
app.get('/api/orders', auth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT o.id, o.status, o.created_at, t.table_number,
            COALESCE(SUM(oi.quantity * oi.price), 0) AS subtotal
     FROM orders o
     JOIN restaurant_tables t ON t.id = o.table_id
     LEFT JOIN order_items oi ON oi.order_id = o.id
     WHERE o.user_id = ?
     GROUP BY o.id, t.table_number
     ORDER BY o.id DESC`,
    [req.user.id]
  )
  res.json(rows)
})

app.post('/api/orders', auth, async (req, res) => {
  const { table_id, items } = req.body
  if (!table_id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Pick a table and at least one item' })
  }

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const [[table]] = await conn.query(
      'SELECT status FROM restaurant_tables WHERE id=? FOR UPDATE',
      [table_id]
    )
    if (!table || table.status !== 'free') {
      await conn.rollback()
      return res.status(409).json({ error: 'That table is not available' })
    }

    const [o] = await conn.query('INSERT INTO orders (table_id, user_id) VALUES (?,?)', [
      table_id,
      req.user.id,
    ])

    for (const it of items) {
      const qty = Number(it.quantity)
      const [[menu]] = await conn.query(
        'SELECT price FROM menu_items WHERE id=? AND available=TRUE',
        [it.menu_item_id]
      )
      if (!menu || !Number.isInteger(qty) || qty < 1) throw new Error('Invalid item in order')
      await conn.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?,?,?,?)',
        [o.insertId, it.menu_item_id, qty, menu.price]
      )
    }

    await conn.query("UPDATE restaurant_tables SET status='occupied' WHERE id=?", [table_id])
    await conn.commit()
    res.status(201).json({ id: o.insertId })
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
})

// ---------- PAY BILL (own orders only) ----------
app.post('/api/orders/:id/bill', auth, async (req, res) => {
  const [[order]] = await pool.query('SELECT * FROM orders WHERE id=? AND user_id=?', [
    req.params.id,
    req.user.id,
  ])
  if (!order) return res.status(404).json({ error: 'Order not found' })
  if (order.status === 'paid') return res.status(409).json({ error: 'Already paid' })

  const [[row]] = await pool.query(
    'SELECT COALESCE(SUM(quantity*price),0) AS subtotal FROM order_items WHERE order_id=?',
    [order.id]
  )
  const subtotal = Number(row.subtotal)
  const tax = +(subtotal * 0.05).toFixed(2)
  const total = +(subtotal + tax).toFixed(2)

  await pool.query('INSERT INTO bills (order_id, subtotal, tax, total) VALUES (?,?,?,?)', [
    order.id, subtotal, tax, total,
  ])
  await pool.query("UPDATE orders SET status='paid' WHERE id=?", [order.id])
  await pool.query("UPDATE restaurant_tables SET status='free' WHERE id=?", [order.table_id])
  res.status(201).json({ order_id: order.id, subtotal, tax, total })
})

// ---------- ERRORS + START ----------
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: err.message })
})

app.listen(process.env.PORT || 5000, () => console.log('Server running on port 5000'))