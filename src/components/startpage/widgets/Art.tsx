import { useEffect, useRef } from 'react';
export default function Art({ width, height }: { width: number; height: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    const seed = Math.random() * 1000;
    const fade = 0.012;
    const driftSpeed = 0.0015;
    const noise = (x: number, y: number, t: number) => {
      const s =
        Math.sin(x * 1.7 + seed) * Math.cos(y * 1.3 + seed) +
        Math.sin((x + y) * 0.7 + seed + t) * Math.cos((x - y) * 0.5 - t * 0.7);
      return (s + 4) / 8;
    };
    const angleAt = (x: number, y: number, t: number) => noise(x / 90, y / 90, t) * Math.PI * 4;
    ctx.fillStyle = '#040404';
    ctx.fillRect(0, 0, width, height);
    const particles = Array.from({ length: Math.min(220, Math.floor(width * height / 500)) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      life: 40 + Math.random() * 120,
      speed: 0.5 + Math.random() * 1.2,
      alpha: 0.15 + Math.random() * 0.35,
    }));
    let raf = 0;
    let lastFade = performance.now();
    let t = 0;
    const step = (now: number) => {
      t += driftSpeed;
      if (now - lastFade > 250) {
        ctx.fillStyle = `rgba(4,4,4,${fade})`;
        ctx.fillRect(0, 0, width, height);
        lastFade = now;
      }
      for (const p of particles) {
        const a = angleAt(p.x, p.y, t);
        const nx = p.x + Math.cos(a) * p.speed;
        const ny = p.y + Math.sin(a) * p.speed;
        ctx.strokeStyle = `rgba(255,255,255,${p.alpha})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(nx, ny);
        ctx.stroke();
        p.x = nx;
        p.y = ny;
        p.life--;
        if (p.life <= 0 || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
          p.x = Math.random() * width;
          p.y = Math.random() * height;
          p.life = 40 + Math.random() * 120;
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [width, height]);
  return <canvas ref={canvasRef} className="w-full h-full rounded-sm" style={{ width, height }} />;
}