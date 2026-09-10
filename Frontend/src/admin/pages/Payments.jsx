import React, { useState, useEffect } from 'react';
import {
  FiCreditCard,
  FiDollarSign,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiCalendar,
  FiUser,
  FiArrowUpRight,
  FiTrendingUp
} from 'react-icons/fi';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import SkeletonLoader from '../components/SkeletonLoader';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ totalSuccess: 0, totalRefunded: 0, totalFailed: 0 });
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'success' | 'failed' | 'refunded'
  const [refundTarget, setRefundTarget] = useState(null);
  const [refundReason, setRefundReason] = useState('Customer cancellation request');
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [activeTab]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeTab !== 'all') params.status = activeTab;

      const res = await apiService.getPayments(params);
      if (res.data?.success) {
        setPayments(res.data.data.payments || []);
        if (res.data.data.summary) {
          setSummary(res.data.data.summary);
        }
      }
    } catch (err) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRefund = async (e) => {
    e.preventDefault();
    if (!refundTarget) return;

    try {
      setIsProcessingRefund(true);
      await apiService.refundPayment({
        payment_id: refundTarget.payment_id,
        reason: refundReason,
      });
      toast.success(`Refund of $${Number(refundTarget.amount).toFixed(2)} processed`);
      setRefundTarget(null);
      fetchPayments();
    } catch (err) {
      toast.error('Failed to process refund');
    } finally {
      setIsProcessingRefund(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return <Badge variant="success">Paid</Badge>;
      case 'refunded':
        return <Badge variant="warning">Refunded</Badge>;
      case 'failed':
        return <Badge variant="danger">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const columns = [
    {
      key: 'payment_id',
      label: 'Transaction ID',
      sortable: true,
      render: (val) => (
        <span className="font-mono font-bold text-[#E50914] bg-[#E50914]/10 border border-[#E50914]/25 px-2 py-0.5 rounded-lg text-xs">
          #TXN-{val}
        </span>
      ),
    },
    {
      key: 'booking_id',
      label: 'Booking Ref',
      render: (val) => (
        <span className="font-mono text-xs font-semibold text-slate-300">
          #{val}
        </span>
      ),
    },
    {
      key: 'customer_name',
      label: 'Customer',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-white block text-xs">{val}</span>
          <span className="text-[11px] text-slate-400 block truncate max-w-[140px]">{row.customer_email}</span>
        </div>
      ),
    },
    {
      key: 'movie_title',
      label: 'Movie',
      render: (val) => (
        <span className="font-medium text-slate-200 block text-xs truncate max-w-xs">
          {val}
        </span>
      ),
    },
    {
      key: 'payment_method',
      label: 'Method',
      render: (val) => (
        <span className="rounded-lg bg-white/[0.05] border border-white/[0.08] px-2.5 py-1 text-xs font-semibold capitalize text-slate-300">
          {val}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (val) => (
        <span className="font-extrabold text-white text-sm">
          ${Number(val).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'payment_status',
      label: 'Status',
      render: (val) => getStatusBadge(val),
    },
    {
      key: 'paid_at',
      label: 'Date',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-slate-400 font-mono">{val?.split(' ')[0]}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div>
          {row.payment_status === 'success' && (
            <button
              onClick={() => setRefundTarget(row)}
              className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition"
            >
              Refund
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
              FINANCE & GATEWAY
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Payment Transactions & Audit
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit gateway transactions, track settled revenue, and process customer ticket refunds
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-3xl border border-emerald-500/20 bg-[#10131E]/95 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)] relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none -mr-6 -mt-6"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Settled Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FiCheckCircle className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white mt-2">
            ${Number(summary.totalSuccess).toFixed(2)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Successfully cleared transactions</p>
        </div>

        <div className="rounded-3xl border border-amber-500/20 bg-[#10131E]/95 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)] relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none -mr-6 -mt-6"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Processed Refunds
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FiRefreshCw className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white mt-2">
            ${Number(summary.totalRefunded).toFixed(2)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Reversed box office funds</p>
        </div>

        <div className="rounded-3xl border border-rose-500/20 bg-[#10131E]/95 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)] relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none -mr-6 -mt-6"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Failed Charges
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <FiXCircle className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white mt-2">
            ${Number(summary.totalFailed).toFixed(2)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Declined by payment processor</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-3 sm:p-4 rounded-2xl border border-white/[0.08] bg-[#10131E]/95 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-xl text-xs">
        {[
          { key: 'all', label: 'All Transactions' },
          { key: 'success', label: 'Settled' },
          { key: 'refunded', label: 'Refunded' },
          { key: 'failed', label: 'Failed' },
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

      {/* Table */}
      {loading ? (
        <SkeletonLoader rows={6} cols={9} />
      ) : (
        <DataTable
          columns={columns}
          data={payments}
          searchPlaceholder="Search by transaction ID, customer or movie..."
          searchField="customer_name"
          pageSize={10}
        />
      )}

      {/* Process Refund Modal */}
      {refundTarget && (
        <Modal
          isOpen={!!refundTarget}
          onClose={() => setRefundTarget(null)}
          title={`Process Refund for TXN #${refundTarget.payment_id}`}
          size="sm"
        >
          <form onSubmit={handleProcessRefund} className="space-y-4 text-xs">
            <div className="rounded-2xl bg-[#0A0D16] p-4 border border-amber-500/30">
              <p className="text-amber-400 font-bold text-sm">
                Refund Amount: ${Number(refundTarget.amount).toFixed(2)}
              </p>
              <p className="text-slate-300 mt-1">
                Customer: {refundTarget.customer_name} ({refundTarget.customer_email})
              </p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Booking ID: #{refundTarget.booking_id} • {refundTarget.movie_title}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Refund Reason *
              </label>
              <textarea
                rows={3}
                required
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Reason for refund (e.g. customer schedule change, cancelled screening)..."
                className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setRefundTarget(null)}
                className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 font-semibold text-slate-300 hover:text-white hover:bg-white/[0.08] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessingRefund}
                className="rounded-xl bg-amber-600 hover:bg-amber-500 px-5 py-2 font-bold text-white shadow-sm transition disabled:opacity-50"
              >
                {isProcessingRefund ? 'Processing...' : 'Confirm Refund'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Payments;
