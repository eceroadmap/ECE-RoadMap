import { db, collection, query, where, getDocs } from '../lib/firebase';
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
   * Searches for matching credentials in Firestore 'students' collection or locally.
   * Strictly read/verify only - DOES NOT create new students or modify records on failure.
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

    // 1. Check against Firestore 'students' collection (if accessible / online)
    try {
      const studentsQuery = query(
        collection(db, 'students'),
        where('username', '==', cleanUsername)
      );
      const snap = await getDocs(studentsQuery);

      if (!snap.empty) {
        let matchedDocData: any = null;
        for (const docSnap of snap.docs) {
          const data = docSnap.data();
          if (data.accountPassword === cleanPassword) {
            matchedDocData = data;
            break;
          }
        }

        if (matchedDocData) {
          this.applyStudentData(matchedDocData);
          return {
            success: true,
            studentName: matchedDocData.displayName || matchedDocData.username || 'طالب'
          };
        } else {
          // Username matches a document but password does not match
          return { 
            success: false, 
            error: 'INVALID_CREDENTIALS',
            errorMessage: isArabic
              ? 'اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التحقق من البيانات والمحاولة مجدداً.'
              : 'Incorrect username or password. Please verify and try again.'
          };
        }
      }
    } catch (firestoreErr) {
      console.warn('Firestore student lookup note (permission/offline):', firestoreErr);
      // Fall through to local profile check
    }

    // 2. Check local student profile if previously saved on this device
    const localProfile = studentRepository.getProfile();
    const localUsername = (localProfile.username || '').trim().toLowerCase();
    const localPassword = (localProfile.accountPassword || '').trim();

    if (localUsername && localUsername === cleanUsername) {
      if (localPassword === cleanPassword) {
        return {
          success: true,
          studentName: localProfile.name || localProfile.username || 'طالب'
        };
      } else {
        return { 
          success: false, 
          error: 'INVALID_CREDENTIALS',
          errorMessage: isArabic
            ? 'اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التحقق من البيانات والمحاولة مجدداً.'
            : 'Incorrect username or password. Please verify and try again.'
        };
      }
    }

    // 3. Fallback: Not found in Firestore or Local Profile
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
