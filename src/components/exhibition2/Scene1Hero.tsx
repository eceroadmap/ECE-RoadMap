import React from 'react';
import { Sparkles, Cpu, Radio, Zap, ArrowLeft, Terminal, Activity } from 'lucide-react';
import { Exhibition2FullConfig } from '../../types/exhibition2';

interface Scene1HeroProps {
  config: Exhibition2FullConfig;
  onNextScene: () => void;
}

export const Scene1Hero: React.FC<Scene1HeroProps> = ({ config, onNextScene }) => {
  const { heroScene } = config;

  return (
    <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center min-h-[75vh] text-center" dir="rtl">
      {/* Top Futuristic Cyber Badge */}
      <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs sm:text-sm font-mono tracking-wider shadow-lg shadow-cyan-950/60 mb-6 backdrop-blur-md animate-pulse">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <Terminal className="w-4 h-4 text-cyan-400" />
        <span>{heroScene.tagline}</span>
      </div>

      {/* Main Monumental Headline */}
      <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight mb-6">
        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-400 drop-shadow-[0_0_35px_rgba(6,182,212,0.4)]">
          {heroScene.mainHeadline}
        </span>
      </h1>

      {/* Narrative Explanation */}
      <p className="text-base sm:text-lg md:text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed font-normal mb-8 text-shadow-sm bg-[#061122]/70 p-5 rounded-2xl border border-cyan-500/20 backdrop-blur-sm">
        {heroScene.shortBio}
      </p>

      {/* Key Pillar Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto mb-10">
        {heroScene.pills.map((pill, idx) => (
          <span 
            key={idx}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/60 text-slate-300 hover:text-cyan-300 text-xs sm:text-sm font-mono transition-all shadow-md flex items-center gap-2"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>{pill}</span>
          </span>
        ))}
      </div>

      {/* Futuristic Telemetry Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl mx-auto">
        <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-right backdrop-blur-sm">
          <div className="flex items-center justify-between text-cyan-400 text-xs font-mono">
            <Radio className="w-3.5 h-3.5" />
            <span>5G / RF CORE</span>
          </div>
          <div className="text-lg font-black text-white mt-1 font-mono">300 GHz</div>
          <div className="text-[10px] text-slate-400">نطاق الترددات العالية</div>
        </div>

        <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-right backdrop-blur-sm">
          <div className="flex items-center justify-between text-blue-400 text-xs font-mono">
            <Cpu className="w-3.5 h-3.5" />
            <span>MICROCONTROLLERS</span>
          </div>
          <div className="text-lg font-black text-white mt-1 font-mono">32-Bit Dual</div>
          <div className="text-[10px] text-slate-400">معالجة فورية لحظية</div>
        </div>

        <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-right backdrop-blur-sm">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-mono">
            <Zap className="w-3.5 h-3.5" />
            <span>OPTICAL FIBER</span>
          </div>
          <div className="text-lg font-black text-white mt-1 font-mono">300,000 km/s</div>
          <div className="text-[10px] text-slate-400">نقل المعلومات بسرعة الضوء</div>
        </div>

        <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-right backdrop-blur-sm">
          <div className="flex items-center justify-between text-purple-400 text-xs font-mono">
            <Activity className="w-3.5 h-3.5" />
            <span>EDGE AI</span>
          </div>
          <div className="text-lg font-black text-white mt-1 font-mono">Silicon Deep</div>
          <div className="text-[10px] text-slate-400">ذكاء اصطناعي على العتاد</div>
        </div>
      </div>
    </div>
  );
};
