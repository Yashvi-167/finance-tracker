# BizManager — Business Management System

A full-stack, production-ready SaaS Business Management System tailored for small businesses. Built with React (Vite), Tailwind CSS, Node.js, Express, and Neon (Serverless PostgreSQL) via Prisma ORM.

## Features

- **Authentication System:** JWT-based login, signup, and role-based access (Admin/Staff).
- **Dashboard:** KPIs, sales vs. expenses charts, recent orders, and low-stock alerts.
- **Inventory Management:** Full CRUD, search, category filtering, and automated low-stock warnings.
- **Order Management:** Create orders, auto-deduct stock, track status, and export PDF invoices.
- **Expense Tracking:** Log business expenses, view monthly summaries by category with pie charts.
- **Customer CRM:** Manage customer details and view their order history/lifetime value.
- **Sales Analytics:** Advanced charting for revenue, net profit, and top-performing products.
- **UI/UX:** Modern dark theme, glassmorphism UI, responsive design, and micro-animations.

---

## Tech Stack

- **Frontend:** React 18, Vite, React Router, Tailwind CSS, Recharts, jsPDF, Axios.
- **Backend:** Node.js, Express, Prisma ORM, bcryptjs, JSON Web Tokens (JWT).
- **Database:** Neon (Serverless PostgreSQL).

---

## Prerequisites

1. **Node.js** (v18+)
2. **Neon Database:** Sign up at [neon.tech](https://neon.tech), create a PostgreSQL project, and copy the connection string.

---

## Setup Instructions

### 1. Backend Setup

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Open the `.env` file and replace the `DATABASE_URL` with your Neon connection string. Also, set a strong `JWT_SECRET`.
5. Sync the Prisma schema to your Neon database:
   ```bash
   npx prisma db push
   ```
6. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The API will be running on `http://localhost:5000`.*

### 2. Frontend Setup

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will be available at `http://localhost:5173`.*

---

## Usage Guide

1. **Create an Account:** Go to `http://localhost:5173/signup` and create an "Admin" account.
2. **Setup Inventory:** Go to the "Inventory" tab and add some products with prices and stock quantities.
3. **Manage Customers:** Go to "Customers" and add clients.
4. **Create Orders:** Go to "Orders", click "Create Order", select a customer, add products, and submit. Watch the inventory automatically update!
5. **Download Invoice:** In the Orders table, click the download icon to generate a professional PDF invoice.
6. **Track Expenses:** Log your rent, utilities, and stock costs in the "Expenses" tab.
7. **View Analytics:** Head to the Dashboard or Sales Report to see your business performance visually!

---

## License
MIT License. Feel free to use and modify for your business!
