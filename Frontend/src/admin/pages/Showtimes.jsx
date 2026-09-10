import React, { useState, useEffect } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiClock,
  FiAlertTriangle,
  FiGrid,
  FiList,
  FiMapPin
} from 'react-icons/fi';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Badge from '../components/Badge';
import SkeletonLoader from '../components/SkeletonLoader';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

const Showtimes = () => {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState('table');
  const [filterCinema, setFilterCinema] = useState('');
  const [filterMovie, setFilterMovie] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [conflictError, setConflictError] = useState(null);

  // Form State
  const initialForm = {
    movie_id: '',
    cinema_id: '',
    screen_id: '',
    show_date: new Date().toISOString().split('T')[0],
    start_time: '18:00',
    end_time: '20:30',
    ticket_price: 18.0,
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchData();
  }, [filterCinema, filterMovie, filterDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterCinema) params.cinema_id = filterCinema;
      if (filterMovie) params.movie_id = filterMovie;
      if (filterDate) params.date = filterDate;

      const [showRes, movRes, cinRes] = await Promise.all([
        apiService.getShowtimes(params),
        apiService.getMovies(),
        apiService.getCinemas(),
      ]);

      if (showRes.data?.success) setShowtimes(showRes.data.data);
      if (movRes.data?.success) setMovies(movRes.data.data);
      if (cinRes.data?.success) setCinemas(cinRes.data.data);
    } catch (err) {
      toast.error('Failed to load showtimes');
    } finally {
      setLoading(false);
    }
  };

  const handleCinemaSelectInForm = async (cinemaId) => {
    setFormData((prev) => ({ ...prev, cinema_id: cinemaId, screen_id: '' }));
    if (cinemaId) {
      try {
        const res = await apiService.getHalls(cinemaId);
        if (res.data?.success) {
          setHalls(res.data.data);
          if (res.data.data.length > 0) {
            setFormData((prev) => ({ ...prev, screen_id: res.data.data[0].screen_id }));
          }
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setHalls([]);
    }
  };

  const handleOpenAdd = () => {
    setEditingShowtime(null);
    setConflictError(null);
    const defaultMovId = movies[0]?.movie_id || '';
    const defaultCinId = cinemas[0]?.theater_id || '';
    setFormData({
      ...initialForm,
      movie_id: defaultMovId,
      cinema_id: defaultCinId,
    });
    if (defaultCinId) {
      handleCinemaSelectInForm(defaultCinId);
    }
    setIsFormOpen(true);
  };

  const handleOpenEdit = async (show) => {
    setEditingShowtime(show);
    setConflictError(null);
    await handleCinemaSelectInForm(show.theater_id);
    setFormData({
      showtime_id: show.showtime_id,
      movie_id: show.movie_id,
      cinema_id: show.theater_id,
      screen_id: show.screen_id,
      show_date: show.show_date,
      start_time: show.start_time.substring(0, 5),
      end_time: show.end_time.substring(0, 5),
      ticket_price: show.ticket_price,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setConflictError(null);
    try {
      if (editingShowtime) {
        await apiService.editShowtime(formData);
        toast.success('Showtime updated');
      } else {
        await apiService.addShowtime(formData);
        toast.success('Showtime scheduled');
      }
      setIsFormOpen(false);
      fetchData();
    } catch (err) {
      if (err.response?.status === 409) {
        setConflictError(err.response?.data?.message || 'Auditorium conflict detected');
      } else {
        toast.error(err.response?.data?.message || 'Failed to schedule showtime');
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiService.deleteShowtime(deleteTarget.showtime_id);
      toast.success('Showtime removed');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to delete showtime');
    }
  };

  const columns = [
    {
      key: 'movie_title',
      label: 'Movie Title',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          {row.poster_url && (
            <img src={row.poster_url} alt="" className="w-8 aspect-[2/3] rounded-lg object-cover object-center shadow-sm flex-shrink-0 bg-gray-800" />
          )}
          <div>
            <span className="font-extrabold text-white text-xs block max-w-xs truncate">
              {val}
            </span>
            <span className="text-[11px] text-slate-400">
              {row.duration_minutes}m • {row.movie_rating || 'PG-13'}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'cinema_name',
      label: 'Cinema & Hall',
      render: (val, row) => (
        <div>
          <span className="font-bold text-slate-200 block text-xs">{val}</span>
          <span className="text-[11px] text-[#E50914] font-bold">
            {row.screen_name} ({row.screen_type || '2D'})
          </span>
        </div>
      ),
    },
    {
      key: 'show_date',
      label: 'Screening Time',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <FiCalendar className="h-3.5 w-3.5 text-slate-400" /> {val}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-400 mt-0.5 font-mono font-bold">
            <FiClock className="h-3.5 w-3.5 text-amber-400" /> {row.start_time.substring(0, 5)} - {row.end_time.substring(0, 5)}
          </div>
        </div>
      ),
    },
    {
      key: 'ticket_price',
      label: 'Base Admission',
      sortable: true,
      render: (val) => (
        <span className="font-black text-white font-mono text-sm">${Number(val).toFixed(2)}</span>
      ),
    },
    {
      key: 'booked_seats_count',
      label: 'Capacity',
      render: (val, row) => {
        const booked = Number(val) || 0;
        const total = Number(row.total_seats) || 50;
        const pct = Math.round((booked / total) * 100);
        return (
          <div className="w-32">
            <div className="flex justify-between text-[11px] mb-1">
              <span className="font-bold text-slate-300">
                {total - booked} seats left
              </span>
              <span className="text-slate-400 font-bold font-mono">{pct}%</span>
            </div>
            <div className="h-2 w-full bg-[#181D2E] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#E50914] rounded-full shadow-[0_0_8px_#E50914]"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenEdit(row)}
            className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-2 text-slate-400 hover:text-white hover:bg-white/[0.08] transition"
            title="Edit Showtime"
          >
            <FiEdit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="rounded-xl border border-red-500/20 bg-red-500/5 p-2 text-red-400 hover:bg-red-500/15 transition"
            title="Delete Showtime"
          >
            <FiTrash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-white">Showtime Scheduling</h2>
          <p className="text-xs text-slate-400">
            Program daily film schedules across branches with automatic hall conflict prevention
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex rounded-2xl border border-white/[0.08] bg-[#121522] p-1 shadow-sm">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                viewMode === 'table'
                  ? 'bg-[#E50914] text-white shadow-[0_0_12px_rgba(229,9,20,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FiList className="h-3.5 w-3.5" /> Table
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                viewMode === 'calendar'
                  ? 'bg-[#E50914] text-white shadow-[0_0_12px_rgba(229,9,20,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FiGrid className="h-3.5 w-3.5" /> Timeline
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#E50914] to-[#B91C1C] px-5 py-2.5 text-xs font-black text-white shadow-[0_0_20px_rgba(229,9,20,0.4)] hover:brightness-110 transition"
          >
            <FiPlus className="h-4 w-4" /> Schedule Showtime
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-3xl border border-white/[0.08] bg-[#111420]/95 shadow-card text-xs">
        <div>
          <label className="font-bold text-slate-400 block mb-1">
            Filter Cinema Branch
          </label>
          <select
            value={filterCinema}
            onChange={(e) => setFilterCinema(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-[#141824] px-3.5 py-2 text-white focus:border-[#E50914] focus:outline-none"
          >
            <option value="">All Branches</option>
            {cinemas.map((c) => (
              <option key={c.theater_id} value={c.theater_id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-bold text-slate-400 block mb-1">
            Filter Movie
          </label>
          <select
            value={filterMovie}
            onChange={(e) => setFilterMovie(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-[#141824] px-3.5 py-2 text-white focus:border-[#E50914] focus:outline-none"
          >
            <option value="">All Movies</option>
            {movies.map((m) => (
              <option key={m.movie_id} value={m.movie_id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-bold text-slate-400 block mb-1">
            Filter Date
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-[#141824] px-3.5 py-2 text-white focus:border-[#E50914] focus:outline-none"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <SkeletonLoader rows={6} cols={6} />
      ) : viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={showtimes}
          searchPlaceholder="Search movie title or cinema..."
          searchField="movie_title"
          pageSize={8}
        />
      ) : (
        /* Visual Cinema Timeline Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {showtimes.map((st) => (
            <div
              key={st.showtime_id}
              className="rounded-3xl border border-white/[0.08] bg-[#111420]/95 p-6 shadow-card hover:border-white/20 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-4">
                  <img
                    src={st.poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100'}
                    alt=""
                    className="w-14 aspect-[2/3] rounded-2xl object-cover object-center shadow-lg flex-shrink-0 bg-gray-800"
                  />
                  <div className="flex-1 overflow-hidden">
                    <span className="font-black text-white block truncate text-sm">
                      {st.movie_title}
                    </span>
                    <span className="text-xs text-[#E50914] font-bold block mt-0.5">
                      {st.cinema_name}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                      {st.screen_name} • <strong className="text-slate-300">{st.screen_type}</strong>
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between text-xs py-2.5 border-y border-white/[0.06]">
                  <div className="flex items-center gap-1.5 font-bold text-slate-300">
                    <FiCalendar className="h-3.5 w-3.5 text-slate-400" /> {st.show_date}
                  </div>
                  <div className="flex items-center gap-1.5 font-black text-amber-400 font-mono">
                    <FiClock className="h-3.5 w-3.5" /> {st.start_time.substring(0, 5)} - {st.end_time.substring(0, 5)}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <span className="text-xl font-black text-white font-mono">
                  ${Number(st.ticket_price).toFixed(2)}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEdit(st)}
                    className="p-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08] transition"
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(st)}
                    className="p-2 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/15 transition"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Showtime Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingShowtime ? 'Edit Showtime' : 'Schedule New Showtime'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {conflictError && (
            <div className="flex items-start gap-3 rounded-2xl bg-red-500/10 p-4 text-red-400 border border-red-500/30">
              <FiAlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Auditorium Conflict Warning</p>
                <p className="mt-1 text-slate-300">{conflictError}</p>
              </div>
            </div>
          )}

          <div>
            <label className="font-bold text-slate-300 block mb-1.5">
              Select Film *
            </label>
            <select
              required
              value={formData.movie_id}
              onChange={(e) => setFormData({ ...formData, movie_id: e.target.value })}
              className="w-full rounded-xl border border-white/[0.08] bg-[#141824] px-3.5 py-2.5 text-white focus:border-[#E50914] focus:outline-none"
            >
              <option value="">Select Movie</option>
              {movies.map((m) => (
                <option key={m.movie_id} value={m.movie_id}>
                  {m.title} ({m.duration_minutes} min)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1.5">
              Cinema Branch *
            </label>
            <select
              required
              value={formData.cinema_id}
              onChange={(e) => handleCinemaSelectInForm(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-[#141824] px-3.5 py-2.5 text-white focus:border-[#E50914] focus:outline-none"
            >
              <option value="">Select Cinema Branch</option>
              {cinemas.map((c) => (
                <option key={c.theater_id} value={c.theater_id}>
                  {c.name} ({c.location})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1.5">
              Auditorium / Hall *
            </label>
            <select
              required
              value={formData.screen_id}
              onChange={(e) => setFormData({ ...formData, screen_id: e.target.value })}
              className="w-full rounded-xl border border-white/[0.08] bg-[#141824] px-3.5 py-2.5 text-white focus:border-[#E50914] focus:outline-none"
            >
              <option value="">Select Auditorium</option>
              {halls.map((h) => (
                <option key={h.screen_id} value={h.screen_id}>
                  {h.screen_name} ({h.screen_type || '2D'}, {h.total_seats} seats)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1.5">
                Show Date *
              </label>
              <input
                type="date"
                required
                value={formData.show_date}
                onChange={(e) => setFormData({ ...formData, show_date: e.target.value })}
                className="w-full rounded-xl border border-white/[0.08] bg-[#141824] px-3.5 py-2.5 text-white focus:border-[#E50914] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1.5">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full rounded-xl border border-white/[0.08] bg-[#141824] px-3.5 py-2.5 text-white focus:border-[#E50914] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1.5">
                End Time *
              </label>
              <input
                type="time"
                required
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full rounded-xl border border-white/[0.08] bg-[#141824] px-3.5 py-2.5 text-white focus:border-[#E50914] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1.5">
              Base Admission Price ($) *
            </label>
            <input
              type="number"
              step="0.50"
              min="1"
              required
              value={formData.ticket_price}
              onChange={(e) => setFormData({ ...formData, ticket_price: Number(e.target.value) })}
              className="w-full rounded-xl border border-white/[0.08] bg-[#141824] px-3.5 py-2.5 text-white focus:border-[#E50914] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="rounded-xl border border-white/[0.1] bg-[#161B2B] px-4 py-2 font-semibold text-slate-300 hover:bg-white/[0.08] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#E50914] px-6 py-2 font-bold text-white shadow-[0_0_15px_rgba(229,9,20,0.4)] hover:bg-[#F40612] transition"
            >
              {editingShowtime ? 'Save Showtime' : 'Schedule Screening'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Cancel Scheduled Screening"
        message={`Delete scheduled screening of "${deleteTarget?.movie_title}" on ${deleteTarget?.show_date} at ${deleteTarget?.start_time}?`}
        confirmText="Confirm Delete"
        confirmVariant="danger"
      />
    </div>
  );
};

export default Showtimes;
