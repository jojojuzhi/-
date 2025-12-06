import React, { useRef } from 'react';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { TreeState } from '../types';
import { FoliageLayer } from './FoliageLayer';
import { OrnamentLayer } from './OrnamentLayer';
import { EnvironmentSetup } from './EnvironmentSetup';
import * as THREE from 'three';

interface ExperienceProps {
  treeState: TreeState;
}

export const Experience: React.FC<ExperienceProps> = ({ treeState }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    // Slow rotation of the whole group for presentation
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 25]} fov={50} />
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={10}
        maxDistance={40}
        dampingFactor={0.05}
      />

      <EnvironmentSetup />

      <group ref={groupRef} position={[0, -5, 0]}>
        {/* 1. Foliage: The body of the tree (Points) */}
        <FoliageLayer state={treeState} count={12000} />

        {/* 2. Gold Baubles (Spheres) */}
        <OrnamentLayer 
          type="sphere" 
          count={300} 
          state={treeState} 
          color="#FFD700" 
          scale={0.4}
          roughness={0.1}
          metalness={1.0}
        />

        {/* 3. Red/Emerald Gift Boxes (Boxes) */}
        <OrnamentLayer 
          type="box" 
          count={100} 
          state={treeState} 
          color="#8B0000" 
          scale={0.6} 
          roughness={0.4}
          metalness={0.6}
        />
        
        {/* 4. Tiny Lights (Small spheres, high emission) */}
        <OrnamentLayer 
           type="sphere"
           count={500}
           state={treeState}
           color="#FFFFE0" // Warm white
           scale={0.1}
           roughness={1}
           metalness={0}
        />
      </group>
    </>
  );
};
