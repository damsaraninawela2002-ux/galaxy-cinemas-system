import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Film, 
  Sparkles, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2,
  Ticket
} from 'lucide-react';
import { AuthContext } from './context/AuthContext';
import { apiService } from './services/api';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      await login(email, password, 'customer');
      navigate('/');
    } catch (err) {
      console.warn("Customer login failed:", err.message);
      const isNetworkError = !err.response || err.code === 'ERR_NETWORK' || err.message?.includes('Network Error');
      // Offline fallback for demo customer account
      if (isNetworkError && (email.toLowerCase().includes('alex') || email.toLowerCase().includes('demo') || email.toLowerCase().includes('customer'))) {
        await login({
          id: 101,
          name: 'Alexander Mercer',
          email: email || 'alexander.mercer@gmail.com',
          role: 'customer'
        }, 'mock-jwt-customer-token', 'customer');
        navigate('/');
      } else {
        const message = err.response?.data?.message || err.message || 'Invalid email or password';
        setErrorMessage(message.toLowerCase().includes('admin') ? 'Invalid email or password' : message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoCustomer = () => {
    setEmail('alexander.mercer@gmail.com');
    setPassword('GalaxyPass2026!');
  };

  return (
    <div className="min-h-screen bg-[#080B14] text-slate-100 flex items-center justify-center p-4 py-24 relative overflow-hidden">
      {/* Cinematic Ambient Glow Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/home" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-amber-400 p-0.5 shadow-lg group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#090C16] rounded-[14px] flex items-center justify-center">
                <Film className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <span className="font-serif font-black text-2xl tracking-wider text-white">
              GALAXY<span className="text-amber-400">.</span>
            </span>
          </Link>
          <h2 className="text-2xl font-black text-white font-serif tracking-tight">
            Welcome Back
          </h2>
          <p className="text-xs text-slate-400">
            Sign in to access your booked tickets, rewards, and VIP benefits
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#101426] p-6 sm:p-8 shadow-2xl space-y-5 backdrop-blur-md">
          
          {/* Quick Demo Fill Button */}
          <button
            type="button"
            onClick={fillDemoCustomer}
            className="w-full py-2 px-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Quick Demo: Fill Customer Account
          </button>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-[#090C16] border border-white/[0.1] pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-[#090C16] border border-white/[0.1] pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                />
                <span className="text-xs text-slate-400">Remember me</span>
              </label>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In to Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Register */}
          <div className="pt-4 border-t border-white/[0.06] text-center">
            <p className="text-xs text-slate-400">
              Don't have a Galaxy account?{' '}
              <Link to="/register" className="font-bold text-indigo-400 hover:text-indigo-300">
                Create one now
              </Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}