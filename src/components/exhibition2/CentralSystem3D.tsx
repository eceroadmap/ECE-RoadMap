import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface CentralSystem3DProps {
  activeDomainId?: string;
  onSelectDomain?: (domainId: string) => void;
}

export const CentralSystem3D: React.FC<CentralSystem3DProps> = ({
  activeDomainId,
  onSelectDomain
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let animId: number;
    let isDisposed = false;

    try {
      const width = mount.clientWidth || 400;
      const height = mount.clientHeight || 400;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0, 8.5);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mount.appendChild(renderer.domElement);

      // Lights
      const ambLight = new THREE.AmbientLight(0xffffff, 1.2);
      scene.add(ambLight);

      const pLight = new THREE.PointLight(0x00f0ff, 4, 20);
      pLight.position.set(0, 2, 4);
      scene.add(pLight);

      // Central Core Group (Silicon Die with Crystal Facets)
      const coreGroup = new THREE.Group();
      
      const icosaGeo = new THREE.IcosahedronGeometry(1.4, 1);
      const icosaMat = new THREE.MeshStandardMaterial({
        color: 0x0ea5e9,
        wireframe: true,
        emissive: 0x0369a1,
        roughness: 0.1,
        metalness: 0.9
      });
      const coreMesh = new THREE.Mesh(icosaGeo, icosaMat);
      coreGroup.add(coreMesh);

      // Inner Glowing Nucleus
      const innerGeo = new THREE.SphereGeometry(0.8, 16, 16);
      const innerMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: false
      });
      const innerMesh = new THREE.Mesh(innerGeo, innerMat);
      coreGroup.add(innerMesh);

      scene.add(coreGroup);

      // 4 Orbital Rings and Satellite Domain Nodes
      const orbitsGroup = new THREE.Group();

      const domainColors = [0x06b6d4, 0x10b981, 0xf59e0b, 0x8b5cf6];
      const satellites: THREE.Mesh[] = [];
      const beamLines: THREE.Line[] = [];

      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI * 2) / 4;
        const radius = 3.2;

        // Satellite Node
        const satGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const satMat = new THREE.MeshStandardMaterial({
          color: domainColors[i],
          metalness: 0.8,
          roughness: 0.2
        });
        const satMesh = new THREE.Mesh(satGeo, satMat);
        satMesh.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
        satellites.push(satMesh);
        orbitsGroup.add(satMesh);

        // Laser Beam from Core to Satellite
        const beamGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          satMesh.position
        ]);
        const beamMat = new THREE.LineBasicMaterial({
          color: domainColors[i],
          transparent: true,
          opacity: 0.7
        });
        const beam = new THREE.Line(beamGeo, beamMat);
        beamLines.push(beam);
        orbitsGroup.add(beam);
      }

      // Orbital Gyroscopic Rings
      const ringGeo1 = new THREE.RingGeometry(3.15, 3.22, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x0284c7,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4
      });
      const ring1 = new THREE.Mesh(ringGeo1, ringMat);
      orbitsGroup.add(ring1);

      const ring2 = ring1.clone();
      ring2.rotation.x = Math.PI / 3;
      orbitsGroup.add(ring2);

      scene.add(orbitsGroup);

      // Animation Loop
      let clock = new THREE.Clock();

      const animate = () => {
        if (isDisposed) return;
        animId = requestAnimationFrame(animate);

        const t = clock.getElapsedTime();

        coreGroup.rotation.y = t * 0.6;
        coreGroup.rotation.x = Math.sin(t * 0.4) * 0.3;

        orbitsGroup.rotation.z = t * 0.25;

        // Rotate individual satellites
        satellites.forEach((sat, idx) => {
          sat.rotation.x = t * 1.2 + idx;
          sat.rotation.y = t * 1.5;
        });

        // Pulsing core light
        pLight.intensity = 3 + Math.sin(t * 5) * 1.2;

        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      };

      animate();

      const handleResize = () => {
        if (!mount || !renderer || !camera) return;
        const w = mount.clientWidth;
        const h = mount.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        isDisposed = true;
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', handleResize);
        if (renderer && renderer.domElement && mount.contains(renderer.domElement)) {
          mount.removeChild(renderer.domElement);
          renderer.dispose();
        }
      };
    } catch (e) {
      console.warn('CentralSystem3D failed to initialize:', e);
      setHasError(true);
    }
  }, []);

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-48 h-48 rounded-full border-2 border-cyan-500/40 animate-pulse bg-cyan-950/20 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-cyan-500/30 border border-cyan-400" />
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full min-h-[300px] flex items-center justify-center relative cursor-grab active:cursor-grabbing"
    />
  );
};
