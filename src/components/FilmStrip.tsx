'use client';

import PhotoPlane from './PhotoPlane';

// Curated picsum seeds that tend toward warm, romantic tones
const PHOTOS: {
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
}[] = [
  {
    url: 'https://picsum.photos/seed/romance1/600/900',
    position: [-17.5, 0.15, 0],
    rotation: [0, 0.04, 0.015],
  },
  {
    url: 'https://picsum.photos/seed/wedding2/600/900',
    position: [-12.5, -0.1, 0.3],
    rotation: [0, -0.03, -0.01],
  },
  {
    url: 'https://picsum.photos/seed/moments3/600/900',
    position: [-7.5, 0.2, -0.2],
    rotation: [0, 0.05, 0.02],
  },
  {
    url: 'https://picsum.photos/seed/forever4/600/900',
    position: [-2.5, -0.05, 0.15],
    rotation: [0, -0.02, -0.015],
  },
  {
    url: 'https://picsum.photos/seed/love5/600/900',
    position: [2.5, 0.1, -0.1],
    rotation: [0, 0.03, 0.01],
  },
  {
    url: 'https://picsum.photos/seed/golden6/600/900',
    position: [7.5, -0.2, 0.25],
    rotation: [0, -0.04, -0.02],
  },
  {
    url: 'https://picsum.photos/seed/bloom7/600/900',
    position: [12.5, 0.05, -0.15],
    rotation: [0, 0.02, 0.015],
  },
  {
    url: 'https://picsum.photos/seed/timeless8/600/900',
    position: [17.5, -0.1, 0.1],
    rotation: [0, -0.05, -0.01],
  },
];

export default function FilmStrip() {
  return (
    <group>
      {PHOTOS.map((photo, i) => (
        <PhotoPlane
          key={i}
          url={photo.url}
          position={photo.position}
          rotation={photo.rotation}
        />
      ))}
    </group>
  );
}
