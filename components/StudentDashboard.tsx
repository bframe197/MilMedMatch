import React, { useState, useMemo, useRef, useEffect } from 'react';
import { User, Branch, Role, ADTRequest, MatchDeadline, InfoTab } from '../types';
import { SPECIALTIES } from '../constants';
import { findLocalRecruiters } from '../services/geminiService';

interface StudentDashboardProps {
  user: User;
  activeBranch: Branch;
  onBranchChange: (branch: Branch) => void;
  onSelectSpecialty: (specialty: string) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onSubmitAdt: (request: ADTRequest) => void;
  matchDeadlines: MatchDeadline[];
}

interface Recruiter {
  id: string;
  name: string;
  office: string;
  phone: string;
  distance: string;
}

const PRO_PAY_RATES: Record<string, number> = {
  'Anesthesiology': 55000,
  'Emergency Medicine': 43000,
  'Family Medicine': 30000,
  'General Surgery': 53000,
  'Plastic Surgery': 53000,
  'GS Urology': 53000,
  'Internal Medicine': 30000,
  'Internal Medicine/Psychiatry': 35000,
  'Neurology': 30000,
  'Child Neurology': 35000,
  'Neurosurgery': 60000,
  'OB-GYN': 48000,
  'Orthopaedics': 55000,
  'Otolaryngology': 53000,
  'Pathology': 30000,
  'Pediatrics': 25000,
  'Psychiatry': 43000,
  'Transitional': 20000,
  'Vascular Surgery': 55000,
  'Radiology': 55000,
  'Dermatology': 48000
};

