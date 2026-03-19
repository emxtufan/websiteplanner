
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, MeshTransmissionMaterial, Environment, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Fix for missing JSX.IntrinsicElements types in TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      torusKnotGeometry: any;
      icosahedronGeometry: any;
      octahedronGeometry: any;
      ambientLight: any;
      spotLight: any;
      pointLight: any;
      fog: any;
    }
  }
}

const Geometries = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
        const t = state.clock.getElapsedTime();
        // Smooth floating rotation
        groupRef.current.rotation.x = Math.cos(t * 0.1) * 0.2;
        groupRef.current.rotation.y = Math.sin(t * 0.15) * 0.2;
        groupRef.current.rotation.z = Math.sin(t * 0.1) * 0.1;
    }
  });

  const materialProps = {
    thickness: 0.5,
    roughness: 0.1,
    transmission: 1,
    ior: 1.5,
    chromaticAberration: 0.15, // High aberration for the rainbow edge effect
    backside: true,
    color: '#8b5cf6', // Violet base
    distortion: 0.4,
    distortionScale: 0.5,
    temporalDistortion: 0.2,
  };

  return (
    <group ref={groupRef}>
      {/* Main Central Shape - Complex Torus Knot */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh position={[0, 0, 0]} scale={2.2}>
          <torusKnotGeometry args={[1, 0.35, 200, 32, 2, 3]} />
          <MeshTransmissionMaterial {...materialProps} resolution={1024} samples={16} />
        </mesh>
      </Float>

      {/* Floating Particles - Stars */}
      <Sparkles 
        count={200} 
        scale={12} 
        size={2} 
        speed={0.4} 
        opacity={0.6} 
        color="#fff" 
      />
    </group>
  );
};

const Hero3D = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
        
        {/* Lighting Setup for Glass */}
        <ambientLight intensity={0.2} />
        <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} intensity={2} color="#c084fc" />
        <pointLight position={[-10, -5, -5]} intensity={4} color="#3b82f6" />
        <pointLight position={[5, 5, -5]} intensity={2} color="#ec4899" />
        
        {/* Environment for Reflections (Crucial for glass) */}
        <Environment preset="city" />
        
        <Geometries />
        
        {/* Deep Fog for depth blending */}
        <fog attach="fog" args={['#050505', 5, 25]} />
      </Canvas>
    </div>
  );
};

export default Hero3D;
