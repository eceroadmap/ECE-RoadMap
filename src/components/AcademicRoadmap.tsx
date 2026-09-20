import React, { useState } from 'react';
import { 
  CheckCircle, 
  ArrowLeft, 
  Cpu, 
  BookOpen, 
  Sparkles, 
  GraduationCap, 
  Layers, 
  Zap
} from 'lucide-react';
import { YearMilestone, AcademicYearNumber, Course, SoftwareTool } from '../types';
import { YEAR_MILESTONES } from '../data/years';
import { COURSES_DATA } from '../data/courses';
import { SOFTWARE_DATA } from '../data/software';

interface AcademicRoadmapProps {
  initialYear?: AcademicYearNumber;
  onSelectYearCourses: (year: AcademicYearNumber) => void;
  onSelectCourse: (course: Course) => void;
  onSelectSoftware: (software: SoftwareTool) => void;
}

export const AcademicRoadmap: React.FC<AcademicRoadmapProps> = ({
  initialYear = 1,
  onSelectYearCourses,
  onSelectCourse,
  onSelectSoftware
}) => {
  const [selectedYear, setSelectedYear] = useState<AcademicYearNumber>(initialYear);

  const activeMilestone = YEAR_MILESTONES.find((m) => m.yearNumber === selectedYear) || YEAR_MILESTONES[0];

  // Get courses belonging to selected year split by semester
  const yearCoursesSem1 = COURSES_DATA.filter(
    (c) => c.year === selectedYear && c.semester === 1
  );
  const yearCoursesSem2 = COURSES_DATA.filter(
    (c) => c.year === selectedYear && c.semester === 2
  );

  // Get linked software
  const linkedSoftware = SOFTWARE_DATA.filter((s) =>
    s.academicYears.includes(selectedYear)
  );

  return (
    <div className="space-y-8 sm:space-y-12 w-full max-w-full overflow-hidden">
      {/* Header Description */}
      <div className="text-center max-w-3xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/50 text-cyan-300 text-xs font-mono mb-3">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          رحلة الاستكشاف والتقدم الأكاديمي
        </div>
        <h2 className="text-fluid-title font-black text-white tracking-tight">
          الخارطة الأكاديمية التفاعلية
        </h2>
        <p className="text-fluid-body text-slate-400 mt-2 leading-relaxed">
          تتبع مسارك الهندسي عبر 5 محطات رئيسية حتى مشروع التخرج. اختر أي سنة لاستكشاف مرحلتها، مهاراتها المكتسبة، والمقررات والبرمجيات المعتمدة فيها.
        </p>
      </div>

      {/* Interactive Milestone Stepper Path (Engineering Bus on Desktop / Adaptive Grid on Mobile) */}
      <div className="relative max-w-5xl mx-auto px-2 sm:px-4">
        {/* Glowing Background Bus Trace Line (Desktop only >= 768px) */}
        <div className="hidden md:block absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1 bg-slate-800 rounded-full z-0 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-all duration-500 shadow-lg shadow-cyan-500/50"
            style={{ width: `${((selectedYear - 1) / 4) * 100}%` }}
          />
        </div>

        {/* Milestone Nodes: 5 columns on Desktop/Laptop, 3 on Tablet, 2 on Mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-4 relative z-10">
          {YEAR_MILESTONES.map((milestone) => {
            const isSelected = selectedYear === milestone.yearNumber;
            const isCompletedBefore = milestone.yearNumber < selectedYear;

            return (
              <button
                key={milestone.yearNumber}
                id={`milestone-node-year-${milestone.yearNumber}`}
                onClick={() => setSelectedYear(milestone.yearNumber)}
                className={`p-3 sm:p-4 rounded-2xl text-right transition-all duration-300 border flex flex-col justify-between group min-h-[90px] sm:min-h-[110px] ${
                  isSelected
                    ? 'bg-[#0b192e] border-cyan-400 shadow-xl shadow-cyan-950/80 scale-[1.02] ring-2 ring-cyan-500/30'
                    : isCompletedBefore
                    ? 'bg-[#081324] border-slate-700/80 hover:border-cyan-600/60'
                    : 'bg-[#070e1b] border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Year Badge & Status Indicator */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center transition-transform ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/50 scale-105'
                        : isCompletedBefore
                        ? 'bg-blue-950 text-cyan-300 border border-blue-700/50'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    0{milestone.yearNumber}
                  </span>

                  <span className="text-[10px] font-medium text-slate-400">
                    {milestone.yearNumber === 5 ? 'التخرج 🎓' : `المرحلة ${milestone.yearNumber}`}
                  </span>
                </div>

                <div>
                  <h3 className={`text-xs sm:text-sm font-bold transition-colors ${
                    isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'
                  }`}>
                    {milestone.titleAr}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {milestone.stageTitleAr}
                  </p>
                </div>

                <div className="mt-2 sm:mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] sm:text-[11px]">
                  <span className="text-cyan-400 font-medium">
                    {milestone.courseIds.length} مواد
                  </span>
                  <span className={`text-[9px] sm:text-[10px] font-medium ${
                    isSelected ? 'text-cyan-300 font-bold' : 'text-slate-500'
                  }`}>
                    {isSelected ? 'المحطة الحالية' : 'استعراض'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Milestone Detailed Showcase Card */}
      <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-b from-[#0a172a] to-[#071120] border border-cyan-700/40 p-4 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative space-y-6 sm:space-y-8">
          {/* Milestone Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
            <div className="space-y-1.5 text-right">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                  السنة {activeMilestone.yearNumber} &bull; {activeMilestone.titleEn}
                </span>
                <span className="text-xs text-slate-400">
                  {activeMilestone.yearNumber === 5 ? 'مرحلة التخصص ومشروع التخرج' : 'المقررات الأساسية والتطبيقية'}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                {activeMilestone.titleAr}: {activeMilestone.stageTitleAr}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                {activeMilestone.stageSummaryAr}
              </p>
            </div>

            {/* CTA Button to Full Course Filter */}
            <button
              id={`explore-year-courses-btn-${selectedYear}`}
              onClick={() => onSelectYearCourses(selectedYear)}
              className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-cyan-950 shrink-0 min-h-[44px]"
            >
              <BookOpen className="w-4 h-4" />
              <span>استكشف مواد السنة {selectedYear} بالتفصيل</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Key Skills & Software Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Skills Acquired */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                المهارات والخبرات المكتسبة في هذه السنة
              </h4>
              <ul className="space-y-2">
                {activeMilestone.keySkills.map((skill, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Software Used in this Year */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                البرمجيات والأدوات الهندسية المستخدمة
              </h4>
              {linkedSoftware.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {linkedSoftware.map((sw) => (
                    <button
                      key={sw.id}
                      onClick={() => onSelectSoftware(sw)}
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-cyan-950/50 border border-slate-800 hover:border-cyan-500/50 text-xs text-slate-200 flex items-center gap-2 transition-colors group min-h-[38px]"
                    >
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span className="font-semibold group-hover:text-cyan-300 font-mono">{sw.name}</span>
                      <span className="text-[10px] text-slate-400">({sw.categoryLabelAr})</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  يركز هذا الطور على المهارات الرياضية والتحليل النظري والمخبري العام.
                </p>
              )}

              {/* Special Note for Year 5 */}
              {selectedYear === 5 && (
                <div className="mt-3 p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-xs text-blue-200 flex items-start gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">مشروع التخرج:</span>
                    يتوج دراستك باختيار موضوع بحثي وتطبيقي متقدم في الاتصالات، الإلكترونيات، أو معالجة الإشارة.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Curriculum View for this Year (Semester 1 & Semester 2) */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              مقررات السنة {selectedYear} حسب الفصول
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Semester 1 */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-cyan-300">
                  <span>الفصل الدراسي الأول</span>
                  <span className="text-[11px] text-slate-400">{yearCoursesSem1.length} مقررات</span>
                </div>
                <div className="space-y-1.5">
                  {yearCoursesSem1.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => onSelectCourse(course)}
                      className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-cyan-950/40 border border-slate-850 hover:border-cyan-500/40 transition-all cursor-pointer flex items-center justify-between gap-2 group min-h-[44px]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 truncate">
                          {course.nameAr}
                        </span>
                      </div>
                      {course.nameEn && (
                        <span className="text-[10px] font-mono text-slate-400 shrink-0" dir="ltr">
                          {course.nameEn}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Semester 2 */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-cyan-300">
                  <span>الفصل الدراسي الثاني</span>
                  <span className="text-[11px] text-slate-400">{yearCoursesSem2.length} مقررات</span>
                </div>
                <div className="space-y-1.5">
                  {yearCoursesSem2.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => onSelectCourse(course)}
                      className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-cyan-950/40 border border-slate-850 hover:border-cyan-500/40 transition-all cursor-pointer flex items-center justify-between gap-2 group min-h-[44px]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 truncate">
                          {course.nameAr}
                        </span>
                      </div>
                      {course.nameEn && (
                        <span className="text-[10px] font-mono text-slate-400 shrink-0" dir="ltr">
                          {course.nameEn}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
