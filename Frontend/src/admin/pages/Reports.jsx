import React, { useState, useEffect } from 'react';
import {
  FiBarChart2,
  FiCalendar,
  FiDownload,
  FiPrinter,
  FiTrendingUp,
  FiFilm,
  FiMapPin,
  FiDollarSign,
  FiPieChart,
  FiAward
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import SkeletonLoader from '../components/SkeletonLoader';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    byCinema: [],
    moviePerformance: [],
    cancellationRate: 7.2,
    totalBookings: 14,
    confirmedBookings: 12,
    cancelledBookings: 1,
    branchesComparison: []
  });

  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await apiService.getReports(startDate, endDate);
      if (res.data?.success) {
        setReportData(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Movie Title', 'Audience Rating', 'Total Screenings', 'Bookings Count', 'Revenue Generated ($)'];
    const rows = reportData.moviePerformance.map((m) => [
      `"${m.title}"`,
      m.rating || 'PG-13',
      m.total_screenings,
      m.total_bookings,
      m.total_revenue,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `galaxy_cinema_performance_report_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded Analytics Report (CSV)');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <SkeletonLoader type="chart" />;
  }

  const { byCinema, moviePerformance, cancellationRate, totalBookings, confirmedBookings, branchesComparison } = reportData;

  return (
    <div className="space-y-8 print:p-0 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#E50914] shadow-[0_0_8px_#E50914]"></span>
            <span className="text-[10px] font-extrabold text-[#E50914] uppercase tracking-widest">
              BUSINESS INTELLIGENCE & AUDIT
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Reports & Revenue Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Cinema box-office financial breakdown, top-performing movie rankings, and multi-branch trend comparison
          </p>
        </div>

        {/* Date Filter & Export */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#10131E]/95 px-3 py-2 text-slate-300">
            <FiCalendar className="h-3.5 w-3.5 text-slate-500" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent focus:outline-none text-white text-xs"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent focus:outline-none text-white text-xs"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <FiDownload className="h-3.5 w-3.5 text-[#E50914]" /> Export CSV
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#E50914] to-[#B91C1C] font-bold text-white shadow-[0_0_15px_rgba(229,9,20,0.35)] hover:brightness-110 transition"
          >
            <FiPrinter className="h-3.5 w-3.5" /> Print Report
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="rounded-3xl border border-white/[0.08] bg-[#10131E]/95 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#E50914]/10 rounded-full blur-2xl pointer-events-none -mr-6 -mt-6"></div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Box Office
          </span>
          <h3 className="mt-2 text-2xl sm:text-3xl font-black text-[#E50914]">
            ${Number(byCinema.reduce((acc, c) => acc + Number(c.total_revenue), 0)).toFixed(2)}
          </h3>
          <span className="text-[11px] text-slate-500 mt-1 block">Across all branch locations</span>
        </div>

        <div className="rounded-3xl border border-white/[0.08] bg-[#10131E]/95 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none -mr-6 -mt-6"></div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Confirmed Tickets
          </span>
          <h3 className="mt-2 text-2xl sm:text-3xl font-black text-white">
            {confirmedBookings}
          </h3>
          <span className="text-[11px] text-emerald-400 mt-1 block font-semibold">92.8% fulfillment rate</span>
        </div>

        <div className="rounded-3xl border border-white/[0.08] bg-[#10131E]/95 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none -mr-6 -mt-6"></div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Cancellation Rate
          </span>
          <h3 className="mt-2 text-2xl sm:text-3xl font-black text-amber-400">
            {cancellationRate}%
          </h3>
          <span className="text-[11px] text-slate-500 mt-1 block">Within healthy SaaS limits</span>
        </div>

        <div className="rounded-3xl border border-white/[0.08] bg-[#10131E]/95 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none -mr-6 -mt-6"></div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Cinemas
          </span>
          <h3 className="mt-2 text-2xl sm:text-3xl font-black text-purple-400">
            {byCinema.length}
          </h3>
          <span className="text-[11px] text-slate-500 mt-1 block">Multiplex theatres</span>
        </div>
      </div>

      {/* Chart: Comparative Cinema Revenue Growth (Multi-Line Chart) */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#10131E]/95 p-6 sm:p-7 shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08]">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Revenue Growth by Cinema Branch
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparative monthly box office revenue trends ($) across all venues
            </p>
          </div>
        </div>

        <div className="mt-6 h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={branchesComparison} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" opacity={0.06} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={{ stroke: '#ffffff', opacity: 0.1 }} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={{ stroke: '#ffffff', opacity: 0.1 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F121C',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                  color: '#FFFFFF',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '14px' }} />
              <Line type="monotone" dataKey="GalaxyCentral" name="Galaxy Cinema Poruwadanda" stroke="#E50914" strokeWidth={3} dot={{ r: 4, fill: '#E50914' }} />
              <Line type="monotone" dataKey="GalaxyIMAX" name="Galaxy Cinema Poruwadanda IMAX" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, fill: '#F59E0B' }} />
              <Line type="monotone" dataKey="GalaxyLuxe" name="Galaxy Cinema Poruwadanda Luxe" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Cinema Breakdown & Top Movies Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cinema Branch Box Office */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#10131E]/95 p-6 sm:p-7 shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <h3 className="text-base font-bold text-white pb-4 border-b border-white/[0.08]">
            Box Office by Cinema Location
          </h3>

          <div className="mt-4 divide-y divide-white/[0.06]">
            {byCinema.map((cin) => (
              <div key={cin.cinema_name} className="flex items-center justify-between py-4 group">
                <div>
                  <span className="font-bold text-white block text-sm group-hover:text-red-400 transition-colors">
                    {cin.cinema_name}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <FiMapPin className="h-3 w-3 text-[#E50914]" /> {cin.location}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-[#E50914] block text-base">
                    ${Number(cin.total_revenue).toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400">{cin.total_bookings} tickets issued</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top-Performing Movies Ranking Table */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#10131E]/95 p-6 sm:p-7 shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <h3 className="text-base font-bold text-white pb-4 border-b border-white/[0.08]">
            Top Grossing Movies
          </h3>

          <div className="mt-4 divide-y divide-white/[0.06]">
            {moviePerformance.map((mov, idx) => {
              const isTop3 = idx < 3;
              return (
                <div key={mov.movie_id} className="flex items-center gap-3.5 py-3.5 group">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-xl font-black text-xs shrink-0 ${
                    idx === 0
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                      : idx === 1
                      ? 'bg-slate-300/20 border border-slate-300/40 text-slate-300'
                      : idx === 2
                      ? 'bg-amber-700/20 border border-amber-700/40 text-amber-600'
                      : 'bg-white/[0.04] text-slate-400'
                  }`}>
                    #{idx + 1}
                  </span>
                  {mov.poster_url ? (
                    <img src={mov.poster_url} alt="" className="w-8 aspect-[2/3] rounded-lg object-cover object-center shadow border border-white/[0.1] shrink-0 bg-gray-800" />
                  ) : (
                    <div className="w-8 aspect-[2/3] rounded-lg bg-gray-800 border border-white/[0.1] flex items-center justify-center text-[9px] text-slate-500 shrink-0">
                      Film
                    </div>
                  )}
                  <div className="flex-1 overflow-hidden min-w-0">
                    <span className="font-bold text-white block truncate text-xs group-hover:text-red-400 transition-colors">
                      {mov.title}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
                      {mov.rating || 'PG-13'} • {mov.total_screenings || 0} screenings
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-white block text-sm">
                      ${Number(mov.total_revenue).toFixed(2)}
                    </span>
                    <span className="text-[11px] text-[#E50914] font-bold">
                      {mov.total_bookings || 0} tickets
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
