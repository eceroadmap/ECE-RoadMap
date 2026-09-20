import { YearMilestone } from '../types';

export const YEAR_MILESTONES: YearMilestone[] = [
  {
    yearNumber: 1,
    titleAr: 'السنة الأولى',
    titleEn: 'First Year: Foundations',
    stageTitleAr: 'مرحلة التأسيس العلمي والهندسي',
    stageSummaryAr: 'بناء القاعدة المتينة في الرياضيات، الفيزياء، ومبادئ الكهرباء والحاسوب لتمهيد الدخول في التخصص الدقيق.',
    keySkills: [
      'التفكير التحليلي الرياضي والفيزيائي',
      'حساب دارات التيار المستمر وقوانين كيرشوف',
      'الرسم والتصور الفراغي الهندسي',
      'أساسيات المنطق البرمجي والأنظمة العددية'
    ],
    softwareUsed: ['Multisim'],
    courseIds: [
      'math-1', 'lang-1', 'phys-1', 'eng-mechanics', 'arabic-lang', 'eng-drawing',
      'elec-fund', 'intro-comp', 'phys-2', 'math-2', 'chemistry', 'workshops', 'lang-2'
    ],
    focusAreas: ['الرياضيات والفيزياء العامة', 'أسس الهندسة الكهربائية', 'المهارات المخبرية الأولية']
  },
  {
    yearNumber: 2,
    titleAr: 'السنة الثانية',
    titleEn: 'Second Year: Core Fundamentals',
    stageTitleAr: 'مرحلة الدارات والبرمجة والكهرطيسية',
    stageSummaryAr: 'الانتقال إلى صميم التخصص: تحليل الدارات الكهربائية بالتيار المتناوب، الدخول في عالم البرمجة بلغة C#، وفهم الحقول الكهرطيسية وأسس الإلكترونيات.',
    keySkills: [
      'البرمجة كائنية التوجه (OOP) بلغة C#',
      'تحليل شبكات التيار المتناوب ودارات الرنين',
      'فيزياء أنصاف النواقل والديودات والترانزستورات',
      'معادلات ماكسويل والانتشار الكهرطيسي',
      'القياسات المخبرية ومعايرة التجهيزات'
    ],
    softwareUsed: ['Visual Studio / C#', 'Multisim', 'Arduino IDE'],
    courseIds: [
      'prog-1', 'math-3', 'elec-circuits-1', 'lang-3', 'elec-foundations', 'mat-properties',
      'elec-measurements', 'math-4', 'elec-circuits-2', 'em-fields', 'prog-2', 'lang-4'
    ],
    focusAreas: ['البرمجة وهيكلية الكائنات', 'دارات التيار المتناوب', 'المفاهيم الكهرطيسية', 'العناصر الإلكترونية الأولية']
  },
  {
    yearNumber: 3,
    titleAr: 'السنة الثالثة',
    titleEn: 'Third Year: Electronics & Signal',
    stageTitleAr: 'مرحلة الدارات الإلكترونية والنظم والتحكم',
    stageSummaryAr: 'تعميق المعرفة في تصميم مضخمات الترانزستور والـ Op-Amps، النظم المنطقية الرقمية بلغة VHDL، أنظمة التحكم الآلي، ومدخل إلى عالم هندسة الاتصالات.',
    keySkills: [
      'تصميم مضخمات الإشارة والمرشحات الفعالة',
      'توصيف الدارات الرقمية بلغة VHDL ومحاكاتها على FPGA',
      'تحليل استقرار نظم التحكم وضبط متحكمات PID',
      'برمجة الحواكم المنطقية الصناعية PLC',
      'مبادئ التعديل التماثلي وطيف الإشارة'
    ],
    softwareUsed: ['Quartus', 'ModelSim', 'Multisim', 'MATLAB', 'ZelioSoft 2', 'Arduino IDE'],
    courseIds: [
      'power-systems', 'elec-circuits-sem3-1', 'math-5', 'control-1', 'logic-circuits', 'algorithms',
      'industrial-electronics', 'elec-circuits-sem3-2', 'elec-measurements-adv', 'control-2', 'logic-systems', 'comm-fund'
    ],
    focusAreas: ['الدارات الإلكترونية التماثلية', 'الأنظمة المنطقية و VHDL', 'هندسة التحكم الآلي', 'أسس الاتصالات']
  },
  {
    yearNumber: 4,
    titleAr: 'السنة الرابعة',
    titleEn: 'Fourth Year: Advanced Communications & DSP',
    stageTitleAr: 'مرحلة معالجة الإشارة والهوائيات والميكروويف',
    stageSummaryAr: 'مستوى متقدم يشمل المعالجة الرقمية للإشارات DSP عبر MATLAB، محاكاة الهوائيات ثلاثية الأبعاد بـ HFSS، تخطيط وصلات الميكروويف، وبنيان المعالجات الصغرية.',
    keySkills: [
      'تصميم المرشحات الرقمية المتقدمة FIR/IIR في MATLAB',
      'محاكاة وتصميم الهوائيات ثلاثية الأبعاد باستخدام HFSS',
      'برمجة المتحكمات الصغرية والأنظمة المضمنة بلغة C والتجميع',
      'تخطيط ومحاكاة الوصلات الراديوية الميكروية وحساب ميزانية الوصلة',
      'تخطيط دارات CMOS المتكاملة في Microwind ومحاكاة PSpice'
    ],
    softwareUsed: ['MATLAB', 'HFSS', 'Proteus', 'Microwind', 'PSpice', 'AADE Filter Design', 'Pathloss 5', 'Google Earth', 'Arduino IDE'],
    courseIds: [
      'comp-arch', 'antennas', 'signal-processing-1', 'microelectronics', 'elec-circuits-3',
      'electroacoustics', 'microprocessors', 'signal-processing-2', 'microwaves', 'circuit-simulation', 'comm-systems-1'
    ],
    focusAreas: ['معالجة الإشارة الرقمية DSP', 'الأمواج الميكروية والهوائيات', 'المتحكمات والأنظمة المضمنة', 'الاتصالات الرقمية']
  },
  {
    yearNumber: 5,
    titleAr: 'السنة الخامسة',
    titleEn: 'Fifth Year: Specialization & Graduation',
    stageTitleAr: 'مرحلة التخصص الدقيق والاتصالات الحديثة ومشروع التخرج',
    stageSummaryAr: 'قمة الهرم الأكاديمي: الاتصالات الضوئية بالألياف، شبكات الجيل الرابع والخامس، أنظمة الرادار والسونار، شبكات الحاسوب سيسكو، وتتويج ذلك بإنجاز مشروع التخرج.',
    keySkills: [
      'تصميم ونمذجة شبكات الألياف البصرية WDM',
      'فهم بروتوكولات الاتصالات الخلوية الحديثة (4G LTE / 5G NR / MIMO)',
      'تطبيق مفاهيم الرادار وتأثير دوبلر ومعادلة الكشف',
      'تكوين وإدارة شبكات المعلومات والراوترات وبروتوكولات التوجيه',
      'إدارة وتنفيذ مشروع التخرج الهندسي والبحث العلمي'
    ],
    softwareUsed: ['OptiWave', 'Packet Tracer', 'MATLAB', 'Visual Studio', 'Proteus', 'HFSS'],
    courseIds: [
      'television-comm', 'info-theory', 'comm-systems-2', 'eng-economics',
      'optical-comm', 'radar-sonar', 'modern-comm', 'comm-networks', 'grad-project'
    ],
    focusAreas: ['شبكات الجيل الحديث 5G و MIMO', 'الاتصالات البصرية بالليزر', 'شبكات سيسكو والمعلوماتية', 'مشروع التخرج المتكامل']
  }
];
