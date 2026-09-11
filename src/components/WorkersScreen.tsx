import React, { useState } from 'react';
import { WorkerProfile, WorkerStatus } from '../types';
import { ProfileCard } from './ui/profile-card';
import {
  UserPlus,
  Users,
  Wrench,
  Sparkles,
  Phone,
  ShieldCheck,
  CheckCircle2,
  X,
  Plus,
  Search,
  Filter,
  Trash2,
  ArrowRight,
  Star,
  Upload,
  ChevronDown,
  ChevronUp,
  Check,
  RefreshCw
} from 'lucide-react';

interface WorkersScreenProps {
  workers: WorkerProfile[];
  onAddWorker: (name: string, pinCode: string, colorBadge: string, phone?: string, role?: string, specialty?: string) => Promise<void>;
  onDeleteWorker: (workerId: string) => void;
  onUpdatePin: (workerId: string, newPin: string) => void;
  onToggleStatus: (workerId: string, status: WorkerStatus) => void;
  onNavigateToQueue: (mechanicName: string) => void;
  onForceLoad?: () => void;
}

const PRESET_AVATARS = [
  { id: '1', name: 'Zippy', hex: 'https://api.dicebear.com/7.x/bottts/svg?seed=Zippy' },
  { id: '2', name: 'Felix', hex: 'https://api.dicebear.com/7.x/bottts/svg?seed=Felix' },
  { id: '3', name: 'Blade', hex: 'https://api.dicebear.com/7.x/bottts/svg?seed=Blade' },
  { id: '4', name: 'Gizmo', hex: 'https://api.dicebear.com/7.x/bottts/svg?seed=Gizmo' },
  { id: '5', name: 'Jasper', hex: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Jasper' },
  { id: '6', name: 'Spike', hex: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Spike' },
  { id: '7', name: 'Nix', hex: 'https://api.dicebear.com/7.x/bottts/svg?seed=Nix' },
  { id: '8', name: 'Bolt', hex: 'https://api.dicebear.com/7.x/bottts/svg?seed=Bolt' },
  { id: '9', name: 'Dash', hex: 'https://api.dicebear.com/7.x/bottts/svg?seed=Dash' },
  { id: '10', name: 'Flint', hex: 'https://api.dicebear.com/7.x/bottts/svg?seed=Flint' },
  { id: '11', name: 'Ace', hex: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Ace' },
  { id: '12', name: 'Rex', hex: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Rex' },
  { id: '13', name: 'Burt', hex: 'https://api.dicebear.com/7.x/bottts/svg?seed=Burt' },
  { id: '14', name: 'Max', hex: 'https://api.dicebear.com/7.x/bottts/svg?seed=Max' },
  { id: '15', name: 'Chip', hex: 'https://api.dicebear.com/7.x/bottts/svg?seed=Chip' }
];

export const WorkersScreen: React.FC<WorkersScreenProps> = ({
  workers,
  onAddWorker,
  onDeleteWorker,
  onUpdatePin,
  onToggleStatus,
  onNavigateToQueue,
  onForceLoad,
}) => {
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | WorkerStatus>('all');
  const [newlyCreatedWorkerId, setNewlyCreatedWorkerId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState<string>('');
  const [pinCode, setPinCode] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [roleInput, setRoleInput] = useState<string>('Apprentice');
  const [specialty, setSpecialty] = useState<string>('');
  const [colorBadge, setColorBadge] = useState<string>(PRESET_AVATARS[0].hex);
  const [formError, setFormError] = useState<string>('');
  const [createdSuccessToast, setCreatedSuccessToast] = useState<string | null>(null);
  const [showAllAvatars, setShowAllAvatars] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Please enter the worker’s full name.');
      return;
    }
    if (!/^\d{4}$/.test(pinCode)) {
      setFormError('PIN must be exactly 4 digits.');
      return;
    }

    try {
      await onAddWorker(name.trim(), pinCode, colorBadge, phone, roleInput, specialty);
      
      setCreatedSuccessToast(`Worker profile for "${name.trim()}" created successfully!`);

      // Reset Form
      setName('');
      setPinCode('');
      setPhone('');
      setRoleInput('Apprentice');
      setSpecialty('');
      setColorBadge(PRESET_AVATARS[0].hex);
      setShowCreateForm(false);
      setShowAllAvatars(false);
      setFormError('');

      setTimeout(() => {
        setCreatedSuccessToast(null);
      }, 4500);
    } catch (err: any) {
      alert(err.message || 'Worker insertion failed from database error.');
    }
  };

  const filteredWorkers = workers.filter((w) => {
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = workers.filter((w) => w.status === 'active').length;
  const busyCount = workers.filter((w) => w.status === 'busy').length;

  return (
    <div className="space-y-4 sm:space-y-6 pb-20">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-100 text-purple-700 font-bold">
                <Users className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Workshop Staff & Technician Profiles
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Sign in new mechanics, assign workshop roles & track repair throughput
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onForceLoad && (
               <button
                 type="button"
                 onClick={onForceLoad}
                 className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 border border-rose-500 shadow-sm cursor-pointer transition-all shrink-0"
               >
                 <RefreshCw className="w-4 h-4" />
                 <span>FORCE LOAD MECHANICS</span>
               </button>
            )}
            <button
              type="button"
              id="register-new-worker-btn"
              onClick={() => {
                setShowCreateForm((prev) => !prev);
                setFormError('');
              }}
              className="px-4 py-2.5 rounded-xl bg-[#0E2829] hover:bg-[#142F30] active:scale-95 text-[#34D399] font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 border border-emerald-500/40 shadow-sm cursor-pointer transition-all shrink-0"
            >
              {showCreateForm ? (
                <>
                  <X className="w-4 h-4" />
                  <span>Close Form</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Sign In New Worker</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Workshop Roster Counters */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-stone-50 p-2.5 rounded-xl border border-slate-200/80">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Total Staff
            </span>
            <span className="text-lg sm:text-xl font-black text-slate-900 font-mono">
              {workers.length}
            </span>
          </div>
          <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/70">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-800 block">
              Available
            </span>
            <span className="text-lg sm:text-xl font-black text-emerald-700 font-mono">
              {activeCount}
            </span>
          </div>
          <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/70">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-800 block">
              Busy on Repairs
            </span>
            <span className="text-lg sm:text-xl font-black text-amber-700 font-mono">
              {busyCount}
            </span>
          </div>
        </div>
      </div>

      {/* Success Notification Toast */}
      {createdSuccessToast && (
        <div className="p-3.5 rounded-xl bg-emerald-900 text-emerald-100 border border-emerald-400/50 shadow-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#34D399] shrink-0" />
            <p className="text-xs sm:text-sm font-bold">{createdSuccessToast}</p>
          </div>
          <button
            onClick={() => setCreatedSuccessToast(null)}
            className="text-emerald-300 hover:text-white text-xs font-bold uppercase"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SIGN IN NEW WORKER FORM (Card with high contrast & clear inputs) */}
      {showCreateForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-4 sm:p-6 shadow-md border-2 border-emerald-500/30 space-y-4 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#34D399]" />
              <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase font-mono">
                Create Worker Profile
              </h3>
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              MOTOLOGA HR
            </span>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs font-bold">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="worker-name-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Worker Name *
              </label>
              <input
                id="worker-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jean"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 text-sm focus:border-emerald-600 focus:outline-none transition-all"
              />
            </div>
            
            <div>
              <label htmlFor="worker-pin-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                4-Digit PIN Code *
              </label>
              <input
                id="worker-pin-input"
                type="text"
                inputMode="numeric"
                pattern="\d{4}"
                required
                maxLength={4}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 1234"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 text-sm focus:border-emerald-600 focus:outline-none transition-all tracking-[0.5em] font-mono text-center"
              />
            </div>

            <div>
              <label htmlFor="worker-phone" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Phone Number</label>
              <input
                id="worker-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 670000000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="worker-specialty" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Brand Specialty</label>
              <input
                id="worker-specialty"
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="e.g. Toyota, Mercedes"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:border-emerald-600 focus:outline-none"
              />
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="worker-status-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Professional Status *</label>
              <select
                id="worker-status-select"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-bold focus:border-emerald-600 focus:outline-none cursor-pointer"
              >
                <option value="Apprentice">Apprentice (Learning & Execution)</option>
                <option value="Expert">Expert (Lead Diagnostician)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Select Character Avatar *
              </label>
              <button
                type="button"
                onClick={() => setShowAllAvatars(!showAllAvatars)}
                className="text-emerald-600 text-[10px] font-black uppercase tracking-wider hover:underline"
              >
                {showAllAvatars ? 'Show Less' : 'Show All 15 Avatars'}
              </button>
            </div>
            <div className={`transition-all duration-300 ${!showAllAvatars ? 'max-h-16 overflow-hidden' : 'max-h-64 overflow-y-auto'}`}>
              <div className="flex flex-wrap gap-2.5 p-1">
                {(showAllAvatars ? PRESET_AVATARS : PRESET_AVATARS.slice(0, 5)).map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColorBadge(c.hex)}
                    className={`w-14 h-14 rounded-2xl border-[3px] transition-transform active:scale-95 flex items-center justify-center shadow-sm overflow-hidden bg-slate-100 ${colorBadge === c.hex ? 'ring-2 ring-emerald-500 scale-105 border-emerald-500' : 'border-slate-300 hover:border-slate-400'}`}
                    title={c.name}
                  >
                    <img src={c.hex} alt={c.name} className="w-10 h-10 object-contain drop-shadow-sm" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider hover:bg-stone-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-create-worker-btn"
              className="px-5 py-2.5 rounded-xl bg-[#0E2829] hover:bg-[#142F30] active:scale-95 text-[#34D399] text-xs font-black uppercase tracking-wider border border-[#34D399] shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
              <span>Create Worker Profile</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-xs border border-slate-200 flex flex-col sm:flex-row gap-2.5 justify-between items-stretch sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mechanics by name, role or specialty..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-stone-50 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-none"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 shrink-0">
          {(['all', 'active', 'busy', 'break'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all shrink-0 cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#0E2829] text-emerald-300 border border-emerald-500/40 shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-slate-600 border border-transparent'
              }`}
            >
              {st === 'all' ? 'All Staff' : st}
            </button>
          ))}
        </div>
      </div>

      {/* PROFILES GRID (Rendering the ProfileCard design requested by user) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <span>Active Worker Roster</span>
            <span className="text-xs bg-slate-200 text-slate-800 font-mono px-2 py-0.5 rounded-full">
              {filteredWorkers.length}
            </span>
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">
            Interactive Profile Cards • Tap or hover to view
          </span>
        </div>

        {filteredWorkers.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No technicians found matching criteria</p>
            <p className="text-xs text-slate-500">Try adjusting your search query or add a new worker.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-[#0E2829] text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/40 cursor-pointer"
            >
              Register First Worker
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 justify-items-center">
            {filteredWorkers.map((worker) => {
              const isNewlyCreated = newlyCreatedWorkerId === worker.id;
              return (
                <div key={worker.id} className="relative w-full flex flex-col items-center">
                  {/* Subtle highlight if newly created */}
                  {isNewlyCreated && (
                    <div className="mb-4 px-3 py-1 bg-emerald-100 border border-emerald-400 text-emerald-800 text-[11px] font-black rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-xs animate-bounce z-10 relative">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Newly Created Profile</span>
                    </div>
                  )}

                  {/* ProfileCard component incorporating user's design style */}
                  <ProfileCard
                    name={worker.name}
                    description={worker.pinCode ? `Authorized Foreman Account` : `No PIN setup for this worker yet.`}
                    image={worker.colorBadge || PRESET_AVATARS[0].hex}
                    isVerified={worker.isVerified}
                    role={worker.role}
                    specialty={worker.specialty}
                    phone={worker.phone}
                    followers={worker.completedJobs}
                    following={worker.rating}
                    isFollowing={!!worker.pinCode}
                    onFollow={() => {
                      const newPin = window.prompt(`Enter new 4-digit PIN for ${worker.name}:`, worker.pinCode || '');
                      if (newPin && /^\d{4}$/.test(newPin)) {
                        onUpdatePin(worker.id, newPin);
                        alert(`PIN for ${worker.name} successfully updated.`);
                      } else if (newPin) {
                        alert('Invalid PIN. Must be exactly 4 digits.');
                      }
                    }}
                  />

                  {/* Owner Controls Bar directly underneath the card */}
                  <div className="w-80 mt-3 pt-3 flex flex-col gap-2 rounded-xl border border-stone-200 bg-stone-50 p-2 shadow-inner">
                    <div className="flex items-center justify-between w-full">
                      <select
                        aria-label={`Status for ${worker.name}`}
                        value={worker.status}
                        onChange={(e) =>
                          onToggleStatus(worker.id, e.target.value as WorkerStatus)
                        }
                        className="text-xs font-bold bg-white border border-stone-300 rounded-lg px-2 py-1.5 text-slate-800 focus:outline-none flex-1 mr-2"
                      >
                        <option value="active">Available (Active Shift)</option>
                        <option value="busy">Busy (Currently on task)</option>
                        <option value="break">On Break / Off Shift</option>
                      </select>
                      
                      {worker.phone && (
                        <a
                          href={`tel:${worker.phone}`}
                          title={`Call ${worker.name}`}
                          className="p-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Are you sure you want to remove ${worker.name} from workshop staff?`
                          )
                        ) {
                          onDeleteWorker(worker.id);
                        }
                      }}
                      title="Remove Worker"
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] uppercase tracking-wider border border-rose-200 transition-colors w-full flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Remove Technician
                    </button>
                    
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
