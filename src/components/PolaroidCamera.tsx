'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

interface PolaroidCameraProps {
  onShutterTrigger: () => void;
  isFlashing: boolean;
}

export default function PolaroidCamera({ onShutterTrigger, isFlashing }: PolaroidCameraProps) {
  const cameraGroupRef = useRef<THREE.Group>(null);
  const shutterBtnRef = useRef<THREE.Mesh>(null);
  const flashLightRef = useRef<THREE.PointLight>(null);
  const [hovered, setHovered] = useState(false);

  // Parallax rotation & subtle hovering
  useFrame((state) => {
    if (!cameraGroupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Subtle breathing float animation
    cameraGroupRef.current.position.y = Math.sin(t * 0.8) * 0.08;
    cameraGroupRef.current.position.x = Math.cos(t * 0.5) * 0.03;

    // Smooth tilt based on mouse position
    const targetRotX = state.pointer.y * 0.25;
    const targetRotY = state.pointer.x * 0.25;

    cameraGroupRef.current.rotation.x = THREE.MathUtils.lerp(cameraGroupRef.current.rotation.x, targetRotX, 0.06);
    cameraGroupRef.current.rotation.y = THREE.MathUtils.lerp(cameraGroupRef.current.rotation.y, targetRotY, 0.06);
  });

  // Animate physical shutter button click
  const triggerShutterClick = () => {
    if (shutterBtnRef.current) {
      gsap.timeline()
        .to(shutterBtnRef.current.position, { y: 0.82, duration: 0.08, ease: 'power1.out' })
        .to(shutterBtnRef.current.position, { y: 0.9, duration: 0.15, ease: 'power1.inOut' });
    }
    onShutterTrigger();
  };

  return (
    <group
      ref={cameraGroupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      rotation={[0, -0.2, 0]}
    >
      {/* ── Main Camera Body Group ── */}
      <group position={[0, 0, 0]}>
        
        {/* Main Base Body: Retro matte cream/grey plastic */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.5, 2.0, 2.2]} />
          <meshStandardMaterial
            color="#eae6df"
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>

        {/* Sloped Back: Iconic Polaroid silhouette */}
        <mesh position={[0, -0.2, -0.6]} rotation={[0.4, 0, 0]} castShadow>
          <boxGeometry args={[2.5, 1.8, 1.2]} />
          <meshStandardMaterial
            color="#eae6df"
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>

        {/* Dark bottom plate/base */}
        <mesh position={[0, -1.02, -0.2]} castShadow>
          <boxGeometry args={[2.52, 0.15, 2.7]} />
          <meshStandardMaterial
            color="#1f1e1c"
            roughness={0.65}
            metalness={0.3}
          />
        </mesh>

        {/* Front dark bezel panel */}
        <mesh position={[0, 0, 1.11]} castShadow>
          <boxGeometry args={[2.3, 1.8, 0.05]} />
          <meshStandardMaterial
            color="#282624"
            roughness={0.5}
            metalness={0.2}
          />
        </mesh>

        {/* ── Lens Assembly ── */}
        <group position={[0, -0.1, 1.15]}>
          {/* Outer Lens Barrel */}
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.75, 0.75, 0.4, 32]} />
            <meshStandardMaterial
              color="#1a1918"
              roughness={0.8}
              metalness={0.2}
            />
          </mesh>

          {/* Chrome Lens Ring */}
          <mesh position={[0, 0, 0.21]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.71, 0.71, 0.05, 32]} />
            <meshStandardMaterial
              color="#e8e8e8"
              roughness={0.15}
              metalness={0.9}
            />
          </mesh>

          {/* Inner Lens Glass Barrel */}
          <mesh position={[0, 0, 0.23]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.62, 0.62, 0.02, 32]} />
            <meshStandardMaterial
              color="#050505"
              roughness={0.1}
              metalness={0.8}
            />
          </mesh>

          {/* Lens Glass Element (Shiny Physical Glass Reflection) */}
          <mesh position={[0, 0, 0.245]}>
            <sphereGeometry args={[0.48, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshPhysicalMaterial
              color="#1c2d3d"
              roughness={0.02}
              transmission={0.9}
              thickness={0.5}
              clearcoat={1.0}
              clearcoatRoughness={0}
            />
          </mesh>

          {/* Small lens reflections flare */}
          <mesh position={[0.15, 0.15, 0.25]}>
            <sphereGeometry args={[0.08, 16, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
          </mesh>
        </group>

        {/* ── Viewfinder (Top Left) ── */}
        <mesh position={[-0.85, 0.75, 0.8]} castShadow>
          <boxGeometry args={[0.4, 0.35, 0.75]} />
          <meshStandardMaterial color="#1a1918" roughness={0.7} />
        </mesh>
        {/* Viewfinder Glass Front */}
        <mesh position={[-0.85, 0.75, 1.18]}>
          <planeGeometry args={[0.3, 0.25]} />
          <meshPhysicalMaterial
            color="#7aa5cc"
            roughness={0.1}
            transmission={0.8}
            thickness={0.2}
          />
        </mesh>

        {/* ── Vintage Rainbow Stripe (Center Front) ── */}
        <group position={[0, 0.45, 1.14]}>
          {/* Red, Orange, Yellow, Green, Blue vertical lines */}
          <mesh position={[0, 0, 0]} castShadow>
            <planeGeometry args={[0.25, 0.7]} />
            <meshBasicMaterial color="#df3434" />
          </mesh>
          <mesh position={[0.05, 0, 0.001]} castShadow>
            <planeGeometry args={[0.05, 0.7]} />
            <meshBasicMaterial color="#e58237" />
          </mesh>
          <mesh position={[0.10, 0, 0.002]} castShadow>
            <planeGeometry args={[0.05, 0.7]} />
            <meshBasicMaterial color="#ebd538" />
          </mesh>
          <mesh position={[0.15, 0, 0.003]} castShadow>
            <planeGeometry args={[0.05, 0.7]} />
            <meshBasicMaterial color="#4da84d" />
          </mesh>
          <mesh position={[0.20, 0, 0.004]} castShadow>
            <planeGeometry args={[0.05, 0.7]} />
            <meshBasicMaterial color="#3768be" />
          </mesh>
        </group>

        {/* ── Flash Unit (Top Right Bar) ── */}
        <group position={[0.8, 0.65, 0.9]}>
          {/* Glass Cover */}
          <mesh castShadow>
            <boxGeometry args={[0.6, 0.4, 0.5]} />
            <meshPhysicalMaterial
              color="#ffffff"
              roughness={0.1}
              transmission={0.9}
              thickness={0.3}
              clearcoat={1.0}
            />
          </mesh>

          {/* Flash bulb filament inside */}
          <mesh position={[0, 0, -0.05]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial
              color="#fcfcfc"
              emissive={isFlashing ? '#ffffff' : '#444444'}
              emissiveIntensity={isFlashing ? 100 : 0}
            />
          </mesh>

          {/* Volumetric PointLight triggered during flash */}
          <pointLight
            ref={flashLightRef}
            color="#ffffff"
            intensity={isFlashing ? 75 : 0}
            distance={20}
            decay={1.2}
            position={[0, 0, 0.3]}
            castShadow
          />
        </group>

        {/* ── Red Shutter Button (Top Left Face) ── */}
        <group position={[-0.8, 0.9, 0.4]}>
          {/* Chrome Shutter Base Ring */}
          <mesh rotation={[0, 0, 0]} position={[0, 0.01, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.24, 0.06, 24]} />
            <meshStandardMaterial
              color="#e8e8e8"
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>

          {/* Depressible Red Button Cylinder */}
          <mesh
            ref={shutterBtnRef}
            position={[0, 0.05, 0]}
            rotation={[0, 0, 0]}
            castShadow
            onClick={triggerShutterClick}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'default';
            }}
          >
            <cylinderGeometry args={[0.18, 0.18, 0.08, 24]} />
            <meshStandardMaterial
              color={hovered ? '#e63946' : '#d62828'}
              roughness={0.4}
              metalness={0.1}
            />
          </mesh>
        </group>

        {/* ── Photo Ejection Slot (Bottom Front) ── */}
        <mesh position={[0, -0.75, 1.135]}>
          <boxGeometry args={[1.8, 0.08, 0.02]} />
          <meshStandardMaterial color="#050505" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}
