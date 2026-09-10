import React from 'react';

export default function Seat({ seat, status, tier, onClick }) {
  const isOccupied = status === 'occupied';
  const isSelected = status === 'selected';
  const isCouple = tier === 'couple';
  const isVIP = tier === 'vip';

  // Seat visual styling based on status and tier
  let seatClasses = "relative transition-all duration-200 font-bold flex items-center justify-center select-none ";
  
  if (isCouple) {
    seatClasses += "w-16 h-9 rounded-xl text-xs ";
  } else {
    seatClasses += "w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-[11px] ";
  }

  if (isOccupied) {
    seatClasses += "bg-rose-950/40 text-rose-800 border border-rose-900/30 cursor-not-allowed opacity-40";
  } else if (isSelected) {
    seatClasses += "bg-indigo-600 text-white border-2 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.6)] scale-105 cursor-pointer z-10 animate-scale-in";
  } else if (isVIP) {
    seatClasses += "bg-[#161B30] text-amber-300 border border-amber-500/40 hover:border-amber-400 hover:bg-amber-500/10 cursor-pointer shadow-sm hover:scale-105";
  } else if (isCouple) {
    seatClasses += "bg-[#141829] text-pink-300 border border-pink-500/40 hover:border-pink-400 hover:bg-pink-500/10 cursor-pointer shadow-sm hover:scale-105";
  } else {
    // Standard available
    seatClasses += "bg-[#101426] text-slate-300 border border-white/[0.12] hover:border-indigo-400 hover:text-white hover:bg-indigo-950/30 cursor-pointer hover:scale-105";
  }

  return (
    <button
      type="button"
      disabled={isOccupied}
      onClick={onClick}
      className={seatClasses}
      title={`${seat.seat_number} - ${tier.toUpperCase()} ($${seat.price.toFixed(2)}) [${status}]`}
    >
      {seat.seat_number}
      {isCouple && (
        <span className="absolute -top-1.5 right-1 px-1 py-0.2 bg-pink-500 text-[8px] font-black text-white rounded-full leading-tight">
          PAIR
        </span>
      )}
    </button>
  );
}
