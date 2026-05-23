'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

export default function FloatingOrb({
  position = [0, 0, 0] as [number, number, number],
  color = '#7c3aed',
  speed = 1,
  distort = 0.4,
  scale = 1,
}: {
  position?: [number, number, number];
  color?: string;
  speed?: number;
  distort?: number;
  scale?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(t * speed * 0.5) * 0.3;
    meshRef.current.rotation.x = t * speed * 0.15;
    meshRef.current.rotation.z = t * speed * 0.1;
  });

  return (
    <Sphere ref={meshRef} args={[1, 128, 128]} scale={scale} position={position}>
      <MeshDistortMaterial
        color={color}
        distort={distort}
        speed={speed * 2}
        roughness={0.1}
        metalness={0.8}
        envMapIntensity={1.5}
      />
    </Sphere>
  );
}
