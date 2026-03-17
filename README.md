# 🧵 Taar se Taar — Backend

Node.js + Express + SQLite backend for the Taar se Taar handmade products website.

---

## 📁 Folder Structure

```
backend/
├── server.js        ← Main Express server
├── db.js            ← SQLite database setup
├── package.json     ← Dependencies
├── .env             ← Configuration (passwords, port)
├── orders.db        ← Auto-created on first run
└── admin/
    └── index.html   ← Admin orders panel
```

---

## ⚡ Setup & Run

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Configure .env
Open `.env` and update:
```
PORT=3000
ADMIN_PASSWORD=your-secret-password   ← Change this!
FRONTEND_URL=http://your-website-url
```

### 3. Start the server
```bash
# Production
npm start

# Development (auto-restarts on file changes)
npm run dev
```

Server runs at → **http://localhost:3000**
Admin panel  → **http://localhost:3000/admin**

---

## 🔌 API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET    | `/` | Health check |
| POST   | `/api/orders` | Save a new order |
| GET    | `/api/orders?password=xxx` | Get all orders (admin) |
| GET    | `/api/orders/:id?password=xxx` | Get one order (admin) |
| PATCH  | `/api/orders/:id/status` | Update order status |
| DELETE | `/api/orders/:id` | Delete an order |

---

## 📲 Connect to Your Frontend (index.html)

In your `index.html`, find the `submitOrder` function and replace the WhatsApp block with an API call:

```javascript
async function submitOrder(e) {
  e.preventDefault();

  const name    = document.getElementById('oName').value.trim();
  const phone   = document.getElementById('oPhone').value.trim();
  const product = document.getElementById('oProduct').value;
  const qty     = document.getElementById('oQty').value;
  const address = document.getElementById('oAddress').value.trim();
  const notes   = document.getElementById('oNotes').value.trim();

  const res = await fetch('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone, product, quantity: qty, address, notes })
  });

  const data = await res.json();
  if (data.success) {
    document.getElementById('orderSuccess').classList.add('show');
    document.getElementById('orderForm').reset();
  } else {
    alert(data.message);
  }
}
```

> Replace `http://localhost:3000` with your deployed server URL when going live.

---

## 🖥️ Admin Panel

Open **http://localhost:3000/admin** in your browser.

- Enter your admin password (set in `.env`)
- View all orders in a table
- Search by name, phone, or product
- Filter by status
- Update order status (Pending → Confirmed → Shipped → Delivered)

---

## 🚀 Deployment Options (Free)

| Platform | Notes |
|----------|-------|
| **Railway** | Easiest — connects to GitHub, auto-deploys |
| **Render** | Free tier, good for Node.js |
| **Cyclic** | Simple, free Node.js hosting |

> ⚠️ SQLite `orders.db` file is stored on the server disk.
> On free hosting tiers, this may reset on restart — upgrade to a persistent disk or switch to a free PostgreSQL database (e.g. Neon.tech) for production.

---

## 🔒 Security Notes

- Always change `ADMIN_PASSWORD` in `.env` before going live
- Never commit `.env` to GitHub — add it to `.gitignore`
- CORS is set to `FRONTEND_URL` — update this to your live website URL
