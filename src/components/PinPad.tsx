import React, { useState } from 'react';

interface PinPadProps {
  onLogin: (mechanicId: string, pin: string) => void;
  mechanics: { id: string; name: string; color_badge?: string }[];
}

export const PinPad: React.FC<PinPadProps> = ({ onLogin, mechanics }) => {
  const [selectedMechanic, setSelectedMechanic] = useState<{ id: string; name: string; image?: string } | null>(null);
  const [pin, setPin] = useState<string>('');

  const handleMechanicSelect = (id: string, name: string, image?: string) => {
    setSelectedMechanic({ id, name, image });
    setPin('');
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        onLogin(selectedMechanic!.id, newPin);
        setPin(''); // Reset after attempt
      }
    }
  };

  if (!selectedMechanic) {
    return (
      <div className="min-h-screen bg-stone-950 p-4 sm:p-6 flex flex-col justify-center text-white">
        <h2 className="text-2xl sm:text-4xl font-black text-center mb-8 uppercase tracking-widest text-[#34D399]">
          Select Foreman
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto w-full">
          {mechanics.filter(m => m.name !== 'Unassigned').map(m => {
            return (
              <button
                key={m.id}
                onClick={() => handleMechanicSelect(m.id, m.name, m.color_badge)}
                className="w-full aspect-square max-h-64 rounded-[32px] sm:rounded-[40px] flex flex-col items-center justify-end overflow-hidden active:scale-95 transition-transform shadow-2xl border-[3px] border-stone-800 focus:outline-none focus:border-[#34D399] focus:ring-4 focus:ring-[#34D399]/30 relative group"
              >
                <div className="absolute inset-0 z-0">
                  <img src={m.color_badge || ''} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-transparent"></div>
                </div>
                
                <div className="relative z-10 p-5 sm:p-6 w-full text-center">
                  <span className="font-black text-xl sm:text-2xl text-white drop-shadow-md truncate w-full block">
                    {m.name}
                  </span>
                  <span className="text-[#34D399] font-bold text-[10px] tracking-widest uppercase mt-1 drop-shadow-sm">Select Profile</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 p-6 flex flex-col justify-center items-center text-white">
      <h2 className="text-3xl font-black mb-2 text-[#34D399]">Login: {selectedMechanic.name}</h2>
      <p className="text-slate-400 font-bold mb-8 uppercase tracking-widest">Enter 4-Digit PIN</p>
      
      <div className="flex gap-4 sm:gap-6 mb-12">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`w-8 h-8 rounded-full border-4 transition-all ${i < pin.length ? 'bg-[#34D399] border-[#34D399] drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'border-stone-700 bg-stone-900'}`}></div>
        ))}
      </div>
      
      <div className="grid grid-cols-3 gap-4 sm:gap-6 max-w-md w-full">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            className="aspect-square text-4xl sm:text-5xl font-black rounded-3xl bg-stone-900 border-2 border-stone-800 flex items-center justify-center active:scale-95 active:bg-[#34D399] active:text-stone-950 active:border-[#34D399] transition-all"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => setSelectedMechanic(null)}
          className="aspect-square text-xl sm:text-2xl font-black rounded-3xl bg-stone-800 flex flex-col items-center justify-center text-slate-300 active:scale-95 hover:bg-stone-700 transition-colors uppercase"
        >
          Back
        </button>
        <button
          onClick={() => handleKeyPress('0')}
          className="aspect-square text-4xl sm:text-5xl font-black rounded-3xl bg-stone-900 border-2 border-stone-800 flex items-center justify-center active:scale-95 active:bg-[#34D399] active:text-stone-950 active:border-[#34D399] transition-all"
        >
          0
        </button>
        <button
          onClick={() => setPin(pin.slice(0, -1))}
          className="aspect-square text-xl sm:text-2xl font-black rounded-3xl bg-rose-950/40 border-2 border-rose-900/50 flex flex-col items-center justify-center text-rose-500 active:scale-95 hover:bg-rose-900 hover:text-white transition-colors uppercase"
        >
          Del
        </button>
      </div>
    </div>
  );
};
