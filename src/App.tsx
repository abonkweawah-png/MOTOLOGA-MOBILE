import React, { useState, useEffect } from 'react';
import { Job, GarageStats, WorkerProfile, WorkerStatus, DeferredRepair } from './types';
import { loadJobs, saveJobs, REVENUE_STORAGE_KEY } from './data/initialJobs';
import { loadWorkers, saveWorkers } from './data/initialWorkers';
import { getStoredDeferredRepairs, saveStoredDeferredRepairs } from './storage';
import { IntakeScreen } from './components/IntakeScreen';
import { MechanicQueueScreen } from './components/MechanicQueueScreen';
import { CheckoutScreen } from './components/CheckoutScreen';
import { WorkersScreen } from './components/WorkersScreen';
import { MotologaLogo } from './components/MotologaLogo';
import { AnimatedTabBar, TabItem } from './components/ui/animated-tab-bar';
import {
  PlusCircle,
  Wrench,
  Receipt,
  Users,
  WifiOff,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  Car,
  Info,
  X
} from 'lucide-react';

type TabView = 'intake' | 'queue' | 'checkout' | 'workers';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabView>('intake');
  const [jobs, setJobs] = useState<Job[]>(() => loadJobs());
  const [workers, setWorkers] = useState<WorkerProfile[]>(() => loadWorkers());
  const [todayRevenue, setTodayRevenue] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(REVENUE_STORAGE_KEY);
      if (saved) return Number(saved) || 185000;
    } catch (e) {
      // fallback
    }
    return 185000;
  });

  const [deferredRepairs, setDeferredRepairs] = useState<DeferredRepair[]>(() =>
    getStoredDeferredRepairs()
  );
  const [selectedCheckoutJobId, setSelectedCheckoutJobId] = useState<string | null>(null);
  const [isOfflineReady, setIsOfflineReady] = useState<boolean>(true);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    saveJobs(jobs);
  }, [jobs]);

  useEffect(() => {
    saveWorkers(workers);
  }, [workers]);

  useEffect(() => {
    saveStoredDeferredRepairs(deferredRepairs);
  }, [deferredRepairs]);

  useEffect(() => {
    localStorage.setItem(REVENUE_STORAGE_KEY, todayRevenue.toString());
  }, [todayRevenue]);

  // Handle adding new job
  const handleJobCreated = (newJob: Job) => {
    setJobs((prev) => [newJob, ...prev]);
  };

  // Handle updating an existing job
  const handleUpdateJob = (updatedJob: Job) => {
    setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
  };

  // Handle releasing a vehicle
  const handleJobReleased = (job: Job, fee: number) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === job.id
          ? {
              ...j,
              status: 'Ready/Released',
              released: true,
              releasedAt: Date.now(),
              laborFeeFcfa: fee,
            }
          : j
      )
    );
    setTodayRevenue((prev) => prev + fee);
  };

  // Handle Workers Management
  const handleAddWorker = (newWorker: WorkerProfile) => {
    setWorkers((prev) => [newWorker, ...prev]);
  };

  const handleDeleteWorker = (workerId: string) => {
    setWorkers((prev) => prev.filter((w) => w.id !== workerId));
  };

  const handleToggleWorkerStatus = (workerId: string, newStatus: WorkerStatus) => {
    setWorkers((prev) =>
      prev.map((w) => (w.id === workerId ? { ...w, status: newStatus } : w))
    );
  };

  // Reset / reload initial demo data
  const handleResetDemo = () => {
    if (window.confirm('Reset workshop demo records to default?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Quick navigation helpers
  const handleNavigateToCheckout = (jobId?: string) => {
    if (jobId) {
      setSelectedCheckoutJobId(jobId);
    }
    setActiveTab('checkout');
  };

  // Counts for badges
  const activeQueueCount = jobs.filter((j) => !j.released && j.status !== 'Ready/Released').length;
  const readyCheckoutCount = jobs.filter((j) => !j.released && j.status === 'Ready/Released').length;

  // Animated Tab Bar Navigation mapping & definitions
  const tabViewToIndex: Record<TabView, number> = {
    intake: 0,
    queue: 1,
    checkout: 2,
    workers: 3,
  };

  const indexToTabView: TabView[] = ['intake', 'queue', 'checkout', 'workers'];
  const currentTabIndex = tabViewToIndex[activeTab];

  const handleTabChange = (index: number) => {
    const selected = indexToTabView[index];
    if (selected) {
      setActiveTab(selected);
    }
  };

  const navTabItems: TabItem[] = [
    {
      id: 'tab-intake-btn',
      label: 'Intake',
      color: '#F59E0B',
      icon: <PlusCircle className="w-[1.25em] h-[1.25em] stroke-[2.4]" />,
    },
    {
      id: 'tab-queue-btn',
      label: 'Queue',
      color: '#10B981',
      badge: activeQueueCount,
      icon: <Wrench className="w-[1.25em] h-[1.25em] stroke-[2.4]" />,
    },
    {
      id: 'tab-checkout-btn',
      label: 'Checkout',
      color: '#06B6D4',
      badge: readyCheckoutCount,
      icon: <Receipt className="w-[1.25em] h-[1.25em] stroke-[2.4]" />,
    },
    {
      id: 'tab-workers-btn',
      label: 'Staff',
      color: '#A855F7',
      badge: workers.length,
      icon: <Users className="w-[1.25em] h-[1.25em] stroke-[2.4]" />,
    },
  ];

  return (
    <div className="min-h-screen bg-stone-100 text-slate-800 flex flex-col items-center justify-between font-sans text-view-enhanced">
      {/* Fixed/Sticky Top Navigation Header: Deep Forest Teal background (bg-[#0E2829]) with high-contrast white text */}
      <header className="w-full bg-[#0E2829] text-white border-b-2 border-emerald-500/30 sticky top-0 z-40 shadow-md">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* MOTOLOGA Brand Emblem (Tap to inspect workshop branding & system info) */}
            <button
              id="motologa-logo-btn"
              type="button"
              onClick={() => setShowAboutModal(true)}
              title="MOTOLOGA Workshop Operating System"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#142F30] border-l-4 border-[#34D399] flex items-center justify-center p-1.5 text-white shadow-sm shrink-0 hover:bg-[#1a3d3e] transition-all cursor-pointer active:scale-95"
            >
              <MotologaLogo variant="icon" size="sm" accentColor="#34D399" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-black tracking-wider uppercase text-white font-mono truncate">
                MOTOLOGA
              </h1>
            </div>
          </div>

          {/* Header Controls: Reset */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleResetDemo}
              title="Reset workshop records"
              className="min-h-[40px] px-2 sm:px-2.5 py-1 rounded-lg bg-[#142F30] hover:bg-stone-800 text-slate-300 text-xs font-bold border border-slate-700 flex items-center gap-1 active:scale-95 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

      </header>

      {/* Main Content Area: App Canvas Warm Stone (bg-stone-100) */}
      <main className="w-full max-w-2xl flex-1 px-3 sm:px-4 pt-3 sm:pt-4 pb-28 sm:pb-32">
        {activeTab === 'intake' && (
          <IntakeScreen
            onJobCreated={handleJobCreated}
            onNavigateToQueue={() => setActiveTab('queue')}
            availableMechanics={Array.from(new Set([...workers.map((w) => w.name), 'Unassigned']))}
          />
        )}

        {activeTab === 'queue' && (
          <MechanicQueueScreen
            jobs={jobs}
            deferredRepairs={deferredRepairs}
            onUpdateRepairs={setDeferredRepairs}
            onUpdateJob={handleUpdateJob}
            onNavigateToCheckout={handleNavigateToCheckout}
          />
        )}

        {activeTab === 'checkout' && (
          <CheckoutScreen
            jobs={jobs}
            todayRevenue={todayRevenue}
            onUpdateJob={handleUpdateJob}
            onJobReleased={handleJobReleased}
            onAddDeferredRepair={(newRepair) => {
              setDeferredRepairs((prev) => [newRepair, ...prev.filter((r) => r.id !== newRepair.id)]);
            }}
            selectedJobId={selectedCheckoutJobId}
          />
        )}

        {activeTab === 'workers' && (
          <WorkersScreen
            workers={workers}
            onAddWorker={handleAddWorker}
            onDeleteWorker={handleDeleteWorker}
            onToggleStatus={handleToggleWorkerStatus}
            onNavigateToQueue={(mechanicName) => {
              setActiveTab('queue');
            }}
          />
        )}
      </main>

      {/* PRIMARY NAVIGATION:
          Dynamic Floating Island with curved arch cutout indicator,
          responsive floating orb badge, and active-only page name.
      */}
      <nav
        id="bottom-tab-navigator"
        aria-label="Garage Operations Navigation"
        className="fixed bottom-3 sm:bottom-6 inset-x-0 mx-auto z-50 flex justify-center items-center px-3 sm:px-6 pointer-events-none transition-all duration-300"
      >
        <div className="w-full max-w-[310px] min-[375px]:max-w-[340px] min-[425px]:max-w-[380px] sm:max-w-[460px] md:max-w-[520px] lg:max-w-[560px] pointer-events-auto filter drop-shadow-[0_16px_32px_rgba(0,0,0,0.65)] transition-all duration-300 ease-out">
          <AnimatedTabBar
            items={navTabItems}
            activeIndex={currentTabIndex}
            onTabChange={handleTabChange}
            barColor="#0E2829"
          />
        </div>
      </nav>

      {/* MOTOLOGA Brand & Workshop System Modal */}
      {showAboutModal && (
        <div
          id="about-motologa-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="w-full max-w-md bg-[#0E2829] text-white rounded-3xl overflow-hidden shadow-2xl border-2 border-[#34D399] flex flex-col">
            {/* Modal Top Header */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-emerald-500/30">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#34D399] animate-pulse"></span>
                <span className="font-mono text-xs uppercase tracking-widest text-[#34D399] font-black">
                  System Profile • Cameroon OS
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAboutModal(false)}
                className="w-9 h-9 rounded-xl bg-[#142F30] hover:bg-[#1f484a] text-slate-300 flex items-center justify-center cursor-pointer transition-colors active:scale-95 border border-emerald-500/20"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Prominent Logo Display */}
            <div className="p-6 text-center space-y-5">
              <div className="bg-[#142F30] rounded-2xl p-6 border border-emerald-500/30 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-[#34D399]"></div>
                <MotologaLogo
                  variant="full"
                  size="xl"
                  className="text-white drop-shadow-md"
                  accentColor="#34D399"
                />
                <span className="text-[10px] font-mono tracking-widest text-[#34D399] uppercase font-bold mt-2">
                  Precision Workshop Engineering
                </span>
              </div>

              <div className="space-y-2 text-left bg-[#091b1c] p-4 rounded-xl border border-emerald-950 text-xs">
                <div className="flex justify-between py-1 border-b border-emerald-900/40">
                  <span className="text-slate-400">Application:</span>
                  <strong className="text-white font-mono">MOTOLOGA Auto OS v2.0</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-900/40">
                  <span className="text-slate-400">Registry Region:</span>
                  <strong className="text-emerald-300 font-mono">Douala / Yaoundé (CMR)</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-900/40">
                  <span className="text-slate-400">Offline Status:</span>
                  <span className="text-[#34D399] font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#34D399]"></span>
                    Storage Persistent (Local)
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Touch Architecture:</span>
                  <strong className="text-amber-400 font-mono">Min 48px Garage Hand Standard</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAboutModal(false)}
                className="w-full min-h-[48px] rounded-xl bg-[#34D399] hover:bg-[#10B981] active:scale-98 text-[#0E2829] font-black text-sm uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                Return to Workshop Board
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
