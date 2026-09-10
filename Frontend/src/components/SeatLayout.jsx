import React from 'react';
import Seat from './Seat';
import { Tv, Sparkles, Heart } from 'lucide-react';

export default function SeatLayout({ seats, occupiedSeatIds, selectedSeats, onSeatToggle }) {
  // Group seats by row letter
  const rows = {};
  seats.forEach(seat => {
    const rowChar = seat.seat_number.charAt(0);
    if (!rows[rowChar]) {
      rows[rowChar] = [];
    }
    rows[rowChar].push(seat);
  });

  return (
    <div className="flex flex-col items-center w-full py-4 select-none">
      
      {/* Curved Screen Indicator */}
      <div className="w-full max-w-xl mx-auto mb-10 text-center">
        <div className="relative mb-3">
          {/* Curved glowing neon arch */}
          <div className="h-2 w-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full shadow-[0_0_25px_rgba(99,102,241,0.8)]" />
          <div className="h-10 w-full bg-gradient-to-b from-indigo-500/15 to-transparent blur-md -mt-1 pointer-events-none" />
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-black uppercase tracking-[3px] text-slate-400">
          <Tv className="w-3.5 h-3.5 text-indigo-400" />
          Screen This Way
        </div>
      </div>

      {/* Seat Rows Container with overflow scroll for small devices */}
      <div className="w-full overflow-x-auto pb-6 scrollbar-thin">
        <div className="min-w-[500px] flex flex-col items-center gap-3.5 px-4">
          {Object.keys(rows).sort().map((rowName) => {
            const rowSeats = rows[rowName];
            const isVipRow = rowName === 'D' || rowName === 'E';
            const isCoupleRow = rowName === 'F';

            // Split into left and right aisles for cinema realism
            const midpoint = Math.ceil(rowSeats.length / 2);
            const leftSeats = rowSeats.slice(0, midpoint);
            const rightSeats = rowSeats.slice(midpoint);

            return (
              <div key={rowName} className="flex items-center gap-3">
                {/* Left Row Indicator */}
                <span className="w-5 text-center font-mono font-extrabold text-xs text-slate-400">
                  {rowName}
                </span>

                {/* Left Aisle Seats */}
                <div className="flex items-center gap-2">
                  {leftSeats.map((seat) => {
                    const isOccupied = occupiedSeatIds.includes(seat.seat_id);
                    const isSelected = selectedSeats.some(s => s.seat_id === seat.seat_id);
                    const status = isOccupied ? 'occupied' : isSelected ? 'selected' : 'available';

                    return (
                      <Seat
                        key={seat.seat_id}
                        seat={seat}
                        tier={seat.tier}
                        status={status}
                        onClick={() => onSeatToggle(seat)}
                      />
                    );
                  })}
                </div>

                {/* Center Walking Aisle Gap */}
                <div className="w-6 sm:w-10 text-center">
                  <span className="text-[10px] font-mono text-slate-400 opacity-40">│</span>
                </div>

                {/* Right Aisle Seats */}
                <div className="flex items-center gap-2">
                  {rightSeats.map((seat) => {
                    const isOccupied = occupiedSeatIds.includes(seat.seat_id);
                    const isSelected = selectedSeats.some(s => s.seat_id === seat.seat_id);
                    const status = isOccupied ? 'occupied' : isSelected ? 'selected' : 'available';

                    return (
                      <Seat
                        key={seat.seat_id}
                        seat={seat}
                        tier={seat.tier}
                        status={status}
                        onClick={() => onSeatToggle(seat)}
                      />
                    );
                  })}
                </div>

                {/* Right Row Indicator */}
                <span className="w-5 text-center font-mono font-extrabold text-xs text-slate-400">
                  {rowName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Legend Strip */}
      <div className="mt-8 pt-6 border-t border-white/[0.08] w-full flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-[#101426] border border-white/[0.15]" />
          <span>Available ($16)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-[#161B30] border border-amber-500/50 flex items-center justify-center">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
          </div>
          <span>VIP Recliner ($22)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 rounded-md bg-[#141829] border border-pink-500/50 flex items-center justify-center">
            <Heart className="w-2.5 h-2.5 text-pink-400" />
          </div>
          <span>Couple Loveseat ($38)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-indigo-600 border border-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
          <span className="font-bold text-white">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-rose-950/40 border border-rose-900/40 opacity-50" />
          <span className="text-slate-400">Booked</span>
        </div>
      </div>

    </div>
  );
}
