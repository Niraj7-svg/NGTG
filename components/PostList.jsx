import { list } from '../lib/content'
import { Sticky, noteColors } from './paper'
import { PageTitle, PostCard } from './board'

export default function PostList({ tag }) {
  const all = list('devlog')
  const tags = [...new Set(all.flatMap(p => p.data.tags ?? []))]
  const posts = tag ? all.filter(p => p.data.tags?.includes(tag)) : all
  const names = ['all', ...tags]
  const colors = noteColors(names)
  return (
    <>
      <PageTitle>Devlog</PageTitle>
      {tags.length > 0 && (
        <nav className="tag-row filter-row" aria-label="Filter by tag">
          {names.map((t, i) => (
            <Sticky key={t} size="small" pin="none" color={colors[i]} seed={t} href={t === 'all' ? '/devlog' : `/devlog/tag/${t}`}
              className={(tag ?? 'all') === t ? 'is-active' : ''}>
              <span className="hand" aria-current={(tag ?? 'all') === t ? 'page' : undefined}>{t}</span>
            </Sticky>
          ))}
        </nav>
      )}
      {posts.length === 0 ? <p>No posts yet.</p> : (
        <div className="grid">{posts.map((p, i) => <PostCard key={p.slug} p={p} index={i} className="s6" />)}</div>
      )}
    </>
  )
}
