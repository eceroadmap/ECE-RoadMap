import { SoftwareTool } from '../types';

export const SOFTWARE_DATA: SoftwareTool[] = [
  {
    id: 'visual-studio',
    name: 'Visual Studio / C#',
    arabicName: 'فيجوال ستوديو',
    category: 'programming',
    categoryLabelAr: 'البرمجة وهندسة البرمجيات',
    description: 'بيئة التطوير المتكاملة الرسمية لتطبيقات لغة C# الموجهة للكائنات والخوارزميات.',
    purpose: 'تطوير البرمجيات وتطبيق مفاهيم البرمجة الكائنية وبنى المعطيات والواجهات الرسومية.',
    usedInCourses: ['برمجة 1', 'برمجة 2', 'خوارزميات وبنى معطيات'],
    academicYears: [2, 3],
    officialDownloadLink: undefined,
    learningResources: [
      { title: 'دليل تثبيت بيئة Visual Studio لطلاب القسم', isPlaceholder: true },
      { title: 'أمثلة ومشاريع C# عملية', isPlaceholder: true }
    ]
  },
  {
    id: 'quartus',
    name: 'Intel Quartus Prime',
    arabicName: 'إنتل كوارتس',
    category: 'fpga',
    categoryLabelAr: 'التصميم الرقمي وFPGA',
    description: 'بيئة تصميم وتوليد الدارات المنطقية القابلة للبرمجة (CPLD / FPGA) باستخدام VHDL / Verilog.',
    purpose: 'تطبيق وتوليف الدارات والنظم المنطقية التوافقية والتتابعية وتنزيلها على لوحات FPGA.',
    usedInCourses: ['دارات منطقية', 'نظم منطقية'],
    academicYears: [3],
    officialDownloadLink: undefined,
    learningResources: [
      { title: 'دليل البدء مع Quartus Prime ولغة VHDL', isPlaceholder: true }
    ]
  },
  {
    id: 'modelsim',
    name: 'ModelSim',
    arabicName: 'مودل سيم',
    category: 'fpga',
    categoryLabelAr: 'محاكاة النظم الرقمية',
    description: 'أداة المحاكاة الزمنية والوظيفية الاحترافية للتحقق من سلامة تصاميم VHDL و Verilog.',
    purpose: 'محاكاة وتوليد المخططات الزمنية ودراسة تزامن الإشارات في الأنظمة المنطقية.',
    usedInCourses: ['دارات منطقية', 'نظم منطقية'],
    academicYears: [3],
    officialDownloadLink: undefined,
    learningResources: [
      { title: 'دليل اختبار المخططات الزمنية في ModelSim', isPlaceholder: true }
    ]
  },
  {
    id: 'multisim',
    name: 'NI Multisim',
    arabicName: 'ملتي سيم',
    category: 'circuits',
    categoryLabelAr: 'محاكاة الدارات الإلكترونية',
    description: 'بيئة SPICE التفاعلية لمحاكاة الدارات التماثلية والرقمية والقياسات المخبرية الافتراضية.',
    purpose: 'تحليل وتصميم دارات التضخيم والمرشحات وتوصيل راسم الإشارة ومولد الترددات الافتراضي.',
    usedInCourses: ['قياسات كهربائية', 'دارات إلكترونية 1', 'دارات إلكترونية 2'],
    academicYears: [2, 3],
    officialDownloadLink: undefined,
    learningResources: [
      { title: 'مكتبة عناصر وتجارب Multisim لطلاب الكلية', isPlaceholder: true }
    ]
  },
  {
    id: 'arduino-ide',
    name: 'Arduino IDE',
    arabicName: 'آردوينو IDE',
    category: 'embedded',
    categoryLabelAr: 'الأنظمة المضمنة والمتحكمات',
    description: 'البيئة البرمجية المفتوحة المصدر لبرمجة وتوصيل المتحكمات الصغرية والحساسات ومحولات الإشارة.',
    purpose: 'برمجة الحساسات وتطبيق بروتوكولات القراءة في القياسات الإلكترونية ومشاريع التخرج.',
    usedInCourses: ['قياسات إلكترونية', 'معالجات صغرية'],
    academicYears: [3, 4],
    officialDownloadLink: undefined,
    learningResources: [
      { title: 'دليل ربط الحساسات والمتحكمات', isPlaceholder: true }
    ]
  },
  {
    id: 'zeliosoft',
    name: 'ZelioSoft 2',
    arabicName: 'زيليو سوفت 2',
    category: 'industrial',
    categoryLabelAr: 'الإلكترونيات الصناعية والأتمتة',
    description: 'برنامج محاكاة وبرمجة المرحلات الذكية والحواكم المنطقية المبرمجة Smart Relays / PLC.',
    purpose: 'كتابة ومحاكاة برامج السلم المنطقي (Ladder Logic) ومخططات FBD للأتمتة الصناعية.',
    usedInCourses: ['إلكترون صناعي'],
    academicYears: [3],
    officialDownloadLink: undefined,
    learningResources: [
      { title: 'دليل برمجة Ladder Diagram في ZelioSoft', isPlaceholder: true }
    ]
  },
  {
    id: 'matlab',
    name: 'MATLAB',
    arabicName: 'ماتلاب',
    category: 'dsp',
    categoryLabelAr: 'الحوسبة العلمية ومعالجة الإشارة',
    description: 'البيئة الرائدة عالمياً في الحسابات الرياضية والمصفوفية ومعالجة الإشارات الرقمية والمحاكاة.',
    purpose: 'تحليل الإشارات وتصميم المرشحات الرقمية FIR/IIR ونمذجة أنظمة الاتصالات والتحكم.',
    usedInCourses: ['معالجة إشارة 1', 'معالجة إشارة 2', 'تحكم 1', 'تحكم 2', 'نظم اتصالات 1'],
    academicYears: [3, 4, 5],
    officialDownloadLink: undefined,
    learningResources: [
      { title: 'أكواد MATLAB لمعالجة الإشارة الرقمية DSP', isPlaceholder: true },
      { title: 'مقدمة للتعامل مع Simulink', isPlaceholder: true }
    ]
  },
  {
    id: 'microwind',
    name: 'Microwind',
    arabicName: 'مايكرو ويند',
    category: 'circuits',
    categoryLabelAr: 'تصميم الدارات المتكاملة VLSI',
    description: 'أداة تعليمية وتطبيقية متخصصة في رسم وتصميم التخطيط الفيزيائي (Layout) لبوابات CMOS.',
    purpose: 'تعلم القواعد الهندسية للتصنيع وتخطيط مسارات الدارات المتكاملة ومحاكاة التأخير الزمني.',
    usedInCourses: ['إلكترونيات دقيقة'],
    academicYears: [4],
    officialDownloadLink: undefined,
    learningResources: [
      { title: 'دليل رسم بوابات CMOS في Microwind', isPlaceholder: true }
    ]
  },
  {
    id: 'hfss',
    name: 'Ansys HFSS',
    arabicName: 'أنسيس HFSS',
    category: 'microwaves',
    categoryLabelAr: 'المحاكاة الكهرطيسية ثلاثية الأبعاد',
    description: 'البرنامج المعياري في المحاكاة الكهرطيسية ثلاثية الأبعاد باستخدام طريقة العناصر المنتهية FEM.',
    purpose: 'تصميم ومحاكاة الهوائيات وحساب مخطط الإشعاع وممانعة الدخل ومعامل التشتت S11.',
    usedInCourses: ['انتشار وهوائيات'],
    academicYears: [4],
    officialDownloadLink: undefined,
    learningResources: [
      { title: 'خطوات محاكاة هوائي Patch على HFSS', isPlaceholder: true }
    ]
  },
  {
    id: 'pspice',
    name: 'Cadence PSpice / OrCAD',
    arabicName: 'بي سبايس',
    category: 'circuits',
    categoryLabelAr: 'المحاكاة التخصصية للدارات',
    description: 'برنامج التحليل والنمذجة الدقيقة للدارات الإلكترونية المعقدة وتحليل Monte Carlo والحساسية.',
    purpose: 'محاكاة السلوك الترددي والزمني الدقيق للدارات الخطية وغير الخطية في ظروف التشغيل المختلفة.',
    usedInCourses: ['محاكاة الدارات الإلكترونية'],
    academicYears: [4],
    officialDownloadLink: undefined,
    learningResources: [
      { title: 'أوامر وتحاليل PSpice المعتمدة في المقرر', isPlaceholder: true }
    ]
  },
  {
    id: 'proteus',
    name: 'Proteus Design Suite',
    arabicName: 'بروتيوس',
    category: 'embedded',
    categoryLabelAr: 'محاكاة المتحكمات والـ PCB',
    description: 'بيئة تفاعلية فريدة لمحاكاة المتحكمات الصغرية مع الدارات المحيطية وتصميم الدارات المطبوعة PCB.',
    purpose: 'تنفيذ واختبار أكواد لغة التجميع والـ C التفاعلية مع شاشات LCD ومحركات ولوحات مفاتيح.',
    usedInCourses: ['معالجات صغرية'],
    academicYears: [4],
    officialDownloadLink: undefined,
    learningResources: [
      { title: 'مشاريع محاكاة PIC/AVR في Proteus', isPlaceholder: true }
    ]
  },
  {
    id: 'aade-filter',
    name: 'AADE Filter Design',
    arabicName: 'مرشحات AADE',
    category: 'microwaves',
    categoryLabelAr: 'تصميم المرشحات الترددية',
    description: 'أداة خفيفة ودقيقة لحساب وتصميم المرشحات الترددية المنفعلة من مختلف الرتب والأنواع.',
    purpose: 'حساب قيم المكثفات والملفات في مرشحات Butterworth و Chebyshev للأمواج الراديوية.',
    usedInCourses: ['الأمواج الميكروية'],
    academicYears: [4],
    officialDownloadLink: undefined,
    learningResources: [
      { title: 'دليل تصميم المرشحات باستخدام AADE Filter', isPlaceholder: true }
    ]
  },
  {
    id: 'pathloss',
    name: 'Pathloss 5',
    arabicName: 'باث لوس 5',
    category: 'microwaves',
    categoryLabelAr: 'تخطيط الوصلات الراديوية الميكروية',
    description: 'الأداة القياسية المعتمدة في هندسة الاتصالات لتصميم وتخطيط وصلات الميكروويف من نقطة لنقطة.',
    purpose: 'حساب ميزانية الوصلة الراديوية (Link Budget)، تداخل الإشارات، وقطع مسار فرينل.',
    usedInCourses: ['الأمواج الميكروية'],
    academicYears: [4],
    officialDownloadLink: undefined,
    learningResources: [
      { title: 'مبادئ تخطيط وصلة ميكروية في Pathloss', isPlaceholder: true }
    ]
  },
  {
    id: 'google-earth',
    name: 'Google Earth Pro',
    arabicName: 'غوغل إيرث',
    category: 'microwaves',
    categoryLabelAr: 'التحليل الطبوغرافي والمسارات',
    description: 'أداة تصوير وتحليل الارتفاعات التضاريسية لدراسة خط الرؤية البصري LOS بين أبراج الاتصالات.',
    purpose: 'رسم مقاطع التضاريس والتحقق من عدم وجود عوائق جغرافية بين محطات الإرسال والاستقبال.',
    usedInCourses: ['الأمواج الميكروية'],
    academicYears: [4],
    officialDownloadLink: undefined,
    learningResources: [
      { title: 'طريقة استخراج المقطع الطبوغرافي لمسار الوصلة', isPlaceholder: true }
    ]
  },
  {
    id: 'packet-tracer',
    name: 'Cisco Packet Tracer',
    arabicName: 'سيسكو باكت تريسر',
    category: 'networking',
    categoryLabelAr: 'محاكاة شبكات سيسكو',
    description: 'برنامج محاكاة شبكات الحاسوب الرائد لبناء وتكوين الراوترات والسويتشات واختبار بروتوكولات TCP/IP.',
    purpose: 'تطبيق إعدادات الروترات، الـ Subnetting، الـ VLANs، وبروتوكولات التوجيه مثل OSPF.',
    usedInCourses: ['شبكات الاتصالات والمعلوماتية'],
    academicYears: [5],
    officialDownloadLink: undefined,
    learningResources: [
      { title: 'تمارين معتمدة في تكوين راوترات Cisco', isPlaceholder: true }
    ]
  },
  {
    id: 'optiwave',
    name: 'OptiWave (OptiSystem)',
    arabicName: 'أوبتي ويف',
    category: 'optics',
    categoryLabelAr: 'محاكاة الاتصالات الضوئية',
    description: 'بيئة محاكاة شاملة لأنظمة وشبكات الألياف البصرية وتقنيات مضاعفة الإرسال بتقسيم طول الموجة WDM.',
    purpose: 'دراسة التشتت والتخميد في الألياف البصرية ومحاكاة المضخمات الضوئية EDFA.',
    usedInCourses: ['نظم اتصالات بصرية'],
    academicYears: [5],
    officialDownloadLink: undefined,
    learningResources: [
      { title: 'دليل محاكاة منظومة نقل ليف بصري على OptiWave', isPlaceholder: true }
    ]
  }
];
