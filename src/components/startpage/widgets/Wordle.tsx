export default function Wordle({ height }: { height: number }) {
  const links = [
    { label: 'wordle', url: 'https://www.nytimes.com/games/wordle/index.html' },
    { label: 'connections', url: 'https://www.nytimes.com/games/connections' },
    { label: 'strands', url: 'https://www.nytimes.com/games/strands' },
    { label: 'mini crossword', url: 'https://www.nytimes.com/crosswords/game/mini' },
    { label: 'globle', url: 'https://globle-game.com' },
  ];
  return (
    <div className={`w-full h-full flex flex-col justify-center gap-1.5 select-none ${height >= 140 ? '' : 'overflow-y-auto hide-scrollbar'}`}>
      <span className="text-[10px] font-mono text-[var(--text-muted)]">today's puzzles</span>
      {links.map(({ label, url }) => (
        <a
          key={label}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[var(--text-main)] hover:text-white transition-colors truncate"
        >
          {label}
        </a>
      ))}
    </div>
  );
}