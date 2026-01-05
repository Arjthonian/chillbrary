import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BookShelfProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export function BookShelf({ position, rotation = [0, 0, 0], scale = 1 }: BookShelfProps) {
  const groupRef = useRef<THREE.Group>(null);

  const shelfMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({
      color: '#1a1a2e',
      metalness: 0.5,
      roughness: 0.3,
      emissive: '#00d4ff',
      emissiveIntensity: 0.02,
    }), []);

  const bookColors = ['#00d4ff', '#a855f7', '#22d3ee', '#8b5cf6', '#06b6d4'];

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      groupRef.current.rotation.y = rotation[1] + Math.sin(time * 0.2) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Shelf structure */}
      <mesh material={shelfMaterial}>
        <boxGeometry args={[4, 0.1, 0.8]} />
      </mesh>
      
      {/* Side panels */}
      <mesh material={shelfMaterial} position={[-2, 0.5, 0]}>
        <boxGeometry args={[0.1, 1, 0.8]} />
      </mesh>
      <mesh material={shelfMaterial} position={[2, 0.5, 0]}>
        <boxGeometry args={[0.1, 1, 0.8]} />
      </mesh>

      {/* Books on shelf */}
      {bookColors.map((color, i) => (
        <mesh key={i} position={[-1.5 + i * 0.7, 0.45, 0]}>
          <boxGeometry args={[0.15, 0.8 + Math.random() * 0.2, 0.5]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={0.15}
            metalness={0.3}
            roughness={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}
