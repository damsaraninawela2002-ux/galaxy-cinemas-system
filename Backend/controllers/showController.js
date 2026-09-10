const db = require('../config/db');

// Show එකක විස්තර සහ අදාළ Screen එකේ සියලු Seats ලබාගැනීම
exports.getShowDetails = async (req, res) => {
  const { showId } = req.params;
  try {
    const [show] = await db.query(
      `SELECT s.*, m.title, m.poster_url, c.name AS cinema_name, sc.screen_name 
       FROM shows s
       JOIN movies m ON s.movie_id = m.movie_id
       JOIN screens sc ON s.screen_id = sc.screen_id
       JOIN cinemas c ON sc.cinema_id = c.cinema_id
       WHERE s.show_id = ?`, [showId]
    );

    if (show.length === 0) return res.status(404).json({ message: 'Show not found' });

    // Screen එකට අදාළ සියලු Seats
    const [seats] = await db.query('SELECT * FROM seats WHERE screen_id = ?', [show[0].screen_id]);

    // දැනටමත් මෙම Show එක සඳහා Book කර ඇති Seats
    const [bookedSeats] = await db.query(
      `SELECT bs.seat_id FROM booking_seats bs
       JOIN bookings b ON bs.booking_id = b.booking_id
       WHERE b.show_id = ? AND b.booking_status = 'confirmed'`, [showId]
    );

    const bookedSeatIds = bookedSeats.map(b => b.seat_id);

    res.status(200).json({
      show: show[0],
      seats,
      bookedSeatIds
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};exports.addShow = async (req, res) => {
  const { movie_id, screen_id, show_date, start_time, end_time, ticket_price } = req.body;
  try {
    await db.query(
      `INSERT INTO shows (movie_id, screen_id, show_date, start_time, end_time, ticket_price) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [movie_id, screen_id, show_date, start_time, end_time, ticket_price]
    );
    res.status(201).json({ message: 'Showtime scheduled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};