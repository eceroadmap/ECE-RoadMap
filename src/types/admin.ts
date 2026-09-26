import { AcademicYearNumber, AcademicSemester, Course, SoftwareTool } from './index';
import { CourseProgressStatus, SavedLaptopRecord, StudentRole, CourseGrade } from './student';

export interface AdminStudentRecord {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  username?: string | null;
  accountPassword?: string | null;
  academicYear?: AcademicYearNumber;
  currentYear?: AcademicYearNumber | 'graduate';
  academicSemester?: AcademicSemester;
  role?: StudentRole;
  roleLabelAr?: string;
  targetFocusTrack?: string | null;
  onboardingCompleted?: boolean;
  coursesProgress?: Record<string, CourseProgressStatus>;
  academicGrades?: Record<string, CourseGrade>;
  savedLaptop?: SavedLaptopRecord | null;
  createdAt?: string;
  updatedAt?: string;
  lastSyncedAt?: string;
  lastActiveAt?: string;
  lastLoginAt?: string;
  authProvider?: 'google' | 'guest' | 'local' | string;
  isGuest?: boolean;
}

export interface AdminRecord {
  uid: string;
  displayName: string;
  email: string;
  role: 'admin' | 'super_admin' | 'moderator';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  isOwner?: boolean;
}

export interface ModeratorRecord {
  id: string; // Document ID (usually sanitized email)
  email: string;
  displayName?: string;
  role?: 'moderator' | 'super_admin' | 'admin';
  status: 'active' | 'inactive';
  notes?: string;
  addedBy: string;
  addedAt: string;
  updatedAt?: string;
  lastActiveAt?: string;
}

export type AdminContentType = 
  | 'course' 
  | 'software' 
  | 'resource' 
  | 'faq' 
  | 'community_tip' 
  | 'curriculum'
  | 'system';

export type AdminActionType =
  | 'COURSE_CREATED'
  | 'COURSE_UPDATED'
  | 'COURSE_ARCHIVED'
  | 'COURSE_RESTORED'
  | 'SOFTWARE_CREATED'
  | 'SOFTWARE_UPDATED'
  | 'SOFTWARE_ARCHIVED'
  | 'SOFTWARE_RESTORED'
  | 'RESOURCE_CREATED'
  | 'RESOURCE_UPDATED'
  | 'RESOURCE_ARCHIVED'
  | 'RESOURCE_RESTORED'
  | 'FAQ_CREATED'
  | 'FAQ_UPDATED'
  | 'FAQ_ARCHIVED'
  | 'FAQ_RESTORED'
  | 'TIP_ARCHIVED'
  | 'TIP_RESTORED'
  | 'TIP_DELETED'
  | 'MODERATOR_CREATED'
  | 'MODERATOR_UPDATED'
  | 'MODERATOR_DELETED'
  | 'CURRICULUM_SEEDED';

export interface AdminActivityLog {
  id: string;
  adminUid: string;
  adminEmail: string;
  actionType: AdminActionType;
  targetContentType: AdminContentType;
  targetDocId: string;
  details: string;
  timestamp: string;
}

export type ContentStatus = 'active' | 'archived';

export interface ManagedCourse extends Course {
  status: ContentStatus;
  createdAt?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface ManagedSoftware extends SoftwareTool {
  status: ContentStatus;
  createdAt?: string;
  updatedAt: string;
  updatedBy?: string;
}

export type AcademicResourceType = 
  | 'telegram' 
  | 'team_noon' 
  | 'drive' 
  | 'youtube' 
  | 'book' 
  | 'summary' 
  | 'official';

export interface ManagedResource {
  id: string;
  titleAr: string;
  descriptionAr: string;
  resourceType: AcademicResourceType;
  url: string;
  relatedCourseIds: string[];
  academicYear: AcademicYearNumber | 'all';
  sourceAttribution: string; // e.g. 'Team Noon', 'جامعة دمشق', 'مكتبة الهمك'
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface ManagedFAQ {
  id: string;
  questionAr: string;
  answerAr: string;
  categoryAr: string;
  orderIndex: number;
  status: ContentStatus;
  updatedAt: string;
  updatedBy?: string;
}

export interface PlatformStatistics {
  totalRegisteredStudents: number;
  totalProfiles: number;
  studentsByYear: Record<AcademicYearNumber, number>;
  studentsBySemester: Record<AcademicSemester, number>;
  cloudSyncedStudentsCount: number;
  onboardingCompletedCount: number;
  savedLaptopCount: number;
  totalCommunityTips: number;
  totalCommunityLikes: number;
  coursesCompletedTotal: number;
  coursesStudyingTotal: number;
  popularCourses: { courseId: string; courseNameAr: string; count: number }[];
  lastCalculatedAt: string;
}
