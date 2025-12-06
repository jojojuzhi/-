import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { generateScatterPositions, generateTreePositions } from '../utils/math';
import { TreeState } from '../types';

interface OrnamentLayerProps {
  type: 'sphere' | 'box';
  count: number;
  color: string;
  state: TreeState;
  scale?: number;
  roughness?: number;
  metalness?: number;
}

export const OrnamentLayer: React.FC<OrnamentLayerProps> = ({ 
  type, 
  count, 
  color, 
  state,
  scale = 0.5,
  roughness = 0.1,
  metalness = 1.0
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Data generation
  const { scatterPos, treePos, rotationSpeeds, randomScales } = useMemo(() => {
    // We want the tree positions to be slightly different for ornaments than foliage
    // to simulate them hanging *on* the tree, not just being the tree.
    // However, for simplicity and visual coherence, we use the same spiral algorithm but offset.
    const tPos = generateTreePositions(count);
    
    // Add random jitter to tree positions so ornaments aren't perfectly aligned
    for(let i = 0; i < count; i++) {
      tPos[i*3] += (Math.random() - 0.5) * 1.5; // X
      tPos[i*3+1] += (Math.random() - 0.5) * 1.0; // Y
      tPos[i*3+2] += (Math.random() - 0.5) * 1.5; // Z
    }

    return {
      scatterPos: generateScatterPositions(count, 30), // Scatter wider than foliage
      treePos: tPos,
      rotationSpeeds: Array.from({ length: count }, () => ({
        x: Math.random() * 0.02,
        y: Math.random() * 0.02,
        z: Math.random() * 0.02,
      })),
      randomScales: Array.from({ length: count }, () => 0.5 + Math.random() * 0.5),
    };
  }, [count]);

  // Temporary objects for matrix calculation
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const currentPositions = useRef(new Float32Array(count * 3)); // Store current interpolated positions
  
  // Initialize positions
  useLayoutEffect(() => {
    if (meshRef.current) {
      for (let i = 0; i < count; i++) {
        currentPositions.current[i*3] = scatterPos[i*3];
        currentPositions.current[i*3+1] = scatterPos[i*3+1];
        currentPositions.current[i*3+2] = scatterPos[i*3+2];
      }
    }
  }, [count, scatterPos]);

  useFrame((stateCtx, delta) => {
    if (!meshRef.current) return;

    const targetIsTree = state === TreeState.TREE_SHAPE;
    const lerpFactor = delta * 2.0;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      
      // Determine target for this frame
      const targetX = targetIsTree ? treePos[idx] : scatterPos[idx];
      const targetY = targetIsTree ? treePos[idx+1] : scatterPos[idx+1];
      const targetZ = targetIsTree ? treePos[idx+2] : scatterPos[idx+2];

      // Interpolate current position towards target
      currentPositions.current[idx] = THREE.MathUtils.lerp(currentPositions.current[idx], targetX, lerpFactor);
      currentPositions.current[idx+1] = THREE.MathUtils.lerp(currentPositions.current[idx+1], targetY, lerpFactor);
      currentPositions.current[idx+2] = THREE.MathUtils.lerp(currentPositions.current[idx+2], targetZ, lerpFactor);

      // Set position
      dummy.position.set(
        currentPositions.current[idx],
        currentPositions.current[idx+1],
        currentPositions.current[idx+2]
      );

      // Rotate constantly for shine
      dummy.rotation.x += rotationSpeeds[i].x;
      dummy.rotation.y += rotationSpeeds[i].y;
      dummy.rotation.z += rotationSpeeds[i].z;

      // Scale
      const s = scale * randomScales[i];
      dummy.scale.set(s, s, s);

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      {type === 'sphere' ? (
        <sphereGeometry args={[1, 32, 32]} />
      ) : (
        <boxGeometry args={[1, 1, 1]} />
      )}
      <meshStandardMaterial 
        color={color} 
        roughness={roughness} 
        metalness={metalness}
        emissive={color}
        emissiveIntensity={0.2} 
      />
    </instancedMesh>
  );
};
