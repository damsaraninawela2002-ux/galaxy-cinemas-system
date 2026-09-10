import API, { apiService } from './api';

/**
 * Normalizes movie object fields ensuring consistency across backend responses
 */
export const normalizeMovie = (movie) => {
  if (!movie) return null;

  // Handle genre array vs string
  let genre = movie.genre || movie.genres || [];
  if (typeof genre === 'string') {
    try {
      genre = JSON.parse(genre);
    } catch {
      genre = genre.split(',').map((g) => g.trim()).filter(Boolean);
    }
  }
  if (!Array.isArray(genre)) genre = [];

  // Handle cast array vs string
  let cast = movie.cast || [];
  if (typeof cast === 'string') {
    try {
      cast = JSON.parse(cast);
    } catch {
      cast = cast.split(',').map((c) => c.trim()).filter(Boolean);
    }
  }
  if (!Array.isArray(cast)) cast = [];

  const duration = Number(movie.duration || movie.duration_minutes || 120);

  return {
    ...movie,
    movie_id: Number(movie.movie_id || movie.id),
    id: Number(movie.movie_id || movie.id),
    genre,
    cast,
    duration,
    duration_minutes: duration,
    poster_url: movie.poster_url || '/images/1.jfif',
    backdrop_url: movie.backdrop_url || movie.poster_url || '/images/1.jfif',
    status: movie.status || 'now_showing',
    rating: String(movie.rating || '4.5')
  };
};

/**
 * Fetch all movies from backend API
 * @param {object} [params] - optional query filters { search, status, genre_id }
 * @returns {Promise<Array>} Normalized array of movies
 */
export const getMovies = async (params = {}) => {
  const res = await apiService.getMovies(params);
  const data = res?.data?.data || (Array.isArray(res?.data) ? res.data : []);
  return (data || []).map(normalizeMovie);
};

/**
 * Fetch a single movie by ID from backend API
 * @param {number|string} id - Movie ID
 * @returns {Promise<object>} Normalized movie object
 */
export const getMovie = async (id) => {
  const res = await apiService.getMovie(id);
  const data = res?.data?.data || res?.data || null;
  if (!data || !data.title) {
    throw new Error('Movie not found');
  }
  return normalizeMovie(data);
};

/**
 * Create a new movie (Admin only)
 * @param {object} movieData
 */
export const createMovie = async (movieData) => {
  return apiService.addMovie(movieData);
};

/**
 * Update an existing movie (Admin only)
 * @param {number|string} id
 * @param {object} movieData
 */
export const updateMovie = async (id, movieData) => {
  return apiService.editMovie({ ...movieData, movie_id: id });
};

/**
 * Delete a movie by ID (Admin only)
 * @param {number|string} id
 */
export const deleteMovie = async (id) => {
  return apiService.deleteMovie(id);
};

export default {
  getMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
  normalizeMovie
};
