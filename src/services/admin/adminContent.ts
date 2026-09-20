import { 
  db, 
  collection, 
  getDocs, 
  setDoc, 
  doc 
} from '../../lib/firebase';
import { 
  ManagedCourse, 
  ManagedSoftware, 
  ManagedResource, 
  ManagedFAQ 
} from '../../types/admin';
import { COURSES_DATA } from '../../data/courses';
import { SOFTWARE_DATA } from '../../data/software';
import { RESOURCES_DATA } from '../../data/resources';
import { FAQ_DATA } from '../../data/faq';
import { adminRepository } from './adminRepository';

export const adminContentService = {
  /**
   * Seeds the rich hardcoded curriculum into Cloud Firestore
   * without creating duplicates or overwriting newer edits.
   */
  async seedExistingCurriculum(
    onProgress?: (message: string) => void
  ): Promise<{ courses: number; software: number; resources: number; faqs: number }> {
    let coursesCount = 0;
    let softwareCount = 0;
    let resourcesCount = 0;
    let faqsCount = 0;

    const now = new Date().toISOString();

    // 1. Seed Courses
    if (onProgress) onProgress('بدء مزامنة واستيراد المقررات الدراسية...');
    for (const c of COURSES_DATA) {
      const courseDocRef = doc(db, 'courses', c.id);
      const managedCourse: ManagedCourse = {
        ...c,
        status: 'active',
        createdAt: now,
        updatedAt: now,
        updatedBy: 'system_curriculum_seed'
      };
      await setDoc(courseDocRef, managedCourse, { merge: true });
      coursesCount++;
    }

    // 2. Seed Software
    if (onProgress) onProgress('بدء مزامنة واستيراد برمجيات المحاكاة...');
    for (const s of SOFTWARE_DATA) {
      const swDocRef = doc(db, 'software', s.id);
      const managedSw: ManagedSoftware = {
        ...s,
        status: 'active',
        createdAt: now,
        updatedAt: now,
        updatedBy: 'system_curriculum_seed'
      };
      await setDoc(swDocRef, managedSw, { merge: true });
      softwareCount++;
    }

    // 3. Seed Resources (Team Noon, Telegram, etc.)
    if (onProgress) onProgress('بدء مزامنة موارد ومصادر فريق نُون...');
    for (const r of RESOURCES_DATA) {
      const resDocRef = doc(db, 'academicResources', r.id);
      const managedRes: ManagedResource = {
        id: r.id,
        titleAr: r.titleAr,
        descriptionAr: r.descriptionAr,
        resourceType: (r.type === 'telegram' ? 'telegram' : r.source?.includes('نُون') ? 'team_noon' : 'official') as any,
        url: r.url || '#',
        relatedCourseIds: r.relatedCourse ? [r.relatedCourse] : [],
        academicYear: r.year || 'all',
        sourceAttribution: r.source || 'فريق نُون الأكاديمي',
        status: 'active',
        createdAt: now,
        updatedAt: now,
        updatedBy: 'system_curriculum_seed'
      };
      await setDoc(resDocRef, managedRes, { merge: true });
      resourcesCount++;
    }

    // 4. Seed FAQs
    if (onProgress) onProgress('بدء مزامنة الأسئلة الشائعة الأكاديمية...');
    let orderIndex = 1;
    for (const f of FAQ_DATA) {
      const faqDocRef = doc(db, 'faqs', f.id);
      const managedFaq: ManagedFAQ = {
        id: f.id,
        questionAr: f.questionAr,
        answerAr: f.answerAr,
        categoryAr: f.categoryAr,
        orderIndex: orderIndex++,
        status: 'active',
        updatedAt: now,
        updatedBy: 'system_curriculum_seed'
      };
      await setDoc(faqDocRef, managedFaq, { merge: true });
      faqsCount++;
    }

    // Log the entire migration
    await adminRepository.logAction(
      'CURRICULUM_SEEDED',
      'curriculum',
      'all_curriculum',
      `تم استيراد الخطة الدراسية بنجاح: ${coursesCount} مقرر، ${softwareCount} برنامج، ${resourcesCount} مورد، ${faqsCount} سؤال شائع.`
    );

    if (onProgress) onProgress('اكتملت المزامنة بنجاح!');

    return {
      courses: coursesCount,
      software: softwareCount,
      resources: resourcesCount,
      faqs: faqsCount
    };
  }
};
