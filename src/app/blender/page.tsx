'use client';

import { useEffect } from 'react';
import BlenderSceneClient from '@/components/BlenderSceneClient';
import GrainOverlay from '@/components/GrainOverlay';
import Header from '@/components/Header';
import { scrollStore } from '@/lib/scrollStore';
import styles from './page.module.css';

export default function BlenderPage() {
  useEffect(() => {
    const hud = document.getElementById('camera-hud');

    const onScroll = () => {
      const el  = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const progress = max > 0 ? el.scrollTop / max : 0;
      scrollStore.progress = progress;
      
      // Fade out HUD as scroll starts
      const fadeProgress = Math.max(0, 1 - progress / 0.04);
      if (hud) {
        hud.style.opacity = `${fadeProgress}`;
        hud.style.visibility = fadeProgress === 0 ? 'hidden' : 'visible';
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    // Trigger once on mount
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <main className={styles.main}>

      {/* ── Sticky viewport — canvas stays pinned while page scrolls ── */}
      <div className={styles.stickyWrapper}>
        <div className={styles.canvasWrapper}>
          <BlenderSceneClient />
        </div>

        {/* ── Sticky Header Navbar ── */}
        <Header variant="blender" />

        {/* ── Camera HUD Viewfinder Overlay (fades out on scroll) ── */}
        <div id="camera-hud" className={styles.hud}>
          {/* Faint camera screen lines (grid + crosshair) */}
          <div className={styles.hudGrid} />
          <div className={styles.hudCrosshair}>+</div>

          {/* Top Row: REC indicator & right settings */}
          <div className={styles.hudTopRow}>
            <div className={styles.hudRec}>
              <span className={styles.hudRecDot} />
              <span>REC</span>
            </div>
            <div className={styles.hudTopRightSettings}>
              <span>16:9</span>
              <span className={styles.divider}>|</span>
              <span>4K</span>
              <span className={styles.divider}>|</span>
              <span>60 FPS</span>
              <span className={styles.divider}>|</span>
              <span>1.8G</span>
            </div>
          </div>

          {/* Center Text */}
          <div className={styles.hudCenter}>
            <h1 className={styles.hudTitle}>WELL FRAMED</h1>
            <p className={styles.hudSubtitle}>YOUR ULTIMATE RENTAL HOUSE</p>
          </div>

          {/* Bottom camera settings bar */}
          <div className={styles.hudBottomBar}>
            <span>24 FPS</span>
            <span className={styles.divider}>|</span>
            <span>180° SHUTTER</span>
            <span className={styles.divider}>|</span>
            <span>800 ISO</span>
            <span className={styles.divider}>|</span>
            <span>T 1.5</span>
            <span className={styles.divider}>|</span>
            <span>5600K</span>
          </div>
        </div>

        <GrainOverlay />
      </div>

      {/* ── Scroll spacer — scrolling through this drives the animation ── */}
      <div className={styles.scrollSpace} aria-hidden="true" />

    </main>
  );
}
