'use client';

import dynamic from 'next/dynamic';

const DarkroomScene = dynamic(() => import('./DarkroomScene'), { ssr: false });

export default function DarkroomSceneClient(props: React.ComponentProps<typeof DarkroomScene>) {
  return <DarkroomScene {...props} />;
}
