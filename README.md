# 💼 BizManager — Business Management System

<div align="center">

![BizManager Banner](https://img.shields.io/badge/BizManager-v1.0.0-6366f1?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwb2x5Z29uIHBvaW50cz0iMTMgMiAzIDE0IDEyIDE0IDExIDIyIDIxIDEwIDEyIDEwIDEzIDIiLz48L3N2Zz4=)

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Neon-PostgreSQL-00E5BF?style=flat-square&logo=postgresql)](https://neon.tech/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat-square&logo=vercel)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

**A full-stack, production-ready Business Management System built for small businesses.**  
Track orders, inventory, expenses, customers, and profits — all in one place. 🇮🇳 INR support included.

[🚀 Live Demo](https://finance-tracker-rho-nine.vercel.app) • [📖 Docs](#setup-instructions) • [🐛 Issues](https://github.com/Yashvi-167/finance-tracker/issues)

</div>

---

## ✨ Features

| Module | Description |
|--------|-------------|
| 🔐 **Authentication** | JWT-based login & signup with role-based access (Admin / Staff) |
| 📊 **Dashboard** | Real-time KPIs, Sales vs Expenses chart, Recent Orders, Low Stock alerts |
| 📦 **Inventory** | Full CRUD for products with cost price, selling price, shipping cost & stock levels |
| 🛒 **Orders** | Multi-step order creation, auto stock deduction, per-order shipping charge, profit calculation |
| 💸 **Expenses** | Log & categorize business expenses with pie charts and monthly breakdowns |
| 👥 **Customers** | CRM with order history, lifetime value tracking, and contact details |
| 📈 **Sales Analytics** | Monthly revenue vs expenses charts, net profit bars, Top 5 products by revenue |
| 🧾 **PDF Invoices** | One-click professional invoice PDF download per order |
| 💰 **Profit Tracking** | Per-order profit = Revenue − Cost Price − Shipping (shown in orders table) |
| 🌙 **Dark UI** | Premium glassmorphism dark theme with smooth micro-animations |

---

## 🛠 Tech Stack

### Frontend
- ⚛️ **React 18** + **Vite 5** — Fast, modern UI
- 🎨 **Tailwind CSS** — Utility-first styling
- 📉 **Recharts** — Beautiful charts and graphs
- 🧭 **React Router v6** — Client-side routing
- 📄 **jsPDF + jsPDF-AutoTable** — PDF invoice generation
- 🔔 **React Hot Toast** — Toast notifications
- 🌐 **Axios** — HTTP client with interceptors

### Backend
- 🟢 **Node.js** + **Express** — RESTful API (serverless on Vercel)
- 🔑 **JWT** — Stateless authentication
- 🔒 **bcryptjs** — Password hashing
- 🗄️ **Prisma ORM** — Type-safe database queries
- 🐘 **Neon (Serverless PostgreSQL)** — Cloud database

### Deployment
- ☁️ **Vercel** — Frontend + Serverless API functions
- 🐘 **Neon** — Managed PostgreSQL

---

## 📁 Project Structure

```
finance-tracker/
├── api/
│   └── index.js              # Vercel serverless entry point
├── prisma/
│   └── schema.prisma         # Database schema
├── server/
│   ├── config/db.js          # Prisma client
│   ├── controllers/          # Business logic
│   ├── middleware/           # Auth & error handlers
│   ├── routes/               # API route definitions
│   └── utils/                # Token & date helpers
├── src/
│   ├── api/                  # Axios API calls
│   ├── components/           # Reusable UI components
│   ├── context/              # Auth context
│   ├── pages/                # Page components
│   └── utils/                # PDF generator
├── .env                      # Environment variables (not committed)
├── vercel.json               # Vercel routing config
└── vite.config.mjs           # Vite config
```

---

## ⚙️ Setup Instructions

### Prerequisites
- **Node.js** v18+
- A **[Neon](https://neon.tech)** account (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/Yashvi-167/finance-tracker.git
cd finance-tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://your_user:your_password@your_host/neondb?sslmode=require&channel_binding=require"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRE="7d"
PORT=5000
NODE_ENV=development
CLIENT_URL="http://localhost:5173"
```

> 💡 Get your `DATABASE_URL` from your [Neon dashboard](https://console.neon.tech).

### 4. Push Database Schema

```bash
node ./node_modules/prisma/build/index.js db push
```

### 5. Run Locally

```bash
# Start the frontend dev server
npm run dev
```

The app will be available at **http://localhost:5173**.  
The API is proxied to **http://localhost:5000** via Vite config.

> **Note:** To run the backend locally, you'll need to start the Express server separately or use a tool like `nodemon` on `api/index.js`.

---

## 🚀 Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **Import Project** → select this repo
3. Add the following **Environment Variables** in Vercel project settings:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon connection string |
| `JWT_SECRET` | Your JWT secret key |
| `JWT_EXPIRE` | `7d` |
| `NODE_ENV` | `production` |

4. Click **Deploy** — Vercel handles the rest! ✅

---

## 📖 Usage Guide

### Getting Started

1. **Sign Up** — Go to `/signup`, enter your details, and select **Admin** role for full access
2. **Add Products** — Navigate to **Inventory**, click "Add Product", fill in name, category, selling price, cost price, and stock
3. **Add Customers** — Go to **Customers** and add your clients with contact details
4. **Create Orders** — Go to **Orders** → "Create Order":
   - Step 1: Select a customer
   - Step 2: Add products, quantities, and set a shipping charge
   - Step 3: Review and confirm — stock is automatically deducted!
5. **Download Invoice** — Click the ⬇️ icon on any order row to download a PDF invoice
6. **Track Expenses** — Log business costs (rent, salaries, utilities, etc.) in the **Expenses** tab
7. **View Sales Report** — Go to **Sales** for monthly revenue, expense, and profit charts

### Role Permissions

| Action | Admin | Staff |
|--------|-------|-------|
| View Dashboard | ✅ | ✅ |
| Create Orders | ✅ | ✅ |
| Delete Orders | ✅ | ❌ |
| Add/Edit Products | ✅ | ❌ |
| Delete Products | ✅ | ❌ |
| View Reports | ✅ | ✅ |

---

## 🧮 Profit Calculation

Each order shows a **Profit** column calculated as:

```
Profit = Total Order Amount − Σ(Cost Price × Quantity) − Order Shipping Charge
```

- **Green** = Profitable order 📈  
- **Red** = Loss-making order 📉

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Register a new user |
| `POST` | `/api/auth/login` | Login and get JWT token |
| `GET` | `/api/auth/me` | Get current user |
| `GET` | `/api/dashboard/stats` | Get KPI stats |
| `GET` | `/api/dashboard/charts` | Get chart data |
| `GET/POST` | `/api/products` | List / create products |
| `PUT/DELETE` | `/api/products/:id` | Update / delete product |
| `GET/POST` | `/api/orders` | List / create orders |
| `PUT/DELETE` | `/api/orders/:id` | Update / delete order |
| `GET` | `/api/orders/:id/invoice` | Get invoice data |
| `GET/POST` | `/api/customers` | List / create customers |
| `GET/POST` | `/api/expenses` | List / create expenses |
| `GET` | `/api/sales/report` | Get sales report by year |

---

## 📜 License

MIT License © 2025 — Free to use and modify for your business!

---

<div align="center">

Made with ❤️ and ☕ | Built for Indian small businesses 🇮🇳

⭐ **Star this repo** if you found it useful!

</div>
