import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface PcbCanvas3DProps {
  className?: string;
  activeSceneId?: string;
  interactive?: boolean;
}

export const PcbCanvas3D: React.FC<PcbCanvas3DProps> = ({
  className = '',
  activeSceneId = 'hero',
  interactive = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGlError, setHasWebGlError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let animationFrameId: number;
    let isDisposed = false;

    try {
      // Initialize Three.js scene
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x040914, 0.025);

      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
      camera.position.set(0, 5, 12);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;

      container.appendChild(renderer.domElement);

      // Ambient & Directional Lights
      const ambientLight = new THREE.AmbientLight(0x0d2847, 1.5);
      scene.add(ambientLight);

      const cyanLight = new THREE.PointLight(0x06b6d4, 3, 25);
      cyanLight.position.set(-4, 4, 3);
      scene.add(cyanLight);

      const blueLight = new THREE.PointLight(0x3b82f6, 3, 25);
      blueLight.position.set(4, 3, -2);
      scene.add(blueLight);

      const emeraldLight = new THREE.PointLight(0x10b981, 2, 20);
      emeraldLight.position.set(0, -3, 4);
      scene.add(emeraldLight);

      // 1. PCB Ground Plane (Dark Matte Circuit Board)
      const pcbGeometry = new THREE.BoxGeometry(16, 0.3, 12);
      const pcbMaterial = new THREE.MeshStandardMaterial({
        color: 0x07111e,
        roughness: 0.3,
        metalness: 0.8
      });
      const pcbMesh = new THREE.Mesh(pcbGeometry, pcbMaterial);
      pcbMesh.position.y = -1;
      scene.add(pcbMesh);

      // 2. Central IC Microcontroller (ESP32 / ARM style chip)
      const chipGroup = new THREE.Group();
      const chipGeo = new THREE.BoxGeometry(3.2, 0.4, 3.2);
      const chipMat = new THREE.MeshStandardMaterial({
        color: 0x0c1a2e,
        metalness: 0.9,
        roughness: 0.2
      });
      const chipBody = new THREE.Mesh(chipGeo, chipMat);
      chipGroup.add(chipBody);

      // Metallic Heatspreader / Logo plate
      const plateGeo = new THREE.BoxGeometry(2.4, 0.05, 2.4);
      const plateMat = new THREE.MeshStandardMaterial({
        color: 0x1e3a5f,
        metalness: 0.95,
        roughness: 0.1
      });
      const plate = new THREE.Mesh(plateGeo, plateMat);
      plate.position.y = 0.22;
      chipGroup.add(plate);

      // IC Metallic Pins on 4 sides
      const pinMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37, // Gold plated pins
        metalness: 0.9,
        roughness: 0.2
      });
      const pinGeo = new THREE.BoxGeometry(0.12, 0.1, 0.35);

      for (let i = -1.2; i <= 1.2; i += 0.3) {
        // North & South
        const pinN = new THREE.Mesh(pinGeo, pinMat);
        pinN.position.set(i, -0.1, 1.7);
        chipGroup.add(pinN);

        const pinS = new THREE.Mesh(pinGeo, pinMat);
        pinS.position.set(i, -0.1, -1.7);
        chipGroup.add(pinS);

        // East & West
        const pinE = new THREE.Mesh(pinGeo, pinMat);
        pinE.rotation.y = Math.PI / 2;
        pinE.position.set(1.7, -0.1, i);
        chipGroup.add(pinE);

        const pinW = new THREE.Mesh(pinGeo, pinMat);
        pinW.rotation.y = Math.PI / 2;
        pinW.position.set(-1.7, -0.1, i);
        chipGroup.add(pinW);
      }

      chipGroup.position.set(0, -0.65, 0);
      scene.add(chipGroup);

      // 3. Copper Glowing Traces & Data Lines
      const traceGroup = new THREE.Group();
      const tracePaths: THREE.Vector3[][] = [
        [new THREE.Vector3(1.8, -0.8, 0), new THREE.Vector3(5, -0.8, 0), new THREE.Vector3(6, -0.8, 2)],
        [new THREE.Vector3(-1.8, -0.8, 0.5), new THREE.Vector3(-4, -0.8, 0.5), new THREE.Vector3(-5.5, -0.8, 3)],
        [new THREE.Vector3(0.5, -0.8, 1.8), new THREE.Vector3(0.5, -0.8, 4), new THREE.Vector3(3, -0.8, 5)],
        [new THREE.Vector3(-0.8, -0.8, -1.8), new THREE.Vector3(-0.8, -0.8, -3.5), new THREE.Vector3(-4, -0.8, -4)],
        [new THREE.Vector3(1.2, -0.8, -1.8), new THREE.Vector3(4, -0.8, -1.8), new THREE.Vector3(5.5, -0.8, -3)],
        [new THREE.Vector3(-1.8, -0.8, -0.8), new THREE.Vector3(-4.5, -0.8, -0.8), new THREE.Vector3(-6, -0.8, -2)]
      ];

      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.65
      });

      tracePaths.forEach(pts => {
        const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
        const line = new THREE.Line(lineGeo, lineMaterial);
        traceGroup.add(line);
      });
      scene.add(traceGroup);

      // 4. Moving Data Pulses (Signal Packets) along Traces
      const pulseCount = 18;
      const pulseGeo = new THREE.SphereGeometry(0.09, 8, 8);
      const pulseMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const pulses: { mesh: THREE.Mesh; path: THREE.Vector3[]; progress: number; speed: number }[] = [];

      for (let i = 0; i < pulseCount; i++) {
        const path = tracePaths[i % tracePaths.length];
        const mesh = new THREE.Mesh(pulseGeo, pulseMat);
        scene.add(mesh);
        pulses.push({
          mesh,
          path,
          progress: Math.random(),
          speed: 0.004 + Math.random() * 0.007
        });
      }

      // 5. Floating Holographic Data Particles & Radio Waves
      const particleGeo = new THREE.BufferGeometry();
      const particleCount = 200;
      const posArray = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 22;
        posArray[i + 1] = Math.random() * 8 - 1;
        posArray[i + 2] = (Math.random() - 0.5) * 18;
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

      const particleMat = new THREE.PointsMaterial({
        size: 0.08,
        color: 0x00f2fe,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending
      });
      const particlesMesh = new THREE.Points(particleGeo, particleMat);
      scene.add(particlesMesh);

      // Parallax Mouse Interaction
      let mouseX = 0;
      let mouseY = 0;
      let targetRotX = 0.35;
      let targetRotY = 0;

      const handleMouseMove = (e: MouseEvent) => {
        if (!interactive) return;
        const rect = container.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        targetRotY = mouseX * 0.45;
        targetRotX = 0.35 - mouseY * 0.3;
      };

      window.addEventListener('mousemove', handleMouseMove);

      // Handle Resize
      const handleResize = () => {
        if (!container || !renderer || !camera) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      // Animation Loop
      let clock = new THREE.Clock();

      const animate = () => {
        if (isDisposed) return;
        animationFrameId = requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // Parallax smooth interpolation
        if (scene) {
          scene.rotation.y += (targetRotY - scene.rotation.y) * 0.05;
          scene.rotation.x += (targetRotX - scene.rotation.x) * 0.05;
        }

        // Pulse chip glowing light
        cyanLight.intensity = 2.2 + Math.sin(elapsedTime * 4) * 0.8;
        blueLight.intensity = 2.0 + Math.cos(elapsedTime * 3) * 0.6;

        // Move signal pulses along trace lines
        pulses.forEach(p => {
          p.progress += p.speed;
          if (p.progress > 1) p.progress = 0;

          const pts = p.path;
          const totalSegments = pts.length - 1;
          const currentSegIndex = Math.min(Math.floor(p.progress * totalSegments), totalSegments - 1);
          const segProgress = (p.progress * totalSegments) - currentSegIndex;

          const p1 = pts[currentSegIndex];
          const p2 = pts[currentSegIndex + 1];

          p.mesh.position.lerpVectors(p1, p2, segProgress);
        });

        // Rotate particles slightly
        particlesMesh.rotation.y = elapsedTime * 0.02;

        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      };

      animate();

      return () => {
        isDisposed = true;
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);

        if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
          renderer.dispose();
        }
      };
    } catch (err) {
      console.warn('WebGL initialization failed, falling back to 2D canvas/CSS:', err);
      setHasWebGlError(true);
    }
  }, [interactive]);

  if (hasWebGlError) {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        {/* Elegant fallback with animated SVG PCB Grid */}
        <div className="absolute inset-0 bg-radial from-cyan-950/20 via-[#040914] to-[#02050b]" />
        <svg className="w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
          <pattern id="pcb-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(6, 182, 212, 0.25)" strokeWidth="1" />
            <circle cx="30" cy="30" r="3" fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1.5" />
            <path d="M 30 0 L 30 27 M 30 33 L 30 60 M 0 30 L 27 30 M 33 30 L 60 30" fill="none" stroke="rgba(14, 165, 233, 0.3)" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#pcb-pattern)" />
        </svg>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 ${className}`}
    />
  );
};
