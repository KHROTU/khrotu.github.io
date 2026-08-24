import { useCallback, useEffect, useState } from 'react';
import { timedFetch } from '../net';
export default function Quotes() {
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setOffline(false);
    setQuote(null);
    const endpoints: { url: string; parse: (j: unknown) => { text: string; author: string } }[] = [
      {
        url: 'https://dummyjson.com/quotes/random',
        parse: (j) => {
          const o = j as { quote: string; author: string };
          return { text: o.quote, author: o.author };
        },
      },
      {
        url: 'https://zenquotes.io/api/random',
        parse: (j) => {
          const o = (j as { q: string; a: string }[])[0];
          return { text: o.q, author: o.a };
        },
      },
    ];
    for (const ep of endpoints) {
      try {
        const r = await timedFetch(ep.url);
        if (!r.ok) continue;
        const j = await r.json();
        const parsed = ep.parse(j);
        if (!parsed.text) continue;
        setQuote(parsed);
        setOffline(false);
        setLoading(false);
        return;
      } catch {
        break;
      }
    }
    setQuote(null);
    setOffline(true);
    setLoading(false);
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  return (
    <button
      onClick={load}
      disabled={loading}
      title="click for a new quote"
      className="w-full h-full flex flex-col justify-center gap-2 select-none text-left cursor-pointer disabled:opacity-60"
    >
      {quote ? (
        <>
          <p className="text-sm text-[var(--text-main)] leading-relaxed">“{quote.text}”</p>
          <span className="text-xs text-[var(--text-muted)]/70">— {quote.author.toLowerCase()}</span>
        </>
      ) : (
        <span className="text-sm text-[var(--text-muted)]">{loading ? '…' : offline ? 'no connection' : '—'}</span>
      )}
    </button>
  );
} 