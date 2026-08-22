import { useState } from 'react';
type Mode = 'timestamp' | 'units' | 'base';
export default function Converter() {
  const [mode, setMode] = useState<Mode>('timestamp');
  const [ts, setTs] = useState('');
  const [human, setHuman] = useState('');
  const [unitVal, setUnitVal] = useState('');
  const [unitFrom, setUnitFrom] = useState('km');
  const [unitTo, setUnitTo] = useState('mi');
  const [baseVal, setBaseVal] = useState('');
  const [baseFrom, setBaseFrom] = useState('10');
  const UNITS: Record<string, number> = {
    km: 1000, mi: 1609.344, m: 1, ft: 0.3048,
    kg: 1, lb: 0.453592,
    c: (v: number) => v, f: (v: number) => v,
  };
  const convertUnit = (): string => {
    const v = parseFloat(unitVal);
    if (Number.isNaN(v)) return '…';
    if ((unitFrom === 'c' || unitFrom === 'f') && (unitTo === 'c' || unitTo === 'f')) {
      let c = unitFrom === 'f' ? ((v - 32) * 5) / 9 : v;
      if (unitTo === 'f') c = (v * 9) / 5 + 32;
      return `${Math.round(c * 10) / 10}°`;
    }
    if (!UNITS[unitFrom] || !UNITS[unitTo]) return '…';
    return (v * (UNITS[unitFrom] as number) / (UNITS[unitTo] as number)).toPrecision(6).replace(/\.?0+$/, '');
  };
  const tsToDate = () => {
    const n = parseInt(ts);
    if (Number.isNaN(n)) return;
    setHuman(new Date(n * (String(n).length > 10 ? 1 : 1000)).toLocaleString());
  };
  const dateToTs = () => {
    const d = new Date(human);
    if (Number.isNaN(d.getTime())) return;
    setTs(String(Math.floor(d.getTime() / 1000)));
  };
  const tab = (m: Mode, label: string) => (
    <button
      onClick={() => setMode(m)}
      className={`text-[10px] font-mono px-2 py-1 rounded-sm transition-colors ${
        mode === m ? 'border border-white/50 text-[var(--text-main)]' : 'border border-transparent text-[var(--text-muted)] hover:text-white'
      }`}
    >
      {label}
    </button>
  );
  const inputCls = 'flex-1 min-w-0 bg-transparent border border-white/15 rounded-sm px-2 py-1 text-xs text-[var(--text-main)] outline-none focus:border-[var(--border-bezel)] transition-colors placeholder:text-[var(--text-muted)]/60';
  const selectCls = 'bg-transparent border border-white/15 rounded-sm px-1 py-1 text-xs text-[var(--text-main)] outline-none [color-scheme:dark]';
  return (
    <div className="w-full h-full flex flex-col gap-2 select-none min-h-0 overflow-y-auto hide-scrollbar">
      <div className="flex gap-1">
        {tab('timestamp', 'time')}
        {tab('units', 'units')}
        {tab('base', 'base')}
      </div>
      {mode === 'timestamp' && (
        <>
          <div className="flex gap-1.5 items-center">
            <input value={ts} onChange={(e) => setTs(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && tsToDate()} placeholder="unix…" className={inputCls} />
            <button onClick={tsToDate} className="text-xs font-mono text-[var(--text-muted)] hover:text-white">→</button>
          </div>
          <div className="flex gap-1.5 items-center">
            <input value={human} onChange={(e) => setHuman(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && dateToTs()} placeholder="date string…" className={inputCls} />
            <button onClick={dateToTs} className="text-xs font-mono text-[var(--text-muted)] hover:text-white">→</button>
          </div>
          <button onClick={() => setHuman(new Date().toLocaleString())} className="w-fit text-xs font-mono text-[var(--text-muted)] hover:text-white">now → human</button>
        </>
      )}
      {mode === 'units' && (
        <>
          <div className="flex gap-1.5 items-center">
            <input value={unitVal} onChange={(e) => setUnitVal(e.target.value)} inputMode="decimal" placeholder="value…" className={inputCls} />
            <select value={unitFrom} onChange={(e) => setUnitFrom(e.target.value)} className={selectCls}>
              {['km', 'mi', 'm', 'ft', 'kg', 'lb', 'c', 'f'].map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="flex gap-1.5 items-center justify-end">
            <span className="text-lg font-medium text-[var(--text-main)] tabular-nums truncate">{convertUnit()}</span>
            <select value={unitTo} onChange={(e) => setUnitTo(e.target.value)} className={selectCls}>
              {['km', 'mi', 'm', 'ft', 'kg', 'lb', 'c', 'f'].map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </>
      )}
      {mode === 'base' && (
        <>
          <input
            value={baseVal}
            onChange={(e) => {
              setBaseVal(e.target.value);
              const n = parseInt(e.target.value, parseInt(baseFrom));
              setBaseVal(e.target.value);
              if (!Number.isNaN(n)) {
                (document.getElementById('base-out-bin') as HTMLInputElement | null) && ((document.getElementById('base-out-bin') as HTMLInputElement).value = n.toString(2));
                (document.getElementById('base-out-dec') as HTMLInputElement | null) && ((document.getElementById('base-out-dec') as HTMLInputElement).value = n.toString(10));
                (document.getElementById('base-out-hex') as HTMLInputElement | null) && ((document.getElementById('base-out-hex') as HTMLInputElement).value = n.toString(16));
              }
            }}
            placeholder={`number in base ${baseFrom}…`}
            className={inputCls}
          />
          <select value={baseFrom} onChange={(e) => setBaseFrom(e.target.value)} className={selectCls}>
            {[2, 8, 10, 16].map((b) => <option key={b} value={b}>base {b}</option>)}
          </select>
          {[
            { id: 'base-out-bin', b: 2, l: 'bin' },
            { id: 'base-out-dec', b: 10, l: 'dec' },
            { id: 'base-out-hex', b: 16, l: 'hex' },
          ].map(({ id, b, l }) => (
            <div key={id} className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-[var(--text-muted)] w-6">{l}</span>
              <input id={id} readOnly value={(() => {
                const n = parseInt(baseVal, parseInt(baseFrom));
                return Number.isNaN(n) ? '' : n.toString(b);
              })()} className={inputCls + ' font-mono'} />
            </div>
          ))}
        </>
      )}
    </div>
  );
}