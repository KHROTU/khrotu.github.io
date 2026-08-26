import { useEffect, useRef } from 'react';
type Loc = { lat: number; lon: number };
type WeatherSnap = { code: number; temp: number; wind: number; at: number };
type RGB = [number, number, number];
type ManualWeather = 'clear' | 'partly' | 'overcast' | 'drizzle' | 'rain' | 'showers' | 'snow' | 'storm';
const DEG = Math.PI / 180;
const WEATHER_KEY = 'startpage-widget-weather-data';
const LOCATION_KEY = 'startpage-widget-location';
const WIDGETS_KEY = 'startpage-widgets-v1';
const STALE_MS = 45 * 60 * 1000;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const c255 = (x: number) => Math.min(255, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const mixC = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const css = (c: RGB, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const NIGHT_Z: RGB = [4, 7, 19];
const NIGHT_H: RGB = [13, 20, 42];
const DAY_Z: RGB = [45, 108, 198];
const DAY_H: RGB = [186, 220, 245];
const DUSK_WARM: RGB = [255, 138, 74];
const DUSK_PINK: RGB = [196, 104, 126];
const SUN_DUSK: RGB = [255, 176, 114];
const SUN_DAY: RGB = [255, 244, 232];
const ROSE: RGB = [216, 122, 144];
const PRESET_CODE: Record<ManualWeather, number> = { clear: 0, partly: 2, overcast: 3, drizzle: 53, rain: 63, showers: 81, snow: 73, storm: 95 };
const OKTA: Record<number, number> = { 0: 0.05, 1: 0.19, 2: 0.44, 3: 0.97, 45: 0.8, 48: 0.8, 51: 0.78, 53: 0.83, 55: 0.88, 56: 0.84, 57: 0.88, 61: 0.9, 63: 0.95, 65: 0.97, 66: 0.94, 67: 0.96, 71: 0.85, 73: 0.88, 75: 0.92, 77: 0.85, 80: 0.58, 81: 0.72, 82: 0.85, 85: 0.85, 86: 0.9, 95: 0.95, 96: 0.96, 99: 0.97 };
function coverFor(code: number): number {
  if (OKTA[code] != null) return OKTA[code];
  if (code === 0) return 0.05;
  if (code === 1) return 0.19;
  if (code === 2) return 0.44;
  if (code === 3) return 0.97;
  if (code <= 48) return 0.8;
  if (code <= 57) return 0.82;
  if (code <= 67) return 0.93;
  if (code <= 77) return 0.87;
  if (code <= 82) return 0.58 + (code - 80) * 0.135;
  if (code <= 86) return 0.87;
  return 0.95;
}
function weatherProfile(code: number) {
  let cloud = coverFor(code), rain = 0, snow = 0, fog = 0, storm = false;
  if (code === 45 || code === 48) fog = 1;
  else if (code >= 51 && code <= 57) rain = 0.35;
  else if (code >= 61 && code <= 65) rain = code === 61 ? 0.6 : code === 63 ? 0.85 : 1;
  else if (code >= 66 && code <= 67) rain = 0.8;
  else if (code >= 71 && code <= 77) snow = code === 71 ? 0.5 : code === 73 ? 0.75 : 0.9;
  else if (code >= 80 && code <= 82) rain = 0.5 + (code - 80) * 0.25;
  else if (code >= 85 && code <= 86) snow = 0.8;
  else if (code >= 95) { rain = 1; storm = true }
  return { cloud, rain, snow, fog, storm };
}
function solarPos(lat: number, lon: number, date: Date) {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const n = jd - 2451545.0;
  const L = (280.46 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * DEG;
  const lam = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * DEG;
  const eps = (23.439 - 0.0000004 * n) * DEG;
  const posOf = (ra: number, dec: number) => {
    const gmst = (18.697374558 + 24.06570982441908 * n) % 24;
    const lst = (gmst * 15 + lon) * DEG;
    const H = lst - ra;
    const phi = lat * DEG;
    const elev = Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
    const az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi));
    return { elev: elev / DEG, az };
  };
  const dec = Math.asin(Math.sin(eps) * Math.sin(lam));
  const ra = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam));
  const d = n;
  const Lm = (218.316 + 13.176396 * d) % 360;
  const Mm = (134.963 + 13.064993 * d) % 360;
  const F = (93.272 + 13.22935 * d) % 360;
  const lamM = (Lm + 6.289 * Math.sin(Mm * DEG)) * DEG;
  const betaM = 5.128 * Math.sin(F * DEG);
  const decM = Math.asin(Math.sin(betaM * DEG) * Math.cos(eps) + Math.cos(betaM * DEG) * Math.sin(eps) * Math.sin(lamM));
  const raM = Math.atan2(Math.sin(lamM) * Math.cos(eps) - Math.tan(betaM * DEG) * Math.sin(eps), Math.cos(lamM));
  const sun = posOf(ra, dec);
  const moon = posOf(raM, decM);
  const elong = lamM - lam;
  const illum = (1 - Math.cos(elong)) / 2;
  return { sun, moon, illum, waxing: ((elong / DEG + 360) % 360) < 180 };
}
export default function DynamicBackground({ sync = true, manualTime = 12, manualWeather = 'clear' }: { sync?: boolean; manualTime?: number; manualWeather?: ManualWeather }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const syncRef = useRef(sync);
  const timeRef = useRef(manualTime);
  const presetRef = useRef(manualWeather);
  useEffect(() => { syncRef.current = sync }, [sync]);
  useEffect(() => { timeRef.current = manualTime }, [manualTime]);
  useEffect(() => { presetRef.current = manualWeather }, [manualWeather]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let w = window.innerWidth;
    let h = window.innerHeight;
    const TAU = Math.PI * 2;
    let gradDirty = true;
    let skyGrad: CanvasGradient | null = null;
    type Star = { x: number; y: number; r: number; a: number; sp: number; ph: number; ci: number };
    let stars: Star[] = [];
    const STAR_COLS: RGB[] = [[255, 255, 255], [207, 222, 255], [255, 233, 201]];
    const TIERS = [
      { fps: 60, cloud: 150000, dpr: 1.5, stars: 240 },
      { fps: 30, cloud: 100000, dpr: 1.2, stars: 170 },
      { fps: 24, cloud: 64000, dpr: 1, stars: 110 },
    ];
    let tier = 0;
    let powerSave = false;
    let frameInt = 1000 / TIERS[0].fps;
    let cloudBudget = TIERS[0].cloud;
    let starMax = TIERS[0].stars;
    let dprCap = TIERS[0].dpr;
    let dpr = 1;
    let sprites: HTMLCanvasElement[] = [];
    const makeSprites = () => {
      sprites = STAR_COLS.map((c) => {
        const cv = document.createElement('canvas');
        cv.width = 32;
        cv.height = 32;
        const g = cv.getContext('2d')!;
        const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
        gr.addColorStop(0, css(c, 1));
        gr.addColorStop(0.5, css(c, 0.8));
        gr.addColorStop(1, css(c, 0));
        g.fillStyle = gr;
        g.fillRect(0, 0, 32, 32);
        return cv;
      });
    };
    const seedStars = () => {
      stars = Array.from({ length: Math.min(starMax, Math.floor((w * h) / 7000)) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.3 + Math.random() ** 2 * 1.1,
        a: 0.12 + Math.random() * 0.6,
        sp: 0.3 + Math.random() * 1.4,
        ph: Math.random() * TAU,
        ci: Math.random() < 0.72 ? 0 : Math.random() < 0.5 ? 1 : 2,
      }));
    };
    const applySize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gradDirty = true;
      seedStars();
      setupCloudBuffer();
    };
    const applyTier = () => {
      const t = TIERS[tier];
      frameInt = 1000 / t.fps;
      cloudBudget = t.cloud;
      starMax = t.stars;
      dprCap = t.dpr;
      makeSprites();
      applySize();
    };
    const NSIZE = 256;
    const NMASK = NSIZE - 1;
    let fbm: Float32Array | null = null;
    const hash2 = (ix: number, iy: number, s: number): number => {
      let n = (ix * 374761393 + iy * 668265263 + s * 1013904223) | 0;
      n = Math.imul(n ^ (n >>> 13), 1274126177);
      return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
    };
    const bakeField = () => {
      const f = new Float32Array(NSIZE * NSIZE);
      const val = (u: number, v: number, p: number, seed: number): number => {
        const x0 = Math.floor(u), y0 = Math.floor(v);
        const fx = u - x0, fy = v - y0;
        const qx = fx * fx * (3 - 2 * fx), qy = fy * fy * (3 - 2 * fy);
        const xa = ((x0 % p) + p) % p, xb = (xa + 1) % p;
        const ya = ((y0 % p) + p) % p, yb = (ya + 1) % p;
        const c00 = hash2(xa, ya, seed), c10 = hash2(xb, ya, seed), c01 = hash2(xa, yb, seed), c11 = hash2(xb, yb, seed);
        return c00 + (c10 - c00) * qx + (c01 - c00 + (c11 - c01 - c10 + c00) * qx) * qy;
      };
      for (let y = 0; y < NSIZE; y++) {
        for (let x = 0; x < NSIZE; x++) {
          let amp = 0.5, sum = 0, tot = 0, seed = 17;
          for (let o = 0; o < 5; o++) {
            const p = 4 << o;
            sum += amp * val((x / NSIZE) * p, (y / NSIZE) * p, p, seed);
            seed = (seed * 1664525 + 1013904223) | 0;
            tot += amp;
            amp *= 0.5;
          }
          f[y * NSIZE + x] = sum / tot;
        }
      }
      fbm = f;
    };
    bakeField();
    const sampleF = (fx: number, fy: number): number => {
      const f = fbm!;
      const x0 = Math.floor(fx), y0 = Math.floor(fy);
      const ax = fx - x0, ay = fy - y0;
      const bx = ax * ax * (3 - 2 * ax), by = ay * ay * (3 - 2 * ay);
      const xi = x0 & NMASK, xi1 = (x0 + 1) & NMASK;
      const yi = (y0 & NMASK) * NSIZE, yi1 = ((y0 + 1) & NMASK) * NSIZE;
      const r0 = f[yi + xi] + (f[yi + xi1] - f[yi + xi]) * bx;
      const r1 = f[yi1 + xi] + (f[yi1 + xi1] - f[yi1 + xi]) * bx;
      return r0 + (r1 - r0) * by;
    };
    let cloudW = 0, cloudH = 0;
    let cloudCanvas: HTMLCanvasElement | null = null;
    let cloudCtx: CanvasRenderingContext2D | null = null;
    let cloudImg: ImageData | null = null;
    let rowSky: Float32Array | null = null;
    let rowBuf: Float32Array | null = null;
    let curRow: Float32Array | null = null;
    let colU: Float32Array | null = null;
    let cloudFrames = 0;
    let scrollX = 0;
    const setupCloudBuffer = () => {
      const scl = Math.min(1, Math.sqrt(cloudBudget / Math.max(1, w * h)));
      cloudW = Math.max(2, Math.floor(w * scl));
      cloudH = Math.max(2, Math.floor(h * scl));
      if (!cloudCanvas) {
        cloudCanvas = document.createElement('canvas');
        cloudCtx = cloudCanvas.getContext('2d');
      }
      if (!cloudCtx) return;
      cloudCanvas.width = cloudW;
      cloudCanvas.height = cloudH;
      cloudImg = cloudCtx.createImageData(cloudW, cloudH);
      rowSky = new Float32Array(cloudH * 3);
      rowBuf = new Float32Array(cloudW);
      curRow = new Float32Array(cloudW);
      colU = new Float32Array(cloudW);
      cloudFrames = 0;
    };
    makeSprites();
    applySize();
    type BattMgr = { charging: boolean; level: number; addEventListener: (t: string, f: () => void) => void; removeEventListener: (t: string, f: () => void) => void };
    const battHandlers: Array<[BattMgr, () => void]> = [];
    (navigator as Navigator & { getBattery?: () => Promise<BattMgr> }).getBattery?.().then((b) => {
      const upd = () => {
        powerSave = !b.charging;
        const floorT = powerSave ? (b.level <= 0.35 ? 2 : 1) : 0;
        if (tier < floorT) { tier = floorT; applyTier(); }
        if (!powerSave) upCool = 0;
      };
      upd();
      b.addEventListener('chargingchange', upd);
      b.addEventListener('levelchange', upd);
      battHandlers.push([b, upd]);
    }).catch(() => {});
    type Drop = { x: number; y: number; l: number; v: number };
    let drops: Drop[] = [];
    type Flake = { x: number; y: number; r: number; v: number; ph: number; sw: number; a: number; near: boolean };
    let flakes: Flake[] = [];
    type Shoot = { x: number; y: number; vx: number; vy: number; life: number; max: number; len: number };
    let shoots: Shoot[] = [];
    let nextShoot = performance.now() + 4000;
    let nextFlash = 0;
    let flash = 0;
    let resizeQueued = false;
    const onResize = () => {
      if (resizeQueued) return;
      resizeQueued = true;
      requestAnimationFrame(() => {
        applySize();
        shoots = [];
        resizeQueued = false;
      });
    };
    window.addEventListener('resize', onResize);
    let loc: Loc = (() => {
      try {
        const s = JSON.parse(localStorage.getItem(LOCATION_KEY) ?? 'null');
        if (s?.lat != null && s?.lon != null) return { lat: s.lat, lon: s.lon };
      } catch {}
      return { lat: 40, lon: -(new Date().getTimezoneOffset() / 4) };
    })();
    let wx: WeatherSnap | null = null;
    try { wx = JSON.parse(localStorage.getItem(WEATHER_KEY) ?? 'null') } catch {}
    let prof = weatherProfile(PRESET_CODE[presetRef.current]);
    let liveWx = false;
    const syncWeather = () => {
      if (!syncRef.current) {
        liveWx = false;
        prof = weatherProfile(PRESET_CODE[presetRef.current]);
        return;
      }
      let hasWidget = false;
      try { hasWidget = (JSON.parse(localStorage.getItem(WIDGETS_KEY) ?? '[]') as { type: string }[]).some((x) => x?.type === 'weather') } catch {}
      liveWx = !!wx && hasWidget && navigator.onLine && Date.now() - (wx?.at ?? 0) < STALE_MS;
      prof = liveWx && wx ? weatherProfile(wx.code) : weatherProfile(PRESET_CODE[presetRef.current]);
      gradDirty = true;
    };
    syncWeather();
    const onWxEvent = () => { try { wx = JSON.parse(localStorage.getItem(WEATHER_KEY) ?? 'null') } catch {} ; syncWeather() };
    window.addEventListener('sp-weather-data', onWxEvent);
    const onOnline = () => syncWeather();
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOnline);
    let sky = { elev: 0, az: 0, mElev: 0, mAz: 0, illum: 0.5, waxing: true, dayF: 0, twiF: 0, lowF: 1, starF: 1, moonGate: 1 };
    const recompute = () => {
      const now = new Date();
      if (!syncRef.current) {
        const hh = Math.floor(timeRef.current) % 24;
        const mm = Math.round((timeRef.current - Math.floor(timeRef.current)) * 60);
        now.setHours(hh, mm, 0, 0);
      }
      const { sun, moon, illum, waxing } = solarPos(loc.lat, loc.lon, now);
      const e = sun.elev;
      sky = {
        elev: e,
        az: sun.az,
        mElev: moon.elev,
        mAz: moon.az,
        illum,
        waxing,
        dayF: smooth(-4, 22, e),
        twiF: Math.exp(-((e - 1) ** 2) / (2 * 6.5 * 6.5)),
        lowF: 1 - smooth(8, 32, e),
        starF: 1 - smooth(-9, 2, e),
        moonGate: 1 - smooth(-1, 5, e),
      };
      gradDirty = true;
    };
    recompute();
    const tick = setInterval(recompute, 1000);
    const wxTick = setInterval(syncWeather, 30000);
    const azToX = (az: number) => w / 2 + Math.sin(az) * w * 0.48;
    const elevToY = (elev: number) => h * 0.88 - Math.max(-0.04, Math.min(1, elev / 78)) * h * 0.98;
    const greyify = (c: RGB, cc: number): RGB => {
      const lum = c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11;
      const desat = Math.min(1, cc * 0.75);
      const dark = Math.max(0, cc - 0.55) * 0.5;
      const d = mixC(c, [lum, lum * 1.03, lum * 1.09], desat);
      return [d[0] * (1 - dark), d[1] * (1 - dark), d[2] * (1 - dark)];
    };
    const skyAt = (t: number): RGB => {
      const { dayF, twiF } = sky;
      const cc = prof.cloud;
      const zen = mixC(NIGHT_Z, DAY_Z, dayF);
      let hor = mixC(NIGHT_H, DAY_H, dayF);
      const rose = clamp01(twiF * 1.2);
      hor = mixC(hor, DUSK_PINK, rose * 0.62);
      const g = Math.pow(smooth(0.02, 0.96, t), 0.62);
      let c = mixC(zen, hor, g);
      c = mixC(c, DUSK_WARM, Math.pow(clamp01((t - 0.32) / 0.68), 1.7) * rose * 0.72);
      const midRose = clamp01((t - 0.18) / 0.5) * (1 - clamp01((t - 0.62) / 0.38));
      c = mixC(c, ROSE, midRose * rose * 0.34);
      return greyify(c, cc);
    };
    let raf = 0;
    let lastDraw = performance.now() - 100;
    let tSec = 0;
    let emaLate = 0;
    let nextEval = performance.now() + 3500;
    let upCool = 0;
    let pSync = syncRef.current;
    let pTime = timeRef.current;
    let pPreset = presetRef.current;
    const step = (now: number) => {
      raf = requestAnimationFrame(step);
      const elapsed = now - lastDraw;
      if (elapsed < frameInt - 1.5) return;
      const dtms = Math.min(64, elapsed);
      lastDraw = now;
      emaLate += (dtms - frameInt - emaLate) * 0.06;
      if (now > nextEval) {
        nextEval = now + 2500;
        if (emaLate > 9 && tier < 2) { tier++; applyTier(); emaLate = 0; nextEval = now + 6000; }
        else if (!powerSave && tier > 0 && emaLate < 1 && now > upCool) { tier--; applyTier(); emaLate = 0; upCool = now + 15000; nextEval = now + 9000; }
      }
      if (document.hidden) return;
      const dt = dtms / 1000;
      tSec += dt;
      if (pSync !== syncRef.current || pTime !== timeRef.current || pPreset !== presetRef.current) {
        pSync = syncRef.current;
        pTime = timeRef.current;
        pPreset = presetRef.current;
        if (syncRef.current) {
          try { const s = JSON.parse(localStorage.getItem(LOCATION_KEY) ?? 'null'); if (s?.lat != null) loc = { lat: s.lat, lon: s.lon } } catch {}
          try { wx = JSON.parse(localStorage.getItem(WEATHER_KEY) ?? 'null') } catch {}
          window.dispatchEvent(new CustomEvent('sp-weather-refresh'));
        }
        recompute();
        syncWeather();
      }
      const { elev, az, mElev, mAz, illum, waxing, dayF, twiF, lowF, starF, moonGate } = sky;
      const cc = prof.cloud;
      if (gradDirty || !skyGrad) {
        skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        for (let i = 0; i <= 6; i++) skyGrad.addColorStop(i / 6, css(skyAt(i / 6)));
        gradDirty = false;
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);
      const ox = 0, oy = 0;
      const sunX = azToX(az);
      const sunY = elevToY(elev);
      const glowA = (0.5 * twiF + 0.22 * lowF * dayF) * (1 - cc * 0.8);
      if (glowA > 0.01) {
        const gy = Math.min(sunY, h * 0.88);
        const gg = ctx.createRadialGradient(sunX, gy, 0, sunX, gy, w * 0.55);
        const gc = mixC(DUSK_WARM, SUN_DUSK, 0.4);
        gg.addColorStop(0, css(gc, glowA * 0.55));
        gg.addColorStop(0.4, css(gc, glowA * 0.16));
        gg.addColorStop(1, css(gc, 0));
        ctx.fillStyle = gg;
        ctx.fillRect(0, 0, w, h);
      }
      const sa = starF * (1 - cc * 0.92);
      if (sa > 0.02) {
        for (let si = 0; si < stars.length; si++) {
          const s = stars[si];
          const al = s.a * (0.55 + 0.45 * Math.sin(tSec * s.sp * 2 + s.ph)) * sa;
          if (al <= 0.02) continue;
          ctx.globalAlpha = al > 1 ? 1 : al;
          ctx.drawImage(sprites[s.ci], s.x - s.r, s.y - s.r, s.r * 2, s.r * 2);
        }
        ctx.globalAlpha = 1;
        if (cc < 0.5 && now >= nextShoot && shoots.length < 2) {
          const dir = Math.random() < 0.5 ? 1 : -1;
          const ang = 0.16 + Math.random() * 0.2;
          const speed = 650 + Math.random() * 550;
          shoots.push({ x: dir === 1 ? Math.random() * w * 0.5 : w * 0.5 + Math.random() * w * 0.5, y: Math.random() * h * 0.4, vx: Math.cos(ang) * speed * dir, vy: Math.sin(ang) * speed, life: 0, max: 0.7 + Math.random() * 0.5, len: 80 + Math.random() * 80 });
          nextShoot = now + 4500 + Math.random() * 5500;
        }
        for (let i = shoots.length - 1; i >= 0; i--) {
          const s = shoots[i];
          s.life += dt;
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          if (s.life >= s.max) { shoots.splice(i, 1); continue }
          const fade = Math.sin(Math.PI * (s.life / s.max)) * sa;
          const mag = Math.hypot(s.vx, s.vy);
          const tx2 = s.x - (s.vx / mag) * s.len;
          const ty2 = s.y - (s.vy / mag) * s.len;
          const lg = ctx.createLinearGradient(s.x, s.y, tx2, ty2);
          lg.addColorStop(0, `rgba(235,242,255,${(0.85 * fade).toFixed(3)})`);
          lg.addColorStop(1, 'rgba(190,210,255,0)');
          ctx.strokeStyle = lg;
          ctx.lineWidth = 1.3;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(tx2, ty2);
          ctx.stroke();
        }
      }
      const vis = 1 - cc * 0.85;
      if (elev > -1 && vis > 0.05) {
        const sunCol = mixC(SUN_DUSK, SUN_DAY, clamp01(dayF * 0.75 + lowF * 0.25));
        const haloR = (30 + lowF * 26) * 6;
        const hg = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, haloR);
        hg.addColorStop(0, css(sunCol, 0.35 * vis));
        hg.addColorStop(1, css(sunCol, 0));
        ctx.fillStyle = hg;
        ctx.beginPath();
        ctx.arc(sunX, sunY, haloR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = css(mixC(sunCol, [255, 255, 255], 0.3), Math.min(1, vis * 1.4));
        ctx.beginPath();
        ctx.arc(sunX, sunY, 15 + lowF * 8, 0, Math.PI * 2);
        ctx.fill();
      }
      if (mElev > -1 && illum > 0.03) {
        const mx2 = azToX(mAz);
        const my2 = elevToY(mElev);
        const mr = 11 + illum * 3;
        const mVis = (1 - dayF * 0.75) * vis * moonGate;
        const mg = ctx.createRadialGradient(mx2, my2, 0, mx2, my2, mr * 6);
        mg.addColorStop(0, `rgba(218,226,250,${(0.28 * illum * mVis).toFixed(3)})`);
        mg.addColorStop(1, 'rgba(218,226,250,0)');
        ctx.fillStyle = mg;
        ctx.beginPath();
        ctx.arc(mx2, my2, mr * 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(230,235,248,${Math.min(1, mVis + 0.15).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(mx2, my2, mr, 0, Math.PI * 2);
        ctx.fill();
        const shift = (1 - illum) * 2.05 * mr * (waxing ? 1 : -1);
        ctx.fillStyle = css(skyAt(clamp01(my2 / h)), 0.97);
        ctx.beginPath();
        ctx.arc(mx2 + shift, my2, mr * 1.01, 0, Math.PI * 2);
        ctx.fill();
      }
      const windBoost = liveWx && syncRef.current ? Math.min(3, 0.6 + (wx?.wind ?? 5) / 18) : 1;
      if (fbm && cloudCtx && cloudImg && rowSky && colU && cc > 0.02) {
        const data = cloudImg.data;
        const lo = 0.6 - cc * 0.46;
        const inv = 1 / 0.2;
        const shape = (r: number): number => {
          const tt = (r - lo) * inv;
          return tt <= 0 ? 0 : tt >= 1 ? 1 : tt * tt * (3 - 2 * tt);
        };
        const dayK = Math.max(dayF, starF * 0.22);
        const br = (0.34 + 0.66 * dayK) * 255;
        const bg2 = (0.4 + 0.55 * dayK) * 255;
        const bb2 = (0.55 + 0.27 * dayK) * 255;
        const dark: RGB = mixC([10, 14, 24], [92, 104, 122], dayF);
        const amb: RGB = mixC([26, 33, 51], [233, 243, 250], Math.max(dayF * 0.95, twiF * 0.55));
        const litFloor = 0.15 + 0.48 * Math.max(dayF, twiF * 0.7);
        const sunCol: RGB = mixC(mixC(DUSK_WARM, SUN_DUSK, 0.4), SUN_DAY, clamp01(dayF * 0.75 + lowF * 0.25));
        const sunI = (0.24 + dayF * 0.72) * (1 - cc * 0.35);
        const warmK = clamp01(twiF * 0.65 + lowF * dayF * 0.35);
        const sunTint: RGB = mixC([1, 1, 1], [1.25, 0.83, 0.55], warmK);
        for (let ry = 0; ry < cloudH; ry++) {
          const sc = skyAt(Math.pow(smooth(0.02, 0.96, ry / (cloudH - 1)), 0.62));
          rowSky[ry * 3] = sc[0]; rowSky[ry * 3 + 1] = sc[1]; rowSky[ry * 3 + 2] = sc[2];
        }
        const sunLeft = sunX < w * 0.5 ? -1 : 1;
        const Ldx = sunLeft * 7, Ldy = -5;
        scrollX = (scrollX + dt * 16 * windBoost) % (w * 2.3);
        const tw = w * 2.3, th = h * 1.35;
        const fu = NSIZE / tw, fv = NSIZE / th;
        const cheap = tier >= 1;
        const sCol = Math.max(-16, Math.min(16, Math.round((Ldx * cloudW) / NSIZE)));
        for (let cx = 0; cx < cloudW; cx++) colU![cx] = ((cx / (cloudW - 1)) * tw + scrollX) * fu;
        for (let cy = 0; cy < cloudH; cy++) {
          const rb = rowBuf!;
          const ny = cy / (cloudH - 1);
          const skR = rowSky[cy * 3], skG = rowSky[cy * 3 + 1], skB = rowSky[cy * 3 + 2];
          const distF = smooth(0.52, 0.95, ny);
          const hf = 1 - smooth(0.68, 0.9, ny);
          const v1 = ny * th * fv;
          const fogK = distF * (0.55 + 0.2 * cc);
          for (let cx = 0; cx < cloudW; cx++) {
            const u1 = colU![cx];
            const qw = (sampleF(u1 * 0.5 + 47, v1 * 0.5 + 89) - 0.5) * 16;
            const uW = u1 + qw, vW = v1 + qw * 0.6;
            const d1raw = sampleF(uW, vW);
            const d2raw = sampleF(u1 * 0.5 + 911 + qw * 0.4, v1 * 0.5 + 373);
            const er = 0.3 + 0.7 * Math.min(1, Math.abs(sampleF(uW * 2.1 + 131, vW * 2.1 - 57) - 0.5) * 2.8);
            let d1 = shape(d1raw) * hf * er;
            let d2 = shape(d2raw) * hf * (1 - distF * 0.3) * (0.55 + 0.45 * er);
            if (prof.storm) { d1 = Math.min(1, d1 * 1.25); d2 = Math.min(1, d2 * 1.15) }
            const aN = Math.min(1, d1 * 1.7) * (1 - distF * 0.3);
            const aF = Math.min(1, d2 * 1.5) * (1 - distF * 0.5) * 0.8;
            const i = (cy * cloudW + cx) * 4;
            curRow![cx] = d1;
            if (aN < 0.004 && aF < 0.004) { data[i + 3] = 0; continue }
            const pj = cx + sCol;
            const pvi = pj < 0 ? 0 : pj >= cloudW ? cloudW - 1 : pj;
            const pv = cheap ? (cloudFrames > 0 ? rb[pvi] : d1) : shape(sampleF(uW + Ldx * fu, vW + Ldy * fv));
            const dif = Math.min(1, Math.max(0, (d1 - pv) / 0.3 + 0.18));
            const bmod = cheap ? 1 : 1 + (sampleF(u1 * 3 + 211, v1 * 3 - 163) - 0.5) * 0.24;
            const dm = Math.min(1, d1 * 1.25);
            const lr = Math.max(litFloor * 0.92, amb[0] / 255 + (sunCol[0] / 255) * dif * sunI * sunTint[0]);
            const lg = Math.max(litFloor, amb[1] / 255 + (sunCol[1] / 255) * dif * sunI * sunTint[1]);
            const lb = Math.max(litFloor * 1.06, amb[2] / 255 + (sunCol[2] / 255) * dif * sunI * sunTint[2]);
            let cn_r = (br + (dark[0] - br) * dm) * lr * bmod;
            let cn_g = (bg2 + (dark[1] - bg2) * dm) * lg * bmod;
            let cn_b = (bb2 + (dark[2] - bb2) * dm) * lb * bmod;
            cn_r += (skR - cn_r) * fogK; cn_g += (skG - cn_g) * fogK; cn_b += (skB - cn_b) * fogK;
            const df = Math.min(1, d2 * 1.25);
            const fr = Math.max(litFloor * 0.92, amb[0] / 255 + (sunCol[0] / 255) * dif * sunI * 0.7 * sunTint[0]);
            const fg2 = Math.max(litFloor, amb[1] / 255 + (sunCol[1] / 255) * dif * sunI * 0.7 * sunTint[1]);
            const fb3 = Math.max(litFloor * 1.06, amb[2] / 255 + (sunCol[2] / 255) * dif * sunI * 0.7 * sunTint[2]);
            let cf_r = (br + (dark[0] - br) * df) * fr * bmod;
            let cf_g = (bg2 + (dark[1] - bg2) * df) * fg2 * bmod;
            let cf_b = (bb2 + (dark[2] - bb2) * df) * fb3 * bmod;
            const fogF2 = Math.min(1, fogK * 1.6);
            cf_r += (skR - cf_r) * fogF2; cf_g += (skG - cf_g) * fogF2; cf_b += (skB - cf_b) * fogF2;
            const oa = aN + aF * (1 - aN);
            data[i] = (cn_r * aN + cf_r * aF * (1 - aN)) / oa;
            data[i + 1] = (cn_g * aN + cf_g * aF * (1 - aN)) / oa;
            data[i + 2] = (cn_b * aN + cf_b * aF * (1 - aN)) / oa;
            data[i + 3] = oa * 255;
          }
          const tmpR = curRow!;
          curRow = rowBuf;
          rowBuf = tmpR;
        }
        cloudCtx.putImageData(cloudImg, 0, 0);
        cloudFrames++;
        if (cloudCanvas) ctx.drawImage(cloudCanvas, 0, 0, w, h);
      }
      if (prof.rain > 0) {
        const want = Math.round(prof.rain * (prof.storm ? 240 : 150));
        while (drops.length < want) drops.push({ x: Math.random() * w, y: Math.random() * h, l: 9 + Math.random() * 13, v: 620 + Math.random() * 380 });
        while (drops.length > want) drops.splice(0, drops.length - want);
        const windSlant = 120 + (liveWx && syncRef.current ? (wx?.wind ?? 0) * 8 : 60);
        ctx.strokeStyle = 'rgba(178,198,232,0.36)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (const d of drops) {
          d.y += d.v * dt;
          d.x += windSlant * dt;
          if (d.y > h + 20) { d.y = -20; d.x = Math.random() * w }
          if (d.x > w + 30) d.x -= w + 60;
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - (windSlant / d.v) * d.l, d.y - d.l);
        }
        ctx.stroke();
      } else drops = [];
      if (prof.snow > 0) {
        const want = Math.round(prof.snow * 190);
        while (flakes.length < want) {
          const band = Math.random();
          const near = band > 0.78;
          flakes.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: near ? 2 + Math.random() * 1.6 : band > 0.42 ? 1.2 + Math.random() * 0.8 : 0.7 + Math.random() * 0.6,
            v: near ? 54 + Math.random() * 26 : band > 0.42 ? 34 + Math.random() * 16 : 21 + Math.random() * 13,
            ph: Math.random() * Math.PI * 2,
            sw: near ? 30 : 16,
            a: near ? 0.95 : band > 0.42 ? 0.72 : 0.48,
            near,
          });
        }
        while (flakes.length > want) flakes.splice(0, flakes.length - want);
        const pSh = new Path2D();
        const pFar = new Path2D();
        const pMid = new Path2D();
        const pNear = new Path2D();
        for (const f of flakes) {
          f.y += f.v * dt;
          f.ph += dt * (f.near ? 1.1 : 0.7);
          f.x += Math.sin(f.ph) * f.sw * dt;
          if (f.y > h + 8) { f.y = -8; f.x = Math.random() * w }
          if (f.x > w + 10) f.x -= w + 20;
          const p = f.near ? pNear : f.a === 0.72 ? pMid : pFar;
          p.moveTo(f.x + f.r, f.y);
          p.arc(f.x, f.y, f.r, 0, TAU);
          if (f.near) {
            pSh.moveTo(f.x + f.r * 0.45 + f.r, f.y + f.r * 0.6);
            pSh.arc(f.x + f.r * 0.45, f.y + f.r * 0.6, f.r, 0, TAU);
          }
        }
        ctx.fillStyle = 'rgba(96,116,148,0.3)';
        ctx.fill(pSh);
        ctx.fillStyle = 'rgba(240,246,253,0.48)';
        ctx.fill(pFar);
        ctx.fillStyle = 'rgba(240,246,253,0.72)';
        ctx.fill(pMid);
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.fill(pNear);
      } else flakes = [];
      if (prof.fog > 0) {
        const fogCol = mixC([200, 208, 222], mixC(NIGHT_H, DAY_H, dayF), 0.35);
        for (let i = 0; i < 3; i++) {
          const fy = h * (0.55 + i * 0.16) + Math.sin(tSec * 0.08 + i * 2) * 14;
          const fg = ctx.createLinearGradient(0, fy - 70, 0, fy + 90);
          fg.addColorStop(0, css(fogCol, 0));
          fg.addColorStop(0.5, css(fogCol, 0.16 * prof.fog));
          fg.addColorStop(1, css(fogCol, 0));
          ctx.fillStyle = fg;
          ctx.save();
          ctx.translate(Math.sin(tSec * 0.03 + i * 3) * 40, 0);
          ctx.fillRect(-60, fy - 70, w + 120, 160);
          ctx.restore();
        }
      }
      if (prof.storm && now > nextFlash) { flash = 0.5 + Math.random() * 0.3; nextFlash = now + 3800 + Math.random() * 7500 }
      if (flash > 0.005) {
        ctx.fillStyle = `rgba(240,244,255,${flash.toFixed(3)})`;
        ctx.fillRect(0, 0, w, h);
        flash *= Math.pow(0.0015, dt);
      }
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(tick);
      clearInterval(wxTick);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('sp-weather-data', onWxEvent);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOnline);
      for (const [bm, f] of battHandlers) {
        bm.removeEventListener('chargingchange', f);
        bm.removeEventListener('levelchange', f);
      }
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[-1] pointer-events-none"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}