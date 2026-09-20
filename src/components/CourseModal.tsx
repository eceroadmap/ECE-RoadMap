import React, { useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  Cpu, 
  CheckCircle2, 
  GitFork, 
  Sparkles, 
  FileText, 
  ExternalLink,
  Layers,
  Star,
  Clock,
  Compass
} from 'lucide-react';
import { Course, SoftwareTool, CourseProgressStatus } from '../types';
import { SOFTWARE_DATA } from '../data/software';
import { COURSES_DATA } from '../data/courses';
import { useStudentState } from '../services/useStudentState';

interface CourseModalProps {
  course: Course | null;
  onClose: () => void;
  onSelectSoftware?: (software: SoftwareTool) => void;
  onSelectRelatedCourse?: (course: Course) => void;
}

export const CourseModal: React.FC<CourseModalProps> = ({
  course,
  onClose,
  onSelectSoftware,
  onSelectRelatedCourse
}) => {
  const { courseProgress, setCourseStatus } = useStudentState();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && course) {
        onClose();
      }
    };
    if (course) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [course, onClose]);

  if (!course) return null;

  const currentStatus: CourseProgressStatus | undefined = courseProgress[course.id];

  // Resolve linked software
  const linkedSoftware = SOFTWARE_DATA.filter((s) =>
    course.relatedSoftware.includes(s.id) ||
    s.usedInCourses.some((cName) => course.nameAr.includes(cName) || cName.includes(course.nameAr))
  );

  // Resolve related courses
  const relatedCoursesList = COURSES_DATA.filter((c) =>
    course.relatedCourses.includes(c.id)
  );

  const handleToggleStatus = (status: CourseProgressStatus) => {
    if (currentStatus === status) {
      setCourseStatus(course.id, null);
    } else {
      setCourseStatus(course.id, status);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="course-modal-title"
    >
      <div 
        className="w-full max-w-3xl bg-[#091426] border border-cyan-700/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="relative px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-[#071324] to-slate-950">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-700/50 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-cyan-400" />
                  السنة {course.year === 1 ? 'الأولى' : course.year === 2 ? 'الثانية' : course.year === 3 ? 'الثالثة' : course.year === 4 ? 'الرابعة' : 'الخامسة'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-900 text-slate-300 border border-slate-700/60">
                  الفصل {course.semester === 1 ? 'الأول' : 'الثاني'}
                </span>
                {course.tags.map((tag) => (
                  <span key={tag} className="text-[11px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-400">
                    #{tag}
                  </span>
                ))}
              </div>

              <h2 id="course-modal-title" className="text-2xl font-black text-white tracking-tight mt-2">
                {course.nameAr}
              </h2>
              {course.nameEn && (
                <p className="text-sm font-mono text-cyan-400/90" dir="ltr">
                  {course.nameEn}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors shrink-0"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Section 1: نظرة سريعة & حالة المقرر في رحلتي */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] text-cyan-400 font-bold flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" />
                حالة المقرر في رحلتي الأكاديمية:
              </span>
              <div className="text-xs text-slate-300">
                {currentStatus === 'completed' && <span className="text-emerald-400 font-bold">مقرر مجتاز ومكتمل ✅</span>}
                {currentStatus === 'important' && <span className="text-amber-300 font-bold">مقرر أساسي ذو أولوية عالية ⭐</span>}
                {currentStatus === 'to_study' && <span className="text-blue-300 font-bold">مقرر مخطط لدراسته في الخطة 📝</span>}
                {!currentStatus && <span className="text-slate-400">لم تقم بإضافته لرحلتك بعد</span>}
              </div>
            </div>

            {/* Quick Toggle Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggleStatus('important')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  currentStatus === 'important'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-amber-300 border border-slate-800'
                }`}
              >
                <Star className="w-3.5 h-3.5" />
                <span>مهم</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleStatus('to_study')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  currentStatus === 'to_study'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-blue-300 border border-slate-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>أريد دراسته</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleStatus('completed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  currentStatus === 'completed'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-emerald-400 border border-slate-800'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>مكتمل</span>
              </button>
            </div>
          </div>

          {/* Section 2: عن المادة */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4" />
              عن المادة
            </h3>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-slate-300 text-sm leading-relaxed space-y-2">
              <p>{course.shortDescription || 'سيتم إضافة هذه المعلومات لاحقاً.'}</p>
              {course.detailedDescription && course.detailedDescription !== course.shortDescription && (
                <p className="text-xs text-slate-400 border-t border-slate-800/60 pt-2">
                  {course.detailedDescription}
                </p>
              )}
            </div>
          </div>

          {/* Section 3: ماذا أتعلم؟ */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ماذا أتعلم في هذا المقرر؟
            </h3>
            {course.whatYouLearn && course.whatYouLearn.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {course.whatYouLearn.map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800/60 text-cyan-300 text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-xs text-slate-200 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs text-slate-400">
                سيتم إضافة هذه المعلومات لاحقاً.
              </div>
            )}
          </div>

          {/* Section 4: المتطلبات السابقة & مواد مرتبطة */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Prerequisites */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <GitFork className="w-4 h-4 text-amber-400" />
                المتطلبات السابقة
              </h3>
              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-1.5 min-h-[80px]">
                {course.prerequisites && course.prerequisites.length > 0 ? (
                  course.prerequisites.map((p, idx) => (
                    <div key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      <span>{p}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">لا تتطلب المادة متطلبات سابقة إجبارية.</p>
                )}
              </div>
            </div>

            {/* Related Academic Courses */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                مواد مرتبطة ولاحقة
              </h3>
              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex flex-wrap gap-1.5 min-h-[80px] items-center">
                {relatedCoursesList.length > 0 ? (
                  relatedCoursesList.map((rc) => (
                    <button
                      key={rc.id}
                      type="button"
                      onClick={() => onSelectRelatedCourse && onSelectRelatedCourse(rc)}
                      className="text-xs px-2.5 py-1.5 rounded-xl bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/50 text-blue-200 flex items-center gap-1.5 transition-colors"
                    >
                      <span>{rc.nameAr}</span>
                      <span className="text-[10px] text-blue-400">(سنة {rc.year})</span>
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">تعتبر محطة ختامية أو عامة في هذا المسار الأكاديمي.</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: البرمجيات المرتبطة */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              البرمجيات المرتبطة
            </h3>
            {linkedSoftware.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {linkedSoftware.map((sw) => (
                  <div
                    key={sw.id}
                    onClick={() => onSelectSoftware && onSelectSoftware(sw)}
                    className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-cyan-950/40 border border-slate-800/80 hover:border-cyan-500/40 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {sw.name}
                      </p>
                      <p className="text-xs text-slate-400 line-clamp-1">{sw.purpose}</p>
                    </div>
                    <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 shrink-0 font-medium">
                      عرض الأداة
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 text-xs text-slate-400">
                تركز هذه المادة على المفاهيم النظرية، التحليل الرياضي، أو التطبيق المخبري المباشر دون الحاجة لبرمجيات حاسوبية معقدة.
              </div>
            )}
          </div>

          {/* Section 6: موارد إضافية */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              موارد إضافية
            </h3>
            <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-2">
              {course.usefulResources && course.usefulResources.length > 0 ? (
                course.usefulResources.map((res, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                      <span>{res.title}</span>
                    </div>
                    {res.isPlaceholder ? (
                      <span className="text-[11px] text-slate-400 italic">
                        سيتم إضافة هذه المعلومات لاحقاً.
                      </span>
                    ) : (
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        فتح
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">سيتم إضافة هذه المعلومات لاحقاً.</p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            رمز المقرر والمعلومات مستندة إلى الخطة الرسمية المعتمدة
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
