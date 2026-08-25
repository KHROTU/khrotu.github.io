import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { WidgetInstance, WidgetType } from './types';
import { WIDGET_DEFAULTS, WIDGET_TYPES } from './useWidgets';
import { getEditor } from './configEditors';
import WidgetSettingsModal from './WidgetSettingsModal';
import Clock from './Clock';
import Notes from './Notes';
import Todo from './Todo';
import Pomodoro from './Pomodoro';
import Timer from './Timer';
import Kanban from './Kanban';
import Weather from './Weather';
import Ambient from './Ambient';
import Custom from './Custom';
import Wheel from './Wheel';
import Matrix from './Matrix';
import WorldClocks from './WorldClocks';
import Calendar from './Calendar';
import Countdown from './Countdown';
import Stopwatch from './Stopwatch';
import GitHub from './GitHub';
import Art from './Art';
import Quotes from './Quotes';
import Dice from './Dice';
import Currency from './Currency';
import Converter from './Converter';
import TextUtils from './TextUtils';
import Lorem from './Lorem';
import Wordle from './Wordle';
import Stats from './Stats';
import ImageWidget from './Image';
const MIN_W = 120;
const MIN_H = 80;
const HANDLE = 12;
const SNAP_THRESHOLD = 8;
type GuideLine = { orientation: 'v' | 'h'; pos: number; from: number; to: number };
function renderWidget(w: WidgetInstance) {
  switch (w.type) {
    case 'clock': return <Clock width={w.width} height={w.height} />;
    case 'notes': return <Notes />;
    case 'todo': return <Todo />;
    case 'pomodoro': return <Pomodoro width={w.width} height={w.height} />;
    case 'timer': return <Timer width={w.width} height={w.height} />;
    case 'kanban': return <Kanban />;
    case 'weather': return <Weather width={w.width} height={w.height} />;
    case 'ambient': return <Ambient />;
    case 'custom': return <Custom id={w.id} />;
    case 'wheel': return <Wheel />;
    case 'matrix': return <Matrix />;
    case 'worldclocks': return <WorldClocks width={w.width} height={w.height} />;
    case 'calendar': return <Calendar />;
    case 'countdown': return <Countdown height={w.height} />;
    case 'stopwatch': return <Stopwatch width={w.width} height={w.height} />;
    case 'github': return <GitHub />;
    case 'wordle': return <Wordle height={w.height} />;
    case 'art': return <Art width={w.width} height={w.height} />;
    case 'currency': return <Currency />;
    case 'quotes': return <Quotes />;
    case 'dice': return <Dice height={w.height} />;
    case 'converter': return <Converter />;
    case 'textutils': return <TextUtils />;
    case 'lorem': return <Lorem height={w.height} />;
    case 'stats': return <Stats height={w.height} />;
    case 'image': return <ImageWidget id={w.id} width={w.width} height={w.height} />;
    default: return null;
  }
}
type SnapTarget = { x: number; y: number; width: number; height: number };
function computeSnap(
  box: { x: number; y: number; width: number; height: number },
  targets: SnapTarget[],
  vw: number,
  vh: number
): { x: number; y: number; guides: GuideLine[] } {
  let bestX: { delta: number; guide: GuideLine | null } = { delta: Infinity, guide: null };
  let bestY: { delta: number; guide: GuideLine | null } = { delta: Infinity, guide: null };
  const myEdgesX = [box.x, box.x + box.width / 2, box.x + box.width];
  const myEdgesY = [box.y, box.y + box.height / 2, box.y + box.height];
  const allTargets: SnapTarget[] = [
    ...targets,
    { x: 24, y: 0, width: vw - 48, height: vh },
    { x: 0, y: 0, width: vw, height: vh },
  ];
  for (const t of allTargets) {
    const tEdgesX = [t.x, t.x + t.width / 2, t.x + t.width];
    const tEdgesY = [t.y, t.y + t.height / 2, t.y + t.height];
    for (const me of myEdgesX) {
      for (const te of tEdgesX) {
        const delta = te - me;
        if (Math.abs(delta) <= SNAP_THRESHOLD && Math.abs(delta) < Math.abs(bestX.delta)) {
          bestX = {
            delta,
            guide: { orientation: 'v', pos: te, from: Math.min(box.y, t.y), to: Math.max(box.y + box.height, t.y + t.height) },
          };
        }
      }
    }
    for (const me of myEdgesY) {
      for (const te of tEdgesY) {
        const delta = te - me;
        if (Math.abs(delta) <= SNAP_THRESHOLD && Math.abs(delta) < Math.abs(bestY.delta)) {
          bestY = {
            delta,
            guide: { orientation: 'h', pos: te, from: Math.min(box.x, t.x), to: Math.max(box.x + box.width, t.x + t.width) },
          };
        }
      }
    }
  }
  return {
    x: box.x + (bestX.guide ? bestX.delta : 0),
    y: box.y + (bestY.guide ? bestY.delta : 0),
    guides: [bestX.guide, bestY.guide].filter((g): g is GuideLine => g !== null),
  };
}
type Props = {
  widgets: WidgetInstance[];
  editMode: boolean;
  onUpdate: (id: string, patch: Partial<Omit<WidgetInstance, 'id' | 'type'>>) => void;
  onRemove: (id: string) => void;
  onFocus: (id: string) => void;
  onAdd: (type: WidgetType) => void;
};
export default function WidgetLayer({ widgets, editMode, onUpdate, onRemove, onFocus, onAdd }: Props) {
  const dragRef = useRef<{
    id: string;
    mode: 'move' | 'resize';
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
    shift: boolean;
  } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [guides, setGuides] = useState<GuideLine[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingWidget = useMemo(() => widgets.find((w) => w.id === editingId) ?? null, [widgets, editingId]);
  const othersRef = useRef<SnapTarget[]>([]);
  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (!d.shift) {
        if (d.mode === 'move') {
          onUpdate(d.id, { x: Math.max(0, d.origX + dx), y: Math.max(0, d.origY + dy) });
        } else {
          onUpdate(d.id, { width: Math.max(MIN_W, d.origW + dx), height: Math.max(MIN_H, d.origH + dy) });
        }
        setGuides([]);
        return;
      }
      setGuides([]);
      if (d.mode === 'move') {
        const raw = { x: d.origX + dx, y: d.origY + dy, width: d.origW, height: d.origH };
        const snapped = computeSnap(raw, othersRef.current, vw, vh);
        onUpdate(d.id, { x: Math.max(0, snapped.x), y: Math.max(0, snapped.y) });
        setGuides(snapped.guides);
      } else {
        const raw = { x: d.origX, y: d.origY, width: Math.max(MIN_W, d.origW + dx), height: Math.max(MIN_H, d.origH + dy) };
        const rightEdgeBox = { x: raw.x + raw.width, y: raw.y, width: 1, height: raw.height };
        const snapR = computeSnap(rightEdgeBox, othersRef.current, vw, vh);
        const vGuide = snapR.guides.find((g) => g.orientation === 'v');
        let newW = raw.width;
        if (vGuide) newW = vGuide.pos - raw.x;
        const bottomEdgeBox = { x: raw.x, y: raw.y + (vGuide ? newW === raw.width ? raw.height : raw.height : raw.height), width: raw.width, height: 1 };
        const bottomEdgeBox2 = { x: raw.x, y: raw.y + newH(raw, vGuide), width: raw.width, height: 1 };
        const snapB = computeSnap(bottomEdgeBox2, othersRef.current, vw, vh);
        const hGuide = snapB.guides.find((g) => g.orientation === 'h');
        let newH2 = raw.height;
        if (hGuide) newH2 = hGuide.pos - raw.y;
        onUpdate(d.id, { width: Math.max(MIN_W, newW), height: Math.max(MIN_H, newH2) });
        const all = [snapR.guides, snapB.guides].flat();
        setGuides(all.filter((g, i) => all.findIndex((o) => o.orientation === g.orientation && o.pos === g.pos) === i));
      }
    },
    [onUpdate]
  );
  function newH(raw: { x: number; y: number; width: number; height: number }, _v: unknown): number {
    return raw.height;
  }
  const onPointerUp = useCallback(() => {
    dragRef.current = null;
    setDraggingId(null);
    setGuides([]);
  }, []);
  useEffect(() => {
    if (!draggingId) return;
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [draggingId, onPointerMove, onPointerUp]);
  const startDrag = (e: React.PointerEvent, w: WidgetInstance, mode: 'move' | 'resize') => {
    if (!editMode) return;
    const target = e.target as HTMLElement;
    if (mode === 'move' && target.closest('input, textarea, select, button, a, iframe, [contenteditable]')) return;
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    onFocus(w.id);
    const uiTargets = Array.from(document.querySelectorAll<HTMLElement>('[data-snap-target="true"]')).map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left, y: r.top, width: r.width, height: r.height };
    });
    othersRef.current = [
      ...widgets.filter((o) => o.id !== w.id).map(({ x, y, width, height }) => ({ x, y, width, height })),
      ...uiTargets,
    ];
    dragRef.current = {
      id: w.id,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      origX: w.x,
      origY: w.y,
      origW: w.width,
      origH: w.height,
      shift: false,
    };
    setDraggingId(w.id);
  };
  useEffect(() => {
    if (!editMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (dragRef.current && e.key === 'Shift') dragRef.current.shift = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (dragRef.current && e.key === 'Shift') dragRef.current.shift = false;
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [editMode]);
  return (
    <>
      {guides.map((g, i) =>
        g.orientation === 'v' ? (
          <div
            key={`g-${i}`}
            className="absolute border-l border-dashed border-[var(--border-bezel)]/70 pointer-events-none z-[9998]"
            style={{ left: g.pos, top: g.from, height: g.to - g.from }}
          />
        ) : (
          <div
            key={`g-${i}`}
            className="absolute border-t border-dashed border-[var(--border-bezel)]/70 pointer-events-none z-[9998]"
            style={{ top: g.pos, left: g.from, width: g.to - g.from }}
          />
        )
      )}
      {widgets.map((w) => (
        <div
          key={w.id}
          className={`absolute group ${editMode ? 'border border-dashed border-white/25 hover:border-white/50 transition-colors' : 'border border-transparent'} rounded-sm`}
          style={{
            left: w.x,
            top: w.y,
            width: w.width,
            height: w.height,
            zIndex: w.z,
            cursor: editMode ? (draggingId === w.id ? 'grabbing' : 'grab') : undefined,
            userSelect: draggingId ? 'none' : undefined,
          }}
          onPointerDown={(e) => startDrag(e, w, 'move')}
        >
          <div className="w-full h-full overflow-hidden" style={{ pointerEvents: editMode ? 'none' : undefined }}>
            {renderWidget(w)}
          </div>
          {editMode && (
            <>
              {getEditor(w) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(w.id);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  aria-label="edit widget"
                  title="edit"
                  className="absolute -top-2.5 right-3 w-5 h-5 rounded-full bg-[#040404] border border-white/30 text-[var(--text-muted)] hover:text-white hover:border-white/60 text-[10px] leading-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
                >
                  ✎
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(w.id);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                aria-label="remove widget"
                title="remove"
                className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-[#040404] border border-white/30 text-[var(--text-muted)] hover:text-white hover:border-white/60 text-xs leading-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
              >
                ×
              </button>
              <div
                className="absolute -bottom-0.5 -right-0.5 opacity-60 hover:opacity-100"
                style={{ width: HANDLE + 4, height: HANDLE + 4, cursor: 'nwse-resize' }}
                onPointerDown={(e) => startDrag(e, w, 'resize')}
              >
                <svg viewBox="0 0 10 10" className="w-full h-full text-[var(--text-muted)]" aria-hidden>
                  <path d="M9 1 1 9 M9 5 5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </>
          )}
        </div>
      ))}
      {editingId && editingWidget && getEditor(editingWidget) && (
        <WidgetSettingsModal widget={editingWidget} onClose={() => setEditingId(null)} />
      )}
      {editMode && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 px-4 py-2 bg-[#040404] border border-white/25 rounded-sm text-sm flex-wrap justify-center max-w-[90vw]"
          data-snap-target="true"
        >
          <span className="font-mono text-xs text-[var(--text-muted)]">add:</span>
          {WIDGET_TYPES
            .sort((a, b) => WIDGET_DEFAULTS[a].label.localeCompare(WIDGET_DEFAULTS[b].label))
            .map((type) => (
            <button key={type} onClick={() => onAdd(type)} className="text-xs font-mono text-[var(--text-muted)] hover:text-white transition-colors px-1">
              {WIDGET_DEFAULTS[type].label}
            </button>
          ))}
          <span className="text-white/15">|</span>
          <span className="font-mono text-xs text-[var(--text-muted)]/70">hold shift while dragging to snap</span>
        </div>
      )}
    </>
  );
}