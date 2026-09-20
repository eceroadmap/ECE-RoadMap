import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  User, 
  Users, 
  LogIn, 
  Check, 
  ArrowLeft, 
  GraduationCap, 
  ShieldCheck, 
  RefreshCw, 
  AlertCircle,
  HardDrive,
  Cloud,
  ChevronRight,
  Send
} from 'lucide-react';
import { useStudentState } from '../services/useStudentState';
import { guestVisitorService, GuestVisitorRecord } from '../services/guestVisitorService';
import { AcademicYearNumber } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  isMandatory?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  isMandatory = false
}) => {
  const { 
    profile, 
    firebaseUser, 
    isLoggedInWithGoogle, 
    signInWithGoogle, 
    signOut 
  } = useStudentState();

  const [mode, setMode] = useState<'choose' | 'guest_form'>('choose');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [academicYear, setAcademicYear] = useState<AcademicYearNumber | 'graduate'>(profile.academicYear || 3);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [storedGuest, setStoredGuest] = useState<GuestVisitorRecord | null>(null);

  useEffect(() => {
    if (isOpen) {
      const guest = guestVisitorService.getStoredGuest();
      setStoredGuest(guest);
      setErrorMsg(null);
      setSuccessMsg(null);
      if (guest && !firstName) {
        setFirstName(guest.firstName);
        setLastName(guest.lastName);
      }
    }
  }, [isOpen]);

  // Handle ESC key to close only if not mandatory
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isMandatory) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isMandatory]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        setSuccessMsg(`أهلاً بك يا ${user.displayName || 'مهندسنا العزيز'}! تم تسجيل الدخول بنجاح ومزامنة حسابك.`);
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 1200);
      }
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        return;
      }
      if (err?.code === 'auth/network-request-failed') {
        setErrorMsg('تعذر الاتصال بخوادم المصادقة. يرجى التحقق من اتصال الإنترنت.');
      } else {
        setErrorMsg('تعذر إتمام تسجيل الدخول بـ Google. يرجى المحاولة لاحقاً أو الدخول السريع بالاسم.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('يرجى كتابة الاسم الأول والكنية للمتابعة.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const record = await guestVisitorService.registerGuest({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        academicYear
      });

      setStoredGuest(record);
      setSuccessMsg(`أهلاً بك يا ${record.fullName}! نتمنى لك تجربة ممتعة ومفيدة في رحلتك الأكاديمية.`);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1200);
    } catch (err) {
      setErrorMsg('تم تخصيص جلستك بنجاح. أهلاً بك!');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOutUser = async () => {
    setIsLoading(true);
    try {
      await signOut();
      guestVisitorService.clearGuest();
      setStoredGuest(null);
      setMode('choose');
      setSuccessMsg('تم تسجيل الخروج بنجاح.');
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch {
      setErrorMsg('تعذر تسجيل الخروج.');
    } finally {
      setIsLoading(false);
    }
  };

  const isUserAuthenticated = isLoggedInWithGoogle || (storedGuest && profile.name);

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" 
      dir="rtl"
      onClick={() => {
        if (!isMandatory) {
          onClose();
        }
      }}
    >
      <div 
        className="w-full max-w-lg bg-gradient-to-b from-[#091527] to-[#060e1a] border border-cyan-500/30 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden animate-scaleUp text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Circuit Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button - ONLY if user is already identified or not mandatory */}
        {!isMandatory && (
          <button
            onClick={onClose}
            className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors z-10 min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header Branding */}
        <div className="text-center space-y-2 relative pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>بوابة الدخول • ECE RoadMap</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            مرحباً بك في المنصة الأكاديمية
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            قسم هندسة الإلكترونيات والاتصالات — جامعة دمشق
          </p>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* If Already Logged In / Registered */}
        {isUserAuthenticated && mode === 'choose' ? (
          <div className="space-y-4 pt-2">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shrink-0">
                  {isLoggedInWithGoogle ? (
                    firebaseUser?.displayName ? firebaseUser.displayName.charAt(0).toUpperCase() : 'G'
                  ) : (
                    storedGuest?.firstName ? storedGuest.firstName.charAt(0).toUpperCase() : 'U'
                  )}
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-white truncate">
                      {isLoggedInWithGoogle ? firebaseUser?.displayName : storedGuest?.fullName || profile.name}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {isLoggedInWithGoogle ? 'حساب Google متصل' : 'دخول بالاسم'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {isLoggedInWithGoogle ? firebaseUser?.email : `سنة دراسية: ${storedGuest?.academicYear || profile.academicYear || 1}`}
                  </p>
                </div>
              </div>

              {!isLoggedInWithGoogle && (
                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-700/40 text-[11px] text-cyan-300 leading-relaxed">
                  يمكنك ربط حساب Google الخاص بك في أي وقت لمزامنة تقدمك الأكاديمي مع السحابة والوصول إليه من أجهزتك الأخرى!
                </div>
              )}
            </div>

            <div className="space-y-2">
              {!isLoggedInWithGoogle && (
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 min-h-[44px]"
                >
                  <Cloud className="w-4 h-4" />
                  <span>ربط حساب Google والمزامنة السحابية</span>
                </button>
              )}

              {!isMandatory && (
                <button
                  onClick={onClose}
                  className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <span>متابعة التصفح والعودة للمنصة</span>
                  <ArrowLeft className="w-4 h-4 text-cyan-400" />
                </button>
              )}

              <button
                onClick={handleSignOutUser}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-2xl bg-transparent hover:bg-rose-950/30 text-rose-400 hover:text-rose-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 min-h-[40px]"
              >
                <span>تسجيل الخروج أو تبديل الحساب</span>
              </button>
            </div>
          </div>
        ) : mode === 'choose' ? (
          /* Choice Screen: Google vs Name entry */
          <div className="space-y-4 pt-1">
            {/* Google Login Card */}
            <button
              id="auth-google-button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-cyan-500/30 hover:border-cyan-400 text-right transition-all group shadow-lg flex items-center justify-between min-h-[70px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors">
                    تسجيل الدخول أو إنشاء حساب عبر Google
                  </div>
                  <div className="text-[11px] text-slate-400">
                    مزامنة سحابية كاملة • حفظ المواد والمشاريع والمعدل
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:-translate-x-1 transition-all" />
            </button>

            {/* Elegant Divider */}
            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                أو اختر الدخول السريع
              </span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* Guest / Name Entry Login Option */}
            <button
              id="auth-guest-button"
              onClick={() => setMode('guest_form')}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#071324] to-[#0a182d] hover:from-[#0b1d36] hover:to-[#0e223f] border border-slate-800 hover:border-cyan-500/40 text-right transition-all group flex items-center justify-between min-h-[70px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 transition-transform shadow-md">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors">
                    الدخول السريع (بالاسم والكنية)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    دخول فوري ومباشر • تخصيص رحلتك الأكاديمية وموادك
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:-translate-x-1 transition-all" />
            </button>

            {/* Feature Badges */}
            <div className="pt-2 grid grid-cols-2 gap-2 text-center text-[10px] text-slate-400">
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>حماية وخصوصية تامة</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>تجربة مخصصة لكل طالب</span>
              </div>
            </div>
          </div>
        ) : (
          /* Form Screen: First Name & Last Name */
          <form onSubmit={handleGuestSubmit} className="space-y-4 animate-fadeIn">
            <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-700/40 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-900/80 flex items-center justify-center text-cyan-300 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="text-[11px] text-slate-300 leading-relaxed">
                أهلاً بك! يرجى إدخال اسمك الأول والكنية لتخصيص محتواك ومتابعة خطتك الدراسية في قسم الإلكترونيات والاتصالات.
              </div>
            </div>

            <div className="space-y-3">
              {/* First Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>الاسم الأول *</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="مثال: أحمد أو سارة أو عمر..."
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none min-h-[44px]"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>الكنية / اسم العائلة *</span>
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="مثال: العلي أو السيد أو الشامي..."
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none min-h-[44px]"
                />
              </div>

              {/* Academic Year Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>السنة الدراسية أو صفتك الأكاديمية</span>
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value === 'graduate' ? 'graduate' : Number(e.target.value) as AcademicYearNumber)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none min-h-[44px]"
                >
                  <option value={1}>طالب سنة أولى (مستجد)</option>
                  <option value={2}>طالب سنة ثانية</option>
                  <option value={3}>طالب سنة ثالثة</option>
                  <option value={4}>طالب سنة رابعة</option>
                  <option value={5}>طالب سنة خامسة (تخرج)</option>
                  <option value="graduate">مهندس خريج / زائر عام</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setMode('choose')}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 text-xs font-bold transition-colors min-h-[44px]"
              >
                رجوع
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 min-h-[44px]"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري تهيئة جلستك الأكاديمية...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>تأكيد الدخول والبدء</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
