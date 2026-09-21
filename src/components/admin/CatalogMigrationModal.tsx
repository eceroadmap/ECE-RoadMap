import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  LogIn,
  Layers,
  FileCheck,
  AlertCircle,
  HelpCircle,
  Lock,
} from 'lucide-react';
import {
  catalogMigrationService,
  CollectionMigrationStats,
  MigrationSummaryReport,
} from '../../services/admin/catalogMigrationService';

interface CatalogMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CatalogMigrationModal: React.FC<CatalogMigrationModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Config & Init State
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [hasEnvApiKey, setHasEnvApiKey] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  // Target Auth State
  const [targetUser, setTargetUser] = useState<{ email: string; uid: string; role?: string } | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Pre-Flight State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preFlightStats, setPreFlightStats] = useState<CollectionMigrationStats[] | null>(null);
  const [preFlightError, setPreFlightError] = useState<string | null>(null);

  // Migration State
  const [isMigrating, setIsMigrating] = useState(false);
  const [activeCollectionKey, setActiveCollectionKey] = useState<string | null>(null);
  const [migrationReport, setMigrationReport] = useState<MigrationSummaryReport | null>(null);
  const [migrationError, setMigrationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      checkEnvironmentConfig();
    }
  }, [isOpen]);

  const checkEnvironmentConfig = () => {
    setConfigError(null);
    const envKey = (import.meta.env.VITE_MIGRATION_FIREBASE_API_KEY || '').trim();
    if (envKey) {
      setHasEnvApiKey(true);
      tryInitWithKey(envKey);
    } else {
      setHasEnvApiKey(false);
      setIsConfigured(false);
    }
  };

  const tryInitWithKey = (key: string) => {
    try {
      const cfg = catalogMigrationService.getTargetConfig(key);
      if (!cfg) {
        setConfigError('يرجى توفير مفتاح Web API الخاص بمشروع eceroadmap2027.');
        return;
      }
      catalogMigrationService.initTargetApp(cfg);
      setIsConfigured(true);
      setConfigError(null);

      // Check if target user is already logged in
      const existingUser = catalogMigrationService.getTargetUser();
      if (existingUser) {
        catalogMigrationService
          .verifyTargetSuperAdmin(existingUser)
          .then((res) => {
            setTargetUser({
              email: existingUser.email || existingUser.uid,
              uid: existingUser.uid,
              role: res.role,
            });
          })
          .catch((err) => {
            setAuthError(err.message);
          });
      }
    } catch (err: any) {
      setIsConfigured(false);
      setConfigError(err.message || 'فشل تهيئة الاتصال بمشروع الهدف');
    }
  };

  const handleManualConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) {
      setConfigError('يرجى إدخال مفتاح API لمتابعة التهيئة.');
      return;
    }
    tryInitWithKey(apiKeyInput.trim());
  };

  const handleTargetSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const user = await catalogMigrationService.signInToTarget();
      setTargetUser({
        email: user.email || user.uid,
        uid: user.uid,
        role: 'super_admin',
      });
    } catch (err: any) {
      setAuthError(err.message || 'تعذر تسجيل الدخول للمشروع الجديد أو لم يتم العثور على صلاحية super_admin.');
      setTargetUser(null);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleRunPreFlight = async () => {
    if (!isConfigured || !targetUser) return;
    setIsAnalyzing(true);
    setPreFlightError(null);
    try {
      const stats = await catalogMigrationService.runPreFlightAnalysis();
      setPreFlightStats(stats);
    } catch (err: any) {
      setPreFlightError(err.message || 'فشل في قراءة أعداد البيانات من المشروعين.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExecuteMigration = async () => {
    if (!isConfigured || !targetUser) return;
    setIsMigrating(true);
    setMigrationError(null);
    setMigrationReport(null);

    try {
      const report = await catalogMigrationService.executeCatalogMigration((currentStat) => {
        setActiveCollectionKey(currentStat.collectionKey);
        setPreFlightStats((prev) => {
          if (!prev) return [currentStat];
          const idx = prev.findIndex((p) => p.collectionKey === currentStat.collectionKey);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = currentStat;
            return copy;
          }
          return [...prev, currentStat];
        });
      });

      setMigrationReport(report);
    } catch (err: any) {
      setMigrationError(err.message || 'حدث خطأ أثناء تنفيذ عملية النقل.');
    } finally {
      setIsMigrating(false);
      setActiveCollectionKey(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" dir="rtl">
      <div className="bg-[#091527] border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">أداة نقل البيانات العامة والمناهج (المرحلة الأولى)</h3>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                  أداة فنية مؤقتة
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                نقل محتوى المناهج والبرمجيات والمصادر والإعدادات من المشروع الحالي إلى eceroadmap2027 حصراً.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isMigrating}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 text-xs">
          {/* Safeguard Notice */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>ضوابط الأمان العالية المطبقة تلقائياً:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pr-1">
              <li>المشروع الحالي (إنتاج) يُستخدم للقراءة فقط دون أي تعديل أو مساس.</li>
              <li>مستبعد تماماً: بيانات الطلاب، النصائح المجتمعية، المستخدمين، العدادات، وسجلات المشرفين.</li>
              <li>تُحفظ المعرفات الأصلية للوثائق (Document IDs) وتُحفظ التواريخ الأصلية (Timestamps) دون تغيير.</li>
              <li>الكتابة في المشروع الجديد تتم عبر بروتوكول الدمج (Merge) ولا تحذف أي وثيقة قائمة.</li>
            </ul>
          </div>

          {/* Step 1: Configuration & Connection */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">
                  1
                </span>
                <span>فحص الاتصال بالمشروع الجديد (eceroadmap2027)</span>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                  isConfigured
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                {isConfigured ? 'تمت التهيئة بنجاح' : 'غير مهيأ'}
              </span>
            </div>

            {hasEnvApiKey ? (
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>تم التعرف على إعدادات المشروع الجديد تلقائياً من متغيرات البيئة (VITE_MIGRATION_FIREBASE_*).</span>
              </div>
            ) : (
              <form onSubmit={handleManualConnect} className="space-y-3">
                <p className="text-slate-400 leading-relaxed">
                  لم يتم العثور على <code className="text-cyan-300">VITE_MIGRATION_FIREBASE_API_KEY</code> في البيئة. يمكنك إدخال مفتاح Web API الخاص بمشروع <strong className="text-white">eceroadmap2027</strong> مؤقتاً لهذه الجلسة (في الذاكرة فقط ولن يتم حفظه أو عرضه):
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-3.5" />
                    <input
                      type="password"
                      placeholder="أدخل مفتاح Web API للمشروع الجديد (eceroadmap2027)..."
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shrink-0 transition-colors"
                  >
                    تطبيق وتهيئة
                  </button>
                </div>
              </form>
            )}

            {configError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{configError}</span>
              </div>
            )}
          </div>

          {/* Step 2: Target Authentication */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">
                  2
                </span>
                <span>تسجيل الدخول والتحقق من صلاحية المشرف الأعلى (Super Admin)</span>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                  targetUser
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {targetUser ? 'تم التحقق من الصلاحية' : 'بانتظار المصادقة'}
              </span>
            </div>

            {targetUser ? (
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    تم تسجيل الدخول بحساب: <strong className="text-white">{targetUser.email}</strong> (الصلاحية في المشروع الجديد: <strong className="text-cyan-300">{targetUser.role || 'super_admin'}</strong>)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">UID: {targetUser.uid.substring(0, 10)}...</span>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <p className="text-slate-400">
                  يتطلب مشروع الهدف تسجيل الدخول بحساب Google المعتمد في وثيقة <code className="text-cyan-300">admins</code> برتبة <strong className="text-white">super_admin</strong>. لن يؤثر ذلك على جلستك الحالية.
                </p>
                <button
                  onClick={handleTargetSignIn}
                  disabled={!isConfigured || isSigningIn}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 font-bold text-xs flex items-center gap-2 shrink-0 transition-all disabled:opacity-40"
                >
                  {isSigningIn ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  <span>{isSigningIn ? 'جاري المصادقة...' : 'تسجيل الدخول للمشروع الجديد'}</span>
                </button>
              </div>
            )}

            {authError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}
          </div>

          {/* Step 3: Pre-Flight & Migration Controls */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">
                  3
                </span>
                <span>فحص الأعداد والتنفيذ (Pre-Flight & Execution)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunPreFlight}
                  disabled={!isConfigured || !targetUser || isAnalyzing || isMigrating}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-40"
                >
                  {isAnalyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" /> : <FileCheck className="w-3.5 h-3.5 text-cyan-400" />}
                  <span>{isAnalyzing ? 'جاري الفحص...' : 'فحص قبل النقل'}</span>
                </button>

                <button
                  onClick={handleExecuteMigration}
                  disabled={!isConfigured || !targetUser || isAnalyzing || isMigrating || !preFlightStats}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-950 transition-all disabled:opacity-40"
                >
                  {isMigrating ? <RefreshCw className="w-4 h-4 animate-spin text-slate-950" /> : <ArrowRight className="w-4 h-4 text-slate-950" />}
                  <span>{isMigrating ? 'جاري النقل...' : 'بدء نقل البيانات'}</span>
                </button>
              </div>
            </div>

            {preFlightError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{preFlightError}</span>
              </div>
            )}

            {migrationError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{migrationError}</span>
              </div>
            )}

            {/* Statistics Table */}
            {preFlightStats && (
              <div className="border border-slate-800 rounded-2xl overflow-hidden mt-3">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[11px] font-bold">
                      <th className="p-3">المجموعة / الوثيقة</th>
                      <th className="p-3 text-center">العدد في الحالي (Old)</th>
                      <th className="p-3 text-center">المنقول</th>
                      <th className="p-3 text-center">العدد في الجديد (New)</th>
                      <th className="p-3 text-center">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/30 text-[11px]">
                    {preFlightStats.map((item) => {
                      const isCurrent = activeCollectionKey === item.collectionKey;
                      return (
                        <tr key={item.collectionKey} className={isCurrent ? 'bg-cyan-950/30' : ''}>
                          <td className="p-3 font-semibold text-white flex items-center gap-2">
                            {isCurrent && <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />}
                            <span>{item.labelAr}</span>
                          </td>
                          <td className="p-3 text-center font-mono text-cyan-300 font-bold">{item.sourceCount}</td>
                          <td className="p-3 text-center font-mono text-amber-300 font-bold">{item.migratedCount}</td>
                          <td className="p-3 text-center font-mono text-emerald-300 font-bold">{item.targetCount}</td>
                          <td className="p-3 text-center">
                            {item.status === 'completed' && (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                مكتمل
                              </span>
                            )}
                            {item.status === 'migrating' && (
                              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse">
                                جاري النقل...
                              </span>
                            )}
                            {item.status === 'analyzed' && (
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                تم الفحص
                              </span>
                            )}
                            {item.status === 'error' && (
                              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                خطأ
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Final Verification Report */}
          {migrationReport && (
            <div
              className={`p-5 rounded-2xl border ${
                migrationReport.isAllVerified
                  ? 'bg-emerald-950/20 border-emerald-500/40'
                  : 'bg-amber-950/20 border-amber-500/40'
              } space-y-4`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  {migrationReport.isAllVerified ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  )}
                  <span>
                    {migrationReport.isAllVerified
                      ? 'تم التحقق من نجاح نقل جميع البيانات العامة بنسبة 100%'
                      : 'اكتمل النقل مع وجود تنبيهات أو تفاوت في الأعداد'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  اكتمل في: {new Date(migrationReport.completedAt).toLocaleTimeString('ar-EG')}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">إجمالي وثائق المصدر</div>
                  <div className="text-base font-black text-cyan-300 font-mono mt-0.5">
                    {migrationReport.totalSourceDocs}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">إجمالي ما تم نقله</div>
                  <div className="text-base font-black text-amber-300 font-mono mt-0.5">
                    {migrationReport.totalMigratedDocs}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">إجمالي وثائق الهدف الآن</div>
                  <div className="text-base font-black text-emerald-300 font-mono mt-0.5">
                    {migrationReport.totalTargetDocs}
                  </div>
                </div>
              </div>

              {migrationReport.failures.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>سجل الإخفاقات ({migrationReport.failures.length}):</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 pr-2 text-[11px] text-rose-200/90 font-mono">
                    {migrationReport.failures.map((f, i) => (
                      <li key={i}>
                        [{f.collection}] {f.docId}: {f.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            المرحلة الأولى • مقتصر على المناهج والبرمجيات والمصادر والأدوات
          </span>
          <button
            onClick={onClose}
            disabled={isMigrating}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors disabled:opacity-40"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
