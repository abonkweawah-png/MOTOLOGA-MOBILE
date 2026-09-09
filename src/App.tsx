import React, { useState, useEffect } from 'react';
import { Job, WorkerProfile, WorkerStatus, DeferredRepair, GarageStats } from './types';
import { IntakeScreen } from './components/IntakeScreen';
import { MechanicQueueScreen } from './components/MechanicQueueScreen';
import { CheckoutScreen } from './components/CheckoutScreen';
import { WorkersScreen } from './components/WorkersScreen';
import { MotologaLogo } from './components/MotologaLogo';
import { AnimatedTabBar, TabItem } from './components/ui/animated-tab-bar';
import { LoginScreen } from './components/LoginScreen';
import { supabase } from './lib/supabase';
import { fetchJobsForGarage, fetchJobsForMechanic, createJob, uploadMedia, updateJobStatus } from './lib/api';
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
  const [role, setRole] = useState<'owner' | 'mechanic' | null>(null);
  const [mechanicId, setMechanicId] = useState<string | null>(null);
  const [garageId, setGarageId] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<TabView>('intake');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [todayRevenue, setTodayRevenue] = useState<number>(0);
  const [deferredRepairs, setDeferredRepairs] = useState<DeferredRepair[]>([]);
  const [selectedCheckoutJobId, setSelectedCheckoutJobId] = useState<string | null>(null);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.error(error);
      if (session) {
        setRole(prev => prev === 'mechanic' ? 'mechanic' : 'owner');
        supabase.from('garages').select('id').eq('owner_id', session.user.id).single().then(({ data }) => {
          if (data) setGarageId(data.id);
          else {
            supabase.from('garages').insert({ owner_id: session.user.id, name: 'My Garage' }).select().single().then(res => {
              if(res.data) setGarageId(res.data.id);
            });
          }
        });
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setRole(prev => {
          if (prev === 'mechanic') return 'mechanic';
          supabase.from('garages').select('id').eq('owner_id', session.user.id).single().then(({ data }) => {
            if (data) setGarageId(data.id);
          });
          return 'owner';
        });
      } else {
        setRole(prev => prev === 'owner' ? null : prev);
      }
    });
  }, []);

  useEffect(() => {
    if (role === 'owner' && garageId) {
      loadGarageData();
    } else if (role === 'mechanic' && mechanicId) {
      loadMechanicData();
    }
  }, [role, garageId, mechanicId]);

  const loadGarageData = async () => {
    if (!garageId) return;
    const { data: dbMechanics } = await supabase.from('mechanics').select('*').eq('garage_id', garageId);
    if(dbMechanics) {
      setWorkers(dbMechanics.map(m => ({
        id: m.id,
        name: m.name,
        role: 'Worker',
        specialty: '',
        phone: '',
        description: '',
        image: '',
        isVerified: true,
        status: 'active',
        completedJobs: 0,
        rating: 5,
        createdAt: 0
      })));
    }
    
    const dbJobs = await fetchJobsForGarage(garageId);
    setJobs(dbJobs);
    
    // Revenue sum logic
    const rev = dbJobs.filter(j => j.released).reduce((acc, j) => acc + (j.laborFeeFcfa || 0), 0);
    setTodayRevenue(rev);
  };

  const loadMechanicData = async () => {
    if (!mechanicId) return;
    const dbJobs = await fetchJobsForMechanic(mechanicId);
    setJobs(dbJobs);
  };

  const handleLoginSuccess = (userRole: 'owner' | 'mechanic', id?: string) => {
    setRole(userRole);
    if (userRole === 'mechanic' && id) {
      setMechanicId(id);
      setActiveTab('queue'); // Mechanics go straight to queue
    }
  };

  const handleJobCreated = async (newJob: Job) => {
    setJobs((prev) => [newJob, ...prev]);
    try {
      const mechanic = workers.find(w => w.name === newJob.mechanicAssigned);
      await createJob(newJob, garageId!, mechanic?.id || '');
      
      let dashboardUrl = newJob.dashboardPhotoUrl;
      let exteriorUrl = newJob.exteriorPhotoUrl;

      if (dashboardUrl?.startsWith('blob:')) {
        const blob = await fetch(dashboardUrl).then(res => res.blob());
        dashboardUrl = await uploadMedia(newJob.id, blob, 'intake_dash');
        URL.revokeObjectURL(newJob.dashboardPhotoUrl!);
      }
      if (exteriorUrl?.startsWith('blob:')) {
        const blob = await fetch(exteriorUrl).then(res => res.blob());
        exteriorUrl = await uploadMedia(newJob.id, blob, 'intake_body');
        URL.revokeObjectURL(newJob.exteriorPhotoUrl!);
      }
      
      setJobs((prev) => prev.map(j => j.id === newJob.id ? { ...j, dashboardPhotoUrl: dashboardUrl, exteriorPhotoUrl: exteriorUrl } : j));

      if(role === 'owner') loadGarageData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateJob = (updatedJob: Job) => {
    setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
  };

  const handleJobReleased = async (job: Job, fee: number) => {
    try {
      await updateJobStatus(job.id, 'Ready/Released', fee);
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
    } catch (ex) {
      console.error('Failed to release job', ex);
    }
  };

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

  const handleSignOut = () => {
    if(role === 'owner') supabase.auth.signOut();
    setRole(null);
    setMechanicId(null);
    setGarageId(null);
  };

  if (!role) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const activeQueueCount = jobs.filter((j) => !j.released && j.status !== 'Ready/Released').length;
  const readyCheckoutCount = jobs.filter((j) => !j.released && j.status === 'Ready/Released').length;

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
    if (selected) setActiveTab(selected);
  };

  const navTabItems: TabItem[] = role === 'owner' ? [
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
  ] : [
    {
      id: 'tab-queue-btn',
      label: 'My Queue',
      color: '#10B981',
      badge: activeQueueCount,
      icon: <Wrench className="w-[1.25em] h-[1.25em] stroke-[2.4]" />,
    }
  ];

  return (
    <div className="min-h-screen bg-stone-100 text-slate-800 flex flex-col items-center justify-between font-sans text-view-enhanced">
      <header className="w-full bg-[#0E2829] text-white border-b-2 border-emerald-500/30 sticky top-0 z-40 shadow-md">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              onClick={() => setShowAboutModal(true)}
              className="w-10 h-10 rounded-xl bg-[#142F30] border-l-4 border-[#34D399] flex items-center justify-center p-1.5 text-white active:scale-95"
            >
              <MotologaLogo variant="icon" size="sm" accentColor="#34D399" />
            </button>
            <h1 className="text-base sm:text-xl font-black tracking-wider uppercase text-white font-mono truncate">
              MOTOLOGA
            </h1>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleSignOut}
              className="px-3 py-1 rounded-lg bg-rose-900 border border-rose-500 text-rose-300 text-xs font-bold active:scale-95"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-2xl flex-1 px-3 sm:px-4 pt-3 sm:pt-4 pb-28 sm:pb-32">
        {activeTab === 'intake' && role === 'owner' && (
          <IntakeScreen
            onJobCreated={handleJobCreated}
            onNavigateToQueue={() => setActiveTab('queue')}
            availableMechanics={workers.map((w) => w.name)}
          />
        )}

        {activeTab === 'queue' && (
          <MechanicQueueScreen
            jobs={jobs}
            deferredRepairs={deferredRepairs}
            onUpdateRepairs={setDeferredRepairs}
            onUpdateJob={handleUpdateJob}
            onNavigateToCheckout={(jobId) => {
              if(jobId) setSelectedCheckoutJobId(jobId);
              setActiveTab('checkout');
            }}
          />
        )}

        {activeTab === 'checkout' && role === 'owner' && (
          <CheckoutScreen
            jobs={jobs}
            todayRevenue={todayRevenue}
            onUpdateJob={handleUpdateJob}
            onJobReleased={handleJobReleased}
            onAddDeferredRepair={(rep) => setDeferredRepairs(prev => [rep, ...prev])}
            selectedJobId={selectedCheckoutJobId}
          />
        )}

        {activeTab === 'workers' && role === 'owner' && (
          <WorkersScreen
            workers={workers}
            onAddWorker={handleAddWorker}
            onDeleteWorker={handleDeleteWorker}
            onToggleStatus={handleToggleWorkerStatus}
            onNavigateToQueue={() => setActiveTab('queue')}
          />
        )}
      </main>

      <nav className="fixed bottom-3 sm:bottom-6 inset-x-0 mx-auto z-50 flex justify-center items-center px-3 sm:px-6 pointer-events-none transition-all duration-300">
        <div className="w-full max-w-[310px] sm:max-w-[460px] md:max-w-[520px] pointer-events-auto filter drop-shadow-[0_16px_32px_rgba(0,0,0,0.65)]">
          <AnimatedTabBar
            items={navTabItems}
            activeIndex={role === 'mechanic' ? 0 : currentTabIndex}
            onTabChange={handleTabChange}
            barColor="#0E2829"
          />
        </div>
      </nav>
      
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#0E2829] text-white rounded-3xl overflow-hidden shadow-2xl border-2 flex flex-col p-6">
            <h2 className="text-xl font-bold mb-4">MOTOLOGA System Info</h2>
            <p className="text-emerald-300 text-sm">Mode: <span className="uppercase">{role}</span></p>
            <button onClick={() => setShowAboutModal(false)} className="mt-6 bg-[#34D399] text-[#0E2829] p-3 rounded-lg font-bold">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
