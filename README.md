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


## 🛠️ Technologies Used

* **Frontend:** React.js,  CSS3 
* **Backend:** Node.js, Express.js
* **Database:** MySQL
* **API Architecture:** RESTful API
* **Authentication:** JWT
* **Development Tools:** Visual Studio Code, XAMPP

---

### 2. Database Setup
1. Start Apache and MySQL via the **XAMPP Control Panel**.
2. Navigate to phpMyAdmin (`http://localhost/phpmyadmin`).
3. Create a new database named `galaxy_cinema`.
4. Import the provided SQL database schema located at `database/galaxy_cinema.sql`.

🗺️ Booking Flow

Movie ──▶ Showtime ──▶ Select Seats ──▶ Payment ──▶ QR E-Ticket

### 3. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd Backend
   Install the necessary packages:

Bash
npm install
Set up the environment variables:

Bash
cp .env.example .env
Update the .env file with your database credentials:

Code snippet
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=galaxy_cinema
JWT_SECRET=your_jwt_secret_key
Start the backend server:

Bash
npm run dev
Backend API will be active at http://localhost:5000.

4. Frontend Setup
Open a secondary terminal and navigate to the frontend directory:

Bash
cd Frontend
Install the frontend dependencies:

Bash
npm install
Create and configure the environment file:

Bash
cp .env.example .env
Start the React development environment:

Bash
npm run dev

Access the web application at http://localhost:5173.

   

👩‍💻 Author
Damsarini

Full-Stack Web Development Project

📄 License
This project is open for educational purposes.


