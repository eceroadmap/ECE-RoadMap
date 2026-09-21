import { db, collection, query, where, getDocs, limit, doc, getDoc, setDoc } from '../lib/firebase';
import { studentRepository } from './studentRepository';
import { firebaseSyncService } from './firebaseSync';
import { StudentProfile } from '../types/student';

export interface StudentAuthResult {
  success: boolean;
  error?: 'MISSING_FIELDS' | 'INVALID_CREDENTIALS' | 'NETWORK_ERROR';
  errorMessage?: string;
  studentName?: string;
  studentEmail?: string;
}

const LOCAL_ACCOUNTS_INDEX_KEY = 'ece_registered_student_accounts_v1';

// Seeded university accounts linked with official emails
const DEFAULT_SYSTEM_ACCOUNTS: Record<string, any> = {
  'ece_roadmap': {
    uid: 'ECE_ROADMAP',
    email: 'eceroadmap@gmail.com',
    displayName: 'طالب هندسة اتصالات (ECE RoadMap)',
    username: 'ECE_ROADMAP',
    accountPassword: 'Maghy123',
    academicYear: 3,
    currentYear: 3,
    academicSemester: 1,
    role: 'current',
    roleLabelAr: 'طالب سنة ثالثة',
    onboardingCompleted: true
  },
  'eceroadmap@gmail.com': {
    uid: 'ECE_ROADMAP',
    email: 'eceroadmap@gmail.com',
    displayName: 'طالب هندسة اتصالات (ECE RoadMap)',
    username: 'ECE_ROADMAP',
    accountPassword: 'Maghy123',
    academicYear: 3,
    currentYear: 3,
    academicSemester: 1,
    role: 'current',
    roleLabelAr: 'طالب سنة ثالثة',
    onboardingCompleted: true
  }
};

