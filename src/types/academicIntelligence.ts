import { AcademicYearNumber, AcademicSemester } from './index';

export type GradeStatus = 'passed' | 'failed' | 'in_progress' | 'exempt';

export interface CourseGrade {
  courseId: string;
  theoryScore?: number;
  practicalScore?: number;
  totalScore: number;
  status: GradeStatus;
  year: AcademicYearNumber;
  semester: AcademicSemester;
  notes?: string;
  updatedAt: string;
}

export type ProjectTrack = 
  | 'communications' 
  | 'embedded' 
  | 'dsp_vision' 
  | 'vlsi_microelectronics' 
  | 'optical_microwaves' 
  | 'ai_telecom';

export interface GraduationProjectPhase {
  phaseTitleAr: string;
  durationAr: string;
  tasksAr: string[];
}

export interface GraduationProject {
  id: string;
  titleAr: string;
  titleEn: string;
  track: ProjectTrack;
  trackAr: string;
  difficulty: 'intermediate' | 'advanced' | 'research';
  difficultyAr: string;
  summaryAr: string;
  problemStatementAr: string;
  objectivesAr: string[];
  requiredSkills: string[];
  requiredSoftware: string[];
  requiredHardware: string[];
  relatedCourseIds: string[];
  suggestedTeamSize: string;
  suggestedPhases: GraduationProjectPhase[];
  supervisorTipsAr: string;
  tags: string[];
}

export interface GraduationProjectWorkspace {
  selectedProjectId?: string;
  customTitleAr?: string;
  customSummaryAr?: string;
  teamMembers?: string[];
  supervisorName?: string;
  chosenTrack?: ProjectTrack | string;
  starredProjectIds: string[];
  favoriteCourseIds?: string[];
  interestAreas?: string[];
  selectedSkills?: string[];
  selectedTools?: string[];
  preferredDifficulty?: 'all' | 'beginner' | 'intermediate' | 'advanced' | 'research';
  projectTypePreference?: 'all' | 'hardware' | 'software' | 'hybrid' | 'research';
  notes?: string;
  savedAt?: string;
}

export interface RecommendationSurveyAnswers {
  preferredTrack: string;
  hardwareExperience: 'basic' | 'intermediate' | 'advanced';
  softwareExperience: 'basic' | 'intermediate' | 'advanced';
  mathDspInterest: 'low' | 'medium' | 'high';
  targetCareer: string;
  preferredTeamSize: string;
  complexityLevel: 'moderate' | 'challenging' | 'cutting_edge';
}

export interface RecommendationMatchResult {
  project: GraduationProject;
  matchScore: number;
  matchedReasons: string[];
  strengthAlignment: string;
  recommendedPreparation: string[];
}

export interface AcademicStanding {
  labelAr: string;
  colorClass: string;
  badgeClass: string;
}
