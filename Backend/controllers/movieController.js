const db = require('../config/db');

// Helper to normalize JSON/array fields
const normalizeMovie = (m) => {
  if (!m) return null;
  let genre = m.genre;
  if (typeof genre === 'string') {
    try {
      genre = JSON.parse(genre);
    } catch {
      genre = genre.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  if (!Array.isArray(genre)) genre = [];

  let cast = m.cast;
  if (typeof cast === 'string') {
    try {
      cast = JSON.parse(cast);
    } catch {
      cast = cast.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  if (!Array.isArray(cast)) cast = [];

  return {
    ...m,
    genre,
    cast,
    duration: m.duration || m.duration_minutes || 120,
    duration_minutes: m.duration || m.duration_minutes || 120,
    age_rating: m.age_rating || 'PG-13',
    rating: m.rating || '4.5',
    release_date: m.release_date
      ? (typeof m.release_date === 'string'
          ? m.release_date.split('T')[0]
          : m.release_date.toISOString?.().split('T')[0] || String(m.release_date))
      : ''
  };
};

exports.getAllMovies = async (req, res) => {
  try {
    const [movies] = await db.query('SELECT * FROM movies ORDER BY movie_id ASC');
    const normalized = movies.map(normalizeMovie);
    res.status(200).json(normalized);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMovieDetails = async (req, res) => {
  try {
    const [movie] = await db.query('SELECT * FROM movies WHERE movie_id = ?', [req.params.id]);
    if (movie.length === 0) return res.status(404).json({ message: 'Movie not found' });
    res.status(200).json(normalizeMovie(movie[0]));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addMovie = async (req, res) => {
  const {
    title,
    description,
    genre,
    release_date,
    duration,
    duration_minutes,
    language,
    age_rating,
    director,
    cast,
    poster_url,
    backdrop_url,
    trailer_url,
    status,
    rating
  } = req.body;

  const genreJson = Array.isArray(genre) ? JSON.stringify(genre) : (typeof genre === 'string' ? genre : '[]');
  const castJson = Array.isArray(cast) ? JSON.stringify(cast) : (typeof cast === 'string' ? cast : '[]');
  const dur = Number(duration || duration_minutes || 120);

  try {
    const [result] = await db.query(
      `INSERT INTO movies 
        (title, description, genre, release_date, duration, duration_minutes, language, age_rating, director, cast, poster_url, backdrop_url, trailer_url, status, rating) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        genreJson,
        release_date,
        dur,
        dur,
        language || 'English',
        age_rating || 'PG-13',
        director || '',
        castJson,
        poster_url || '',
        backdrop_url || '',
        trailer_url || '',
        status || 'coming_soon',
        rating || '4.5'
      ]
    );

    res.status(201).json({ success: true, message: 'Movie added successfully', movie_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMovie = async (req, res) => {
  const movieId = req.params.id || req.body.movie_id;
  const {
    title,
    description,
    genre,
    release_date,
    duration,
    duration_minutes,
    language,
    age_rating,
    director,
    cast,
    poster_url,
    backdrop_url,
    trailer_url,
    status,
    rating
  } = req.body;

  const genreJson = Array.isArray(genre) ? JSON.stringify(genre) : (typeof genre === 'string' ? genre : '[]');
  const castJson = Array.isArray(cast) ? JSON.stringify(cast) : (typeof cast === 'string' ? cast : '[]');
  const dur = Number(duration || duration_minutes || 120);

  try {
    await db.query(
      `UPDATE movies SET 
        title = ?, description = ?, genre = ?, release_date = ?, duration = ?, duration_minutes = ?, language = ?, age_rating = ?, director = ?, cast = ?, poster_url = ?, backdrop_url = ?, trailer_url = ?, status = ?, rating = ?
       WHERE movie_id = ?`,
      [
        title,
        description,
        genreJson,
        release_date,
        dur,
        dur,
        language || 'English',
        age_rating || 'PG-13',
        director || '',
        castJson,
        poster_url || '',
        backdrop_url || '',
        trailer_url || '',
        status || 'coming_soon',
        rating || '4.5',
        movieId
      ]
    );

    res.status(200).json({ success: true, message: 'Movie updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteMovie = async (req, res) => {
  const movieId = req.params.id;
  try {
    await db.query('DELETE FROM movies WHERE movie_id = ?', [movieId]);
    res.status(200).json({ success: true, message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};