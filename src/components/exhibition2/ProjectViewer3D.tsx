import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ProjectExhibitItem } from '../../types/exhibition2';

interface ProjectViewer3DProps {
  project: ProjectExhibitItem;
}

export const ProjectViewer3D: React.FC<ProjectViewer3DProps> = ({ project }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [simulationState, setSimulationState] = useState<string>('idle');
  const [activeLedIndex, setActiveLedIndex] = useState<number>(0);
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
      const width = mount.clientWidth || 450;
      const height = mount.clientHeight || 350;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 3, 7.5);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mount.appendChild(renderer.domElement);

      const ambLight = new THREE.AmbientLight(0xffffff, 1.2);
      scene.add(ambLight);

      const spotLight = new THREE.SpotLight(0x38bdf8, 3, 20, Math.PI / 4, 0.5);
      spotLight.position.set(0, 8, 4);
      scene.add(spotLight);

      // Root Project Group for Rotation
      const projectGroup = new THREE.Group();
      scene.add(projectGroup);

      // Rotating Pedestal Base with Cyber Grid
      const baseGeo = new THREE.CylinderGeometry(3.2, 3.4, 0.25, 32);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x071322,
        roughness: 0.3,
        metalness: 0.8
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = -1.2;
      projectGroup.add(baseMesh);

      // Glowing Base Ring
      const ringGeo = new THREE.RingGeometry(3.1, 3.25, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -1.06;
      projectGroup.add(ring);

      // Custom 3D Object based on project type
      const dynamicElements: {
        update: (time: number) => void;
      }[] = [];

      if (project.interactiveDemoType === 'esp32_memory') {
        // --- 1. ESP32 Memory Game Board ---
        const boardGeo = new THREE.BoxGeometry(3.6, 0.2, 3.6);
        const boardMat = new THREE.MeshStandardMaterial({ color: 0x052e16, metalness: 0.3, roughness: 0.4 });
        const board = new THREE.Mesh(boardGeo, boardMat);
        board.position.y = -0.5;
        projectGroup.add(board);

        // ESP32 Module in the middle
        const espGeo = new THREE.BoxGeometry(1.6, 0.15, 1.0);
        const espMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
        const esp = new THREE.Mesh(espGeo, espMat);
        esp.position.set(0, -0.35, 0);
        projectGroup.add(esp);

        // 4 Tactile LEDs & Buttons (Red, Green, Blue, Yellow)
        const ledColors = [0xef4444, 0x10b981, 0x3b82f6, 0xeab308];
        const ledMeshes: THREE.Mesh[] = [];

        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI) / 2 + Math.PI / 4;
          const x = Math.cos(angle) * 1.2;
          const z = Math.sin(angle) * 1.2;

          // LED Bulb
          const ledGeo = new THREE.SphereGeometry(0.2, 16, 16);
          const ledMat = new THREE.MeshStandardMaterial({
            color: ledColors[i],
            emissive: ledColors[i],
            emissiveIntensity: 0.2
          });
          const led = new THREE.Mesh(ledGeo, ledMat);
          led.position.set(x, -0.25, z);
          ledMeshes.push(led);
          projectGroup.add(led);

          // Button
          const btnGeo = new THREE.CylinderGeometry(0.18, 0.2, 0.15, 16);
          const btnMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 });
          const btn = new THREE.Mesh(btnGeo, btnMat);
          btn.position.set(x * 0.6, -0.32, z * 0.6);
          projectGroup.add(btn);
        }

        // Buzzer cylinder
        const buzzGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.25, 16);
        const buzzMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
        const buzz = new THREE.Mesh(buzzGeo, buzzMat);
        buzz.position.set(-1.2, -0.3, 0);
        projectGroup.add(buzz);

        dynamicElements.push({
          update: (time) => {
            const step = Math.floor(time * 2) % 4;
            ledMeshes.forEach((mesh, idx) => {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.emissiveIntensity = idx === step ? 3.5 : 0.2;
            });
          }
        });
      } else if (project.interactiveDemoType === 'rfid_scanner') {
        // --- 2. RFID Module & Hovering Contactless Smart Card ---
        // RC522 Reader PCB
        const rfidGeo = new THREE.BoxGeometry(2.4, 0.15, 2.0);
        const rfidMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.4 });
        const rfidBoard = new THREE.Mesh(rfidGeo, rfidMat);
        rfidBoard.position.set(0, -0.6, 0);
        projectGroup.add(rfidBoard);

        // Antenna trace coil representation
        const coilGeo = new THREE.RingGeometry(0.6, 0.8, 24);
        const coilMat = new THREE.MeshBasicMaterial({ color: 0xd97706, side: THREE.DoubleSide });
        const coil = new THREE.Mesh(coilGeo, coilMat);
        coil.rotation.x = Math.PI / 2;
        coil.position.set(0, -0.5, 0);
        projectGroup.add(coil);

        // Hovering RFID Card with electromagnetic wave ripple
        const cardGeo = new THREE.BoxGeometry(2.2, 0.05, 1.4);
        const cardMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.1 });
        const card = new THREE.Mesh(cardGeo, cardMat);
        card.position.set(0, 0.5, 0);
        card.rotation.x = 0.2;
        projectGroup.add(card);

        // Electromagnetic wave rings
        const waveRings: THREE.Mesh[] = [];
        for (let i = 0; i < 3; i++) {
          const waveGeo = new THREE.RingGeometry(0.3 + i * 0.4, 0.35 + i * 0.4, 32);
          const waveMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.6
          });
          const wave = new THREE.Mesh(waveGeo, waveMat);
          wave.rotation.x = Math.PI / 2;
          wave.position.set(0, -0.2 + i * 0.2, 0);
          waveRings.push(wave);
          projectGroup.add(wave);
        }

        dynamicElements.push({
          update: (time) => {
            card.position.y = 0.3 + Math.sin(time * 2.5) * 0.35;
            card.rotation.z = Math.sin(time * 1.5) * 0.1;
            waveRings.forEach((w, i) => {
              w.scale.setScalar(1 + (Math.sin(time * 4 + i) * 0.2));
            });
          }
        });
      } else if (project.interactiveDemoType === 'ultrasonic_servo') {
        // --- 3. Ultrasonic Distance Sensor & Moving Servo Arm ---
        // Ultrasonic Eyes (HC-SR04)
        const sensorBodyGeo = new THREE.BoxGeometry(2.2, 0.8, 0.2);
        const sensorBodyMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
        const sensorBody = new THREE.Mesh(sensorBodyGeo, sensorBodyMat);
        sensorBody.position.set(0, 0.5, 0);
        projectGroup.add(sensorBody);

        // Transmitter & Receiver metal cones
        const eyeGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.5, 16);
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
        const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
        eye1.rotation.x = Math.PI / 2;
        eye1.position.set(-0.6, 0.5, 0.3);
        projectGroup.add(eye1);

        const eye2 = eye1.clone();
        eye2.position.set(0.6, 0.5, 0.3);
        projectGroup.add(eye2);

        // Servo Motor Base
        const servoBaseGeo = new THREE.BoxGeometry(1.2, 1.2, 0.8);
        const servoBaseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.5 });
        const servoBase = new THREE.Mesh(servoBaseGeo, servoBaseMat);
        servoBase.position.set(0, -0.6, 0);
        projectGroup.add(servoBase);

        // Servo Mechanical Arm (Moving Robotic Horn)
        const hornGeo = new THREE.BoxGeometry(2.2, 0.12, 0.3);
        const hornMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8 });
        const horn = new THREE.Mesh(hornGeo, hornMat);
        horn.position.set(0, 0.05, 0);
        projectGroup.add(horn);

        dynamicElements.push({
          update: (time) => {
            // Sweep servo back and forth like a radar/welcoming gesture
            horn.rotation.y = Math.sin(time * 3) * (Math.PI / 3);
          }
        });
      } else {
        // --- 4. Computer Vision Dual-Axis Camera Gimbal ---
        const cameraBoxGeo = new THREE.BoxGeometry(1.4, 1.0, 1.2);
        const cameraBoxMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.8 });
        const cameraBox = new THREE.Mesh(cameraBoxGeo, cameraBoxMat);
        cameraBox.position.set(0, 0.2, 0);
        projectGroup.add(cameraBox);

        // Camera Optical Lens with blue reflection
        const lensGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.6, 24);
        const lensMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.1 });
        const lens = new THREE.Mesh(lensGeo, lensMat);
        lens.rotation.x = Math.PI / 2;
        lens.position.set(0, 0.2, 0.7);
        projectGroup.add(lens);

        // Gimbal U-bracket
        const bracketGeo = new THREE.BoxGeometry(2.0, 0.2, 0.6);
        const bracketMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
        const bracket = new THREE.Mesh(bracketGeo, bracketMat);
        bracket.position.set(0, -0.6, 0);
        projectGroup.add(bracket);

        dynamicElements.push({
          update: (time) => {
            // Intelligent tracking pan & tilt movements
            cameraBox.rotation.y = Math.sin(time * 1.5) * 0.45;
            cameraBox.rotation.x = Math.cos(time * 2.0) * 0.25;
            lens.rotation.y = cameraBox.rotation.y;
            lens.rotation.x = Math.PI / 2 + cameraBox.rotation.x;
          }
        });
      }

      // Drag to Rotate Interaction
      let isDragging = false;
      let prevMouseX = 0;

      const handleMouseDown = (e: MouseEvent) => {
        isDragging = true;
        prevMouseX = e.clientX;
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        const deltaX = e.clientX - prevMouseX;
        projectGroup.rotation.y += deltaX * 0.01;
        prevMouseX = e.clientX;
      };

      const handleMouseUp = () => {
        isDragging = false;
      };

      const dom = renderer.domElement;
      dom.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      let clock = new THREE.Clock();

      const animate = () => {
        if (isDisposed) return;
        animId = requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        if (!isDragging) {
          projectGroup.rotation.y += 0.007; // Slow continuous showcase spin
        }

        // Update project-specific kinematics
        dynamicElements.forEach(item => item.update(elapsedTime));

        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      };

      animate();

      return () => {
        isDisposed = true;
        cancelAnimationFrame(animId);
        dom.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        if (renderer && renderer.domElement && mount.contains(renderer.domElement)) {
          mount.removeChild(renderer.domElement);
          renderer.dispose();
        }
      };
    } catch (e) {
      console.warn('ProjectViewer3D WebGL failed:', e);
      setHasError(true);
    }
  }, [project]);

  if (hasError) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center p-6 bg-slate-900/50 rounded-2xl border border-cyan-500/30">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-950 border border-cyan-500 flex items-center justify-center text-cyan-400 font-bold text-xl">
            3D
          </div>
          <p className="text-xs text-slate-300">محاكاة ثلاثية الأبعاد: {project.titleAr}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[320px] flex flex-col items-center justify-center">
      <div 
        ref={mountRef} 
        className="w-full h-full min-h-[320px] cursor-grab active:cursor-grabbing flex items-center justify-center"
      />
      <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none">
        <span className="text-[10px] font-mono tracking-widest text-cyan-400/80 bg-slate-950/80 px-3 py-1 rounded-full border border-cyan-500/30">
          ✦ اسحب بالماوس لتدوير المجسم 360° ✦
        </span>
      </div>
    </div>
  );
};
