import React, { useState, useEffect, useMemo } from 'react';
import { 
  Laptop, 
  Cpu, 
  HardDrive, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Lightbulb,
  Award, 
  Info, 
  Save, 
  Trash2, 
  RotateCcw,
  Check,
  GraduationCap,
  Search,
  ArrowLeft,
  ArrowRight,
  Filter,
  Monitor,
  ExternalLink,
  Layers,
  Sparkles,
  ChevronRight,
  Sliders,
  DollarSign
} from 'lucide-react';
import { 
  LaptopSpecs, 
  LaptopEvaluationResult, 
  RecommendedLaptopModel,
  DepartmentRecommendedSpecs,
  CpuBrand,
  CpuTier,
  CpuGen,
  StorageType,
  GpuTier,
  OperatingSystem,
  ScreenSize
} from '../types/laptop';
import { 
  evaluateLaptop, 
  DEFAULT_LAPTOP_SPECS, 
  DEFAULT_DEPARTMENT_SPECS, 
  RECOMMENDED_ARCHETYPES 
} from '../data/laptopRules';
import { 
  useLiveRecommendedLaptops, 
  useLiveDepartmentSpecs 
} from '../services/laptopAdvisorService';
import { useStudentState } from '../services/useStudentState';
import { SOFTWARE_DATA } from '../data/software';
import { soundEffects } from '../utils/soundEffects';

type AdvisorViewMode = 'recommended_models' | 'test_laptop';

