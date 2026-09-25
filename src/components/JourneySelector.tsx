import React from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  ArrowLeft, 
  CheckCircle, 
  Laptop, 
  Cpu, 
  HelpCircle,
  Map
} from 'lucide-react';
import { ActiveTab, AcademicYearNumber } from '../types';

interface JourneySelectorProps {
  onNavigateTab: (tab: ActiveTab, selectedYear?: AcademicYearNumber) => void;
}

export const JourneySelector: React.FC<JourneySelectorProps> = ({ onNavigateTab }) => {
  return (
    <section id="journey-section" className="py-16 border-t border-slate-800/60 bg-slate-950/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 inline-block">
            دليل التوجيه الطلابي
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            أين أنت في رحلتك؟
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            اختر مرحلتك الحالية للحصول على المسار الأنسب والروابط الأكثر فائدة لك في هذه اللحظة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card A: High School / Baccalaureate Student */}
          <div 
            id="journey-card-baccalaureate"
            className="p-6 rounded-2xl bg-[#091527] border border-cyan-900/40 hover:border-cyan-500/50 transition-all duration-300 shadow-xl flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>

              <div>
                <span className="text-xs font-semibold text-cyan-400">طالب بكالوريا</span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  اكتشف القسم قبل أن تبدأ
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  هل تفكر بالتسجيل في قسم هندسة الإلكترونيات والاتصالات بجامعة دمشق؟ تعرف على طبيعة الدراسة، الفرق بين الإلكترونيات والاتصالات، ومجالات العمل بعد التخرج.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>ماذا ستدرس خلال 5 سنوات؟</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>هل القسم مناسب لاهتماماتك وطموحك؟</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => onNavigateTab('roadmap', 1)}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Map className="w-3.5 h-3.5" />
                <span>استكشف مواد وخطة السنة الأولى</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigateTab('faq')}
                className="w-full py-2 px-4 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center justify-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>الأسئلة الأكثر تكراراً عن القسم</span>
              </button>
            </div>
          </div>

          {/* Card B: Newly Admitted Student */}
          <div 
            id="journey-card-freshman"
            className="p-6 rounded-2xl bg-[#08182b] border border-blue-800/40 hover:border-blue-400/50 transition-all duration-300 shadow-xl flex flex-col justify-between group relative overflow-hidden"
          >
            {/* Subtle glow highlight */}
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-4 relative">
              <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-700/60 flex items-center justify-center text-blue-300 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>

              <div>
                <span className="text-xs font-semibold text-blue-400">طالب مستجد</span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  اعرف ماذا ينتظرك
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  مبارك قبولك في القسم! دليلك العملي لتجهيز نفسك، اختيار اللابتوب المناسب لسنوات الدراسة، والوصول لمحاضرات ومراجع فريق نُون وقنوات التواصل.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>فحص مواصفات اللابتوب المطلوب للدراسة</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>محاضرات وملاحق فريق نُون الأكاديمي</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-800 flex flex-col gap-2 relative">
              <button
                onClick={() => onNavigateTab('laptop')}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-950/50"
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>مستشار اللابتوب (افحص جهازك)</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigateTab('hub')}
                className="w-full py-2 px-4 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>الوصول لمركز مصادر الطالب (Hub)</span>
              </button>
            </div>
          </div>

          {/* Card C: Current Student */}
          <div 
            id="journey-card-current"
            className="p-6 rounded-2xl bg-[#091527] border border-cyan-900/40 hover:border-cyan-500/50 transition-all duration-300 shadow-xl flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>

              <div>
                <span className="text-xs font-semibold text-indigo-400">طالب حالي</span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  خطط لمرحلتك القادمة
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  تدرس حالياً في إحدى السنوات؟ خطط للمقررات التخصصية القادمة، تعرف على برمجيات المحاكاة (MATLAB, Quartus, HFSS)، وطوّر مهاراتك في الاتصالات والشبكات والبرمجة.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>دليل برامج المحاكاة الهندسية الرسمية</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>مسارات التعلم والتطوير الذاتي خارج الكلية</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => onNavigateTab('develop')}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                <span>استكشف مسارات طوّر نفسك</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigateTab('software')}
                className="w-full py-2 px-4 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center justify-center gap-1.5"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>حزمة برمجيات القسم (16 برنامجاً)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
