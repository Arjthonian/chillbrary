import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FloatingBookProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  color?: string;
  speed?: number;
  floatOffset?: number;
}

export function FloatingBook({ 
  position, 
  rotation = [0, 0, 0], 
  scale = 1, 
  color = '#00d4ff',
  speed = 1,
  floatOffset = 0
}: FloatingBookProps) {
  const groupRef = useRef<THREE.Group>(null);
  const initialY = position[1];

  // Create book geometry
  const bookGeometry = useMemo(() => {
    const coverThickness = 0.05;
    const pageThickness = 0.4;
    const width = 0.8;
    const height = 1;

    return {
      coverFront: new THREE.BoxGeometry(width, height, coverThickness),
      coverBack: new THREE.BoxGeometry(width, height, coverThickness),
      pages: new THREE.BoxGeometry(width - 0.05, height - 0.05, pageThickness),
      spine: new THREE.BoxGeometry(coverThickness, height, pageThickness + coverThickness * 2),
    };
  }, []);

  // Materials
  const coverMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: color,
      metalness: 0.3,
      roughness: 0.4,
      emissive: color,
      emissiveIntensity: 0.1,
    }), [color]);

  const pageMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: '#f5f5f0',
      metalness: 0,
      roughness: 0.8,
    }), []);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime * speed + floatOffset;
      groupRef.current.position.y = initialY + Math.sin(time) * 0.3;
      groupRef.current.rotation.y = rotation[1] + Math.sin(time * 0.5) * 0.1;
      groupRef.current.rotation.x = rotation[0] + Math.cos(time * 0.3) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Front cover */}
      <mesh geometry={bookGeometry.coverFront} material={coverMaterial} position={[0, 0, 0.225]} />
      {/* Back cover */}
      <mesh geometry={bookGeometry.coverBack} material={coverMaterial} position={[0, 0, -0.225]} />
      {/* Pages */}
      <mesh geometry={bookGeometry.pages} material={pageMaterial} position={[0.025, 0, 0]} />
      {/* Spine */}
      <mesh geometry={bookGeometry.spine} material={coverMaterial} position={[-0.4, 0, 0]} />
    </group>
  );
}
