'use client';

/**
 * CinematicCamera
 *
 * Drives a smooth dolly shot along a CatmullRomCurve3 path beside the film strip.
 * The camera ping-pongs left ↔ right, always looking at the nearest photo on the strip.
 *
 * TO SWAP WITH BLENDER GLB:
 *   1. Place your exported .glb in /public/models/camera-anim.glb
 *   2. Uncomment the BlenderCamera block below and comment out CinematicCamera default export.
 *   3. R3F will play your exact Blender keyframes in the browser.
 */

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const DURATION = 22; // seconds per one-way pass

export default function CinematicCamera() {
  const { camera } = useThree();

  const { camPath, lookPath, tmpPos, tmpLook } = useMemo(() => {
    // Camera drifts from left → right at a slightly elevated angle
    const camPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-21, 2.8, 7.5),
      new THREE.Vector3(-10, 1.5, 6.5),
      new THREE.Vector3(  0, 0.8, 6.2),
      new THREE.Vector3( 10, 1.5, 6.5),
      new THREE.Vector3( 21, 2.8, 7.5),
    ]);

    // Look-at points track the center of the strip at each camera position
    const lookPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-18, 0, 0),
      new THREE.Vector3( -8, 0, 0),
      new THREE.Vector3(  0, 0, 0),
      new THREE.Vector3(  8, 0, 0),
      new THREE.Vector3( 18, 0, 0),
    ]);

    return {
      camPath,
      lookPath,
      tmpPos:  new THREE.Vector3(),
      tmpLook: new THREE.Vector3(),
    };
  }, []);

  // Set camera to starting position immediately
  useMemo(() => {
    camPath.getPoint(0, camera.position);
    lookPath.getPoint(0, camera.position); // dummy — overridden by useFrame
    camPath.getPoint(0, camera.position);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    // Ping-pong: 0→1→0 over 2*DURATION
    const cycle = (elapsed / DURATION) % 2;
    const t = cycle < 1 ? cycle : 2 - cycle;

    camPath.getPoint(t, tmpPos);
    lookPath.getPoint(t, tmpLook);

    // Subtle vertical breathing
    tmpPos.y += Math.sin(elapsed * 0.4) * 0.12;

    // Smooth lerp so motion feels weighty
    camera.position.lerp(tmpPos, 0.018);
    camera.lookAt(tmpLook);
  });

  return null;
}

/* ─────────────────────────────────────────────
   BLENDER GLB SWAP-IN (uncomment when ready)
   ─────────────────────────────────────────────
import { useEffect, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

export function BlenderCamera() {
  const group = useRef(null);
  const { animations } = useGLTF('/models/camera-anim.glb');
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    const action = Object.values(actions)[0];
    if (action) {
      action.play();
      action.setLoop(THREE.LoopPingPong, Infinity);
    }
  }, [actions]);

  return <primitive ref={group} object={useGLTF('/models/camera-anim.glb').scene} />;
}
*/
