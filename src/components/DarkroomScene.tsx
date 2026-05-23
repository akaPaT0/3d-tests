'use client';

import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';

import PolaroidCamera from './PolaroidCamera';
import DeveloperTray from './DeveloperTray';
import HangingPhotos, { HangingPhotoItem } from './HangingPhotos';
import DevelopingPhoto from './DevelopingPhoto';
import FloatingDust from './FloatingDust';

interface DarkroomSceneProps {
  safelightActive: boolean;
  exposure: number;
  isFlashing: boolean;
  onFlashDone: () => void;
  activeDevelopingPhoto: { url: string; exposure: number } | null;
  onPhotoHitFluid: () => void;
  onPhotoDevelopComplete: () => void;
  hangingPhotos: HangingPhotoItem[];
  onInspectPhoto: (url: string) => void;
  rippleTrigger: number;
}

// Internal lighting and camera management to react to safelight toggles and flashes
function SceneLighting({ safelightActive, isFlashing, onFlashDone }: {
  safelightActive: boolean;
  isFlashing: boolean;
  onFlashDone: () => void;
}) {
  const whiteLightRef = useRef<THREE.DirectionalLight>(null);
  const redSafelightRef1 = useRef<THREE.PointLight>(null);
  const redSafelightRef2 = useRef<THREE.PointLight>(null);
  const flashLightRef = useRef<THREE.PointLight>(null);

  // Transition lights when safelightActive toggles
  useEffect(() => {
    const duration = 0.8;
    
    if (safelightActive) {
      // Fade out white room lights, fade in red safelights
      if (whiteLightRef.current) {
        gsap.to(whiteLightRef.current, { intensity: 0.0, duration, ease: 'power2.inOut' });
      }
      if (redSafelightRef1.current) {
        gsap.to(redSafelightRef1.current, { intensity: 8.0, duration, ease: 'power2.inOut' });
      }
      if (redSafelightRef2.current) {
        gsap.to(redSafelightRef2.current, { intensity: 3.0, duration, ease: 'power2.inOut' });
      }
    } else {
      // Fade in white room lights, fade out red safelights
      if (whiteLightRef.current) {
        gsap.to(whiteLightRef.current, { intensity: 4.5, duration, ease: 'power2.inOut' });
      }
      if (redSafelightRef1.current) {
        gsap.to(redSafelightRef1.current, { intensity: 0.8, duration, ease: 'power2.inOut' }); // keep tiny red glow
      }
      if (redSafelightRef2.current) {
        gsap.to(redSafelightRef2.current, { intensity: 0.2, duration, ease: 'power2.inOut' });
      }
    }
  }, [safelightActive]);

  // Handle flash event
  useEffect(() => {
    if (isFlashing && flashLightRef.current) {
      const flash = flashLightRef.current;
      
      // Intense explosive flash spike
      gsap.timeline({
        onComplete: onFlashDone
      })
      .set(flash, { intensity: 65 })
      .to(flash, { intensity: 0, duration: 0.15, ease: 'power2.out' })
      .to(flash, { intensity: 0, duration: 0.15 }); // Hold 0
    }
  }, [isFlashing, onFlashDone]);

  return (
    <>
      {/* Dynamic Overhead White Room Light */}
      <directionalLight
        ref={whiteLightRef}
        position={[2, 6, 4]}
        color="#fff6eb"
        intensity={safelightActive ? 0 : 4.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />

      {/* Main Red Safelight (Hanging dome bulb above desk) */}
      <pointLight
        ref={redSafelightRef1}
        position={[0, 3, 0.5]}
        color="#ff0c2b"
        intensity={safelightActive ? 8.0 : 0.8}
        distance={15}
        decay={1.5}
        castShadow
      />

      {/* Secondary Red Safelight (Back fill) */}
      <pointLight
        ref={redSafelightRef2}
        position={[-3, 1, -2]}
        color="#ff1a40"
        intensity={safelightActive ? 3.0 : 0.2}
        distance={10}
        decay={1.8}
      />

      {/* Ambient background glow */}
      <ambientLight color={safelightActive ? '#150102' : '#332c25'} intensity={1.2} />

      {/* Explosion Shutter Flash PointLight (positioned at the camera's flash unit location) */}
      <pointLight
        ref={flashLightRef}
        position={[0.8, 0.65, 1.2]}
        color="#ffffff"
        intensity={0}
        distance={25}
        decay={1.3}
      />
    </>
  );
}

export default function DarkroomScene({
  safelightActive,
  exposure,
  isFlashing,
  onFlashDone,
  activeDevelopingPhoto,
  onPhotoHitFluid,
  onPhotoDevelopComplete,
  hangingPhotos,
  onInspectPhoto,
  rippleTrigger,
}: DarkroomSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 3.8], fov: 45, near: 0.1, far: 1000 }}
      dpr={[1, 2]}
      shadows
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
    >
      {/* Safelight mode: pitch black background. White mode: faint grey backing */}
      <color attach="background" args={[safelightActive ? '#090404' : '#141416']} />
      
      {/* Moody background fog */}
      <fog attach="fog" args={[safelightActive ? '#090404' : '#141416', 6, 18]} />

      <Suspense fallback={null}>
        
        {/* Dynamic Studio Lighting and Shutter Flashes */}
        <SceneLighting
          safelightActive={safelightActive}
          isFlashing={isFlashing}
          onFlashDone={onFlashDone}
        />

        {/* Dynamic environment reflections */}
        {!safelightActive && <Environment preset="sunset" />}

        {/* ── 3D Scene Components ── */}
        
        {/* Vintage Polaroid Camera */}
        <PolaroidCamera
          onShutterTrigger={() => {}} // Controlled from CSS dashboard trigger, not direct mesh click to keep sync
          isFlashing={isFlashing}
        />

        {/* Developer Tray with Ripple Simulation */}
        <DeveloperTray
          rippleTrigger={rippleTrigger}
        />

        {/* Dynamic Developing Photo sliding/falling/fading */}
        {activeDevelopingPhoto && (
          <DevelopingPhoto
            url={activeDevelopingPhoto.url}
            exposure={activeDevelopingPhoto.exposure}
            onHitFluid={onPhotoHitFluid}
            onComplete={onPhotoDevelopComplete}
          />
        )}

        {/* Hanging Photo Clothesline wire */}
        <HangingPhotos
          photos={hangingPhotos}
          onInspect={onInspectPhoto}
        />

        {/* Floating dust particles illuminated by the safelight */}
        <FloatingDust />

        {/* ── Scenery Objects (Rustic Workbench & Back Wall) ── */}
        {/* Wooden Workbench Table */}
        <mesh position={[0, -2.12, 0]} receiveShadow castShadow>
          <boxGeometry args={[14, 0.2, 8]} />
          <meshStandardMaterial
            color="#2a1f18" // Rustic dark brown wood
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
        
        {/* Back wall (concrete panels) */}
        <mesh position={[0, 0, -4]} receiveShadow>
          <planeGeometry args={[20, 15]} />
          <meshStandardMaterial
            color="#1b1c1e" // Grim dark concrete paneling
            roughness={0.95}
            metalness={0.05}
          />
        </mesh>

        {/* ── Orbit Controls (constrained to prevent getting lost in darkroom) ── */}
        <OrbitControls
          enableZoom={true}
          minDistance={2.2}
          maxDistance={5.5}
          minPolarAngle={0.4} // Prevent looking directly from bottom
          maxPolarAngle={Math.PI / 2 + 0.05} // Prevent looking through table
          target={[0, -0.6, 0.5]} // Center focus slightly lower between camera and tray
          makeDefault
        />

        {/* ── Post-processing ── */}
        <EffectComposer>
          {/* Subtle Bloom to make safelights and flash pop */}
          <Bloom
            intensity={safelightActive ? 0.7 : 0.4}
            luminanceThreshold={0.5}
            luminanceSmoothing={0.75}
            mipmapBlur
          />
          {/* Chromatic aberration representing lens distortion */}
          <ChromaticAberration
            offset={new THREE.Vector2(0.0008, 0.0008)}
            blendFunction={2} // Normal blending
          />
          {/* Heavy vignette for filmic spotlight effect */}
          <Vignette
            offset={0.28}
            darkness={0.72}
            eskil={false}
          />
        </EffectComposer>

      </Suspense>
    </Canvas>
  );
}
