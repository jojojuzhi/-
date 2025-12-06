import * as THREE from 'three';

// Constants for the tree shape
const TREE_HEIGHT = 16;
const TREE_RADIUS_BOTTOM = 6;
const SPIRAL_LOOPS = 15;

/**
 * Generates positions for a conical tree shape using a spiral distribution
 */
export const generateTreePositions = (count: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const t = i / count; // Normalized 0 -> 1
    
    // Height from bottom to top
    const y = (t * TREE_HEIGHT) - (TREE_HEIGHT / 2);
    
    // Radius shrinks as we go up
    const radius = TREE_RADIUS_BOTTOM * (1 - t);
    
    // Spiral angle
    const angle = t * Math.PI * 2 * SPIRAL_LOOPS;
    
    // Add some randomness to volume
    const randomOffset = Math.random() * 0.5;
    const r = radius + randomOffset;

    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  return positions;
};

/**
 * Generates random scattered positions within a large sphere
 */
export const generateScatterPositions = (count: number, radius: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  const vector = new THREE.Vector3();
  
  for (let i = 0; i < count; i++) {
    // Random point in sphere
    const r = Math.cbrt(Math.random()) * radius; // Uniform distribution logic roughly
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    
    vector.setFromSphericalCoords(r, phi, theta);
    
    positions[i * 3] = vector.x;
    positions[i * 3 + 1] = vector.y;
    positions[i * 3 + 2] = vector.z;
  }
  return positions;
};
