import React, { useState } from 'react';
import { User, Branch, Role } from '../types';

interface LoginProps {
  onLogin: (credentials: {username: string, password: string}) => boolean;
  onGoToSignup: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onGoToSignup }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const success = onLogin({ username, password });
    
    if (!success) {
      setError("user does not exist, request account access below");
      setUsername('');
      setPassword('');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat px-4 relative"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?auto=format&fit=crop&q=80&w=1200')" }}
    >
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in duration-300">
        <div className="header-blue p-12 text-center border-b-4 border-slate-700/30 flex flex-col items-center relative overflow-visible">
          
          <h1 className="military-font text-8xl font-bold text-white leading-none tracking-tighter inline-block drop-shadow-lg">
            MMM
          </h1>
          
          <p className="text-white/80 mt-2 text-sm font-bold tracking-[0.4em] uppercase">
            MILMEDMATCH
          </p>
          
          <div className="w-12 h-1 bg-white/20 mt-6 rounded-full"></div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm animate-pulse">
              {error}
            </div>
          )}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Username / Email</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all bg-slate-50"
              placeholder="Enter credentials"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all bg-slate-50"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-lg transition-all shadow-lg active:transform active:scale-95 text-xs uppercase tracking-[0.2em]"
          >
            Access Portal
          </button>
          <div className="text-center pt-2">
            <button 
              type="button"
              onClick={onGoToSignup}
              className="text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase tracking-widest"
            >
              Don't have an account? <span className="text-blue-600 underline">Request access</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;