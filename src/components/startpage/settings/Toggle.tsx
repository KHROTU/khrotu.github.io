type Props = { checked: boolean; onChange: (value: boolean) => void };
export default function Toggle({ checked, onChange }: Props) {
  return (
    <button onClick={() => onChange(!checked)} aria-pressed={checked} className={`w-9 h-5 rounded-full border transition-colors relative ${checked ? 'bg-white/90 border-white' : 'bg-transparent border-white/25'}`}>
      <span className={`absolute top-1/2 -translate-y-1/2 rounded-full transition-all ${checked ? 'left-[calc(100%-14px)] w-3 h-3 bg-black' : 'left-0.5 w-3 h-3 bg-white/50'}`} />
    </button>
  );
}