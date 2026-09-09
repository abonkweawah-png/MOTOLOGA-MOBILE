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
  Check
} from 'lucide-react';

interface WorkersScreenProps {
  workers: WorkerProfile[];
  onAddWorker: (newWorker: WorkerProfile) => void;
  onDeleteWorker: (workerId: string) => void;
  onToggleStatus: (workerId: string, status: WorkerStatus) => void;
  onNavigateToQueue: (mechanicName: string) => void;
}

const PRESET_AVATARS = [
  {
    label: 'Lead Mechanic (Overalls)',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus&clothing=overall&clothingColor=262e33&accessories=round&backgroundColor=c0aede',
  },
  {
    label: 'Diagnostic Tech (Glasses)',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&clothing=collarAndSweater&clothingColor=3c4f5e&accessories=prescription02&accessoriesProbability=100&backgroundColor=b6e3f4',
  },
  {
    label: 'Master Electrician',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&clothing=overall&accessories=round&backgroundColor=d1d4f9',
  },
  {
    label: 'Engine Rebuilder',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jacks&clothing=overall&facialHair=beardLight&backgroundColor=ffdfbf',
  },
  {
    label: 'Cyber Wrench Bot',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=WrenchBot&backgroundColor=b6e3f4',
  },
  {
    label: 'Workshop Chief',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert&clothing=blazerAndShirt&facialHair=beardMajestic&backgroundColor=d1fae5',
  },
  {
    label: 'Tuning Engineer',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amara&clothing=hoodie&backgroundColor=fed7aa',
  },
  {
    label: 'Gearbox Pro',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Christian&clothing=overall&top=hat&backgroundColor=e2e8f0',
  },
  {
    label: 'Pitstop Mechanic',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aiden&clothing=graphicShirt&facialHair=moustacheFancy&backgroundColor=fef08a',
  },
  {
    label: 'ECU Specialist',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena&clothing=collarAndSweater&accessories=prescription01&backgroundColor=e9d5ff',
  },
  {
    label: 'Heavy Duty Tech',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tariq&clothing=overall&facialHair=beardMedium&backgroundColor=bae6fd',
  },
  {
    label: 'Hydraulics Expert',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya&clothing=shirtCrewNeck&backgroundColor=fbcfe8',
  },
  {
    label: 'Turbo Robo-Tech',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=TurboMech&backgroundColor=c7d2fe',
  },
];

const PRESET_ROLES = [
  'Lead Master Mechanic',
  'Transmission Specialist',
  'Auto Electrician & ECU',
  'Brakes & Suspension Tech',
  'Engine Rebuild Specialist',
  'Apprentice Technician',
];

