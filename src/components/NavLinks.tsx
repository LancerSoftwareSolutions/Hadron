'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NavLinks({ items }: { items: { href: string; label: string; badge?: number }[] }) {
  const pathname = usePathname()
  return (
    <>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="navlink"
          aria-current={pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'page' : undefined}
        >
          {item.label}
          {item.badge ? (
            <span className="ms-1.5 rounded-full bg-sky px-1.5 text-xs font-extrabold text-navy-deep">{item.badge}</span>
          ) : null}
        </Link>
      ))}
    </>
  )
}
