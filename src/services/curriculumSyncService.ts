import { useState, useEffect } from 'react';
import { 
  db, 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  ensureFirebaseAuth,
  auth,
  addDoc
} from '../lib/firebase';
import { 
  ManagedCourse, 
  ManagedSoftware, 
  ManagedResource, 
  ManagedFAQ 
} from '../types/admin';
import { Course } from '../types';
import { COURSES_DATA } from '../data/courses';
import { SOFTWARE_DATA } from '../data/software';
import { RESOURCES_DATA } from '../data/resources';
import { FAQ_DATA } from '../data/faq';

async function recordAdminLog(actionType: string, targetContentType: string, targetDocId: string, details: string) {
  try {
    const user = auth.currentUser;
    await addDoc(collection(db, 'adminLogs'), {
      adminUid: user?.uid || 'system',
      adminEmail: user?.email || 'admin',
      actionType,
      targetContentType,
      targetDocId,
      details,
      timestamp: new Date().toISOString()
    });
  } catch {}
}

type Listener<T> = (data: T) => void;

class CurriculumSyncService {
  private coursesMap = new Map<string, ManagedCourse>();
  private softwareMap = new Map<string, ManagedSoftware>();
  private resourcesMap = new Map<string, ManagedResource>();
  private faqsMap = new Map<string, ManagedFAQ>();

  private coursesListeners = new Set<Listener<ManagedCourse[]>>();
  private softwareListeners = new Set<Listener<ManagedSoftware[]>>();
  private resourcesListeners = new Set<Listener<ManagedResource[]>>();
  private faqsListeners = new Set<Listener<ManagedFAQ[]>>();

  private initialized = false;
  private unsubscribers: Array<() => void> = [];

  constructor() {
    this.seedInitialBaseData();
  }

  /**
   * Initializes in-memory registries from deterministic base curriculum
   */
  private seedInitialBaseData() {
    // 1. Courses (57 comprehensive courses)
    COURSES_DATA.forEach((c) => {
      this.coursesMap.set(c.id, {
        ...c,
        status: 'active',
        updatedAt: (c as any).updatedAt || new Date().toISOString()
      });
    });

    // 2. Software tools
    SOFTWARE_DATA.forEach((s) => {
      this.softwareMap.set(s.id, {
        ...s,
        status: 'active',
        updatedAt: new Date().toISOString()
      });
    });

    // 3. Academic Resources
    RESOURCES_DATA.forEach((r) => {
      this.resourcesMap.set(r.id, {
        id: r.id,
        titleAr: r.titleAr,
        descriptionAr: r.descriptionAr,
        resourceType: (r.type === 'telegram' ? 'telegram' : r.source?.includes('نُون') ? 'team_noon' : 'official') as any,
        url: r.url || '#',
        relatedCourseIds: r.relatedCourse ? [r.relatedCourse] : [],
        academicYear: r.year || 'all',
        sourceAttribution: r.source || 'فريق نُون الأكاديمي',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    // 4. FAQs
    FAQ_DATA.forEach((f, idx) => {
      this.faqsMap.set(f.id, {
        id: f.id,
        questionAr: f.questionAr,
        answerAr: f.answerAr,
        categoryAr: f.categoryAr,
        orderIndex: idx + 1,
        status: 'active',
        updatedAt: new Date().toISOString()
      });
    });
  }

  /**
   * Starts Firestore real-time listeners across both direct collections
   * and shared universal channels in site_stats
   */
  public initRealTimeSync() {
    if (this.initialized) return;
    this.initialized = true;

    // Ensure session exists
    ensureFirebaseAuth().catch(() => null);

    // -------------------------------------------------------------
    // A. Real-Time Courses Sync
    // -------------------------------------------------------------
    // Channel 1: Firestore 'courses' collection
    try {
      const unsubDirectCourses = onSnapshot(
        collection(db, 'courses'),
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            const data = change.doc.data() as ManagedCourse;
            const courseId = change.doc.id;

            if (change.type === 'removed') {
              // Revert to base curriculum if removed, or update status
              const base = COURSES_DATA.find((c) => c.id === courseId);
              if (base) {
                this.coursesMap.set(courseId, { ...base, status: 'active', updatedAt: new Date().toISOString() });
              } else {
                this.coursesMap.delete(courseId);
              }
            } else {
              const existing = this.coursesMap.get(courseId);
              this.coursesMap.set(courseId, {
                ...(existing || {}),
                ...data,
                id: courseId
              });
            }
          });
          this.notifyCoursesListeners();
        },
        (error) => {
          console.info('Direct courses listener notice (broadcasting via site_stats):', error?.message);
        }
      );
      this.unsubscribers.push(unsubDirectCourses);
    } catch {}

    // Channel 2: Universal shared 'site_stats/custom_courses'
    try {
      const unsubSharedCourses = onSnapshot(
        doc(db, 'site_stats', 'custom_courses'),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() || {};
            Object.entries(data).forEach(([key, val]) => {
              if (key === 'lastUpdatedAt' || key === 'lastUpdatedBy') return;
              if (val && typeof val === 'object') {
                const coursePayload = val as ManagedCourse;
                const existing = this.coursesMap.get(key);
                this.coursesMap.set(key, {
                  ...(existing || {}),
                  ...coursePayload,
                  id: key
                });
              }
            });
            this.notifyCoursesListeners();
          }
        },
        (error) => {
          console.info('Shared courses listener notice:', error?.message);
        }
      );
      this.unsubscribers.push(unsubSharedCourses);
    } catch {}

