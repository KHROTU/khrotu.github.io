import { useRef, useCallback, useEffect } from 'react';
export function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const state = useRef({ dragging: false, startX: 0, scrollLeft: 0 });
  const cursor = useRef<string>('');
  const frame = useRef(0);
  const vel = useRef({ x: 0, lastX: 0, time: 0 });
  const momentum = useCallback(() => {
    if (state.current.dragging) return;
    const el = ref.current;
    if (!el) return;
    vel.current.x *= 0.96;
    el.scrollLeft -= vel.current.x;
    if (Math.abs(vel.current.x) < 0.5) return;
    frame.current = requestAnimationFrame(momentum);
  }, []);
  const onMouseDown = useCallback((e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    state.current.dragging = true;
    state.current.startX = e.clientX;
    state.current.scrollLeft = el.scrollLeft;
    vel.current = { x: 0, lastX: e.clientX, time: performance.now() };
    cursor.current = el.style.cursor;
    el.style.cursor = 'grabbing';
    el.style.userSelect = 'none';
  }, []);
  const onMouseMove = useCallback((e: MouseEvent) => {
    const el = ref.current;
    if (!el || !state.current.dragging) return;
    e.preventDefault();
    const now = performance.now();
    const dt = now - vel.current.time;
    const dx = e.clientX - vel.current.lastX;
    if (dt > 0) {
      vel.current = { x: (dx / dt) * 10, lastX: e.clientX, time: now };
    }
    const walk = e.clientX - state.current.startX;
    el.scrollLeft = state.current.scrollLeft - walk;
  }, []);
  const release = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    state.current.dragging = false;
    el.style.cursor = cursor.current;
    el.style.userSelect = '';
    frame.current = requestAnimationFrame(momentum);
  }, [momentum]);
  const onMouseUp = useCallback(() => {
    if (!state.current.dragging) return;
    release();
  }, [release]);
  const onMouseLeave = useCallback(() => {
    if (!state.current.dragging) return;
    release();
  }, [release]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mouseleave', onMouseLeave);
    return () => {
      cancelAnimationFrame(frame.current);
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [onMouseDown, onMouseMove, onMouseUp, onMouseLeave]);
  return ref;
}