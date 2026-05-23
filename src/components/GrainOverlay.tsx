'use client';

import styles from './GrainOverlay.module.css';

export default function GrainOverlay() {
  return (
    <div className={styles.root} aria-hidden="true">
      <div className={styles.grain} />
      <div className={styles.vignette} />
      <div className={styles.scanlines} />
    </div>
  );
}
