'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DeveloperTrayProps {
  rippleTrigger: number;
}

export default function DeveloperTray({ rippleTrigger }: DeveloperTrayProps) {
  const liquidGeomRef = useRef<THREE.PlaneGeometry>(null);
  
  // Track local ripple timeline
  const lastTriggerRef = useRef(0);
  const rippleTimeRef = useRef(99.0); // start expired

  // Reset/fire ripple when trigger changes
  if (rippleTrigger !== lastTriggerRef.current) {
    lastTriggerRef.current = rippleTrigger;
    rippleTimeRef.current = 0.0;
  }

  // Animate fluid ripples
  useFrame((state, delta) => {
    if (!liquidGeomRef.current) return;

    // Increment ripple time
    if (rippleTimeRef.current < 4.0) {
      rippleTimeRef.current += delta;
    }

    const time = state.clock.getElapsedTime();
    const pos = liquidGeomRef.current.attributes.position;
    
    // Wave parameters
    const frequency = 4.0;
    const speed = 6.0;
    const idleAmplitude = 0.015; // Subtle background fluid motion
    
    // Dynamic ripple from dropping photo
    const rippleTime = rippleTimeRef.current;
    let rippleAmplitude = 0.0;
    
    if (rippleTime < 2.0) {
      // Exponential decay of ripple after hit
      rippleAmplitude = 0.12 * Math.exp(-rippleTime * 2.0);
    }

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      // Distance from center for radial ripple
      const dist = Math.sqrt(x * x + y * y);

      // Radial ripple + general idle waves
      const idleWave = Math.sin(dist * frequency - time * speed) * idleAmplitude;
      let impactRipple = 0;
      
      if (rippleAmplitude > 0) {
        impactRipple = Math.sin(dist * 12.0 - rippleTime * 18.0) * rippleAmplitude;
      }

      pos.setZ(i, idleWave + impactRipple);
    }

    pos.needsUpdate = true;
  });

  return (
    <group position={[0, -1.9, 1.4]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* ── Outer Tray Walls (White/Matte plastic darkroom tray) ── */}
      {/* Bottom base */}
      <mesh receiveShadow castShadow position={[0, 0, -0.15]}>
        <boxGeometry args={[3.2, 2.4, 0.1]} />
        <meshStandardMaterial
          color="#181818"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Rim - Left Wall */}
      <mesh receiveShadow position={[-1.55, 0, 0]}>
        <boxGeometry args={[0.1, 2.4, 0.4]} />
        <meshStandardMaterial color="#1f1f1f" roughness={0.7} />
      </mesh>

      {/* Rim - Right Wall */}
      <mesh receiveShadow position={[1.55, 0, 0]}>
        <boxGeometry args={[0.1, 2.4, 0.4]} />
        <meshStandardMaterial color="#1f1f1f" roughness={0.7} />
      </mesh>

      {/* Rim - Top Wall */}
      <mesh receiveShadow position={[0, 1.15, 0]}>
        <boxGeometry args={[3.2, 0.1, 0.4]} />
        <meshStandardMaterial color="#1f1f1f" roughness={0.7} />
      </mesh>

      {/* Rim - Bottom Wall */}
      <mesh receiveShadow position={[0, -1.15, 0]}>
        <boxGeometry args={[3.2, 0.1, 0.4]} />
        <meshStandardMaterial color="#1f1f1f" roughness={0.7} />
      </mesh>

      {/* ── Developer Chemical Fluid ── */}
      {/* MeshPhysicalMaterial allows beautiful glass/water reflections, depth, and specular highlights */}
      <mesh position={[0, 0, 0.05]} receiveShadow>
        <planeGeometry ref={liquidGeomRef} args={[3.0, 2.2, 32, 32]} />
        <meshPhysicalMaterial
          color="#300508" // Deep crimson liquid color to catch safety light and look chemical
          roughness={0.05}
          metalness={0.1}
          transmission={0.8}
          thickness={0.8}
          ior={1.333} // Water refractive index
          clearcoat={1.0}
          clearcoatRoughness={0.0}
        />
      </mesh>
    </group>
  );
}
