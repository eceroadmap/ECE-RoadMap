import { 
  db, 
  collection, 
  getDocs 
} from '../../lib/firebase';
import { PlatformStatistics } from '../../types/admin';
import { AcademicYearNumber, AcademicSemester } from '../../types';
import { COURSES_DATA } from '../../data/courses';

/**
 * Robust helper to extract Academic Year from student / visitor record.
 * Handles numeric years 1-5, string '1'-'5', 'graduate' (maps to 5),
 * 'freshman' role (maps to 1), and string variations.
 */
export function extractAcademicYear(data: any): AcademicYearNumber {
  if (!data) return 1;

  const rawYear = data.academicYear ?? data.currentYear;

  if (rawYear === 'graduate' || data.role === 'graduate') {
    return 5;
  }

  if (typeof rawYear === 'number') {
    if (rawYear >= 1 && rawYear <= 5) {
      return rawYear as AcademicYearNumber;
    }
  }

  if (typeof rawYear === 'string') {
    const trimmed = rawYear.trim().toLowerCase();
    if (trimmed === 'graduate' || trimmed.includes('تخرج') || trimmed.includes('خريج')) {
      return 5;
    }
    const parsed = parseInt(trimmed, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 5) {
      return parsed as AcademicYearNumber;
    }
  }

  if (data.role === 'freshman' || (typeof data.roleLabelAr === 'string' && data.roleLabelAr.includes('مستجد'))) {
    return 1;
  }

  return 1;
}

/**
 * Robust helper to extract Academic Semester (1 or 2).
 */
export function extractAcademicSemester(data: any): AcademicSemester {
  if (!data) return 1;
  const rawSem = data.academicSemester ?? data.currentSemester;
  if (rawSem === 2 || rawSem === '2') return 2;
  return 1;
}

/**
 * Check if the record belongs to the platform owner / super admin to exclude from student counts.
 */
export function isPlatformOwnerRecord(data: any): boolean {
  if (!data) return false;
  const email = (data.email || '').toLowerCase().trim();
  const role = (data.role || '').toLowerCase().trim();

  return (
    email === 'eceroadmap@gmail.com' ||
    email.includes('eceroadmap') ||
    role === 'super_admin' ||
    data.isOwner === true
  );
}

export async function fetchPlatformStatistics(): Promise<PlatformStatistics> {
  const defaultYearStats: Record<AcademicYearNumber, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const defaultSemesterStats: Record<AcademicSemester, number> = { 1: 0, 2: 0 };

  try {
    // 1. Fetch data from both 'students' and 'guest_visitors' collections simultaneously
    const [studentsSnapResult, guestsSnapResult, tipsSnapResult] = await Promise.allSettled([
      getDocs(collection(db, 'students')),
      getDocs(collection(db, 'guest_visitors')),
      getDocs(collection(db, 'communityTips'))
    ]);

    const studentsSnap = studentsSnapResult.status === 'fulfilled' ? studentsSnapResult.value : null;
    const guestsSnap = guestsSnapResult.status === 'fulfilled' ? guestsSnapResult.value : null;
    const tipsSnap = tipsSnapResult.status === 'fulfilled' ? tipsSnapResult.value : null;

    let cloudSyncedCount = 0;
    let onboardingCompletedCount = 0;
    let savedLaptopCount = 0;
    let coursesCompletedTotal = 0;
    let coursesStudyingTotal = 0;

    const studentsByYear: Record<AcademicYearNumber, number> = { ...defaultYearStats };
    const studentsBySemester: Record<AcademicSemester, number> = { ...defaultSemesterStats };
    const courseCounts: Record<string, number> = {};

    // Deduplication tracking: key -> student data
    const unifiedStudentsMap = new Map<string, any>();

    // A. Process 'students' collection (Google & cloud synced profiles)
    studentsSnap?.forEach((docSnap) => {
      const data = docSnap.data() || {};
      if (isPlatformOwnerRecord(data)) return;

      const uid = docSnap.id;
      unifiedStudentsMap.set(uid, { ...data, uid, _source: 'students' });
    });

    // B. Process 'guest_visitors' collection (Registered visitors & local guest entries)
    guestsSnap?.forEach((docSnap) => {
      const data = docSnap.data() || {};
      if (isPlatformOwnerRecord(data)) return;

      const guestId = docSnap.id || data.id;
      // If already present via student UID, avoid double counting
      if (!unifiedStudentsMap.has(guestId)) {
        unifiedStudentsMap.set(guestId, { ...data, uid: guestId, _source: 'guest_visitors' });
      }
    });

    // C. Aggregate statistics across all unified student records
    unifiedStudentsMap.forEach((student) => {
      const hasRealEmail = !!(
        student.email && 
        typeof student.email === 'string' && 
        student.email.includes('@') && 
        !student.email.includes('زائر')
      );

      if (hasRealEmail) {
        cloudSyncedCount++;
      }

      if (student.onboardingCompleted || student.academicYear || student._source === 'guest_visitors') {
        onboardingCompletedCount++;
      }

      if (student.savedLaptop && (student.savedLaptop.specs || student.savedLaptop.evaluation)) {
        savedLaptopCount++;
      }

      // Year distribution
      const year = extractAcademicYear(student);
      studentsByYear[year] = (studentsByYear[year] || 0) + 1;

      // Semester distribution
      const semester = extractAcademicSemester(student);
      studentsBySemester[semester] = (studentsBySemester[semester] || 0) + 1;

      // Course progress aggregation
      if (student.coursesProgress && typeof student.coursesProgress === 'object') {
        Object.entries(student.coursesProgress).forEach(([cId, status]) => {
          if (status === 'completed') {
            coursesCompletedTotal++;
            courseCounts[cId] = (courseCounts[cId] || 0) + 1;
          } else if (status === 'to_study' || status === 'important') {
            coursesStudyingTotal++;
            courseCounts[cId] = (courseCounts[cId] || 0) + 1;
          }
        });
      }
    });

    const totalRegistered = unifiedStudentsMap.size;

    // Calculate popular courses from aggregate tallies
    const courseLookup = new Map(COURSES_DATA.map(c => [c.id, c.nameAr]));
    const popularCourses = Object.entries(courseCounts)
      .map(([courseId, count]) => ({
        courseId,
        courseNameAr: courseLookup.get(courseId) || courseId,
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Tips tally
    let totalCommunityTips = tipsSnap?.size || 0;
    let totalCommunityLikes = 0;
    tipsSnap?.forEach((docSnap) => {
      const data = docSnap.data() || {};
      totalCommunityLikes += Number(data.likesCount || 0);
    });

    return {
      totalRegisteredStudents: totalRegistered,
      totalProfiles: totalRegistered,
      studentsByYear,
      studentsBySemester,
      cloudSyncedStudentsCount: cloudSyncedCount,
      onboardingCompletedCount,
      savedLaptopCount,
      totalCommunityTips,
      totalCommunityLikes,
      coursesCompletedTotal,
      coursesStudyingTotal,
      popularCourses,
      lastCalculatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.warn('Could not fetch platform statistics from remote Firestore:', error);
    return {
      totalRegisteredStudents: 0,
      totalProfiles: 0,
      studentsByYear: defaultYearStats,
      studentsBySemester: defaultSemesterStats,
      cloudSyncedStudentsCount: 0,
      onboardingCompletedCount: 0,
      savedLaptopCount: 0,
      totalCommunityTips: 0,
      totalCommunityLikes: 0,
      coursesCompletedTotal: 0,
      coursesStudyingTotal: 0,
      popularCourses: [],
      lastCalculatedAt: new Date().toISOString()
    };
  }
}

