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
  Send,
  Globe
} from 'lucide-react';
import { useStudentState } from '../services/useStudentState';
import { guestVisitorService, GuestVisitorRecord } from '../services/guestVisitorService';
import { AcademicYearNumber } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { soundEffects } from '../utils/soundEffects';

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
    signOut,
    updateProfile
  } = useStudentState();
  const { language, setLanguage, isArabic, t } = useLanguage();

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
        updateProfile({
          name: user.displayName || profile.name || 'مهندس مستقبلي',
          onboardingCompleted: true
        });
        soundEffects.playSuccess();
        setSuccessMsg(
          isArabic 
            ? `أهلاً بك يا ${user.displayName || 'مهندسنا العزيز'}! تم تسجيل الدخول بنجاح ومزامنة حسابك.`
            : `Welcome ${user.displayName || 'Engineer'}! Successfully signed in.`
        );
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 1200);
      }
    } catch (err: any) {
      const code = err?.code || '';
      const message = err?.message || '';
      console.warn('Google Sign-In Error Code:', code, err);
      
      if (message.includes('missing initial state') || message.includes('sessionStorage') || code === 'auth/web-storage-unsupported') {
        setErrorMsg(isArabic 
          ? 'تعذر الوصول إلى جلسة المتصفح بسبب تقييد الكوكيز للطرف الثالث بين النطاقات. يرجى تفعيل Third-Party Cookies في المتصفح أو المتابعة فوراً بالدخول السريع بالاسم والكنية.' 
          : 'Browser blocked cross-domain cookies. Please allow 3rd party cookies or use Quick Name Entry.');
      } else if (code === 'auth/unauthorized-domain') {
        setErrorMsg(isArabic ? 'نطاق الاستضافة الحالي (eceroadmap.workers.dev) يحتاج للإضافة إلى "Authorized Domains" في Firebase Console لمشروع eceroadmap2027.' : 'Authorized Domain needed in Firebase Console.');
      } else if (code === 'auth/operation-not-allowed') {
        setErrorMsg(isArabic ? 'يرجى تفعيل موفر "Google" في تبويب Authentication > Sign-in method داخل مشروع eceroadmap2027 في Firebase Console.' : 'Please enable Google Sign-In in Firebase Console.');
      } else if (code === 'auth/popup-timeout') {
        setErrorMsg(isArabic ? 'استغرقت الاستجابة وقتاً طويلاً. يرجى التأكد من تفعيل Google Sign-In وإضافة النطاق المصرح به في Firebase Console.' : 'Sign-in timed out. Please check Firebase Console setup.');
      } else if (code === 'auth/popup-blocked') {
        setErrorMsg(isArabic ? 'قام المتصفح بحظر نافذة Google المنبثقة. يرجى السماح بالنوافذ المنبثقة أو المتابعة بالدخول السريع.' : 'Popup was blocked. Please enable popups or use name login.');
      } else if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setErrorMsg(isArabic ? 'تم إغلاق نافذة تسجيل الدخول المنبثقة. يمكنك إعادة المحاولة أو المتابعة بالدخول السريع بالاسم.' : 'Sign-in window closed. You can retry or enter as guest.');
      } else if (code === 'auth/network-request-failed') {
        setErrorMsg(isArabic ? 'تعذر الاتصال بخوادم المصادقة. يرجى التحقق من اتصال الإنترنت.' : 'Network error. Please check your connection.');
      } else {
        setErrorMsg(isArabic ? 'تأكد من تفعيل Google Sign-In وإضافة النطاق المصرح به في Firebase Console مشروع eceroadmap2027.' : 'Google Sign-in failed. Please check Firebase setup.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEdit = () => {
    const currentFullName = isLoggedInWithGoogle ? (firebaseUser?.displayName || profile.name || '') : (storedGuest?.fullName || profile.name || '');
    const parts = currentFullName.trim().split(' ');
    setFirstName(parts[0] || '');
    setLastName(parts.slice(1).join(' ') || '');
    setAcademicYear(profile.academicYear || (storedGuest?.academicYear as any) || 3);
    setMode('guest_form');
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg(isArabic ? 'يرجى كتابة الاسم الأول والكنية للمتابعة.' : 'Please provide first name and last name.');
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

      updateProfile({
        name: record.fullName,
        academicYear: academicYear === 'graduate' ? 5 : academicYear,
        currentYear: academicYear === 'graduate' ? 5 : academicYear
      });

      setStoredGuest(record);
      soundEffects.playSuccess();
      setSuccessMsg(
        isArabic 
          ? `أهلاً بك يا ${record.fullName}! نتمنى لك تجربة ممتعة ومفيدة في رحلتك الأكاديمية.`
          : `Welcome ${record.fullName}! Enjoy your learning journey.`
      );
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1200);
    } catch (err) {
      setErrorMsg(isArabic ? 'تم تخصيص جلستك بنجاح. أهلاً بك!' : 'Welcome!');
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
      setFirstName('');
      setLastName('');
      setMode('choose');
      setErrorMsg(null);
      setSuccessMsg(isArabic ? 'تم تسجيل الخروج بنجاح.' : 'Signed out successfully.');
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch {
      setErrorMsg(isArabic ? 'تعذر تسجيل الخروج.' : 'Sign out failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const isUserAuthenticated = isLoggedInWithGoogle || (storedGuest && profile.name);

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" 
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

        {/* Close Button */}
        {!isMandatory && (
          <button
            onClick={onClose}
            className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors z-10 min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Language Selection Header Pill in Login Dialog */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-cyan-500/30 text-xs">
            <Globe className="w-3.5 h-3.5 text-cyan-400 mr-1" />
            <button
              type="button"
              onClick={() => setLanguage('ar')}
              className={`px-3 py-1 rounded-xl font-bold transition-all ${
                isArabic ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              العربية
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-xl font-bold transition-all ${
                !isArabic ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Header Branding */}
        <div className="text-center space-y-2 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t('auth.portal_title')}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t('auth.welcome_title')}
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            {t('auth.dept_desc')}
          </p>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs font-medium space-y-2 animate-fadeIn">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
            {mode === 'choose' && (
              <div className="pt-1 flex justify-end">
                <button
                  onClick={() => {
                    setErrorMsg(null);
                    setMode('guest_form');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px] transition-colors flex items-center gap-1 shadow-sm"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'المتابعة بالدخول السريع بالاسم' : 'Continue with Name Entry'}</span>
                </button>
              </div>
            )}
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
                      {isLoggedInWithGoogle ? (isArabic ? 'حساب Google متصل' : 'Google Connected') : (isArabic ? 'دخول بالاسم' : 'Name Login')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {isLoggedInWithGoogle ? firebaseUser?.email : `${isArabic ? 'سنة دراسية:' : 'Year:'} ${storedGuest?.academicYear || profile.academicYear || 1}`}
                  </p>
                </div>
              </div>

              {!isLoggedInWithGoogle && (
                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-700/40 text-[11px] text-cyan-300 leading-relaxed">
                  {isArabic 
                    ? 'يمكنك ربط حساب Google الخاص بك في أي وقت لمزامنة تقدمك الأكاديمي مع السحابة والوصول إليه من أجهزتك الأخرى!'
                    : 'You can link your Google account anytime to synchronize your academic progress across devices!'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <button
                onClick={handleStartEdit}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 min-h-[40px]"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>{isArabic ? 'تعديل الاسم والملف الشخصي' : 'Edit Name & Profile'}</span>
              </button>

              {!isLoggedInWithGoogle && (
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 min-h-[44px]"
                >
                  <Cloud className="w-4 h-4" />
                  <span>{isArabic ? 'ربط حساب Google والمزامنة السحابية' : 'Connect Google & Cloud Sync'}</span>
                </button>
              )}

              {!isMandatory && (
                <button
                  onClick={onClose}
                  className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <span>{isArabic ? 'متابعة التصفح والعودة للمنصة' : 'Continue Browsing Platform'}</span>
                  <ArrowLeft className="w-4 h-4 text-cyan-400" />
                </button>
              )}

              <button
                onClick={handleSignOutUser}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-2xl bg-transparent hover:bg-rose-950/30 text-rose-400 hover:text-rose-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 min-h-[40px]"
              >
                <span>{isArabic ? 'تسجيل الخروج أو تبديل الحساب' : 'Sign Out / Switch Account'}</span>
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
                    {t('auth.google_login_title')}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {t('auth.google_login_desc')}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:-translate-x-1 transition-all" />
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                {t('auth.or_quick_guest')}
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
                    {t('auth.quick_login_title')}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {t('auth.quick_login_desc')}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:-translate-x-1 transition-all" />
            </button>

            {/* Feature Badges */}
            <div className="pt-2 grid grid-cols-2 gap-2 text-center text-[10px] text-slate-400">
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isArabic ? 'حماية وخصوصية تامة' : 'Safe & Private'}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isArabic ? 'تجربة مخصصة لكل طالب' : 'Personalized'}</span>
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
                {isArabic 
                  ? 'أهلاً بك! يرجى إدخال اسمك الأول والكنية لتخصيص محتواك ومتابعة خطتك الدراسية في قسم الإلكترونيات والاتصالات.'
                  : 'Welcome! Please enter your name to customize your academic roadmap.'}
              </div>
            </div>

            <div className="space-y-3">
              {/* First Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t('auth.first_name_label')} *</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t('auth.first_name_placeholder')}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none min-h-[44px]"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t('auth.last_name_label')} *</span>
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t('auth.last_name_placeholder')}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none min-h-[44px]"
                />
              </div>

              {/* Academic Year Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t('auth.academic_year_label')}</span>
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value === 'graduate' ? 'graduate' : Number(e.target.value) as AcademicYearNumber)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none min-h-[44px]"
                >
                  <option value={1}>{isArabic ? 'طالب سنة أولى (مستجد)' : '1st Year (Freshman)'}</option>
                  <option value={2}>{isArabic ? 'طالب سنة ثانية' : '2nd Year (Sophomore)'}</option>
                  <option value={3}>{isArabic ? 'طالب سنة ثالثة' : '3rd Year (Junior)'}</option>
                  <option value={4}>{isArabic ? 'طالب سنة رابعة' : '4th Year (Senior 1)'}</option>
                  <option value={5}>{isArabic ? 'طالب سنة خامسة (تخرج)' : '5th Year (Senior 2 / Graduating)'}</option>
                  <option value="graduate">{isArabic ? 'مهندس خريج / زائر عام' : 'Graduated Engineer / General Guest'}</option>
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
                {t('auth.back')}
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 min-h-[44px]"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isArabic ? 'جاري تهيئة جلستك...' : 'Preparing session...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t('auth.confirm_start')}</span>
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
