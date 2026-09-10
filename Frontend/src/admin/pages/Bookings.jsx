import React, { useState, useEffect } from 'react';
import {
  FiBookOpen,
  FiSearch,
  FiDownload,
  FiEye,
  FiXCircle,
  FiCheckCircle,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUser,
  FiDollarSign,
  FiCreditCard,
  FiTag
} from 'react-icons/fi';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Badge from '../components/Badge';
import SkeletonLoader from '../components/SkeletonLoader';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'confirmed' | 'pending' | 'cancelled'
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Modals
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [activeTab, dateRange]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeTab !== 'all') params.status = activeTab;
      if (dateRange.start) params.start_date = dateRange.start;
      if (dateRange.end) params.end_date = dateRange.end;

      const res = await apiService.getBookings(params);
      if (res.data?.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleInspectBooking = async (id) => {
    try {
      const res = await apiService.getBooking(id);
      if (res.data?.success) {
        setSelectedBookingDetails(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load booking details');
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelTarget) return;
    try {
      await apiService.updateBookingStatus({
        booking_id: cancelTarget.booking_id,
        status: 'cancelled',
        refund: true,
      });
      toast.success('Booking cancelled and marked for refund');
      setCancelTarget(null);
      if (selectedBookingDetails?.booking_id === cancelTarget.booking_id) {
        setSelectedBookingDetails(null);
      }
      fetchBookings();
    } catch (err) {
      toast.error('Failed to cancel booking');
    }
  };

  const handleExportCSV = () => {
    if (bookings.length === 0) {
      toast.error('No bookings to export');
      return;
    }

    const headers = ['Booking ID', 'Customer Name', 'Customer Email', 'Movie', 'Auditorium', 'Show Date', 'Show Time', 'Seats', 'Total Amount', 'Status', 'Booking Date'];
    const rows = bookings.map((b) => [
      b.booking_id,
      `"${b.customer_name}"`,
      `"${b.customer_email}"`,
      `"${b.movie_title}"`,
      `"${b.cinema_name} - ${b.screen_name}"`,
      b.show_date,
      b.start_time,
      `"${b.seat_numbers || ''}"`,
      b.total_amount,
      b.booking_status,
      b.created_at,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `galaxy_cinema_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exported bookings CSV');
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <Badge variant="success">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const columns = [
    {
      key: 'booking_id',
      label: 'Booking ID',
      sortable: true,
      render: (val) => (
        <span className="font-mono font-bold text-[#E50914] bg-[#E50914]/10 border border-[#E50914]/25 px-2 py-0.5 rounded-lg text-xs">
          #{val}
        </span>
      ),
    },
    {
      key: 'customer_name',
      label: 'Customer',
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500/20 to-amber-500/20 border border-white/[0.1] flex items-center justify-center text-xs font-bold text-white shrink-0">
            {val ? val.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <span className="font-semibold text-white block text-xs">{val}</span>
            <span className="text-[11px] text-slate-400 truncate max-w-[140px] block">{row.customer_email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'movie_title',
      label: 'Movie & Venue',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          {row.poster_url ? (
            <img src={row.poster_url} alt="" className="w-7 aspect-[2/3] rounded-lg object-cover object-center shadow-sm border border-white/[0.1] bg-gray-800" />
          ) : (
            <div className="w-7 aspect-[2/3] rounded-lg bg-gray-800 border border-white/[0.1] flex items-center justify-center text-[10px] text-slate-500">
              Film
            </div>
          )}
          <div>
            <span className="font-semibold text-white block max-w-xs truncate text-xs">
              {val}
            </span>
            <span className="text-[11px] text-slate-400 block truncate">
              {row.cinema_name} • {row.screen_name}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'show_date',
      label: 'Showtime',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="text-xs font-semibold text-slate-200 block">{val}</span>
          <span className="text-[11px] text-slate-400">{row.start_time?.substring(0, 5)}</span>
        </div>
      ),
    },
    {
      key: 'seat_numbers',
      label: 'Seats',
      render: (val) => (
        <span className="rounded-lg bg-white/[0.05] border border-white/[0.08] px-2.5 py-1 text-xs font-mono font-bold text-slate-200">
          {val || 'None'}
        </span>
      ),
    },
    {
      key: 'total_amount',
      label: 'Total',
      sortable: true,
      render: (val) => (
        <span className="font-extrabold text-white text-sm">
          ${Number(val).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'booking_status',
      label: 'Status',
      render: (val) => getStatusBadge(val),
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleInspectBooking(row.booking_id)}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/[0.08] hover:text-white transition"
            title="Inspect Details"
          >
            <FiEye className="h-4 w-4" />
          </button>
          {row.booking_status !== 'cancelled' && (
            <button
              onClick={() => setCancelTarget(row)}
              className="rounded-xl p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition"
              title="Cancel / Refund"
            >
              <FiXCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#E50914] shadow-[0_0_8px_#E50914]"></span>
            <span className="text-[10px] font-extrabold text-[#E50914] uppercase tracking-widest">
              BOX OFFICE & TICKETING
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Booking Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor real-time reservations, issue refunds, and inspect ticket seat allocations
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white transition-all self-start sm:self-auto"
        >
          <FiDownload className="h-4 w-4 text-[#E50914]" /> Export CSV
        </button>
      </div>

      {/* Tabs & Date Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-white/[0.08] bg-[#10131E]/95 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-xl text-xs">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Bookings' },
            { key: 'confirmed', label: 'Confirmed' },
            { key: 'pending', label: 'Pending' },
            { key: 'cancelled', label: 'Cancelled' },
          ].map((tab) => {
            const isCurrent = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-xl px-4 py-2 font-bold capitalize transition-all text-xs ${
                  isCurrent
                    ? 'bg-gradient-to-r from-[#E50914] to-[#B91C1C] text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Date range filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs">From:</span>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3 py-1.5 text-xs text-white focus:border-[#E50914] focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs">To:</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3 py-1.5 text-xs text-white focus:border-[#E50914] focus:outline-none"
            />
          </div>
          {(dateRange.start || dateRange.end) && (
            <button
              onClick={() => setDateRange({ start: '', end: '' })}
              className="text-xs text-slate-400 hover:text-white underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <SkeletonLoader rows={7} cols={8} />
      ) : (
        <DataTable
          columns={columns}
          data={bookings}
          searchPlaceholder="Search customer, email, movie, or ID..."
          searchField="customer_name"
          pageSize={10}
        />
      )}

      {/* Booking Details Modal */}
      {selectedBookingDetails && (
        <Modal
          isOpen={!!selectedBookingDetails}
          onClose={() => setSelectedBookingDetails(null)}
          title={`Ticket Reservation #${selectedBookingDetails.booking_id}`}
          size="lg"
        >
          <div className="space-y-6 text-xs">
            {/* Movie & Cinema banner */}
            <div className="flex items-center gap-4 rounded-2xl bg-[#0A0D16] p-4 sm:p-5 border border-white/[0.08]">
              {selectedBookingDetails.poster_url ? (
                <img
                  src={selectedBookingDetails.poster_url}
                  alt=""
                  className="h-24 w-16 rounded-xl object-cover shadow-lg border border-white/[0.1]"
                />
              ) : (
                <div className="h-24 w-16 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-xs text-slate-500">
                  No Poster
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-base font-bold text-white truncate">
                    {selectedBookingDetails.movie_title}
                  </h4>
                  {getStatusBadge(selectedBookingDetails.booking_status)}
                </div>
                <p className="mt-1.5 flex items-center gap-1.5 text-slate-400">
                  <FiMapPin className="h-3.5 w-3.5 text-[#E50914] shrink-0" />
                  <span className="truncate">{selectedBookingDetails.cinema_name} • {selectedBookingDetails.screen_name} ({selectedBookingDetails.screen_type || '2D'})</span>
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-slate-400">
                  <FiCalendar className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span>{selectedBookingDetails.show_date} at {selectedBookingDetails.start_time}</span>
                </p>
              </div>
            </div>

            {/* Customer & Payment Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/[0.08] bg-[#0A0D16] p-4 space-y-2.5">
                <h5 className="font-bold text-white flex items-center gap-2 border-b border-white/[0.06] pb-2">
                  <FiUser className="h-3.5 w-3.5 text-[#E50914]" /> Customer Information
                </h5>
                <div className="space-y-1.5 text-slate-300">
                  <p className="flex justify-between"><span className="text-slate-500">Name:</span> <strong className="text-white">{selectedBookingDetails.customer_name}</strong></p>
                  <p className="flex justify-between"><span className="text-slate-500">Email:</span> <span className="text-slate-300">{selectedBookingDetails.customer_email}</span></p>
                  <p className="flex justify-between"><span className="text-slate-500">Phone:</span> <span className="text-slate-300">{selectedBookingDetails.customer_phone || 'N/A'}</span></p>
                  <p className="flex justify-between"><span className="text-slate-500">Booked On:</span> <span className="text-slate-400 font-mono text-[11px]">{selectedBookingDetails.created_at}</span></p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-[#0A0D16] p-4 space-y-2.5">
                <h5 className="font-bold text-white flex items-center gap-2 border-b border-white/[0.06] pb-2">
                  <FiCreditCard className="h-3.5 w-3.5 text-amber-500" /> Payment Breakdown
                </h5>
                <div className="space-y-1.5 text-slate-300">
                  <p className="flex justify-between"><span className="text-slate-500">Payment ID:</span> <span className="font-mono text-slate-400">#{selectedBookingDetails.payment_id || 'N/A'}</span></p>
                  <p className="flex justify-between"><span className="text-slate-500">Method:</span> <span className="capitalize font-semibold text-white">{selectedBookingDetails.payment_method || 'Online Card'}</span></p>
                  <p className="flex justify-between"><span className="text-slate-500">Payment Status:</span> <span className="font-bold text-emerald-400 capitalize">{selectedBookingDetails.payment_status || 'Success'}</span></p>
                  <div className="pt-2 border-t border-white/[0.06] flex justify-between items-center">
                    <span className="text-slate-400 font-bold">Total Charged:</span>
                    <span className="text-base font-extrabold text-[#E50914]">
                      ${Number(selectedBookingDetails.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reserved Seats List */}
            <div>
              <h5 className="font-bold text-white mb-2">Booked Seats Matrix</h5>
              <div className="flex flex-wrap gap-2">
                {selectedBookingDetails.seats && selectedBookingDetails.seats.length > 0 ? (
                  selectedBookingDetails.seats.map((st) => (
                    <div
                      key={st.seat_id}
                      className="flex items-center gap-2.5 rounded-xl border border-[#E50914]/30 bg-[#E50914]/10 px-3 py-2 text-xs"
                    >
                      <span className="font-mono font-black text-[#E50914] text-sm">
                        {st.seat_number}
                      </span>
                      <span className="text-slate-400 capitalize text-[11px]">
                        ({st.seat_type})
                      </span>
                      <span className="font-bold text-white">
                        ${Number(st.price).toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-xs py-2">No individual seat records attached.</p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-white/[0.08]">
              {selectedBookingDetails.booking_status !== 'cancelled' ? (
                <button
                  type="button"
                  onClick={() => setCancelTarget(selectedBookingDetails)}
                  className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 font-bold text-rose-400 hover:bg-rose-500/20 transition"
                >
                  Cancel & Issue Refund
                </button>
              ) : (
                <span className="text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl text-xs">
                  Booking Cancelled & Refunded
                </span>
              )}

              <button
                type="button"
                onClick={() => setSelectedBookingDetails(null)}
                className="rounded-xl bg-gradient-to-r from-[#E50914] to-[#B91C1C] px-5 py-2 font-bold text-white shadow-[0_0_15px_rgba(229,9,20,0.35)] hover:brightness-110 transition"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Confirmation */}
      <ConfirmDialog
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelBooking}
        title="Cancel Ticket Booking"
        message={`Cancel Booking #${cancelTarget?.booking_id} for ${cancelTarget?.customer_name}? Payment of $${Number(cancelTarget?.total_amount).toFixed(2)} will be marked refunded.`}
        confirmText="Confirm Cancellation"
        confirmVariant="danger"
      />
    </div>
  );
};

export default Bookings;
