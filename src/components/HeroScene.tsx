'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

import FilmStrip from './FilmStrip';
import CinematicCamera from './CinematicCamera';
import FloatingDust from './FloatingDust';

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [-21, 2.8, 7.5], fov: 48, near: 0.1, far: 200 }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
    >
      {/* Scene background */}
      <color attach="background" args={['#0d0b08']} />
      <fog attach="fog" args={['#0d0b08', 14, 40]} />

      <Suspense fallback={null}>
        {/* ── Lighting ── */}

        {/* Warm golden key light from above */}
        <pointLight
          position={[0, 8, 4]}
          color="#ffd4a0"
          intensity={12}
          distance={28}
          decay={2}
        />

        {/* Cool blue fill from below-left for depth */}
        <pointLight
          position={[-8, -4, 5]}
          color="#4a6fa5"
          intensity={4}
          distance={20}
          decay={2}
        />

        {/* Warm rim light from behind-right */}
        <pointLight
          position={[8, 2, -4]}
          color="#c9a96e"
          intensity={3}
          distance={18}
          decay={2}
        />

        {/* Soft ambient */}
        <ambientLight color="#3a2a1a" intensity={0.6} />

        {/* Environment for subtle reflections on frame metals without remote assets */}
        <Environment resolution={256}>
          <ambientLight intensity={0.4} />
          <mesh rotation={[0, 0, 0]} position={[0, 15, 0]}>
            <boxGeometry args={[40, 1, 40]} />
            <meshBasicMaterial color="#ffe4cc" />
          </mesh>
          <mesh rotation={[0, 0, 0]} position={[12, 0, -12]}>
            <boxGeometry args={[1, 20, 20]} />
            <meshBasicMaterial color="#ff66aa" />
          </mesh>
          <mesh rotation={[0, 0, 0]} position={[-12, 0, 12]}>
            <boxGeometry args={[1, 20, 20]} />
            <meshBasicMaterial color="#3399ff" />
          </mesh>
        </Environment>

        {/* ── Scene objects ── */}
        <FilmStrip />
        <FloatingDust />

        {/* ── Camera ── */}
        <CinematicCamera />

        {/* ── Post-processing ── */}
        <EffectComposer>
          <Bloom
            intensity={0.9}
            luminanceThreshold={0.55}
            luminanceSmoothing={0.8}
            mipmapBlur
          />
          <Vignette
            offset={0.3}
            darkness={0.75}
            eskil={false}
          />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
