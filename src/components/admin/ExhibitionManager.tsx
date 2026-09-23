import React, { useState, useEffect } from 'react';
import { 
  MonitorPlay, 
  Sparkles, 
  RotateCcw, 
  Save, 
  Plus, 
  Trash2, 
  Clock, 
  Sliders, 
  CheckCircle2, 
  Eye, 
  Edit3, 
  Layers, 
  Briefcase, 
  QrCode, 
  Zap, 
  Cpu, 
  Award, 
  Radio, 
  Terminal, 
  Wifi, 
  ShieldCheck, 
  Laptop, 
  GraduationCap, 
  Map, 
  Smartphone, 
  Activity,
  ChevronLeft,
  Info
} from 'lucide-react';
import { ExhibitionFullConfig, ExhibitionSlideId, HeroMetric, SkillPipelineItem, CareerPathItem } from '../../types/exhibition';
import { exhibitionRepository } from '../../services/admin/exhibitionRepository';
import { DEFAULT_EXHIBITION_CONFIG } from '../../data/defaultExhibition';
import { ExhibitionModeModal } from '../ExhibitionModeModal';
import { Exhibition2Manager } from './Exhibition2Manager';

export const ExhibitionManager: React.FC = () => {
  const [activeModeTab, setActiveModeTab] = useState<'exhibition1' | 'exhibition2'>('exhibition1');
  const [config, setConfig] = useState<ExhibitionFullConfig>(exhibitionRepository.getCachedConfig());
  const [selectedSlideId, setSelectedSlideId] = useState<ExhibitionSlideId>('hero');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  // Load initial config from Firebase/Cache
  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        const loaded = await exhibitionRepository.getConfig();
        setConfig(loaded);
      } catch (err) {
        console.warn('Error loading exhibition config in admin:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // Save handler
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccessMessage(null);
    try {
      await exhibitionRepository.saveConfig(config);
      setSaveSuccessMessage('تم حفظ إعدادات وشرائح وضع الملتقى بنجاح في قاعدة البيانات.');
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    } catch (err) {
      alert('حدث خطأ أثناء حفظ التغييرات. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset handler
  const handleResetDefaults = async () => {
    setIsSaving(true);
    try {
      const def = await exhibitionRepository.resetToDefaults();
      setConfig(def);
      setIsResetConfirmOpen(false);
      setSaveSuccessMessage('تمت استعادة الإعدادات والنصوص الافتراضية المعتمدة لجميع الشرائح.');
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    } catch (err) {
      alert('فشلت استعادة الإعدادات الافتراضية.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to update slide meta (duration, enabled, titles)
  const updateSlideMeta = (id: ExhibitionSlideId, updates: Partial<typeof config.slides[0]>) => {
    setConfig(prev => ({
      ...prev,
      slides: prev.slides.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  // Calculate total exhibition cycle duration in seconds
  const totalDurationSeconds = config.slides
    .filter(s => s.isEnabled)
    .reduce((acc, s) => acc + (Number(s.durationSeconds) || 10), 0);

  const activeSlideMeta = config.slides.find(s => s.id === selectedSlideId) || config.slides[0];

  return (
    <div className="space-y-6 animate-fadeIn pb-12" dir="rtl">
      {/* Exhibition Mode Selector Switcher */}
      <div className="flex items-center gap-2.5 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl w-fit shadow-lg">
        <button
          onClick={() => setActiveModeTab('exhibition1')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeModeTab === 'exhibition1'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MonitorPlay className="w-4 h-4" />
          <span>وضع الملتقى 1 (الكلاسيكي)</span>
        </button>

        <button
          onClick={() => setActiveModeTab('exhibition2')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeModeTab === 'exhibition2'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-950'
              : 'text-slate-400 hover:text-cyan-300'
          }`}
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>وضع الملتقى 2 (المعرض السينمائي 3D ⚡)</span>
        </button>
      </div>

      {activeModeTab === 'exhibition2' ? (
        <Exhibition2Manager />
      ) : (
        <>
          {/* ========================================================================= */}
          {/* 1. Header Banner & Quick Action Controls                                   */}
          {/* ========================================================================= */}
      <div className="p-6 rounded-3xl bg-gradient-to-l from-[#0c223f] via-[#09182d] to-[#060e1c] border-2 border-cyan-500/30 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/50 text-cyan-300 text-xs font-mono">
            <MonitorPlay className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Exhibition Mode Content Management System (CMS)</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white flex items-center gap-2.5">
            <span>إدارة شرائح وضع الملتقى المعرضي</span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 text-xs font-mono">
              6 شرائح سينمائية
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            تحكم ديناميكي كامل في نصوص، أرقام، مدة العرض، ومحتوى كل شريحة مخصصة للشاشات الكبيرة في المعارض والملتقيات الهندسية بجامعة دمشق.
          </p>
        </div>

        {/* Global CTA Actions */}
        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 text-xs font-bold flex items-center gap-2 transition-all shadow-md min-h-[44px]"
            title="تجربة العرض الآن"
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>معاينة العرض الحي</span>
          </button>

          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800 text-slate-300 hover:text-rose-300 text-xs font-bold flex items-center gap-2 transition-all min-h-[44px]"
            title="استعادة القيم الافتراضية"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">استعادة الافتراضي</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-l from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/30 transition-all active:scale-95 disabled:opacity-50 min-h-[44px]"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>حفظ التعديلات</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs sm:text-sm font-bold flex items-center gap-3 animate-fadeIn shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Global Presentation Metrics & Duration Overview                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#081528] border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">المدة الإجمالية للدورة:</span>
          <div className="text-xl font-black text-cyan-400 font-mono flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>{totalDurationSeconds} ثانية</span>
            <span className="text-xs text-slate-400 font-sans font-normal">
              ({(totalDurationSeconds / 60).toFixed(1)} دقيقة)
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#081528] border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">الشرائح النشطة:</span>
          <div className="text-xl font-black text-blue-400 font-mono">
            {config.slides.filter(s => s.isEnabled).length} / {config.slides.length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#081528] border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">مسارات المهارات المبرمجة:</span>
          <div className="text-xl font-black text-emerald-400 font-mono">
            {config.skills.pipelines.length} مسارات
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#081528] border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">المسارات المهنية المعروضة:</span>
          <div className="text-xl font-black text-sky-400 font-mono">
            {config.careers.careers.length} مسارات
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. Slide Selection Tabs (Visual Grid)                                     */}
      {/* ========================================================================= */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-400 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>اختر الشريحة المراد تعديل نصوصها وبياناتها:</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {config.slides.map((slide) => {
            const isSelected = selectedSlideId === slide.id;
            return (
              <button
                key={slide.id}
                onClick={() => setSelectedSlideId(slide.id)}
                className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between gap-2 min-h-[76px] ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-950/80 ring-1 ring-cyan-400'
                    : 'bg-[#081528] border-slate-800/90 hover:border-slate-700 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-lg ${
                    isSelected ? 'bg-cyan-400 text-slate-950 font-black' : 'bg-slate-900 text-slate-400'
                  }`}>
                    {slide.indexLabel}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-300 flex items-center gap-0.5">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>{slide.durationSeconds}s</span>
                  </span>
                </div>

                <div>
                  <div className="text-xs font-bold text-white truncate">{slide.titleAr}</div>
                  <div className="text-[10px] text-slate-400 truncate">{slide.subtitleAr}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. Active Slide Meta Inspector & Duration Control Card                     */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#081528] border border-cyan-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-xl bg-cyan-950 border border-cyan-700 text-cyan-300 font-mono font-bold text-xs">
              شريحة {activeSlideMeta.indexLabel}
            </span>
            <h2 className="text-base sm:text-lg font-black text-white">
              إعدادات شريحة: {activeSlideMeta.titleAr}
            </h2>
          </div>

          {/* Duration & Enable Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>مدة الشريحة:</span>
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="3"
                  max="120"
                  value={activeSlideMeta.durationSeconds}
                  onChange={(e) => updateSlideMeta(selectedSlideId, { durationSeconds: Math.max(3, parseInt(e.target.value) || 3) })}
                  className="w-16 px-2 py-1 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 font-mono font-bold text-xs text-center focus:outline-none focus:border-cyan-400"
                />
                <span className="text-xs text-slate-400 font-mono">ثانية</span>
              </div>
            </div>

            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={activeSlideMeta.isEnabled}
                onChange={(e) => updateSlideMeta(selectedSlideId, { isEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 bg-slate-900 border-slate-700"
              />
              <span className="text-xs font-bold text-slate-300">مفعلة بالعرض</span>
            </label>
          </div>
        </div>

        {/* Quick Nav Titles in the bottom slider */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">
              عنوان الشريحة في شريط التنقل السفلي:
            </label>
            <input
              type="text"
              value={activeSlideMeta.titleAr}
              onChange={(e) => updateSlideMeta(selectedSlideId, { titleAr: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs font-bold focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">
              الوصف الفرعي في شريط التنقل:
            </label>
            <input
              type="text"
              value={activeSlideMeta.subtitleAr}
              onChange={(e) => updateSlideMeta(selectedSlideId, { subtitleAr: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. DEDICATED SLIDE EDITORS ACCORDING TO SELECTED SLIDE                     */}
      {/* ========================================================================= */}

      {/* ------------------------------------------------------------------------- */}
      {/* SLIDE 01: HERO / OPENING REVEAL EDITOR                                    */}
      {/* ------------------------------------------------------------------------- */}
      {selectedSlideId === 'hero' && (
        <div className="p-5 rounded-3xl bg-[#081528] border border-slate-800 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">تعديل نصوص وبطاقات الشريحة الافتتاحية (Hero)</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                شارة الجامعة والكلية (Placemark Badge):
              </label>
              <input
                type="text"
                value={config.hero.placemarkBadge}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  hero: { ...prev.hero, placemarkBadge: e.target.value }
                }))}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  العنوان الأكاديمي الرئيسي الكبير:
                </label>
                <input
                  type="text"
                  value={config.hero.mainTitle}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    hero: { ...prev.hero, mainTitle: e.target.value }
                  }))}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs font-black focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  الشعار الملون المتدرج (Gradient Slogan):
                </label>
                <input
                  type="text"
                  value={config.hero.subtitleGradient}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    hero: { ...prev.hero, subtitleGradient: e.target.value }
                  }))}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-bold focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                الفقرة التعريفية الشاملة:
              </label>
              <textarea
                rows={3}
                value={config.hero.description}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  hero: { ...prev.hero, description: e.target.value }
                }))}
                className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* 4 Metric Cards Editor */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-cyan-400 block">
                بطاقات الأرقام والمؤشرات الأكاديمية الأربعة:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {config.hero.metrics.map((metric, idx) => (
                  <div key={metric.id || idx} className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">بطاقة #{idx + 1}</span>
                      <select
                        value={metric.colorTheme}
                        onChange={(e) => {
                          const newMetrics = [...config.hero.metrics];
                          newMetrics[idx].colorTheme = e.target.value as any;
                          setConfig(prev => ({ ...prev, hero: { ...prev.hero, metrics: newMetrics } }));
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-300 focus:outline-none"
                      >
                        <option value="cyan">سماوي (Cyan)</option>
                        <option value="blue">أزرق (Blue)</option>
                        <option value="sky">أزرق سماوي (Sky)</option>
                        <option value="emerald">زمردي (Emerald)</option>
                        <option value="purple">بنفسجي (Purple)</option>
                        <option value="amber">كهرماني (Amber)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400">الرقم/المؤشر:</label>
                      <input
                        type="text"
                        value={metric.number}
                        onChange={(e) => {
                          const newMetrics = [...config.hero.metrics];
                          newMetrics[idx].number = e.target.value;
                          setConfig(prev => ({ ...prev, hero: { ...prev.hero, metrics: newMetrics } }));
                        }}
                        className="w-full px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-700 text-cyan-300 font-mono font-bold text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400">العنوان:</label>
                      <input
                        type="text"
                        value={metric.titleAr}
                        onChange={(e) => {
                          const newMetrics = [...config.hero.metrics];
                          newMetrics[idx].titleAr = e.target.value;
                          setConfig(prev => ({ ...prev, hero: { ...prev.hero, metrics: newMetrics } }));
                        }}
                        className="w-full px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400">الوصف التوضيحي:</label>
                      <input
                        type="text"
                        value={metric.descAr}
                        onChange={(e) => {
                          const newMetrics = [...config.hero.metrics];
                          newMetrics[idx].descAr = e.target.value;
                          setConfig(prev => ({ ...prev, hero: { ...prev.hero, metrics: newMetrics } }));
                        }}
                        className="w-full px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 text-[11px]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* SLIDE 02: JOURNEY / 5-YEAR SIGNAL PATH EDITOR                             */}
      {/* ------------------------------------------------------------------------- */}
      {selectedSlideId === 'journey' && (
        <div className="p-5 rounded-3xl bg-[#081528] border border-slate-800 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">تعديل شريحة رحلة السنوات الخمس الأكاديمية</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                شارة رأس الشريحة (Badge):
              </label>
              <input
                type="text"
                value={config.journey.badgeText}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  journey: { ...prev.journey, badgeText: e.target.value }
                }))}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                عنوان الشريحة الرئيسي:
              </label>
              <input
                type="text"
                value={config.journey.sectionTitle}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  journey: { ...prev.journey, sectionTitle: e.target.value }
                }))}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs font-black focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              مقدمة توضيحية لرحلة السنوات:
            </label>
            <textarea
              rows={2}
              value={config.journey.customIntro}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                journey: { ...prev.journey, customIntro: e.target.value }
              }))}
              className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 text-xs text-slate-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-cyan-300">ملاحظة ذكية:</span> يتم استخراج أسماء المقررات والمخابر وبرمجيات كل سنة دراسية تلقائياً ومباشرة من قاعدة بيانات المقررات والبرمجيات في المنصة لضمان تحديثها المستمر.
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* SLIDE 03: SKILLS PIPELINE EDITOR                                          */}
      {/* ------------------------------------------------------------------------- */}
      {selectedSlideId === 'skills_pipeline' && (
        <div className="p-5 rounded-3xl bg-[#081528] border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">مسارات ربط المقررات بالمهارات وسوق العمل</h3>
            </div>

            <button
              onClick={() => {
                const newPipeline: SkillPipelineItem = {
                  id: `skill_${Date.now()}`,
                  titleAr: 'مسار تخصصي جديد',
                  courseAr: 'اسم المقرر التخصصي',
                  labAr: 'مخبر التطبيق',
                  softwareAr: 'برنامج المحاكاة',
                  skillAr: 'المهارة الهندسية المكتسبة',
                  careerAr: 'المجال الوظيفي المستهدف'
                };
                setConfig(prev => ({
                  ...prev,
                  skills: { ...prev.skills, pipelines: [...prev.skills.pipelines, newPipeline] }
                }));
              }}
              className="px-3 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة مسار مهارة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                شارة رأس الشريحة:
              </label>
              <input
                type="text"
                value={config.skills.badgeText}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  skills: { ...prev.skills, badgeText: e.target.value }
                }))}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                عنوان الشريحة:
              </label>
              <input
                type="text"
                value={config.skills.sectionTitle}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  skills: { ...prev.skills, sectionTitle: e.target.value }
                }))}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs font-black focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Pipelines List */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-cyan-400 block">
              قائمة مسارات المهارات ({config.skills.pipelines.length} مسارات):
            </span>

            {config.skills.pipelines.map((pipe, idx) => (
              <div key={pipe.id || idx} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 relative group">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    STAGE 0{idx + 1} &bull; {pipe.titleAr}
                  </span>
                  <button
                    onClick={() => {
                      setConfig(prev => ({
                        ...prev,
                        skills: {
                          ...prev.skills,
                          pipelines: prev.skills.pipelines.filter((_, i) => i !== idx)
                        }
                      }));
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                    title="حذف المسار"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">المجال / العنوان:</label>
                    <input
                      type="text"
                      value={pipe.titleAr}
                      onChange={(e) => {
                        const updated = [...config.skills.pipelines];
                        updated[idx].titleAr = e.target.value;
                        setConfig(prev => ({ ...prev, skills: { ...prev.skills, pipelines: updated } }));
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">المقرر الأكاديمي:</label>
                    <input
                      type="text"
                      value={pipe.courseAr}
                      onChange={(e) => {
                        const updated = [...config.skills.pipelines];
                        updated[idx].courseAr = e.target.value;
                        setConfig(prev => ({ ...prev, skills: { ...prev.skills, pipelines: updated } }));
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-cyan-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">برنامج المحاكاة:</label>
                    <input
                      type="text"
                      value={pipe.softwareAr}
                      onChange={(e) => {
                        const updated = [...config.skills.pipelines];
                        updated[idx].softwareAr = e.target.value;
                        setConfig(prev => ({ ...prev, skills: { ...prev.skills, pipelines: updated } }));
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-sky-300 font-mono text-xs font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-slate-400 mb-1">المهارة الهندسية التطبيقية:</label>
                    <input
                      type="text"
                      value={pipe.skillAr}
                      onChange={(e) => {
                        const updated = [...config.skills.pipelines];
                        updated[idx].skillAr = e.target.value;
                        setConfig(prev => ({ ...prev, skills: { ...prev.skills, pipelines: updated } }));
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">المجال المهني / الوظيفي:</label>
                    <input
                      type="text"
                      value={pipe.careerAr}
                      onChange={(e) => {
                        const updated = [...config.skills.pipelines];
                        updated[idx].careerAr = e.target.value;
                        setConfig(prev => ({ ...prev, skills: { ...prev.skills, pipelines: updated } }));
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-emerald-300 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* SLIDE 04: SOFTWARE TOOLKIT EDITOR                                         */}
      {/* ------------------------------------------------------------------------- */}
      {selectedSlideId === 'software_toolkit' && (
        <div className="p-5 rounded-3xl bg-[#081528] border border-slate-800 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">تعديل شريحة حزمة برمجيات المحاكاة والتصميم</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                شارة رأس الشريحة:
              </label>
              <input
                type="text"
                value={config.software.badgeText}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  software: { ...prev.software, badgeText: e.target.value }
                }))}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                عنوان الشريحة:
              </label>
              <input
                type="text"
                value={config.software.sectionTitle}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  software: { ...prev.software, sectionTitle: e.target.value }
                }))}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs font-black focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              الوصف التوجيهي للحزمة البرمجية:
            </label>
            <textarea
              rows={2}
              value={config.software.descriptionHint}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                software: { ...prev.software, descriptionHint: e.target.value }
              }))}
              className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 text-xs text-slate-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-cyan-300">ملاحظة الربط:</span> بطاقات البرمجيات الـ 16 (مثل MATLAB, HFSS, Quartus, Packet Tracer) يتم سحبها فورياً من قسم &quot;إدارة برمجيات المحاكاة&quot; باللوحة، وأي تعديل هناك يظهر فوراً في شريحة العرض.
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* SLIDE 05: CAREERS PATHS EDITOR                                            */}
      {/* ------------------------------------------------------------------------- */}
      {selectedSlideId === 'careers' && (
        <div className="p-5 rounded-3xl bg-[#081528] border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">تعديل شريحة &quot;ماذا ستصبح بعد التخرج؟&quot; (المسارات المهنية)</h3>
            </div>

            <button
              onClick={() => {
                const newCareer: CareerPathItem = {
                  id: `career_${Date.now()}`,
                  titleAr: 'مسار مهني جديد',
                  titleEn: 'Engineering Career Track',
                  domain: 'المجالات والشركات وسوق العمل المستهدف',
                  iconKey: 'Briefcase',
                  colorClass: 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300'
                };
                setConfig(prev => ({
                  ...prev,
                  careers: { ...prev.careers, careers: [...prev.careers.careers, newCareer] }
                }));
              }}
              className="px-3 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة مسار مهني</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                شارة رأس الشريحة:
              </label>
              <input
                type="text"
                value={config.careers.badgeText}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  careers: { ...prev.careers, badgeText: e.target.value }
                }))}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                عنوان الشريحة:
              </label>
              <input
                type="text"
                value={config.careers.sectionTitle}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  careers: { ...prev.careers, sectionTitle: e.target.value }
                }))}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs font-black focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Careers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {config.careers.careers.map((career, idx) => (
              <div key={career.id || idx} className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 relative group">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">مسار #{idx + 1}</span>
                  <button
                    onClick={() => {
                      setConfig(prev => ({
                        ...prev,
                        careers: {
                          ...prev.careers,
                          careers: prev.careers.careers.filter((_, i) => i !== idx)
                        }
                      }));
                    }}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                    title="حذف المسار"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">المسمى بالعربية:</label>
                  <input
                    type="text"
                    value={career.titleAr}
                    onChange={(e) => {
                      const updated = [...config.careers.careers];
                      updated[idx].titleAr = e.target.value;
                      setConfig(prev => ({ ...prev, careers: { ...prev.careers, careers: updated } }));
                    }}
                    className="w-full px-2 py-1 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">المسمى بالإنجليزية:</label>
                  <input
                    type="text"
                    value={career.titleEn}
                    onChange={(e) => {
                      const updated = [...config.careers.careers];
                      updated[idx].titleEn = e.target.value;
                      setConfig(prev => ({ ...prev, careers: { ...prev.careers, careers: updated } }));
                    }}
                    className="w-full px-2 py-1 rounded-xl bg-slate-950 border border-slate-700 text-cyan-300 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">مجال وسوق العمل:</label>
                  <textarea
                    rows={2}
                    value={career.domain}
                    onChange={(e) => {
                      const updated = [...config.careers.careers];
                      updated[idx].domain = e.target.value;
                      setConfig(prev => ({ ...prev, careers: { ...prev.careers, careers: updated } }));
                    }}
                    className="w-full p-1.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 text-[11px]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* SLIDE 06: QR PORTAL & VISITORS ACCESS EDITOR                              */}
      {/* ------------------------------------------------------------------------- */}
      {selectedSlideId === 'qr_portal' && (
        <div className="p-5 rounded-3xl bg-[#081528] border border-slate-800 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <QrCode className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">تعديل شريحة رمز الـ QR وزوار الجناح المعرضي</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                شارة رأس الشريحة:
              </label>
              <input
                type="text"
                value={config.qrPortal.badgeText}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  qrPortal: { ...prev.qrPortal, badgeText: e.target.value }
                }))}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                عنوان دعوة المسح:
              </label>
              <input
                type="text"
                value={config.qrPortal.title}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  qrPortal: { ...prev.qrPortal, title: e.target.value }
                }))}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs font-black focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              النص التوجيهي للزوار:
            </label>
            <textarea
              rows={2}
              value={config.qrPortal.description}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                qrPortal: { ...prev.qrPortal, description: e.target.value }
              }))}
              className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                رابط QR المخصص (اختياري - يترك فارغاً للرابط الحالي):
              </label>
              <input
                type="text"
                placeholder="https://... (فارغ = نطاق المنصة)"
                value={config.qrPortal.customQrUrl}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  qrPortal: { ...prev.qrPortal, customQrUrl: e.target.value }
                }))}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                عنوان صندوق الرمز:
              </label>
              <input
                type="text"
                value={config.qrPortal.qrTitle}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  qrPortal: { ...prev.qrPortal, qrTitle: e.target.value }
                }))}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                الوصف أسفل الرمز:
              </label>
              <input
                type="text"
                value={config.qrPortal.qrSubtitle}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  qrPortal: { ...prev.qrPortal, qrSubtitle: e.target.value }
                }))}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Reset Confirmation Modal                                                  */}
      {/* ========================================================================= */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl bg-[#091527] border-2 border-rose-500/50 shadow-2xl space-y-4 animate-scaleUp">
            <h3 className="text-base font-black text-rose-300 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-rose-400" />
              <span>استعادة الإعدادات الافتراضية للشرائح</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              هل أنت متأكد من رغبتك في إعادة تعيين جميع الشرائح والنصوص والمدد الزمنية إلى النسخة الرسمية الافتراضية المعتمدة لقسم ECE؟
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleResetDefaults}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-900/40"
              >
                تأكيد الاستعادة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Live Exhibition Mode Preview Modal                                        */}
      {/* ========================================================================= */}
      {isPreviewOpen && (
        <ExhibitionModeModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
        </>
      )}
    </div>
  );
};
