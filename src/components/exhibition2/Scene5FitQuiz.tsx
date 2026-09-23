import React, { useState } from 'react';
import { Cpu, Zap, Radio, Activity, CheckCircle2, ArrowLeft, Heart, Compass, Sparkles } from 'lucide-react';
import { Exhibition2FullConfig } from '../../types/exhibition2';

interface Scene5FitQuizProps {
  config: Exhibition2FullConfig;
  onOpenFullQuiz?: () => void;
}

const TRAIT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Cpu,
  Zap,
  Radio,
  Activity
};

export const Scene5FitQuiz: React.FC<Scene5FitQuizProps> = ({ config, onOpenFullQuiz }) => {
  const { fitQuizScene } = config;
  const [selectedTraits, setSelectedTraits] = useState<number[]>([0, 1]);

  const toggleTrait = (idx: number) => {
    setSelectedTraits(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const matchScore = Math.min(100, Math.round(55 + (selectedTraits.length * 11.25)));

  return (
    <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col justify-center min-h-[75vh]" dir="rtl">
      {/* Welcome Banner */}
      <div className="text-center max-w-3xl mx-auto mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs sm:text-sm font-bold mb-3 shadow-lg shadow-cyan-950/50">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{fitQuizScene.subheadline}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          {fitQuizScene.headline}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl mx-auto">
          {fitQuizScene.welcomeMessage}
        </p>
      </div>

      {/* Traits Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {fitQuizScene.traits.map((trait, idx) => {
          const Icon = TRAIT_ICONS[trait.icon] || Cpu;
          const isSelected = selectedTraits.includes(idx);

          return (
            <div
              key={idx}
              onClick={() => toggleTrait(idx)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer text-right flex items-start gap-4 ${
                isSelected
                  ? 'bg-gradient-to-r from-[#09213d] to-[#07162b] border-cyan-400 shadow-xl shadow-cyan-950/60 ring-1 ring-cyan-400/30'
                  : 'bg-[#061122]/80 hover:bg-[#091a32] border-slate-800'
              }`}
            >
              <div className={`p-3 rounded-2xl shrink-0 mt-0.5 ${
                isSelected ? 'bg-cyan-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-400'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">
                    {trait.title}
                  </h3>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    isSelected ? 'bg-cyan-400 text-slate-950 font-bold' : 'border border-slate-700 text-slate-600'
                  }`}>
                    {isSelected ? '✓' : ''}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {trait.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Match Calculator & Action Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-l from-[#081a32] via-[#051120] to-[#07162b] border-2 border-cyan-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-5 backdrop-blur-md">
        <div className="space-y-1 text-right">
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 font-mono">
              {matchScore}%
            </span>
            <span className="text-base font-bold text-white">
              نسبة توافق مؤشرات شغفك مع متطلبات القسم
            </span>
          </div>
          <p className="text-xs text-slate-400">
            انقر على السمات أعلاه لاكتشاف مدى ملائمة تطلعاتك مع هندسة الاتصالات والإلكترونيات.
          </p>
        </div>

        {onOpenFullQuiz && (
          <button
            onClick={onOpenFullQuiz}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-cyan-950 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Compass className="w-4 h-4 text-cyan-200" />
            <span>ابدأ اختبار التوافق الكامل (10 أسئلة)</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
