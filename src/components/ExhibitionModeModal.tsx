import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause, 
  Layers, 
  Map, 
  Sparkles, 
  QrCode, 
  GraduationCap, 
  Cpu, 
  BookOpen, 
  ChevronLeft,
  ChevronRight,
  Radio,
  Wifi,
  Terminal,
  Activity,
  Award,
  Zap,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  Smartphone,
  ShieldCheck,
  Compass,
  ArrowLeft,
  Laptop,
  Gauge
} from 'lucide-react';
import { YEAR_MILESTONES } from '../data/years';
import { SOFTWARE_DATA } from '../data/software';
import { COURSES_DATA } from '../data/courses';
import { GRADUATION_PROJECTS_DATA } from '../data/graduationProjects';
import { QRCodeDisplay } from './QRCodeDisplay';
import { CircuitBackground } from './CircuitBackground';
import { exhibitionRepository } from '../services/admin/exhibitionRepository';
import { ExhibitionFullConfig, ExhibitionSlideId } from '../types/exhibition';
import { DEFAULT_EXHIBITION_CONFIG } from '../data/defaultExhibition';
import { getProductionAppUrl } from '../lib/firebase';

interface ExhibitionModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type ExhibitionSceneId = ExhibitionSlideId;

interface SceneConfig {
  id: ExhibitionSceneId;
  indexLabel: string;
  titleAr: string;
  subtitleAr: string;
  durationMs: number;
  icon: React.ComponentType<{ className?: string }>;
}

const ICON_LOOKUP: Record<string, React.ComponentType<{ className?: string }>> = {
  Radio,
  Activity,
  Cpu,
  Terminal,
  Zap,
  Wifi,
  ShieldCheck,
  Sparkles,
  Briefcase,
  Layers,
  Map,
  Laptop,
  GraduationCap,
  Smartphone,
  QrCode
};

const METRIC_THEMES: Record<string, { border: string; bg: string; text: string; glow: string }> = {
  cyan: { border: 'border-cyan-500/40', bg: 'bg-[#081528]/90', text: 'text-cyan-400', glow: 'bg-cyan-500/10' },
  blue: { border: 'border-blue-500/40', bg: 'bg-[#081528]/90', text: 'text-blue-400', glow: 'bg-blue-500/10' },
  sky: { border: 'border-sky-500/40', bg: 'bg-[#081528]/90', text: 'text-sky-400', glow: 'bg-sky-500/10' },
  emerald: { border: 'border-emerald-500/40', bg: 'bg-[#081528]/90', text: 'text-emerald-400', glow: 'bg-emerald-500/10' },
  purple: { border: 'border-purple-500/40', bg: 'bg-[#081528]/90', text: 'text-purple-400', glow: 'bg-purple-500/10' },
  amber: { border: 'border-amber-500/40', bg: 'bg-[#081528]/90', text: 'text-amber-400', glow: 'bg-amber-500/10' }
};

