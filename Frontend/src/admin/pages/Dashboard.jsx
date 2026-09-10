import React, { useState, useEffect } from 'react';
import {
  FiFilm,
  FiUsers,
  FiBookOpen,
  FiDollarSign,
  FiClock,
  FiEye,
  FiCalendar,
  FiMapPin,
  FiRefreshCw,
  FiTrendingUp,
  FiCheckCircle,
  FiActivity
} from 'react-icons/fi';
import {
  AreaChart,
  Area,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import SkeletonLoader from '../components/SkeletonLoader';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

const GENRE_COLORS = ['#E50914', '#F59E0B', '#10B981', '#06B6D4', '#A855F7', '#EC4899'];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: {
      totalMovies: 0,
      movieTrend: '+4.2%',
      totalUsers: 4,
      userTrend: '+8.1%',
      totalBookings: 14,
      bookingTrend: '+12.5%',
      totalRevenue: 535.5,
      revenueTrend: '+18.2%',
      activeShowtimes: 7,
      showtimeTrend: '+6.5%'
    },
    monthly: [
      { month: 'May', revenue: 1200, bookings: 45 },
      { month: 'Jun', revenue: 1850, bookings: 62 },
      { month: 'Jul', revenue: 2400, bookings: 88 },
      { month: 'Aug', revenue: 3100, bookings: 110 },
      { month: 'Sep', revenue: 2800, bookings: 95 },
      { month: 'Oct', revenue: 3650, bookings: 130 }
    ],
    genreDistribution: [
      { name: 'Action', value: 35 },
      { name: 'Sci-Fi', value: 30 },
      { name: 'Adventure', value: 20 },
      { name: 'Animation', value: 15 }
    ],
    recentBookings: []
  });

  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await apiService.getDashboard();
      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      toast.error('Using fallback dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <Badge variant="success" showDot>Confirmed</Badge>;
      case 'pending':
        return <Badge variant="warning" showDot>Pending</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <SkeletonLoader type="card" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SkeletonLoader type="chart" />
          </div>
          <div>
            <SkeletonLoader type="chart" />
          </div>
        </div>
        <SkeletonLoader rows={6} cols={5} />
      </div>
    );
  }

  const { stats, monthly, genreDistribution, recentBookings } = data;

  return (
    <div className="space-y-8">
      {/* 1. KPI Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
        <StatCard
          title="Total Movies"
          value={stats.totalMovies}
          change={stats.movieTrend}
          subtitle="Catalog in rotation"
          icon={FiFilm}
          color="red"
        />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          change={stats.bookingTrend}
          subtitle="Reserved tickets"
          icon={FiBookOpen}
          color="amber"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          change={stats.userTrend}
          subtitle="Registered patrons"
          icon={FiUsers}
          color="blue"
        />
        <StatCard
          title="Total Revenue"
          value={`$${Number(stats.totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          change={stats.revenueTrend}
          subtitle="Settled box office"
          icon={FiDollarSign}
          color="emerald"
        />
        <StatCard
          title="Active Shows"
          value={stats.activeShowtimes}
          change={stats.showtimeTrend}
          subtitle="Currently scheduled"
          icon={FiClock}
          color="purple"
        />
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue & Bookings Curve */}
        <div className="lg:col-span-2 rounded-3xl border border-white/[0.08] bg-[#111420]/95 p-6 sm:p-7 shadow-card backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/[0.06]">
            <div>
              <span className="text-[10px] font-extrabold tracking-widest text-[#E50914] uppercase">
                Box Office Metrics
              </span>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">
                Revenue & Bookings Trend
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full bg-[#E50914] shadow-[0_0_8px_#E50914]" /> Gross Revenue ($)
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B] shadow-[0_0_8px_#F59E0B]" /> Tickets
              </span>
            </div>
          </div>

          <div className="mt-6 h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="cinemaRedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E50914" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#E50914" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} stroke="rgba(255,255,255,0.1)" />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} stroke="rgba(255,255,255,0.1)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111422',
                    borderColor: 'rgba(255,255,255,0.12)',
                    borderRadius: '16px',
                    color: '#F8FAFC',
                    fontSize: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
                  }}
                  itemStyle={{ fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#E50914"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#cinemaRedGradient)"
                  dot={{ r: 3, fill: '#E50914', strokeWidth: 2, stroke: '#FFFFFF' }}
                />
                <Bar dataKey="bookings" fill="#F59E0B" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Genre & Popularity Donut */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#111420]/95 p-6 sm:p-7 shadow-card backdrop-blur-xl flex flex-col justify-between">
          <div className="pb-4 border-b border-white/[0.06]">
            <span className="text-[10px] font-extrabold tracking-widest text-amber-400 uppercase">
              Audience Taste
            </span>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">
              Popular Genres
            </h3>
          </div>

          <div className="my-auto h-56 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genreDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genreDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={GENRE_COLORS[index % GENRE_COLORS.length]}
                      stroke="rgba(0,0,0,0.5)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111422',
                    borderColor: 'rgba(255,255,255,0.12)',
                    borderRadius: '16px',
                    color: '#F8FAFC',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-white font-mono">100%</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Demand</span>
            </div>
          </div>

          {/* Genre Legends */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/[0.06]">
            {genreDistribution.map((g, idx) => (
              <div key={g.name} className="flex items-center gap-2 p-1 rounded-lg bg-white/[0.02]">
                <span
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: GENRE_COLORS[idx % GENRE_COLORS.length] }}
                />
                <span className="truncate text-slate-300 font-semibold">{g.name}</span>
                <span className="ml-auto font-black text-white font-mono">{g.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Recent Bookings Table */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#111420]/95 shadow-card backdrop-blur-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-6 border-b border-white/[0.06] bg-[#0E111B]/40">
          <div>
            <span className="text-[10px] font-extrabold tracking-widest text-[#E50914] uppercase">
              Live Ticketing
            </span>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">
              Recent Bookings
            </h3>
          </div>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/[0.08] hover:text-white transition self-start sm:self-auto"
          >
            <FiRefreshCw className="h-3.5 w-3.5 text-[#E50914]" /> Refresh
          </button>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-[#0A0C14]/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/[0.06]">
              <tr>
                <th className="px-6 py-4">Booking ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Movie</th>
                <th className="px-6 py-4">Showtime</th>
                <th className="px-6 py-4">Seats</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {recentBookings.map((b) => (
                <tr
                  key={b.booking_id}
                  onClick={() => setSelectedBooking(b)}
                  className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 font-mono font-bold text-[#E50914]">
                    #{b.booking_id}
                  </td>
                  <td className="px-6 py-4 font-bold text-white">
                    <div>{b.customer_name}</div>
                    <div className="text-[10px] font-normal text-slate-400">{b.customer_email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {b.poster_url && (
                        <img
                          src={b.poster_url}
                          alt=""
                          className="w-7 aspect-[2/3] rounded-lg object-cover object-center shadow-sm border border-white/[0.1] bg-gray-800 flex-shrink-0"
                        />
                      )}
                      <span className="font-bold text-slate-200 truncate max-w-[160px]">
                        {b.movie_title}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    <div className="font-semibold">{b.show_date}</div>
                    <div className="text-[11px] text-slate-400">{b.start_time?.substring(0, 5)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-lg bg-white/[0.05] border border-white/[0.08] px-2 py-1 font-mono font-bold text-slate-300">
                      {b.seat_numbers || 'Reserved'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black font-mono text-white text-sm">
                    ${Number(b.total_amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(b.booking_status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBooking(b);
                      }}
                      className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-2 text-slate-400 hover:bg-white/[0.08] hover:text-white transition"
                      title="Inspect Details"
                    >
                      <FiEye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <Modal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          title={`Booking Details #${selectedBooking.booking_id}`}
          size="md"
        >
          <div className="space-y-6 text-xs">
            <div className="flex items-center gap-4 rounded-2xl bg-white/[0.03] p-4 border border-white/[0.08]">
              {selectedBooking.poster_url && (
                <img
                  src={selectedBooking.poster_url}
                  alt=""
                  className="w-16 aspect-[2/3] rounded-xl object-cover object-center shadow-lg border border-white/[0.1] bg-gray-800 flex-shrink-0"
                />
              )}
              <div className="flex-1 overflow-hidden">
                <h4 className="text-base font-black text-white truncate">
                  {selectedBooking.movie_title}
                </h4>
                <p className="mt-1 flex items-center gap-1.5 text-slate-400">
                  <FiMapPin className="h-3.5 w-3.5 text-[#E50914]" />
                  {selectedBooking.cinema_name} • {selectedBooking.screen_name}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-slate-400">
                  <FiCalendar className="h-3.5 w-3.5" />
                  {selectedBooking.show_date} at {selectedBooking.start_time?.substring(0, 5)}
                </p>
                <div className="mt-2.5">{getStatusBadge(selectedBooking.booking_status)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-1">
                <span className="text-slate-400 text-[11px]">Customer Details</span>
                <p className="font-bold text-white text-sm">
                  {selectedBooking.customer_name}
                </p>
                <p className="text-slate-400">{selectedBooking.customer_email}</p>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-1">
                <span className="text-slate-400 text-[11px]">Payment Total</span>
                <p className="text-xl font-black text-[#E50914] font-mono">
                  ${Number(selectedBooking.total_amount).toFixed(2)}
                </p>
                <p className="text-slate-400">Card Transaction</p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="rounded-xl bg-[#E50914] px-5 py-2 font-bold text-white shadow-[0_0_15px_rgba(229,9,20,0.4)] hover:bg-[#F40612] transition"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;
