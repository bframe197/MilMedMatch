import React, { useState, useEffect } from 'react';
import { User, Branch, Role } from '../types';
import { SPECIALTIES } from '../constants';
import { getMonthlyAccessCode, PORTAL_CREDENTIALS } from '../utils/codeGenerator';

interface SignupProps {
  onSignup: (user: User) => void;
  onGoToLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSignup, onGoToLogin }) => {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [branch, setBranch] = useState<Branch>(Branch.ARMY);
  const [role, setRole] = useState<Role>(Role.MEDICAL_STUDENT);
  const [specialty, setSpecialty] = useState<string>(SPECIALTIES[0]);
  const [authCode, setAuthCode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [error, setError] = useState('');

  // Portal State
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [portalUsername, setPortalUsername] = useState('');
  const [portalAccessCode, setPortalAccessCode] = useState('');
  const [isPortalLoggedIn, setIsPortalLoggedIn] = useState(false);
  const [portalError, setPortalError] = useState('');

  // When role changes to PRE_MED, default branch to UNDECIDED.
  useEffect(() => {
    if (role === Role.PRE_MED) {
      setBranch(Branch.UNDECIDED);
    } else if (branch === Branch.UNDECIDED) {
      setBranch(Branch.ARMY);
    }
  }, [role]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Password validation: at least 5 characters, one number, and one special character (!@#$%&*)
    const passwordRegex = /^(?=.*\d)(?=.*[!@#$%&*]).{5,}$/;
    if (!passwordRegex.test(password)) {
      setError("Password must be at least 5 characters long and include at least one number and one special character (! @ # $ % & *).");
      return;
    }

    // Dynamic Monthly Validation for authorization codes
    if (role !== Role.PRE_MED) {
      const requiredCode = getMonthlyAccessCode(role);
      if (authCode !== requiredCode) {
        setError(`Invalid ${role.toLowerCase()} authorization code for the current period.`);
        return;
      }
    }

    onSignup({
      id: Math.random().toString(36).substr(2, 9),
      username,
      firstName,
      lastName,
      email,
      password,
      branch,
      role,
      specialty: (role === Role.FACULTY || role === Role.RESIDENT) ? specialty : undefined,
      authCode: (role !== Role.PRE_MED) ? authCode : undefined,
      city: role === Role.PRE_MED ? city : undefined,
      state: role === Role.PRE_MED ? state : undefined,
      notifications: []
    });
  };

  const handlePortalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setPortalError('');
    if (portalUsername === PORTAL_CREDENTIALS.username && portalAccessCode === PORTAL_CREDENTIALS.accessCode) {
      setIsPortalLoggedIn(true);
    } else {
      setPortalError('Invalid administration credentials.');
    }
  };

  const showSpecialtySelection = role === Role.FACULTY || role === Role.RESIDENT;
  const isPreMed = role === Role.PRE_MED;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12 relative">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl overflow-hidden relative">
        <div className="bg-slate-900 p-8 text-center border-b-4 border-blue-500">
          <h1 className="military-font text-3xl text-white font-bold">New Account Registration</h1>
          <p className="text-slate-400 mt-2">Professional Medical GME Portal</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm animate-pulse">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">First Name</label>
              <input 
                type="text" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none"
                placeholder="John"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Last Name</label>
              <input 
                type="text" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none"
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none"
              placeholder="example@health.mil"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none"
                placeholder="e.g. FutureDoc29"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none"
                placeholder="••••••••"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                Min. 5 chars, include a number and special char (!@#$%&*)
              </p>
            </div>
          </div>

          <div className={`grid grid-cols-2 gap-4`}>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                {role === Role.PRE_MED ? 'Branch of Interest' : 'Service Branch'}
              </label>
              <select 
                value={branch}
                onChange={(e) => setBranch(e.target.value as Branch)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none"
              >
                {Object.values(Branch)
                  .filter(b => b !== Branch.UNDECIDED || role === Role.PRE_MED)
                  .map(b => (
                    <option key={b} value={b}>
                      {b === Branch.UNDECIDED ? 'Undecided / Exploring' : b}
                    </option>
                  ))
                }
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Primary Role</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none"
              >
                {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {isPreMed && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in slide-in-from-top-2 duration-300 space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Location (Optional)</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Current City</label>
                  <input 
                    type="text" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none text-sm"
                    placeholder="e.g. San Antonio"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Current State</label>
                  <input 
                    type="text" 
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none text-sm"
                    placeholder="e.g. TX"
                  />
                </div>
              </div>
            </div>
          )}

          {showSpecialtySelection && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
              <div>
                <label className="block text-sm font-bold text-blue-600 uppercase tracking-wide">
                  {role === Role.RESIDENT ? 'Select Your Specialty / Transition Year' : 'Your Specialty'}
                </label>
                <select 
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-blue-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          )}

          {role !== Role.PRE_MED && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-bold text-blue-600 uppercase tracking-wide">Authorization Code</label>
              <input 
                type="text" 
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-2 border-blue-100 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-blue-300"
                placeholder={`Enter 11-digit code for ${role}`}
                required
              />
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition-colors shadow-lg mt-4"
          >
            INITIALIZE ACCOUNT
          </button>
          <div className="text-center">
            <button 
              type="button"
              onClick={onGoToLogin}
              className="text-slate-600 hover:text-slate-900 text-sm font-medium"
            >
              Already registered? <span className="text-blue-600 underline">Login here</span>
            </button>
          </div>
        </form>

        {/* Secret Portal Trigger */}
        <div 
          onClick={() => {
            setIsPortalOpen(true);
            setIsPortalLoggedIn(false);
            setPortalError('');
          }}
          className="absolute bottom-2 right-2 w-2 h-2 bg-green-500 rounded-full cursor-pointer opacity-30 hover:opacity-100 transition-opacity"
          title="Admin Access"
        ></div>

        {/* Portal Overlay */}
        {isPortalOpen && (
          <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
            <button 
              onClick={() => setIsPortalOpen(false)}
              className="absolute top-4 right-4 text-white text-2xl hover:text-slate-400"
            >
              &times;
            </button>

            {!isPortalLoggedIn ? (
              <div className="w-full max-w-sm space-y-8 animate-in zoom-in-95 duration-200">
                <div className="text-center">
                  <h2 className="military-font text-2xl text-white font-bold mb-2">Login for updated access codes</h2>
                  <p className="text-slate-400 text-xs uppercase tracking-widest">Restricted Personnel Only</p>
                </div>
                <form onSubmit={handlePortalLogin} className="space-y-4">
                  {portalError && <p className="text-red-500 text-xs text-center font-bold bg-red-500/10 py-2 rounded">{portalError}</p>}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Username</label>
                    <input 
                      type="text" 
                      value={portalUsername}
                      onChange={(e) => setPortalUsername(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">11-Digit Access Code</label>
                    <input 
                      type="password" 
                      value={portalAccessCode}
                      onChange={(e) => setPortalAccessCode(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95"
                  >
                    VERIFY ACCESS
                  </button>
                </form>
              </div>
            ) : (
              <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="text-center">
                  <h2 className="military-font text-2xl text-white font-bold mb-2">Current Cycle Access Codes</h2>
                  <p className="text-slate-400 text-xs uppercase tracking-widest">Valid for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                </div>
                
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
                  <div className="grid grid-cols-1 divide-y divide-slate-700">
                    {[Role.MEDICAL_STUDENT, Role.RESIDENT, Role.FACULTY, Role.ADMINISTRATOR, Role.RECRUITER].map(r => (
                      <div key={r} className="p-4 flex items-center justify-between group hover:bg-slate-700/50 transition-colors">
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{r}</p>
                          <p className="font-mono text-xl text-blue-400 font-bold tracking-widest">{getMonthlyAccessCode(r)}</p>
                        </div>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(getMonthlyAccessCode(r));
                            alert(`Copied ${r} code to clipboard`);
                          }}
                          className="text-[10px] font-bold text-white bg-slate-600 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          COPY
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-slate-500 text-[10px] italic">Codes update automatically on the 1st of every month.</p>
                  <button 
                    onClick={() => setIsPortalOpen(false)}
                    className="mt-6 text-slate-400 hover:text-white text-sm font-bold underline"
                  >
                    Return to Registration
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;