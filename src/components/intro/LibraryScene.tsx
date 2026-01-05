import { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Float, Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';
import { FloatingBook } from './FloatingBook';
import { BookShelf } from './BookShelf';
import { GlowingPages } from './GlowingPages';
import { ParticleField } from './ParticleField';

function CameraRig({ started }: { started: boolean }) {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3(0, 0, 12));
  const lookAtTarget = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (!started) {
      // Initial camera movement - fly through
      const t = Math.min(time / 4, 1);
      const eased = 1 - Math.pow(1 - t, 3);

      camera.position.x = Math.sin(time * 0.3) * 2 * (1 - eased);
      camera.position.y = 1 + Math.cos(time * 0.2) * 0.5;
      camera.position.z = 15 - eased * 5; // Ends at z=10

      camera.lookAt(0, 0, 0);
    } else {
      // ZOOM IN EFFECT on click
      // We want a fast but smooth zoom into the center
      const zoomSpeed = 0.4;
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, -5, 0.08);

      // Add slight rotation for effect
      camera.rotation.z += 0.01;
    }
  });

  return null;
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00d4ff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.5}
        penumbra={1}
        intensity={1}
        color="#ffffff"
        castShadow
      />
    </>
  );
}

function Scene({ started }: { started: boolean }) {
  const booksData = [
    { position: [-4, 2, -2] as [number, number, number], color: '#00d4ff', scale: 1.2, floatOffset: 0 },
    { position: [3, -1, -3] as [number, number, number], color: '#a855f7', scale: 0.9, floatOffset: 1 },
    { position: [-2, -2, 1] as [number, number, number], color: '#22d3ee', scale: 1.1, floatOffset: 2 },
    { position: [4, 1, -1] as [number, number, number], color: '#8b5cf6', scale: 1, floatOffset: 3 },
    { position: [0, 3, -4] as [number, number, number], color: '#06b6d4', scale: 0.8, floatOffset: 4 },
    { position: [-3, 0, 2] as [number, number, number], color: '#c084fc', scale: 1.3, floatOffset: 5 },
  ];

  return (
    <>
      <CameraRig started={started} />
      <Lights />
      <ParticleField count={800} radius={20} />
      <GlowingPages count={40} radius={10} />

      {/* Floating Books */}
      {booksData.map((book, i) => (
        <FloatingBook
          key={i}
          position={book.position}
          rotation={[Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.5]}
          scale={book.scale}
          color={book.color}
          speed={0.5 + Math.random() * 0.5}
          floatOffset={book.floatOffset}
        />
      ))}

      {/* Bookshelves in background */}
      <BookShelf position={[-6, -3, -8]} rotation={[0, 0.3, 0]} scale={1.5} />
      <BookShelf position={[6, -3, -8]} rotation={[0, -0.3, 0]} scale={1.5} />
      <BookShelf position={[0, -4, -10]} rotation={[0, 0, 0]} scale={2} />

      {/* Floor grid effect */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
        <planeGeometry args={[50, 50, 50, 50]} />
        <meshBasicMaterial
          color="#00d4ff"
          wireframe
          transparent
          opacity={0.1}
        />
      </mesh>
    </>
  );
}

interface LibrarySceneProps {
  started: boolean;
}

export function LibraryScene({ started }: LibrarySceneProps) {
  return (
    <Canvas
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      dpr={[1, 2]}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'transparent',
      }}
    >
      <PerspectiveCamera makeDefault position={[0, 1, 15]} fov={60} />
      <fog attach="fog" args={['#0a0a1a', 5, 30]} />
      <Suspense fallback={null}>
        <Scene started={started} />
      </Suspense>
    </Canvas>
  );
}
