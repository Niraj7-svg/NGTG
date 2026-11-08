import Link from 'next/link'
import { Fraunces, Caveat } from 'next/font/google'
import { site, links } from '../lib/content'
import Icon from '../components/Icon'
import '../theme/theme.css'

const fraunces = Fraunces({ subsets: ['latin'], axes: ['SOFT', 'opsz'], variable: '--font-display' })
const caveat = Caveat({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-hand' })

export function generateMetadata() {
  const s = site()
  return { title: s.name, description: s.tagline }
}

export default function Layout({ children }) {
  const s = site()
  return (
    <html lang="en" className={`${fraunces.variable} ${caveat.variable}`}>
      <body>
        <header className="site-header">
          <Link href="/" className="brand">{s.name}</Link>
          <nav aria-label="Main">
            <Link href="/devlog">Devlog</Link>
            <Link href="/work">Work</Link>
            <Link href="/about">About</Link>
            <Link href="/about#contact" className="button">Contact</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <ul className="foot-links">{links(s).map(l => <li key={l.href}><a href={l.href}><Icon name={l.icon} />{l.label}</a></li>)}</ul>
        </footer>
      </body>
    </html>
  )
}