const StudentDashboard: React.FC<StudentDashboardProps> = ({ 
  user, activeBranch, onBranchChange, onSelectSpecialty, onUpdateUser, onDeleteUser, onSubmitAdt, matchDeadlines 
}) => {
  const isPreMed = user.role === Role.PRE_MED;
  const isResident = user.role === Role.RESIDENT;
  const isMedStudent = user.role === Role.MEDICAL_STUDENT;
  
  const [activeTab, setActiveTab] = useState<InfoTab>(isPreMed ? 'scholarship' : null);
  
  // Reset recruiter results when branch changes
  useEffect(() => {
    setRecruiters([]);
    setZipCode('');
  }, [activeBranch]);

  // Calculator States
  const [calcTuition, setCalcTuition] = useState<number>(55000);
  const [calcInterest, setCalcInterest] = useState<number>(6.5);
  const [rank, setRank] = useState<'O-3' | 'O-4'>('O-3');
  const [selectedSpec, setSelectedSpec] = useState<string>(isResident && user.specialty ? user.specialty : SPECIALTIES[0]);
  const [hasDependents, setHasDependents] = useState<boolean>(true);
  
  // Recruiters State
  const [zipCode, setZipCode] = useState('');
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [isSearchingRecruiters, setIsSearchingRecruiters] = useState(false);

  // Settings States
  const [editFirstName, setEditFirstName] = useState(user.firstName);
  const [editLastName, setEditLastName] = useState(user.lastName);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editProfileImage, setEditProfileImage] = useState(user.profileImageUrl || '');
  const [editEducation, setEditEducation] = useState(
    user.role === Role.MEDICAL_STUDENT ? (user.medicalSchool || '') :
    user.role === Role.RESIDENT ? (user.residencyProgram || '') :
    user.role === Role.PRE_MED ? (user.undergradSchool || '') : ''
  );
  const [editPassword, setEditPassword] = useState('');
  const [settingsStatus, setSettingsStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Camera & Upload States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Multi-page ADT form state (matching document)
  const [adtForm, setAdtForm] = useState<Partial<ADTRequest>>({
    fullName: `${user.lastName}, ${user.firstName}`,
    ssnLast4: '',
    facilityName: '',
    remainingAdtDays: '45',
    advancePayment: 'No',
    email: '',
    married: 'No',
    dependents: 'No',
    dependentNames: '',
    startDate: '',
    endDate: '',
    travelMode: 'Drive',
    rentalCar: 'No',
    phone: '',
    altPhone: '',
    homeOfRecord: '',
    currentAddress: '',
    signature: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [adtSubmitted, setAdtSubmitted] = useState(false);

  const getHeroStyles = () => {
    const branchToStyle = isPreMed ? activeBranch : user.branch;
    switch (branchToStyle) {
      case Branch.ARMY: return 'from-[#4B5320] to-[#2E3314]';
      case Branch.NAVY: return 'from-[#000080] to-[#000040]';
      case Branch.AIR_FORCE: return 'from-[#00308F] to-[#001D56]';
      default: return 'from-slate-800 to-slate-900';
    }
  };

  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsStatus('saving');
    const updatedUser: User = {
      ...user,
      firstName: editFirstName,
      lastName: editLastName,
      email: editEmail,
      profileImageUrl: editProfileImage,
      password: editPassword || user.password
    };
    if (user.role === Role.MEDICAL_STUDENT) updatedUser.medicalSchool = editEducation;
    if (user.role === Role.RESIDENT) updatedUser.residencyProgram = editEducation;
    if (user.role === Role.PRE_MED) updatedUser.undergradSchool = editEducation;
    setTimeout(() => {
      onUpdateUser(updatedUser);
      setSettingsStatus('success');
      setTimeout(() => setSettingsStatus('idle'), 2000);
    }, 800);
  };

  const handleDeleteAccount = () => {
    if (isConfirmingDelete) {
      onDeleteUser(user.id);
    } else {
      setIsConfirmingDelete(true);
      setTimeout(() => setIsConfirmingDelete(false), 5000); // Reset confirm state after 5s
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setCameraStream(stream);
      setIsCameraOpen(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied", err);
      alert("Please allow camera access to take a photo.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setEditProfileImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleRecruiterSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zipCode) return;
    setIsSearchingRecruiters(true);
    // Explicitly uses the activeBranch state which reflects the current tab
    const results = await findLocalRecruiters(zipCode, activeBranch);
    setRecruiters(results);
    setIsSearchingRecruiters(false);
  };

  const handleAdtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalRequest: ADTRequest = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.username,
      status: 'pending',
      timestamp: Date.now(),
      ...(adtForm as any)
    };
    onSubmitAdt(finalRequest);
    setAdtSubmitted(true);
  };

  const handleAdtInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAdtForm(prev => ({ ...prev, [name]: value }));
  };

  const scholarshipMetrics = useMemo(() => {
    const years = 4;
    const monthlyStipend = 2728;
    const signingBonus = 20000;
    const adtPayPerYear = 9450; 
    const totalStipend = monthlyStipend * 12 * years;
    const totalAdtPay = adtPayPerYear * years;
    const totalBonus = signingBonus;
    const totalTuitionSaved = calcTuition * years;
    const militaryBenefitValue = totalStipend + totalAdtPay + totalBonus + totalTuitionSaved;
    let debt = 0;
    for (let i = 0; i < years; i++) {
      debt = (debt + calcTuition) * (1 + calcInterest / 100);
    }
    return { debtAtEnd: debt, militaryBenefitValue, totalStipend, totalAdtPay, totalBonus, totalTuitionSaved };
  }, [calcTuition, calcInterest]);

  const salaryMetrics = useMemo(() => {
    const basePay = rank === 'O-3' ? 74000 : 85000;
    const incentivePay = PRO_PAY_RATES[selectedSpec] || 25000;
    const bas = 316 * 12;
    const estimatedBah = hasDependents ? 32000 : 26000;
    const taxableIncome = basePay + incentivePay;
    const nonTaxableIncome = bas + estimatedBah;
    const totalSalary = taxableIncome + nonTaxableIncome;
    return { basePay, incentivePay, basePayRate: 0, bas, bah: estimatedBah, totalSalary, taxableIncome, nonTaxableIncome };
  }, [rank, selectedSpec, hasDependents]);

  const getEducationLabel = () => {
    if (user.role === Role.MEDICAL_STUDENT) return "Medical School";
    if (user.role === Role.RESIDENT) return "Residency Program";
    if (user.role === Role.PRE_MED) return "Undergraduate School";
    return "Educational Institution";
  };

  const dashboardBranch = isPreMed ? activeBranch : user.branch;

  // For residents, only show their specialty in the grid
  const availableSpecialties = isResident && user.specialty 
    ? SPECIALTIES.filter(s => s === user.specialty) 
    : SPECIALTIES;

  return (
    <div className="pb-12">
      <div className={`bg-gradient-to-r ${getHeroStyles()} text-white py-16 px-6 text-center shadow-lg relative overflow-hidden transition-all duration-700`}>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="relative z-10">
          <div className="flex flex-col items-center gap-4 mb-4">
            {user.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="Profile" className="w-24 h-24 rounded-full border-4 border-white/20 shadow-xl object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-white/20 shadow-xl bg-slate-800 flex items-center justify-center text-4xl military-font">
                {user.firstName[0]}{user.lastName[0]}
              </div>
            )}
            <h1 className="military-font text-4xl md:text-5xl font-bold">{user.firstName} {user.lastName}</h1>
          </div>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            {isResident 
              ? `Medical Officer Portal. Manage your ${user.specialty} profile and view peer programs.`
              : isPreMed 
                ? `Future Medical Officer Portal. Compare scholarships and explore programs in the ${activeBranch}.`
                : `Explore available GME programs, connect with leadership, and prepare for your medical career in the ${user.branch}.`
            }
          </p>
          
          {isPreMed && (
            <div className="mt-8 flex justify-center gap-3">
              <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-xl">
                {Object.values(Branch).filter(b => b !== Branch.UNDECIDED).map(b => (
                  <button
                    key={b}
                    onClick={() => onBranchChange(b)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeBranch === b ? 'bg-white text-slate-900 shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {isMedStudent && (
            <>
              <button onClick={() => setActiveTab(activeTab === 'adt' ? null : 'adt')} className={`bg-white p-4 rounded-xl border transition-all text-left shadow-sm hover:shadow-md group ${activeTab === 'adt' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'}`}>
                <h3 className="font-bold text-sm mb-1 group-hover:text-blue-600">🎖️ ADT</h3>
                <p className="text-slate-500 text-[10px]">Training Request</p>
              </button>
              <button onClick={() => setActiveTab(activeTab === 'bah' ? null : 'bah')} className={`bg-white p-4 rounded-xl border transition-all text-left shadow-sm hover:shadow-md group ${activeTab === 'bah' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'}`}>
                <h3 className="font-bold text-sm mb-1 group-hover:text-blue-600">🏠 BAH</h3>
                <p className="text-slate-500 text-[10px]">Allowance Calculator</p>
              </button>
              <button onClick={() => setActiveTab(activeTab === 'timeline' ? null : 'timeline')} className={`bg-white p-4 rounded-xl border transition-all text-left shadow-sm hover:shadow-md group ${activeTab === 'timeline' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'}`}>
                <h3 className="font-bold text-sm mb-1 group-hover:text-blue-600">📅 Match</h3>
                <p className="text-slate-500 text-[10px]">Match Deadlines</p>
              </button>
              <button onClick={() => setActiveTab(activeTab === 'salary' ? null : 'salary')} className={`bg-white p-4 rounded-xl border transition-all text-left shadow-sm hover:shadow-md group ${activeTab === 'salary' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'}`}>
                <h3 className="font-bold text-sm mb-1 group-hover:text-blue-600">📊 Salary</h3>
                <p className="text-slate-500 text-[10px]">Post-Residency</p>
              </button>
              <button onClick={() => setActiveTab(activeTab === 'settings' ? null : 'settings')} className={`bg-white p-4 rounded-xl border transition-all text-left shadow-sm hover:shadow-md group ${activeTab === 'settings' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'}`}>
                <h3 className="font-bold text-sm mb-1 group-hover:text-blue-600">⚙️ Settings</h3>
                <p className="text-slate-500 text-[10px]">Account Profile</p>
              </button>
            </>
          )}

          {isPreMed && (
            <>
              <button onClick={() => setActiveTab(activeTab === 'bah' ? null : 'bah')} className={`bg-white p-4 rounded-xl border transition-all text-left shadow-sm hover:shadow-md group ${activeTab === 'bah' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'}`}>
                <h3 className="font-bold text-sm mb-1 group-hover:text-blue-600">🏠 BAH</h3>
                <p className="text-slate-500 text-[10px]">Allowance Calculator</p>
              </button>
              <button onClick={() => setActiveTab(activeTab === 'recruiters' ? null : 'recruiters')} className={`bg-white p-4 rounded-xl border transition-all text-left shadow-sm hover:shadow-md group ${activeTab === 'recruiters' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'}`}>
                <h3 className="font-bold text-sm mb-1 group-hover:text-blue-600">📞 Recruiters</h3>
                <p className="text-slate-500 text-[10px]">Find HPSP Liaisons</p>
              </button>
              <button onClick={() => setActiveTab(activeTab === 'salary' ? null : 'salary')} className={`bg-white p-4 rounded-xl border transition-all text-left shadow-sm hover:shadow-md group ${activeTab === 'salary' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'}`}>
                <h3 className="font-bold text-sm mb-1 group-hover:text-blue-600">📊 Salary</h3>
                <p className="text-slate-500 text-[10px]">Post-Residency</p>
              </button>
              <button onClick={() => setActiveTab(activeTab === 'scholarship' ? null : 'scholarship')} className={`bg-white p-4 rounded-xl border transition-all text-left shadow-sm hover:shadow-md group ${activeTab === 'scholarship' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'}`}>
                <h3 className="font-bold text-sm mb-1 group-hover:text-blue-600">💰 Savings</h3>
                <p className="text-slate-500 text-[10px]">Scholarship Value</p>
              </button>
              <button onClick={() => setActiveTab(activeTab === 'settings' ? null : 'settings')} className={`bg-white p-4 rounded-xl border transition-all text-left shadow-sm hover:shadow-md group ${activeTab === 'settings' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'}`}>
                <h3 className="font-bold text-sm mb-1 group-hover:text-blue-600">⚙️ Settings</h3>
                <p className="text-slate-500 text-[10px]">Account Profile</p>
              </button>
            </>
          )}

          {isResident && !isPreMed && !isMedStudent && (
             <>
               <button onClick={() => setActiveTab(activeTab === 'bah' ? null : 'bah')} className={`bg-white p-4 rounded-xl border transition-all text-left shadow-sm hover:shadow-md group ${activeTab === 'bah' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'}`}>
                <h3 className="font-bold text-sm mb-1 group-hover:text-blue-600">🏠 BAH</h3>
                <p className="text-slate-500 text-[10px]">Allowance Calculator</p>
              </button>
              <button onClick={() => setActiveTab(activeTab === 'salary' ? null : 'salary')} className={`bg-white p-4 rounded-xl border transition-all text-left shadow-sm hover:shadow-md group ${activeTab === 'salary' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'}`}>
                <h3 className="font-bold text-sm mb-1 group-hover:text-blue-600">📊 Salary</h3>
                <p className="text-slate-500 text-[10px]">Post-Residency</p>
              </button>
              <button onClick={() => setActiveTab(activeTab === 'settings' ? null : 'settings')} className={`bg-white p-4 rounded-xl border transition-all text-left shadow-sm hover:shadow-md group ${activeTab === 'settings' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'}`}>
                <h3 className="font-bold text-sm mb-1 group-hover:text-blue-600">⚙️ Settings</h3>
                <p className="text-slate-500 text-[10px]">Account Profile</p>
              </button>
             </>
          )}
        </div>

        {activeTab && (
          <div className="bg-slate-50 border-2 border-blue-100 rounded-2xl p-8 mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
            {activeTab === 'recruiters' && isPreMed && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                  <h4 className="text-3xl font-bold text-slate-900 military-font mb-2">Find Local {activeBranch} Recruiters</h4>
                  <p className="text-slate-500">Discover {activeBranch} medical recruitment offices within a 100-mile radius.</p>
                </div>

                <form onSubmit={handleRecruiterSearch} className="flex flex-col md:flex-row gap-4 mb-12 justify-center items-center">
                  <div className="relative">
                    <input 
                      type="text" 
                      maxLength={5}
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Zip Code"
                      className="px-6 py-4 rounded-xl border-2 border-slate-200 focus:border-blue-600 outline-none w-48 font-bold text-center text-xl shadow-sm"
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSearchingRecruiters}
                    className="bg-slate-900 text-white font-bold px-8 py-4 rounded-xl hover:bg-slate-800 shadow-lg transition-all active:scale-95 disabled:opacity-50 min-w-[200px]"
                  >
                    {isSearchingRecruiters ? 'SEARCHING...' : `SEARCH ${activeBranch.toUpperCase()}`}
                  </button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recruiters.map((recruiter) => (
                    <div key={recruiter.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-400 transition-colors group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          <span className="text-xl">🎖️</span>
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">
                          {recruiter.distance.toUpperCase().replace('MILES', '').replace('MI', '').trim()} MILES
                        </span>
                      </div>
                      <h5 className="font-bold text-slate-900 text-lg mb-1">{recruiter.name}</h5>
                      <p className="text-slate-500 text-sm mb-4">{recruiter.office}</p>
                      <div className="pt-4 border-t border-slate-50 space-y-3">
                        <a href={`tel:${recruiter.phone}`} className="flex items-center gap-3 text-slate-700 font-bold text-sm hover:text-blue-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                          {recruiter.phone}
                        </a>
                        <button className="w-full bg-slate-50 group-hover:bg-blue-600 group-hover:text-white text-slate-400 font-bold py-2 rounded-lg text-xs transition-all uppercase tracking-widest">
                          Contact Specialist
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {zipCode && !isSearchingRecruiters && recruiters.length === 0 && (
                    <div className="col-span-3 text-center py-12 text-slate-400 italic">
                      No {activeBranch} recruiters found within 100 miles. Try a different Zip Code.
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'timeline' && isMedStudent && (
              <div className="max-w-4xl mx-auto">
                <h4 className="text-2xl font-bold text-slate-900 mb-6 text-center military-font">Current Cycle Match Timeline</h4>
                <div className="space-y-4">
                  {matchDeadlines.map((deadline) => (
                    <div key={deadline.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between gap-6 hover:border-blue-200 transition-colors">
                      <div className="flex-grow">
                        <h5 className="font-bold text-slate-900 text-lg mb-1">{deadline.event}</h5>
                        <p className="text-slate-500 text-sm italic">{deadline.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-sm">
                          {new Date(deadline.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center">
                  <h4 className="text-2xl font-bold text-slate-900 mb-2 military-font uppercase">Account & Profile Settings</h4>
                  <p className="text-slate-500 text-sm">Update your official professional record.</p>
                </div>

                <form onSubmit={handleSettingsSave} className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 space-y-6">
                  <div className="flex flex-col items-center gap-6 pb-6 border-b border-slate-100">
                    <div className="relative group">
                      {editProfileImage ? (
                        <img src={editProfileImage} alt="Preview" className="w-32 h-32 rounded-full border-4 border-slate-100 shadow-xl object-cover" />
                      ) : (
                        <div className="w-32 h-32 rounded-full border-4 border-slate-100 shadow-xl bg-slate-200 flex items-center justify-center text-5xl font-bold text-slate-400">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-slate-900/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                         <span className="text-white text-[10px] font-bold uppercase tracking-widest">Update Photo</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3">
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        CHOOSE FROM DEVICE
                      </button>
                      <button 
                        type="button" 
                        onClick={startCamera}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        TAKE PHOTO
                      </button>
                    </div>

                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

                    {isCameraOpen && (
                      <div className="fixed inset-0 bg-slate-900/90 z-[100] flex flex-col items-center justify-center p-4">
                        <div className="relative max-w-lg w-full bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                          <video ref={videoRef} autoPlay playsInline className="w-full aspect-video object-cover" />
                          <div className="p-6 flex justify-center gap-4">
                            <button 
                              type="button" 
                              onClick={capturePhoto}
                              className="w-16 h-16 bg-white rounded-full border-4 border-slate-300 shadow-xl flex items-center justify-center active:scale-95 transition-transform"
                            >
                               <div className="w-12 h-12 bg-blue-600 rounded-full"></div>
                            </button>
                            <button 
                              type="button" 
                              onClick={stopCamera}
                              className="absolute top-4 right-4 w-10 h-10 bg-black/40 text-white rounded-full flex items-center justify-center backdrop-blur-md"
                            >
                              &times;
                            </button>
                          </div>
                        </div>
                        <p className="mt-4 text-white/60 text-sm font-bold uppercase tracking-widest">Capture Official Profile Headshot</p>
                      </div>
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name</label>
                      <input type="text" value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name</label>
                      <input type="text" value={editLastName} onChange={(e) => setEditLastName(e.target.value)} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                    <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{getEducationLabel()}</label>
                    <input type="text" value={editEducation} onChange={(e) => setEditEducation(e.target.value)} placeholder={`Enter your ${getEducationLabel().toLowerCase()}`} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  
                  <div className="pt-4 border-t">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Change Password</label>
                    <input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="Enter new password (leave blank to keep current)" className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  
                  <button type="submit" disabled={settingsStatus === 'saving'} className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg ${settingsStatus === 'success' ? 'bg-green-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                    {settingsStatus === 'saving' ? 'SAVING...' : settingsStatus === 'success' ? 'PROFILE UPDATED' : 'SAVE ACCOUNT SETTINGS'}
                  </button>
                </form>

                <div className="bg-red-50 p-8 rounded-2xl border border-red-200 animate-in fade-in duration-500">
                  <h5 className="text-red-800 font-bold mb-2 uppercase tracking-wide text-sm">Danger Zone</h5>
                  <p className="text-red-600 text-sm mb-6">Deleting your account is permanent. All your ADT history, profile data, and notifications will be wiped from the command database.</p>
                  <button 
                    onClick={handleDeleteAccount}
                    className={`px-6 py-3 rounded-xl font-bold transition-all shadow-md ${isConfirmingDelete ? 'bg-red-600 text-white hover:bg-red-700 w-full animate-pulse' : 'bg-white text-red-600 border border-red-300 hover:bg-red-50'}`}
                  >
                    {isConfirmingDelete ? 'CONFIRM PERMANENT DELETION' : 'DELETE ACCOUNT'}
                  </button>
                  {isConfirmingDelete && (
                    <p className="text-center text-[10px] text-red-400 font-bold uppercase mt-2">Warning: This action cannot be undone.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'adt' && isMedStudent && (
              <div className="max-w-4xl mx-auto">
                <h4 className="text-2xl font-bold text-slate-900 mb-6 text-center military-font">Official Request for Active Duty Training (ADT)</h4>
                {adtSubmitted ? (
                  <div className="bg-green-50 border border-green-200 text-green-800 p-12 rounded-xl text-center shadow-inner">
                    <svg className="w-16 h-16 mx-auto mb-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="font-bold text-2xl mb-2">ADT Request Submitted</p>
                    <p className="text-slate-600">Your application is now under review by the GME Administration office. You will receive a notification once a decision is made.</p>
                    <button onClick={() => setAdtSubmitted(false)} className="mt-6 text-blue-600 font-bold hover:underline">Submit Another Request</button>
                  </div>
                ) : (
                  <form onSubmit={handleAdtSubmit} className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <p className="text-xs font-bold text-red-500 uppercase mb-2">Regulation Notice</p>
                        <p className="text-xs text-slate-600">Remaining ADT days will be at school and can be before or after the Facility start/end date. Total ADT must equal 45 days.</p>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Full Legal Name (Last, First)</label>
                        <input name="fullName" value={adtForm.fullName} onChange={handleAdtInputChange} className="w-full px-4 py-2 border rounded bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none font-medium" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Four SSN</label>
                        <input name="ssnLast4" maxLength={4} value={adtForm.ssnLast4} onChange={handleAdtInputChange} placeholder="XXXX" className="w-full px-4 py-2 border rounded bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none font-medium" required />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Facility Location Name (e.g. Walter Reed)</label>
                        <input name="facilityName" value={adtForm.facilityName} onChange={handleAdtInputChange} className="w-full px-4 py-2 border rounded bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none font-medium" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Remaining ADT Days</label>
                        <input type="number" name="remainingAdtDays" value={adtForm.remainingAdtDays} onChange={handleAdtInputChange} className="w-full px-4 py-2 border rounded bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none font-medium" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Advance Payment (Y/N)</label>
                        <select name="advancePayment" value={adtForm.advancePayment} onChange={handleAdtInputChange} className="w-full px-4 py-2 border rounded bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none font-medium">
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address (example@gmail.com)</label>
                        <input type="email" name="email" value={adtForm.email} onChange={handleAdtInputChange} className="w-full px-4 py-2 border rounded bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none font-medium" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Married (Y/N)</label>
                        <select name="married" value={adtForm.married} onChange={handleAdtInputChange} className="w-full px-4 py-2 border rounded bg-slate-50 font-medium">
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dependents (Y/N)</label>
                        <select name="dependents" value={adtForm.dependents} onChange={handleAdtInputChange} className="w-full px-4 py-2 border rounded bg-slate-50 font-medium">
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dependents - Full Names (Spouse, Child, etc.)</label>
                        <textarea name="dependentNames" value={adtForm.dependentNames} onChange={handleAdtInputChange} rows={3} placeholder="Add until you've recorded all dependents" className="w-full px-4 py-2 border rounded bg-slate-50 font-medium" />
                      </div>
                      <div className="md:col-span-2 grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Start Date</label>
                          <input type="date" name="startDate" value={adtForm.startDate} onChange={handleAdtInputChange} className="w-full px-4 py-2 border rounded bg-slate-50 font-medium" required />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">End Date</label>
                          <input type="date" name="endDate" value={adtForm.endDate} onChange={handleAdtInputChange} className="w-full px-4 py-2 border rounded bg-slate-50 font-medium" required />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mode of Travel</label>
                        <select name="travelMode" value={adtForm.travelMode} onChange={handleAdtInputChange} className="w-full px-4 py-2 border rounded bg-slate-50 font-medium">
                          <option value="Drive">Drive</option>
                          <option value="Fly">Fly</option>
                          <option value="Local">Local</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rental Car (Y/N)</label>
                        <select name="rentalCar" value={adtForm.rentalCar} onChange={handleAdtInputChange} className="w-full px-4 py-2 border rounded bg-slate-50 font-medium">
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Phone Number (XXX-XXX-XXXX)</label>
                        <input type="tel" name="phone" value={adtForm.phone} onChange={handleAdtInputChange} className="w-full px-4 py-2 border rounded bg-slate-50 font-medium" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Alternate Number</label>
                        <input type="tel" name="altPhone" value={adtForm.altPhone} onChange={handleAdtInputChange} className="w-full px-4 py-2 border rounded bg-slate-50 font-medium" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Home of Record</label>
                        <input name="homeOfRecord" value={adtForm.homeOfRecord} onChange={handleAdtInputChange} className="w-full px-4 py-2 border rounded bg-slate-50 font-medium" required />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Address (No P.O. Boxes)</label>
                        <input name="currentAddress" value={adtForm.currentAddress} onChange={handleAdtInputChange} className="w-full px-4 py-2 border rounded bg-slate-50 font-medium" required />
                      </div>
                      <div className="md:col-span-2 bg-yellow-50 p-6 rounded-xl border border-yellow-100 flex flex-col md:flex-row gap-6 items-end">
                        <div className="flex-grow">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Student Electronic Signature</label>
                          <input name="signature" value={adtForm.signature} onChange={handleAdtInputChange} placeholder="Type legal name to sign" className="w-full px-4 py-3 border-b-2 border-slate-900 bg-transparent outline-none military-font text-lg" required />
                        </div>
                        <div className="w-full md:w-40">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date</label>
                          <input type="date" name="date" value={adtForm.date} onChange={handleAdtInputChange} className="w-full px-2 py-2 border-b-2 border-slate-900 bg-transparent outline-none" required />
                        </div>
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all shadow-lg text-lg military-font">TRANSMIT ADT APPLICATION</button>
                  </form>
                )}
              </div>
            )}
            
            {activeTab === 'bah' && (
              <div className="text-center py-12">
                <h4 className="text-xl font-bold mb-4">Housing Allowances</h4>
                <a href="https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/BAH-Rate-Lookup/" target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold">Open DoD Calculator</a>
              </div>
            )}
            {activeTab === 'salary' && (
               <div className="max-w-6xl mx-auto space-y-10">
                <div className="text-center">
                  <h4 className="text-3xl font-bold text-slate-900 military-font mb-2">Post-Residency Salary Estimator</h4>
                  <p className="text-slate-500">Calculate your total annual military compensation package.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                    <h5 className="font-bold text-slate-800 border-b pb-2 uppercase tracking-widest text-sm">Service Parameters</h5>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expected Post-Residency Rank</label>
                        <select 
                          value={rank}
                          onChange={(e) => setRank(e.target.value as 'O-3' | 'O-4')}
                          className="w-full px-4 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="O-3">O-3 (Captain / Lieutenant)</option>
                          <option value="O-4">O-4 (Major / Lt. Commander)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Board Certified Specialty</label>
                        <select 
                          value={selectedSpec}
                          onChange={(e) => setSelectedSpec(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={hasDependents}
                            onChange={(e) => setHasDependents(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm font-medium text-slate-700">Has Dependents (Impacts BAH)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl space-y-6 flex flex-col justify-between">
                    <div>
                      <h5 className="font-bold text-yellow-500 border-b border-white/10 pb-2 uppercase tracking-widest text-sm mb-6">Annual Compensation Estimate</h5>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="opacity-70">Estimated Base Pay:</span>
                          <span className="font-bold">${salaryMetrics.basePay.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="opacity-70">Specialty Incentive Pay:</span>
                          <span className="font-bold text-green-400">+ ${salaryMetrics.incentivePay.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="opacity-70">BAH (Housing Allowance):</span>
                          <span className="font-bold">${salaryMetrics.bah.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="opacity-70">BAS (Subsistence):</span>
                          <span className="font-bold">${salaryMetrics.bas.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-white/10">
                      <p className="text-xs font-bold text-yellow-500 uppercase mb-1">Total Estimated Annual Salary</p>
                      <p className="text-5xl font-bold text-white">${salaryMetrics.totalSalary.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'scholarship' && (
              <div className="max-w-6xl mx-auto space-y-10">
                <div className="text-center">
                  <h4 className="text-3xl font-bold text-slate-900 military-font mb-2">HPSP Financial Comparison</h4>
                  <p className="text-slate-500">See how military service secures your financial future.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                    <h5 className="font-bold text-slate-800 border-b pb-2 uppercase tracking-widest text-sm">Loan Scenario Inputs</h5>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Average Yearly Tuition & Fees</label>
                        <input 
                          type="number" 
                          value={calcTuition}
                          onChange={(e) => setCalcTuition(Number(e.target.value))}
                          className="w-full px-4 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Avg Student Loan Interest Rate (%)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          value={calcInterest}
                          onChange={(e) => setCalcInterest(Number(e.target.value))}
                          className="w-full px-4 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                        />
                      </div>
                    </div>
                    <div className="pt-6 border-t">
                      <p className="text-xs font-bold text-red-500 uppercase mb-1">Estimated Debt at Graduation</p>
                      <p className="text-4xl font-bold text-slate-900">${scholarshipMetrics.debtAtEnd.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                    </div>
                  </div>
                  <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl space-y-6 relative overflow-hidden">
                    <h5 className="font-bold text-yellow-500 border-b border-white/10 pb-2 uppercase tracking-widest text-sm">HPSP Military Value</h5>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between items-center"><span className="opacity-70">Tuition Covered:</span><span className="font-bold">${scholarshipMetrics.totalTuitionSaved.toLocaleString()}</span></div>
                      <div className="flex justify-between items-center"><span className="opacity-70">Monthly Stipend:</span><span className="font-bold">${scholarshipMetrics.totalStipend.toLocaleString()}</span></div>
                      <div className="flex justify-between items-center"><span className="opacity-70">ADT Pay:</span><span className="font-bold">${scholarshipMetrics.totalAdtPay.toLocaleString()}</span></div>
                      <div className="flex justify-between items-center"><span className="opacity-70">Signing Bonus:</span><span className="font-bold">${scholarshipMetrics.totalBonus.toLocaleString()}</span></div>
                    </div>
                    <div className="pt-6 border-t border-white/10">
                      <p className="text-xs font-bold text-yellow-500 uppercase mb-1">Total Scholarship Value</p>
                      <p className="text-4xl font-bold text-white">${scholarshipMetrics.militaryBenefitValue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* New ADSO Payback Information Section */}
                <div className="bg-blue-50 rounded-2xl border-2 border-blue-200 p-8 shadow-sm">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="space-y-4">
                      <h5 className="text-xl font-bold text-blue-900 uppercase military-font tracking-wide">Active Duty Service Obligation (ADSO)</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <p className="text-blue-800 font-bold text-sm">The Payback Rule:</p>
                          <p className="text-slate-600 text-sm leading-relaxed">
                            For every year you receive the HPSP scholarship, you owe <span className="font-bold text-blue-700">one year</span> of active duty service as a military physician.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-blue-800 font-bold text-sm">Minimum Commitment:</p>
                          <p className="text-slate-600 text-sm leading-relaxed">
                            Most HPSP contracts require a <span className="font-bold text-blue-700">minimum of 3 or 4 years</span> of active duty service, regardless of whether the scholarship was for fewer years.
                          </p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-blue-200">
                        <p className="text-xs text-blue-500 italic">
                          *Note: Years spent in residency training do not count toward your payback obligation. Your service clock typically begins once you complete GME and begin practice as an attending physician.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-xl p-8 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-8 border-b pb-4 flex items-center gap-3 uppercase">
            <span className="w-2 h-8 bg-yellow-500 rounded-full"></span>
            SELECT SPECIALTY TO VIEW INFORMATION ABOUT RESIDENCY PROGRAMS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {availableSpecialties.map((spec) => (
              <button key={spec} onClick={() => onSelectSpecialty(spec)} className="group relative flex items-center justify-between p-5 rounded-xl border-2 border-slate-100 hover:border-slate-900 bg-slate-50 hover:bg-white transition-all text-left shadow-sm hover:shadow-md">
                <span className="font-bold text-slate-700 group-hover:text-slate-900">{spec}</span>
                <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;