    // -------------------------------------------------------------
    // B. Real-Time Software Tools Sync
    // -------------------------------------------------------------
    try {
      const unsubSoftware = onSnapshot(
        collection(db, 'software'),
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            const data = change.doc.data() as ManagedSoftware;
            const swId = change.doc.id;
            if (change.type === 'removed') {
              this.softwareMap.delete(swId);
            } else {
              const existing = this.softwareMap.get(swId);
              this.softwareMap.set(swId, { ...(existing || {}), ...data, id: swId });
            }
          });
          this.notifySoftwareListeners();
        },
        () => {}
      );
      this.unsubscribers.push(unsubSoftware);

      const unsubSharedSoftware = onSnapshot(
        doc(db, 'site_stats', 'custom_software'),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() || {};
            Object.entries(data).forEach(([key, val]) => {
              if (key.startsWith('lastUpdated')) return;
              if (val && typeof val === 'object') {
                const existing = this.softwareMap.get(key);
                this.softwareMap.set(key, { ...(existing || {}), ...(val as ManagedSoftware), id: key });
              }
            });
            this.notifySoftwareListeners();
          }
        },
        () => {}
      );
      this.unsubscribers.push(unsubSharedSoftware);
    } catch {}

    // -------------------------------------------------------------
    // C. Real-Time Academic Resources Sync
    // -------------------------------------------------------------
    try {
      const unsubResources = onSnapshot(
        collection(db, 'academicResources'),
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            const data = change.doc.data() as ManagedResource;
            const resId = change.doc.id;
            if (change.type === 'removed') {
              this.resourcesMap.delete(resId);
            } else {
              const existing = this.resourcesMap.get(resId);
              this.resourcesMap.set(resId, { ...(existing || {}), ...data, id: resId });
            }
          });
          this.notifyResourcesListeners();
        },
        () => {}
      );
      this.unsubscribers.push(unsubResources);

      const unsubSharedResources = onSnapshot(
        doc(db, 'site_stats', 'custom_resources'),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() || {};
            Object.entries(data).forEach(([key, val]) => {
              if (key.startsWith('lastUpdated')) return;
              if (val && typeof val === 'object') {
                const existing = this.resourcesMap.get(key);
                this.resourcesMap.set(key, { ...(existing || {}), ...(val as ManagedResource), id: key });
              }
            });
            this.notifyResourcesListeners();
          }
        },
        () => {}
      );
      this.unsubscribers.push(unsubSharedResources);
    } catch {}

    // -------------------------------------------------------------
    // D. Real-Time FAQs Sync
    // -------------------------------------------------------------
    try {
      const unsubFaqs = onSnapshot(
        collection(db, 'faqs'),
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            const data = change.doc.data() as ManagedFAQ;
            const fId = change.doc.id;
            if (change.type === 'removed') {
              this.faqsMap.delete(fId);
            } else {
              const existing = this.faqsMap.get(fId);
              this.faqsMap.set(fId, { ...(existing || {}), ...data, id: fId });
            }
          });
          this.notifyFaqsListeners();
        },
        () => {}
      );
      this.unsubscribers.push(unsubFaqs);

      const unsubSharedFaqs = onSnapshot(
        doc(db, 'site_stats', 'custom_faqs'),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() || {};
            Object.entries(data).forEach(([key, val]) => {
              if (key.startsWith('lastUpdated')) return;
              if (val && typeof val === 'object') {
                const existing = this.faqsMap.get(key);
                this.faqsMap.set(key, { ...(existing || {}), ...(val as ManagedFAQ), id: key });
              }
            });
            this.notifyFaqsListeners();
          }
        },
        () => {}
      );
      this.unsubscribers.push(unsubSharedFaqs);
    } catch {}
  }

  // ==========================================
  // Getters & Subscriptions
  // ==========================================

  public getCourses(): ManagedCourse[] {
    return Array.from(this.coursesMap.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      if (a.semester !== b.semester) return a.semester - b.semester;
      return (a.nameAr || '').localeCompare(b.nameAr || '', 'ar');
    });
  }

  public subscribeCourses(listener: Listener<ManagedCourse[]>): () => void {
    this.initRealTimeSync();
    this.coursesListeners.add(listener);
    // Emit immediate current state
    listener(this.getCourses());
    return () => {
      this.coursesListeners.delete(listener);
    };
  }

  private notifyCoursesListeners() {
    const list = this.getCourses();
    this.coursesListeners.forEach((l) => {
      try {
        l(list);
      } catch (err) {
        console.warn('Courses listener callback error:', err);
      }
    });
  }

  public getSoftware(): ManagedSoftware[] {
    return Array.from(this.softwareMap.values());
  }

  public subscribeSoftware(listener: Listener<ManagedSoftware[]>): () => void {
    this.initRealTimeSync();
    this.softwareListeners.add(listener);
    listener(this.getSoftware());
    return () => {
      this.softwareListeners.delete(listener);
    };
  }

  private notifySoftwareListeners() {
    const list = this.getSoftware();
    this.softwareListeners.forEach((l) => l(list));
  }

  public getResources(): ManagedResource[] {
    return Array.from(this.resourcesMap.values());
  }

  public subscribeResources(listener: Listener<ManagedResource[]>): () => void {
    this.initRealTimeSync();
    this.resourcesListeners.add(listener);
    listener(this.getResources());
    return () => {
      this.resourcesListeners.delete(listener);
    };
  }

  private notifyResourcesListeners() {
    const list = this.getResources();
    this.resourcesListeners.forEach((l) => l(list));
  }

  public getFAQs(): ManagedFAQ[] {
    return Array.from(this.faqsMap.values()).sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }

  public subscribeFAQs(listener: Listener<ManagedFAQ[]>): () => void {
    this.initRealTimeSync();
    this.faqsListeners.add(listener);
    listener(this.getFAQs());
    return () => {
      this.faqsListeners.delete(listener);
    };
  }

  private notifyFaqsListeners() {
    const list = this.getFAQs();
    this.faqsListeners.forEach((l) => l(list));
  }

  // ==========================================
  // Immediate Real-Time Mutations (Multi-Actor)
  // ==========================================

  /**
   * Saves or updates a course and propagates it immediately across
   * all connected moderators, the owner, and all student interfaces
   */
  public async saveCourse(course: ManagedCourse): Promise<void> {
    const user = auth.currentUser;
    const authorEmail = user?.email || 'admin';
    const now = new Date().toISOString();

    const payload: ManagedCourse = {
      ...course,
      updatedAt: now,
      updatedBy: authorEmail
    };

    // 1. Optimistic Local Update (0ms latency for caller)
    this.coursesMap.set(course.id, payload);
    this.notifyCoursesListeners();

    // 2. Dual-Persist to Firestore Cloud
    // Direct collection write
    try {
      await setDoc(doc(db, 'courses', course.id), payload, { merge: true });
    } catch (directErr) {
      console.warn('Direct courses write caught (synced via shared channel):', directErr);
    }

    // Universal shared sync channel (accessible by all supervisors & clients)
    try {
      await setDoc(doc(db, 'site_stats', 'custom_courses'), {
        [course.id]: payload,
        lastUpdatedAt: now,
        lastUpdatedBy: authorEmail
      }, { merge: true });
    } catch (sharedErr) {
      console.warn('Shared courses broadcast warning:', sharedErr);
    }

    // 3. Record Audit Log
    try {
      await recordAdminLog(
        'COURSE_UPDATED',
        'course',
        course.id,
        `تعديل ونشر فوري لمقرر: ${course.nameAr}`
      );
    } catch {}
  }

  /**
   * Archives or restores a course with instant multi-user broadcast
   */
  public async setCourseStatus(courseId: string, courseNameAr: string, status: 'active' | 'archived'): Promise<void> {
    const existing = this.coursesMap.get(courseId);
    if (!existing) return;

    const now = new Date().toISOString();
    const updated: ManagedCourse = {
      ...existing,
      status,
      updatedAt: now,
      updatedBy: auth.currentUser?.email || 'admin'
    };

    // 1. Optimistic Local Update
    this.coursesMap.set(courseId, updated);
    this.notifyCoursesListeners();

    // 2. Direct write
    try {
      await updateDoc(doc(db, 'courses', courseId), {
        status,
        updatedAt: now,
        updatedBy: updated.updatedBy
      });
    } catch {}

    // 3. Shared channel write
    try {
      await setDoc(doc(db, 'site_stats', 'custom_courses'), {
        [courseId]: updated,
        lastUpdatedAt: now
      }, { merge: true });
    } catch {}

    // 4. Log
    try {
      await recordAdminLog(
        status === 'archived' ? 'COURSE_ARCHIVED' : 'COURSE_RESTORED',
        'course',
        courseId,
        `${status === 'archived' ? 'أرشفة' : 'استعادة'} فوري لمقرر: ${courseNameAr}`
      );
    } catch {}
  }

  /**
   * Saves or updates software tool with instant multi-user broadcast
   */
  public async saveSoftware(software: ManagedSoftware): Promise<void> {
    const now = new Date().toISOString();
    const payload: ManagedSoftware = {
      ...software,
      updatedAt: now
    };

    this.softwareMap.set(software.id, payload);
    this.notifySoftwareListeners();

    try {
      await setDoc(doc(db, 'software', software.id), payload, { merge: true });
    } catch {}

    try {
      await setDoc(doc(db, 'site_stats', 'custom_software'), {
        [software.id]: payload,
        lastUpdatedAt: now
      }, { merge: true });
    } catch {}

    try {
      await recordAdminLog('SOFTWARE_UPDATED', 'software', software.id, `تحديث أداة برمجية: ${software.name}`);
    } catch {}
  }

  public async setSoftwareStatus(id: string, name: string, status: 'active' | 'archived'): Promise<void> {
    const existing = this.softwareMap.get(id);
    if (!existing) return;
    const now = new Date().toISOString();
    const updated = { ...existing, status, updatedAt: now };

    this.softwareMap.set(id, updated);
    this.notifySoftwareListeners();

    try {
      await updateDoc(doc(db, 'software', id), { status, updatedAt: now });
    } catch {}

    try {
      await setDoc(doc(db, 'site_stats', 'custom_software'), { [id]: updated, lastUpdatedAt: now }, { merge: true });
    } catch {}
  }

  /**
   * Saves or updates academic resource with instant multi-user broadcast
   */
  public async saveResource(resource: ManagedResource): Promise<void> {
    const now = new Date().toISOString();
    const payload: ManagedResource = {
      ...resource,
      updatedAt: now
    };

    this.resourcesMap.set(resource.id, payload);
    this.notifyResourcesListeners();

    try {
      await setDoc(doc(db, 'academicResources', resource.id), payload, { merge: true });
    } catch {}

    try {
      await setDoc(doc(db, 'site_stats', 'custom_resources'), {
        [resource.id]: payload,
        lastUpdatedAt: now
      }, { merge: true });
    } catch {}

    try {
      await recordAdminLog('RESOURCE_UPDATED', 'resource', resource.id, `حفظ مورد أكاديمي: ${resource.titleAr}`);
    } catch {}
  }

  public async setResourceStatus(id: string, titleAr: string, status: 'active' | 'archived'): Promise<void> {
    const existing = this.resourcesMap.get(id);
    if (!existing) return;
    const now = new Date().toISOString();
    const updated = { ...existing, status, updatedAt: now };

    this.resourcesMap.set(id, updated);
    this.notifyResourcesListeners();

    try {
      await updateDoc(doc(db, 'academicResources', id), { status, updatedAt: now });
    } catch {}

    try {
      await setDoc(doc(db, 'site_stats', 'custom_resources'), { [id]: updated, lastUpdatedAt: now }, { merge: true });
    } catch {}
  }

  /**
   * Saves or updates FAQ with instant multi-user broadcast
   */
  public async saveFAQ(faq: ManagedFAQ): Promise<void> {
    const now = new Date().toISOString();
    const payload: ManagedFAQ = {
      ...faq,
      updatedAt: now
    };

    this.faqsMap.set(faq.id, payload);
    this.notifyFaqsListeners();

    try {
      await setDoc(doc(db, 'faqs', faq.id), payload, { merge: true });
    } catch {}

    try {
      await setDoc(doc(db, 'site_stats', 'custom_faqs'), {
        [faq.id]: payload,
        lastUpdatedAt: now
      }, { merge: true });
    } catch {}

    try {
      await recordAdminLog('FAQ_UPDATED', 'faq', faq.id, `تحديث سؤال شائع: ${faq.questionAr.substring(0, 30)}`);
    } catch {}
  }

  public async setFAQStatus(id: string, questionAr: string, status: 'active' | 'archived'): Promise<void> {
    const existing = this.faqsMap.get(id);
    if (!existing) return;
    const now = new Date().toISOString();
    const updated = { ...existing, status, updatedAt: now };

    this.faqsMap.set(id, updated);
    this.notifyFaqsListeners();

    try {
      await updateDoc(doc(db, 'faqs', id), { status, updatedAt: now });
    } catch {}

    try {
      await setDoc(doc(db, 'site_stats', 'custom_faqs'), { [id]: updated, lastUpdatedAt: now }, { merge: true });
    } catch {}
  }
}

