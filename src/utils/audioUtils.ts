// Audio helper utilities for MOTOLOGA diagnostic voice notes

export function formatAudioTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Generate a lightweight, valid 3-second diagnostic tone WAV as a fallback Data URL
export function createDiagnosticSampleAudio(): string {
  const sampleRate = 8000;
  const duration = 2.5;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + numSamples);
  const view = new DataView(buffer);

  // RIFF header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, 1, true); // NumChannels (1 mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint16(32, 1, true); // BlockAlign
  view.setUint16(34, 8, true); // BitsPerSample
  writeString(36, 'data');
  view.setUint32(40, numSamples, true);

  // Generate a two-tone diagnostic beep sequence (approx. engine warning chime 440Hz / 660Hz)
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const freq = t < 1.2 ? 480 : 640;
    const decay = Math.max(0, 1 - (t % 1.2) * 0.8);
    const sample = Math.sin(2 * Math.PI * freq * t) * decay * 100;
    view.setUint8(44 + i, Math.min(255, Math.max(0, Math.floor(sample + 128))));
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}
