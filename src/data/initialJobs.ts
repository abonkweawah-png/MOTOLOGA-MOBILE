import { Job } from '../types';
import { createDiagnosticSampleAudio } from '../utils/audioUtils';

export const MECHANICS_LIST = ['Jean', 'Paul', 'Michel', 'Ibrahim', 'Unassigned'];

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-101',
    licensePlate: 'LT 8492 C',
    customerPhone: '+237 677 82 14 09',
    vehicleModel: 'Toyota Hilux D-4D (2014)',
    mechanicAssigned: 'Paul',
    status: 'In Repair',
    createdAt: Date.now() - 1000 * 60 * 102, // 1h 42m ago
    timeElapsedMinutes: 102,
    dashboardPhotoUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=500&auto=format&fit=crop&q=60',
    exteriorPhotoUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&auto=format&fit=crop&q=60',
    oldPartPhotoUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=500&auto=format&fit=crop&q=60',
    newPartPhotoUrl: '',
    partSource: 'Garage Stock',
    laborFeeFcfa: 15000,
    issueDescription: 'Clutch plate slipping & rear brake shoe worn out. Douala highway test.',
    voiceNoteUrl: createDiagnosticSampleAudio(),
    voiceNoteDurationSeconds: 3,
    deferredRepair: {
      flagged: true,
      component: 'Shock Absorbers / Amortisseurs',
      timeframe: 'Next Month'
    },
    released: false
  },
  {
    id: 'job-102',
    licensePlate: 'CE 5931 K',
    customerPhone: '+237 699 15 48 32',
    vehicleModel: 'Toyota Corolla E120',
    mechanicAssigned: 'Jean',
    status: 'Ready/Released',
    createdAt: Date.now() - 1000 * 60 * 195, // 3h 15m ago
    timeElapsedMinutes: 195,
    dashboardPhotoUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=60',
    exteriorPhotoUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500&auto=format&fit=crop&q=60',
    oldPartPhotoUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=500&auto=format&fit=crop&q=60',
    newPartPhotoUrl: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=500&auto=format&fit=crop&q=60',
    partSource: 'Customer-Supplied Part',
    laborFeeFcfa: 25000,
    issueDescription: 'Alternator replacement & serpentine belt tensioning.',
    deferredRepair: {
      flagged: false,
      component: 'Brake Pads / Plaquettes de frein',
      timeframe: 'Next Week'
    },
    released: false
  },
  {
    id: 'job-103',
    licensePlate: 'OU 2104 M',
    customerPhone: '+237 651 33 90 12',
    vehicleModel: 'Mercedes 190D W201',
    mechanicAssigned: 'Michel',
    status: 'Diagnosis',
    createdAt: Date.now() - 1000 * 60 * 45, // 45m ago
    timeElapsedMinutes: 45,
    dashboardPhotoUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=500&auto=format&fit=crop&q=60',
    exteriorPhotoUrl: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=500&auto=format&fit=crop&q=60',
    oldPartPhotoUrl: '',
    newPartPhotoUrl: '',
    partSource: 'Garage Stock',
    laborFeeFcfa: 5000,
    issueDescription: 'Hard starting in morning, glow plugs inspection required.',
    deferredRepair: {
      flagged: false,
      component: 'Fuel Filter / Filtre à gazole',
      timeframe: 'Next Week'
    },
    released: false
  },
  {
    id: 'job-104',
    licensePlate: 'LT 3188 F',
    customerPhone: '+237 675 20 89 44',
    vehicleModel: 'Nissan Patrol Y61',
    mechanicAssigned: 'Ibrahim',
    status: 'Awaiting Approval',
    createdAt: Date.now() - 1000 * 60 * 260, // 4h 20m ago
    timeElapsedMinutes: 260,
    dashboardPhotoUrl: '',
    exteriorPhotoUrl: '',
    oldPartPhotoUrl: '',
    newPartPhotoUrl: '',
    partSource: 'Garage Stock',
    laborFeeFcfa: 35000,
    issueDescription: 'Front steering rack play. Waiting for customer WhatsApp approval for bush replacement.',
    deferredRepair: {
      flagged: true,
      component: 'Front Ball Joints / Rotules',
      timeframe: 'Next Week'
    },
    released: false
  }
];

export const CAMEROON_REGIONS = [
  { code: 'LT', region: 'Littoral (Douala)' },
  { code: 'CE', region: 'Centre (Yaoundé)' },
  { code: 'OU', region: 'Ouest (Bafoussam)' },
  { code: 'NW', region: 'North West (Bamenda)' },
  { code: 'SW', region: 'South West (Buea)' },
  { code: 'AD', region: 'Adamaoua (Ngaoundéré)' },
  { code: 'NO', region: 'Nord (Garoua)' },
  { code: 'EN', region: 'Extrême-Nord (Maroua)' },
];

export const DEFERRED_COMPONENTS = [
  'Brake Pads / Plaquettes de frein',
  'Timing Belt / Courroie de distribution',
  'Shock Absorbers / Amortisseurs',
  'Clutch Disc / Disque d\'embrayage',
  'Oil & Filter / Vidange & Filtre',
  'Front Ball Joints / Rotules de suspension',
  'Alternator Belt / Courroie d\'alternateur',
  'Battery Replacement / Batterie',
  'Tires Replacement / Pneumatiques'
];

export const STORAGE_KEY = 'motologa_jobs_v1';
export const REVENUE_STORAGE_KEY = 'motologa_daily_revenue_fcfa';

export function loadJobs(): Job[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load jobs from localStorage', e);
  }
  return INITIAL_JOBS;
}

export function saveJobs(jobs: Job[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  } catch (e) {
    console.error('Failed to save jobs to localStorage', e);
  }
}
