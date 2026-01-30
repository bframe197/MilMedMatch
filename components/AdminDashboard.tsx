import React, { useState } from 'react';
import { User, ResidencyProgram, Branch, ADTRequest, Role, MatchDeadline } from '../types';
import { SPECIALTIES, createContact } from '../constants';
import { generateProgramCoverImage, generateAmericanFlagImage } from '../services/geminiService';

interface AdminDashboardProps {
  user: User;
  users: User[];
  adtRequests: ADTRequest[];
  programs: ResidencyProgram[];
  defaultImage: string;
  onAddProgram: (program: ResidencyProgram) => void;
  onDeleteProgram: (id: string) => void;
  onUpdateDefaultImage: (newImage: string) => void;
  onReviewAdt: (requestId: string, status: 'approved' | 'denied', reason?: string) => void;
  matchDeadlines: MatchDeadline[];
  onUpdateDeadlines: (deadlines: MatchDeadline[]) => void;
}

type AdminTab = 'programs' | 'users' | 'adt' | 'deadlines';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  user, users, adtRequests, programs, defaultImage, onAddProgram, onDeleteProgram, onUpdateDefaultImage, onReviewAdt, matchDeadlines, onUpdateDeadlines 
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('programs');
  const [isAdding, setIsAdding] = useState(false);
  const [isGeneratingFlag, setIsGeneratingFlag] = useState(false);
  
  // User search state
  const [userSearch, setUserSearch] = useState('');
  const [adtSearch, setAdtSearch] = useState('');
  
  // ADT review state
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [denialReason, setDenialReason] = useState('');

  // New Program Form State
  const [newProgram, setNewProgram] = useState<Partial<ResidencyProgram>>({
    name: '',
    branch: Branch.ARMY,
    specialty: SPECIALTIES[0],
    location: '',
    residentsPerClass: 10,
    strengths: ['Academic Excellence', 'Clinical Volume', 'Military Integration'],
    imageUrl: ''
  });

  const filteredPrograms = programs;

  const filteredUsers = users.filter(u => 
    u.lastName.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredAdtRequests = adtRequests.filter(r => 
    r.fullName.toLowerCase().includes(adtSearch.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgram.name || !newProgram.location) {
      alert("Please fill out all required fields.");
      return;
    }

    const program: ResidencyProgram = {
      id: `${newProgram.name?.toLowerCase().replace(/\s+/g, '-')}-${newProgram.specialty?.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substr(2, 5)}`,
      name: newProgram.name!,
      branch: newProgram.branch as Branch,
      specialty: newProgram.specialty || SPECIALTIES[0],
      location: newProgram.location!,
      programDirector: createContact(newProgram.specialty || 'GME', newProgram.name!),
      secretary: createContact('Admin', newProgram.name!),
      residentsPerClass: newProgram.residentsPerClass || 10,
      strengths: newProgram.strengths || [],
      videos: [],
      residents: [],
      imageUrl: newProgram.imageUrl || ''
    };
    onAddProgram(program);
    setIsAdding(false);
    // Reset form
    setNewProgram({
      name: '',
      branch: Branch.ARMY,
      specialty: SPECIALTIES[0],
      location: '',
      residentsPerClass: 10,
      strengths: ['Academic Excellence', 'Clinical Volume', 'Military Integration'],
      imageUrl: ''
    });
  };

  const handleGenerateFlag = async () => {
    setIsGeneratingFlag(true);
    const flagImg = await generateAmericanFlagImage();
    if (flagImg) onUpdateDefaultImage(flagImg);
    setIsGeneratingFlag(false);
  };

  const handleReviewAction = (status: 'approved' | 'denied') => {
    if (reviewingId) {
      onReviewAdt(reviewingId, status, status === 'denied' ? denialReason : undefined);
      setReviewingId(null);
      setDenialReason('');
    }
  };

  const handleDeadlineChange = (id: string, field: keyof MatchDeadline, value: string) => {
    const updated = matchDeadlines.map(d => d.id === id ? { ...d, [field]: value } : d);
    onUpdateDeadlines(updated);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <span className="w-3 h-10 bg-purple-600 rounded-full"></span>
            GME Catalog Administration
          </h1>
          <p className="text-slate-500 mt-1 italic">Command and control over users, programs, and training requests.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {/* ALPHABETICAL ORDER: ADT Requests, Deadlines, Programs, Users */}
          <button onClick={() => setActiveAdminTab('adt')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${activeAdminTab === 'adt' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500'}`}>ADT Requests</button>
          <button onClick={() => setActiveAdminTab('deadlines')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${activeAdminTab === 'deadlines' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500'}`}>Deadlines</button>
          <button onClick={() => setActiveAdminTab('programs')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${activeAdminTab === 'programs' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500'}`}>Programs</button>
          <button onClick={() => setActiveAdminTab('users')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${activeAdminTab === 'users' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500'}`}>Users</button>
        </div>
      </div>

      {activeAdminTab === 'deadlines' && (
        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
          <h2 className="text-xl font-bold military-font text-slate-700 mb-6">Match Cycle Timeline Management</h2>
          <div className="grid grid-cols-1 gap-6">
            {matchDeadlines.map((deadline) => (
              <div key={deadline.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Event Name</label>
                  <input 
                    type="text" 
                    value={deadline.event}
                    onChange={(e) => handleDeadlineChange(deadline.id, 'event', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg font-bold outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Date</label>
                  <input 
                    type="date" 
                    value={deadline.date}
                    onChange={(e) => handleDeadlineChange(deadline.id, 'date', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Brief Description</label>
                  <textarea 
                    value={deadline.description}
                    onChange={(e) => handleDeadlineChange(deadline.id, 'description', e.target.value)}
                    rows={1}
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 text-sm italic"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeAdminTab === 'programs' && (
        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold military-font text-slate-700">Program Directory</h2>
            <div className="flex gap-2">
              <button onClick={handleGenerateFlag} className="text-xs font-bold bg-slate-100 px-4 py-2 rounded-lg hover:bg-slate-200">
                {isGeneratingFlag ? 'Generating...' : 'Default Flag'}
              </button>
              <button onClick={() => setIsAdding(true)} className="bg-purple-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-purple-700 shadow-lg">Add New Program</button>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-md border overflow-hidden">
             <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Program</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Service</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Location</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPrograms.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={p.imageUrl || defaultImage} className="w-8 h-8 rounded object-cover" />
                        <span className="font-bold text-slate-900">{p.name} - {p.specialty}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold">{p.branch}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {p.location}
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => onDeleteProgram(p.id)} className="text-red-500 text-xs font-bold uppercase hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeAdminTab === 'users' && (
        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <h2 className="text-xl font-bold military-font text-slate-700">User Management</h2>
            <div className="relative w-full md:w-80">
              <input 
                type="text" 
                placeholder="Search by last name..." 
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
              />
              <svg className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-md border overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Service</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Location / Education</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs">
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.lastName}, {u.firstName}</p>
                          <p className="text-[10px] text-slate-400">@{u.username}</p>
                          <p className="text-[10px] font-medium text-purple-600">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        u.role === Role.ADMINISTRATOR ? 'bg-purple-100 text-purple-700' :
                        u.role === Role.MEDICAL_STUDENT ? 'bg-blue-100 text-blue-700' : 
                        u.role === Role.PRE_MED ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{u.branch}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm italic text-slate-500">
                        {u.medicalSchool || u.undergradSchool || u.residencyProgram || 'Not Set'}
                      </p>
                      {u.role === Role.PRE_MED && (u.city || u.state) && (
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          {u.city}{u.city && u.state ? ', ' : ''}{u.state}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeAdminTab === 'adt' && (
        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <h2 className="text-xl font-bold military-font text-slate-700">Active Duty Training Requests</h2>
            <div className="relative w-full md:w-80">
              <input 
                type="text" 
                placeholder="Search by last name..." 
                value={adtSearch}
                onChange={(e) => setAdtSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
              />
              <svg className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {filteredAdtRequests.length === 0 ? (
              <div className="p-12 text-center bg-white border border-dashed rounded-2xl">
                <p className="text-slate-400 italic">No ADT requests matching your search were found.</p>
              </div>
            ) : (
              filteredAdtRequests.map(r => (
                <div key={r.id} className="bg-white border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{r.fullName}</p>
                      <p className="text-xs text-slate-500">Site: {r.facilityName} • Dates: {r.startDate} to {r.endDate}</p>
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded mt-2 inline-block ${
                        r.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                        r.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setReviewingId(r.id)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold">VIEW DETAILS</button>
                    {r.status === 'pending' && (
                      <>
                        <button onClick={() => onReviewAdt(r.id, 'approved')} className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold">APPROVE</button>
                        <button onClick={() => setReviewingId(r.id)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold">DENY</button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ADT Detail Modal */}
      {reviewingId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <h2 className="military-font text-xl">Review ADT Application</h2>
              <button onClick={() => { setReviewingId(null); setDenialReason(''); }} className="text-2xl">&times;</button>
            </div>
            {adtRequests.filter(r => r.id === reviewingId).map(req => (
              <div key={req.id} className="p-8">
                <div className="grid grid-cols-2 gap-8 border-b pb-8 mb-8">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Personnel Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-bold">Name:</span> {req.fullName}</p>
                      <p><span className="font-bold">SSN (Last 4):</span> {req.ssnLast4}</p>
                      <p><span className="font-bold">Email:</span> {req.email}</p>
                      <p><span className="font-bold">Phone:</span> {req.phone} (Alt: {req.altPhone})</p>
                      <p><span className="font-bold">Marital Status:</span> {req.married}</p>
                      <p><span className="font-bold">Dependents:</span> {req.dependents} ({req.dependentNames})</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Training & Logistics</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-bold">Facility:</span> {req.facilityName}</p>
                      <p><span className="font-bold">Dates:</span> {req.startDate} to {req.endDate}</p>
                      <p><span className="font-bold">Travel Mode:</span> {req.travelMode}</p>
                      <p><span className="font-bold">Rental Car:</span> {req.rentalCar}</p>
                      <p><span className="font-bold">Advance Payment:</span> {req.advancePayment}</p>
                      <p><span className="font-bold">Home of Record:</span> {req.homeOfRecord}</p>
                    </div>
                  </div>
                </div>

                {req.status === 'pending' ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Denial Reason (Required if denying)</label>
                      <textarea 
                        value={denialReason}
                        onChange={(e) => setDenialReason(e.target.value)}
                        placeholder="State why the request is being denied..."
                        className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-red-500 h-24"
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button onClick={() => handleReviewAction('approved')} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 shadow-md">APPROVE REQUEST</button>
                      <button 
                        onClick={() => {
                          if (!denialReason) alert('Please provide a reason for denial.');
                          else handleReviewAction('denied');
                        }} 
                        className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 shadow-md"
                      >
                        DENY REQUEST
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`p-6 rounded-2xl text-center ${req.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    <p className="font-bold text-xl mb-1 uppercase">{req.status}</p>
                    {req.denialReason && <p className="text-sm italic font-medium">Reason: {req.denialReason}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Program Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <h2 className="military-font text-xl">Initialize New Program</h2>
              <button onClick={() => setIsAdding(false)} className="text-2xl text-slate-400 hover:text-white">&times;</button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-8 space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Military Facility Name</label>
                  <input 
                    type="text" 
                    value={newProgram.name}
                    onChange={(e) => setNewProgram({...newProgram, name: e.target.value})}
                    placeholder="e.g. Walter Reed NMMC"
                    className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Service Branch</label>
                    <select 
                      value={newProgram.branch}
                      onChange={(e) => setNewProgram({...newProgram, branch: e.target.value as Branch})}
                      className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {Object.values(Branch).map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Class Size</label>
                    <input 
                      type="number" 
                      value={newProgram.residentsPerClass}
                      onChange={(e) => setNewProgram({...newProgram, residentsPerClass: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Specialty</label>
                  <select 
                    value={newProgram.specialty}
                    onChange={(e) => setNewProgram({...newProgram, specialty: e.target.value})}
                    className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Location (City, State)</label>
                  <input 
                    type="text" 
                    value={newProgram.location}
                    onChange={(e) => setNewProgram({...newProgram, location: e.target.value})}
                    placeholder="e.g. Bethesda, MD"
                    className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cover Image URL (Optional)</label>
                  <input 
                    type="text" 
                    value={newProgram.imageUrl}
                    onChange={(e) => setNewProgram({...newProgram, imageUrl: e.target.value})}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="submit" 
                  className="flex-grow bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 shadow-md transition-all active:scale-95"
                >
                  CREATE PROGRAM
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)}
                  className="px-6 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;