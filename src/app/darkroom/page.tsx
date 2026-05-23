'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import GrainOverlay from '@/components/GrainOverlay';
import DarkroomSceneClient from '@/components/DarkroomSceneClient';
import { playCameraSounds } from '@/lib/soundGenerator';
import { HangingPhotoItem } from '@/components/HangingPhotos';
import styles from './page.module.css';

// Curated high-fidelity Picsum seeds representing photographic genres
const FILMS = {
  love: {
    id: 'love',
    name: 'VALENTINA 400',
    type: 'Classic Warm Portrait',
    url: 'https://picsum.photos/seed/darkroom_love/600/600',
    desc: 'Golden hour skin tones, soft contrast, warm nostalgia.',
  },
  noir: {
    id: 'noir',
    name: 'DECKARD B&W',
    type: 'High-Contrast Monochrome',
    url: 'https://picsum.photos/seed/darkroom_noir/600/600',
    desc: 'Deep shadows, bright silver highlights, grain texture.',
  },
  cyber: {
    id: 'cyber',
    name: 'SHINJUKU CHROMA',
    type: 'Vibrant Neon Street',
    url: 'https://picsum.photos/seed/darkroom_cyber/600/600',
    desc: 'Cyan and magenta saturation, neon night tones.',
  },
} as const;

