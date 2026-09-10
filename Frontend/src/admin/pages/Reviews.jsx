import React, { useState, useEffect } from 'react';
import {
  FiMessageSquare,
  FiStar,
  FiTrash2,
  FiCheck,
  FiEyeOff,
  FiFilm,
  FiUser
} from 'react-icons/fi';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import SkeletonLoader from '../components/SkeletonLoader';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(4.8);
  const [distribution, setDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await apiService.getReviews();
      if (res.data?.success) {
        setReviews(res.data.data.reviews || []);
        setAverageRating(res.data.data.averageRating || 4.8);
        setDistribution(res.data.data.distribution || []);
      }
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiService.deleteReview(deleteTarget.review_id);
      toast.success('Review removed');
      setDeleteTarget(null);
      fetchReviews();
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  const handleToggleStatus = async (rev) => {
    const currentStatus = rev.status === 'hidden' ? 'hidden' : 'approved';
    const newStatus = currentStatus === 'approved' ? 'hidden' : 'approved';
    try {
      await apiService.toggleReviewStatus({
        review_id: rev.review_id,
        status: newStatus
      });
      toast.success(`Review ${newStatus === 'approved' ? 'approved' : 'hidden'}`);
      setReviews((prev) =>
        prev.map((r) =>
          r.review_id === rev.review_id ? { ...r, status: newStatus } : r
        )
      );
    } catch (err) {
      toast.error('Failed to update review status');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1 text-amber-400">
        {[...Array(5)].map((_, i) => (
          <FiStar
            key={i}
            className={`h-4 w-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
          />
        ))}
      </div>
    );
  };

  if (loading) return <SkeletonLoader rows={5} cols={4} />;

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block w-2 h-2 rounded-full bg-[#E50914] shadow-[0_0_8px_#E50914]"></span>
          <span className="text-[10px] font-extrabold text-[#E50914] uppercase tracking-widest">
            COMMUNITY FEEDBACK
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Customer Reviews & Film Ratings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor patron sentiment, movie ratings, and moderate customer testimonials
        </p>
      </div>

      {/* Ratings Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 sm:p-8 rounded-3xl border border-white/[0.08] bg-[#10131E]/95 shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-8 -mt-8"></div>

        {/* Average Score */}
        <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/[0.08] pb-6 md:pb-0">
          <span className="text-5xl sm:text-6xl font-black text-white tracking-tight">
            {averageRating}
          </span>
          <div className="mt-3">{renderStars(Math.round(averageRating))}</div>
          <span className="mt-2.5 text-xs text-slate-400 font-medium">
            Based on {reviews.length} verified ratings
          </span>
        </div>

        {/* Rating Distribution Bars */}
        <div className="md:col-span-2 space-y-3 text-xs flex flex-col justify-center">
          {distribution.map((d) => {
            const pct = reviews.length > 0 ? Math.round((d.count / reviews.length) * 100) : 0;
            return (
              <div key={d.stars} className="flex items-center gap-3">
                <span className="w-20 font-bold text-slate-300 text-xs">
                  {d.stars}
                </span>
                <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right font-bold text-slate-300 text-xs">
                  {d.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((rev) => (
          <div
            key={rev.review_id}
            className="rounded-3xl border border-white/[0.08] bg-[#10131E]/95 p-5 sm:p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:border-white/[0.18] transition-all flex flex-col sm:flex-row items-start justify-between gap-4 backdrop-blur-xl group"
          >
            <div className="flex items-start gap-4">
              {rev.poster_url ? (
                <img
                  src={rev.poster_url}
                  alt=""
                  className="w-12 aspect-[2/3] rounded-xl object-cover object-center shadow border border-white/[0.1] shrink-0 bg-gray-800"
                />
              ) : (
                <div className="w-12 aspect-[2/3] rounded-xl bg-gray-800 border border-white/[0.1] flex items-center justify-center text-[10px] text-slate-500 shrink-0">
                  Film
                </div>
              )}
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h4 className="font-bold text-sm text-white group-hover:text-red-400 transition-colors">
                    {rev.movie_title}
                  </h4>
                  {renderStars(rev.rating)}
                  {rev.status === 'hidden' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Hidden
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Approved
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "{rev.comment}"
                </p>

                <div className="flex items-center gap-2.5 text-[11px] text-slate-400 pt-1">
                  <span>Reviewer: <strong className="text-white font-semibold">{rev.customer_name}</strong></span>
                  <span>•</span>
                  <span className="font-mono text-slate-500">{rev.created_at?.split(' ')[0]}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {rev.status === 'hidden' ? (
                <button
                  type="button"
                  onClick={() => handleToggleStatus(rev)}
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition cursor-pointer"
                  title="Approve and make visible to customers"
                >
                  <FiCheck className="h-3.5 w-3.5" /> Approve
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleToggleStatus(rev)}
                  className="flex items-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition cursor-pointer"
                  title="Hide review from customer portal"
                >
                  <FiEyeOff className="h-3.5 w-3.5" /> Hide
                </button>
              )}
              <button
                type="button"
                onClick={() => setDeleteTarget(rev)}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3.5 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
              >
                <FiTrash2 className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Review Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove Review"
        message={`Delete review by ${deleteTarget?.customer_name} for "${deleteTarget?.movie_title}"?`}
      />
    </div>
  );
};

export default Reviews;
