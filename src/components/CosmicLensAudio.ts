/**
 * Web Audio API synthesizer for the Cosmic Lens page.
 * Synthesizes retro-futuristic sound effects without external audio assets.
 */

let audioCtx: AudioContext | null = null;
let ambientOsc: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;
let isMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    // @ts-ignore
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

export function initAudio() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume();
  }
  // Start ambient drone if not already started
  startAmbientDrone();
}

export function setMuted(muted: boolean) {
  isMuted = muted;
  if (ambientGain) {
    ambientGain.gain.setValueAtTime(muted ? 0 : 0.04, audioCtx?.currentTime || 0);
  }
}

export function getMuteState(): boolean {
  return isMuted;
}

export function playHoverSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') return;

  const now = ctx.currentTime;
  
  // Create nodes
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  // Settings
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);

  filter.type = 'bandpass';
  filter.Q.setValueAtTime(10, now);
  filter.frequency.setValueAtTime(800, now);
  filter.frequency.exponentialRampToValueAtTime(1600, now + 0.15);

  gain.gain.setValueAtTime(0.015, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

  osc.start(now);
  osc.stop(now + 0.2);
}

export function playClickSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') return;

  const now = ctx.currentTime;

  // Synthesize a sci-fi "warp focus" sweep
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(150, now);
  osc1.frequency.exponentialRampToValueAtTime(600, now + 0.4);

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(75, now);
  osc2.frequency.exponentialRampToValueAtTime(300, now + 0.4);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(200, now);
  filter.frequency.exponentialRampToValueAtTime(1500, now + 0.3);

  gain.gain.setValueAtTime(0.06, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.5);
  osc2.stop(now + 0.5);
}

export function playZoomOutSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') return;

  const now = ctx.currentTime;

  // Synthesize a reverse "warp drop"
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(500, now);
  osc.frequency.exponentialRampToValueAtTime(100, now + 0.4);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1200, now);
  filter.frequency.exponentialRampToValueAtTime(150, now + 0.4);

  gain.gain.setValueAtTime(0.04, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

  osc.start(now);
  osc.stop(now + 0.5);
}

export function playSliderSound(value: number) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  // Map slider percentage (0-1) to pitch
  const freq = 200 + value * 400;
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.008, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

  osc.start(now);
  osc.stop(now + 0.1);
}

function startAmbientDrone() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx || ambientOsc) return;

  try {
    const now = ctx.currentTime;
    ambientOsc = ctx.createOscillator();
    ambientGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    ambientOsc.connect(filter);
    filter.connect(ambientGain);
    ambientGain.connect(ctx.destination);

    ambientOsc.type = 'triangle';
    ambientOsc.frequency.setValueAtTime(55, now); // Low A note

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, now);

    ambientGain.gain.setValueAtTime(0.04, now);

    ambientOsc.start(now);
  } catch (e) {
    console.warn('Failed to start ambient drone:', e);
  }
}

export function stopAmbientDrone() {
  if (ambientOsc) {
    try {
      ambientOsc.stop();
      ambientOsc.disconnect();
    } catch (e) {}
    ambientOsc = null;
  }
  if (ambientGain) {
    ambientGain.disconnect();
    ambientGain = null;
  }
}
