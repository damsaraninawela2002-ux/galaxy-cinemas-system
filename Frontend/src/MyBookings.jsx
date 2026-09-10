import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Ticket, 
  Calendar, 
  Clock, 
  MapPin, 
  Tv, 
  QrCode, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Film, 
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { MOCK_USER_BOOKINGS } from './data/mockData';

export default function MyBookings() {
  const [activeTab, setActiveTab] = useState('upcoming'); // 'all', 'upcoming', 'completed', 'cancelled'
  const [bookingsList, setBookingsList] = useState(MOCK_USER_BOOKINGS);
  const [selectedTicketModal, setSelectedTicketModal] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState(null);

  // Filter based on active tab
  const filteredBookings = bookingsList.filter(b => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') return b.booking_status.toLowerCase() === 'confirmed';
    if (activeTab === 'completed') return b.booking_status.toLowerCase() === 'completed';
    if (activeTab === 'cancelled') return b.booking_status.toLowerCase() === 'cancelled';
    return true;
  });

  const handleConfirmCancel = () => {
    if (!cancelModalBooking) return;
    setBookingsList(prev => prev.map(item => {
      if (item.booking_id === cancelModalBooking.booking_id) {
        return { ...item, booking_status: 'Cancelled' };
      }
      return item;
    }));
    setCancelSuccessMsg(`Booking ${cancelModalBooking.booking_id} successfully cancelled. A full refund of $${cancelModalBooking.total_amount.toFixed(2)} has been credited.`);
    setCancelModalBooking(null);
    setTimeout(() => setCancelSuccessMsg(null), 5000);
  };

  return (
    <div className="min-h-screen bg-[#080B14] text-slate-100 pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider mb-2">
              <Ticket className="w-3.5 h-3.5" />
              Customer Portal
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white font-serif tracking-tight">
              My Movie Bookings
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              View your active cinema tickets, scan QR codes at the gate, or view transaction history.
            </p>
          </div>

          <Link
            to="/showtimes"
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition self-start sm:self-auto shadow-md flex items-center gap-2"
          >
            Book New Ticket
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Feedback Alert */}
        {cancelSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-between animate-fade-in-up">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{cancelSuccessMsg}</span>
            </div>
            <button onClick={() => setCancelSuccessMsg(null)} className="text-emerald-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab Filters */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#101426] border border-white/[0.08] w-fit">
          {[
            { id: 'upcoming', label: 'Upcoming Shows' },
            { id: 'completed', label: 'Past / Watched' },
            { id: 'cancelled', label: 'Cancelled' },
            { id: 'all', label: 'All History' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="rounded-3xl border border-white/[0.08] bg-[#101426] p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-slate-500">
              <Ticket className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">No bookings found in this category</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                You do not have any tickets under this status. Check out what is currently playing at Galaxy Cinemas!
              </p>
            </div>
            <Link
              to="/movies"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md"
            >
              Explore Now Showing Movies
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => {
              const isUpcoming = b.booking_status.toLowerCase() === 'confirmed';
              const isCancelled = b.booking_status.toLowerCase() === 'cancelled';

              return (
                <div
                  key={b.booking_id}
                  className="rounded-3xl border border-white/[0.08] bg-[#101426] p-5 sm:p-6 shadow-xl hover:border-white/15 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  {/* Left: Poster + Screening Info */}
                  <div className="flex items-start gap-4 sm:gap-5 min-w-0">
                    <img
                      src={b.poster_url}
                      alt={b.movie_title}
                      className="w-20 sm:w-24 aspect-[2/3] rounded-2xl object-cover object-center border border-white/[0.1] shadow-md flex-shrink-0 bg-gray-800"
                    />

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status Badge */}
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                          isUpcoming
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : isCancelled
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : 'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isUpcoming ? 'bg-emerald-400 animate-pulse' : isCancelled ? 'bg-rose-400' : 'bg-slate-400'
                          }`} />
                          {b.booking_status}
                        </span>

                        <span className="font-mono text-xs font-bold text-slate-400">
                          Ref: <span className="text-white">{b.booking_id}</span>
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-black text-white font-serif truncate">
                        {b.movie_title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1 text-indigo-300">
                          <MapPin className="w-3.5 h-3.5" />
                          {b.cinema_name}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Tv className="w-3.5 h-3.5" />
                          {b.screen_name}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {b.show_date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono font-bold text-amber-400">
                          <Clock className="w-3.5 h-3.5" />
                          {b.show_time}
                        </span>
                      </div>

                      <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-slate-400">Seats:</span>
                        {b.seats.map(seatNo => (
                          <span
                            key={seatNo}
                            className="px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 font-mono font-bold text-indigo-300 text-xs"
                          >
                            {seatNo}
                          </span>
                        ))}
                        <span className="text-slate-500 text-[11px] ml-1">({b.seat_tier})</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Pricing & Action Buttons */}
                  <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/[0.08] gap-3 flex-shrink-0">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Total Amount
                      </span>
                      <span className="font-mono font-black text-xl text-amber-400">
                        ${b.total_amount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* View QR Ticket CTA */}
                      {!isCancelled && (
                        <button
                          onClick={() => setSelectedTicketModal(b)}
                          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
                        >
                          <QrCode className="w-4 h-4" />
                          <span>View Ticket</span>
                        </button>
                      )}

                      {/* Cancel Booking (only for upcoming) */}
                      {isUpcoming && (
                        <button
                          onClick={() => setCancelModalBooking(b)}
                          className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 text-xs font-bold border border-white/[0.08] transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* MODAL 1: Digital E-Ticket & QR Modal */}
        {selectedTicketModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#101426] border border-white/[0.1] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 relative">
              <button
                onClick={() => setSelectedTicketModal(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full bg-white/[0.05]"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  Admission Pass
                </span>
                <h3 className="text-xl font-black text-white font-serif mt-0.5">
                  {selectedTicketModal.movie_title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedTicketModal.cinema_name} • {selectedTicketModal.screen_name}
                </p>
              </div>

              {/* QR Code Container */}
              <div className="p-5 rounded-2xl bg-white text-slate-900 flex flex-col items-center justify-center shadow-inner">
                <img
                  src={selectedTicketModal.qr_code}
                  alt="QR Code"
                  className="w-44 h-44 object-contain rounded-lg"
                />
                <span className="font-mono font-black text-xs tracking-wider mt-2 text-slate-800">
                  {selectedTicketModal.booking_id}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  Scan at theater scanner
                </span>
              </div>

              {/* Screening Details */}
              <div className="p-3.5 rounded-2xl bg-[#090C16] border border-white/[0.06] text-xs space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Date & Showtime:</span>
                  <span className="font-bold text-white">{selectedTicketModal.show_date} at {selectedTicketModal.show_time}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Seats:</span>
                  <span className="font-mono font-bold text-amber-400">{selectedTicketModal.seats.join(', ')} ({selectedTicketModal.seat_tier})</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Total Paid:</span>
                  <span className="font-mono font-bold text-white">${selectedTicketModal.total_amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => window.print()}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-md"
              >
                <Download className="w-4 h-4" />
                Print / Download PDF
              </button>
            </div>
          </div>
        )}

        {/* MODAL 2: Cancel Booking Confirmation Modal */}
        {cancelModalBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#101426] border border-white/[0.1] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 relative">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div className="text-center">
                <h3 className="text-lg font-black text-white font-serif">
                  Cancel Booking Confirmation
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Are you sure you want to cancel your reservation for <strong className="text-white">{cancelModalBooking.movie_title}</strong> (Booking Ref: {cancelModalBooking.booking_id})?
                </p>
                <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                  ✓ 100% full refund of ${cancelModalBooking.total_amount.toFixed(2)} will be issued immediately to your payment card.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setCancelModalBooking(null)}
                  className="py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold text-slate-300 transition"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition shadow-md"
                >
                  Yes, Cancel Tickets
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}