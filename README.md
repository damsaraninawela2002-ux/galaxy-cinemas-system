# 🎬 Galaxy Cinema

A full-stack cinema ticket booking and management web application that allows customers to browse movies, select showtimes, reserve seats, complete payments, and receive booking confirmations.

The system also includes a secure and completely separated Admin Dashboard for managing movies, showtimes, bookings, users, and cinema-related data.

---

## ✨ Features

### 🎟️ Customer Features
- 🎬 Browse currently available movies
- 🔎 Search and view movie details
- 🕐 View available showtimes
- 💺 Interactive seat selection
- 🔒 Real-time seat availability per showtime
- 🛒 Booking summary and price calculation
- 💳 Secure payment flow
- 🎫 Booking confirmation
- 📱 QR-coded digital e-ticket
- 📋 View booking history
- ❌ Seats are not permanently reserved when payment fails
- 📱 Fully responsive customer interface

### 🔐 Authentication & Security
- Separate Customer Login and Admin Login
- JWT-based authentication
- Role-based access control
- Protected customer routes & protected admin routes
- Separate customer and admin sessions
- Cross-role login prevention
- Generic invalid-credential messages
- Admin dashboard is not publicly linked
- Unauthorized users cannot access protected admin pages

### 🛠️ Admin Dashboard
- 📊 Dashboard overview (revenue, bookings, stats)
- 🎞️ Movie management (full CRUD operations)
- 🕐 Showtime management (full CRUD operations)
- 🎟️ Booking management & live monitoring
- 👥 Customer/user management
- 🔄 Instant live updates reflected on the customer portal


## 🛠️ Tech Stack
- **Frontend:** React.js,CSS
- **Backend:** Node.js, Express.js 
- **Database:** MySQL

 ⚙️ Quick Setup

### 1. Database
- Start **Apache** & **MySQL** in XAMPP.
- Create a database named `galaxy_cinema` in phpMyAdmin and import `database/galaxy_cinema.sql`.

### 2. Backend Setup
```bash
cd Backend
npm install
cp .env.example .env
npm run dev
   cd Frontend
npm install

3. Frontend Setup
cd Frontend
npm install
cp .env.example .env
npm run dev

Open http://localhost:5173 in  browser.

🗺️ Booking Flow

Movie ──▶ Showtime ──▶ Select Seats ──▶ Payment ──▶ QR E-Ticket

👩‍💻 Author
Damsarini

Full-Stack Web Development Project

📄 License
This project is open for educational and portfolio evaluation purposes.


