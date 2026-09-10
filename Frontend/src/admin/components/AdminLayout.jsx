import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Toaster } from 'react-hot-toast';

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#08090E] text-slate-100 flex flex-col relative overflow-x-hidden">
      {/* Ambient Cinema Lighting Glows */}
      <div className="fixed top-0 left-1/3 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-red-600/[0.07] blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-10 translate-y-1/3 h-[400px] w-[400px] rounded-full bg-amber-500/[0.04] blur-[120px] pointer-events-none" />

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          className: 'bg-[#111422] text-white border border-white/[0.1] text-xs font-bold rounded-2xl shadow-2xl backdrop-blur-xl',
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#111422',
            },
          },
          error: {
            iconTheme: {
              primary: '#E50914',
              secondary: '#111422',
            },
          },
        }}
      />

      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 relative z-10 ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Navbar onMobileMenuClick={() => setIsMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-7 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
