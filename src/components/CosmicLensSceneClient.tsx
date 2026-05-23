'use client';

import dynamic from 'next/dynamic';

// Dynamic import of the main R3F 3D Canvas scene to prevent SSR errors in Next.js
const CosmicLensScene = dynamic(() => import('./CosmicLensScene'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#030308',
      color: '#00d2ff',
      fontFamily: 'Consolas, "Fira Code", Monaco, monospace',
      fontSize: '0.9rem',
      letterSpacing: '0.15em'
    }}>
      CONNECTING TO QUANTUM OPTICS CHANNELS...
    </div>
  )
});

export default CosmicLensScene;
