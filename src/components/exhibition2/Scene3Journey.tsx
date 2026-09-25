import React, { useState } from 'react';
import { Compass, Activity, Cpu, Radio, Sparkles, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Exhibition2FullConfig } from '../../types/exhibition2';

interface Scene3JourneyProps {
  config: Exhibition2FullConfig;
}

const STAGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Compass,
  Activity,
  Cpu,
  Radio
};

export const Scene3Journey: React.FC<Scene3JourneyProps> = ({ config }) => {
  const { journeyScene } = config;
  const [activeStageIdx, setActiveStageIdx] = useState<number>(0);

  const activeStage = journeyScene.stages[activeStageIdx] || journeyScene.stages[0];

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col justify-center min-h-[75vh]" dir="rtl">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-400/30 text-blue-300 text-xs font-mono mb-2">
          <span>THE 5-YEAR ACADEMIC EVOLUTION</span>
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          {journeyScene.headline}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-2">
          {journeyScene.subheadline}
        </p>
      </div>

      {/* Stepped 3D Timeline Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {journeyScene.stages.map((stage, idx) => {
          const Icon = STAGE_ICONS[stage.visualIcon] || Cpu;
          const isActive = idx === activeStageIdx;

          return (
            <div
              key={idx}
              onClick={() => setActiveStageIdx(idx)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer text-right relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? 'bg-gradient-to-b from-[#0a2342] to-[#07162b] border-cyan-400 shadow-xl shadow-cyan-950/80 scale-[1.03] ring-1 ring-cyan-400/40'
                  : 'bg-[#061122]/80 hover:bg-[#091a32] border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Stepper Index Pill */}
              <div className="flex items-center justify-between mb-4">
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black font-mono shadow-md ${
                  isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  0{idx + 1}
                </span>
                <div className={`p-2 rounded-xl ${isActive ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-[11px] font-mono text-cyan-400 font-bold block mb-1">
                  {stage.titleAr}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
                  {stage.stageName}
                </h3>
              </div>

              {/* Subjects Preview */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1">
                {stage.subjects.slice(0, 3).map((sub, i) => (
                  <div key={i} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                    <span className="truncate">{sub}</span>
                  </div>
                ))}
                {stage.subjects.length > 3 && (
                  <div className="text-[10px] text-slate-500 font-mono pt-0.5">
                    + {stage.subjects.length - 3} مقررات إضافية
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cinematic Spotlight on Active Stage with 3D Effect Description */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#07162b] via-[#0b2447] to-[#051120] border-2 border-cyan-500/30 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2 text-right flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-400/30 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>المحاكاة البصرية الحية: {activeStage.titleAr}</span>
            </div>
            <h4 className="text-xl sm:text-2xl font-black text-white">
              {activeStage.stageName}
            </h4>
            <p className="text-xs sm:text-sm text-cyan-200/90 leading-relaxed max-w-3xl">
              {activeStage.effectDescription}
            </p>
          </div>

          {/* Key Subject Tags */}
          <div className="flex flex-wrap gap-2 md:max-w-md justify-end shrink-0">
            {activeStage.subjects.map((sub, i) => (
              <span 
                key={i} 
                className="px-3 py-1 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-medium shadow-sm"
              >
                {sub}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
