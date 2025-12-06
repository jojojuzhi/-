import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { generateScatterPositions, generateTreePositions } from '../utils/math';
import { TreeState } from '../types';

// Custom Shader Material for the Foliage
// Handles the morphing logic on the GPU for high performance with thousands of particles
const foliageVertexShader = `
  uniform float uTime;
  uniform float uProgress; // 0.0 (Scattered) -> 1.0 (Tree)
  uniform float uSize;

  attribute vec3 aScatterPos;
  attribute vec3 aTreePos;
  attribute float aRandom;

  varying float vAlpha;
  varying vec3 vColor;

  // Cubic Bezier ease-in-out approximation
  float easeInOutCubic(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  void main() {
    float t = easeInOutCubic(uProgress);
    
    // Mix positions
    vec3 pos = mix(aScatterPos, aTreePos, t);
    
    // Add "breathing" / floating effect
    // Chaos when scattered, rhythmic when tree
    float breathFreq = mix(0.5, 2.0, t); 
    float breathAmp = mix(0.2, 0.05, t);
    
    pos.x += sin(uTime * breathFreq + aRandom * 10.0) * breathAmp;
    pos.y += cos(uTime * breathFreq + aRandom * 10.0) * breathAmp;
    pos.z += sin(uTime * breathFreq * 0.5 + aRandom * 10.0) * breathAmp;

    vec4 mvPosition = viewMatrix * modelMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuation
    gl_PointSize = uSize * (300.0 / -mvPosition.z);
    
    // Sparkle effect
    float sparkle = sin(uTime * 3.0 + aRandom * 20.0);
    vAlpha = mix(0.6, 1.0, sparkle * 0.5 + 0.5);
  }
`;

const foliageFragmentShader = `
  varying float vAlpha;
  
  void main() {
    // Soft circular particle
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    
    // Glow gradient: Gold center, Emerald edge
    vec3 gold = vec3(1.0, 0.84, 0.0);
    vec3 emerald = vec3(0.0, 0.4, 0.2);
    
    // Inner core is brighter
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 1.5);
    
    vec3 finalColor = mix(emerald, gold, glow * 0.5);
    
    // Boost brightness for Bloom effect
    gl_FragColor = vec4(finalColor * 2.5, vAlpha * glow);
  }
`;

interface FoliageLayerProps {
  count?: number;
  state: TreeState;
}

export const FoliageLayer: React.FC<FoliageLayerProps> = ({ count = 15000, state }) => {
  const meshRef = useRef<THREE.Points>(null);
  
  // Initialize Geometry Data
  const { scatterPos, treePos, randoms } = useMemo(() => {
    return {
      scatterPos: generateScatterPositions(count, 25),
      treePos: generateTreePositions(count),
      randoms: new Float32Array(Array.from({ length: count }, () => Math.random())),
    };
  }, [count]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uSize: { value: 0.15 },
  }), []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Smoothly interpolate progress
      const targetProgress = state === TreeState.TREE_SHAPE ? 0 : 1; // Wait, let's check logic. 
      // Requirement: TREE_SHAPE is aggregated.
      // Shader logic: mix(aScatter, aTree, t). 
      // If t=0 -> Scatter. If t=1 -> Tree.
      const target = state === TreeState.TREE_SHAPE ? 1.0 : 0.0;
      
      material.uniforms.uProgress.value = THREE.MathUtils.lerp(
        material.uniforms.uProgress.value,
        target,
        delta * 2.0 // Animation speed
      );
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position" // Use scatter as base position so bounding box is correct initially
          count={count}
          array={scatterPos}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={count}
          array={scatterPos}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePos"
          count={count}
          array={treePos}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={count}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={foliageVertexShader}
        fragmentShader={foliageFragmentShader}
        uniforms={uniforms}
        transparent={true}
      />
    </points>
  );
};
