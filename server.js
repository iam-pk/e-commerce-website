// server.js — Taar se Taar Backend
// Node.js + Express + SQLite

require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const db         = require('./db');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Serve admin panel (static HTML) ──────────────────────────
app.use('/admin', express.static(path.join(__dirname, 'admin')));


// ════════════════════════════════════════════════════════════
//  ROUTES
// ════════════════════════════════════════════════════════════

// ── Health check ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    app: 'Taar se Taar Backend',
    message: 'Handmade with ❤️'
  });
});


// ── POST /api/orders — Save a new order ──────────────────────
app.post('/api/orders', (req, res) => {
  const { name, phone, product, quantity, address, notes } = req.body;

  // Basic validation
  if (!name || !phone || !product || !quantity || !address) {
    return res.status(400).json({
      success: false,
      message: 'Please fill in all required fields: name, phone, product, quantity, address.'
    });
  }

  if (isNaN(quantity) || quantity < 1) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be a number greater than 0.'
    });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO orders (name, phone, product, quantity, address, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name.trim(),
      phone.trim(),
      product.trim(),
      parseInt(quantity),
      address.trim(),
      notes ? notes.trim() : null
    );

    console.log(`📦 New Order #${result.lastInsertRowid} — ${product} x${quantity} by ${name}`);

    return res.status(201).json({
      success: true,
      message: '🎉 Order placed successfully! The owner will contact you soon.',
      orderId: result.lastInsertRowid
    });

  } catch (err) {
    console.error('Error saving order:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
});


// ── GET /api/orders — Get all orders (admin only) ────────────
app.get('/api/orders', (req, res) => {
  const { password } = req.query;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorised. Wrong admin password.'
    });
  }

  try {
    const orders = db.prepare(`
      SELECT * FROM orders ORDER BY created_at DESC
    `).all();

    return res.json({
      success: true,
      total: orders.length,
      orders
    });

  } catch (err) {
    console.error('Error fetching orders:', err.message);
    return res.status(500).json({ success: false, message: 'Error fetching orders.' });
  }
});


// ── GET /api/orders/:id — Get a single order ─────────────────
app.get('/api/orders/:id', (req, res) => {
  const { password } = req.query;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Unauthorised.' });
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  return res.json({ success: true, order });
});


// ── PATCH /api/orders/:id/status — Update order status ───────
app.patch('/api/orders/:id/status', (req, res) => {
  const { password, status } = req.body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Unauthorised.' });
  }

  const validStatuses = ['Pending', 'Confirmed', 'In Progress', 'Shipped', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Choose from: ${validStatuses.join(', ')}`
    });
  }

  const result = db.prepare('UPDATE orders SET status = ? WHERE id = ?')
                   .run(status, req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  return res.json({ success: true, message: `Order #${req.params.id} marked as "${status}"` });
});


// ── DELETE /api/orders/:id — Delete an order ─────────────────
app.delete('/api/orders/:id', (req, res) => {
  const { password } = req.body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Unauthorised.' });
  }

  const result = db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  return res.json({ success: true, message: `Order #${req.params.id} deleted.` });
});


// ════════════════════════════════════════════════════════════
//  START SERVER
// ════════════════════════════════════════════════════════════
app.listen(PORT, () => {
  console.log('');
  console.log('🧵 ─────────────────────────────────────────');
  console.log('   Taar se Taar Backend is running!');
  console.log(`   Server  → http://localhost:${PORT}`);
  console.log(`   Admin   → http://localhost:${PORT}/admin`);
  console.log('🧵 ─────────────────────────────────────────');
  console.log('');
});
