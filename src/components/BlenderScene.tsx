'use client';

import { useEffect, useLayoutEffect, useRef, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Environment, useTexture } from '@react-three/drei';
import { scrollStore } from '@/lib/scrollStore';
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

const GLB_PATH = '/uploads_files_5226810_camera.glb';

// Preload the GLB for faster initial render
useGLTF.preload(GLB_PATH);

/*
 * ─── Camera Setup ────────────────────────────────────────────────────
 * The GLB camera has ZERO rotation (identity), meaning in glTF space
 * it looks along -Z from its position. The target is directly in front
 * along that axis.
 */
function CameraSetup() {
  const { camera } = useThree();

  useLayoutEffect(() => {
    // Initial camera setup (target and FOV)
    camera.position.set(0.035, -0.019, 8.183);
    camera.lookAt(0.035, -0.019, 7.097);
    (camera as THREE.PerspectiveCamera).fov = 30.2;
    camera.updateProjectionMatrix();
  }, [camera]);

  useFrame(() => {
    // Zoom from inside the viewfinder (8.183) out to the full view (12.0)
    const startZ = 8.183;
    const endZ = 12.0;
    
    // Smoothly interpolate Z based on scroll progress
    camera.position.z = startZ + (endZ - startZ) * scrollStore.progress;
  });

  return null;
}

/* ─── Fix transparency on a single material ───────────────────────── */
function fixTransparency(mat: THREE.Material) {
  const m = mat as THREE.MeshStandardMaterial & THREE.MeshPhysicalMaterial;

  const needsTransparency =
    m.opacity < 1 ||
    m.transparent === true ||
    !!m.alphaMap ||
    (m.transmission !== undefined && m.transmission > 0);

  if (needsTransparency) {
    m.transparent  = true;
    m.depthWrite   = false;          // prevents z-fighting / occlusion bugs
    m.alphaTest    = 0;              // disable cutout so smooth blending works
    m.side         = THREE.DoubleSide; // avoids backface culling artifacts
    m.needsUpdate  = true;
  }

  // MeshPhysicalMaterial: transmission (glass / refraction)
  if (m.transmission !== undefined && m.transmission > 0) {
    m.transparent = true;
    m.depthWrite  = false;
    m.needsUpdate = true;
  }
}

/* ─── GLB model + scroll-driven animations ────────────────────────── */
function BlenderModel() {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations, materials } = useGLTF(GLB_PATH);
  const { actions } = useAnimations(animations, groupRef);

  // Load the new viewfinder image
  const screenTexture = useTexture('/bg_temp.jpg');

  // Apply texture and fix transparency once
  useLayoutEffect(() => {
    // Make sure texture is oriented correctly for GLTF
    screenTexture.flipY = false;
    if (screenTexture.channel === undefined) {
      screenTexture.channel = 0;
    }
    if (!screenTexture.matrix) {
      screenTexture.matrix = new THREE.Matrix3();
    }

    // Apply texture to screen material directly
    const screenMat = materials['Screen_2.001'];
    if (screenMat && 'map' in screenMat) {
      console.log('[BlenderScene] Swapping texture on:', screenMat.name);
      const standardMat = screenMat as THREE.MeshStandardMaterial;
      standardMat.map = screenTexture;
      if (standardMat.color) {
        standardMat.color.set('#ffffff'); // Remove any base tint
      }
      
      // Disable transmission so the image is opaque and visible
      const physicalMat = screenMat as any;
      if (physicalMat.transmission !== undefined) {
        physicalMat.transmission = 0;
      }
      
      // Make it glow like an LCD screen
      if (physicalMat.emissive !== undefined) {
        physicalMat.emissive = screenTexture;
        physicalMat.emissiveIntensity = 0.95;
      }
      
      standardMat.needsUpdate = true;
    }

    const textureKeys = [
      'map', 'roughnessMap', 'metalnessMap', 'normalMap', 'emissiveMap',
      'aoMap', 'alphaMap', 'lightMap', 'bumpMap', 'displacementMap',
      'clearcoatMap', 'clearcoatNormalMap', 'clearcoatRoughnessMap',
      'transmissionMap', 'thicknessMap', 'sheenColorMap', 'sheenRoughnessMap',
      'iridescenceMap', 'iridescenceThicknessMap', 'anisotropyMap'
    ] as const;

    // Traverse the scene to fix transparency and auto-heal missing texture properties
    scene.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      
      const checkAndFixMaterial = (mat: THREE.Material) => {
        // Fix transparency settings
        fixTransparency(mat);

        // Auto-heal texture maps that might lack matrix or channel
        const m = mat as any;
        textureKeys.forEach((key) => {
          const tex = m[key];
          if (tex && typeof tex === 'object' && tex.isTexture) {
            if (!tex.matrix) {
              console.warn(`[BlenderScene] Texture on material "${mat.name}", property "${key}" is missing matrix! Auto-fixing...`);
              tex.matrix = new THREE.Matrix3();
            }
            if (tex.channel === undefined) {
              tex.channel = 0;
            }
          }
        });
      };

      if (Array.isArray(obj.material)) {
        obj.material.forEach(checkAndFixMaterial);
      } else {
        checkAndFixMaterial(obj.material);
      }
    });
  }, [scene, materials, screenTexture]);

  useEffect(() => {
    // ── Initialize animations, but pause them (we control time) ──────
    Object.entries(actions).forEach(([, action]) => {
      if (!action) return;
      action.play();
      action.paused = true; // take control away from Three's mixer
    });
  }, [actions]);

  // ── Drive animation time based on scroll progress ──────────────────
  useFrame(() => {
    if (!animations.length) return;

    // Find the longest animation to use as our total duration
    const maxDuration = Math.max(...animations.map((clip) => clip.duration));

    // Map scroll progress (0-1) to animation time (0-maxDuration)
    const targetTime = scrollStore.progress * maxDuration;

    // Apply exact time to all animation clips
    Object.entries(actions).forEach(([, action]) => {
      if (!action) return;
      action.time = targetTime;
    });
  });

  return <primitive ref={groupRef} object={scene} />;
}

/* ─── Main scene ───────────────────────────────────────────────────── */
export default function BlenderScene() {
  return (
    <Canvas
      camera={{ position: [0.035, -0.019, 12.0], fov: 30.2, near: 0.01, far: 1000 }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: false,               // solid bg — prevents double-composite issues
        premultipliedAlpha: false,  // matches Blender's straight-alpha export
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0, // Reduced from 1.3 to prevent blowout
      }}
    >
      <color attach="background" args={['#0d0b08']} />

      <Suspense fallback={null}>
        {/* Camera: GLB position + corrected -Z lookAt */}
        <CameraSetup />

        {/* Lighting — decreased intensity for darker mood */}
        <ambientLight color="#2a1f14" intensity={0.2} />
        <pointLight position={[2, 4, 9]} color="#ffd4a0" intensity={2} distance={30} decay={2} />
        <pointLight position={[-4, -2, 7]} color="#4a6fa5" intensity={1} distance={20} decay={2} />
        <pointLight position={[0, -3, 6]} color="#c4838a" intensity={0.5} distance={15} decay={2} />

        {/* Environment: For realistic reflections on the camera body */}
        <Environment preset="sunset" />

        {/* The Blender scene + all animations */}
        <BlenderModel />

        {/* Post-processing: Removed Bloom to keep the camera sharp and prevent blown-out whites */}
        <EffectComposer>
          <Vignette offset={0.28} darkness={0.72} eskil={false} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
