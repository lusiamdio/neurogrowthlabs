import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, OrbitControls } from '@react-three/drei';
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
    console.warn("DataCenter WebGL Canvas failed to initialize:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
          <div className="w-[600px] h-[600px] rounded-3xl bg-gradient-to-tr from-ai-cyan/10 via-violet-glow/10 to-transparent blur-[90px]" />
        </div>
      );
    }
    return this.props.children;
  }
}

function ServerRack({ position }: { position: [number, number, number] }) {
  const rackRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const lightsRef = useRef<THREE.Mesh[]>([]);
  
  useFrame((state) => {
    if (rackRef.current) {
      const time = state.clock.elapsedTime;
      
      // Subtly pulse the rack when hovered
      if (hovered) {
        const pulse = 1 + Math.sin(time * 8) * 0.02;
        rackRef.current.scale.setScalar(THREE.MathUtils.lerp(rackRef.current.scale.x, pulse, 0.1));
      } else {
        rackRef.current.scale.setScalar(THREE.MathUtils.lerp(rackRef.current.scale.x, 1, 0.1));
      }
      
      // Animate lights
      lightsRef.current.forEach((light) => {
        if (light) {
          const material = light.material as THREE.MeshStandardMaterial;
          // When hovered, blink more intensely and rapidly
          if (hovered) {
            material.emissiveIntensity = Math.random() > 0.2 ? 3 : 0.5;
          } else {
            // Normal blinking
            material.emissiveIntensity = Math.random() > 0.8 ? 2 : 0.5;
          }
        }
      });
    }
  });

  return (
    <group 
      ref={rackRef} 
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      {/* Rack Frame */}
      <Box args={[1, 4, 1]} position={[0, 2, 0]}>
        <meshStandardMaterial color={hovered ? "#0a0c14" : "#05060A"} metalness={0.8} roughness={0.2} />
      </Box>
      
      {/* Server Blades */}
      {[...Array(8)].map((_, i) => (
        <Box key={i} args={[0.9, 0.2, 0.9]} position={[0, 0.5 + i * 0.45, 0.05]}>
          <meshStandardMaterial color="#1A1A1A" metalness={0.9} roughness={0.1} />
        </Box>
      ))}
      
      {/* Blinking Lights */}
      {[...Array(8)].map((_, i) => (
        <Box 
          key={`light-${i}`} 
          args={[0.1, 0.05, 0.05]} 
          position={[0.3, 0.5 + i * 0.45, 0.5]}
          ref={(el) => {
            if (el) lightsRef.current[i] = el;
          }}
        >
          <meshStandardMaterial 
            color="#00e5ff" 
            emissive="#00e5ff" 
            emissiveIntensity={0.5} 
          />
        </Box>
      ))}
    </group>
  );
}

export default function DataCenter() {
  return (
    <div className="absolute inset-0 z-10">
      <CanvasErrorBoundary>
        <Canvas camera={{ position: [5, 5, 8], fov: 50 }}>
          <ambientLight intensity={0.2} />
          <directionalLight position={[5, 10, 5]} intensity={1.5} color="#00e5ff" />
          <directionalLight position={[-5, 5, -5]} intensity={1} color="#7B61FF" />
          
          {/* Server Cluster */}
          <ServerRack position={[-2, -2, 0]} />
          <ServerRack position={[0, -2, -1]} />
          <ServerRack position={[2, -2, 0]} />
          <ServerRack position={[-1, -2, -3]} />
          <ServerRack position={[1, -2, -3]} />
          
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
