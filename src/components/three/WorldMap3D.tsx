import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function GlobeWithNodes() {
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const nodesRef = useRef<THREE.Points>(null);
  const streamsRef = useRef<THREE.LineSegments>(null);
  
  // Track mouse globally since canvas has pointer-events-none
  const mouse = useRef({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Generate random nodes on a sphere and data streams between them
  const { positions, linePositions } = useMemo(() => {
    const nodeCount = 150;
    const radius = 2.5;
    const pos = new Float32Array(nodeCount * 3);
    const pts = [];
    
    for (let i = 0; i < nodeCount; i++) {
      // Fibonacci sphere distribution for even spacing
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;
      
      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);
      
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      pts.push(new THREE.Vector3(x, y, z));
    }

    // Generate lines between close nodes (data streams)
    const lines = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (pts[i].distanceTo(pts[j]) < 1.5) {
          lines.push(pts[i].x, pts[i].y, pts[i].z);
          lines.push(pts[j].x, pts[j].y, pts[j].z);
        }
      }
    }

    return { 
      positions: pos, 
      linePositions: new Float32Array(lines) 
    };
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Mouse interaction from global listener
    const mouseX = mouse.current.x;
    const mouseY = mouse.current.y;

    // Dynamic lighting follows mouse
    if (lightRef.current) {
      // Smoothly interpolate light position towards mouse with a slight offset
      lightRef.current.position.x = THREE.MathUtils.lerp(lightRef.current.position.x, mouseX * 6, 0.1);
      lightRef.current.position.y = THREE.MathUtils.lerp(lightRef.current.position.y, mouseY * 6, 0.1);
    }

    if (groupRef.current) {
      // Base rotation + shift direction based on cursor (parallax/tilt effect)
      const targetRotationX = -mouseY * 0.3;
      const targetRotationY = t * 0.05 + mouseX * 0.5;
      
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 0.05);
    }

    if (nodesRef.current) {
      // Nodes react to cursor by pulsing and scaling
      const scale = 1 + Math.sin(t * 3) * 0.05 + (Math.abs(mouseX) + Math.abs(mouseY)) * 0.15;
      nodesRef.current.scale.setScalar(scale);
      
      // Subtly pulse the opacity and size of the nodes
      const material = nodesRef.current.material as THREE.PointsMaterial;
      material.opacity = 0.7 + Math.sin(t * 4) * 0.2;
      material.size = 0.06 + Math.sin(t * 5) * 0.01;
    }
    
    if (streamsRef.current) {
      // Data streams shift/rotate slightly based on mouse to create depth
      streamsRef.current.rotation.y = mouseX * 0.1;
      streamsRef.current.rotation.x = -mouseY * 0.1;
      // Pulse opacity
      const material = streamsRef.current.material as THREE.LineBasicMaterial;
      material.opacity = 0.15 + Math.sin(t * 2) * 0.05 + (Math.abs(mouseX) * 0.1);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Dynamic Point Light that follows cursor */}
      <pointLight ref={lightRef} distance={15} intensity={4} color="#00e5ff" position={[0, 0, 3]} />
      
      {/* Base Globe */}
      <Sphere args={[2.45, 64, 64]}>
        <meshStandardMaterial color="#00e5ff" wireframe transparent opacity={0.08} />
      </Sphere>

      {/* AI Nodes */}
      <points ref={nodesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.06} color="#7B61FF" transparent opacity={0.9} sizeAttenuation />
      </points>

      {/* Data Streams */}
      <lineSegments ref={streamsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={linePositions.length / 3}
            array={linePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#00e5ff" transparent opacity={0.15} />
      </lineSegments>
    </group>
  );
}

class CanvasErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.warn("WebGL Canvas failed to initialize:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-ai-cyan/20 via-violet-glow/15 to-transparent blur-[80px] animate-pulse-slow" />
          <div className="w-[300px] h-[300px] rounded-full border border-ai-cyan/20 animate-spin" style={{ animationDuration: '30s' }} />
        </div>
      );
    }
    return this.props.children;
  }
}

export default function WorldMap3D() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <CanvasErrorBoundary>
        <Canvas camera={{ position: [0, 0, 6] }}>
          <ambientLight intensity={0.2} />
          <directionalLight position={[3, 5, 2]} intensity={1} color="#7B61FF" />
          <GlobeWithNodes />
          {/* Disabled autoRotate/pan so custom mouse rotation takes precedence */}
          <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
