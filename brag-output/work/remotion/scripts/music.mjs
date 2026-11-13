// Writes public/music.wav: 20 s at 120 BPM in F major, every part on one beat grid.
import fs from "node:fs";

const SR = 44100;
const BPM = 120;
const BEAT = 60 / BPM; // 0.5 s
const BAR = BEAT * 4; // 2 s
const LEN = 20;
const N = Math.round(SR * LEN);
const L = new Float32Array(N);
const R = new Float32Array(N);

const midi = (n) => 440 * 2 ** ((n - 69) / 12);
const add = (i, v, pan = 0) => {
  if (i < 0 || i >= N) return;
  L[i] += v * (1 - Math.max(0, pan));
  R[i] += v * (1 + Math.min(0, pan));
};

// Fmaj7 · Am7 · Dm7 · Bbmaj7, five passes of the loop
const CHORDS = [
  [53, 57, 60, 64],
  [57, 60, 64, 67],
  [50, 53, 57, 60],
  [58, 62, 65, 69],
];
const ROOTS = [41, 45, 38, 46];

// Seeded noise so every render is identical
let seed = 7;
const noise = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;

function pad(start, dur, notes, gain) {
  const s0 = Math.round(start * SR);
  const len = Math.round(dur * SR);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.35) * Math.min(1, (dur - t) / 0.3);
    let v = 0;
    for (const [k, n] of notes.entries()) {
      const f = midi(n + 12);
      v += Math.sin(2 * Math.PI * f * t + k) + 0.25 * Math.sin(4 * Math.PI * f * t);
    }
    add(s0 + i, (v / notes.length) * env * gain, Math.sin(t * 0.7) * 0.3);
  }
}

function bass(start, note, dur, gain) {
  const s0 = Math.round(start * SR);
  const len = Math.round(dur * SR);
  const f = midi(note);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const env = Math.exp(-t * 5) * Math.min(1, t / 0.005);
    const tri = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * f * t));
    add(s0 + i, tri * env * gain);
  }
}

function kick(start, gain) {
  const s0 = Math.round(start * SR);
  let phase = 0;
  for (let i = 0; i < SR * 0.3; i++) {
    const t = i / SR;
    phase += (2 * Math.PI * (48 + 90 * Math.exp(-t * 28))) / SR;
    add(s0 + i, Math.sin(phase) * Math.exp(-t * 11) * gain);
  }
}

function hat(start, gain, pan) {
  const s0 = Math.round(start * SR);
  let prev = 0;
  for (let i = 0; i < SR * 0.04; i++) {
    const n = noise();
    const hp = n - prev; // crude high-pass
    prev = n;
    add(s0 + i, hp * Math.exp((-i / SR) * 90) * gain, pan);
  }
}

function pluck(start, note, gain, pan) {
  const s0 = Math.round(start * SR);
  const f = midi(note);
  for (let i = 0; i < SR * 0.6; i++) {
    const t = i / SR;
    const env = Math.exp(-t * 7) * Math.min(1, t / 0.003);
    add(s0 + i, (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(6 * Math.PI * f * t)) * env * gain, pan);
  }
}

// Soft rising noise swell that resolves exactly on a cut
function swell(at, gain) {
  const dur = 0.45;
  const s0 = Math.round((at - dur) * SR);
  let lp = 0;
  for (let i = 0; i < SR * dur; i++) {
    const t = i / SR;
    const a = 0.02 + (t / dur) * 0.25; // filter opens as it rises
    lp += a * (noise() - lp);
    add(s0 + i, lp * (t / dur) ** 2 * gain, 0.2);
  }
}

const bars = LEN / BAR;
for (let b = 0; b < bars; b++) {
  const t0 = b * BAR;
  const chord = CHORDS[b % 4];
  const last = b === bars - 1;
  pad(t0, last ? BAR : BAR + 0.05, chord, 0.09);
  // Bass on every beat, octave lift on beat 3
  for (let k = 0; k < 4; k++) bass(t0 + k * BEAT, ROOTS[b % 4] + (k === 2 ? 12 : 0), BEAT * 0.9, 0.16);
  // Drums enter after the hook's first bar
  if (b >= 1 && !last) {
    kick(t0, 0.5);
    kick(t0 + 2 * BEAT, 0.42);
    for (let k = 0; k < 8; k++) if (k % 2 === 1) hat(t0 + (k * BEAT) / 2, 0.05, k % 4 === 1 ? -0.4 : 0.4);
  }
  if (last) kick(t0, 0.5);
  // Plucked chord tones in eighths from bar 2, quieter than the drums
  if (b >= 1 && !last) {
    const arp = [chord[3] + 12, chord[1] + 12, chord[2] + 12, chord[0] + 24];
    for (let k = 0; k < 8; k++) pluck(t0 + (k * BEAT) / 2, arp[k % 4], 0.05, k % 2 ? 0.3 : -0.3);
  }
}

// Swells into each scene change (seconds, all on beats)
for (const cut of [3, 8, 12.5, 15.5, 18]) swell(cut, 0.12);

// Light stereo delay as shared space, then a gentle fade at the end
const d = Math.round(BEAT * 0.75 * SR);
for (let i = d; i < N; i++) {
  L[i] += R[i - d] * 0.18;
  R[i] += L[i - d] * 0.18;
}
const fade = SR * 1.2;
let peak = 0;
for (let i = 0; i < N; i++) {
  const g = i > N - fade ? (N - i) / fade : 1;
  L[i] *= g;
  R[i] *= g;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = 0.85 / peak;

const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0);
buf.writeUInt32LE(36 + N * 4, 4);
buf.write("WAVEfmt ", 8);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write("data", 36);
buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * norm)) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * norm)) * 32767), 46 + i * 4);
}
fs.writeFileSync(new URL("../public/music.wav", import.meta.url), buf);
console.log(`music.wav: ${LEN}s, peak normalised from ${peak.toFixed(2)}`);
