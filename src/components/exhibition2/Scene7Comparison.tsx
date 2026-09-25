import React, { useState } from 'react';
import { Sparkles, Laptop, Zap, Cpu, CheckCircle2, Award } from 'lucide-react';
import { Exhibition2FullConfig } from '../../types/exhibition2';

interface Scene7ComparisonProps {
  config: Exhibition2FullConfig;
}

const DEPT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Laptop,
  Zap,
  Cpu
};

export const Scene7Comparison: React.FC<Scene7ComparisonProps> = ({ config }) => {
  const { comparisonScene } = config;
  const [selectedDeptId, setSelectedDeptId] = useState<string>('ece');

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col justify-center min-h-[75vh]" dir="rtl">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/30 text-cyan-300 text-xs font-mono mb-2">
          <span>ACADEMIC & INDUSTRIAL BENCHMARK</span>
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          {comparisonScene.headline}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-2">
          {comparisonScene.subheadline}
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {comparisonScene.departments.map((dept) => {
          const Icon = DEPT_ICONS[dept.iconName] || Cpu;
          const isECE = dept.isECE;
          const isSelected = dept.deptId === selectedDeptId;

          return (
            <div
              key={dept.deptId}
              onClick={() => setSelectedDeptId(dept.deptId)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer text-right flex flex-col justify-between relative overflow-hidden ${
                isECE
                  ? 'bg-gradient-to-b from-[#0c284d] to-[#07162b] border-cyan-400 shadow-2xl shadow-cyan-950/90 ring-2 ring-cyan-400/50 scale-[1.03]'
                  : isSelected
                    ? 'bg-[#0a1a33] border-slate-600'
                    : 'bg-[#061122]/80 hover:bg-[#091a32] border-slate-800'
              }`}
            >
              {isECE && (
                <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-cyan-500 to-blue-500 py-0.5 text-center">
                  <span className="text-[9px] font-black text-slate-950 uppercase tracking-widest">
                    ✦ التخصص المرجعي في المعرض ✦
                  </span>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${isECE ? 'bg-cyan-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    isECE ? 'bg-cyan-950 text-cyan-300 border-cyan-800' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {dept.deptId.toUpperCase()}
                  </span>
                </div>

                <h3 className={`text-base sm:text-lg font-bold ${isECE ? 'text-white' : 'text-slate-200'}`}>
                  {dept.deptNameAr}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {dept.primaryFocus}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                <div className="text-[11px] text-slate-300">
                  <span className="text-cyan-400 font-bold block mb-0.5">التوازن العتادي/البرمجي:</span>
                  <span>{dept.hardwareVsSoftware}</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  <span className="text-amber-400 font-bold block mb-0.5">الفارق الجوهري:</span>
                  <span className="line-clamp-2">{dept.keyDifferentiator}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* The Final Punchline Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0a274e] via-[#081a33] to-[#061427] border-2 border-cyan-400/50 shadow-2xl text-center relative overflow-hidden backdrop-blur-md">
        <div className="flex items-center justify-center gap-2 text-cyan-400 mb-2">
          <Award className="w-5 h-5" />
          <span className="text-xs font-mono uppercase tracking-widest font-bold">
            THE ECE CORE CREED
          </span>
        </div>
        <p className="text-lg sm:text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-sky-300 tracking-tight leading-relaxed max-w-4xl mx-auto">
          &quot;{comparisonScene.takeawayMessage}&quot;
        </p>
      </div>
    </div>
  );
};
