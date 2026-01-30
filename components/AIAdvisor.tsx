
import React, { useState } from 'react';
import { User } from '../types';
import { getMatchingAdvice } from '../services/geminiService';

interface AIAdvisorProps {
  user: User;
  specialty: string;
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ user, specialty }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    const advice = await getMatchingAdvice(user.branch, specialty, question);
    setResponse(advice);
    setIsLoading(false);
    setQuestion('');
  };

  return (
    <div className="fixed bottom-8 right-8 z-[60]">
      {isOpen ? (
        <div className="w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <span className="font-bold text-sm">GME AI Advisor</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="p-4 h-96 overflow-y-auto bg-slate-50 space-y-4">
            {response ? (
              <div className="space-y-4">
                <div className="bg-blue-600 text-white p-4 rounded-2xl rounded-tr-none ml-4 shadow-md text-sm leading-relaxed">
                  {response}
                </div>
                <button 
                  onClick={() => setResponse(null)}
                  className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest"
                >
                  Ask another question
                </button>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <p className="text-sm text-slate-600 font-medium">Ask me anything about the {user.branch} Match process for {specialty}.</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['What is MODS?', 'Competitive scores?', 'Interview tips'].map(q => (
                    <button 
                      key={q}
                      onClick={() => setQuestion(q)}
                      className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors shadow-sm"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {isLoading && (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <form onSubmit={handleAsk} className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question..."
                className="flex-grow px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button 
                type="submit"
                disabled={isLoading}
                className="bg-slate-900 text-white p-2 rounded-lg hover:bg-slate-800 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-slate-800 hover:scale-110 transition-all border-4 border-white active:scale-95"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
          </span>
        </button>
      )}
    </div>
  );
};

export default AIAdvisor;
