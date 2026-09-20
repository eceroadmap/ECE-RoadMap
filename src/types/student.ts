import { AcademicYearNumber, AcademicSemester } from './index';
import { CourseGrade, GraduationProjectWorkspace } from './academicIntelligence';

export type StudentRole = 'high_school' | 'freshman' | 'current' | 'graduate';

export interface StudentProfile {
  role: StudentRole;
  roleLabelAr: string;
  academicYear: AcademicYearNumber;
  currentYear?: AcademicYearNumber | 'graduate';
  academicSemester: AcademicSemester;
  onboardingCompleted: boolean;
  name?: string;
  username?: string;
  accountPassword?: string;
  targetFocusTrack?: string;
  createdAt?: string;
  lastSyncedAt?: string;
  updatedAt: string;
}

export type CourseProgressStatus = 'important' | 'to_study' | 'completed';

export interface CourseProgressRecord {
  courseId: string;
  status: CourseProgressStatus;
  updatedAt: string;
}

export interface SavedLaptopRecord {
  specs: any;
  evaluation: any;
  savedAt: string;
}

export interface StudentState {
  profile: StudentProfile;
  coursesProgress: Record<string, CourseProgressStatus>;
  savedLaptop: SavedLaptopRecord | null;
  academicGrades: Record<string, CourseGrade>;
  graduationProjectWorkspace: GraduationProjectWorkspace;
}

export interface CommunityTip {
  id: string;
  authorId: string;
  authorName: string;
  authorYear: AcademicYearNumber | 'graduate' | string;
  courseId?: string;
  courseNameAr?: string;
  content: string;
  category: 'study_tip' | 'exam_advice' | 'lab_work' | 'resource';
  likesCount: number;
  likedBy: string[];
  dislikesCount?: number;
  dislikedBy?: string[];
  createdAt: string;
}

export * from './academicIntelligence';
