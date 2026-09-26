import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function seedSharedStats() {
  console.log('Seeding initial shared platform stats and students directory to site_stats...');

  const initialStudents = [
    { uid: 'stu_1', displayName: 'أحمد المحمد', academicYear: 1, currentYear: 1, academicSemester: 1, role: 'freshman', roleLabelAr: 'طالب سنة أولى (مستجد)', onboardingCompleted: true, email: 'ahmad.m@student.edu', createdAt: '2026-09-15T10:00:00Z' },
    { uid: 'stu_2', displayName: 'سارة الخالد', academicYear: 1, currentYear: 1, academicSemester: 1, role: 'freshman', roleLabelAr: 'طالب سنة أولى (مستجد)', onboardingCompleted: true, email: 'sara.k@student.edu', createdAt: '2026-09-15T11:30:00Z' },
    { uid: 'stu_3', displayName: 'محمد العلي', academicYear: 1, currentYear: 1, academicSemester: 1, role: 'freshman', roleLabelAr: 'طالب سنة أولى (مستجد)', onboardingCompleted: true, email: 'mohammad.a@student.edu', createdAt: '2026-09-16T09:15:00Z' },
    { uid: 'stu_4', displayName: 'نور الدين حسن', academicYear: 1, currentYear: 1, academicSemester: 1, role: 'freshman', roleLabelAr: 'طالب سنة أولى (مستجد)', onboardingCompleted: true, email: 'nour.h@student.edu', createdAt: '2026-09-16T14:20:00Z' },
    { uid: 'stu_5', displayName: 'عمر الفاروق', academicYear: 2, currentYear: 2, academicSemester: 1, role: 'current', roleLabelAr: 'طالب سنة ثانية', onboardingCompleted: true, email: 'omar.f@student.edu', createdAt: '2026-09-17T08:45:00Z' },
    { uid: 'stu_6', displayName: 'آية يوسف', academicYear: 2, currentYear: 2, academicSemester: 1, role: 'current', roleLabelAr: 'طالب سنة ثانية', onboardingCompleted: true, email: 'aya.y@student.edu', createdAt: '2026-09-17T12:10:00Z' },
    { uid: 'stu_7', displayName: 'حمزة النجار', academicYear: 2, currentYear: 2, academicSemester: 1, role: 'current', roleLabelAr: 'طالب سنة ثانية', onboardingCompleted: true, email: 'hamza.n@student.edu', createdAt: '2026-09-18T10:00:00Z' },
    { uid: 'stu_8', displayName: 'ريم القاسم', academicYear: 2, currentYear: 2, academicSemester: 1, role: 'current', roleLabelAr: 'طالب سنة ثانية', onboardingCompleted: true, email: 'reem.q@student.edu', createdAt: '2026-09-18T16:30:00Z' },
    { uid: 'stu_9', displayName: 'كريم الصالح', academicYear: 3, currentYear: 3, academicSemester: 1, role: 'current', roleLabelAr: 'طالب سنة ثالثة', onboardingCompleted: true, email: 'kareem.s@student.edu', createdAt: '2026-09-19T09:00:00Z' },
    { uid: 'stu_10', displayName: 'ميساء إبراهيم', academicYear: 3, currentYear: 3, academicSemester: 1, role: 'current', roleLabelAr: 'طالب سنة ثالثة', onboardingCompleted: true, email: 'maysa.i@student.edu', createdAt: '2026-09-19T11:45:00Z' },
    { uid: 'stu_11', displayName: 'طارق زياد', academicYear: 3, currentYear: 3, academicSemester: 1, role: 'current', roleLabelAr: 'طالب سنة ثالثة', onboardingCompleted: true, email: 'tariq.z@student.edu', createdAt: '2026-09-20T13:20:00Z' },
    { uid: 'stu_12', displayName: 'هبة الخطيب', academicYear: 3, currentYear: 3, academicSemester: 1, role: 'current', roleLabelAr: 'طالب سنة ثالثة', onboardingCompleted: true, email: 'hiba.k@student.edu', createdAt: '2026-09-20T15:50:00Z' },
    { uid: 'stu_13', displayName: 'سامر بركات', academicYear: 4, currentYear: 4, academicSemester: 1, role: 'current', roleLabelAr: 'طالب سنة رابعة', onboardingCompleted: true, email: 'samer.b@student.edu', createdAt: '2026-09-21T08:30:00Z' },
    { uid: 'stu_14', displayName: 'لانا الشامي', academicYear: 4, currentYear: 4, academicSemester: 1, role: 'current', roleLabelAr: 'طالب سنة رابعة', onboardingCompleted: true, email: 'lana.s@student.edu', createdAt: '2026-09-21T10:15:00Z' },
    { uid: 'stu_15', displayName: 'باسل الرفاعي', academicYear: 4, currentYear: 4, academicSemester: 1, role: 'current', roleLabelAr: 'طالب سنة رابعة', onboardingCompleted: true, email: 'basel.r@student.edu', createdAt: '2026-09-22T14:00:00Z' },
    { uid: 'stu_16', displayName: 'فادي داوود', academicYear: 5, currentYear: 5, academicSemester: 1, role: 'graduate', roleLabelAr: 'طالب سنة خامسة (تخرج)', onboardingCompleted: true, email: 'fadi.d@student.edu', createdAt: '2026-09-22T16:45:00Z' },
    { uid: 'stu_17', displayName: 'مريم منصور', academicYear: 5, currentYear: 5, academicSemester: 1, role: 'graduate', roleLabelAr: 'طالب سنة خامسة (تخرج)', onboardingCompleted: true, email: 'maryam.m@student.edu', createdAt: '2026-09-23T09:20:00Z' },
    { uid: 'stu_18', displayName: 'حسام الدين ناصيف', academicYear: 5, currentYear: 5, academicSemester: 1, role: 'graduate', roleLabelAr: 'طالب سنة خامسة (تخرج)', onboardingCompleted: true, email: 'hussam.n@student.edu', createdAt: '2026-09-23T12:00:00Z' },
    { uid: 'stu_19', displayName: 'مهندس خريج متميز', academicYear: 5, currentYear: 'graduate', academicSemester: 2, role: 'graduate', roleLabelAr: 'مهندس خريج معتمد', onboardingCompleted: true, email: 'engineer.grad@ece.org', createdAt: '2026-09-24T10:00:00Z' }
  ];

  const studentsByYear: Record<number, number> = { 1: 4, 2: 4, 3: 4, 4: 3, 5: 4 };
  const studentsBySemester: Record<number, number> = { 1: 18, 2: 1 };

  const statsPayload = {
    totalRegisteredStudents: 19,
    totalProfiles: 19,
    studentsByYear,
    studentsBySemester,
    cloudSyncedStudentsCount: 19,
    onboardingCompletedCount: 19,
    savedLaptopCount: 8,
    totalCommunityTips: 2,
    totalCommunityLikes: 1,
    coursesCompletedTotal: 42,
    coursesStudyingTotal: 18,
    popularCourses: [
      { courseId: 'math-5', courseNameAr: 'رياضيات هندسية 5', count: 12 },
      { courseId: 'signals-1', courseNameAr: 'إشارات ونظم', count: 10 },
      { courseId: 'circuits-1', courseNameAr: 'دارات كهربائية 1', count: 9 },
      { courseId: 'electronics-1', courseNameAr: 'إلكترونيات 1', count: 8 },
      { courseId: 'comm-1', courseNameAr: 'مبادئ الاتصالات', count: 7 }
    ],
    lastCalculatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await setDoc(doc(db, 'site_stats', 'platform_stats'), statsPayload, { merge: true });
  console.log('Successfully written site_stats/platform_stats with 19 students!');

  await setDoc(doc(db, 'site_stats', 'students_directory'), {
    students: initialStudents,
    totalCount: initialStudents.length,
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log('Successfully written site_stats/students_directory with 19 student records!');

  // Verify reads
  const sSnap = await getDoc(doc(db, 'site_stats', 'platform_stats'));
  console.log('Read back platform_stats: totalRegisteredStudents =', sSnap.data()?.totalRegisteredStudents);

  const dSnap = await getDoc(doc(db, 'site_stats', 'students_directory'));
  console.log('Read back students_directory: student count =', dSnap.data()?.students?.length);
}

seedSharedStats().then(() => process.exit(0)).catch(e => { console.error('FAILED:', e); process.exit(1); });
