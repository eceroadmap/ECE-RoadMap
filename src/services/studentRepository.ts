import { 
  StudentProfile, 
  CourseProgressStatus, 
  SavedLaptopRecord,
  AcademicYearNumber,
  AcademicSemester,
  CourseGrade,
  GraduationProjectWorkspace
} from '../types';
import { LaptopSpecs, LaptopEvaluationResult } from '../types';

const PROFILE_KEY = 'ece_roadmap_profile_v1';
const COURSES_PROGRESS_KEY = 'ece_roadmap_courses_v1';
const LAPTOP_KEY = 'ece_roadmap_laptop_v1';
const GRADES_KEY = 'ece_roadmap_grades_v1';
const GRADUATION_WORKSPACE_KEY = 'ece_roadmap_grad_workspace_v1';

export const DEFAULT_PROFILE: StudentProfile = {
  role: 'current',
  roleLabelAr: 'طالب حالي',
  academicYear: 3,
  currentYear: 3,
  academicSemester: 1,
  onboardingCompleted: false,
  updatedAt: new Date().toISOString()
};

export const DEFAULT_GRADUATION_WORKSPACE: GraduationProjectWorkspace = {
  starredProjectIds: []
};

// Listeners for multi-component reactivity
type Listener = () => void;
const listeners: Set<Listener> = new Set();

export const subscribeToStudentStore = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = () => {
  listeners.forEach(cb => cb());
};

export const studentRepository = {
  getProfile(): StudentProfile {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      if (data) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('LocalStorage error in getProfile', e);
    }
    return DEFAULT_PROFILE;
  },

  saveProfile(updated: Partial<StudentProfile>): StudentProfile {
    const current = this.getProfile();
    const next: StudentProfile = {
      ...current,
      ...updated,
      updatedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('LocalStorage error in saveProfile', e);
    }
    notifyListeners();
    return next;
  },

  getCourseProgress(): Record<string, CourseProgressStatus> {
    try {
      const data = localStorage.getItem(COURSES_PROGRESS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('LocalStorage error in getCourseProgress', e);
    }
    return {};
  },

  setCourseStatus(courseId: string, status: CourseProgressStatus | null): Record<string, CourseProgressStatus> {
    const map = this.getCourseProgress();
    if (status === null) {
      delete map[courseId];
    } else {
      map[courseId] = status;
    }
    try {
      localStorage.setItem(COURSES_PROGRESS_KEY, JSON.stringify(map));
    } catch (e) {
      console.warn('LocalStorage error in setCourseStatus', e);
    }
    notifyListeners();
    return { ...map };
  },

  getAcademicGrades(): Record<string, CourseGrade> {
    try {
      const data = localStorage.getItem(GRADES_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('LocalStorage error in getAcademicGrades', e);
    }
    return {};
  },

  saveCourseGrade(grade: CourseGrade): Record<string, CourseGrade> {
    const grades = this.getAcademicGrades();
    grades[grade.courseId] = {
      ...grade,
      updatedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(GRADES_KEY, JSON.stringify(grades));
    } catch (e) {
      console.warn('LocalStorage error in saveCourseGrade', e);
    }

    // Automatically synchronize course progress status based on grade status
    if (grade.status === 'passed') {
      this.setCourseStatus(grade.courseId, 'completed');
    } else if (grade.status === 'failed') {
      this.setCourseStatus(grade.courseId, 'important');
    } else if (grade.status === 'in_progress') {
      this.setCourseStatus(grade.courseId, 'to_study');
    }

    notifyListeners();
    return { ...grades };
  },

  removeCourseGrade(courseId: string): Record<string, CourseGrade> {
    const grades = this.getAcademicGrades();
    delete grades[courseId];
    try {
      localStorage.setItem(GRADES_KEY, JSON.stringify(grades));
    } catch (e) {
      console.warn('LocalStorage error in removeCourseGrade', e);
    }
    notifyListeners();
    return { ...grades };
  },

  setAllGrades(allGrades: Record<string, CourseGrade>): void {
    try {
      localStorage.setItem(GRADES_KEY, JSON.stringify(allGrades));
    } catch (e) {
      console.warn('LocalStorage error in setAllGrades', e);
    }
    notifyListeners();
  },

  getGraduationWorkspace(): GraduationProjectWorkspace {
    try {
      const data = localStorage.getItem(GRADUATION_WORKSPACE_KEY);
      if (data) {
        return { ...DEFAULT_GRADUATION_WORKSPACE, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('LocalStorage error in getGraduationWorkspace', e);
    }
    return DEFAULT_GRADUATION_WORKSPACE;
  },

  saveGraduationWorkspace(updated: Partial<GraduationProjectWorkspace>): GraduationProjectWorkspace {
    const current = this.getGraduationWorkspace();
    const next: GraduationProjectWorkspace = {
      ...current,
      ...updated,
      savedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(GRADUATION_WORKSPACE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('LocalStorage error in saveGraduationWorkspace', e);
    }
    notifyListeners();
    return next;
  },

  toggleStarredProject(projectId: string): GraduationProjectWorkspace {
    const current = this.getGraduationWorkspace();
    const currentStarred = current.starredProjectIds || [];
    const isStarred = currentStarred.includes(projectId);
    const nextStarred = isStarred 
      ? currentStarred.filter(id => id !== projectId)
      : [...currentStarred, projectId];
    
    return this.saveGraduationWorkspace({ starredProjectIds: nextStarred });
  },

  getSavedLaptop(): SavedLaptopRecord | null {
    try {
      const data = localStorage.getItem(LAPTOP_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('LocalStorage error in getSavedLaptop', e);
    }
    return null;
  },

  saveLaptop(specs: LaptopSpecs, evaluation: LaptopEvaluationResult): SavedLaptopRecord {
    const record: SavedLaptopRecord = {
      specs,
      evaluation,
      savedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(LAPTOP_KEY, JSON.stringify(record));
    } catch (e) {
      console.warn('LocalStorage error in saveLaptop', e);
    }
    notifyListeners();
    return record;
  },

  removeSavedLaptop(): void {
    try {
      localStorage.removeItem(LAPTOP_KEY);
    } catch (e) {
      console.warn('LocalStorage error in removeSavedLaptop', e);
    }
    notifyListeners();
  },

  resetAll(): void {
    try {
      localStorage.removeItem(PROFILE_KEY);
      localStorage.removeItem(COURSES_PROGRESS_KEY);
      localStorage.removeItem(LAPTOP_KEY);
      localStorage.removeItem(GRADES_KEY);
      localStorage.removeItem(GRADUATION_WORKSPACE_KEY);
    } catch (e) {
      console.warn('LocalStorage error in resetAll', e);
    }
    notifyListeners();
  }
};

