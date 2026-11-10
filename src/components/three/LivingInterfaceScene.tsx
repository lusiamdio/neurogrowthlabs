import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

// Procedural high-resolution radial glow particle texture (zero 404 dependencies)
function createGlowParticleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    // Multi-stop falloff: intense white-cyan core -> mint -> luminous violet halo -> transparent
    gradient.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    gradient.addColorStop(0.15, 'rgba(167, 243, 208, 0.95)'); // soft mint core
    gradient.addColorStop(0.35, 'rgba(0, 255, 194, 0.7)');   // electric mint
    gradient.addColorStop(0.65, 'rgba(147, 51, 234, 0.35)');  // vivid violet
    gradient.addColorStop(0.85, 'rgba(123, 97, 255, 0.12)'); // outer violet
    gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export type MorphPhase = 'orb' | 'galaxy' | 'brain';

interface LivingInterfaceSceneProps {
  currentPhase?: MorphPhase;
  onPhaseChange?: (phase: MorphPhase) => void;
  autoCycle?: boolean;
  interactionMode?: 'attract' | 'repel' | 'vortex';
  onMetricsUpdate?: (metrics: {
    coherence: number;
    firingRate: number;
    activeNodes: number;
    phaseProgress: number;
  }) => void;
}

export default function LivingInterfaceScene({
  currentPhase: externalPhase,
  onPhaseChange,
  autoCycle = true,
  interactionMode = 'attract',
  onMetricsUpdate,
}: LivingInterfaceSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track state for interaction and phases
  const stateRef = useRef({
    phase: externalPhase || 'orb',
    targetPhaseProgress: 0, // 0 = orb, 1 = galaxy, 2 = brain
    currentPhaseProgress: 0,
    autoCycle,
    interactionMode,
    mouse: { x: 0, y: 0, vx: 0, vy: 0, px: 0, py: 0, isHovering: false },
    mouse3D: new THREE.Vector3(0, 0, 0),
    shockwaves: [] as { x: number; y: number; z: number; startTime: number; maxRadius: number }[],
    clickCount: 0,
  });

  // Keep ref updated with incoming props
  useEffect(() => {
    if (externalPhase) {
      stateRef.current.phase = externalPhase;
      if (externalPhase === 'orb') stateRef.current.targetPhaseProgress = 0;
      else if (externalPhase === 'galaxy') stateRef.current.targetPhaseProgress = 1;
      else if (externalPhase === 'brain') stateRef.current.targetPhaseProgress = 2;
    }
  }, [externalPhase]);

  useEffect(() => {
    stateRef.current.autoCycle = autoCycle;
  }, [autoCycle]);

  useEffect(() => {
    stateRef.current.interactionMode = interactionMode;
  }, [interactionMode]);

  // Trigger synaptic shockwave from outside or click
  const triggerImpulse = useCallback((x = 0, y = 0, z = 0) => {
    const now = performance.now() * 0.001;
    stateRef.current.shockwaves.push({
      x,
      y,
      z,
      startTime: now,
      maxRadius: 6.5,
    });
    // Keep max 5 active shockwaves
    if (stateRef.current.shockwaves.length > 5) {
      stateRef.current.shockwaves.shift();
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect software WebGL per Three.js skill
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.08);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.2);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // ==========================================
    // PROCEDURAL PARTICLE GEOMETRY GENERATION
    // (Orb -> Spiral Galaxy -> Thinking Brain)
    // ==========================================
    const PARTICLE_COUNT = isSoftwareGl ? 3500 : 7200;

    const orbPositions = new Float32Array(PARTICLE_COUNT * 3);
    const galaxyPositions = new Float32Array(PARTICLE_COUNT * 3);
    const brainPositions = new Float32Array(PARTICLE_COUNT * 3);
    const currentPositions = new Float32Array(PARTICLE_COUNT * 3);
    const particleColors = new Float32Array(PARTICLE_COUNT * 3);
    const baseColors = new Float32Array(PARTICLE_COUNT * 3);
    const particleSizes = new Float32Array(PARTICLE_COUNT);
    const particleSpeeds = new Float32Array(PARTICLE_COUNT);
    const phaseOffsets = new Float32Array(PARTICLE_COUNT);

    // Mint palette: #00FFC2, #2EF2B3, #5EEAD4
    // Violet palette: #7B61FF, #A855F7, #C084FC, #E879F9
    const mintColor = new THREE.Color(0x00FFC2);
    const brightMint = new THREE.Color(0x5EEAD4);
    const violetColor = new THREE.Color(0x7B61FF);
    const vividViolet = new THREE.Color(0xA855F7);
    const magentaGlow = new THREE.Color(0xE879F9);

    // 1. GENERATE ORB (Breathing Quantum Sphere)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Fibonacci sphere distribution for uniform spherical coverage + radial depth
      const u = i / PARTICLE_COUNT;
      const phi = Math.acos(1 - 2 * u);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      // Mantle vs Core distribution (70% shell, 30% volumetric interior)
      const isInner = Math.random() < 0.3;
      const baseRadius = isInner ? 0.4 + Math.random() * 1.5 : 2.0 + Math.random() * 0.7;

      // Subtle initial spherical harmonic undulation
      const noise = 1 + 0.12 * Math.sin(theta * 3) * Math.cos(phi * 4);
      const r = baseRadius * noise;

      orbPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      orbPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      orbPositions[i * 3 + 2] = r * Math.cos(phi);

      // Sizes and speeds
      particleSizes[i] = isInner ? 0.05 + Math.random() * 0.05 : 0.08 + Math.random() * 0.09;
      particleSpeeds[i] = 0.5 + Math.random() * 1.5;
      phaseOffsets[i] = Math.random() * Math.PI * 2;
    }

    // 2. GENERATE SPIRAL GALAXY
    // 4 major logarithmic spiral arms + bright galactic nucleus + diffuse dust halo
    const GALAXY_ARMS = 4;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let r: number;
      let theta: number;
      let z: number;

      const isCore = i < PARTICLE_COUNT * 0.18;
      if (isCore) {
        // Galactic core / nucleus
        const radFrac = Math.random();
        r = 0.1 + Math.pow(radFrac, 1.8) * 0.9;
        theta = Math.random() * Math.PI * 2;
        z = (Math.random() - 0.5) * 0.5 * (1 - r / 1.0);
      } else {
        // Spiral arms
        const armIndex = i % GALAXY_ARMS;
        const normDist = (i / PARTICLE_COUNT);
        r = 0.6 + Math.pow(normDist, 1.1) * 4.6;
        
        // Logarithmic spiral angle + natural dispersion
        const armAngle = (armIndex * (2 * Math.PI / GALAXY_ARMS));
        const spiralWinding = 2.4 * Math.log(r / 0.6 + 1.0);
        const dispersion = (Math.random() - 0.5) * 0.45 * (r / 2.0);
        theta = armAngle + spiralWinding + dispersion;

        // Disk thickness decreases with radius
        const discThickness = 0.45 * Math.exp(-r / 3.2);
        z = (Math.random() - 0.5) * discThickness * 2;
      }

      galaxyPositions[i * 3] = r * Math.cos(theta);
      galaxyPositions[i * 3 + 1] = (Math.random() - 0.5) * 0.3 + (r * 0.08 * Math.sin(theta)); // slight tilt
      galaxyPositions[i * 3 + 2] = z + r * Math.sin(theta);
    }

    // 3. GENERATE THINKING BRAIN (Neural Cerebral Cortex & Pathways)
    // Left & Right Hemispheres, Longitudinal Fissure, Cerebellum, Cortex Convolutions
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Determine hemisphere: left (-x) or right (+x)
      const isRight = (i % 2 === 0);
      const hemSign = isRight ? 1 : -1;

      // Brain coordinates parametrization:
      // u: longitudinal front-to-back [-1 (occipital/rear), +1 (frontal/forehead)]
      // v: vertical top-to-bottom [-1 (base/stem), +1 (parietal/crown)]
      // w: azimuth around hemisphere
      const u = (Math.random() * 2 - 1);
      const v = (Math.random() * 2 - 1);
      const w = Math.random() * Math.PI;

      // Base dimensions of a hemisphere
      const lengthZ = 2.1; // anterior-posterior
      const heightY = 1.4; // superior-inferior
      const widthX = 1.15; // lateral

      // Hemisphere center offset
      const hemCenter = 0.68 * hemSign;

      // Frontal lobe curves forward (+z), occipital curves rearward (-z)
      const zBase = u * lengthZ;
      // Crown curvature vs temporal depression
      const yBase = v * heightY + (1 - u * u) * 0.25;

      // Lateral curvature
      const radialCap = Math.sqrt(Math.max(0, 1 - (u * 0.85) * (u * 0.85) - (v * 0.75) * (v * 0.75)));
      let xBase = hemCenter + hemSign * Math.sin(w) * widthX * radialCap;

      // Interhemispheric longitudinal fissure: medial wall flattening
      if (Math.abs(xBase) < 0.22) {
        xBase = hemSign * (0.12 + Math.random() * 0.08);
      }

      // Brainstem / spinal column particles (5% at bottom center)
      if (i > PARTICLE_COUNT * 0.95) {
        const stemT = Math.random();
        xBase = (Math.random() - 0.5) * 0.35;
        galaxyPositions[i * 3 + 1] = -1.2 - stemT * 1.0;
        brainPositions[i * 3] = xBase;
        brainPositions[i * 3 + 1] = -1.1 - stemT * 0.9;
        brainPositions[i * 3 + 2] = -0.3 + (Math.random() - 0.5) * 0.3;
        continue;
      }

      // Cerebellum (rear base tucked under occipital lobe)
      if (i > PARTICLE_COUNT * 0.88) {
        const cSide = (i % 2 === 0 ? 1 : -1);
        brainPositions[i * 3] = cSide * (0.45 + Math.random() * 0.45);
        brainPositions[i * 3 + 1] = -0.85 + (Math.random() - 0.5) * 0.4;
        brainPositions[i * 3 + 2] = -1.2 - Math.random() * 0.6;
        continue;
      }

      // Sulci and gyri (cortex wrinkling waves)
      const gyriWave = 0.12 * Math.sin(zBase * 8 + yBase * 6) * Math.cos(xBase * 7) +
                       0.06 * Math.sin(yBase * 12 + zBase * 10);
      
      const px = xBase + hemSign * gyriWave * 0.5;
      const py = yBase + gyriWave * 0.6;
      const pz = zBase + gyriWave * 0.5;

      brainPositions[i * 3] = px;
      brainPositions[i * 3 + 1] = py;
      brainPositions[i * 3 + 2] = pz;
    }

    // 4. COLOR ATTRIBUTES (Mint <-> Violet gradient mapping)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Color weight varies across particles: some pure mint, some violet, some dual-harmonic
      const colorRatio = (Math.sin(i * 0.35) * 0.5 + 0.5);
      const isMintBiased = (i % 3 === 0);
      const isVioletBiased = (i % 3 === 1);

      let pColor = new THREE.Color();
      if (isMintBiased) {
        pColor.lerpColors(mintColor, brightMint, Math.random());
      } else if (isVioletBiased) {
        pColor.lerpColors(violetColor, vividViolet, Math.random());
      } else {
        pColor.lerpColors(mintColor, magentaGlow, colorRatio);
      }

      baseColors[i * 3] = pColor.r;
      baseColors[i * 3 + 1] = pColor.g;
      baseColors[i * 3 + 2] = pColor.b;

      particleColors[i * 3] = pColor.r;
      particleColors[i * 3 + 1] = pColor.g;
      particleColors[i * 3 + 2] = pColor.b;

      // Initial positions set to orb
      currentPositions[i * 3] = orbPositions[i * 3];
      currentPositions[i * 3 + 1] = orbPositions[i * 3 + 1];
      currentPositions[i * 3 + 2] = orbPositions[i * 3 + 2];
    }

    // Buffer Geometry & Attributes
    const geometry = new THREE.BufferGeometry();
    const posAttribute = new THREE.BufferAttribute(currentPositions, 3);
    posAttribute.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute('position', posAttribute);

    const colorAttribute = new THREE.BufferAttribute(particleColors, 3);
    colorAttribute.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute('color', colorAttribute);

    // Particle Texture & Points Material
    const particleTexture = createGlowParticleTexture();
    const pointsMaterial = new THREE.PointsMaterial({
      size: 0.18,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
      sizeAttenuation: true,
      opacity: 0.92,
    });

    const particleSystem = new THREE.Points(geometry, pointsMaterial);
    scene.add(particleSystem);

    // Neural Synaptic Connection Lines (Active in Brain Phase)
    const MAX_SYNAPSE_LINES = 140;
    const synapseLinePositions = new Float32Array(MAX_SYNAPSE_LINES * 2 * 3);
    const synapseColors = new Float32Array(MAX_SYNAPSE_LINES * 2 * 3);
    const synapseIndices: [number, number][] = [];

    // Pre-calculate nearest neighbor nodes for synapses in the brain
    for (let l = 0; l < MAX_SYNAPSE_LINES; l++) {
      const idxA = Math.floor(Math.random() * (PARTICLE_COUNT * 0.85));
      let idxB = idxA;
      let bestDist = 999;
      // Search local cluster
      for (let test = 0; test < 35; test++) {
        const candidate = Math.floor(Math.random() * (PARTICLE_COUNT * 0.85));
        if (candidate === idxA) continue;
        const dx = brainPositions[idxA * 3] - brainPositions[candidate * 3];
        const dy = brainPositions[idxA * 3 + 1] - brainPositions[candidate * 3 + 1];
        const dz = brainPositions[idxA * 3 + 2] - brainPositions[candidate * 3 + 2];
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d > 0.2 && d < 0.85 && d < bestDist) {
          bestDist = d;
          idxB = candidate;
        }
      }
      synapseIndices.push([idxA, idxB]);
    }

    const synapseGeometry = new THREE.BufferGeometry();
    const synapsePosAttr = new THREE.BufferAttribute(synapseLinePositions, 3);
    synapsePosAttr.setUsage(THREE.DynamicDrawUsage);
    synapseGeometry.setAttribute('position', synapsePosAttr);

    const synapseColorAttr = new THREE.BufferAttribute(synapseColors, 3);
    synapseColorAttr.setUsage(THREE.DynamicDrawUsage);
    synapseGeometry.setAttribute('color', synapseColorAttr);

    const synapseMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.45,
      depthWrite: false,
    });

    const synapseLines = new THREE.LineSegments(synapseGeometry, synapseMaterial);
    scene.add(synapseLines);

    // Dynamic Point Light that follows pointer with mint/violet aura
    const cursorLight = new THREE.PointLight(0x00FFC2, 4.5, 9);
    scene.add(cursorLight);

    const ambientLight = new THREE.AmbientLight(0x221133, 0.4);
    scene.add(ambientLight);

    // ==========================================
    // INTERACTION LISTENERS (Living Interface)
    // ==========================================
    const raycaster = new THREE.Raycaster();
    const planeZ0 = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const planeIntersect = new THREE.Vector3();

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      const normX = (clientX / rect.width) * 2 - 1;
      const normY = -(clientY / rect.height) * 2 + 1;

      const state = stateRef.current;
      const vx = normX - state.mouse.px;
      const vy = normY - state.mouse.py;

      state.mouse.vx = vx;
      state.mouse.vy = vy;
      state.mouse.px = normX;
      state.mouse.py = normY;
      state.mouse.x = normX;
      state.mouse.y = normY;
      state.mouse.isHovering = true;

      // Project onto 3D plane at z=0 for cursor attractor
      raycaster.setFromCamera(new THREE.Vector2(normX, normY), camera);
      if (raycaster.ray.intersectPlane(planeZ0, planeIntersect)) {
        state.mouse3D.copy(planeIntersect);
      }
    };

    const handlePointerLeave = () => {
      stateRef.current.mouse.isHovering = false;
    };

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(normX, normY), camera);
      if (raycaster.ray.intersectPlane(planeZ0, planeIntersect)) {
        triggerImpulse(planeIntersect.x, planeIntersect.y, planeIntersect.z);
      } else {
        triggerImpulse(0, 0, 0);
      }
      stateRef.current.clickCount++;
    };

    window.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerleave', handlePointerLeave);
    container.addEventListener('click', handleClick);

    // Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // ==========================================
    // ANIMATION & KINEMATICS ENGINE
    // ==========================================
    let frameId = 0;
    let lastTime = performance.now() * 0.001;
    let autoCycleTime = 0;
    let metricsTimer = 0;

    // Cubic smoothstep easing
    const smoothstep = (min: number, max: number, value: number) => {
      const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
      return x * x * (3 - 2 * x);
    };

    const animate = () => {
      const now = performance.now() * 0.001;
      const dt = Math.min(now - lastTime, 0.1);
      lastTime = now;

      const state = stateRef.current;

      // 1. AUTO-CYCLE OR DIRECT PHASE INTERPOLATION
      if (state.autoCycle) {
        autoCycleTime += dt * 0.18; // smooth morph speed
        // 0 -> 1 -> 2 -> 0 smoothly
        state.currentPhaseProgress = (autoCycleTime % 3);
        const pFloor = Math.floor(state.currentPhaseProgress);
        const activePhaseName: MorphPhase = pFloor === 0 ? 'orb' : pFloor === 1 ? 'galaxy' : 'brain';
        if (state.phase !== activePhaseName) {
          state.phase = activePhaseName;
          onPhaseChange?.(activePhaseName);
        }
      } else {
        // Damped interpolation towards selected targetPhaseProgress
        const diff = state.targetPhaseProgress - state.currentPhaseProgress;
        state.currentPhaseProgress += diff * Math.min(dt * 3.5, 1.0);
      }

      const p = state.currentPhaseProgress;
      // Calculate interpolation factors:
      // p in [0, 1): Orb -> Galaxy
      // p in [1, 2): Galaxy -> Brain
      // p in [2, 3): Brain -> Orb
      let fromPos = orbPositions;
      let toPos = galaxyPositions;
      let blend = 0;

      if (p < 1) {
        fromPos = orbPositions;
        toPos = galaxyPositions;
        blend = smoothstep(0, 1, p);
      } else if (p < 2) {
        fromPos = galaxyPositions;
        toPos = brainPositions;
        blend = smoothstep(1, 2, p);
      } else {
        fromPos = brainPositions;
        toPos = orbPositions;
        blend = smoothstep(2, 3, p);
      }

      // Brain phase weight (for synapses and cerebral glow)
      const brainWeight = p >= 1 && p < 2 ? (p - 1) : p >= 2 ? (3 - p) : 0;
      // Galaxy phase weight (for Keplerian spin)
      const galaxyWeight = p < 1 ? p : p < 2 ? (2 - p) : 0;
      // Orb phase weight (for breathing pulse)
      const orbWeight = p < 1 ? (1 - p) : p >= 2 ? (p - 2) : 0;

      // Breathing scale calculation:
      const breathe = 1.0 + (0.14 * Math.sin(now * 2.2) + 0.05 * Math.cos(now * 4.1)) * orbWeight;

      // Cursor position and spring damping
      const mouse3D = state.mouse3D;
      const isAttract = state.interactionMode === 'attract';
      const isRepel = state.interactionMode === 'repel';
      const isVortex = state.interactionMode === 'vortex';

      // Update cursor light
      if (state.mouse.isHovering) {
        cursorLight.position.x = THREE.MathUtils.lerp(cursorLight.position.x, mouse3D.x, 0.12);
        cursorLight.position.y = THREE.MathUtils.lerp(cursorLight.position.y, mouse3D.y, 0.12);
        cursorLight.position.z = 2.5;
        // Light color shifts with phase
        if (brainWeight > 0.5) cursorLight.color.setHex(0x7B61FF);
        else cursorLight.color.setHex(0x00FFC2);
      } else {
        cursorLight.position.set(0, 0, 3);
      }

      // Clean expired shockwaves
      state.shockwaves = state.shockwaves.filter(sw => (now - sw.startTime) < 1.8);

      // Parallax scene tilt based on mouse
      const targetRotX = -state.mouse.y * 0.35;
      const targetRotY = state.mouse.x * 0.45 + (now * 0.04);
      particleSystem.rotation.x = THREE.MathUtils.lerp(particleSystem.rotation.x, targetRotX, 0.04);
      particleSystem.rotation.y = THREE.MathUtils.lerp(particleSystem.rotation.y, targetRotY, 0.04);
      synapseLines.rotation.copy(particleSystem.rotation);

      // UPDATE PARTICLE POSITIONS & DYNAMIC LIVING RESPONSE
      const positions = posAttribute.array as Float32Array;
      const colors = colorAttribute.array as Float32Array;

      // Galaxy spin angle offset
      const galaxySpin = now * 0.25 * galaxyWeight;

      // Synapse firing spark trigger
      const synapseSparkPulse = Math.sin(now * 6) > 0.7;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const phaseOff = phaseOffsets[i];
        const spd = particleSpeeds[i];

        // 1. Base interpolated morph position
        let bx = THREE.MathUtils.lerp(fromPos[i3], toPos[i3], blend);
        let by = THREE.MathUtils.lerp(fromPos[i3 + 1], toPos[i3 + 1], blend);
        let bz = THREE.MathUtils.lerp(fromPos[i3 + 2], toPos[i3 + 2], blend);

        // Apply breathing to orb component
        if (orbWeight > 0.01) {
          bx *= breathe;
          by *= breathe;
          bz *= breathe;
          // Organic fluid wobble
          const wobble = Math.sin(now * spd + phaseOff) * 0.06 * orbWeight;
          bx += wobble;
          by += wobble;
        }

        // Apply differential galaxy spin
        if (galaxyWeight > 0.01) {
          const rDist = Math.sqrt(bx * bx + bz * bz) + 0.1;
          const keplerAngle = (galaxySpin / Math.pow(rDist, 0.45));
          const cosK = Math.cos(keplerAngle);
          const sinK = Math.sin(keplerAngle);
          const rx = bx * cosK - bz * sinK;
          const rz = bx * sinK + bz * cosK;
          bx = rx;
          bz = rz;
        }

        // Thinking Brain neural oscillation & synaptic twitch
        if (brainWeight > 0.01) {
          const neuralTwitch = Math.sin(now * 5.0 + phaseOff * 3) * 0.02 * brainWeight;
          by += neuralTwitch;
        }

        // 2. Dynamic Pointer Living Interaction (Gravity / Repulsion / Vortex)
        let dx = mouse3D.x - bx;
        let dy = mouse3D.y - by;
        let dz = mouse3D.z - bz;
        const distSq = dx * dx + dy * dy + dz * dz;
        const dist = Math.sqrt(distSq);

        let forceIntensity = 0;
        if (state.mouse.isHovering && dist < 3.2) {
          const proximity = 1.0 - (dist / 3.2);
          forceIntensity = proximity * proximity;

          if (isAttract) {
            // Magnetic attraction with soft core dampening
            const pull = forceIntensity * 0.45;
            bx += dx * pull;
            by += dy * pull;
            bz += dz * pull * 0.5;
          } else if (isRepel) {
            // Kinetic repulsion pushing particles away
            const push = forceIntensity * 0.75;
            bx -= (dx / (dist + 0.01)) * push;
            by -= (dy / (dist + 0.01)) * push;
            bz -= (dz / (dist + 0.01)) * push * 0.5;
          } else if (isVortex) {
            // Swirling gravitational vortex around cursor
            const angle = 1.8 * forceIntensity;
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);
            const vx = dx * cosA - dy * sinA;
            const vy = dx * sinA + dy * cosA;
            bx = mouse3D.x - vx;
            by = mouse3D.y - vy;
          }
        }

        // 3. Synaptic Shockwave Action Potentials
        let shockwaveFlash = 0;
        for (let s = 0; s < state.shockwaves.length; s++) {
          const sw = state.shockwaves[s];
          const age = now - sw.startTime;
          const currentRadius = age * 4.2; // expansion speed
          const sDist = Math.sqrt((bx - sw.x) * (bx - sw.x) + (by - sw.y) * (by - sw.y) + (bz - sw.z) * (bz - sw.z));
          const diffR = Math.abs(sDist - currentRadius);
          
          if (diffR < 0.6) {
            const shockwaveStrength = (1.0 - diffR / 0.6) * Math.max(0, 1.0 - age / 1.6);
            shockwaveFlash += shockwaveStrength * 1.5;
            // Radial displacement along wave normal
            const pushOut = shockwaveStrength * 0.35;
            bx += (bx / (sDist + 0.1)) * pushOut;
            by += (by / (sDist + 0.1)) * pushOut;
            bz += (bz / (sDist + 0.1)) * pushOut;
          }
        }

        // Apply final positions
        positions[i3] = bx;
        positions[i3 + 1] = by;
        positions[i3 + 2] = bz;

        // 4. Dynamic Color & Luminescence Shifting
        // Base mint/violet tone + cursor excitation + shockwave glow
        const baseR = baseColors[i3];
        const baseG = baseColors[i3 + 1];
        const baseB = baseColors[i3 + 2];

        // Excitation brightening
        const excitation = Math.min(forceIntensity * 1.8 + shockwaveFlash, 2.5);
        
        // In Brain phase, synapses fire with electric mint flashes
        let synapseGlow = 0;
        if (brainWeight > 0.4 && synapseSparkPulse && (i % 7 === 0)) {
          synapseGlow = 0.8;
        }

        colors[i3] = Math.min(1.0, baseR + excitation * 0.6 + synapseGlow * 0.3);
        colors[i3 + 1] = Math.min(1.0, baseG + excitation * 1.0 + synapseGlow * 0.9); // mint enhancement
        colors[i3 + 2] = Math.min(1.0, baseB + excitation * 0.7);
      }

      posAttribute.needsUpdate = true;
      colorAttribute.needsUpdate = true;

      // UPDATE SYNAPSE LINES IN BRAIN PHASE
      if (brainWeight > 0.1) {
        synapseLines.visible = true;
        synapseMaterial.opacity = THREE.MathUtils.lerp(0.0, 0.45, brainWeight);

        const synPos = synapsePosAttr.array as Float32Array;
        const synCol = synapseColorAttr.array as Float32Array;

        for (let l = 0; l < MAX_SYNAPSE_LINES; l++) {
          const [idxA, idxB] = synapseIndices[l];
          const l6 = l * 6;

          // Start node
          synPos[l6] = positions[idxA * 3];
          synPos[l6 + 1] = positions[idxA * 3 + 1];
          synPos[l6 + 2] = positions[idxA * 3 + 2];

          // End node
          synPos[l6 + 3] = positions[idxB * 3];
          synPos[l6 + 4] = positions[idxB * 3 + 1];
          synPos[l6 + 5] = positions[idxB * 3 + 2];

          // Highlighting active firing pulses
          const isFiring = Math.sin(now * 8.0 + l * 0.4) > 0.65;
          const colR = isFiring ? 0.35 : 0.48; // violet
          const colG = isFiring ? 1.0 : 0.25;  // bright mint pulse
          const colB = isFiring ? 0.85 : 0.95; // electric

          synCol[l6] = colR;
          synCol[l6 + 1] = colG;
          synCol[l6 + 2] = colB;
          synCol[l6 + 3] = colR;
          synCol[l6 + 4] = colG;
          synCol[l6 + 5] = colB;
        }
        synapsePosAttr.needsUpdate = true;
        synapseColorAttr.needsUpdate = true;
      } else {
        synapseLines.visible = false;
      }

      // Render scene
      renderer.render(scene, camera);

      // Periodically update telemetry metrics for HUD (every ~150ms)
      metricsTimer += dt;
      if (metricsTimer > 0.15) {
        metricsTimer = 0;
        const baseFiring = 980 + Math.floor(Math.sin(now * 3) * 240);
        const hoverBoost = state.mouse.isHovering ? 620 : 0;
        const shockBoost = state.shockwaves.length * 350;
        onMetricsUpdate?.({
          coherence: Math.min(99.8, 94.2 + brainWeight * 4.8 + Math.random() * 0.8),
          firingRate: baseFiring + hoverBoost + shockBoost,
          activeNodes: PARTICLE_COUNT,
          phaseProgress: p,
        });
      }

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    // CLEANUP ON UNMOUNT
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointerleave', handlePointerLeave);
      container.removeEventListener('click', handleClick);

      geometry.dispose();
      pointsMaterial.dispose();
      synapseGeometry.dispose();
      synapseMaterial.dispose();
      particleTexture.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [triggerImpulse, onMetricsUpdate, onPhaseChange]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full cursor-crosshair select-none touch-none"
      style={{ touchAction: 'none' }}
    />
  );
}
