'use client';

import { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshTransmissionMaterial, Line, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { PhotoData } from './CosmicLensHUD';
import { playHoverSound, playClickSound, playZoomOutSound, initAudio } from './CosmicLensAudio';

// Pre-load all photography textures to prevent transition stutter
if (typeof window !== 'undefined') {
  useTexture.preload('/cosmic_nebula.png');
  useTexture.preload('/neon_tokyo.png');
  useTexture.preload('/futuristic_architecture.png');
  useTexture.preload('/surreal_ocean.png');
}

// Color themes for different photo dimensions
interface DimensionTheme {
  lightColor1: string;
  lightColor2: string;
  gridBaseColor: string;
  gridWarpColor: string;
  particleColor: string;
  particleSpeed: number;
  ambientColor: string;
  prismColor: string;
}

const dimensionThemes: Record<number, DimensionTheme> = {
  // Default Telemetry Space
  0: {
    lightColor1: '#00d2ff',
    lightColor2: '#ff9500',
    gridBaseColor: '#0099ff',
    gridWarpColor: '#ff0080',
    particleColor: '#00d2ff',
    particleSpeed: 1.0,
    ambientColor: '#050512',
    prismColor: '#ecf3ff'
  },
  // Dimension 1: Cosmic Nebula
  1: {
    lightColor1: '#ff007f', // Deep neon pink
    lightColor2: '#7b2cbf', // Violet galaxy
    gridBaseColor: '#ff00ff',
    gridWarpColor: '#e0aaff',
    particleColor: '#ff77ff',
    particleSpeed: 1.8,
    ambientColor: '#0f0212',
    prismColor: '#ffd6ff'
  },
  // Dimension 2: Neon Tokyo
  2: {
    lightColor1: '#00f5d4', // Cyber teal
    lightColor2: '#ff006e', // Cyber magenta
    gridBaseColor: '#00ffff',
    gridWarpColor: '#ff00ff',
    particleColor: '#00ffff',
    particleSpeed: 2.5, // Rapid digital rain
    ambientColor: '#020d0f',
    prismColor: '#d8f3dc'
  },
  // Dimension 3: Minimalist Sand Dune
  3: {
    lightColor1: '#ffb703', // Sahara gold
    lightColor2: '#fb8500', // Sunset orange
    gridBaseColor: '#ffcc00',
    gridWarpColor: '#ff6b35',
    particleColor: '#ffeedd',
    particleSpeed: 0.4, // Slow dust particles
    ambientColor: '#120c02',
    prismColor: '#ffeed0'
  },
  // Dimension 4: Surreal Ocean Orb
  4: {
    lightColor1: '#0077b6', // Deep blue
    lightColor2: '#00b4d8', // Aquamarine
    gridBaseColor: '#03045e',
    gridWarpColor: '#90e0ef',
    particleColor: '#caf0f8',
    particleSpeed: 0.8, // Slow rising bubbles
    ambientColor: '#010915',
    prismColor: '#e0f7fa'
  }
};

// Interface for photo nodes
interface PhotoNodeProps {
  photo: PhotoData;
  position: THREE.Vector3;
  onSelect: (photo: PhotoData) => void;
  selectedPhoto: PhotoData | null;
  warpFactor: number;
}

function PhotoNode({ photo, position, onSelect, selectedPhoto, warpFactor }: PhotoNodeProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const isSelected = selectedPhoto?.id === photo.id;

  // Load the texture using standard R3F useTexture hook
  const texture = useTexture(photo.img);

  // Sound trigger on hover
  useEffect(() => {
    if (hovered && !isSelected) {
      playHoverSound();
    }
  }, [hovered, isSelected]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Face the center Y axis
    const targetLookAt = new THREE.Vector3(0, position.y, 0);
    meshRef.current.lookAt(targetLookAt);

    // Dynamic hover scaling
    const targetScale = isSelected ? 1.35 : hovered ? 1.15 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5);

    // Parallax tilt effect on hover based on pointer
    if (hovered && !isSelected) {
      const pointer = state.pointer;
      meshRef.current.rotation.y += pointer.x * 0.15;
      meshRef.current.rotation.x -= pointer.y * 0.15;
    }
  });

  // Calculate points for the connection laser line
  const linePoints = useMemo(() => {
    return [new THREE.Vector3(0, 0, 0), new THREE.Vector3(-position.x, -position.y, -position.z)];
  }, [position]);

  return (
    <group ref={meshRef} position={position}>
      {/* Laser line from node to center when hovered/selected */}
      {(hovered || isSelected) && (
        <Line
          points={linePoints}
          color={isSelected ? '#ffcc00' : '#00d2ff'}
          lineWidth={isSelected ? 3.0 : 1.5}
          transparent
          opacity={0.8}
        />
      )}

      {/* Main Photographic Card */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          initAudio(); // Initialize audio context on first click
          onSelect(photo);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
      >
        <planeGeometry args={[2.0, 1.33]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.15}
          metalness={0.05}
          transparent={false}
          emissive="#ffffff"
          emissiveMap={texture}
          emissiveIntensity={isSelected ? 0.75 : hovered ? 0.65 : 0.35}
        />
      </mesh>

      {/* Holographic Wireframe Border */}
      <mesh>
        <planeGeometry args={[2.05, 1.38]} />
        <meshBasicMaterial
          color={isSelected ? '#ffcc00' : hovered ? '#00d2ff' : '#0099ff'}
          wireframe
          transparent
          opacity={isSelected ? 0.85 : hovered ? 0.75 : 0.45}
        />
      </mesh>

      {/* Soft Backing Glow */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[2.08, 1.4]} />
        <meshBasicMaterial
          color={isSelected ? '#ffcc00' : hovered ? '#00d2ff' : '#0099ff'}
          transparent
          opacity={isSelected ? 0.3 : hovered ? 0.2 : 0.08}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Mini dust emitters around active photos */}
      {(hovered || isSelected) && (
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array([
                  -1.0, -0.66, 0.1,
                  1.0, -0.66, 0.1,
                  -1.0, 0.66, 0.1,
                  1.0, 0.66, 0.1,
                  0, 0.75, 0.05,
                  0, -0.75, 0.05
                ]),
                3
              ]}
            />
          </bufferGeometry>
          <pointsMaterial color={isSelected ? '#ffcc00' : '#00d2ff'} size={0.06} />
        </points>
      )}
    </group>
  );
}

// Custom Grid Warp Shader component with theme colors morphing
interface SpacetimeGridProps {
  warpFactor: number;
  themeRef: React.MutableRefObject<any>;
}

