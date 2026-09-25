import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { 
  RotateCw, 
  Eye, 
  Maximize2, 
  Minimize2, 
  Zap, 
  Cpu, 
  Activity, 
  Compass, 
  Info,
  Radio,
  Sliders
} from 'lucide-react';

export type MicrocontrollerViewPreset = 
  | 'hero' 
  | 'journey' 
  | 'skills_pipeline' 
  | 'software_toolkit' 
  | 'graduation_projects' 
  | 'careers' 
  | 'qr_portal'
  | 'top'
  | 'side'
  | 'macro';

export interface Microcontroller3DSceneProps {
  currentScene?: string;
  className?: string;
  isInteractive?: boolean;
  showControls?: boolean;
  compact?: boolean;
  subtleHud?: boolean;
  onSelectComponent?: (info: { nameAr: string; descAr: string; type: string }) => void;
}

// Preset camera & board configurations for each transition scene
export const SCENE_CAMERA_PRESETS: Record<string, {
  pos: [number, number, number];
  target: [number, number, number];
  boardRot: [number, number, number];
  nameAr: string;
  hardwareFocusAr: string;
  descAr: string;
}> = {
  hero: {
    pos: [4.8, 3.8, 5.2],
    target: [0, 0, 0],
    boardRot: [0.18, 0.45, 0],
    nameAr: 'منظور مجسم سينمائي 3D',
    hardwareFocusAr: 'المعالج المركزي STM32 Cortex-M4 @ 168MHz',
    descAr: 'المجسم العتادي المتكامل مع الإضاءة السينمائية ونبض الإشارات الرقمية'
  },
  journey: {
    pos: [0.0, 7.8, 0.05],
    target: [0, 0, 0],
    boardRot: [0, 0, 0],
    nameAr: 'المخطط الطبوغرافي العلوي 90°',
    hardwareFocusAr: 'المسارات النحاسية وشبكة التأريض PCB',
    descAr: 'تحاكي المسارات تدرج وتكامل المقررات والمخابر عبر السنوات الخمس'
  },
  skills_pipeline: {
    pos: [-3.6, 1.8, 3.2],
    target: [-1.2, 0.15, 0.4],
    boardRot: [0.15, -0.65, 0.04],
    nameAr: 'فحص مجهري لمصفوفة الدبابيس GPIO',
    hardwareFocusAr: 'الدبابيس الذهبية ونواقل البيانات SPI / I2C / UART',
    descAr: 'بوابات ربط المهارات البرمجية بالعتاد الرقمي والحساسات والتحكم'
  },
  software_toolkit: {
    pos: [3.2, 2.2, 2.8],
    target: [1.2, 0.1, 0.8],
    boardRot: [0.1, 0.75, -0.05],
    nameAr: 'منظور التوقيت والمعالجة التشخيصي',
    hardwareFocusAr: 'المذبذب البلوري 16.000 MHz ووحدة تنظيم الجهد VRM',
    descAr: 'التزامن الزمني فائق الدقة اللازم لتنفيذ برمجيات المعالجة الرقمية'
  },
  graduation_projects: {
    pos: [2.8, 1.8, 4.6],
    target: [0, 0.2, 0],
    boardRot: [-0.12, 0.35, 0.08],
    nameAr: 'منظور هندسي تصاعدي Hero Tilt',
    hardwareFocusAr: 'الأنظمة المدمجة الذكية والروبوتات والـ IoT',
    descAr: 'القلب العتادي المحرك لمشاريع التخرج والابتكارات التطبيقية'
  },
  careers: {
    pos: [-4.4, 4.2, 4.0],
    target: [0, 0, 0],
    boardRot: [0.22, -0.42, 0],
    nameAr: 'منظور المنظومة الشاملة System Overview',
    hardwareFocusAr: 'تكامل الدارات مع شبكات الاتصالات والإنترنت الصناعي',
    descAr: 'آفاق عمل مهندس الإلكترونيات والاتصالات عبر قطاعات التكنولوجيا'
  },
  qr_portal: {
    pos: [0.0, 2.8, 5.6],
    target: [0, 0, 0],
    boardRot: [0.06, 0, 0],
    nameAr: 'منظور البوابة التفاعلية المباشرة',
    hardwareFocusAr: 'واجهة الاتصال المباشر والمنفذ التسلسلي USB-C',
    descAr: 'مسح الباركود للوصول الفوري للمنصة والمصادر الأكاديمية الشاملة'
  },
  top: {
    pos: [0, 8.8, 0.1],
    target: [0, 0, 0],
    boardRot: [0, 0, 0],
    nameAr: 'منظور علوي مباشر 90°',
    hardwareFocusAr: 'الطبقة العلوية للوحة PCB',
    descAr: 'عرض المخطط الهندسي العمودي للدارة'
  },
  side: {
    pos: [6.8, 1.2, 0.2],
    target: [0, 0.2, 0],
    boardRot: [0, Math.PI / 2, 0],
    nameAr: 'منظور جانبي لطبقات الـ PCB',
    hardwareFocusAr: 'طبقات الألياف والعناصر السطحية',
    descAr: 'معاينة سماكة اللوحة والعناصر السطحية SMD'
  },
  macro: {
    pos: [1.8, 1.6, 2.2],
    target: [0, 0.25, 0],
    boardRot: [0.2, 0.3, 0],
    nameAr: 'فحص مجهري للمعالج (Silicon Die)',
    hardwareFocusAr: 'شريحة المعالج STM32 Cortex-M4',
    descAr: 'معاينة شريحة المعالج المركزي المحفورة بالليزر'
  },
  rlc: {
    pos: [-1.2, 2.4, 2.8],
    target: [-0.6, 0.2, -0.6],
    boardRot: [0.25, -0.35, 0],
    nameAr: 'فحص عناصر RLC الأساسية (مقاومة، مكثف، ملف)',
    hardwareFocusAr: 'دارة الترشيح والتغذية الأساسية R-L-C',
    descAr: 'العناصر الخاملة العملية: مقاومة كربونية ملونة، مكثف ترشيح إلكتروليتي، وملف خنق toroidal نحاسي'
  }
};

