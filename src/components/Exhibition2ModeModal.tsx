import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Gauge, 
  Sparkles, 
  Cpu, 
  Radio, 
  Compass, 
  Layers, 
  Activity, 
  Award,
  Zap
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Exhibition2FullConfig, Exhibition2SceneId } from '../types/exhibition2';
import { exhibition2Repository } from '../services/admin/exhibition2Repository';
import { DEFAULT_EXHIBITION2_CONFIG } from '../data/defaultExhibition2';
import { PcbCanvas3D } from './exhibition2/PcbCanvas3D';
import { Scene1Hero } from './exhibition2/Scene1Hero';
import { Scene2WhyEce } from './exhibition2/Scene2WhyEce';
import { Scene3Journey } from './exhibition2/Scene3Journey';
import { Scene4Projects } from './exhibition2/Scene4Projects';
import { Scene5FitQuiz } from './exhibition2/Scene5FitQuiz';
import { Scene6Roadmap } from './exhibition2/Scene6Roadmap';
import { Scene7Comparison } from './exhibition2/Scene7Comparison';

interface Exhibition2ModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToExhibition1?: () => void;
  onOpenAptitudeQuiz?: () => void;
}

const SPEED_FACTORS = {
  slow: 1.5,
  medium: 1.0,
  fast: 0.65
};

