'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

interface DevelopingPhotoProps {
  url: string;
  exposure: number;
  onHitFluid: () => void;
  onComplete: () => void;
}

export default function DevelopingPhoto({
  url,
  exposure,
  onHitFluid,
  onComplete,
}: DevelopingPhotoProps) {
  const photoGroupRef = useRef<THREE.Group>(null);
  const imageMatRef = useRef<THREE.MeshStandardMaterial>(null);
  
  const [stage, setStage] = useState<'ejecting' | 'developing' | 'hanging'>('ejecting');
  const [devProgress, setDevProgress] = useState(0); // 0 to 1

  // Safe texture loading inside Suspense
  const texture = useTexture(url);

  useEffect(() => {
    if (!photoGroupRef.current) return;

    // --- PHASE 1: Ejection Animation ---
    // Start exactly at camera slot: [0, -0.75, 1.135], matching camera rotation [0, -0.2, 0]
    photoGroupRef.current.position.set(0, -0.75, 1.0);
    photoGroupRef.current.rotation.set(0, -0.2, 0);

    const tl = gsap.timeline();
    
    // Slide straight out of camera slot
    tl.to(photoGroupRef.current.position, {
      x: 0,
      y: -0.9,
      z: 1.6,
      duration: 0.5,
      ease: 'power1.out',
    });

    // Fall & flip down flat into the developer tray at [0, -1.82, 1.4]
    tl.to(photoGroupRef.current.position, {
      x: 0,
      y: -1.84, // Sit just flat on the fluid surface
      z: 1.4,
      duration: 0.7,
      ease: 'power2.inOut',
    }, '-=0.1');

    tl.to(photoGroupRef.current.rotation, {
      x: -Math.PI / 2, // Rotate flat
      y: 0,
      z: 0.1, // Slight organic rotation tilt in tray
      duration: 0.7,
      ease: 'power2.inOut',
      onComplete: () => {
        setStage('developing');
        onHitFluid(); // Trigger ripple effect!
      }
    }, '-=0.7');

  }, [onHitFluid]);

  // --- PHASE 2: Development Progress (Chemical Fade-in) ---
  useFrame((state, delta) => {
    if (stage === 'developing') {
      if (devProgress < 1.0) {
        const nextProgress = Math.min(1.0, devProgress + delta / 5.0); // 5 seconds development time
        setDevProgress(nextProgress);
        
        if (imageMatRef.current) {
          // Progressively fade in the image color and reduce the blackness
          // Under red safelight, chemicals react: starts dark, gets detailed
          imageMatRef.current.opacity = nextProgress;
        }

        if (nextProgress === 1.0) {
          // Chemical development complete! Wait 0.5s then float up to wire
          setStage('hanging');
          triggerFloatToWire();
        }
      }
    }
  });

  // --- PHASE 3: Float up to the hanging line ---
  const triggerFloatToWire = () => {
    if (!photoGroupRef.current) return;

    // Calculate hanging wire slot (represented at Z = -1.2, Y = 0.9, X centered)
    // We will animate it floating upwards and backwards, rotating to vertical orientation
    gsap.timeline({
      onComplete: () => {
        onComplete(); // Add to parent hanging list, unmounts this active developer card
      }
    })
    .to(photoGroupRef.current.position, {
      x: 0,
      y: 0.9,
      z: -1.2,
      duration: 1.5,
      ease: 'power2.inOut',
    })
    .to(photoGroupRef.current.rotation, {
      x: 0,
      y: 0,
      z: 0,
      duration: 1.5,
      ease: 'power2.inOut',
    }, '-=1.5');
  };

  return (
    <group ref={photoGroupRef}>
      {/* ── Polaroid Frame Card ── */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.9, 1.1, 0.01]} />
        <meshStandardMaterial
          color="#fbfaf6" // White border
          roughness={0.85}
          metalness={0.0}
        />
      </mesh>

      {/* ── Dynamic Photographic Image ── */}
      {/* Mesh uses standard material that fades in */}
      <mesh position={[0, 0.08, 0.007]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshStandardMaterial
          ref={imageMatRef}
          map={texture}
          transparent
          opacity={0.0} // Starts fully transparent (black background mesh shows through)
          roughness={0.2}
          metalness={0.1}
          color={new THREE.Color(exposure, exposure, exposure)}
        />
      </mesh>

      {/* Underlay black film square representing undeveloped chemicals */}
      <mesh position={[0, 0.08, 0.006]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshStandardMaterial
          color="#060505" // Unreactive photographic chemical grey/black
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>
    </group>
  );
}
