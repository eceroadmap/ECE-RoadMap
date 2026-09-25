import React, { useState, useEffect } from 'react';
import { 
  MonitorPlay, 
  Sparkles, 
  RotateCcw, 
  Save, 
  Clock, 
  CheckCircle2, 
  Eye, 
  Edit3, 
  Sliders, 
  Cpu, 
  Radio, 
  Compass, 
  Layers, 
  Zap, 
  Award,
  ChevronLeft,
  Info
} from 'lucide-react';
import { Exhibition2FullConfig, Exhibition2SceneId } from '../../types/exhibition2';
import { exhibition2Repository } from '../../services/admin/exhibition2Repository';
import { DEFAULT_EXHIBITION2_CONFIG } from '../../data/defaultExhibition2';
import { Exhibition2ModeModal } from '../Exhibition2ModeModal';

export const Exhibition2Manager: React.FC = () => {
  const [config, setConfig] = useState<Exhibition2FullConfig>(exhibition2Repository.getCachedConfig());
  const [selectedSceneId, setSelectedSceneId] = useState<Exhibition2SceneId>('hero');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        const loaded = await exhibition2Repository.getConfig();
        setConfig(loaded);
      } catch (err) {
        console.warn('Error loading exhibition 2 config in admin:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccessMessage(null);
    try {
      await exhibition2Repository.saveConfig(config);
      setSaveSuccessMessage('تم حفظ إعدادات وشرائح وضع الملتقى 2 بنجاح في قاعدة البيانات.');
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    } catch (err) {
      alert('حدث خطأ أثناء حفظ التغييرات. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    setIsSaving(true);
    try {
      const def = await exhibition2Repository.resetToDefaults();
      setConfig(def);
      setIsResetConfirmOpen(false);
      setSaveSuccessMessage('تمت استعادة الإعدادات والنصوص الافتراضية المعتمدة لوضع الملتقى 2.');
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    } catch (err) {
      alert('فشلت استعادة الإعدادات الافتراضية.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSceneMeta = (id: Exhibition2SceneId, updates: Partial<typeof config.scenes[0]>) => {
    setConfig(prev => ({
      ...prev,
      scenes: prev.scenes.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  const totalDurationSeconds = config.scenes
    .filter(s => s.isEnabled)
    .reduce((acc, s) => acc + (Number(s.durationSeconds) || 15), 0);

  const activeSceneMeta = config.scenes.find(s => s.id === selectedSceneId) || config.scenes[0];

  return (
    <div className="space-y-6 animate-fadeIn pb-12" dir="rtl">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-l from-[#0c223f] via-[#09182d] to-[#060e1c] border-2 border-cyan-500/40 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/50 text-cyan-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Exhibition 2.0 Cinematic Management</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white flex items-center gap-2.5">
            <span>إدارة وضع الملتقى 2 (المعرض السينمائي التفاعلي 3D)</span>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 text-xs font-mono">
              7 مشاهد ثلاثية الأبعاد
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            التحكم الكامل في مدد المشاهد، ونصوص اللوحة الإشعاعية، والأنظمة المدمجة، والمشاريع التفاعلية المخصصة لعرض وجهتك الأكاديمية أمام طلاب البكالوريا.
          </p>
        </div>

        {/* Global CTA Actions */}
        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400 text-cyan-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md min-h-[44px]"
            title="تجربة العرض الآن"
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>معاينة العرض السينمائي الحي</span>
          </button>

          <button
            onClick={() => setIsResetConfirmOpen(true)}
            disabled={isSaving}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-all min-h-[44px]"
            title="استعادة النصوص الافتراضية"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة الافتراضيات</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-950 transition-all hover:scale-105 active:scale-95 min-h-[44px]"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'جارٍ الحفظ...' : 'حفظ ونشر التعديلات'}</span>
          </button>
        </div>
      </div>

      {/* Save Success Message */}
      {saveSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-bold flex items-center gap-2.5 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* Global Cycle Overview & Playback Tuning */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-950 text-cyan-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-mono">مدة الدورة السينمائية الكاملة</div>
            <div className="text-xl font-black text-white font-mono">{totalDurationSeconds} ثانية</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-950 text-blue-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] text-slate-400 font-mono">السرعة الافتراضية للعرض</div>
            <div className="flex gap-1 mt-1">
              {(['slow', 'medium', 'fast'] as const).map(sp => (
                <button
                  key={sp}
                  onClick={() => setConfig(prev => ({
                    ...prev,
                    playback: { ...prev.playback, defaultSpeed: sp }
                  }))}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    config.playback.defaultSpeed === sp 
                      ? 'bg-cyan-500 text-slate-950' 
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {sp === 'slow' ? 'بطيء' : sp === 'medium' ? 'متوسط' : 'سريع'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-950 text-purple-400">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-mono">التكرار التلقائي (Loop)</div>
            <label className="flex items-center gap-2 mt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={config.playback.autoLoop}
                onChange={e => setConfig(prev => ({
                  ...prev,
                  playback: { ...prev.playback, autoLoop: e.target.checked }
                }))}
                className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0"
              />
              <span className="text-xs text-slate-300 font-semibold">إعادة العرض من البداية تلقائياً</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Content Management Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scene List Sidebar */}
        <div className="lg:col-span-4 space-y-2.5">
          <h2 className="text-xs font-mono font-bold text-slate-400 px-1 uppercase tracking-wider">
            المشاهد السينمائية السبعة (Scenes)
          </h2>
          <div className="space-y-2">
            {config.scenes.map((scene, idx) => {
              const isSelected = scene.id === selectedSceneId;
              return (
                <div
                  key={scene.id}
                  onClick={() => setSelectedSceneId(scene.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-400 text-white shadow-lg shadow-cyan-950/60'
                      : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                      isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      0{idx + 1}
                    </span>
                    <div className="truncate text-right">
                      <div className="text-xs font-bold truncate">{scene.titleAr}</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">{scene.durationSeconds} ثانية</div>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-slate-500 shrink-0" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Scene Editor Panel */}
        <div className="lg:col-span-8 space-y-5">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
            {/* Scene Header & Timing Settings */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                  {activeSceneMeta.badge}
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  {activeSceneMeta.titleAr}
                </h3>
              </div>

              {/* Timing input */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">مدة المشهد:</span>
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={activeSceneMeta.durationSeconds}
                  onChange={(e) => updateSceneMeta(activeSceneMeta.id, { durationSeconds: Number(e.target.value) || 15 })}
                  className="w-20 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-cyan-400 font-mono font-bold text-center text-sm focus:border-cyan-400 focus:outline-none"
                />
                <span className="text-xs text-slate-400">ثانية</span>
              </div>
            </div>

            {/* Custom Fields depending on Scene */}
            {activeSceneMeta.id === 'hero' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">الشعار العلوي (Tagline):</label>
                  <input
                    type="text"
                    value={config.heroScene.tagline}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      heroScene: { ...prev.heroScene, tagline: e.target.value }
                    }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">العبارة الرئيسية (Main Headline):</label>
                  <input
                    type="text"
                    value={config.heroScene.mainHeadline}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      heroScene: { ...prev.heroScene, mainHeadline: e.target.value }
                    }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 text-sm font-bold focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">الشرح التعريفي الموجه لطلاب البكالوريا:</label>
                  <textarea
                    rows={3}
                    value={config.heroScene.shortBio}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      heroScene: { ...prev.heroScene, shortBio: e.target.value }
                    }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-cyan-400 focus:outline-none leading-relaxed"
                  />
                </div>
              </div>
            )}

            {activeSceneMeta.id === 'why_ece' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">عنوان المشهد:</label>
                  <input
                    type="text"
                    value={config.whyEceScene.headline}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      whyEceScene: { ...prev.whyEceScene, headline: e.target.value }
                    }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">العنوان الفرعي:</label>
                  <input
                    type="text"
                    value={config.whyEceScene.subheadline}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      whyEceScene: { ...prev.whyEceScene, subheadline: e.target.value }
                    }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
                  <span>الأركان الأربعة المعروضة: الأنظمة المدمجة، الاتصالات، الأنظمة الرقمية، ومعالجة الإشارة والذكاء الاصطناعي مع مجسم الـ 3D التفاعلي.</span>
                </div>
              </div>
            )}

            {activeSceneMeta.id === 'journey_years' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">عنوان المشهد:</label>
                  <input
                    type="text"
                    value={config.journeyScene.headline}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      journeyScene: { ...prev.journeyScene, headline: e.target.value }
                    }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
                  <span>يعرض المراحل الأكاديمية التصاعدية من السنة الأولى (بناء الأساس) وحتى السنة الخامسة (التخصص والألياف والأقمار الصناعية).</span>
                </div>
              </div>
            )}

            {activeSceneMeta.id === 'projects_expo' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">عنوان معرض المشاريع:</label>
                  <input
                    type="text"
                    value={config.projectsScene.headline}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      projectsScene: { ...prev.projectsScene, headline: e.target.value }
                    }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
                  <span>المشاريع المجهزة بمحاكاة ثلاثية الأبعاد 3D: لعبة الذاكرة ESP32، نظام RFID، حساس المسافة ومحرك السيرفو، ونظام الرؤية الحاسوبية.</span>
                </div>
              </div>
            )}

            {activeSceneMeta.id === 'fit_quiz' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">عنوان الجناح والترحيب:</label>
                  <input
                    type="text"
                    value={config.fitQuizScene.subheadline}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      fitQuizScene: { ...prev.fitQuizScene, subheadline: e.target.value }
                    }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">الرسالة التوجيهية:</label>
                  <textarea
                    rows={2}
                    value={config.fitQuizScene.welcomeMessage}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      fitQuizScene: { ...prev.fitQuizScene, welcomeMessage: e.target.value }
                    }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {activeSceneMeta.id === 'roadmap_tool' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">اقتباس الخريطة:</label>
                  <input
                    type="text"
                    value={config.roadmapScene.quote}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      roadmapScene: { ...prev.roadmapScene, quote: e.target.value }
                    }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">رابط الـ QR للمسح:</label>
                  <input
                    type="text"
                    value={config.roadmapScene.qrUrl}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      roadmapScene: { ...prev.roadmapScene, qrUrl: e.target.value }
                    }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {activeSceneMeta.id === 'comparison' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">الرسالة الختامية (Takeaway):</label>
                  <textarea
                    rows={2}
                    value={config.comparisonScene.takeawayMessage}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      comparisonScene: { ...prev.comparisonScene, takeawayMessage: e.target.value }
                    }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-bold text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="p-6 rounded-3xl bg-[#081528] border border-slate-800 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-white">تأكيد استعادة الافتراضيات</h3>
            <p className="text-xs text-slate-300">
              هل أنت متأكد من رغبتك في استعادة جميع النصوص ومدد المشاهد الافتراضية المعتمدة لوضع الملتقى 2؟
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleResetDefaults}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                تأكيد الاستعادة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      <Exhibition2ModeModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
};
