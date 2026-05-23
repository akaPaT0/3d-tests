'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../app/cosmic-lens/page.module.css';
import { playSliderSound, setMuted, getMuteState } from './CosmicLensAudio';

export interface PhotoData {
  id: number;
  title: string;
  date: string;
  coords: string;
  camera: string;
  focalLength: string;
  exposure: string;
  description: string;
  img: string;
  spectrum: number;
}

interface CosmicLensHUDProps {
  warpFactor: number;
  setWarpFactor: (val: number) => void;
  refractIndex: number;
  setRefractIndex: (val: number) => void;
  orbitSpeed: number;
  setOrbitSpeed: (val: number) => void;
  selectedPhoto: PhotoData | null;
  onClearPhoto: () => void;
  warpedDimension: number;
  onWarpBack: () => void;
}

export default function CosmicLensHUD({
  warpFactor,
  setWarpFactor,
  refractIndex,
  setRefractIndex,
  orbitSpeed,
  setOrbitSpeed,
  selectedPhoto,
  onClearPhoto,
  warpedDimension,
  onWarpBack
}: CosmicLensHUDProps) {
  const [coords, setCoords] = useState({ x: '0.000', y: '0.000', z: '0.000' });
  const [fps, setFps] = useState(60);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Track coordinates based on mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = ((e.clientX / window.innerWidth) * 2 - 1) * 50;
      const y = (-(e.clientY / window.innerHeight) * 2 + 1) * 50;
      const z = Math.sin(Date.now() * 0.001) * 10;
      setCoords({
        x: x.toFixed(3),
        y: y.toFixed(3),
        z: z.toFixed(3)
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Soft random fluctuations in frame rate for futuristic telemetry feel
  useEffect(() => {
    const interval = setInterval(() => {
      setFps(Math.round(58 + Math.random() * 4));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsAudioMuted(getMuteState());
  }, []);

  const handleMuteToggle = () => {
    const nextState = !isAudioMuted;
    setIsAudioMuted(nextState);
    setMuted(nextState);
  };

  const handleSliderChange = (
    value: number,
    setter: (val: number) => void
  ) => {
    setter(value);
    playSliderSound(value);
  };

  // Dimension details
  const isWarped = warpedDimension > 0;
  const getDimensionName = () => {
    switch (warpedDimension) {
      case 1: return 'COSMIC NEBULA';
      case 2: return 'TOKYO MATRIX';
      case 3: return 'SAHARA DUNE';
      case 4: return 'OCEAN ABYSS';
      default: return 'LAB CHANNELS';
    }
  };

  const getSlider1Label = () => {
    switch (warpedDimension) {
      case 1: return 'Solar Expansion';
      case 2: return 'Digital Rain Flux';
      case 3: return 'Sand Wave Height';
      case 4: return 'Bubble Frequency';
      default: return 'Spacetime Warp';
    }
  };

  const getSlider2Label = () => {
    switch (warpedDimension) {
      case 1: return 'Prism Dispersion';
      case 2: return 'Neon Volt Multiplier';
      case 3: return 'Sun Scale Index';
      case 4: return 'Oceanic Refraction';
      default: return 'Lens Refraction';
    }
  };

  return (
    <div className={styles.hudShell}>
      {/* ── HEADER ── */}
      <header className={`${styles.hudHeader} ${styles.interactive}`}>
        <div className={styles.logoArea}>
          {isWarped ? (
            <button className={styles.backBtn} onClick={onWarpBack} id="exit-dimension-btn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              DISENGAGE WARP FIELD
            </button>
          ) : (
            <Link href="/photography" className={styles.backBtn} id="exit-lens-btn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              BACK TO HUB
            </Link>
          )}
          <h1 className={styles.hudTitle}>
            <span className={styles.blinkingDot} style={{ backgroundColor: isWarped ? '#00d2ff' : '#ff3b30', boxShadow: isWarped ? '0 0 10px #00d2ff' : '0 0 10px #ff3b30' }} />
            {isWarped ? `WARPED: ${getDimensionName()}` : 'COSMIC LENS LAB'}
          </h1>
        </div>

        <div className={styles.telemetryGrid}>
          <div>PORTAL: <span className={styles.telemetryVal} style={{ color: isWarped ? '#ffcc00' : '#00d2ff' }}>{isWarped ? 'WARPED' : 'STANDBY'}</span></div>
          <div>COORD: <span className={styles.telemetryVal}>[{coords.x}, {coords.y}, {coords.z}]</span></div>
          <div>SYS: <span className={styles.telemetryVal}>{fps} FPS</span></div>
        </div>
      </header>

      {/* ── LEFT PANEL: Telemetry and Controls ── */}
      <aside className={styles.hudLeft}>
        {/* Core Metrics */}
        <div className={`${styles.glassPanel} ${styles.interactive}`}>
          <h3 className={styles.panelTitle}>
            <span>{isWarped ? 'Dimension Status' : 'Lens Telemetry'}</span>
            <span style={{ color: isWarped ? '#ffcc00' : '#00d2ff' }}>{isWarped ? `DIM-0${warpedDimension}` : 'SYS-01'}</span>
          </h3>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Aperture Index</span>
            <span className={styles.statValue}>f/0.95 Quantum</span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>{isWarped ? 'Gravity field' : 'Gravitational Pull'}</span>
            <span className={styles.statValue}>{(warpFactor * 9.8).toFixed(1)} m/s²</span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>{isWarped ? 'Optic curvature' : 'Refraction angle'}</span>
            <span className={styles.statValue}>{(refractIndex * 45).toFixed(1)}°</span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>{isWarped ? 'Orbit Speed' : 'Orbital Velocity'}</span>
            <span className={styles.statValue}>{(orbitSpeed * 100).toFixed(0)} km/h</span>
          </div>
          <div className={styles.graphContainer}>
            <div className={styles.graphBar} style={{ animationDelay: '0.1s', animationDuration: '1.2s', background: isWarped ? 'linear-gradient(to top, rgba(255, 204, 0, 0.1), rgba(255, 204, 0, 0.8))' : undefined }} />
            <div className={styles.graphBar} style={{ animationDelay: '0.4s', animationDuration: '1.6s', background: isWarped ? 'linear-gradient(to top, rgba(255, 204, 0, 0.1), rgba(255, 204, 0, 0.8))' : undefined }} />
            <div className={styles.graphBar} style={{ animationDelay: '0.2s', animationDuration: '1.0s', background: isWarped ? 'linear-gradient(to top, rgba(255, 204, 0, 0.1), rgba(255, 204, 0, 0.8))' : undefined }} />
            <div className={styles.graphBar} style={{ animationDelay: '0.7s', animationDuration: '1.9s', background: isWarped ? 'linear-gradient(to top, rgba(255, 204, 0, 0.1), rgba(255, 204, 0, 0.8))' : undefined }} />
            <div className={styles.graphBar} style={{ animationDelay: '0.5s', animationDuration: '1.4s', background: isWarped ? 'linear-gradient(to top, rgba(255, 204, 0, 0.1), rgba(255, 204, 0, 0.8))' : undefined }} />
            <div className={styles.graphBar} style={{ animationDelay: '0.9s', animationDuration: '1.1s', background: isWarped ? 'linear-gradient(to top, rgba(255, 204, 0, 0.1), rgba(255, 204, 0, 0.8))' : undefined }} />
            <div className={styles.graphBar} style={{ animationDelay: '0.3s', animationDuration: '1.7s', background: isWarped ? 'linear-gradient(to top, rgba(255, 204, 0, 0.1), rgba(255, 204, 0, 0.8))' : undefined }} />
          </div>
        </div>

        {/* Warp Controls */}
        <div className={`${styles.glassPanel} ${styles.interactive}`}>
          <h3 className={styles.panelTitle}>
            <span>{isWarped ? 'Dimension Tweaks' : 'Tweak Spacetime'}</span>
            <span style={{ color: '#ffcc00' }}>MOD-02</span>
          </h3>

          <div className={styles.sliderContainer}>
            <div className={styles.sliderLabel}>
              <span>{getSlider1Label()}</span>
              <span>{(warpFactor * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={warpFactor}
              onChange={(e) => handleSliderChange(parseFloat(e.target.value), setWarpFactor)}
              className={styles.slider}
              id="warp-factor-slider"
            />
          </div>

          <div className={styles.sliderContainer}>
            <div className={styles.sliderLabel}>
              <span>{getSlider2Label()}</span>
              <span>{refractIndex.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={refractIndex}
              onChange={(e) => handleSliderChange(parseFloat(e.target.value), setRefractIndex)}
              className={styles.slider}
              id="refract-index-slider"
            />
          </div>

          <div className={styles.sliderContainer}>
            <div className={styles.sliderLabel}>
              <span>Orbit Rate</span>
              <span>{orbitSpeed.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0"
              max="3"
              step="0.05"
              value={orbitSpeed}
              onChange={(e) => handleSliderChange(parseFloat(e.target.value), setOrbitSpeed)}
              className={styles.slider}
              id="orbit-speed-slider"
            />
          </div>
        </div>
      </aside>

      {/* ── RIGHT PANEL: Active Photo Detail ── */}
      <aside className={styles.hudRight}>
        <div 
          className={`${styles.glassPanel} ${styles.infoPanel} ${selectedPhoto ? styles.infoPanelActive : ''} ${styles.interactive}`}
        >
          {selectedPhoto && (
            <>
              <h3 className={styles.panelTitle}>
                <span>Active Spectrum Data</span>
                <span>SEC-{selectedPhoto.id}04</span>
              </h3>
              
              <div>
                <h2 className={styles.photoTitle}>{selectedPhoto.title}</h2>
                <div className={styles.photoMeta}>
                  <span>Captured: {selectedPhoto.date}</span>
                  <span>Grid Pos: Node {selectedPhoto.id}</span>
                </div>
                <p className={styles.photoDesc}>{selectedPhoto.description}</p>
              </div>

              <div className={styles.techDetails}>
                <div className={styles.techRow}>
                  <span className={styles.techLabel}>Quantum Coords</span>
                  <span className={styles.techValue}>{selectedPhoto.coords}</span>
                </div>
                <div className={styles.techRow}>
                  <span className={styles.techLabel}>Optic Engine</span>
                  <span className={styles.techValue}>{selectedPhoto.camera}</span>
                </div>
                <div className={styles.techRow}>
                  <span className={styles.techLabel}>Aperture Index</span>
                  <span className={styles.techValue}>{selectedPhoto.exposure}</span>
                </div>
                <div className={styles.techRow}>
                  <span className={styles.techLabel}>Focal Core</span>
                  <span className={styles.techValue}>{selectedPhoto.focalLength}</span>
                </div>
              </div>

              <div className={styles.spectrumWrap}>
                <div className={styles.spectrumLabel}>Light Spectrum Index</div>
                <div className={styles.spectrumBar}>
                  <div 
                    className={styles.spectrumIndicator} 
                    style={{ left: `${selectedPhoto.spectrum}%` }}
                  />
                </div>
              </div>

              {isWarped ? (
                <button 
                  className={styles.closePreviewBtn} 
                  onClick={onWarpBack}
                  style={{
                    background: 'rgba(0, 210, 255, 0.1)',
                    borderColor: 'rgba(0, 210, 255, 0.3)',
                    color: '#00d2ff'
                  }}
                  id="close-nexus-preview"
                >
                  DISENGAGE WARP FIELD
                </button>
              ) : (
                <button 
                  className={styles.closePreviewBtn} 
                  onClick={onClearPhoto}
                  id="close-nexus-preview"
                >
                  RELEASE FOCUS SHIELD
                </button>
              )}
            </>
          )}
        </div>
      </aside>

      {/* ── FOOTER ── */}
      <footer className={`${styles.hudFooter} ${styles.interactive}`}>
        <div className={styles.footerText}>
          SPECTRUM TELEMETRY PORTAL © 2026 PATRICK MOREAU
        </div>
        
        <div className={styles.controlsGroup}>
          <div className={styles.helperHint}>
            <span className={styles.pulseIcon} style={{ backgroundColor: isWarped ? '#ffcc00' : '#00d2ff', boxShadow: isWarped ? '0 0 10px #ffcc00' : '0 0 10px #00d2ff' }} />
            <span>
              {isWarped 
                ? 'WARPED INSIDE DIMENSION: DRAG MOUSE TO ORBIT ENVIRONMENT' 
                : selectedPhoto 
                  ? 'FOCUSED: Initiating dimension warp sequence...' 
                  : 'DRAG TO ROTATE LENS • SCROLL TO TRAVEL'}
            </span>
          </div>

          <button
            onClick={handleMuteToggle}
            className={`${styles.muteBtn} ${!isAudioMuted ? styles.muteBtnActive : ''}`}
            aria-label={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
            id="mute-audio-btn"
          >
            {isAudioMuted ? (
              // Muted Icon
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              // Audio Playing Icon
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
