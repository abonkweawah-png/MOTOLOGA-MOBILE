import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, ArrowLeft, Delete, ShieldAlert } from 'lucide-react';
import { MotologaLogo } from './MotologaLogo';

interface PinPadProps {
  onLogin: (mechanicId: string, pin: string) => void;
  mechanics: { id: string; name: string; avatar?: string }[];
}

export const PinPad: React.FC<PinPadProps> = ({ onLogin, mechanics }) => {
  const [selectedMechanic, setSelectedMechanic] = useState<{ id: string; name: string } | null>(null);
  const [pin, setPin] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMechanicSelect = (mechanic: { id: string; name: string }) => {
    setSelectedMechanic(mechanic);
    setPin('');
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < 4 && !isSubmitting) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        setIsSubmitting(true);
        setTimeout(() => {
          onLogin(selectedMechanic!.id, newPin);
          setIsSubmitting(false);
          setPin('');
        }, 300);
      }
    }
  };

  if (!selectedMechanic) {
    return (
      <div className="w-full max-w-md bg-[#0E2829]/80 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-emerald-500/25 shadow-2xl text-white my-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#142F30] border border-emerald-400/30 mx-auto flex items-center justify-center p-2 mb-3 shadow-lg">
            <MotologaLogo variant="icon" size="sm" accentColor="#34D399" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-wider text-[#34D399] font-mono">
            Mechanic Terminal
          </h2>
          <p className="text-xs text-slate-300 mt-1">Select your profile to access your active repair bay</p>
        </div>

        {/* Technician Grid */}
        <div className="grid grid-cols-2 gap-3.5">
          {mechanics.map((m) => (
            <motion.button
              key={m.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleMechanicSelect(m)}
              className="bg-[#081B1C]/90 hover:bg-[#142F30] border border-emerald-500/30 rounded-2xl p-4 flex flex-col items-center gap-3 transition-colors cursor-pointer shadow-md text-center group"
            >
              <div className="w-14 h-14 bg-[#142F30] group-hover:bg-[#1c3f41] rounded-2xl flex items-center justify-center text-xl font-black text-white border-2 border-emerald-400/40 shadow-inner">
                {m.name.charAt(0)}
              </div>
              <div>
                <span className="font-bold text-base text-white block">{m.name}</span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block mt-0.5">
                  Technician
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm bg-[#0E2829]/85 backdrop-blur-2xl p-6 sm:p-7 rounded-3xl border border-emerald-500/25 shadow-2xl text-white my-4 flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-emerald-500/20">
        <button
          onClick={() => {
            setSelectedMechanic(null);
            setPin('');
          }}
          className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 bg-[#142F30] px-2.5 py-1 rounded-lg border border-emerald-500/30 active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
          <span>Switch</span>
        </button>
        <span className="text-xs font-mono uppercase text-emerald-400 tracking-wider font-bold">
          {selectedMechanic.name}'s Station
        </span>
      </div>

      <div className="text-center mb-5">
        <div className="w-12 h-12 rounded-full bg-[#142F30] border-2 border-emerald-400 mx-auto flex items-center justify-center text-xl font-black mb-2 shadow-lg">
          {selectedMechanic.name.charAt(0)}
        </div>
        <h3 className="text-lg font-black tracking-wide">{selectedMechanic.name}</h3>
        <p className="text-xs text-slate-300">Enter your 4-digit security PIN</p>
      </div>

      {/* PIN Dots */}
      <div className="flex gap-4 mb-7">
        {[0, 1, 2, 3].map((i) => {
          const isFilled = i < pin.length;
          return (
            <motion.div
              key={i}
              initial={false}
              animate={{
                scale: isFilled ? 1.15 : 1,
                backgroundColor: isFilled ? '#34D399' : 'transparent',
                borderColor: isFilled ? '#34D399' : 'rgba(52, 211, 153, 0.3)',
              }}
              className="w-5 h-5 rounded-full border-2 shadow-sm transition-all"
            />
          );
        })}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3.5 w-full max-w-[280px]">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <motion.button
            key={num}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => handleKeyPress(num)}
            className="h-16 text-2xl font-black rounded-2xl bg-[#081B1C]/90 hover:bg-[#142F30] border border-emerald-500/25 text-white flex items-center justify-center active:bg-[#34D399] active:text-stone-950 transition-colors shadow-md cursor-pointer"
          >
            {num}
          </motion.button>
        ))}

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            setSelectedMechanic(null);
            setPin('');
          }}
          className="h-16 text-xs font-bold rounded-2xl bg-stone-900/80 hover:bg-stone-800 text-slate-300 flex items-center justify-center cursor-pointer border border-stone-700"
        >
          Cancel
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => handleKeyPress('0')}
          className="h-16 text-2xl font-black rounded-2xl bg-[#081B1C]/90 hover:bg-[#142F30] border border-emerald-500/25 text-white flex items-center justify-center active:bg-[#34D399] active:text-stone-950 transition-colors shadow-md cursor-pointer"
        >
          0
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setPin((p) => p.slice(0, -1))}
          className="h-16 text-xs font-bold rounded-2xl bg-stone-900/80 hover:bg-stone-800 text-rose-300 flex items-center justify-center cursor-pointer border border-stone-700 active:scale-95"
          aria-label="Delete last digit"
        >
          <Delete className="w-5 h-5" />
        </motion.button>
      </div>

      <div className="mt-5 text-center">
        <p className="text-[11px] font-mono text-slate-400">
          Demo PIN: Any 4 digits will authorize
        </p>
      </div>
    </div>
  );
};
