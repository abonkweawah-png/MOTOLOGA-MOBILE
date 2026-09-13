import { WorkerProfile } from '../types';

export const WORKERS_STORAGE_KEY = 'motologa_workers_v1';

export const INITIAL_WORKERS: WorkerProfile[] = [
  {
    id: 'worker-paul',
    name: 'Paul Nguema',
    role: 'Lead Master Mechanic',
    specialty: 'Toyota D-4D, Diesel Injection & Engines',
    phone: '+237 677 82 14 09',
    description: '12+ years experience in heavy diesel diagnostics, common rail tuning, and engine overhauls across Douala.',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus&clothing=overall&clothingColor=262e33&accessories=round&backgroundColor=c0aede',
    isVerified: true,
    status: 'active',
    completedJobs: 142,
    rating: 4.9,
    followers: 88,
    following: 14,
    isFollowing: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 120,
  },
  {
    id: 'worker-jean',
    name: 'Jean Kouam',
    role: 'Transmission Specialist',
    specialty: 'Manual & Automatic Gearboxes, Clutches',
    phone: '+237 699 15 48 32',
    description: 'Expert in hydraulic clutches, transfer cases, and planetary gear sets for Japanese and European utility vehicles.',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&clothing=collarAndSweater&clothingColor=3c4f5e&accessories=prescription02&accessoriesProbability=100&backgroundColor=b6e3f4',
    isVerified: true,
    status: 'busy',
    completedJobs: 97,
    rating: 4.8,
    followers: 64,
    following: 19,
    isFollowing: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 90,
  },
  {
    id: 'worker-michel',
    name: 'Michel Biya',
    role: 'Auto Electrician',
    specialty: 'OBD-II, Alternators, ECUs & Starters',
    phone: '+237 651 33 90 12',
    description: 'Specialist in vehicle electrical looms, CAN-bus troubleshooting, alternator rewinding, and custom wiring.',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jacks&clothing=overall&facialHair=beardLight&backgroundColor=ffdfbf',
    isVerified: true,
    status: 'active',
    completedJobs: 118,
    rating: 5.0,
    followers: 112,
    following: 22,
    isFollowing: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 180,
  },
];

export function loadWorkers(): WorkerProfile[] {
  try {
    const saved = localStorage.getItem(WORKERS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Upgrade any legacy default unsplash URLs to cartoon avatars
        return parsed.map((w) => {
          if (w.image?.includes('unsplash.com')) {
            if (w.id === 'worker-paul') {
              return { ...w, image: INITIAL_WORKERS[0].image };
            }
            if (w.id === 'worker-jean') {
              return { ...w, image: INITIAL_WORKERS[1].image };
            }
            if (w.id === 'worker-michel') {
              return { ...w, image: INITIAL_WORKERS[2].image };
            }
            return {
              ...w,
              image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                w.name
              )}&backgroundColor=c0aede`,
            };
          }
          return w;
        });
      }
    }
  } catch (e) {
    console.error('Error loading workers from localStorage', e);
  }
  return INITIAL_WORKERS;
}

export function saveWorkers(workers: WorkerProfile[]): void {
  try {
    localStorage.setItem(WORKERS_STORAGE_KEY, JSON.stringify(workers));
  } catch (e) {
    console.error('Error saving workers to localStorage', e);
  }
}
