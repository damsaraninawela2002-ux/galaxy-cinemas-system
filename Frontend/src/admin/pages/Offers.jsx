import React, { useState, useEffect } from 'react';
import {
  FiTag,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiPercent,
  FiCalendar,
  FiCopy,
  FiCheck,
  FiGift,
  FiTrendingUp
} from 'react-icons/fi';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Badge from '../components/Badge';
import SkeletonLoader from '../components/SkeletonLoader';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab: 'offers' | 'promos'
  const [activeTab, setActiveTab] = useState('offers');

  // Modals
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [deleteOfferTarget, setDeleteOfferTarget] = useState(null);

  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [deletePromoTarget, setDeletePromoTarget] = useState(null);

  // Forms
  const [offerForm, setOfferForm] = useState({
    title: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 20,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    banner: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600',
    status: 'active',
  });

  const [promoForm, setPromoForm] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: 15,
    usage_limit: 100,
    expiry_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    status: 'active',
  });

  useEffect(() => {
    fetchOffersAndPromos();
  }, []);

  const fetchOffersAndPromos = async () => {
    try {
      setLoading(true);
      const [offRes, proRes] = await Promise.all([
        apiService.getOffers(),
        apiService.getPromoCodes(),
      ]);
      if (offRes.data?.success) setOffers(offRes.data.data);
      if (proRes.data?.success) setPromoCodes(proRes.data.data);
    } catch (err) {
      toast.error('Failed to load offers and promo codes');
    } finally {
      setLoading(false);
    }
  };

  // Offer handlers
  const handleOpenAddOffer = () => {
    setEditingOffer(null);
    setOfferForm({
      title: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 20,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      banner: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600',
      status: 'active',
    });
    setIsOfferModalOpen(true);
  };

  const handleOpenEditOffer = (off) => {
    setEditingOffer(off);
    setOfferForm({
      id: off.id,
      title: off.title,
      description: off.description || '',
      discount_type: off.discount_type,
      discount_value: off.discount_value,
      start_date: off.start_date,
      end_date: off.end_date,
      banner: off.banner || '',
      status: off.status,
    });
    setIsOfferModalOpen(true);
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingOffer) {
        await apiService.editOffer(offerForm);
        toast.success('Offer updated');
      } else {
        await apiService.addOffer(offerForm);
        toast.success('Offer published');
      }
      setIsOfferModalOpen(false);
      fetchOffersAndPromos();
    } catch (err) {
      toast.error('Failed to save offer');
    }
  };

  const handleDeleteOffer = async () => {
    if (!deleteOfferTarget) return;
    try {
      await apiService.deleteOffer(deleteOfferTarget.id);
      toast.success('Offer removed');
      setDeleteOfferTarget(null);
      fetchOffersAndPromos();
    } catch (err) {
      toast.error('Failed to delete offer');
    }
  };

  // Promo handlers
  const handleOpenAddPromo = () => {
    setEditingPromo(null);
    setPromoForm({
      code: '',
      discount_type: 'percentage',
      discount_value: 15,
      usage_limit: 100,
      expiry_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'active',
    });
    setIsPromoModalOpen(true);
  };

  const handleOpenEditPromo = (p) => {
    setEditingPromo(p);
    setPromoForm({
      id: p.id,
      code: p.code,
      discount_type: p.discount_type,
      discount_value: p.discount_value,
      usage_limit: p.usage_limit,
      expiry_date: p.expiry_date,
      status: p.status,
    });
    setIsPromoModalOpen(true);
  };

  const handlePromoSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPromo) {
        await apiService.editPromoCode(promoForm);
        toast.success('Promo code updated');
      } else {
        await apiService.addPromoCode(promoForm);
        toast.success('Promo code created');
      }
      setIsPromoModalOpen(false);
      fetchOffersAndPromos();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving promo code');
    }
  };

  const handleDeletePromo = async () => {
    if (!deletePromoTarget) return;
    try {
      await apiService.deletePromoCode(deletePromoTarget.id);
      toast.success('Promo code deleted');
      setDeletePromoTarget(null);
      fetchOffersAndPromos();
    } catch (err) {
      toast.error('Failed to delete promo');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied "${code}" to clipboard!`);
  };

  if (loading) return <SkeletonLoader rows={5} cols={4} />;

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#E50914] shadow-[0_0_8px_#E50914]"></span>
            <span className="text-[10px] font-extrabold text-[#E50914] uppercase tracking-widest">
              MARKETING & CAMPAIGNS
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Offers & Promotions
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create promotional banners, seasonal cinema discounts, and manage coupon promo codes
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'offers' ? (
            <button
              onClick={handleOpenAddOffer}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E50914] to-[#B91C1C] hover:from-[#f41b26] hover:to-[#dc2626] text-white font-bold text-xs shadow-[0_0_20px_rgba(229,9,20,0.35)] transition-all active:scale-[0.98]"
            >
              <FiPlus className="h-4 w-4" /> Add Offer Banner
            </button>
          ) : (
            <button
              onClick={handleOpenAddPromo}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all active:scale-[0.98]"
            >
              <FiPlus className="h-4 w-4" /> Generate Promo Code
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl border border-white/[0.08] bg-[#10131E]/95 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-xl text-xs w-fit">
        <button
          onClick={() => setActiveTab('offers')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold transition-all text-xs ${
            activeTab === 'offers'
              ? 'bg-gradient-to-r from-[#E50914] to-[#B91C1C] text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <FiTag className="h-4 w-4" /> Promotional Banners ({offers.length})
        </button>
        <button
          onClick={() => setActiveTab('promos')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold transition-all text-xs ${
            activeTab === 'promos'
              ? 'bg-gradient-to-r from-[#E50914] to-[#B91C1C] text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <FiPercent className="h-4 w-4" /> Promo Codes ({promoCodes.length})
        </button>
      </div>

      {/* TAB 1: OFFERS */}
      {activeTab === 'offers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((off) => (
            <div
              key={off.id}
              className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#10131E]/95 shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:border-white/[0.2] transition-all flex flex-col justify-between group backdrop-blur-xl"
            >
              {/* Banner Image */}
              <div className="relative h-48 w-full overflow-hidden bg-[#0A0D16]">
                <img
                  src={off.banner || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600'}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#10131E] via-transparent to-black/40"></div>
                <div className="absolute top-3 right-3">
                  <span className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-black text-black shadow-lg">
                    {off.discount_type === 'percentage' ? `${off.discount_value}% OFF` : `$${off.discount_value} FLAT`}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-base font-bold text-white group-hover:text-red-400 transition-colors">
                    {off.title}
                  </h4>
                  <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {off.description}
                  </p>
                  <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <FiCalendar className="h-3.5 w-3.5 text-[#E50914]" /> Valid: {off.start_date} to {off.end_date}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/[0.06]">
                  <Badge variant={off.status === 'active' ? 'success' : 'default'}>
                    {off.status}
                  </Badge>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEditOffer(off)}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition"
                      title="Edit Offer"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteOfferTarget(off)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete Offer"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: PROMO CODES */}
      {activeTab === 'promos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {promoCodes.map((p) => {
            const usagePct = p.usage_limit > 0 ? Math.min(100, Math.round((p.used_count / p.usage_limit) * 100)) : 0;
            return (
              <div
                key={p.id}
                className="rounded-3xl border border-white/[0.08] bg-[#10131E]/95 p-5 shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:border-white/[0.2] transition-all flex flex-col justify-between group backdrop-blur-xl"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <button
                      onClick={() => copyCode(p.code)}
                      className="flex items-center gap-1.5 rounded-xl border border-dashed border-[#E50914]/50 bg-[#E50914]/10 hover:bg-[#E50914]/20 px-3 py-1.5 font-mono font-black text-sm text-red-400 transition"
                      title="Click to copy code"
                    >
                      <span>{p.code}</span>
                      <FiCopy className="h-3 w-3" />
                    </button>

                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenEditPromo(p)}
                        className="p-1 text-slate-400 hover:text-white transition"
                        title="Edit Promo"
                      >
                        <FiEdit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletePromoTarget(p)}
                        className="p-1 text-slate-400 hover:text-rose-400 transition"
                        title="Delete Promo"
                      >
                        <FiTrash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className="text-3xl font-black text-white">
                      {p.discount_type === 'percentage' ? `${p.discount_value}%` : `$${p.discount_value}`}
                    </span>
                    <span className="text-xs text-slate-400 ml-1.5 font-bold uppercase tracking-wider">Discount</span>
                  </div>

                  {/* Usage bar */}
                  <div className="mt-5 space-y-1.5 text-xs">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Redeemed</span>
                      <span className="font-bold text-white">{p.used_count} / {p.usage_limit}</span>
                    </div>
                    <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#E50914] to-amber-500 rounded-full"
                        style={{ width: `${usagePct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-3 text-[11px] text-slate-400">
                  <span>Exp: {p.expiry_date}</span>
                  <Badge variant={p.status === 'active' ? 'success' : 'default'} size="xs">
                    {p.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Offer Add / Edit Modal */}
      <Modal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        title={editingOffer ? 'Edit Promotion Banner' : 'Create Promotion Banner'}
        size="md"
      >
        <form onSubmit={handleOfferSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Promotion Title *
            </label>
            <input
              type="text"
              required
              value={offerForm.title}
              onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
              placeholder="e.g. Tuesday Cinema Deal 25% Off"
              className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={offerForm.description}
              onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
              placeholder="Details of the offer..."
              className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Discount Type
              </label>
              <select
                value={offerForm.discount_type}
                onChange={(e) => setOfferForm({ ...offerForm, discount_type: e.target.value })}
                className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Dollar Amount ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Discount Value *
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={offerForm.discount_value}
                onChange={(e) => setOfferForm({ ...offerForm, discount_value: Number(e.target.value) })}
                className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                required
                value={offerForm.start_date}
                onChange={(e) => setOfferForm({ ...offerForm, start_date: e.target.value })}
                className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                End Date
              </label>
              <input
                type="date"
                required
                value={offerForm.end_date}
                onChange={(e) => setOfferForm({ ...offerForm, end_date: e.target.value })}
                className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Banner Image URL
            </label>
            <input
              type="text"
              value={offerForm.banner}
              onChange={(e) => setOfferForm({ ...offerForm, banner: e.target.value })}
              className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setIsOfferModalOpen(false)}
              className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 font-semibold text-slate-300 hover:text-white hover:bg-white/[0.08] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-[#E50914] to-[#B91C1C] px-5 py-2 font-bold text-white shadow-[0_0_20px_rgba(229,9,20,0.35)] hover:brightness-110 transition"
            >
              {editingOffer ? 'Save Changes' : 'Publish Offer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Promo Code Add / Edit Modal */}
      <Modal
        isOpen={isPromoModalOpen}
        onClose={() => setIsPromoModalOpen(false)}
        title={editingPromo ? 'Edit Promo Code' : 'Generate Promo Code'}
        size="sm"
      >
        <form onSubmit={handlePromoSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Promo Code *
            </label>
            <input
              type="text"
              required
              value={promoForm.code}
              onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
              placeholder="e.g. GALAXY25"
              className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white font-mono uppercase font-bold focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Discount Type
              </label>
              <select
                value={promoForm.discount_type}
                onChange={(e) => setPromoForm({ ...promoForm, discount_type: e.target.value })}
                className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
              >
                <option value="percentage">% Percentage</option>
                <option value="flat">$ Flat Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Value
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={promoForm.discount_value}
                onChange={(e) => setPromoForm({ ...promoForm, discount_value: Number(e.target.value) })}
                className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Usage Limit
              </label>
              <input
                type="number"
                min="1"
                required
                value={promoForm.usage_limit}
                onChange={(e) => setPromoForm({ ...promoForm, usage_limit: Number(e.target.value) })}
                className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Expiry Date
              </label>
              <input
                type="date"
                required
                value={promoForm.expiry_date}
                onChange={(e) => setPromoForm({ ...promoForm, expiry_date: e.target.value })}
                className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setIsPromoModalOpen(false)}
              className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 font-semibold text-slate-300 hover:text-white hover:bg-white/[0.08] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2 font-bold text-white hover:brightness-110 shadow-sm transition"
            >
              {editingPromo ? 'Save Code' : 'Create Code'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={!!deleteOfferTarget}
        onClose={() => setDeleteOfferTarget(null)}
        onConfirm={handleDeleteOffer}
        title="Delete Offer Banner"
        message={`Delete promotion "${deleteOfferTarget?.title}"?`}
      />

      <ConfirmDialog
        isOpen={!!deletePromoTarget}
        onClose={() => setDeletePromoTarget(null)}
        onConfirm={handleDeletePromo}
        title="Delete Promo Code"
        message={`Delete promo code "${deletePromoTarget?.code}"?`}
      />
    </div>
  );
};

export default Offers;