export default function DarkroomPage() {
  const [safelightActive, setSafelightActive] = useState(true);
  const [exposure, setExposure] = useState(1.0);
  const [selectedFilmKey, setSelectedFilmKey] = useState<keyof typeof FILMS>('love');
  const [isFlashing, setIsFlashing] = useState(false);
  const [activePhoto, setActivePhoto] = useState<{ url: string; exposure: number } | null>(null);
  const [rippleTrigger, setRippleTrigger] = useState(0);

  // Preload wire with 3 aesthetic developed photos
  const [hangingPhotos, setHangingPhotos] = useState<HangingPhotoItem[]>([
    {
      id: 'pre-1',
      url: 'https://picsum.photos/seed/prebuilt_one/600/600',
      exposure: 1.0,
    },
    {
      id: 'pre-2',
      url: 'https://picsum.photos/seed/prebuilt_two/600/600',
      exposure: 0.7, // Darker moody look
    },
    {
      id: 'pre-3',
      url: 'https://picsum.photos/seed/prebuilt_three/600/600',
      exposure: 1.3, // Bright overexposed sun flare look
    },
  ]);

  // Overlay photo magnifier state
  const [inspectedPhotoUrl, setInspectedPhotoUrl] = useState<string | null>(null);

  // Photographic chemistry development timer
  const [devTime, setDevTime] = useState(0.0);
  const [isDeveloping, setIsDeveloping] = useState(false);
  const devIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle snapping camera shutter
  const handleSnapShutter = () => {
    if (activePhoto || isFlashing || isDeveloping) return;

    // 1. Play synthesized physical click + Hum sounds
    playCameraSounds();

    // 2. Set camera flash trigger
    setIsFlashing(true);

    // 3. Mount developing photo card in camera slot
    const currentFilm = FILMS[selectedFilmKey];
    setActivePhoto({
      url: `${currentFilm.url}?t=${Date.now()}`, // Cache-bust to allow repeating shots
      exposure,
    });
  };

  // Called when active photo lands in the developer tray
  const handlePhotoHitFluid = () => {
    // Trigger fluid ripples
    setRippleTrigger((prev) => prev + 1);

    // Start 5.00s chemical reaction timer
    setIsDeveloping(true);
    setDevTime(0.0);
  };

  // Run timer ticks
  useEffect(() => {
    if (isDeveloping) {
      const intervalTime = 50; // 50ms ticks
      devIntervalRef.current = setInterval(() => {
        setDevTime((prev) => {
          const next = prev + intervalTime / 1000;
          if (next >= 5.0) {
            clearInterval(devIntervalRef.current!);
            return 5.0;
          }
          return next;
        });
      }, intervalTime);
    } else {
      if (devIntervalRef.current) clearInterval(devIntervalRef.current);
    }

    return () => {
      if (devIntervalRef.current) clearInterval(devIntervalRef.current);
    };
  }, [isDeveloping]);

  // Called when development completes
  const handlePhotoDevelopComplete = () => {
    if (!activePhoto) return;

    // Reset development states
    setIsDeveloping(false);
    setDevTime(0.0);

    // Append newly developed photo to background hanging list
    const newId = `dev-${Date.now()}`;
    setHangingPhotos((prev) => [
      ...prev,
      {
        id: newId,
        url: activePhoto.url,
        exposure: activePhoto.exposure,
      },
    ]);

    // Unmount active photo mesh
    setActivePhoto(null);
  };

  return (
    <main className={`${styles.main} ${safelightActive ? styles.safelightTheme : styles.normalTheme}`}>
      
      {/* ── 3D Canvas Viewport ── */}
      <div className={styles.canvasWrapper}>
        <DarkroomSceneClient
          safelightActive={safelightActive}
          exposure={exposure}
          isFlashing={isFlashing}
          onFlashDone={() => setIsFlashing(false)}
          activeDevelopingPhoto={activePhoto}
          onPhotoHitFluid={handlePhotoHitFluid}
          onPhotoDevelopComplete={handlePhotoDevelopComplete}
          hangingPhotos={hangingPhotos}
          onInspectPhoto={(url) => setInspectedPhotoUrl(url)}
          rippleTrigger={rippleTrigger}
        />
      </div>

      {/* ── Screen Gritty Overlays ── */}
      <GrainOverlay />

      {/* ── UI Panel Dashboards ── */}
      <div className={styles.overlayContainer}>
        
        {/* Navigation Header */}
        <Header />

        {/* ── CONTROL DASHBOARD (Glassmorphic Side Panel) ── */}
        <section className={styles.controlPanel}>
          <div className={styles.panelHeader}>
            <p className={styles.eyebrow}>Photographic Lab</p>
            <h1 className={styles.title}>ANALOG DARKROOM</h1>
            <p className={styles.tagline}>Watch chemistry develop in Three.js WebGL.</p>
          </div>

          <div className={styles.divider} />

          {/* SAFELIGHT SWITCH */}
          <div className={styles.controlGroup}>
            <label className={styles.label}>
              <span>DARKROOM SAFELIGHT</span>
              <span className={safelightActive ? styles.indicatorRed : styles.indicatorWhite}>
                {safelightActive ? 'RED SAFETY ACTIVE' : 'ROOM LIGHTS ON'}
              </span>
            </label>
            <button
              className={`${styles.safelightToggle} ${safelightActive ? styles.activeRed : ''}`}
              onClick={() => setSafelightActive(!safelightActive)}
              aria-label="Toggle Safelight"
            >
              <div className={styles.switchKnob} />
            </button>
          </div>

          {/* FILM PACK SELECTOR */}
          <div className={styles.controlGroup}>
            <label className={styles.label}>SELECT FILM STOCK</label>
            <div className={styles.filmGrid}>
              {(Object.keys(FILMS) as Array<keyof typeof FILMS>).map((key) => {
                const item = FILMS[key];
                const isSelected = selectedFilmKey === key;
                return (
                  <button
                    key={key}
                    className={`${styles.filmButton} ${isSelected ? styles.filmButtonSelected : ''}`}
                    onClick={() => setSelectedFilmKey(key)}
                    disabled={!!activePhoto}
                  >
                    <span className={styles.filmButtonName}>{item.name}</span>
                    <span className={styles.filmButtonType}>{item.type}</span>
                  </button>
                );
              })}
            </div>
            <p className={styles.helperText}>{FILMS[selectedFilmKey].desc}</p>
          </div>

          {/* EXPOSURE TIME DIAL */}
          <div className={styles.controlGroup}>
            <div className={styles.flexLabel}>
              <label className={styles.label}>EXPOSURE CALIBRATION</label>
              <span className={styles.valueDisplay}>{exposure.toFixed(1)}x EV</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={exposure}
              onChange={(e) => setExposure(parseFloat(e.target.value))}
              disabled={!!activePhoto}
              className={styles.rangeInput}
            />
            <p className={styles.helperText}>
              Adjusting EV shifts developed silver chemical brightness.
            </p>
          </div>

          {/* ACTION BUTTON (SHUTTER TRIGGER) */}
          <div className={styles.actionSection}>
            <button
              className={`${styles.shutterButton} ${activePhoto ? styles.shutterButtonDisabled : ''}`}
              onClick={handleSnapShutter}
              disabled={!!activePhoto}
              id="shutter-trigger-btn"
            >
              <span className={styles.shutterDot} />
              <span>{activePhoto ? 'PROCESSING...' : 'TRIGGER CAMERA SHUTTER'}</span>
            </button>
          </div>
        </section>

        {/* ── HUD CHRONOMETER (Center Bottom Display) ── */}
        <section className={styles.hudTimer}>
          <div className={styles.timerDigital}>
            {devTime.toFixed(2)}s
          </div>
          <div className={styles.timerLabels}>
            <span>CHEMICAL DEVELOPMENT TIMER</span>
            <div className={styles.ledStatusGrid}>
              <span className={`${styles.led} ${isFlashing ? styles.ledFlashActive : ''}`}>FLASH</span>
              <span className={`${styles.led} ${isDeveloping ? styles.ledReactActive : ''}`}>REACT</span>
              <span className={`${styles.led} ${(!activePhoto && !isDeveloping) ? styles.ledReadyActive : ''}`}>READY</span>
            </div>
          </div>
        </section>

        {/* Instructions Hint */}
        <div className={styles.scrollHint}>
          <span>Drag space to orbit camera &bull; Click hanging photos to inspect</span>
        </div>
      </div>

      {/* ── PHOTO DETAILED OVERLAY INSPECTION VIEW ── */}
      {inspectedPhotoUrl && (
        <div
          className={styles.magnifierOverlay}
          onClick={() => setInspectedPhotoUrl(null)}
          aria-modal="true"
          role="dialog"
        >
          <div className={styles.magnifierCard} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeOverlayBtn}
              onClick={() => setInspectedPhotoUrl(null)}
              aria-label="Close Inspection"
            >
              &times;
            </button>
            <div className={styles.polaroidFrame}>
              <img
                src={inspectedPhotoUrl}
                alt="Inspected Developed Film Print"
                className={styles.polaroidImage}
              />
              <div className={styles.polaroidLabel}>
                <p className={styles.polaroidLabelTitle}>DARKROOM PROCESS #{(inspectedPhotoUrl.length % 99) + 1}</p>
                <p className={styles.polaroidLabelMeta}>Developed Warsaw, Poland &bull; {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
