import React, { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import bookingService from '../../services/bookingService';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  ArrowRight,
  Tv,
  Film,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Ticket,
  AlertCircle
} from 'lucide-react';

const SeatSelection = () => {
  const navigate = useNavigate();
  const bookingCtx = useBooking();
  const booking = bookingCtx?.booking || {};
  const setSelectedSeats = bookingCtx?.setSelectedSeats || (() => {});
  const updateBooking = bookingCtx?.updateBooking || (() => {});

  const [loading, setLoading] = useState(true);
  const [seatsData, setSeatsData] = useState({
    seats: [],
    grid: {},
    bookedSeatIds: []
  });
  const [selectedSeatList, setSelectedSeatList] = useState(
    Array.isArray(booking?.selectedSeats) ? booking.selectedSeats : []
  );

  const movie = booking?.movie;
  const showtime = booking?.showtime;
  const showtimeId = booking?.showtimeId || showtime?.showtime_id;
  const dateStr = booking?.date || '';
  const timeStr = booking?.time || showtime?.start_time || '';
  const cinemaName = booking?.cinema?.name || showtime?.cinema_name || '';
  const ticketBasePrice = parseFloat(showtime?.ticket_price || 1500);

  // Critical requirement: on page load, fetch already-booked seats for this specific showtimeId
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    if (!showtimeId) {
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    bookingService.getBookedSeats(showtimeId)
      .then(res => {
        if (isMounted && res && res.success) {
          setSeatsData({
            seats: Array.isArray(res.seats) ? res.seats : [],
            grid: res.grid || {},
            bookedSeatIds: Array.isArray(res.bookedSeatIds) ? res.bookedSeatIds : []
          });
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoading(false);
          toast.error('Seat availability could not be loaded. Please try again.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [showtimeId]);

  const bookedIds = Array.isArray(seatsData?.bookedSeatIds) ? seatsData.bookedSeatIds : [];

  // Seat toggle handler
  const handleSeatClick = (seat) => {
    if (!seat) return;
    const isBooked = bookedIds.includes(seat.seat_id) || seat.status === 'booked';
    if (isBooked) {
      // Booked seats do nothing
      return;
    }

    const isAlreadySelected = selectedSeatList.some(s => s.seat_id === seat.seat_id);

    if (isAlreadySelected) {
      // Deselect
      const updated = selectedSeatList.filter(s => s.seat_id !== seat.seat_id);
      setSelectedSeatList(updated);
      setSelectedSeats(updated);
    } else {
      // Select
      const seatWithPrice = {
        ...seat,
        price: seat.price ? parseFloat(seat.price) : ticketBasePrice
      };
      const updated = [...selectedSeatList, seatWithPrice];
      setSelectedSeatList(updated);
      setSelectedSeats(updated);
    }
  };

  // Calculations
  const seatSubtotal = selectedSeatList.reduce(
    (sum, seat) => sum + (parseFloat(seat?.price) || ticketBasePrice),
    0
  );
  const bookingFee = selectedSeatList.length > 0 ? (booking.bookingFee || 100) : 0;
  const grandTotal = seatSubtotal > 0 ? seatSubtotal + bookingFee : 0;

  if (!movie || !showtimeId || !showtime) {
    return <Navigate to="/movies" replace />;
  }

  // Handle proceeding to Payment
  const handleProceedToPayment = () => {
    if (selectedSeatList.length === 0) return;

    updateBooking({
      selectedSeats: selectedSeatList,
      subtotal: seatSubtotal,
      bookingFee: 100,
      totalAmount: grandTotal,
      totalPrice: grandTotal
    });

    navigate('/payment');
  };

  // Group seats by row safely
  const rows = (seatsData?.grid && Object.keys(seatsData.grid).length > 0)
    ? seatsData.grid
    : (Array.isArray(seatsData?.seats) ? seatsData.seats : []).reduce((acc, s) => {
        const row = s?.row_label || s?.seat_number?.charAt(0) || 'A';
        if (!acc[row]) acc[row] = [];
        acc[row].push(s);
        return acc;
      }, {});

  const sortedRowKeys = Object.keys(rows).sort();

  return (
    <div className="bg-[#080B14] text-slate-100 min-h-screen py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back Link */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-white/[0.04] border border-white/[0.08] px-3.5 py-1.5 rounded-xl hover:bg-white/[0.08] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Showtimes
          </button>
        </div>

        {/* Header Summary Strip */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#101426] p-4 sm:p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              <Ticket className="w-3 h-3" /> Step 2: Choose Your Seats
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {movie?.title || 'Selected Movie'}
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-400 font-semibold">
              <span className="flex items-center gap-1 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-[#E50914]" />
                {cinemaName}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                {dateStr}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {timeStr}
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto border-white/[0.08]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Base Ticket Price
            </span>
            <span className="text-lg font-black text-amber-400">
              Rs. {ticketBasePrice.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Main 2-Column Seating Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left / Center Seating Area */}
          <div className="lg:col-span-8 rounded-3xl border border-white/[0.08] bg-[#0E1222] p-6 sm:p-8 flex flex-col items-center shadow-2xl">
            
            {/* Curved Screen Indicator */}
            <div className="w-full max-w-lg mb-10 text-center select-none">
              <div className="relative mb-3">
                <div className="h-2 w-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full shadow-[0_0_25px_rgba(99,102,241,0.9)]" />
                <div className="h-10 w-full bg-gradient-to-b from-indigo-500/15 to-transparent blur-sm -mt-1 pointer-events-none" />
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-black uppercase tracking-[3px] text-slate-400">
                <Tv className="w-3.5 h-3.5 text-indigo-400" />
                SCREEN
              </div>
            </div>

            {/* Seat Grid */}
            {loading ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Loading Seat Availability...
                </span>
              </div>
            ) : (
              <div className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10">
                <div className="min-w-[480px] flex flex-col items-center gap-3 select-none">
                  {sortedRowKeys.map((rowLabel) => {
                    const rowSeats = Array.isArray(rows[rowLabel]) ? rows[rowLabel] : [];
                    const midpoint = Math.ceil(rowSeats.length / 2);
                    const leftAisle = rowSeats.slice(0, midpoint);
                    const rightAisle = rowSeats.slice(midpoint);

                    return (
                      <div key={rowLabel} className="flex items-center gap-3 sm:gap-4">
                        {/* Row letter indicator left */}
                        <span className="w-5 text-center font-mono font-black text-xs text-slate-400">
                          {rowLabel}
                        </span>

                        {/* Left aisle seats */}
                        <div className="flex items-center gap-2">
                          {leftAisle.map((seat) => {
                            const isBooked = bookedIds.includes(seat?.seat_id) || seat?.status === 'booked';
                            const isSelected = selectedSeatList.some(s => s?.seat_id === seat?.seat_id);
                            const isVIP = seat?.seat_type === 'vip';

                            let seatStyle = 'relative flex items-center justify-center font-mono font-bold text-[11px] w-9 h-9 rounded-lg transition-all ';

                            if (isBooked) {
                              seatStyle += 'bg-rose-950/40 text-rose-700/60 border border-rose-900/30 cursor-not-allowed opacity-50';
                            } else if (isSelected) {
                              seatStyle += 'bg-indigo-600 text-white border-2 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.8)] scale-110 z-10 cursor-pointer';
                            } else if (isVIP) {
                              seatStyle += 'bg-[#181D33] text-amber-300 border border-amber-500/40 hover:border-amber-400 hover:scale-105 hover:bg-amber-500/15 cursor-pointer';
                            } else {
                              seatStyle += 'bg-[#101426] text-slate-300 border border-white/[0.12] hover:border-indigo-400 hover:text-white hover:bg-indigo-950/40 hover:scale-105 cursor-pointer';
                            }

                            return (
                              <button
                                key={seat?.seat_id || Math.random()}
                                type="button"
                                disabled={isBooked}
                                onClick={() => handleSeatClick(seat)}
                                title={
                                  isBooked
                                    ? `Seat ${seat?.seat_number} - Booked (Unavailable)`
                                    : `Seat ${seat?.seat_number} - Rs. ${seat?.price || ticketBasePrice}`
                                }
                                className={seatStyle}
                              >
                                {seat?.seat_number}
                              </button>
                            );
                          })}
                        </div>

                        {/* Center walking aisle gap */}
                        <div className="w-6 sm:w-8 text-center text-[11px] font-mono text-slate-600 opacity-40">
                          │
                        </div>

                        {/* Right aisle seats */}
                        <div className="flex items-center gap-2">
                          {rightAisle.map((seat) => {
                            const isBooked = bookedIds.includes(seat?.seat_id) || seat?.status === 'booked';
                            const isSelected = selectedSeatList.some(s => s?.seat_id === seat?.seat_id);
                            const isVIP = seat?.seat_type === 'vip';

                            let seatStyle = 'relative flex items-center justify-center font-mono font-bold text-[11px] w-9 h-9 rounded-lg transition-all ';

                            if (isBooked) {
                              seatStyle += 'bg-rose-950/40 text-rose-700/60 border border-rose-900/30 cursor-not-allowed opacity-50';
                            } else if (isSelected) {
                              seatStyle += 'bg-indigo-600 text-white border-2 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.8)] scale-110 z-10 cursor-pointer';
                            } else if (isVIP) {
                              seatStyle += 'bg-[#181D33] text-amber-300 border border-amber-500/40 hover:border-amber-400 hover:scale-105 hover:bg-amber-500/15 cursor-pointer';
                            } else {
                              seatStyle += 'bg-[#101426] text-slate-300 border border-white/[0.12] hover:border-indigo-400 hover:text-white hover:bg-indigo-950/40 hover:scale-105 cursor-pointer';
                            }

                            return (
                              <button
                                key={seat?.seat_id || Math.random()}
                                type="button"
                                disabled={isBooked}
                                onClick={() => handleSeatClick(seat)}
                                title={
                                  isBooked
                                    ? `Seat ${seat?.seat_number} - Booked (Unavailable)`
                                    : `Seat ${seat?.seat_number} - Rs. ${seat?.price || ticketBasePrice}`
                                }
                                className={seatStyle}
                              >
                                {seat?.seat_number}
                              </button>
                            );
                          })}
                        </div>

                        {/* Row letter indicator right */}
                        <span className="w-5 text-center font-mono font-black text-xs text-slate-400">
                          {rowLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Seat States Legend Strip */}
            <div className="mt-8 pt-6 border-t border-white/[0.08] w-full flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md bg-[#101426] border border-white/[0.15]" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md bg-[#181D33] border border-amber-500/40 flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                </div>
                <span>VIP (Rs. 2,000)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md bg-indigo-600 border border-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                <span className="font-bold text-white">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md bg-rose-950/50 border border-rose-900/40 opacity-60" />
                <span className="text-slate-400">Booked (Disabled)</span>
              </div>
            </div>

          </div>

          {/* Right Live Summary Panel */}
          <div className="lg:col-span-4 space-y-5">
            <div className="rounded-3xl border border-white/[0.08] bg-[#101426] p-6 shadow-2xl space-y-5">
              <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-white/[0.08]">
                <Ticket className="w-4 h-4 text-[#E50914]" />
                Booking Summary
              </h2>

              {/* Selected Seats Chips */}
              <div className="space-y-2">
                <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
                  Selected Seats ({selectedSeatList.length})
                </span>

                {selectedSeatList.length === 0 ? (
                  <div className="p-3.5 rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02] text-center">
                    <p className="text-xs text-slate-400">
                      Click on available seats on the map to add them to your reservation.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedSeatList.map((seat) => (
                      <span
                        key={seat?.seat_id || Math.random()}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-xs font-mono font-black text-indigo-300"
                      >
                        {seat?.seat_number}
                        <span className="text-[10px] text-slate-400">
                          (Rs. {seat?.price || ticketBasePrice})
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Calculation Breakdown */}
              <div className="space-y-3 pt-4 border-t border-white/[0.08]">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Seats Subtotal ({selectedSeatList.length} × ticket)</span>
                  <span className="font-mono font-bold text-white">
                    Rs. {seatSubtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Booking Fee (fixed)</span>
                  <span className="font-mono font-bold text-white">
                    Rs. {bookingFee.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] text-sm">
                  <span className="font-black text-white">Estimated Total</span>
                  <span className="font-black font-mono text-base text-amber-400">
                    Rs. {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Continue to Payment Button */}
              <button
                type="button"
                disabled={selectedSeatList.length === 0}
                onClick={handleProceedToPayment}
                className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  selectedSeatList.length > 0
                    ? 'bg-gradient-to-r from-[#E50914] to-[#B91C1C] text-white shadow-[0_0_25px_rgba(229,9,20,0.4)] hover:brightness-110 active:scale-95'
                    : 'bg-white/[0.06] text-slate-500 border border-white/[0.08] cursor-not-allowed'
                }`}
              >
                Continue to Payment <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Reassurance info card */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-[11px] text-slate-400 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <span>
                Seats are temporarily reserved while you finish checkout. Your booking is finalized upon successful payment.
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SeatSelection;
