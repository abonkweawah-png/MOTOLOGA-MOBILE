import { DeferredRepair, DeferredStatus } from './types';

export const DEFERRED_STORAGE_KEY = 'motologa_deferred_repairs_v1';

export const COMPONENT_OPTIONS = [
  'Brake Pads',
  'Timing Belt',
  'Suspension',
  'AC System',
  'General Service',
] as const;

export const TIMEFRAME_OPTIONS = [
  'Next Week',
  'In 2 Weeks',
  'End of Month',
] as const;

// Initial mock dataset representing owner's morning follow-up list
export const INITIAL_DEFERRED_REPAIRS: DeferredRepair[] = [
  {
    id: 'def-001',
    vehiclePlate: 'LT 7249 D',
    customerPhone: '699451288',
    componentToFix: 'Brake Pads',
    targetDateString: 'Next Week',
    status: 'pending',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
  },
  {
    id: 'def-002',
    vehiclePlate: 'CE 5931 K',
    customerPhone: '677158920',
    componentToFix: 'Timing Belt',
    targetDateString: 'In 2 Weeks',
    status: 'pending',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
  },
  {
    id: 'def-003',
    vehiclePlate: 'OU 2104 M',
    customerPhone: '651339012',
    componentToFix: 'Suspension',
    targetDateString: 'Next Week',
    status: 'pending',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1, // 1 day ago
  },
  {
    id: 'def-004',
    vehiclePlate: 'NW 8912 A',
    customerPhone: '698881234',
    componentToFix: 'AC System',
    targetDateString: 'End of Month',
    status: 'contacted',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
    contactedAt: Date.now() - 1000 * 60 * 60 * 4,
  },
  {
    id: 'def-005',
    vehiclePlate: 'SW 4022 B',
    customerPhone: '670112233',
    componentToFix: 'General Service',
    targetDateString: 'In 2 Weeks',
    status: 'pending',
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
  },
];

/**
 * Clean phone number for Cameroon +237 international WhatsApp URL
 * Strips any symbols, spaces, and leading country code / zero so that
 * https://wa.me/237{customerPhone} produces the valid destination.
 */
export function sanitizeCameroonPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('237')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }
  return cleaned;
}

/**
 * Generate WhatsApp reminder deep link for a deferred repair.
 * Format specified: https://wa.me/237{customerPhone}?text={encoded_message}
 * Template: "Bonjour, this is MOTOLOGA Garage. You asked us to remind you regarding the [Component] for vehicle [Plate]. Are you available to bring the car in soon?"
 */
export function generateWhatsAppReminderUrl(
  customerPhone: string,
  componentToFix: string,
  vehiclePlate: string
): string {
  const cleanPhone = sanitizeCameroonPhone(customerPhone);
  const message = `Bonjour, this is MOTOLOGA Garage. You asked us to remind you regarding the ${componentToFix} for vehicle ${vehiclePlate}. Are you available to bring the car in soon?`;
  return `https://wa.me/237${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Fetch all deferred repairs from localStorage (or fallback to INITIAL_DEFERRED_REPAIRS)
 */
export function getStoredDeferredRepairs(): DeferredRepair[] {
  try {
    const raw = localStorage.getItem(DEFERRED_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DEFERRED_STORAGE_KEY, JSON.stringify(INITIAL_DEFERRED_REPAIRS));
      return INITIAL_DEFERRED_REPAIRS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    console.error('Error reading deferred repairs from storage:', e);
  }
  return INITIAL_DEFERRED_REPAIRS;
}

/**
 * Save complete list of deferred repairs to localStorage
 */
export function saveStoredDeferredRepairs(repairs: DeferredRepair[]): void {
  try {
    localStorage.setItem(DEFERRED_STORAGE_KEY, JSON.stringify(repairs));
  } catch (e) {
    console.error('Error saving deferred repairs to storage:', e);
  }
}

/**
 * Add a new deferred repair follow-up item
 */
export function addDeferredRepair(
  repair: Omit<DeferredRepair, 'id' | 'status' | 'createdAt'>
): DeferredRepair {
  const current = getStoredDeferredRepairs();
  const newRepair: DeferredRepair = {
    ...repair,
    id: `def-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status: 'pending',
    createdAt: Date.now(),
  };

  const updated = [newRepair, ...current];
  saveStoredDeferredRepairs(updated);
  return newRepair;
}

/**
 * Update the status ('pending' | 'contacted') of a deferred repair item
 */
export function updateDeferredRepairStatus(
  id: string,
  status: DeferredStatus
): DeferredRepair[] {
  const current = getStoredDeferredRepairs();
  const updated = current.map((item) =>
    item.id === id
      ? {
          ...item,
          status,
          contactedAt: status === 'contacted' ? Date.now() : undefined,
        }
      : item
  );
  saveStoredDeferredRepairs(updated);
  return updated;
}

/**
 * Remove a deferred repair follow-up item
 */
export function removeDeferredRepair(id: string): DeferredRepair[] {
  const current = getStoredDeferredRepairs();
  const updated = current.filter((item) => item.id !== id);
  saveStoredDeferredRepairs(updated);
  return updated;
}
