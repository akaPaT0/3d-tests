'use client';

import dynamic from 'next/dynamic';

const BlenderScene = dynamic(() => import('./BlenderScene'), { ssr: false });

export default function BlenderSceneClient() {
  return <BlenderScene />;
}
