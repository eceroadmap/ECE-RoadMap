export type AcademicYearNumber = 1 | 2 | 3 | 4 | 5;
export type AcademicSemester = 1 | 2;

export interface Course {
  id: string;
  nameAr: string;
  nameEn?: string;
  year: AcademicYearNumber;
  semester: AcademicSemester;
  shortDescription: string;
  detailedDescription: string;
  whatYouLearn: string[];
  prerequisites: string[];
  relatedSkills: string[];
  relatedSoftware: string[];
  relatedCourses: string[];
  recommendedExternalCourses: string[];
  usefulResources: { title: string; url?: string; isPlaceholder: boolean }[];
  tags: string[];
}

export interface YearMilestone {
  yearNumber: AcademicYearNumber;
  titleAr: string;
  titleEn: string;
  stageTitleAr: string;
  stageSummaryAr: string;
  keySkills: string[];
  softwareUsed: string[];
  courseIds: string[];
  focusAreas: string[];
}

export interface SoftwareTool {
  id: string;
  name: string;
  arabicName?: string;
  category: 'programming' | 'circuits' | 'fpga' | 'dsp' | 'microwaves' | 'embedded' | 'industrial' | 'networking' | 'optics';
  categoryLabelAr: string;
  description: string;
  purpose: string;
  usedInCourses: string[];
  academicYears: AcademicYearNumber[];
  officialDownloadLink?: string;
  learningResources: { title: string; url?: string; isPlaceholder: boolean }[];
}

export type SkillCategory = 
  | 'communications'
  | 'networking'
  | 'programming'
  | 'electronics'
  | 'office'
  | 'cybersecurity'
  | 'computervision';

export interface SkillCourse {
  id: string;
  titleAr: string;
  titleEn?: string;
  category: SkillCategory;
  categoryLabelAr: string;
  trackAr: string;
  descriptionAr: string;
  relatedSoftware: string[];
  levelAr: 'مبتدئ' | 'متوسط' | 'متقدم';
  isPlanned: boolean;
  linkPlaceholder: string;
}

export interface LaptopSpecs {
  cpuBrand: 'intel' | 'amd' | 'apple';
  cpuTier: 'i3' | 'i5' | 'i7' | 'i9' | 'ryzen3' | 'ryzen5' | 'ryzen7' | 'ryzen9' | 'appleM';
  cpuGen: 'older' | 'gen8_10' | 'gen11_12' | 'gen13_plus' | 'apple_silicon';
  ramGb: 4 | 8 | 16 | 32;
  storageType: 'hdd' | 'ssd_sata' | 'ssd_nvme';
  storageCapacityGb: 128 | 256 | 512 | 1000 | 2000;
  gpuTier: 'integrated' | 'dedicated_entry' | 'dedicated_mid_high' | 'apple_gpu';
  os: 'windows' | 'macos' | 'linux';
}

export type LaptopSuitabilityLevel = 'minimum' | 'preferred' | 'comfortable';

export interface LaptopEvaluationResult {
  level: LaptopSuitabilityLevel;
  badgeAr: string;
  titleAr: string;
  summaryAr: string;
  suitableFor: string[];
  limitingFor: string[];
  affectedSoftware: string[];
  practicalAdvice: string[];
}

export type ResourceType = 
  | 'telegram'
  | 'instagram'
  | 'pdf'
  | 'website'
  | 'course'
  | 'software'
  | 'reference'
  | 'video';

export type HubCategory = 
  | 'academic'
  | 'telegram'
  | 'courses'
  | 'software'
  | 'references'
  | 'links'
  | 'communities';

export interface StudentResource {
  id: string;
  titleAr: string;
  descriptionAr: string;
  type?: ResourceType;
  category: HubCategory;
  categoryLabelAr: string;
  year?: AcademicYearNumber;
  relatedCourse?: string;
  source?: string;
  url?: string;
  tags: string[];
  isFeatured?: boolean;
  sections?: {
    labelAr: string;
    descriptionAr?: string;
    isPlaceholder: boolean;
  }[];
}

export interface FAQItem {
  id: string;
  questionAr: string;
  answerAr: string;
  categoryAr: string;
  isPlaceholder: boolean;
}

export type ActiveTab = 
  | 'home'
  | 'dashboard'
  | 'roadmap'
  | 'courses'
  | 'develop'
  | 'software'
  | 'laptop'
  | 'hub'
  | 'academic_record'
  | 'graduation_projects'
  | 'faq'
  | 'guide'
  | 'admin';

export * from './student';
export * from './admin';
