# 🎬 Galaxy Cinema

A full-stack web application for reserving cinema seats, managing showtimes, and booking movie tickets — built with a complete customer booking flow and a separate, secured Admin Dashboard.

<!-- Add a banner/screenshot here once you have one: -->
<!-- ![Galaxy Cinema Banner](./docs/banner.png) -->

---

## ✨ Features

- 🎟️ **Interactive seat reservation flow** — Movie → Showtime → Seat Selection → Checkout → Booking Confirmation
- 🔐 **Separated User and Admin authentication** — Fully isolated login systems, roles, and sessions
- 🎞️ **Dynamic movie & showtime management** — Full CRUD from the Admin Dashboard, reflected live on the customer site
- 🧾 **Real-time seat availability** — Booked seats are locked per showtime and released automatically if payment fails
- 💳 **Payment flow** — Order summary, price breakdown, and booking confirmation with a QR-coded e-ticket
- 📊 **Admin analytics dashboard** — Total movies, bookings, users, revenue, and active shows at a glance
- ✅ **Form validation & error handling** — Robust error handling throughout both customer and admin flows
- 📱 **Fully responsive** — Dark, cinema-branded modern UI across desktop, tablet, and mobile

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS |
| **Backend** | Node.js, Express.js (or PHP backend) |
| **Database** | MySQL |
| **Auth** | JWT-based, role-separated sessions |

---

## ⚙️ Local Setup Instructions

### 1. Database Setup
1. Open **XAMPP** and start Apache and MySQL.
2. Go to **phpMyAdmin** and import the SQL file located in the `/database` folder.

### 2. Backend Setup
```bash
cd Backend
npm install
cp .env.example .env
# Open .env and adjust your MySQL connection details
npm run dev
