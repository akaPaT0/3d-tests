'use client';

import { Suspense, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Photo dimensions (portrait 2:3 ratio)
const W = 2.4;
const H = 3.6;
const FRAME_PAD = 0.18;

interface PhotoPlaneProps {
  url: string;
  position: [number, number, number];
  rotation?: [number, number, number];
}

// Inner mesh — uses useTexture (will suspend)
function PhotoMesh({ url }: { url: string }) {
  const texture = useTexture(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  if (texture.channel === undefined) {
    texture.channel = 0;
  }
  if (!texture.matrix) {
    texture.matrix = new THREE.Matrix3();
  }

  return (
    <mesh>
      <planeGeometry args={[W, H]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.85}
        metalness={0.05}
      />
    </mesh>
  );
}

// Fallback while loading
function PhotoFallback() {
  return (
    <mesh>
      <planeGeometry args={[W, H]} />
      <meshStandardMaterial color="#1a140e" roughness={1} />
    </mesh>
  );
}

// Full framed photo card
export default function PhotoPlane({ url, position, rotation = [0, 0, 0] }: PhotoPlaneProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    // Gentle float — each photo has a unique phase based on x position
    groupRef.current.position.y =
      position[1] + Math.sin(t * 0.35 + position[0] * 0.4) * 0.07;
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Outer frame — dark mat */}
      <mesh position={[0, 0, -0.015]}>
        <planeGeometry args={[W + FRAME_PAD * 2, H + FRAME_PAD * 2]} />
        <meshStandardMaterial
          color="#100d0a"
          roughness={0.9}
          metalness={0.1}
          emissive="#c9a96e"
          emissiveIntensity={0.04}
        />
      </mesh>

      {/* Thin gold border line */}
      <mesh position={[0, 0, -0.008]}>
        <planeGeometry args={[W + FRAME_PAD * 1.1, H + FRAME_PAD * 1.1]} />
        <meshStandardMaterial
          color="#c9a96e"
          roughness={0.6}
          metalness={0.8}
          emissive="#c9a96e"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Photo surface */}
      <Suspense fallback={<PhotoFallback />}>
        <PhotoMesh url={url} />
      </Suspense>
    </group>
  );
}
