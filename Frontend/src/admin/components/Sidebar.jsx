import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiFilm,
  FiCalendar,
  FiMapPin,
  FiLayers,
  FiBookOpen,
  FiUsers,
  FiCreditCard,
  FiTag,
  FiBarChart2,
  FiStar,
  FiBell,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiTv
} from 'react-icons/fi';

const navItems = [
  { name: 'Dashboard', path: '/admin', icon: FiHome },
  { name: 'Movie Management', path: '/admin/movies', icon: FiFilm },
  { name: 'Showtime Management', path: '/admin/showtimes', icon: FiCalendar },
  { name: 'Cinema / Hall Management', path: '/admin/cinemas', icon: FiMapPin },
  { name: 'Seat Management', path: '/admin/seats', icon: FiLayers },
  { name: 'Booking Management', path: '/admin/bookings', icon: FiBookOpen },
  { name: 'User Management', path: '/admin/users', icon: FiUsers },
  { name: 'Payment Management', path: '/admin/payments', icon: FiCreditCard },
  { name: 'Offers & Promotions', path: '/admin/offers', icon: FiTag },
  { name: 'Reports & Analytics', path: '/admin/reports', icon: FiBarChart2 },
  { name: 'Reviews & Feedback', path: '/admin/reviews', icon: FiStar },
  { name: 'Notifications', path: '/admin/notifications', icon: FiBell },
  { name: 'Settings', path: '/admin/settings', icon: FiSettings },
];

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-white/[0.08] bg-[#0A0C14] transition-all duration-300 shadow-2xl ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header: 🎬 Galaxy Cinema logo/name */}
        <div className="flex h-20 items-center justify-between px-5 border-b border-white/[0.08] bg-[#090A0F]">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Clapper / Cinema Icon with Crimson Glow */}
            <div className="flex h-11 w-11 min-w-[2.75rem] items-center justify-center rounded-2xl bg-gradient-to-br from-[#E50914] via-[#DC2626] to-[#991B1B] text-white shadow-[0_0_20px_rgba(229,9,20,0.5)]">
              <FiFilm className="h-5 w-5" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  GALAXY<span className="text-[#E50914]">CINEMA</span>
                </span>
                <span className="text-[10px] font-extrabold tracking-widest uppercase text-amber-400">
                  ADMIN PORTAL
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-slate-400 hover:bg-white/[0.08] hover:text-white transition"
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? <FiChevronRight className="h-4 w-4" /> : <FiChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/admin'}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#E50914] to-[#B91C1C] text-white shadow-[0_0_18px_rgba(229,9,20,0.4)]'
                      : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'
                  }`
                }
                title={isCollapsed ? item.name : undefined}
              >
                {({ isActive }) => (
                  <>
                    {/* Active Left Glow Accent Bar */}
                    {isActive && (
                      <span className="absolute -left-3 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#FF2E36] shadow-[0_0_10px_#E50914]" />
                    )}

                    <Icon
                      className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                      }`}
                    />

                    {!isCollapsed && <span className="truncate tracking-wide">{item.name}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer info */}
        {!isCollapsed && (
          <div className="p-4 border-t border-white/[0.08] bg-[#08090E] text-center">
            <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Cinema System Online</span>
            </div>
            <p className="text-[10px] text-slate-600 mt-1">Galaxy OS • Enterprise v2.4</p>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
