require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./config/db'); // db connection pool එක

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const movieRoutes = require('./routes/movieRoutes');
const authRoutes = require('./routes/authRoutes');
const showRoutes = require('./routes/showRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');

app.use('/api/movies', movieRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/admin/auth', adminAuthRoutes);

const PORT = process.env.PORT || 5000;

// Server start කර database connect වූ බව check කිරීම
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  try {
    const connection = await db.getConnection();
    console.log('✅ MySQL Database Connected Successfully!');
    connection.release();
  } catch (err) {
    console.error('❌ Database Connection Failed:', err.message);
  }
});
