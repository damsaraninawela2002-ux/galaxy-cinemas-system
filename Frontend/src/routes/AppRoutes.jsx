import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import CustomerLayout from '../layouts/CustomerLayout';
import AdminLayout from '../admin/components/AdminLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';

// Customer Pages
import AuthSelect from '../AuthSelect';
import Home from '../Home';
import CustomerMovies from '../Movies';
import MovieDetails from '../MovieDetails';
import CustomerCinemas from '../Cinemas';
import CustomerShowtimes from '../Showtimes';
import Booking from '../Booking';
import SeatSelection from '../SeatSelection';
import BookingSummary from '../BookingSummary';
import BookingSuccess from '../BookingSuccess';
import Login from '../Login';
import Register from '../Register';
import ForgotPassword from '../ForgotPassword';
import MyBookings from '../MyBookings';
import Profile from '../Profile';
import Contact from '../Contact';

// Customer Complete Booking Flow Pages
import UserShowtimes from '../pages/user/Showtimes';
import UserSeatSelection from '../pages/user/SeatSelection';
import UserPayment from '../pages/user/Payment';
import UserBookingSuccess from '../pages/user/BookingSuccess';

// Admin Pages
import AdminLogin from '../admin/pages/AdminLogin';
import Dashboard from '../admin/pages/Dashboard';
import AdminMovies from '../admin/pages/Movies';
import AddMovie from '../admin/pages/AddMovie';
import EditMovie from '../admin/pages/EditMovie';
import AdminShowtimes from '../admin/pages/Showtimes';
import AdminCinemas from '../admin/pages/Cinemas';
import AdminSeats from '../admin/pages/Seats';
import AdminBookings from '../admin/pages/Bookings';
import AdminUsers from '../admin/pages/Users';
import AdminPayments from '../admin/pages/Payments';
import AdminOffers from '../admin/pages/Offers';
import AdminReports from '../admin/pages/Reports';
import AdminReviews from '../admin/pages/Reviews';
import AdminNotifications from '../admin/pages/Notifications';
import AdminSettings from '../admin/pages/Settings';

const AppRoutes = () => {
  const ADMIN_LOGIN_PATH = import.meta.env.VITE_ADMIN_LOGIN_PATH || '/admin/login';

  return (
    <Routes>
      {/* Standalone Admin Authentication */}
      <Route path={ADMIN_LOGIN_PATH} element={<AdminLogin />} />
      {ADMIN_LOGIN_PATH !== '/admin/login' && (
        <Route path="/admin/login" element={<Navigate to={ADMIN_LOGIN_PATH} replace />} />
      )}

      {/* Customer Routes with Customer Navbar & Footer */}
      <Route element={<CustomerLayout />}>
        {/* Core Customer Experience */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/movies" element={<CustomerMovies />} />
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/cinemas" element={<CustomerCinemas />} />
        <Route path="/showtimes" element={<CustomerShowtimes />} />
        <Route path="/contact" element={<Contact />} />

        {/* Customer Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/portal" element={<Navigate to="/login" replace />} />
        <Route path="/auth-select" element={<Navigate to="/login" replace />} />

        {/* Protected Customer Booking Funnel */}
        <Route path="/booking/:movieId" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
        <Route path="/booking/seats/:showId" element={<ProtectedRoute><SeatSelection /></ProtectedRoute>} />
        <Route path="/booking/summary" element={<ProtectedRoute><BookingSummary /></ProtectedRoute>} />
        <Route path="/booking/success" element={<ProtectedRoute><BookingSuccess /></ProtectedRoute>} />

        {/* Complete Customer Booking Flow (Movie -> Showtime -> Seat Selection -> Payment -> Success) */}
        <Route path="/showtimes/:movieId" element={<UserShowtimes />} />
        <Route path="/seat-selection" element={<ProtectedRoute><UserSeatSelection /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute><UserPayment /></ProtectedRoute>} />
        <Route path="/booking-success" element={<ProtectedRoute><UserBookingSuccess /></ProtectedRoute>} />

        {/* Protected Customer Account & Bookings */}
        <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Route>

      {/* Admin Protected SaaS Dashboard Routes with AdminLayout */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="movies" element={<AdminMovies />} />
        <Route path="movies/add" element={<AddMovie />} />
        <Route path="movies/edit/:id" element={<EditMovie />} />
        <Route path="showtimes" element={<AdminShowtimes />} />
        <Route path="cinemas" element={<AdminCinemas />} />
        <Route path="seats" element={<AdminSeats />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="offers" element={<AdminOffers />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Wildcard Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
