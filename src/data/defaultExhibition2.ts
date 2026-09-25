import { Exhibition2FullConfig } from '../types/exhibition2';
import { CANONICAL_PRODUCTION_URL } from '../lib/firebase';

export const DEFAULT_EXHIBITION2_CONFIG: Exhibition2FullConfig = {
  version: '2.0.0',
  playback: {
    defaultSpeed: 'medium',
    autoLoop: true,
    ambientSoundEnabled: true,
    highPerformance3D: true
  },
  scenes: [
    {
      id: 'hero',
      index: 1,
      titleAr: 'المشهد الأول: نبض التكنولوجيا',
      subtitleAr: 'من الإشارة... إلى الجهاز... إلى العالم',
      badge: 'HERO SCENE',
      durationSeconds: 16,
      isEnabled: true
    },
    {
      id: 'why_ece',
      index: 2,
      titleAr: 'المشهد الثاني: لماذا هندسة الاتصالات والإلكترونيات؟',
      subtitleAr: 'أركان الثورة التقنية الأربعة',
      badge: 'WHY ECE?',
      durationSeconds: 22,
      isEnabled: true
    },
    {
      id: 'journey_years',
      index: 3,
      titleAr: 'المشهد الثالث: رحلة الطالب عبر السنوات',
      subtitleAr: 'المسار الأكاديمي الصاعد من الأساس حتى التخصص والابتكار',
      badge: 'ACADEMIC TIMELINE',
      durationSeconds: 24,
      isEnabled: true
    },
    {
      id: 'projects_expo',
      index: 4,
      titleAr: 'المشهد الرابع: معرض المشاريع التفاعلي ثلاثي الأبعاد',
      subtitleAr: 'محاكاة حية لنماذج حقيقية برمجها وبناها مهندسو المستقبل',
      badge: '3D PROJECTS EXPO',
      durationSeconds: 30,
      isEnabled: true
    },
    {
      id: 'fit_quiz',
      index: 5,
      titleAr: 'المشهد الخامس: هل يناسبك الفرع؟',
      subtitleAr: 'أهلاً في جناح هندسة الالكترونيات والاتصالات - اختبر توافقك الآن وشارك النتيجة',
      badge: 'STUDENT FIT QUIZ',
      durationSeconds: 18,
      isEnabled: true
    },
    {
      id: 'roadmap_tool',
      index: 6,
      titleAr: 'المشهد السادس: منصة EceRoadMap التفاعلية',
      subtitleAr: 'البوصلة الأكاديمية المصنوعة بأيدي الطلاب لمرافقتك خطوة بخطوة',
      badge: 'ROADMAP TOOL & QR',
      durationSeconds: 20,
      isEnabled: true
    },
    {
      id: 'comparison',
      index: 7,
      titleAr: 'المشهد السابع: مقارنة القسم مع باقي الفروع الهندسية',
      subtitleAr: 'صناعة التكنولوجيا الحقيقية من المادة السيليكونية إلى شبكات الفضاء',
      badge: 'ENGINEERING BENCHMARK',
      durationSeconds: 22,
      isEnabled: true
    }
  ],

  // Scene 1 Content
  heroScene: {
    tagline: 'هنا تبدأ رحلة صناعة التكنولوجيا',
    mainHeadline: 'من الإشارة... إلى الجهاز... إلى العالم',
    shortBio: 'هندسة الاتصالات والإلكترونيات هي المجال الذي يجمع بين الإلكترونيات، البرمجة، الأنظمة الذكية والاتصالات لبناء تقنيات المستقبل.',
    pills: [
      'Microcontrollers & ESP32',
      '5G & Satellite Communications',
      'VLSI & Silicon Design',
      'AI & Edge Computing',
      'Optical Fiber Networks'
    ]
  },

  // Scene 2 Content
  whyEceScene: {
    headline: 'لماذا هندسة الاتصالات والإلكترونيات؟',
    subheadline: 'أربعة أعمدة علمية تجعلك تصنع التكنولوجيا بدلاً من مجرد استهلاكها',
    domains: [
      {
        id: 'embedded',
        titleAr: 'الأنظمة المدمجة (Embedded Systems)',
        titleEn: 'Embedded Systems & IoT',
        summary: 'هي جعل الأجهزة تفكر وتتصرف باستخدام المتحكمات والحساسات والبرمجة منخفضة المستوى.',
        iconName: 'Cpu',
        color: 'from-cyan-500 to-blue-600',
        techPill: 'ESP32 / ARM / STM32',
        examples: [
          'الروبوتات المستقلة',
          'السيارات الذكية وذاتية القيادة',
          'الساعات الذكية والمستشعرات الحيوية',
          'الأجهزة الطبية المنقذة للحياة'
        ]
      },
      {
        id: 'communications',
        titleAr: 'الاتصالات وشبكات المستقبل (Communications)',
        titleEn: 'Next-Gen Communications',
        summary: 'هي العلم الذي يجعل المعلومات تنتقل بين الأجهزة بسرعة الضوء عبر الهواء، الفضاء، والألياف الضوئية.',
        iconName: 'Radio',
        color: 'from-emerald-400 to-teal-600',
        techPill: '5G / 6G / Satellites / Fiber',
        examples: [
          'شبكات الهاتف الخلوي والجيل الخامس 5G',
          'الاتصالات الفضائية والأقمار الصناعية',
          'الألياف الضوئية فائقة السرعة',
          'الرادار وأنظمة الملاحة البحرية والجوية'
        ]
      },
      {
        id: 'digital_systems',
        titleAr: 'الأنظمة الرقمية والعتاد (Digital Systems)',
        titleEn: 'Digital Design & VLSI',
        summary: 'تصميم وبناء البنى المعمارية الداخلية التي تعمل داخل الحواسيب، المعالجات، والشرائح الذكية.',
        iconName: 'Layers',
        color: 'from-amber-400 to-orange-600',
        techPill: 'VHDL / FPGA / Silicon ICs',
        examples: [
          'تصميم المعالجات الدقيقة والشرائح السيليكونية',
          'الذواكر عالية السرعة RAM/ROM',
          'مصفوفات البوابات القابلة للبرمجة (FPGA)',
          'هندسة العتاد Hardware Architecture'
        ]
      },
      {
        id: 'signal_ai',
        titleAr: 'معالجة الإشارة والذكاء الاصطناعي (DSP & AI)',
        titleEn: 'Digital Signal Processing & AI',
        summary: 'تحويل البيانات الفيزيائية الخام من أصوات وموجات وصور إلى معلومات رقمية يفهمها النظام ويتخذ قرارات فورية بشأنها.',
        iconName: 'Zap',
        color: 'from-purple-500 to-indigo-600',
        techPill: 'DSP / Edge AI / Computer Vision',
        examples: [
          'الرؤية الحاسوبية والتعرف على الوجوه',
          'معالجة الإشارات الصوتية والطبية (ECG/EEG)',
          'ضغط وتشفير البيانات الفضائية',
          'أنظمة الذكاء الاصطناعي على العتاد المدمج (Edge AI)'
        ]
      }
    ]
  },

  // Scene 3 Content
  journeyScene: {
    headline: 'رحلة الطالب خلال السنوات الخمس',
    subheadline: 'مسار تصاعدي ينقلك من مبادئ الرياضيات والفيزياء إلى قمة الابتكار الهندسي وتصميم شبكات الفضاء',
    stages: [
      {
        yearNumber: 1,
        titleAr: 'السنة الأولى',
        stageName: 'بناء الأساس الهندسي المتين',
        subjects: ['الرياضيات الهندسية', 'الفيزياء التطبيقية', 'مبادئ الكهرباء', 'مقدمة في الحاسوب والبرمجة'],
        effectDescription: 'ظهور أساسات معمارية ثم بناء دائرة إلكترونية متوهجة فوقها ترسي القواعد الصلبة.',
        visualIcon: 'Compass',
        color: 'cyan'
      },
      {
        yearNumber: 2,
        titleAr: 'السنة الثانية',
        stageName: 'الدخول إلى عالم الهندسة الحقيقي',
        subjects: ['تحليل الدارات الكهربائية', 'البرمجة بلغة C/C++', 'الحقول الكهرطيسية', 'أساسيات الإلكترونيات والديودات'],
        effectDescription: 'إشارة كهربائية تتحرك داخل دارة مغلقة وتتفاعل مع المكونات في الوقت الحقيقي.',
        visualIcon: 'Activity',
        color: 'blue'
      },
      {
        yearNumber: 3,
        titleAr: 'السنة الثالثة',
        stageName: 'مرحلة التصميم والتحكم الدقيق',
        subjects: ['تصميم الترانزستورات وتكبير الإشارة', 'مكبرات العمليات Op-Amps', 'الأنظمة الرقمية VHDL', 'التحكم الآلي المستمر', 'مدخل إلى نظم الاتصالات'],
        effectDescription: 'ترانزستور وحيد يتضاعف تدريجياً ليتشابك ويتحول إلى معالج دقيق فائق القدرة.',
        visualIcon: 'Cpu',
        color: 'emerald'
      },
      {
        yearNumber: 4,
        titleAr: 'السنة الرابعة والخامسة',
        stageName: 'مرحلة التخصص العميق والتطبيق والمشروع',
        subjects: ['الاتصالات الضوئية والألياف', 'شبكات الحاسوب والبروتوكولات', 'الرادار ونظم الميكروويف', 'الاتصالات الفضائية واللاسلكية', 'مشروع التخرج الهندسي'],
        effectDescription: 'مشهد مستقبلي يجمع: قمر صناعي في الفضاء + ألياف ضوئية متوهجة + شبكة أجهزة ذكية مترابطة.',
        visualIcon: 'Radio',
        color: 'purple'
      }
    ]
  },

  // Scene 4 Content
  projectsScene: {
    headline: 'معرض المشاريع التفاعلي ثلاثي الأبعاد',
    subheadline: 'انقر ودور الأجهزة وشاهد كيف تتحول الأكواد والدوائر إلى حلول واقعية تنبض بالحياة',
    projects: [
      {
        id: 'esp32_memory',
        titleAr: 'لعبة الذاكرة التفاعلية بالـ ESP32',
        tagline: 'نظام مدمج ذكي يعتمد على تفاعل المستخدم والإشارات الرقمية',
        category: 'الأنظمة المدمجة (Embedded Systems)',
        hardware: ['ESP32 Dual-Core', '4x Color Tactile LEDs', '4x Push Buttons', 'Active Piezo Buzzer', 'OLED Display'],
        sequenceSteps: [
          'المتحكم يولد نمطاً عشوائياً من النبضات',
          'إضاءة الـ LEDs تباعاً مع نغمات صوتية متناسقة',
          'المستخدم يضغط الأزرار لمطابقة التسلسل المخزن',
          'المتحكم يقيس سرعة الاستجابة ويحفظ المستوى في الذاكرة'
        ],
        explanation: 'هذا مشروع نظام مدمج، حيث يقوم المتحكم ESP32 بقراءة المدخلات، معالجة البيانات، ثم التحكم بالمخرجات بأزمنة استجابة لحظية في أجزاء من الميلي ثانية.',
        realWorldApps: ['الألعاب الإلكترونية التفاعلية', 'أنظمة التحكم الصناعي الآلي', 'الأجهزة الذكية المنزلية (Smart Home)'],
        interactiveDemoType: 'esp32_memory'
      },
      {
        id: 'rfid_scanner',
        titleAr: 'نظام القراءة اللاسلكي RFID والموجات الكهرومغناطيسية',
        tagline: 'نقل البيانات اللاسلكي السريع عبر الحث الكهرومغناطيسي',
        category: 'الاتصالات اللاسلكية والتعريف الآلي',
        hardware: ['RC522 RFID Reader Module', '13.56 MHz NFC/RFID Cards & Keyfobs', 'Microcontroller UART/SPI', 'Status LEDs & Relay'],
        sequenceSteps: [
          'انبعاث حقل كهرومغناطيسي ترددي من قارئ الـ RFID',
          'شحن شريحة البطاقة لاسلكياً بواسطة ظاهرة الحث المتبادل',
          'إرسال المعرف الفريد (UID) مشفراً عبر الهواء للمستشعر',
          'التحقق من الصلاحيات وفتح القفل الذكي وتسجيل الحضور'
        ],
        explanation: 'تقنية التعرف اللاسلكي على الأشياء (RFID) تعتمد على فيزياء الموجات الكهرومغناطيسية لتبادل البيانات دون أي تلامس ميكانيكي.',
        realWorldApps: ['بطاقات الدخول الذكية للجامعات والشركات', 'أنظمة الدفع الإلكتروني اللاسلكي (NFC / Contactless)', 'تتبع الشحنات والمنتجات عالمياً', 'أنظمة الحماية والأمن السيبراني العتادي'],
        interactiveDemoType: 'rfid_scanner'
      },
      {
        id: 'ultrasonic_servo',
        titleAr: 'روبوت الاستشعار والقرار بالموجات فوق الصوتية و Servo',
        tagline: 'استشعار البيئة المحيطة واتخاذ القرار الحركي الفوري',
        category: 'الروبوتات وأنظمة القيادة الذاتية',
        hardware: ['HC-SR04 Ultrasonic Sensor', 'High-Torque Micro Servo Motor', 'Arduino / ESP32 Controller', 'RGB Distance Indicator'],
        sequenceSteps: [
          'إطلاق نبضات صوتية بتردد 40kHz في الهواء',
          'حساب زمن ارتداد الصدى الصوتي بدقة ميكروثانية',
          'حساب المسافة الفيزيائية عبر سرعة الصوت (340 m/s)',
          'المحرك Servo يتحرك تلقائياً لتحية الشخص أو توجيه مسار الروبوت'
        ],
        explanation: 'نظام يستشعر البيئة المحيطة ويتخذ قراراً حركياً؛ يمثل النواة الأساسية لعيون الروبوتات وتفادي العوائق في المركبات الحديثة.',
        realWorldApps: ['الأبواب الذكية ذاتية الفتح', 'حساسات الاصطفاف والفرملة التلقائية في السيارات', 'روبوتات الاستكشاف والمستودعات', 'أنظمة التفاعل البشري الروبوتي'],
        interactiveDemoType: 'ultrasonic_servo'
      },
      {
        id: 'computer_vision',
        titleAr: 'نظام الرؤية الحاسوبية وتعقب الوجوه بكاميرا متحركة',
        tagline: 'استخدام الكاميرا كعين للنظام وتحليل الصور بأوامر حركة فورية',
        category: 'الذكاء الاصطناعي ومعالجة الصور المتقدمة',
        hardware: ['HD Camera Module / ESP32-CAM', 'Pan-Tilt Dual Servo Gimbal', 'OpenCV / MediaPipe Processing Unit', 'Neural Feature Extractor'],
        sequenceSteps: [
          'التقاط الفيديو بمعدل 30 إطاراً في الثانية',
          'تحليل مصفوفة البكسلات واكتشاف معالم الوجه بدقة',
          'حساب إحداثيات مركز الوجه بالنسبة لمركز العدسة',
          'إرسال إشارات PWM للمحركات لتدوير الكاميرا ومتابعة الهدف بسلاسة'
        ],
        explanation: 'هنا نستخدم الكاميرا كعين للنظام، حيث يتم تحليل الصورة وتحويلها إلى أوامر حركة؛ دمج مذهل بين معالجة الصور الرقمية والتحكم العتادي الدقيق.',
        realWorldApps: ['السيارات ذاتية القيادة (Tesla / Autonomous Vehicles)', 'الروبوتات الاجتماعية التفاعلية', 'أنظمة المراقبة الأمنية الذكية', 'كاميرات المؤتمرات الموجهة آلياً'],
        interactiveDemoType: 'computer_vision'
      }
    ]
  },

  // Scene 5 Content
  fitQuizScene: {
    headline: 'هل يناسبك فرع هندسة الاتصالات والإلكترونيات؟',
    subheadline: 'أهلاً في جناح هندسة الالكترونيات والاتصالات - اختبر توافقك الآن وشارك النتيجة',
    welcomeMessage: 'إذا كنت تتساءل كيف يعمل هاتفك، كيف تُصنع المعالجات، وكيف تنتقل بياناتك عبر القارات في ثوانٍ، فهنا مكانك الطبيعي!',
    traits: [
      {
        title: 'شغف فهم "كيف تعمل الأشياء"',
        desc: 'لا ترغب فقط في تحميل التطبيقات؛ بل تريد تفكيك الأجهزة ومعرفة كيف تتحدث الدوائر والرقاقات مع بعضها.',
        icon: 'Cpu'
      },
      {
        title: 'عشق الجمع بين البرمجة والعتاد الفيزيائي',
        desc: 'أجمل لحظة لديك عندما تكتب كوداً برمجياً يضيء LED أو يدير محركاً أو يرسل حزمة لاسلكية تراها بعينك.',
        icon: 'Zap'
      },
      {
        title: 'الفضول حول شبكات المستقبل والجيل القادم',
        desc: 'اهتمام بتقنيات الـ 5G، الأقمار الصناعية، إنترنت الأشياء، والتحكم بالروبوتات من أي مكان في العالم.',
        icon: 'Radio'
      },
      {
        title: 'مهارات التفكير المنطقي وحل المشكلات',
        desc: 'القدرة على تتبع الإشارة خطوة بخطوة وكشف الأعطال المعقدة في الدارات والأنظمة المدمجة.',
        icon: 'Activity'
      }
    ]
  },

  // Scene 6 Content
  roadmapScene: {
    headline: 'منصة EceRoadMap: دليلك الأكاديمي الشامل',
    subheadline: 'البوصلة الهندسية المعتمدة لطلاب القسم في جامعة دمشق',
    quote: 'هذه الخريطة صنعها طلاب القسم لمساعدة الطالب على معرفة طريقه خلال سنوات الدراسة.',
    qrUrl: CANONICAL_PRODUCTION_URL,
    qrDescription: 'امسح رمز الـ QR بكاميرا هاتفك لفتح المنصة فوراً وتصفح المقررات، المهارات، والمستشار الأكاديمي الذكي.'
  },

  // Scene 7 Content
  comparisonScene: {
    headline: 'مقارنة هندسة الاتصالات والإلكترونيات مع باقي الفروع',
    subheadline: 'نقطة التوازن العبقرية: صناعة التكنولوجيا من الصفر وليس مجرد برمجتها أو تشغيلها',
    takeawayMessage: 'هذا ليس فرعاً يعلمك استخدام التكنولوجيا فقط، بل فرع يعلمك كيف تصنعها وتتحكم بفيزيائها من الصفر.',
    departments: [
      {
        deptId: 'ece',
        deptNameAr: 'هندسة الإلكترونيات والاتصالات (ECE)',
        primaryFocus: 'صناعة العتاد، المعالجات، إنترنت الأشياء (IoT)، شبكات الـ 5G، البرمجة المدمجة، والأنظمة الذكية المتصلة.',
        hardwareVsSoftware: 'توازن احترافي متكامل 50% عتاد إلكتروني فيزيائي + 50% برمجة أنظمة وتحكم.',
        keyDifferentiator: 'المهندس الوحيد القادر على تصميم الشريحة السيليكونية وبرمجتها وربطها بالشبكات اللاسلكية.',
        iconName: 'Sparkles',
        isECE: true
      },
      {
        deptId: 'cse',
        deptNameAr: 'هندسة الحواسيب والبرمجيات',
        primaryFocus: 'تطوير البرمجيات العليا، قواعد البيانات الضخمة، الويب، وتطبيقات الهاتف الذكي وتراكيب البيانات المجردة.',
        hardwareVsSoftware: 'تركيز برمجي غالباً 85% سوفتوير ونظم تشغيل + 15% عتاد كمبيوتر.',
        keyDifferentiator: 'يركز على التطبيقات التي تعمل فوق العتاد الجاهز، بينما مهندس الـ ECE يصنع ذلك العتاد أصلاً.',
        iconName: 'Laptop'
      },
      {
        deptId: 'power',
        deptNameAr: 'الهندسة الكهربائية (قوى وآلات)',
        primaryFocus: 'محطات توليد الطاقة، المحولات العملاقة، محركات الجهد العالي، وشبكات النقل الكهربائي القومي.',
        hardwareVsSoftware: 'جهود وتيارات ضخمة (كيلوفولت / ميغاواط)، وأنظمة حماية شبكات الطاقة.',
        keyDifferentiator: 'يتعامل مع الطاقة الكبيرة لنقل الكهرباء، بينما ECE يتعامل مع الإشارات الدقيقة لنقل المعلومات والبيانات.',
        iconName: 'Zap'
      },
      {
        deptId: 'mechatronics',
        deptNameAr: 'هندسة الميكاترونكس',
        primaryFocus: 'دمج الميكانيك الكلاسيكي والتروس والهيدروليك مع دوائر التحكم الإلكتروني في خطوط الإنتاج والمصانع.',
        hardwareVsSoftware: 'مزيج هجين بين الهندسة الميكانيكية والإلكترونية والبرمجة الصناعية PLC.',
        keyDifferentiator: 'يركز على الحركة الميكانيكية للآلات، بينما ECE يتعمق في فيزياء السيليكون، ومعالجة الإشارات والاتصالات اللاسلكية.',
        iconName: 'Cpu'
      }
    ]
  }
};
