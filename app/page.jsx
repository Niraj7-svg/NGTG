import fs from 'node:fs'
import path from 'node:path'
import { site, list, story, home } from '../lib/content'
import { Body } from '../components/mdx'
import { Clipping, Polaroid, Cutout, Sticky } from '../components/paper'
import { SectionTitle, PostCard, WorkCard, isShort } from '../components/board'

const real = v => (v && v !== 'REPLACE' ? v : undefined)
const byOrder = (a, b) => (a.data.order ?? Infinity) - (b.data.order ?? Infinity) || String(b.data.date ?? '').localeCompare(String(a.data.date ?? ''))

// The "How it started" picture. imageStyle: clipping (default), polaroid or cutout. mono only matters for a clipping.
function StoryPicture({ d, file }) {
  const caption = real(d.caption), credit = real(d.credit)
  if (d.imageStyle === 'polaroid') return <Polaroid src={d.image} alt={d.alt} caption={[caption, credit].filter(Boolean).join(' · ') || undefined} file={file} />
  if (d.imageStyle === 'cutout') return <Cutout src={d.image} alt={d.alt} caption={[caption, credit].filter(Boolean).join(' · ') || undefined} file={file} />
  return <Clipping mono={d.mono !== false} src={d.image} alt={d.alt} caption={caption} credit={credit} creditLink={real(d.creditLink)} file={file} />
}

export default function Home() {
  const s = site()
  const st = story()
  const d = st?.data
  // No image file yet: the tagline note and the story note simply stack, full width.
  const hasImage = !!d?.image && (/^https?:/.test(d.image) || fs.existsSync(path.join(process.cwd(), 'public', d.image)))
  const hm = home()
  const posts = list('devlog').slice(0, 3)
  const featured = list('work').filter(w => w.data.featured).sort(byOrder).slice(0, 3)
  return (
    <>
      <section className="grid home-top">
        <div className={`home-left ${hasImage ? 's6' : 's12'}`}>
          <Sticky size="medium" color="coral" seed="tagline" className="hero-note">
            <h1 className={isShort(s.tagline) ? 'hand hand-h' : 'serif-h'}>{s.tagline}</h1>
          </Sticky>
          {hasImage && <StoryPicture d={d} file={st.file} />}
        </div>
        {st && (
          <div className={hasImage ? 's6' : 's12'}>
            <Sticky size="large" color="yellow" seed="story" className={`story-note${hasImage ? '' : ' is-wide'}`}>
              <h2 className="hand hand-h">{d.title}</h2>
              <div className="story-body"><Body source={st.body} file={st.file} /></div>
            </Sticky>
          </div>
        )}
      </section>

      {hm && <section className="board-section home-sections"><Body source={hm.body} file={hm.file} /></section>}

      {posts.length > 0 && (
        <section className="board-section">
          <SectionTitle>Latest devlogs</SectionTitle>
          <div className="grid">{posts.map((p, i) => <PostCard key={p.slug} p={p} index={i} showReel className="s4" />)}</div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="board-section">
          <SectionTitle>Work</SectionTitle>
          <div className="grid">{featured.map(w => <WorkCard key={w.slug} w={w} className="s4" />)}</div>
        </section>
      )}
    </>
  )
}
