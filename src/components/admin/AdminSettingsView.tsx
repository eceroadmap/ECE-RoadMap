import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { academicSettingsService, AcademicSettings, DEFAULT_ACADEMIC_SETTINGS } from '../../services/academicSettingsService';

export const AdminSettingsView: React.FC = () => {
  const [settings, setSettings] = useState<AcademicSettings>(DEFAULT_ACADEMIC_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await academicSettingsService.getSettings();
      setSettings(data);
    } catch (e: any) {
      setErrorMsg('تعذّر تحميل إعدادات النظام الأكاديمي');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMsg(null);

    try {
      await academicSettingsService.saveSettings(settings);
      setSuccessMessage('تم حفظ الإعدادات الأكاديمية بنجاح وتحديث النظام.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMsg('فشل حفظ الإعدادات في قاعدة البيانات (تم الحفظ محلياً)');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
        <span>جاري تحميل إعدادات النظام الأكاديمي...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto" dir="rtl">
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-[#091527] border border-slate-800 shadow-xl flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>لوحة تحكم المشرف • إعدادات النظام الأكاديمي المحمية</span>
          </div>
          <h2 className="text-xl font-black text-white">
            ضبط معايير وعلامات السجل الأكاديمي
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            التحكم في الحد الأعلى للعلامة، علامة النجاح، وطريقة احتساب المعدلات لجميع طلاب قسم الاتصالات.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-6 rounded-3xl bg-[#091527] border border-slate-800 shadow-xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              الحد الأعلى للعلامة (Max Grade)
            </label>
            <input
              type="number"
              min="10"
              max="1000"
              value={settings.maxGrade}
              onChange={(e) => setSettings({ ...settings, maxGrade: Number(e.target.value) || 100 })}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-mono focus:outline-none focus:border-cyan-500"
              required
            />
            <p className="text-[11px] text-slate-500">العلامة العظمى للمادة الواحدة (عادة 100 أو 1000).</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              علامة النجاح (Passing Grade)
            </label>
            <input
              type="number"
              min="1"
              max={settings.maxGrade}
              value={settings.passingGrade}
              onChange={(e) => setSettings({ ...settings, passingGrade: Number(e.target.value) || 60 })}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-mono focus:outline-none focus:border-cyan-500"
              required
            />
            <p className="text-[11px] text-slate-500">الحد الأدنى لاعتبار المادة ناجحة.</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block">
            طريقة احتساب المعدل (Calculation Method)
          </label>
          <select
            value={settings.calculationMethod}
            onChange={(e) => setSettings({ ...settings, calculationMethod: e.target.value as 'simple_average' | 'weighted_average' })}
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
          >
            <option value="simple_average">المتوسط العادي (Simple Average) - بناءً على العلامات المدخلة</option>
            <option value="weighted_average">المتوسط الموزون بالساعات (Weighted Average - إن وجدت)</option>
          </select>
          <p className="text-[11px] text-slate-500">الطريقة المستخدمة في حساب المعدلات الفصلية والتراكمية للطلاب.</p>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التحديثات الأكاديمية'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
