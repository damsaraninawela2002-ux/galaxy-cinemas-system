import React from 'react';
import Modal from './Modal';
import { FiAlertTriangle } from 'react-icons/fi';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Confirm',
  confirmVariant = 'danger',
  isLoading = false,
}) => {
  const variantBtn = {
    danger: 'bg-[#E50914] hover:bg-[#F40612] text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]',
    primary: 'bg-slate-700 hover:bg-slate-600 text-white',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
          <FiAlertTriangle className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="rounded-xl border border-white/[0.1] bg-[#161B2B] px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/[0.08] hover:text-white transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={`rounded-xl px-5 py-2 text-xs font-bold transition-all duration-200 ${variantBtn[confirmVariant] || variantBtn.danger} disabled:opacity-50`}
        >
          {isLoading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
