import { GraduationProject } from '../types/academicIntelligence';

export const GRADUATION_PROJECTS_DATA: GraduationProject[] = [
  {
    id: 'proj_sdr_5g_mimo',
    titleAr: 'تصميم واختبار نظام إرسال واستقبال MIMO-OFDM باستخدام الراديو المعرف برمجياً (SDR)',
    titleEn: 'Design and Implementation of MIMO-OFDM Transceiver Using Software-Defined Radio (SDR)',
    track: 'communications',
    trackAr: 'أنظمة الاتصالات واللاسلكي',
    difficulty: 'advanced',
    difficultyAr: 'متقدم / تطبيقي',
    summaryAr: 'بناء سلسلة إرسال واستقبال لاسلكية كاملة بتقنية MIMO 2x2 و تعديل OFDM على منصات USRP / HackRF One، مع محاكاة في بيئة MATLAB / GNU Radio وتحليل أداء معدل الخطأ في البت (BER) ونسبة الإشارة إلى الضجيج (SNR) في قنوات الخفوت.',
    problemStatementAr: 'تواجه شبكات الجيل الخامس والحالي متطلبات هائلة لزيادة سعة القناة ومعدل نقل البيانات دون استهلاك حزم ترددية إضافية. يهدف المشروع لاختبار خوارزميات التشفير المكاني Space-Time Block Coding (STBC) والتشفير الترددي OFDM على عتاد SDR حقيقي في مخابر قسم الاتصالات.',
    objectivesAr: [
      'نمذجة وتوليد إشارات OFDM مع بادئة دورية Cyclic Prefix ومزامنة التوقيت والتردد.',
      'تطبيق خوارزمية Alamouti STBC لـ 2T2R واختبار مكاسب التنوع المكاني Spatial Diversity.',
      'ربط حزم البرمجة MATLAB و GNU Radio مع أجهزة USRP B210 أو HackRF One.',
      'قياس أداء النظام الواقعي ومقارنته مع النتائج النظرية لقنوات Rayleigh و Rician Fading.'
    ],
    requiredSkills: [
      'فهم عميق للتعديل الرقمي (QAM, PSK) و OFDM',
      'برمجة MATLAB ومعالجة الإشارات اللاسلكية',
      'استخدام GNU Radio و C++/Python للمحاكاة الراديوية',
      'التعامل مع محللات الطيف Spectrum Analyzers ومنصات SDR'
    ],
    requiredSoftware: ['matlab', 'gnuradio'],
    requiredHardware: ['Ettus USRP B210 أو HackRF One', 'هوائيات متعددة النطاق 2.4GHz / 5GHz', 'جهاز حاسوب ذو معالج متعدد الأنوية', 'كابلات SMA عالية التردد ومخمدات RF'],
    relatedCourseIds: ['comm_theory_1', 'comm_theory_2', 'wireless_networks', 'dsp', 'info_theory'],
    suggestedTeamSize: '3 - 4 طلاب',
    suggestedPhases: [
      {
        phaseTitleAr: 'المرحلة 1: المحاكاة النظرية والنمذجة الرياضية',
        durationAr: 'شهرين (فصل أول)',
        tasksAr: [
          'كتابة خوارزميات التضمين والتفكيك OFDM في MATLAB.',
          'محاكاة قناة الخفوت Rayleigh وحساب مصفوفة استجابة القناة H.',
          'التحقق من منحنيات BER vs SNR للتعديل الفضائي والزمني.'
        ]
      },
      {
        phaseTitleAr: 'المرحلة 2: التكامل مع بيئة GNU Radio والعتاد الراديوي',
        durationAr: 'شهرين ونصف',
        tasksAr: [
          'تصميم Flowgraphs في GNU Radio لبث واستقبال البتات في الوقت الحقيقي.',
          'معايرة تعويض إزاحة التردد الحامل (CFO) وإزاحة أخذ العينات (SFO).',
          'بث حزم بيانات حقيقية (صور أو نص) بين نقطتين.'
        ]
      },
      {
        phaseTitleAr: 'المرحلة 3: القياسات المخبرية وتوثيق الأطروحة',
        durationAr: 'شهر ونصف (نهاية الفصل الثاني)',
        tasksAr: [
          'قياس قدرة الإشارة واستجابة القناة في ظروف مخبرية متعددة.',
          'توثيق كود المشروع وكتابة التقرير النهائي والعرض التقديمي.'
        ]
      }
    ],
    supervisorTipsAr: 'احرصوا على البدء بالمحاكاة الكاملة في MATLAB قبل لمس عتاد الـ SDR لتجنب حرق مكبرات القدرة RF والتأكد من صحة خوارزميات التزامن.',
    tags: ['5G', 'SDR', 'MIMO', 'OFDM', 'MATLAB', 'GNU Radio', 'Wireless']
  },
  {
    id: 'proj_smart_microgrid_embedded',
    titleAr: 'نظام إدارة طاقة ذكي للشبكات المصغرة (Smart Microgrid EMS) باستخدام STM32 و FreeRTOS',
    titleEn: 'Smart Microgrid Energy Management System with STM32 and Real-Time OS',
    track: 'embedded',
    trackAr: 'النظم المضمنة والروبوتات',
    difficulty: 'advanced',
    difficultyAr: 'متقدم / هندسي صناعي',
    summaryAr: 'تصميم وحدة تحكم طرفية صناعية متطورة لمراقبة وإدارة مصادر الطاقة المتجددة (ألواح شمسية وبطاريات وشبكة عامة) تعتمد معالج ARM Cortex-M4، مع نظام تشغيل بالوقت الحقيقي FreeRTOS وبروتوكولات اتصالات Modbus / MQTT.',
    problemStatementAr: 'تتطلب أنظمة الطاقة الشمسية وتوزيع الأحمال في المنشآت الصناعية والمنازل تحكماً آنياً فائق السرعة لحماية البطاريات وتحسين استجرار الطاقة والتبديل التلقائي بين المصادر دون انقطاع، مع رصد البيانات عن بعد.',
    objectivesAr: [
      'تصميم دارة إلكترونية متكاملة لجمع بيانات الجهد والتيار المستمر والمتناوب (ADC بدقة عالية وعزل بصري).',
      'تطوير برنامج مضمن باستخدام FreeRTOS لإدارة المهام المتعددة (قراءة الحساسات، حساب الطاقة، التحكم بالريليهات).',
      'تطبيق خوارزمية MPPT (تتبع نقطة الاستطاعة العظمى) لتحسين كفاءة الخلايا الكهروضوئية.',
      'تأمين واجهة مراقبة وتحكم عن بعد باستخدام ESP32 وبروتوكول MQTT المتصل بلوحة تحكم Dashboard.'
    ],
    requiredSkills: [
      'البرمجة بلغة C المضمنة C/Embedded C',
      'تطوير النظم بالوقت الحقيقي (FreeRTOS: Tasks, Queues, Mutexes, Semaphores)',
      'تصميم لوحات الدارات المطبوعة (Altium Designer / KiCad)',
      'حسابات إلكترونيات القدرة والدارات الكهربائية'
    ],
    requiredSoftware: ['altium', 'proteus', 'clion_cubeide'],
    requiredHardware: ['متحكم STM32F401 / STM32F411 Nucleo Board', 'حساسات تيار Hall Effect ACS712 / SCT-013', 'دارة قياس الجهد المتناوب والمستمر مع عزل بصري Optocouplers', 'وحدة تتابع Relays وشاشة صناعية Nextion / OLED', 'وحدة واي فاي ESP32'],
    relatedCourseIds: ['microprocessors', 'embedded_systems', 'power_electronics', 'digital_logic', 'electronic_circuits_2'],
    suggestedTeamSize: '3 طلاب',
    suggestedPhases: [
      {
        phaseTitleAr: 'المرحلة 1: المحاكاة وتصميم مخطط الـ PCB',
        durationAr: 'شهرين',
        tasksAr: [
          'محاكاة دارة القياس والتحكم على برامج Proteus و Multisim.',
          'رسم المخطط التخطيطي Schematic وتصميم لوحة PCB على Altium مع حساب المسارات الآمنة لجهد 220V.',
          'تصنيع اللوحة وتجميع المكونات واختبار الجهد المعزول.'
        ]
      },
      {
        phaseTitleAr: 'المرحلة 2: تطوير برمجية المتحكم ونظام FreeRTOS',
        durationAr: 'شهرين ونصف',
        tasksAr: [
          'تهيئة مؤقتات الـ PWM ومحولات ADC عبر DMA لسرعة القراءة.',
          'برمجة مهام FreeRTOS وتطبيق خوارزمية MPPT وحساب القدرة الفعالة والردية.',
          'برمجة بروتوكول Modbus RTU / MQTT.'
        ]
      },
      {
        phaseTitleAr: 'المرحلة 3: الاختبار العملي والأمان والمعايرة',
        durationAr: 'شهر ونصف',
        tasksAr: [
          'ربط النظام مع حمل فعلي ولوح طاقة شمسية واختبار استجابة النظام للحمولات المفاجئة.',
          'معايرة دقة قياس الجهد والتيار ومقارنتها مع أجهزة فلومتر دقيقة.'
        ]
      }
    ],
    supervisorTipsAr: 'انتبهوا جداً لإجراءات السلامة والعزل الكهربائي بين دارات الجهد المنخفض (المتحكم 3.3V) والجهد المرتفع 220V، واستخدموا Optocouplers وتأريضاً مناسباً.',
    tags: ['STM32', 'FreeRTOS', 'Embedded', 'IoT', 'Altium', 'Power Electronics', 'ARM']
  },
  {
    id: 'proj_ecg_dsp_classification',
    titleAr: 'نظام تشخيص اضطرابات النظم القلبي الفوري باستخدام معالجة الإشارة الرقمية والذكاء الصنعي على FPGA',
    titleEn: 'Real-Time ECG Arrhythmia Detection and Classification on FPGA using DSP & TinyML',
    track: 'dsp_vision',
    trackAr: 'معالجة الإشارة والصور والرؤية الحاسوبية',
    difficulty: 'advanced',
    difficultyAr: 'متقدم / معالجة إشارة وبحثي',
    summaryAr: 'بناء نظام محمول لمعالجة إشارات تخطيط القلب الكهربائي (ECG) في الوقت الحقيقي، يشمل مرحلة ترشيح رقمي (Wavelet Transform / Bandpass FIR) واستخراج معالم موجات QRS وتصنيف الذبذبات غير الطبيعية على شريحة FPGA.',
    problemStatementAr: 'تتطلب مراقبة مرضى القلب تحليلاً مستمراً وآنياً دون أي تأخير، حيث تستهلك المعالجات التقليدية طاقة عالية وقد لا تستجيب للتشوهات اللحظية. توفر مصفوفات FPGA معالجة متوازية فائقة السرعة مع استهلاك طاقة منخفض.',
    objectivesAr: [
      'الحصول على إشارات ECG من قاعدة بيانات MIT-BIH المعتمدة عالمياً واختبار المرشحات الرقمية.',
      'تطبيق تحويل المويجات DWT (Discrete Wavelet Transform) لإزالة الضجيج العضلي وتداخل شبكة 50Hz.',
      'تصميم وبناء بنية عتادية Hardware Architecture على FPGA بلغة VHDL/Verilog لتطبيق المرشحات وحساب الفترات الزمنية RR-intervals.',
      'تطبيق شبكة عصبونية مدمجة خفيفة Weight-quantized Neural Network للتمييز بين 5 حالات قلبية شائعة.'
    ],
    requiredSkills: [
      'معالجة الإشارات الطبية والحيوية الرقمية (DSP)',
      'تصميم النظم الرقمية بلغة VHDL أو Verilog',
      'استخدام بيئة Intel Quartus / ModelSim للمحاكاة الزمنية',
      'معرفة بالشبكات العصبونية الخفيفة TinyML'
    ],
    requiredSoftware: ['quartus', 'modelsim', 'matlab', 'python'],
    requiredHardware: ['لوحة تطوير FPGA (مثل Altera Cyclone IV / DE10-Lite)', 'شاشة عرض VGA أو TFT لعرض نبضات القلب', 'حساس قياس ECG معزول AD8232 (للاختبار الحي)', 'كابل مبرمجة USB-Blaster'],
    relatedCourseIds: ['dsp', 'digital_logic', 'signals_systems', 'biomedical_eng', 'microprocessors'],
    suggestedTeamSize: '3 طلاب',
    suggestedPhases: [
      {
        phaseTitleAr: 'المرحلة 1: المعالجة الأولية في MATLAB واختبار الخوارزميات',
        durationAr: 'شهرين',
        tasksAr: [
          'تحميل بيانات MIT-BIH وتطبيق مرشحات Pan-Tompkins و Wavelet.',
          'تدريب نموذج التصنيف وحفظ الأوزان بصيغة الأعداد الصحيحة Fixed-Point.',
          'التحقق من حساسية ودقة الكشف (> 96%).'
        ]
      },
      {
        phaseTitleAr: 'المرحلة 2: كتابة كود VHDL والمحاكاة على ModelSim',
        durationAr: 'شهرين ونصف',
        tasksAr: [
          'كتابة وحدات FIR Filter و DWT ومحدد قمم QRS بلغة VHDL.',
          'إجراء محاكاة Testbench والتحقق من تطابق النتائج مع MATLAB bit-for-bit.',
          'تحسين استهلاك خلايا الـ Logic Elements واستخدام كتل DSP المدمجة.'
        ]
      },
      {
        phaseTitleAr: 'المرحلة 3: البرمجة على اللوحة والعرض الحي',
        durationAr: 'شهر ونصف',
        tasksAr: [
          'تنزيل التصميم على Cyclone IV وربطه مع شاشة TFT لعرض المخطط وحالة المريض.',
          'اختبار النظام مع إشارات حية مسجلة وتوثيق النتائج.'
        ]
      }
    ],
    supervisorTipsAr: 'تحويل العمليات الحسابية من الفاصلة العائمة (Floating-Point) إلى الفاصلة الثابتة (Fixed-Point) هو التحدي الأكبر؛ احرصوا على حساب عدد بتات الدقة بدقة في MATLAB أولاً.',
    tags: ['FPGA', 'VHDL', 'DSP', 'Quartus', 'ModelSim', 'Biomedical', 'MATLAB']
  },
  {
    id: 'proj_5g_beamforming_antenna',
    titleAr: 'تصميم ومحاكاة مصفوفة هوائيات موجهة (Phased Array Antenna) لترددات 28GHz لشبكات 5G Millimeter-Wave',
    titleEn: 'Design and Simulation of 28GHz Phased Array Antenna for 5G mmWave Applications',
    track: 'optical_microwaves',
    trackAr: 'الهندسة الضوئية والهوائيات والميكروويف',
    difficulty: 'research',
    difficultyAr: 'بحثي / نمذجة كهرومغناطيسية',
    summaryAr: 'تصميم مصفوفة رقعية Microstrip Patch Antenna Array رباعية العناصر (1x4 أو 2x2) تعمل عند تردد 28 GHz في نطاق الموجات المليمترية مع شبكة تغذية ذات إزاحة طورية لإجراء تشكيل وتوجيه الشعاع Beamforming باستخدام برامج HFSS و CST Studio.',
    problemStatementAr: 'تعاني إشارات الموجات المليمترية (mmWave) في شبكات 5G من تخميد جوي عالي وفقدان كبير في مسار الانتشار، مما يتطلب هوائيات ذات كسب عالي (High Gain) وقدرة على توجيه الشعاع الكهرومغناطيسي ديناميكياً نحو المستخدم.',
    objectivesAr: [
      'حساب الأبعاد الهندسية لهوائي رقعي مفرد عند تردد 28GHz على ركيزة Rogers ذات فواقد منخفضة.',
      'تصميم مصفوفة هوائيات 4-Elements لتحقيق كسب يتجاوز 10 dBi مع نسبة موجة راكدة VSWR < 1.5.',
      'تصميم شبكة تقسيم القدرة Wilkinson Power Divider مع أسطر نقل ذات إزاحة طورية لتوجيه الشعاع بزوايا مختلفة.',
      'تحليل المخطط الإشعاعي ثلاثي الأبعاد 3D Radiation Pattern، والتوافقيات، وكفاءة الهوائي.'
    ],
    requiredSkills: [
      'الكهرومغناطيسية والموجات الدقيقة وهوائيات الميكروستريب',
      'إتقان برامج المحاكاة الكهرومغناطيسية 3D EM (Ansys HFSS أو CST Studio Suite)',
      'تحليل مصفوفة التشتت S-Parameters ومخططات سميث Smith Chart',
      'تصميم خطوط النقل الميكروية Microstrip Transmission Lines'
    ],
    requiredSoftware: ['hfss', 'cst', 'matlab', 'ads'],
    requiredHardware: ['حاسوب عالي الأداء مع كرت شاشة مخصص للمحاكاة الكهرومغناطيسية', 'لوحة ركيزة راديوية Rogers RO4350B أو RT/duroid (في حال التصنيع)', 'موصلات 2.92mm / SMA مخصصة لترددات 28GHz'],
    relatedCourseIds: ['antennas_propagation', 'microwaves_1', 'microwaves_2', 'electromagnetics', 'optical_comm'],
    suggestedTeamSize: '2 - 3 طلاب',
    suggestedPhases: [
      {
        phaseTitleAr: 'المرحلة 1: الحسابات النظرية وتصميم العنصر المفرد',
        durationAr: 'شهرين',
        tasksAr: [
          'حساب أبعاد الرقعة وخط التغذية في MATLAB بناءً على ثابت العزل للركيزة.',
          'بناء النموذج في HFSS/CST ومحاكاة معامل الانعكاس S11 عند 28GHz.',
          'تحسين الأبعاد بالخوارزميات الجينية للحصول على تطابق ممانعة 50 أوم مثالي.'
        ]
      },
      {
        phaseTitleAr: 'المرحلة 2: تصميم المصفوفة وشبكة التغذية الموجهة',
        durationAr: 'شهرين ونصف',
        tasksAr: [
          'ترتيب العناصر بمسافة d = λ/2 لتقليل الفصوص الجانبية Grating Lobes.',
          'تصميم مقسمات ويلكنسون ومغيرات الطور Phase Shifters.',
          'محاكاة توجيه الشعاع بزوايا +30، 0، -30 درجة ورسم مخططات الكسب.'
        ]
      },
      {
        phaseTitleAr: 'المرحلة 3: التحليل الحراري ودراسة الفواقد وتجهيز الأطروحة',
        durationAr: 'شهر ونصف',
        tasksAr: [
          'دراسة تأثير الغلاف البلاستيكي ويد المستخدم على المخطط الإشعاعي.',
          'استخراج ملفات التصنيع Gerber وتوثيق النتائج والمقارنات الدولية.'
        ]
      }
    ],
    supervisorTipsAr: 'محاكاة ترددات 28GHz تستهلك حجماً ضخماً من الذاكرة والشبكات الحسابية (Meshing)؛ ابدأوا بنماذج تقريبية سريعة قبل الانتقال إلى Adaptive Meshing الدقيق.',
    tags: ['HFSS', 'CST', '5G', 'Antennas', 'Microwaves', 'Beamforming', 'mmWave']
  },
  {
    id: 'proj_riscv_soc_fpga',
    titleAr: 'تصميم معالج دقيق بنية RISC-V مخصص مدمج مع مسرع خوارزميات التشفير AES على شريحة FPGA',
    titleEn: 'Design and FPGA Implementation of a Custom RISC-V SoC with Hardware AES Cryptographic Accelerator',
    track: 'vlsi_microelectronics',
    trackAr: 'الإلكترونيات الدقيقة وتصميم الرقاقات VLSI',
    difficulty: 'advanced',
    difficultyAr: 'متقدم / بنية حواسب و رقاقات',
    summaryAr: 'بناء معالج كامل مفتوح المصدر بنية RISC-V (32-bit RV32I) مع خط أنابيب Pipelining خماسي المراحل، مدمج معه ناقل AXI/Wishbone ووحدة تسريع عتادي لخوارزمية التشفير المتناظر AES-128، واختبار تشغيل برامج C مجمعة عليه.',
    problemStatementAr: 'تتطلب أجهزة إنترنت الأشياء والأنظمة الأمنية معالجات مخصصة موفرة للطاقة مع قدرة عتادية على تشفير البيانات دون إرهاق النواة المركزية. يوفر معمارية RISC-V المرونة الكاملة لإضافة تعليمات وتوابع عتادية مخصصة.',
    objectivesAr: [
      'تصميم وحدات المعالج الأساسية: مسجل التعليمات، وحدة الحساب والمنطق ALU، بنك المسجلات، وحدة التحكم Control Unit.',
      'بناء خط أنابيب Pipelined خماسي المراحل (Fetch, Decode, Execute, Memory, Write-Back) مع معالجة مخاطر البيانات Data Hazards.',
      'تطوير مسرع عتادي مخصص لـ AES-128 (SubBytes, ShiftRows, MixColumns, AddRoundKey) يتم التحكم به عبر عنونة الذاكرة.',
      'كتابة برنامج C اختباري، تجميعه باستخدام RISC-V GCC Toolchain، وتشغيله بنجاح على المعالج في الـ FPGA.'
    ],
    requiredSkills: [
      'تصميم النظم الرقمية بلغة SystemVerilog أو VHDL',
      'بنية وتنظيم الحواسيب ومفاهيم المعالجات (Computer Architecture)',
      'التجميع بلغات Assembly و C المضمنة',
      'بيئات المحاكاة والتركيب الرقمي Vivado / Quartus / ModelSim'
    ],
    requiredSoftware: ['quartus', 'modelsim', 'clion_cubeide'],
    requiredHardware: ['لوحة FPGA مزودة بذاكرة SDRAM أو BRAM كافية (مثل Altera Cyclone IV أو Xilinx Artix-7)', 'وصلة UART-to-USB للاتصال مع الحاسوب وعرض المخرجات على Terminal', 'لوحة مفاتيح ومفاتيح Dip-switches للاختبار اليدوي'],
    relatedCourseIds: ['computer_arch', 'microprocessors', 'digital_logic', 'electronic_circuits_2', 'programming_2'],
    suggestedTeamSize: '3 طلاب',
    suggestedPhases: [
      {
        phaseTitleAr: 'المرحلة 1: تصميم النواة أحادية الدورة Single-Cycle Core',
        durationAr: 'شهرين',
        tasksAr: [
          'كتابة مواصفات مجموعة تعليمات RV32I الأساسية في SystemVerilog.',
          'برمجة واختبار ALU ومسار البيانات Data-Path ومولد الرموز.',
          'تنفيذ تعليمات الجمع والتفرع والتحميل/التخزين في ModelSim.'
        ]
      },
      {
        phaseTitleAr: 'المرحلة 2: إضافة خط الأنابيب ومسرع AES والناقل',
        durationAr: 'شهرين ونصف',
        tasksAr: [
          'تطبيق خط الأنابيب وإضافة وحدة التقديم Forwarding Unit ووحدة التعليق Hazard Unit.',
          'بناء محرك تشفير AES-128 ككتلة عتادية وتوصيلها عبر ناقل النظام.',
          'ربط وحدة UART لإرسال واستقبال البيانات مع الحاسوب.'
        ]
      },
      {
        phaseTitleAr: 'المرحلة 3: التحميل على الـ FPGA واختبار البرمجيات',
        durationAr: 'شهر ونصف',
        tasksAr: [
          'تجميع كود C لاختبار التشفير وتوليد ملف ROM للـ FPGA.',
          'قياس التردد الأعظمي Fmax واستهلاك الموارد ومقارنة سرعة التشفير مع البرمجيات البحتة.'
        ]
      }
    ],
    supervisorTipsAr: 'ركزوا على حل مشاكل الـ Hazards والتفرعات (Branch Hazards) بدقة في مرحلة المحاكاة قبل الانتقال إلى تركيب الـ FPGA، واكتبوا اختبارات عشوائية مكثفة.',
    tags: ['RISC-V', 'FPGA', 'Verilog', 'VLSI', 'Cryptography', 'ModelSim', 'Computer Architecture']
  },
  {
    id: 'proj_edge_ai_lora_wildfire',
    titleAr: 'شبكة استشعار ذكية بعيدة المدى (LoRaWAN) للكشف المبكر عن حرائق الغابات باستخدام الذكاء الصنعي الطرفي (TinyML)',
    titleEn: 'Long-Range LoRaWAN Mesh Sensor Network with Edge AI for Early Wildfire Detection',
    track: 'ai_telecom',
    trackAr: 'الذكاء الصنعي في الاتصالات والإلكترونيات',
    difficulty: 'intermediate',
    difficultyAr: 'متوسط / تطبيقي متكامل',
    summaryAr: 'بناء عقد استشعار ذكية منخفضة الاستهلاك مزودة بمتحكمات ESP32-S3 وحساسات غازات وبيئة، قادرة على تشغيل نموذج تعلم آلي مصغر (TinyML) للتنبؤ باندلاع الحرائق قبل تصاعد الدخان الكثيف، ونقل الإنذارات عبر شبكة LoRa لمسافات تتجاوز 10 كم.',
    problemStatementAr: 'تتسبب حرائق الغابات في أضرار بيئية واقتصادية بالغة، وتصل الإنذارات عبر الأقمار الصناعية متأخرة جداً. تحتاج المناطق الحراجية لعقد مراقبة محلية ذاتية الطاقة تنبه في الدقائق الأولى باستهلاك طاقة يقاس بالميلي واط.',
    objectivesAr: [
      'جمع بيانات التغير في تركيز الغازات (CO, CO2, VOC, NO2) مع الحرارة والرطوبة عند اشتعال مواد حراجية مختلفة.',
      'تدريب نموذج Random Forest / CNN مصغر باستخدام Edge Impulse وتحويله إلى كود C++ مضمن لا يتجاوز 30KB RAM.',
      'برمجة عقد LoRa للعمل بنمط السكون الفائق Deep Sleep والاستيقاظ المجدول لضمان عمل البطارية لسنوات.',
      'بناء بوابة LoRa Gateway وربطها مع لوحة تحكم سحابية ترسل تنبيهات فورية عبر Telegram / SMS مع إحداثيات GPS.'
    ],
    requiredSkills: [
      'برمجة المتحكمات الصغرية (ESP32 / Arduino / C++)',
      'تقنيات الذكاء الصنعي المضمن (TinyML / Edge Impulse / TensorFlow Lite Micro)',
      'بروتوكولات الاتصال اللاسلكي منخفض الطاقة LoRa / LoRaWAN',
      'إدارة الطاقة وأنظمة الحصاد الشمسي Solar Energy Harvesting'
    ],
    requiredSoftware: ['python', 'clion_cubeide', 'proteus'],
    requiredHardware: ['عقد ESP32-S3 مع وحدات LoRa SX1276 / SX1262 (868MHz / 433MHz)', 'حساسات بيئية دقيقة BME680 (حرارة، رطوبة، ضغط، غازات)', 'ألواح طاقة شمسية صغيرة مع دارة شحن بطاريات ليثيوم TP4056 ودارة حماية BMS', 'بوابة LoRa Gateway متصلة بالإنترنت'],
    relatedCourseIds: ['wireless_networks', 'embedded_systems', 'sensors_instrumentation', 'programming_1', 'comm_theory_2'],
    suggestedTeamSize: '3 - 4 طلاب',
    suggestedPhases: [
      {
        phaseTitleAr: 'المرحلة 1: جمع البيانات وتدريب نموذج الذكاء الصنعي',
        durationAr: 'شهرين',
        tasksAr: [
          'إجراء تجارب احتراق آمنة في بيئة معزولة وتسجيل قراءات الحساسات عبر الزمن.',
          'تدريب نموذج التصنيف للتمييز بين التغيرات الجوية الطبيعية وبداية الاحتراق الحقيقي.',
          'تحسين النموذج لتقليل الإنذارات الكاذبة وتصديره بصيغة C++.'
        ]
      },
      {
        phaseTitleAr: 'المرحلة 2: تطوير برمجية العقد والشبكة اللاسلكية',
        durationAr: 'شهرين ونصف',
        tasksAr: [
          'برمجة بروتوكول LoRa واستخدام تقنية التكرار والشبكة المتشابكة LoRa Mesh.',
          'تطبيق وضعيات توفير الطاقة Deep Sleep والوصول لاستهلاك تيار أقل من 15uA في وضع السكون.',
          'بناء وتكوين بوابة الاستقبال المركزية Gateway.'
        ]
      },
      {
        phaseTitleAr: 'المرحلة 3: الاختبار الحقلي الميداني والتوثيق',
        durationAr: 'شهر ونصف',
        tasksAr: [
          'نشر العقد على مسافات متباعدة في بيئة مفتوحة وقياس جودة الإشارة RSSI و SNR ومعدل وصول الحزم Packet Delivery Rate.',
          'توثيق التصميم وكتابة دليل النشر الميداني والأطروحة.'
        ]
      }
    ],
    supervisorTipsAr: 'اختبار دقة الحساسات ومعايرتها هو المفتاح؛ احرصوا على حساب زمن الإحماء (Warm-up Time) لحساس الغاز BME680 في وضع السكون للحفاظ على دقة التنبؤ.',
    tags: ['LoRa', 'TinyML', 'ESP32', 'IoT', 'Wireless', 'Edge AI', 'Renewable Energy']
  },
  {
    id: 'proj_optical_wdm_transmission',
    titleAr: 'محاكاة وتحسين شبكة نقل اتصالات ضوئية عالية السرعة بتقنية WDM فائقة الكثافة (DWDM 100Gbps)',
    titleEn: 'Simulation and Performance Optimization of High-Speed 100Gbps Dense WDM Optical Network',
    track: 'optical_microwaves',
    trackAr: 'الهندسة الضوئية والهوائيات والميكروويف',
    difficulty: 'research',
    difficultyAr: 'بحثي / محاكاة اتصالات ضوئية',
    summaryAr: 'تصميم ومحاكاة وصلة ألياف ضوئية متطورة بعيدة المدى لنقل 16 قناة ضوئية متزامنة بمعدل 100Gbps لكل قناة باستخدام تضمين DP-QPSK والكشف المتماسك Coherent Detection مع تعويض التشتت والتأثيرات غير الخطية (Kerr effect).',
    problemStatementAr: 'تتطلب مراكز البيانات والشبكات الحضرية الحديثة سعات نقل هائلة عبر الألياف الضوئية، حيث تشكل ظواهر التشتت اللوني (Chromatic Dispersion) والتشتت الناتج عن نمط الاستقطاب (PMD) والتأثيرات اللاخطية (SPM/XPM) عائقاً رئيساً لجودة الإشارة.',
    objectivesAr: [
      'بناء نموذج الإرسال والاستقبال الضوئي المتماسك DP-QPSK في بيئات المحاكاة OptiSystem / MATLAB.',
      'تطبيق مصفوفات التضمين المتعدد بطول الموجة DWDM مع تباعد ترددي 50GHz وفق معايير ITU-T.',
      'تصميم مرحلة التضخيم الضوئي باستخدام مضخمات الإربيوم EDFA مع معالجة الضجيج المنبعث ASE.',
      'تطبيق خوارزميات DSP الرقمية المتقدمة في طرف الاستقبال لموازنة وتصحيح التشتت واسترجاع الطور الحامل.'
    ],
    requiredSkills: [
      'مبادئ الاتصالات الضوئية والألياف الزجاجية والمصادر الليزرية',
      'استخدام برامج محاكاة النظم الضوئية (OptiSystem / VPIphotonics / MATLAB)',
      'معالجة الإشارة الرقمية في المستقبلات الضوئية المتماسكة (Coherent DSP)',
      'تحليل مخططات العين Eye Diagrams ونسبة الخطأ Q-factor و OSNR'
    ],
    requiredSoftware: ['matlab', 'python'],
    requiredHardware: ['جهاز حاسوب بمواصفات عالية للمحاكاة العددية للألياف الضوئية'],
    relatedCourseIds: ['optical_comm', 'comm_theory_2', 'dsp', 'electromagnetics', 'wireless_networks'],
    suggestedTeamSize: '2 - 3 طلاب',
    suggestedPhases: [
      {
        phaseTitleAr: 'المرحلة 1: بناء قناة مفردة وتحليل التشتت',
        durationAr: 'شهرين',
        tasksAr: [
          'محاكاة مرسل DP-QPSK بمعدل 100Gbps ونمذجة ليف Single Mode Fiber (SMF-28).',
          'دراسة تأثير التشتت اللوني على تشوه مخطط العين وعامل الجودة Q-Factor.',
          'تصميم ليف تعويض التشتت Dispersion Compensating Fiber (DCF).'
        ]
      },
      {
        phaseTitleAr: 'المرحلة 2: التوسع إلى 16 قناة DWDM وتصميم التضخيم',
        durationAr: 'شهرين ونصف',
        tasksAr: [
          'إضافة مجمعات MUX/DEMUX وتوزيع القنوات الضوئية عبر النطاق C-Band.',
          'تصميم محطات التقوية وتوزيع مضخمات EDFA مع الحفاظ على التوازن الطيفي Flatness.',
          'محاكاة التأثيرات اللاخطية وتداخل القنوات Cross-Phase Modulation (XPM).'
        ]
      },
      {
        phaseTitleAr: 'المرحلة 3: تطبيق خوارزميات DSP المتماسكة والتحسين',
        durationAr: 'شهر ونصف',
        tasksAr: [
          'تطبيق خوارزمية Constant Modulus Algorithm (CMA) لموازنة استقطاب الإشارة.',
          'استخلاص منحنيات BER vs OSNR ومقارنة الأداء عبر مسافات نقل تتجاوز 1000 كم.'
        ]
      }
    ],
    supervisorTipsAr: 'تأكدوا من ضبط خطوات المحاكاة الزمنية (Time Step) وعدد العينات بدقة في OptiSystem لتجنب أخطاء النمذجة العددية وحساب القدرة الضوئية بدقة.',
    tags: ['Optical', 'WDM', 'DWDM', 'OptiSystem', 'MATLAB', 'Fiber Optics', 'DSP']
  },
  {
    id: 'proj_deep_learning_modulation_classifier',
    titleAr: 'نظام التعرف الآلي على أنواع التعديل الراديوي (AMC) باستخدام التعلم العميق في بيئات الحرب الإلكترونية ومراقبة الطيف',
    titleEn: 'Automatic Modulation Classification (AMC) Using Deep Learning for Spectrum Monitoring and Cognitive Radio',
    track: 'ai_telecom',
    trackAr: 'الذكاء الصنعي في الاتصالات والإلكترونيات',
    difficulty: 'advanced',
    difficultyAr: 'متقدم / ذكاء صنعي واتصالات',
    summaryAr: 'تطوير وتدريب شبكة عصبونية عميقة (ResNet + BiLSTM) قادرة على تصنيف أكثر من 11 نوع تعديل تماثلي ورقمي (BPSK, QPSK, 8PSK, 16QAM, 64QAM, FM, AM) بدقة عالية حتى في قيم SNR سالبة منخفضة، مع اختبارها على إشارات حية ملتقطة عبر SDR.',
    problemStatementAr: 'في الراديو الإدراكي (Cognitive Radio) ومراقبة الطيف الترددي للأمن السيبراني والاتصالات العسكرية، لا تتوفر معلومات مسبقة عن إشارة المرسل المجهول، مما يتطلب تصنيف نوع التعديل آلياً دون الحاجة لفك التشفير أو المزامنة المسبقة.',
    objectivesAr: [
      'توليد ومعالجة بيانات الإشارات الراديوية بنمط المركبات المباشرة والمتعامدة In-Phase & Quadrature (I/Q).',
      'بناء معمارية عصبونية هجينة تستخرج المعالم المكانية عبر الالتفاف Spatial CNN والمعالم الزمنية عبر الشبكات العودية LSTM.',
      'تدريب النموذج على قاعدة بيانات RadioML القياسية واختبار الدقة عبر مستويات SNR من -20dB إلى +20dB.',
      'تطبيق النموذج المصنف في الوقت الحقيقي وربطه مع جهاز استقبال HackRF One للاختبار العملي.'
    ],
    requiredSkills: [
      'التعلم العميق وتحليل السلاسل الزمنية (PyTorch / TensorFlow)',
      'نظريات التعديل التماثلي والرقمي ومعالجة الإشارة I/Q',
      'استخدام منصات SDR وبرمجة Python لمعالجة الإشارات',
      'تقييم أداء نماذج الذكاء الصنعي (Confusion Matrix, Precision, Recall)'
    ],
    requiredSoftware: ['python', 'matlab', 'gnuradio'],
    requiredHardware: ['حاسوب ذو بطاقة رسوميات قوية لتدريب الشبكات العصبونية (NVIDIA GPU)', 'جهاز استقبال راديوي HackRF One أو RTL-SDR v4', 'هوائي عريض النطاق لالتقاط إشارات الراديو والاتصالات المحلية'],
    relatedCourseIds: ['comm_theory_1', 'comm_theory_2', 'dsp', 'signals_systems', 'programming_2'],
    suggestedTeamSize: '2 - 3 طلاب',
    suggestedPhases: [
      {
        phaseTitleAr: 'المرحلة 1: تجهيز البيانات وبناء معمارية الشبكة',
        durationAr: 'شهرين',
        tasksAr: [
          'تحميل وتنظيف بيانات RadioML وتطبيع متجهات I/Q Samples.',
          'بناء طبقات ResNet و BiLSTM وتطبيق ميكانيزم الانتباه Self-Attention.',
          'تدريب النموذج ومراقبة الفقدان Loss ودقة التصنيف.'
        ]
      },
      {
        phaseTitleAr: 'المرحلة 2: التحسين والضغط والتكامل مع SDR',
        durationAr: 'شهرين ونصف',
        tasksAr: [
          'تطبيق تقنيات التكميم Quantization لتسريع الاستدلال الآني (Inference).',
          'كتابة سكربت Python متصل بـ HackRF عبر GNU Radio لالتقاط وتصنيف الإشارات في أجزاء من الثانية.',
          'بناء واجهة رسومية GUI تعرض الطيف الترددي ومخطط العين ونوع التعديل المتوقع مع نسبة الثقة.'
        ]
      },
      {
        phaseTitleAr: 'المرحلة 3: الاختبارات العملية وتحليل الحالات الشاذة',
        durationAr: 'شهر ونصف',
        tasksAr: [
          'اختبار كشف التعديلات المعقدة مثل 16QAM و 64QAM في وجود ضجيج عالي.',
          'توثيق النتائج ومصفوفات الارتباك ومقارنتها مع الأوراق البحثية المنشورة عالمياً.'
        ]
      }
    ],
    supervisorTipsAr: 'احرصوا على أن يتعامل النموذج مع إزاحة التردد الحامل والطور العشوائي كجزء من عملية زيادة البيانات (Data Augmentation) حتى لا ينهار أداء النموذج عند الانتقال إلى إشارات العالم الحقيقي.',
    tags: ['Deep Learning', 'PyTorch', 'SDR', 'Cognitive Radio', 'Spectrum', 'AI', 'Modulation']
  }
];
