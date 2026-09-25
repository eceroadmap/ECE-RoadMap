import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Smartphone, Map, BookOpen, Cpu, Briefcase, Award, Sparkles, Terminal } from 'lucide-react';
import { Exhibition2FullConfig } from '../../types/exhibition2';
import { YEAR_MILESTONES } from '../../data/years';
import { COURSES_DATA } from '../../data/courses';

interface Scene6RoadmapProps {
  config: Exhibition2FullConfig;
}

export const Scene6Roadmap: React.FC<Scene6RoadmapProps> = ({ config }) => {
  const { roadmapScene } = config;
  const [selectedYear, setSelectedYear] = useState<number>(1);

  const activeMilestone = YEAR_MILESTONES.find(m => m.yearNumber === selectedYear) || YEAR_MILESTONES[0];

  const yearCourses = activeMilestone.courseIds
    .map(cid => COURSES_DATA.find(c => c.id === cid)?.nameAr || cid)
    .slice(0, 6);

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col justify-center min-h-[75vh]" dir="rtl">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/30 text-cyan-300 text-xs font-mono mb-2">
          <span>THE OFFICIAL STUDENT ROADMAP</span>
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          {roadmapScene.headline}
        </h2>
        <p className="text-xs sm:text-sm text-cyan-300 font-semibold mt-2 bg-cyan-950/40 py-1.5 px-4 rounded-full inline-block border border-cyan-500/20">
          &quot;{roadmapScene.quote}&quot;
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Interactive Year Inspector (8 Cols) */}
        <div className="lg:col-span-8 p-5 sm:p-6 rounded-3xl bg-[#071426]/90 border border-slate-800 shadow-2xl flex flex-col justify-between space-y-4">
          {/* Year Buttons 1 to 5 */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[1, 2, 3, 4, 5].map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  selectedYear === y
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 scale-105'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-cyan-500/50 hover:text-white'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>السنة {y === 1 ? 'الأولى' : y === 2 ? 'الثانية' : y === 3 ? 'الثالثة' : y === 4 ? 'الرابعة' : 'الخامسة'}</span>
              </button>
            ))}
          </div>

          {/* Year Active Details Panel */}
          <div className="space-y-4 text-right">
            <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-800/40">
              <span className="text-[10px] font-mono text-cyan-400 block mb-0.5">{activeMilestone.titleAr}:</span>
              <h4 className="text-base sm:text-lg font-black text-white">{activeMilestone.stageTitleAr}</h4>
              <p className="text-xs text-slate-300 mt-1">{activeMilestone.stageSummaryAr}</p>
            </div>

            {/* 4 Pillars Grid: المواد، المهارات، برمجيات المحاكاة، مجالات التركيز */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* المواد الأساسية */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 mb-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>أبرز المقررات:</span>
                </span>
                <div className="flex flex-wrap gap-1">
                  {yearCourses.map((sub, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              {/* المهارات المكتسبة */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mb-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>المهارات المكتسبة:</span>
                </span>
                <div className="flex flex-wrap gap-1">
                  {activeMilestone.keySkills.slice(0, 3).map((skill, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-900/40">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* برمجيات المحاكاة والتطبيق */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-1.5">
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  <span>برمجيات العمل والمحاكاة:</span>
                </span>
                <div className="flex flex-wrap gap-1">
                  {activeMilestone.softwareUsed.map((sw, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-900/40">
                      {sw}
                    </span>
                  ))}
                </div>
              </div>

              {/* مجالات التركيز الهندسية */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5 mb-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                  <span>محاور التركيز التخصصي:</span>
                </span>
                <div className="space-y-1">
                  {activeMilestone.focusAreas.slice(0, 2).map((focus, i) => (
                    <div key={i} className="text-[11px] text-slate-300 truncate">
                      • {focus}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Direct QR Code Portal (4 Cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-gradient-to-b from-[#081a33] via-[#051120] to-[#040c17] border-2 border-cyan-500/40 shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-400/40 text-xs font-mono mb-4">
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span>امسح بكاميرا هاتفك الآن</span>
          </div>

          {/* QR Code Container */}
          <div className="p-3.5 bg-white rounded-2xl shadow-2xl border-4 border-cyan-400/50 my-2 group transition-transform hover:scale-105">
            <QRCodeSVG 
              value={roadmapScene.qrUrl} 
              size={175} 
              level="H" 
              includeMargin={false}
            />
          </div>

          <p className="text-xs text-slate-300 mt-4 leading-relaxed max-w-xs">
            {roadmapScene.qrDescription}
          </p>

          <div className="mt-4 pt-3 border-t border-slate-800 w-full text-center">
            <span className="text-[10px] font-mono text-cyan-400">
              {roadmapScene.qrUrl}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
