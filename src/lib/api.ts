import { supabase } from './supabase';
import { Job, WorkerProfile, DeferredRepair, WorkerStatus } from '../types';

export const uploadMedia = async (jobId: string, file: Blob, type: string) => {
  const fileName = `${jobId}-${Date.now()}-${type}.jpeg`;
  const { data, error } = await supabase.storage
    .from('motologa_media')
    .upload(fileName, file, { contentType: 'image/jpeg' });

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from('motologa_media')
    .getPublicUrl(fileName);

  // Save to job_media table
  const { error: dbError } = await supabase.from('job_media').insert({
    job_id: jobId,
    file_url: publicUrlData.publicUrl,
    type,
  });

  if (dbError) {
    throw dbError;
  }

  return publicUrlData.publicUrl;
};

// Map DB Job to UI Job
const mapDbJobToUiJob = (dbJob: any, mechanicName: string = 'Unassigned'): Job => {
  let uiStatus: Job['status'] = 'Diagnosis';
  if (dbJob.status === 'active') uiStatus = 'In Repair';
  if (dbJob.status === 'ready') uiStatus = 'Ready/Released';
  // If intake, it acts as Diagnosis or Awaiting Approval. Let's just use Diagnosis.

  return {
    id: dbJob.id,
    licensePlate: dbJob.plate,
    customerPhone: '', // Not in schema
    vehicleModel: '', // Not in schema
    mechanicAssigned: mechanicName,
    status: uiStatus,
    createdAt: new Date(dbJob.created_at || Date.now()).getTime(),
    partSource: 'Garage Stock',
    laborFeeFcfa: dbJob.labor_fee || 0,
    released: dbJob.status === 'ready',
    dashboardPhotoUrl: dbJob.job_media?.find((m: any) => m.type === 'intake_dash')?.file_url || '',
    exteriorPhotoUrl: dbJob.job_media?.find((m: any) => m.type === 'intake_body')?.file_url || '',
    oldPartPhotoUrl: dbJob.job_media?.find((m: any) => m.type === 'old_part')?.file_url || '',
    newPartPhotoUrl: dbJob.job_media?.find((m: any) => m.type === 'new_part')?.file_url || '',
    voiceNoteUrl: dbJob.job_media?.find((m: any) => m.type === 'voice_note')?.file_url || '',
  };
};

export const fetchMechanicById = async (mechanicId: string): Promise<WorkerProfile | null> => {
  const { data, error } = await supabase.from('mechanics').select(`*`).eq('id', mechanicId).single();
  if (error || !data) return null;
  return {
    id: data.id,
    name: data.name,
    role: data.role || 'Apprentice',
    specialty: data.specialty || '',
    phone: data.phone || '',
    description: '',
    image: '',
    isVerified: true,
    status: 'active' as WorkerStatus,
    completedJobs: 0,
    rating: 5,
    createdAt: Date.now(),
    pinCode: data.pin_code,
    colorBadge: data.color_badge,
  };
};

export const fetchMechanics = async (garageIdArg: string) => {
  const { data, error } = await supabase.from('mechanics').select('*').eq('garage_id', garageIdArg);
  
  if (error) {
    console.error("fetchMechanics error", error);
    return [];
  }
  return data || [];
};

export const createMechanic = async (garageId: string, name: string, pinCode: string, colorBadge: string, phone?: string, role?: string, specialty?: string) => {
  const { data, error } = await supabase.from('mechanics').insert({
    garage_id: garageId,
    name,
    pin_code: pinCode,
    color_badge: colorBadge,
    phone,
    role,
    specialty
  }).select().single();
  if (error || !data) throw new Error(error?.message || "Failed to create mechanic");
  return data;
};

export const deleteMechanic = async (mechanicId: string) => {
  const { data, error } = await supabase.from('mechanics').delete().eq('id', mechanicId).select().single();
  if (error || !data) throw new Error(error?.message || "Failed to delete mechanic");
};

export const updateMechanicPin = async (mechanicId: string, pinCode: string) => {
  const { data, error } = await supabase.from('mechanics').update({ pin_code: pinCode }).eq('id', mechanicId).select().single();
  if (error || !data) throw new Error(error?.message || "Failed to update mechanic PIN");
};

export const fetchJobsForGarage = async (garageId: string) => {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      job_media(*),
      mechanics(name)
    `)
    .eq('garage_id', garageId);

  if (error) {
    console.error('Error fetching jobs', error);
    return [];
  }

  return data.map((d: any) => mapDbJobToUiJob(d, d.mechanics?.name));
};

export const fetchJobsForMechanic = async (mechanicId: string) => {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      job_media(*),
      mechanics!inner(name)
    `)
    .eq('mechanic_id', mechanicId);

  if (error) {
    console.error('Error fetching jobs', error);
    return [];
  }

  return data.map((d: any) => mapDbJobToUiJob(d, d.mechanics.name));
};

export const createJob = async (job: Partial<Job>, garageId: string, mechanicId: string) => {
  let dbStatus = 'intake';
  if (job.status === 'In Repair') dbStatus = 'active';
  if (job.status === 'Ready/Released') dbStatus = 'ready';

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      garage_id: garageId,
      mechanic_id: mechanicId,
      plate: job.licensePlate || 'UNKNOWN',
      status: dbStatus,
      labor_fee: job.laborFeeFcfa || 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Insert failed: No data returned from Supabase.");
  return data;
};

export const updateJobStatus = async (jobId: string, status: string, laborFee: number = 0) => {
  let dbStatus = 'intake';
  if (status === 'In Repair') dbStatus = 'active';
  if (status === 'Ready/Released') dbStatus = 'ready';

  const { data, error } = await supabase
    .from('jobs')
    .update({ status: dbStatus, labor_fee: laborFee })
    .eq('id', jobId)
    .select()
    .single();

  if (error || !data) throw new Error(error?.message || "Failed to update job status");
};

export const fetchDeferredRepairs = async (jobIds: string[]): Promise<DeferredRepair[]> => {
    if(!jobIds || jobIds.length === 0) return [];
  const { data, error } = await supabase
    .from('deferred_repairs')
    .select('*')
    .in('job_id', jobIds);

  if (error) {
    console.error('Error fetching deferred repairs', error);
    return [];
  }

  return data.map((d: any) => ({
    id: d.id,
    vehiclePlate: '', 
    customerPhone: '',
    componentToFix: d.component,
    targetDateString: d.target_date,
    status: d.status,
  }));
};

export const createDeferredRepair = async (repair: DeferredRepair, jobId: string) => {
  const { data, error } = await supabase.from('deferred_repairs').insert({
    job_id: jobId,
    component: repair.componentToFix,
    target_date: repair.targetDateString,
    status: repair.status,
  }).select().single();

  if (error || !data) throw new Error(error?.message || "Failed to create deferred repair");
  return data;
};
