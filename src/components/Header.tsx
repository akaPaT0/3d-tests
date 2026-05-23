'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';

interface HeaderProps {
  variant?: 'default' | 'blender';
}

export default function Header({ variant = 'default' }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Handle body scroll locking when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <>
      <header className={styles.header}>
        <Link
          href="/"
          className={`${styles.logoLink} ${menuOpen ? styles.logoHidden : ''}`}
          id="back-to-home"
        >
          <img
            src="/new logo wellframed.png"
            alt="Well Framed Logo"
            className={styles.logoImg}
          />
        </Link>

        <button
          className={`${styles.menuBtn} ${menuOpen ? styles.menuBtnActive : ''}`}
          onClick={toggleMenu}
          aria-label={menuOpen ? 'Close Menu' : 'Open Menu'}
        >
          <div className={styles.menuIconContainer}>
            {/* Dot Grid Icon (Closed State) */}
            <div className={`${styles.dotGridIcon} ${menuOpen ? styles.fadeOutRotate : ''}`}>
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                <circle cx="4" cy="4" r="1.5" fill="currentColor" />
                <circle cx="10" cy="4" r="1.5" fill="currentColor" />
                <circle cx="16" cy="4" r="1.5" fill="currentColor" />
                <circle cx="4" cy="10" r="1.5" fill="currentColor" />
                <circle cx="10" cy="10" r="1.5" fill="currentColor" />
                <circle cx="16" cy="10" r="1.5" fill="currentColor" />
                <circle cx="4" cy="16" r="1.5" fill="currentColor" />
                <circle cx="10" cy="16" r="1.5" fill="currentColor" />
                <circle cx="16" cy="16" r="1.5" fill="currentColor" />
              </svg>
            </div>

            {/* Close Cross Icon (Open State) */}
            <div className={`${styles.closeIcon} ${menuOpen ? styles.fadeInRotate : ''}`}>
              {variant === 'blender' ? (
                // Custom viewfinder close button
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 9l6 6M15 9l-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 8V4h4M16 4h4v4M4 16v4h4M16 20h4v-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                // Close (X) icon
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>
        </button>
      </header>

      {/* Fullscreen Overlay Menu */}
      <div className={`${styles.menuOverlay} ${menuOpen ? styles.menuOpen : ''} ${variant === 'blender' ? styles.blenderOverlay : ''}`}>
        {variant === 'blender' ? (
          <nav className={styles.blenderNavLinks}>
            <Link href="/" className={styles.blenderNavLink}>
              Home
            </Link>
            <a href="#packages" className={styles.blenderNavLink} onClick={() => setMenuOpen(false)}>
              Packages
            </a>
            <a href="#equipment" className={styles.blenderNavLink} onClick={() => setMenuOpen(false)}>
              Equipment
            </a>
            <a href="#crew" className={styles.blenderNavLink} onClick={() => setMenuOpen(false)}>
              Crew
            </a>
            <a href="#calendar" className={styles.calendarBtn} onClick={() => setMenuOpen(false)}>
              <span className={styles.calendarBtnText}>Calendar</span>
            </a>
          </nav>
        ) : (
          <>
            <nav className={styles.navLinks}>
              <Link href="/" className={styles.navLink}>
                <span className={styles.navNumber}>01</span>
                <span className={styles.navText}>Home</span>
              </Link>
              <a href="/#portfolio" className={styles.navLink} onClick={() => setMenuOpen(false)}>
                <span className={styles.navNumber}>02</span>
                <span className={styles.navText}>Portfolio</span>
              </a>
              <a href="/#about" className={styles.navLink} onClick={() => setMenuOpen(false)}>
                <span className={styles.navNumber}>03</span>
                <span className={styles.navText}>About</span>
              </a>
              <a href="/#contact" className={styles.navLink} onClick={() => setMenuOpen(false)}>
                <span className={styles.navNumber}>04</span>
                <span className={styles.navText}>Contact</span>
              </a>
              <Link href="/blender" className={styles.navLink}>
                <span className={styles.navNumber}>05</span>
                <span className={styles.navText}>3D Scene ✦</span>
              </Link>
            </nav>

            <div className={styles.menuFooter}>
              <span>© 2026 Patrick Moreau Studio</span>
              <span>Warsaw, Poland</span>
            </div>
          </>
        )}
      </div>
    </>
  );
}

