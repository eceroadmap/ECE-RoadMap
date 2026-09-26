import { 
  LaptopSpecs, 
  LaptopEvaluationResult, 
  DepartmentRecommendedSpecs, 
  RecommendedLaptopModel,
  ComparisonItem 
} from '../types/laptop';

export const DEFAULT_LAPTOP_SPECS: LaptopSpecs = {
  cpuBrand: 'intel',
  cpuTier: 'i5',
  cpuGen: 'gen11_12',
  ramGb: 16,
  storageType: 'ssd_nvme',
  storageCapacityGb: 1000, // 1 TB Recommended baseline
  gpuTier: 'dedicated_entry',
  screenSize: '15_6',
  os: 'windows'
};

export const DEFAULT_DEPARTMENT_SPECS: DepartmentRecommendedSpecs = {
  minRamGb: 8,
  targetRamGb: 16,
  targetStorageGb: 1000, // 1 TB (توصية معتمدة لطلاب القسم)
  targetStorageType: 'NVMe SSD',
  targetCpuTier: 'Intel Core i5/i7 (جيل 11+) أو AMD Ryzen 5/7',
  targetGpuTier: 'كرت منفصل RTX 3050 / 2050 أو كرت مدمج حديث (Iris Xe / Radeon)',
  targetOs: 'Windows 10 / 11 (64-bit)',
  targetScreen: '15.6 بوصة FHD IPS أو 14 بوصة مريحة للتنقل'
};

