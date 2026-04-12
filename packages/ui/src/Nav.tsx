'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export function Nav() {
  useEffect(() => {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    if (!toggle || !menu) return;

    function openMenu() {
      menu!.classList.add('is-open');
      toggle!.setAttribute('aria-expanded', 'true');
      toggle!.setAttribute('aria-label', 'Close menu');
      document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
      menu!.classList.remove('is-open');
      toggle!.setAttribute('aria-expanded', 'false');
      toggle!.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
    }

    const onToggle = () => menu!.classList.contains('is-open') ? closeMenu() : openMenu();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenu(); };
    const links = menu.querySelectorAll('a');

    toggle.addEventListener('click', onToggle);
    document.addEventListener('keydown', onKey);
    links.forEach(l => l.addEventListener('click', closeMenu));

    return () => {
      toggle.removeEventListener('click', onToggle);
      document.removeEventListener('keydown', onKey);
      links.forEach(l => l.removeEventListener('click', closeMenu));
    };
  }, []);

  return (
    <header className="nav" id="nav">
      <div className="nav__inner container">
        <Link href="/" className="nav__brand" aria-label="Bright Sparks AI — home">
          <svg className="nav__bolt" viewBox="0 0 20 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12.5 0L1 18.5H9.5L7 32L19 13H10.5L12.5 0Z" fill="#F5A623"/>
          </svg>
          <span className="nav__wordmark">Bright Sparks <span className="gold">AI</span></span>
        </Link>

        <button className="nav__hamburger" id="navToggle" aria-label="Open menu" aria-expanded="false" aria-controls="navMenu">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className="nav__menu" id="navMenu" aria-label="Main navigation">
          <a href="#builds" className="nav__link">Builds</a>
          <a href="#newsletter" className="nav__link">Newsletter</a>
          <a href="#hero-form" className="btn btn--sm">Get updates</a>
        </nav>
      </div>
    </header>
  );
}
