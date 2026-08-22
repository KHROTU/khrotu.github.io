import { useEffect, useRef, useState } from 'react';
const WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod',
  'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim',
  'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea',
  'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate', 'velit', 'esse',
  'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non',
  'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum',
];
export default function Lorem({ height }: { height: number }) {
  const [paragraphs, setParagraphs] = useState(1);
  const [output, setOutput] = useState('');
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const generate = (n: number) => {
    const paras: string[] = [];
    for (let p = 0; p < n; p++) {
      const sentences = 3 + Math.floor(Math.random() * 4);
      const sents: string[] = [];
      for (let s = 0; s < sentences; s++) {
        const len = 6 + Math.floor(Math.random() * 12);
        const words = Array.from({ length: len }, () => WORDS[Math.floor(Math.random() * WORDS.length)]);
        sents.push(words.join(' ') + '.');
      }
      paras.push(sents.join(' ').replace(/^./, (c) => c.toUpperCase()));
    }
    setOutput(paras.join('\n\n'));
  };
  useEffect(() => {
    generate(paragraphs);
  }, [paragraphs]);
  return (
    <div className="w-full h-full flex flex-col gap-2 min-h-0">
      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] shrink-0">
        <span>
          paragraphs
          <button onClick={() => setParagraphs(Math.max(1, paragraphs - 1))} className="px-1 hover:text-white">−</button>
          {paragraphs}
          <button onClick={() => setParagraphs(Math.min(8, paragraphs + 1))} className="px-1 hover:text-white">+</button>
        </span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(output).catch(() => {});
            generate(paragraphs);
          }}
          className="ml-auto font-mono hover:text-white transition-colors"
        >
          copy + regen
        </button>
      </div>
      {height >= 120 ? (
        <textarea ref={areaRef} readOnly value={output} className="flex-1 min-h-0 w-full resize-none bg-transparent border border-white/15 rounded-sm p-2 text-xs font-mono text-[var(--text-muted)] outline-none focus:border-[var(--border-bezel)] transition-colors" />
      ) : (
        <p className="flex-1 min-h-0 overflow-y-auto hide-scrollbar text-xs font-mono text-[var(--text-muted)] leading-relaxed">{output}</p>
      )}
    </div>
  );
}