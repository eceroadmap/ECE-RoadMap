import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  ShieldCheck, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Lock, 
  Mail, 
  User, 
  FileText, 
  Sparkles,
  ToggleLeft,
  ToggleRight,
  EyeOff,
  ShieldAlert
} from 'lucide-react';
import { ModeratorRecord } from '../../types/admin';
import { moderatorsService } from '../../services/admin/moderatorsService';

export const ModeratorsManager: React.FC = () => {
  const [moderators, setModerators] = useState<ModeratorRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [newEmail, setNewEmail] = useState<string>('');
  const [newDisplayName, setNewDisplayName] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');

  // Delete modal state
  const [moderatorToDelete, setModeratorToDelete] = useState<ModeratorRecord | null>(null);

  const loadModerators = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const list = await moderatorsService.fetchModerators();
      setModerators(list);
    } catch (err: any) {
      console.error('Error fetching moderators:', err);
      setErrorMsg('تعذر تحميل قائمة المشرفين. يرجى التأكد من اتصال الإنترنت.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadModerators();
  }, []);

  const handleAddModerator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newEmail.includes('@')) {
      setErrorMsg('يرجى إدخال عنوان بريد Google إلكتروني صحيح.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await moderatorsService.addModerator({
        email: newEmail.trim(),
        displayName: newDisplayName.trim() || undefined,
        notes: newNotes.trim() || undefined
      });

      setSuccessMsg(`تمت إضافة المشرف (${newEmail.trim().toLowerCase()}) بنجاح وتفعيل صلاحيات التحرير.`);
      setNewEmail('');
      setNewDisplayName('');
      setNewNotes('');
      await loadModerators();
    } catch (err: any) {
      console.error("ADD ADMIN ERROR", err);
      console.error('Error adding moderator:', err);
      setErrorMsg(err.message || 'حدث خطأ أثناء إضافة المشرف.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (mod: ModeratorRecord) => {
    try {
      const newStatus = await moderatorsService.toggleModeratorStatus(mod.email, mod.status);
      setModerators(prev => prev.map(m => m.email === mod.email ? { ...m, status: newStatus } : m));
      setSuccessMsg(`تم تحديث حالة المشرف (${mod.email}) إلى: ${newStatus === 'active' ? 'نشط' : 'متوقف مؤقتاً'}`);
    } catch (err) {
      console.error('Error toggling moderator status:', err);
      setErrorMsg('تعذر تغيير حالة المشرف.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!moderatorToDelete) return;
    try {
      await moderatorsService.removeModerator(moderatorToDelete.email);
      setModerators(prev => prev.filter(m => m.email !== moderatorToDelete.email));
      setSuccessMsg(`تم إلغاء صلاحيات المشرف (${moderatorToDelete.email}) بنجاح.`);
      setModeratorToDelete(null);
    } catch (err) {
      console.error("DELETE ADMIN ERROR", err);
      console.error('Error deleting moderator:', err);
      setErrorMsg('تعذر حذف المشرف.');
    }
  };

  const activeCount = moderators.filter(m => m.status === 'active').length;
  const inactiveCount = moderators.filter(m => m.status === 'inactive').length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0d1f38] via-[#091527] to-[#0d223f] border border-cyan-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">إدارة المشرفين والصلاحيات المعتمدة</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                حساب المالك فقط
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              يمكنك هنا كمالك لمنصة هندسة الإلكترونيات إضافة عناوين بريد Google لمشرفين يساعدونك في إدارة المقررات والبرمجيات والمشاريع.
              يحصل المشرف على كافة صلاحيات التعديل، بينما <strong className="text-cyan-300">يُحجب عنه تلقائياً سجل الأمان والعمليات الإدارية، ولا يظهر له بريدك أو معلوماتك الشخصية</strong>.
            </p>
          </div>

          <button
            onClick={loadModerators}
            disabled={isLoading}
            className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-cyan-300 transition-colors shrink-0"
            title="تحديث القائمة"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Security Policy Highlights */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-slate-300">
              <strong className="text-white block font-medium">صلاحيات تحرير كاملة:</strong>
              إضافة وتعديل وحذف المقررات، البرمجيات، المشاريع، والمهارات.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
            <EyeOff className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-slate-300">
              <strong className="text-white block font-medium">حجب سجل العمليات الأمني:</strong>
              لا يستطيع المشرف الاطلاع على سجل التدقيق الأمني للعمليات.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
            <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-slate-300">
              <strong className="text-white block font-medium">خصوصية حساب المالك:</strong>
              معلومات وبريد المالك الأساسي مخفية تماماً عن كافة حسابات المشرفين.
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-rose-200 text-xs font-bold">
            إغلاق
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-200 text-xs font-bold">
            إغلاق
          </button>
        </div>
      )}

      {/* Add Supervisor Form */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#091527] border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <UserPlus className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white">إضافة بريد مشرف جديد للمنصة</h3>
        </div>

        <form onSubmit={handleAddModerator} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Email Field */}
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>بريد Google للمشرف *</span>
              </label>
              <input
                type="email"
                required
                dir="ltr"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="supervisor@gmail.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none font-mono"
              />
            </div>

            {/* Display Name Field */}
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>اسم المشرف أو اللقب (اختياري)</span>
              </label>
              <input
                type="text"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                placeholder="مثال: م. فراس العلي"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
            </div>

            {/* Notes / Assignment Field */}
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>المهام أو التخصص (اختياري)</span>
              </label>
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="مثال: مشرف مقررات السنة الثالثة ومشاريع التخرج"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400">
              * بمجرد تسجيل المشرف الدخول بحساب Google هذا، سيتمكن فوراً من الدخول للوحة التحكم بصلاحيات التحرير.
            </span>

            <button
              type="submit"
              disabled={isSubmitting || !newEmail.trim()}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-950 transition-transform active:scale-95 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري الإضافة والتفعيل...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>إضافة المشرف وتفعيل الصلاحية</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Supervisors List */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#091527] border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">قائمة المشرفين المعتمدين حالياً</h3>
              <div className="text-xs text-slate-400">إجمالي المشرفين: {moderators.length} • النشطين: {activeCount} • المتوقفين: {inactiveCount}</div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
            <span className="text-sm">جاري تحميل بيانات المشرفين...</span>
          </div>
        ) : moderators.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <UserPlus className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-300">لا يوجد مشرفين مضافين حالياً</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              أنت الحساب الإداري الوحيد حالياً كمالك للمنصة. يمكنك إضافة بريد أي زميل أو مشرف من النموذج أعلاه لمساعدتك في إدخال وتحديث المقررات.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {moderators.map((mod) => {
              const isActive = mod.status === 'active';
              return (
                <div
                  key={mod.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isActive 
                      ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700' 
                      : 'bg-slate-950/60 border-slate-900 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        isActive 
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {mod.displayName?.charAt(0) || mod.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{mod.displayName || 'مشرف معتمد'}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive 
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          }`}>
                            {isActive ? 'نشط' : 'متوقف مؤقتاً'}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-cyan-300/90 dir-ltr text-right">
                          {mod.email}
                        </div>
                        {mod.notes && (
                          <div className="text-xs text-slate-400 pt-1">
                            {mod.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleToggleStatus(mod)}
                        title={isActive ? 'إيقاف الصلاحية مؤقتاً' : 'إعادة تفعيل الصلاحية'}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        {isActive ? (
                          <ToggleRight className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-slate-500" />
                        )}
                      </button>

                      <button
                        onClick={() => setModeratorToDelete(mod)}
                        title="إلغاء وحذف الصلاحية نهائياً"
                        className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>تاريخ الإضافة: {new Date(mod.addedAt).toLocaleDateString('ar-SY')}</span>
                    <span className="text-slate-400">صلاحيات: تحرير كامل للمحتوى الأكاديمي</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {moderatorToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#091527] border border-rose-500/30 shadow-2xl space-y-4 text-right">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">إلغاء صلاحية المشرف</h3>
              <p className="text-xs text-slate-400">
                هل أنت متأكد من رغبتك في إلغاء صلاحيات المشرف صاحب البريد:
              </p>
              <div className="text-sm font-mono text-rose-300 dir-ltr font-bold pt-1">
                {moderatorToDelete.email}
              </div>
            </div>

            <p className="text-xs text-slate-500 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              لن يتمكن هذا المستخدم بعد ذلك من الدخول إلى لوحة التحكم أو تعديل أي مادة دراسية.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950 transition-colors"
              >
                تأكيد الإلغاء والحذف
              </button>
              <button
                onClick={() => setModeratorToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
