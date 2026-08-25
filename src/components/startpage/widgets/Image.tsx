import { useEffect, useRef, useState } from 'react'
import Slider from '../settings/Slider'
const KEY = 'startpage-widget-image'
type ImageDef = { src: string; fit: 'cover' | 'contain' | 'fill'; link: string; radius: number }
type Status = { kind: 'ok' | 'error'; msg: string } | null
function load(id: string): ImageDef | null {
  try { const all = JSON.parse(localStorage.getItem(KEY) ?? '{}'); return all[id] ?? null } catch { return null }
}
function save(id: string, v: ImageDef): string | null {
  try { const all = JSON.parse(localStorage.getItem(KEY) ?? '{}'); all[id] = v; localStorage.setItem(KEY, JSON.stringify(all)); return null } catch (e) {
    const quota = e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22)
    return quota ? 'storage full — use a url instead of a file' : 'could not save image settings'
  }
}
export default function ImageWidget({ id }: { id: string; width: number; height: number }) {
  const [src, setSrc] = useState('')
  const [fit, setFit] = useState<'cover' | 'contain' | 'fill'>('cover')
  const [link, setLink] = useState('')
  const [radius, setRadius] = useState(6)
  const [editing, setEditing] = useState(false)
  const [broken, setBroken] = useState(false)
  const [status, setStatus] = useState<Status>(null)
  const [draftSrc, setDraftSrc] = useState('')
  const [draftLink, setDraftLink] = useState('')
  const [draftFit, setDraftFit] = useState<'cover' | 'contain' | 'fill'>('cover')
  const [draftRadius, setDraftRadius] = useState(6)
  const fileRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const d = load(id)
    if (d) {
      setSrc(d.src); setFit(d.fit); setLink(d.link); setRadius(d.radius ?? 6)
      setDraftSrc(d.src); setDraftFit(d.fit); setDraftLink(d.link); setDraftRadius(d.radius ?? 6)
      setBroken(false); setEditing(!d.src)
    } else setEditing(true)
  }, [id])
  useEffect(() => { setBroken(false) }, [src])
  const commit = () => {
    const v: ImageDef = { src: draftSrc.trim(), fit: draftFit, link: draftLink.trim(), radius: draftRadius }
    if (!v.src) { setStatus({ kind: 'error', msg: 'image url required' }); return }
    const err = save(id, v)
    if (err) { setStatus({ kind: 'error', msg: err }); return }
    setSrc(v.src); setFit(v.fit); setLink(v.link); setRadius(v.radius)
    setStatus(null); setEditing(false)
  }
  const onFile = (f: File | null) => {
    if (!f) return
    if (!f.type.startsWith('image/')) { setStatus({ kind: 'error', msg: 'not an image file' }); return }
    if (f.size > 2 * 1024 * 1024) { setStatus({ kind: 'error', msg: 'file too large (max 2mb)' }); return }
    const reader = new FileReader()
    reader.onload = () => { setDraftSrc(String(reader.result ?? '')); setStatus(null) }
    reader.onerror = () => setStatus({ kind: 'error', msg: 'could not read file' })
    reader.readAsDataURL(f)
  }
  if (editing) {
    return (
      <div className="w-full h-full flex flex-col gap-1.5 p-2 min-h-0 bg-[#040404]/95 overflow-y-auto hide-scrollbar">
        <input value={draftSrc} onChange={(e) => { setDraftSrc(e.target.value); setStatus(null) }} placeholder="image url" className="shrink-0 w-full bg-transparent border border-white/15 rounded-sm px-2 py-1 text-xs font-mono text-[var(--text-main)] outline-none focus:border-[var(--border-bezel)] placeholder:text-[var(--text-muted)]/60" />
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => fileRef.current?.click()} className="text-[10px] font-mono border border-white/15 rounded-sm px-2 py-1 text-[var(--text-muted)] hover:border-white/30 hover:text-white transition-colors">upload</button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { onFile(e.target.files?.[0] ?? null); e.currentTarget.value = '' }} />
          <span className="text-[10px] font-mono text-[var(--text-muted)]/60 truncate">{draftSrc.startsWith('data:') ? 'embedded image' : ''}</span>
        </div>
        <input value={draftLink} onChange={(e) => setDraftLink(e.target.value)} placeholder="click link (optional)" className="shrink-0 w-full bg-transparent border border-white/15 rounded-sm px-2 py-1 text-xs font-mono text-[var(--text-main)] outline-none focus:border-[var(--border-bezel)] placeholder:text-[var(--text-muted)]/60" />
        <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono text-[var(--text-muted)]">
          <span>fit</span>
          {(['cover', 'contain', 'fill'] as const).map((o) => (
            <button key={o} onClick={() => setDraftFit(o)} className={`px-1.5 py-0.5 border rounded-sm transition-colors ${draftFit === o ? 'border-white/70 text-white' : 'border-white/15 hover:border-white/30'}`}>{o}</button>
          ))}
        </div>
        <Slider value={draftRadius} min={0} max={24} step={1} onChange={setDraftRadius} unit="px" />
        {draftSrc && !broken && (
          <img src={draftSrc} alt="" className="shrink-0 min-h-0 flex-1 w-full object-cover rounded-sm border border-white/10" onError={() => setBroken(true)} onLoad={() => setBroken(false)} />
        )}
        {broken && <span className="shrink-0 text-[10px] font-mono text-red-300/80">preview failed — check the url</span>}
        {status && <span className={`shrink-0 text-[10px] font-mono ${status.kind === 'error' ? 'text-red-300/80' : 'text-emerald-300/80'}`}>{status.msg}</span>}
        <div className="flex gap-3 shrink-0 text-xs">
          <button onClick={commit} className="text-[var(--text-muted)] hover:text-white transition-colors">save</button>
          <button onClick={() => { if (src) { setEditing(false); setStatus(null); setDraftSrc(src); setDraftLink(link); setDraftFit(fit); setDraftRadius(radius) } }} className="text-[var(--text-muted)] hover:text-white transition-colors">cancel</button>
        </div>
      </div>
    )
  }
  if (!src || broken) {
    return (
      <div className="w-full h-full flex items-center justify-center gap-2 p-4 text-xs font-mono text-[var(--text-muted)] border border-dashed border-white/15 rounded-sm">
        <span>{broken ? 'failed to load' : 'no image'}</span>
        <button onClick={() => { setDraftSrc(src); setDraftLink(link); setDraftFit(fit); setDraftRadius(radius); setEditing(true) }} className="underline hover:text-white">edit</button>
      </div>
    )
  }
  const img = <img src={src} alt="" draggable={false} style={{ objectFit: fit, borderRadius: radius }} className="w-full h-full select-none block" onError={() => setBroken(true)} />
  return (
    <div className="w-full h-full relative group/image overflow-hidden" style={{ borderRadius: radius }}>
      {link ? <a href={link} target="_blank" rel="noopener noreferrer" className="block w-full h-full">{img}</a> : img}
      <button onPointerDown={(e) => e.stopPropagation()} onClick={() => { setDraftSrc(src); setDraftLink(link); setDraftFit(fit); setDraftRadius(radius); setEditing(true) }} className="absolute bottom-1 right-1 z-10 text-[10px] font-mono text-white bg-black/70 border border-white/20 rounded-sm px-1.5 py-0.5 opacity-0 group-hover/image:opacity-100 transition-opacity">edit</button>
    </div>
  )
}