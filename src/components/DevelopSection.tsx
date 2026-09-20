import React, { useState } from 'react';
import { 
  Sparkles, 
  Radio, 
  Globe, 
  Code2, 
  Cpu, 
  Monitor, 
  Shield, 
  Eye, 
  ArrowDown, 
  Layers, 
  CheckCircle2, 
  Compass,
  FileCheck2,
  ChevronDown
} from 'lucide-react';
import { SkillCategory, SkillCourse } from '../types';
import { SKILL_COURSES_DATA, LEARNING_PATHS, LearningPath } from '../data/skills';

export const DevelopSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'all'>('all');
  const [activePathId, setActivePathId] = useState<string>(LEARNING_PATHS[0].id);

  const categories = [
    { id: 'all', label: 'جميع المهارات', icon: Sparkles },
    { id: 'communications', label: 'الاتصالات', icon: Radio },
    { id: 'networking', label: 'الشبكات', icon: Globe },
    { id: 'programming', label: 'البرمجة', icon: Code2 },
    { id: 'electronics', label: 'الإلكترونيات', icon: Cpu },
    { id: 'office', label: 'ICDL و Office', icon: Monitor },
    { id: 'cybersecurity', label: 'الأمن السيبراني', icon: Shield },
    { id: 'computervision', label: 'الرؤية الحاسوبية', icon: Eye }
  ];

  const filteredCourses = selectedCategory === 'all'
    ? SKILL_COURSES_DATA
    : SKILL_COURSES_DATA.filter((c) => c.category === selectedCategory);

  const activePath = LEARNING_PATHS.find((p) => p.id === activePathId) || LEARNING_PATHS[0];

  return (
    <div className="space-y-14 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          التأهيل التقني وسوق العمل
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          طوّر نفسك خارج الجامعة
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          سلاسل منهجية ومسارات لتطوير مهاراتك العملية في هندسة الاتصالات، الشبكات، البرمجة، والإلكترونيات من الأساسيات حتى إنجاز المشاريع الحقيقية.
        </p>

        {/* Clear Disclaimer Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 text-amber-300/90 text-xs text-right">
          <Compass className="w-4 h-4 text-amber-400 shrink-0" />
          <span>مسارات تطوير ذاتي — مهارات مساندة وخبرات عملية، وليست متطلبات جامعية رسمية ملزمة.</span>
        </div>
      </div>

      {/* Structured Progression Roadmap: START ↓ FOUNDATION ↓ INTERMEDIATE ↓ ADVANCED ↓ PROJECT */}
      <div className="rounded-3xl bg-[#091527] border border-cyan-500/20 p-6 sm:p-8 shadow-2xl space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">
                هيكلية المسارات التقنية المتسلسلة
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              تسلسل متكامل: البداية (START) ↓ التأسيس (FOUNDATION) ↓ المتوسط (INTERMEDIATE) ↓ المتقدم (ADVANCED) ↓ المشروع (PROJECT)
            </p>
          </div>

          {/* Path Switcher Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
            {LEARNING_PATHS.map((path) => (
              <button
                key={path.id}
                type="button"
                onClick={() => setActivePathId(path.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activePathId === path.id
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {path.titleAr.split(' ')[1] || path.titleAr}
              </button>
            ))}
          </div>
        </div>

        {/* Active Path Details */}
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                {activePath.titleEn}
              </span>
              <h4 className="text-xl font-black text-white">
                {activePath.titleAr}
              </h4>
              <p className="text-xs text-slate-300">
                {activePath.summaryAr}
              </p>
            </div>
          </div>

          {/* Visual Step Flow: START -> FOUNDATION -> INTERMEDIATE -> ADVANCED -> PROJECT */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative pt-2">
            {activePath.steps.map((step, idx) => {
              const stageBadgeColor = 
                step.stage === 'START' ? 'bg-slate-800 text-slate-300 border-slate-700' :
                step.stage === 'FOUNDATION' ? 'bg-blue-950 text-blue-300 border-blue-800' :
                step.stage === 'INTERMEDIATE' ? 'bg-cyan-950 text-cyan-300 border-cyan-800' :
                step.stage === 'ADVANCED' ? 'bg-purple-950 text-purple-300 border-purple-800' :
                'bg-emerald-950 text-emerald-300 border-emerald-800';

              return (
                <div key={idx} className="relative flex flex-col justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-colors space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${stageBadgeColor}`}>
                        {step.stage}
                      </span>
                      <span className="text-xs font-mono text-slate-500 font-bold">
                        0{idx + 1}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-400">
                      {step.stageLabelAr}
                    </div>

                    <h5 className="text-sm font-bold text-white">
                      {step.title}
                    </h5>

                    <p className="text-[11px] text-cyan-300/80 font-medium">
                      {step.subtitle}
                    </p>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {step.relatedTools && step.relatedTools.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] text-slate-500">أدوات:</span>
                      {step.relatedTools.map((t, i) => (
                        <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modular Self-Development Skills Directory */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              دليل المهارات والدورات المستقلة
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              استكشف المواضيع التخصصية المتنوعة مصنفة حسب المجال الهندسي.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Skill Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-[#091527] border border-slate-800/80 hover:border-cyan-500/40 transition-all duration-200 shadow-lg flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Category & Level Badges */}
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-900 text-slate-300 border border-slate-800">
                    {item.categoryLabelAr}
                  </span>

                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                    المستوى: {item.levelAr}
                  </span>
                </div>

                {/* Course Title */}
                <div>
                  <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {item.titleAr}
                  </h4>
                  {item.titleEn && (
                    <p className="text-xs text-slate-400 font-mono mt-0.5" dir="ltr">
                      {item.titleEn}
                    </p>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.descriptionAr}
                </p>

                {/* Related Software */}
                {item.relatedSoftware.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/60 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400">البرمجيات المرتبطة:</span>
                    {item.relatedSoftware.map((sw, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800"
                      >
                        {sw}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Resource Link Placeholder */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 italic text-[11px]">
                  {item.linkPlaceholder}
                </span>
                <span className="text-[10px] px-2 py-1 rounded bg-slate-800/80 text-slate-400 font-medium">
                  مسار مقترح
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
