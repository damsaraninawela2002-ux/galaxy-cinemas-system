import React, { useState, useEffect } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiMapPin,
  FiPhone,
  FiTv,
  FiEye,
  FiLayers,
  FiCheckCircle,
  FiMonitor,
  FiGrid
} from 'react-icons/fi';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import SeatGrid from '../components/SeatGrid';
import SkeletonLoader from '../components/SkeletonLoader';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const getScreenTypeBadge = (type) => {
  const t = (type || '2D').toUpperCase();
  if (t.includes('IMAX')) {
    return 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30';
  }
  if (t.includes('DOLBY')) {
    return 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30';
  }
  if (t.includes('4DX') || t.includes('VIP')) {
    return 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30';
  }
  if (t.includes('3D')) {
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  }
  return 'bg-white/[0.05] text-slate-300 border-white/[0.1]';
};

const Cinemas = () => {
  const navigate = useNavigate();
  const [cinemas, setCinemas] = useState([]);
  const [halls, setHalls] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCinemaModalOpen, setIsCinemaModalOpen] = useState(false);
  const [editingCinema, setEditingCinema] = useState(null);
  const [deleteCinemaTarget, setDeleteCinemaTarget] = useState(null);

  const [isHallModalOpen, setIsHallModalOpen] = useState(false);
  const [editingHall, setEditingHall] = useState(null);
  const [deleteHallTarget, setDeleteHallTarget] = useState(null);

  const [viewHallDetails, setViewHallDetails] = useState(null);

  // Cinema Form
  const [cinemaForm, setCinemaForm] = useState({
    name: '',
    location: '',
    address: '',
    contact: '',
  });

  // Hall Form
  const [hallForm, setHallForm] = useState({
    theater_id: '',
    screen_name: '',
    total_seats: 50,
    screen_type: '2D',
  });

  useEffect(() => {
    fetchCinemasAndHalls();
  }, []);

  const fetchCinemasAndHalls = async () => {
    try {
      setLoading(true);
      const [cinRes, hallRes] = await Promise.all([
        apiService.getCinemas(),
        apiService.getHalls(),
      ]);
      if (cinRes.data?.success) {
        setCinemas(cinRes.data.data);
        if (!selectedCinema && cinRes.data.data.length > 0) {
          setSelectedCinema(cinRes.data.data[0]);
        }
      }
      if (hallRes.data?.success) setHalls(hallRes.data.data);
    } catch (err) {
      toast.error('Failed to load cinema branches');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddCinema = () => {
    setEditingCinema(null);
    setCinemaForm({ name: '', location: '', address: '', contact: '' });
    setIsCinemaModalOpen(true);
  };

  const handleOpenEditCinema = (cin) => {
    setEditingCinema(cin);
    setCinemaForm({
      theater_id: cin.theater_id,
      name: cin.name,
      location: cin.location,
      address: cin.address || '',
      contact: cin.contact_number || '',
    });
    setIsCinemaModalOpen(true);
  };

  const handleCinemaSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCinema) {
        await apiService.editCinema(cinemaForm);
        toast.success('Cinema branch updated');
      } else {
        await apiService.addCinema(cinemaForm);
        toast.success('New cinema branch added');
      }
      setIsCinemaModalOpen(false);
      fetchCinemasAndHalls();
    } catch (err) {
      toast.error('Error saving cinema');
    }
  };

  const handleDeleteCinema = async () => {
    if (!deleteCinemaTarget) return;
    try {
      await apiService.deleteCinema(deleteCinemaTarget.theater_id);
      toast.success('Cinema branch removed');
      setDeleteCinemaTarget(null);
      fetchCinemasAndHalls();
    } catch (err) {
      toast.error('Failed to delete cinema');
    }
  };

  // Hall Operations
  const handleOpenAddHall = () => {
    setEditingHall(null);
    setHallForm({
      theater_id: selectedCinema?.theater_id || cinemas[0]?.theater_id || '',
      screen_name: '',
      total_seats: 50,
      screen_type: '2D',
    });
    setIsHallModalOpen(true);
  };

  const handleOpenEditHall = (h) => {
    setEditingHall(h);
    setHallForm({
      screen_id: h.screen_id,
      theater_id: h.theater_id,
      screen_name: h.screen_name,
      total_seats: h.total_seats,
      screen_type: h.screen_type || '2D',
    });
    setIsHallModalOpen(true);
  };

  const handleHallSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingHall) {
        await apiService.editHall(hallForm);
        toast.success('Hall updated');
      } else {
        await apiService.addHall(hallForm);
        toast.success('Auditorium added');
      }
      setIsHallModalOpen(false);
      fetchCinemasAndHalls();
    } catch (err) {
      toast.error('Failed to save hall');
    }
  };

  const handleDeleteHall = async () => {
    if (!deleteHallTarget) return;
    try {
      await apiService.deleteHall(deleteHallTarget.screen_id);
      toast.success('Hall deleted');
      setDeleteHallTarget(null);
      fetchCinemasAndHalls();
    } catch (err) {
      toast.error('Failed to delete hall');
    }
  };

  const handleInspectHall = async (hallId) => {
    try {
      const res = await apiService.getHall(hallId);
      if (res.data?.success) {
        setViewHallDetails(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load hall preview');
    }
  };

  const filteredHalls = selectedCinema
    ? halls.filter((h) => h.theater_id === selectedCinema.theater_id)
    : halls;

  if (loading) {
    return <SkeletonLoader rows={6} cols={4} />;
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#E50914] shadow-[0_0_8px_#E50914]"></span>
            <span className="text-[10px] font-extrabold text-[#E50914] uppercase tracking-widest">
              INFRASTRUCTURE & THEATRES
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Cinemas & Auditoriums
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage theatre multiplex branches, screen formats (IMAX Laser, Dolby Atmos, 3D), and seating capacities
          </p>
        </div>

        <button
          onClick={handleOpenAddCinema}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E50914] to-[#B91C1C] hover:from-[#f41b26] hover:to-[#dc2626] text-white font-bold text-xs shadow-[0_0_20px_rgba(229,9,20,0.35)] transition-all active:scale-[0.98] self-start sm:self-auto"
        >
          <FiPlus className="h-4 w-4" /> Add Cinema Branch
        </button>
      </div>

      {/* Cinema Branch Selection Cards */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Select Multiplex Branch ({cinemas.length})
          </span>
          <span className="text-[11px] text-slate-500">
            Click branch to view its auditoriums
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cinemas.map((cin) => {
            const isSelected = selectedCinema?.theater_id === cin.theater_id;
            return (
              <div
                key={cin.theater_id}
                onClick={() => setSelectedCinema(cin)}
                className={`relative cursor-pointer rounded-2xl p-5 border transition-all duration-200 group overflow-hidden ${
                  isSelected
                    ? 'border-[#E50914] bg-[#151928] shadow-[0_0_25px_rgba(229,9,20,0.18)] ring-1 ring-[#E50914]'
                    : 'border-white/[0.08] bg-[#10131E]/90 hover:border-white/[0.2] hover:bg-[#141724]'
                }`}
              >
                {/* Active indicator glow */}
                {isSelected && (
                  <div className="absolute top-0 right-0 w-28 h-28 bg-[#E50914]/10 rounded-full blur-2xl pointer-events-none -mr-8 -mt-8" />
                )}

                <div className="flex items-start justify-between relative z-10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors">
                        {cin.name}
                      </h3>
                      {isSelected && (
                        <FiCheckCircle className="text-[#E50914] h-4 w-4 shrink-0" />
                      )}
                    </div>
                    <p className="flex items-center gap-1.5 text-xs text-slate-400">
                      <FiMapPin className="h-3.5 w-3.5 text-[#E50914] shrink-0" />
                      <span>{cin.location}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-slate-400">
                      <FiPhone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <span>{cin.contact_number || 'No contact registered'}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditCinema(cin);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition"
                      title="Edit Cinema Details"
                    >
                      <FiEdit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteCinemaTarget(cin);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete Cinema"
                    >
                      <FiTrash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs relative z-10">
                  <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <FiMonitor className="h-3.5 w-3.5 text-slate-400" />
                    <span>{cin.total_halls || 0} Auditoriums</span>
                  </div>
                  <span className="font-bold text-[#E50914] bg-[#E50914]/10 border border-[#E50914]/20 px-2.5 py-0.5 rounded-full text-[11px]">
                    {cin.total_capacity || 0} Seats Total
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Auditoriums / Halls of Selected Cinema */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#10131E]/95 p-6 sm:p-7 shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider uppercase text-amber-500">
                Auditoriums
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">
                {selectedCinema?.name || 'Selected Branch'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Screens & Projection Theatres
            </h2>
            <p className="text-xs text-slate-400">
              Audio-visual screen standards, seating limits, and live show schedules
            </p>
          </div>

          <button
            onClick={handleOpenAddHall}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:text-amber-300 font-semibold text-xs transition-all self-start sm:self-auto"
          >
            <FiPlus className="h-4 w-4" /> Add Hall to Branch
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHalls.length > 0 ? (
            filteredHalls.map((h) => (
              <div
                key={h.screen_id}
                className="rounded-2xl border border-white/[0.08] p-5 bg-[#0A0D16]/70 hover:bg-[#0E121E] hover:border-white/[0.16] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`inline-block rounded-md border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${getScreenTypeBadge(h.screen_type)}`}>
                        {h.screen_type || '2D Standard'}
                      </span>
                      <h4 className="mt-2.5 text-base font-bold text-white group-hover:text-red-400 transition-colors">
                        {h.screen_name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditHall(h)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition"
                        title="Edit Hall"
                      >
                        <FiEdit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteHallTarget(h)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete Hall"
                      >
                        <FiTrash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Seat Capacity:</span>
                      <span className="font-bold text-slate-200">
                        {h.total_seats} Recliners & Seats
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Active Showtimes:</span>
                      <span className="font-bold text-[#E50914]">
                        {h.active_showtimes || 0} scheduled
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2 pt-4 border-t border-white/[0.06]">
                  <button
                    onClick={() => handleInspectHall(h.screen_id)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
                  >
                    <FiEye className="h-3.5 w-3.5" /> Preview Hall
                  </button>
                  <button
                    onClick={() => navigate('/admin/seats')}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#E50914]/15 hover:bg-[#E50914]/25 border border-[#E50914]/30 px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 transition"
                    title="Configure Seats Layout"
                  >
                    <FiLayers className="h-3.5 w-3.5" /> Seats Map
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <FiTv className="mx-auto h-10 w-10 text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-300">
                No Auditoriums Configured
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Add an auditorium screen to {selectedCinema?.name || 'this branch'} to begin scheduling movies.
              </p>
              <button
                onClick={handleOpenAddHall}
                className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#E50914] to-[#B91C1C] text-white text-xs font-bold shadow-sm hover:brightness-110 transition"
              >
                <FiPlus className="h-4 w-4" /> Add Auditorium
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hall Inspection Modal with Seat Preview and Schedule */}
      {viewHallDetails && (
        <Modal
          isOpen={!!viewHallDetails}
          onClose={() => setViewHallDetails(null)}
          title={`Auditorium: ${viewHallDetails.screen_name}`}
          size="lg"
        >
          <div className="space-y-6 text-xs">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#0A0D16] border border-white/[0.08]">
              <div>
                <p className="font-bold text-sm text-white">
                  {viewHallDetails.cinema_name}
                </p>
                <p className="text-slate-400 text-xs mt-0.5">{viewHallDetails.location}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-lg border px-3 py-1 font-bold text-xs ${getScreenTypeBadge(viewHallDetails.screen_type)}`}>
                  {viewHallDetails.screen_type || '2D'}
                </span>
                <span className="font-bold text-white bg-white/[0.05] border border-white/[0.08] px-3 py-1 rounded-lg">
                  {viewHallDetails.total_seats} Total Seats
                </span>
              </div>
            </div>

            {/* Visual Seat Map preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-white">Auditorium Seat Layout</h4>
                <span className="text-[11px] text-slate-500">Live configuration map</span>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-[#0A0D16] p-4">
                {viewHallDetails.seats && viewHallDetails.seats.length > 0 ? (
                  <SeatGrid seats={viewHallDetails.seats} interactive={false} />
                ) : (
                  <div className="py-12 text-center text-slate-500">
                    <FiGrid className="mx-auto h-8 w-8 text-slate-600 mb-2" />
                    <p>No seats generated yet.</p>
                    <p className="text-[11px] text-slate-600 mt-1">Use the Seat Management module to auto-generate rows and seat matrix.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Scheduled Showtimes */}
            <div>
              <h4 className="font-bold text-white mb-2">Upcoming Showtimes</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {viewHallDetails.showtimes && viewHallDetails.showtimes.length > 0 ? (
                  viewHallDetails.showtimes.map((st) => (
                    <div
                      key={st.showtime_id}
                      className="flex items-center justify-between p-3 rounded-xl border border-white/[0.08] bg-[#0A0D16] hover:border-white/[0.15] transition"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={st.poster_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100&auto=format&fit=crop&q=80'}
                          alt=""
                          className="w-8 aspect-[2/3] rounded-lg object-cover object-center border border-white/[0.1] bg-gray-800"
                        />
                        <div>
                          <span className="font-bold text-white block">
                            {st.movie_title}
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {st.show_date} • {st.start_time?.substring(0, 5)} - {st.end_time?.substring(0, 5)}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-[#E50914] text-sm">
                        ${Number(st.ticket_price).toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-6 border border-dashed border-white/[0.08] rounded-xl">
                    No upcoming showtimes scheduled in this hall
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setViewHallDetails(null)}
                className="rounded-xl bg-[#E50914] px-5 py-2 font-bold text-white hover:bg-red-700 transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Cinema Modal */}
      <Modal
        isOpen={isCinemaModalOpen}
        onClose={() => setIsCinemaModalOpen(false)}
        title={editingCinema ? 'Edit Cinema Branch' : 'Add New Cinema Branch'}
        size="md"
      >
        <form onSubmit={handleCinemaSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Cinema Name *
            </label>
            <input
              type="text"
              required
              value={cinemaForm.name}
              onChange={(e) => setCinemaForm({ ...cinemaForm, name: e.target.value })}
              placeholder="e.g. Galaxy Cinema Poruwadanda"
              className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Branch Location / Area *
            </label>
            <input
              type="text"
              required
              value={cinemaForm.location}
              onChange={(e) => setCinemaForm({ ...cinemaForm, location: e.target.value })}
              placeholder="e.g. Poruwadanda"
              className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Full Address
            </label>
            <input
              type="text"
              value={cinemaForm.address}
              onChange={(e) => setCinemaForm({ ...cinemaForm, address: e.target.value })}
              placeholder="e.g. 100 Galaxy Blvd, Suite 400"
              className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Contact Phone
            </label>
            <input
              type="text"
              value={cinemaForm.contact}
              onChange={(e) => setCinemaForm({ ...cinemaForm, contact: e.target.value })}
              placeholder="+1 (555) 234-5678"
              className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setIsCinemaModalOpen(false)}
              className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 font-semibold text-slate-300 hover:text-white hover:bg-white/[0.08] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-[#E50914] to-[#B91C1C] px-5 py-2 font-bold text-white shadow-[0_0_20px_rgba(229,9,20,0.35)] hover:brightness-110 transition"
            >
              {editingCinema ? 'Save Changes' : 'Create Branch'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add / Edit Hall Modal */}
      <Modal
        isOpen={isHallModalOpen}
        onClose={() => setIsHallModalOpen(false)}
        title={editingHall ? 'Edit Auditorium' : 'Add Auditorium to Branch'}
        size="md"
      >
        <form onSubmit={handleHallSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Cinema Branch *
            </label>
            <select
              required
              value={hallForm.theater_id}
              onChange={(e) => setHallForm({ ...hallForm, theater_id: e.target.value })}
              className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
            >
              {cinemas.map((c) => (
                <option key={c.theater_id} value={c.theater_id}>
                  {c.name} ({c.location})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Auditorium Name *
            </label>
            <input
              type="text"
              required
              value={hallForm.screen_name}
              onChange={(e) => setHallForm({ ...hallForm, screen_name: e.target.value })}
              placeholder="e.g. Hall 1 (IMAX Laser)"
              className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Screen Technology *
              </label>
              <select
                value={hallForm.screen_type}
                onChange={(e) => setHallForm({ ...hallForm, screen_type: e.target.value })}
                className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
              >
                <option value="2D">2D Standard</option>
                <option value="3D">RealD 3D</option>
                <option value="IMAX">IMAX Laser</option>
                <option value="Dolby 3D">Dolby Atmos Cinema</option>
                <option value="VIP 4DX">VIP 4DX Motion</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Seat Capacity *
              </label>
              <input
                type="number"
                min="10"
                max="500"
                required
                value={hallForm.total_seats}
                onChange={(e) => setHallForm({ ...hallForm, total_seats: Number(e.target.value) })}
                className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setIsHallModalOpen(false)}
              className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 font-semibold text-slate-300 hover:text-white hover:bg-white/[0.08] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-[#E50914] to-[#B91C1C] px-5 py-2 font-bold text-white shadow-[0_0_20px_rgba(229,9,20,0.35)] hover:brightness-110 transition"
            >
              {editingHall ? 'Save Hall' : 'Add Auditorium'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Cinema Dialog */}
      <ConfirmDialog
        isOpen={!!deleteCinemaTarget}
        onClose={() => setDeleteCinemaTarget(null)}
        onConfirm={handleDeleteCinema}
        title="Delete Cinema Branch"
        message={`Delete "${deleteCinemaTarget?.name}" and all associated auditoriums?`}
      />

      {/* Delete Hall Dialog */}
      <ConfirmDialog
        isOpen={!!deleteHallTarget}
        onClose={() => setDeleteHallTarget(null)}
        onConfirm={handleDeleteHall}
        title="Delete Auditorium"
        message={`Delete "${deleteHallTarget?.screen_name}"? Scheduled shows and seat maps will be removed.`}
      />
    </div>
  );
};

export default Cinemas;
