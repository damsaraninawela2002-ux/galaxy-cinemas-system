const db = require('../config/db');

exports.createBooking = async (req, res) => {
  const { userId = 4, showId, showtime_id, seatIds = [], totalAmount, paymentMethod = 'card' } = req.body;
  const sId = showtime_id || showId;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 0. Re-validate seat availability to prevent race conditions
    if (seatIds.length > 0) {
      const [existing] = await connection.query(
        `SELECT bs.seat_id 
         FROM booking_seats bs 
         JOIN bookings b ON bs.booking_id = b.booking_id 
         WHERE (b.showtime_id = ? OR b.show_id = ?) 
           AND b.booking_status != 'cancelled' 
           AND bs.seat_id IN (?)`,
        [sId, sId, seatIds]
      );

      if (existing.length > 0) {
        await connection.rollback();
        return res.status(409).json({ message: 'One or more seats have already been booked' });
      }
    }

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    // 1. Bookings table insert
    const [bookingResult] = await connection.query(
      `INSERT INTO bookings (user_id, showtime_id, total_amount, booking_status) 
       VALUES (?, ?, ?, 'confirmed')`,
      [userId, sId, totalAmount]
    );
    const bookingId = bookingResult.insertId;
    const bookingCode = `GC-${todayStr}-${String(bookingId % 1000).padStart(3, '0')}`;

    // 2. Booking Seats table
    for (const seatId of seatIds) {
      await connection.query(
        `INSERT INTO booking_seats (booking_id, seat_id) VALUES (?, ?)`,
        [bookingId, seatId]
      );
    }

    // 3. Payment table insert
    await connection.query(
      `INSERT INTO payments (booking_id, payment_method, amount, payment_status, paid_at) 
       VALUES (?, ?, ?, 'success', NOW())`,
      [bookingId, paymentMethod, totalAmount]
    );

    await connection.commit();
    res.status(201).json({ message: 'Booking successful!', bookingCode, bookingId, total_amount: totalAmount });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Booking failed', error: error.message });
  } finally {
    connection.release();
  }
};// User කෙනෙකුගේ සියලු Bookings ලබාගැනීම
exports.getUserBookings = async (req, res) => {
  const { userId } = req.params;
  try {
    const [bookings] = await db.query(
      `SELECT b.booking_id, b.booking_code, b.total_amount, b.booking_status, b.booked_at,
              m.title, s.show_date, s.start_time, c.name AS cinema_name, sc.screen_name,
              GROUP_CONCAT(st.seat_number SEPARATOR ', ') AS seats
       FROM bookings b
       JOIN shows s ON b.show_id = s.show_id
       JOIN movies m ON s.movie_id = m.movie_id
       JOIN screens sc ON s.screen_id = sc.screen_id
       JOIN cinemas c ON sc.cinema_id = c.cinema_id
       JOIN booking_seats bs ON b.booking_id = bs.booking_id
       JOIN seats st ON bs.seat_id = st.seat_id
       WHERE b.user_id = ?
       GROUP BY b.booking_id
       ORDER BY b.booked_at DESC`,
      [userId]
    );

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};