export const studentAuthService = {
  /**
   * Retrieves all known student accounts from local persistent index
   */
  getLocalAccounts(): Record<string, any> {
    try {
      const data = localStorage.getItem(LOCAL_ACCOUNTS_INDEX_KEY);
      if (data) {
        return { ...DEFAULT_SYSTEM_ACCOUNTS, ...JSON.parse(data) };
      }
    } catch {
      // Ignore fallback
    }
    return { ...DEFAULT_SYSTEM_ACCOUNTS };
  },

  /**
   * Indexes and registers a student account locally & prepares for seamless login
   */
  registerStudentAccount(accountData: any): void {
    if (!accountData || typeof accountData !== 'object') return;
    try {
      const existing = this.getLocalAccounts();
      const rawUsername = (accountData.username || '').trim();
      const rawEmail = (accountData.email || '').trim().toLowerCase();
      const uid = (accountData.uid || '').trim();

      const payload = {
        ...accountData,
        username: rawUsername || accountData.username,
        email: rawEmail || accountData.email,
        updatedAt: new Date().toISOString()
      };

      if (rawUsername) {
        existing[rawUsername.toLowerCase()] = payload;
        existing[rawUsername] = payload;
      }
      if (rawEmail) {
        existing[rawEmail] = payload;
      }
      if (uid) {
        existing[uid] = payload;
      }

      localStorage.setItem(LOCAL_ACCOUNTS_INDEX_KEY, JSON.stringify(existing));
    } catch (e) {
      console.warn('Failed to register account in local student index:', e);
    }
  },

  /**
   * Authenticates a student using username/email and password.
   * Checks:
   * 1. Firestore cloud queries and direct lookups (multi-variant matching)
   * 2. Local student accounts index
   * 3. Local device profile
   * 4. System default linked accounts (e.g. ECE_ROADMAP -> eceroadmap@gmail.com)
   */
  async signInWithCredentials(
    usernameInput: string, 
    passwordInput: string,
    isArabic: boolean = true
  ): Promise<StudentAuthResult> {
    const rawUsername = usernameInput.trim();
    const cleanLower = rawUsername.toLowerCase();
    const cleanUpper = rawUsername.toUpperCase();
    const cleanPassword = passwordInput.trim();

    if (!rawUsername || !cleanPassword) {
      return { 
        success: false, 
        error: 'MISSING_FIELDS',
        errorMessage: isArabic 
          ? 'يرجى إدخال اسم المستخدم وكلمة المرور.' 
          : 'Please enter both username and password.'
      };
    }

    const checkPasswordMatch = (data: any): boolean => {
      if (!data || typeof data !== 'object') return false;
      const candidates = [
        data.accountPassword,
        data.account_password,
        data.password,
        data.studentData?.accountPassword,
        data.studentData?.password
      ];
      return candidates.some(c => typeof c === 'string' && (c.trim() === cleanPassword || c === passwordInput));
    };

    // 1. Try querying Firestore 'students' collection (Cloud-First for universal support)
    const usernameVariants = Array.from(new Set([rawUsername, cleanLower, cleanUpper]));
    for (const variant of usernameVariants) {
      try {
        const studentQuery = query(
          collection(db, 'students'),
          where('username', '==', variant),
          limit(1)
        );
        const snap = await getDocs(studentQuery);
        if (!snap.empty) {
          const docData = snap.docs[0].data();
          const studentData: Record<string, any> = { ...docData, uid: (docData as any).uid || snap.docs[0].id };
          if (checkPasswordMatch(studentData)) {
            this.registerStudentAccount(studentData);
            this.applyStudentData(studentData);
            return {
              success: true,
              studentName: studentData.displayName || studentData.name || studentData.username || rawUsername,
              studentEmail: studentData.email
            };
          }
        }
      } catch (err) {
        console.warn(`Firestore query by username (${variant}) error:`, err);
      }
    }

    // Try Firestore query by email if input is an email address
    if (cleanLower.includes('@')) {
      try {
        const emailQuery = query(
          collection(db, 'students'),
          where('email', '==', cleanLower),
          limit(1)
        );
        const snap = await getDocs(emailQuery);
        if (!snap.empty) {
          const docData = snap.docs[0].data();
          const studentData: Record<string, any> = { ...docData, uid: (docData as any).uid || snap.docs[0].id };
          if (checkPasswordMatch(studentData)) {
            this.registerStudentAccount(studentData);
            this.applyStudentData(studentData);
            return {
              success: true,
              studentName: studentData.displayName || studentData.name || studentData.username || rawUsername,
              studentEmail: studentData.email
            };
          }
        }
      } catch (err) {
        console.warn('Firestore query by email error:', err);
      }
    }

    // Try direct document lookup in Firestore by document ID
    for (const variant of usernameVariants) {
      try {
        const docRef = doc(db, 'students', variant);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const docData = docSnap.data();
          const studentData: Record<string, any> = { ...docData, uid: (docData as any).uid || docSnap.id };
          if (checkPasswordMatch(studentData)) {
            this.registerStudentAccount(studentData);
            this.applyStudentData(studentData);
            return {
              success: true,
              studentName: studentData.displayName || studentData.name || studentData.username || rawUsername,
              studentEmail: studentData.email
            };
          }
        }
      } catch (err) {
        // continue
      }
    }

    // Try full Firestore students scan for case-insensitive matching
    try {
      const allStudentsSnap = await getDocs(collection(db, 'students'));
      for (const dSnap of allStudentsSnap.docs) {
        const docData = dSnap.data();
        const studentData: Record<string, any> = { ...docData, uid: docData.uid || dSnap.id };
        const u = (studentData.username || '').trim().toLowerCase();
        const e = (studentData.email || '').trim().toLowerCase();
        const docId = dSnap.id.toLowerCase();
        if ((u === cleanLower || e === cleanLower || docId === cleanLower) && checkPasswordMatch(studentData)) {
          this.registerStudentAccount(studentData);
          this.applyStudentData(studentData);
          return {
            success: true,
            studentName: studentData.displayName || studentData.name || studentData.username || rawUsername,
            studentEmail: studentData.email
          };
        }
      }
    } catch (err) {
      console.warn('Firestore full scan for credentials error:', err);
    }

    // 2. Check Local Accounts Index (Registry of all accounts seen/registered on this device)
    const localAccounts = this.getLocalAccounts();
    const candidateKeys = [cleanLower, rawUsername, cleanUpper];
    for (const key of candidateKeys) {
      if (localAccounts[key]) {
        const acc = localAccounts[key];
        if (checkPasswordMatch(acc)) {
          this.applyStudentData(acc);
          return {
            success: true,
            studentName: acc.displayName || acc.name || acc.username || rawUsername,
            studentEmail: acc.email
          };
        }
      }
    }

    // Also scan all local accounts to match by username or email
    const allLocalValues = Object.values(localAccounts);
    for (const acc of allLocalValues) {
      if (acc && typeof acc === 'object') {
        const u = (acc.username || '').trim().toLowerCase();
        const e = (acc.email || '').trim().toLowerCase();
        if ((u === cleanLower || e === cleanLower) && checkPasswordMatch(acc)) {
          this.applyStudentData(acc);
          return {
            success: true,
            studentName: acc.displayName || acc.name || acc.username || rawUsername,
            studentEmail: acc.email
          };
        }
      }
    }

    // 3. Check Active Local device profile in localStorage
    const localProfile = studentRepository.getProfile();
    const currentUsername = (localProfile.username || '').trim();
    const currentEmail = (localProfile.email || '').trim().toLowerCase();
    const currentPassword = (localProfile.accountPassword || '').trim();

    if (
      (currentUsername && (currentUsername.toLowerCase() === cleanLower || currentUsername === rawUsername)) ||
      (currentEmail && currentEmail === cleanLower)
    ) {
      if (currentPassword === cleanPassword || currentPassword === passwordInput) {
        return {
          success: true,
          studentName: localProfile.displayName || localProfile.name || localProfile.username || rawUsername,
          studentEmail: localProfile.email
        };
      }
    }

    // 4. Default Failure Response
    return { 
      success: false, 
      error: 'INVALID_CREDENTIALS',
      errorMessage: isArabic
        ? 'اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التأكد من البيانات والمحاولة ثانية.'
        : 'Incorrect username or password. Please verify and try again.'
    };
  },

  /**
   * Applies validated student profile and academic data to repository
   */
  applyStudentData(data: any): void {
    if (!data || typeof data !== 'object') return;

    const email = data.email || (data.username?.toLowerCase() === 'ece_roadmap' ? 'eceroadmap@gmail.com' : undefined);
    const displayName = data.displayName || data.name || data.username || (email ? email.split('@')[0] : 'طالب');

    const profile: StudentProfile = {
      uid: data.uid || data.username,
      email: email,
      displayName: displayName,
      name: displayName,
      username: data.username,
      accountPassword: data.accountPassword || data.password,
      academicYear: data.academicYear || 3,
      currentYear: data.currentYear || data.academicYear || 3,
      academicSemester: data.academicSemester || 1,
      role: data.role || 'current',
      roleLabelAr: data.roleLabelAr || 'طالب سنة ثالثة',
      targetFocusTrack: data.targetFocusTrack,
      onboardingCompleted: data.onboardingCompleted ?? true,
      updatedAt: data.updatedAt || new Date().toISOString(),
      createdAt: data.createdAt || new Date().toISOString()
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

    // Keep locally indexed for instant future offline/online logins
    this.registerStudentAccount({
      ...data,
      email,
      displayName,
      username: data.username,
      accountPassword: data.accountPassword || data.password
    });

    try {
      firebaseSyncService.setAuthenticatedStudentSession({
        uid: data.uid || data.username,
        email: email || null,
        displayName: displayName || null
      });
    } catch {}
  }
};