export const LaptopAdvisorSection: React.FC = () => {
  const { profile, savedLaptop, saveLaptop, removeSavedLaptop } = useStudentState();
  const liveLaptops = useLiveRecommendedLaptops();
  const deptSpecs = useLiveDepartmentSpecs();

  // Active top-level view: Choice 1 (Recommended Laptops) or Choice 2 (Test Your Laptop)
  const [activeView, setActiveView] = useState<AdvisorViewMode>('recommended_models');

  // Test Multi-step Flow State (Step 1: Input Specs, Step 2: Evaluation Result)
  const [testStep, setTestStep] = useState<1 | 2>(1);

  // Form specs state for the test
  const [specs, setSpecs] = useState<LaptopSpecs>(() => {
    if (savedLaptop?.specs) {
      return savedLaptop.specs;
    }
    return DEFAULT_LAPTOP_SPECS;
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Filters for Recommended Laptops
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSuitabilityFilter, setSelectedSuitabilityFilter] = useState<'all' | 'budget' | 'balanced' | 'pro'>('all');

  // Sync saved laptop from profile if available and user hasn't started editing
  useEffect(() => {
    if (savedLaptop?.specs) {
      setSpecs(savedLaptop.specs);
    }
  }, [savedLaptop]);

  // Evaluate the current specs
  const evaluation: LaptopEvaluationResult = useMemo(() => {
    return evaluateLaptop(specs, deptSpecs);
  }, [specs, deptSpecs]);

  // Handle stepping to evaluation screen
  const handleProceedToEvaluation = () => {
    // Validate that essential fields are selected
    if (!specs.ramGb) {
      setValidationError('يرجى تحديد سعة الذاكرة العشوائية (RAM)');
      return;
    }
    if (!specs.storageCapacityGb) {
      setValidationError('يرجى تحديد سعة وسيط التخزين الداخلي');
      return;
    }
    if (!specs.cpuTier) {
      setValidationError('يرجى اختيار فئة المعالج (CPU)');
      return;
    }

    setValidationError(null);
    try {
      soundEffects.playSuccess();
    } catch {}
    setTestStep(2);
    // Scroll smoothly to top of test container
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleBackToForm = () => {
    setTestStep(1);
  };

  const handleSaveSpecs = () => {
    saveLaptop(specs, evaluation as any);
    setSaveSuccess(true);
    try {
      soundEffects.playSuccess();
    } catch {}
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleResetTest = () => {
    setSpecs(DEFAULT_LAPTOP_SPECS);
    setTestStep(1);
    setValidationError(null);
  };

  // Evaluate Software Compatibility based on current specs
  const softwareCompatibility = useMemo(() => {
    return SOFTWARE_DATA.map((sw) => {
      const isHeavyEM = sw.id === 'hfss' || sw.name.toLowerCase().includes('cst');
      const isHeavyEDA = sw.id === 'quartus' || sw.id === 'modelsim' || sw.id === 'matlab';
      const isMid = sw.id === 'visual-studio' || sw.id === 'multisim' || sw.id === 'pspice' || sw.id === 'pathloss';
      
      let status: 'smooth' | 'acceptable' | 'heavy' = 'smooth';
      let note = 'يعمل بسلاسة ممتازة';

      if (specs.os === 'macos' && (sw.id === 'quartus' || sw.id === 'multisim' || sw.id === 'pspice' || sw.id === 'proteus' || sw.id === 'pathloss')) {
        status = 'heavy';
        note = 'غير متوفر رسمياً لنظام macOS (يتطلب نظاماً وهمياً)';
      } else if (isHeavyEM) {
        if (specs.ramGb < 16 || specs.storageType === 'hdd') {
          status = 'heavy';
          note = 'يتطلب 16GB RAM وقرص SSD لحسابات الشبكات ثلاثية الأبعاد';
        } else if (specs.gpuTier === 'integrated') {
          status = 'acceptable';
          note = 'سيعمل مع بطء في دوران المجسمات المعقدة';
        } else {
          status = 'smooth';
          note = 'يعمل بأداء احترافي ومحاكاة سريعة';
        }
      } else if (isHeavyEDA) {
        if (specs.ramGb < 8 || specs.storageType === 'hdd') {
          status = 'heavy';
          note = 'بطء ملحوظ في الفتح وحزم المعالجة الكبيرة';
        } else if (specs.ramGb === 8) {
          status = 'acceptable';
          note = 'أداء مقبول، يُفضل تجنب فتح مشاريع متعددة معاً';
        } else {
          status = 'smooth';
          note = 'يعمل بسلاسة واستجابة فورية';
        }
      } else if (isMid) {
        if (specs.storageType === 'hdd') {
          status = 'acceptable';
          note = 'زمن الإقلاع أبطأ قليلاً بسبب القرص الميكانيكي';
        } else {
          status = 'smooth';
          note = 'يعمل بسلاسة ممتازة';
        }
      }

      return {
        ...sw,
        compatibilityStatus: status,
        compatibilityNote: note
      };
    });
  }, [specs]);

  const smoothCount = softwareCompatibility.filter((s) => s.compatibilityStatus === 'smooth').length;
  const heavyCount = softwareCompatibility.filter((s) => s.compatibilityStatus === 'heavy').length;

  // Filtered Recommended Laptops
  const filteredLaptops = useMemo(() => {
    return liveLaptops.filter((lap) => {
      if (lap.status === 'archived') return false;
      if (selectedSuitabilityFilter !== 'all' && lap.suitabilityLevel !== selectedSuitabilityFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = lap.name.toLowerCase().includes(q);
        const matchBrand = lap.brand.toLowerCase().includes(q);
        const matchCpu = lap.cpu.toLowerCase().includes(q);
        const matchGpu = lap.gpu.toLowerCase().includes(q);
        const matchFields = lap.suitableFor.some(f => f.toLowerCase().includes(q));
        return matchName || matchBrand || matchCpu || matchGpu || matchFields;
      }
      return true;
    });
  }, [liveLaptops, selectedSuitabilityFilter, searchQuery]);

  return (
    <div className="space-y-8 sm:space-y-12 max-w-6xl mx-auto w-full overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200" dir="rtl">
      
      {/* 1. Header & Introduction */}
      <div className="text-center max-w-3xl mx-auto px-4 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono shadow-md">
          <Laptop className="w-4 h-4 text-cyan-400" />
          <span>مستشار العتاد والأجهزة • ECE Laptop Advisor</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          مستشار لابتوب هندسة الإلكترونيات والاتصالات
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto">
          دليلك الأكاديمي الشامل لاختيار الحاسوب المحمول المناسب لدراسة ومشاريع القسم، أو اختبار جهازك الحالي للتأكد من قدرته على تشغيل برمجيات المحاكاة والبرمجة بكل سلاسة.
        </p>
      </div>

      {/* 2. Primary Choice Tabs (The 2 Core Paths) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto px-2">
        {/* Choice 1: Recommended Laptops */}
        <button
          type="button"
          onClick={() => {
            setActiveView('recommended_models');
            try { soundEffects.playClick(); } catch {}
          }}
          className={`p-5 sm:p-6 rounded-3xl border text-right transition-all duration-300 relative overflow-hidden group flex flex-col justify-between ${
            activeView === 'recommended_models'
              ? 'bg-gradient-to-br from-[#091a33] to-[#081528] border-cyan-500/80 ring-2 ring-cyan-500/40 shadow-xl shadow-cyan-950/40 scale-[1.01]'
              : 'bg-[#091527]/90 border-slate-800 hover:border-slate-700 hover:bg-[#0a182c]'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                activeView === 'recommended_models'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/30'
                  : 'bg-slate-900 text-cyan-400 border border-slate-800 group-hover:border-cyan-500/40'
              }`}>
                <Laptop className="w-6 h-6" />
              </div>

              {activeView === 'recommended_models' && (
                <span className="px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/80 text-[11px] font-bold flex items-center gap-1">
                  <Check className="w-3 h-3 text-cyan-400" />
                  <span>القسم المحدد</span>
                </span>
              )}
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-black text-white group-hover:text-cyan-300 transition-colors">
                💻 اللابتوبات الموصى بها لطلاب القسم
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                استعرض نماذج الأجهزة المقترحة والمطابقة لمتطلبات مقررات ومشاريع هندسة الاتصالات والإلكترونيات، مع مواصفاتها ومجالات عملها.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-bold text-cyan-400">
            <span>تصفح النماذج المقترحة ({liveLaptops.length} جهاز)</span>
            <ChevronRight className="w-4 h-4 rotate-180 transform group-hover:-translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Choice 2: Test Your Laptop */}
        <button
          type="button"
          onClick={() => {
            setActiveView('test_laptop');
            try { soundEffects.playClick(); } catch {}
          }}
          className={`p-5 sm:p-6 rounded-3xl border text-right transition-all duration-300 relative overflow-hidden group flex flex-col justify-between ${
            activeView === 'test_laptop'
              ? 'bg-gradient-to-br from-[#091a33] to-[#081528] border-cyan-500/80 ring-2 ring-cyan-500/40 shadow-xl shadow-cyan-950/40 scale-[1.01]'
              : 'bg-[#091527]/90 border-slate-800 hover:border-slate-700 hover:bg-[#0a182c]'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                activeView === 'test_laptop'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/30'
                  : 'bg-slate-900 text-cyan-400 border border-slate-800 group-hover:border-cyan-500/40'
              }`}>
                <Search className="w-6 h-6" />
              </div>

              {activeView === 'test_laptop' && (
                <span className="px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/80 text-[11px] font-bold flex items-center gap-1">
                  <Check className="w-3 h-3 text-cyan-400" />
                  <span>القسم المحدد</span>
                </span>
              )}
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-black text-white group-hover:text-cyan-300 transition-colors">
                🔍 هل لابتوبك مناسب للقسم؟ (اختبر جهازك)
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                أدخل مواصفات حاسوبك الحالي أو الذي تنوي شراءه، وسيقوم النظام بتحليله خطوة بخطوة ومقارنته بالتوصية المعتمدة لطلاب القسم.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-bold text-cyan-400">
            <span>بدء الاختبار والتحليل الذاتي</span>
            <ChevronRight className="w-4 h-4 rotate-180 transform group-hover:-translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* 3. Global Storage Baseline Callout Notice */}
      <div className="max-w-4xl mx-auto px-2">
        <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-3.5 text-xs text-slate-300 shadow-sm">
          <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-cyan-200 flex items-center gap-2 flex-wrap">
              <span>التوصية المعتمدة للتخزين الداخلي لطلاب القسم:</span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-bold">
                1 TB NVMe SSD (1000 GB)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              نظراً لضخامة حزم برمجيات هندسة الإلكترونيات والاتصالات (مثل MATLAB, Ansys HFSS, Intel Quartus, Visual Studio) واحتياجها لمساحات تزيد عن 150GB إجمالاً بالإضافة للمراجع ومشاريع التخرج، فإن سعة 1TB هي الحد الموصى به لضمان الراحة طوال سنوات الدراسة الخمس دون الحاجة لمسح دوري للملفات.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW A: RECOMMENDED LAPTOPS FOR ECE STUDENTS                              */}
      {/* ========================================================================= */}
      {activeView === 'recommended_models' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Filter & Search Bar */}
          <div className="p-4 rounded-3xl bg-[#091527] border border-slate-800 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث باسم اللابتوب، المعالج، كرت الشاشة، الماركة..."
                className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-medium">
              {[
                { id: 'all', label: 'جميع الأجهزة' },
                { id: 'balanced', label: 'المتوازن الموصى به' },
                { id: 'budget', label: 'الاقتصادي والعملي' },
                { id: 'pro', label: 'الأداء الاحترافي' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedSuitabilityFilter(tab.id as any)}
                  className={`px-3 py-2 rounded-xl border whitespace-nowrap transition-colors min-h-[38px] ${
                    selectedSuitabilityFilter === tab.id
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Laptops Cards Grid */}
          {filteredLaptops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLaptops.map((laptop) => {
                return (
                  <div
                    key={laptop.id}
                    className={`rounded-3xl border overflow-hidden shadow-xl flex flex-col justify-between transition-all duration-300 hover:border-cyan-500/50 hover:shadow-cyan-950/30 ${
                      laptop.isRecommended
                        ? 'bg-gradient-to-b from-[#091a33] to-[#071324] border-cyan-500/40 ring-1 ring-cyan-500/30'
                        : 'bg-[#091527] border-slate-800/80'
                    }`}
                  >
                    {/* Laptop Card Top Header with Image */}
                    <div>
                      <div className="relative h-48 w-full bg-slate-900/80 overflow-hidden border-b border-slate-800">
                        <img
                          src={laptop.image}
                          alt={laptop.name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          onError={(e) => {
                            // Fallback image if remote url fails
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#091527] via-transparent to-black/30" />

                        {/* Badges Overlay */}
                        <div className="absolute top-3 right-3 left-3 flex items-center justify-between gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md ${
                            laptop.isRecommended
                              ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/60 shadow-md'
                              : 'bg-slate-900/90 text-slate-300 border-slate-700'
                          }`}>
                            {laptop.suitabilityBadge}
                          </span>

                          {laptop.priceEstimate && (
                            <span className="px-2.5 py-1 rounded-full bg-slate-950/90 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-bold">
                              {laptop.priceEstimate}
                            </span>
                          )}
                        </div>

                        {/* Title at bottom of image */}
                        <div className="absolute bottom-3 right-3 left-3">
                          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                            {laptop.brand}
                          </span>
                          <h4 className="text-base font-black text-white drop-shadow-md truncate">
                            {laptop.name}
                          </h4>
                        </div>
                      </div>

                      {/* Specs Matrix */}
                      <div className="p-5 space-y-4">
                        <div className="grid grid-cols-2 gap-2.5 text-xs">
                          {/* CPU */}
                          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-0.5">
                            <span className="text-[10px] text-slate-400 block">المعالج (CPU)</span>
                            <span className="font-bold text-white text-[11px] line-clamp-1" title={laptop.cpu}>
                              {laptop.cpu}
                            </span>
                          </div>

                          {/* RAM */}
                          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-0.5">
                            <span className="text-[10px] text-slate-400 block">الذاكرة (RAM)</span>
                            <span className="font-bold text-cyan-300 text-[11px]">
                              {laptop.ram}
                            </span>
                          </div>

                          {/* Storage */}
                          <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 space-y-0.5">
                            <span className="text-[10px] text-cyan-300 block font-bold">التخزين (Storage)</span>
                            <span className="font-black text-white text-[11px]">
                              {laptop.storage}
                            </span>
                          </div>

                          {/* GPU */}
                          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-0.5">
                            <span className="text-[10px] text-slate-400 block">كرت الشاشة (GPU)</span>
                            <span className="font-bold text-white text-[11px] line-clamp-1" title={laptop.gpu}>
                              {laptop.gpu}
                            </span>
                          </div>

                          {/* Screen */}
                          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-0.5">
                            <span className="text-[10px] text-slate-400 block">الشاشة</span>
                            <span className="font-medium text-slate-300 text-[11px]">
                              {laptop.screenSize}
                            </span>
                          </div>

                          {/* OS */}
                          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-0.5">
                            <span className="text-[10px] text-slate-400 block">نظام التشغيل</span>
                            <span className="font-medium text-slate-300 text-[11px]">
                              {laptop.os}
                            </span>
                          </div>
                        </div>

                        {/* Suitable Fields */}
                        {laptop.suitableFor && laptop.suitableFor.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                            <span className="text-[11px] font-bold text-slate-300 block">
                              مناسب لمجالات:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {laptop.suitableFor.map((field, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-md bg-slate-900 text-cyan-300 border border-slate-800 text-[10px] font-medium"
                                >
                                  {field}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Pros / Highlights */}
                        {laptop.pros && laptop.pros.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              أبرز الميزات:
                            </span>
                            <ul className="space-y-1 text-[11px] text-slate-300">
                              {laptop.pros.map((pro, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="text-emerald-400">•</span>
                                  <span>{pro}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action button: Test and Compare */}
                    <div className="p-5 pt-0">
                      <button
                        type="button"
                        onClick={() => {
                          // Pre-fill test specs based on this laptop model
                          setSpecs({
                            cpuBrand: laptop.cpu.toLowerCase().includes('ryzen') || laptop.cpu.toLowerCase().includes('amd') ? 'amd' : 'intel',
                            cpuTier: laptop.cpu.toLowerCase().includes('i7') ? 'i7' : laptop.cpu.toLowerCase().includes('i5') ? 'i5' : laptop.cpu.toLowerCase().includes('ryzen 7') ? 'ryzen7' : 'ryzen5',
                            cpuGen: 'gen13_plus',
                            ramGb: laptop.ram.includes('32') ? 32 : 16,
                            storageType: 'ssd_nvme',
                            storageCapacityGb: 1000,
                            gpuTier: laptop.gpu.toLowerCase().includes('4060') ? 'dedicated_mid_high' : laptop.gpu.toLowerCase().includes('rtx') ? 'dedicated_entry' : 'integrated',
                            screenSize: '15_6',
                            os: 'windows'
                          });
                          setActiveView('test_laptop');
                          setTestStep(2); // Jump straight to evaluation of this model
                          try { soundEffects.playClick(); } catch {}
                          window.scrollTo({ top: 350, behavior: 'smooth' });
                        }}
                        className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all flex items-center justify-center gap-2 min-h-[42px]"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>اختبر وحلل هذا النموذج بالتفصيل</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-[#091527] border border-slate-800 text-slate-400 space-y-3">
              <Laptop className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300">لم يتم العثور على أجهزة تطابق معايير البحث</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSuitabilityFilter('all');
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-cyan-300 border border-slate-700 text-xs"
              >
                إعادة ضبط الفلاتر
              </button>
            </div>
          )}

          {/* Department Baseline Specs Summary Card */}
          <div className="rounded-3xl bg-[#091527] border border-slate-800 p-6 sm:p-7 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-white font-black text-sm sm:text-base">
              <Award className="w-5 h-5 text-cyan-400" />
              <span>المواصفات القياسية الموصى بها رسمياً لطلاب هندسة الإلكترونيات والاتصالات</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-slate-400 block font-medium">الذاكرة الموصى بها:</span>
                <span className="text-cyan-300 font-bold font-mono text-sm">16 GB DDR4/DDR5</span>
                <span className="text-[10px] text-slate-500 block">(الحد الأدنى المقبول 8GB)</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 space-y-1 ring-1 ring-cyan-500/30">
                <span className="text-cyan-300 block font-bold">التخزين الموصى به:</span>
                <span className="text-white font-black font-mono text-sm">1 TB NVMe SSD</span>
                <span className="text-[10px] text-cyan-400 block">(لتجنب امتلاء قرص المحاكاة)</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-slate-400 block font-medium">المعالج الموصى به:</span>
                <span className="text-slate-200 font-bold text-xs">Core i5/i7 (11+) / Ryzen 5/7</span>
                <span className="text-[10px] text-slate-500 block">فئات H / HX / HS للمحاكاة</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-slate-400 block font-medium">نظام التشغيل المعتمد:</span>
                <span className="text-slate-200 font-bold text-xs">Windows 10 / 11 64-bit</span>
                <span className="text-[10px] text-slate-500 block">توافق 100% مع برامج القسم</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW B: TEST YOUR LAPTOP (STEP 1: INPUT SPECS -> STEP 2: EVALUATION)       */}
      {/* ========================================================================= */}
      {activeView === 'test_laptop' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Progress Indicator */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#091527] border border-slate-800 shadow-md flex items-center justify-between gap-4 max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500 text-slate-950 font-black flex items-center justify-center text-xs">
                {testStep} / 2
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">مرحلة التقييم:</span>
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  {testStep === 1 ? 'الخطوة الأولى: إدخال مواصفات اللابتوب' : 'الخطوة الثانية: نتيجة التقييم والتحليل ومقارنة التوصية'}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTestStep(1)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  testStep === 1
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1. المواصفات
              </button>
              <span className="text-slate-600">←</span>
              <button
                type="button"
                onClick={() => {
                  if (testStep === 1) handleProceedToEvaluation();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  testStep === 2
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-500'
                }`}
              >
                2. النتيجة والمطابقة
              </button>
            </div>
          </div>

          {/* STEP 1: Interactive Specs Input Form */}
          {testStep === 1 && (
            <div className="max-w-3xl mx-auto bg-[#091527] border border-slate-800/90 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6 animate-fadeIn">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="text-base font-black text-white">
                      حدد مواصفات جهازك (أو الجهاز المستهدف للشراء)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      اختر بدقة كل عنصر لتقييم مدى جاهزيته لمقررات ومخابر ومشاريع القسم.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetTest}
                  className="text-xs text-slate-400 hover:text-cyan-300 transition-colors py-1 px-2.5 rounded-lg border border-slate-800 hover:border-slate-700"
                >
                  استعادة الافتراضي
                </button>
              </div>

              {validationError && (
                <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center justify-between animate-shake">
                  <span>{validationError}</span>
                  <button onClick={() => setValidationError(null)} className="text-rose-400">✕</button>
                </div>
              )}

              <div className="space-y-5 text-xs">
                
                {/* 1. RAM Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <label className="font-bold text-slate-200 block">
                      1. الذاكرة العشوائية (RAM):
                    </label>
                    <span className="text-[11px] text-cyan-400 font-mono font-bold">16 GB موصى به للقسم</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { val: 4, label: '4 GB (ضعيف)' },
                      { val: 8, label: '8 GB (مقبول)' },
                      { val: 16, label: '16 GB (موصى به ⭐)' },
                      { val: 32, label: '32 GB (ممتاز)' },
                      { val: 64, label: '64 GB+ (فائق)' }
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => {
                          setSpecs({ ...specs, ramGb: item.val });
                          setValidationError(null);
                        }}
                        className={`py-3 px-2 text-center rounded-2xl font-medium transition-all min-h-[44px] flex items-center justify-center ${
                          specs.ramGb === item.val
                            ? 'bg-cyan-500/20 text-cyan-300 border-2 border-cyan-500 shadow-md font-bold'
                            : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Storage Capacity (With 1TB explicitly recommended) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <label className="font-bold text-slate-200 block">
                      2. سعة وسيط التخزين الداخلي:
                    </label>
                    <span className="text-[11px] text-emerald-400 font-mono font-bold">1 TB المعتمد رسمياً لطلاب القسم</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { val: 256, label: '256 GB (ضيق جداً)' },
                      { val: 512, label: '512 GB (كافٍ للبدايات)' },
                      { val: 1000, label: '1 TB (موصى به للقسم ⭐)' },
                      { val: 2000, label: '2 TB+ (سعة فائقة)' }
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => {
                          setSpecs({ ...specs, storageCapacityGb: item.val });
                          setValidationError(null);
                        }}
                        className={`py-3 px-2 text-center rounded-2xl font-medium transition-all min-h-[44px] flex items-center justify-center ${
                          specs.storageCapacityGb === item.val
                            ? 'bg-cyan-500/20 text-cyan-300 border-2 border-cyan-500 shadow-md font-bold'
                            : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Storage Type */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-200 block">
                    3. نوع وحدة التخزين (Storage Type):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'ssd_nvme', label: 'NVMe M.2 SSD (فائق السرعة - موصى به ⭐)' },
                      { id: 'ssd_sata', label: 'SATA 2.5" SSD (سريع وجيد)' },
                      { id: 'hdd', label: 'HDD ميكانيكي تقليدي (بطيء - لا يُنصح به)' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSpecs({ ...specs, storageType: item.id as any })}
                        className={`py-3 px-2 text-center rounded-2xl font-medium transition-all min-h-[44px] flex items-center justify-center ${
                          specs.storageType === item.id
                            ? 'bg-cyan-500/20 text-cyan-300 border-2 border-cyan-500 shadow-md font-bold'
                            : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. CPU Brand & Tier */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-200 block">
                    4. فئة المعالج (CPU Tier):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { brand: 'intel', tier: 'i5', label: 'Intel Core i5 (موصى به)' },
                      { brand: 'intel', tier: 'i7', label: 'Intel Core i7 (أداء عالي)' },
                      { brand: 'amd', tier: 'ryzen5', label: 'AMD Ryzen 5 (موصى به)' },
                      { brand: 'amd', tier: 'ryzen7', label: 'AMD Ryzen 7 (أداء عالي)' },
                      { brand: 'intel', tier: 'i9', label: 'Intel Core i9 (احترافي)' },
                      { brand: 'amd', tier: 'ryzen9', label: 'AMD Ryzen 9 (احترافي)' },
                      { brand: 'intel', tier: 'i3', label: 'Intel Core i3 (اقتصادي)' },
                      { brand: 'apple', tier: 'appleM', label: 'Apple Silicon (M1/M2/M3)' }
                    ].map((item) => (
                      <button
                        key={item.tier}
                        type="button"
                        onClick={() => {
                          setSpecs({ 
                            ...specs, 
                            cpuBrand: item.brand as any, 
                            cpuTier: item.tier as any,
                            cpuGen: item.brand === 'apple' ? 'apple_silicon' : specs.cpuGen,
                            os: item.brand === 'apple' ? 'macos' : specs.os
                          });
                          setValidationError(null);
                        }}
                        className={`py-2.5 px-2 text-center rounded-2xl font-medium transition-all min-h-[44px] flex items-center justify-center ${
                          specs.cpuTier === item.tier
                            ? 'bg-cyan-500/20 text-cyan-300 border-2 border-cyan-500 shadow-md font-bold'
                            : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CPU Generation */}
                {specs.cpuBrand !== 'apple' && (
                  <div className="space-y-2">
                    <label className="font-bold text-slate-300 block">
                      جيل المعالج (Generation):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { gen: 'gen13_plus', label: 'حديث جداً (13 / 14 أو AMD 7000+)' },
                        { gen: 'gen11_12', label: 'متوازن وحديث (11 / 12 أو AMD 5000)' },
                        { gen: 'gen8_10', label: 'متوسط (الجيل 8 إلى 10)' }
                      ].map((item) => (
                        <button
                          key={item.gen}
                          type="button"
                          onClick={() => setSpecs({ ...specs, cpuGen: item.gen as any })}
                          className={`py-2.5 px-2 text-center rounded-xl font-medium transition-all min-h-[40px] flex items-center justify-center ${
                            specs.cpuGen === item.gen
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 font-bold'
                              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. GPU Tier */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-200 block">
                    5. كرت الشاشة (GPU):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'integrated', label: 'مدمج (Intel UHD / Iris Xe / AMD Radeon)' },
                      { id: 'dedicated_entry', label: 'منفصل اقتصادي (RTX 3050 / 2050 / GTX)' },
                      { id: 'dedicated_mid_high', label: 'منفصل قوي (RTX 4060 / 4070 فأعلى)' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSpecs({ ...specs, gpuTier: item.id as any })}
                        className={`py-3 px-2 text-center rounded-2xl font-medium transition-all min-h-[44px] flex items-center justify-center ${
                          specs.gpuTier === item.id
                            ? 'bg-cyan-500/20 text-cyan-300 border-2 border-cyan-500 shadow-md font-bold'
                            : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. Screen Size */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-200 block">
                    6. حجم الشاشة:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '13_14', label: '13 - 14 بوصة (خفيف وسهل الحمل)' },
                      { id: '15_6', label: '15.6 بوصة (الحجم القياسي ⭐)' },
                      { id: '16_17', label: '16 - 17 بوصة (مساحة عرض واسعة)' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSpecs({ ...specs, screenSize: item.id as any })}
                        className={`py-2.5 px-2 text-center rounded-2xl font-medium transition-all min-h-[44px] flex items-center justify-center ${
                          specs.screenSize === item.id
                            ? 'bg-cyan-500/20 text-cyan-300 border-2 border-cyan-500 shadow-md font-bold'
                            : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 7. Operating System */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <label className="font-bold text-slate-200 block">
                      7. نظام التشغيل (OS):
                    </label>
                    <span className="text-[11px] text-amber-400 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      برمجيات القسم (Quartus, PSpice, Multisim) مخصصة لنظام Windows
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'windows', label: 'Windows 10 / 11 (الأساسي والمعتمد ⭐)' },
                      { id: 'macos', label: 'macOS (أجهزة Mac - يحتاج نظام وهمي)' },
                      { id: 'linux', label: 'Linux (Ubuntu / Fedora)' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSpecs({ ...specs, os: item.id as any })}
                        className={`py-3 px-2 text-center rounded-2xl font-medium transition-all min-h-[44px] flex items-center justify-center ${
                          specs.os === item.id
                            ? 'bg-cyan-500/20 text-cyan-300 border-2 border-cyan-500 shadow-md font-bold'
                            : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Next Button Action */}
              <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-400 text-center sm:text-right">
                  اضغط على &quot;التالي&quot; لحساب نسبة الملاءمة وتحليل البرمجيات الهندسية.
                </div>

                <button
                  type="button"
                  onClick={handleProceedToEvaluation}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-cyan-950 active:scale-95 min-h-[46px]"
                >
                  <span>التالي (تحليل ومطابقة المواصفات)</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Rich Evaluation & Department Comparison Result */}
          {testStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Top Result Card with Score Ring */}
              <div className="rounded-3xl bg-gradient-to-b from-[#0a1b35] to-[#081527] border border-cyan-500/50 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
                  
                  {/* Left: Animated Score Circle */}
                  <div className="flex flex-col items-center justify-center shrink-0">
                    <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
                      {/* SVG Circular Ring */}
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                        <circle
                          cx="60"
                          cy="60"
                          r="52"
                          stroke="currentColor"
                          strokeWidth="10"
                          className="text-slate-800/80"
                          fill="transparent"
                        />
                        <circle
                          cx="60"
                          cy="60"
                          r="52"
                          stroke="currentColor"
                          strokeWidth="10"
                          strokeDasharray={326}
                          strokeDashoffset={326 - (326 * evaluation.scorePercentage) / 100}
                          strokeLinecap="round"
                          className={`transition-all duration-1000 ${
                            evaluation.scorePercentage >= 85
                              ? 'text-emerald-400'
                              : evaluation.scorePercentage >= 70
                              ? 'text-cyan-400'
                              : 'text-amber-400'
                          }`}
                          fill="transparent"
                        />
                      </svg>

                      {/* Percentage in center */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                          {evaluation.scorePercentage}%
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                          نسبة الملاءمة
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Badge, Title & Summary */}
                  <div className="flex-1 text-center md:text-right space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md bg-slate-900/80 text-cyan-300 border-cyan-500/40">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      <span>{evaluation.badgeAr}</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {evaluation.titleAr}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                      {evaluation.summaryAr}
                    </p>

                    {/* Quick Specs summary pill */}
                    <div className="pt-2 flex items-center justify-center md:justify-start gap-2 flex-wrap text-[11px] text-slate-400 font-mono">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                        RAM: {specs.ramGb}GB
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                        تخزين: {specs.storageCapacityGb >= 1000 ? `${specs.storageCapacityGb / 1000}TB` : `${specs.storageCapacityGb}GB`} ({specs.storageType})
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                        معالج: {specs.cpuTier}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                        نظام: {specs.os}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths & Attention Points (2-Column Cards) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="p-5 sm:p-6 rounded-3xl bg-[#091527] border border-emerald-900/50 shadow-xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>نقاط القوة والميزات في جهازك:</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {evaluation.suitableFor.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 p-2 rounded-xl bg-emerald-950/20 border border-emerald-900/30">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Attention Points / Limitations */}
                <div className="p-5 sm:p-6 rounded-3xl bg-[#091527] border border-amber-900/50 shadow-xl space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>نقاط تحتاج الانتباه والملاحظات:</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {evaluation.limitingFor.length > 0 ? (
                      evaluation.limitingFor.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 p-2 rounded-xl bg-amber-950/20 border border-amber-900/30">
                          <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
                        لا توجد نقاط ضعف بارزة! مواصفاتك ممتازة وتغطي كافة متطلبات الدراسة.
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* 🎯 Suitable Fields & Engineering Software */}
              {evaluation.suitableFields.length > 0 && (
                <div className="p-5 sm:p-6 rounded-3xl bg-[#091527] border border-slate-800 shadow-xl space-y-3">
                  <div className="flex items-center gap-2 text-cyan-300 font-black text-sm">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>المجالات والبرمجيات التي يستطيع جهازك التعامل معها بكفاءة:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {evaluation.suitableFields.map((field, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 text-xs font-bold"
                      >
                        ✓ {field}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 🧪 SIDE-BY-SIDE COMPARISON TABLE (Your Laptop vs Department Baseline) */}
              <div className="p-5 sm:p-7 rounded-3xl bg-[#091527] border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-cyan-400" />
                    <h4 className="text-sm sm:text-base font-black text-white">
                      مقارنة مباشرة: مواصفات جهازك مقابل التوصية المعتمدة لطلاب القسم
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Official Department Baseline
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-2.5 px-3 font-bold">عنصر العتاد</th>
                        <th className="py-2.5 px-3 font-bold">مواصفات جهازك</th>
                        <th className="py-2.5 px-3 font-bold text-cyan-300">التوصية المعتمدة لطلاب القسم</th>
                        <th className="py-2.5 px-3 font-bold">التقييم والملاحظة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {evaluation.comparison.map((item, idx) => {
                        return (
                          <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                            <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                              {item.aspect}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-slate-200 whitespace-nowrap">
                              {item.userValue}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-cyan-300 whitespace-nowrap">
                              {item.recommendedValue}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                                  item.status === 'optimal'
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                                    : item.status === 'pass'
                                    ? 'bg-blue-950 text-blue-300 border border-blue-800/60'
                                    : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                                }`}>
                                  {item.status === 'optimal' ? 'ممتاز ⭐' : item.status === 'pass' ? 'مقبول ✓' : 'انتبه ⚠️'}
                                </span>
                                {item.note && (
                                  <span className="text-[11px] text-slate-400">
                                    {item.note}
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Software Compatibility Breakdown */}
              <div className="p-5 sm:p-6 rounded-3xl bg-[#091527] border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      توافق برمجيات القسم الأساسية مع هذا العتاد
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-900 text-cyan-300 border border-slate-800">
                    {smoothCount} برامج تعمل بسلاسة • {heavyCount} قد تتطلب عتاداً أعلى
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                  {softwareCompatibility.map((sw) => (
                    <div
                      key={sw.id}
                      className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between gap-1 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white truncate">{sw.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${
                          sw.compatibilityStatus === 'smooth'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : sw.compatibilityStatus === 'acceptable'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800/60'
                            : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                        }`}>
                          {sw.compatibilityStatus === 'smooth' ? 'سلس' : sw.compatibilityStatus === 'acceptable' ? 'مقبول' : 'قد يعاني'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 line-clamp-1">
                        {sw.compatibilityNote}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="p-5 rounded-3xl bg-[#091527] border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Edit Specs Button */}
                  <button
                    type="button"
                    onClick={handleBackToForm}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[44px]"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>تعديل المواصفات</span>
                  </button>

                  {/* Reset Test Button */}
                  <button
                    type="button"
                    onClick={handleResetTest}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors min-h-[44px]"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>إعادة الاختبار</span>
                  </button>

                  {/* Switch to Recommended Models */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveView('recommended_models');
                      try { soundEffects.playClick(); } catch {}
                    }}
                    className="px-4 py-2.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[44px]"
                  >
                    <Laptop className="w-4 h-4" />
                    <span>شاهد اللابتوبات الموصى بها لطلاب القسم ←</span>
                  </button>
                </div>

                {/* Save to Student Profile Button */}
                <button
                  type="button"
                  onClick={handleSaveSpecs}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-950 transition-all min-h-[44px] active:scale-95"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تم حفظ المواصفات في ملفك بنجاح!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>حفظ المواصفات والتقييم في ملفي</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
