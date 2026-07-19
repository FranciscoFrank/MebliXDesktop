import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

export function CadViewport() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: '#ffffff' }}>
      <Canvas
        camera={{ position: [2, 2.5, 3], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} />
        <pointLight position={[-5, -5, -5]} intensity={0.3} />
        
        {/* 1x1x1 Meter Cube centered at (0, 0.5, 0) */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          {/* Materials: [Right, Left, Top, Bottom, Front, Back] */}
          <meshStandardMaterial attach="material-0" color="#d1d5db" />
          <meshStandardMaterial attach="material-1" color="#d1d5db" />
          <meshStandardMaterial attach="material-2" color="#ef4444" /> {/* Top (Red) */}
          <meshStandardMaterial attach="material-3" color="#2563eb" /> {/* Bottom (Blue) */}
          <meshStandardMaterial attach="material-4" color="#e5e7eb" />
          <meshStandardMaterial attach="material-5" color="#e5e7eb" />
        </mesh>
        
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}

export default CadViewport;
