import React, { createContext, useState, useContext, useEffect } from 'react';

const STORAGE_KEY = 'galaxy_booking_session';

const INITIAL_BOOKING = {
  movie: null,
  cinema: null,
  showtime: null,
  date: null,
  time: null,
  showtimeId: null,
  selectedSeats: [],
  subtotal: 0,
  bookingFee: 100, // Standard fixed booking fee in LKR
  totalAmount: 0,
  totalPrice: 0, // Backwards compatibility
  bookingConfirmation: null
};

const DEFAULT_BOOKING_CONTEXT = {
  booking: INITIAL_BOOKING,
  updateBooking: () => {},
  setSelectedMovie: () => {},
  setShowtimeSelection: () => {},
  setSelectedSeats: () => {},
  setBookingConfirmation: () => {},
  clearBooking: () => {}
};

const BookingContext = createContext(DEFAULT_BOOKING_CONTEXT);

export const BookingProvider = ({ children }) => {
  const [booking, setBooking] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            ...INITIAL_BOOKING,
            ...parsed,
            selectedSeats: Array.isArray(parsed.selectedSeats) ? parsed.selectedSeats : []
          };
        }
      }
      return INITIAL_BOOKING;
    } catch {
      return INITIAL_BOOKING;
    }
  });

  // Keep sessionStorage synced safely
  useEffect(() => {
    try {
      if (
        booking?.movie ||
        booking?.showtimeId ||
        (Array.isArray(booking?.selectedSeats) && booking.selectedSeats.length > 0) ||
        booking?.bookingConfirmation
      ) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(booking));
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, [booking]);

  // Listen for global logout event to reset stale booking selections immediately
  useEffect(() => {
    const handleLogout = () => {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {}
      setBooking(INITIAL_BOOKING);
    };
    window.addEventListener('app:logout', handleLogout);
    return () => window.removeEventListener('app:logout', handleLogout);
  }, []);

  const updateBooking = (newData = {}) => {
    setBooking(prev => {
      const safePrev = prev || INITIAL_BOOKING;
      const updated = { ...safePrev, ...newData };
      
      // Calculate seats subtotal safely
      const seats = Array.isArray(updated.selectedSeats) ? updated.selectedSeats : [];
      const ticketPrice = parseFloat(
        updated.showtime?.ticket_price || 
        (seats[0]?.price ? seats[0].price : 1500)
      );
      
      const subtotal = seats.reduce((acc, seat) => acc + (parseFloat(seat?.price) || ticketPrice), 0);
      const fee = updated.bookingFee !== undefined ? updated.bookingFee : 100;
      const total = subtotal > 0 ? subtotal + fee : 0;

      updated.subtotal = subtotal;
      updated.totalAmount = total;
      updated.totalPrice = total; // backwards compatibility

      return updated;
    });
  };

  const setSelectedMovie = (movie) => {
    if (movie) {
      updateBooking({ movie });
    }
  };

  const setShowtimeSelection = ({ date, time, showtimeId, showtime, cinema } = {}) => {
    updateBooking({
      date,
      time,
      showtimeId,
      showtime,
      cinema: cinema || showtime?.cinema || null
    });
  };

  const setSelectedSeats = (selectedSeats) => {
    updateBooking({ selectedSeats: Array.isArray(selectedSeats) ? selectedSeats : [] });
  };

  const setBookingConfirmation = (confirmation) => {
    updateBooking({ bookingConfirmation: confirmation });
  };

  const clearBooking = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
    setBooking(INITIAL_BOOKING);
  };

  return (
    <BookingContext.Provider
      value={{
        booking: booking || INITIAL_BOOKING,
        updateBooking,
        setSelectedMovie,
        setShowtimeSelection,
        setSelectedSeats,
        setBookingConfirmation,
        clearBooking
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  return context || DEFAULT_BOOKING_CONTEXT;
};

export default BookingContext;
