import { SkillCourse, SkillCategory } from '../types';

export const SKILL_COURSES_DATA: SkillCourse[] = [
  // ================= COMMUNICATIONS =================
  {
    id: 'comm-hf-vhf',
    titleAr: 'HF / VHF / UHF',
    titleEn: 'HF / VHF / UHF Radio Systems',
    category: 'communications',
    categoryLabelAr: 'الاتصالات اللاسلكية',
    trackAr: 'مسار الترددات الراديوية والانتشار',
    descriptionAr: 'دراسة الترددات العالية والفائقة، خصائص انتشار الأمواج الراديوية، وتطبيقات الاتصالات اللاسلكية العسكرية والمدنية.',
    relatedSoftware: ['HFSS', 'MATLAB'],
    levelAr: 'متوسط',
    isPlanned: true,
    linkPlaceholder: 'سيتم إضافة الرابط لاحقاً.'
  },
  {
    id: 'comm-cellular',
    titleAr: 'الاتصالات الخليوية',
    titleEn: 'Cellular Mobile Communications',
    category: 'communications',
    categoryLabelAr: 'الاتصالات اللاسلكية',
    trackAr: 'مسار الشبكات الخلوية المتنقلة',
    descriptionAr: 'مفاهيم إعادة استخدام التردد، بنية الخلايا الخلوية، توزيع القنوات، وإدارة التسليم (Handover).',
    relatedSoftware: ['MATLAB'],
    levelAr: 'متوسط',
    isPlanned: true,
    linkPlaceholder: 'سيتم إضافة الرابط لاحقاً.'
  },
  {
    id: 'comm-gsm',
    titleAr: 'Full GSM',
    titleEn: 'Global System for Mobile (2G GSM)',
    category: 'communications',
    categoryLabelAr: 'الاتصالات اللاسلكية',
    trackAr: 'مسار الشبكات الخلوية المتنقلة',
    descriptionAr: 'بنية شبكة الـ GSM المتكاملة (BTS, BSC, MSC, HLR, VLR)، مسارات الإشارة، وتشفير المكالمات.',
    relatedSoftware: [],
    levelAr: 'متوسط',
    isPlanned: true,
    linkPlaceholder: 'سيتم إضافة الرابط لاحقاً.'
  },
  {
    id: 'comm-microwave',
    titleAr: 'Microwave',
    titleEn: 'Microwave Communications & Link Planning',
    category: 'communications',
    categoryLabelAr: 'الاتصالات اللاسلكية',
    trackAr: 'مسار الوصلات الميكروية',
    descriptionAr: 'تخطيط وصلات الميكروويف من نقطة لنقطة، حساب ميزانية الوصلة، وتجاوز التلاشي والتداخل الجغرافي.',
    relatedSoftware: ['Pathloss 5', 'Google Earth', 'AADE Filter Design'],
    levelAr: 'متقدم',
    isPlanned: true,
    linkPlaceholder: 'سيتم إضافة الرابط لاحقاً.'
  },

  // ================= NETWORKING =================
  {
    id: 'net-ccna',
    titleAr: 'CCNA (Cisco Certified Network Associate)',
    titleEn: 'CCNA Networking Fundamentals & Routing',
    category: 'networking',
    categoryLabelAr: 'الشبكات',
    trackAr: 'مسار هندسة شبكات سيسكو',
    descriptionAr: 'المنهاج المعياري العالمي لأساسيات الشبكات، بروتوكولات التوجيه والتبديل (Routing & Switching)، وعنونة IPv4/IPv6.',
    relatedSoftware: ['Packet Tracer'],
    levelAr: 'متوسط',
    isPlanned: true,
    linkPlaceholder: 'سيتم إضافة الرابط لاحقاً.'
  },

  // ================= PROGRAMMING =================
  {
    id: 'prog-csharp',
    titleAr: 'لغة C#',
    titleEn: 'C# Programming Language',
    category: 'programming',
    categoryLabelAr: 'البرمجة',
    trackAr: 'مسار تطوير البرمجيات والأنظمة',
    descriptionAr: 'لغة البرمجة الأساسية في الكلية، تركز على المفاهيم الموجهة للكائنات OOP وتطوير تطبيقات سطح المكتب.',
    relatedSoftware: ['Visual Studio / C#'],
    levelAr: 'مبتدئ',
    isPlanned: true,
    linkPlaceholder: 'سيتم إضافة الرابط لاحقاً.'
  },
  {
    id: 'prog-cpp',
    titleAr: 'لغة C++',
    titleEn: 'C++ for Engineers',
    category: 'programming',
    categoryLabelAr: 'البرمجة',
    trackAr: 'مسار البرمجة عالية الأداء والمتحكمات',
    descriptionAr: 'البرمجة قريبة المستوى من العتاد، إدارة الذاكرة بواسطة المؤشرات (Pointers)، وبرمجة المعالجات الصغرية.',
    relatedSoftware: ['Visual Studio'],
    levelAr: 'متوسط',
    isPlanned: true,
    linkPlaceholder: 'سيتم إضافة الرابط لاحقاً.'
  },
  {
    id: 'prog-web',
    titleAr: 'تطوير الويب (Web Development)',
    titleEn: 'Full-Stack Web Development',
    category: 'programming',
    categoryLabelAr: 'البرمجة',
    trackAr: 'مسار منصات الويب الحديثة',
    descriptionAr: 'بناء الواجهات التفاعلية والأنظمة السحابية باستخدام HTML/CSS وJavaScript وتطبيقات إدارة بيانات المشاريع.',
    relatedSoftware: ['Visual Studio Code'],
    levelAr: 'متوسط',
    isPlanned: true,
    linkPlaceholder: 'سيتم إضافة الرابط لاحقاً.'
  },
  {
    id: 'prog-flutter',
    titleAr: 'Flutter & Dart',
    titleEn: 'Cross-Platform Mobile Apps with Flutter',
    category: 'programming',
    categoryLabelAr: 'البرمجة',
    trackAr: 'مسار تطبيقات الموبايل',
    descriptionAr: 'تطوير تطبيقات الهواتف الذكية (iOS و Android) لربطها مع مشاريع إنترنت الأشياء والتحكم بالعتاد عن بُعد.',
    relatedSoftware: ['Android Studio', 'VS Code'],
    levelAr: 'متوسط',
    isPlanned: true,
    linkPlaceholder: 'سيتم إضافة الرابط لاحقاً.'
  },

  // ================= ELECTRONICS =================
  {
    id: 'elec-practical',
    titleAr: 'الإلكترونيات العملية',
    titleEn: 'Practical Electronics & Prototyping',
    category: 'electronics',
    categoryLabelAr: 'الإلكترونيات',
    trackAr: 'مسار التطبيق العملي والورشات',
    descriptionAr: 'مهارات لحام العناصر الدقيقة، قراءة مخططات الدارات العملية، وتجميع الدارات على لوحات Breadboard.',
    relatedSoftware: ['Multisim'],
    levelAr: 'مبتدئ',
    isPlanned: true,
    linkPlaceholder: 'سيتم إضافة الرابط لاحقاً.'
  },
  {
    id: 'elec-digital',
    titleAr: 'الإلكترونيات الرقمية',
    titleEn: 'Digital Electronics & Logic Implementation',
    category: 'electronics',
    categoryLabelAr: 'الإلكترونيات',
    trackAr: 'مسار الأنظمة الرقمية والعتاد',
    descriptionAr: 'تطبيق عملي لبوابات TTL و CMOS، بناء الساعات الرقمية والعدادات، وتجنب ضجيج التبديل الرقمي.',
    relatedSoftware: ['Proteus', 'ModelSim'],
    levelAr: 'متوسط',
    isPlanned: true,
    linkPlaceholder: 'سيتم إضافة الرابط لاحقاً.'
  },
  {
    id: 'elec-pcb-design',
    titleAr: 'التصميم الإلكتروني المحترف (PCB Design)',
    titleEn: 'Professional PCB Design & Fabrication',
    category: 'electronics',
    categoryLabelAr: 'الإلكترونيات',
    trackAr: 'مسار تصنيع اللوحات المطبوعة',
    descriptionAr: 'رسم المخطط النظري (Schematic) وتصميم المسارات متعددة الطبقات وإعداد ملفات Gerber للتصنيع الصناعي.',
    relatedSoftware: ['Proteus', 'Altium Designer'],
    levelAr: 'متقدم',
    isPlanned: true,
    linkPlaceholder: 'سيتم إضافة الرابط لاحقاً.'
  },

  // ================= OFFICE & COMPUTING =================
  {
    id: 'office-icdl',
    titleAr: 'ICDL (الرخصة الدولية لقيادة الحاسوب)',
    titleEn: 'International Computer Driving License',
    category: 'office',
    categoryLabelAr: 'المهارات المكتبية والرقمية',
    trackAr: 'مسار الكفاءة الحاسوبية العامة',
    descriptionAr: 'إتقان أساسيات أنظمة التشغيل، تصفح الويب الآمن، وإدارة الملفات للطلاب المستجدين.',
    relatedSoftware: ['Microsoft Windows'],
    levelAr: 'مبتدئ',
    isPlanned: true,
    linkPlaceholder: 'سيتم إضافة الرابط لاحقاً.'
  },
  {
    id: 'office-ms-office',
    titleAr: 'حزمة Microsoft Office للمهندسين',
    titleEn: 'Microsoft Office for Engineering Reports',
    category: 'office',
    categoryLabelAr: 'المهارات المكتبية والرقمية',
    trackAr: 'مسار التوثيق والتحليل الهندسي',
    descriptionAr: 'كتابة التقارير والمشاريع عبر Word، تنسيق العروض التقديمية في PowerPoint، وتحليل البيانات وجداول الحسابات في Excel.',
    relatedSoftware: ['Microsoft Office'],
    levelAr: 'مبتدئ',
    isPlanned: true,
    linkPlaceholder: 'سيتم إضافة الرابط لاحقاً.'
  },

  // ================= CYBER SECURITY & COMPUTER VISION =================
  {
    id: 'sec-cyber',
    titleAr: 'الأمن السيبراني (Cyber Security)',
    titleEn: 'Cyber Security & Network Defense',
    category: 'cybersecurity',
    categoryLabelAr: 'الأمن السيبراني',
    trackAr: 'مسار حماية الأنظمة والشبكات',
    descriptionAr: 'مبادئ التشفير، أمن شبكات الاتصالات، حماية البيانات الحساسة، وكشف الثغرات ونقاط الضعف.',
    relatedSoftware: ['Packet Tracer', 'Wireshark'],
    levelAr: 'متوسط',
    isPlanned: true,
    linkPlaceholder: 'سيتم إضافة الرابط لاحقاً.'
  },
  {
    id: 'ai-computer-vision',
    titleAr: 'الرؤية الحاسوبية (Computer Vision)',
    titleEn: 'Computer Vision & Image Processing',
    category: 'computervision',
    categoryLabelAr: 'الرؤية الحاسوبية والذكاء الصنعي',
    trackAr: 'مسار معالجة الصور المتقدمة',
    descriptionAr: 'معالجة الصور الرقمية، كشف الحواف والوجوه والأجسام، وتطبيقات الكاميرات الذكية للمشاريع الهندسية.',
    relatedSoftware: ['MATLAB', 'Python / OpenCV'],
    levelAr: 'متقدم',
    isPlanned: true,
    linkPlaceholder: 'سيتم إضافة الرابط لاحقاً.'
  }
];

