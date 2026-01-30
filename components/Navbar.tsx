
import React, { useState } from 'react';
import { User, Branch, Role } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onHome: () => void;
  onMarkNotificationsRead: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onHome, onMarkNotificationsRead }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = user.notifications.filter(n => !n.read).length;

  const getBranchColor = () => {
    switch (user.branch) {
      case Branch.ARMY: return 'border-b-4 border-[#4B5320]';
      case Branch.NAVY: return 'border-b-4 border-[#000080]';
      case Branch.AIR_FORCE: return 'border-b-4 border-[#00308F]';
      default: return 'border-b-4 border-slate-900';
    }
  };

  return (
    <nav className={`bg-white shadow-md px-6 py-4 flex items-center justify-between sticky top-0 z-50 ${getBranchColor()}`}>
      <div className="flex items-center gap-3 cursor-pointer" onClick={onHome}>
        <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xl">M</span>
        </div>
        <div>
          <h2 className="military-font font-bold text-xl leading-tight text-slate-900">MMM</h2>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{user.branch} • {user.role}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4 md:gap-6">
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications && unreadCount > 0) onMarkNotificationsRead();
            }}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors relative"
          >
            <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500">Notifications</h3>
                <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {user.notifications.length === 0 ? (
                  <p className="p-6 text-center text-slate-400 text-sm italic">No notifications yet.</p>
                ) : (
                  user.notifications.map((n) => (
                    <div key={n.id} className={`p-4 border-b hover:bg-slate-50 transition-colors ${!n.read ? 'bg-blue-50/30' : ''}`}>
                      <div className="flex gap-3">
                        <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                          n.type === 'success' ? 'bg-green-500' : 
                          n.type === 'error' ? 'bg-red-500' : 
                          n.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                        }`}></div>
                        <div>
                          <p className="text-sm text-slate-800 leading-tight">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <span className="hidden md:block text-sm font-bold text-slate-700">{user.firstName} {user.lastName}</span>
        
        <button 
          onClick={onLogout}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md"
        >
          LOGOUT
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