export const DEFAULT_RECOMMENDED_LAPTOPS: RecommendedLaptopModel[] = [
  {
    id: 'lenovo-loq-15',
    name: 'Lenovo LOQ 15 / Legion 5',
    brand: 'Lenovo',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
    cpu: 'Intel Core i7 (جيل 13) / AMD Ryzen 7 7840HS',
    ram: '16 GB DDR5 (قابل للترقية)',
    storage: '1 TB NVMe PCIe SSD',
    gpu: 'NVIDIA GeForce RTX 4050 (6GB GDDR6)',
    screenSize: '15.6 بوصة FHD IPS 144Hz',
    os: 'Windows 11 Home',
    priceEstimate: '880$ - 1050$',
    suitabilityLevel: 'balanced',
    suitabilityBadge: 'الموصى به لطلاب القسم',
    suitableFor: [
      'البرمجة وبيئات التطوير',
      'MATLAB / Simulink',
      'المحاكاة الهندسية (HFSS / CST)',
      'الأنظمة المدمجة وFPGA (Quartus)',
      'مشاريع التخرج والسنوات المتقدمة',
      'الاستخدام اليومي'
    ],
    pros: [
      'توازن مثالي بين قوة المعالجة والتبريد وسرعة التخزين',
      'سعة تخزين 1TB تكفي حزم برمجيات القسم ومشاريع التخرج',
      'كرت شاشة منفصل يسرع المحاكاة ثلاثية الأبعاد بدون بطء'
    ],
    notes: 'الخيار الأكثر ملاءمة وشعبية لطلاب هندسة الإلكترونيات والاتصالات لكافة السنوات.',
    isRecommended: true,
    status: 'active'
  },
  {
    id: 'asus-tuf-a15',
    name: 'ASUS TUF Gaming A15',
    brand: 'ASUS',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
    cpu: 'AMD Ryzen 7 7735HS / Ryzen 5 7535HS',
    ram: '16 GB DDR5',
    storage: '1 TB NVMe SSD M.2',
    gpu: 'NVIDIA GeForce RTX 3050 / RTX 4050',
    screenSize: '15.6 بوصة FHD IPS 144Hz',
    os: 'Windows 11',
    priceEstimate: '760$ - 900$',
    suitabilityLevel: 'balanced',
    suitabilityBadge: 'متوازن وقوي التحمل',
    suitableFor: [
      'البرمجة',
      'MATLAB / Simulink',
      'المحاكاة الهندسية',
      'الأنظمة المدمجة',
      'مشاريع التخرج',
      'الاستخدام اليومي'
    ],
    pros: [
      'هيكل متين بمعايير عسكرية يتحمل التنقل اليومي للكلية',
      'بطارية ممتازة مع معالجات Ryzen الموفرة للطاقة',
      'تخزين 1TB NVMe سريع جداً في قراءة البيانات'
    ],
    notes: 'خيار ممتاز جداً للطلاب الذين يبحثون عن المتانة وعمر البطارية مع أداء هندسي قوي.',
    isRecommended: true,
    status: 'active'
  },
  {
    id: 'dell-g15-5530',
    name: 'Dell G15 5530 Gaming',
    brand: 'Dell',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
    cpu: 'Intel Core i7-13650HX (14 cores)',
    ram: '16 GB DDR5',
    storage: '1 TB NVMe SSD Gen4',
    gpu: 'NVIDIA GeForce RTX 4050 (6GB)',
    screenSize: '15.6 بوصة FHD 120Hz',
    os: 'Windows 11',
    priceEstimate: '840$ - 990$',
    suitabilityLevel: 'balanced',
    suitabilityBadge: 'معالجة حسابية جبارة',
    suitableFor: [
      'البرمجة',
      'MATLAB / Simulink الحسابي المكثف',
      'Ansys HFSS & CST',
      'الأنظمة المدمجة وFPGA',
      'مشاريع التخرج'
    ],
    pros: [
      'معالج فئة HX قوي للغاية في معالجة الإشارة والمعادلات المصفوفية',
      'لوحة مفاتيح كاملة تتضمن لوحة أرقام Numpad مريحة للمهندسين',
      'منافذ توصيل متعددة لربط راسم الإشارة وأجهزة المخابر'
    ],
    notes: 'مناسب للطلاب المهتمين بمشاريع معالجة الإشارة الرقمية والاتصالات المتقدمة.',
    status: 'active'
  },
  {
    id: 'acer-swift-go-14',
    name: 'Acer Swift Go 14 / Aspire 5',
    brand: 'Acer',
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80',
    cpu: 'Intel Core i5-13500H / AMD Ryzen 5 7530U',
    ram: '16 GB LPDDR5',
    storage: '1 TB NVMe PCIe SSD',
    gpu: 'Intel Iris Xe Graphics / AMD Radeon',
    screenSize: '14.0 بوصة OLED / FHD IPS',
    os: 'Windows 11',
    priceEstimate: '590$ - 720$',
    suitabilityLevel: 'budget',
    suitabilityBadge: 'اقتصادي وخفيف للتنقل',
    suitableFor: [
      'البرمجة وVisual Studio',
      'محاكاة الدارات الأساسية (Multisim, Proteus)',
      'MATLAB (المهام والمشاريع المتوسطة)',
      'الاستخدام اليومي وتدوين المحاضرات'
    ],
    pros: [
      'وزن خفيف جداً (حوالي 1.3 كغ) مثالي لحمله يومياً للجامعة',
      'شاشة مريحة وممتازة لقراءة المراجع والبرمجة الطويلة',
      'تخزين 1TB واسع وسريع بالسعر الاقتصادي'
    ],
    notes: 'مناسب للميزانيات الاقتصادية والسنوات الأولى وحتى الرابعة، مع ملاحظة أن المحاكاة ثلاثية الأبعاد الثقيلة جداً ستكون أبطأ بسبب الكرت المدمج.',
    status: 'active'
  },
  {
    id: 'hp-victus-16',
    name: 'HP Victus 16 / Omen',
    brand: 'HP',
    image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80',
    cpu: 'Intel Core i7-13700H / AMD Ryzen 7 7840HS',
    ram: '32 GB DDR5',
    storage: '1 TB NVMe SSD (M.2 Dual Slot)',
    gpu: 'NVIDIA GeForce RTX 4060 (8GB GDDR6)',
    screenSize: '16.1 بوصة FHD IPS 165Hz',
    os: 'Windows 11 Home',
    priceEstimate: '1100$ - 1350$',
    suitabilityLevel: 'pro',
    suitabilityBadge: 'أداء احترافي لمشاريع التخرج',
    suitableFor: [
      'البرمجة والذكاء الاصطناعي',
      'MATLAB / Simulink الضخم',
      'المحاكاة الهندسية المعقدة ثلاثية الأبعاد',
      'الأنظمة المدمجة وFPGA وVHDL',
      'مشاريع التخرج والرادار وهوائيات 5G'
    ],
    pros: [
      'ذاكرة 32GB تمنع أي اختناق في مشاريع التخرج والهوائيات الكهرطيسية',
      'كرت شاشة فئة 8GB VRAM يتيح معالجة الصور والرادار والذكاء الاصطناعي',
      'شاشة واسعة ومريحة 16.1 بوصة لتعدد النوافذ الهندسية'
    ],
    notes: 'خيار القمة للطلاب الراغبين في جهاز يعيش لسنوات طويلة بعد التخرج ويغطي أثقل المشاريع.',
    status: 'active'
  },
  {
    id: 'lenovo-thinkpad-e16',
    name: 'Lenovo ThinkPad E16 / T14',
    brand: 'Lenovo',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    cpu: 'Intel Core i7-1355U / AMD Ryzen 7 PRO',
    ram: '16 GB DDR5',
    storage: '1 TB NVMe SSD',
    gpu: 'Intel Iris Xe Graphics / NVIDIA MX550',
    screenSize: '16.0 بوصة WUXGA IPS (16:10)',
    os: 'Windows 11 Pro',
    priceEstimate: '780$ - 960$',
    suitabilityLevel: 'balanced',
    suitabilityBadge: 'الاعتمادية العالية والعمل الشاق',
    suitableFor: [
      'البرمجة وكتابة الكود',
      'الأنظمة المدمجة وبرمجة الميكروكنترولر',
      'مخابر الدارات والاتصالات',
      'المشاريع الجامعية والاستخدام اليومي'
    ],
    pros: [
      'أفضل لوحة مفاتيح هندسية في العالم مع زر TrackPoint الشهير',
      'شاشة بنسبة 16:10 تمنح مساحة عمودية أكبر لعرض الكود والدارات',
      'منافذ متكاملة (RJ45 Ethernet, HDMI, USB-A, Type-C) للمخابر'
    ],
    notes: 'الخيار الكلاسيكي العملي المفضل للمهندسين والمبرمجين الذين يقدرون الاعتمادية الفائقة.',
    status: 'active'
  }
];

