import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Cpu, 
  TrendingUp, 
  Laptop, 
  Share2, 
  Star, 
  CheckCircle2, 
  Clock, 
  Layers, 
  ArrowLeft, 
  Settings2,
  Calendar,
  Compass,
  FileText,
  AlertCircle,
  Cloud,
  HardDrive,
  ShieldCheck,
  LogIn,
  Award,
  FolderGit2
} from 'lucide-react';
import { 
  Course, 
  SoftwareTool, 
  ActiveTab, 
  AcademicYearNumber, 
  AcademicSemester,
  CourseProgressStatus 
} from '../types';
import { COURSES_DATA } from '../data/courses';
import { SOFTWARE_DATA } from '../data/software';
import { useStudentState } from '../services/useStudentState';

interface StudentDashboardProps {
  onNavigateTab: (tab: ActiveTab, year?: AcademicYearNumber) => void;
  onSelectCourse: (course: Course) => void;
  onSelectSoftware: (software: SoftwareTool) => void;
  onOpenOnboarding: () => void;
  onOpenSyncModal?: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigateTab,
  onSelectCourse,
  onSelectSoftware,
  onOpenOnboarding,
  onOpenSyncModal
}) => {
  const { 
    profile, 
    courseProgress, 
    savedLaptop, 
    updateProfile, 
    setCourseStatus, 
    isCloudSynced,
    isLoggedInWithGoogle,
    firebaseUser,
    syncStatus,
    lastSyncedAt
  } = useStudentState();
  const [coursesFilter, setCoursesFilter] = useState<'all' | 'important' | 'to_study' | 'completed'>('all');

  // Courses for current year and semester
  const currentSemesterCourses = COURSES_DATA.filter(
    (c) => c.year === profile.academicYear && c.semester === profile.academicSemester
  );

  // Next semester courses preview
  const nextSemester: AcademicSemester = profile.academicSemester === 1 ? 2 : 1;
  const nextYear: AcademicYearNumber = profile.academicSemester === 2 && profile.academicYear < 5
    ? ((profile.academicYear + 1) as AcademicYearNumber)
    : profile.academicYear;
  
  const upcomingCourses = COURSES_DATA.filter(
    (c) => c.year === nextYear && c.semester === nextSemester
  );

  // Software related to current year
  const currentYearSoftware = SOFTWARE_DATA.filter((sw) =>
    sw.academicYears.includes(profile.academicYear)
  );

  // Personalized courses list (saved by student)
  const savedCourseIds = Object.keys(courseProgress);
  const mySavedCourses = COURSES_DATA.filter((c) => savedCourseIds.includes(c.id));

  const filteredMyCourses = mySavedCourses.filter((c) => {
    if (coursesFilter === 'all') return true;
    return courseProgress[c.id] === coursesFilter;
  });

  // Count summaries
  const importantCount = savedCourseIds.filter((id) => courseProgress[id] === 'important').length;
  const toStudyCount = savedCourseIds.filter((id) => courseProgress[id] === 'to_study').length;
  const completedCount = savedCourseIds.filter((id) => courseProgress[id] === 'completed').length;

  const handleYearChange = (yr: AcademicYearNumber) => {
    updateProfile({ academicYear: yr });
  };

  const handleSemesterChange = (sem: AcademicSemester) => {
    updateProfile({ academicSemester: sem });
  };

  // Promotion eligibility: remaining unpassed courses in current year <= 4
  const currentYearAllCourses = COURSES_DATA.filter((c) => c.year === profile.academicYear);
  const unpassedCurrentYearCourses = currentYearAllCourses.filter((c) => courseProgress[c.id] !== 'completed');
  const canPromote = unpassedCurrentYearCourses.length <= 4 && profile.academicYear < 5;
  const [showPromotionSuccess, setShowPromotionSuccess] = useState(false);

  const handlePromoteToNextYear = () => {
    if (profile.academicYear < 5) {
      const nextY = (profile.academicYear + 1) as AcademicYearNumber;
      updateProfile({
        academicYear: nextY,
        academicSemester: 1
      });
      setShowPromotionSuccess(true);
      setTimeout(() => setShowPromotionSuccess(false), 7000);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-10 max-w-7xl mx-auto w-full overflow-hidden" dir="rtl">
      {/* Promotion Eligibility Banner */}
      {canPromote && (
        <div className="relative rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-[#062c26] border border-emerald-500/50 p-5 sm:p-6 shadow-2xl overflow-hidden animate-fadeIn">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5 text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 text-xs font-bold border border-emerald-700/60">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>شروط الترفع النظامي مستوفاة (4 مواد تحميل أو أقل)</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                🎉 مبارك! متبقي لديك {unpassedCurrentYearCourses.length} مواد غير مجتازة في السنة {profile.academicYear}
              </h3>
              <p className="text-xs text-emerald-200/90 leading-relaxed">
                وفقاً لأنظمة الكلية (التحميل حتى 4 مقررات)، يحق لك الآن الترفع الإداري والدراسي إلى السنة التالية ومتابعة خطتك الهندسية.
              </p>
            </div>

            <button
              onClick={handlePromoteToNextYear}
              className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-lg flex items-center gap-2 shrink-0 min-h-[44px]"
            >
              <GraduationCap className="w-4 h-4" />
              <span>ترفع إلى السنة {profile.academicYear + 1} الآن ✦</span>
            </button>
          </div>
        </div>
      )}

      {showPromotionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold text-center text-sm shadow-xl animate-bounce">
          🎉 ألف مبروك الترفع إلى السنة الدراسية الجديدة! تم تحديث حسابك وخطتك الهندسية بنجاح.
        </div>
      )}
      {/* 1. Dashboard Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#09172c] via-[#071324] to-[#0a1f3d] border border-cyan-500/30 p-5 sm:p-8 shadow-2xl overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-mono flex-wrap">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>لوحة الطالب والرحلة الأكاديمية</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{profile.roleLabelAr || 'طالب مسجل'}</span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className={isCloudSynced ? "text-emerald-400 font-sans" : "text-cyan-400 font-sans"}>
                {isCloudSynced ? "متزامن سحابياً • Cloud Synced" : "حفظ محلي آمن • Local Storage"}
              </span>
            </div>

            <h1 className="text-fluid-hero font-black text-white tracking-tight">
              مرحباً بك في رحلتك الهندسية
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              تتبع موقعك الأكاديمي، المواد المقررة لفصلك الحالي، برمجيات المحاكاة المطلوبة، ومواصفات لابتوبك في بيئة هندسية موحدة.
            </p>
          </div>

          {/* Quick Academic Selector Pill */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full lg:w-auto">
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 w-full sm:w-auto">
              <div className="flex items-center justify-between gap-4 text-xs font-bold text-slate-300">
                <span>تعديل المرحلة الحالية:</span>
                <button
                  type="button"
                  onClick={onOpenOnboarding}
                  className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 min-h-[36px]"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>تخصيص الصفة</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {([1, 2, 3, 4, 5] as AcademicYearNumber[]).map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => handleYearChange(yr)}
                    className={`flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[40px] flex items-center justify-center ${
                      profile.academicYear === yr
                        ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-850'
                    }`}
                  >
                    السنة {yr}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800">
                {([1, 2] as AcademicSemester[]).map((sem) => (
                  <button
                    key={sem}
                    type="button"
                    onClick={() => handleSemesterChange(sem)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold text-center transition-all min-h-[40px] flex items-center justify-center ${
                      profile.academicSemester === sem
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-850'
                    }`}
                  >
                    الفصل {sem === 1 ? 'الأول' : 'الثاني'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Grid Lines */}
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 1.5 Compact Student Account & Cloud Sync Summary Bar */}
      <div className="rounded-2xl bg-[#091527] border border-slate-800/90 p-4 sm:p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
            {isLoggedInWithGoogle ? (
              <Cloud className="w-5 h-5 text-cyan-400" />
            ) : (
              <HardDrive className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-bold text-white">
                {isLoggedInWithGoogle 
                  ? (firebaseUser?.displayName || firebaseUser?.email || 'حساب Google متزامن')
                  : 'وضع الزائر المحلي (Local Mode)'}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                isLoggedInWithGoogle
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50'
                  : 'bg-cyan-950/60 text-cyan-300 border-cyan-800/50'
              }`}>
                {isLoggedInWithGoogle ? 'سحابي متزامن' : 'محلي (على هذا الجهاز)'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-3 flex-wrap">
              <span>السنة الدراسية: <strong className="text-slate-300">السنة {profile.academicYear} (فصل {profile.academicSemester})</strong></span>
              <span className="text-slate-600">•</span>
              <span>
                حالة السحابة: <strong className="text-slate-300 font-sans">{isCloudSynced ? 'Firestore متصل' : 'تخزين متصفح آمن'}</strong>
              </span>
              {isLoggedInWithGoogle && lastSyncedAt && (
                <>
                  <span className="text-slate-600">•</span>
                  <span>
                    آخر مزامنة: <strong className="text-cyan-400 font-mono">
                      {new Date(lastSyncedAt).toLocaleDateString('ar-SY', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </strong>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {onOpenSyncModal && (
          <button
            type="button"
            onClick={onOpenSyncModal}
            className={`w-full md:w-auto px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shrink-0 min-h-[44px] ${
              isLoggedInWithGoogle
                ? 'bg-slate-900 hover:bg-slate-850 border border-slate-700 text-cyan-300'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-950/50'
            }`}
          >
            {isLoggedInWithGoogle ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>إدارة الحساب والمزامنة</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول بـ Google للمزامنة</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* 1.6 Academic Record Quick Access Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-[#071324] border border-cyan-500/40 p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-300 shrink-0 shadow-md">
            <Award className="w-6 h-6" />
          </div>
          <div className="space-y-1 text-right">
            <h3 className="text-sm sm:text-base font-black text-white">
              السجل الأكاديمي وإدخال العلامات وحساب المعدلات
            </h3>
            <p className="text-xs text-slate-300">
              سجل علامات موادك الدراسية، تابع وضع النجاح، واحتسب معدلاتك الفصلية والتراكمية لحظياً.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigateTab('academic_record')}
          className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950 shrink-0 min-h-[44px]"
        >
          <span>فتح السجل الأكاديمي</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      {/* 1.7 Graduation Project Navigator Quick Access Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-[#071324] border border-blue-500/40 p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-950 border border-blue-500/50 flex items-center justify-center text-blue-300 shrink-0 shadow-md">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div className="space-y-1 text-right">
            <h3 className="text-sm sm:text-base font-black text-white">
              مستكشف مشروع التخرج وتوصيات الذكاء المحلي
            </h3>
            <p className="text-xs text-slate-300">
              استكشف أفكار مشاريع التخرج المصممة لتخصص الاتصالات والإلكترونيات، واحصل على توافق مخصص بناءً على مقرراتك واهتماماتك.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigateTab('graduation_projects')}
          className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950 shrink-0 min-h-[44px]"
        >
          <span>فتح مستكشف المشاريع</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Academic Journey Position (5-Year Progression Bus) */}
      <div className="rounded-3xl bg-[#091527] border border-slate-800/90 p-4 sm:p-7 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              موقعك الحالي على خارطة السنوات الخمس
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('roadmap', profile.academicYear)}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 py-1"
          >
            <span>عرض الخارطة</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progression Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 pt-2">
          {([1, 2, 3, 4, 5] as AcademicYearNumber[]).map((yr) => {
            const isCurrent = profile.academicYear === yr;
            const isCompleted = profile.academicYear > yr;

            return (
              <div
                key={yr}
                onClick={() => handleYearChange(yr)}
                className={`cursor-pointer p-3 sm:p-4 rounded-2xl border transition-all min-h-[90px] flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-gradient-to-b from-cyan-950/70 to-[#071324] border-cyan-400 ring-2 ring-cyan-500/40 shadow-lg'
                    : isCompleted
                    ? 'bg-slate-900/40 border-emerald-800/40 text-slate-300 hover:border-slate-700'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-500 hover:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-mono font-bold ${
                    isCurrent ? 'text-cyan-300' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
                  }`}>
                    0{yr}
                  </span>
                  {isCurrent ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      محطتك
                    </span>
                  ) : isCompleted ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400">
                      اجتزتها
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">قادمة</span>
                  )}
                </div>

                <div className="font-bold text-xs sm:text-sm text-white">
                  السنة {yr === 1 ? 'الأولى' : yr === 2 ? 'الثانية' : yr === 3 ? 'الثالثة' : yr === 4 ? 'الرابعة' : 'الخامسة'}
                </div>

                <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
                  {yr === 1 && 'العلوم والتأسيس'}
                  {yr === 2 && 'الدارات والبرمجة'}
                  {yr === 3 && 'النظم والاتصالات'}
                  {yr === 4 && 'الهوائيات والميكروية'}
                  {yr === 5 && 'مشروع التخرج'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Quick Actions Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => onNavigateTab('courses', profile.academicYear)}
          className="p-3.5 sm:p-4 rounded-2xl bg-[#091527] border border-slate-800 hover:border-cyan-500/50 text-right transition-all flex items-center justify-between group min-h-[72px]"
        >
          <div className="truncate pl-2">
            <span className="text-[11px] text-slate-400 block truncate">دليل المقررات</span>
            <span className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 truncate block">مقررات سنك ({currentSemesterCourses.length})</span>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 flex items-center justify-center text-cyan-400 shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('software')}
          className="p-3.5 sm:p-4 rounded-2xl bg-[#091527] border border-slate-800 hover:border-cyan-500/50 text-right transition-all flex items-center justify-between group min-h-[72px]"
        >
          <div className="truncate pl-2">
            <span className="text-[11px] text-slate-400 block truncate">برمجيات المحاكاة</span>
            <span className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 truncate block">أدوات السنة {profile.academicYear} ({currentYearSoftware.length})</span>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 flex items-center justify-center text-cyan-400 shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('develop')}
          className="p-3.5 sm:p-4 rounded-2xl bg-[#091527] border border-slate-800 hover:border-cyan-500/50 text-right transition-all flex items-center justify-between group min-h-[72px]"
        >
          <div className="truncate pl-2">
            <span className="text-[11px] text-slate-400 block truncate">التأهيل التقني</span>
            <span className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 truncate block">طوّر نفسك</span>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 flex items-center justify-center text-cyan-400 shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('laptop')}
          className="p-3.5 sm:p-4 rounded-2xl bg-[#091527] border border-slate-800 hover:border-cyan-500/50 text-right transition-all flex items-center justify-between group min-h-[72px]"
        >
          <div className="truncate pl-2">
            <span className="text-[11px] text-slate-400 block truncate">المطابقة العتادية</span>
            <span className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 truncate block">مستشار اللابتوب</span>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 flex items-center justify-center text-cyan-400 shrink-0">
            <Laptop className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* 4. Current Semester Courses & Laptop Status Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left (8 Cols): Current Semester Courses */}
        <div className="lg:col-span-8 bg-[#091527] border border-slate-800/90 rounded-3xl p-4 sm:p-6 md:p-7 shadow-xl space-y-5 sm:space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-wrap gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                مقررات السنة {profile.academicYear} - الفصل {profile.academicSemester === 1 ? 'الأول' : 'الثاني'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                اضغط على أي مقرر لاستعراض التفاصيل أو تعيين حالته في خطتك الدراسية.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-300 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/40">
              {currentSemesterCourses.length} مقررات
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentSemesterCourses.map((course) => {
              const status = courseProgress[course.id];
              return (
                <div
                  key={course.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 flex flex-col justify-between space-y-3 transition-colors"
                >
                  <div className="space-y-1.5 cursor-pointer" onClick={() => onSelectCourse(course)}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-850 text-slate-400 truncate">
                        {course.nameEn || course.id}
                      </span>
                      {status && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          status === 'completed'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                            : status === 'important'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800/40'
                            : 'bg-blue-950 text-blue-300 border border-blue-800/40'
                        }`}>
                          {status === 'completed' && 'مكتمل'}
                          {status === 'important' && 'مهم'}
                          {status === 'to_study' && 'أريد دراسته'}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white hover:text-cyan-300 transition-colors">
                      {course.nameAr}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {course.shortDescription}
                    </p>
                  </div>

                  {/* Personal Status Quick Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                    <button
                      type="button"
                      onClick={() => onSelectCourse(course)}
                      className="text-[11px] text-cyan-400 hover:underline min-h-[36px] flex items-center"
                    >
                      التفاصيل
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title={status === 'important' ? 'إلغاء التحديد' : 'تحديد كمهم'}
                        onClick={() => setCourseStatus(course.id, status === 'important' ? null : 'important')}
                        className={`p-2 rounded-xl text-[11px] transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center ${
                          status === 'important'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-amber-300'
                        }`}
                      >
                        <Star className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        title={status === 'to_study' ? 'إلغاء التحديد' : 'إضافة لقائمتي'}
                        onClick={() => setCourseStatus(course.id, status === 'to_study' ? null : 'to_study')}
                        className={`p-2 rounded-xl text-[11px] transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center ${
                          status === 'to_study'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-blue-300'
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        title={status === 'completed' ? 'إلغاء التحديد' : 'تحديد كمكتمل'}
                        onClick={() => setCourseStatus(course.id, status === 'completed' ? null : 'completed')}
                        className={`p-2 rounded-xl text-[11px] transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center ${
                          status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-emerald-400'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right (4 Cols): Saved Laptop & Hardware Advisor Preview */}
        <div className="lg:col-span-4 space-y-6 w-full">
          <div className="bg-[#091527] border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <Laptop className="w-4 h-4 text-cyan-400" />
                حالة لابتوبك الهندسي
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab('laptop')}
                className="text-[11px] text-cyan-400 hover:underline py-1"
              >
                تحديث
              </button>
            </div>

            {savedLaptop ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">التقييم المسجل:</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    savedLaptop.evaluation.level === 'comfortable'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                      : savedLaptop.evaluation.level === 'preferred'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/40'
                      : 'bg-amber-950 text-amber-300 border border-amber-800/40'
                  }`}>
                    {savedLaptop.evaluation.badgeAr}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">المعالج:</span>
                    <span className="font-mono text-cyan-300">{savedLaptop.specs.cpuTier?.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">الذاكرة (RAM):</span>
                    <span className="font-mono text-cyan-300">{savedLaptop.specs.ramGb} GB</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">نوع التخزين:</span>
                    <span className="font-mono text-cyan-300">
                      {savedLaptop.specs.storageType === 'ssd_nvme' ? 'NVMe SSD' : savedLaptop.specs.storageType === 'ssd_sata' ? 'SATA SSD' : 'HDD'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">نظام التشغيل:</span>
                    <span className="font-mono text-cyan-300">{savedLaptop.specs.os?.toUpperCase()}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {savedLaptop.evaluation.titleAr}
                </p>

                <button
                  type="button"
                  onClick={() => onNavigateTab('laptop')}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-cyan-300 border border-slate-800 min-h-[44px] flex items-center justify-center"
                >
                  فتح تفاصيل التقييم الكامل
                </button>
              </div>
            ) : (
              /* Polished Empty State */
              <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 mx-auto flex items-center justify-center text-slate-400">
                  <Laptop className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-200">
                    لم تحفظ مواصفات جهازك بعد.
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    تحقق من ملاءمة جهازك لبرامج المحاكاة (Quartus, MATLAB, HFSS).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab('laptop')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-950 min-h-[44px]"
                >
                  افتح مستشار اللابتوب
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. My Saved Courses Section ("مقرراتي في رحلتي") */}
      <div className="bg-[#091527] border border-slate-800/90 rounded-3xl p-4 sm:p-6 md:p-7 shadow-xl space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              مقرراتي في رحلتي الأكاديمية ({mySavedCourses.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              المقررات التي عينتها للدراسة أو الاعتماد كأولويات ضمن خطتك.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-850 text-xs overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setCoursesFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap min-h-[36px] ${
                coursesFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              الكل ({mySavedCourses.length})
            </button>
            <button
              type="button"
              onClick={() => setCoursesFilter('important')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap min-h-[36px] ${
                coursesFilter === 'important' ? 'bg-amber-950 text-amber-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              مهم ({importantCount})
            </button>
            <button
              type="button"
              onClick={() => setCoursesFilter('to_study')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap min-h-[36px] ${
                coursesFilter === 'to_study' ? 'bg-blue-950 text-blue-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              أريد دراسته ({toStudyCount})
            </button>
            <button
              type="button"
              onClick={() => setCoursesFilter('completed')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap min-h-[36px] ${
                coursesFilter === 'completed' ? 'bg-emerald-950 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              مكتمل ({completedCount})
            </button>
          </div>
        </div>

        {filteredMyCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredMyCourses.map((course) => {
              const status = courseProgress[course.id];
              return (
                <div
                  key={course.id}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1 cursor-pointer" onClick={() => onSelectCourse(course)}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">
                        السنة {course.year} - الفصل {course.semester}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        status === 'completed'
                          ? 'bg-emerald-950 text-emerald-400'
                          : status === 'important'
                          ? 'bg-amber-950 text-amber-300'
                          : 'bg-blue-950 text-blue-300'
                      }`}>
                        {status === 'completed' && 'مكتمل'}
                        {status === 'important' && 'مهم'}
                        {status === 'to_study' && 'أريد دراسته'}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-white hover:text-cyan-300">
                      {course.nameAr}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {course.shortDescription}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => onSelectCourse(course)}
                      className="text-[11px] text-cyan-400 hover:underline py-1"
                    >
                      استعراض المادة
                    </button>

                    <button
                      type="button"
                      onClick={() => setCourseStatus(course.id, null)}
                      className="text-[11px] text-slate-500 hover:text-rose-400 py-1"
                    >
                      إزالة من رحلتي
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Polished Empty State */
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-950/40 border border-slate-800/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-900 mx-auto flex items-center justify-center text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-slate-200">
                لم تضف أي مادة إلى رحلتك بعد.
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                يمكنك تمييز المواد المهمة، أو المواد التي تخطط لدراستها أو اجتزتها بالنقر على رمز النجمة أو خيار "أضف إلى رحلتي".
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('courses')}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-950 min-h-[44px]"
            >
              استكشف المقررات
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
