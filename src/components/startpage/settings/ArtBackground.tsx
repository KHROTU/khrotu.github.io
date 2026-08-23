import { useEffect, useRef } from 'react';
export default function ArtBackground({ mouseEffects = true }: { mouseEffects?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseEffectsRef = useRef(mouseEffects);
  useEffect(() => {
    mouseEffectsRef.current = mouseEffects;
  }, [mouseEffects]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    let w = window.innerWidth;
    let h = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio, 1.5);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    let visible = true;
    let resizeQueued = false;
    const onResize = () => {
      if (resizeQueued) return;
      resizeQueued = true;
      requestAnimationFrame(() => {
        w = window.innerWidth;
        h = window.innerHeight;
        dpr = Math.min(window.devicePixelRatio, 1.5);
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        resizeQueued = false;
      });
    };
    window.addEventListener('resize', onResize);
    const onVisibility = () => {
      visible = !document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibility);
    const seed = Math.random() * 1000;
    const mouse = { x: -9999, y: -9999 };
    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    if (mouseEffectsRef.current) {
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerleave', onLeave);
    }
    const noise = (x: number, y: number, t: number) => {
      const s =
        Math.sin(x * 1.7 + seed + t * 0.6) * Math.cos(y * 1.3 + seed - t * 0.4) +
        Math.sin((x + y) * 0.7 + seed + t) * Math.cos((x - y) * 0.5 - t * 0.5);
      return (s + 4) / 8;
    };
    const angleAt = (x: number, y: number, t: number) => noise(x / 240, y / 240, t) * Math.PI * 4;
    const COUNT = Math.min(220, Math.floor((w * h) / 5800));
    const px = new Float32Array(COUNT);
    const py = new Float32Array(COUNT);
    const vx = new Float32Array(COUNT);
    const vy = new Float32Array(COUNT);
    const pa = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      px[i] = Math.random() * w;
      py[i] = Math.random() * h;
      vx[i] = (Math.random() - 0.5) * 0.6;
      vy[i] = (Math.random() - 0.5) * 0.6;
      pa[i] = 0.25 + Math.random() * 0.35;
    }
    ctx.fillStyle = '#040404';
    ctx.fillRect(0, 0, w, h);
    let raf = 0;
    let lastFrame = performance.now();
    let t = 0;
    let frameCount = 0;
    const step = (now: number) => {
      raf = requestAnimationFrame(step);
      if (!visible) return;
      const dt = Math.min(48, now - lastFrame) / 16;
      lastFrame = now;
      t += dt * 0.0012;
      frameCount++;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.045)';
      ctx.fillRect(0, 0, w, h);
      if (frameCount % 12 === 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(0, 0, w, h);
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';
      for (let i = 0; i < COUNT; i++) {
        const a = angleAt(px[i], py[i], t);
        let tvx = Math.cos(a);
        let tvy = Math.sin(a);
        const mdx = px[i] - mouse.x;
        const mdy = py[i] - mouse.y;
        const mdist = Math.hypot(mdx, mdy);
        if (mdist < 140 && mdist > 1) {
          const falloff = ((140 - mdist) / 140) ** 2;
          const warpAngle = a + falloff * 2.4;
          tvx = Math.cos(warpAngle);
          tvy = Math.sin(warpAngle);
        }
        vx[i] += (tvx * 1.7 - vx[i]) * 0.06 * dt;
        vy[i] += (tvy * 1.7 - vy[i]) * 0.06 * dt;
        const nx = px[i] + vx[i] * dt;
        const ny = py[i] + vy[i] * dt;
        ctx.strokeStyle = `rgba(255,255,255,${pa[i]})`;
        ctx.beginPath();
        ctx.moveTo(px[i], py[i]);
        ctx.lineTo(nx, ny);
        ctx.stroke();
        px[i] = nx;
        py[i] = ny;
        if (px[i] < -8 || px[i] > w + 8 || py[i] < -8 || py[i] > h + 8) {
          px[i] = Math.random() * w;
          py[i] = Math.random() * h;
          vx[i] = 0;
          vy[i] = 0;
        }
      }
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [mouseEffects]);
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[-1] pointer-events-none"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}