export const RECOMMENDED_ARCHETYPES = [
  {
    id: 'budget',
    titleAr: 'الخيار الاقتصادي والعملي',
    badgeAr: 'اقتصادي وعملي',
    descriptionAr: 'كافٍ للمقررات الأولى، البرمجة، والدارات الأساسية. مناسب للميزانيات المحدودة.',
    cpu: 'Intel Core i5 (جيل 11 أو 12) / AMD Ryzen 5',
    ram: '8 GB إلى 16 GB',
    storage: '1 TB أو 512 GB NVMe SSD',
    gpu: 'كرت مدمج قوي (Intel Iris Xe أو Radeon)'
  },
  {
    id: 'balanced',
    titleAr: 'الخيار المتوازن الموصى به (الأمثل لدراسة القسم)',
    badgeAr: 'الموصى به لطلاب القسم',
    descriptionAr: 'التوازن الذهبي بين السعر والأداء لكافة سنوات الدراسة ومخابر المحاكاة ومشاريع التخرج.',
    cpu: 'Intel Core i7 (جيل 12 أو 13) / AMD Ryzen 7',
    ram: '16 GB DDR4/DDR5',
    storage: '1 TB NVMe PCIe SSD (الموصى به)',
    gpu: 'كرت منفصل فئة RTX 3050 / RTX 4050',
    isRecommended: true
  },
  {
    id: 'pro',
    titleAr: 'الأداء العالي ومشاريع التخرج المتقدمة',
    badgeAr: 'أداء احترافي فائق',
    descriptionAr: 'لمحاكاة الهوائيات الكهرطيسية ثلاثية الأبعاد المعقدة والذكاء الاصطناعي ومعالجة الإشارة الضخمة.',
    cpu: 'Intel Core i7 / i9 (فئة H/HX) أو Ryzen 7 / 9',
    ram: '32 GB DDR5',
    storage: '1 TB أو 2 TB NVMe SSD فائق السرعة',
    gpu: 'NVIDIA RTX 4060 فأعلى (6-8 GB VRAM)'
  }
];

