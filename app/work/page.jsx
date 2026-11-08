import { list } from '../../lib/content'
import { Body } from '../../components/mdx'
import { Reel, Video, Polaroid, Sticky, Paper, stickyColor, noteColors } from '../../components/paper'
import { PageTitle, SectionTitle, isShort } from '../../components/board'

export const metadata = { title: 'Work' }

const isShowreel = d => d.type === 'showreel' || d.showreel === true          // `showreel: true` still works
const byDate = (a, b) => String(b.data.date ?? '').localeCompare(String(a.data.date ?? ''))
const byOrder = (a, b) => (a.data.order ?? Infinity) - (b.data.order ?? Infinity) || byDate(a, b)
const host = u => String(u).replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

function Media({ w }) {
  const d = w.data
  // `type` says which link leads; without it a reel wins, as before
  const kind = (d.type === 'video' || d.type === 'showreel' ? ['video', 'reel'] : ['reel', 'video']).find(k => d[k])
  if (kind === 'reel') return <Reel url={d.reel} file={w.file} />
  if (kind === 'video') return <Video url={d.video} poster={d.cover} title={d.title} file={w.file} />
  return null
}

// A client quote. As a note on its own, or plain when it sits inside a project card.
function Quote({ q, index, note }) {
  const d = q.data
  const color = stickyColor(q.slug, index)
  const inner = (
    <>
      {d.photo && <Polaroid src={d.photo} alt={`Portrait of ${d.name}`} small file={q.file} />}
      <div>
        <blockquote className={isShort(q.body) ? 'hand quote-hand' : ''}><Body source={q.body} file={q.file} /></blockquote>
        <p className="hand by">{d.link ? <a href={d.link}>{d.name}</a> : d.name}{d.role && `, ${d.role}`}</p>
      </div>
    </>
  )
  return note
    ? <Sticky size="medium" color={color} seed={q.slug} className="s6 quote-note"><div className={`quote${d.photo ? ' has-photo' : ''}`}>{inner}</div></Sticky>
    : <div className={`quote${d.photo ? ' has-photo' : ''}`}>{inner}</div>
}

function Project({ w, quotes, index }) {
  const d = w.data
  const color = stickyColor(w.slug, index)
  const did = Array.isArray(d.did) ? d.did : []
  const didColors = noteColors(did, color)
  return (
    <Sticky size="medium" color={color} seed={w.slug} className="s4 project-card" id={w.slug}>
      <Media w={w} />
      <h3 className={isShort(d.title) ? 'hand hand-h' : 'serif-h'}>{d.title}</h3>
      {(d.client || d.date) && (
        <p className="hand">{d.client && (d.clientLink ? <a href={d.clientLink}>{d.client}</a> : d.client)}{d.client && d.date && ' · '}{d.date && <time>{d.date}</time>}</p>
      )}
      {did.length > 0 && (
        <ul className="tag-row">{did.map((x, i) => <li key={x}><Sticky size="small" pin="none" color={didColors[i]} seed={x}><span className="hand">{x}</span></Sticky></li>)}</ul>
      )}
      {d.result && <p className="result">Result: {d.result}</p>}
      <Body source={w.body} file={w.file} />
      {quotes.map(q => <Quote key={q.slug} q={q} />)}
    </Sticky>
  )
}

export default function Work() {
  const work = list('work')
  const quotes = list('testimonials').sort((a, b) => Number(!!b.data.featured) - Number(!!a.data.featured))
  const growth = list('growth')[0]
  if (!work.length && !quotes.length && !growth) return <><PageTitle>Work</PageTitle><p className="empty">Editing work coming soon.</p></>

  for (const q of quotes) {
    if (q.data.project && !work.some(w => w.slug === q.data.project)) console.warn(`${q.file}: 'project' points to '${q.data.project}' which is a draft or does not exist. The quote is only shown in the quotes list.`)
  }
  const showreel = work.find(w => isShowreel(w.data))
  const rest = work.filter(w => w !== showreel)   // a second showreel is listed like any project
  const projects = [...rest.filter(w => w.data.featured).sort(byOrder), ...rest.filter(w => !w.data.featured).sort(byDate)]
  const quotesFor = slug => quotes.filter(q => q.data.project === slug)
  const g = growth?.data
  const hasIntro = g && (g.started || g.account || growth.body.trim())

  return (
    <>
      <PageTitle>Work</PageTitle>

      {showreel && (
        <section className="board-section showreel">
          <SectionTitle>Showreel</SectionTitle>
          <Media w={showreel} />
          {(showreel.data.title || showreel.body.trim()) && (
            <Sticky size="medium" color="sky" seed={showreel.slug} className="showreel-note">
              <h3 className={isShort(showreel.data.title) ? 'hand hand-h' : 'serif-h'}>{showreel.data.title}</h3>
              <Body source={showreel.body} file={showreel.file} />
              {quotesFor(showreel.slug).map(q => <Quote key={q.slug} q={q} />)}
            </Sticky>
          )}
        </section>
      )}

      {projects.length > 0 && (
        <section className="board-section">
          <SectionTitle>Projects</SectionTitle>
          <div className="grid">{projects.map((w, i) => <Project key={w.slug} w={w} index={i} quotes={quotesFor(w.slug)} />)}</div>
        </section>
      )}

      {quotes.length > 0 && (
        <section className="board-section">
          <SectionTitle>What people say</SectionTitle>
          <div className="grid">{quotes.map((q, i) => <Quote key={q.slug} q={q} index={i} note />)}</div>
        </section>
      )}

      {growth && (
        <section className="board-section">
          <SectionTitle>{g.title ?? 'Growth story'}</SectionTitle>
          {hasIntro && (
            <Paper seed={growth.slug} className="growth-intro">
              {(g.started || g.account) && (
                <p className="meta">
                  {g.started && <>Started <time>{g.started}</time></>}{g.started && g.account && ' · '}
                  {g.account && (/^https?:/.test(g.account) ? <a href={g.account}>{host(g.account)}</a> : g.account)}
                </p>
              )}
              <Body source={growth.body} file={growth.file} />
            </Paper>
          )}
          <ol className="milestones">
            {g.milestones.map((m, i) => (
              <li key={m.date}>
                <Sticky size="small" color={stickyColor(m.date, i)} seed={`${growth.slug}-${m.date}`}>
                  <p className="hand"><time>{m.date}</time></p>
                  <p className="hand hand-b">{Number(m.followers).toLocaleString('en')} followers</p>
                  <p>{m.note}</p>
                  {m.reel && <Reel url={m.reel} file={growth.file} />}
                </Sticky>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  )
}
