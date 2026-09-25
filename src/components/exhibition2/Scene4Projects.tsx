import React, { useState } from 'react';
import { Cpu, Radio, Activity, Eye, Zap, Layers, CheckCircle2, RotateCw } from 'lucide-react';
import { Exhibition2FullConfig, ProjectExhibitItem } from '../../types/exhibition2';
import { ProjectViewer3D } from './ProjectViewer3D';

interface Scene4ProjectsProps {
  config: Exhibition2FullConfig;
}

const PROJECT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  esp32_memory: Cpu,
  rfid_scanner: Radio,
  ultrasonic_servo: Activity,
  computer_vision: Eye
};

export const Scene4Projects: React.FC<Scene4ProjectsProps> = ({ config }) => {
  const { projectsScene } = config;
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectsScene.projects[0].id);

  const activeProject = projectsScene.projects.find(p => p.id === selectedProjectId) || projectsScene.projects[0];

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col justify-center min-h-[75vh]" dir="rtl">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/30 text-emerald-300 text-xs font-mono mb-2">
          <span>INTERACTIVE 3D PROTOTYPES</span>
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          {projectsScene.headline}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1.5">
          {projectsScene.subheadline}
        </p>
      </div>

      {/* Project Selector Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mb-5">
        {projectsScene.projects.map((proj) => {
          const Icon = PROJECT_ICONS[proj.interactiveDemoType] || Cpu;
          const isSelected = proj.id === selectedProjectId;

          return (
            <button
              key={proj.id}
              onClick={() => setSelectedProjectId(proj.id)}
              className={`px-4 py-2 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 border-cyan-300 scale-105 shadow-cyan-500/25 ring-2 ring-cyan-400/30'
                  : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-cyan-500/50 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{proj.titleAr.split('(')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Stage: 3D Canvas on Left/Right, Detailed Engineering on other */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* 3D Interactive Model Viewer */}
        <div className="lg:col-span-6 bg-radial from-cyan-950/20 via-[#071322]/80 to-[#040914] border-2 border-cyan-500/30 rounded-3xl p-2 sm:p-4 shadow-2xl relative overflow-hidden backdrop-blur-md min-h-[360px] flex flex-col justify-center">
          <ProjectViewer3D project={activeProject} />
        </div>

        {/* Project Technical Anatomy & Flow */}
        <div className="lg:col-span-6 space-y-4 text-right">
          {/* Badge & Title */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#071426]/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-cyan-400 font-bold px-2.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/50">
                {activeProject.category}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">LIVE DEMO</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {activeProject.titleAr}
            </h3>
            <p className="text-xs sm:text-sm text-cyan-300/90 font-medium">
              {activeProject.tagline}
            </p>
            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              {activeProject.explanation}
            </p>
          </div>

          {/* Sequence Steps Flow */}
          <div className="p-4 rounded-2xl bg-[#071426]/90 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>تسلسل المعالجة والقرار العتادي:</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {activeProject.sequenceSteps.map((step, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-300 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/50 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Real World Applications */}
          <div className="p-3.5 rounded-2xl bg-[#071426]/90 border border-slate-800">
            <span className="text-xs font-bold text-white block mb-2">
              تطبيقات واقعية في الصناعة وسوق العمل:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeProject.realWorldApps.map((app, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-xl bg-cyan-950/40 text-cyan-300 border border-cyan-800/40 text-[11px] font-medium">
                  ✓ {app}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
