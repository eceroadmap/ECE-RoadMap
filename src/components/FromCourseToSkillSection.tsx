import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  BookOpen, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  TrendingUp, 
  GraduationCap,
  ExternalLink,
  ChevronRight,
  Compass
} from 'lucide-react';
import { ActiveTab, Course, SoftwareTool } from '../types';
import { COURSES_DATA } from '../data/courses';
import { SOFTWARE_DATA } from '../data/software';
import { courseSkillsService, SkillPipeline, DEFAULT_SKILL_PIPELINES } from '../services/courseSkillsService';

interface FromCourseToSkillSectionProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onSelectCourseByName?: (courseName: string) => void;
  onSelectSoftwareByName?: (softwareName: string) => void;
}

export const FromCourseToSkillSection: React.FC<FromCourseToSkillSectionProps> = ({
  onNavigateTab,
  onSelectCourseByName,
  onSelectSoftwareByName
}) => {
  const [pipelines, setPipelines] = useState<SkillPipeline[]>(DEFAULT_SKILL_PIPELINES);
  const [activePipelineId, setActivePipelineId] = useState<string>(DEFAULT_SKILL_PIPELINES[0].id);

  useEffect(() => {
    const unsub = courseSkillsService.subscribePipelines((data) => {
      if (data && data.length > 0) {
        setPipelines(data);
        setActivePipelineId((prev) => {
          const exists = data.some((p) => p.id === prev);
          return exists ? prev : data[0].id;
        });
      }
    });
    return () => unsub();
  }, []);

  const selectedPipeline = pipelines.find((p) => p.id === activePipelineId) || pipelines[0] || DEFAULT_SKILL_PIPELINES[0];

  return (
    <section className="py-16 relative overflow-hidden bg-gradient-to-b from-[#050b14] via-[#081528] to-[#050b14] border-y border-cyan-950/60">
      {/* Decorative Technical Background Circuit Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-xs font-mono">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>من النظري إلى العملي • From University to Skill</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            من المادة إلى المهارة
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            &quot;ما تتعلمه في الجامعة يمكن أن يتحول إلى مهارة عملية تبني بها مستقبلك.&quot;
          </p>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            انقر على أي مسار هندسي أدناه لرؤية كيف يتحول مقرر الكلية، عبر برامج المحاكاة والكورسات الذاتية، إلى مسار مهني حقيقي في سوق العمل.
          </p>
        </div>

        {/* Pipeline Selector Tabs */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
          {pipelines.map((pipe) => {
            const isSelected = activePipelineId === pipe.id;
            return (
              <button
                key={pipe.id}
                onClick={() => setActivePipelineId(pipe.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/30 scale-105'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{pipe.categoryLabelAr}</span>
              </button>
            );
          })}
        </div>

        {/* The 4-Step Engineering Bridge Pipeline View */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#091629] border border-cyan-700/40 shadow-2xl relative overflow-hidden">
          {/* Top Stage Information */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                المسار المهني المستهدف:
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {selectedPipeline.careerPathAr}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigateTab('develop')}
                className="px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>استكشف كورسات هذا المسار</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Connected 4 Stages Flow */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-8 relative">
            {/* Step 1: University Subject */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 relative group hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-700/60 text-cyan-300 text-xs font-mono font-black flex items-center justify-center">
                  01
                </span>
                <span className="text-[10px] font-mono text-slate-400">السنة {selectedPipeline.courseYear}</span>
              </div>
              <div>
                <span className="text-[10px] text-cyan-400 font-bold uppercase block mb-1">المادة الأكاديمية</span>
                <h4 className="text-sm font-bold text-white leading-snug">
                  {selectedPipeline.courseNameAr}
                </h4>
              </div>
              <p className="text-[11px] text-slate-400">
                الأساس العلمي والنظري في الخطة الدراسية لقسم الاتصالات والإلكترونيات.
              </p>
            </div>

            {/* Step 2: Engineering Tool / Lab Software */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 relative group hover:border-blue-500/50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-blue-950 border border-blue-700/60 text-blue-300 text-xs font-mono font-black flex items-center justify-center">
                  02
                </span>
                <span className="text-[10px] font-mono text-slate-400">أداة المحاكاة</span>
              </div>
              <div>
                <span className="text-[10px] text-blue-400 font-bold uppercase block mb-1">البرنامج المستخدم</span>
                <h4 className="text-sm font-bold text-white font-mono leading-snug">
                  {selectedPipeline.toolName}
                </h4>
              </div>
              <p className="text-[11px] text-slate-400">
                {selectedPipeline.toolCategory}
              </p>
            </div>

            {/* Step 3: Self-Development Course */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 relative group hover:border-indigo-500/50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-700/60 text-indigo-300 text-xs font-mono font-black flex items-center justify-center">
                  03
                </span>
                <span className="text-[10px] font-mono text-slate-400">التطوير الذاتي</span>
              </div>
              <div>
                <span className="text-[10px] text-indigo-400 font-bold uppercase block mb-1">الكورس المقترح</span>
                <h4 className="text-sm font-bold text-white font-mono leading-snug truncate">
                  {selectedPipeline.learningCourseTitle}
                </h4>
              </div>
              <p className="text-[11px] text-slate-400">
                المنصة: {selectedPipeline.learningPlatform}
              </p>
            </div>

            {/* Step 4: Practical Skill & Market Outcome */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/60 to-blue-950/60 border border-cyan-500/50 space-y-3 relative group">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-xs font-mono font-black flex items-center justify-center">
                  04
                </span>
                <span className="text-[10px] font-mono text-emerald-400">النتيجة العملية</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase block mb-1">المهارة المكتسبة</span>
                <h4 className="text-sm font-bold text-white leading-snug">
                  {selectedPipeline.practicalSkillTitle}
                </h4>
              </div>
              <p className="text-[11px] text-slate-300">
                جاهزية للعمل الميداني والبحثي ومشاريع التخرج المتقدمة.
              </p>
            </div>
          </div>

          {/* Bottom Narrative Callout */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedPipeline.skillOutcomeAr}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onNavigateTab('courses')}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
              >
                تصفح المقررات
              </button>
              <button
                onClick={() => onNavigateTab('software')}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold transition-colors"
              >
                برامج المحاكاة
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
