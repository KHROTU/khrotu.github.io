import { useEffect, useState } from 'react';
import Dropdown from './Dropdown';
type Rates = Record<string, number>;
const KEY = 'startpage-widget-currency';
const POPULAR = ['usd', 'eur', 'gbp', 'jpy', 'chf', 'cad', 'aud', 'cny'];
export default function Currency() {
  const [rates, setRates] = useState<Rates | null>(null);
  const [amount, setAmount] = useState('1');
  const [from, setFrom] = useState('usd');
  const [to, setTo] = useState('eur');
  const [error, setError] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null');
      if (saved?.from) setFrom(saved.from);
      if (saved?.to) setTo(saved.to);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ from, to }));
    } catch {}
  }, [from, to]);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setError(false);
      if (!navigator.onLine) {
        if (!cancelled) { setRates(null); setError(true); }
        return;
      }
      const endpoints: { url: string; parse: (j: unknown) => Rates }[] = [
        {
          url: `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${from}.json`,
          parse: (j) => {
            const obj = j as Record<string, Record<string, number>>;
            return Object.fromEntries(Object.entries(obj[from]).map(([k, v]) => [k.toLowerCase(), v]));
          },
        },
        {
          url: `https://open.er-api.com/v6/latest/${from.toUpperCase()}`,
          parse: (j) => {
            const obj = j as { rates?: Record<string, number> };
            return Object.fromEntries(Object.entries(obj.rates ?? {}).map(([k, v]) => [k.toLowerCase(), v]));
          },
        },
      ];
      for (const ep of endpoints) {
        try {
          const r = await fetch(ep.url);
          if (!r.ok) continue;
          const j = await r.json();
          const parsed = ep.parse(j);
          if (!parsed || Object.keys(parsed).length === 0) continue;
          if (!cancelled) setRates(parsed);
          return;
        } catch {}
      }
      if (!cancelled) setError(true);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [from]);
  const num = parseFloat(amount) || 0;
  const rate = rates ? rates[to] : undefined;
  const result = rate != null ? (num * rate).toFixed(2) : '…';
  const currencyOptions = (rates ? Object.keys(rates) : POPULAR).map((c) => ({ value: c, label: c.toUpperCase() }));
  return (
    <div className="w-full h-full flex flex-col justify-center gap-2 select-none min-h-0 overflow-y-auto hide-scrollbar">
      {error && <span className="text-xs text-[var(--text-muted)]">no connection</span>}
      <div className="flex items-center gap-2">
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="decimal"
          className="w-20 bg-transparent border-b border-white/10 focus:border-white/30 outline-none text-xl font-medium text-[var(--text-main)] tabular-nums pb-0.5 transition-colors"
        />
        <Dropdown value={from} options={currencyOptions} onChange={setFrom} />
      </div>
      <div className="flex items-center gap-2 pl-1">
        <span className="text-lg text-[var(--text-muted)]">=</span>
        <span className={`text-xl font-medium tabular-nums truncate ${rate != null ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>{result}</span>
        <Dropdown value={to} options={currencyOptions.filter((o) => o.value !== from)} onChange={setTo} />
      </div>
    </div>
  );
}