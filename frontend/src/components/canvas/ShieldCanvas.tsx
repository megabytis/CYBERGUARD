import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// 3D Shield Mesh Component
function ShieldMesh() {
  const meshRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  // Smooth rotation animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * 0.8;
      ringRef.current.rotation.x += delta * 0.2;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.6;
    }
  });

  // Create faceted shield geometry
  const shape = new THREE.Shape();
  shape.moveTo(0, 1.4);
  shape.lineTo(1.1, 0.9);
  shape.lineTo(1.0, -0.3);
  shape.lineTo(0, -1.5);
  shape.lineTo(-1.0, -0.3);
  shape.lineTo(-1.1, 0.9);
  shape.closePath();

  const extrudeSettings = {
    steps: 1,
    depth: 0.25,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 4,
  };

  return (
    <group ref={meshRef}>
      {/* Outer Shield Geometry */}
      <mesh position={[0, 0, -0.1]}>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshPhysicalMaterial
          color="#0D1217"
          roughness={0.2}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={0.9}
        />
      </mesh>

      {/* Cyber Cyan Emblem Inset */}
      <mesh ref={coreRef} position={[0, 0, 0.18]}>
        <octahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial
          color="#00D9FF"
          emissive="#00D9FF"
          emissiveIntensity={0.8}
          wireframe
        />
      </mesh>

      {/* Outer Rotating Scan Ring */}
      <mesh ref={ringRef} position={[0, 0, 0]}>
        <torusGeometry args={[1.9, 0.02, 16, 100]} />
        <meshBasicMaterial color="#00FF9D" wireframe />
      </mesh>
    </group>
  );
}

// Graceful 2D SVG/CSS Fallback for WebGL failure or reduced motion
export function ShieldFallback({ className = '' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Glowing orbital ring */}
      <div className="absolute w-64 h-64 rounded-full border border-protected/30 animate-spin-slow pointer-events-none" />
      <div className="absolute w-72 h-72 rounded-full border border-information/20 border-dashed animate-pulse-slow pointer-events-none" />

      {/* Stylized Cyber Shield SVG */}
      <div className="relative z-10 w-44 h-44 rounded-2xl p-6 glass-panel-elevated border-information/40 shadow-info-glow flex items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          className="w-24 h-24 text-information drop-shadow-[0_0_15px_rgba(0,217,255,0.6)]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" stroke="#00FF9D" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}

// Main Canvas wrapper with error boundary and context detection
export const ShieldCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    // Check reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);

    // Test WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
      }
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL || prefersReducedMotion) {
    return <ShieldFallback className={className} />;
  }

  return (
    <div className={`relative w-full h-[360px] sm:h-[420px] flex items-center justify-center ${className}`}>
      <Suspense fallback={<ShieldFallback className="w-full h-full" />}>
        <Canvas
          camera={{ position: [0, 0, 4.5], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          onError={() => setHasWebGL(false)}
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} color="#F5F7FA" />
          <pointLight position={[-4, -2, -2]} intensity={1.2} color="#00D9FF" />
          <pointLight position={[3, -3, 2]} intensity={1.0} color="#00FF9D" />

          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.6}>
            <ShieldMesh />
          </Float>
        </Canvas>
      </Suspense>
    </div>
  );
};
