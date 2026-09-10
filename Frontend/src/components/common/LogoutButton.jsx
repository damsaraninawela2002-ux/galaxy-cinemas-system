import React, { useState, useEffect, useContext } from 'react';
import { LogOut, Loader2, X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

/**
 * LogoutButton
 * Shared, reusable logout button component for Galaxy Cinema.
 * Works seamlessly across both Admin Dashboard and Customer-facing portal.
 *
 * @param {string} redirectTo - Route to navigate to upon logout (e.g. '/login' or '/admin/login')
 * @param {'menuItem' | 'button'} variant - Styling variant ('menuItem' for dropdown rows, 'button' for standalone)
 * @param {string} [label='Logout'] - Button label text
 * @param {string} [className=''] - Additional CSS classes
 * @param {function} [onBeforeLogout] - Optional hook called before logout action executes
 */
const LogoutButton = ({
  redirectTo = null,
  variant = 'button',
  label = 'Logout',
  className = '',
  onBeforeLogout,
  ...props
}) => {
  const { logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Keyboard accessibility and body scroll-lock when modal is open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, loading]);

  const handleOpen = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setIsOpen(true);
  };

  const handleClose = () => {
    if (!loading) {
      setIsOpen(false);
    }
  };

  const handleConfirmLogout = async () => {
    try {
      setLoading(true);
      if (typeof onBeforeLogout === 'function') {
        await onBeforeLogout();
      }
      await logout(redirectTo);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  const isMenuItem = variant === 'menuItem';

  // menuItem: dropdown menu row (icon + text, danger color)
  // button: standalone button with border and background tint
  const baseStyles = isMenuItem
    ? 'w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 text-left transition rounded-xl cursor-pointer group'
    : 'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs font-bold text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/50 transition-all cursor-pointer';

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={`${baseStyles} ${className}`}
        {...props}
      >
        <LogOut className="w-4 h-4 text-rose-500 group-hover:scale-105 transition-transform shrink-0" />
        <span>{label}</span>
      </button>

      {/* Shared Confirmation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop with cinema blur */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fadeIn"
            onClick={handleClose}
          />

          {/* Dialog Window */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#111422] border border-white/[0.12] p-6 sm:p-7 shadow-2xl text-slate-100 z-10 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
                  <LogOut className="h-5 w-5" />
                </div>
                <div>
                  <h3 id="logout-modal-title" className="text-base font-bold text-white tracking-tight">
                    Confirm Sign Out
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Galaxy Cinema Security
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-white/[0.08] hover:text-white transition disabled:opacity-50"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="mt-4">
              <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
                Are you sure you want to log out?
              </p>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                You will need to sign in again to access your tickets, dashboard, or account settings.
              </p>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end items-center gap-3 pt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={loading}
                className="rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white px-5 py-2 text-xs font-bold transition shadow-lg shadow-rose-600/30 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LogoutButton;
