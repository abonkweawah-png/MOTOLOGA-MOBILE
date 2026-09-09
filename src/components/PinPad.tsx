import React, { useState } from 'react';

interface PinPadProps {
  onLogin: (mechanicId: string, pin: string) => void;
  mechanics: { id: string; name: string; avatar?: string }[];
}

export const PinPad: React.FC<PinPadProps> = ({ onLogin, mechanics }) => {
  const [selectedMechanic, setSelectedMechanic] = useState<string | null>(null);
  const [pin, setPin] = useState<string>('');

  const handleMechanicSelect = (id: string) => {
    setSelectedMechanic(id);
    setPin('');
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        onLogin(selectedMechanic!, newPin);
        setPin(''); // Reset after attempt
      }
    }
  };

  if (!selectedMechanic) {
    return (
      <div className="min-h-screen bg-stone-950 p-6 flex flex-col justify-center text-white">
        <h2 className="text-3xl font-black text-center mb-8 uppercase tracking-widest text-[#34D399]">Who are you?</h2>
        <div className="grid grid-cols-2 gap-4">
          {mechanics.map(m => (
            <button
              key={m.id}
              onClick={() => handleMechanicSelect(m.id)}
              className="bg-[#0E2829] border border-emerald-500 rounded-2xl p-6 flex flex-col items-center gap-4 active:scale-95 transition-transform"
            >
              <div className="w-16 h-16 bg-[#142F30] rounded-full flex items-center justify-center text-2xl border border-emerald-400">
                {m.name.charAt(0)}
              </div>
              <span className="font-bold text-xl">{m.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 p-6 flex flex-col justify-center items-center text-white">
      <h2 className="text-2xl font-bold mb-4">Enter PIN</h2>
      <div className="flex gap-4 mb-8">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`w-6 h-6 rounded-full border-2 ${i < pin.length ? 'bg-[#34D399] border-[#34D399]' : 'border-stone-600'}`}></div>
        ))}
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            className="w-20 h-20 text-3xl font-black rounded-full bg-[#142F30] border border-emerald-500/30 flex items-center justify-center active:scale-95 active:bg-[#34D399] active:text-stone-900 transition-all"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => setSelectedMechanic(null)}
          className="w-20 h-20 text-lg font-bold rounded-full bg-stone-800 flex items-center justify-center active:scale-95"
        >
          Cancel
        </button>
        <button
          onClick={() => handleKeyPress('0')}
          className="w-20 h-20 text-3xl font-black rounded-full bg-[#142F30] border border-emerald-500/30 flex items-center justify-center active:scale-95 active:bg-[#34D399] active:text-stone-900 transition-all"
        >
          0
        </button>
        <button
          onClick={() => setPin(pin.slice(0, -1))}
          className="w-20 h-20 text-lg font-bold rounded-full bg-stone-800 flex items-center justify-center active:scale-95"
        >
          Del
        </button>
      </div>
    </div>
  );
};
