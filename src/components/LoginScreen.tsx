import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PinPad } from './PinPad';

interface LoginScreenProps {
  onLoginSuccess: (userRole: 'owner' | 'mechanic', mechanicId?: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'select' | 'owner' | 'mechanic'>('select');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mechanics, setMechanics] = useState<{ id: string; name: string }[]>([]);
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'mechanic') {
      supabase.from('mechanics').select('id, name').then(({ data }) => {
        if (data) setMechanics(data);
      });
    }
  }, [mode]);

  const handleOwnerAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isSignup) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      setLoading(false);
      if (error) setError(error.message);
      else if (data.session) onLoginSuccess('owner');
      else setError('Signup successful. Please verify email if required, or login.');
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (error) setError(error.message);
      else if (data.session) onLoginSuccess('owner');
    }
  };

  const handleMechanicLogin = async (mechanicId: string, pin: string) => {
    setLoading(true);
    const { data } = await supabase.from('mechanics').select('pin_code').eq('id', mechanicId).single();
    setLoading(false);
    if (data && data.pin_code === pin) {
      onLoginSuccess('mechanic', mechanicId);
    } else {
      setError('Invalid PIN code');
      // Briefly show error
      alert('Invalid PIN code');
    }
  };

  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-[#0E2829] flex flex-col items-center justify-center p-6 text-white space-y-6 text-center">
        <h1 className="text-4xl font-black tracking-widest text-[#34D399] uppercase mb-4">MOTOLOGA</h1>
        <p className="text-slate-300 font-mono mb-8">Access Workshop OS System</p>
        <button
          onClick={() => setMode('owner')}
          className="w-full max-w-sm py-4 bg-emerald-600 rounded-xl font-bold text-lg active:scale-95 transition-transform"
        >
          Owner / Manage
        </button>
        <button
          onClick={() => setMode('mechanic')}
          className="w-full max-w-sm py-4 bg-[#142F30] border border-emerald-500 rounded-xl font-bold text-lg active:scale-95 transition-transform"
        >
          Mechanic Login
        </button>
      </div>
    );
  }

  if (mode === 'mechanic') {
    return (
      <>
        <div className="absolute top-4 left-4 z-50">
          <button onClick={() => setMode('select')} className="text-white text-sm bg-stone-800 px-4 py-2 rounded-lg">Back</button>
        </div>
        <PinPad mechanics={mechanics} onLogin={handleMechanicLogin} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E2829] flex flex-col items-center justify-center p-6 text-white">
      <div className="w-full max-w-sm bg-stone-900 border border-emerald-500/30 p-6 rounded-2xl shadow-2xl">
        <button onClick={() => setMode('select')} className="text-emerald-400 text-sm mb-6">&larr; Back</button>
        <h2 className="text-2xl font-bold mb-6">{isSignup ? 'Owner Sign Up' : 'Owner Login'}</h2>
        {error && <div className="bg-rose-900/50 text-rose-300 p-3 rounded-lg text-sm mb-4">{error}</div>}
        <form onSubmit={handleOwnerAuth} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#34D399] text-stone-950 font-black tracking-wide rounded-lg p-3 mt-4 active:scale-95 transition-transform"
          >
            {loading ? 'Processing...' : (isSignup ? 'Sign Up' : 'Sign In')}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button 
            onClick={() => { setIsSignup(!isSignup); setError(''); }}
            className="text-emerald-400 text-sm hover:underline"
          >
            {isSignup ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};
