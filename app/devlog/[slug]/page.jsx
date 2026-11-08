import { list } from '../../../lib/content'
import { Body } from '../../../components/mdx'
import { Reel, Sticky, Paper, stickyColor } from '../../../components/paper'
import { Tags, isShort } from '../../../components/board'

export const dynamicParams = false
export const generateStaticParams = () => list('devlog').map(p => ({ slug: p.slug }))

export async function generateMetadata({ params }) {
  const { slug } = await params
  return { title: list('devlog').find(p => p.slug === slug).data.title }
}

export default async function Post({ params }) {
  const { slug } = await params
  const posts = list('devlog')
  const post = posts.find(p => p.slug === slug)
  const wanted = post.data.previous
  const prev = wanted ? posts.find(p => p.slug === wanted) : undefined
  // A link to a draft or missing post is dropped with a warning; it never stops the build.
  if (wanted && !prev) console.warn(`${post.file}: 'previous' points to '${wanted}' which is a draft or does not exist. The link was dropped.`)
  const next = posts.find(p => p.data.previous === slug)
  const d = post.data
  // Pictures make a sheet tall, and a tall tilted sheet swings sideways. So only short, text-only sheets tilt.
  const straight = post.body.length > 1200 || !!d.reel || /!\[|<(Polaroid|Clipping|Cutout|Photo|Gallery|Clip|Compare|Reel|Video)\b/.test(post.body)
  return (
    <article className="post">
      <header className="post-head">
        <Sticky size="large" color="yellow" seed={`${slug}-title`} className="post-title-note">
          <h1 className={isShort(d.title) ? 'hand hand-h' : 'serif-h'}>{d.title}</h1>
          <p className="hand">{d.episode != null && <span>Ep {d.episode} · </span>}<time>{d.date}</time></p>
        </Sticky>
        <Tags tags={d.tags} draft={d.draft} parent="yellow" />
      </header>
      <Paper seed={slug} long={straight} className="post-sheet">
        <div className="paper-body">
          {d.reel && <Reel url={d.reel} file={post.file} />}
          <Body source={post.body} file={post.file} />
        </div>
      </Paper>
      {(prev || next) && (
        <nav className="post-nav" aria-label="More posts">
          {prev ? <Sticky size="small" color={stickyColor(prev.slug, 0)} seed={prev.slug} href={`/devlog/${prev.slug}`}><span className="hand">← {prev.data.title}</span></Sticky> : <span />}
          {next && <Sticky size="small" color={stickyColor(next.slug, 1)} seed={next.slug} href={`/devlog/${next.slug}`}><span className="hand">{next.data.title} →</span></Sticky>}
        </nav>
      )}
    </article>
  )
}
