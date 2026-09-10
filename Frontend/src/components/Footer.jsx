import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Film,
  Mail,
  MapPin,
  Phone,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Send,
  Heart
} from 'lucide-react';
import toast from 'react-hot-toast';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    toast.success('Thank you for subscribing to Galaxy Cinema updates!');
    setEmail('');
  };

  return (
    <footer className="bg-[#070913] text-slate-400 border-t border-white/[0.08] relative overflow-hidden font-sans">
      {/* Subtle background ambient light */}
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/[0.08]">
          {/* Col 1 & 2: Brand & Newsletter */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/home" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)] border border-indigo-400/30">
                <Film className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="text-xl font-black tracking-widest text-white leading-none block">
                  GALAXY <span className="text-amber-400">CINEMA</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase">
                  THE NEXT GENERATION OF THEATRE
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Immerse yourself in cinematic brilliance with laser projection, spatial audio, and gourmet in-seat dining. Your premier entertainment destination.
            </p>

            {/* Newsletter Subscription */}
            <div className="pt-2">
              <p className="text-xs font-bold text-white mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400" /> Get Weekly Movie Premieres & Special Discounts
              </p>
              <form onSubmit={handleSubscribe} className="flex max-w-md items-center gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email..."
                  className="flex-1 bg-[#121626] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
                >
                  <span>Join</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Col 3: Quick Navigation */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/home" className="hover:text-amber-400 transition">
                  Now Showing
                </Link>
              </li>
              <li>
                <Link to="/movies" className="hover:text-amber-400 transition">
                  Coming Soon
                </Link>
              </li>
              <li>
                <Link to="/showtimes" className="hover:text-amber-400 transition">
                  Showtimes & Tickets
                </Link>
              </li>
              <li>
                <Link to="/cinemas" className="hover:text-amber-400 transition">
                  Multiplex Locations
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-amber-400 transition">
                  My Reservations
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Experiences */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white mb-4">
              Experiences
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>IMAX with Laser</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Dolby Atmos Cinema</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                <span>Galaxy VIP Lounge</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>4DX Motion Dynamics</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                <span>Private Theatre Bookings</span>
              </li>
            </ul>
          </div>

          {/* Col 5: Multiplex Locations & Support */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white mb-4">
              Contact & Theatres
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>49C, Rathnapura Road, Poruwadanda</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>+1 (555) 382-4400</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>support@galaxycinema.com</span>
              </div>
              <div className="pt-2">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300"
                >
                  <span>Branch Map & FAQs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Badges */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Galaxy Cinema Entertainment Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> 256-Bit SSL Encrypted Checkout
            </span>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;