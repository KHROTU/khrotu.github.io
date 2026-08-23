import { useEffect, useState } from 'react'
import Slider from '../settings/Slider'
const KEY = 'startpage-widget-image'
type ImageDef = { src: string; fit: 'cover' | 'contain' | 'fill'; link: string; radius: number }
function load(id: string): ImageDef | null {
  try { const all = JSON.parse(localStorage.getItem(KEY) ?? '{}'); return all[id] ?? null } catch { return null }
}
function save(id: string, v: ImageDef) {
  try { const all = JSON.parse(localStorage.getItem(KEY) ?? '{}'); all[id] = v; localStorage.setItem(KEY, JSON.stringify(all)) } catch {}
}
export default function ImageWidget({ id, width, height }: { id: string; width: number; height: number }) {
  const [src, setSrc] = useState('')
  const [fit, setFit] = useState<'cover'|'contain'|'fill'>('cover')
  const [link, setLink] = useState('')
  const [radius, setRadius] = useState(6)
  const [editing, setEditing] = useState(false)
  const [draftSrc, setDraftSrc] = useState('')
  const [draftLink, setDraftLink] = useState('')
  const [draftFit, setDraftFit] = useState<'cover'|'contain'|'fill'>('cover')
  const [draftRadius, setDraftRadius] = useState(6)
  useEffect(() => {
    const d = load(id)
    if (d) { setSrc(d.src); setFit(d.fit); setLink(d.link); setRadius(d.radius ?? 6); setDraftSrc(d.src); setDraftFit(d.fit); setDraftLink(d.link); setDraftRadius(d.radius ?? 6); setEditing(!d.src) }
    else setEditing(true)
  }, [id])
  const commit = () => {
    const v: ImageDef = { src: draftSrc.trim(), fit: draftFit, link: draftLink.trim(), radius: draftRadius }
    setSrc(v.src); setFit(v.fit); setLink(v.link); setRadius(v.radius)
    save(id, v); setEditing(false)
  }
  const onFile = (f: File | null) => {
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => { const s = String(reader.result ?? ''); setDraftSrc(s) }
    reader.readAsDataURL(f)
  }
  if (editing) {
    return (
      <div className="w-full h-full flex flex-col gap-2 p-2 min-h-0 bg-[#040404]">
        <input value={draftSrc} onChange={(e) => setDraftSrc(e.target.value)} placeholder="image url or upload file below" className="w-full bg-transparent border border-white/15 rounded-sm px-2 py-1.5 text-xs font-mono text-[var(--text-main)] outline-none focus:border-[var(--border-bezel)] placeholder:text-[var(--text-muted)]/60" />
        <label className="text-xs font-mono text-[var(--text-muted)] flex items-center gap-2 cursor-pointer">
          <span className="border border-white/15 rounded-sm px-2 py-1 hover:border-white/30 transition-colors">choose file</span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
          <span className="truncate">{draftSrc.startsWith('data:') ? 'embedded image' : ''}</span>
        </label>
        <input value={draftLink} onChange={(e) => setDraftLink(e.target.value)} placeholder="link url (optional, click image to open)" className="w-full bg-transparent border border-white/15 rounded-sm px-2 py-1.5 text-xs font-mono text-[var(--text-main)] outline-none focus:border-[var(--border-bezel)] placeholder:text-[var(--text-muted)]/60" />
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
          <span>fit</span>
          {(['cover','contain','fill'] as const).map((o) => (
            <button key={o} onClick={() => setDraftFit(o)} className={`px-2 py-1 border rounded-sm ${draftFit===o?'border-white/70 text-white':'border-white/15 hover:border-white/30'}`}>{o}</button>
          ))}
        </div>
        <Slider value={draftRadius} min={0} max={24} step={1} onChange={setDraftRadius} unit="px" />
        {draftSrc && <img src={draftSrc} alt="" className="w-full h-24 object-cover rounded-sm border border-white/10" onError={(e) => (e.currentTarget.style.display='none')} />}
        <div className="flex gap-2 text-xs">
          <button onClick={commit} className="text-[var(--text-muted)] hover:text-white transition-colors">save</button>
          <button onClick={() => { if (src) setEditing(false) }} className="text-[var(--text-muted)] hover:text-white transition-colors">cancel</button>
        </div>
      </div>
    )
  }
  if (!src) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4 text-xs font-mono text-[var(--text-muted)] border border-dashed border-white/15 rounded-sm">
        no image — click edit
        <button onClick={() => setEditing(true)} className="ml-2 underline hover:text-white">edit</button>
      </div>
    )
  }
  const img = <img src={src} alt="" draggable={false} style={{ width, height, objectFit: fit, borderRadius: radius }} className="select-none" />
  return (
    <div className="w-full h-full relative group/image overflow-hidden" style={{ borderRadius: radius }}>
      {link ? <a href={link} target="_blank" rel="noopener noreferrer" className="block w-full h-full">{img}</a> : img}
      <button onPointerDown={(e)=>e.stopPropagation()} onClick={()=>setEditing(true)} className="absolute bottom-1 right-1 z-10 text-[10px] font-mono text-white bg-black/70 border border-white/20 rounded-sm px-1.5 py-0.5 opacity-0 group-hover/image:opacity-100 transition-opacity">edit</button>
    </div>
  )
}