/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import Link from 'next/link'
import { useRouter } from '@bprogress/next/app'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import styles from './MobileMenu.module.css'

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

type MenuItem =
  | { type: 'link'; href: string; label: string }
  | { type: 'scroll'; targetId: string; label: string }

export default function MobileMenu({ items }: { items: MenuItem[] }) {
  const isClient = useIsClient();

  const router = useRouter()
  const pathname = usePathname()

  const [open, setOpen] = useState(false)

  const btnRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Array<HTMLElement | null>>([])

  const closeMenu = () => setOpen(false)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  useEffect(() => {
    if (!open) return

    const onDown = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node
      if (panelRef.current?.contains(t) || btnRef.current?.contains(t)) return
      closeMenu()
      btnRef.current?.focus()
    }

    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown, { passive: true })
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
    }
  }, [open])

  useEffect(() => {
    if (open) panelRef.current?.focus()
    else btnRef.current?.focus()
  }, [open])

  function focusItem(idx: number) {
    itemRefs.current[idx]?.focus()
  }

  function onItemKeyDown(e: React.KeyboardEvent, idx: number) {
    if (e.key === 'Escape') {
      e.preventDefault()
      closeMenu()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      focusItem((idx + 1) % items.length)
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      focusItem((idx - 1 + items.length) % items.length)
    }
  }

  function handleItemClick(item: MenuItem) {
    if (item.type === 'scroll') {
      if (pathname === '/') {
        closeMenu()
        requestAnimationFrame(() => {
          document.getElementById(item.targetId)?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
        })
      } else {
        sessionStorage.setItem('__scrollTo', item.targetId)
        closeMenu()
        router.push('/')
      }
      return
    }

    closeMenu()
  }

  const common = styles.item

  return (
    <div className="relative md:hidden">
      <button
        ref={btnRef}
        type="button"
        aria-label="Toggle menu"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
        data-open={open}
        onClick={() => setOpen((v) => !v)}
        className="p-5 rounded-md text-[rgb(var(--rmg-logo-shadow-rgb))] focus:outline-none cursor-pointer relative z-60"
      >
        <span className={`${styles.burger} ${styles.top}`} aria-hidden />
        <span className={`${styles.burger} ${styles.middle}`} aria-hidden />
        <span className={`${styles.burger} ${styles.bottom}`} aria-hidden />
      </button>

      {
        isClient &&
          createPortal(
            <div
              className={`${styles.backdrop} ${open ? styles.open : styles.closed}`}
              onClick={() => setOpen(false)}
              aria-hidden={!open}
            />,
            document.body
          )
      }

      <div
        id="mobile-menu-panel"
        role="menu"
        ref={panelRef}
        tabIndex={-1}
        className={`${styles.panel} ${open ? styles.open : styles.closed}`}
        aria-hidden={!open}
      >
        <ul className={styles.list}>
          {items.map((item, i) => {
            if (item.type === 'scroll') {
              return (
                <li key={item.label} style={{ ['--d' as any]: `${i * 55}ms` }}>
                  <button
                    ref={(el) => {
                      itemRefs.current[i] = el
                    }}
                    type="button"
                    role="menuitem"
                    tabIndex={0}
                    className={common}
                    onKeyDown={(e) => onItemKeyDown(e, i)}
                    onClick={() => handleItemClick(item)}
                  >
                    {item.label}
                  </button>
                </li>
              )
            }

            const isCurrent =
              pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <li key={item.label} style={{ ['--d' as any]: `${i * 55}ms` }}>
                <Link
                  ref={(el) => {
                    itemRefs.current[i] = el
                  }}
                  href={item.href}
                  role="menuitem"
                  tabIndex={0}
                  className={common}
                  data-current={isCurrent}
                  aria-current={isCurrent ? 'page' : undefined}
                  onKeyDown={(e) => onItemKeyDown(e, i)}
                  onClick={() => handleItemClick(item)}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