export const Microcontroller3DScene: React.FC<Microcontroller3DSceneProps> = ({
  currentScene = 'hero',
  className = '',
  isInteractive = true,
  showControls = true,
  compact = false,
  subtleHud = false,
  onSelectComponent
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active view preset state
  const [activePreset, setActivePreset] = useState<string>(currentScene);
  const [isAutoOrbit, setIsAutoOrbit] = useState<boolean>(true);
  const [activeComponentName, setActiveComponentName] = useState<string | null>(null);
  const [activeComponentDesc, setActiveComponentDesc] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Sync internal preset with incoming currentScene changes
  useEffect(() => {
    if (SCENE_CAMERA_PRESETS[currentScene]) {
      setActivePreset(currentScene);
    }
  }, [currentScene]);

  // Three.js instances ref
  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    mcuGroup: THREE.Group;
    traceParticles: THREE.Points;
    ledPointLights: THREE.PointLight[];
    targetCamPos: THREE.Vector3;
    targetLookAt: THREE.Vector3;
    currentLookAt: THREE.Vector3;
    targetBoardRot: THREE.Vector3;
    isDragging: boolean;
    prevMouseX: number;
    prevMouseY: number;
    userRotX: number;
    userRotY: number;
    raycaster: THREE.Raycaster;
    mouse: THREE.Vector2;
    interactiveObjects: { mesh: THREE.Object3D; nameAr: string; descAr: string; type: string }[];
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 300;

    // 1. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 2. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);

    const initialPreset = SCENE_CAMERA_PRESETS[activePreset] || SCENE_CAMERA_PRESETS.hero;
    camera.position.set(...initialPreset.pos);
    const targetCamPos = new THREE.Vector3(...initialPreset.pos);
    const targetLookAt = new THREE.Vector3(...initialPreset.target);
    const currentLookAt = new THREE.Vector3(...initialPreset.target);
    const targetBoardRot = new THREE.Vector3(...(initialPreset.boardRot || [0, 0, 0]));
    camera.lookAt(currentLookAt);

    // 3. Realistic High-Tech Lighting
    const ambientLight = new THREE.AmbientLight(0x0c1e36, 2.2);
    scene.add(ambientLight);

    // Main directional sunlight / studio key
    const dirLight = new THREE.DirectionalLight(0xe0f2fe, 3.2);
    dirLight.position.set(7, 10, 6);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Cyber Cyan Rim Light (from opposite lower side)
    const cyanRim = new THREE.DirectionalLight(0x06b6d4, 3.0);
    cyanRim.position.set(-8, 3, -6);
    scene.add(cyanRim);

    // Soft Blue Underside Bounce
    const blueBounce = new THREE.DirectionalLight(0x3b82f6, 1.2);
    blueBounce.position.set(0, -6, 2);
    scene.add(blueBounce);

    // 4. Procedural Textures Generation (Canvas)
    const createPcbTexture = () => {
      const texCanvas = document.createElement('canvas');
      texCanvas.width = 1024;
      texCanvas.height = 768;
      const ctx = texCanvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(texCanvas);

      // Deep Obsidian / Blue Silk Base
      ctx.fillStyle = '#081220';
      ctx.fillRect(0, 0, 1024, 768);

      // Copper Ground Plane Mesh Hatching
      ctx.strokeStyle = '#0d223f';
      ctx.lineWidth = 1;
      for (let x = 0; x < 1024; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 768);
        ctx.stroke();
      }
      for (let y = 0; y < 768; y += 16) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1024, y);
        ctx.stroke();
      }

      // PCB Perimeter Gold Border
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, 984, 728);

      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.strokeRect(28, 28, 968, 712);

      // Silkscreen Text & Technical Markings
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Courier New", monospace';
      ctx.fillText('ECE HAMAK - DAMASCUS UNIVERSITY', 50, 65);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 16px "Courier New", monospace';
      ctx.fillText('MCU-32 ADVANCED HARDWARE PLATFORM', 50, 90);
      ctx.fillText('REV 4.2 // HIGH SPEED BUS', 50, 112);

      ctx.fillStyle = '#eab308';
      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.fillText('2026 ROADMAP EDITION', 730, 65);

      // Chip Outline & Pin 1 Index Indicator
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      const chipCenterX = 512;
      const chipCenterY = 384;
      const chipSize = 240;
      ctx.strokeRect(chipCenterX - chipSize / 2, chipCenterY - chipSize / 2, chipSize, chipSize);

      // Pin 1 Index Dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(chipCenterX - chipSize / 2 + 20, chipCenterY - chipSize / 2 + 20, 6, 0, Math.PI * 2);
      ctx.fill();

      // Bus Routing Traces (Gold & Cyan lines radiating from center)
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3;

      // Draw artistic PCB traces
      const tracePaths = [
        [[chipCenterX - 120, 320], [220, 320], [160, 260], [100, 260]],
        [[chipCenterX - 120, 360], [200, 360], [140, 420], [90, 420]],
        [[chipCenterX - 120, 400], [240, 400], [180, 520], [110, 520]],
        [[chipCenterX + 120, 320], [800, 320], [860, 240], [920, 240]],
        [[chipCenterX + 120, 360], [820, 360], [880, 420], [930, 420]],
        [[chipCenterX + 120, 400], [790, 400], [850, 520], [920, 520]],
        [[440, chipCenterY - 120], [440, 200], [380, 140], [380, 70]],
        [[480, chipCenterY - 120], [480, 180], [480, 70]],
        [[540, chipCenterY - 120], [540, 180], [540, 70]],
        [[580, chipCenterY - 120], [580, 200], [640, 140], [640, 70]],
        [[440, chipCenterY + 120], [440, 570], [380, 630], [380, 700]],
        [[480, chipCenterY + 120], [480, 590], [480, 700]],
        [[540, chipCenterY + 120], [540, 590], [540, 700]],
        [[580, chipCenterY + 120], [580, 570], [640, 630], [640, 700]]
      ];

      tracePaths.forEach((path) => {
        ctx.beginPath();
        ctx.moveTo(path[0][0], path[0][1]);
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(path[i][0], path[i][1]);
        }
        ctx.stroke();

        // Via Pad at trace termination
        const last = path[path.length - 1];
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(last[0], last[1], 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Pin Labels along header edges
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText('GND 3V3 5V TX RX SDA SCL CLK MISO MOSI CS INT A0 A1 A2 D13', 140, 720);
      ctx.fillText('PA0 PA1 PA2 PA3 PA4 PA5 PB0 PB1 PB10 PB11 PC13 PC14 PC15', 140, 42);

      const texture = new THREE.CanvasTexture(texCanvas);
      texture.anisotropy = 8;
      return texture;
    };

    // 5. Build 3D Model Hierarchy
    const mcuGroup = new THREE.Group();
    scene.add(mcuGroup);

    const interactiveObjects: { mesh: THREE.Object3D; nameAr: string; descAr: string; type: string }[] = [];

    // --- A. PCB Substrate ---
    const pcbWidth = 7.4;
    const pcbThickness = 0.22;
    const pcbDepth = 5.6;

    const pcbTex = createPcbTexture();
    const pcbMaterial = new THREE.MeshStandardMaterial({
      map: pcbTex,
      color: 0x112338,
      roughness: 0.35,
      metalness: 0.18
    });

    const pcbGeom = new THREE.BoxGeometry(pcbWidth, pcbThickness, pcbDepth);
    const pcbMesh = new THREE.Mesh(pcbGeom, pcbMaterial);
    pcbMesh.receiveShadow = true;
    pcbMesh.castShadow = true;
    mcuGroup.add(pcbMesh);

    // 4 Corner Gold Mounting Holes
    const holeRadius = 0.26;
    const holeOffsetW = pcbWidth / 2 - 0.45;
    const holeOffsetD = pcbDepth / 2 - 0.45;
    const holePositions = [
      [holeOffsetW, 0, holeOffsetD],
      [-holeOffsetW, 0, holeOffsetD],
      [holeOffsetW, 0, -holeOffsetD],
      [-holeOffsetW, 0, -holeOffsetD]
    ];

    const holeMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.25
    });

    holePositions.forEach(([hx, hy, hz]) => {
      const ringGeom = new THREE.CylinderGeometry(holeRadius, holeRadius, pcbThickness + 0.02, 24);
      const ringMesh = new THREE.Mesh(ringGeom, holeMat);
      ringMesh.position.set(hx, hy, hz);
      mcuGroup.add(ringMesh);
    });

    // --- B. Central MCU QFP-64 Processor Chip ---
    const chipWidth = 2.4;
    const chipHeight = 0.32;
    const chipDepth = 2.4;

    // Chip Top Label Texture
    const createChipTopTexture = () => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(c);

      ctx.fillStyle = '#111317';
      ctx.fillRect(0, 0, 512, 512);

      // Subtle silicon texture
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      for (let i = 0; i < 2000; i++) {
        ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
      }

      // Laser Etched Branding
      ctx.fillStyle = '#cbd5e1';
      ctx.textAlign = 'center';

      // Laser etched logo icon
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.strokeRect(216, 110, 80, 80);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(236, 130, 40, 40);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 32px "Courier New", monospace';
      ctx.fillText('ECE-HAMAK', 256, 240);

      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 26px "Courier New", monospace';
      ctx.fillText('STM32-ROADMAP', 256, 280);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '20px "Courier New", monospace';
      ctx.fillText('CORTEX-M4 168MHz', 256, 320);
      ctx.fillText('512KB FLASH / 192KB RAM', 256, 355);

      // Pin 1 Index Dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(60, 60, 14, 0, Math.PI * 2);
      ctx.fill();

      return new THREE.CanvasTexture(c);
    };

    const chipTopTex = createChipTopTexture();
    const chipMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x181a20, roughness: 0.5, metalness: 0.2 }), // sides
      new THREE.MeshStandardMaterial({ color: 0x181a20, roughness: 0.5, metalness: 0.2 }),
      new THREE.MeshStandardMaterial({ map: chipTopTex, roughness: 0.35, metalness: 0.3 }), // top
      new THREE.MeshStandardMaterial({ color: 0x181a20 }), // bottom
      new THREE.MeshStandardMaterial({ color: 0x181a20, roughness: 0.5, metalness: 0.2 }),
      new THREE.MeshStandardMaterial({ color: 0x181a20, roughness: 0.5, metalness: 0.2 })
    ];

    const chipGeom = new THREE.BoxGeometry(chipWidth, chipHeight, chipDepth);
    const chipMesh = new THREE.Mesh(chipGeom, chipMaterials);
    chipMesh.position.set(0, pcbThickness / 2 + chipHeight / 2, 0);
    chipMesh.castShadow = true;
    chipMesh.receiveShadow = true;
    mcuGroup.add(chipMesh);

    interactiveObjects.push({
      mesh: chipMesh,
      nameAr: 'وحدة المعالجة المركزية (ARM Cortex-M4 MCU)',
      descAr: 'المتحكم الدقيق الرئيسي بتردد 168MHz لمعالجة الإشارات الرقمية وتشغيل الأنظمة المدمجة الذكية.',
      type: 'processor'
    });

    // Metallic Gull-Wing Pins surrounding the chip (16 pins per side = 64 pins)
    const pinCountPerSide = 12;
    const pinSpacing = chipWidth / (pinCountPerSide + 1);
    const pinGeom = new THREE.BoxGeometry(0.06, 0.08, 0.38);
    const pinMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.95,
      roughness: 0.18
    });

    // North & South pins
    for (let i = 1; i <= pinCountPerSide; i++) {
      const offset = -chipWidth / 2 + i * pinSpacing;

      // North
      const pinN = new THREE.Mesh(pinGeom, pinMat);
      pinN.position.set(offset, pcbThickness / 2 + 0.05, -chipDepth / 2 - 0.16);
      pinN.castShadow = true;
      mcuGroup.add(pinN);

      // South
      const pinS = new THREE.Mesh(pinGeom, pinMat);
      pinS.position.set(offset, pcbThickness / 2 + 0.05, chipDepth / 2 + 0.16);
      pinS.castShadow = true;
      mcuGroup.add(pinS);
    }

    // East & West pins
    const pinEWGeom = new THREE.BoxGeometry(0.38, 0.08, 0.06);
    for (let i = 1; i <= pinCountPerSide; i++) {
      const offset = -chipDepth / 2 + i * pinSpacing;

      // West
      const pinW = new THREE.Mesh(pinEWGeom, pinMat);
      pinW.position.set(-chipWidth / 2 - 0.16, pcbThickness / 2 + 0.05, offset);
      pinW.castShadow = true;
      mcuGroup.add(pinW);

      // East
      const pinE = new THREE.Mesh(pinEWGeom, pinMat);
      pinE.position.set(chipWidth / 2 + 0.16, pcbThickness / 2 + 0.05, offset);
      pinE.castShadow = true;
      mcuGroup.add(pinE);
    }

    // --- C. Quartz Crystal Oscillator (16.000 MHz) ---
    const crystalGroup = new THREE.Group();
    const crystalCanGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.72, 16);
    crystalCanGeom.rotateZ(Math.PI / 2);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.15
    });
    const crystalMesh = new THREE.Mesh(crystalCanGeom, crystalMat);
    crystalMesh.castShadow = true;
    crystalGroup.add(crystalMesh);

    // Crystal base pads
    const padGeom = new THREE.BoxGeometry(0.2, 0.06, 0.18);
    const padMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9 });
    const pad1 = new THREE.Mesh(padGeom, padMat);
    pad1.position.set(-0.25, -0.15, 0);
    const pad2 = new THREE.Mesh(padGeom, padMat);
    pad2.position.set(0.25, -0.15, 0);
    crystalGroup.add(pad1, pad2);

    crystalGroup.position.set(1.9, pcbThickness / 2 + 0.22, 1.4);
    mcuGroup.add(crystalGroup);

    interactiveObjects.push({
      mesh: crystalMesh,
      nameAr: 'المذبذب البلوري الدقيق (16.000 MHz Crystal Oscillator)',
      descAr: 'يولد نبضات الساعة المرجعية بدقة فائقة لمزامنة عمليات المعالج الرقمي والاتصالات التسلسلية.',
      type: 'crystal'
    });

    // --- D. USB-C Port Receptacle on the left edge ---
    const usbGeom = new THREE.BoxGeometry(0.7, 0.35, 1.1);
    const usbMat = new THREE.MeshStandardMaterial({
      color: 0xcfd8dc,
      metalness: 0.92,
      roughness: 0.22
    });
    const usbMesh = new THREE.Mesh(usbGeom, usbMat);
    usbMesh.position.set(-pcbWidth / 2 + 0.32, pcbThickness / 2 + 0.18, 0);
    usbMesh.castShadow = true;
    mcuGroup.add(usbMesh);

    // USB Opening
    const usbHoleGeom = new THREE.BoxGeometry(0.1, 0.14, 0.7);
    const usbHoleMat = new THREE.MeshBasicMaterial({ color: 0x05070a });
    const usbHole = new THREE.Mesh(usbHoleGeom, usbHoleMat);
    usbHole.position.set(-pcbWidth / 2 + 0.02, pcbThickness / 2 + 0.18, 0);
    mcuGroup.add(usbHole);

    interactiveObjects.push({
      mesh: usbMesh,
      nameAr: 'منفذ البرمجة والطاقة (High-Speed USB-C / UART)',
      descAr: 'واجهة تنزيل الشيفرة البرمجية وتغذية الدارة بجهد 5V مع دعم الاتصال التسلسلي مع الحاسوب.',
      type: 'port'
    });

    // --- E. Dual-Row Gold Pin Headers (GPIO Rails) ---
    const createHeaderRow = (xPos: number, zCount: number, zStart: number, zStep: number) => {
      const headerGroup = new THREE.Group();
      const baseBarGeom = new THREE.BoxGeometry(0.5, 0.28, zCount * zStep);
      const baseBarMat = new THREE.MeshStandardMaterial({ color: 0x1e2430, roughness: 0.7 });
      const baseBar = new THREE.Mesh(baseBarGeom, baseBarMat);
      baseBar.position.set(xPos, pcbThickness / 2 + 0.14, zStart + (zCount * zStep) / 2 - zStep / 2);
      headerGroup.add(baseBar);

      const goldPinGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.65, 8);
      const goldPinMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.95, roughness: 0.1 });

      for (let i = 0; i < zCount; i++) {
        const pinZ = zStart + i * zStep;
        // Outer pin
        const p1 = new THREE.Mesh(goldPinGeom, goldPinMat);
        p1.position.set(xPos - 0.14, pcbThickness / 2 + 0.45, pinZ);
        p1.castShadow = true;
        headerGroup.add(p1);

        // Inner pin
        const p2 = new THREE.Mesh(goldPinGeom, goldPinMat);
        p2.position.set(xPos + 0.14, pcbThickness / 2 + 0.45, pinZ);
        p2.castShadow = true;
        headerGroup.add(p2);
      }
      return headerGroup;
    };

    const headerLeft = createHeaderRow(-2.9, 14, -2.1, 0.32);
    const headerRight = createHeaderRow(2.9, 14, -2.1, 0.32);
    mcuGroup.add(headerLeft, headerRight);

    interactiveObjects.push({
      mesh: headerRight,
      nameAr: 'دبابيس التوسع والمنافذ (GPIO & Bus Expansion Rails)',
      descAr: 'مصفوفة التوصيل الشاملة لمداخل الحساسات والمحركات وشاشات العرض وبروتوكولات SPI / I2C / PWM.',
      type: 'gpio'
    });

    // --- F. Power VRM (Voltage Regulator) & Capacitors ---
    const vrmGeom = new THREE.BoxGeometry(0.65, 0.22, 0.5);
    const vrmMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.4 });
    const vrmMesh = new THREE.Mesh(vrmGeom, vrmMat);
    vrmMesh.position.set(-1.8, pcbThickness / 2 + 0.12, -1.8);
    mcuGroup.add(vrmMesh);

    // VRM Heatsink Tab
    const tabGeom = new THREE.BoxGeometry(0.55, 0.05, 0.22);
    const tabMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
    const tabMesh = new THREE.Mesh(tabGeom, tabMat);
    tabMesh.position.set(-1.8, pcbThickness / 2 + 0.15, -2.06);
    mcuGroup.add(tabMesh);

    // Surface Mount Ceramic Capacitors (SMD 0805)
    const capPositions = [
      [-0.8, -1.6], [-0.5, -1.6], [0.5, -1.6], [0.8, -1.6],
      [-1.6, -0.6], [-1.6, 0.6], [1.6, -0.6], [1.6, 0.6],
      [-0.6, 1.6], [0.6, 1.6], [1.6, 1.6], [-1.8, -1.2]
    ];

    const capGeom = new THREE.BoxGeometry(0.24, 0.14, 0.16);
    const capMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.35 });
    capPositions.forEach(([cx, cz]) => {
      const capMesh = new THREE.Mesh(capGeom, capMat);
      capMesh.position.set(cx, pcbThickness / 2 + 0.07, cz);
      mcuGroup.add(capMesh);
    });

    // SMD Resistors (Black with white stripes)
    const resPositions = [
      [-1.0, -1.9], [-0.7, -1.9], [0.7, -1.9], [1.0, -1.9],
      [-1.9, 1.2], [-1.9, 1.5], [1.9, -1.2], [1.9, -1.5]
    ];
    const resGeom = new THREE.BoxGeometry(0.22, 0.1, 0.14);
    const resMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.5 });
    resPositions.forEach(([rx, rz]) => {
      const resMesh = new THREE.Mesh(resGeom, resMat);
      resMesh.position.set(rx, pcbThickness / 2 + 0.05, rz);
      mcuGroup.add(resMesh);
    });

    // =========================================================================
    // --- G. PRACTICAL RLC COMPONENTS (RESISTOR, CAPACITOR, INDUCTOR) ---
    // Realistic through-hole and power filter components with interactive inspection
    // =========================================================================

    // 1. PRACTICAL COLOR-BANDED RESISTOR (مقاومة كربونية كلاسيكية مع حلقات لونية)
    const resistorGroup = new THREE.Group();
    resistorGroup.position.set(-1.75, pcbThickness / 2 + 0.16, 0.7);

    // Ceramic/carbon body (axial bone shape with slight bulge)
    const resBodyGeom = new THREE.CylinderGeometry(0.13, 0.13, 0.58, 20);
    resBodyGeom.rotateZ(Math.PI / 2);
    const resBodyMat = new THREE.MeshStandardMaterial({
      color: 0xd4b886, // Classic beige / light tan carbon film resistor body
      roughness: 0.35,
      metalness: 0.05
    });
    const resistorBody = new THREE.Mesh(resBodyGeom, resBodyMat);
    resistorBody.castShadow = true;
    resistorGroup.add(resistorBody);

    // Color bands (Brown = 1, Black = 0, Red = x100, Gold = 5% tolerance -> 1 kΩ Resistor)
    const bandMatBrown = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.3 });
    const bandMatBlack = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
    const bandMatRed = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 });
    const bandMatGold = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });

    const bandWidth = 0.045;
    const bandGeom = new THREE.CylinderGeometry(0.136, 0.136, bandWidth, 20);
    bandGeom.rotateZ(Math.PI / 2);

    const b1 = new THREE.Mesh(bandGeom, bandMatBrown);
    b1.position.x = -0.16;
    const b2 = new THREE.Mesh(bandGeom, bandMatBlack);
    b2.position.x = -0.06;
    const b3 = new THREE.Mesh(bandGeom, bandMatRed);
    b3.position.x = 0.04;
    const b4 = new THREE.Mesh(bandGeom, bandMatGold);
    b4.position.x = 0.17;
    resistorGroup.add(b1, b2, b3, b4);

    // Axial tinned copper wire leads bent downwards into PCB
    const wireMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, metalness: 0.9, roughness: 0.2 });
    const wireGeom = new THREE.CylinderGeometry(0.022, 0.022, 0.22, 10);
    const wireLeft = new THREE.Mesh(wireGeom, wireMat);
    wireLeft.rotation.z = Math.PI / 2;
    wireLeft.position.set(-0.38, 0, 0);
    const wireLeftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.16, 10), wireMat);
    wireLeftLeg.position.set(-0.48, -0.08, 0);

    const wireRight = new THREE.Mesh(wireGeom, wireMat);
    wireRight.rotation.z = Math.PI / 2;
    wireRight.position.set(0.38, 0, 0);
    const wireRightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.16, 10), wireMat);
    wireRightLeg.position.set(0.48, -0.08, 0);

    resistorGroup.add(wireLeft, wireLeftLeg, wireRight, wireRightLeg);
    mcuGroup.add(resistorGroup);

    // Make Resistor Interactive
    interactiveObjects.push({
      mesh: resistorBody,
      nameAr: 'المقاومة الكهربائية الكربونية (1 kΩ Carbon Film Resistor)',
      descAr: 'مقاومة عملية بقيمة 1kΩ (بني-أسود-أحمر-ذهبي)، تُستخدم للحد من شدة التيار وحماية المكونات وضبط جهود الانحياز.',
      type: 'resistor'
    });

    // 2. PRACTICAL ELECTROLYTIC CAPACITOR (مكثف كيميائي إلكتروليتي أسطواني بقطبية وشريط سالب)
    const capacitorGroup = new THREE.Group();
    capacitorGroup.position.set(-1.8, pcbThickness / 2 + 0.38, -0.65);

    // Can Cylinder
    const capCanGeom = new THREE.CylinderGeometry(0.28, 0.28, 0.72, 24);
    const capCanMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a, // Navy / Royal Blue casing
      roughness: 0.3,
      metalness: 0.15
    });
    const capCan = new THREE.Mesh(capCanGeom, capCanMat);
    capCan.castShadow = true;
    capacitorGroup.add(capCan);

    // Metallic Top Vent Cap (Aluminium top with score marks)
    const capTopGeom = new THREE.CylinderGeometry(0.26, 0.26, 0.04, 24);
    const capTopMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      metalness: 0.85,
      roughness: 0.25
    });
    const capTop = new THREE.Mesh(capTopGeom, capTopMat);
    capTop.position.y = 0.36;
    capacitorGroup.add(capTop);

    // Negative Stripe (White/Silver polarity indicator line)
    const stripeGeom = new THREE.BoxGeometry(0.06, 0.68, 0.29);
    const stripeMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.4
    });
    const stripe = new THREE.Mesh(stripeGeom, stripeMat);
    stripe.position.set(-0.14, 0, 0);
    capacitorGroup.add(stripe);

    // Base rubber seal & leads
    const rubberBaseGeom = new THREE.CylinderGeometry(0.25, 0.25, 0.05, 24);
    const rubberBaseMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8 });
    const rubberBase = new THREE.Mesh(rubberBaseGeom, rubberBaseMat);
    rubberBase.position.y = -0.37;
    capacitorGroup.add(rubberBase);

    const capLead1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.14, 10), wireMat);
    capLead1.position.set(-0.1, -0.44, 0);
    const capLead2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.14, 10), wireMat);
    capLead2.position.set(0.1, -0.44, 0);
    capacitorGroup.add(capLead1, capLead2);

    mcuGroup.add(capacitorGroup);

    // Make Capacitor Interactive
    interactiveObjects.push({
      mesh: capCan,
      nameAr: 'المكثف الإلكتروليتي (100 µF / 25V Electrolytic Capacitor)',
      descAr: 'مكثف كيميائي أسطواني بقطبية لتخزين الشحنة الكهربائية، تنعيم تموجات جهد التغذية، وترشيح الترددات المنخفضة.',
      type: 'capacitor'
    });

    // 3. PRACTICAL TOROIDAL POWER INDUCTOR (ملف خنق حثي حلقي بأسلاك نحاسية ملفوفة)
    const inductorGroup = new THREE.Group();
    inductorGroup.position.set(-0.85, pcbThickness / 2 + 0.22, -1.85);

    // Ferrite Toroid Core Ring
    const toroidGeom = new THREE.TorusGeometry(0.26, 0.09, 16, 32);
    toroidGeom.rotateX(Math.PI / 2);
    const toroidMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Dark slate ferrite core
      roughness: 0.6,
      metalness: 0.2
    });
    const toroidMesh = new THREE.Mesh(toroidGeom, toroidMat);
    toroidMesh.castShadow = true;
    inductorGroup.add(toroidMesh);

    // Enamelled Copper Wire Windings (12 realistic wire turns wound around the ring)
    const copperTurnMat = new THREE.MeshStandardMaterial({
      color: 0xb45309, // Enamelled reddish copper wire
      metalness: 0.92,
      roughness: 0.22
    });
    const turnGeom = new THREE.TorusGeometry(0.12, 0.024, 10, 18);
    const turnCount = 12;
    for (let t = 0; t < turnCount; t++) {
      const angle = (t / turnCount) * Math.PI * 2;
      const turnMesh = new THREE.Mesh(turnGeom, copperTurnMat);
      turnMesh.position.set(Math.cos(angle) * 0.26, 0, Math.sin(angle) * 0.26);
      turnMesh.rotation.y = -angle;
      turnMesh.castShadow = true;
      inductorGroup.add(turnMesh);
    }

    // Lead wires into PCB
    const indLead1 = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.18, 10), copperTurnMat);
    indLead1.position.set(-0.24, -0.12, -0.15);
    const indLead2 = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.18, 10), copperTurnMat);
    indLead2.position.set(0.24, -0.12, -0.15);
    inductorGroup.add(indLead1, indLead2);

    mcuGroup.add(inductorGroup);

    // Make Inductor Interactive
    interactiveObjects.push({
      mesh: toroidMesh,
      nameAr: 'الملف الحثي الحلقي (47 µH Toroidal Power Inductor)',
      descAr: 'ملف خنق حثي ذو قلب فريت وأسلاك نحاسية معزولة، يُخزن الطاقة مغناطيسياً ويرشح الضجيج الكهرومغناطيسي EMI.',
      type: 'inductor'
    });

    // --- G. Realistic Blinking Status LEDs ---
    const ledPositions = [
      { pos: [-1.4, pcbThickness / 2 + 0.08, -1.8], color: 0x10b981, label: 'PWR' },
      { pos: [-1.0, pcbThickness / 2 + 0.08, -1.8], color: 0x06b6d4, label: 'RX' },
      { pos: [-0.6, pcbThickness / 2 + 0.08, -1.8], color: 0x38bdf8, label: 'TX' },
      { pos: [1.8, pcbThickness / 2 + 0.08, -1.8], color: 0xf59e0b, label: 'STAT' }
    ];

    const ledPointLights: THREE.PointLight[] = [];

    ledPositions.forEach((led) => {
      const ledGeom = new THREE.BoxGeometry(0.12, 0.08, 0.14);
      const ledMat = new THREE.MeshStandardMaterial({
        color: led.color,
        emissive: led.color,
        emissiveIntensity: 1.8,
        roughness: 0.1
      });
      const ledMesh = new THREE.Mesh(ledGeom, ledMat);
      ledMesh.position.set(...(led.pos as [number, number, number]));
      mcuGroup.add(ledMesh);

      // Point Light emission illuminating nearby PCB
      const pointLight = new THREE.PointLight(led.color, 1.4, 2.4);
      pointLight.position.set(led.pos[0], led.pos[1] + 0.15, led.pos[2]);
      mcuGroup.add(pointLight);
      ledPointLights.push(pointLight);
    });

    // --- H. Animated Signal Photon Particles Flowing in Space ---
    const particleCount = 180;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      particlePositions[idx] = (Math.random() - 0.5) * 8;
      particlePositions[idx + 1] = (Math.random() - 0.2) * 3;
      particlePositions[idx + 2] = (Math.random() - 0.5) * 7;

      particleVelocities[idx] = (Math.random() - 0.5) * 0.015;
      particleVelocities[idx + 1] = (Math.random() - 0.5) * 0.012;
      particleVelocities[idx + 2] = (Math.random() - 0.5) * 0.015;
    }

    const particlesGeom = new THREE.BufferGeometry();
    particlesGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particlesMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.08,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    const traceParticles = new THREE.Points(particlesGeom, particlesMat);
    scene.add(traceParticles);

    // Save Three Ref
    threeRef.current = {
      renderer,
      scene,
      camera,
      mcuGroup,
      traceParticles,
      ledPointLights,
      targetCamPos,
      targetLookAt,
      currentLookAt,
      targetBoardRot,
      isDragging: false,
      prevMouseX: 0,
      prevMouseY: 0,
      userRotX: 0,
      userRotY: 0,
      raycaster: new THREE.Raycaster(),
      mouse: new THREE.Vector2(),
      interactiveObjects
    };

    // 6. Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !threeRef.current) return;
      const w = containerRef.current.clientWidth || 400;
      const h = containerRef.current.clientHeight || 300;
      threeRef.current.camera.aspect = w / h;
      threeRef.current.camera.updateProjectionMatrix();
      threeRef.current.renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 7. Animation Loop with Smooth Angle Transitions & Gentle Float
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      if (!threeRef.current) return;
      const {
        camera,
        renderer,
        scene,
        mcuGroup,
        traceParticles,
        ledPointLights,
        targetCamPos,
        targetLookAt,
        currentLookAt,
        targetBoardRot,
        userRotX,
        userRotY
      } = threeRef.current;

      // Smooth Camera Interpolation (Damping Lerp to Target Preset)
      camera.position.lerp(targetCamPos, 0.045);
      currentLookAt.lerp(targetLookAt, 0.045);
      camera.lookAt(currentLookAt);

      // Subtle Atmospheric Levitation & Breathing
      const floatY = Math.sin(time * 1.1) * 0.06;
      const swayZ = Math.sin(time * 0.8) * 0.012;
      mcuGroup.position.y = floatY;

      // Smooth Board Rotation Lerp to Active Scene Orientation + Gentle Breathing + User Controls
      const baseRotX = targetBoardRot.x + userRotX;
      const baseRotY = targetBoardRot.y + userRotY + (isAutoOrbit ? Math.sin(time * 0.45) * 0.09 : 0);
      const baseRotZ = targetBoardRot.z + swayZ;

      mcuGroup.rotation.x = THREE.MathUtils.lerp(mcuGroup.rotation.x, baseRotX, 0.05);
      mcuGroup.rotation.y = THREE.MathUtils.lerp(mcuGroup.rotation.y, baseRotY, 0.05);
      mcuGroup.rotation.z = THREE.MathUtils.lerp(mcuGroup.rotation.z, baseRotZ, 0.05);

      // LED Blinking Pulse Simulation
      ledPointLights.forEach((light, i) => {
        const pulse = Math.sin(time * (4 + i * 3)) * 0.5 + 0.5;
        light.intensity = 0.8 + pulse * 1.5;
      });

      // Animate Signal Particles
      const posAttr = traceParticles.geometry.attributes.position as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        positions[idx] += particleVelocities[idx];
        positions[idx + 1] += particleVelocities[idx + 1];
        positions[idx + 2] += particleVelocities[idx + 2];

        // Boundary wrap
        if (Math.abs(positions[idx]) > 4.5) positions[idx] *= -0.9;
        if (Math.abs(positions[idx + 1]) > 2.5) positions[idx + 1] *= -0.9;
        if (Math.abs(positions[idx + 2]) > 3.8) positions[idx + 2] *= -0.9;
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      pcbTex.dispose();
      chipTopTex.dispose();
    };
  }, []);

  // Update target camera position when preset changes
  useEffect(() => {
    if (!threeRef.current) return;
    const preset = SCENE_CAMERA_PRESETS[activePreset] || SCENE_CAMERA_PRESETS.hero;
    threeRef.current.targetCamPos.set(...preset.pos);
    threeRef.current.targetLookAt.set(...preset.target);
    if (preset.boardRot) {
      threeRef.current.targetBoardRot.set(...preset.boardRot);
    }
  }, [activePreset]);

  // Pointer / Drag Rotation Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isInteractive || !threeRef.current) return;
    threeRef.current.isDragging = true;
    threeRef.current.prevMouseX = e.clientX;
    threeRef.current.prevMouseY = e.clientY;
    setIsAutoOrbit(false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!threeRef.current) return;

    // Raycast check for hover component highlight
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      threeRef.current.mouse.set(x, y);

      threeRef.current.raycaster.setFromCamera(threeRef.current.mouse, threeRef.current.camera);
      const meshesToTest = threeRef.current.interactiveObjects.map((o) => o.mesh);
      const intersects = threeRef.current.raycaster.intersectObjects(meshesToTest, true);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const found = threeRef.current.interactiveObjects.find((o) => {
          if (o.mesh === hit) return true;
          if (o.mesh.children && o.mesh.children.includes(hit)) return true;
          // Check if hit's parent or ancestor matches
          let parent: THREE.Object3D | null = hit.parent;
          while (parent && parent !== threeRef.current?.mcuGroup && parent !== threeRef.current?.scene) {
            if (parent === o.mesh || (parent.children && parent.children.includes(o.mesh))) return true;
            parent = parent.parent;
          }
          return false;
        });
        if (found) {
          setActiveComponentName(found.nameAr);
          setActiveComponentDesc(found.descAr);
        }
      }
    }

    if (!isInteractive || !threeRef.current.isDragging) return;
    const deltaX = e.clientX - threeRef.current.prevMouseX;
    const deltaY = e.clientY - threeRef.current.prevMouseY;

    threeRef.current.userRotY += deltaX * 0.007;
    threeRef.current.userRotX = Math.max(-0.8, Math.min(0.8, threeRef.current.userRotX + deltaY * 0.007));

    threeRef.current.prevMouseX = e.clientX;
    threeRef.current.prevMouseY = e.clientY;
  };

  const handlePointerUp = () => {
    if (threeRef.current) {
      threeRef.current.isDragging = false;
    }
  };

  const handleCanvasClick = () => {
    if (!threeRef.current || !activeComponentName) return;
    if (onSelectComponent && activeComponentDesc) {
      onSelectComponent({
        nameAr: activeComponentName,
        descAr: activeComponentDesc,
        type: 'hardware'
      });
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        handlePointerUp();
      }}
      className={`relative w-full h-full select-none overflow-hidden ${className}`}
    >
      {/* Three.js Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Floating HUD Information Badge */}
      <div className="absolute top-3 right-3 pointer-events-none z-10 flex flex-col items-end gap-1.5" dir="rtl">
        {!subtleHud && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#071324]/85 border border-cyan-500/40 text-cyan-300 text-xs font-mono backdrop-blur-md shadow-lg shadow-cyan-950/40">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold">المجسم العتادي 3D MCU</span>
          </div>
        )}

        {activeComponentName && (
          <div className="animate-in fade-in slide-in-from-top-1 duration-200 px-3 py-2 rounded-2xl bg-[#09182d]/95 border border-cyan-400/50 text-right max-w-xs backdrop-blur-md shadow-xl shadow-cyan-950/60 pointer-events-auto">
            <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>{activeComponentName}</span>
            </div>
            {activeComponentDesc && (
              <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">
                {activeComponentDesc}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Active Angle Preset Tag at Bottom Left */}
      {!subtleHud && (
        <div className="absolute bottom-3 left-3 pointer-events-none z-10 flex items-center gap-2" dir="rtl">
          <div className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-slate-400 backdrop-blur-sm">
            <span className="text-cyan-400 font-bold">زاوية الرؤية: </span>
            <span>{SCENE_CAMERA_PRESETS[activePreset]?.nameAr || 'منظور ديناميكي'}</span>
          </div>
        </div>
      )}

      {/* Interactive Controls Bar (Camera Presets & Auto-orbit) */}
      {showControls && (
        <div 
          className={`absolute bottom-3 right-3 z-20 flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#071324]/90 border border-cyan-900/60 backdrop-blur-md shadow-xl transition-all duration-300 ${
            compact ? 'scale-90 origin-bottom-right' : ''
          }`}
          dir="rtl"
        >
          {/* Quick Perspective Selector Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setActivePreset('hero');
                setIsAutoOrbit(false);
              }}
              title="منظور مجسم 3D Isometric"
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                activePreset === 'hero'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              مجسم
            </button>

            <button
              type="button"
              onClick={() => {
                setActivePreset('top');
                setIsAutoOrbit(false);
              }}
              title="مخطط علوي هندسي Top Blueprint"
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                activePreset === 'top'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              علوي
            </button>

            <button
              type="button"
              onClick={() => {
                setActivePreset('macro');
                setIsAutoOrbit(false);
              }}
              title="فحص مجهري لشريحة المعالج"
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                activePreset === 'macro'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              المعالج
            </button>

            <button
              type="button"
              onClick={() => {
                setActivePreset('rlc');
                setIsAutoOrbit(false);
              }}
              title="فحص عناصر المقاومة والمكثف والملف RLC"
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                activePreset === 'rlc'
                  ? 'bg-amber-400 text-slate-950 shadow-sm font-extrabold'
                  : 'bg-slate-900 text-amber-300/80 hover:text-amber-200 hover:bg-slate-800'
              }`}
            >
              RLC
            </button>

            <button
              type="button"
              onClick={() => {
                setActivePreset('side');
                setIsAutoOrbit(false);
              }}
              title="منظور جانبي للدبابيس"
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                activePreset === 'side'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              جانبي
            </button>
          </div>

          <div className="w-[1px] h-4 bg-slate-800 mx-0.5" />

          {/* Auto-Orbit Toggle Button */}
          <button
            type="button"
            onClick={() => setIsAutoOrbit(!isAutoOrbit)}
            title={isAutoOrbit ? 'إيقاف الدوران التلقائي' : 'تشغيل الدوران التلقائي'}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              isAutoOrbit 
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50' 
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isAutoOrbit ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          </button>
        </div>
      )}
    </div>
  );
};
