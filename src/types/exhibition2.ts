export type Exhibition2SceneId = 
  | 'hero'           // المشهد الأول: البداية (Hero Scene)
  | 'why_ece'        // المشهد الثاني: لماذا هندسة الاتصالات والإلكترونيات؟
  | 'journey_years'  // المشهد الثالث: رحلة الطالب خلال السنوات
  | 'projects_expo'  // المشهد الرابع: معرض المشاريع التفاعلي
  | 'fit_quiz'       // المشهد الخامس: هل يناسبك الفرع؟
  | 'roadmap_tool'   // المشهد السادس: EceRoadMap
  | 'comparison';    // المشهد السابع: مقارنة القسم مع باقي الفروع

export interface Exhibition2SceneMeta {
  id: Exhibition2SceneId;
  index: number;
  titleAr: string;
  subtitleAr: string;
  badge: string;
  durationSeconds: number;
  isEnabled: boolean;
}

export interface EceDomainItem {
  id: string;
  titleAr: string;
  titleEn: string;
  summary: string;
  iconName: string;
  color: string;
  examples: string[];
  techPill: string;
}

export interface YearStageItem {
  yearNumber: number;
  titleAr: string;
  stageName: string;
  subjects: string[];
  effectDescription: string;
  visualIcon: string;
  color: string;
}

export interface ProjectExhibitItem {
  id: string;
  titleAr: string;
  tagline: string;
  category: string;
  hardware: string[];
  sequenceSteps: string[];
  explanation: string;
  realWorldApps: string[];
  interactiveDemoType: 'esp32_memory' | 'rfid_scanner' | 'ultrasonic_servo' | 'computer_vision';
}

export interface DepartmentComparisonItem {
  deptId: string;
  deptNameAr: string;
  primaryFocus: string;
  hardwareVsSoftware: string;
  keyDifferentiator: string;
  iconName: string;
  isECE?: boolean;
}

export interface Exhibition2FullConfig {
  version: string;
  updatedAt?: string;
  updatedBy?: string;
  scenes: Exhibition2SceneMeta[];
  playback: {
    defaultSpeed: 'slow' | 'medium' | 'fast';
    autoLoop: boolean;
    ambientSoundEnabled: boolean;
    highPerformance3D: boolean;
  };
  heroScene: {
    tagline: string;
    mainHeadline: string;
    shortBio: string;
    pills: string[];
  };
  whyEceScene: {
    headline: string;
    subheadline: string;
    domains: EceDomainItem[];
  };
  journeyScene: {
    headline: string;
    subheadline: string;
    stages: YearStageItem[];
  };
  projectsScene: {
    headline: string;
    subheadline: string;
    projects: ProjectExhibitItem[];
  };
  fitQuizScene: {
    headline: string;
    subheadline: string;
    welcomeMessage: string;
    traits: { title: string; desc: string; icon: string }[];
  };
  roadmapScene: {
    headline: string;
    subheadline: string;
    quote: string;
    qrUrl: string;
    qrDescription: string;
  };
  comparisonScene: {
    headline: string;
    subheadline: string;
    departments: DepartmentComparisonItem[];
    takeawayMessage: string;
  };
}
