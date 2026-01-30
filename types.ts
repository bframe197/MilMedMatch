export enum Branch {
  ARMY = 'Army',
  NAVY = 'Navy',
  AIR_FORCE = 'Air Force',
  UNDECIDED = 'Undecided'
}

export enum Role {
  MEDICAL_STUDENT = 'Medical Student',
  RESIDENT = 'Resident',
  FACULTY = 'Faculty',
  ADMINISTRATOR = 'Administrator',
  PRE_MED = 'Pre-med',
  RECRUITER = 'Recruiter'
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  read: boolean;
}

export interface MatchDeadline {
  id: string;
  event: string;
  date: string;
  description: string;
}

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  branch: Branch;
  role: Role;
  specialty?: string;
  facultyCode?: string;
  adminCode?: string;
  authCode?: string;
  profileImageUrl?: string;
  medicalSchool?: string;
  residencyProgram?: string;
  undergradSchool?: string;
  city?: string;
  state?: string;
  notifications: Notification[];
}

export interface ADTRequest {
  id: string;
  userId: string;
  userName: string;
  status: 'pending' | 'approved' | 'denied';
  denialReason?: string;
  timestamp: number;
  // Fields from document
  fullName: string;
  ssnLast4: string;
  facilityName: string;
  remainingAdtDays: string;
  advancePayment: 'Yes' | 'No';
  email: string;
  married: 'Yes' | 'No';
  dependents: 'Yes' | 'No';
  dependentNames: string;
  startDate: string;
  endDate: string;
  travelMode: 'Drive' | 'Fly' | 'Local';
  rentalCar: 'Yes' | 'No';
  phone: string;
  altPhone: string;
  homeOfRecord: string;
  currentAddress: string;
  signature: string;
  date: string;
}

export interface ProgramContact {
  name: string;
  email: string;
  phone: string;
}

export interface ProgramVideo {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  author: string;
}

export interface ResidentProfile {
  id: string;
  name: string;
  school: string;
  interests: string;
  imageUrl: string;
  pgyYear: number;
  email?: string;
}

export interface ResidencyProgram {
  id: string;
  name: string;
  branch: Branch;
  specialty: string;
  location: string;
  programDirector: ProgramContact;
  specialty_code?: string;
  secretary: ProgramContact;
  residentsPerClass: number;
  strengths: string[];
  videos: ProgramVideo[];
  residents: ResidentProfile[];
  imageUrl: string;
}

export type AppView = 'login' | 'signup' | 'home' | 'program-list' | 'program-detail' | 'faculty-dashboard' | 'admin-dashboard' | 'recruiter-dashboard';

export type InfoTab = 'timeline' | 'adt' | 'bah' | 'scholarship' | 'salary' | 'settings' | 'recruiters' | null;