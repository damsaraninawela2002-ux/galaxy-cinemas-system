import React, { useState, useEffect } from 'react';
import {
  FiBell,
  FiSend,
  FiTrash2,
  FiUser,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiVolume2
} from 'react-icons/fi';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import SkeletonLoader from '../components/SkeletonLoader';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [form, setForm] = useState({
    title: '',
    message: '',
    target: 'all', // 'all' | 'specific'
    user_id: '',
  });
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchNotificationsAndUsers();
  }, []);

  const fetchNotificationsAndUsers = async () => {
    try {
      setLoading(true);
      const [notifRes, userRes] = await Promise.all([
        apiService.getNotifications(),
        apiService.getUsers(),
      ]);
      if (notifRes.data?.success) setNotifications(notifRes.data.data);
      if (userRes.data?.success) setUsers(userRes.data.data);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Title and message are required');
      return;
    }

    try {
      setIsSending(true);
      await apiService.sendNotification(form);
      toast.success('Notification broadcast dispatched!');
      setForm({ title: '', message: '', target: 'all', user_id: '' });
      fetchNotificationsAndUsers();
    } catch (err) {
      toast.error('Failed to send notification');
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiService.deleteNotification(id);
      toast.success('Notification removed');
      fetchNotificationsAndUsers();
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  if (loading) return <SkeletonLoader rows={5} cols={4} />;

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block w-2 h-2 rounded-full bg-[#E50914] shadow-[0_0_8px_#E50914]"></span>
          <span className="text-[10px] font-extrabold text-[#E50914] uppercase tracking-widest">
            COMMUNICATIONS HUB
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Broadcast Notifications & Alerts
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Push system announcements, flash promotions, and screening schedule alerts to customers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose Notification Card */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#10131E]/95 p-6 sm:p-7 shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.08]">
            <div className="w-8 h-8 rounded-xl bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
              <FiSend className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-white">Compose Notification</h3>
          </div>

          <form onSubmit={handleSend} className="mt-5 space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Notification Title *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Flash Weekend Sale: 20% Off"
                className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Audience
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, target: 'all', user_id: '' })}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 font-bold text-xs transition ${
                    form.target === 'all'
                      ? 'border-[#E50914] bg-[#E50914]/15 text-red-400 shadow-[0_0_15px_rgba(229,9,20,0.2)]'
                      : 'border-white/[0.08] bg-white/[0.02] text-slate-400 hover:text-white'
                  }`}
                >
                  <FiUsers className="h-3.5 w-3.5" /> All Patrons
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, target: 'specific' })}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 font-bold text-xs transition ${
                    form.target === 'specific'
                      ? 'border-[#E50914] bg-[#E50914]/15 text-red-400 shadow-[0_0_15px_rgba(229,9,20,0.2)]'
                      : 'border-white/[0.08] bg-white/[0.02] text-slate-400 hover:text-white'
                  }`}
                >
                  <FiUser className="h-3.5 w-3.5" /> Individual
                </button>
              </div>
            </div>

            {form.target === 'specific' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Recipient *
                </label>
                <select
                  required
                  value={form.user_id}
                  onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
                >
                  <option value="">Choose a customer</option>
                  {users.map((u) => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.full_name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Message Content *
              </label>
              <textarea
                rows={4}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Type your message broadcast here..."
                className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E50914] to-[#B91C1C] py-3 font-bold text-white shadow-[0_0_20px_rgba(229,9,20,0.35)] hover:brightness-110 transition active:scale-[0.98] disabled:opacity-50"
            >
              <FiSend className="h-4 w-4" />
              {isSending ? 'Sending Broadcast...' : 'Dispatch Broadcast'}
            </button>
          </form>
        </div>

        {/* History Log */}
        <div className="lg:col-span-2 rounded-3xl border border-white/[0.08] bg-[#10131E]/95 p-6 sm:p-7 shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <h3 className="text-base font-bold text-white">
                  Sent Broadcast History ({notifications.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Audit log of all dispatched campaigns</p>
              </div>
            </div>

            <div className="mt-4 divide-y divide-white/[0.06] max-h-[500px] overflow-y-auto pr-1">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div key={n.id} className="py-4 flex items-start justify-between gap-4 group">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-xs text-white group-hover:text-red-400 transition-colors">{n.title}</h4>
                        <Badge variant="success" size="xs">
                          Delivered
                        </Badge>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {n.target === 'all' ? 'To: All Customers' : `To: ${n.target_user_name || 'Individual'}`}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>

                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                        <FiClock className="h-3 w-3" /> {n.sent_at}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(n.id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition shrink-0"
                      title="Delete record"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center text-slate-500">
                  <FiBell className="mx-auto h-8 w-8 text-slate-600 mb-2" />
                  <p>No broadcast notifications dispatched yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
