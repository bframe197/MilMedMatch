import { Branch, ResidencyProgram } from './types';

export const SPECIALTIES = [
  'Anesthesiology',
  'Child Neurology',
  'Emergency Medicine',
  'Family Medicine',
  'General Surgery',
  'GS Urology',
  'Internal Medicine',
  'Internal Medicine/Psychiatry',
  'Neurology',
  'Neurosurgery',
  'OB-GYN',
  'Orthopaedics',
  'Otolaryngology',
  'Pathology',
  'Pediatrics',
  'Plastic Surgery',
  'Prelim Aerospace Medicine',
  'Prelim Dermatology',
  'Prelim Interventional Radiology',
  'Prelim Occupational Medicine',
  'Prelim Ophthalmology',
  'Prelim Physical Medicine',
  'Prelim Preventive Medicine',
  'Prelim Radiation Oncology',
  'Prelim Radiology(DIAG)',
  'Psychiatry',
  'Transitional',
  'Vascular Surgery'
];

export const FACULTY_SECRET_CODE = '12345678912';
export const ADMIN_SECRET_CODE = '98765432198';
export const MED_STUDENT_SECRET_CODE = '11111111111';
export const RESIDENT_SECRET_CODE = '22222222222';
export const RECRUITER_SECRET_CODE = '33333333333';

// Initial placeholder for the default image
export const INITIAL_DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1508674861872-a51e06c50c9b?auto=format&fit=crop&q=80&w=1200';

// Helper to create mock contacts
export const createContact = (role: string, loc: string) => ({
  name: `COL ${role} Director`,
  email: `${role.toLowerCase().replace(' ', '.')}.${loc.toLowerCase()}@health.mil`,
  phone: '(555) 555-0199'
});

// A helper to generate IDs for the expanded mock data
const generateId = (loc: string, spec: string) => `${loc.toLowerCase()}-${spec.toLowerCase().replace(/\s+/g, '-')}`;