/**
 * Evaluates a student's laptop specs objectively with transparent scoring,
 * strengths, attention points, and a direct side-by-side comparison with department baseline.
 */
export function evaluateLaptop(
  specs: LaptopSpecs, 
  deptSpecs: DepartmentRecommendedSpecs = DEFAULT_DEPARTMENT_SPECS
): LaptopEvaluationResult {
  const limitingReasons: string[] = [];
  const suitablePoints: string[] = [];
  const affectedSoftware: string[] = [];
  const practicalAdvice: string[] = [];
  const suitableFields: string[] = [];

  let score = 0;

  // -------------------------------------------------------------
  // 1. RAM Scoring & Analysis (Max 30 pts)
  // -------------------------------------------------------------
  let ramStatus: 'pass' | 'warning' | 'optimal' = 'pass';
  let ramNote = '';

  if (specs.ramGb < 8) {
    score += 5;
    ramStatus = 'warning';
    ramNote = 'الذاكرة (4 GB) غير كافية لبرمجيات المحاكاة الحديثة';
    limitingReasons.push('ذاكرة الرام (4 GB) غير كافية إطلاقاً لمعظم برامج المحاكاة الهندسية الحديثة.');
    affectedSoftware.push('MATLAB', 'Ansys HFSS', 'Visual Studio', 'Quartus Prime');
    practicalAdvice.push('ترقية الرام إلى 16 GB (أو 8 GB كحد أدنى) هي الأولوية القصوى لتشغيل الأدوات الهندسية.');
  } else if (specs.ramGb === 8) {
    score += 18;
    ramStatus = 'pass';
    ramNote = 'كافية للمقررات الأولى، قد تحتاج ترقية في السنوات المتقدمة';
    suitablePoints.push('ذاكرة الرام (8 GB) كافية للمقررات الأولية، البرمجة الخفيفة، ومحاكاة الدارات الأساسية (Multisim, Proteus).');
    limitingReasons.push('الذاكرة (8 GB) قد تصبح محدودة عند تشغيل بيئات المحاكاة الثقيلة ثلاثية الأبعاد أو مجموعات MATLAB الكبيرة بالتزامن.');
    affectedSoftware.push('Ansys HFSS', 'MATLAB (محاكاة متقدمة)', 'Quartus Prime');
    practicalAdvice.push('يُفضل الترقية إلى 16 GB في السنتين الرابعة والخامسة للتعامل بسلاسة مع مشاريع التخرج وهوائيات HFSS.');
  } else if (specs.ramGb >= 16 && specs.ramGb < 32) {
    score += 28;
    ramStatus = 'optimal';
    ramNote = 'مطابقة تماماً للتوصية المعتمدة لطلاب القسم (16 GB)';
    suitablePoints.push(`ذاكرة الرام (${specs.ramGb} GB) ممتازة وتطابق التوصية الرسمية لتشغيل جميع برامج المحاكاة الهندسية بأريحية.`);
  } else {
    // 32GB+
    score += 30;
    ramStatus = 'optimal';
    ramNote = 'سعة احترافية فائقة تفوق المتطلبات';
    suitablePoints.push(`ذاكرة الرام (${specs.ramGb} GB) فائقة وتوفر أداءً احترافياً لمشاريع التخرج الضخمة والذكاء الاصطناعي.`);
  }

  // -------------------------------------------------------------
  // 2. Storage Type & Capacity Scoring (Max 25 pts)
  // -------------------------------------------------------------
  let storageStatus: 'pass' | 'warning' | 'optimal' = 'pass';
  let storageNote = '';

  // Type:
  if (specs.storageType === 'hdd') {
    score += 2;
    storageStatus = 'warning';
    storageNote = 'القرص الميكانيكي HDD يسبب بطئاً شديداً';
    limitingReasons.push('القرص الصلب التقليدي (HDD) يؤدي إلى بطء ملحوظ في إقلاع البرامج الهندسية ومعالجة البيانات.');
    affectedSoftware.push('Visual Studio', 'MATLAB', 'Quartus Prime', 'HFSS');
    practicalAdvice.push('استبدال قرص النظام بـ SSD (سواء SATA أو NVMe) سيحدث فرقاً هائلاً وفورياً في سرعة الجهاز.');
  } else if (specs.storageType === 'ssd_sata') {
    score += 10;
    suitablePoints.push('وحدة التخزين السريعة (SATA SSD) تضمن إقلاعاً جيداً للبرمجيات.');
  } else {
    // NVMe
    score += 13;
    suitablePoints.push('وحدة التخزين فائقة السرعة (NVMe SSD) تضمن سرعة تحميل البرامج وقراءة البيانات الهندسية الكبيرة.');
  }

  // Capacity (1TB is the baseline target):
  if (specs.storageCapacityGb <= 256) {
    score += 2;
    storageStatus = 'warning';
    storageNote = `سعة التخزين (${specs.storageCapacityGb} GB) ضيقة جداً مقارنة بالتوصية الجديدة (1 TB)`;
    limitingReasons.push(`سعة التخزين (${specs.storageCapacityGb} GB) أقل بكثير من التوصية المعتمدة (1 TB)، حيث تحتاج حزم البرمجيات الهندسية لمساحة تتجاوز 150 GB.`);
    practicalAdvice.push('الاعتماد على قرص SSD خارجي أو ترقية السعة الداخلية إلى 1 TB لتجنب امتلاء القرص مع تقدم السنوات.');
  } else if (specs.storageCapacityGb === 512) {
    score += 8;
    if (storageStatus !== 'warning') storageStatus = 'pass';
    storageNote = 'سعة 512 GB كافية للبدايات، لكن التوصية المعتمدة المحدثة للقسم هي 1 TB';
    suitablePoints.push('سعة 512 GB مقبولة للسنوات الأولى، مع الانتباه لإدارة المساحة.');
    limitingReasons.push('سعة التخزين (512 GB) أقل من التوصية العامة المحدثة لطلاب القسم (1 TB)، وقد تتطلب مسح الملفات المؤقتة دورياً عند تنزيل حزم HFSS وQuartus معاً.');
    practicalAdvice.push('التوصية العامة للقسم هي 1 TB لضمان اتساع كافة المراجع وحزم المحاكاة ومشاريع التخرج دون قيود.');
  } else if (specs.storageCapacityGb >= 1000) {
    score += 12;
    if (specs.storageType !== 'hdd') storageStatus = 'optimal';
    storageNote = `سعة ممتازة (${specs.storageCapacityGb >= 2000 ? '2 TB' : '1 TB'}) تطابق التوصية الرسمية`;
    suitablePoints.push(`سعة التخزين (${specs.storageCapacityGb >= 2000 ? `${specs.storageCapacityGb / 1000} TB` : '1 TB'}) ممتازة وتطابق التوصية المعتمدة وتتسع لكافة البرمجيات والمشاريع.`);
  }

  // -------------------------------------------------------------
  // 3. CPU Scoring & Analysis (Max 25 pts)
  // -------------------------------------------------------------
  let cpuStatus: 'pass' | 'warning' | 'optimal' = 'pass';
  let cpuNote = '';

  const isModernCpu = specs.cpuGen === 'gen11_12' || specs.cpuGen === 'gen13_plus' || specs.cpuGen === 'apple_silicon';
  const isWeakTier = specs.cpuTier === 'i3' || specs.cpuTier === 'ryzen3' || specs.cpuTier === 'other';

  if (specs.cpuGen === 'older' || isWeakTier) {
    score += 8;
    cpuStatus = 'warning';
    cpuNote = 'المعالج من فئة اقتصادية أو جيل قديم، قد يستغرق وقتاً أطول في المعالجة';
    limitingReasons.push('المعالج من الفئة الابتدائية أو قديم، مما يزيد من زمن معالجة خوارزميات DSP والمحاكاة الكهرطيسية.');
    affectedSoftware.push('Ansys HFSS', 'MATLAB DSP', 'Pathloss 5');
    practicalAdvice.push('العمليات الحسابية ستعمل لكن ستحتاج لبعض الصبر أثناء الرندرة والحسابات المكثفة.');
  } else if (specs.cpuTier === 'i5' || specs.cpuTier === 'ryzen5') {
    score += 20;
    cpuStatus = isModernCpu ? 'optimal' : 'pass';
    cpuNote = isModernCpu ? 'معالج متوازن وممتاز لكافة مقررات القسم' : 'معالج جيد ومناسب للدراسة';
    suitablePoints.push('معالج (Core i5 / Ryzen 5) يقدم أداءً متوازناً وقوياً ومناسباً لمعالجة الخوارزميات الحسابية.');
  } else if (specs.cpuTier === 'i7' || specs.cpuTier === 'ryzen7') {
    score += 24;
    cpuStatus = 'optimal';
    cpuNote = 'معالج قوي جداً وموصى به للسنوات المتقدمة';
    suitablePoints.push('معالج (Core i7 / Ryzen 7) يقدم أداءً فائقاً في المحاكاة والمعالجة الرياضية المتوازية.');
  } else if (specs.cpuTier === 'i9' || specs.cpuTier === 'ryzen9') {
    score += 25;
    cpuStatus = 'optimal';
    cpuNote = 'معالج فائق القوة للبحث العلمي ومشاريع التخرج الكبرى';
    suitablePoints.push('معالج (Core i9 / Ryzen 9) يمتلك قدرة معالجة قصوى.');
  } else if (specs.cpuBrand === 'apple') {
    score += 23;
    cpuStatus = 'optimal';
    cpuNote = 'معالج Apple Silicon سريع وموفر للطاقة';
    suitablePoints.push('معالج Apple Silicon يقدم سرعة وكفاءة طاقة استثنائية.');
  }

  // -------------------------------------------------------------
  // 4. GPU Scoring & Analysis (Max 12 pts)
  // -------------------------------------------------------------
  let gpuStatus: 'pass' | 'warning' | 'optimal' = 'pass';
  let gpuNote = '';

  if (specs.gpuTier === 'integrated') {
    score += 7;
    gpuStatus = 'pass';
    gpuNote = 'كرت مدمج: كافٍ للدارات ثنائية الأبعاد، لكنه محدود في المجسمات 3D المعقدة';
    suitablePoints.push('كرت الشاشة المدمج يفي بالغرض لمقررات الدارات والبرمجة والشبكات ومحاكاة 2D.');
    limitingReasons.push('كرت الشاشة المدمج مناسب للاستخدامات العادية لكنه قد يكون محدوداً لبعض التطبيقات الثقيلة ثلاثية الأبعاد (مثل دوران مجسمات الهوائيات في HFSS).');
    affectedSoftware.push('Ansys HFSS (عرض ثلاثي الأبعاد)');
  } else if (specs.gpuTier === 'dedicated_entry') {
    score += 11;
    gpuStatus = 'optimal';
    gpuNote = 'كرت منفصل اقتصادي (RTX 3050/2050): تسريع ممتاز';
    suitablePoints.push('كرت الشاشة المنفصل يوفر تسريعاً ممتازاً للواجهات ثلاثية الأبعاد وبرامج التصميم الهندسي.');
  } else if (specs.gpuTier === 'dedicated_mid_high') {
    score += 12;
    gpuStatus = 'optimal';
    gpuNote = 'كرت منفصل متقدم (RTX 4060+): أداء احترافي للمحاكاة والذكاء الاصطناعي';
    suitablePoints.push('كرت شاشة منفصل فائق الأداء لتسريع محاكاة الهوائيات والذكاء الاصطناعي ومعالجة الإشارة.');
  } else if (specs.gpuTier === 'apple_gpu') {
    score += 9;
    gpuStatus = 'pass';
    gpuNote = 'معالج رسوميات Apple مدمج وسريع للواجهات';
  }

  // -------------------------------------------------------------
  // 5. Operating System Scoring & Analysis (Max 8 pts)
  // -------------------------------------------------------------
  let osStatus: 'pass' | 'warning' | 'optimal' = 'optimal';
  let osNote = '';

  if (specs.os === 'windows') {
    score += 8;
    osStatus = 'optimal';
    osNote = 'نظام Windows هو المتوافق أصلياً مع جميع برمجيات القسم';
    suitablePoints.push('نظام Windows 10 / 11 يوفر التوافقية الكاملة 100% مع جميع برمجيات القسم الرسمية والمخابر.');
  } else if (specs.os === 'macos') {
    score += 5;
    osStatus = 'warning';
    osNote = 'نظام macOS يتطلب نظاماً وهمياً لبرامج Quartus, Multisim, PSpice, Pathloss';
    limitingReasons.push('نظام macOS ممتاز في الأداء، ولكن العديد من برامج القسم الأساسية (Quartus, PSpice, Multisim, Proteus, Pathloss 5) متوفرة رسمياً لنظام Windows فقط.');
    affectedSoftware.push('Intel Quartus Prime', 'Cadence PSpice', 'NI Multisim', 'Proteus', 'Pathloss 5');
    practicalAdvice.push('يمكن استخدام أجهزة Mac عبر تثبيت نظام Windows وهمي (مثل Parallels Desktop)، مع الانتباه إلى أن بيئة Windows هي الخيار الأكثر مباشرة لطلاب القسم.');
  } else if (specs.os === 'linux') {
    score += 6;
    osStatus = 'pass';
    osNote = 'نظام Linux ممتاز للبرمجة مع الحاجة لنظام Windows بجانبه للمحاكيات التعليمية';
    practicalAdvice.push('نظام Linux رائع للبرمجة، ويُفضل تثبيت نظام Windows إضافي بجانبه (Dual Boot) لتشغيل البرامج المخصصة لويندوز فقط.');
  }

  // Ensure score bounds (0-100)
  score = Math.min(100, Math.max(15, Math.round(score)));

  // Determine Level, Badge, and Summary
  let level: 'minimum' | 'preferred' | 'comfortable' | 'elite' = 'preferred';
  let badgeAr = `${score}% — مناسب مع بعض الملاحظات`;
  let titleAr = 'جهازك مناسب لدراسة مقررات القسم مع بعض الملاحظات';
  let summaryAr = 'يمكن للجهاز التعامل مع مقررات البرمجة والدارات، مع الحاجة للانتباه لبعض متطلبات السعة والذاكرة في السنوات المتقدمة.';

  if (score >= 90) {
    level = 'elite';
    badgeAr = `${score}% — أداء احترافي فائق وممتاز`;
    titleAr = 'مواصفات راقية ومريحة جداً لجميع سنوات الدراسة ومشاريع التخرج';
    summaryAr = 'هذا التكوين يمنحك تجربة استخدام سلسة وخالية من أي اختناقات في جميع المقررات، بما في ذلك محاكاة الهوائيات ثلاثية الأبعاد ومشاريع التخرج.';
  } else if (score >= 80) {
    level = 'comfortable';
    badgeAr = `${score}% — مناسب جداً للدراسة`;
    titleAr = 'جهازك يطابق المواصفات الموصى بها لطلاب القسم';
    summaryAr = 'مواصفات متوازنة وقوية تلبي المقررات والمشاريع بأداء ممتاز، مع قدرة عالية على تشغيل برامج المحاكاة الهندسية المعتمدة.';
  } else if (score >= 60) {
    level = 'preferred';
    badgeAr = `${score}% — مناسب مع بعض الملاحظات`;
    titleAr = 'الجهاز كافٍ لمقررات البدايات والبرمجة، مع بعض القيود في المحاكاة الثقيلة';
    summaryAr = 'يمكنك استخدام هذا الجهاز بنجاح في المقررات الأساسية، ويُفضل تطبيق نصائح الترقية تدريجياً قبل الوصول لمشاريع التخرج.';
  } else {
    level = 'minimum';
    badgeAr = `${score}% — قد تواجه بعض القيود في البرمجيات الهندسية`;
    titleAr = 'الجهاز بحاجة إلى بعض التحسينات لضمان سلاسة الدراسة';
    summaryAr = 'المواصفات الحالية تفي بالمهام البسيطة والبرمجة الأولية، ولكنك ستواجه بطئاً واضحاً عند تشغيل بيئات المحاكاة الهندسية الكبيرة.';
  }

  // Determine Suitable Fields based on hardware
  if (specs.ramGb >= 4 && specs.storageType !== 'hdd') {
    suitableFields.push('البرمجة وبيئات التطوير (C / C++ / Python)');
    suitableFields.push('الاستخدام اليومي وتصفح المراجع والمحاضرات');
  }
  if (specs.ramGb >= 8 && specs.storageType !== 'hdd') {
    suitableFields.push('محاكاة الدارات الكهربائية والمنطقية (Proteus / Multisim)');
    suitableFields.push('MATLAB وSimulink (المستوى الأكاديمي الأساسي)');
    suitableFields.push('برمجة المتحكمات الصغرية والأنظمة المدمجة (Arduino / STM32)');
  }
  if (specs.ramGb >= 16 && specs.storageType !== 'hdd' && isModernCpu) {
    suitableFields.push('بيئات FPGA وVHDL المتقدمة (Intel Quartus / ModelSim)');
    suitableFields.push('محاكاة الهوائيات والأمواج الكهرطيسية (Ansys HFSS / CST)');
    suitableFields.push('مشاريع التخرج والسنوات المتقدمة (4 و 5)');
  }
  if (specs.ramGb >= 32 || (specs.ramGb >= 16 && specs.gpuTier === 'dedicated_mid_high')) {
    suitableFields.push('الذكاء الاصطناعي ومعالجة الإشارة الضخمة ورادار 5G');
  }

  // Build the comparison items (Your Laptop vs Department Recommendation)
  const comparison: ComparisonItem[] = [
    {
      aspect: 'الذاكرة العشوائية (RAM)',
      aspectKey: 'ram',
      userValue: `${specs.ramGb} GB`,
      recommendedValue: `${deptSpecs.targetRamGb} GB (الحد الأدنى ${deptSpecs.minRamGb} GB)`,
      status: ramStatus,
      note: ramNote
    },
    {
      aspect: 'سعة التخزين الداخلي',
      aspectKey: 'storage',
      userValue: specs.storageCapacityGb >= 1000 ? `${specs.storageCapacityGb / 1000} TB` : `${specs.storageCapacityGb} GB`,
      recommendedValue: '1 TB (التوصية المعتمدة لطلاب القسم)',
      status: storageStatus,
      note: storageNote
    },
    {
      aspect: 'نوع وسيط التخزين',
      aspectKey: 'storage_type',
      userValue: specs.storageType === 'ssd_nvme' ? 'NVMe SSD (فائق السرعة)' : specs.storageType === 'ssd_sata' ? 'SATA SSD (سريع)' : 'HDD ميكانيكي (بطيء)',
      recommendedValue: deptSpecs.targetStorageType,
      status: specs.storageType === 'hdd' ? 'warning' : specs.storageType === 'ssd_sata' ? 'pass' : 'optimal',
      note: specs.storageType === 'hdd' ? 'يُنصح بالترقية فوراً إلى SSD' : 'أداء تخزين ممتاز'
    },
    {
      aspect: 'فئة المعالج (CPU)',
      aspectKey: 'cpu',
      userValue: specs.cpuBrand === 'apple' ? 'Apple Silicon' : `${specs.cpuBrand.toUpperCase()} ${specs.cpuTier.toUpperCase()}`,
      recommendedValue: deptSpecs.targetCpuTier,
      status: cpuStatus,
      note: cpuNote
    },
    {
      aspect: 'كرت الشاشة (GPU)',
      aspectKey: 'gpu',
      userValue: specs.gpuTier === 'integrated' ? 'مدمج (Integrated)' : specs.gpuTier === 'dedicated_entry' ? 'منفصل اقتصادي (RTX 3050 / 2050)' : specs.gpuTier === 'dedicated_mid_high' ? 'منفصل قوي (RTX 4060+)' : 'Apple GPU',
      recommendedValue: deptSpecs.targetGpuTier,
      status: gpuStatus,
      note: gpuNote
    },
    {
      aspect: 'نظام التشغيل (OS)',
      aspectKey: 'os',
      userValue: specs.os === 'windows' ? 'Windows 10 / 11' : specs.os === 'macos' ? 'macOS (أجهزة Mac)' : 'Linux',
      recommendedValue: deptSpecs.targetOs,
      status: osStatus,
      note: osNote
    }
  ];

  return {
    scorePercentage: score,
    level,
    badgeAr,
    titleAr,
    summaryAr,
    suitableFor: suitablePoints,
    limitingFor: limitingReasons,
    affectedSoftware: Array.from(new Set(affectedSoftware)),
    practicalAdvice,
    suitableFields,
    comparison
  };
}
