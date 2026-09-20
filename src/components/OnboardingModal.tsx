import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle2, 
  HardDrive, 
  Cloud, 
  X,
  GraduationCap
} from 'lucide-react';
import { AcademicYearNumber, AcademicSemester } from '../types';
import { useStudentState } from '../services/useStudentState';

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
          aria-label="تخطي"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'select' ? (
          /* Step 1: Select Year & Semester */
          <form onSubmit={handleNext} className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/50 text-cyan-300 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>إعداد سريع • رحلتك الأكاديمية</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                أين موقعك الحالي في كلية الهمك؟
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                حدد سنتك الدراسية وفصلك الحالي لتخصيص مقرراتك وبرمجيات المحاكاة المناسبة فوراً.
              </p>
            </div>

            {/* 1. Academic Year */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-300 block">
                1. السنة الدراسية:
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
                    السنة {yr}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Academic Semester */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-300 block">
                2. الفصل الدراسي:
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
                    الفصل {sem === 1 ? 'الأول (الخريفي)' : 'الثاني (الربيعي)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Step 1 */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  updateProfile({ onboardingCompleted: true });
                  onClose();
                }}
                className="text-xs text-slate-400 hover:text-white"
              >
                تخطي والمتابعة كزائر
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950 transition-transform active:scale-95"
              >
                <span>متابعة</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          /* Step 2: Confirmation & Mode Choice */
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="text-center space-y-2 pt-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/70 border border-emerald-700/50 flex items-center justify-center text-emerald-400 mx-auto shadow-lg">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">
                تم تجهيز مسارك: السنة {selectedYear} • الفصل {selectedSemester === 1 ? 'الأول' : 'الثاني'}
              </h2>
            </div>

            {/* Explanatory Cards */}
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-3 text-xs text-slate-300 leading-relaxed">
              <p className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold shrink-0">•</span>
                <span>يمكنك تعديل هذه المعلومات لاحقاً في أي وقت من لوحة <strong>"رحلتي"</strong> أو ملفك الأكاديمي.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold shrink-0">•</span>
                <span>يمكنك استخدام المنصة كزائر (تخزين محلي على جهازك)، أو تسجيل الدخول بحساب Google لمزامنة رحلتك عبر جميع أجهزتك.</span>
              </p>
            </div>

            {/* Two Choices */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleSaveAndFinish('local')}
                className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-white font-bold text-xs flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <HardDrive className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div className="text-right">
                    <div>البدء كزائر (حفظ محلي في هذا المتصفح)</div>
                    <div className="text-[10px] text-slate-400 font-normal">دون الحاجة لأي حساب أو تسجيل</div>
                  </div>
                </div>
                <ArrowLeft className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                disabled={isSigningIn}
                onClick={() => handleSaveAndFinish('google')}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-between shadow-lg transition-transform active:scale-95 disabled:opacity-50"
              >
                <div className="flex items-center gap-2.5">
                  <Cloud className="w-4 h-4 shrink-0" />
                  <div className="text-right">
                    <div>تسجيل الدخول بـ Google وحفظ الرحلة سحابياً</div>
                    <div className="text-[10px] text-slate-900/80 font-normal">لمزامنة مستمرة عبر الهاتف والكمبيوتر</div>
                  </div>
                </div>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-start pt-2">
              <button
                type="button"
                onClick={() => setStep('select')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>الرجوع وتغيير الاختيار</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
