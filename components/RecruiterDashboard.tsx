import React, { useState, useMemo } from 'react';
import { User, Role, Branch } from '../types';

interface RecruiterDashboardProps {
  user: User;
  users: User[];
}

const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({ user, users }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return users.filter(u => {
      const matchName = u.lastName.toLowerCase().includes(term);
      const matchState = u.state ? u.state.toLowerCase().includes(term) : false;
      const isSearchMatch = matchName || matchState;
      
      return isSearchMatch && 
             u.role !== Role.ADMINISTRATOR && 
             u.role !== Role.RECRUITER;
    }).sort((a, b) => a.lastName.localeCompare(b.lastName));
  }, [users, searchTerm]);

  const categories = [
    { title: 'Pre-med Students', role: Role.PRE_MED },
    { title: 'Medical Students', role: Role.MEDICAL_STUDENT },
    { title: 'Residents', role: Role.RESIDENT },
    { title: 'Faculty Members', role: Role.FACULTY }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-slate-900 military-font mb-4">Connect with students and doctors</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Official recruitment interface for Identifying HPSP candidates and coordinating with GME subject matter experts.
        </p>
      </div>

      <div className="mb-10 max-w-xl mx-auto">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search by last name or state..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-blue-600 outline-none text-lg shadow-sm"
          />
          <svg className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="space-y-16">
        {categories.map((cat) => {
          const catUsers = filteredUsers.filter(u => u.role === cat.role);
          if (catUsers.length === 0 && searchTerm) return null;

          return (
            <section key={cat.role} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-slate-900 border-b-2 border-blue-600 pb-2 mb-6 flex items-center justify-between">
                <span>{cat.title}</span>
                <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                  {catUsers.length} {catUsers.length === 1 ? 'Result' : 'Results'}
                </span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {catUsers.length === 0 ? (
                  <p className="col-span-full text-slate-400 italic py-4">No users found in this category.</p>
                ) : (
                  catUsers.map(u => (
                    <div key={u.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                      <div className="flex items-center gap-4 mb-4">
                        {u.profileImageUrl ? (
                          <img src={u.profileImageUrl} alt={u.lastName} className="w-12 h-12 rounded-full object-cover border-2 border-slate-100" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                            {u.firstName[0]}{u.lastName[0]}
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <h3 className="font-bold text-slate-900 truncate">{u.lastName}, {u.firstName}</h3>
                          {u.role !== Role.PRE_MED && (
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{u.branch}</p>
                          )}
                          {u.role === Role.PRE_MED && u.branch !== Branch.UNDECIDED && (
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded inline-block">Interested in {u.branch}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-3 pt-4 border-t border-slate-50">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                          <a href={`mailto:${u.email}`} className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors break-all">
                            {u.email}
                          </a>
                        </div>

                        {u.role === Role.MEDICAL_STUDENT && (
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medical School</p>
                            <p className="text-sm text-slate-600 font-medium italic">{u.medicalSchool || 'Not specified'}</p>
                          </div>
                        )}

                        {(u.role === Role.RESIDENT || u.role === Role.FACULTY) && (
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Specialty</p>
                            <p className="text-sm text-slate-600 font-medium">{u.specialty || 'General Practice'}</p>
                          </div>
                        )}

                        {u.role === Role.PRE_MED && (
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Location</p>
                            <p className="text-sm text-slate-600 font-medium">
                              {u.city && u.state ? `${u.city}, ${u.state}` : (u.city || u.state || 'Location not provided')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default RecruiterDashboard;