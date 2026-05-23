import HeroSceneClient from '@/components/HeroSceneClient';
import GrainOverlay from '@/components/GrainOverlay';
import Header from '@/components/Header';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>

      {/* ── 3D WebGL Canvas ── */}
      <div className={styles.canvasWrapper}>
        <HeroSceneClient />
      </div>

      {/* ── Film grain + vignette overlay ── */}
      <GrainOverlay />

      {/* ── UI Overlay ── */}
      <div className={styles.overlay}>

        {/* Unified Header */}
        <Header />

        {/* Hero content — left column */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <p className={styles.eyebrow} id="hero-eyebrow">
              Wedding &amp; Events Photography
            </p>

            <h1 className={styles.title}>
              Every moment<br />
              <em>deserves</em> to<br />
              last forever.
            </h1>

            <p className={styles.subtitle}>
              Capturing the quiet glances, golden light,
              and laughter that make your story uniquely yours.
            </p>

            <div className={styles.ctas}>
              <a href="#portfolio" className={styles.ctaPrimary} id="view-portfolio-btn">
                View Portfolio
              </a>
              <a href="#contact" className={styles.ctaGhost} id="book-session-btn">
                Book a Session
              </a>
            </div>
          </div>
        </section>

        {/* Bottom bar */}
        <footer className={styles.footer}>
          <div className={styles.footerLeft}>
            <span className={styles.footerTag}>© 2026 Patrick Moreau Studio</span>
          </div>
          <div className={styles.scrollHint}>
            <div className={styles.scrollDot} />
            <span>Scroll to explore</span>
          </div>
          <div className={styles.footerRight}>
            <span className={styles.footerTag}>Warsaw, Poland</span>
          </div>
        </footer>

      </div>
    </main>
  );
}
