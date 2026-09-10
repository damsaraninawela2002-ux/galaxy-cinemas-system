import React, { useState, useEffect, useContext } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LogoutButton from './common/LogoutButton';
import {
  Film,
  Search,
  Menu,
  X,
  User,
  Ticket,
  LogOut,
  ChevronDown,
  Sparkles,
  PhoneCall,
  Calendar
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const isHomePage = location.pathname === '/' || location.pathname === '/home';

  // Track scroll position to toggle navbar transparency
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };


  const navLinks = [
    { name: 'Home', path: '/home' },
    { name: 'Movies', path: '/movies' },
    { name: 'Showtimes', path: '/showtimes' },
    { name: 'Cinemas', path: '/cinemas' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || !isHomePage
            ? 'bg-[#0A0D18]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.5)] py-3'
            : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo & Wordmark */}
          <Link to="/home" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)] border border-indigo-400/30 group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-widest text-white leading-none flex items-center gap-1">
                GALAXY <span className="text-amber-400">CINEMA</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase mt-0.5">
                PREMIUM EXPERIENCE
              </span>
            </div>
          </Link>

          {/* Desktop Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || (link.path === '/home' && location.pathname === '/');
              return (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'text-white bg-white/[0.1] shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {link.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Controls: Search, Auth & Profile */}
          <div className="flex items-center gap-3">
            {/* Search Toggle / Input */}
            <div className="relative">
              {isSearchOpen ? (
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center bg-[#111628] border border-white/[0.15] rounded-full pl-3 pr-2 py-1.5 shadow-lg w-48 sm:w-64 animate-fadeIn"
                >
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search movies, genres..."
                    autoFocus
                    className="w-full bg-transparent border-none text-xs text-white placeholder-slate-400 px-2 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="w-9 h-9 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white transition"
                  title="Search movies"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Logged in User Menu OR Login/Register CTA */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-white transition"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-amber-500 flex items-center justify-center font-bold text-white text-xs shadow-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{user.name || 'Account'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Profile Dropdown Drawer */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#111628] border border-white/[0.12] shadow-2xl py-2 z-50 text-xs animate-fadeIn">
                    <div className="px-4 py-2.5 border-b border-white/[0.08]">
                      <p className="font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{user.email}</p>
                    </div>

                    <Link
                      to="/my-bookings"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/[0.06] transition"
                    >
                      <Ticket className="w-4 h-4 text-indigo-400" />
                      <span>My Bookings</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/[0.06] transition"
                    >
                      <User className="w-4 h-4 text-amber-400" />
                      <span>Profile & Settings</span>
                    </Link>

                    <div className="border-t border-white/[0.08] mt-1 pt-1">
                      <LogoutButton
                        redirectTo="/login"
                        variant="menuItem"
                        onBeforeLogout={() => setIsProfileDropdownOpen(false)}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-white/[0.06] transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.35)] transition active:scale-[0.98]"
                >
                  Get Tickets
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white transition"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Sliding Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden animate-fadeIn">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="fixed top-0 right-0 bottom-0 w-72 bg-[#0C101F] border-l border-white/[0.1] p-6 flex flex-col justify-between shadow-2xl z-50">
            <div>
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <Film className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="font-black text-sm text-white tracking-wider">
                    GALAXY <span className="text-amber-400">CINEMA</span>
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search Input */}
              <form onSubmit={handleSearchSubmit} className="mt-5">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search movies..."
                    className="w-full bg-[#141A2E] border border-white/[0.08] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </form>

              {/* Navigation Links */}
              <div className="mt-6 space-y-1.5">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`block px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                      location.pathname === link.path
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                        : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}

                {user && (
                  <>
                    <Link
                      to="/my-bookings"
                      className="block px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/[0.05] hover:text-white transition"
                    >
                      My Bookings
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/[0.05] hover:text-white transition"
                    >
                      Profile Settings
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Bottom Auth Section in Drawer */}
            <div className="pt-6 border-t border-white/[0.08]">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-1">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-amber-500 flex items-center justify-center font-bold text-white text-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <LogoutButton
                    redirectTo="/login"
                    variant="button"
                    label="Sign Out"
                    className="w-full justify-center"
                    onBeforeLogout={() => setIsMobileMenuOpen(false)}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    className="py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.04] text-center text-xs font-bold text-white hover:bg-white/[0.08] transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="py-2.5 rounded-xl bg-indigo-600 text-center text-xs font-bold text-white hover:bg-indigo-500 transition"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;