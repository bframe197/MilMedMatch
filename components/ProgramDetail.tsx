
import React, { useState, useRef } from 'react';
import { ResidencyProgram, User, Role, ResidentProfile } from '../types';

interface ProgramDetailProps {
  program: ResidencyProgram;
  user: User;
  defaultImage: string;
  onBack: () => void;
  onUpdateProgram: (program: ResidencyProgram) => void;
}

type ProgramTab = 'contacts' | 'videos' | 'residents';

const ProgramDetail: React.FC<ProgramDetailProps> = ({ program, user, defaultImage, onBack, onUpdateProgram }) => {
  const [activeTab, setActiveTab] = useState<ProgramTab>('contacts');
  const [isEditingProfiles, setIsEditingProfiles] = useState(false);
  const isPreMed = user.role === Role.PRE_MED;
  const isResident = user.role === Role.RESIDENT;

  // Form states for adding a new resident profile
  const [newResidentName, setNewResidentName] = useState('');
  const [newResidentEmail, setNewResidentEmail] = useState('');
  const [newResidentSchool, setNewResidentSchool] = useState('');
  const [newResidentYear, setNewResidentYear] = useState<number>(1);
  const [newResidentInterests, setNewResidentInterests] = useState('');
  const [newResidentImage, setNewResidentImage] = useState('');

  // Camera and File states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddResident = () => {
    if (newResidentName && newResidentSchool) {
      const newResident: ResidentProfile = {
        id: Math.random().toString(36).substr(2, 9),
        name: newResidentName,
        email: newResidentEmail,
        school: newResidentSchool,
        pgyYear: newResidentYear,
        interests: newResidentInterests,
        imageUrl: newResidentImage || `https://i.pravatar.cc/150?u=${Math.random()}`
      };
      
      onUpdateProgram({
        ...program,
        residents: [...(program.residents || []), newResident]
      });

      setNewResidentName('');
      setNewResidentEmail('');
      setNewResidentSchool('');
      setNewResidentYear(1);
      setNewResidentInterests('');
      setNewResidentImage('');
    }
  };

  const handleRemoveResident = (id: string) => {
    onUpdateProgram({
      ...program,
      residents: program.residents.filter(r => r.id !== id)
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewResidentImage(reader.result as string);
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
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
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
        setNewResidentImage(dataUrl);
        stopCamera();
      }
    }
  };

  const sortedResidents = [...(program.residents || [])].sort((a, b) => a.pgyYear - b.pgyYear);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        BACK TO PROGRAMS
      </button>

      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
        <div className="relative h-80 overflow-hidden">
          <img src={program.imageUrl || defaultImage} alt={program.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
          <div className="absolute bottom-8 left-8 text-white">
            <span className="text-xs font-bold uppercase tracking-widest bg-yellow-500 text-slate-900 px-3 py-1 rounded-full mb-3 inline-block shadow-lg">
              {program.branch} • {program.specialty}
            </span>
            <h1 className="text-4xl font-bold military-font">{program.name}</h1>
            <p className="text-lg opacity-90 flex items-center gap-2 mt-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {program.location}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-b">
          <div className="p-8 text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Class Size</span>
            <p className="text-4xl font-bold text-slate-900">{program.residentsPerClass}</p>
            <p className="text-sm text-slate-500">Residents per year</p>
          </div>
          <div className="p-8 text-center md:col-span-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4 text-left">Program Strengths</span>
            <div className="flex flex-wrap gap-2">
              {program.strengths.map((s, i) => (
                <span key={i} className="bg-slate-100 text-slate-700 font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b bg-slate-50 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('contacts')}
            className={`px-8 py-4 font-bold text-sm uppercase tracking-widest transition-all border-b-2 ${activeTab === 'contacts' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Leadership
          </button>
          <button 
            onClick={() => setActiveTab('residents')}
            className={`px-8 py-4 font-bold text-sm uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === 'residents' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Resident Profiles
            {isPreMed && (
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('videos')}
            className={`px-8 py-4 font-bold text-sm uppercase tracking-widest transition-all border-b-2 ${activeTab === 'videos' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Program Videos
          </button>
        </div>

        <div className="p-8 min-h-[400px]">
          {/* Leadership View */}
          {activeTab === 'contacts' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                LEADERSHIP & CONTACTS
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 relative overflow-hidden group">
                  <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-1">Program Director</h3>
                  <p className="text-xl font-bold text-slate-900 mb-4">{program.programDirector.name}</p>
                  <div className="space-y-2">
                    <a href={`mailto:${program.programDirector.email}`} className="flex items-center gap-3 text-slate-600 hover:text-blue-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      <span className="text-sm font-medium">{program.programDirector.email}</span>
                    </a>
                    <p className="flex items-center gap-3 text-slate-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      <span className="text-sm font-medium">{program.programDirector.phone}</span>
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 relative overflow-hidden group">
                  <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-1">Program Secretary</h3>
                  <p className="text-xl font-bold text-slate-900 mb-4">{program.secretary.name}</p>
                  <div className="space-y-2">
                    <a href={`mailto:${program.secretary.email}`} className="flex items-center gap-3 text-slate-600 hover:text-blue-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      <span className="text-sm font-medium">{program.secretary.email}</span>
                    </a>
                    <p className="flex items-center gap-3 text-slate-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      <span className="text-sm font-medium">{program.secretary.phone}</span>
                    </p>
                    <div className="mt-4 p-3 bg-blue-100/50 border-l-4 border-blue-600 rounded">
                      <p className="text-xs font-bold text-blue-800 leading-relaxed italic">
                        "Medical students: Please reach out to the Program Secretary directly to coordinate and schedule an Active Duty Training (ADT) rotation at this facility."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Resident Profiles View */}
          {activeTab === 'residents' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-green-600 rounded-full"></span>
                  MEET OUR RESIDENTS
                </h2>
                {isResident && (
                  <button 
                    onClick={() => setIsEditingProfiles(!isEditingProfiles)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all shadow-md ${isEditingProfiles ? 'bg-red-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                  >
                    {isEditingProfiles ? 'FINISH EDITING' : 'EDIT PROFILES'}
                  </button>
                )}
              </div>

              {isPreMed ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl py-20 px-8 text-center flex flex-col items-center max-w-2xl mx-auto shadow-inner">
                  <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Section Locked</h3>
                  <p className="text-slate-500 leading-relaxed mb-6">
                    For privacy and professional security reasons, resident profiles are only available to medical students and currently serving resident users.
                  </p>
                  <div className="bg-white px-4 py-2 rounded-lg border text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Available upon medical school matriculation
                  </div>
                </div>
              ) : (
                <>
                  {isEditingProfiles && (
                    <div className="mb-10 p-6 bg-slate-50 border-2 border-slate-200 rounded-2xl shadow-sm animate-in slide-in-from-top-4 duration-300">
                      <h3 className="font-bold text-lg text-slate-900 mb-4 border-b pb-2">Add Yourself / Colleague</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Full Name & Rank</label>
                          <input 
                            type="text" 
                            value={newResidentName}
                            onChange={(e) => setNewResidentName(e.target.value)}
                            placeholder="e.g. CPT Jane Smith"
                            className="w-full px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Email Address</label>
                          <input 
                            type="email" 
                            value={newResidentEmail}
                            onChange={(e) => setNewResidentEmail(e.target.value)}
                            placeholder="e.g. jane.smith@health.mil"
                            className="w-full px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Medical School</label>
                            <input 
                              type="text" 
                              value={newResidentSchool}
                              onChange={(e) => setNewResidentSchool(e.target.value)}
                              placeholder="e.g. USUHS"
                              className="w-full px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Residency Year (PGY)</label>
                            <input 
                              type="number" 
                              min="1"
                              max="7"
                              value={newResidentYear}
                              onChange={(e) => setNewResidentYear(parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Clinical Interests / Personal Bio</label>
                          <textarea 
                            value={newResidentInterests}
                            onChange={(e) => setNewResidentInterests(e.target.value)}
                            placeholder="e.g. Pediatric Orthopaedics, Medical Research, Marathon Running"
                            className="w-full px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-green-500"
                            rows={2}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Profile Headshot</label>
                          <div className="flex flex-wrap items-center gap-3">
                            {newResidentImage ? (
                              <img src={newResidentImage} alt="Headshot" className="w-16 h-16 rounded-full border-2 border-slate-200 object-cover" />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <button 
                                type="button" 
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-[10px] font-bold transition-all uppercase tracking-widest"
                              >
                                Choose Album
                              </button>
                              <button 
                                type="button" 
                                onClick={startCamera}
                                className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-[10px] font-bold transition-all uppercase tracking-widest flex items-center gap-1"
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                Take Photo
                              </button>
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                          </div>
                          
                          {isCameraOpen && (
                            <div className="fixed inset-0 bg-slate-900/90 z-[100] flex flex-col items-center justify-center p-4">
                              <div className="relative max-w-lg w-full bg-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                                <video ref={videoRef} autoPlay playsInline className="w-full aspect-video object-cover" />
                                <div className="p-6 flex justify-center gap-4">
                                  <button onClick={capturePhoto} className="w-16 h-16 bg-white rounded-full border-4 border-slate-300 shadow-xl flex items-center justify-center active:scale-95 transition-transform">
                                    <div className="w-12 h-12 bg-green-600 rounded-full"></div>
                                  </button>
                                  <button onClick={stopCamera} className="absolute top-4 right-4 w-10 h-10 bg-black/40 text-white rounded-full flex items-center justify-center backdrop-blur-md">&times;</button>
                                </div>
                              </div>
                            </div>
                          )}
                          <canvas ref={canvasRef} className="hidden" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Or Headshot URL (Optional)</label>
                          <input 
                            type="text" 
                            value={newResidentImage}
                            onChange={(e) => setNewResidentImage(e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div className="md:col-span-2 flex items-end">
                          <button 
                            onClick={handleAddResident}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all shadow-md active:scale-95 text-sm uppercase tracking-widest"
                          >
                            ADD TO PROGRAM PROFILE
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {sortedResidents.length === 0 ? (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl py-12 text-center">
                      <p className="text-slate-500 font-medium">No resident profiles added yet.</p>
                      {isResident && <p className="text-xs text-slate-400 mt-1 italic">Use the button above to add yourself to this program!</p>}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sortedResidents.map((resident) => (
                        <div key={resident.id} className="group bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col relative">
                          {isEditingProfiles && (
                            <button 
                              onClick={() => handleRemoveResident(resident.id)}
                              className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg z-20 hover:bg-red-600 transition-colors"
                              title="Remove profile"
                            >
                              &times;
                            </button>
                          )}
                          <div className="h-48 overflow-hidden bg-slate-200">
                            <img 
                              src={resident.imageUrl || `https://i.pravatar.cc/150?u=${resident.id}`} 
                              alt={resident.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute top-3 left-3">
                              <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                                PGY-{resident.pgyYear}
                              </span>
                            </div>
                          </div>
                          <div className="p-5 flex-grow">
                            <h4 className="text-lg font-bold text-slate-900">{resident.name}</h4>
                            <div className="mt-2 space-y-3">
                              {resident.email && (
                                <div className="flex items-center gap-2">
                                  <svg className="w-3 h-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  <a href={`mailto:${resident.email}`} className="text-xs font-bold text-blue-600 hover:underline">{resident.email}</a>
                                </div>
                              )}
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medical School</p>
                                <p className="text-sm text-slate-700 font-medium">{resident.school}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Interests</p>
                                <p className="text-sm text-slate-600 leading-relaxed italic">"{resident.interests}"</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Videos View */}
          {activeTab === 'videos' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
                PROGRAM VIDEOS
              </h2>
              {program.videos.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl py-12 text-center">
                  <p className="text-slate-500 font-medium">No videos uploaded yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {program.videos.map((v) => (
                    <div key={v.id} className="group cursor-pointer">
                      <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg mb-3">
                        <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-red-600 group-hover:scale-110 transition-all">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                          </div>
                        </div>
                      </div>
                      <h4 className="font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{v.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-wider">Added by {v.author}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgramDetail;
