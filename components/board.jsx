import Link from 'next/link'
import { Sticky, Cutout, Reel, Card, stickyColor, noteColors } from './paper'

// Handwriting is only for short text: under 20 words.
export const isShort = text => String(text ?? '').trim().split(/\s+/).filter(Boolean).length < 20

export const PageTitle = ({ children }) => (
  <Sticky size="medium" className="page-title-note"><h1 className="hand hand-h">{children}</h1></Sticky>
)

export const SectionTitle = ({ children, className = '' }) => (
  <Sticky size="small" className={`section-title ${className}`}><h2 className="hand hand-h">{children}</h2></Sticky>
)

// A row of small notes. `parent` is the colour of whatever they sit on, so they never match it.
export function Tags({ tags = [], draft, parent, active, linked = true }) {
  const all = [...tags, ...(draft ? ['draft'] : [])]
  if (!all.length) return null
  const colors = noteColors(all, parent)
  return (
    <ul className="tag-row">
      {all.map((t, i) => (
        <li key={t}>
          <Sticky size="small" pin="none" color={colors[i]} seed={t} href={linked && t !== 'draft' ? `/devlog/tag/${t}` : undefined} className={active === t ? 'is-active' : ''}>
            <span className="hand">{t}</span>
          </Sticky>
        </li>
      ))}
    </ul>
  )
}

// A devlog post as a note: cover (or, if asked, the reel), "Ep N" and date, title, summary, tags.
export function PostCard({ p, index = 0, showReel, className = '' }) {
  const d = p.data
  const color = stickyColor(p.slug, index)
  return (
    <Sticky size="medium" color={color} seed={p.slug} className={`post-card ${className}`}>
      {d.cover ? <Cutout src={d.cover} alt={`Cover for ${d.title}`} file={p.file} /> : showReel && d.reel ? <Reel url={d.reel} file={p.file} /> : null}
      <p className="hand">{d.episode != null && <span>Ep {d.episode} · </span>}<time>{d.date}</time></p>
      <h3 className="card-title"><Link href={`/devlog/${p.slug}`}>{d.title}</Link></h3>
      {d.summary && <p>{d.summary}</p>}
      <Tags tags={d.tags} draft={d.draft} parent={color} />
    </Sticky>
  )
}

export function WorkCard({ w, className = '' }) {
  const d = w.data
  return (
    <Card href={`/work#${w.slug}`} seed={w.slug} className={className}>
      {d.cover && <img src={d.cover} alt={`Cover for ${d.title}`} loading="lazy" decoding="async" />}
      <strong className="card-title">{d.title}</strong>
      {d.client && <span className="meta">{d.client}</span>}
    </Card>
  )
}
