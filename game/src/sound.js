// The kitchen's voice: every sound is made with the Web Audio API on the spot, so the game ships no
// audio file and still answers a knife, a hot pan, the pass bell and a customer walking out. The
// context is only opened on the first gesture, as browsers demand.
const NOISE_SECONDS = 0.4;

export function createSound() {
  let context = null;
  let master = null;
  let noise = null;

  function open() {
    if (context) return context;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    context = new AudioContext();
    master = context.createGain();
    master.gain.value = 0.32;
    master.connect(context.destination);
    const length = Math.floor(context.sampleRate * NOISE_SECONDS);
    noise = context.createBuffer(1, length, context.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    return context;
  }

  function tone(freq, duration, type, gain, slideTo) {
    if (!open()) return;
    const now = context.currentTime;
    const osc = context.createOscillator();
    const env = context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), now + duration);
    env.gain.setValueAtTime(0.0001, now);
    env.gain.exponentialRampToValueAtTime(Math.max(0.001, gain), now + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(env);
    env.connect(master);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  function hiss(duration, gain, lowpass) {
    if (!open()) return;
    const now = context.currentTime;
    const source = context.createBufferSource();
    source.buffer = noise;
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowpass;
    const env = context.createGain();
    env.gain.setValueAtTime(gain, now);
    env.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.connect(filter);
    filter.connect(env);
    env.connect(master);
    source.start(now);
    source.stop(now + duration);
  }

  const SOUNDS = {
    pick: () => tone(720, 0.07, 'square', 0.06, 520),
    place: () => tone(300, 0.09, 'triangle', 0.09, 210),
    chop: () => {
      hiss(0.06, 0.16, 2400);
      tone(180, 0.05, 'square', 0.04, 120);
    },
    sizzle: () => hiss(0.34, 0.14, 5200),
    bell: () => {
      tone(1180, 0.4, 'sine', 0.1);
      tone(1760, 0.34, 'sine', 0.05);
    },
    order: () => {
      tone(880, 0.18, 'sine', 0.07);
      window.setTimeout(() => tone(1320, 0.2, 'sine', 0.05), 110);
    },
    serve: () => {
      tone(660, 0.1, 'triangle', 0.08);
      window.setTimeout(() => tone(880, 0.1, 'triangle', 0.07), 80);
      window.setTimeout(() => tone(1320, 0.16, 'triangle', 0.06), 160);
    },
    buzz: () => tone(150, 0.16, 'sawtooth', 0.07, 110),
    walkout: () => {
      tone(420, 0.16, 'sawtooth', 0.07, 240);
      window.setTimeout(() => tone(260, 0.24, 'sawtooth', 0.06, 140), 120);
    },
    bin: () => hiss(0.16, 0.1, 900),
    close: () => {
      [392, 494, 587].forEach((freq, index) => window.setTimeout(() => tone(freq, 0.5, 'sine', 0.06), index * 90));
    },
  };

  return function play(name) {
    const sound = SOUNDS[name];
    if (sound) sound();
  };
}
