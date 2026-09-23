import React, { useState } from 'react';
import { Cpu, Radio, Layers, Zap, CheckCircle2, ChevronRight } from 'lucide-react';
import { Exhibition2FullConfig } from '../../types/exhibition2';
import { CentralSystem3D } from './CentralSystem3D';

interface Scene2WhyEceProps {
  config: Exhibition2FullConfig;
}

const DOMAIN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Cpu,
  Radio,
  Layers,
  Zap
};

export const Scene2WhyEce: React.FC<Scene2WhyEceProps> = ({ config }) => {
  const { whyEceScene } = config;
  const [selectedDomainId, setSelectedDomainId] = useState<string>(whyEceScene.domains[0].id);

  const activeDomain = whyEceScene.domains.find(d => d.id === selectedDomainId) || whyEceScene.domains[0];

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col justify-center min-h-[75vh]" dir="rtl">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/30 text-cyan-300 text-xs font-mono mb-2">
          <span>THE 4 FOUNDATIONAL PILLARS</span>
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          {whyEceScene.headline}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-2">
          {whyEceScene.subheadline}
        </p>
      </div>

      {/* Main Grid: 2 Domains Left, 3D Central Model in Middle, 2 Domains Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Left 2 Domains */}
        <div className="lg:col-span-4 space-y-4">
          {whyEceScene.domains.slice(0, 2).map((domain) => {
            const Icon = DOMAIN_ICONS[domain.iconName] || Cpu;
            const isSelected = domain.id === selectedDomainId;

            return (
              <div
                key={domain.id}
                onClick={() => setSelectedDomainId(domain.id)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer text-right group ${
                  isSelected 
                    ? 'bg-gradient-to-r from-[#091f3a] to-[#07162b] border-cyan-400 shadow-xl shadow-cyan-950/60 scale-[1.02]' 
                    : 'bg-[#061122]/80 hover:bg-[#091a32] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${domain.color} text-white shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {domain.techPill}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {domain.titleAr}
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {domain.summary}
                </p>
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                  {domain.examples.slice(0, 2).map((ex, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-900/90 text-cyan-200 border border-cyan-900/40">
                      • {ex}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Center 3D Interactive Model */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center relative">
          <div className="w-full h-[320px] sm:h-[380px] rounded-3xl bg-radial from-cyan-950/20 via-[#040d1c]/80 to-transparent border border-cyan-500/20 shadow-2xl relative overflow-hidden backdrop-blur-sm">
            <CentralSystem3D 
              activeDomainId={selectedDomainId}
              onSelectDomain={(id) => setSelectedDomainId(id)}
            />
            <div className="absolute top-3 inset-x-0 text-center pointer-events-none">
              <span className="text-[10px] font-mono text-cyan-400 bg-slate-950/80 px-2.5 py-1 rounded-full border border-cyan-500/30">
                ✦ النواة المركزية للنظام الإلكتروني ✦
              </span>
            </div>
            <div className="absolute bottom-3 inset-x-0 text-center pointer-events-none">
              <span className="text-[11px] font-bold text-white bg-slate-900/90 px-3 py-1 rounded-full border border-slate-700">
                المجال النشط: {activeDomain.titleAr.split('(')[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Right 2 Domains */}
        <div className="lg:col-span-4 space-y-4">
          {whyEceScene.domains.slice(2, 4).map((domain) => {
            const Icon = DOMAIN_ICONS[domain.iconName] || Cpu;
            const isSelected = domain.id === selectedDomainId;

            return (
              <div
                key={domain.id}
                onClick={() => setSelectedDomainId(domain.id)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer text-right group ${
                  isSelected 
                    ? 'bg-gradient-to-r from-[#091f3a] to-[#07162b] border-cyan-400 shadow-xl shadow-cyan-950/60 scale-[1.02]' 
                    : 'bg-[#061122]/80 hover:bg-[#091a32] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${domain.color} text-white shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {domain.techPill}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {domain.titleAr}
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {domain.summary}
                </p>
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                  {domain.examples.slice(0, 2).map((ex, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-900/90 text-cyan-200 border border-cyan-900/40">
                      • {ex}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