const basePrograms: Partial<ResidencyProgram>[] = [
  // SAUSHEC (San Antonio Uniformed Services Health Education Consortium)
  { name: 'SAUSHEC', branch: Branch.ARMY, location: 'San Antonio, TX', specialty: 'Anesthesiology', residentsPerClass: 12 },
  { name: 'SAUSHEC', branch: Branch.ARMY, location: 'San Antonio, TX', specialty: 'Emergency Medicine', residentsPerClass: 14 },
  { name: 'SAUSHEC', branch: Branch.ARMY, location: 'San Antonio, TX', specialty: 'General Surgery', residentsPerClass: 10 },
  { name: 'SAUSHEC', branch: Branch.ARMY, location: 'San Antonio, TX', specialty: 'Internal Medicine', residentsPerClass: 25 },
  { name: 'SAUSHEC', branch: Branch.ARMY, location: 'San Antonio, TX', specialty: 'OB-GYN', residentsPerClass: 8 },
  { name: 'SAUSHEC', branch: Branch.ARMY, location: 'San Antonio, TX', specialty: 'Orthopaedics', residentsPerClass: 8 },
  { name: 'SAUSHEC', branch: Branch.ARMY, location: 'San Antonio, TX', specialty: 'Psychiatry', residentsPerClass: 10 },
  { name: 'SAUSHEC', branch: Branch.ARMY, location: 'San Antonio, TX', specialty: 'Transitional', residentsPerClass: 15 },

  // NCC WRNMMC (Walter Reed)
  { name: 'NCC WRNMMC', branch: Branch.ARMY, location: 'Bethesda, MD', specialty: 'Anesthesiology', residentsPerClass: 10 },
  { name: 'NCC WRNMMC', branch: Branch.ARMY, location: 'Bethesda, MD', specialty: 'Emergency Medicine', residentsPerClass: 12 },
  { name: 'NCC WRNMMC', branch: Branch.ARMY, location: 'Bethesda, MD', specialty: 'Internal Medicine', residentsPerClass: 22 },
  { name: 'NCC WRNMMC', branch: Branch.ARMY, location: 'Bethesda, MD', specialty: 'General Surgery', residentsPerClass: 8 },
  { name: 'NCC WRNMMC', branch: Branch.ARMY, location: 'Bethesda, MD', specialty: 'Pathology', residentsPerClass: 4 },
  { name: 'NCC WRNMMC', branch: Branch.ARMY, location: 'Bethesda, MD', specialty: 'Pediatrics', residentsPerClass: 12 },

  // MAMC (Madigan)
  { name: 'Madigan Army Medical Center', branch: Branch.ARMY, location: 'JBLM, WA', specialty: 'Emergency Medicine', residentsPerClass: 12 },
  { name: 'Madigan Army Medical Center', branch: Branch.ARMY, location: 'JBLM, WA', specialty: 'Family Medicine', residentsPerClass: 10 },
  { name: 'Madigan Army Medical Center', branch: Branch.ARMY, location: 'JBLM, WA', specialty: 'Child Neurology', residentsPerClass: 2 },
  { name: 'Madigan Army Medical Center', branch: Branch.ARMY, location: 'JBLM, WA', specialty: 'Vascular Surgery', residentsPerClass: 2 },

  // EAMC (Eisenhower)
  { name: 'Eisenhower Army Medical Center', branch: Branch.ARMY, location: 'Fort Eisenhower, GA', specialty: 'Family Medicine', residentsPerClass: 8 },
  { name: 'Eisenhower Army Medical Center', branch: Branch.ARMY, location: 'Fort Eisenhower, GA', specialty: 'Internal Medicine', residentsPerClass: 12 },

  // TAMC (Tripler)
  { name: 'Tripler Army Medical Center', branch: Branch.ARMY, location: 'Honolulu, HI', specialty: 'GS Urology', residentsPerClass: 2 },
  { name: 'Tripler Army Medical Center', branch: Branch.ARMY, location: 'Honolulu, HI', specialty: 'Psychiatry', residentsPerClass: 6 },

  // WBAMC (Beaumont)
  { name: 'William Beaumont Army Medical Center', branch: Branch.ARMY, location: 'El Paso, TX', specialty: 'Orthopaedics', residentsPerClass: 6 },
  { name: 'William Beaumont Army Medical Center', branch: Branch.ARMY, location: 'El Paso, TX', specialty: 'Transitional', residentsPerClass: 8 },

  // WAMC (Womack)
  { name: 'Womack Army Medical Center', branch: Branch.ARMY, location: 'Fort Liberty, NC', specialty: 'Emergency Medicine', residentsPerClass: 8 },
  { name: 'Womack Army Medical Center', branch: Branch.ARMY, location: 'Fort Liberty, NC', specialty: 'Pediatrics', residentsPerClass: 6 },

  // CRDAMC (Darnall)
  { name: 'Carl R. Darnall Army Medical Center', branch: Branch.ARMY, location: 'Fort Cavazos, TX', specialty: 'Emergency Medicine', residentsPerClass: 8 },
  { name: 'Carl R. Darnall Army Medical Center', branch: Branch.ARMY, location: 'Fort Cavazos, TX', specialty: 'Family Medicine', residentsPerClass: 10 },

  // MACH (Martin)
  { name: 'Martin Army Community Hospital', branch: Branch.ARMY, location: 'Fort Moore, GA', specialty: 'Family Medicine', residentsPerClass: 10 }
];

export const MOCK_PROGRAMS: ResidencyProgram[] = basePrograms.map(p => ({
  id: generateId(p.name!, p.specialty!),
  name: p.name!,
  branch: p.branch!,
  specialty: p.specialty!,
  location: p.location!,
  residentsPerClass: p.residentsPerClass!,
  programDirector: createContact(p.specialty!, p.name!),
  secretary: createContact('Admin', p.name!),
  strengths: ['Academic Excellence', 'Clinical Volume', 'Military Integration'],
  videos: [],
  residents: [],
  imageUrl: '' // Will be updated by default logic or admin
}));