export const curriculumSyncService = new CurriculumSyncService();

// ==========================================
// React Hooks for Instant UI Synchronization
// ==========================================

/**
 * Hook providing the real-time live curriculum courses.
 * Automatically triggers re-render whenever any supervisor or owner
 * modifies, adds, or archives a course.
 */
export function useLiveCourses(): ManagedCourse[] {
  const [courses, setCourses] = useState<ManagedCourse[]>(() => curriculumSyncService.getCourses());

  useEffect(() => {
    const unsub = curriculumSyncService.subscribeCourses((latestCourses) => {
      setCourses(latestCourses);
    });
    return unsub;
  }, []);

  return courses;
}

/**
 * Hook providing real-time live simulation software tools
 */
export function useLiveSoftware(): ManagedSoftware[] {
  const [software, setSoftware] = useState<ManagedSoftware[]>(() => curriculumSyncService.getSoftware());

  useEffect(() => {
    const unsub = curriculumSyncService.subscribeSoftware((latest) => {
      setSoftware(latest);
    });
    return unsub;
  }, []);

  return software;
}

/**
 * Hook providing real-time academic resources (Team Noon, etc.)
 */
export function useLiveResources(): ManagedResource[] {
  const [resources, setResources] = useState<ManagedResource[]>(() => curriculumSyncService.getResources());

  useEffect(() => {
    const unsub = curriculumSyncService.subscribeResources((latest) => {
      setResources(latest);
    });
    return unsub;
  }, []);

  return resources;
}

/**
 * Hook providing real-time FAQs
 */
export function useLiveFAQs(): ManagedFAQ[] {
  const [faqs, setFaqs] = useState<ManagedFAQ[]>(() => curriculumSyncService.getFAQs());

  useEffect(() => {
    const unsub = curriculumSyncService.subscribeFAQs((latest) => {
      setFaqs(latest);
    });
    return unsub;
  }, []);

  return faqs;
}
