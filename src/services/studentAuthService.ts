import { studentRepository } from './studentRepository';
import { StudentProfile } from '../types/student';

export interface StudentAuthResult {
  success: boolean;
  error?: 'MISSING_FIELDS' | 'INVALID_CREDENTIALS' | 'NETWORK_ERROR';
  errorMessage?: string;
  studentName?: string;
}

export const studentAuthService = {
  /**
   * Attempts to authenticate a student using existing username and password.
   * Sends credentials to secure server-side endpoint POST /api/auth/student-login.
   * Does NOT query Firestore collections directly from the browser.
   */
  async signInWithCredentials(
    usernameInput: string, 
    passwordInput: string,
    isArabic: boolean = true
  ): Promise<StudentAuthResult> {
    const cleanUsername = usernameInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    if (!cleanUsername || !cleanPassword) {
      return { 
        success: false, 
        error: 'MISSING_FIELDS',
        errorMessage: isArabic 
          ? 'يرجى كتابة اسم المستخدم وكلمة المرور.' 
          : 'Please enter both username and password.'
      };
    }

    // 1. Server-Side Authentication via Worker Endpoint
    try {
      const response = await fetch('/api/auth/student-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: cleanUsername,
          password: cleanPassword
        })
      });

      if (response.ok) {
        const result = await response.json() as any;
        if (result.success && result.student) {
          this.applyStudentData(result.student);
          return {
            success: true,
            studentName: result.student.displayName || result.student.name || result.student.username || 'طالب'
          };
        }
      }
    } catch {
      // Network failure or development fallback
    }

    // 2. Offline / Local device profile check
    const localProfile = studentRepository.getProfile();
    const localUsername = (localProfile.username || '').trim().toLowerCase();
    const localPassword = (localProfile.accountPassword || '').trim();

    if (localUsername && localUsername === cleanUsername && localPassword === cleanPassword) {
      return {
        success: true,
        studentName: localProfile.name || localProfile.username || 'طالب'
      };
    }

    // 3. Generic Failure Response (No sensitive hint whether username exists or not)
    return { 
      success: false, 
      error: 'INVALID_CREDENTIALS',
      errorMessage: isArabic
        ? 'اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التحقق من البيانات والمحاولة مجدداً.'
        : 'Incorrect username or password. Please verify and try again.'
    };
  },

  /**
   * Applies validated student profile and academic data to repository
   */
  applyStudentData(data: any): void {
    const profile: StudentProfile = {
      name: data.displayName || data.username,
      username: data.username,
      accountPassword: data.accountPassword,
      academicYear: data.academicYear || 3,
      currentYear: data.currentYear || data.academicYear || 3,
      academicSemester: data.academicSemester || 1,
      role: data.role || 'current',
      roleLabelAr: data.roleLabelAr || 'طالب حالي',
      targetFocusTrack: data.targetFocusTrack,
      onboardingCompleted: data.onboardingCompleted ?? true,
      updatedAt: data.updatedAt || new Date().toISOString(),
      createdAt: data.createdAt
    };

    studentRepository.saveProfile(profile);

    if (data.coursesProgress && typeof data.coursesProgress === 'object') {
      Object.entries(data.coursesProgress).forEach(([courseId, status]) => {
        studentRepository.setCourseStatus(courseId, status as any);
      });
    }

    if (data.academicGrades && typeof data.academicGrades === 'object') {
      studentRepository.setAllGrades(data.academicGrades);
    }

    if (data.graduationWorkspace && typeof data.graduationWorkspace === 'object') {
      studentRepository.saveGraduationWorkspace(data.graduationWorkspace);
    }

    if (data.savedLaptop && typeof data.savedLaptop === 'object') {
      studentRepository.saveLaptop(data.savedLaptop.specs, data.savedLaptop.evaluation);
    }
  }
};
