import { ExhibitionFullConfig } from '../types/exhibition';

export const DEFAULT_EXHIBITION_CONFIG: ExhibitionFullConfig = {
  isVisibleToStudents: true,
  defaultPlaybackSpeed: 1.0,
  slides: [
    {
      id: 'hero',
      indexLabel: '01',
      titleAr: 'الرؤية والمنصة',
      subtitleAr: 'هندسة الإلكترونيات والاتصالات',
      durationSeconds: 8,
      isEnabled: true
    },
    {
      id: 'journey',
      indexLabel: '02',
      titleAr: 'رحلة السنوات الخمس',
      subtitleAr: 'من التأسيس حتى مشروع التخرج',
      durationSeconds: 19,
      isEnabled: true
    },
    {
      id: 'skills_pipeline',
      indexLabel: '03',
      titleAr: 'من المادة إلى المهارة',
      subtitleAr: 'ترجمة المقررات إلى كفاءات احترافية',
      durationSeconds: 12,
      isEnabled: true
    },
    {
      id: 'software_toolkit',
      indexLabel: '04',
      titleAr: 'البرمجيات الهندسية',
      subtitleAr: '16 أداة ومحاكاة معتمدة بالقسم',
      durationSeconds: 10,
      isEnabled: true
    },
    {
      id: 'graduation_projects',
      indexLabel: '05',
      titleAr: 'ماذا يمكنني بناءه؟',
      subtitleAr: 'مشاريع التخرج الهندسية المعتمدة',
      durationSeconds: 12,
      isEnabled: true
    },
    {
      id: 'careers',
      indexLabel: '06',
      titleAr: 'ماذا ستصبح؟',
      subtitleAr: 'آفاق ومجالات العمل الهندسية',
      durationSeconds: 10,
      isEnabled: true
    },
    {
      id: 'qr_portal',
      indexLabel: '07',
      titleAr: 'افتح على هاتفك',
      subtitleAr: 'رمز QR السريع والمصادر',
      durationSeconds: 12,
      isEnabled: true
    }
  ],
  hero: {
    placemarkBadge: 'جامعة دمشق • كلية الهندسة الميكانيكية والكهربائية (الهمك)',
    mainTitle: 'هندسة الإلكترونيات والاتصالات',
    subtitleGradient: 'خارطتك الأكاديمية من أول يوم حتى التخرج',
    description: 'المنصة الأكاديمية الهندسية الرسمية لطلاب القسم: الخطة التخصصية الكاملة، حزمة برمجيات المحاكاة، مستشار اللابتوب، ومسارات الربط بسوق العمل.',
    metrics: [
      {
        id: 'm1',
        number: '05',
        titleAr: 'سنوات دراسية',
        descAr: 'تدرج علمي من التأسيس للتخصص',
        colorTheme: 'cyan'
      },
      {
        id: 'm2',
        number: '10',
        titleAr: 'فصول دراسية',
        descAr: 'توزيع دقيق للمقررات والمخابر',
        colorTheme: 'blue'
      },
      {
        id: 'm3',
        number: '+50',
        titleAr: 'مقرراً تخصصياً',
        descAr: 'إلكترونيات، اتصالات، وحوسبة',
        colorTheme: 'sky'
      },
      {
        id: 'm4',
        number: '16',
        titleAr: 'برنامج محاكاة',
        descAr: 'MATLAB, HFSS, Quartus والمزيد',
        colorTheme: 'emerald'
      }
    ]
  },
  journey: {
    badgeText: 'المسار الأكاديمي المتسلسل • الخطة الدراسية المعتمدة',
    sectionTitle: 'رحلة السنوات الدراسية الخمس',
    customIntro: 'استكشف التدرج الأكاديمي الدقيق عبر السنوات الخمس من مرحلة العلوم الهندسية الأساسية حتى مشاريع التخرج التخصصية.'
  },
  skills: {
    badgeText: 'ربط المعرفة النظرية بالتطبيق العملي وسوق العمل',
    sectionTitle: 'من المادة الأكاديمية إلى المهارة المهنية',
    pipelines: [
      {
        id: 'dsp',
        titleAr: 'معالجة الإشارة الرقمية والوسائط (DSP)',
        courseAr: 'معالجة الإشارة الرقمية (1 & 2)',
        labAr: 'مخبر معالجة الإشارة والحاسوب',
        softwareAr: 'MATLAB & Simulink',
        skillAr: 'تصميم المرشحات FIR/IIR وخوارزميات ضغط الصوت والصورة',
        careerAr: 'مهندس معالجة إشارات وأنظمة صوتية ورؤية حاسوبية'
      },
      {
        id: 'rf',
        titleAr: 'الأمواج الكهرطيسية والهوائيات (RF)',
        courseAr: 'الانتشار والهوائيات + الأمواج الصغرية',
        labAr: 'مخبر الهوائيات ومرسمة المخططات الإشعاعية',
        softwareAr: 'Ansys HFSS & Pathloss 5',
        skillAr: 'محاكاة ثلاثية الأبعاد للهوائيات وحساب ميزانية الوصلة الراديوية',
        careerAr: 'مهندس اتصالات راديوية وتخطيط شبكات الميكروويف'
      },
      {
        id: 'fpga',
        titleAr: 'التصميم الرقمي والرقائق (FPGA & ASIC)',
        courseAr: 'النظم المنطقية + الإلكترونيات الدقيقة',
        labAr: 'مخبر الدارات المنطقية وشرائح التوليف',
        softwareAr: 'Intel Quartus & ModelSim',
        skillAr: 'توصيف الدارات بلغة VHDL واختبار التزامن والترددات العالية',
        careerAr: 'مهندس تصميم دارات رقمية متكاملة (Digital IC / FPGA)'
      },
      {
        id: 'networks',
        titleAr: 'شبكات المعطيات وبروتوكولات الإنترنت',
        courseAr: 'شبكات المعطيات + شبكات الاتصالات',
        labAr: 'مخبر الشبكات وراوترات وسويتشات سيسكو',
        softwareAr: 'Cisco Packet Tracer & Wireshark',
        skillAr: 'توجيه حزم البيانات، تصميم شبكات VLAN، وتحليل حركة الحزم',
        careerAr: 'مهندس شبكات اتصالات وبنية تحتية (Network Engineer / CCNA)'
      },
      {
        id: 'embedded',
        titleAr: 'الأنظمة المضمنة والمعالجات الصغرية (Embedded)',
        courseAr: 'المعالجات الصغرية وبنيان الحواسيب',
        labAr: 'مخبر النظم الصغرية والمتحكمات',
        softwareAr: 'Keil uVision, Proteus & Arduino',
        skillAr: 'برمجة العتاد بلغة C، المقاطعات (Interrupts)، وبروتوكولات I2C/SPI/UART',
        careerAr: 'مهندس أنظمة مضمنة وعتاد ذكي (Embedded Systems & Firmware)'
      }
    ]
  },
  software: {
    badgeText: 'الحزمة البرمجية التخصصية المعتمدة في مخابر القسم',
    sectionTitle: 'حزمة برمجيات المحاكاة والتصميم (16 أداة)',
    descriptionHint: 'البرمجيات والأدوات المعتمدة رسمياً في المخابر التطبيقية لقسم هندسة الإلكترونيات والاتصالات بجامعة دمشق.'
  },
  graduationProjects: {
    badgeText: 'نماذج مشاريع التخرج الهندسية المعتمدة في القسم',
    sectionTitle: 'ما الذي يمكنني بناءه؟ (مشاريع تخرج تخصصية)',
    descriptionHint: 'مشاريع تخرج هندسية واقعية تربط الجانب النظري بالعتاد وبرمجيات المحاكاة المتقدمة.'
  },
  careers: {
    badgeText: 'الآفاق الهندسية وفرص العمل المحلية والعالمية',
    sectionTitle: 'ماذا ستصبح بعد التخرج؟ (8 مسارات مهنية)',
    careers: [
      {
        id: 'c1',
        titleAr: 'مهندس شبكات واتصالات لاسلكية',
        titleEn: 'Wireless & 5G Systems Engineer',
        domain: 'مشغلو الاتصالات، مزودو الخدمة، الاتصالات الخلوية 4G/5G',
        iconKey: 'Radio',
        colorClass: 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300'
      },
      {
        id: 'c2',
        titleAr: 'مهندس أمواج ميكروية وهوائيات',
        titleEn: 'RF & Microwave Engineer',
        domain: 'تخطيط الوصلات، محاكاة الهوائيات، المحطات الأرضية والرادارية',
        iconKey: 'Activity',
        colorClass: 'border-blue-500/40 bg-blue-950/40 text-blue-300'
      },
      {
        id: 'c3',
        titleAr: 'مهندس أنظمة مضمنة ومعالجات',
        titleEn: 'Embedded Systems & Firmware',
        domain: 'صناعة السيارات الذكية، العتاد الطبي، إنترنت الأشياء IoT',
        iconKey: 'Cpu',
        colorClass: 'border-sky-500/40 bg-sky-950/40 text-sky-300'
      },
      {
        id: 'c4',
        titleAr: 'مهندس تصميم دارات رقمية FPGA',
        titleEn: 'FPGA & Digital IC Designer',
        domain: 'تصميم الرقائق الإلكترونية، العتاد عالي السرعة، معالجة الفيديو',
        iconKey: 'Terminal',
        colorClass: 'border-indigo-500/40 bg-indigo-950/40 text-indigo-300'
      },
      {
        id: 'c5',
        titleAr: 'مهندس معالجة إشارة ورؤية حاسوبية',
        titleEn: 'DSP & Audio/Vision Engineer',
        domain: 'خوارزميات الذكاء الصنعي على العتاد، ضغط الصوتيات، الرادار',
        iconKey: 'Zap',
        colorClass: 'border-purple-500/40 bg-purple-950/40 text-purple-300'
      },
      {
        id: 'c6',
        titleAr: 'مهندس شبكات حاسوبية وبنى تحتية',
        titleEn: 'Data Networks & Cloud Infrastructure',
        domain: 'مراكز البيانات، إدارة شبكات Cisco، أمن بروتوكولات الاتصال',
        iconKey: 'Wifi',
        colorClass: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
      },
      {
        id: 'c7',
        titleAr: 'مهندس إلكترونيات صناعية وتحكم',
        titleEn: 'Industrial Electronics & Automation',
        domain: 'الأتمتة، محركات القدرة، المتحكمات المنطقية القابلة للبرمجة PLC',
        iconKey: 'ShieldCheck',
        colorClass: 'border-amber-500/40 bg-amber-950/40 text-amber-300'
      },
      {
        id: 'c8',
        titleAr: 'مهندس ألياف ضوئية واتصالات ليزرية',
        titleEn: 'Fiber Optics & Photonics Engineer',
        domain: 'شبكات DWDM البحرية والأرضية، مقاسم الألياف، الحساسات الضوئية',
        iconKey: 'Zap',
        colorClass: 'border-teal-500/40 bg-teal-950/40 text-teal-300'
      }
    ]
  },
  qrPortal: {
    badgeText: 'المسح الفوري المباشر عبر كاميرا هاتفك المحمول',
    title: 'استكشف ECE RoadMap الآن على هاتفك',
    description: 'امسح الرمز لفتح الخطة الكاملة، فحص مواصفات حاسوبك، وتحميل مصادر البرمجيات ومجموعات الدفعات مباشرة.',
    customQrUrl: 'https://www.eceroadmap.workers.dev/',
    qrTitle: 'مسح رمز المنصة',
    qrSubtitle: 'وجّه كاميرا هاتفك لفتح الرابط',
    pillars: [
      { id: 'p1', title: 'خارطة 5 سنوات', iconKey: 'Map' },
      { id: 'p2', title: 'مستشار اللابتوب', iconKey: 'Laptop' },
      { id: 'p3', title: '16 أداة محاكاة', iconKey: 'Cpu' },
      { id: 'p4', title: 'Student Hub', iconKey: 'GraduationCap' }
    ]
  }
};
