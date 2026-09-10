import React, { useState, useContext } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  Award, 
  Ticket, 
  CreditCard, 
  Bell, 
  CheckCircle2, 
  MapPin, 
  Camera,
  Save
} from 'lucide-react';
import { AuthContext } from './context/AuthContext';
import { MOCK_CINEMAS } from './data/mockData';

export default function Profile() {
  const { user } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('info'); // 'info', 'security', 'preferences'
  const [successMessage, setSuccessMessage] = useState('');

  // Profile fields state
  const [formData, setFormData] = useState({
    fullName: user?.name || user?.full_name || 'Alexander Mercer',
    email: user?.email || 'alexander.mercer@gmail.com',
    phone: '+1 (555) 234-8901',
    favoriteTheater: 'Galaxy Cinema Poruwadanda',
    favoriteGenres: ['Sci-Fi', 'Action', 'IMAX Laser']
  });

  // Security fields
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification prefs
  const [prefs, setPrefs] = useState({
    bookingAlerts: true,
    trailerReleases: true,
    vipPromos: true,
    smsAlerts: false
  });

  const handleSaveInfo = (e) => {
    e.preventDefault();
    setSuccessMessage('Your profile information has been saved successfully!');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleSaveSecurity = (e) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    setSuccessMessage('Your password has been updated successfully!');
    setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <div className="min-h-screen bg-[#080B14] text-slate-100 pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Profile Hero Card */}
        <div className="relative rounded-3xl border border-white/[0.08] bg-[#101426] p-6 sm:p-8 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {/* Avatar with Badge */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-indigo-500/40 shadow-xl bg-[#161B30] flex items-center justify-center text-white text-3xl font-black font-serif">
                {formData.fullName.charAt(0)}
              </div>
              <button 
                type="button"
                className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition"
                title="Change Avatar"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  Galaxy VIP Club • Gold Tier
                </span>
                <span className="text-xs text-slate-400">Member since Feb 2025</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-black text-white font-serif tracking-tight">
                {formData.fullName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                {formData.email} • {formData.phone}
              </p>
            </div>
          </div>

          {/* Loyalty Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/[0.08]">
            <div className="p-3.5 rounded-2xl bg-[#090C16] border border-white/[0.06] text-center">
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">1,450</span>
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                Reward Points
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#090C16] border border-white/[0.06] text-center">
              <span className="text-xl sm:text-2xl font-black text-indigo-400 font-mono">18</span>
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                Movies Watched
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#090C16] border border-white/[0.06] text-center">
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">1</span>
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                Active Booking
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#090C16] border border-white/[0.06] text-center">
              <span className="text-xl sm:text-2xl font-black text-slate-200 font-mono">$35.00</span>
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                Saved Discounts
              </span>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Settings Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#101426] border border-white/[0.08] w-fit">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'info'
                ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Personal Details
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'security'
                ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Security & Password
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'preferences'
                ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            Notification Settings
          </button>
        </div>

        {/* Tab 1: Personal Info */}
        {activeTab === 'info' && (
          <form onSubmit={handleSaveInfo} className="rounded-3xl border border-white/[0.08] bg-[#101426] p-6 sm:p-8 shadow-xl space-y-6">
            <h3 className="text-base font-black text-white font-serif">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full rounded-xl bg-[#090C16] border border-white/[0.1] px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl bg-[#090C16] border border-white/[0.1] px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-xl bg-[#090C16] border border-white/[0.1] px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Home Cinema Branch
                </label>
                <select
                  value={formData.favoriteTheater}
                  onChange={(e) => setFormData({ ...formData, favoriteTheater: e.target.value })}
                  className="w-full rounded-xl bg-[#090C16] border border-white/[0.1] px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-indigo-500"
                >
                  {MOCK_CINEMAS.map(c => (
                    <option key={c.theater_id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Profile Changes
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Security & Password */}
        {activeTab === 'security' && (
          <form onSubmit={handleSaveSecurity} className="rounded-3xl border border-white/[0.08] bg-[#101426] p-6 sm:p-8 shadow-xl space-y-6">
            <h3 className="text-base font-black text-white font-serif">
              Change Account Password
            </h3>

            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={securityData.currentPassword}
                  onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                  className="w-full rounded-xl bg-[#090C16] border border-white/[0.1] px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={securityData.newPassword}
                  onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                  className="w-full rounded-xl bg-[#090C16] border border-white/[0.1] px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={securityData.confirmPassword}
                  onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                  className="w-full rounded-xl bg-[#090C16] border border-white/[0.1] px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Update Password
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Notification Settings */}
        {activeTab === 'preferences' && (
          <div className="rounded-3xl border border-white/[0.08] bg-[#101426] p-6 sm:p-8 shadow-xl space-y-6">
            <h3 className="text-base font-black text-white font-serif">
              Communication & Reminder Preferences
            </h3>

            <div className="space-y-4 max-w-2xl">
              {[
                { key: 'bookingAlerts', title: 'Digital Ticket & Confirmation Emails', desc: 'Receive your e-ticket barcode and order receipt instantly upon checkout.' },
                { key: 'trailerReleases', title: 'New Trailer & Ticket Presale Drops', desc: 'Be the first to hear when advance tickets open for upcoming blockbuster releases.' },
                { key: 'vipPromos', title: 'Galaxy VIP Member Offers & Discounts', desc: 'Receive exclusive monthly coupons, free snack vouchers, and birthday credits.' },
                { key: 'smsAlerts', title: 'SMS Showtime Reminders', desc: 'Get a text notification 2 hours before your movie begins with parking guidance.' }
              ].map(item => (
                <div key={item.key} className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-[#090C16] border border-white/[0.06]">
                  <div>
                    <h5 className="font-bold text-sm text-white">{item.title}</h5>
                    <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs[item.key]}
                    onChange={(e) => setPrefs({ ...prefs, [item.key]: e.target.checked })}
                    className="w-5 h-5 rounded-md accent-indigo-600 mt-1 cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex justify-end">
              <button
                onClick={() => {
                  setSuccessMessage('Notification preferences saved successfully!');
                  setTimeout(() => setSuccessMessage(''), 4000);
                }}
                className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Preferences
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
