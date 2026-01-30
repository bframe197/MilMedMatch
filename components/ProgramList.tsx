
import React from 'react';
import { Branch, ResidencyProgram } from '../types';

interface ProgramListProps {
  branch: Branch;
  specialty: string;
  programs: ResidencyProgram[];
  defaultImage: string;
  onSelectProgram: (program: ResidencyProgram) => void;
  onBack: () => void;
}

const ProgramList: React.FC<ProgramListProps> = ({ branch, specialty, programs, defaultImage, onSelectProgram, onBack }) => {
  const filteredPrograms = programs.filter(p => p.branch === branch && p.specialty === specialty);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        BACK TO SPECIALTIES
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{specialty} Programs</h1>
          <p className="text-slate-500 mt-1">Available training sites for the {branch}</p>
        </div>
        <div className="bg-slate-100 px-4 py-2 rounded-full text-sm font-bold text-slate-600">
          {filteredPrograms.length} PROGRAMS FOUND
        </div>
      </div>

      {filteredPrograms.length === 0 ? (
        <div className="text-center py-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <p className="text-slate-500 text-lg">No programs found for this combination.</p>
          <p className="text-slate-400 text-sm mt-2">Try selecting a different specialty or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPrograms.map((program) => (
            <div 
              key={program.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-slate-200 flex flex-col cursor-pointer"
              onClick={() => onSelectProgram(program)}
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={program.imageUrl || defaultImage} 
                  alt={program.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  {program.location}
                </div>
              </div>
              <div className="p-6 flex-grow">
                <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">{program.name}</h3>
                <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    {program.residentsPerClass} per class
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Key Strengths</p>
                  <div className="flex flex-wrap gap-1.5">
                    {program.strengths.slice(0, 3).map((s, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase font-bold">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-center">
                <span className="text-sm font-bold text-slate-900 group-hover:underline">VIEW FULL DETAILS</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgramList;
