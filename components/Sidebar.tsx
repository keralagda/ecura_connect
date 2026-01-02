
import React from 'react';

export type AppView = 
  | 'USER_BROWSE' 
  | 'ADMIN_DASHBOARD' 
  | 'DR_DASHBOARD' 
  | 'DR_APPOINTMENTS' 
  | 'DR_SCHEDULES' 
  | 'DR_VISITS'
  | 'DR_STAFF';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  return (
    <aside className="w-20 md:w-64 bg-white border-r border-slate-200 flex flex-col items-center md:items-stretch h-screen sticky top-0 z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-12 h-12 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Recreating the logo shape roughly with SVG for consistency */}
            <rect x="35" y="10" width="30" height="80" rx="4" fill="#2e9e8f" />
            <rect x="10" y="35" width="80" height="30" rx="4" fill="#2e9e8f" />
            <path d="M50 40 C 70 40, 85 55, 85 75 C 85 95, 70 95, 50 85 C 30 95, 15 95, 15 75 C 15 55, 30 40, 50 40" fill="white" />
            <path d="M50 45 C 65 45, 75 55, 75 70 C 75 85, 65 85, 50 80 C 35 85, 25 85, 25 70 C 25 55, 35 45, 50 45" fill="#54aea5" />
          </svg>
        </div>
        <div className="hidden md:block leading-none">
          <span className="font-extrabold text-lg text-brand-navy tracking-tight block">Ecura</span>
          <span className="font-bold text-lg text-brand-navy tracking-tight block">Connect</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2 hidden md:block">Patient View</div>
        <button
          onClick={() => setView('USER_BROWSE')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            currentView === 'USER_BROWSE' 
              ? 'bg-ecura-50 text-ecura-700 font-bold' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
          <span className="hidden md:block">User Portal</span>
        </button>

        <div className="h-4"></div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2 hidden md:block">Administration</div>
        <button
          onClick={() => setView('ADMIN_DASHBOARD')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            currentView === 'ADMIN_DASHBOARD' 
              ? 'bg-ecura-50 text-ecura-700 font-bold' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          <span className="hidden md:block">Master Admin</span>
        </button>

        <div className="h-4"></div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2 hidden md:block">Doctor Role</div>
        <button
          onClick={() => setView('DR_DASHBOARD')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            currentView === 'DR_DASHBOARD' 
              ? 'bg-ecura-50 text-ecura-700 font-bold' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <span className="hidden md:block">Dashboard</span>
        </button>
        <button
          onClick={() => setView('DR_APPOINTMENTS')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            currentView === 'DR_APPOINTMENTS' 
              ? 'bg-ecura-50 text-ecura-700 font-bold' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <span className="hidden md:block">Appointments</span>
        </button>
        <button
          onClick={() => setView('DR_SCHEDULES')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            currentView === 'DR_SCHEDULES' 
              ? 'bg-ecura-50 text-ecura-700 font-bold' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="hidden md:block">Schedules</span>
        </button>
        <button
          onClick={() => setView('DR_VISITS')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            currentView === 'DR_VISITS' 
              ? 'bg-ecura-50 text-ecura-700 font-bold' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <span className="hidden md:block">Visit Records</span>
        </button>
        <button
          onClick={() => setView('DR_STAFF')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            currentView === 'DR_STAFF' 
              ? 'bg-ecura-50 text-ecura-700 font-bold' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          <span className="hidden md:block">Manage Staff</span>
        </button>
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-2 py-2">
          <img src="https://i.pravatar.cc/150?u=d1" className="w-10 h-10 rounded-full border-2 border-slate-200" alt="Avatar" />
          <div className="hidden md:block overflow-hidden">
            <p className="text-sm font-semibold truncate">Dr. Sarah Smith</p>
            <p className="text-xs text-slate-500 truncate">Cardiologist</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;