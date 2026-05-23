'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './GlobalMenu.module.css';

export default function GlobalMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.menuWrapper} ref={menuRef}>
      {/* Expanded Grid Panel */}
      <div className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}>
        <div className={styles.gridContainer}>
          {/* Viewfinder Crosshair Overlay */}
          <div className={styles.horizontalLine} />
          <div className={styles.verticalLine} />

          {/* Top Left: Photography */}
          <Link 
            href="/photography" 
            className={`${styles.gridItem} ${styles.outerItem} ${styles.topLeft}`}
            onClick={() => setIsOpen(false)}
          >
            <svg className={styles.icon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span className={styles.label}>Photo</span>
          </Link>

          {/* Top Right: Blender / 3D Gear */}
          <Link 
            href="/blender" 
            className={`${styles.gridItem} ${styles.outerItem} ${styles.topRight}`}
            onClick={() => setIsOpen(false)}
          >
            <svg className={styles.icon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <span className={styles.label}>3D Gear</span>
          </Link>

          {/* Center: Home Hub */}
          <Link 
            href="/" 
            className={`${styles.gridItem} ${styles.centerItem}`}
            onClick={() => setIsOpen(false)}
          >
            <svg className={styles.icon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className={styles.label}>Home</span>
          </Link>

          {/* Bottom Left: Darkroom */}
          <Link 
            href="/darkroom" 
            className={`${styles.gridItem} ${styles.outerItem} ${styles.bottomLeft}`}
            onClick={() => setIsOpen(false)}
          >
            <svg className={styles.icon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span className={styles.label}>Darkroom</span>
          </Link>

          {/* Bottom Right: Cosmic Lens */}
          <Link 
            href="/cosmic-lens" 
            className={`${styles.gridItem} ${styles.outerItem} ${styles.bottomRight}`}
            onClick={() => setIsOpen(false)}
          >
            <svg className={styles.icon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              <path d="M2 12h20" />
            </svg>
            <span className={styles.label}>Cosmic</span>
          </Link>
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        className={`${styles.fab} ${isOpen ? styles.fabActive : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle Portal Menu"
      >
        <div className={styles.fabIcon}>
          {isOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="9" stroke="rgba(245, 240, 232, 0.35)" />
              <path d="M12 3v18M3 12h18" stroke="currentColor" />
              <circle cx="12" cy="12" r="3" fill="var(--gold)" />
            </svg>
          )}
        </div>
      </button>
    </div>
  );
}
