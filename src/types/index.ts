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

export * from './laptop';

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