function SpacetimeGrid({ warpFactor, themeRef }: SpacetimeGridProps) {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const warpShader = useMemo(() => {
    return {
      uniforms: {
        uTime: { value: 0 },
        uWarpFactor: { value: 0 },
        uBaseColor: { value: new THREE.Color('#0099ff') },
        uWarpColor: { value: new THREE.Color('#ff0080') },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uWarpFactor;
        varying vec2 vUv;
        varying float vWarpAmount;

        void main() {
          vUv = uv;
          vec3 pos = position;

          // Compute distance from center of coordinates
          float dist = length(pos.xy);

          // Displace Z coordinates near the center to simulate gravitational well
          float wave = sin(dist * 1.5 - uTime * 2.0) * uWarpFactor * 1.2;
          pos.z += wave / (dist * 0.4 + 0.6);

          // Curve the grid into a gorgeous 3D background arena bowl
          pos.z -= dist * dist * 0.022;

          vWarpAmount = wave;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uBaseColor;
        uniform vec3 uWarpColor;
        varying vec2 vUv;
        varying float vWarpAmount;

        void main() {
          // Render thin grid lines
          float gridX = step(0.985, fract(vUv.x * 30.0));
          float gridY = step(0.985, fract(vUv.y * 30.0));
          float grid = gridX + gridY;

          if (grid < 0.1) discard;

          // Chromatic shift depending on gravity warp, using dynamic theme uniforms
          vec3 finalColor = mix(uBaseColor, uWarpColor, clamp(abs(vWarpAmount) * 1.0, 0.0, 1.0));

          // Slowly breathing grid opacity
          float breath = 0.04 + 0.08 * (0.5 + 0.5 * sin(uTime * 1.0));

          gl_FragColor = vec4(finalColor, grid * breath);
        }
      `
    };
  }, []);

  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      shaderRef.current.uniforms.uWarpFactor.value = warpFactor;
      shaderRef.current.uniforms.uBaseColor.value.copy(themeRef.current.gridBaseColor);
      shaderRef.current.uniforms.uWarpColor.value.copy(themeRef.current.gridWarpColor);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -4]}>
      <planeGeometry args={[40, 40, 80, 80]} />
      <shaderMaterial
        ref={shaderRef}
        uniforms={warpShader.uniforms}
        vertexShader={warpShader.vertexShader}
        fragmentShader={warpShader.fragmentShader}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Particle field with dimension-specific behaviors (digital rain, rising bubbles, orbital swirls)
interface StarfieldProps {
  orbitSpeed: number;
  selectedPhoto: PhotoData | null;
  themeRef: React.MutableRefObject<any>;
}

function Starfield({ orbitSpeed, selectedPhoto, themeRef }: StarfieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 450; // Optimized particle count to boost mobile rendering performance

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const cols = new Float32Array(particleCount * 3);
    const baseColor = new THREE.Color('#ffffff');

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = 1.5 + Math.random() * 8.5;
      const y = (Math.random() - 0.5) * 10;

      pos[i * 3] = Math.cos(theta) * radius;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(theta) * radius;

      cols[i * 3] = baseColor.r;
      cols[i * 3 + 1] = baseColor.g;
      cols[i * 3 + 2] = baseColor.b;
    }

    return [pos, cols];
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    // Continuous rotation
    pointsRef.current.rotation.y += delta * 0.03 * orbitSpeed;

    const geom = pointsRef.current.geometry;
    const posAttr = geom.attributes.position;
    const posArray = posAttr.array as Float32Array;
    const colAttr = geom.attributes.color;
    const colArray = colAttr.array as Float32Array;

    const activeDimension = selectedPhoto?.id || 0;
    const speed = themeRef.current.particleSpeed;
    const targetColor = themeRef.current.particleColor;

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;

      // Behavior shifts depending on active selected dimension
      if (activeDimension === 2) {
        // Cyber Tokyo Dimension: falling digital rain drops
        posArray[idx + 1] -= delta * 2.0 * speed;
        if (posArray[idx + 1] < -5) {
          posArray[idx + 1] = 5; // wrap to top
        }
      } else if (activeDimension === 3) {
        // Desert Dune Dimension: blowing sand storm drifting horizontally along X
        posArray[idx] -= delta * 2.2 * speed;
        posArray[idx + 1] += Math.sin(state.clock.getElapsedTime() * 0.5 + i) * 0.004; // subtle vertical waving
        if (posArray[idx] < -7) {
          posArray[idx] = 7; // wrap back
        }
      } else if (activeDimension === 4) {
        // Deep Sea Dimension: rising water bubble motes
        posArray[idx + 1] += delta * 1.0 * speed;
        if (posArray[idx + 1] > 5) {
          posArray[idx + 1] = -5; // wrap to bottom
        }
      } else {
        // Normal Space or Cosmic Nebula: gentle orbital floating
        posArray[idx + 1] += Math.sin(state.clock.getElapsedTime() * 0.3 + i) * 0.002;
      }

      // Smooth color morphing of particles
      colArray[idx] = THREE.MathUtils.lerp(colArray[idx], targetColor.r, delta * 2);
      colArray[idx + 1] = THREE.MathUtils.lerp(colArray[idx + 1], targetColor.g, delta * 2);
      colArray[idx + 2] = THREE.MathUtils.lerp(colArray[idx + 2], targetColor.b, delta * 2);
    }
    
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation={true}
      />
    </points>
  );
}

// Hyperspace Streaking Tunnel Effect rendered during dimensions transition
function HyperspaceTunnel({ active }: { active: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const lineCount = 100;

  const [positions] = useMemo(() => {
    const pos = new Float32Array(lineCount * 3);
    for (let i = 0; i < lineCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = 0.4 + Math.random() * 2.5; // close around camera path
      pos[i * 3] = Math.cos(theta) * radius;
      pos[i * 3 + 1] = Math.sin(theta) * radius;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15; // stretched along camera path Z
    }
    return [pos];
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current || !active) return;

    const geom = pointsRef.current.geometry;
    const posAttr = geom.attributes.position;
    const posArray = posAttr.array as Float32Array;

    for (let i = 0; i < lineCount; i++) {
      const idx = i * 3;
      // High speed warp lines flying straight at the camera Z
      posArray[idx + 2] += delta * 42.0;
      
      // Wrap back to the far plane
      if (posArray[idx + 2] > 7.0) {
        posArray[idx + 2] = -12.0;
      }
    }
    posAttr.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.12} // Streaked size
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Camera control and interpolation rig supporting warped 3D dimension pans
interface CameraRigProps {
  selectedPhoto: PhotoData | null;
  scrollOffsetRef: { current: number };
  warpedDimension: number;
  fovRef: React.MutableRefObject<number>;
}

function CameraRig({ selectedPhoto, scrollOffsetRef, warpedDimension, fovRef }: CameraRigProps) {
  const { camera, mouse } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 0, 8));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    // Dynamic FOV update driven by GSAP timeline transitions
    if ('fov' in camera) {
      const persCamera = camera as THREE.PerspectiveCamera;
      persCamera.fov = fovRef.current;
      persCamera.updateProjectionMatrix();
    }

    if (warpedDimension > 0) {
      // Warped view: Camera orbits the central scene element (0,0,0) based on mouse
      // Gives a premium 3D panoramic experience inside the dimension
      const angleX = mouse.x * Math.PI * 0.35; // pan horizontal
      const angleY = mouse.y * Math.PI * 0.2;  // pan vertical
      
      const r = 5.8;
      const cx = Math.sin(angleX) * Math.cos(angleY) * r;
      const cy = Math.sin(angleY) * r;
      const cz = Math.cos(angleX) * Math.cos(angleY) * r;

      targetPos.current.set(cx, cy, cz);
      targetLookAt.current.set(0, 0, 0);
    } else if (selectedPhoto) {
      // Dimension focused zoom: Camera sits directly in front of the card facing center
      const position = getPhotoPosition(selectedPhoto.id);
      const normal = position.clone().normalize();
      normal.y = 0;
      normal.normalize();

      // Camera flies closer to card, preparing for dimension flash warp
      const camX = position.x + normal.x * 2.1;
      const camY = position.y;
      const camZ = position.z + normal.z * 2.1;

      targetPos.current.set(camX, camY, camZ);
      targetLookAt.current.set(position.x, position.y, position.z);
    } else {
      // Overview travel: scrolling flies forward/backward along helicoid
      const offset = scrollOffsetRef.current;
      const zoomDepth = 8.5 - offset * 5.5;
      const mx = mouse.x * 2.2;
      const my = mouse.y * 1.8;

      targetPos.current.set(mx, my, zoomDepth);
      targetLookAt.current.set(0, 0, 0);
    }

    // Smoothly interpolate position
    camera.position.lerp(targetPos.current, delta * 3.5);

    // Smoothly slerp rotation using matrix
    const m1 = new THREE.Matrix4();
    m1.lookAt(camera.position, targetLookAt.current, camera.up);
    const targetRotation = new THREE.Quaternion().setFromRotationMatrix(m1);
    camera.quaternion.slerp(targetRotation, delta * 3.5);
  });

  return null;
}

// Helical positioning helper
const getPhotoPosition = (id: number): THREE.Vector3 => {
  const index = id - 1;
  const angle = index * (Math.PI / 1.8) + Math.PI / 6;
  const radius = 3.6;
  const y = -1.2 + index * 0.8;
  return new THREE.Vector3(
    Math.cos(angle) * radius,
    y,
    Math.sin(angle) * radius
  );
};

// Continuous group rotation updater
interface RotationalGroupProps {
  dragRotationRef: { current: { x: number; y: number } };
  isDraggingRef: { current: boolean };
  selectedPhoto: PhotoData | null;
  orbitSpeed: number;
  photos: PhotoData[];
  warpFactor: number;
  onSelectPhoto: (photo: PhotoData) => void;
  themeRef: React.MutableRefObject<any>;
}

function RotationalGroup({
  dragRotationRef,
  isDraggingRef,
  selectedPhoto,
  orbitSpeed,
  photos,
  warpFactor,
  onSelectPhoto,
  themeRef
}: RotationalGroupProps) {
  const localGroupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (localGroupRef.current) {
      // Slow constant ambient spin when not dragging or selected
      if (!isDraggingRef.current && !selectedPhoto) {
        localGroupRef.current.rotation.y += delta * 0.05 * orbitSpeed;
      } else if (!selectedPhoto) {
        // Lerp to the drag coordinates
        localGroupRef.current.rotation.y = THREE.MathUtils.lerp(
          localGroupRef.current.rotation.y,
          dragRotationRef.current.y,
          delta * 5
        );
        localGroupRef.current.rotation.x = THREE.MathUtils.lerp(
          localGroupRef.current.rotation.x,
          dragRotationRef.current.x,
          delta * 5
        );
      } else {
        // Slowly bring rotation back to neutral coordinates when focused on a dimension
        localGroupRef.current.rotation.x = THREE.MathUtils.lerp(localGroupRef.current.rotation.x, 0, delta * 3);
        localGroupRef.current.rotation.y = THREE.MathUtils.lerp(localGroupRef.current.rotation.y, 0, delta * 3);
      }
    }
  });

  return (
    <group ref={localGroupRef}>
      {/* Orbiting Stardust nodes */}
      <Starfield orbitSpeed={orbitSpeed} selectedPhoto={selectedPhoto} themeRef={themeRef} />

      {/* Helix corridor of photographs */}
      {photos.map((photo) => (
        <PhotoNode
          key={photo.id}
          photo={photo}
          position={getPhotoPosition(photo.id)}
          onSelect={onSelectPhoto}
          selectedPhoto={selectedPhoto}
          warpFactor={warpFactor}
        />
      ))}
    </group>
  );
}

// ── IMMERSIVE SKYDOME PORTAL BACKGROUNDS ──
function SkyDome({ imgUrl }: { imgUrl: string }) {
  const texture = useTexture(imgUrl);
  return (
    <mesh scale={[-12, 12, 12]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} toneMapped={false} />
    </mesh>
  );
}

// ── DIMENSIONAL 3D SUB-COMPONENTS ──

// Shared Geometry and Material props
interface DimensionSubProps {
  themeRef: React.MutableRefObject<any>;
  orbitSpeed: number;
}

// Nebula Cloud helper representing volumetric gas fields
function NebulaCloud({ position, color, size }: { position: [number, number, number]; color: string; size: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
      meshRef.current.rotation.z += delta * 0.02;
      // Soft breathing scale
      const pulse = 1.0 + Math.sin(state.clock.getElapsedTime() * 0.4 + position[0]) * 0.05;
      meshRef.current.scale.set(size * pulse, size * 0.8 * pulse, size * pulse);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.08}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Asteroid asteroid belt data
const asteroidData = [
  { radius: 1.8, speed: 0.5, size: 0.12, color: '#ff007f', inclination: 0.15, type: 'dodecahedron' },
  { radius: 2.3, speed: -0.4, size: 0.15, color: '#7b2cbf', inclination: -0.25, type: 'octahedron' },
  { radius: 2.9, speed: 0.3, size: 0.18, color: '#ff77ff', inclination: 0.1, type: 'icosahedron' },
  { radius: 3.5, speed: -0.2, size: 0.22, color: '#00d2ff', inclination: -0.05, type: 'dodecahedron' }
];

function OrbitingAsteroid({ data }: { data: typeof asteroidData[0] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const orbitLinePoints = useMemo(() => {
    const pts = [];
    const count = 64;
    for (let i = 0; i <= count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * data.radius;
      const z = Math.sin(angle) * data.radius;
      const vec = new THREE.Vector3(x, 0, z);
      vec.applyAxisAngle(new THREE.Vector3(1, 0, 0), data.inclination);
      pts.push(vec);
    }
    return pts;
  }, [data]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime() * data.speed;
    const x = Math.cos(time) * data.radius;
    const z = Math.sin(time) * data.radius;
    const pos = new THREE.Vector3(x, 0, z);
    pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), data.inclination);
    
    meshRef.current.position.copy(pos);
    meshRef.current.rotation.x += 0.01;
    meshRef.current.rotation.y += 0.015;
  });

  return (
    <group>
      <Line points={orbitLinePoints} color={data.color} lineWidth={0.5} transparent opacity={0.12} />
      <mesh ref={meshRef}>
        {data.type === 'dodecahedron' ? (
          <dodecahedronGeometry args={[data.size]} />
        ) : data.type === 'icosahedron' ? (
          <icosahedronGeometry args={[data.size]} />
        ) : (
          <octahedronGeometry args={[data.size]} />
        )}
        <meshStandardMaterial color={data.color} roughness={0.4} metalness={0.8} />
      </mesh>
    </group>
  );
}

// Dimension 1: Cosmic Nebula (textured skydome, crystalline planet, and orbiting asteroids)
function CosmicNebulaDimension({ themeRef, orbitSpeed }: DimensionSubProps) {
  const groupRef = useRef<THREE.Group>(null);
  const outerStarRef = useRef<THREE.Mesh>(null);
  
  // Accretion disk orbiting particle positions
  const [accretionPositions] = useMemo(() => {
    const count = 180;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.08;
      const r = 1.4 + Math.random() * 2.2; // Disk radius span
      pos[idx] = Math.cos(angle) * r;
      pos[idx + 1] = (Math.random() - 0.5) * 0.12;
      pos[idx + 2] = Math.sin(angle) * r;
    }
    return [pos];
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.04 * orbitSpeed;
    }
    if (outerStarRef.current) {
      outerStarRef.current.rotation.y -= delta * 0.1;
      outerStarRef.current.rotation.z += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Immersive photograph skydome wrapping space */}
      <SkyDome imgUrl="/cosmic_nebula.png" />

      {/* Plasma Core Star (Solid emitting sphere + reverse rotating wireframe envelope) */}
      <group position={[0, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshStandardMaterial
            color="#ff0055"
            emissive="#ff007f"
            emissiveIntensity={2.5}
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>
        
        {/* Outer glowing plasma shell */}
        <mesh ref={outerStarRef}>
          <sphereGeometry args={[0.75, 16, 16]} />
          <meshBasicMaterial
            color="#ff77ff"
            wireframe
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* Twin Relativistic Jet Streams from Stellar Poles */}
      <group>
        {/* Top polar jet */}
        <mesh position={[0, 1.8, 0]}>
          <coneGeometry args={[0.16, 3.2, 16, 1, true]} />
          <meshBasicMaterial
            color="#ff007f"
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        
        {/* Top electromagnetic fields loops */}
        <mesh position={[0, 0.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.22, 0.015, 8, 24]} />
          <meshBasicMaterial color="#7b2cbf" transparent opacity={0.6} />
        </mesh>
        <mesh position={[0, 1.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.32, 0.012, 8, 24]} />
          <meshBasicMaterial color="#7b2cbf" transparent opacity={0.4} />
        </mesh>

        {/* Bottom polar jet */}
        <mesh position={[0, -1.8, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.16, 3.2, 16, 1, true]} />
          <meshBasicMaterial
            color="#ff007f"
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Bottom electromagnetic fields loops */}
        <mesh position={[0, -0.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.22, 0.015, 8, 24]} />
          <meshBasicMaterial color="#7b2cbf" transparent opacity={0.6} />
        </mesh>
        <mesh position={[0, -1.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.32, 0.012, 8, 24]} />
          <meshBasicMaterial color="#7b2cbf" transparent opacity={0.4} />
        </mesh>
      </group>

      {/* Solid Dust Accretion Disk Lane 1 */}
      <mesh rotation={[Math.PI / 2.1, 0, 0.1]}>
        <ringGeometry args={[1.3, 2.2, 64]} />
        <meshStandardMaterial
          color="#7b2cbf"
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
          roughness={0.9}
        />
      </mesh>

      {/* Solid Dust Accretion Disk Lane 2 */}
      <mesh rotation={[Math.PI / 2.15, 0.05, 0.15]}>
        <ringGeometry args={[2.3, 3.2, 64]} />
        <meshStandardMaterial
          color="#ff007f"
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
          roughness={0.9}
        />
      </mesh>

      {/* Accretion Disk Star Particles around nebula */}
      <points rotation={[Math.PI / 2.1, 0, 0.1]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[accretionPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#ff77ff" size={0.055} transparent opacity={0.8} />
      </points>
      
      {/* Drifting Space Dust / Nebular Cloud layers */}
      <NebulaCloud position={[1.8, 1.0, -1.8]} color="#ff00aa" size={1.8} />
      <NebulaCloud position={[-2.2, -0.8, -2.2]} color="#7b2cbf" size={2.2} />
      <NebulaCloud position={[1.2, -1.2, 1.8]} color="#00d2ff" size={1.5} />
      <NebulaCloud position={[-1.5, 1.5, 1.5]} color="#ff77ff" size={2.0} />

      {/* Orbiting moons & asteroids */}
      {asteroidData.map((data, idx) => (
        <OrbitingAsteroid key={idx} data={data} />
      ))}
      
      <Starfield orbitSpeed={orbitSpeed * 1.4} selectedPhoto={{ id: 1 } as any} themeRef={themeRef} />
    </group>
  );
}

const BuildingShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uSeed;
    uniform float uHeight;
    varying vec2 vUv;
    varying vec3 vPosition;

    float rand(vec2 co){
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    void main() {
      vec3 baseColor = vec3(0.02, 0.02, 0.05);
      
      float cols = 4.0;
      float rows = floor(uHeight * 6.5);
      
      vec2 gridUv = fract(vUv * vec2(cols, rows));
      vec2 cellId = floor(vUv * vec2(cols, rows));
      
      float windowX = step(0.18, gridUv.x) * step(gridUv.x, 0.82);
      float windowY = step(0.15, gridUv.y) * step(gridUv.y, 0.85);
      float isWindow = windowX * windowY;

      if (vUv.y > 0.96 || vUv.y < 0.04) {
        isWindow = 0.0;
      }

      float litRandom = rand(cellId + vec2(uSeed, 3.1415));
      float blink = 0.5 + 0.5 * sin(uTime * 0.25 * (litRandom + 0.3) + cellId.y);
      float isLit = step(0.45, litRandom) * step(0.35, blink);

      vec3 finalColor = baseColor;
      
      if (isWindow > 0.5) {
        if (isLit > 0.5) {
          vec3 neonColor = mix(uColor, vec3(1.0, 1.0, 1.0), 0.2);
          finalColor = neonColor * (0.8 + 0.3 * sin(uTime * 2.0 + cellId.x));
        } else {
          finalColor = vec3(0.01, 0.01, 0.025);
        }
      }

      float stripe = step(0.985, vUv.x) + step(vUv.x, 0.015);
      if (stripe > 0.5 && mod(cellId.y, 3.0) == 0.0) {
        finalColor = uColor * 1.3;
      }

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

interface CyberpunkBuildingProps {
  pos: [number, number, number];
  h: number;
  color: string;
  seed: number;
  hasBillboard: boolean;
  billboardTexture: THREE.Texture;
}

function CyberpunkBuilding({ pos, h, color, seed, hasBillboard, billboardTexture }: CyberpunkBuildingProps) {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(color) },
    uSeed: { value: seed },
    uHeight: { value: h },
  }), [color, seed, h]);

  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  const beaconRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (beaconRef.current) {
      const scaleVal = 0.8 + 0.3 * Math.sin(state.clock.getElapsedTime() * 6.0 + seed);
      beaconRef.current.scale.set(scaleVal, scaleVal, scaleVal);
    }
  });

  return (
    <group position={pos}>
      {/* Skyscraper body */}
      <mesh scale={[0.5, h, 0.5]}>
        <boxGeometry args={[1, 1, 1]} />
        <shaderMaterial
          ref={shaderRef}
          uniforms={uniforms}
          vertexShader={BuildingShader.vertexShader}
          fragmentShader={BuildingShader.fragmentShader}
          transparent
        />
      </mesh>

      {/* Building needle spire antenna */}
      <mesh position={[0, h / 2 + 0.25, 0]}>
        <cylinderGeometry args={[0.012, 0.003, 0.5, 4]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* Blinking beacon warning light at tip */}
      <mesh ref={beaconRef} position={[0, h / 2 + 0.5, 0]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#ff0055" />
      </mesh>

      {/* Glowing holographic billboard */}
      {hasBillboard && (
        <group position={[0.26, 0.0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh>
            <planeGeometry args={[h * 0.35, h * 0.65]} />
            <meshStandardMaterial
              map={billboardTexture}
              emissive={new THREE.Color(color)}
              emissiveIntensity={0.8}
              roughness={0.25}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Holographic glowing wireframe frame */}
          <mesh>
            <planeGeometry args={[h * 0.37, h * 0.67]} />
            <meshBasicMaterial color={color} side={THREE.DoubleSide} wireframe transparent opacity={0.4} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function FlyingTraffic({ radius, height, speed, color }: { radius: number; height: number; speed: number; color: string }) {
  const carsRef = useRef<THREE.Group>(null);
  const carCount = 6;

  useFrame((state) => {
    if (!carsRef.current) return;
    const time = state.clock.getElapsedTime() * speed;
    const children = carsRef.current.children;
    
    for (let i = 0; i < children.length; i++) {
      const carGroup = children[i] as THREE.Group;
      const angle = (i / carCount) * Math.PI * 2 + time;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      carGroup.position.set(x, height, z);
      carGroup.rotation.y = -angle + Math.PI / 2;
    }
  });

  return (
    <group ref={carsRef}>
      {/* Highway ring lines */}
      <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.015, radius + 0.015, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
      
      {[...Array(carCount)].map((_, idx) => (
        <group key={idx}>
          {/* Glowing flying vehicle body */}
          <mesh>
            <boxGeometry args={[0.07, 0.024, 0.14]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} />
          </mesh>
          {/* Cruiser tail glow streak */}
          <mesh position={[0, 0, 0.1]}>
            <boxGeometry args={[0.015, 0.008, 0.12]} />
            <meshBasicMaterial color={color} transparent opacity={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Dimension 2: Neon Tokyo City (wet floor reflections, solid window-banded columns, and sky matrices)
function NeonTokyoDimension({ themeRef, orbitSpeed }: DimensionSubProps) {
  const billboardTexture = useTexture('/neon_tokyo.png');

  const [buildings, cablePoints] = useMemo(() => {
    const list = [];
    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2;
      const r = 2.4 + Math.random() * 2.1;
      const h = 1.4 + Math.random() * 3.4;
      list.push({
        pos: [Math.cos(angle) * r, -2.5 + h/2, Math.sin(angle) * r] as [number, number, number],
        h,
        color: Math.random() > 0.5 ? '#00f5d4' : '#ff006e',
        hasBillboard: i % 4 === 0
      });
    }

    const cables = [];
    for (let i = 0; i < 6; i++) {
      const b1 = list[Math.floor(Math.random() * list.length)];
      const b2 = list[Math.floor(Math.random() * list.length)];
      if (b1 && b2 && b1 !== b2) {
        cables.push([
          new THREE.Vector3(b1.pos[0], b1.pos[1] + b1.h / 2, b1.pos[2]),
          new THREE.Vector3(b2.pos[0], b2.pos[1] + b2.h / 2, b2.pos[2])
        ]);
      }
    }

    return [list, cables];
  }, []);

  return (
    <group>
      {/* Photograph backdrop sky box wrapping the city */}
      <SkyDome imgUrl="/neon_tokyo.png" />

      {/* Glossy wet look street floor reflecting lights */}
      <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color="#08080f" roughness={0.15} metalness={0.8} />
      </mesh>

      {/* Cyber Grid Sky Ceiling representing virtual environment boundaries */}
      <mesh position={[0, 2.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 18, 15, 15]} />
        <meshBasicMaterial color="#ff006e" wireframe transparent opacity={0.1} />
      </mesh>
      
      {/* Procedural Skyscraper structures */}
      {buildings.map((b, idx) => (
        <CyberpunkBuilding
          key={idx}
          pos={b.pos}
          h={b.h}
          color={b.color}
          seed={idx}
          hasBillboard={b.hasBillboard}
          billboardTexture={billboardTexture}
        />
      ))}

      {/* Flying vehicle traffic lanes orbiting at different levels */}
      <FlyingTraffic radius={2.0} height={-1.2} speed={0.4} color="#00f5d4" />
      <FlyingTraffic radius={3.2} height={0.2} speed={-0.3} color="#ff006e" />
      <FlyingTraffic radius={4.1} height={1.4} speed={0.2} color="#00f5d4" />

      {/* Dynamic Cyber Wiring connecting skyscraper nodes */}
      {cablePoints.map((pts, idx) => (
        <Line
          key={idx}
          points={pts}
          color={idx % 2 === 0 ? '#00f5d4' : '#ff006e'}
          lineWidth={1.0}
          transparent
          opacity={0.4}
        />
      ))}

      {/* Tokyo digital rain */}
      <Starfield orbitSpeed={orbitSpeed} selectedPhoto={{ id: 2 } as any} themeRef={themeRef} />
    </group>
  );
}

// Dimension 3: Sahara Dune (low-poly solid golden sand landscape, obelisks, and solar corona rings)
function SaharaDuneDimension({ themeRef, orbitSpeed }: DimensionSubProps) {
  const geomRef = useRef<THREE.BufferGeometry>(null);
  const monolithRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (geomRef.current) {
      const posAttr = geomRef.current.attributes.position;
      const posArray = posAttr.array as Float32Array;
      const speedTime = time * 0.7;
      
      for (let i = 0; i < posAttr.count; i++) {
        const idx = i * 3;
        const x = posArray[idx];
        const y = posArray[idx + 1];
        
        // Multi-frequency waves representing sharper desert sand ridges
        const wave1 = Math.sin(x * 0.3 + speedTime) * Math.cos(y * 0.3 + speedTime * 0.5) * 0.35;
        const wave2 = Math.sin(x * 0.7 - speedTime * 0.3) * 0.12;
        const ridge = Math.abs(Math.sin(x * 0.15 + y * 0.15 + speedTime * 0.2)) * 0.2;
        
        posArray[idx + 2] = wave1 + wave2 - ridge;
      }
      posAttr.needsUpdate = true;
    }

    if (monolithRef.current) {
      monolithRef.current.rotation.y = time * 0.5;
      monolithRef.current.position.y = -0.4 + Math.sin(time * 1.5) * 0.15;
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = time * 0.9;
      ring1Ref.current.rotation.y = time * 0.45;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -time * 0.7;
      ring2Ref.current.rotation.z = time * 0.55;
    }

    if (coronaRef.current) {
      coronaRef.current.rotation.z = time * 0.12;
      const pulse = 1.0 + Math.sin(time * 1.8) * 0.04;
      coronaRef.current.scale.set(pulse, pulse, 1.0);
    }
  });

  return (
    <group>
      {/* Photograph desert sunset skybox wrapping environment */}
      <SkyDome imgUrl="/futuristic_architecture.png" />

      {/* Low-poly solid golden dunes terrain using Flat Shading */}
      <mesh position={[0, -1.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry ref={geomRef} args={[18, 18, 25, 25]} />
        <meshStandardMaterial color="#d49e35" roughness={0.85} metalness={0.15} flatShading />
      </mesh>

      {/* Half-buried ancient futuristic ruins */}
      <group>
        {/* Ruins Pillar 1 */}
        <mesh position={[3, -1.2, -1]} rotation={[-0.1, 0, 0.1]}>
          <cylinderGeometry args={[0.22, 0.22, 2.4, 6]} />
          <meshStandardMaterial color="#bda273" roughness={0.9} flatShading />
        </mesh>
        
        {/* Broken Tilted Pillar 2 */}
        <mesh position={[3.2, -1.6, -0.4]} rotation={[0.4, 0.2, 0.6]}>
          <cylinderGeometry args={[0.2, 0.2, 1.4, 6]} />
          <meshStandardMaterial color="#bda273" roughness={0.9} flatShading />
        </mesh>
        
        {/* Half-buried sand pyramid */}
        <mesh position={[-3.5, -1.8, -3.2]} rotation={[0.2, 0.4, 0.1]}>
          <coneGeometry args={[1.6, 2.2, 4]} />
          <meshStandardMaterial color="#ab9063" roughness={0.95} flatShading />
        </mesh>
      </group>

      {/* Monolith System in Center Dunes */}
      <group position={[0, -0.4, 0]}>
        {/* Floating reflective Mirror Chrome Obelisk */}
        <mesh ref={monolithRef}>
          <octahedronGeometry args={[0.5]} />
          <meshStandardMaterial color="#ffffff" metalness={1.0} roughness={0.02} />
        </mesh>

        {/* Gyroscopic Energy Ring 1 */}
        <mesh ref={ring1Ref}>
          <ringGeometry args={[0.75, 0.85, 32]} />
          <meshStandardMaterial color="#ffcc00" metalness={0.9} roughness={0.1} side={THREE.DoubleSide} />
        </mesh>

        {/* Gyroscopic Energy Ring 2 */}
        <mesh ref={ring2Ref}>
          <ringGeometry args={[0.95, 1.05, 32]} />
          <meshStandardMaterial color="#fb8500" metalness={0.9} roughness={0.1} side={THREE.DoubleSide} />
        </mesh>

        {/* Quantum projection light beam projecting to sky */}
        <mesh position={[0, 2.0, 0]}>
          <cylinderGeometry args={[0.02, 0.12, 4.0, 8, 1, true]} />
          <meshBasicMaterial color="#ffeed0" transparent opacity={0.25} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>

      {/* Dark Sun core representing solar eclipse */}
      <mesh position={[0, 0.2, -6.5]}>
        <sphereGeometry args={[2.45, 32, 32]} />
        <meshBasicMaterial color="#080812" />
      </mesh>

      {/* Burning Textured Solar Corona halo ring */}
      <mesh position={[0, 0.2, -6.6]} ref={coronaRef}>
        <ringGeometry args={[2.5, 3.8, 64]} />
        <meshBasicMaterial color="#fb8500" transparent opacity={0.6} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Warm dust motes */}
      <Starfield orbitSpeed={orbitSpeed * 0.2} selectedPhoto={{ id: 3 } as any} themeRef={themeRef} />
    </group>
  );
}

function Jellyfish({ position, color, size = 1.0 }: { position: [number, number, number]; color: string; size?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const tentaclesRef = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Pulse swim motion: bobbing and scale compression
    const pulse = Math.sin(time * 2.2 + position[0]);
    groupRef.current.position.y = position[1] + pulse * 0.15;
    
    const scaleY = size * (1.0 - Math.max(0, pulse) * 0.18);
    const scaleXZ = size * (1.0 + Math.max(0, -pulse) * 0.08);
    groupRef.current.scale.set(scaleXZ, scaleY, scaleXZ);

    // Tentacle wiggles
    tentaclesRef.current.forEach((t, idx) => {
      if (t) {
        t.rotation.z = Math.sin(time * 3.5 + idx * 0.5) * 0.15;
        t.rotation.x = Math.cos(time * 3.5 + idx * 0.5) * 0.12;
      }
    });
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Bell cap */}
      <mesh>
        <sphereGeometry args={[0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.8}
          transparent
          opacity={0.65}
          roughness={0.1}
        />
      </mesh>
      
      {/* Glowing aura */}
      <mesh scale={1.25}>
        <sphereGeometry args={[0.3, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} wireframe />
      </mesh>

      {/* Tentacles */}
      {[...Array(4)].map((_, idx) => {
        const angle = (idx / 4) * Math.PI * 2;
        const r = 0.18;
        const tx = Math.cos(angle) * r;
        const tz = Math.sin(angle) * r;
        return (
          <mesh
            key={idx}
            position={[tx, -0.2, tz]}
            ref={(el) => {
              if (el) tentaclesRef.current[idx] = el;
            }}
          >
            <cylinderGeometry args={[0.012, 0.003, 0.8, 4]} />
            <meshBasicMaterial color={color} transparent opacity={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}

function SchoolOfFish() {
  const groupRef = useRef<THREE.Group>(null);
  const count = 12;

  const fishData = useMemo(() => {
    return [...Array(count)].map((_, i) => ({
      offset: (i / count) * Math.PI * 2,
      radius: 1.5 + Math.random() * 0.7,
      speed: 0.7 + Math.random() * 0.4,
      height: -1.0 + Math.random() * 1.6,
      scale: 0.035 + Math.random() * 0.035,
      color: Math.random() > 0.5 ? '#00f5d4' : '#00b4d8'
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    const children = groupRef.current.children;
    
    for (let i = 0; i < children.length; i++) {
      const fish = children[i] as THREE.Group;
      const data = fishData[i];
      if (!data) continue;
      const angle = time * data.speed + data.offset;
      
      const x = Math.cos(angle) * data.radius;
      const z = Math.sin(angle) * data.radius;
      const y = Math.sin(time * 1.8 + data.offset * 2.0) * 0.12 + data.height;
      
      fish.position.set(x, y, z);
      fish.rotation.y = -angle + Math.PI;
      fish.rotation.z = Math.sin(time * 5.0 + data.offset) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {fishData.map((data, idx) => (
        <group key={idx} scale={[data.scale, data.scale * 0.5, data.scale * 1.5]}>
          <mesh>
            <coneGeometry args={[0.5, 1.0, 4]} />
            <meshBasicMaterial color={data.color} transparent opacity={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function VolumetricLightCone({ position, angle }: { position: [number, number, number]; angle: number }) {
  const coneRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (coneRef.current) {
      const mat = coneRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0.04 + 0.02 * Math.sin(state.clock.getElapsedTime() * 0.8 + position[0]);
      }
    }
  });

  return (
    <mesh ref={coneRef} position={position} rotation={[0, 0, angle]}>
      <coneGeometry args={[0.6, 5.0, 16, 1, true]} />
      <meshBasicMaterial
        color="#00ffff"
        transparent
        opacity={0.06}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Dimension 4: Ocean Abyss (solid sea surfaces, volumetric god rays, and central glass crystals)
function OceanAbyssDimension({ themeRef, orbitSpeed }: DimensionSubProps) {
  // Reusable plane geometry shared between seabed and sea surface (Memory and CPU Optimization)
  const sharedPlaneGeom = useMemo(() => new THREE.PlaneGeometry(16, 16, 20, 20), []);
  const geomTopRef = useRef<THREE.BufferGeometry>(null);
  const geomBottomRef = useRef<THREE.BufferGeometry>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime() * 0.9;
    
    // We only need to animate the geometry values ONCE since they reference the same shared object (Performance Optimization)
    if (geomBottomRef.current) {
      const posAttr = geomBottomRef.current.attributes.position;
      const posArray = posAttr.array as Float32Array;
      for (let i = 0; i < posAttr.count; i++) {
        const idx = i * 3;
        const x = posArray[idx];
        const y = posArray[idx + 1];
        posArray[idx + 2] = Math.sin(x * 0.38 + time) * 0.25 + Math.cos(y * 0.38 + time) * 0.15;
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Photograph oceanic backdrop sky box */}
      <SkyDome imgUrl="/surreal_ocean.png" />

      {/* Wavy seabed floor */}
      <mesh position={[0, -2.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <primitive object={sharedPlaneGeom} attach="geometry" ref={geomBottomRef} />
        <meshStandardMaterial color="#005f73" roughness={0.1} metalness={0.8} transparent opacity={0.7} />
      </mesh>
      
      {/* Wavy sea surface ceiling */}
      <mesh position={[0, 2.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <primitive object={sharedPlaneGeom} attach="geometry" ref={geomTopRef} />
        <meshStandardMaterial color="#0a9396" roughness={0.1} metalness={0.8} transparent opacity={0.65} />
      </mesh>

      {/* Volumetric underwater light shafts */}
      <VolumetricLightCone position={[-2.5, 0, -2.0]} angle={0.06} />
      <VolumetricLightCone position={[0.5, 0, -1.0]} angle={-0.04} />
      <VolumetricLightCone position={[2.8, 0, 1.5]} angle={0.08} />

      {/* Sunken Temple ruins on seabed */}
      <group>
        {/* Pillar 1 */}
        <mesh position={[-2.2, -1.2, -1.8]}>
          <cylinderGeometry args={[0.2, 0.2, 2.0, 8]} />
          <meshStandardMaterial color="#003542" roughness={0.95} />
        </mesh>
        
        {/* Broken Column 2 lying flat */}
        <mesh position={[-1.8, -2.1, -1.2]} rotation={[0.15, 0.4, Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.18, 1.3, 8]} />
          <meshStandardMaterial color="#003542" roughness={0.95} />
        </mesh>
        
        {/* Ancient Arch Portal */}
        <group position={[2.6, -1.3, -2.2]} rotation={[0, -0.4, 0]}>
          <mesh position={[-0.6, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 1.8, 8]} />
            <meshStandardMaterial color="#003542" roughness={0.95} />
          </mesh>
          <mesh position={[0.6, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 1.8, 8]} />
            <meshStandardMaterial color="#003542" roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.9, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.15, 0.15, 1.4, 8]} />
            <meshStandardMaterial color="#003542" roughness={0.95} />
          </mesh>
        </group>
      </group>

      {/* Bioluminescent Jellyfish drifting in the abyss */}
      <Jellyfish position={[-1.8, -0.4, -1.6]} color="#00ffcc" size={0.7} />
      <Jellyfish position={[2.0, 0.8, -1.0]} color="#00b4d8" size={0.85} />
      <Jellyfish position={[-1.4, 0.8, 1.4]} color="#b5179e" size={0.65} />

      {/* Synchronized schools of neon fish */}
      <SchoolOfFish />

      {/* Outer Cage surrounding the central refraction prism */}
      <mesh scale={1.8}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color="#00ffcc" wireframe transparent opacity={0.12} />
      </mesh>

      {/* Bubbles */}
      <Starfield orbitSpeed={orbitSpeed} selectedPhoto={{ id: 4 } as any} themeRef={themeRef} />
    </group>
  );
}

// Main Scene Component containing Canvas and controls
interface CosmicLensSceneProps {
  warpFactor: number;
  refractIndex: number;
  orbitSpeed: number;
  selectedPhoto: PhotoData | null;
  setSelectedPhoto: (photo: PhotoData | null) => void;
  photos: PhotoData[];
  warpedDimension: number;
}

export default function CosmicLensScene({
  warpFactor,
  refractIndex,
  orbitSpeed,
  selectedPhoto,
  setSelectedPhoto,
  photos,
  warpedDimension
}: CosmicLensSceneProps) {
  // Store scroll and drag coordinates in DOM-interactive refs to avoid canvas context re-renders
  const scrollOffsetRef = useRef(0);
  const dragRotationRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  // Cinematic Camera FOV & Transition state refs (GSAP Morphing values)
  const fovRef = useRef(60);
  const warpStateRef = useRef<'idle' | 'warping' | 'warped' | 'returning'>('idle');

  // Refs holding color theme values to animate them smoothly via GSAP
  const themeRef = useRef({
    lightColor1: new THREE.Color('#00d2ff'),
    lightColor2: new THREE.Color('#ff9500'),
    gridBaseColor: new THREE.Color('#0099ff'),
    gridWarpColor: new THREE.Color('#ff0080'),
    particleColor: new THREE.Color('#00d2ff'),
    particleSpeed: 1.0,
    ambientColor: new THREE.Color('#050512'),
    prismColor: new THREE.Color('#ecf3ff')
  });

  // Lights refs to mutate colors inside the useFrame loop
  const light1Ref = useRef<THREE.PointLight>(null);
  const light2Ref = useRef<THREE.PointLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);

  // GSAP animation to morph color theme elements dynamically when selectedPhoto changes
  useEffect(() => {
    const targetTheme = dimensionThemes[selectedPhoto?.id || 0];

    // Transition theme variables
    gsap.to(themeRef.current.lightColor1, {
      r: new THREE.Color(targetTheme.lightColor1).r,
      g: new THREE.Color(targetTheme.lightColor1).g,
      b: new THREE.Color(targetTheme.lightColor1).b,
      duration: 1.6,
      ease: 'power2.out'
    });

    gsap.to(themeRef.current.lightColor2, {
      r: new THREE.Color(targetTheme.lightColor2).r,
      g: new THREE.Color(targetTheme.lightColor2).g,
      b: new THREE.Color(targetTheme.lightColor2).b,
      duration: 1.6,
      ease: 'power2.out'
    });

    gsap.to(themeRef.current.gridBaseColor, {
      r: new THREE.Color(targetTheme.gridBaseColor).r,
      g: new THREE.Color(targetTheme.gridBaseColor).g,
      b: new THREE.Color(targetTheme.gridBaseColor).b,
      duration: 1.6,
      ease: 'power2.out'
    });

    gsap.to(themeRef.current.gridWarpColor, {
      r: new THREE.Color(targetTheme.gridWarpColor).r,
      g: new THREE.Color(targetTheme.gridWarpColor).g,
      b: new THREE.Color(targetTheme.gridWarpColor).b,
      duration: 1.6,
      ease: 'power2.out'
    });

    gsap.to(themeRef.current.particleColor, {
      r: new THREE.Color(targetTheme.particleColor).r,
      g: new THREE.Color(targetTheme.particleColor).g,
      b: new THREE.Color(targetTheme.particleColor).b,
      duration: 1.6,
      ease: 'power2.out'
    });

    gsap.to(themeRef.current.ambientColor, {
      r: new THREE.Color(targetTheme.ambientColor).r,
      g: new THREE.Color(targetTheme.ambientColor).g,
      b: new THREE.Color(targetTheme.ambientColor).b,
      duration: 1.6,
      ease: 'power2.out'
    });

    gsap.to(themeRef.current.prismColor, {
      r: new THREE.Color(targetTheme.prismColor).r,
      g: new THREE.Color(targetTheme.prismColor).g,
      b: new THREE.Color(targetTheme.prismColor).b,
      duration: 1.6,
      ease: 'power2.out'
    });

    gsap.to(themeRef.current, {
      particleSpeed: targetTheme.particleSpeed,
      duration: 1.6,
      ease: 'power2.out'
    });
  }, [selectedPhoto]);

  // GSAP animation controlling camera FOV stretches during portal warp sequences
  useEffect(() => {
    if (warpedDimension > 0) {
      // Warp Sequence: Overview -> Inside Dimension
      warpStateRef.current = 'warping';
      
      gsap.timeline()
        .to(fovRef, {
          current: 118, // Stretch perspective to hyperspace speed look
          duration: 0.6,
          ease: 'power3.in',
        })
        .to(fovRef, {
          current: 60, // Return to normal perspective
          duration: 0.85,
          ease: 'power2.out',
          onStart: () => {
            warpStateRef.current = 'warped';
          }
        });
    } else {
      // Exit Sequence: Dimension -> Lab overview
      if (warpStateRef.current === 'idle') return;
      
      warpStateRef.current = 'returning';
      
      gsap.timeline()
        .to(fovRef, {
          current: 118,
          duration: 0.45,
          ease: 'power3.in',
        })
        .to(fovRef, {
          current: 60,
          duration: 0.8,
          ease: 'power2.out',
          onStart: () => {
            warpStateRef.current = 'idle';
          }
        });
    }
  }, [warpedDimension]);

  // DOM Event Handlers bound to the parent container div
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (selectedPhoto) return;
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || selectedPhoto) return;
    const deltaX = e.clientX - lastMouseRef.current.x;
    const deltaY = e.clientY - lastMouseRef.current.y;

    // Accumulate rotational angles based on mouse deltas
    dragRotationRef.current.y += deltaX * 0.005;
    dragRotationRef.current.x += deltaY * 0.005;

    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (selectedPhoto) return;
    // Travel along helicoid (scroll moves camera Z offset)
    scrollOffsetRef.current = Math.max(-0.2, Math.min(1.2, scrollOffsetRef.current + e.deltaY * 0.0008));
  };

  const handleBgClick = () => {
    if (selectedPhoto) {
      playZoomOutSound();
      setSelectedPhoto(null);
    }
  };

  const handleSelectPhoto = (photo: PhotoData) => {
    playClickSound();
    setSelectedPhoto(photo);
  };

  // Distant stars background representing real space
  const CosmicStarfield = ({ count = 1800 }: { count?: number }) => {
    const pointsRef = useRef<THREE.Points>(null);

    const [positions] = useMemo(() => {
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        // Distant spherical distribution shell
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 18.0 + Math.random() * 12.0;

        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i * 3 + 2] = r * Math.cos(phi);
      }
      return [pos];
    }, [count]);

    useFrame((state) => {
      if (pointsRef.current) {
        pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.004 * orbitSpeed;
        pointsRef.current.rotation.x = state.clock.getElapsedTime() * 0.001 * orbitSpeed;
      }
    });

    return (
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#ffffff"
          size={0.07}
          transparent
          opacity={0.8}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </points>
    );
  };

  // Custom inner rotation and lerps for dragging
  const RefractionPrism = () => {
    const crystalRef = useRef<THREE.Mesh>(null);
    const innerCoreRef = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
      if (crystalRef.current) {
        // Continuous slow orbit rotation
        crystalRef.current.rotation.y += delta * 0.2 * orbitSpeed;
        crystalRef.current.rotation.x += delta * 0.1 * orbitSpeed;
        
        // Soft scaling pulse
        const scaleVal = 1.0 + Math.sin(state.clock.getElapsedTime() * 1.5) * 0.05;
        crystalRef.current.scale.setScalar(scaleVal);

        // Color morphing of the glass material tint
        const mat = crystalRef.current.material as any;
        if (mat && mat.color) {
          mat.color.copy(themeRef.current.prismColor);
        }
      }
      
      if (innerCoreRef.current) {
        // Rotate inner core in reverse
        innerCoreRef.current.rotation.y -= delta * 0.4 * orbitSpeed;
        innerCoreRef.current.rotation.z += delta * 0.2 * orbitSpeed;

        // Inner core wireframe color morph
        const mat = innerCoreRef.current.material as any;
        if (mat) {
          mat.color.copy(themeRef.current.lightColor1);
        }
      }
    });

    return (
      <group position={[0, 0, 0]}>
        {/* Giant refracting prism */}
        <mesh ref={crystalRef} castShadow receiveShadow>
          <dodecahedronGeometry args={[1.2]} />
          <MeshTransmissionMaterial
            backside
            samples={6}
            thickness={1.6}
            roughness={0.06}
            chromaticAberration={refractIndex * 0.5}
            anisotropy={1.0}
            distortion={0.4}
            distortionScale={0.3}
            temporalDistortion={0.1}
            transmission={1.0}
            color="#ecf3ff"
          />
        </mesh>

        {/* Inner glowing power core */}
        <mesh ref={innerCoreRef}>
          <icosahedronGeometry args={[0.45]} />
          <meshBasicMaterial
            color="#00d2ff"
            wireframe
            transparent
            opacity={0.4}
          />
        </mesh>
      </group>
    );
  };

  // Mutate lighting color elements dynamically inside Canvas render loop
  const DynamicLights = () => {
    useFrame(() => {
      if (light1Ref.current) light1Ref.current.color.copy(themeRef.current.lightColor1);
      if (light2Ref.current) light2Ref.current.color.copy(themeRef.current.lightColor2);
      if (ambientRef.current) ambientRef.current.color.copy(themeRef.current.ambientColor);
    });

    return (
      <>
        <ambientLight ref={ambientRef} intensity={0.4} />
        <pointLight ref={light1Ref} position={[10, 10, 10]} intensity={1.5} />
        <pointLight ref={light2Ref} position={[-10, -10, -10]} intensity={1.0} />
        <directionalLight position={[0, 5, 5]} intensity={0.8} color="#ffffff" />
      </>
    );
  };

  const isWarpingActive = () => {
    return warpStateRef.current === 'warping' || warpStateRef.current === 'returning';
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60, near: 0.1, far: 50 }}
        onPointerMissed={handleBgClick}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#030308']} />
        
        {/* Dynamic Studio Lighting matching active dimension */}
        <DynamicLights />

        <Suspense fallback={null}>
          {/* Main rotating orbital system (only show in lab) */}
          {warpedDimension === 0 && (
            <>
              <RotationalGroup
                dragRotationRef={dragRotationRef}
                isDraggingRef={isDraggingRef}
                selectedPhoto={selectedPhoto}
                orbitSpeed={orbitSpeed}
                photos={photos}
                warpFactor={warpFactor}
                onSelectPhoto={handleSelectPhoto}
                themeRef={themeRef}
              />
              
              {/* Deep Space Distant Twinkling Stars */}
              <CosmicStarfield />

              {/* Realistic drifting deep space colored nebulae clouds */}
              <NebulaCloud position={[7.0, 4.0, -12.0]} color="#4d0a66" size={12.0} />
              <NebulaCloud position={[-8.0, -4.0, -14.0]} color="#0a3c66" size={14.0} />
              <NebulaCloud position={[2.0, -6.0, -10.0]} color="#660a33" size={10.0} />
            </>
          )}

          {/* Refracting central glass structure (only show in lab or as central orb inside Ocean) */}
          {(warpedDimension === 0 || warpedDimension === 4) && (
            <RefractionPrism />
          )}

          {/* Dimension 1: Cosmic Nebula */}
          {warpedDimension === 1 && (
            <CosmicNebulaDimension themeRef={themeRef} orbitSpeed={orbitSpeed} />
          )}

          {/* Dimension 2: Neon Tokyo */}
          {warpedDimension === 2 && (
            <NeonTokyoDimension themeRef={themeRef} orbitSpeed={orbitSpeed} />
          )}

          {/* Dimension 3: Sahara Dune */}
          {warpedDimension === 3 && (
            <SaharaDuneDimension themeRef={themeRef} orbitSpeed={orbitSpeed} />
          )}

          {/* Dimension 4: Ocean Abyss */}
          {warpedDimension === 4 && (
            <OceanAbyssDimension themeRef={themeRef} orbitSpeed={orbitSpeed} />
          )}

          {/* Hyperspace Speed Lines streaking past camera during transitions */}
          <HyperspaceTunnel active={isWarpingActive()} />

          {/* Camera flight and target manager */}
          <CameraRig
            selectedPhoto={selectedPhoto}
            scrollOffsetRef={scrollOffsetRef}
            warpedDimension={warpedDimension}
            fovRef={fovRef}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
