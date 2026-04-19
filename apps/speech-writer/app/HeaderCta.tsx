'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Hide the CTA once the user is past the landing page
const HIDDEN_PATHS = ['/create', '/generating', '/checkout'];

export function HeaderCta() {
  const pathname = usePathname();

  // Hide on /create, /generating, /checkout/*, and /[token] (speech viewer)
  const hide =
    HIDDEN_PATHS.some(p => pathname === p || pathname.startsWith(p + '/')) ||
    // /[token] — any single-segment path that isn't a known route
    /^\/[^/]+$/.test(pathname) && !['/', '/create', '/generating'].includes(pathname);

  if (hide) return null;

  return (
    <Link href="/create" className="sw-header__cta">
      Write my speech →
    </Link>
  );
}
