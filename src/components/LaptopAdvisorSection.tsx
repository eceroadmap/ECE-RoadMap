import React, { useState, useEffect } from 'react';
import { 
  Laptop, 
  Cpu, 
  HardDrive, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Info, 
  Save, 
  Trash2, 
  RotateCcw,
  Check,
  GraduationCap
} from 'lucide-react';
import { LaptopSpecs, LaptopEvaluationResult } from '../types';
import { evaluateLaptop, DEFAULT_LAPTOP_SPECS, RECOMMENDED_ARCHETYPES } from '../data/laptopRules';
import { useStudentState } from '../services/useStudentState';
import { SOFTWARE_DATA } from '../data/software';

export const LaptopAdvisorSection: React.FC = () => {
  const { profile, savedLaptop, saveLaptop, removeSavedLaptop } = useStudentState();
  const [specs, setSpecs] = useState<LaptopSpecs>(() => {
    if (savedLaptop?.specs) {
      return savedLaptop.specs;
    }
    return DEFAULT_LAPTOP_SPECS;
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // If saved laptop exists and user hasn't modified, sync
  useEffect(() => {
    if (savedLaptop?.specs) {
      setSpecs(savedLaptop.specs);
    }
  }, [savedLaptop]);

  const evaluation: LaptopEvaluationResult = evaluateLaptop(specs);

  const handleSaveSpecs = () => {
    saveLaptop(specs, evaluation);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetToDefault = () => {
    setSpecs(DEFAULT_LAPTOP_SPECS);
  };

  // Evaluate Software Compatibility based on current specs
  const softwareCompatibility = SOFTWARE_DATA.map((sw) => {
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

  const smoothCount = softwareCompatibility.filter((s) => s.compatibilityStatus === 'smooth').length;
  const acceptableCount = softwareCompatibility.filter((s) => s.compatibilityStatus === 'acceptable').length;
  const heavyCount = softwareCompatibility.filter((s) => s.compatibilityStatus === 'heavy').length;

  // Year Readiness Analysis
  const getYearReadiness = () => {
    const year = profile.currentYear;
    if (!year) {
      return {
        title: 'حدد سنتك الدراسية',
        desc: 'حدد سنتك الدراسية في نافذة "رحلتي" لتحصل على تقييم مخصص لمتطلبات سنتك الحالية بدقة.',
        status: 'neutral' as const
      };
    }

    if (year === 1) {
      if (specs.ramGb >= 8 && specs.storageType !== 'hdd') {
        return {
          title: 'ممتاز وجاهز للسنة الأولى',
          desc: 'السنة الأولى تركز على المواد التأسيسية وأوفيس والبرمجة الأولية، وجهازك يغطي هذه المتطلبات بأريحية كاملة.',
          status: 'ready' as const
        };
      }
      return {
        title: 'كافٍ للسنة الأولى',
        desc: 'السنة الأولى لا تتطلب برامج محاكاة ثقيلة، ولكن احرص على ترقية الرام وSSD لاحقاً قبل الانتقال للسنوات المتقدمة.',
        status: 'moderate' as const
      };
    }

    if (year === 2) {
      if (specs.ramGb >= 8 && specs.storageType !== 'hdd') {
        return {
          title: 'جاهز تماماً للسنة الثانية',
          desc: 'مناسب لبيئة Visual Studio (C#) ومحاكيات الدارات الأساسية (Multisim, Proteus).',
          status: 'ready' as const
        };
      }
      return {
        title: 'مقبول مع بعض البطء في Visual Studio',
        desc: 'ننصح بتحديث التخزين إلى SSD لتسريع إقلاع بيئة فيجوال ستوديو ومشاريع البرمجة.',
        status: 'moderate' as const
      };
    }

    if (year === 3) {
      if (specs.ramGb >= 16 && specs.storageType !== 'hdd') {
        return {
          title: 'جاهز بامتياز للسنة الثالثة',
          desc: 'السنة الثالثة تبدأ فيها برامج FPGA وQuartus Prime ومودل سيم، وجهازك يمتلك العتاد الكافي لتشغيلها بسلاسة.',
          status: 'ready' as const
        };
      }
      return {
        title: 'يحتاج ترقية للتعامل السلس مع Quartus',
        desc: 'بيئة Intel Quartus Prime ومحاكاة VHDL تحتاج ذاكرة 16GB SSD للترجمة والتوليد دون تجمد.',
        status: 'needs_upgrade' as const
      };
    }

    if (year === 4 || year === 5 || year === 'graduate') {
      if (specs.ramGb >= 16 && specs.storageType === 'ssd_nvme' && specs.gpuTier !== 'integrated') {
        return {
          title: 'عتاد احترافي لمشاريع التخرج والسنوات المتقدمة',
          desc: 'جاهز بكفاءة عالية لمحاكاة HFSS الكهرطيسية ثلاثية الأبعاد، معالجة الإشارة DSP، ومشاريع التخرج الكبيرة.',
          status: 'ready' as const
        };
      } else if (specs.ramGb >= 16) {
        return {
          title: 'جيد جداً مع ملاحظة بطاقات العرض ثلاثية الأبعاد',
          desc: 'الجهاز كافٍ لمعظم المقررات، ولكن محاكاة الهوائيات ثلاثية الأبعاد في HFSS قد تستغرق وقتاً أطول بدون كرت شاشة منفصل.',
          status: 'moderate' as const
        };
      }
      return {
        title: 'يتطلب ترقية لمشاريع التخرج والسنوات المتقدمة',
        desc: 'السنتان الرابعة والخامسة تتطلبان 16GB RAM على الأقل وقرص SSD للتعامل مع HFSS وMATLAB المتقدم ومشاريع التخرج.',
        status: 'needs_upgrade' as const
      };
    }

    return {
      title: 'تقييم عام للمواصفات',
      desc: 'يمكنك مراجعة نقاط القوة والضعف في العمود المقابل.',
      status: 'neutral' as const
    };
  };

  const yearReadiness = getYearReadiness();

  return (
    <div className="space-y-8 sm:space-y-12 max-w-5xl mx-auto w-full overflow-hidden">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-xs font-mono mb-3">
          <Laptop className="w-3.5 h-3.5 text-cyan-400" />
          أداة التقييم والمطابقة التقنية
        </div>
        <h2 className="text-fluid-title font-black text-white tracking-tight">
          مستشار مواصفات اللابتوب
        </h2>
        <p className="text-fluid-body text-slate-400 mt-2 leading-relaxed">
          قيم جهازك الحالي أو تحقق من المواصفات قبل الشراء للتأكد من قدرته على تشغيل برامج القسم (Quartus, MATLAB, HFSS, Visual Studio) بسلاسة طوال سنوات دراستك.
        </p>
      </div>

      {/* Saved Laptop Profile Banner */}
      {savedLaptop && (
        <div className="rounded-2xl bg-cyan-950/30 border border-cyan-800/60 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-right">
            <div className="w-10 h-10 rounded-xl bg-cyan-900/60 border border-cyan-700/60 flex items-center justify-center text-cyan-300 shrink-0">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-cyan-300">مواصفات حاسوبك المحفوظة في ملفك</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-900/80 text-cyan-200 border border-cyan-700/60 font-mono">
                  {new Date(savedLaptop.savedAt).toLocaleDateString('ar-SY')}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                RAM {savedLaptop.specs.ramGb}GB • {savedLaptop.specs.storageType === 'ssd_nvme' ? 'NVMe SSD' : savedLaptop.specs.storageType === 'ssd_sata' ? 'SATA SSD' : 'HDD'} {savedLaptop.specs.storageCapacityGb}GB • {savedLaptop.specs.cpuTier}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <button
              onClick={() => setSpecs(savedLaptop.specs)}
              className="px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-medium flex items-center gap-1.5 transition-colors min-h-[44px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>استرجاع المواصفات</span>
            </button>
            <button
              onClick={removeSavedLaptop}
              title="حذف المواصفات المحفوظة"
              className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-900/50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Student Year Readiness Card */}
      {profile.currentYear && (
        <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          yearReadiness.status === 'ready'
            ? 'bg-emerald-950/20 border-emerald-800/50 text-emerald-200'
            : yearReadiness.status === 'needs_upgrade'
            ? 'bg-amber-950/20 border-amber-800/50 text-amber-200'
            : 'bg-blue-950/20 border-blue-800/50 text-blue-200'
        }`}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900/80 border border-current/30 flex items-center justify-center shrink-0 mt-0.5">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white">
                  مدى ملاءمة الجهاز لسنتك الدراسية ({profile.currentYear === 'graduate' ? 'خريج' : `السنة ${profile.currentYear}`}):
                </span>
                <span className="text-xs font-bold">{yearReadiness.title}</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {yearReadiness.desc}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Interactive Form (7 Cols) */}
        <div className="lg:col-span-7 bg-[#091527] border border-slate-800/90 rounded-3xl p-4 sm:p-6 md:p-7 shadow-xl space-y-5 sm:space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm sm:text-base font-bold text-white">
                أدخل مواصفات الجهاز المستهدف
              </h3>
            </div>
            <button
              onClick={handleResetToDefault}
              className="text-xs text-slate-400 hover:text-cyan-300 transition-colors py-1 px-2"
            >
              استعادة الافتراضي
            </button>
          </div>

          <div className="space-y-4 sm:space-y-5 text-xs">
            {/* RAM Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <label className="font-bold text-slate-300 block">
                  الذاكرة العشوائية (RAM):
                </label>
                <span className="text-[11px] text-cyan-400 font-mono">16 GB موصى به</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { val: 4, label: '4 GB (ضعيف)' },
                  { val: 8, label: '8 GB (مقبول)' },
                  { val: 16, label: '16 GB (موصى به)' },
                  { val: 32, label: '32 GB (ممتاز)' }
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setSpecs({ ...specs, ramGb: item.val as any })}
                    className={`py-2.5 px-2 text-center rounded-xl font-medium transition-all min-h-[44px] flex items-center justify-center ${
                      specs.ramGb === item.val
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-sm font-bold'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Storage Type */}
            <div className="space-y-2">
              <label className="font-bold text-slate-300 block">
                نوع وسيط التخزين:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'ssd_nvme', label: 'NVMe SSD (سريع جداً)' },
                  { id: 'ssd_sata', label: 'SATA SSD (جيد)' },
                  { id: 'hdd', label: 'HDD ميكانيكي (بطيء)' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSpecs({ ...specs, storageType: item.id as any })}
                    className={`py-2.5 px-2 text-center rounded-xl font-medium transition-all min-h-[44px] flex items-center justify-center ${
                      specs.storageType === item.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Storage Capacity */}
            <div className="space-y-2">
              <label className="font-bold text-slate-300 block">
                سعة التخزين:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { val: 256, label: '256 GB' },
                  { val: 512, label: '512 GB (موصى)' },
                  { val: 1000, label: '1 TB' },
                  { val: 2000, label: '2 TB' }
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setSpecs({ ...specs, storageCapacityGb: item.val as any })}
                    className={`py-2.5 text-center rounded-xl font-medium transition-all min-h-[44px] flex items-center justify-center ${
                      specs.storageCapacityGb === item.val
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CPU Brand & Tier */}
            <div className="space-y-2">
              <label className="font-bold text-slate-300 block">
                فئة المعالج (CPU Tier):
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
                    onClick={() => setSpecs({ 
                      ...specs, 
                      cpuBrand: item.brand as any, 
                      cpuTier: item.tier as any,
                      cpuGen: item.brand === 'apple' ? 'apple_silicon' : specs.cpuGen,
                      os: item.brand === 'apple' ? 'macos' : specs.os
                    })}
                    className={`py-2 px-2 text-center rounded-xl font-medium transition-all min-h-[44px] flex items-center justify-center ${
                      specs.cpuTier === item.tier
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 font-bold'
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
                    { gen: 'gen13_plus', label: 'حديث (13/14 أو Zen 4)' },
                    { gen: 'gen11_12', label: 'متوازن (11/12 أو Zen 3)' },
                    { gen: 'gen8_10', label: 'متوسط (8 إلى 10)' }
                  ].map((item) => (
                    <button
                      key={item.gen}
                      type="button"
                      onClick={() => setSpecs({ ...specs, cpuGen: item.gen as any })}
                      className={`py-2 px-1 text-center rounded-xl font-medium transition-all min-h-[44px] flex items-center justify-center ${
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

            {/* Graphics Card (GPU) */}
            <div className="space-y-2">
              <label className="font-bold text-slate-300 block">
                كرت الشاشة (GPU):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'integrated', label: 'مدمج (Intel UHD / Iris / AMD)' },
                  { id: 'dedicated_entry', label: 'منفصل اقتصادي (RTX 3050 / 2050)' },
                  { id: 'dedicated_mid_high', label: 'منفصل قوي (RTX 4060 فأعلى)' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSpecs({ ...specs, gpuTier: item.id as any })}
                    className={`py-2.5 px-2 text-center rounded-xl font-medium transition-all min-h-[44px] flex items-center justify-center ${
                      specs.gpuTier === item.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Operating System */}
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <label className="font-bold text-slate-300 block">
                  نظام التشغيل (OS):
                </label>
                <span className="text-[11px] text-amber-400 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  برامج القسم موجهة لنظام Windows أساساً
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'windows', label: 'Windows 10 / 11 (الأساسي)' },
                  { id: 'macos', label: 'macOS (أجهزة Mac)' },
                  { id: 'linux', label: 'Linux (Ubuntu / Fedora)' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSpecs({ ...specs, os: item.id as any })}
                    className={`py-2.5 px-2 text-center rounded-xl font-medium transition-all min-h-[44px] flex items-center justify-center ${
                      specs.os === item.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Specs Action */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleSaveSpecs}
                className="w-full sm:w-auto py-3 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 min-h-[44px]"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-950" />
                    <span>تم حفظ المواصفات بنجاح!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>حفظ في ملفي: &quot;مواصفات حاسوبي&quot;</span>
                  </>
                )}
              </button>

              <span className="text-[11px] text-slate-400 text-center sm:text-right w-full sm:w-auto">
                تُحفظ محلياً في متصفحك وتظهر في لوحة &quot;رحلتي&quot;
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Real-time Evaluation Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 w-full">
          <div className="bg-[#091527] border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
            {/* Status Header Badge */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              {evaluation.level === 'comfortable' ? (
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-950/50">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : evaluation.level === 'preferred' ? (
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg shadow-cyan-950/50">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-950/80 border border-amber-700/60 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-950/50">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              )}

              <div>
                <span className="text-[11px] text-slate-400">تقييم الملاءمة الهندسية:</span>
                <h4 className={`text-base sm:text-lg font-black ${
                  evaluation.level === 'comfortable'
                    ? 'text-emerald-400'
                    : evaluation.level === 'preferred'
                    ? 'text-cyan-300'
                    : 'text-amber-400'
                }`}>
                  {evaluation.badgeAr}
                </h4>
              </div>
            </div>

            {/* Summary sentence */}
            <div className="py-4 text-xs text-slate-200 leading-relaxed border-b border-slate-800/60">
              <p className="font-semibold text-white mb-1">{evaluation.titleAr}</p>
              <p className="text-slate-300">{evaluation.summaryAr}</p>
            </div>

            {/* Suitable Points (Strengths) */}
            {evaluation.suitableFor.length > 0 && (
              <div className="py-3 border-b border-slate-800/60 space-y-2">
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  نقاط القوة والميزات:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {evaluation.suitableFor.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Limiting Points (Weaknesses) */}
            {evaluation.limitingFor.length > 0 && (
              <div className="py-3 border-b border-slate-800/60 space-y-2">
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  نقاط الضعف والمحددات:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {evaluation.limitingFor.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Practical Advice */}
            {evaluation.practicalAdvice.length > 0 && (
              <div className="pt-3 space-y-2 text-xs">
                <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  نصائح عملية للترقية أو الاستخدام:
                </span>
                <ul className="space-y-1.5 text-slate-300 text-[11px]">
                  {evaluation.practicalAdvice.map((adv, idx) => (
                    <li key={idx} className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Software Compatibility Matrix Card */}
          <div className="bg-[#091527] border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  توافق برمجيات القسم مع هذا العتاد
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800">
                {smoothCount} سلس • {heavyCount} ثقيل
              </span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {softwareCompatibility.map((sw) => (
                <div
                  key={sw.id}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-white truncate">{sw.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{sw.compatibilityNote}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    sw.compatibilityStatus === 'smooth'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                      : sw.compatibilityStatus === 'acceptable'
                      ? 'bg-blue-950 text-blue-300 border border-blue-800/60'
                      : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                  }`}>
                    {sw.compatibilityStatus === 'smooth' ? 'سلس' : sw.compatibilityStatus === 'acceptable' ? 'مقبول' : 'قد يعاني'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Laptop Archetypes */}
      <div className="space-y-4 pt-4 sm:pt-6">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          نماذج الأجهزة الموصى بها للشراء لطلاب القسم
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {RECOMMENDED_ARCHETYPES.map((arch) => (
            <div
              key={arch.id}
              className={`p-4 sm:p-5 rounded-3xl border shadow-xl flex flex-col justify-between ${
                arch.isRecommended
                  ? 'bg-gradient-to-b from-[#091a33] to-[#071324] border-cyan-500/50 ring-1 ring-cyan-500/30'
                  : 'bg-[#091527] border-slate-800/80'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-800">
                    {arch.badgeAr}
                  </span>
                  {arch.isRecommended && (
                    <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      الأكثر توازناً
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    {arch.titleAr}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {arch.descriptionAr}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/60 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">المعالج:</span>
                    <span className="font-mono text-[11px] text-cyan-300">{arch.cpu}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">الرام:</span>
                    <span className="font-mono text-[11px] text-cyan-300">{arch.ram}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">التخزين:</span>
                    <span className="font-mono text-[11px] text-cyan-300">{arch.storage}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">كرت الشاشة:</span>
                    <span className="font-mono text-[11px] text-cyan-300">{arch.gpu}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                {arch.isRecommended
                  ? 'يغطي متطلبات المحاكاة والبرمجة حتى السنة الخامسة ومشاريع التخرج.'
                  : 'خيار عملي مدروس وفق الميزانية المحددة.'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
