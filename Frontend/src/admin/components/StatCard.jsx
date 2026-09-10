import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const StatCard = ({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  color = 'red',
  subtitle = '',
}) => {
  const colorMap = {
    red: {
      badge: 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_20px_rgba(229,9,20,0.25)]',
      glow: 'group-hover:border-red-500/40',
      accent: 'from-red-600/20 to-transparent',
    },
    amber: {
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.25)]',
      glow: 'group-hover:border-amber-500/40',
      accent: 'from-amber-600/20 to-transparent',
    },
    emerald: {
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.25)]',
      glow: 'group-hover:border-emerald-500/40',
      accent: 'from-emerald-600/20 to-transparent',
    },
    blue: {
      badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.25)]',
      glow: 'group-hover:border-cyan-500/40',
      accent: 'from-cyan-600/20 to-transparent',
    },
    purple: {
      badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.25)]',
      glow: 'group-hover:border-purple-500/40',
      accent: 'from-purple-600/20 to-transparent',
    },
  };

  const scheme = colorMap[color] || colorMap.red;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-[#111420]/90 p-5 sm:p-6 border border-white/[0.08] backdrop-blur-xl shadow-card transition-all duration-300 hover:-translate-y-1 ${scheme.glow}`}
    >
      {/* Subtle top-right ambient gradient */}
      <div
        className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${scheme.accent} blur-2xl pointer-events-none transition-opacity duration-300 group-hover:opacity-100 opacity-60`}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1 pr-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <h3 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-white font-mono">
            {value}
          </h3>
          {subtitle && (
            <p className="mt-1 text-[11px] text-slate-400 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border ${scheme.badge} transition-transform duration-300 group-hover:scale-110`}
          >
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className="relative z-10 mt-4 flex items-center gap-2 pt-3 border-t border-white/[0.06] text-xs">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
              isPositive
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
            }`}
          >
            {isPositive ? <FiTrendingUp className="h-3 w-3" /> : <FiTrendingDown className="h-3 w-3" />}
            {change}
          </span>
          <span className="text-[11px] text-slate-400">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