export const ExhibitionModeModal: React.FC<ExhibitionModeModalProps> = ({
  isOpen,
  onClose
}) => {
  // Live Config loaded from Firestore repository
  const [exhibitionConfig, setExhibitionConfig] = useState<ExhibitionFullConfig>(() => 
    exhibitionRepository.getCachedConfig()
  );

  useEffect(() => {
    if (!isOpen) return;
    const unsub = exhibitionRepository.subscribe((loaded) => {
      if (loaded) setExhibitionConfig(loaded);
    });
    return () => unsub();
  }, [isOpen]);

  // Scene Engine State
  const [currentScene, setCurrentScene] = useState<ExhibitionSceneId>('hero');
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  
  // Journey Sub-state (5 Years progression)
  const [journeyYearIndex, setJourneyYearIndex] = useState(0);

  // Software Toolkit Sub-state (rotating group)
  const [softwareGroupIndex, setSoftwareGroupIndex] = useState(0);

  // Skills Pipeline active index
  const [activeSkillPipelineIndex, setActiveSkillPipelineIndex] = useState(0);

  // Timer reference & idle controls timer
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sceneTimerRef = useRef<NodeJS.Timeout | null>(null);
  const journeyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize fullscreen state with browser events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      if (!active) {
        setIsControlsVisible(true);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Map slide ID to default icon
  const getSceneIcon = (id: ExhibitionSceneId) => {
    switch (id) {
      case 'hero': return Layers;
      case 'journey': return Map;
      case 'skills_pipeline': return Sparkles;
      case 'software_toolkit': return Cpu;
      case 'graduation_projects': return GraduationCap;
      case 'careers': return Briefcase;
      case 'qr_portal': return QrCode;
      default: return Layers;
    }
  };

  // Define Scenes Configuration dynamically from loaded slides
  const scenes: SceneConfig[] = useMemo(() => {
    const slides = exhibitionConfig?.slides || DEFAULT_EXHIBITION_CONFIG.slides;
    return slides
      .filter((s) => s.isEnabled !== false)
      .map((s) => ({
        id: s.id,
        indexLabel: s.indexLabel,
        titleAr: s.titleAr,
        subtitleAr: s.subtitleAr,
        durationMs: (s.durationSeconds || 8) * 1000,
        icon: getSceneIcon(s.id)
      }));
  }, [exhibitionConfig]);

  // Skill Pipelines data
  const skillPipelines = useMemo(() => {
    return exhibitionConfig?.skills?.pipelines || DEFAULT_EXHIBITION_CONFIG.skills.pipelines;
  }, [exhibitionConfig]);

  // Career paths data
  const careerPaths = useMemo(() => {
    const list = exhibitionConfig?.careers?.careers || DEFAULT_EXHIBITION_CONFIG.careers.careers;
    return list.map((c) => ({
      ...c,
      icon: ICON_LOOKUP[c.iconKey] || Briefcase
    }));
  }, [exhibitionConfig]);

  // Central Scene Switcher with Smooth Cinematic Cross-Fade
  const navigateToScene = (sceneId: ExhibitionSceneId) => {
    if (sceneId === currentScene) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentScene(sceneId);
      if (sceneId === 'journey') {
        setJourneyYearIndex(0);
      }
      setTimeout(() => {
        setIsTransitioning(false);
      }, 400);
    }, 400);
  };

  const nextScene = () => {
    const currentIndex = scenes.findIndex((s) => s.id === currentScene);
    const nextIndex = (currentIndex + 1) % scenes.length;
    navigateToScene(scenes[nextIndex].id);
  };

  const prevScene = () => {
    const currentIndex = scenes.findIndex((s) => s.id === currentScene);
    const prevIndex = (currentIndex - 1 + scenes.length) % scenes.length;
    navigateToScene(scenes[prevIndex].id);
  };

  // Auto-play scene engine loop
  useEffect(() => {
    if (!isOpen || !isAutoPlay) {
      if (sceneTimerRef.current) clearTimeout(sceneTimerRef.current);
      if (journeyTimerRef.current) clearInterval(journeyTimerRef.current);
      return;
    }

    const currentConfig = scenes.find((s) => s.id === currentScene);
    const baseDuration = currentConfig ? currentConfig.durationMs : 8000;
    // Scale duration inversely with playbackSpeed (1.0 = standard speed, 0.1 = 10x slower / very calm)
    const safeSpeed = Math.max(0.08, playbackSpeed);
    const duration = Math.round(baseDuration / safeSpeed);

    // Special sub-timer for the 5-Year Journey scene to animate 0 -> 1 -> 2 -> 3 -> 4
    if (currentScene === 'journey') {
      const yearStepMs = Math.round(3800 / safeSpeed);
      let currentYear = 0;
      setJourneyYearIndex(0);

      journeyTimerRef.current = setInterval(() => {
        currentYear++;
        if (currentYear < 5) {
          setJourneyYearIndex(currentYear);
        } else {
          if (journeyTimerRef.current) clearInterval(journeyTimerRef.current);
        }
      }, yearStepMs);

      sceneTimerRef.current = setTimeout(() => {
        nextScene();
      }, duration);
    } 
    else if (currentScene === 'skills_pipeline') {
      // Rotate through skill pipelines
      const skillStepMs = Math.round(2500 / safeSpeed);
      const skillInterval = setInterval(() => {
        setActiveSkillPipelineIndex((prev) => (prev + 1) % skillPipelines.length);
      }, skillStepMs);

      sceneTimerRef.current = setTimeout(() => {
        clearInterval(skillInterval);
        nextScene();
      }, duration);

      return () => clearInterval(skillInterval);
    }
    else if (currentScene === 'software_toolkit') {
      // Rotate software groups
      const swStepMs = Math.round(4500 / safeSpeed);
      const swInterval = setInterval(() => {
        setSoftwareGroupIndex((prev) => (prev + 1) % 2);
      }, swStepMs);

      sceneTimerRef.current = setTimeout(() => {
        clearInterval(swInterval);
        nextScene();
      }, duration);

      return () => clearInterval(swInterval);
    }
    else {
      sceneTimerRef.current = setTimeout(() => {
        nextScene();
      }, duration);
    }

    return () => {
      if (sceneTimerRef.current) clearTimeout(sceneTimerRef.current);
      if (journeyTimerRef.current) clearInterval(journeyTimerRef.current);
    };
  }, [isOpen, isAutoPlay, currentScene, scenes, skillPipelines.length, playbackSpeed]);

  // Handle keyboard events (RTL friendly)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        // Next in RTL
        nextScene();
      } else if (e.key === 'ArrowRight') {
        // Prev in RTL
        prevScene();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsAutoPlay((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentScene]);

  // Idle controls: ONLY auto-hide when in Fullscreen mode after an extended relaxed duration (9 seconds)
  const resetIdleTimer = () => {
    setIsControlsVisible(true);
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    if (isFullscreen) {
      idleTimeoutRef.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 9000);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    resetIdleTimer();
    return () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, [isOpen, currentScene, isFullscreen]);

  if (!isOpen) return null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // When not in fullscreen, controls always stay visible
  const shouldShowControls = !isFullscreen || isControlsVisible;

  // Selected Year in Journey
  const currentMilestone = YEAR_MILESTONES[journeyYearIndex] || YEAR_MILESTONES[0];
  const currentMilestoneCourses = COURSES_DATA.filter((c) => c.year === currentMilestone.yearNumber);
  const currentMilestoneSoftware = SOFTWARE_DATA.filter((s) => s.academicYears.includes(currentMilestone.yearNumber));

  // Software Toolkit Paginated Sets (6 per set)
  const softwareSubset = softwareGroupIndex === 0 
    ? SOFTWARE_DATA.slice(0, 6) 
    : SOFTWARE_DATA.slice(6, 12);

  // Current Live App URL
  const currentAppUrl = getProductionAppUrl();

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#050b14] text-slate-100 flex flex-col overflow-hidden font-sans select-none"
      dir="rtl"
      onMouseMove={resetIdleTimer}
      onClick={resetIdleTimer}
      onTouchStart={resetIdleTimer}
    >
      {/* ========================================================================= */}
      {/* ANIMATED CIRCUIT BACKGROUND & CINEMATIC ATMOSPHERE (Same as Main Platform) */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Main site live animated interactive circuit canvas */}
        <CircuitBackground />

        {/* Ambient Radial Depth Glows */}
        <div className="absolute -top-32 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[130px]" />
        <div className="absolute -bottom-32 left-1/4 w-[650px] h-[650px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-950/20 rounded-full blur-[160px]" />

        {/* Subtle Engineering Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #06b6d4 1px, transparent 1px),
              linear-gradient(to bottom, #06b6d4 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px'
          }}
        />
      </div>

      {/* Soft Ambient Cinematic Glow Transition (No harsh horizontal line) */}
      {isTransitioning && (
        <div className="absolute inset-0 z-30 pointer-events-none transition-opacity duration-400 bg-cyan-500/[0.02] backdrop-blur-[0.5px]" />
      )}

      {/* ========================================================================= */}
      {/* TOP HEADER & ENGINEERING PROGRESS STRIP                                   */}
      {/* ========================================================================= */}
      <header 
        className={`transition-all duration-300 z-30 bg-[#071224]/90 backdrop-blur-md border-b border-cyan-900/40 px-4 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-4 shrink-0 ${
          shouldShowControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
        }`}
      >
        {/* Brand & Placemark */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-950/80 border border-cyan-400/40 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-black font-mono tracking-tight text-white">
                ECE <span className="text-cyan-400">RoadMap</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-600/70 text-[10px] font-mono font-bold tracking-wider">
                EXHIBITION ✦ ملتقى الهمك
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              هندسة الإلكترونيات والاتصالات &bull; جامعة دمشق
            </p>
          </div>
        </div>

        {/* Dynamic Scene Navigation Chips */}
        <div className="hidden lg:flex items-center gap-1.5 xl:gap-2">
          {scenes.map((scene) => {
            const Icon = scene.icon;
            const isActive = currentScene === scene.id;
            return (
              <button
                key={scene.id}
                onClick={() => navigateToScene(scene.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all min-h-[38px] ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 scale-105'
                    : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span className="font-mono text-[10px] opacity-75">{scene.indexLabel}</span>
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-cyan-400'}`} />
                <span>{scene.titleAr}</span>
              </button>
            );
          })}
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center gap-2">
          {/* AutoPlay Toggle */}
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            title={isAutoPlay ? 'إيقاف التشغيل التلقائي (Space)' : 'تشغيل العرض التلقائي'}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[38px] ${
              isAutoPlay
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-sm'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {isAutoPlay ? (
              <>
                <Pause className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">عرض تلقائي نشط</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">تشغيل العرض</span>
              </>
            )}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-300 hover:text-white transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center hidden sm:flex"
            title="ملء الشاشة"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Exit Button */}
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-200 text-xs font-bold flex items-center gap-1 transition-colors min-h-[38px]"
            title="إنهاء وضع الملتقى (Esc)"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN CINEMATIC STAGE VIEWPORT (Safe Area Clamped Layout)                   */}
      {/* ========================================================================= */}
      <main 
        className="flex-1 flex flex-col justify-center relative w-full overflow-hidden"
        style={{
          paddingInline: 'clamp(20px, 4vw, 80px)',
          paddingBlock: 'clamp(16px, 3vh, 48px)'
        }}
      >
        <div 
          className={`w-full flex-1 flex flex-col justify-center transition-all duration-500 ease-out ${
            isTransitioning 
              ? 'opacity-0 scale-[0.985] blur-[1px]' 
              : 'opacity-100 scale-100 blur-0'
          }`}
        >
        {/* ===================================================================== */}
        {/* SCENE 01: HERO & OPENING REVEAL                                       */}
        {/* ===================================================================== */}
        {currentScene === 'hero' && (
          <div className="max-w-6xl mx-auto w-full text-center space-y-6 sm:space-y-8 my-auto animate-fadeIn">
            {/* Placemark Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/90 border border-cyan-500/60 text-cyan-300 text-xs sm:text-sm font-mono tracking-wider shadow-lg shadow-cyan-950/80">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>{exhibitionConfig?.hero?.placemarkBadge || DEFAULT_EXHIBITION_CONFIG.hero.placemarkBadge}</span>
            </div>

            {/* Department Master Title */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white tracking-tight leading-tight">
                {exhibitionConfig?.hero?.mainTitle || DEFAULT_EXHIBITION_CONFIG.hero.mainTitle}
              </h1>
              <p className="text-xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-l from-cyan-400 via-sky-300 to-blue-400 font-sans">
                {exhibitionConfig?.hero?.subtitleGradient || DEFAULT_EXHIBITION_CONFIG.hero.subtitleGradient}
              </p>
            </div>

            <p className="text-xs sm:text-base md:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium">
              {exhibitionConfig?.hero?.description || DEFAULT_EXHIBITION_CONFIG.hero.description}
            </p>

            {/* Staggered Key Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 max-w-5xl mx-auto pt-2">
              {(exhibitionConfig?.hero?.metrics || DEFAULT_EXHIBITION_CONFIG.hero.metrics).map((metric, i) => {
                const theme = METRIC_THEMES[metric.colorTheme] || METRIC_THEMES.cyan;
                return (
                  <div 
                    key={metric.id || i}
                    className={`p-4 sm:p-6 rounded-3xl ${theme.bg} border-2 ${theme.border} shadow-2xl space-y-1.5 text-right relative overflow-hidden group`}
                  >
                    <div className={`absolute top-0 right-0 w-24 h-24 ${theme.glow} rounded-full blur-xl`} />
                    <span className={`text-3xl sm:text-5xl font-black ${theme.text} font-mono`}>
                      {metric.number}
                    </span>
                    <div className="text-sm sm:text-base font-bold text-white">
                      {metric.titleAr}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {metric.descAr}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SCENE 02: THE FIVE-YEAR JOURNEY (ANIMATED SIGNAL PATH)                 */}
        {/* ===================================================================== */}
        {currentScene === 'journey' && (
          <div className="max-w-6xl mx-auto w-full space-y-4 sm:space-y-6 my-auto animate-fadeIn">
            {/* Scene Header */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-600 text-xs font-mono">
                <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>{exhibitionConfig?.journey?.badgeText || DEFAULT_EXHIBITION_CONFIG.journey.badgeText}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white">
                {exhibitionConfig?.journey?.sectionTitle || DEFAULT_EXHIBITION_CONFIG.journey.sectionTitle}
              </h2>
            </div>

            {/* 5-Year Signal Pulse Navigation Track */}
            <div className="relative py-2 max-w-4xl mx-auto">
              {/* Connecting Signal Line */}
              <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-800 -translate-y-1/2 z-0 hidden sm:block">
                <div 
                  className="h-full bg-gradient-to-l from-cyan-400 to-blue-600 transition-all duration-700 shadow-[0_0_12px_#06b6d4]"
                  style={{ width: `${(journeyYearIndex / 4) * 100}%` }}
                />
              </div>

              {/* Year Nodes */}
              <div className="grid grid-cols-5 gap-2 sm:gap-3 relative z-10">
                {YEAR_MILESTONES.map((year, idx) => {
                  const isCurrent = journeyYearIndex === idx;
                  const isPassed = journeyYearIndex > idx;

                  return (
                    <button
                      key={year.yearNumber}
                      onClick={() => setJourneyYearIndex(idx)}
                      className={`p-2 sm:p-3.5 rounded-2xl text-center transition-all border min-h-[44px] ${
                        isCurrent
                          ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-xl shadow-cyan-500/50 scale-105 font-black'
                          : isPassed
                          ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700/80 font-bold'
                          : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-base sm:text-xl font-black font-mono">0{year.yearNumber}</div>
                      <div className="text-[10px] sm:text-xs truncate font-bold mt-0.5">{year.titleAr}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Year Spotlight Instrument Card */}
            <div className="p-4 sm:p-7 rounded-3xl bg-[#081528] border-2 border-cyan-500/40 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                    السنة {currentMilestone.yearNumber} &bull; {currentMilestone.titleEn}
                  </span>
                  <h3 className="text-lg sm:text-2xl font-black text-white mt-0.5">
                    {currentMilestone.titleAr}: {currentMilestone.stageTitleAr}
                  </h3>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs font-bold text-cyan-300 px-3 py-1.5 rounded-xl bg-cyan-950 border border-cyan-700">
                    {currentMilestoneCourses.length} مقرراً ومخبراً
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                {currentMilestone.stageSummaryAr}
              </p>

              {/* Key Courses and Labs Preview */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                  أبرز المقررات والمخابر التخصصية:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {currentMilestoneCourses.slice(0, 8).map((course) => (
                    <div 
                      key={course.id}
                      className="p-2 sm:p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center gap-2 text-xs"
                    >
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                      <span className="text-slate-200 font-medium truncate">{course.nameAr}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Software Tools for this Year */}
              {currentMilestoneSoftware.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-slate-400 font-semibold">برمجيات المحاكاة المعتمدة:</span>
                  {currentMilestoneSoftware.map((sw) => (
                    <span key={sw.id} className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono text-[11px] font-bold">
                      {sw.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SCENE 03: FROM COURSE TO SKILL (ACADEMIC-TO-CAREER PIPELINE)          */}
        {/* ===================================================================== */}
        {currentScene === 'skills_pipeline' && (
          <div className="max-w-6xl mx-auto w-full space-y-5 my-auto animate-fadeIn">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-600 text-xs font-mono">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>{exhibitionConfig?.skills?.badgeText || DEFAULT_EXHIBITION_CONFIG.skills.badgeText}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white">
                {exhibitionConfig?.skills?.sectionTitle || DEFAULT_EXHIBITION_CONFIG.skills.sectionTitle}
              </h2>
            </div>

            {/* Pipeline Flow Visualization Card */}
            <div className="grid grid-cols-1 gap-3">
              {skillPipelines.map((item, idx) => {
                const isActive = activeSkillPipelineIndex === idx;

                return (
                  <div 
                    key={item.id}
                    onClick={() => setActiveSkillPipelineIndex(idx)}
                    className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl transition-all border cursor-pointer ${
                      isActive
                        ? 'bg-[#091a32] border-cyan-400 shadow-xl shadow-cyan-950 scale-[1.01]'
                        : 'bg-[#081528]/80 border-slate-800 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      {/* Left: Domain & Course */}
                      <div className="space-y-1 min-w-[240px]">
                        <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                          STAGE 0{idx + 1}
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-white">
                          {item.titleAr}
                        </h4>
                        <div className="text-xs text-slate-300">
                          المقرر: <span className="text-white font-medium">{item.courseAr}</span>
                        </div>
                      </div>

                      {/* Middle: Software & Laboratory */}
                      <div className="flex items-center gap-2 bg-slate-950/70 p-2 rounded-xl border border-slate-800 shrink-0">
                        <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
                        <div className="text-xs font-mono text-cyan-300 font-bold">
                          {item.softwareAr}
                        </div>
                      </div>

                      {/* Right: Acquired Skill & Career Target */}
                      <div className="space-y-0.5 flex-1 lg:text-left">
                        <div className="text-xs text-slate-300">
                          المهارة: <span className="text-slate-100">{item.skillAr}</span>
                        </div>
                        <div className="text-xs font-bold text-emerald-400">
                          المجال المهني: {item.careerAr}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SCENE 04: SOFTWARE & SIMULATION TOOLKIT                                */}
        {/* ===================================================================== */}
        {currentScene === 'software_toolkit' && (
          <div className="max-w-6xl mx-auto w-full space-y-6 my-auto animate-fadeIn">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-600 text-xs font-mono">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>{exhibitionConfig?.software?.badgeText || DEFAULT_EXHIBITION_CONFIG.software.badgeText}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white">
                {exhibitionConfig?.software?.sectionTitle || DEFAULT_EXHIBITION_CONFIG.software.sectionTitle}
              </h2>
            </div>

            {/* Rotating 6-Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {softwareSubset.map((sw) => (
                <div
                  key={sw.id}
                  className="p-4 sm:p-5 rounded-3xl bg-[#081528] border border-cyan-800/40 hover:border-cyan-500 shadow-xl space-y-2.5 transition-all text-right group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black font-mono text-white bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                      {sw.name}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-800">
                      {sw.categoryLabelAr}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {sw.description}
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>مستخدم في: {sw.usedInCourses.slice(0, 2).join(', ')}</span>
                    <span className="font-mono text-cyan-400">سنة {sw.academicYears.join('-')}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Group Indicator */}
            <div className="flex justify-center gap-2 pt-1">
              <button
                onClick={() => setSoftwareGroupIndex(0)}
                className={`h-2 rounded-full transition-all ${softwareGroupIndex === 0 ? 'w-8 bg-cyan-400' : 'w-2 bg-slate-700'}`}
              />
              <button
                onClick={() => setSoftwareGroupIndex(1)}
                className={`h-2 rounded-full transition-all ${softwareGroupIndex === 1 ? 'w-8 bg-cyan-400' : 'w-2 bg-slate-700'}`}
              />
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SCENE 05: GRADUATION PROJECTS ("ما الذي يمكنني بناءه؟")                   */}
        {/* ===================================================================== */}
        {currentScene === 'graduation_projects' && (
          <div className="max-w-6xl mx-auto w-full space-y-5 my-auto animate-fadeIn">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-600 text-xs font-mono">
                <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                <span>{exhibitionConfig?.graduationProjects?.badgeText || DEFAULT_EXHIBITION_CONFIG.graduationProjects.badgeText}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white">
                {exhibitionConfig?.graduationProjects?.sectionTitle || DEFAULT_EXHIBITION_CONFIG.graduationProjects.sectionTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
                {exhibitionConfig?.graduationProjects?.descriptionHint || DEFAULT_EXHIBITION_CONFIG.graduationProjects.descriptionHint}
              </p>
            </div>

            {/* Grid of 3 Representative Graduation Projects */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {GRADUATION_PROJECTS_DATA.slice(0, 3).map((proj) => (
                <div
                  key={proj.id}
                  className="p-5 rounded-3xl bg-[#081528] border-2 border-cyan-500/40 hover:border-cyan-400 shadow-2xl space-y-3 text-right flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono font-bold">
                        {proj.trackAr}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 text-[10px] font-mono">
                        {proj.difficultyAr}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-white leading-snug">
                      {proj.titleAr}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {proj.summaryAr}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-slate-400 font-semibold">البرمجيات:</span>
                      {proj.requiredSoftware.map((sw) => (
                        <span key={sw} className="px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800 font-mono text-[10px] font-bold">
                          {sw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SCENE 06: CAREER PATHS ("ماذا ستصبح؟ - من طالب إلى مهندس")           */}
        {/* ===================================================================== */}
        {currentScene === 'careers' && (
          <div className="max-w-6xl mx-auto w-full space-y-5 my-auto animate-fadeIn">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-600 text-xs font-mono">
                <Award className="w-3.5 h-3.5 text-cyan-400" />
                <span>{exhibitionConfig?.careers?.badgeText || DEFAULT_EXHIBITION_CONFIG.careers.badgeText}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white">
                {exhibitionConfig?.careers?.sectionTitle || DEFAULT_EXHIBITION_CONFIG.careers.sectionTitle}
              </h2>
            </div>

            {/* 8 Career Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {careerPaths.map((career, i) => {
                const Icon = career.icon;

                return (
                  <div
                    key={career.id || i}
                    className={`p-4 rounded-3xl border ${career.colorClass || 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300'} shadow-lg space-y-2 text-right transition-transform hover:-translate-y-1`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-900/80 flex items-center justify-center text-cyan-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-white text-sm">
                      {career.titleAr}
                    </h4>
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      {career.titleEn}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug pt-1 border-t border-slate-800/80">
                      {career.domain}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SCENE 06: QR PORTAL & DIRECT ACCESS FOR BOOTH VISITORS                */}
        {/* ===================================================================== */}
        {currentScene === 'qr_portal' && (
          <div className="max-w-5xl mx-auto w-full text-center space-y-6 my-auto animate-fadeIn">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/90 border border-cyan-500/60 text-cyan-300 text-xs font-mono">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>{exhibitionConfig?.qrPortal?.badgeText || DEFAULT_EXHIBITION_CONFIG.qrPortal.badgeText}</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white">
                {exhibitionConfig?.qrPortal?.title || DEFAULT_EXHIBITION_CONFIG.qrPortal.title}
              </h2>
              <p className="text-xs sm:text-base text-slate-300 max-w-xl mx-auto">
                {exhibitionConfig?.qrPortal?.description || DEFAULT_EXHIBITION_CONFIG.qrPortal.description}
              </p>
            </div>

            {/* High-Contrast QR Code Centerpiece */}
            <div className="flex justify-center">
              <div className="p-4 sm:p-6 rounded-3xl bg-[#060d1a] shadow-2xl border-4 border-cyan-500 max-w-xs sm:max-w-sm">
                <QRCodeDisplay
                  url={exhibitionConfig?.qrPortal?.customQrUrl || currentAppUrl}
                  title={exhibitionConfig?.qrPortal?.qrTitle || "مسح رمز المنصة"}
                  subtitle={exhibitionConfig?.qrPortal?.qrSubtitle || "وجّه كاميرا هاتفك لفتح الرابط"}
                  isModal={false}
                />
              </div>
            </div>

            {/* Four Quick Pillars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-3xl mx-auto text-xs font-bold text-slate-300">
              {(exhibitionConfig?.qrPortal?.pillars || DEFAULT_EXHIBITION_CONFIG.qrPortal.pillars).map((pillar, i) => {
                const PillarIcon = ICON_LOOKUP[pillar.iconKey] || Layers;
                return (
                  <div key={pillar.id || i} className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-center gap-2">
                    <PillarIcon className="w-4 h-4 text-cyan-400" />
                    <span>{pillar.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* BOTTOM FLOATING CONTROLS & TIMELINE STATUS (Auto-Hides only in Fullscreen) */}
      {/* ========================================================================= */}
      <footer 
        className={`transition-all duration-300 z-30 bg-[#071224]/90 backdrop-blur-md border-t border-cyan-900/40 px-4 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-4 shrink-0 ${
          shouldShowControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
        }`}
      >
        {/* Navigation Controls: Previous / Play-Pause / Next */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={prevScene}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors min-h-[38px]"
            title="المشهد السابق (→)"
          >
            <ChevronRight className="w-4 h-4" />
            <span className="hidden sm:inline">السابق</span>
          </button>

          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-colors min-h-[38px]"
            title="تشغيل / إيقاف (Space)"
          >
            {isAutoPlay ? <Pause className="w-4 h-4 text-emerald-400" /> : <Play className="w-4 h-4 text-cyan-400" />}
          </button>

          <button
            onClick={nextScene}
            className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1 transition-colors shadow-md shadow-cyan-950 min-h-[38px]"
            title="المشهد التالي (←)"
          >
            <span className="hidden sm:inline">التالي</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Playback Speed Controller (1.0 to 0.1) */}
        <div className="flex items-center gap-2 bg-slate-900/95 border border-slate-700/80 px-3 py-1.5 rounded-2xl text-xs shadow-inner">
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold shrink-0">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline text-[11px] font-sans">سرعة العرض:</span>
            <span className="font-mono text-xs text-white bg-cyan-950/90 px-1.5 py-0.5 rounded border border-cyan-700/80 font-bold">
              {playbackSpeed.toFixed(1)}x
            </span>
          </div>

          {/* Continuous Slider: 0.1 (Slowest) to 1.0 (Normal) */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">0.1</span>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              className="w-16 sm:w-20 md:w-28 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition-all"
              title={`سرعة العرض: ${playbackSpeed.toFixed(1)}x (من 1.0 سريع إلى 0.1 بطيء جداً)`}
            />
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">1.0</span>
          </div>

          {/* Quick Preset Buttons */}
          <div className="hidden xl:flex items-center gap-1 mr-1 border-r border-slate-700/80 pr-1.5">
            {[
              { val: 1.0, label: '1.0x عادي' },
              { val: 0.5, label: '0.5x متوسط' },
              { val: 0.2, label: '0.2x هادئ' },
              { val: 0.1, label: '0.1x بطيء' }
            ].map((p) => (
              <button
                key={p.val}
                onClick={() => setPlaybackSpeed(p.val)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                  Math.abs(playbackSpeed - p.val) < 0.04
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scene Index & Status Badge */}
        <div className="flex items-center gap-2.5 text-xs font-mono text-slate-400 shrink-0">
          <span className="hidden sm:inline">المشهد:</span>
          <span className="text-cyan-300 font-bold">
            {scenes.findIndex((s) => s.id === currentScene) + 1}/{scenes.length}
          </span>
          <span className="hidden lg:inline text-slate-600">|</span>
          <span className="hidden lg:inline text-slate-300 font-sans">
            {scenes.find((s) => s.id === currentScene)?.titleAr}
          </span>
        </div>

        {/* Keyboard Hints */}
        <div className="hidden 2xl:flex items-center gap-2 text-[11px] font-mono text-slate-500 shrink-0">
          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">Space</span>
          <span>إيقاف</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">← / →</span>
          <span>تنقل</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">Esc</span>
          <span>خروج</span>
        </div>
      </footer>
    </div>
  );
};
