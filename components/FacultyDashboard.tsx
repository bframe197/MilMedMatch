import React, { useState, useRef } from 'react';
import { User, ResidencyProgram, ProgramVideo, ResidentProfile } from '../types';
import { generateProgramCoverImage } from '../services/geminiService';

interface FacultyDashboardProps {
  user: User;
  programs: ResidencyProgram[];
  defaultImage: string;
  onUpdateProgram: (program: ResidencyProgram) => void;
}

const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ user, programs, defaultImage, onUpdateProgram }) => {
  // Only display programs that match BOTH the user's branch AND their assigned specialty
  const myPrograms = programs.filter(p => p.branch === user.branch && p.specialty === user.specialty);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ResidencyProgram | null>(null);
  const [newStrength, setNewStrength] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Resident profile fields
  const [newResidentName, setNewResidentName] = useState('');
  const [newResidentEmail, setNewResidentEmail] = useState('');
  const [newResidentSchool, setNewResidentSchool] = useState('');
  const [newResidentYear, setNewResidentYear] = useState<number>(1);
  const [newResidentInterests, setNewResidentInterests] = useState('');
  const [newResidentImage, setNewResidentImage] = useState('');

  // Camera & File states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startEdit = (program: ResidencyProgram) => {
    setEditingId(program.id);
    setFormData({ ...program });
  };

  const saveEdit = () => {
    if (formData) {
      onUpdateProgram(formData);
      setEditingId(null);
      setFormData(null);
    }
  };

  const handleGenerateImage = async () => {
    if (!formData) return;
    setIsGeneratingImage(true);
    const newImage = await generateProgramCoverImage(formData.name, formData.specialty, formData.location);
    if (newImage) {
      setFormData({ ...formData, imageUrl: newImage });
    }
    setIsGeneratingImage(false);
  };

  const addStrength = () => {
    if (newStrength.trim() && formData) {
      setFormData({
        ...formData,
        strengths: [...formData.strengths, newStrength.trim()]
      });
      setNewStrength('');
    }
  };

  const removeStrength = (index: number) => {
    if (formData) {
      setFormData({
        ...formData,
        strengths: formData.strengths.filter((_, i) => i !== index)
      });
    }
  };

  const addVideo = () => {
    if (newVideoUrl && newVideoTitle && formData) {
      const newVideo: ProgramVideo = {
        id: Math.random().toString(36).substr(2, 9),
        title: newVideoTitle,
        url: newVideoUrl,
        thumbnail: `https://picsum.photos/seed/${newVideoTitle}/400/225`,
        author: user.username
      };
      setFormData({
        ...formData,
        videos: [...formData.videos, newVideo]
      });
      setNewVideoUrl('');
      setNewVideoTitle('');
    }
  };

  const addResident = () => {
    if (newResidentName && newResidentSchool && formData) {
      const newResident: ResidentProfile = {
        id: Math.random().toString(36).substr(2, 9),
        name: newResidentName,
        email: newResidentEmail,
        school: newResidentSchool,
        pgyYear: newResidentYear,
        interests: newResidentInterests,
        imageUrl: newResidentImage || `https://i.pravatar.cc/150?u=${Math.random()}`
      };
      setFormData({
        ...formData,
        residents: [...(formData.residents || []), newResident]
      });
      setNewResidentName('');
      setNewResidentEmail('');
      setNewResidentSchool('');
      setNewResidentYear(1);
      setNewResidentInterests('');
      setNewResidentImage('');
    }
  };

  const removeResident = (residentId: string) => {
    if (formData) {
      setFormData({
        ...formData,
        residents: formData.residents.filter(r => r.id !== residentId)
      });
    }
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

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <span className="w-3 h-10 bg-blue-600 rounded-full"></span>
          Faculty Management Portal
        </h1>
        <p className="text-slate-500 mt-2 italic">Official GME program editing for {user.branch} {user.specialty} faculty members.</p>
      </div>

      {!editingId ? (
        <div className="grid grid-cols-1 gap-6">
          <h2 className="text-xl font-bold text-slate-700 uppercase tracking-widest border-b pb-2">
            {user.specialty} Programs
          </h2>
          {myPrograms.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl py-12 text-center">
              <p className="text-slate-500 font-medium">No programs found for {user.specialty} at this time.</p>
              <p className="text-slate-400 text-sm italic">Please contact your GME office if this is an error.</p>
            </div>
          ) : (
            myPrograms.map(p => (
              <div key={p.id} className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4">
                  <img src={p.imageUrl || defaultImage} alt={p.name} className="w-20 h-20 rounded-xl object-cover shadow-sm" />
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{p.name}</h3>
                    <p className="text-sm font-medium text-slate-500">{p.specialty} • {p.location}</p>
                  </div>
                </div>
                <button 
                  onClick={() => startEdit(p)}
                  className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-lg"
                >
                  EDIT PROGRAM DETAILS
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 px-8 py-6 flex justify-between items-center text-white">
            <h2 className="text-xl font-bold military-font">Editing: {formData?.name}</h2>
            <div className="flex gap-3">
              <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-white font-bold text-sm">CANCEL</button>
              <button onClick={saveEdit} className="bg-yellow-500 text-slate-900 px-6 py-2 rounded-lg font-bold text-sm hover:bg-yellow-400 transition-colors">SAVE CHANGES</button>
            </div>
          </div>

          <div className="p-8 space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Basic Info & Leadership */}
              <div className="space-y-8">
                <section>
                  <h3 className="font-bold text-lg text-slate-900 border-b pb-2 mb-4">Core Information</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Program Cover Image</label>
                        <button 
                          onClick={handleGenerateImage}
                          disabled={isGeneratingImage}
                          className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          {isGeneratingImage ? (
                            <span className="w-3 h-3 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></span>
                          ) : (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                          )}
                          GENERATE WITH AI
                        </button>
                      </div>
                      <input 
                        type="text" 
                        value={formData?.imageUrl}
                        onChange={(e) => setFormData(prev => prev ? {...prev, imageUrl: e.target.value} : null)}
                        placeholder="Paste image URL here..."
                        className="w-full px-4 py-2 bg-slate-50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <div className="mt-2 h-36 w-full overflow-hidden rounded-lg border border-slate-200 shadow-inner bg-slate-100 relative group">
                        <img 
                          src={formData?.imageUrl || defaultImage} 
                          alt="Preview" 
                          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Residents per Class</label>
                        <input 
                          type="number" 
                          value={formData?.residentsPerClass}
                          onChange={(e) => setFormData(prev => prev ? {...prev, residentsPerClass: parseInt(e.target.value)} : null)}
                          className="w-full px-4 py-2 bg-slate-50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Specialty</label>
                        <input 
                          type="text"
                          value={formData?.specialty}
                          readOnly
                          className="w-full px-4 py-2 bg-slate-100 border rounded-lg text-slate-400 outline-none cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Leadership Contacts</h4>
                  <div className="space-y-6">
                    {/* Program Director Editing */}
                    <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-100 shadow-sm">
                      <p className="text-xs font-bold text-blue-600 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        PROGRAM DIRECTOR
                      </p>
                      <input 
                        type="text" 
                        placeholder="Full Name & Rank"
                        value={formData?.programDirector.name}
                        onChange={(e) => setFormData(prev => prev ? {...prev, programDirector: {...prev.programDirector, name: e.target.value}} : null)}
                        className="w-full px-3 py-2 border rounded outline-none bg-white focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="email" 
                          placeholder="Email Address"
                          value={formData?.programDirector.email}
                          onChange={(e) => setFormData(prev => prev ? {...prev, programDirector: {...prev.programDirector, email: e.target.value}} : null)}
                          className="w-full px-3 py-2 border rounded outline-none bg-white focus:ring-2 focus:ring-blue-500"
                        />
                        <input 
                          type="text" 
                          placeholder="Phone Number"
                          value={formData?.programDirector.phone}
                          onChange={(e) => setFormData(prev => prev ? {...prev, programDirector: {...prev.programDirector, phone: e.target.value}} : null)}
                          className="w-full px-3 py-2 border rounded outline-none bg-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Program Secretary Editing */}
                    <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-100 shadow-sm">
                      <p className="text-xs font-bold text-slate-600 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        PROGRAM SECRETARY
                      </p>
                      <input 
                        type="text" 
                        placeholder="Full Name"
                        value={formData?.secretary.name}
                        onChange={(e) => setFormData(prev => prev ? {...prev, secretary: {...prev.secretary, name: e.target.value}} : null)}
                        className="w-full px-3 py-2 border rounded outline-none bg-white focus:ring-2 focus:ring-slate-500"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="email" 
                          placeholder="Email Address"
                          value={formData?.secretary.email}
                          onChange={(e) => setFormData(prev => prev ? {...prev, secretary: {...prev.secretary, email: e.target.value}} : null)}
                          className="w-full px-3 py-2 border rounded outline-none bg-white focus:ring-2 focus:ring-slate-500"
                        />
                        <input 
                          type="text" 
                          placeholder="Phone Number"
                          value={formData?.secretary.phone}
                          onChange={(e) => setFormData(prev => prev ? {...prev, secretary: {...prev.secretary, phone: e.target.value}} : null)}
                          className="w-full px-3 py-2 border rounded outline-none bg-white focus:ring-2 focus:ring-slate-500"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Program Strengths</h4>
                  <div className="flex gap-2 mb-4">
                    <input 
                      type="text" 
                      value={newStrength}
                      onChange={(e) => setNewStrength(e.target.value)}
                      placeholder="Add a new strength..."
                      className="flex-grow px-4 py-2 border rounded-lg outline-none"
                    />
                    <button onClick={addStrength} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold">ADD</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData?.strengths.map((s, i) => (
                      <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                        {s}
                        <button onClick={() => removeStrength(i)} className="hover:text-red-600 text-lg leading-none">×</button>
                      </span>
                    ))}
                  </div>
                </section>
              </div>

              {/* Video Management */}
              <div className="space-y-8">
                <section>
                  <h3 className="font-bold text-lg text-slate-900 border-b pb-2 mb-4">Information Videos</h3>
                  <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-200 mb-6">
                    <p className="text-sm font-bold text-slate-600 mb-4">UPLOAD NEW CONTENT</p>
                    <div className="space-y-3">
                      <input 
                        type="text" 
                        placeholder="Video Title (e.g., Surgery Suite Tour)"
                        value={newVideoTitle}
                        onChange={(e) => setNewVideoTitle(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg outline-none bg-white"
                      />
                      <input 
                        type="text" 
                        placeholder="Video URL (YouTube/Vimeo)"
                        value={newVideoUrl}
                        onChange={(e) => setNewVideoUrl(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg outline-none bg-white"
                      />
                      <button 
                        onClick={addVideo}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md"
                      >
                        ADD VIDEO TO PROGRAM
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Videos ({formData?.videos.length})</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {formData?.videos.map((v) => (
                        <div key={v.id} className="bg-white border p-3 rounded-xl flex items-center gap-3 shadow-sm">
                          <img src={v.thumbnail} className="w-16 h-10 object-cover rounded shadow-sm" />
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-slate-900 truncate">{v.title}</p>
                            <button 
                              onClick={() => setFormData(prev => prev ? {...prev, videos: prev.videos.filter(vid => vid.id !== v.id)} : null)}
                              className="text-[10px] text-red-500 font-bold uppercase hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Resident Profile Management */}
            <section className="pt-12 border-t">
              <h3 className="font-bold text-xl text-slate-900 military-font mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-green-600 rounded-full"></span>
                Resident Profile Management
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form to add a new resident */}
                <div className="p-6 bg-slate-50 border-2 border-slate-200 rounded-2xl shadow-sm space-y-4">
                  <p className="text-sm font-bold text-slate-700 border-b pb-2 uppercase tracking-wider">Add New Resident</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name & Rank</label>
                      <input 
                        type="text" 
                        value={newResidentName}
                        onChange={(e) => setNewResidentName(e.target.value)}
                        placeholder="e.g. CPT Jane Doe"
                        className="w-full px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email Address</label>
                      <input 
                        type="email" 
                        value={newResidentEmail}
                        onChange={(e) => setNewResidentEmail(e.target.value)}
                        placeholder="e.g. jane.doe@health.mil"
                        className="w-full px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Medical School</label>
                        <input 
                          type="text" 
                          value={newResidentSchool}
                          onChange={(e) => setNewResidentSchool(e.target.value)}
                          placeholder="e.g. USUHS"
                          className="w-full px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">PGY Year</label>
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
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Interests</label>
                      <textarea 
                        value={newResidentInterests}
                        onChange={(e) => setNewResidentInterests(e.target.value)}
                        placeholder="e.g. Critical Care, Research, Snowboarding"
                        className="w-full px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-green-500"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Profile Headshot</label>
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
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-lg text-[10px] font-bold transition-all uppercase tracking-widest"
                          >
                            Album
                          </button>
                          <button 
                            type="button" 
                            onClick={startCamera}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-[10px] font-bold transition-all uppercase tracking-widest flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            Camera
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
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Or Headshot Image URL (Optional)</label>
                      <input 
                        type="text" 
                        value={newResidentImage}
                        onChange={(e) => setNewResidentImage(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 border rounded-lg bg-white outline-none"
                      />
                    </div>
                    <button 
                      onClick={addResident}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md text-sm uppercase tracking-widest"
                    >
                      ADD RESIDENT PROFILE
                    </button>
                  </div>
                </div>

                {/* List of existing residents */}
                <div className="lg:col-span-2 space-y-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Residents ({formData?.residents?.length || 0})</p>
                  {(!formData?.residents || formData.residents.length === 0) ? (
                    <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                      <p className="text-slate-400 italic">No resident profiles have been created yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {formData.residents.map((r) => (
                        <div key={r.id} className="bg-white border rounded-2xl p-4 shadow-sm flex items-start gap-4 hover:border-green-200 transition-colors">
                          <img src={r.imageUrl} className="w-16 h-16 rounded-full object-cover bg-slate-100" />
                          <div className="flex-grow overflow-hidden">
                            <div className="flex justify-between items-start">
                              <p className="font-bold text-slate-900 truncate">{r.name}</p>
                              <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded font-bold">PGY-{r.pgyYear}</span>
                            </div>
                            <p className="text-xs text-slate-500 mb-1">{r.school}</p>
                            {r.email && <p className="text-xs text-blue-600 font-bold mb-1 truncate">{r.email}</p>}
                            <button 
                              onClick={() => removeResident(r.id)}
                              className="text-[10px] text-red-500 font-bold uppercase hover:underline"
                            >
                              Remove Profile
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;