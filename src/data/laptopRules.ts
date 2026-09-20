import { LaptopSpecs, LaptopEvaluationResult } from '../types';

export const DEFAULT_LAPTOP_SPECS: LaptopSpecs = {
  cpuBrand: 'intel',
  cpuTier: 'i7',
  cpuGen: 'gen11_12',
  ramGb: 16,
  storageType: 'ssd_nvme',
  storageCapacityGb: 512,
  gpuTier: 'dedicated_entry',
  os: 'windows'
};

export function evaluateLaptop(specs: LaptopSpecs): LaptopEvaluationResult {
  const limitingReasons: string[] = [];
  const suitablePoints: string[] = [];
  const affectedSoftware: string[] = [];
  const practicalAdvice: string[] = [];

  // 1. RAM Analysis
  if (specs.ramGb < 8) {
    limitingReasons.push('ذاكرة الرام (4 GB) غير كافية إطلاقاً لمعظم برامج المحاكاة الهندسية الحديثة.');
    affectedSoftware.push('MATLAB', 'Ansys HFSS', 'Visual Studio', 'Quartus Prime');
    practicalAdvice.push('ترقية الرام إلى 16 GB (أو 8 GB كحد أدنى مؤقت) هي الأولوية القصوى لتشغيل الأدوات الهندسية.');
  } else if (specs.ramGb === 8) {
    suitablePoints.push('ذاكرة الرام (8 GB) كافية للمقررات الأولية، البرمجة الخفيفة، ومحاكاة الدارات البسيطة (Multisim, Proteus).');
    limitingReasons.push('قد تلاحظ بطئاً أو امتلاءً في الذاكرة عند فتح برامج المحاكاة الثقيلة ثلاثية الأبعاد أو مجموعات MATLAB الكبيرة.');
    affectedSoftware.push('Ansys HFSS', 'MATLAB (محاكاة متقدمة)', 'Quartus Prime');
    practicalAdvice.push('يُفضل الترقية إلى 16 GB في السنتين الرابعة والخامسة للتعامل بسلاسة مع مشاريع التخرج وهوائيات HFSS.');
  } else if (specs.ramGb >= 16) {
    suitablePoints.push(`ذاكرة الرام (${specs.ramGb} GB) ممتازة وتلبي متطلبات جميع برامج المحاكاة الهندسية والتصميم ثلاثي الأبعاد بأريحية.`);
  }

  // 2. Storage Analysis
  if (specs.storageType === 'hdd') {
    limitingReasons.push('القرص الصلب التقليدي (HDD) يؤدي إلى بطء شديد في إقلاع البرامج الهندسية الكبيرة ومعالجة قواعد البيانات.');
    affectedSoftware.push('Visual Studio', 'MATLAB', 'Quartus Prime', 'HFSS');
    practicalAdvice.push('استبدال قرص النظام بـ SSD (سواء SATA أو NVMe) سيحدث فرقاً هائلاً وفورياً في استجابة وسرعة الجهاز.');
  } else {
    suitablePoints.push('وحدة التخزين السريعة (SSD) تضمن سرعة تحميل البرامج وقراءة البيانات الهندسية.');
  }

  if (specs.storageCapacityGb <= 256) {
    limitingReasons.push(`سعة التخزين (${specs.storageCapacityGb} GB) ضيقة نسبياً، حيث تتطلب حزم البرمجيات الهندسية (مثل MATLAB و HFSS و Quartus) مساحات تتجاوز 100 GB إجمالاً.`);
    practicalAdvice.push('الاعتماد على قرص SSD خارجي أو ترقية السعة إلى 512 GB أو 1 TB لتجنب نفاد المساحة مع مشاريع السنوات المتقدمة.');
  } else if (specs.storageCapacityGb >= 512) {
    suitablePoints.push(`سعة التخزين (${specs.storageCapacityGb >= 1000 ? `${specs.storageCapacityGb / 1000} TB` : `${specs.storageCapacityGb} GB`}) ممتازة وتتسع للبرمجيات والمشاريع والمراجع.`);
  }

  // 3. CPU Analysis
  const isModernCpu = specs.cpuGen === 'gen11_12' || specs.cpuGen === 'gen13_plus' || specs.cpuGen === 'apple_silicon';
  const isMidCpu = specs.cpuGen === 'gen8_10';
  const isWeakTier = specs.cpuTier === 'i3' || specs.cpuTier === 'ryzen3';

  if (specs.cpuGen === 'older' || isWeakTier) {
    limitingReasons.push('المعالج قديم أو من الفئة الابتدائية، مما يزيد من زمن معالجة خوارزميات DSP والمحاكاة الكهرطيسية.');
    affectedSoftware.push('Ansys HFSS', 'MATLAB DSP', 'Pathloss 5');
    practicalAdvice.push('المعالجة ستعمل لكن ستحتاج لبعض الصبر أثناء الرندرة والحسابات المكثفة.');
  } else {
    suitablePoints.push('المعالج يقدم أداءً قوياً ومناسباً لمعالجة الخوارزميات الحسابية.');
  }

  // 4. GPU Analysis
  if (specs.gpuTier === 'integrated') {
    limitingReasons.push('كرت الشاشة المدمج كافٍ للدارات ثنائية الأبعاد، لكنه قد يكون محدوداً في المحاكاة الكهرطيسية ثلاثية الأبعاد المعقدة.');
    affectedSoftware.push('Ansys HFSS (عرض ثلاثي الأبعاد)', 'Google Earth Pro 3D');
  } else {
    suitablePoints.push('كرت الشاشة المنفصل يوفر تسريعاً ممتازاً للواجهات ثلاثية الأبعاد وبرامج التصميم الهندسي.');
  }

  // 5. Operating System Analysis
  if (specs.os === 'macos') {
    limitingReasons.push('نظام macOS ممتاز في الأداء العام، ولكن العديد من برامج القسم الهندسية الرسمية (مثل Quartus و PSpice و Multisim و Pathloss 5) متوفرة أصلياً لنظام Windows فقط.');
    affectedSoftware.push('Intel Quartus', 'Cadence PSpice', 'NI Multisim', 'Proteus', 'Pathloss 5');
    practicalAdvice.push('يمكن استخدام أجهزة Mac عبر برامج الأنظمة الوهمية (مثل Parallels Desktop) أو أجهزة موازية، لكن نظام Windows يُعد الخيار الأكثر توافقاً ومباشرةً لطلاب هندسة الإلكترونيات.');
  } else if (specs.os === 'linux') {
    practicalAdvice.push('نظام Linux رائع للبرمجة وأدوات مفتوحة المصدر، لكن بعض برامج القسم التعليمية تعمل عبر Wine أو قد تحتاج لتثبيت نظام Windows إضافي بجانبه (Dual Boot).');
  }

  // Overall Tier Classification (Guidance only)
  let level: 'minimum' | 'preferred' | 'comfortable' = 'preferred';
  let badgeAr = 'المواصفات المفضلة';
  let titleAr = 'جهازك يطابق المواصفات المفضلة للدراسة';
  let summaryAr = 'مواصفات ممتازة تلبي المقررات والمشاريع بأداء متوازن، مع قدرة جيدة جداً على تشغيل برامج المحاكاة الهندسية المعتمدة.';

  if (specs.ramGb < 8 || specs.storageType === 'hdd' || specs.cpuGen === 'older' || isWeakTier) {
    level = 'minimum';
    badgeAr = 'الحد الأدنى المقترح / يحتاج ترقية';
    titleAr = 'الجهاز قادر على تلبية البدايات، مع بعض القيود في السنوات المتقدمة';
    summaryAr = 'يمكنك استخدام هذا الجهاز في السنوات الأولى ولمقررات البرمجة والدارات الأساسية، لكنك قد تواجه قيوداً في برامج المحاكاة الثقيلة لاحقاً.';
  } else if (
    specs.ramGb >= 16 &&
    specs.storageType === 'ssd_nvme' &&
    specs.storageCapacityGb >= 512 &&
    isModernCpu &&
    (specs.gpuTier === 'dedicated_entry' || specs.gpuTier === 'dedicated_mid_high')
  ) {
    level = 'comfortable';
    badgeAr = 'مواصفات مريحة للاستخدام';
    titleAr = 'مواصفات راقية ومريحة جداً لجميع سنوات الدراسة ومشاريع التخرج';
    summaryAr = 'هذا التكوين يمنحك تجربة استخدام سلسة وخالية من الاختناقات في جميع المقررات، بما في ذلك محاكاة الهوائيات ثلاثية الأبعاد ومشروع التخرج.';
  }

  // Dedup affected software
  const uniqueAffected = Array.from(new Set(affectedSoftware));

  return {
    level,
    badgeAr,
    titleAr,
    summaryAr,
    suitableFor: suitablePoints,
    limitingFor: limitingReasons,
    affectedSoftware: uniqueAffected,
    practicalAdvice
  };
}

