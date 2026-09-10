import React from 'react';

const Badge = ({ variant = 'default', children, size = 'sm', showDot = false }) => {
  const styles = {
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]',
    danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.15)]',
    info: 'bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.15)]',
    brand: 'bg-red-500/10 text-red-400 border border-red-500/30 shadow-[0_0_12px_rgba(229,9,20,0.15)]',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.15)]',
    default: 'bg-slate-800/80 text-slate-300 border border-slate-700/60'
  };

  const dotColors = {
    success: 'bg-emerald-400 animate-pulse',
    warning: 'bg-amber-400 animate-pulse',
    danger: 'bg-rose-400',
    info: 'bg-blue-400',
    brand: 'bg-red-400 animate-pulse',
    purple: 'bg-purple-400',
    default: 'bg-slate-400'
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs font-semibold',
    md: 'px-3 py-1.5 text-xs font-bold',
  };

  const currentVariant = styles[variant] || styles.default;
  const currentDot = dotColors[variant] || dotColors.default;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium tracking-wide backdrop-blur-sm ${currentVariant} ${sizes[size]}`}>
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${currentDot}`} />}
      {children}
    </span>
  );
};

export default Badge;
