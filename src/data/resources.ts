import { StudentResource } from '../types';

export const RESOURCES_DATA: StudentResource[] = [
  // ================= 1. FEATURED: فريق نُون الأكاديمي =================
  {
    id: 'noon-team-main',
    titleAr: 'فريق نُون الأكاديمي - المنصة الرئيسية',
    type: 'telegram',
    category: 'academic',
    categoryLabelAr: 'المصادر الأكاديمية والمبادرات الطلابية',
    descriptionAr: 'المبادرة الأكاديمية الرائدة لطلاب هندسة الإلكترونيات والاتصالات بجامعة دمشق: شروحات، ملخصات، ومتابعة يومية للمقررات.',
    source: 'فريق نُون الأكاديمي',
    tags: ['فريق نُون', 'جامعة دمشق', 'محاضرات', 'ملاحق', 'شروحات'],
    isFeatured: true,
    sections: [
      {
        labelAr: 'قناة Telegram الرسمية لفريق نُون',
        descriptionAr: 'القناة المركزية للمحاضرات المفرغة والإعلانات الدراسية.',
        isPlaceholder: true
      },
      {
        labelAr: 'حساب Instagram لفريق نُون',
        descriptionAr: 'تغطيات الحلقات والورشات العلمية والفعاليات.',
        isPlaceholder: true
      },
      {
        labelAr: 'مستودع الملاحق وحلول الدورات',
        descriptionAr: 'أرشيف منظم للمسائل وحلول الدورات الامتحانية السابقة.',
        isPlaceholder: true
      }
    ]
  },

  // ================= 2. ACADEMIC RESOURCES (محاضرات وملاحق ومراجع ومخابر) =================
  {
    id: 'academic-lectures-archive',
    titleAr: 'أرشيف المحاضرات المفرغة لسنوات القسم',
    type: 'pdf',
    category: 'academic',
    categoryLabelAr: 'المصادر الأكاديمية',
    descriptionAr: 'سلسلة المحاضرات النظرية المدققة لجميع المقررات من السنة الأولى حتى السنة الخامسة.',
    source: 'فريق نُون واللجان العلمية',
    tags: ['محاضرات', 'PDF', 'سنوات الاختصاص'],
    sections: [
      { labelAr: 'محاضرات السنة الأولى (العلوم الأساسية)', isPlaceholder: true },
      { labelAr: 'محاضرات السنة الثانية (الدارات والبرمجة)', isPlaceholder: true },
      { labelAr: 'محاضرات السنة الثالثة (النظم والاتصالات)', isPlaceholder: true },
      { labelAr: 'محاضرات السنة الرابعة (الميكروية والاتصالات المتقدمة)', isPlaceholder: true }
    ]
  },
  {
    id: 'academic-lab-guides',
    titleAr: 'أدلة التجارب والتقارير المخبرية',
    type: 'pdf',
    category: 'academic',
    categoryLabelAr: 'المصادر الأكاديمية',
    descriptionAr: 'كتيبات العمل المخبري وتوصيل الدارات العملية لمخابر القياسات، الإلكترونيات، الاتصالات، والمتحكمات.',
    source: 'مخابر كلية الهمك',
    tags: ['مخبر', 'تقارير', 'تجارب عملي'],
    sections: [
      { labelAr: 'دليل مخبر القياسات والأجهزة الكهربائية', isPlaceholder: true },
      { labelAr: 'دليل مخبر الدارات الإلكترونية 1 و 2', isPlaceholder: true },
      { labelAr: 'دليل تجارب النظم المنطقية وFPGA', isPlaceholder: true },
      { labelAr: 'دليل مخبر نظم الاتصالات التماثلية والرقمية', isPlaceholder: true }
    ]
  },
  {
    id: 'academic-textbooks-ref',
    titleAr: 'المراجع والكتب المعتمدة (Textbooks)',
    type: 'reference',
    category: 'references',
    categoryLabelAr: 'المراجع العلمية',
    descriptionAr: 'الكتب العالمية الكلاسيكية الموصى بها أكاديمياً لفهم الإلكترونيات، الاتصالات، ومعالجة الإشارة.',
    source: 'المراجع الأكاديمية العالمية',
    tags: ['Boylestad', 'Sedra Smith', 'Proakis', 'Haykin'],
    sections: [
      { labelAr: 'Electronic Devices and Circuit Theory (Boylestad)', isPlaceholder: true },
      { labelAr: 'Microelectronic Circuits (Sedra & Smith)', isPlaceholder: true },
      { labelAr: 'Digital Signal Processing: Principles & Algorithms (Proakis)', isPlaceholder: true },
      { labelAr: 'Communication Systems (Simon Haykin)', isPlaceholder: true }
    ]
  },

  // ================= 3. COMMUNICATION (تواصل وتلغرام وانستغرام) =================
  {
    id: 'comm-telegram-channels',
    titleAr: 'قنوات Telegram الرسمية للدفعات',
    type: 'telegram',
    category: 'telegram',
    categoryLabelAr: 'قنوات التواصل',
    descriptionAr: 'قنوات ومجموعات التيليغرام المخصصة لكل دفعة لتبادل الملاحظات والاستفسارات اليومية.',
    source: 'دفعات قسم الإلكترونيات',
    tags: ['تلغرام', 'دفعات', 'تواصل'],
    sections: [
      { labelAr: 'قناة دفعة السنة الأولى', isPlaceholder: true },
      { labelAr: 'قناة دفعة السنة الثانية', isPlaceholder: true },
      { labelAr: 'قناة دفعة السنة الثالثة', isPlaceholder: true },
      { labelAr: 'قناة دفعة السنة الرابعة', isPlaceholder: true },
      { labelAr: 'قناة دفعة السنة الخامسة ومشاريع التخرج', isPlaceholder: true }
    ]
  },
  {
    id: 'comm-instagram-official',
    titleAr: 'حسابات Instagram الطلابية والمجتمعية',
    type: 'instagram',
    category: 'communities',
    categoryLabelAr: 'مجتمعات الطلاب',
    descriptionAr: 'متابعة أخبار القسم والفعاليات الهندسية، معارض مشاريع التخرج، والمسابقات الروبوتية.',
    source: 'المبادرات الطلابية',
    tags: ['انستغرام', 'إعلانات', 'فعاليات'],
    sections: [
      { labelAr: 'حساب أخبار قسم الإلكترونيات والاتصالات', isPlaceholder: true },
      { labelAr: 'تغطيات معرض مشاريع التخرج السنوي', isPlaceholder: true }
    ]
  },
  {
    id: 'comm-clubs-robotics',
    titleAr: 'نوادي الروبوتيك والأنظمة المضمنة',
    type: 'website',
    category: 'communities',
    categoryLabelAr: 'مجتمعات الطلاب',
    descriptionAr: 'تجمعات شبابية هندسية لبناء الروبوتات والدارات وتطوير الأنظمة الذكية والمشاركة في البطولات.',
    source: 'النوادي الطلابية في دمشق',
    tags: ['روبوتيك', 'IoT', 'مسابقات'],
    sections: [
      { labelAr: 'نادي الروبوتيك الجامعي', isPlaceholder: true },
      { labelAr: 'ورشات عمل وتدريب وتطوير مستمر', isPlaceholder: true }
    ]
  },

  // ================= 4. TOOLS & SOFTWARE (أدوات وبرمجيات وتحميلات) =================
  {
    id: 'tools-software-installer-pack',
    titleAr: 'حزمة تثبيت البرمجيات الهندسية المعتمدة',
    type: 'software',
    category: 'software',
    categoryLabelAr: 'البرمجيات والأدوات',
    descriptionAr: 'إرشادات تنصيب برمجيات المحاكاة والبيئات الرسمية لمخابر القسم (Quartus, Multisim, MATLAB, Packet Tracer).',
    source: 'مخابر هندسة الإلكترونيات والاتصالات',
    tags: ['محاكاة', 'برامج', 'SPICE', 'Quartus', 'MATLAB'],
    sections: [
      { labelAr: 'حزمة محاكاة الدارات الإلكترونية (Multisim & SPICE)', isPlaceholder: true },
      { labelAr: 'بيئة التصميم الرقمي FPGA (Quartus Prime Lite & ModelSim)', isPlaceholder: true },
      { labelAr: 'أداة محاكاة الشبكات سيسكو (Cisco Packet Tracer)', isPlaceholder: true },
      { labelAr: 'بيئة MATLAB والحزم الإشارية (Signal Processing Toolbox)', isPlaceholder: true }
    ]
  },
  {
    id: 'tools-engineering-calculators',
    titleAr: 'مواقع وحاسبات هندسية مساعدة',
    type: 'website',
    category: 'software',
    categoryLabelAr: 'أدوات ويب',
    descriptionAr: 'أدوات عبر المتصفح لحساب قيم المقاومات، محاكاة الدارات البسيطة، وحساب خطوط النقل الميكروية.',
    source: 'أدوات ويب مفتوحة المصدر',
    tags: ['حاسبات', 'مقاومات', 'مرشحات', 'Smith Chart'],
    sections: [
      { labelAr: 'حاسبة أكواد ألوان المقاومات والمكثفات', isPlaceholder: true },
      { labelAr: 'حاسبة مخطط سميث التفاعلي (Interactive Smith Chart)', isPlaceholder: true }
    ]
  },

  // ================= 5. IMPORTANT LINKS (روابط رسمية ومؤسساتية) =================
  {
    id: 'official-university-portal',
    titleAr: 'البوابة الرسمية لجامعة دمشق وكلية الهمك',
    type: 'website',
    category: 'links',
    categoryLabelAr: 'روابط رسمية',
    descriptionAr: 'الروابط الرسمية التابعة لجامعة دمشق، كلية الهندسة الميكانيكية والكهربائية، وموقع الامتحانات الجامعية.',
    source: 'جامعة دمشق',
    tags: ['جامعة دمشق', 'الهمك', 'موقع رسمي', 'امتحانات'],
    sections: [
      { labelAr: 'الموقع الرسمي لجامعة دمشق (damascusuniversity.edu.sy)', isPlaceholder: true },
      { labelAr: 'موقع كلية الهندسة الميكانيكية والكهربائية (الهمك)', isPlaceholder: true },
      { labelAr: 'منظومة النتائج الامتحانية واللوحات الإعلانية', isPlaceholder: true }
    ]
  }
];
