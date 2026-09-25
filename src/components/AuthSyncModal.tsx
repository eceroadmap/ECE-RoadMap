import React, { useState } from 'react';
import { 
  X, 
  Cloud, 
  CheckCircle2, 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  HardDrive,
  RefreshCw,
  AlertCircle,
  Loader2,
  GraduationCap,
  Calendar,
  UserCheck
} from 'lucide-react';
import { useStudentState } from '../services/useStudentState';
import { firebaseSyncService } from '../services/firebaseSync';
import { AcademicYearNumber, AcademicSemester } from '../types';

interface AuthSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthSyncModal: React.FC<AuthSyncModalProps> = ({ isOpen, onClose }) => {
  const { 
    profile,
    updateProfile,
    firebaseUser, 
    syncStatus,
    lastSyncedAt,
    isLoggedInWithGoogle, 
    signInWithGoogle, 
    signOut 
  } = useStudentState();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        setSuccessMsg('تم ربط حساب Google ومزامنة تقدمك الأكاديمي بنجاح مع السحابة!');
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        // User closed popup; no error needed
        return;
      }
      if (err?.code === 'auth/network-request-failed') {
        setErrorMsg('تعذر الاتصال بخوادم المصادقة. يرجى التحقق من اتصال الإنترنت.');
      } else {
        setErrorMsg('تعذر تسجيل الدخول بـ Google حالياً. يرجى المحاولة لاحقاً.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await signOut();
      setSuccessMsg('تم تسجيل الخروج بنجاح. رحلتك ما زالت محفوظة محلياً على هذا الجهاز.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg('تعذر تسجيل الخروج حالياً.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceSync = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await firebaseSyncService.pushLocalToCloud();
      setSuccessMsg('تمت مزامنة رحلتك ومقرراتك مع Cloud Firestore بنجاح!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setErrorMsg('تعذر إتمام المزامنة السحابية حالياً. تم الاحتفاظ بالبيانات محلياً.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleYearChange = (year: AcademicYearNumber) => {
    updateProfile({ academicYear: year, currentYear: year });
  };

  const handleSemesterChange = (semester: AcademicSemester) => {
    updateProfile({ academicSemester: semester });
  };

  const formatSyncTime = (isoString?: string | null) => {
    if (!isoString) return 'لم تتم المزامنة بعد';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return 'لم تتم المزامنة بعد';
      return d.toLocaleString('ar-SY', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return 'لم تتم المزامنة بعد';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#091527] border border-cyan-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl relative text-right space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-300 shrink-0 shadow-lg shadow-cyan-950/50">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              الملف الأكاديمي وحساب الطالب
            </h3>
            <p className="text-xs text-slate-400">
              Student Profile & Cloud Synchronization
            </p>
          </div>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 2. Student Identity & Status Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-3.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 font-bold text-sm border border-slate-700">
                {(isLoggedInWithGoogle && firebaseUser?.displayName) || profile.displayName || profile.name
                  ? ((firebaseUser?.displayName || profile.displayName || profile.name || '').charAt(0).toUpperCase())
                  : 'ط'}
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>
                    {(isLoggedInWithGoogle && firebaseUser?.displayName) 
                      ? firebaseUser.displayName 
                      : (profile.displayName || profile.name || 'طالب هندسة اتصالات')}
                  </span>
                  {(isLoggedInWithGoogle || profile.username) && (
                    <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                </div>
                {(isLoggedInWithGoogle && firebaseUser?.email) || profile.email ? (
                  <div className="text-xs text-cyan-300 font-mono">
                    {firebaseUser?.email || profile.email}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">
                    وضع زائر محلي (Local Mode)
                  </div>
                )}
              </div>
            </div>

            {/* Mode Tag */}
            <span className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
              isLoggedInWithGoogle
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
                : (profile.username ? 'bg-cyan-950/70 text-cyan-300 border-cyan-800/60' : 'bg-slate-900 text-slate-300 border-slate-800')
            }`}>
              {isLoggedInWithGoogle ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>حساب Google متزامن</span>
                </>
              ) : profile.username ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>حساب معتمد ({profile.username})</span>
                </>
              ) : (
                <>
                  <HardDrive className="w-3 h-3 text-slate-400" />
                  <span>تخزين محلي (Offline)</span>
                </>
              )}
            </span>
          </div>

          {/* Sync Status & Time Details */}
          <div className="pt-2.5 border-t border-slate-800/70 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-500 block">حالة المزامنة:</span>
              <span className="font-medium text-slate-300">
                {syncStatus === 'synced' && 'متزامن مع Cloud Firestore'}
                {syncStatus === 'syncing' && 'جاري تحديث السحابة...'}
                {syncStatus === 'local_only' && 'محلي في هذا المتصفح'}
                {syncStatus === 'offline_error' && 'غير متصل (يعمل محلياً)'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block">آخر مزامنة ناجحة:</span>
              <span className="font-medium text-cyan-400 font-mono">
                {isLoggedInWithGoogle ? formatSyncTime(lastSyncedAt) : 'غير مسجل سحابياً'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Academic Year & Semester Selector (Editable) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>المرحلة والفصل الأكاديمي (تعديل فوري):</span>
            </div>
            <span className="text-[11px] text-cyan-400 font-normal">
              السنة {profile.academicYear} • الفصل {profile.academicSemester}
            </span>
          </div>

          {/* Year selector buttons */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 block">السنة الدراسية:</label>
            <div className="grid grid-cols-5 gap-1.5">
              {([1, 2, 3, 4, 5] as AcademicYearNumber[]).map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => handleYearChange(yr)}
                  className={`py-2 text-center rounded-xl text-xs font-bold transition-all ${
                    profile.academicYear === yr
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950 font-black'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-850 border border-slate-800'
                  }`}
                >
                  السنة {yr}
                </button>
              ))}
            </div>
          </div>

          {/* Semester selector buttons */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 block">الفصل الدراسي:</label>
            <div className="grid grid-cols-2 gap-2">
              {([1, 2] as AcademicSemester[]).map((sem) => (
                <button
                  key={sem}
                  type="button"
                  onClick={() => handleSemesterChange(sem)}
                  className={`py-2 text-center rounded-xl text-xs font-bold transition-all ${
                    profile.academicSemester === sem
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-850 border border-slate-800'
                  }`}
                >
                  الفصل {sem === 1 ? 'الأول (الخريفي)' : 'الثاني (الربيعي)'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Account Mode Explanation & Actions */}
        <div className="space-y-3 pt-1">
          {!isLoggedInWithGoogle ? (
            /* Visitor / Local Mode State */
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-900/40 text-xs text-slate-300 leading-relaxed space-y-2">
                <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-cyan-400" />
                  <span>أنت تتصفح الآن في "وضع الزائر المحلي"</span>
                </div>
                <p>
                  رحلتك ومقرراتك المكتملة ومواصفات لابتوبك محفوظة حالياً على <strong>هذا الجهاز وهذا المتصفح فقط</strong>. لا تحتاج لإنشاء حساب لتصفح كامل المحتوى.
                </p>
                <p className="text-slate-400 text-[11px]">
                  لحفظ تقدمك من الضياع عند مسح الذاكرة المؤقتة أو لمتابعة مسارك من هاتفك أو حاسوب آخر، يمكنك ربط حسابك بـ Google بنقرة واحدة.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span>تسجيل الدخول بحساب Google لمزامنة الرحلة عبر الأجهزة</span>
              </button>
            </div>
          ) : (
            /* Google Account Mode State */
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 text-xs text-slate-300 leading-relaxed space-y-2">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <Cloud className="w-4 h-4 text-emerald-400" />
                  <span>رحلتك الأكاديمية متصلة ومحفوظة سحابياً</span>
                </div>
                <p>
                  يتم حفظ وتحديث مقرراتك وسنتك الدراسية ومواصفات لابتوبك في قاعدة بيانات <strong>Cloud Firestore</strong> تلقائياً، وتكون متاحة كلما سجلت دخولك من أي هاتف أو كمبيوتر.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleForceSync}
                  disabled={isLoading}
                  className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>مزامنة فورية الآن</span>
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 5. Safe Data Guarantee */}
        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>خصوصية الطالب وحماية البيانات</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            بيانات رحلتك محمية بقواعد أمان Owner-Only Access. لا نطلب ولا نخزن أي أرقام هواتف أو كلمات مرور، ويبقى المحتوى الأكاديمي ملكك وحدك.
          </p>
        </div>
      </div>
    </div>
  );
};
