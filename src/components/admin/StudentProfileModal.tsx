import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Key, 
  Calendar, 
  Clock, 
  Cloud, 
  CheckCircle2, 
  AlertCircle, 
  Laptop, 
  BookOpen, 
  Layers, 
  MessageSquare, 
  Copy, 
  Check, 
  ShieldCheck, 
  GraduationCap, 
  Cpu, 
  HardDrive, 
  Compass,
  ThumbsUp,
  Info,
  Award
} from 'lucide-react';
import { AdminStudentRecord } from '../../types/admin';
import { CommunityTip } from '../../types/student';
import { adminRepository } from '../../services/admin/adminRepository';
import { studentPresenceService } from '../../services/studentPresenceService';
import { COURSES_DATA } from '../../data/courses';
import { adminAuthService } from '../../services/admin/adminAuth';

interface StudentProfileModalProps {
  student: AdminStudentRecord | null;
  onClose: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ student, onClose }) => {
  const [copiedUid, setCopiedUid] = useState(false);
  const [tips, setTips] = useState<CommunityTip[]>([]);
  const [isLoadingTips, setIsLoadingTips] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'laptop' | 'community' | 'academic_record'>('overview');

  useEffect(() => {
    if (!student?.uid) return;

    let isMounted = true;
    const fetchTips = async () => {
      setIsLoadingTips(true);
      try {
        const studentTips = await adminRepository.getStudentCommunityTips(student.uid);
        if (isMounted) {
          setTips(studentTips);
        }
      } catch (err) {
        console.warn('Failed to load student tips:', err);
      } finally {
        if (isMounted) {
          setIsLoadingTips(false);
        }
      }
    };

    fetchTips();

    return () => {
      isMounted = false;
    };
  }, [student?.uid]);

  if (!student) return null;

  const studentName = student.displayName || student.name || student.fullName || 'طالب مسجل';

  const handleCopyUid = () => {
    if (!student.uid) return;
    navigator.clipboard.writeText(student.uid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'غير متوفر';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return 'غير متوفر';
      return date.toLocaleDateString('ar-SY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  const getAcademicYearLabel = (year?: number | string) => {
    if (year === 'graduate' || year === 'خريج') return 'خريج / مرحلة التخرج';
    switch (Number(year)) {
      case 1: return 'السنة الأولى (مستجد)';
      case 2: return 'السنة الثانية';
      case 3: return 'السنة الثالثة';
      case 4: return 'السنة الرابعة';
      case 5: return 'السنة الخامسة (تخرج)';
      default: return year ? `السنة ${year}` : 'غير محدد';
    }
  };

  const getSemesterLabel = (sem?: number | string) => {
    switch (Number(sem)) {
      case 1: return 'الفصل الدراسي الأول';
      case 2: return 'الفصل الدراسي الثاني';
      default: return sem ? `الفصل ${sem}` : 'غير محدد';
    }
  };

  // Course progress calculations
  const progressMap = student.coursesProgress || {};
  const courseEntries = Object.entries(progressMap);
  const totalTracked = courseEntries.length;

  const completedCourses = courseEntries.filter(([_, status]) => status === 'completed');
  const studyingCourses = courseEntries.filter(([_, status]) => status === 'to_study');
  const importantCourses = courseEntries.filter(([_, status]) => status === 'important');

  const completedPct = totalTracked > 0 ? Math.round((completedCourses.length / totalTracked) * 100) : 0;
  const studyingPct = totalTracked > 0 ? Math.round((studyingCourses.length / totalTracked) * 100) : 0;
  const importantPct = totalTracked > 0 ? Math.round((importantCourses.length / totalTracked) * 100) : 0;

  // Course metadata lookup
  const courseLookup = new Map(COURSES_DATA.map(c => [c.id, c]));

  const renderCourseBadgeList = (items: [string, string][], badgeColor: string) => {
    if (items.length === 0) return <span className="text-xs text-slate-500">لا توجد مقررات</span>;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {items.map(([courseId]) => {
          const courseMeta = courseLookup.get(courseId);
          return (
            <div 
              key={courseId} 
              className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-2"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {courseMeta?.nameAr || courseId}
                </div>
                {courseMeta?.nameEn && (
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    {courseMeta.nameEn}
                  </div>
                )}
                <div className="text-[10px] text-slate-500">
                  {courseMeta ? `السنة ${courseMeta.year} • الفصل ${courseMeta.semester}` : 'رمز: ' + courseId}
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${badgeColor}`}>
                {courseId}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const hasSavedLaptop = !!student.savedLaptop?.specs;
  const laptopSpecs = student.savedLaptop?.specs;
  const laptopEval = student.savedLaptop?.evaluation;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
      dir="rtl"
    >
      <div className="w-full max-w-4xl bg-[#091527] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-xl font-black shadow-lg">
              {studentName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {studentName}
                </h2>
                {student.email ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 text-[10px] font-bold flex items-center gap-1">
                    <Cloud className="w-3 h-3 text-emerald-400" />
                    <span>حساب Google متزامن</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold">
                    وضع محلي (غير مسجل بريد)
                  </span>
                )}
                {student.onboardingCompleted && (
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                    <span>مهيأ أكاديمياً</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {student.email || 'حساب زائر محلي على المتصفح'}
              </p>

              {adminAuthService.getIsOwner() && (() => {
                const presence = studentPresenceService.getPresenceStatus(
                  student.lastActiveAt,
                  student.lastSyncedAt,
                  student.updatedAt,
                  student.createdAt
                );
                return (
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs font-bold">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${presence.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                    <span className={presence.isOnline ? 'text-emerald-300' : 'text-slate-300'}>
                      {presence.statusLabelAr}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({presence.exactDateFormatted})
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 bg-slate-900/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>المعلومات الأساسية والرحلة</span>
          </button>

          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 ${
              activeTab === 'courses'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>التقدم الأكاديمي ({totalTracked})</span>
          </button>

          <button
            onClick={() => setActiveTab('laptop')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 ${
              activeTab === 'laptop'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>مواصفات اللابتوب {hasSavedLaptop && '✓'}</span>
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 ${
              activeTab === 'community'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>مساهمات الطالب ({tips.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('academic_record')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 ${
              activeTab === 'academic_record'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>السجل الأكاديمي ({Object.keys(student.academicGrades || {}).length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Section 1: Basic Identifiers */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>المعلومات الأساسية وبيانات الحساب</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400">الاسم الظاهر</span>
                    <div className="text-sm font-bold text-white">
                      {studentName}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400">البريد الإلكتروني</span>
                    <div className="text-sm font-bold text-white truncate font-mono">
                      {student.email || 'غير مسجل (حساب محلي)'}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">معرّف الطالب (UID)</span>
                      <button
                        onClick={handleCopyUid}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                        title="نسخ UID"
                      >
                        {copiedUid ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedUid ? 'تم النسخ' : 'نسخ'}</span>
                      </button>
                    </div>
                    <div className="text-xs font-mono text-cyan-300 truncate">
                      {student.uid}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400">حالة الحساب</span>
                    <div className="text-xs font-bold text-white">
                      {student.email ? 'حساب سحابي متزامن (Google)' : 'وضع زائر محلي'}
                    </div>
                  </div>

                  {adminAuthService.getIsOwner() && (
                    <>
                      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/40 space-y-1">
                        <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                          <User className="w-3.5 h-3.5" /> اسم المستخدم (يوزر نيم)
                        </span>
                        <div className="text-xs font-mono font-bold text-white">
                          {student.username || 'غير محدد بعد'}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/40 space-y-1">
                        <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                          <Key className="w-3.5 h-3.5" /> كلمة المرور (للمالك فقط)
                        </span>
                        <div className="text-xs font-mono font-bold text-cyan-300">
                          {student.accountPassword || 'غير محددة بعد'}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400">حالة التهيئة الأكاديمية (Onboarding)</span>
                    <div className="text-xs font-bold">
                      {student.onboardingCompleted ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> مكتملة بنجاح
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> قيد الإعداد أو غير مكتملة
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400">مواصفات اللابتوب</span>
                    <div className="text-xs font-bold">
                      {hasSavedLaptop ? (
                        <span className="text-cyan-400 flex items-center gap-1">
                          <Laptop className="w-3.5 h-3.5" /> تم حفظ وفحص المواصفات
                        </span>
                      ) : (
                        <span className="text-slate-400">لم يحفظ مواصفات بعد</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Academic Journey */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  <span>الرحلة الأكاديمية والمسار التخصصي</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400">السنة الدراسية</span>
                    <div className="text-sm font-bold text-white">
                      {getAcademicYearLabel(student.academicYear || student.currentYear)}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400">الفصل الدراسي</span>
                    <div className="text-sm font-bold text-white">
                      {getSemesterLabel(student.academicSemester)}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400">الصفة الأكاديمية</span>
                    <div className="text-sm font-bold text-white">
                      {student.roleLabelAr || student.role || 'طالب مسجل'}
                    </div>
                  </div>

                  {student.targetFocusTrack && (
                    <div className="sm:col-span-2 lg:col-span-3 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 space-y-1">
                      <span className="text-[11px] text-cyan-400 font-bold flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5" />
                        <span>مجال التركيز التخصصي المستهدف (Target Focus Track)</span>
                      </span>
                      <div className="text-sm font-bold text-white">
                        {student.targetFocusTrack}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: Activity & Timestamps */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>النشاط وسجل التواريخ</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400">تاريخ إنشاء الرحلة</span>
                    <div className="text-xs font-mono text-slate-200">
                      {formatDate(student.createdAt)}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400">آخر تحديث للبيانات</span>
                    <div className="text-xs font-mono text-slate-200">
                      {formatDate(student.updatedAt)}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400">آخر مزامنة سحابية</span>
                    <div className="text-xs font-mono text-emerald-400">
                      {formatDate(student.lastSyncedAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COURSES PROGRESS */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              {/* Summary Stats Strip */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white">ملخص التقدم الأكاديمي للمقررات</h3>
                    <p className="text-xs text-slate-400">
                      المقررات المسجلة والمحفوظة فعلياً في وثيقة الطالب على Firestore.
                    </p>
                  </div>
                  <div className="text-xs font-bold text-cyan-400 font-mono">
                    إجمالي المقررات المتابعة: {totalTracked}
                  </div>
                </div>

                {/* Progress Distribution Bar */}
                {totalTracked > 0 ? (
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                      <div 
                        style={{ width: `${completedPct}%` }} 
                        className="bg-emerald-500 transition-all duration-300"
                        title={`مكتملة: ${completedCourses.length}`}
                      />
                      <div 
                        style={{ width: `${studyingPct}%` }} 
                        className="bg-cyan-500 transition-all duration-300"
                        title={`قيد الدراسة: ${studyingCourses.length}`}
                      />
                      <div 
                        style={{ width: `${importantPct}%` }} 
                        className="bg-amber-500 transition-all duration-300"
                        title={`مهمة: ${importantCourses.length}`}
                      />
                    </div>

                    <div className="flex items-center justify-around text-xs flex-wrap gap-2 pt-1 font-mono">
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span>مكتملة: {completedCourses.length} ({completedPct}%)</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-cyan-400">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                        <span>قيد الدراسة: {studyingCourses.length} ({studyingPct}%)</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-400">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span>مهمة: {importantCourses.length} ({importantPct}%)</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
                    لم يسجل الطالب أي تقدم في المقررات الدراسية بعد.
                  </div>
                )}
              </div>

              {/* Grouped Courses Details */}
              {totalTracked > 0 && (
                <div className="space-y-5">
                  {/* Completed */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>المقررات المكتملة والمجتازة ({completedCourses.length})</span>
                    </div>
                    {renderCourseBadgeList(completedCourses, 'bg-emerald-950/80 text-emerald-300 border-emerald-800')}
                  </div>

                  {/* Studying */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                      <BookOpen className="w-4 h-4" />
                      <span>المقررات قيد الدراسة حالياً ({studyingCourses.length})</span>
                    </div>
                    {renderCourseBadgeList(studyingCourses, 'bg-cyan-950/80 text-cyan-300 border-cyan-800')}
                  </div>

                  {/* Important */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                      <Layers className="w-4 h-4" />
                      <span>المقررات المميزة كمهمة أو مرجعية ({importantCourses.length})</span>
                    </div>
                    {renderCourseBadgeList(importantCourses, 'bg-amber-950/80 text-amber-300 border-amber-800')}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LAPTOP SPECIFICATIONS */}
          {activeTab === 'laptop' && (
            <div className="space-y-6">
              {hasSavedLaptop ? (
                <div className="space-y-6">
                  {/* Laptop Hardware Specs Grid */}
                  <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-white flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-cyan-400" />
                        <span>مواصفات العتاد المحفوظة (Hardware Specs)</span>
                      </h3>
                      {student.savedLaptop?.savedAt && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          حُفظت بتاريخ: {formatDate(student.savedLaptop.savedAt)}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400">المعالج (CPU)</span>
                        <div className="text-xs font-bold text-white uppercase font-mono">
                          {laptopSpecs?.cpuBrand || 'N/A'} {laptopSpecs?.cpuTier || ''}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400">الجيل (Generation)</span>
                        <div className="text-xs font-bold text-white font-mono">
                          {laptopSpecs?.cpuGen || 'N/A'}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400">الذاكرة العشوائية (RAM)</span>
                        <div className="text-xs font-bold text-cyan-400 font-mono">
                          {laptopSpecs?.ramGb ? `${laptopSpecs.ramGb} GB` : 'N/A'}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400">التخزين (Storage)</span>
                        <div className="text-xs font-bold text-white font-mono">
                          {laptopSpecs?.storageCapacityGb ? (laptopSpecs.storageCapacityGb >= 1000 ? `${laptopSpecs.storageCapacityGb / 1000} TB ` : `${laptopSpecs.storageCapacityGb} GB `) : ''}
                          <span className="uppercase text-slate-400 text-[11px]">({laptopSpecs?.storageType || 'N/A'})</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400">بطاقة الرسوميات (GPU)</span>
                        <div className="text-xs font-bold text-white font-mono">
                          {laptopSpecs?.gpuTier || 'N/A'}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400">نظام التشغيل (OS)</span>
                        <div className="text-xs font-bold text-white uppercase font-mono">
                          {laptopSpecs?.os || 'Windows'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Laptop Evaluation Results */}
                  {laptopEval && (
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/30 via-slate-900 to-slate-900 border border-cyan-500/30 space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-cyan-400" />
                          <h3 className="text-sm font-black text-white">
                            نتيجة التقييم الهندسي (Laptop Advisor)
                          </h3>
                        </div>
                        {laptopEval.badgeAr && (
                          <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 text-xs font-bold">
                            {laptopEval.badgeAr}
                          </span>
                        )}
                      </div>

                      {laptopEval.summaryAr && (
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {laptopEval.summaryAr}
                        </p>
                      )}

                      {/* Suitable For vs Limiting For */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        {laptopEval.suitableFor && laptopEval.suitableFor.length > 0 && (
                          <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-900/40 space-y-2">
                            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>مناسب وممتاز لـ:</span>
                            </div>
                            <ul className="space-y-1 text-xs text-slate-300">
                              {laptopEval.suitableFor.map((item: string, idx: number) => (
                                <li key={idx} className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {laptopEval.limitingFor && laptopEval.limitingFor.length > 0 && (
                          <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-900/40 space-y-2">
                            <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>قد يواجه بطئاً أو قيوداً في:</span>
                            </div>
                            <ul className="space-y-1 text-xs text-slate-300">
                              {laptopEval.limitingFor.map((item: string, idx: number) => (
                                <li key={idx} className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 rounded-3xl bg-slate-900/60 border border-dashed border-slate-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <Laptop className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-slate-300">
                    لم يحفظ الطالب مواصفات جهاز بعد.
                  </div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    عندما يقوم الطالب باختبار جهازه وحفظه من تبويب "دليل اللابتوب"، ستظهر كافة التفاصيل والتقييمات الهندسية هنا.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: COMMUNITY CONTRIBUTIONS */}
          {activeTab === 'community' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span>مساهمات الطالب في نصائح وتجارب المجتمع</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  إجمالي المشاركات: {tips.length}
                </span>
              </div>

              {isLoadingTips ? (
                <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span>جاري فحص مشاركات الطالب...</span>
                </div>
              ) : tips.length > 0 ? (
                <div className="space-y-3">
                  {tips.map((tip) => (
                    <div 
                      key={tip.id} 
                      className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold">
                            {tip.category === 'study_tip' ? 'نصيحة دراسية' :
                             tip.category === 'exam_advice' ? 'توجيه للامتحانات' :
                             tip.category === 'lab_work' ? 'تجارب المخابر' : 'مورد تعليمي'}
                          </span>
                          {tip.courseNameAr && (
                            <span className="text-slate-400 text-[11px]">
                              مقرر: {tip.courseNameAr}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                          <span className="flex items-center gap-1 text-amber-400">
                            <ThumbsUp className="w-3 h-3" />
                            {tip.likesCount || 0}
                          </span>
                          <span>{formatDate(tip.createdAt)}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed">
                        {tip.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                  لا توجد مساهمات أو نصائح منشورة من هذا الطالب بعد.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ACADEMIC RECORD (READ-ONLY) */}
          {activeTab === 'academic_record' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-cyan-400" />
                  <span>السجل الأكاديمي وعلامات الطالب (للقراءة فقط)</span>
                </h3>
                <span className="text-xs text-cyan-400 font-mono font-bold">
                  المقررات المسجلة: {Object.keys(student.academicGrades || {}).length}
                </span>
              </div>

              {Object.keys(student.academicGrades || {}).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(student.academicGrades || {}).map(([cId, grade]) => {
                    const courseMeta = courseLookup.get(cId);
                    return (
                      <div key={cId} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-xs font-bold text-white">
                              {courseMeta?.nameAr || cId}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {courseMeta ? `السنة ${courseMeta.year} • الفصل ${courseMeta.semester}` : cId}
                            </div>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            grade.status === 'passed'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : 'bg-rose-950 text-rose-300 border-rose-800'
                          }`}>
                            {grade.status === 'passed' ? 'ناجح' : 'غير ناجح'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                          <span className="text-slate-400">العلامة:</span>
                          <span className="font-mono font-bold text-white">{grade.totalScore} / 100</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-10 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                  لم يسجل الطالب أي علامات في سجله الأكاديمي بعد.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer (Read-Only Notice) */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              سجل الطالب للعرض والمتابعة الأكاديمية فقط (Read-Only) لضمان سرية وخصوصية بيانات الطلاب.
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors shrink-0"
          >
            إغلاق الملف
          </button>
        </div>

      </div>
    </div>
  );
};
