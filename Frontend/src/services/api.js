import axios from 'axios';

const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost/galaxy_cinema_api';
const API_BASE_URL = RAW_API_BASE.replace(/\/$/, '') + (RAW_API_BASE.endsWith('/api') ? '' : '/api');

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Attach JWT token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Global response handler
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired, optionally handle
    }
    return Promise.reject(error);
  }
);

// Endpoints Service Map
export const apiService = {
  // Auth
  login: (data) => API.post('/auth.php?action=login', data),
  register: (data) =>
    API.post('/auth.php?action=register', data)
      .catch((err) => {
        if (!err.response || err.response.status >= 500) {
          return axios.post('http://localhost:5000/api/auth/register', data);
        }
        throw err;
      }),
  customerLogin: (data) =>
    API.post('/auth.php?action=customer-login', data)
      .catch((err) => {
        if (!err.response || err.response.status >= 500) {
          return axios.post('http://localhost:5000/api/auth/customer-login', data);
        }
        throw err;
      }),
  adminLogin: (data) =>
    API.post('/auth.php?action=admin-login', data)
      .catch((err) => {
        if (!err.response || err.response.status >= 500) {
          return axios.post('http://localhost:5000/api/auth/admin-login', data);
        }
        throw err;
      }),
  logout: () =>
    API.post('/auth.php?action=logout')
      .catch(() => axios.post('http://localhost:5000/api/auth/logout'))
      .catch(() => axios.post('http://localhost:5000/api/admin/auth/logout'))
      .catch(() => API.post('/api/auth/logout'))
      .catch(() => {}),
  getMe: () => API.get('/auth.php?action=me'),
  changePassword: (data) => API.post('/auth.php?action=change-password', data),

  // Dashboard
  getDashboard: () => API.get('/dashboard.php'),

  // Movies
  getMovies: (params) =>
    API.get('/movies.php', { params })
      .catch((err) => {
        if (!err.response || err.response.status >= 500) {
          return axios.get('http://localhost:5000/api/movies', { params });
        }
        throw err;
      }),
  getMovie: (id) =>
    API.get(`/movies.php?id=${id}`)
      .catch((err) => {
        if (!err.response || err.response.status >= 500) {
          return axios.get(`http://localhost:5000/api/movies/${id}`);
        }
        throw err;
      }),
  addMovie: (data) => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return API.post('/movies.php', data)
      .catch((err) => {
        if (!err.response || err.response.status >= 500) {
          return axios.post('http://localhost:5000/api/movies', data, { headers });
        }
        throw err;
      });
  },
  editMovie: (data) => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const id = data.movie_id || data.id;
    return API.put(`/movies.php?id=${id}`, data)
      .catch((err) => {
        if (!err.response || err.response.status >= 500) {
          return axios.put(`http://localhost:5000/api/movies/${id}`, data, { headers });
        }
        throw err;
      });
  },
  deleteMovie: (id) => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return API.delete(`/movies.php?id=${id}`)
      .catch((err) => {
        if (!err.response || err.response.status >= 500) {
          return axios.delete(`http://localhost:5000/api/movies/${id}`, { headers });
        }
        throw err;
      });
  },
  uploadPoster: (formData) => API.post('/movies.php?action=upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Genres
  getGenres: () => API.get('/genres.php'),
  addGenre: (data) => API.post('/genres.php', data),
  editGenre: (data) => API.put('/genres.php', data),
  deleteGenre: (id) => API.delete(`/genres.php?id=${id}`),

  // Cinemas
  getCinemas: () => API.get('/cinemas.php'),
  getCinema: (id) => API.get(`/cinemas.php?id=${id}`),
  addCinema: (data) => API.post('/cinemas.php', data),
  editCinema: (data) => API.put('/cinemas.php', data),
  deleteCinema: (id) => API.delete(`/cinemas.php?id=${id}`),

  // Halls / Screens
  getHalls: (cinemaId) => API.get('/halls.php', { params: cinemaId ? { cinema_id: cinemaId } : {} }),
  getHall: (id) => API.get(`/halls.php?id=${id}`),
  addHall: (data) => API.post('/halls.php', data),
  editHall: (data) => API.put('/halls.php', data),
  deleteHall: (id) => API.delete(`/halls.php?id=${id}`),

  // Seats
  getSeats: (params) => API.get('/seats.php', { params }),
  generateSeats: (data) => API.post('/seats.php?action=generate', data),
  toggleSeat: (data) => API.put('/seats.php', data),
  deleteSeat: (id) => API.delete(`/seats.php?id=${id}`),

  // Showtimes
  getShowtimes: (params) => API.get('/showtimes.php', { params }),
  getShowtime: (id) => API.get(`/showtimes.php?id=${id}`),
  addShowtime: (data) => API.post('/showtimes.php', data),
  editShowtime: (data) => API.put('/showtimes.php', data),
  deleteShowtime: (id) => API.delete(`/showtimes.php?id=${id}`),

  // Bookings
  getBookings: (params) => API.get('/bookings.php', { params }),
  getBooking: (id) => API.get(`/bookings.php?id=${id}`),
  updateBookingStatus: (data) => API.put('/bookings.php', data),

  // Users
  getUsers: (params) => API.get('/users.php', { params }),
  getUser: (id) => API.get(`/users.php?id=${id}`),
  toggleUserStatus: (data) => API.put('/users.php', data),
  deleteUser: (id) => API.delete(`/users.php?id=${id}`),

  // Payments
  getPayments: (params) => API.get('/payments.php', { params }),
  refundPayment: (data) => API.post('/payments.php?action=refund', data),

  // Offers & Promos
  getOffers: () => API.get('/offers.php'),
  addOffer: (data) => API.post('/offers.php', data),
  editOffer: (data) => API.put('/offers.php', data),
  deleteOffer: (id) => API.delete(`/offers.php?id=${id}`),

  getPromoCodes: () => API.get('/promo_codes.php'),
  addPromoCode: (data) => API.post('/promo_codes.php', data),
  editPromoCode: (data) => API.put('/promo_codes.php', data),
  deletePromoCode: (id) => API.delete(`/promo_codes.php?id=${id}`),

  // Reports
  getReports: (startDate, endDate) => API.get('/reports.php', { params: { start_date: startDate, end_date: endDate } }),

  // Reviews
  getReviews: (movieId) => API.get('/reviews.php', { params: movieId ? { movie_id: movieId } : {} }),
  deleteReview: (id) => API.delete(`/reviews.php?id=${id}`),
  toggleReviewStatus: (data) => API.put('/reviews.php', data),

  // Notifications
  getNotifications: () => API.get('/notifications.php'),
  sendNotification: (data) => API.post('/notifications.php', data),
  deleteNotification: (id) => API.delete(`/notifications.php?id=${id}`),

  // Settings
  getSettings: () => API.get('/settings.php'),
  updateSettings: (data) => API.post('/settings.php', data),
};

export default API;
