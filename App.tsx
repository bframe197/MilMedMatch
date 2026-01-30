import React, { useState, useEffect } from 'react';
import { User, Branch, Role, ResidencyProgram, AppView, ADTRequest, Notification, MatchDeadline } from './types';
import { MOCK_PROGRAMS, INITIAL_DEFAULT_IMAGE, SPECIALTIES } from './constants';
import Login from './components/Login';
import Signup from './components/Signup';
import Navbar from './components/Navbar';
import StudentDashboard from './components/StudentDashboard';
import ProgramList from './components/ProgramList';
import ProgramDetail from './components/ProgramDetail';
import FacultyDashboard from './components/FacultyDashboard';
import AdminDashboard from './components/AdminDashboard';
import RecruiterDashboard from './components/RecruiterDashboard';
import AIAdvisor from './components/AIAdvisor';

const INITIAL_DEADLINES: MatchDeadline[] = [
  { id: '1', event: 'MODS Applications Open', date: '2026-07-01', description: 'GME application system (MODS) opens for new cycles.' },
  { id: '2', event: 'Personal Statements Due', date: '2026-08-31', description: 'Internal recommendation for final draft submission.' },
  { id: '3', event: 'Official GME Application Deadline', date: '2026-10-15', description: 'Final date to submit all materials in MODS.' },
  { id: '4', event: 'Joint GME Selection Board', date: '2026-11-15', description: 'Military selection boards convene to review candidates.' },
  { id: '5', event: 'Military Match Results Released', date: '2026-12-18', description: 'Match results are distributed to all services.' },
];

