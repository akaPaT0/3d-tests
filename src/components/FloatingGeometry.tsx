'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type GeomType = 'torus' | 'octahedron' | 'box' | 'cone';

interface GeomProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  type?: GeomType;
  scale?: number;
  speed?: number;
}

function WireGeometry({ position, rotation = [0, 0, 0], color = '#7c3aed', type = 'torus', scale = 1, speed = 1 }: GeomProps) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.x = rotation[0] + t * speed * 0.3;
    ref.current.rotation.y = rotation[1] + t * speed * 0.4;
    ref.current.position.y = position[1] + Math.sin(t * speed * 0.6 + position[0]) * 0.25;
  });

  const mat = (
    <meshStandardMaterial
      color={color}
      wireframe
      transparent
      opacity={0.35}
      emissive={color}
      emissiveIntensity={0.4}
    />
  );

  return (
    <mesh ref={ref} position={position} scale={scale}>
      {type === 'torus' && <torusGeometry args={[1, 0.35, 16, 40]} />}
      {type === 'octahedron' && <octahedronGeometry args={[1, 0]} />}
      {type === 'box' && <boxGeometry args={[1.4, 1.4, 1.4]} />}
      {type === 'cone' && <coneGeometry args={[0.8, 1.6, 6]} />}
      {mat}
    </mesh>
  );
}

export default function FloatingGeometry() {
  return (
    <group>
      <WireGeometry position={[-4.5, 1, -2]} type="torus" color="#7c3aed" scale={0.9} speed={0.6} />
      <WireGeometry position={[4.5, -0.5, -1]} type="octahedron" color="#06b6d4" scale={1.1} speed={0.8} />
      <WireGeometry position={[-3, -2, -3]} type="box" color="#ec4899" scale={0.7} speed={0.5} />
      <WireGeometry position={[3.5, 2.5, -3]} type="cone" color="#a855f7" scale={0.85} speed={0.7} />
      <WireGeometry position={[0.5, -3, -2]} type="torus" color="#06b6d4" scale={0.65} speed={0.9} />
    </group>
  );
}
