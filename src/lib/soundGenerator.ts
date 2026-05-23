/**
 * Programmatic Web Audio Synthesizer for Retro Polaroid Camera Sound Effects.
 * No external file downloads required, completely browser-native.
 */

export function playCameraSounds() {
  if (typeof window === 'undefined') return;

  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // ==========================================
    // 1. SHUTTER CLICK SOUND (Metallic Snap)
    // ==========================================
    
    // Create Noise Buffer
    const bufferSize = ctx.sampleRate * 0.05; // 50ms of noise
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(1000, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(8000, now + 0.04);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    // Osc click element for the mechanical "slap"
    const osc1 = ctx.createOscillator();
    const oscGain = ctx.createGain();
    
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(120, now);
    osc1.frequency.exponentialRampToValueAtTime(40, now + 0.03);

    oscGain.gain.setValueAtTime(0.8, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);

    osc1.connect(oscGain);
    oscGain.connect(ctx.destination);

    // Start shutter click
    noise.start(now);
    osc1.start(now);
    noise.stop(now + 0.05);
    osc1.stop(now + 0.05);

    // ==========================================
    // 2. MOTOR EJECTION HUM (Film sliding out)
    // ==========================================
    // Delay motor slightly to match shutter firing (e.g., 0.1s delay)
    const motorStart = now + 0.12;
    const motorDuration = 1.2; // 1.2 seconds of ejection hum

    const motorOsc1 = ctx.createOscillator();
    const motorOsc2 = ctx.createOscillator();
    const motorFilter = ctx.createBiquadFilter();
    const motorGain = ctx.createGain();

    motorOsc1.type = 'sawtooth';
    motorOsc1.frequency.setValueAtTime(85, motorStart);
    // Subtle modulations to make it sound mechanical
    motorOsc1.frequency.linearRampToValueAtTime(90, motorStart + motorDuration * 0.5);
    motorOsc1.frequency.linearRampToValueAtTime(80, motorStart + motorDuration);

    motorOsc2.type = 'square';
    motorOsc2.frequency.setValueAtTime(86.5, motorStart); // Slightly detuned
    motorOsc2.frequency.linearRampToValueAtTime(91.5, motorStart + motorDuration * 0.5);
    motorOsc2.frequency.linearRampToValueAtTime(81.5, motorStart + motorDuration);

    motorFilter.type = 'lowpass';
    motorFilter.frequency.setValueAtTime(220, motorStart);
    motorFilter.Q.setValueAtTime(3, motorStart);

    // Fade in motor and fade out at the end
    motorGain.gain.setValueAtTime(0.0, motorStart);
    motorGain.gain.linearRampToValueAtTime(0.18, motorStart + 0.08); // Fade in
    motorGain.gain.setValueAtTime(0.18, motorStart + motorDuration - 0.15);
    motorGain.gain.exponentialRampToValueAtTime(0.001, motorStart + motorDuration); // Fade out

    motorOsc1.connect(motorFilter);
    motorOsc2.connect(motorFilter);
    motorFilter.connect(motorGain);
    motorGain.connect(ctx.destination);

    motorOsc1.start(motorStart);
    motorOsc2.start(motorStart);
    
    motorOsc1.stop(motorStart + motorDuration);
    motorOsc2.stop(motorStart + motorDuration);

  } catch (error) {
    console.warn('Web Audio synthesis failed or blocked by browser autoplays:', error);
  }
}
