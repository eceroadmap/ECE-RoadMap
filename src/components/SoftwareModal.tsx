import React, { useEffect } from 'react';
import { 
  X, 
  Cpu, 
  BookOpen, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles,
  Layers
} from 'lucide-react';
import { SoftwareTool, Course } from '../types';
import { COURSES_DATA } from '../data/courses';

interface SoftwareModalProps {
  software: SoftwareTool | null;
  onClose: () => void;
  onSelectCourse?: (course: Course) => void;
}

export const SoftwareModal: React.FC<SoftwareModalProps> = ({
  software,
  onClose,
  onSelectCourse
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && software) {
        onClose();
      }
    };
    if (software) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [software, onClose]);

  if (!software) return null;

  // Find linked Course objects using structured ID references and Arabic names
  const relatedCourseObjects = COURSES_DATA.filter((c) =>
    c.relatedSoftware.includes(software.id) ||
    software.usedInCourses.some(
      (uName) => c.nameAr.includes(uName) || uName.includes(c.nameAr) || c.id === uName
    )
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-[#091426] border border-cyan-700/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-[#0a162b] to-slate-950">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-700/50 flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-cyan-400" />
                  {software.categoryLabelAr}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-900 text-slate-300 border border-slate-700/60">
                  السنوات: {software.academicYears.map(y => `سنة ${y}`).join('، ')}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white tracking-tight mt-1 font-mono">
                {software.name}
              </h2>
              {software.arabicName && (
                <p className="text-xs text-slate-400 font-medium">
                  {software.arabicName}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Description & Purpose */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              الهدف والاستخدام الأكاديمي
            </h3>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-slate-200 text-sm leading-relaxed space-y-2">
              <p>{software.description}</p>
              <p className="text-xs text-slate-400 border-t border-slate-800/60 pt-2 font-medium">
                <span className="text-cyan-400">الغاية الأساسية:</span> {software.purpose}
              </p>
            </div>
          </div>

          {/* Used in Courses */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              المقررات التي تعتمد على هذا البرنامج
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {relatedCourseObjects.length > 0 ? (
                relatedCourseObjects.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => {
                      if (onSelectCourse) {
                        onClose();
                        onSelectCourse(course);
                      }
                    }}
                    className="p-3 rounded-xl bg-slate-900/60 hover:bg-blue-950/40 border border-slate-800/80 hover:border-blue-500/40 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        {course.nameAr}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        السنة {course.year} &bull; الفصل {course.semester}
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/40">
                      تفاصيل المادة
                    </span>
                  </div>
                ))
              ) : (
                software.usedInCourses.map((cName, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-300">
                    {cName}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Official Download & Requirements */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              رابط التحميل والتثبيت
            </h3>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-200">النسخة المعتمدة مخبرياً</p>
                <p className="text-[11px] text-slate-400">حزم التثبيت وملفات الإعداد الرسمية</p>
              </div>
              {software.officialDownloadLink ? (
                <a
                  href={software.officialDownloadLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل</span>
                </a>
              ) : (
                <span className="text-xs text-slate-400 italic px-3 py-1.5 rounded bg-slate-900 border border-slate-800">
                  سيتم إضافة الرابط لاحقاً.
                </span>
              )}
            </div>
          </div>

          {/* Learning Resources */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              المصادر التعليمية والشروحات
            </h3>
            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-2">
              {software.learningResources.map((res, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span>{res.title}</span>
                  </div>
                  {res.isPlaceholder ? (
                    <span className="text-[11px] text-slate-400 italic">
                      سيتم إضافة الرابط لاحقاً.
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
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            أداة برمجية ضمن المنهاج الرسمي لقسم هندسة الإلكترونيات والاتصالات
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
