import { 
  db, 
  collection, 
  getDocs 
} from '../../lib/firebase';
import { PlatformStatistics } from '../../types/admin';
import { AcademicYearNumber, AcademicSemester } from '../../types';
import { COURSES_DATA } from '../../data/courses';

export async function fetchPlatformStatistics(): Promise<PlatformStatistics> {
  const studentsSnap = await getDocs(collection(db, 'students'));
  const tipsSnap = await getDocs(collection(db, 'communityTips'));

  const totalRegistered = studentsSnap.size;
  let cloudSyncedCount = 0;
  let onboardingCompletedCount = 0;
  let savedLaptopCount = 0;
  let coursesCompletedTotal = 0;
  let coursesStudyingTotal = 0;

  const studentsByYear: Record<AcademicYearNumber, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
  };

  const studentsBySemester: Record<AcademicSemester, number> = {
    1: 0,
    2: 0
  };

  const courseCounts: Record<string, number> = {};

  studentsSnap.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.email) {
      cloudSyncedCount++;
    }
    if (data.onboardingCompleted) {
      onboardingCompletedCount++;
    }
    if (data.savedLaptop) {
      savedLaptopCount++;
    }

    const yr = Number(data.academicYear || data.currentYear);
    if (yr >= 1 && yr <= 5) {
      studentsByYear[yr as AcademicYearNumber] = (studentsByYear[yr as AcademicYearNumber] || 0) + 1;
    }

    const sem = Number(data.academicSemester);
    if (sem === 1 || sem === 2) {
      studentsBySemester[sem as AcademicSemester] = (studentsBySemester[sem as AcademicSemester] || 0) + 1;
    }

    // Tally courses progress aggregates
    if (data.coursesProgress && typeof data.coursesProgress === 'object') {
      Object.entries(data.coursesProgress).forEach(([cId, status]) => {
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
  let totalCommunityTips = tipsSnap.size;
  let totalCommunityLikes = 0;
  tipsSnap.forEach((docSnap) => {
    const data = docSnap.data();
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
}
