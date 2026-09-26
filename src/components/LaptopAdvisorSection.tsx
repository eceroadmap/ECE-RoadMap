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
  Layers,
  Sparkles,
  ChevronRight,
  Sliders,
  ArrowUpRight
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
  OperatingSystem
} from '../types/laptop';
import { 
  evaluateLaptop, 
  DEFAULT_LAPTOP_SPECS, 
  DEFAULT_DEPARTMENT_SPECS 
} from '../data/laptopRules';
import { 
  useLiveRecommendedLaptops, 
  useLiveDepartmentSpecs 
} from '../services/laptopAdvisorService';
import { useStudentState } from '../services/useStudentState';
import { SOFTWARE_DATA } from '../data/software';
import { soundEffects } from '../utils/soundEffects';

type AdvisorViewMode = 'landing' | 'recommended_models' | 'test_laptop';

export const LaptopAdvisorSection: React.FC = () => {
  const { profile, savedLaptop, saveLaptop, removeSavedLaptop } = useStudentState();
  const liveLaptops = useLiveRecommendedLaptops();
  const deptSpecs = useLiveDepartmentSpecs();

  // Landing selection screen is the first page ('landing')
  const [activeView, setActiveView] = useState<AdvisorViewMode>('landing');

  // Multi-step Flow for the Laptop Test (1: Input Specs -> 2: Evaluation Result)
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

  // Sync saved laptop from profile if available
  useEffect(() => {
    if (savedLaptop?.specs) {
      setSpecs(savedLaptop.specs);
    }
  }, [savedLaptop]);

  // Evaluate the current specs
  const evaluation: LaptopEvaluationResult = useMemo(() => {
    return evaluateLaptop(specs, deptSpecs);
  }, [specs, deptSpecs]);

  // Step progression handler
  const handleProceedToEvaluation = () => {
    if (!specs.ramGb) {
      setValidationError('يرجى تحديد سعة الذاكرة العشوائية (RAM)');
      return;
    }
    if (!specs.storageCapacityGb) {
      setValidationError('يرجى تحديد سعة وسيط التخزين');
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
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  const handleBackToForm = () => {
    setTestStep(1);
    window.scrollTo({ top: 150, behavior: 'smooth' });
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

      if (isHeavyEM) {
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
        const matchFields = lap.suitableFor?.some(f => f.toLowerCase().includes(q));
        return matchName || matchBrand || matchCpu || matchGpu || matchFields;
      }
      return true;
    });
  }, [liveLaptops, selectedSuitabilityFilter, searchQuery]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto w-full overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200" dir="rtl">
      
      {/* ========================================================================= */}
      {/* 1. FIRST SCREEN: LANDING & CHOICE SELECTION                              */}
      {/* ========================================================================= */}
      {activeView === 'landing' && (
        <div className="space-y-10 sm:space-y-12 py-4 sm:py-8 animate-fadeIn">
          
          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto px-4 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono shadow-md">
              <Laptop className="w-4 h-4 text-cyan-400" />
              <span>مستشار العتاد • ECE Laptop Advisor</span>
            </div>
            
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              مستشار لابتوب هندسة الاتصالات والإلكترونيات
            </h2>
            
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
              اختر المسار الذي ترغب به: استعراض الأجهزة المقترحة والمطابقة للقسم، أو اختبار مواصفات لابتوبك الحالي ومعرفة مدى ملاءمته للدراسة.
            </p>
          </div>

          {/* Two Big Main Choice Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto px-4">
            
            {/* Choice 1: Recommended Laptops */}
            <div
              onClick={() => {
                setActiveView('recommended_models');
                try { soundEffects.playClick(); } catch {}
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="p-7 sm:p-8 rounded-3xl bg-gradient-to-b from-[#091a33] to-[#071324] border border-cyan-500/40 hover:border-cyan-400/80 ring-1 ring-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-950/50 transition-all duration-300 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500 text-slate-950 font-black flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-transform">
                  <Laptop className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-cyan-300 transition-colors">
                    💻 اللابتوبات الموصى بها لطلاب القسم
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                    استعرض نماذج أجهزة لابتوب مقترحة ومناسبة لدراسة هندسة الإلكترونيات والاتصالات ومشاريع التخرج، مع مواصفاتها ومجالات عملها.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs sm:text-sm font-bold text-cyan-400">
                <span>استعراض الأجهزة المقترحة ({liveLaptops.length} أجهزة)</span>
                <ChevronRight className="w-5 h-5 rotate-180 transform group-hover:-translate-x-1.5 transition-transform" />
              </div>
            </div>

            {/* Choice 2: Test Your Laptop */}
            <div
              onClick={() => {
                setActiveView('test_laptop');
                setTestStep(1);
                try { soundEffects.playClick(); } catch {}
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="p-7 sm:p-8 rounded-3xl bg-gradient-to-b from-[#091a33] to-[#071324] border border-cyan-500/40 hover:border-cyan-400/80 ring-1 ring-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-950/50 transition-all duration-300 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500 text-slate-950 font-black flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-transform">
                  <Search className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-cyan-300 transition-colors">
                    🔍 هل لابتوبك مناسب للقسم؟ (اختبر جهازك)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                    لديك لابتوب بالفعل أو تنوي الشراء؟ أدخل مواصفات جهازك خطوة بخطوة واعرف مدى ملاءمته للدراسة والمشاريع ومقارنته بالتوصية.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs sm:text-sm font-bold text-cyan-400">
                <span>بدء اختبار ومطابقة لابتوبك</span>
                <ChevronRight className="w-5 h-5 rotate-180 transform group-hover:-translate-x-1.5 transition-transform" />
              </div>
            </div>

          </div>

          {/* Saved Specs Preview (if student already tested and saved their laptop) */}
          {savedLaptop && (
            <div className="max-w-4xl mx-auto px-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-800/60 flex items-center justify-center shrink-0">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">مواصفات جهازك المحفوظة في ملفك:</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      RAM {savedLaptop.specs.ramGb}GB • {savedLaptop.specs.storageCapacityGb >= 1000 ? `${savedLaptop.specs.storageCapacityGb / 1000}TB` : `${savedLaptop.specs.storageCapacityGb}GB`} • {savedLaptop.specs.cpuTier}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSpecs(savedLaptop.specs);
                    setActiveView('test_laptop');
                    setTestStep(2);
                    try { soundEffects.playClick(); } catch {}
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-colors"
                >
                  عرض تقييم ومطابقة جهازك المحفوظ ←
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CHOICE 1: RECOMMENDED LAPTOPS FOR ECE STUDENTS                         */}
      {/* ========================================================================= */}
      {activeView === 'recommended_models' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Top Back Navigation Bar */}
          <div className="flex items-center justify-between gap-4 pb-2">
            <button
              type="button"
              onClick={() => {
                setActiveView('landing');
                try { soundEffects.playClick(); } catch {}
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>← العودة لاختيار القسم</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveView('test_laptop');
                setTestStep(1);
                try { soundEffects.playClick(); } catch {}
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>اختبر لابتوبك بدلاً من ذلك</span>
            </button>
          </div>

          {/* Section Header */}
          <div className="p-6 rounded-3xl bg-[#091527] border border-slate-800 shadow-xl space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
              <Laptop className="w-4 h-4" />
              <span>الخيار الأول</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              اللابتوبات الموصى بها لطلاب هندسة الاتصالات والإلكترونيات
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              نماذج مختارة ومناسبة لمقررات المحاكاة (MATLAB, Ansys HFSS, Quartus, Visual Studio) ومشاريع التخرج.
            </p>
          </div>

          {/* Filter & Search Bar */}
          <div className="p-4 rounded-3xl bg-[#091527] border border-slate-800 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث باسم اللابتوب، المعالج، الماركة..."
                className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

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
                  className={`px-3.5 py-2 rounded-xl border whitespace-nowrap transition-colors min-h-[38px] ${
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
              {filteredLaptops.map((laptop) => (
                <div
                  key={laptop.id}
                  className={`rounded-3xl border overflow-hidden shadow-xl flex flex-col justify-between transition-all duration-300 hover:border-cyan-500/50 hover:shadow-cyan-950/30 ${
                    laptop.isRecommended
                      ? 'bg-gradient-to-b from-[#091a33] to-[#071324] border-cyan-500/40 ring-1 ring-cyan-500/30'
                      : 'bg-[#091527] border-slate-800/80'
                  }`}
                >
                  <div>
                    {/* Laptop Image */}
                    <div className="relative h-48 w-full bg-slate-900 overflow-hidden border-b border-slate-800">
                      <img
                        src={laptop.image}
                        alt={laptop.name}
                        className="w-full h-full object-cover object-center"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#091527] via-transparent to-black/30" />

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

                      <div className="absolute bottom-3 right-3 left-3">
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                          {laptop.brand}
                        </span>
                        <h4 className="text-base font-black text-white drop-shadow-md truncate">
                          {laptop.name}
                        </h4>
                      </div>
                    </div>

                    {/* Specs Grid */}
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-0.5">
                          <span className="text-[10px] text-slate-400 block">المعالج CPU</span>
                          <span className="font-bold text-white text-[11px] line-clamp-1">{laptop.cpu}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-0.5">
                          <span className="text-[10px] text-slate-400 block">الذاكرة RAM</span>
                          <span className="font-bold text-cyan-300 text-[11px]">{laptop.ram}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 space-y-0.5">
                          <span className="text-[10px] text-cyan-300 block font-bold">التخزين Storage</span>
                          <span className="font-black text-white text-[11px]">{laptop.storage}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-0.5">
                          <span className="text-[10px] text-slate-400 block">كرت الشاشة GPU</span>
                          <span className="font-bold text-white text-[11px] line-clamp-1">{laptop.gpu}</span>
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

                      {/* Pros */}
                      {laptop.pros && laptop.pros.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            الميزات:
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

                  {/* Card Action Button */}
                  <div className="p-5 pt-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSpecs({
                          cpuBrand: laptop.cpu.toLowerCase().includes('ryzen') || laptop.cpu.toLowerCase().includes('amd') ? 'amd' : 'intel',
                          cpuTier: laptop.cpu.toLowerCase().includes('i7') ? 'i7' : laptop.cpu.toLowerCase().includes('i5') ? 'i5' : laptop.cpu.toLowerCase().includes('ryzen 7') ? 'ryzen7' : 'ryzen5',
                          cpuGen: 'gen13_plus',
                          ramGb: laptop.ram.includes('32') ? 32 : 16,
                          storageType: 'ssd_nvme',
                          storageCapacityGb: 1000,
                          gpuTier: laptop.gpu.toLowerCase().includes('منفصل') ? 'dedicated_entry' : 'integrated',
                          os: 'windows'
                        });
                        setActiveView('test_laptop');
                        setTestStep(2);
                        try { soundEffects.playClick(); } catch {}
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all flex items-center justify-center gap-2 min-h-[42px]"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>اختبر وحلل هذا النموذج</span>
                    </button>
                  </div>
                </div>
              ))}
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CHOICE 2: TEST YOUR LAPTOP (STEP 1: FORM -> STEP 2: EVALUATION)         */}
      {/* ========================================================================= */}
      {activeView === 'test_laptop' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Top Navigation & Step Indicator */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#091527] border border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveView('landing');
                  try { soundEffects.playClick(); } catch {}
                }}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                title="العودة لاختيار القسم"
              >
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="w-8 h-8 rounded-xl bg-cyan-500 text-slate-950 font-black flex items-center justify-center text-xs shrink-0">
                {testStep} / 2
              </div>
              
              <div>
                <span className="text-[10px] text-slate-400 block">اختبار ومطابقة اللابتوب:</span>
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  {testStep === 1 ? 'الخطوة 1: تحديد مواصفات الجهاز' : 'الخطوة 2: نتيجة التقييم والتحليل'}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setTestStep(1)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
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
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                  testStep === 2
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-500'
                }`}
              >
                2. النتيجة والمقارنة
              </button>
            </div>
          </div>

          {/* STEP 1: Interactive Form (Simplified & Clean) */}
          {testStep === 1 && (
            <div className="max-w-3xl mx-auto bg-[#091527] border border-slate-800/90 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6 animate-fadeIn">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    أدخل مواصفات جهازك الحالي أو المستهدف
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    اختر المواصفات الأساسية لجهازك وسنحلل مدى ملاءمته لمقررات القسم.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetTest}
                  className="text-xs text-slate-400 hover:text-cyan-300 transition-colors py-1.5 px-3 rounded-xl border border-slate-800 hover:border-slate-700 shrink-0"
                >
                  استعادة الافتراضي
                </button>
              </div>

              {validationError && (
                <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center justify-between">
                  <span>{validationError}</span>
                  <button onClick={() => setValidationError(null)} className="text-rose-400">✕</button>
                </div>
              )}

              <div className="space-y-5 text-xs">
                
                {/* 1. RAM Selection (Clean without stars) */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-200 block">
                    1. الذاكرة العشوائية (RAM):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { val: 4, label: '4 GB' },
                      { val: 8, label: '8 GB' },
                      { val: 16, label: '16 GB' },
                      { val: 32, label: '32 GB' },
                      { val: 64, label: '64 GB+' }
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

                {/* 2. Storage Capacity (Clean without stars) */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-200 block">
                    2. سعة وسيط التخزين الداخلي:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { val: 256, label: '256 GB' },
                      { val: 512, label: '512 GB' },
                      { val: 1000, label: '1 TB' },
                      { val: 2000, label: '2 TB+' }
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
                      { id: 'ssd_nvme', label: 'NVMe SSD (سريع جداً)' },
                      { id: 'ssd_sata', label: 'SATA SSD (سريع)' },
                      { id: 'hdd', label: 'HDD ميكانيكي تقليدي' }
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

                {/* 4. CPU Selection */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-200 block">
                    4. فئة المعالج (CPU):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { brand: 'intel', tier: 'i5', label: 'Intel Core i5' },
                      { brand: 'intel', tier: 'i7', label: 'Intel Core i7' },
                      { brand: 'amd', tier: 'ryzen5', label: 'AMD Ryzen 5' },
                      { brand: 'amd', tier: 'ryzen7', label: 'AMD Ryzen 7' },
                      { brand: 'intel', tier: 'i9', label: 'Intel Core i9' },
                      { brand: 'amd', tier: 'ryzen9', label: 'AMD Ryzen 9' },
                      { brand: 'intel', tier: 'i3', label: 'Intel Core i3' },
                      { brand: 'apple', tier: 'appleM', label: 'Apple Silicon (M)' }
                    ].map((item) => (
                      <button
                        key={item.tier}
                        type="button"
                        onClick={() => {
                          setSpecs({ 
                            ...specs, 
                            cpuBrand: item.brand as any, 
                            cpuTier: item.tier as any,
                            cpuGen: item.brand === 'apple' ? 'apple_silicon' : specs.cpuGen
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
                        { gen: 'gen13_plus', label: 'معالج حديث (الجيل 11 أو أحدث)' },
                        { gen: 'gen8_10', label: 'معالج متوسط (الجيل 8 إلى 10)' },
                        { gen: 'older', label: 'معالج قديم' }
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

                {/* 5. Simplified GPU Selection (No RTX/brand restrictions) */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-200 block">
                    5. كرت الشاشة (GPU):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'integrated', label: 'كرت شاشة مدمج (Integrated GPU)' },
                      { id: 'dedicated_entry', label: 'كرت شاشة منفصل (Dedicated GPU)' },
                      { id: 'apple_gpu', label: 'كرت شاشة مدمج من Apple' }
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

              </div>

              {/* Next Button */}
              <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-400 text-center sm:text-right">
                  اضغط على &quot;التالي&quot; للانتقال لشاشة تقييم الجهاز ومطابقته.
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

          {/* STEP 2: Evaluation Screen */}
          {testStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Score Card with Progress Ring */}
              <div className="rounded-3xl bg-gradient-to-b from-[#0a1b35] to-[#081527] border border-cyan-500/50 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
                  
                  {/* Circular Score Meter */}
                  <div className="flex flex-col items-center justify-center shrink-0">
                    <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
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

                  {/* Summary & Details */}
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
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths & Attention Points (2 Columns) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        لا توجد ملاحظات بارزة! مواصفاتك ممتازة وتغطي كافة متطلبات الدراسة.
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Suitable Fields */}
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

              {/* Comparison Table (Your Laptop vs Department Baseline) */}
              <div className="p-5 sm:p-7 rounded-3xl bg-[#091527] border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-cyan-400" />
                    <h4 className="text-sm sm:text-base font-black text-white">
                      مقارنة مباشرة: مواصفات جهازك مقابل التوصية المعتمدة لطلاب القسم
                    </h4>
                  </div>
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
                      {evaluation.comparison.map((item, idx) => (
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
                                {item.status === 'optimal' ? 'ممتاز' : item.status === 'pass' ? 'مقبول' : 'انتبه'}
                              </span>
                              {item.note && (
                                <span className="text-[11px] text-slate-400">
                                  {item.note}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="p-5 rounded-3xl bg-[#091527] border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleBackToForm}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[44px]"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>تعديل المواصفات</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetTest}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors min-h-[44px]"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>إعادة الاختبار</span>
                  </button>

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
