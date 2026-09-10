import React, { useState, useEffect } from 'react';
import {
  FiGrid,
  FiPlus,
  FiRefreshCw,
  FiCheck,
  FiSlash,
  FiDollarSign,
  FiSettings,
  FiTrash2,
  FiLayers,
  FiShield
} from 'react-icons/fi';
import SeatGrid from '../components/SeatGrid';
import Modal from '../components/Modal';
import SkeletonLoader from '../components/SkeletonLoader';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

const Seats = () => {
  const [cinemas, setCinemas] = useState([]);
  const [halls, setHalls] = useState([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState('');
  const [selectedHallId, setSelectedHallId] = useState('');

  const [seatsData, setSeatsData] = useState({ total: 0, seats: [], grid: {} });
  const [loading, setLoading] = useState(true);

  // Modals & Generator State
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedSeatForEdit, setSelectedSeatForEdit] = useState(null);

  const [generatorConfig, setGeneratorConfig] = useState({
    rows: 6,
    cols: 10,
    standard_price: 15.0,
    vip_price: 22.0,
    couple_price: 35.0,
    vip_rows: ['C', 'D'],
    couple_rows: ['F'],
    replace: true,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const cinRes = await apiService.getCinemas();
      if (cinRes.data?.success && cinRes.data.data.length > 0) {
        setCinemas(cinRes.data.data);
        const firstCinId = cinRes.data.data[0].theater_id;
        setSelectedCinemaId(firstCinId);

        const hallRes = await apiService.getHalls(firstCinId);
        if (hallRes.data?.success && hallRes.data.data.length > 0) {
          setHalls(hallRes.data.data);
          const firstHallId = hallRes.data.data[0].screen_id;
          setSelectedHallId(firstHallId);
          fetchSeats(firstHallId);
        }
      }
    } catch (err) {
      toast.error('Failed to load cinemas and halls');
    } finally {
      setLoading(false);
    }
  };

  const handleCinemaChange = async (cinId) => {
    setSelectedCinemaId(cinId);
    try {
      const hallRes = await apiService.getHalls(cinId);
      if (hallRes.data?.success) {
        setHalls(hallRes.data.data);
        if (hallRes.data.data.length > 0) {
          const firstHallId = hallRes.data.data[0].screen_id;
          setSelectedHallId(firstHallId);
          fetchSeats(firstHallId);
        } else {
          setSelectedHallId('');
          setSeatsData({ total: 0, seats: [], grid: {} });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleHallChange = (hId) => {
    setSelectedHallId(hId);
    if (hId) {
      fetchSeats(hId);
    }
  };

  const fetchSeats = async (hallId) => {
    try {
      setLoading(true);
      const res = await apiService.getSeats({ screen_id: hallId });
      if (res.data?.success) {
        setSeatsData(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load hall seats');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat) => {
    setSelectedSeatForEdit(seat);
  };

  const handleToggleMaintenance = async () => {
    if (!selectedSeatForEdit) return;
    const newStatus = selectedSeatForEdit.status === 'maintenance' ? 'available' : 'maintenance';
    try {
      await apiService.toggleSeat({
        seat_id: selectedSeatForEdit.seat_id,
        status: newStatus,
      });
      toast.success(`Seat ${selectedSeatForEdit.seat_number} set to ${newStatus}`);
      setSelectedSeatForEdit(null);
      fetchSeats(selectedHallId);
    } catch (err) {
      toast.error('Failed to update seat status');
    }
  };

  const handleUpdateSeatPriceAndType = async (e) => {
    e.preventDefault();
    if (!selectedSeatForEdit) return;
    try {
      await apiService.toggleSeat({
        seat_id: selectedSeatForEdit.seat_id,
        seat_type: selectedSeatForEdit.seat_type,
        price: selectedSeatForEdit.price,
        status: selectedSeatForEdit.status,
      });
      toast.success(`Seat ${selectedSeatForEdit.seat_number} updated`);
      setSelectedSeatForEdit(null);
      fetchSeats(selectedHallId);
    } catch (err) {
      toast.error('Failed to update seat');
    }
  };

  const handleRunGenerator = async (e) => {
    e.preventDefault();
    if (!selectedHallId) {
      toast.error('Please select an auditorium first');
      return;
    }
    try {
      const payload = {
        screen_id: selectedHallId,
        ...generatorConfig,
      };
      await apiService.generateSeats(payload);
      toast.success('Auditorium seat map generated successfully!');
      setIsGeneratorOpen(false);
      fetchSeats(selectedHallId);
    } catch (err) {
      toast.error('Failed to generate seats');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#E50914] shadow-[0_0_8px_#E50914]"></span>
            <span className="text-[10px] font-extrabold text-[#E50914] uppercase tracking-widest">
              AUDITORIUM FLOOR PLAN
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Seat Layout & Tier Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Design interactive visual seat grids, designate tiers (VIP Recliner, Couple Love-Seat, Standard), and toggle maintenance states
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsGeneratorOpen(true)}
            disabled={!selectedHallId}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E50914] to-[#B91C1C] hover:from-[#f41b26] hover:to-[#dc2626] text-white font-bold text-xs shadow-[0_0_20px_rgba(229,9,20,0.35)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiGrid className="h-4 w-4" /> Bulk Generate Grid
          </button>
        </div>
      </div>

      {/* Branch & Auditorium Selectors Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl border border-white/[0.08] bg-[#10131E]/95 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-xl text-xs">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Cinema Branch
          </label>
          <select
            value={selectedCinemaId}
            onChange={(e) => handleCinemaChange(e.target.value)}
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
            Auditorium Screen
          </label>
          <select
            value={selectedHallId}
            onChange={(e) => handleHallChange(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
          >
            {halls.map((h) => (
              <option key={h.screen_id} value={h.screen_id}>
                {h.screen_name} ({h.screen_type || '2D'}, {h.total_seats} seats)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual Seat Map Container */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#10131E]/95 p-6 sm:p-8 shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/[0.08]">
          <div>
            <h3 className="text-lg font-bold text-white">
              Interactive Auditorium Layout
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any individual seat below to toggle maintenance mode, change seat tier, or adjust pricing
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs font-bold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Total Seats: <strong className="text-white">{seatsData.total}</strong></span>
          </div>
        </div>

        {loading ? (
          <div className="py-12">
            <SkeletonLoader rows={6} cols={10} />
          </div>
        ) : seatsData.total > 0 ? (
          <div className="mt-6">
            <SeatGrid
              seats={seatsData.seats}
              grid={seatsData.grid}
              interactive={true}
              onSeatClick={handleSeatClick}
            />
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
              <FiGrid className="h-8 w-8 text-slate-500" />
            </div>
            <p className="text-base font-bold text-white">
              No seating grid created for this auditorium
            </p>
            <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto">
              Use the bulk seat generator to automatically construct cinema rows (A, B, C...) and seat matrices with preset pricing.
            </p>
            <button
              onClick={() => setIsGeneratorOpen(true)}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E50914] to-[#B91C1C] text-white font-bold text-xs shadow-[0_0_20px_rgba(229,9,20,0.35)] hover:brightness-110 transition"
            >
              <FiPlus className="h-4 w-4" /> Build Seat Grid Now
            </button>
          </div>
        )}
      </div>

      {/* Bulk Generator Modal */}
      <Modal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        title="Visual Seat Map Generator"
        size="md"
      >
        <form onSubmit={handleRunGenerator} className="space-y-4 text-xs">
          <p className="text-slate-400">
            Instantly generate a structured matrix of rows & columns with assigned seat types and base prices.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Number of Rows (e.g. 6 for A-F)
              </label>
              <input
                type="number"
                min="1"
                max="26"
                required
                value={generatorConfig.rows}
                onChange={(e) =>
                  setGeneratorConfig({ ...generatorConfig, rows: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Seats per Row (Columns)
              </label>
              <input
                type="number"
                min="2"
                max="30"
                required
                value={generatorConfig.cols}
                onChange={(e) =>
                  setGeneratorConfig({ ...generatorConfig, cols: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Standard ($)
              </label>
              <input
                type="number"
                step="0.5"
                value={generatorConfig.standard_price}
                onChange={(e) =>
                  setGeneratorConfig({ ...generatorConfig, standard_price: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                VIP ($)
              </label>
              <input
                type="number"
                step="0.5"
                value={generatorConfig.vip_price}
                onChange={(e) =>
                  setGeneratorConfig({ ...generatorConfig, vip_price: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Couple ($)
              </label>
              <input
                type="number"
                step="0.5"
                value={generatorConfig.couple_price}
                onChange={(e) =>
                  setGeneratorConfig({ ...generatorConfig, couple_price: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-2">
            <input
              type="checkbox"
              id="replaceExisting"
              checked={generatorConfig.replace}
              onChange={(e) => setGeneratorConfig({ ...generatorConfig, replace: e.target.checked })}
              className="h-4 w-4 rounded accent-[#E50914] bg-[#0A0D16] border-white/[0.2]"
            />
            <label htmlFor="replaceExisting" className="text-slate-300 text-xs">
              Replace existing seats in this auditorium
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setIsGeneratorOpen(false)}
              className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 font-semibold text-slate-300 hover:text-white hover:bg-white/[0.08] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-[#E50914] to-[#B91C1C] px-5 py-2 font-bold text-white shadow-[0_0_20px_rgba(229,9,20,0.35)] hover:brightness-110 transition"
            >
              Generate Grid
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Single Seat Modal */}
      {selectedSeatForEdit && (
        <Modal
          isOpen={!!selectedSeatForEdit}
          onClose={() => setSelectedSeatForEdit(null)}
          title={`Edit Seat ${selectedSeatForEdit.seat_number}`}
          size="sm"
        >
          <form onSubmit={handleUpdateSeatPriceAndType} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Seat Tier / Category
              </label>
              <select
                value={selectedSeatForEdit.seat_type}
                onChange={(e) =>
                  setSelectedSeatForEdit({ ...selectedSeatForEdit, seat_type: e.target.value })
                }
                className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
              >
                <option value="standard">Standard Seat</option>
                <option value="vip">VIP Leather Recliner</option>
                <option value="couple">Couple Love-Seat</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Seat Base Price ($)
              </label>
              <input
                type="number"
                step="0.5"
                value={selectedSeatForEdit.price}
                onChange={(e) =>
                  setSelectedSeatForEdit({
                    ...selectedSeatForEdit,
                    price: Number(e.target.value),
                  })
                }
                className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Seat Status
              </label>
              <select
                value={selectedSeatForEdit.status}
                onChange={(e) =>
                  setSelectedSeatForEdit({ ...selectedSeatForEdit, status: e.target.value })
                }
                className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
              >
                <option value="available">Available</option>
                <option value="maintenance">Maintenance / Disabled</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={handleToggleMaintenance}
                className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 font-bold text-amber-400 hover:bg-amber-500/20 transition"
              >
                {selectedSeatForEdit.status === 'maintenance'
                  ? 'Re-activate Seat'
                  : 'Set Maintenance'}
              </button>

              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-[#E50914] to-[#B91C1C] px-5 py-2 font-bold text-white shadow-[0_0_20px_rgba(229,9,20,0.35)] hover:brightness-110 transition"
              >
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Seats;
