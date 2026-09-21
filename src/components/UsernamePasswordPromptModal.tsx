import React, { useState } from 'react';
import { User, Key, ShieldCheck, Sparkles, Send, RefreshCw, X } from 'lucide-react';
import { useStudentState } from '../services/useStudentState';
import { useLanguage } from '../context/LanguageContext';

interface UsernamePasswordPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const UsernamePasswordPromptModal: React.FC<UsernamePasswordPromptModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { profile, updateProfile, firebaseUser, isLoggedInWithGoogle } = useStudentState();
  const { isArabic } = useLanguage();

  const [username, setUsername] = useState(profile.username || (firebaseUser?.email ? firebaseUser.email.split('@')[0] : ''));
  const [accountPassword, setAccountPassword] = useState(profile.accountPassword || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || (!firebaseUser && !isLoggedInWithGoogle)) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !accountPassword.trim()) {
      setErrorMsg(isArabic ? 'يرجى إدخال اسم المستخدم (يوزر نيم) وكلمة المرور.' : 'Please enter both username and password.');
      return;
    }

    if (username.trim().length < 3) {
      setErrorMsg(isArabic ? 'يجب أن يكون اسم المستخدم 3 أحرف على الأقل.' : 'Username must be at least 3 characters.');
      return;
    }

    if (accountPassword.trim().length < 4) {
      setErrorMsg(isArabic ? 'يجب أن تكون كلمة المرور 4 محارف على الأقل.' : 'Password must be at least 4 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      updateProfile({
        username: username.trim(),
        accountPassword: accountPassword.trim()
      });

      setSuccessMsg(isArabic ? 'تم حفظ بيانات الحساب (اليوزر وكلمة المرور) بنجاح!' : 'Account credentials saved successfully!');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(isArabic ? 'حدث خطأ أثناء الحفظ. يجيب المحاولة مجدداً.' : 'Error saving credentials. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      <div className="w-full max-w-md bg-gradient-to-b from-[#091527] to-[#060e1a] border border-cyan-500/40 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden animate-scaleUp">
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors z-10 min-h-[40px] min-w-[40px] flex items-center justify-center"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-2 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>تأمين وإنشاء بيانات الحساب</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {isArabic ? 'اختر يوزر نيم وكلمة مرور لحسابك' : 'Choose Account Username & Password'}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isArabic 
              ? 'يرجى تحديد اسم مستخدم (يوزر نيم) وكلمة مرور خاصة بك لحفظها في سجلات المنصة وربطها بحسابك.'
              : 'Please set your username and password for account management.'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isArabic ? 'اسم المستخدم (Username / يوزر نيم)' : 'Username'} *</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. marwa_ece"
              className="w-full bg-slate-900 border border-slate-750 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isArabic ? 'كلمة المرور (Account Password)' : 'Password'} *</span>
            </label>
            <input
              type="text"
              required
              value={accountPassword}
              onChange={(e) => setAccountPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-900 border border-slate-750 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 min-h-[44px]"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isArabic ? 'جاري الحفظ في قاعدة البيانات...' : 'Saving credentials...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{isArabic ? 'حفظ المتابعة' : 'Save & Continue'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
