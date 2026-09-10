# 🎬 Cinema Seat & Movie Booking System

A full-stack web application designed for reserving cinema seats, managing showtimes, and booking movie tickets.

## 🚀 Features
- Interactive seat reservation flow (Movie → Showtime → Seat Selection → Checkout)
- User and Admin authentication
- Dynamic showtimes and movie management
- Form validation and error handling

## 🛠️ Tech Stack
- **Frontend:** React, Vite
- **Backend:** Node.js, Express.js
- **Database:** MySQL

## ⚙️ Local Setup Instructions

### 1. Database Setup
1. Open XAMPP and start Apache and MySQL.
2. Go to phpMyAdmin and import the SQL file located in the `/database` folder.

### 2. Backend Setup
```bash
cd Backend
npm install
cp .env.example .env
# Open .env and adjust your MySQL connection details
npm run dev
```

*(Alternatively, PHP backend is available in `backend-php/` and can be served via Apache/XAMPP at `http://localhost/galaxy_cinema_api`)*

### 3. Frontend Setup
```bash
cd Frontend
npm install
cp .env.example .env
# Set VITE_ADMIN_LOGIN_PATH and VITE_API_BASE_URL
npm run dev
```

## 🔒 Authentication & Access Architecture
- **Customer Portal (`/login`):** Public customer authentication strictly checked against customer accounts. Redirects to `/` upon login.
- **Cross-Role Enforced:** Admin accounts cannot log in via the customer portal, and customer accounts cannot log in via the admin portal. Any cross-role attempts return generic `Invalid credentials`.
- **Zero Public Admin Links:** The customer-facing site contains no links, buttons, or hints leading to the admin login or console.

## Admin Access
Admin dashboard: {VITE_ADMIN_LOGIN_PATH} (set in `.env`, default `/admin/login`)
Not linked from the public site — access directly via URL.