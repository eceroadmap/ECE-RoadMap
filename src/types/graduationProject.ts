import { AcademicYearNumber, AcademicSemester } from './index';
import { ProjectTrack, GraduationProjectPhase } from './academicIntelligence';

export type ProjectDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'research';
export type ProjectTypePreference = 'hardware' | 'software' | 'hybrid' | 'research' | 'communication' | 'embedded' | 'signal_processing' | 'networks' | 'electronics';

export interface GraduationProjectLink {
  title: string;
  url: string;
}

export interface GraduationProject {
  id: string;
  titleAr: string;
  titleEn: string;
  description?: string;
  summaryAr: string;
  problemStatementAr?: string;
  objectivesAr?: string[];
  track?: ProjectTrack | string;
  trackAr?: string;
  field?: string;
  category?: string;
  difficulty: ProjectDifficulty;
  difficultyAr?: string;
  type?: ProjectTypePreference;
  tags: string[];
  relatedCourseIds: string[];
  requiredSkills: string[];
  requiredSoftware: string[];
  requiredHardware?: string[];
  requiredSkillIds?: string[];
  requiredSoftwareIds?: string[];
  optionalSkillIds?: string[];
  links?: GraduationProjectLink[];
  developmentIdeas?: string[];
  suggestedTeamSize?: string;
  suggestedPhases?: GraduationProjectPhase[];
  supervisorTipsAr?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentProjectPreferences {
  favoriteCourseIds: string[];
  interestAreas: string[];
  selectedSkills: string[];
  selectedTools: string[];
  preferredDifficulty: ProjectDifficulty | 'all';
  projectTypePreference: ProjectTypePreference | 'all';
}

export interface ProjectMatchResult {
  project: GraduationProject;
  score: number; // 0 - 100
  breakdown: {
    courseMatchCount: number;
    interestMatchCount: number;
    skillMatchCount: number;
    toolMatchCount: number;
    difficultyMatch: boolean;
    typeMatch: boolean;
  };
  matchingCourses: string[];
  matchingInterests: string[];
  matchingSkills: string[];
  matchingTools: string[];
  missingSkills: string[];
  missingTools: string[];
  recommendationReasonAr: string;
}
