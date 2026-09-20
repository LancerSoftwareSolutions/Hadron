'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NavLinks({ items }: { items: { href: string; label: string }[] }) {
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
        </Link>
      ))}
    </>
  )
}
