'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Github } from 'lucide-react'
import { usePathname } from 'next/navigation'
import MobileMenu from './MobileMenu'
import styles from './Nav.module.css'

type MenuItem =
  | { type: 'link'; href: string; label: string }
  | { type: 'scroll'; targetId: string; label: string }

const mobileItems: MenuItem[] = [
  { type: 'link', href: '/pricing', label: 'Pricing' },
  { type: 'link', href: '/docs', label: 'Docs' },
  { type: 'link', href: '/demos', label: 'Demos' },
  { type: 'link', href: '/account', label: 'Account' }
]

const desktopItems = mobileItems.filter(
  (item): item is Extract<MenuItem, { type: 'link' }> => item.type === 'link'
)

export function Nav() {
  const pathname = usePathname()

  return (
    <header className="rmg-intro-sticky-nav sticky top-0 z-50 w-full bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 [@media(min-width:501px)]:px-6 gap-24 [@media(max-width:500px)]:gap-3">
        {/* Left: Logo */}
        <Link href="/" className="min-w-0 max-w-150 shrink">
          <Image
            src="https://cdn.react-motion-gallery.com/nav/rmg-logo-v6.png"
            alt="React Motion Gallery"
            width={640}
            height={28}
            className="w-full max-w-full aspect-640/28"
            priority
          />
        </Link>

        {/* Right: Desktop nav (>= 768px) */}
        <nav className={styles.desktopNav} aria-label="Primary navigation">
          {desktopItems.map((item) => {
            const isCurrent =
              pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={styles.navLink}
                data-current={isCurrent ? 'true' : undefined}
                data-tone={item.label.toLowerCase()}
                aria-current={isCurrent ? 'page' : undefined}
              >
                <span className={styles.navGlyph} aria-hidden />
                <span className={styles.linkText}>{item.label}</span>
              </Link>
            )
          })}

          {/* GitHub */}
          <a
            href="https://github.com/davidmedero/react-motion-gallery/tree/main/packages/react-motion-gallery"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className={styles.githubLink}
          >
            <Github size={19} strokeWidth={2.2} aria-hidden />
          </a>
        </nav>

        {/* Mobile menu (< 768px) */}
        <div className="md:hidden">
          <MobileMenu items={mobileItems} />
        </div>
      </div>
    </header>
  )
}
