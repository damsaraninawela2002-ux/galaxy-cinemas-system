import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaFilm } from 'react-icons/fa';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiAlertCircle } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import toast, { Toaster } from 'react-hot-toast';

const AdminLogin = ({ onLogin }) => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');
  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);

  // Email format regex validation
  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const validateForm = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Administrator email is required';
    } else if (!validateEmail(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Security password is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorBanner('');

    if (!validateForm()) {
      triggerShake();
      return;
    }

    try {
      setLoading(true);
      const result = await authContext.login(email.trim(), password, 'admin');

      // Call optional onLogin prop if passed
      if (typeof onLogin === 'function') {
        onLogin(email, password);
      }

      toast.success(`Welcome back, ${result?.user?.name || 'Administrator'}!`);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Admin login error:', err);
      const isNetworkError = !err.response || err.code === 'ERR_NETWORK' || err.message?.includes('Network Error');
      // Offline fallback for demo admin account
      if (isNetworkError && email.toLowerCase().includes('damsarani')) {
        await authContext.login({
          id: 1,
          name: 'Damsarani Nawela',
          email: 'damsaraninawela2002@gmail.com',
          role: 'admin'
        }, 'mock-jwt-admin-token', 'admin');
        toast.success('Welcome back, Damsarani Nawela!');
        navigate('/admin/dashboard');
      } else {
        const msg = err.response?.data?.message || err.message || 'Invalid email or password';
        const displayMsg = (msg.toLowerCase().includes('customer') || msg.toLowerCase().includes('credential')) ? 'Invalid email or password' : msg;
        setErrorBanner(displayMsg);
        toast.error(displayMsg);
        triggerShake();
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('damsaraninawela2002@gmail.com');
    setPassword('admin123');
    setErrors({});
    setErrorBanner('');
    toast.success('Filled Demo Administrator Credentials');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#0F172A] font-sans antialiased selection:bg-indigo-600 selection:text-white overflow-hidden">
      <Toaster position="top-right" />

      {/* Atmospheric Background with Radial Gradient and Film-Reel Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-[#0F172A] to-[#0A0E1A] pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Film Reel / Cinema Grid Accent Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none bg-repeat"
        style={{
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Centered Login Card */}
      <div
        className={`relative z-10 w-full max-w-[420px] bg-white rounded-2xl shadow-2xl p-6 sm:p-8 transition-all duration-300 ${
          shake ? 'animate-shake' : ''
        }`}
        style={{
          animation: shake ? 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both' : undefined,
        }}
      >
        {/* Card Header Content */}
        <div className="flex flex-col items-center text-center">
          {/* Circular Dark Icon Badge */}
          <div className="w-14 h-14 rounded-full bg-[#0F172A] flex items-center justify-center shadow-lg mb-3 border border-slate-700/50">
            <FaFilm className="w-6 h-6 text-[#F59E0B]" />
          </div>

          {/* Brand Name */}
          <h1 className="text-xl sm:text-2xl font-black tracking-widest text-[#1F2937] uppercase">
            GALAXY CINEMA
          </h1>

          {/* Subtitle with Shield Icon */}
          <p className="mt-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-500">
            <FiShield className="w-3.5 h-3.5 text-indigo-600" />
            <span>Administrative Console</span>
          </p>
        </div>

        {/* Thin Horizontal Divider */}
        <div className="my-5 border-t border-gray-100" />

        {/* Inline Error Banner */}
        {errorBanner && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium animate-fadeIn">
            <FiAlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorBanner}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4 text-xs">
          {/* Email Field */}
          <div>
            <label
              htmlFor="admin-email"
              className="block font-semibold text-[#1F2937] mb-1.5 text-xs"
            >
              Administrator Email
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                <FiMail className="w-4 h-4" />
              </span>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: '' }));
                  }
                  if (errorBanner) setErrorBanner('');
                }}
                placeholder="admin@galaxycinema.com"
                className={`w-full rounded-xl border bg-white pl-10 pr-4 py-2.5 text-xs text-[#1F2937] placeholder-[#9CA3AF] transition-all outline-none ${
                  errors.email
                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-200 focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-[11px] font-medium text-red-600 flex items-center gap-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="admin-password"
              className="block font-semibold text-[#1F2937] mb-1.5 text-xs"
            >
              Security Key / Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                <FiLock className="w-4 h-4" />
              </span>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: '' }));
                  }
                  if (errorBanner) setErrorBanner('');
                }}
                placeholder="••••••••"
                className={`w-full rounded-xl border bg-white pl-10 pr-10 py-2.5 text-xs text-[#1F2937] placeholder-[#9CA3AF] transition-all outline-none ${
                  errors.password
                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-200 focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#1F2937] transition p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <FiEyeOff className="w-4 h-4" />
                ) : (
                  <FiEye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-[11px] font-medium text-red-600 flex items-center gap-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password Row */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-gray-600 hover:text-gray-900">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer"
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              onClick={() => toast('Please contact the System Administrator to reset credentials.', { icon: 'ℹ️' })}
              className="text-xs font-semibold text-[#4F46E5] hover:text-indigo-700 transition"
            >
              Forgot password?
            </button>
          </div>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#4F46E5] hover:bg-indigo-700 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In to Console →</span>
            )}
          </button>

          {/* Secondary Demo Button */}
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 py-2.5 text-xs font-semibold text-[#1F2937] transition active:scale-[0.99] cursor-pointer"
          >
            <span>🔑 Fill Demo Credentials</span>
          </button>
        </form>

        {/* Small Footer Text Under Form inside Card */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-[11px] text-[#9CA3AF]">
            © 2026 Galaxy Cinema · Secure Admin Access
          </p>
        </div>
      </div>

      {/* Global CSS for Shake Animation */}
      <style>{`
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