const App: React.FC = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adtRequests, setAdtRequests] = useState<ADTRequest[]>([]);
  const [matchDeadlines, setMatchDeadlines] = useState<MatchDeadline[]>(INITIAL_DEADLINES);
  const [view, setView] = useState<AppView>('login');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<ResidencyProgram | null>(null);
  const [programs, setPrograms] = useState<ResidencyProgram[]>(MOCK_PROGRAMS);
  const [defaultImage, setDefaultImage] = useState<string>(INITIAL_DEFAULT_IMAGE);
  const [viewBranch, setViewBranch] = useState<Branch>(Branch.ARMY);

  const handleLogin = (credentials: {username: string, password: string}): boolean => {
    const existing = allUsers.find(u => u.username === credentials.username && u.password === credentials.password);
    if (existing) {
      setCurrentUser(existing);
      // Default dashboard view to Army if the user is Undecided
      setViewBranch(existing.branch === Branch.UNDECIDED ? Branch.ARMY : existing.branch);
      if (existing.role === Role.FACULTY) setView('faculty-dashboard');
      else if (existing.role === Role.ADMINISTRATOR) setView('admin-dashboard');
      else if (existing.role === Role.RECRUITER) setView('recruiter-dashboard');
      else setView('home');
      return true;
    }
    return false;
  };

  const handleSignup = (user: User) => {
    const newUser = { ...user, notifications: [] };
    setAllUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    // Default dashboard view to Army if the user is Undecided
    setViewBranch(user.branch === Branch.UNDECIDED ? Branch.ARMY : user.branch);
    if (user.role === Role.FACULTY) setView('faculty-dashboard');
    else if (user.role === Role.ADMINISTRATOR) setView('admin-dashboard');
    else if (user.role === Role.RECRUITER) setView('recruiter-dashboard');
    else setView('home');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
  };

  const handleDeleteUser = (userId: string) => {
    setAllUsers(prev => prev.filter(u => u.id !== userId));
    setCurrentUser(null);
    setView('login');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('login');
    setSelectedSpecialty(null);
    setSelectedProgram(null);
  };

  const handleSubmitAdt = (request: ADTRequest) => {
    setAdtRequests(prev => [...prev, request]);
    
    const adminNotification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      message: `New ADT Request submitted by ${request.userName} (${request.fullName}).`,
      type: 'info',
      timestamp: Date.now(),
      read: false
    };

    setAllUsers(prev => prev.map(u => 
      u.role === Role.ADMINISTRATOR ? { ...u, notifications: [adminNotification, ...u.notifications] } : u
    ));
  };

  const handleReviewAdt = (requestId: string, status: 'approved' | 'denied', reason?: string) => {
    setAdtRequests(prev => prev.map(r => r.id === requestId ? { ...r, status, denialReason: reason } : r));
    
    const request = adtRequests.find(r => r.id === requestId);
    if (request) {
      const studentNotification: Notification = {
        id: Math.random().toString(36).substr(2, 9),
        message: `Your ADT Request for ${request.facilityName} has been ${status}${status === 'denied' ? ': ' + reason : '.'}`,
        type: status === 'approved' ? 'success' : 'error',
        timestamp: Date.now(),
        read: false
      };

      setAllUsers(prev => prev.map(u => 
        u.id === request.userId ? { ...u, notifications: [studentNotification, ...u.notifications] } : u
      ));
    }
  };

  const updateProgram = (updatedProgram: ResidencyProgram) => {
    setPrograms(prev => prev.map(p => p.id === updatedProgram.id ? updatedProgram : p));
    setSelectedProgram(updatedProgram);
  };

  const handleAddProgram = (program: ResidencyProgram) => {
    setPrograms(prev => [program, ...prev]);
  };

  const handleDeleteProgram = (id: string) => {
    setPrograms(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdateDefaultImage = (newImage: string) => {
    setDefaultImage(newImage);
  };

  const handleUpdateDeadlines = (updated: MatchDeadline[]) => {
    setMatchDeadlines(updated);
  };

  const renderContent = () => {
    if (!currentUser) {
      return view === 'login' ? 
        <Login onLogin={handleLogin} onGoToSignup={() => setView('signup')} /> : 
        <Signup onSignup={handleSignup} onGoToLogin={() => setView('login')} />;
    }

    // Force viewBranch to match restricted user branch (if not pre-med/resident)
    const effectiveBranch = (currentUser.role === Role.MEDICAL_STUDENT || currentUser.role === Role.RESIDENT) 
      ? (currentUser.branch === Branch.UNDECIDED ? Branch.ARMY : currentUser.branch)
      : viewBranch;

    switch (view) {
      case 'home':
        return (
          <StudentDashboard 
            user={currentUser} 
            activeBranch={effectiveBranch}
            onBranchChange={setViewBranch}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onSelectSpecialty={(specialty) => {
              setSelectedSpecialty(specialty);
              setView('program-list');
            }} 
            onSubmitAdt={handleSubmitAdt}
            matchDeadlines={matchDeadlines}
          />
        );
      case 'program-list':
        return (
          <ProgramList 
            branch={effectiveBranch} 
            specialty={selectedSpecialty!} 
            programs={programs}
            defaultImage={defaultImage}
            onSelectProgram={(program) => {
              setSelectedProgram(program);
              setView('program-detail');
            }}
            onBack={() => setView('home')}
          />
        );
      case 'program-detail':
        return selectedProgram ? (
          <ProgramDetail 
            program={selectedProgram} 
            user={currentUser}
            defaultImage={defaultImage}
            onBack={() => setView('program-list')}
            onUpdateProgram={updateProgram}
          />
        ) : null;
      case 'faculty-dashboard':
        return (
          <FacultyDashboard 
            user={currentUser} 
            programs={programs}
            defaultImage={defaultImage}
            onUpdateProgram={updateProgram}
          />
        );
      case 'admin-dashboard':
        return (
          <AdminDashboard 
            user={currentUser} 
            users={allUsers}
            adtRequests={adtRequests}
            programs={programs}
            defaultImage={defaultImage}
            onAddProgram={handleAddProgram}
            onDeleteProgram={handleDeleteProgram}
            onUpdateDefaultImage={handleUpdateDefaultImage}
            onReviewAdt={handleReviewAdt}
            matchDeadlines={matchDeadlines}
            onUpdateDeadlines={handleUpdateDeadlines}
          />
        );
      case 'recruiter-dashboard':
        return (
          <RecruiterDashboard 
            user={currentUser} 
            users={allUsers}
          />
        );
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {currentUser && (
        <Navbar 
          user={currentUser} 
          onLogout={handleLogout} 
          onHome={() => {
            if (currentUser.role === Role.FACULTY) setView('faculty-dashboard');
            else if (currentUser.role === Role.ADMINISTRATOR) setView('admin-dashboard');
            else if (currentUser.role === Role.RECRUITER) setView('recruiter-dashboard');
            else setView('home');
          }} 
          onMarkNotificationsRead={() => {
            const updated = { ...currentUser, notifications: currentUser.notifications.map(n => ({ ...n, read: true })) };
            handleUpdateUser(updated);
          }}
        />
      )}
      <main className="flex-grow">
        {renderContent()}
      </main>
      {currentUser && currentUser.role !== Role.FACULTY && currentUser.role !== Role.ADMINISTRATOR && currentUser.role !== Role.RECRUITER && (
        <AIAdvisor user={currentUser} specialty={selectedSpecialty || 'General'} />
      )}
      <footer className="bg-slate-900 text-white py-6 text-center text-sm border-t border-slate-800">
        <p className="opacity-75">© 2026 MMM - MILMEDMATCH GME Hub</p>
      </footer>
    </div>
  );
};

export default App;