export type LearningStage = 'START' | 'FOUNDATION' | 'INTERMEDIATE' | 'ADVANCED' | 'PROJECT';

export interface LearningPathStep {
  stage: LearningStage;
  stageLabelAr: string;
  title: string;
  subtitle: string;
  description: string;
  relatedTools?: string[];
}

export interface LearningPath {
  id: string;
  titleAr: string;
  titleEn: string;
  category: SkillCategory;
  summaryAr: string;
  steps: LearningPathStep[];
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'path-comm',
    titleAr: 'مسار هندسة الاتصالات والترددات الراديوية',
    titleEn: 'Communications Engineering Path',
    category: 'communications',
    summaryAr: 'من انتشار الأمواج الأساسية حتى تخطيط الشبكات الخلوية والوصلات الميكروية الحديثة.',
    steps: [
      {
        stage: 'START',
        stageLabelAr: 'البداية والاستكشاف',
        title: 'استكشاف الطيف الكهرومغناطيسي',
        subtitle: 'المفاهيم الفيزيائية وطبيعة إشارات الراديو',
        description: 'فهم النطاقات الترددية وتوليد وتضمين الإشارات التماثلية والرقمية.'
      },
      {
        stage: 'FOUNDATION',
        stageLabelAr: 'التأسيس النظري',
        title: 'HF / VHF / UHF',
        subtitle: 'أنماط الانتشار الأرضي والفضائي والهوائيات',
        description: 'حساب خط الرؤية (LOS) والتلاشي وسلوك الأمواج في مختلف البيئات الجوية.',
        relatedTools: ['MATLAB']
      },
      {
        stage: 'INTERMEDIATE',
        stageLabelAr: 'المستوى المتوسط',
        title: 'الاتصالات الخليوية (Cellular)',
        subtitle: 'بنية الخلايا وتوزيع الترددات والـ Handover',
        description: 'مبادئ تخطيط التغطية وسعة الشبكة وإعادة استخدام القنوات الترددية.'
      },
      {
        stage: 'ADVANCED',
        stageLabelAr: 'المستوى المتقدم',
        title: 'Full GSM & Modern Networks',
        subtitle: 'بنية شبكات المحمول (2G/3G/4G/5G)',
        description: 'بروتوكولات التوجيه، وإدارة قنوات التحكم، والأمان وتشفير المكالمات والبيانات.'
      },
      {
        stage: 'PROJECT',
        stageLabelAr: 'المشروع التطبيقي',
        title: 'Microwave & Link Planning',
        subtitle: 'تخطيط وصلات الميكروويف وميزانية الرابط',
        description: 'تطبيق عملي لتخطيط وصلة راديوية حقيقية باستخدام برمجيات التخطيط المتخصصة.',
        relatedTools: ['Pathloss 5', 'HFSS', 'Google Earth']
      }
    ]
  },
  {
    id: 'path-net',
    titleAr: 'مسار هندسة الشبكات وتراسل المعطيات',
    titleEn: 'Networking & Data Communications',
    category: 'networking',
    summaryAr: 'الانتقال المنهجي من أساسيات البروتوكولات إلى شهادات سيسكو وهندسة الشبكات المتقدمة.',
    steps: [
      {
        stage: 'START',
        stageLabelAr: 'البداية والاستكشاف',
        title: 'مبادئ تراسل المعطيات والشبكات',
        subtitle: 'طوبولوجيا الشبكات وأنواع وسائط النقل',
        description: 'فهم كيف تنتقل حزم البيانات بين الأجهزة عبر الكوابل النحاسية والألياف الضوئية.'
      },
      {
        stage: 'FOUNDATION',
        stageLabelAr: 'التأسيس النظري',
        title: 'Networking Fundamentals',
        subtitle: 'نموذج OSI وعنونة IPv4 / IPv6 وتجزئة الشبكات',
        description: 'الطبقات السبع، بروتوكولات TCP/UDP، وحساب الأقنعة والشبكات الفرعية (Subnetting).'
      },
      {
        stage: 'INTERMEDIATE',
        stageLabelAr: 'المستوى المتوسط',
        title: 'منهاج CCNA (Cisco)',
        subtitle: 'التوجيه والتبديل (Routing & Switching)',
        description: 'إعداد الموجهات والمبدلات وبروتوكولات OSPF, VLANs, NAT, والتحكم بالوصول ACL.',
        relatedTools: ['Packet Tracer']
      },
      {
        stage: 'ADVANCED',
        stageLabelAr: 'المستوى المتقدم',
        title: 'Advanced Networking & SD-WAN',
        subtitle: 'شبكات المؤسسات والبروتوكولات الموسعة BGP',
        description: 'هندسة الشبكات الواسعة، حماية البنية التحتية، وتكامل خدمات السحابة.'
      },
      {
        stage: 'PROJECT',
        stageLabelAr: 'المشروع التطبيقي',
        title: 'Enterprise Network Topology Project',
        subtitle: 'بناء ومحاكاة شبكة مؤسساتية متكاملة',
        description: 'تصميم شبكة كاملة لمؤسسة متعددة الفروع مع خوادم وسياسات أمان وتوجيه ديناميكي.',
        relatedTools: ['Packet Tracer']
      }
    ]
  },
  {
    id: 'path-prog',
    titleAr: 'مسار البرمجة وهندسة البرمجيات للهواة والمهندسين',
    titleEn: 'Programming & Software Engineering',
    category: 'programming',
    summaryAr: 'بناء العقلية البرمجية من المنطق وC# وصولاً إلى C++، الويب، وتطبيقات الموبايل.',
    steps: [
      {
        stage: 'START',
        stageLabelAr: 'البداية والاستكشاف',
        title: 'المنطق البرمجي والخوارزميات',
        subtitle: 'هيكلة التفكير، الشروط، الحلقات، والمصفوفات',
        description: 'فهم كيفية تحويل المشاكل الهندسية إلى تسلسل منطقي قابل للتنفيذ حاسوبياً.'
      },
      {
        stage: 'FOUNDATION',
        stageLabelAr: 'التأسيس النظري',
        title: 'لغة C# (منهاج الكلية)',
        subtitle: 'البرمجة كائنية التوجه (OOP) وواجهات Windows',
        description: 'الأصناف، الوراثة، تعدد الأشكال، وبناء برمجيات سطح المكتب المتكاملة.',
        relatedTools: ['Visual Studio / C#']
      },
      {
        stage: 'INTERMEDIATE',
        stageLabelAr: 'المستوى المتوسط',
        title: 'لغة C++ وإدارة الذاكرة',
        subtitle: 'المؤشرات (Pointers) والبرمجة منخفضة المستوى',
        description: 'التعامل المباشر مع عتاد المعالج والذاكرة، والتأهيل لبرمجة الأنظمة المضمنة.'
      },
      {
        stage: 'ADVANCED',
        stageLabelAr: 'المستوى المتقدم',
        title: 'Web Development & APIs',
        subtitle: 'بناء واجهات الويب وربط الخدمات الخلفية',
        description: 'تصميم لوحات تحكم ويب لعرض بيانات الحساسات وأجهزة الاتصالات عبر الإنترنت.'
      },
      {
        stage: 'PROJECT',
        stageLabelAr: 'المشروع التطبيقي',
        title: 'Flutter / Dart Cross-Platform App',
        subtitle: 'تطبيق محمول للتحكم والمراقبة الهندسية',
        description: 'بناء تطبيق هاتف ذكي يتصل بأنظمة مضمنة عبر البلوتوث أو السحابة لمشروع عملي.'
      }
    ]
  },
  {
    id: 'path-elec',
    titleAr: 'مسار الإلكترونيات العملية والتصميم الاحترافي',
    titleEn: 'Practical Electronics & Hardware Design',
    category: 'electronics',
    summaryAr: 'من فهم العناصر والمخابر العملية إلى الدارات الرقمية وتصميم لوحات PCB الاحترافية.',
    steps: [
      {
        stage: 'START',
        stageLabelAr: 'البداية والاستكشاف',
        title: 'مبادئ القياسات والسلامة المخبرية',
        subtitle: 'أجهزة القياس، راسم الإشارة، ومولد الترددات',
        description: 'إتقان التعامل مع أدوات القياس الواقعية في مخابر قسم الإلكترونيات.'
      },
      {
        stage: 'FOUNDATION',
        stageLabelAr: 'التأسيس النظري',
        title: 'Practical Electronics',
        subtitle: 'الديودات، الترانزستورات، ودارات التضخيم',
        description: 'تحليل سلوك أنصاف النواقل وتصميم دارات التغذية والمرشحات التماثلية.',
        relatedTools: ['NI Multisim']
      },
      {
        stage: 'INTERMEDIATE',
        stageLabelAr: 'المستوى المتوسط',
        title: 'Digital Electronics & FPGA',
        subtitle: 'الأنظمة المنطقية ولغة توصيف العتاد VHDL',
        description: 'برمجة وتوليد الدارات الرقمية التتابعية وتنزيلها على لوحات FPGA الحقيقية.',
        relatedTools: ['Intel Quartus', 'ModelSim']
      },
      {
        stage: 'ADVANCED',
        stageLabelAr: 'المستوى المتقدم',
        title: 'Professional PCB Design',
        subtitle: 'رسم المخططات وتصميم المسارات متعددة الطبقات',
        description: 'مراعاة قواعد التوافق الكهرومغناطيسي EMC وتقليل الضجيج في الدارات الحساسة.',
        relatedTools: ['Proteus']
      },
      {
        stage: 'PROJECT',
        stageLabelAr: 'المشروع التطبيقي',
        title: 'Embedded IoT Hardware Prototype',
        subtitle: 'تصميم وتصنيع جهاز إلكتروني متكامل',
        description: 'تنفيذ نموذج عتادي حقيقي يجمع بين المتحكم الصغري، الحساسات، ووحدة الاتصال اللاسلكي.'
      }
    ]
  },
  {
    id: 'path-other',
    titleAr: 'مسار المهارات المساندة والرؤية الحاسوبية والأمن',
    titleEn: 'Supportive Skills, Vision & Security',
    category: 'office',
    summaryAr: 'المهارات الرقمية الأساسية وصولاً إلى أمن الشبكات والرؤية الحاسوبية المتقدمة.',
    steps: [
      {
        stage: 'START',
        stageLabelAr: 'البداية والاستكشاف',
        title: 'مهارات الحوسبة الأولية',
        subtitle: 'تنظيم الملفات والعمل الاحترافي على أنظمة التشغيل',
        description: 'إدارة الملفات البرمجية والتعامل مع سطر الأوامر وأدوات الإنتاجية.'
      },
      {
        stage: 'FOUNDATION',
        stageLabelAr: 'التأسيس النظري',
        title: 'ICDL & Microsoft Office',
        subtitle: 'إعداد التقارير الهندسية والتحليل الإحصائي',
        description: 'كتابة أوراق العمل العلمية في Word ومعالجة بيانات التجارب المخبرية في Excel.'
      },
      {
        stage: 'INTERMEDIATE',
        stageLabelAr: 'المستوى المتوسط',
        title: 'Cybersecurity & Defense',
        subtitle: 'حماية الشبكات والتشفير ومفاهيم الأمان',
        description: 'مبادئ التحقق، أمان بروتوكولات الاتصال اللاسلكي، وحماية النظم الهندسية.'
      },
      {
        stage: 'ADVANCED',
        stageLabelAr: 'المستوى المتقدم',
        title: 'Computer Vision & Image Processing',
        subtitle: 'معالجة الصور والتعرف على الأنماط',
        description: 'خوارزميات استخلاص الميزات، كشف الحواف والأجسام باستخدام MATLAB و OpenCV.',
        relatedTools: ['MATLAB']
      },
      {
        stage: 'PROJECT',
        stageLabelAr: 'المشروع التطبيقي',
        title: 'Smart Vision System Project',
        subtitle: 'نظام مراقبة ذكي لمعالجة الفيديو المباشر',
        description: 'تطبيق متكامل يعالج بث الكاميرا الحية لتصنيف المنتجات أو كشف الحركة آلياً.'
      }
    ]
  }
];
