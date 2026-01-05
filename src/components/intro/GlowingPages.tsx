import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GlowingPagesProps {
  count?: number;
  radius?: number;
}

export function GlowingPages({ count = 30, radius = 8 }: GlowingPagesProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  const pages = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * radius * 2,
        (Math.random() - 0.5) * radius,
        (Math.random() - 0.5) * radius * 2,
      ] as [number, number, number],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      ] as [number, number, number],
      scale: 0.3 + Math.random() * 0.5,
      speed: 0.2 + Math.random() * 0.5,
      offset: Math.random() * Math.PI * 2,
    }));
  }, [count, radius]);

  const pageMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({
      color: '#ffffff',
      emissive: '#00d4ff',
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    }), []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {pages.map((page, i) => (
        <FloatingPage 
          key={i} 
          {...page} 
          material={pageMaterial}
        />
      ))}
    </group>
  );
}

interface FloatingPageProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  speed: number;
  offset: number;
  material: THREE.Material;
}

function FloatingPage({ position, rotation, scale, speed, offset, material }: FloatingPageProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialPos = position;

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime * speed + offset;
      meshRef.current.position.y = initialPos[1] + Math.sin(time) * 0.5;
      meshRef.current.rotation.x = rotation[0] + time * 0.2;
      meshRef.current.rotation.z = rotation[2] + Math.cos(time * 0.5) * 0.3;
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      position={position} 
      rotation={rotation} 
      scale={scale}
      material={material}
    >
      <planeGeometry args={[1.2, 1.6]} />
    </mesh>
  );
}
