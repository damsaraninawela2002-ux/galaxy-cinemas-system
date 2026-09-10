import React, { useState, useRef, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FiMenu,
  FiSearch,
  FiBell,
  FiSun,
  FiMoon,
  FiLogOut,
  FiUser,
  FiCheckCircle,
  FiChevronDown,
  FiShield,
  FiSliders,
  FiAlertTriangle
} from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';
import LogoutButton from '../../components/common/LogoutButton';

const Navbar = ({ onMobileMenuClick }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const recentNotifications = [
    { id: 1, title: 'New Booking #1014 Confirmed', time: '10m ago', unread: true },
    { id: 2, title: 'Hall 1 IMAX Laser calibrated', time: '1h ago', unread: true },
    { id: 3, title: 'Weekly box-office report generated', time: '4h ago', unread: false },
  ];

  const getPageDetails = () => {
    const path = location.pathname;
    if (path === '/admin') return { title: 'Dashboard Overview', category: 'Executive Suite' };
    if (path.includes('/movies')) return { title: 'Movie Management', category: 'Catalog Operations' };
    if (path.includes('/showtimes')) return { title: 'Showtime Scheduling', category: 'Auditorium Programming' };
    if (path.includes('/cinemas')) return { title: 'Cinemas & Auditoriums', category: 'Branch Facilities' };
    if (path.includes('/seats')) return { title: 'Seat Management', category: 'Auditorium Matrix' };
    if (path.includes('/bookings')) return { title: 'Booking Management', category: 'Ticketing Ledger' };
    if (path.includes('/users')) return { title: 'User Management', category: 'Customer Accounts' };
    if (path.includes('/payments')) return { title: 'Payment Management', category: 'Financial Audit' };
    if (path.includes('/offers')) return { title: 'Offers & Promotions', category: 'Marketing Campaigns' };
    if (path.includes('/reports')) return { title: 'Reports & Analytics', category: 'Box Office Intelligence' };
    if (path.includes('/reviews')) return { title: 'Reviews & Feedback', category: 'Audience Sentiment' };
    if (path.includes('/notifications')) return { title: 'Broadcast Notifications', category: 'Customer Messaging' };
    if (path.includes('/settings')) return { title: 'System Settings', category: 'Configuration & Security' };
    return { title: 'Admin Portal', category: 'Galaxy Cinema' };
  };

  const pageInfo = getPageDetails();

  return (
    <>
      <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-white/[0.08] bg-[#0A0C14]/85 px-4 sm:px-8 backdrop-blur-xl">
        {/* Left: Mobile menu toggle + Page title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMobileMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] hover:text-white lg:hidden transition"
            aria-label="Open menu"
          >
            <FiMenu className="h-5 w-5" />
          </button>

          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E50914] block">
              {pageInfo.category}
            </span>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
              {pageInfo.title}
            </h1>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search movies, bookings, screenings, patrons..."
              className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-red-500/50 focus:bg-white/[0.06] focus:outline-none transition shadow-inner"
            />
          </div>
        </div>

        {/* Right: Actions (Theme, Notifications, Profile) */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] hover:text-white transition"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <FiSun className="h-4 w-4 text-amber-400" /> : <FiMoon className="h-4 w-4 text-indigo-400" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] hover:text-white transition"
              aria-label="Notifications"
            >
              <FiBell className="h-4 w-4" />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-[#E50914] shadow-[0_0_8px_rgba(229,9,20,0.8)]" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-white/[0.1] bg-[#111422] p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2.5 px-1 border-b border-white/[0.08]">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">System Alerts</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
                    2 New
                  </span>
                </div>

                <div className="mt-2 space-y-1.5">
                  {recentNotifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl transition ${
                        n.unread ? 'bg-white/[0.04] border border-white/[0.06]' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-200">{n.title}</p>
                        {n.unread && <span className="h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0 mt-1" />}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigate('/admin/notifications');
                  }}
                  className="mt-2.5 w-full rounded-xl bg-white/[0.04] py-2 text-center text-xs font-bold text-red-400 hover:bg-white/[0.08] transition"
                >
                  View All Broadcasts →
                </button>
              </div>
            )}
          </div>

          {/* Admin Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1.5 sm:pr-3 hover:bg-white/[0.06] transition"
            >
              <div className="relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#E50914] to-[#991B1B] text-white font-black text-xs shadow-sm">
                  {user?.name?.charAt(0) || 'D'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-[#0A0C14]" />
              </div>

              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-white truncate max-w-[120px]">
                  {user?.name || 'Damsara admin'}
                </span>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  {user?.role || 'Super Admin'}
                </span>
              </div>

              <FiChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-white/[0.1] bg-[#111422] p-2.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Profile Header */}
                <div className="px-3 py-2 border-b border-white/[0.08]">
                  <p className="text-xs font-bold text-white truncate">
                    {user?.name || 'Damsara admin'}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {user?.email || 'damsara.admin@galaxycinema.com'}
                  </p>
                </div>

                {/* Menu Items */}
                <div className="py-1.5 space-y-1">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/admin/settings');
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/[0.06] hover:text-white transition"
                  >
                    <FiUser className="h-4 w-4 text-[#E50914]" />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/admin/settings');
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/[0.06] hover:text-white transition"
                  >
                    <FiSliders className="h-4 w-4 text-amber-400" />
                    Settings
                  </button>
                </div>

                {/* Divider */}
                <div className="my-1 border-t border-white/[0.08]" />

                {/* Logout Action Item */}
                <div>
                  <LogoutButton
                    redirectTo={import.meta.env.VITE_ADMIN_LOGIN_PATH || '/admin/login'}
                    variant="menuItem"
                    onBeforeLogout={() => {
                      setProfileOpen(false);
                      setNotificationsOpen(false);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
