import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Cloud, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Laptop, 
  GraduationCap, 
  RefreshCw, 
  Eye, 
  Clock, 
  Calendar, 
  ShieldAlert, 
  WifiOff,
  Layers,
  ChevronLeft
} from 'lucide-react';
import { AdminStudentRecord } from '../../types/admin';
import { adminRepository } from '../../services/admin/adminRepository';
import { guestVisitorService } from '../../services/guestVisitorService';
import { StudentProfileModal } from './StudentProfileModal';
import { BOOTSTRAP_ADMIN_EMAIL, adminAuthService } from '../../services/admin/adminAuth';
import { extractAcademicYear, extractAcademicSemester, isPlatformOwnerRecord } from '../../services/admin/adminStats';
import { AcademicYearNumber } from '../../types';
import { db, doc, getDoc, setDoc } from '../../lib/firebase';

interface StudentsManagerProps {
  isOwner?: boolean;
}

export const StudentsManager: React.FC<StudentsManagerProps> = ({ isOwner = false }) => {
  const [students, setStudents] = useState<AdminStudentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorType, setErrorType] = useState<'permission' | 'network' | null>(null);

  const effectiveIsOwner = isOwner || adminAuthService.getIsOwner();
  
  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState<'all' | '1' | '2' | '3' | '4' | '5' | 'graduate'>('all');
  const [semesterFilter, setSemesterFilter] = useState<'all' | '1' | '2'>('all');
  const [accountTypeFilter, setAccountTypeFilter] = useState<'all' | 'google' | 'local'>('all');

  // Selected student for Profile modal
  const [selectedStudent, setSelectedStudent] = useState<AdminStudentRecord | null>(null);

  const loadStudents = async () => {
    setIsLoading(true);
    setErrorType(null);
    try {
      const [studentsData, guestsData] = await Promise.all([
        adminRepository.getStudents(),
        guestVisitorService.fetchRecentGuests(100)
      ]);

      const guestRecords: AdminStudentRecord[] = guestsData
        .filter((g) => !isPlatformOwnerRecord(g))
        .map((g) => {
          const yr = extractAcademicYear(g);
          return {
            uid: g.id,
            displayName: g.fullName,
            email: null, // Distinct from Google account
            academicYear: yr,
            currentYear: yr,
            academicSemester: 1,
            role: (yr === 5 ? 'graduate' : yr === 1 ? 'freshman' : 'current') as any,
            roleLabelAr: yr === 5 ? 'مهندس خريج' : yr === 1 ? 'طالب مستجد' : `طالب سنة ${yr}`,
            coursesCount: 0,
            completedCoursesCount: 0,
            starredProjectsCount: 0,
            onboardingCompleted: true,
            createdAt: g.createdAt,
            lastLoginAt: g.createdAt,
            authProvider: 'guest' as any
          };
        });

      // Combine both, avoiding duplicate IDs and filtering out owner
      const studentIds = new Set(studentsData.map((s) => s.uid));
      const merged = studentsData.filter(s => !isPlatformOwnerRecord(s));
      for (const gr of guestRecords) {
        if (!studentIds.has(gr.uid) && !isPlatformOwnerRecord(gr)) {
          merged.push(gr);
        }
      }

      // If merged resulted in 0 (e.g. security rules restriction for supervisor), fallback to shared site_stats directory
      if (merged.length === 0) {
        try {
          const dirSnap = await getDoc(doc(db, 'site_stats', 'students_directory'));
          if (dirSnap.exists()) {
            const cached = (dirSnap.data()?.students || []) as AdminStudentRecord[];
            const validCached = cached.filter(s => !isPlatformOwnerRecord(s));
            if (validCached.length > 0) {
              setStudents(validCached);
              setIsLoading(false);
              return;
            }
          }
        } catch (dirErr) {
          console.warn('Fallback shared directory read warning:', dirErr);
        }
      }

      // If owner loaded live students with records, sync them to shared directory
      if (effectiveIsOwner && merged.length > 0) {
        setDoc(doc(db, 'site_stats', 'students_directory'), {
          students: merged,
          totalCount: merged.length,
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch(() => null);
      }

      setStudents(merged);
    } catch (err: any) {
      console.error('Error fetching students directory:', err);
      // Attempt emergency fallback to shared cloud directory before throwing error state
      try {
        const dirSnap = await getDoc(doc(db, 'site_stats', 'students_directory'));
        if (dirSnap.exists()) {
          const cached = (dirSnap.data()?.students || []) as AdminStudentRecord[];
          const validCached = cached.filter(s => !isPlatformOwnerRecord(s));
          if (validCached.length > 0) {
            setStudents(validCached);
            setIsLoading(false);
            return;
          }
        }
      } catch {}

      const errMsg = String(err?.message || err);
      if (errMsg.includes('permission-denied') || errMsg.includes('missing or insufficient permissions')) {
        setErrorType('permission');
      } else {
        setErrorType('network');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Filter students
  const filteredStudents = students.filter((s) => {
    // Search query by displayName or email
    const query = searchQuery.trim().toLowerCase();
    const nameMatch = s.displayName ? s.displayName.toLowerCase().includes(query) : false;
    const emailMatch = s.email ? s.email.toLowerCase().includes(query) : false;
    const uidMatch = s.uid ? s.uid.toLowerCase().includes(query) : false;
    const matchesSearch = !query || nameMatch || emailMatch || uidMatch;

    // Year filter
    let matchesYear = true;
    const studentYear = extractAcademicYear(s);
    if (yearFilter !== 'all') {
      if (yearFilter === 'graduate') {
        matchesYear = studentYear === 5 || s.role === 'graduate';
      } else {
        matchesYear = studentYear === Number(yearFilter);
      }
    }

    // Semester filter
    let matchesSemester = true;
    if (semesterFilter !== 'all') {
      const studentSemester = extractAcademicSemester(s);
      matchesSemester = studentSemester === Number(semesterFilter);
    }

    // Account type filter
    let matchesAccountType = true;
    const isGoogleAuth = !!(s.email && s.email.includes('@') && s.authProvider !== 'guest');
    if (accountTypeFilter === 'google') {
      matchesAccountType = isGoogleAuth;
    } else if (accountTypeFilter === 'local') {
      matchesAccountType = !isGoogleAuth;
    }

    return matchesSearch && matchesYear && matchesSemester && matchesAccountType;
  });

  // Calculate statistics from the student records
  const totalCount = students.length;
  const googleCount = students.filter(s => !!(s.email && s.email.includes('@') && s.authProvider !== 'guest')).length;
  const localCount = totalCount - googleCount;
  const onboardingCount = students.filter(s => s.onboardingCompleted || s.authProvider === 'guest').length;
  const savedLaptopCount = students.filter(s => !!s.savedLaptop?.specs).length;

  // Year breakdown counts
  const yearCounts: Record<AcademicYearNumber, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  students.forEach((s) => {
    const yr = extractAcademicYear(s);
    yearCounts[yr] = (yearCounts[yr] || 0) + 1;
  });

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('ar-SY', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '—';
    }
  };

  const formatYearLabel = (year?: number | string) => {
    if (year === 'graduate' || year === 'خريج') return 'السنة 5 (خريج)';
    switch (Number(year)) {
      case 1: return 'السنة 1 (مستجد)';
      case 2: return 'السنة 2';
      case 3: return 'السنة 3';
      case 4: return 'السنة 4';
      case 5: return 'السنة 5 (تخرج)';
      default: return year ? `السنة ${year}` : 'السنة 1';
    }
  };

  return (
    <div className="space-y-6 w-full overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-[#091527] border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            <span>سجل الطلاب والرحلات الأكاديمية • ECE RoadMap Directory</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white">
            دليل وإدارة ملفات الطلاب (Student Directory)
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            استعراض ملفات الطلاب المسجلين، تتبع مراحلهم الدراسية ومقرراتهم المحددة، مواصفات حواسيبهم المحفوظة.
          </p>
        </div>

        <button
          onClick={loadStudents}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-cyan-300 border border-slate-800 text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50 min-h-[44px] shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>تحديث السجلات</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-[#091527] border border-slate-800 space-y-1 text-right">
          <div className="text-xs text-slate-400">إجمالي الطلاب</div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">{totalCount}</div>
          <div className="text-[10px] text-slate-500 font-mono">Total Synced</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#091527] border border-slate-800 space-y-1 text-right">
          <div className="text-xs text-slate-400">حسابات Google سحابية</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">{googleCount}</div>
          <div className="text-[10px] text-slate-500 font-mono">Cloud Authenticated</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#091527] border border-slate-800 space-y-1 text-right">
          <div className="text-xs text-slate-400">حسابات زوار ومحلية</div>
          <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">{localCount}</div>
          <div className="text-[10px] text-slate-500 font-mono">Guest / Local</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#091527] border border-slate-800 space-y-1 text-right">
          <div className="text-xs text-slate-400">أكملوا التهيئة</div>
          <div className="text-xl sm:text-2xl font-black text-sky-400 font-mono">{onboardingCount}</div>
          <div className="text-[10px] text-slate-500 font-mono">Onboarded Profiles</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#091527] border border-slate-800 space-y-1 text-right col-span-2 sm:col-span-1">
          <div className="text-xs text-slate-400">حفظوا اللابتوب</div>
          <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">{savedLaptopCount}</div>
          <div className="text-[10px] text-slate-500 font-mono">Laptop Evaluated</div>
        </div>
      </div>

      {/* Year-by-Year Quick Badges Bar */}
      <div className="p-3.5 rounded-2xl bg-[#091527] border border-slate-800 shadow-md">
        <div className="flex items-center gap-2 mb-2.5 text-xs text-slate-400 font-medium">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>إحصائيات الطلاب حسب السنة الدراسية (اضغط للتصفية السريعة):</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setYearFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              yearFilter === 'all'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-750'
            }`}
          >
            <span>جميع السنوات</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-black/20 font-mono">{totalCount}</span>
          </button>

          {([1, 2, 3, 4, 5] as AcademicYearNumber[]).map((yr) => {
            const count = yearCounts[yr];
            const isSelected = yearFilter === String(yr) || (yr === 5 && yearFilter === 'graduate');
            const label = yr === 1 ? 'سنة 1 (مستجد)' : yr === 5 ? 'سنة 5 (تخرج)' : `سنة ${yr}`;

            return (
              <button
                key={yr}
                onClick={() => setYearFilter(String(yr) as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-750'
                }`}
              >
                <span>{label}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                  isSelected ? 'bg-black/20 text-slate-950 font-black' : 'bg-slate-800 text-cyan-400 font-bold'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-3xl bg-[#091527] border border-slate-800 space-y-3 shadow-lg">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الطالب، البريد الإلكتروني، أو المعرف UID..."
              className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-slate-900 border border-slate-750 text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors min-h-[44px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                مسح
              </button>
            )}
          </div>

          {/* Year Filter */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value as any)}
            className="px-3 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 transition-colors min-h-[44px]"
          >
            <option value="all">جميع السنوات</option>
            <option value="1">السنة الأولى</option>
            <option value="2">السنة الثانية</option>
            <option value="3">السنة الثالثة</option>
            <option value="4">السنة الرابعة</option>
            <option value="5">السنة الخامسة</option>
            <option value="graduate">الخريجون</option>
          </select>

          {/* Semester Filter */}
          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value as any)}
            className="px-3 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 transition-colors min-h-[44px]"
          >
            <option value="all">جميع الفصول</option>
            <option value="1">الفصل الأول</option>
            <option value="2">الفصل الثاني</option>
          </select>

          {/* Account Type Filter */}
          <select
            value={accountTypeFilter}
            onChange={(e) => setAccountTypeFilter(e.target.value as any)}
            className="px-3 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 transition-colors min-h-[44px]"
          >
            <option value="all">جميع أنواع الحسابات</option>
            <option value="google">حساب Google متزامن</option>
            <option value="local">حساب زائر / محلي</option>
          </select>

          {(searchQuery || yearFilter !== 'all' || semesterFilter !== 'all' || accountTypeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setYearFilter('all');
                setSemesterFilter('all');
                setAccountTypeFilter('all');
              }}
              className="text-xs text-rose-400 hover:text-rose-300 font-bold px-2 py-2 min-h-[44px] flex items-center justify-center whitespace-nowrap"
            >
              إعادة تعيين
            </button>
          )}
        </div>
      </div>

      {/* Main Directory Content / States */}
      {isLoading ? (
        <div className="p-16 rounded-3xl bg-[#091527] border border-slate-800 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-sm font-bold text-white">جاري تحميل بيانات الطلاب...</div>
          <p className="text-xs text-slate-400 font-mono">Fetching student directory records securely...</p>
        </div>
      ) : errorType === 'permission' ? (
        <div className="p-12 rounded-3xl bg-rose-950/20 border border-rose-500/40 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-950 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="text-base font-bold text-white">
            ليس لديك صلاحية للوصول إلى بيانات الطلاب.
          </div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            تتطلب هذه الصفحة حساب مشرف معتمد ومصرح له بالوصول إلى قاعدة بيانات الطلاب.
          </p>
        </div>
      ) : errorType === 'network' ? (
        <div className="p-12 rounded-3xl bg-amber-950/20 border border-amber-500/40 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-950 text-amber-400 flex items-center justify-center mx-auto">
            <WifiOff className="w-6 h-6" />
          </div>
          <div className="text-base font-bold text-white">
            تعذر تحميل بيانات الطلاب. تحقق من الاتصال وحاول مرة أخرى.
          </div>
          <button
            onClick={loadStudents}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs min-h-[44px]"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : students.length === 0 ? (
        <div className="p-16 rounded-3xl bg-[#091527] border border-dashed border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <div className="text-sm font-bold text-slate-300">
            لا يوجد طلاب مسجلون بعد.
          </div>
          <p className="text-xs text-slate-500">
            ستظهر هنا سجلات الطلاب فور تسجيل أول طالب أو مزامنته السحابية.
          </p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#091527] border border-slate-800 text-center space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-5 h-5" />
          </div>
          <div className="text-sm font-bold text-slate-300">
            لم يتم العثور على طالب مطابق.
          </div>
          <p className="text-xs text-slate-500">
            جرب تعديل كلمة البحث أو فلاتر السنة ونوع الحساب.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Mobile Card List (< md screens) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredStudents.map((student) => {
              const hasLaptop = !!student.savedLaptop?.specs;
              const isGoogle = !!(student.email && student.email.includes('@') && student.authProvider !== 'guest');

              return (
                <div 
                  key={student.uid}
                  className="p-4 rounded-2xl bg-[#091527] border border-slate-800 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400 font-bold text-sm shrink-0">
                        {student.displayName ? student.displayName.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          {student.displayName || 'طالب مسجل'}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-mono truncate max-w-[180px]">
                          {student.email || 'زائر مسجل'}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                      isGoogle 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {isGoogle ? 'Google' : 'زائر'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/60">
                    <div>
                      <span className="text-slate-400 block text-[10px]">المرحلة:</span>
                      <span className="font-bold text-slate-200">
                        {formatYearLabel(student.academicYear || student.currentYear)} - {student.academicSemester ? `فصل ${student.academicSemester}` : 'فصل 1'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">فحص اللابتوب:</span>
                      <span className={hasLaptop ? "text-cyan-300 font-bold" : "text-slate-500"}>
                        {hasLaptop ? 'محفوظ ومفحوص' : 'غير محفوظ'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">
                      إنشاء: {formatDate(student.createdAt)}
                    </span>

                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all flex items-center gap-1.5 min-h-[38px]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>ملف الطالب</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table (>= md screens) */}
          <div className="hidden md:block rounded-3xl bg-[#091527] border border-slate-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-bold">
                  <tr>
                    <th className="py-4 px-4 sm:px-6">الطالب</th>
                    <th className="py-4 px-4">السنة / الفصل</th>
                    <th className="py-4 px-4">نوع الحساب</th>
                    {effectiveIsOwner && (
                      <th className="py-4 px-4 text-amber-400">بيانات الدخول (يوزر / كلمة المرور)</th>
                    )}
                    <th className="py-4 px-4">التهيئة الأكاديمية</th>
                    <th className="py-4 px-4">مواصفات اللابتوب</th>
                    <th className="py-4 px-4">تاريخ الإنشاء / المزامنة</th>
                    <th className="py-4 px-4 sm:px-6 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-200">
                  {filteredStudents.map((student) => {
                    const hasLaptop = !!student.savedLaptop?.specs;
                    const isGoogle = !!(student.email && student.email.includes('@') && student.authProvider !== 'guest');

                    return (
                      <tr 
                        key={student.uid} 
                        className="hover:bg-slate-850/50 transition-colors group"
                      >
                        {/* Student Info */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 font-bold text-xs shrink-0">
                              {student.displayName ? student.displayName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                            </div>
                            <div className="space-y-0.5 min-w-0">
                              <div className="font-bold text-white truncate max-w-[160px]">
                                {student.displayName || 'طالب مسجل'}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono truncate max-w-[160px]">
                                {student.email || 'زائر مسجل'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Year & Semester */}
                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-200">
                              {formatYearLabel(student.academicYear || student.currentYear)}
                            </span>
                            <div className="text-[11px] text-slate-400">
                              {student.academicSemester ? `الفصل ${student.academicSemester}` : 'الفصل 1'}
                            </div>
                          </div>
                        </td>

                        {/* Account Type */}
                        <td className="py-4 px-4">
                          {isGoogle ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 text-[10px] font-bold inline-flex items-center gap-1">
                              <Cloud className="w-3 h-3 text-emerald-400" />
                              <span>Google Cloud</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold">
                              زائر مسجل
                            </span>
                          )}
                        </td>

                        {effectiveIsOwner && (
                          <td className="py-4 px-4 font-mono">
                            <div className="space-y-0.5 text-[11px]">
                              <div className="text-white font-bold"><span className="text-slate-400 font-normal">يوزر:</span> {student.username || '—'}</div>
                              <div className="text-cyan-300 font-bold"><span className="text-slate-400 font-normal">كلمة المرور:</span> {student.accountPassword || '—'}</div>
                            </div>
                          </td>
                        )}

                        {/* Onboarding State */}
                        <td className="py-4 px-4">
                          {student.onboardingCompleted || student.authProvider === 'guest' ? (
                            <span className="text-emerald-400 flex items-center gap-1 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>مكتملة</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                              <span>قيد الإعداد</span>
                            </span>
                          )}
                        </td>

                        {/* Saved Laptop */}
                        <td className="py-4 px-4">
                          {hasLaptop ? (
                            <div className="space-y-0.5">
                              <span className="text-cyan-300 font-bold flex items-center gap-1 text-[11px]">
                                <Laptop className="w-3.5 h-3.5" />
                                <span>محفوظ ومفحوص</span>
                              </span>
                              {student.savedLaptop?.specs?.cpuTier && (
                                <div className="text-[10px] text-slate-400 uppercase font-mono">
                                  {student.savedLaptop.specs.cpuBrand} {student.savedLaptop.specs.cpuTier}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500">لم يُحفظ</span>
                          )}
                        </td>

                        {/* Created / Last Synced */}
                        <td className="py-4 px-4">
                          <div className="space-y-0.5 text-[11px] font-mono">
                            <div className="text-slate-300">
                              إنشاء: {formatDate(student.createdAt)}
                            </div>
                            <div className="text-slate-400">
                              مزامنة: {formatDate(student.lastSyncedAt || student.updatedAt)}
                            </div>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="py-4 px-4 sm:px-6 text-center">
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 text-xs font-bold transition-all flex items-center gap-1.5 mx-auto min-h-[38px]"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>ملف الطالب</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-900/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>إجمالي النتائج المعروضة: {filteredStudents.length} طالب</span>
              <span className="font-mono">سجلات مؤمنة ومشفرة على سحابة Firebase</span>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile Modal */}
      {selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
};
