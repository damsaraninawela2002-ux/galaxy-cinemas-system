import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { QRCodeSVG } from 'qrcode.react';
import {
  CheckCircle,
  Home,
  Printer,
  Calendar,
  Clock,
  MapPin,
  Tv,
  Ticket,
  DollarSign,
  Download,
  Share2,
  X
} from 'lucide-react';

const BookingSuccess = () => {
  const navigate = useNavigate();
  const bookingCtx = useBooking();
  const booking = bookingCtx?.booking || {};
  const clearBooking = bookingCtx?.clearBooking || (() => {});
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const confirmation = booking?.bookingConfirmation || null;

  // Extract or fallback details
  const movieTitle = confirmation?.movie?.title || booking?.movie?.title || 'Spider-Man: Brand New Day';
  const moviePoster = confirmation?.movie?.poster_url || booking?.movie?.poster_url || '/images/1.jfif';
  const showDate = confirmation?.date || booking?.date || '2026-09-12';
  const startTime = confirmation?.time || booking?.time || booking?.showtime?.start_time || '10:00 AM';
  const cinemaName = confirmation?.cinema?.name || booking?.cinema?.name || booking?.showtime?.cinema_name || 'Nova IMAX Colombo';
  const screenName = confirmation?.screen || booking?.showtime?.screen_name || 'Hall 1 (IMAX Laser)';
  const selectedSeats = Array.isArray(booking?.selectedSeats) ? booking.selectedSeats : [];
  const seatNumbers = confirmation?.seatNumbers || (selectedSeats.map(s => s?.seat_number || '').filter(Boolean).join(', ')) || 'A2, A3';
  const totalPaid = confirmation?.amount || booking?.totalAmount || 3100;
  const bookingCode = confirmation?.bookingCode || `GC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-101`;
  const transactionRef = confirmation?.transactionRef || 'TXN-' + Date.now();

  // QR Content payload string
  const qrPayload = JSON.stringify({
    cinema: 'Galaxy Cinema',
    booking_id: bookingCode,
    movie: movieTitle,
    date: showDate,
    time: startTime,
    seats: seatNumbers,
    total: `Rs. ${totalPaid}`
  });

  const handleBackToHome = () => {
    clearBooking();
    navigate('/');
  };

  const handlePrintTicket = () => {
    window.print();
  };

  return (
    <div className="bg-[#080B14] text-slate-100 min-h-screen py-10 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Success Header Visual */}
        <div className="text-center mb-8 sm:mb-10 space-y-3">
          <div className="inline-flex p-4 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <CheckCircle className="w-12 h-12 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Payment Successful
          </h1>
          <p className="text-sm font-semibold text-emerald-400">
            Your booking has been confirmed.
          </p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            A confirmation receipt and digital ticket pass has been generated. Please show your QR ticket at the theater gate.
          </p>
        </div>

        {/* Digital Ticket Card Stub with Perforation Effect */}
        <div id="printable-ticket" className="rounded-3xl border border-white/[0.1] bg-[#0E1222] shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden mb-8">
          
          {/* Top Brand Banner */}
          <div className="bg-gradient-to-r from-[#E50914] to-[#8B0000] px-6 sm:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Ticket className="w-5 h-5" />
              <span className="font-black text-sm uppercase tracking-wider">Galaxy Cinema E-Ticket</span>
            </div>
            <span className="font-mono text-xs font-bold text-white/90">
              Verified & Paid
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">

            {/* Movie Title & Booking Code Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Booking ID Reference
                </span>
                <span className="text-xl sm:text-2xl font-mono font-black text-amber-400 tracking-wider">
                  {bookingCode}
                </span>
              </div>

              <div className="sm:text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Transaction Reference
                </span>
                <span className="text-xs font-mono text-slate-300 font-semibold">
                  {transactionRef}
                </span>
              </div>
            </div>

            {/* Details Grid: Movie, Date, Time, Seats, Total Paid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Left Column: Movie & Screening Grid */}
              <div className="md:col-span-8 space-y-4">
                
                <div className="flex items-center gap-4">
                  <img
                    src={moviePoster}
                    alt={movieTitle}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200';
                    }}
                    className="w-16 aspect-[2/3] rounded-xl object-cover object-center border border-white/10 shadow-md flex-shrink-0 bg-gray-800"
                  />
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-white">
                      {movieTitle}
                    </h2>
                    <span className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#E50914]" />
                      {cinemaName}
                    </span>
                    <span className="text-[11px] text-indigo-400 font-semibold block mt-0.5">
                      {screenName}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Date
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      {showDate}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Time
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-400" />
                      {startTime}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Seats Assigned
                    </span>
                    <span className="text-sm font-mono font-black text-indigo-300">
                      {seatNumbers}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Total Paid
                    </span>
                    <span className="text-base font-mono font-black text-emerald-400">
                      Rs. {Number(totalPaid).toLocaleString()}
                    </span>
                  </div>
                </div>

              </div>

              {/* Right Column: QR Code Display */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-5 rounded-2xl bg-[#080B14] border border-white/[0.08] text-center shadow-inner">
                <div className="p-3 rounded-xl bg-white shadow-md">
                  <QRCodeSVG
                    value={qrPayload}
                    size={140}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-3 block">
                  Scan at Entrance
                </span>
                <span className="text-[9px] font-mono text-slate-500 block">
                  {bookingCode}
                </span>
              </div>

            </div>

          </div>

          {/* Bottom perforated edge footer */}
          <div className="px-6 py-3 bg-[#080B14] border-t border-dashed border-white/[0.15] flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>ISSUED BY GALAXY CINEMA SYSTEMS</span>
            <span>NON-TRANSFERABLE</span>
          </div>
        </div>

        {/* Action Buttons: View/Print Ticket & Back to Home */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setIsTicketModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-white/[0.12] bg-[#12162A] hover:bg-white/[0.08] text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Ticket className="w-4 h-4 text-indigo-400" />
            View Ticket
          </button>

          <button
            type="button"
            onClick={handlePrintTicket}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-white/[0.12] bg-[#12162A] hover:bg-white/[0.08] text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            Print / Save PDF
          </button>

          <button
            type="button"
            onClick={handleBackToHome}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#E50914] to-[#B91C1C] hover:brightness-110 text-white font-black text-xs shadow-[0_0_20px_rgba(229,9,20,0.4)] flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>
        </div>

      </div>

      {/* Ticket Modal View */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl border border-white/[0.15] bg-[#0E1222] p-6 text-white space-y-5 relative shadow-2xl animate-fade-in">
            <button
              type="button"
              onClick={() => setIsTicketModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <span className="text-[10px] font-black uppercase tracking-[2px] text-[#E50914] block">
                Galaxy Cinemas Gate Pass
              </span>
              <h3 className="text-xl font-black text-white mt-1">{movieTitle}</h3>
              <p className="text-xs text-amber-400 font-mono font-bold mt-1">{bookingCode}</p>
            </div>

            <div className="flex justify-center p-4 bg-white rounded-2xl">
              <QRCodeSVG value={qrPayload} size={180} level="H" />
            </div>

            <div className="space-y-2 text-xs text-slate-300 border-t border-white/[0.08] pt-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Theater:</span>
                <span className="font-bold text-white">{cinemaName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hall:</span>
                <span className="font-bold text-white">{screenName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date & Time:</span>
                <span className="font-bold text-white">{showDate} at {startTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Seats:</span>
                <span className="font-mono font-bold text-indigo-300">{seatNumbers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Paid:</span>
                <span className="font-bold text-emerald-400">Rs. {Number(totalPaid).toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={handlePrintTicket}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white flex items-center justify-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
              <button
                type="button"
                onClick={() => setIsTicketModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] font-bold text-xs text-slate-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BookingSuccess;
