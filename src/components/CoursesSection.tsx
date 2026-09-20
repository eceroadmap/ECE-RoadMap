import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  ArrowLeft, 
  Cpu, 
  Sparkles,
  Layers
} from 'lucide-react';
import { Course, AcademicYearNumber, SoftwareTool } from '../types';
import { COURSES_DATA } from '../data/courses';
import { soundEffects } from '../utils/soundEffects';

interface CoursesSectionProps {
  initialYearFilter?: AcademicYearNumber | 'all';
  onSelectCourse: (course: Course) => void;
  onSelectSoftware: (software: SoftwareTool) => void;
}

export const CoursesSection: React.FC<CoursesSectionProps> = ({
  initialYearFilter = 'all',
  onSelectCourse
}) => {
  const [yearFilter, setYearFilter] = useState<AcademicYearNumber | 'all'>(initialYearFilter);
  const [semesterFilter, setSemesterFilter] = useState<1 | 2 | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = useMemo(() => {
    return COURSES_DATA.filter((course) => {
      // Year filter
      if (yearFilter !== 'all' && course.year !== yearFilter) return false;
      // Semester filter
      if (semesterFilter !== 'all' && course.semester !== semesterFilter) return false;
      // Search text
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchAr = course.nameAr.toLowerCase().includes(q);
        const matchEn = course.nameEn ? course.nameEn.toLowerCase().includes(q) : false;
        const matchTags = course.tags.some(t => t.toLowerCase().includes(q));
        const matchSoftware = course.relatedSoftware.some(s => s.toLowerCase().includes(q));
        return matchAr || matchEn || matchTags || matchSoftware;
      }
      return true;
    });
  }, [yearFilter, semesterFilter, searchQuery]);

  const yearCounts = useMemo(() => {
    const counts: Record<string, number> = { all: COURSES_DATA.length };
    [1, 2, 3, 4, 5].forEach((y) => {
      counts[y] = COURSES_DATA.filter(c => c.year === y).length;
    });
    return counts;
  }, []);

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-xs font-mono mb-3">
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          الخطة الدراسية الرسمية المعتمدة
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          دليل المقررات الأكاديمية
        </h2>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          استكشف تفاصيل وتوصيف أكثر من 50 مقرراً تخصصياً موزعة على سنوات وفصول الخطة الدراسية في قسم هندسة الإلكترونيات والاتصالات.
        </p>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-4 max-w-5xl mx-auto">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-cyan-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم العربي، المصطلح الإنجليزي، أو الوسم (مثال: معالجة إشارة، هوائيات، C#)..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-500/50 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Filter Rows */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-800/60 text-xs">
          {/* Year Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-slate-400 shrink-0 font-medium ml-1">السنة:</span>
            {[
              { id: 'all', label: `الكل (${yearCounts.all})` },
              { id: 1, label: `الأولى (${yearCounts[1]})` },
              { id: 2, label: `الثانية (${yearCounts[2]})` },
              { id: 3, label: `الثالثة (${yearCounts[3]})` },
              { id: 4, label: `الرابعة (${yearCounts[4]})` },
              { id: 5, label: `الخامسة (${yearCounts[5]})` }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  soundEffects.playClick();
                  setYearFilter(item.id as any);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  yearFilter === item.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Semester Toggle */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-slate-400 font-medium ml-1">الفصل:</span>
            {[
              { id: 'all', label: 'الكل' },
              { id: 1, label: 'الفصل الأول' },
              { id: 2, label: 'الفصل الثاني' }
            ].map((sem) => (
              <button
                key={sem.id}
                onClick={() => setSemesterFilter(sem.id as any)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  semesterFilter === sem.id
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {sem.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count Bar */}
      <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-slate-400 px-2">
        <span>عرض {filteredCourses.length} من أصل {COURSES_DATA.length} مقرراً دراسياً</span>
        {(yearFilter !== 'all' || semesterFilter !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setYearFilter('all');
              setSemesterFilter('all');
              setSearchQuery('');
            }}
            className="text-cyan-400 hover:underline"
          >
            إعادة تعيين المرشحات
          </button>
        )}
      </div>

      {/* Courses Cards Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            id={`course-card-${course.id}`}
            onClick={() => {
              soundEffects.playModalOpen();
              onSelectCourse(course);
            }}
            className="p-5 rounded-2xl bg-[#091527] border border-slate-800/80 hover:border-cyan-500/50 hover:bg-[#0c1c33] transition-all duration-200 shadow-lg cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-3">
              {/* Top Tags & Academic Meta */}
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                  سنة {course.year} &bull; فـ{course.semester}
                </span>

                <span className="text-[11px] text-slate-400">
                  {course.tags[0] ? `#${course.tags[0]}` : ''}
                </span>
              </div>

              {/* Course Title */}
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {course.nameAr}
                </h3>
                {course.nameEn && (
                  <p className="text-xs text-slate-400 font-mono mt-0.5" dir="ltr">
                    {course.nameEn}
                  </p>
                )}
              </div>

              {/* Short Description */}
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {course.shortDescription}
              </p>

              {/* Software Tool Badge if any */}
              {course.relatedSoftware.length > 0 && (
                <div className="pt-2 border-t border-slate-800/60 flex items-center gap-1.5 flex-wrap">
                  <Cpu className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="text-[10px] text-slate-400">البرامج:</span>
                  {course.relatedSoftware.map((swId) => (
                    <span
                      key={swId}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800"
                    >
                      {swId}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Card Action */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-medium">
              <span>عرض تفاصيل المقرر والتوصيف</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="py-16 text-center text-slate-400 max-w-md mx-auto">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-200">لا توجد مواد تطابق خيارات التصفية الحالية</p>
          <p className="text-xs text-slate-400 mt-1">يرجى تعديل معايير البحث أو تصفية السنوات.</p>
        </div>
      )}
    </div>
  );
};
