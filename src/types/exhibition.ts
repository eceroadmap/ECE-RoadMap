export type ExhibitionSlideId = 
  | 'hero' 
  | 'journey' 
  | 'skills_pipeline' 
  | 'software_toolkit' 
  | 'graduation_projects'
  | 'careers' 
  | 'qr_portal';

export interface HeroMetric {
  id: string;
  number: string;
  titleAr: string;
  descAr: string;
  colorTheme: 'cyan' | 'blue' | 'sky' | 'emerald' | 'purple' | 'amber';
}

export interface HeroSlideConfig {
  placemarkBadge: string;
  mainTitle: string;
  subtitleGradient: string;
  description: string;
  metrics: HeroMetric[];
}

export interface JourneySlideConfig {
  badgeText: string;
  sectionTitle: string;
  customIntro: string;
  yearCustomHighlights?: Record<number, string>;
}

export interface SkillPipelineItem {
  id: string;
  titleAr: string;
  courseAr: string;
  labAr: string;
  softwareAr: string;
  skillAr: string;
  careerAr: string;
  badgeColor?: string;
}

export interface SkillsSlideConfig {
  badgeText: string;
  sectionTitle: string;
  pipelines: SkillPipelineItem[];
}

export interface SoftwareSlideConfig {
  badgeText: string;
  sectionTitle: string;
  descriptionHint: string;
}

export interface GraduationProjectsSlideConfig {
  badgeText: string;
  sectionTitle: string;
  descriptionHint: string;
}

export interface CareerPathItem {
  id: string;
  titleAr: string;
  titleEn: string;
  domain: string;
  iconKey: string;
  colorClass: string;
}

export interface CareersSlideConfig {
  badgeText: string;
  sectionTitle: string;
  careers: CareerPathItem[];
}

export interface QrPillarItem {
  id: string;
  title: string;
  iconKey: string;
}

export interface QrPortalSlideConfig {
  badgeText: string;
  title: string;
  description: string;
  customQrUrl: string;
  qrTitle: string;
  qrSubtitle: string;
  pillars: QrPillarItem[];
}

export interface SlideMetaConfig {
  id: ExhibitionSlideId;
  indexLabel: string;
  titleAr: string;
  subtitleAr: string;
  durationSeconds: number;
  isEnabled: boolean;
}

export interface ExhibitionFullConfig {
  slides: SlideMetaConfig[];
  hero: HeroSlideConfig;
  journey: JourneySlideConfig;
  skills: SkillsSlideConfig;
  software: SoftwareSlideConfig;
  graduationProjects: GraduationProjectsSlideConfig;
  careers: CareersSlideConfig;
  qrPortal: QrPortalSlideConfig;
  defaultPlaybackSpeed: number;
  updatedAt?: string;
  updatedBy?: string;
}
