'use client';

import { useState, useEffect } from 'react';
import CosmicLensSceneClient from '@/components/CosmicLensSceneClient';
import CosmicLensHUD, { PhotoData } from '@/components/CosmicLensHUD';
import { stopAmbientDrone } from '@/components/CosmicLensAudio';
import styles from './page.module.css';

// Photo nodes dataset containing high-fidelity telemetry metrics
const photos: PhotoData[] = [
  {
    id: 1,
    title: "Cosmic Nebula",
    date: "2026-05-18",
    coords: "RA 18h 36m / DEC +38°",
    camera: "Holographic Nexus IV",
    focalLength: "85mm (equiv)",
    exposure: "900s at f/0.95",
    description: "A deep-field exposure capturing the birth of stars in a dense dust nebula. The intense stellar wind from new stars deforms the local space coordinates, visible as a soft glow.",
    img: "/cosmic_nebula.png",
    spectrum: 15
  },
  {
    id: 2,
    title: "Neon Tokyo Reflect",
    date: "2026-04-22",
    coords: "35.6762° N / 139.6503° E",
    camera: "Quantum Prime",
    focalLength: "35mm",
    exposure: "1/60s at f/1.4",
    description: "A street reflection captured at the peak of a cyberpunk storm. Rain droplets act as micro-lenses, creating chromatic dispersion that ripples across the asphalt glow.",
    img: "/neon_tokyo.png",
    spectrum: 45
  },
  {
    id: 3,
    title: "Minimalist Sand Dune",
    date: "2026-02-10",
    coords: "24.8607° N / 67.0011° E",
    camera: "Aero Lens Mk III",
    focalLength: "50mm",
    exposure: "1/4000s at f/8",
    description: "Surreal minimalist desert structures where clean dunes meet sharp concrete geometry. The blazing noon sun is bent around the structure corners due to extreme atmospheric heat.",
    img: "/futuristic_architecture.png",
    spectrum: 75
  },
  {
    id: 4,
    title: "Surreal Ocean Orb",
    date: "2026-05-01",
    coords: "37.7749° W / 122.4194° N",
    camera: "Deep Sea Spherical",
    focalLength: "24mm",
    exposure: "30s at f/2.8",
    description: "A giant glowing sphere hovering over dark tides under a starry night. The sphere emits a soft warp field that twists the ocean waves and light rays into a perfect circle.",
    img: "/surreal_ocean.png",
    spectrum: 85
  }
];

export default function CosmicLensPage() {
  const [warpFactor, setWarpFactor] = useState(0.35);
  const [refractIndex, setRefractIndex] = useState(1.1);
  const [orbitSpeed, setOrbitSpeed] = useState(0.5);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoData | null>(null);

  // Warp transition states
  const [warpFlash, setWarpFlash] = useState(false);
  const [flashColor, setFlashColor] = useState('#ffffff');
  const [warpedDimension, setWarpedDimension] = useState(0); // 0 = Lab overview, 1-4 = inside dimensions

  // Stop the synthesizer drone when page unmounts
  useEffect(() => {
    return () => {
      stopAmbientDrone();
    };
  }, []);

  const handleSelectPhoto = (photo: PhotoData | null) => {
    setSelectedPhoto(photo);
    if (!photo) return;

    // Dimension color themes for visual warp flash
    const themeColors: Record<number, string> = {
      1: '#ff007f', // Nebula Pink
      2: '#00f5d4', // Tokyo Teal
      3: '#fb8500', // Desert Orange
      4: '#0077b6'  // Ocean Blue
    };
    setFlashColor(themeColors[photo.id] || '#ffffff');

    // Trigger cinematic teleportation sequence
    setTimeout(() => {
      setWarpFlash(true); // Flash color in
      
      setTimeout(() => {
        setWarpedDimension(photo.id); // Switch 3D scene representation
        
        setTimeout(() => {
          setWarpFlash(false); // Fade out flash
        }, 150);
      }, 400); // Peak of flash (screen fully colored)
    }, 850); // Delay to let camera zoom in first
  };

  const handleWarpBack = () => {
    setFlashColor('#ffffff'); // White flash for returning to lab overview
    setWarpFlash(true);

    setTimeout(() => {
      setWarpedDimension(0); // Reset to lab
      setSelectedPhoto(null); // Deselect photo
      
      setTimeout(() => {
        setWarpFlash(false); // Fade out flash
      }, 150);
    }, 400); // Peak of flash
  };

  return (
    <main className={styles.container}>
      {/* 3D WebGL Canvas Layer */}
      <div className={styles.canvasContainer}>
        <CosmicLensSceneClient
          warpFactor={warpFactor}
          refractIndex={refractIndex}
          orbitSpeed={orbitSpeed}
          selectedPhoto={selectedPhoto}
          setSelectedPhoto={handleSelectPhoto}
          photos={photos}
          warpedDimension={warpedDimension}
        />
      </div>

      {/* Hologram Scanlines Effect overlay */}
      <div className={styles.hologramOverlay} />

      {/* Full screen flash overlay for dimension warping */}
      <div 
        className={`${styles.flashOverlay} ${warpFlash ? styles.flashOverlayActive : ''}`}
        style={{ backgroundColor: flashColor }}
      />

      {/* Futuristic Telemetry HUD Overlay */}
      <CosmicLensHUD
        warpFactor={warpFactor}
        setWarpFactor={setWarpFactor}
        refractIndex={refractIndex}
        setRefractIndex={setRefractIndex}
        orbitSpeed={orbitSpeed}
        setOrbitSpeed={setOrbitSpeed}
        selectedPhoto={selectedPhoto}
        onClearPhoto={handleWarpBack}
        warpedDimension={warpedDimension}
        onWarpBack={handleWarpBack}
      />
    </main>
  );
}
