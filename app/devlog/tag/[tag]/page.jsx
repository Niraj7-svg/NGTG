import PostList from '../../../../components/PostList'
import { list } from '../../../../lib/content'

export const dynamicParams = false
export const generateStaticParams = () => [...new Set(list('devlog').flatMap(p => p.data.tags ?? []))].map(tag => ({ tag }))

export default async function Tag({ params }) {
  return <PostList tag={(await params).tag} />
}
