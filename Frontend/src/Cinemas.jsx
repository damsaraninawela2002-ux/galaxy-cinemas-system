import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Tv, 
  Sparkles, 
  ChevronRight, 
  Clock, 
  Compass,
  Award
} from 'lucide-react';
import { useBooking } from './context/BookingContext';
import { MOCK_CINEMAS } from './data/mockData';

export default function Cinemas() {
  const navigate = useNavigate();
  const { updateBooking } = useBooking();

  const handleSelectCinema = (cinema) => {
    updateBooking({ cinema });
    navigate(`/showtimes?cinema=${cinema.theater_id}`);
  };

  return (
    <div className="min-h-screen bg-[#080B14] text-slate-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header Hero */}
        <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] bg-gradient-to-r from-indigo-950/50 via-[#101426] to-slate-900/60 p-6 sm:p-12 shadow-2xl text-center">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              Multiplex Theaters
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-serif">
              Our Cinema Theaters
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              Discover Galaxy Cinemas state-of-the-art visual projection auditoriums, custom acoustic architecture, and ultra-luxurious recliner seating.
            </p>
          </div>
        </div>

        {/* Multiplex Locations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {MOCK_CINEMAS.map((cinema) => (
            <div
              key={cinema.theater_id}
              className="rounded-3xl border border-white/[0.08] bg-[#101426] overflow-hidden shadow-2xl hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Theater Photo */}
              <div className="h-60 overflow-hidden relative">
                <img
                  src={cinema.image}
                  alt={cinema.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101426] via-transparent to-transparent" />
                <span className="absolute bottom-4 left-5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/[0.1] text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  {cinema.location}
                </span>
              </div>

              {/* Theater Details */}
              <div className="p-6 sm:p-7 space-y-5 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="text-xl font-black text-white font-serif group-hover:text-indigo-400 transition-colors">
                    {cinema.name}
                  </h3>

                  <div className="space-y-2 text-xs text-slate-300">
                    <p className="flex items-start gap-2 leading-relaxed text-slate-400">
                      <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                      {cinema.address}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {cinema.contact_number}
                    </p>
                    <p className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      Open daily: 10:00 AM – Midnight
                    </p>
                  </div>

                  {/* Amenities Pills */}
                  <div className="pt-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-2">
                      Available Features
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cinema.amenities.map(a => (
                        <span
                          key={a}
                          className="px-2.5 py-1 rounded-lg bg-[#090C16] border border-white/[0.06] text-[11px] font-medium text-slate-300"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="pt-5 border-t border-white/[0.06]">
                  <button
                    onClick={() => handleSelectCinema(cinema)}
                    className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
                  >
                    View Showtimes & Book
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Experience Highlights Strip */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#101426] p-8 sm:p-10 space-y-6">
          <div className="max-w-xl">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
              The Galaxy Experience
            </span>
            <h2 className="text-2xl font-black text-white font-serif tracking-tight mt-1">
              Engineered for Pure Cinematic Wonder
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-[#090C16] border border-white/[0.06] space-y-2">
              <Tv className="w-6 h-6 text-indigo-400" />
              <h4 className="font-bold text-sm text-white">Custom Laser Projection</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                4K high dynamic range optics deliver up to 2x the brightness and razor-sharp clarity across screen sizes up to 80 feet.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#090C16] border border-white/[0.06] space-y-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <h4 className="font-bold text-sm text-white">Dolby Atmos Spatial Audio</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Up to 64 discreet speaker feeds immerse viewers in a multi-dimensional hemispheric audio sphere where sounds move precisely.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#090C16] border border-white/[0.06] space-y-2">
              <Award className="w-6 h-6 text-pink-400" />
              <h4 className="font-bold text-sm text-white">VIP Heated Leather Recliners</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Motorized headrests, lumbar support, heated seat zones, and personal side tables bring luxury living room comfort to the cinema.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