export interface LaptopArchetype {
  id: string;
  titleAr: string;
  descriptionAr: string;
  badgeAr: string;
  cpu: string;
  ram: string;
  storage: string;
  gpu: string;
  isRecommended?: boolean;
}

export const RECOMMENDED_ARCHETYPES: LaptopArchetype[] = [
  {
    id: 'budget',
    titleAr: 'الخيار الاقتصادي العملي',
    badgeAr: 'اقتصادي وعملي',
    descriptionAr: 'كافٍ للمقررات الأولى، البرمجة، والدارات البسيطة. مناسب للميزانيات المحدودة.',
    cpu: 'Intel Core i5 (جيل 11 أو 12) / AMD Ryzen 5',
    ram: '8 GB إلى 16 GB DDR4',
    storage: '512 GB NVMe SSD',
    gpu: 'كرت مدمج قوي (Intel Iris Xe أو Radeon)'
  },
  {
    id: 'balanced',
    titleAr: 'الخيار المتوازن الموصى به (الأمثل للدراسة)',
    badgeAr: 'الموصى به لطلاب القسم',
    descriptionAr: 'التوازن الذهبي بين السعر والأداء لكافة سنوات الدراسة ومخابر المحاكاة.',
    cpu: 'Intel Core i7 (جيل 12 أو 13) / AMD Ryzen 7',
    ram: '16 GB DDR4/DDR5',
    storage: '512 GB أو 1 TB NVMe SSD',
    gpu: 'كرت منفصل فئة RTX 3050 / RTX 4050',
    isRecommended: true
  },
  {
    id: 'pro',
    titleAr: 'الأداء العالي ومشاريع التخرج المتقدمة',
    badgeAr: 'أداء احترافي فائق',
    descriptionAr: 'لمحاكاة الهوائيات الكهرطيسية ثلاثية الأبعاد المعقدة والذكاء الاصطناعي ومعالجة الإشارة الضخمة.',
    cpu: 'Intel Core i7 / i9 (فئة H) أو Ryzen 7 / 9',
    ram: '32 GB DDR5',
    storage: '1 TB أو 2 TB NVMe SSD فائق السرعة',
    gpu: 'NVIDIA RTX 4060 فأعلى (6-8 GB VRAM)'
  }
];

