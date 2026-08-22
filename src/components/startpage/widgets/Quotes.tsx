import { useCallback, useEffect, useState } from 'react';
const FALLBACK = [
  { text: 'simplicity is the ultimate sophistication.', author: 'leonardo da vinci' },
  { text: 'make it work, make it right, make it fast.', author: 'kent beck' },
  { text: 'the best code is no code.', author: 'unknown' },
  { text: 'premature optimization is the root of all evil.', author: 'donald knuth' },
  { text: 'weeks of coding can save you hours of planning.', author: 'unknown' },
  { text: 'talk is cheap. show me the code.', author: 'linus torvalds' },
];
export default function Quotes() {
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
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
        const r = await fetch(ep.url);
        if (!r.ok) continue;
        const j = await r.json();
        const parsed = ep.parse(j);
        if (!parsed.text) continue;
        setQuote(parsed);
        setLoading(false);
        return;
      } catch {}
    }
    setQuote((prev) => {
      let next = FALLBACK[Math.floor(Math.random() * FALLBACK.length)];
      if (prev && next.text === prev.text) {
        next = FALLBACK[(FALLBACK.indexOf(next) + 1) % FALLBACK.length];
      }
      return next;
    });
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
        <span className="text-sm text-[var(--text-muted)]">{loading ? '…' : '—'}</span>
      )}
    </button>
  );
}