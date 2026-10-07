/**
 * Haptics and sound. Sources: TCG Pocket re-creates the pack tear "in sound and vibration"
 * (research/05 §1.5); Retro's Rewind dial "clicks" with "a subtle vibration as each new memory
 * loads" (research/02 §B4.6). Sounds are synthesised with WebAudio — no audio files.
 */

let switchEl: HTMLInputElement | null = null;

/** iOS 18+ Safari: toggling a switch input plays a system haptic. Android/Chrome: Vibration API. */
export function haptic(kind: 'light' | 'medium' | 'heavy' | 'success' = 'light') {
  const nav = navigator as Navigator & { vibrate?: (p: number | number[]) => boolean };
  if (nav.vibrate) {
    nav.vibrate(kind === 'light' ? 8 : kind === 'medium' ? 16 : kind === 'heavy' ? 30 : [12, 40, 18]);
    return;
  }
  if (!switchEl) {
    const label = document.createElement('label');
    label.className = 'haptic-switch';
    switchEl = document.createElement('input');
    switchEl.type = 'checkbox';
    switchEl.setAttribute('switch', '');
    label.appendChild(switchEl);
    document.body.appendChild(label);
  }
  (switchEl.parentElement as HTMLLabelElement).click();
}

let ctx: AudioContext | null = null;
function audio() {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

let muted = false;
export const setMuted = (m: boolean) => {
  muted = m;
};

function noiseBurst(duration: number, freq: number, q: number, gain: number, startAt = 0) {
  const a = audio();
  if (!a || muted) return;
  const len = Math.floor(a.sampleRate * duration);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
  const src = a.createBufferSource();
  src.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = freq;
  f.Q.value = q;
  const g = a.createGain();
  g.gain.value = gain;
  src.connect(f).connect(g).connect(a.destination);
  src.start(a.currentTime + startAt);
}

function tone(freq: number, duration: number, gain: number, type: OscillatorType = 'sine', startAt = 0, slideTo?: number) {
  const a = audio();
  if (!a || muted) return;
  const o = a.createOscillator();
  o.type = type;
  const g = a.createGain();
  const t0 = a.currentTime + startAt;
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + duration);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  o.connect(g).connect(a.destination);
  o.start(t0);
  o.stop(t0 + duration + 0.02);
}

export const sfx = {
  shutter() {
    noiseBurst(0.05, 3200, 0.7, 0.35);
    noiseBurst(0.07, 1800, 0.9, 0.25, 0.06);
  },
  click() {
    tone(2200, 0.018, 0.12, 'square');
  },
  /** Pack tear: a ripping noise sweep. */
  rip(progress = 1) {
    for (let i = 0; i < 6; i++) noiseBurst(0.04, 1200 + i * 500 * progress, 2.5, 0.22, i * 0.03);
  },
  /** Rare-pack tell: a sharp crack. */
  crack() {
    noiseBurst(0.12, 900, 0.6, 0.6);
    tone(140, 0.25, 0.25, 'triangle', 0, 60);
  },
  sparkle() {
    [1320, 1760, 2349].forEach((f, i) => tone(f, 0.18, 0.06, 'sine', i * 0.07));
  },
  pop() {
    tone(520, 0.08, 0.15, 'sine', 0, 880);
  },
  send() {
    tone(660, 0.07, 0.12, 'sine', 0, 990);
    tone(990, 0.09, 0.08, 'sine', 0.06);
  },
  develop() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.35, 0.08, 'triangle', i * 0.09));
  },
};