export const Exhibition2ModeModal: React.FC<Exhibition2ModeModalProps> = ({
  isOpen,
  onClose,
  onSwitchToExhibition1,
  onOpenAptitudeQuiz
}) => {
  const [config, setConfig] = useState<Exhibition2FullConfig>(() => 
    exhibition2Repository.getCachedConfig()
  );

  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<'slow' | 'medium' | 'fast'>('medium');
  const [sceneProgress, setSceneProgress] = useState<number>(0); // 0 to 100
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isHudVisible, setIsHudVisible] = useState<boolean>(true);

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const hudTimeoutRef = useRef<number | null>(null);

  // Subscribe to live Firestore updates
  useEffect(() => {
    if (!isOpen) return;
    const unsub = exhibition2Repository.subscribe((loaded) => {
      if (loaded) {
        setConfig(loaded);
        if (loaded.playback?.defaultSpeed) {
          setSpeed(loaded.playback.defaultSpeed);
        }
      }
    });
    return () => unsub();
  }, [isOpen]);

  // Active scenes filtered by isEnabled
  const activeScenes = useMemo(() => {
    const enabled = config.scenes.filter(s => s.isEnabled);
    return enabled.length > 0 ? enabled : DEFAULT_EXHIBITION2_CONFIG.scenes;
  }, [config.scenes]);

  const currentSceneMeta = activeScenes[activeSceneIndex] || activeScenes[0];
  const sceneDurationMs = useMemo(() => {
    const baseSec = currentSceneMeta?.durationSeconds || 18;
    return baseSec * 1000 * SPEED_FACTORS[speed];
  }, [currentSceneMeta, speed]);

  // Transition to next scene
  const goToNextScene = useCallback(() => {
    setActiveSceneIndex(prev => {
      if (prev + 1 >= activeScenes.length) {
        return config.playback.autoLoop ? 0 : prev;
      }
      return prev + 1;
    });
    setSceneProgress(0);
    startTimeRef.current = Date.now();
  }, [activeScenes.length, config.playback.autoLoop]);

  // Transition to previous scene
  const goToPrevScene = useCallback(() => {
    setActiveSceneIndex(prev => (prev === 0 ? activeScenes.length - 1 : prev - 1));
    setSceneProgress(0);
    startTimeRef.current = Date.now();
  }, [activeScenes.length]);

  // Jump directly to specific scene
  const jumpToScene = (idx: number) => {
    setActiveSceneIndex(idx);
    setSceneProgress(0);
    startTimeRef.current = Date.now();
  };

  // Auto-play Timer loop
  useEffect(() => {
    if (!isOpen || !isPlaying) {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
      return;
    }

    startTimeRef.current = Date.now() - (sceneProgress / 100) * sceneDurationMs;

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(100, (elapsed / sceneDurationMs) * 100);
      setSceneProgress(progress);

      if (progress >= 100) {
        goToNextScene();
      } else {
        timerRef.current = requestAnimationFrame(tick);
      }
    };

    timerRef.current = requestAnimationFrame(tick);

    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [isOpen, isPlaying, activeSceneIndex, sceneDurationMs, goToNextScene]);

  // Fullscreen Handler
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (e) {
      console.warn('Fullscreen failed:', e);
    }
  };

  // Keyboard Shortcuts (Space, Arrows, F, Esc)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        goToNextScene();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        goToPrevScene();
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, goToNextScene, goToPrevScene, onClose]);

  // Auto-hide HUD on idle
  const handleMouseMove = () => {
    setIsHudVisible(true);
    if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
    hudTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setIsHudVisible(false);
      }
    }, 4500);
  };

  if (!isOpen) return null;

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-[#02050b] text-slate-100 flex flex-col justify-between overflow-hidden select-none font-sans"
    >
      {/* 3D Three.js Cyber PCB Background */}
      <PcbCanvas3D activeSceneId={currentSceneMeta.id} />

      {/* Ambient Radial Vignette */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#02050b]/60 to-[#02050b]/90 pointer-events-none z-[1]" />

      {/* Top Auto Progress Bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-slate-900 z-30">
        <div 
          className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 transition-all duration-100 shadow-[0_0_10px_#06b6d4]"
          style={{ width: `${sceneProgress}%` }}
        />
      </div>

      {/* Top Header Controls Bar */}
      <header className={`relative z-20 w-full px-4 sm:px-8 py-3 flex items-center justify-between transition-opacity duration-300 ${isHudVisible ? 'opacity-100' : 'opacity-20 hover:opacity-100'}`}>
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 shadow-lg shadow-cyan-950/50">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-black text-cyan-300 font-mono tracking-wider">
              ECE EXPO 2.0 ✦ المعرض الأكاديمي السينمائي
            </span>
          </div>

          {onSwitchToExhibition1 && (
            <button
              onClick={onSwitchToExhibition1}
              className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-300 text-xs font-semibold transition-all"
            >
              <span>الملتقى 1</span>
            </button>
          )}
        </div>

        {/* Scene Indicator & Exit Button */}
        <div className="flex items-center gap-2">
          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            title="ملء الشاشة (F)"
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Modal */}
          <button
            onClick={onClose}
            title="إنهاء العرض (Esc)"
            className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-rose-300 hover:text-white transition-all flex items-center gap-1.5 px-3 text-xs font-bold"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">إنهاء العرض</span>
          </button>
        </div>
      </header>

      {/* Main Dynamic Cinematic Scene Container with 3D Transitions */}
      <main className="relative z-10 flex-1 flex items-center justify-center overflow-y-auto px-2 sm:px-4 py-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSceneMeta.id}
            initial={{ opacity: 0, scale: 0.92, rotateY: 15, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, rotateY: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.06, rotateY: -15, filter: 'blur(8px)' }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex items-center justify-center"
            style={{ perspective: 1200 }}
          >
            {currentSceneMeta.id === 'hero' && (
              <Scene1Hero config={config} onNextScene={goToNextScene} />
            )}
            {currentSceneMeta.id === 'why_ece' && (
              <Scene2WhyEce config={config} />
            )}
            {currentSceneMeta.id === 'journey_years' && (
              <Scene3Journey config={config} />
            )}
            {currentSceneMeta.id === 'projects_expo' && (
              <Scene4Projects config={config} />
            )}
            {currentSceneMeta.id === 'fit_quiz' && (
              <Scene5FitQuiz config={config} onOpenFullQuiz={onOpenAptitudeQuiz} />
            )}
            {currentSceneMeta.id === 'roadmap_tool' && (
              <Scene6Roadmap config={config} />
            )}
            {currentSceneMeta.id === 'comparison' && (
              <Scene7Comparison config={config} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Floating Control HUD */}
      <footer className={`relative z-20 w-full px-4 sm:px-8 py-3 transition-opacity duration-300 ${isHudVisible ? 'opacity-100' : 'opacity-20 hover:opacity-100'}`}>
        <div className="max-w-5xl mx-auto p-2 sm:p-2.5 rounded-2xl bg-[#061122]/90 border border-cyan-500/30 backdrop-blur-xl shadow-2xl flex flex-wrap items-center justify-between gap-3">
          {/* Left: Playback Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(prev => !prev)}
              className={`p-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-1.5 text-xs ${
                isPlaying 
                  ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span className="hidden sm:inline">{isPlaying ? 'إيقاف' : 'تشغيل'}</span>
            </button>

            {/* Prev / Next */}
            <button
              onClick={goToPrevScene}
              title="السابق"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={goToNextScene}
              title="التالي"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Speed Multiplier */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
              {(['slow', 'medium', 'fast'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                    speed === s 
                      ? 'bg-cyan-500 text-slate-950' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s === 'slow' ? 'بطيء' : s === 'medium' ? 'متوسط' : 'سريع'}
                </button>
              ))}
            </div>
          </div>

          {/* Center: Interactive Scene Nav Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {activeScenes.map((scene, idx) => {
              const isActive = idx === activeSceneIndex;
              return (
                <button
                  key={scene.id}
                  onClick={() => jumpToScene(idx)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-bold transition-all flex items-center gap-1 shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-950 scale-105'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <span>{idx + 1}</span>
                  <span className="hidden md:inline">{scene.titleAr.split(':')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Scene Time Left & Counter */}
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 shrink-0">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              {activeSceneIndex + 1} / {activeScenes.length}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
