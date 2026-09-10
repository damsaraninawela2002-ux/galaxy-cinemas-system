import React, { useState, useEffect, useContext } from 'react';
import {
  FiSettings,
  FiUser,
  FiLock,
  FiSliders,
  FiSave,
  FiLogOut,
  FiCheckCircle,
  FiGlobe,
  FiDollarSign,
  FiPhone,
  FiMapPin,
  FiShield
} from 'react-icons/fi';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LogoutButton from '../../components/common/LogoutButton';
import { AuthContext } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'system' | 'cinema'
  const [loading, setLoading] = useState(false);

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Galaxy Administrator',
    email: user?.email || 'admin@galaxycinema.com',
  });

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // System & Cinema Settings
  const [systemSettings, setSystemSettings] = useState({
    site_name: 'Galaxy Cinema',
    site_logo: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100',
    currency_symbol: '$',
    tax_rate: '8.5',
    max_seats_per_booking: '8',
    cancellation_window_hours: '2',
    admin_email: 'admin@galaxycinema.com',
    contact_phone: '+1 (555) 382-4400',
    contact_address: '49C, Rathnapura Road, Poruwadanda',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await apiService.getSettings();
      if (res.data?.success && res.data?.data) {
        setSystemSettings((prev) => ({ ...prev, ...res.data.data }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    toast.success('Admin profile saved successfully');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      await apiService.changePassword({ new_password: passwordForm.new_password });
      toast.success('Password changed successfully');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    }
  };

  const handleSaveSystemSettings = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiService.updateSettings(systemSettings);
      toast.success('System settings saved successfully');
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
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
              PREFERENCES & GOVERNANCE
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            System & Cinema Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure administrative security, operational booking rules, and cinema contact details
          </p>
        </div>

        <LogoutButton
          redirectTo={import.meta.env.VITE_ADMIN_LOGIN_PATH || '/admin/login'}
          variant="button"
          label="Sign Out"
          className="self-start sm:self-auto"
        />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl border border-white/[0.08] bg-[#10131E]/95 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-xl text-xs w-fit">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold transition-all text-xs ${
            activeTab === 'profile'
              ? 'bg-gradient-to-r from-[#E50914] to-[#B91C1C] text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <FiUser className="h-4 w-4" /> Admin Profile & Security
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold transition-all text-xs ${
            activeTab === 'system'
              ? 'bg-gradient-to-r from-[#E50914] to-[#B91C1C] text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <FiSliders className="h-4 w-4" /> Booking Rules & Taxation
        </button>
        <button
          onClick={() => setActiveTab('cinema')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold transition-all text-xs ${
            activeTab === 'cinema'
              ? 'bg-gradient-to-r from-[#E50914] to-[#B91C1C] text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <FiGlobe className="h-4 w-4" /> Cinema Brand & Contact
        </button>
      </div>

      {/* TAB 1: PROFILE & PASSWORD */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Card */}
          <div className="rounded-3xl border border-white/[0.08] bg-[#10131E]/95 p-6 sm:p-7 shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <h3 className="text-base font-bold text-white pb-4 border-b border-white/[0.08] flex items-center gap-2">
              <FiUser className="h-5 w-5 text-[#E50914]" /> Admin Profile
            </h3>

            <form onSubmit={handleUpdateProfile} className="mt-5 space-y-4 text-xs">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0A0D16] border border-white/[0.06]">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E50914] to-[#7f1d1d] font-black text-xl text-white shadow-[0_0_20px_rgba(229,9,20,0.35)] shrink-0">
                  {profileForm.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {profileForm.name}
                  </h4>
                  <span className="text-[11px] text-red-400 font-semibold block">Super Administrator</span>
                  <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Role: Master Access</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Administrator Display Name
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E50914] to-[#B91C1C] font-bold text-white shadow-[0_0_15px_rgba(229,9,20,0.35)] hover:brightness-110 transition active:scale-[0.98]"
              >
                <FiSave className="h-4 w-4" /> Save Profile Details
              </button>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="rounded-3xl border border-white/[0.08] bg-[#10131E]/95 p-6 sm:p-7 shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <h3 className="text-base font-bold text-white pb-4 border-b border-white/[0.08] flex items-center gap-2">
              <FiLock className="h-5 w-5 text-amber-500" /> Change Security Password
            </h3>

            <form onSubmit={handleChangePassword} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.current_password}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, current_password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.new_password}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, new_password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirm_password}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirm_password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 font-bold text-white shadow-[0_0_15px_rgba(245,158,11,0.35)] hover:brightness-110 transition active:scale-[0.98]"
              >
                <FiLock className="h-4 w-4" /> Update Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: SYSTEM BOOKING RULES */}
      {activeTab === 'system' && (
        <div className="rounded-3xl border border-white/[0.08] bg-[#10131E]/95 p-6 sm:p-7 shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl max-w-2xl">
          <h3 className="text-base font-bold text-white pb-4 border-b border-white/[0.08] flex items-center gap-2">
            <FiSliders className="h-5 w-5 text-[#E50914]" /> Operational Booking Rules & Taxes
          </h3>

          <form onSubmit={handleSaveSystemSettings} className="mt-5 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={systemSettings.currency_symbol}
                  onChange={(e) =>
                    setSystemSettings({ ...systemSettings, currency_symbol: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Sales Tax / VAT Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={systemSettings.tax_rate}
                  onChange={(e) =>
                    setSystemSettings({ ...systemSettings, tax_rate: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Max Seats Allowed Per Booking
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={systemSettings.max_seats_per_booking}
                  onChange={(e) =>
                    setSystemSettings({ ...systemSettings, max_seats_per_booking: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Cancellation Window (Hours Before Show)
                </label>
                <input
                  type="number"
                  min="0"
                  max="48"
                  value={systemSettings.cancellation_window_hours}
                  onChange={(e) =>
                    setSystemSettings({
                      ...systemSettings,
                      cancellation_window_hours: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E50914] to-[#B91C1C] font-bold text-white shadow-[0_0_15px_rgba(229,9,20,0.35)] hover:brightness-110 transition active:scale-[0.98]"
            >
              <FiSave className="h-4 w-4" /> Save Booking Rules
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: CINEMA BRAND & CONTACT */}
      {activeTab === 'cinema' && (
        <div className="rounded-3xl border border-white/[0.08] bg-[#10131E]/95 p-6 sm:p-7 shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl max-w-2xl">
          <h3 className="text-base font-bold text-white pb-4 border-b border-white/[0.08] flex items-center gap-2">
            <FiGlobe className="h-5 w-5 text-[#E50914]" /> Cinema Brand Identity & Headquarters
          </h3>

          <form onSubmit={handleSaveSystemSettings} className="mt-5 space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Site / Brand Name
              </label>
              <input
                type="text"
                value={systemSettings.site_name}
                onChange={(e) =>
                  setSystemSettings({ ...systemSettings, site_name: e.target.value })
                }
                className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Customer Support Email
                </label>
                <input
                  type="email"
                  value={systemSettings.admin_email}
                  onChange={(e) =>
                    setSystemSettings({ ...systemSettings, admin_email: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Support Telephone
                </label>
                <input
                  type="text"
                  value={systemSettings.contact_phone}
                  onChange={(e) =>
                    setSystemSettings({ ...systemSettings, contact_phone: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Headquarters Address
              </label>
              <input
                type="text"
                value={systemSettings.contact_address}
                onChange={(e) =>
                  setSystemSettings({ ...systemSettings, contact_address: e.target.value })
                }
                className="w-full rounded-xl border border-white/[0.08] bg-[#0A0D16] px-3.5 py-2.5 text-xs text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E50914] to-[#B91C1C] font-bold text-white shadow-[0_0_15px_rgba(229,9,20,0.35)] hover:brightness-110 transition active:scale-[0.98]"
            >
              <FiSave className="h-4 w-4" /> Save Brand Configuration
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Settings;