export const WorkersScreen: React.FC<WorkersScreenProps> = ({
  workers,
  onAddWorker,
  onDeleteWorker,
  onToggleStatus,
  onNavigateToQueue,
}) => {
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | WorkerStatus>('all');
  const [newlyCreatedWorkerId, setNewlyCreatedWorkerId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<string>(PRESET_ROLES[0]);
  const [specialty, setSpecialty] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [image, setImage] = useState<string>(PRESET_AVATARS[0].url);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(true);
  const [status, setStatus] = useState<WorkerStatus>('active');
  const [initialRepairs, setInitialRepairs] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [createdSuccessToast, setCreatedSuccessToast] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedPhoto(reader.result);
        setImage(reader.result);
        setFormError('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Please enter the worker’s full name.');
      return;
    }

    const finalImage = uploadedPhoto || image;

    const newWorker: WorkerProfile = {
      id: `worker-${Date.now()}`,
      name: name.trim(),
      role: role.trim() || 'Technician',
      specialty: specialty.trim() || 'General Automotive Repairs',
      phone: phone.trim() || '+237 600 00 00 00',
      description:
        description.trim() ||
        `${role} dedicated to high-precision vehicle diagnostics and customer satisfaction.`,
      image: finalImage,
      isVerified,
      status,
      completedJobs: Number(initialRepairs) || 0,
      rating: 5.0,
      followers: 24,
      following: 5,
      isFollowing: false,
      createdAt: Date.now(),
    };

    onAddWorker(newWorker);
    setNewlyCreatedWorkerId(newWorker.id);
    setCreatedSuccessToast(`Worker profile for "${newWorker.name}" created successfully!`);

    // Reset Form
    setName('');
    setSpecialty('');
    setPhone('');
    setDescription('');
    setInitialRepairs('');
    setUploadedPhoto(null);
    setImage(PRESET_AVATARS[0].url);
    setShowCreateForm(false);
    setFormError('');

    setTimeout(() => {
      setCreatedSuccessToast(null);
    }, 4500);
  };

  const filteredWorkers = workers.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.specialty.toLowerCase().includes(searchQuery.toLowerCase());
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="worker-name-input"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
              >
                Worker Full Name *
              </label>
              <input
                id="worker-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ibrahim Souley"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 text-sm focus:border-emerald-600 focus:outline-none transition-all"
              />
            </div>

            {/* Role Presets */}
            <div>
              <label
                htmlFor="worker-role-select"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
              >
                Workshop Role / Position
              </label>
              <select
                id="worker-role-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 text-sm focus:border-emerald-600 focus:outline-none transition-all"
              >
                {PRESET_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Specialty */}
            <div>
              <label
                htmlFor="worker-specialty-input"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
              >
                Specialty / Skills
              </label>
              <input
                id="worker-specialty-input"
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="e.g. Toyota D-4D, Common Rail, ECU Remap"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 text-sm focus:border-emerald-600 focus:outline-none transition-all"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="worker-phone-input"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
              >
                Phone / WhatsApp Number
              </label>
              <input
                id="worker-phone-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+237 6XX XX XX XX"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 text-sm focus:border-emerald-600 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Bio / Experience Description */}
          <div>
            <label
              htmlFor="worker-bio-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
            >
              Experience Description / Bio
            </label>
            <textarea
              id="worker-bio-input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 7 years experience in Japanese 4x4s and diesel truck fleet repairs in Douala."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 text-sm focus:border-emerald-600 focus:outline-none transition-all"
            />
          </div>

          {/* Profile Picture Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Choose Cartoon Avatar or Upload Custom Photo
            </label>

            {/* Display only 2 avatars in the span, followed by dropdown and upload buttons */}
            {(() => {
              const selectedPresetIndex = PRESET_AVATARS.findIndex((p) => p.url === image);
              const displayedTwoAvatars =
                selectedPresetIndex > 1
                  ? [PRESET_AVATARS[selectedPresetIndex], PRESET_AVATARS[0]]
                  : [PRESET_AVATARS[0], PRESET_AVATARS[1]];

              return (
                <div className="relative">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {/* Display only two avatars in the span */}
                    {displayedTwoAvatars.map((preset, idx) => {
                      const isSelected = !uploadedPhoto && image === preset.url;
                      return (
                        <button
                          key={idx}
                          type="button"
                          id={`preset-avatar-span-${idx}`}
                          onClick={() => {
                            setImage(preset.url);
                            setUploadedPhoto(null);
                          }}
                          className={`p-1.5 px-2.5 rounded-xl border text-left inline-flex items-center gap-2 cursor-pointer transition-all shadow-xs ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400/80 shadow-xs'
                              : 'bg-stone-50 border-slate-200 hover:bg-stone-100'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-300">
                            <img
                              src={preset.url}
                              alt={preset.label}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-800 line-clamp-1 max-w-[130px]">
                            {preset.label}
                          </span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}

                    {/* Dropdown toggle button beside the 2 avatars */}
                    <button
                      id="avatar-dropdown-toggle-btn"
                      type="button"
                      onClick={() => setIsAvatarDropdownOpen((prev) => !prev)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all shadow-xs shrink-0 ${
                        isAvatarDropdownOpen
                          ? 'bg-emerald-100/80 border-emerald-500 text-emerald-900 ring-2 ring-emerald-400/50'
                          : 'bg-stone-50 border-slate-300 hover:bg-stone-100 text-slate-700'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>More Avatars ({PRESET_AVATARS.length})</span>
                      {isAvatarDropdownOpen ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </button>

                    {/* Compact File Upload Button */}
                    <input
                      id="worker-photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                    <label
                      htmlFor="worker-photo-upload"
                      id="worker-photo-upload-btn"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 bg-stone-50 hover:bg-stone-100 active:scale-95 text-slate-700 font-bold text-xs cursor-pointer transition-all shadow-xs shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{uploadedPhoto ? 'Replace Upload' : 'Upload Own Photo'}</span>
                    </label>

                    {uploadedPhoto && (
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-50 border border-emerald-300 rounded-xl text-xs">
                        <img
                          src={uploadedPhoto}
                          alt="Uploaded thumbnail"
                          className="w-6 h-6 rounded-md object-cover border border-emerald-400"
                        />
                        <span className="font-bold text-emerald-900 text-[11px]">Custom Photo Active</span>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedPhoto(null);
                            setImage(PRESET_AVATARS[0].url);
                          }}
                          className="text-slate-400 hover:text-rose-600 p-0.5 ml-1 cursor-pointer"
                          title="Remove custom photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Dropdown Menu showing all avatars */}
                  {isAvatarDropdownOpen && (
                    <div
                      id="avatar-dropdown-panel"
                      className="mt-2 w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-xl p-3.5 z-20 animate-in fade-in zoom-in-95 duration-150 mb-3"
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          Choose from All {PRESET_AVATARS.length} Cartoon Avatars
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsAvatarDropdownOpen(false)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
                        {PRESET_AVATARS.map((preset, idx) => {
                          const isSelected = !uploadedPhoto && image === preset.url;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setImage(preset.url);
                                setUploadedPhoto(null);
                                setIsAvatarDropdownOpen(false);
                              }}
                              className={`p-2 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400/80 shadow-xs'
                                  : 'bg-stone-50 border-slate-200 hover:bg-stone-100'
                              }`}
                            >
                              <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-300">
                                <img
                                  src={preset.url}
                                  alt={preset.label}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-bold text-slate-800 truncate">
                                  {preset.label}
                                </p>
                                {isSelected && (
                                  <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
                                    <Check className="w-3 h-3" /> Picked
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Status & Verification Checkbox */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label
                htmlFor="worker-initial-status-select"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
              >
                Initial Shift Status
              </label>
              <select
                id="worker-initial-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as WorkerStatus)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 text-sm focus:border-emerald-600 focus:outline-none"
              >
                <option value="active">Active (Available for Intake)</option>
                <option value="busy">Busy (Currently on a Job)</option>
                <option value="break">On Break / Off Shift</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="worker-repairs-count"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
              >
                Previous Completed Repairs
              </label>
              <input
                id="worker-repairs-count"
                type="number"
                min={0}
                value={initialRepairs}
                onChange={(e) => setInitialRepairs(e.target.value)}
                placeholder="e.g. 0"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 text-sm focus:border-emerald-600 focus:outline-none placeholder:text-slate-400"
              />
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
                    <div className="mb-2 px-3 py-1 bg-emerald-100 border border-emerald-400 text-emerald-800 text-[11px] font-black rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-xs animate-bounce">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Newly Created Profile</span>
                    </div>
                  )}

                  {/* ProfileCard component incorporating user's design style */}
                  <ProfileCard
                    name={worker.name}
                    description={worker.description}
                    image={worker.image}
                    isVerified={worker.isVerified}
                    role={worker.role}
                    specialty={worker.specialty}
                    phone={worker.phone}
                    status={worker.status}
                    completedJobs={worker.completedJobs}
                    rating={worker.rating}
                    followers={worker.followers || 45}
                    following={worker.following || 10}
                    actionLabel={`Assign to Queue →`}
                    onAction={() => onNavigateToQueue(worker.name)}
                    className="hover:border-[#34D399] transition-all"
                  />

                  {/* Owner Controls Bar directly underneath the card */}
                  <div className="w-full max-w-xs sm:w-80 mt-2.5 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Shift:
                      </span>
                      <select
                        aria-label={`Status for ${worker.name}`}
                        value={worker.status}
                        onChange={(e) =>
                          onToggleStatus(worker.id, e.target.value as WorkerStatus)
                        }
                        className="text-[11px] font-bold bg-stone-100 border border-slate-300 rounded-lg px-2 py-1 text-slate-800 focus:outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="busy">Busy</option>
                        <option value="break">On Break</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {worker.phone && (
                        <a
                          href={`tel:${worker.phone}`}
                          title={`Call ${worker.name}`}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
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
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
