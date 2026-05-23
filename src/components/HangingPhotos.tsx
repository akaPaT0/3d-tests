'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export interface HangingPhotoItem {
  id: string;
  url: string;
  exposure: number; // 0.5 (underexposed), 1.0 (normal), 1.5 (overexposed)
}

interface HangingPhotosProps {
  photos: HangingPhotoItem[];
  onInspect: (url: string) => void;
}

// Sub-component for individual hanging photos to manage its own texture loading and swaying
function HangingPhoto({
  url,
  exposure,
  position,
  index,
  onInspect,
}: {
  url: string;
  exposure: number;
  position: [number, number, number];
  index: number;
  onInspect: (url: string) => void;
}) {
  const photoRef = useRef<THREE.Group>(null);
  
  // Safe texture loading inside Suspense
  const texture = useTexture(url);

  // Subtle wind/sway effect unique to each card
  useFrame((state) => {
    if (!photoRef.current) return;
    const t = state.clock.getElapsedTime();
    const phase = index * 1.5;
    
    // Sway in X and Z
    photoRef.current.rotation.x = Math.sin(t * 0.6 + phase) * 0.08;
    photoRef.current.rotation.y = Math.cos(t * 0.4 + phase) * 0.04;
    photoRef.current.rotation.z = Math.sin(t * 0.3 + phase) * 0.02;
  });

  return (
    <group
      ref={photoRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onInspect(url);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'default';
      }}
    >
      {/* ── Wooden Clothespin ── */}
      <group position={[0, 0.56, 0.015]}>
        {/* Front Clip Part */}
        <mesh castShadow>
          <boxGeometry args={[0.04, 0.15, 0.03]} />
          <meshStandardMaterial
            color="#c6a378" // Wood color
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
        {/* Metal spring ring details */}
        <mesh position={[0, 0, 0.01]}>
          <ringGeometry args={[0.01, 0.02, 16]} />
          <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* ── Polaroid Frame Card ── */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.9, 1.1, 0.01]} />
        <meshStandardMaterial
          color="#fbfaf6" // Creamy polaroid paper white
          roughness={0.8}
          metalness={0.0}
        />
      </mesh>

      {/* ── Developed Photographic Image ── */}
      <mesh position={[0, 0.08, 0.007]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.2} // Glossy photo finish
          metalness={0.1}
          color={new THREE.Color(exposure, exposure, exposure)}
        />
      </mesh>

      {/* Faint card backing */}
      <mesh position={[0, 0, -0.007]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.9, 1.1]} />
        <meshStandardMaterial color="#222222" roughness={0.9} />
      </mesh>
    </group>
  );
}

export default function HangingPhotos({ photos, onInspect }: HangingPhotosProps) {
  // Pre-calculate spacing along the wire
  const getPhotoPosition = (index: number, total: number): [number, number, number] => {
    const spacing = 1.3;
    const offset = ((total - 1) * spacing) / 2;
    // Set photos along X axis, suspended at Y = 1.0, slightly in background Z = -1.2
    return [index * spacing - offset, 0.9, -1.2];
  };

  return (
    <group>
      {/* ── The Clothesline Wire (thin cable stretching across darkroom) ── */}
      <mesh position={[0, 1.45, -1.2]} rotation={[0, 0, Math.PI / 2]} receiveShadow>
        <cylinderGeometry args={[0.008, 0.008, 12, 8]} />
        <meshStandardMaterial color="#2d2d2d" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Render each hanging photo */}
      {photos.map((photo, i) => (
        <HangingPhoto
          key={photo.id}
          url={photo.url}
          exposure={photo.exposure}
          position={getPhotoPosition(i, photos.length)}
          index={i}
          onInspect={onInspect}
        />
      ))}
    </group>
  );
}
