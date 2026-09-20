import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle2, 
  HardDrive, 
  Cloud, 
  X,
  GraduationCap,
  Globe
} from 'lucide-react';
import { AcademicYearNumber, AcademicSemester } from '../types';
import { useStudentState } from '../services/useStudentState';
import { useLanguage } from '../context/LanguageContext';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const { profile, updateProfile, signInWithGoogle } = useStudentState();
  const { isArabic, setLanguage, t } = useLanguage();
  const [step, setStep] = useState<'select' | 'confirm'>('select');
  const [selectedYear, setSelectedYear] = useState<AcademicYearNumber>(profile.academicYear || 3);
  const [selectedSemester, setSelectedSemester] = useState<AcademicSemester>(profile.academicSemester || 1);
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (!isOpen) return null;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('confirm');
  };

  const handleSaveAndFinish = (mode: 'local' | 'google') => {
    updateProfile({
      academicYear: selectedYear,
      currentYear: selectedYear,
      academicSemester: selectedSemester,
      onboardingCompleted: true
    });

    if (mode === 'google') {
      setIsSigningIn(true);
      signInWithGoogle()
        .then(() => {
          onClose();
          if (onComplete) onComplete();
        })
        .catch((err) => {
          console.warn('Onboarding Google sign-in notice:', err);
          onClose();
          if (onComplete) onComplete();
        })
        .finally(() => {
          setIsSigningIn(false);
        });
    } else {
      onClose();
      if (onComplete) onComplete();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-[#091527] border border-cyan-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 text-right">
        {/* Close button */}
        <button
          type="button"
          onClick={() => {
            updateProfile({ onboardingCompleted: true });
            onClose();
          }}
          className="absolute top-5 left-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          aria-label={isArabic ? 'تخطي' : 'Skip'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Language Switcher at Top of Onboarding */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
            <Globe className="w-3.5 h-3.5 text-cyan-400 mr-1" />
            <button
              type="button"
              onClick={() => setLanguage('ar')}
              className={`px-3 py-1 rounded-xl font-bold transition-all ${
                isArabic ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              العربية
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-xl font-bold transition-all ${
                !isArabic ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {step === 'select' ? (
          /* Step 1: Select Year & Semester */
          <form onSubmit={handleNext} className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/50 text-cyan-300 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isArabic ? 'إعداد سريع • رحلتك الأكاديمية' : 'Quick Setup • Academic Journey'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {isArabic ? 'أين موقعك الحالي في كلية الهمك؟' : 'Select your Academic Year'}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isArabic 
                  ? 'حدد سنتك الدراسية وفصلك الحالي لتخصيص مقرراتك وبرمجيات المحاكاة المناسبة فوراً.'
                  : 'Specify your academic year and semester to personalize courses and simulation tools.'}
              </p>
            </div>

            {/* 1. Academic Year */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-300 block">
                {isArabic ? '1. السنة الدراسية:' : '1. Academic Year:'}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {([1, 2, 3, 4, 5] as AcademicYearNumber[]).map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setSelectedYear(yr)}
                    className={`py-3 text-center rounded-2xl text-xs font-bold transition-all ${
                      selectedYear === yr
                        ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-950 ring-2 ring-cyan-300'
                        : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {isArabic ? `السنة ${yr}` : `Year ${yr}`}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Academic Semester */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-300 block">
                {isArabic ? '2. الفصل الدراسي:' : '2. Academic Semester:'}
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {([1, 2] as AcademicSemester[]).map((sem) => (
                  <button
                    key={sem}
                    type="button"
                    onClick={() => setSelectedSemester(sem)}
                    className={`py-3 px-4 text-center rounded-2xl text-xs font-bold transition-all ${
                      selectedSemester === sem
                        ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400'
                        : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {isArabic ? (sem === 1 ? 'الفصل الأول' : 'الفصل الثاني') : (sem === 1 ? '1st Semester' : '2nd Semester')}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 transition-all"
            >
              <span>{isArabic ? 'متابعة وتخصيص الخطة' : 'Continue'}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Step 2: Confirm Storage Mode */
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/50 text-emerald-300 text-xs font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isArabic ? 'جاهز للانطلاق' : 'Ready'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {isArabic ? 'كيف تود حفظ وتتبع إنجازك الأكاديمي؟' : 'How would you like to save your journey?'}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isArabic 
                  ? 'اختر المزامنة السحابية بحساب Google للوصول من كل أجهزتك، أو ابدأ مباشرة بالحفظ المحلي.'
                  : 'Choose Google Cloud Sync for multi-device sync, or start locally.'}
              </p>
            </div>

            <div className="space-y-3">
              {/* Option 1: Cloud Sync with Google */}
              <button
                type="button"
                onClick={() => handleSaveAndFinish('google')}
                disabled={isSigningIn}
                className="w-full p-4 rounded-2xl bg-gradient-to-br from-cyan-950/80 to-blue-950/80 border-2 border-cyan-500/60 hover:border-cyan-400 text-right space-y-2 group transition-all shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm font-bold text-white group-hover:text-cyan-300">
                      {isArabic ? 'تسجيل الدخول بـ Google والمزامنة السحابية (مستحسن)' : 'Sign In with Google & Cloud Sync (Recommended)'}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-black">
                    {isArabic ? 'شامل' : 'Full'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {isArabic 
                    ? 'يضمن بقاء مقرراتك، درجاتك، ونصائحك محفوظة دائماً حتى لو بدلت المتصفح أو الهاتف.'
                    : 'Keeps courses and advice securely saved across devices.'}
                </p>
              </button>

              {/* Option 2: Local Only */}
              <button
                type="button"
                onClick={() => handleSaveAndFinish('local')}
                className="w-full p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 text-right space-y-1 group transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                      {isArabic ? 'المتابعة كزائر بالحفظ المحلي فقط' : 'Continue as Guest (Local Storage)'}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isArabic 
                    ? 'يتم تخزين تقدمك على هذا المتصفح فقط. يمكنك ربط حساب Google لاحقاً بأي وقت.'
                    : 'Saves progress on this browser only. You can connect Google anytime.'}
                </p>
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setStep('select')}
                className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>{isArabic ? 'تعديل السنة أو الفصل' : 'Change Year/Semester'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
