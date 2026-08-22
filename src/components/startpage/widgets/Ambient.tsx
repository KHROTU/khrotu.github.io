import { useEffect, useRef, useState } from 'react';
type SoundKey = 'rain' | 'brown' | 'white' | 'wind';
const SOUNDS: { key: SoundKey; label: string }[] = [
  { key: 'rain', label: 'rain' },
  { key: 'wind', label: 'wind' },
  { key: 'brown', label: 'brown' },
  { key: 'white', label: 'white' },
];
function makePinkBuffer(ctx: AudioContext, seconds = 4): AudioBuffer {
  const len = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.969 * b2 + w * 0.153852;
    b3 = 0.8665 * b3 + w * 0.3104856;
    b4 = 0.55 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.016898;
    d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
    b6 = w * 0.115926;
  }
  return buffer;
}
function makeBrownBuffer(ctx: AudioContext, seconds = 4): AudioBuffer {
  const len = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    last = (last + 0.02 * w) / 1.02;
    d[i] = last * 3.5;
  }
  return buffer;
}
function makeWhiteBuffer(ctx: AudioContext, seconds = 4): AudioBuffer {
  const len = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buffer;
}
function makeReverbIR(ctx: AudioContext, seconds = 4): AudioBuffer {
  const len = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buffer.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
  }
  return buffer;
}
function loopSource(ctx: AudioContext, buffer: AudioBuffer): AudioBufferSourceNode {
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  src.start();
  return src;
}
export default function Ambient() {
  const ctxRef = useRef<AudioContext | null>(null);
  const graphRef = useRef<{ out: GainNode; stops: (() => void)[] } | null>(null);
  const [active, setActive] = useState<SoundKey | null>(null);
  const [paused, setPaused] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const volumeRef = useRef(volume);
  useEffect(() => {
    volumeRef.current = volume;
    if (graphRef.current && ctxRef.current) {
      graphRef.current.out.gain.setTargetAtTime(volume, ctxRef.current.currentTime, 0.05);
    }
  }, [volume]);
  useEffect(() => {
    return () => {
      graphRef.current?.stops.forEach((s) => s());
      ctxRef.current?.close();
    };
  }, []);
  const ensureCtx = () => {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  };
  const buildGraph = (key: SoundKey, ctx: AudioContext) => {
    const out = ctx.createGain();
    out.gain.value = 0;
    out.gain.setTargetAtTime(volumeRef.current, ctx.currentTime, 0.6);
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -14;
    compressor.knee.value = 24;
    compressor.ratio.value = 3.2;
    compressor.attack.value = 0.02;
    compressor.release.value = 0.3;
    compressor.connect(out);
    out.connect(ctx.destination);
    const reverb = ctx.createConvolver();
    reverb.buffer = makeReverbIR(ctx, 4);
    const reverbSend = ctx.createGain();
    reverbSend.connect(reverb);
    reverb.connect(compressor);
    const stops: (() => void)[] = [];
    const noiseTo = (node: AudioNode, buffer: AudioBuffer, sendAmount: number) => {
      const src = loopSource(ctx, buffer);
      src.connect(node);
      const send = ctx.createGain();
      send.gain.value = sendAmount;
      node.connect(send);
      send.connect(reverbSend);
      stops.push(() => src.stop());
    };
    if (key === 'rain') {
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 900;
      hp.Q.value = 0.6;
      const peak = ctx.createBiquadFilter();
      peak.type = 'peaking';
      peak.frequency.value = 3200;
      peak.Q.value = 0.8;
      peak.gain.value = 6;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 7000;
      lp.Q.value = 0.5;
      hp.connect(peak).connect(lp).connect(compressor);
      noiseTo(hp, makePinkBuffer(ctx), 0.28);
      const flutter = ctx.createGain();
      flutter.gain.value = 1;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.13;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.16;
      lfo.connect(lfoGain).connect(flutter.gain);
      lfo.start();
      flutter.connect(compressor);
      stops.push(() => lfo.stop());
      const droplets = () => {
        const t = ctx.currentTime + 0.01;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 800 + Math.random() * 3200;
        bp.Q.value = 5 + Math.random() * 7;
        const g = ctx.createGain();
        const peakLevel = 0.05 + Math.random() * 0.1;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(peakLevel, t + 0.002);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03 + Math.random() * 0.05);
        const pan = ctx.createStereoPanner();
        pan.pan.value = Math.random() * 1.4 - 0.7;
        const burst = ctx.createBufferSource();
        burst.buffer = makeWhiteBuffer(ctx, 0.1);
        burst.connect(bp).connect(g).connect(pan).connect(compressor);
        const sendD = ctx.createGain();
        sendD.gain.value = 0.2;
        pan.connect(sendD).connect(reverbSend);
        burst.start(t);
        burst.stop(t + 0.15);
      };
      const scheduleDroplets = () => {
        if (graphRef.current?.out !== out) return;
        droplets();
        timerRef.current = setTimeout(scheduleDroplets, -Math.log(1 - Math.random()) * 120);
      };
      scheduleDroplets();
    } else if (key === 'wind') {
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 650;
      bp.Q.value = 0.9;
      const amp = ctx.createGain();
      amp.gain.value = 0.3;
      bp.connect(amp).connect(compressor);
      const mkLfo = (rate: number, depth: number, target: AudioParam, base: number) => {
        const osc = ctx.createOscillator();
        osc.frequency.value = rate;
        const g = ctx.createGain();
        g.gain.value = depth;
        target.value = base;
        osc.connect(g).connect(target);
        osc.start();
        stops.push(() => osc.stop());
      };
      mkLfo(0.07, 420, bp.frequency, 650);
      mkLfo(0.11, 180, bp.frequency, 650);
      mkLfo(0.09, 0.22, amp.gain, 0.3);
      noiseTo(bp, makePinkBuffer(ctx), 0.45);
    } else if (key === 'brown') {
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 400;
      lp.Q.value = 0.5;
      lp.connect(compressor);
      noiseTo(lp, makeBrownBuffer(ctx), 0.1);
    } else {
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 12000;
      lp.Q.value = 0.3;
      lp.connect(compressor);
      noiseTo(lp, makeWhiteBuffer(ctx), 0.05);
    }
    return { out, stops: [...stops, () => stops.forEach((s) => s())] };
  };
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopCurrent = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!graphRef.current || !ctxRef.current) return;
    const g = graphRef.current;
    g.out.gain.setTargetAtTime(0, ctxRef.current.currentTime, 0.3);
    setTimeout(() => g.stops.forEach((s) => s()), 1200);
    graphRef.current = null;
  };
  const play = (key: SoundKey) => {
    if (active === key) {
      if (paused) {
        ensureCtx();
        graphRef.current?.out.gain.setTargetAtTime(volumeRef.current, ctxRef.current!.currentTime, 0.3);
        setPaused(false);
      } else {
        graphRef.current?.out.gain.setTargetAtTime(0, ctxRef.current!.currentTime, 0.3);
        setPaused(true);
      }
      return;
    }
    stopCurrent();
    const ctx = ensureCtx();
    graphRef.current = buildGraph(key, ctx);
    setActive(key);
    setPaused(false);
  };
  const togglePlay = () => {
    if (!active) return;
    play(active);
  };
  return (
    <div className="w-full h-full flex flex-col justify-center gap-2 select-none min-h-0 overflow-y-auto hide-scrollbar">
      <div className="grid grid-cols-2 gap-1.5">
        {SOUNDS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => play(key)}
            className={`text-xs border rounded-sm px-2 py-1.5 transition-colors truncate ${
              active === key && !paused
                ? 'border-white/70 text-[var(--text-main)] bg-white/5'
                : 'border-white/15 text-[var(--text-muted)] hover:border-white/40 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={togglePlay}
          disabled={!active}
          aria-label={paused ? 'play' : 'pause'}
          className="text-[var(--text-muted)] hover:text-white transition-colors disabled:opacity-30 text-sm leading-none w-4"
        >
          {paused ? '▶' : '❚❚'}
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 h-5 flex items-center group">
            <div className="absolute inset-x-0 h-px bg-white/20" />
            <div className="absolute h-px bg-[var(--border-bezel)]" style={{ width: `${volume * 100}%` }} />
            <div
              className="absolute w-2.5 h-2.5 rounded-full bg-[var(--border-bezel)] -translate-x-1/2 pointer-events-none transition-transform group-hover:scale-125"
              style={{ left: `${volume * 100}%` }}
            />
            <input
              type="range"
              min={0}
              max={100}
              value={volume * 100}
              onChange={(e) => setVolume(Number(e.target.value) / 100)}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}