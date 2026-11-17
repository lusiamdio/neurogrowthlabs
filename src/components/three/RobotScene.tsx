import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Torus, Environment, Lightformer, Float } from '@react-three/drei';
import * as THREE from 'three';

class CanvasErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.warn('RobotScene WebGL Canvas fallback active:', error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
          <div className="w-[320px] h-[320px] rounded-full bg-gradient-to-tr from-ai-cyan/20 via-violet-glow/15 to-transparent blur-[70px]" />
        </div>
      );
    }
    return this.props.children;
  }
}

function AbstractRobot() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={2}>
        {/* Head */}
        <Box args={[0.8, 1, 0.8]} position={[0, 1.2, 0]}>
          <meshStandardMaterial color="#05060A" metalness={0.9} roughness={0.1} />
        </Box>
        {/* Glowing Eye Visor */}
        <Box args={[0.85, 0.15, 0.85]} position={[0, 1.3, 0]}>
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={2} />
        </Box>
        {/* Torso */}
        <Box args={[1.2, 1.8, 0.8]} position={[0, -0.4, 0]}>
          <meshStandardMaterial color="#1A1A1A" metalness={0.8} roughness={0.2} />
        </Box>
        {/* Core Glow */}
        <Box args={[0.4, 0.4, 0.9]} position={[0, -0.2, 0]}>
          <meshStandardMaterial color="#7B61FF" emissive="#7B61FF" emissiveIntensity={3} />
        </Box>

        {/* Holographic Rings */}
        <Torus args={[2, 0.01, 16, 100]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#7B61FF" emissive="#7B61FF" emissiveIntensity={1} wireframe />
        </Torus>
        <Torus args={[2.5, 0.01, 16, 100]} rotation={[Math.PI / 3, Math.PI / 4, 0]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={1} wireframe />
        </Torus>
      </Float>
    </group>
  );
}

export default function RobotScene() {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      <CanvasErrorBoundary>
        <Canvas camera={{ position: [0, 0, 6] }} dpr={[1, 1.5]}>
          <ambientLight intensity={0.25} />
          <directionalLight position={[5, 5, 5]} intensity={2} color="#00e5ff" />
          <directionalLight position={[-5, 5, -5]} intensity={2} color="#7B61FF" />
          <AbstractRobot />
          <Environment resolution={256}>
            <Lightformer form="rect" intensity={2} position={[0, 5, 3]} scale={[8, 4, 1]} color="#00e5ff" />
            <Lightformer form="circle" intensity={1.5} position={[-5, 2, -2]} scale={4} color="#7B61FF" />
          </Environment>
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
