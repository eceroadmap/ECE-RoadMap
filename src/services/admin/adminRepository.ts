import { 
  db, 
  auth, 
  getOrCreateFirebaseUser,
  ensureFirebaseAuth,
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  orderBy, 
  where,
  limit,
  addDoc 
} from '../../lib/firebase';
import { 
  ManagedCourse, 
  ManagedSoftware, 
  ManagedResource, 
  ManagedFAQ, 
  AdminActivityLog, 
  AdminActionType, 
  AdminContentType,
  AdminStudentRecord
} from '../../types/admin';
import { CommunityTip } from '../../types/student';
import { SkillCourse } from '../../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errStr = error instanceof Error ? error.message : String(error);
  const isPermission = errStr.includes('permission') || errStr.includes('PERMISSION_DENIED');
  const user = auth.currentUser;

  if (isPermission) {
    const friendlyMsg = `تعذر إتمام عملية الحفظ (${path || 'قاعدة البيانات'}) بسبب قيود صلاحيات Firestore السحابية.\n\nيرجى من المالك إما:\n1. الضغط على زر "تفعيل المشرفين في Firestore" من قسم المشرفين.\n2. أو نسخ قواعد أمان Firebase Console المحدثة ولصقها في تبويب Rules.`;
    console.error('Firestore Permission Error:', { path, email: user?.email, uid: user?.uid });
    throw new Error(friendlyMsg);
  }

  const errInfo = {
    error: errStr,
    authInfo: {
      userId: user?.uid,
      email: user?.email,
      emailVerified: user?.emailVerified,
      isAnonymous: user?.isAnonymous,
      tenantId: user?.tenantId,
    },
    operationType,
    path
  };
  console.error('Firestore Admin Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const adminRepository = {
  // ==========================================
  // 1. Audit Logging
  // ==========================================
  async logAction(
    actionType: AdminActionType,
    targetContentType: AdminContentType,
    targetDocId: string,
    details: string
  ): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    const logEntry: Omit<AdminActivityLog, 'id'> = {
      adminUid: user.uid,
      adminEmail: user.email || 'Admin',
      actionType,
      targetContentType,
      targetDocId,
      details,
      timestamp: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'adminLogs'), logEntry);
    } catch (error) {
      console.warn('Failed to record administrative log:', error);
    }
  },

  async getLogs(limitCount: number = 50): Promise<AdminActivityLog[]> {
    const p = 'adminLogs';
    try {
      const q = query(collection(db, p), orderBy('timestamp', 'desc'), limit(limitCount));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminActivityLog));
    } catch (error) {
      console.warn('Failed to list admin logs from Firestore:', error);
      return [];
    }
  },

  // ==========================================
  // 2. Courses Management
  // ==========================================
  async getCourses(): Promise<ManagedCourse[]> {
    const p = 'courses';
    try {
      const snap = await getDocs(collection(db, p));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ManagedCourse));
    } catch (error) {
      console.warn('Failed to list courses from Firestore:', error);
      return [];
    }
  },

  async saveCourse(course: ManagedCourse): Promise<void> {
    const p = `courses/${course.id}`;
    const payload = {
      ...course,
      updatedAt: new Date().toISOString(),
      updatedBy: auth.currentUser?.email || auth.currentUser?.uid || 'admin'
    };
    try {
      await setDoc(doc(db, 'courses', course.id), payload, { merge: true });
      await this.logAction(
        'COURSE_UPDATED',
        'course',
        course.id,
        `تحديث مقرر: ${course.nameAr}`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, p);
    }
  },

  async archiveCourse(courseId: string, courseNameAr: string): Promise<void> {
    const p = `courses/${courseId}`;
    try {
      await updateDoc(doc(db, 'courses', courseId), {
        status: 'archived',
        updatedAt: new Date().toISOString()
      });
      await this.logAction(
        'COURSE_ARCHIVED',
        'course',
        courseId,
        `أرشفة مقرر: ${courseNameAr}`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, p);
    }
  },

  async restoreCourse(courseId: string, courseNameAr: string): Promise<void> {
    const p = `courses/${courseId}`;
    try {
      await updateDoc(doc(db, 'courses', courseId), {
        status: 'active',
        updatedAt: new Date().toISOString()
      });
      await this.logAction(
        'COURSE_RESTORED',
        'course',
        courseId,
        `استعادة مقرر: ${courseNameAr}`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, p);
    }
  },

  // ==========================================
  // 3. Software Management
  // ==========================================
  async getSoftware(): Promise<ManagedSoftware[]> {
    const p = 'software';
    try {
      const snap = await getDocs(collection(db, p));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ManagedSoftware));
    } catch (error) {
      console.warn('Failed to list software tools from Firestore:', error);
      return [];
    }
  },

  async saveSoftware(software: ManagedSoftware): Promise<void> {
    const p = `software/${software.id}`;
    const payload = {
      ...software,
      updatedAt: new Date().toISOString(),
      updatedBy: auth.currentUser?.email || 'admin'
    };
    try {
      await setDoc(doc(db, 'software', software.id), payload, { merge: true });
      await this.logAction(
        'SOFTWARE_UPDATED',
        'software',
        software.id,
        `تحديث أداة برمجية: ${software.name}`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, p);
    }
  },

  async archiveSoftware(softwareId: string, softwareName: string): Promise<void> {
    const p = `software/${softwareId}`;
    try {
      await updateDoc(doc(db, 'software', softwareId), {
        status: 'archived',
        updatedAt: new Date().toISOString()
      });
      await this.logAction(
        'SOFTWARE_ARCHIVED',
        'software',
        softwareId,
        `أرشفة برنامج: ${softwareName}`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, p);
    }
  },

  async restoreSoftware(softwareId: string, softwareName: string): Promise<void> {
    const p = `software/${softwareId}`;
    try {
      await updateDoc(doc(db, 'software', softwareId), {
        status: 'active',
        updatedAt: new Date().toISOString()
      });
      await this.logAction(
        'SOFTWARE_RESTORED',
        'software',
        softwareId,
        `استعادة برنامج: ${softwareName}`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, p);
    }
  },

  // ==========================================
  // 4. Academic Resources (Team Noon, Telegram, etc.)
  // ==========================================
  async getResources(): Promise<ManagedResource[]> {
    const p = 'academicResources';
    try {
      const snap = await getDocs(collection(db, p));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ManagedResource));
    } catch (error) {
      console.warn('Failed to list academic resources from Firestore:', error);
      return [];
    }
  },

  async saveResource(resource: ManagedResource): Promise<void> {
    const p = `academicResources/${resource.id}`;
    const payload = {
      ...resource,
      updatedAt: new Date().toISOString(),
      updatedBy: auth.currentUser?.email || 'admin'
    };
    try {
      await setDoc(doc(db, 'academicResources', resource.id), payload, { merge: true });
      await this.logAction(
        'RESOURCE_UPDATED',
        'resource',
        resource.id,
        `حفظ مورد أكاديمي: ${resource.titleAr} (${resource.sourceAttribution})`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, p);
    }
  },

  async archiveResource(resourceId: string, titleAr: string): Promise<void> {
    const p = `academicResources/${resourceId}`;
    try {
      await updateDoc(doc(db, 'academicResources', resourceId), {
        status: 'archived',
        updatedAt: new Date().toISOString()
      });
      await this.logAction(
        'RESOURCE_ARCHIVED',
        'resource',
        resourceId,
        `أرشفة مورد: ${titleAr}`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, p);
    }
  },

  async restoreResource(resourceId: string, titleAr: string): Promise<void> {
    const p = `academicResources/${resourceId}`;
    try {
      await updateDoc(doc(db, 'academicResources', resourceId), {
        status: 'active',
        updatedAt: new Date().toISOString()
      });
      await this.logAction(
        'RESOURCE_RESTORED',
        'resource',
        resourceId,
        `استعادة مورد: ${titleAr}`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, p);
    }
  },

  // ==========================================
  // 5. Frequently Asked Questions (FAQ)
  // ==========================================
  async getFAQs(): Promise<ManagedFAQ[]> {
    const p = 'faqs';
    try {
      const snap = await getDocs(collection(db, p));
      return snap.docs
        .map(d => ({ id: d.id, ...d.data() } as ManagedFAQ))
        .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    } catch (error) {
      console.warn('Failed to list FAQs from Firestore:', error);
      return [];
    }
  },

  async saveFAQ(faq: ManagedFAQ): Promise<void> {
    const p = `faqs/${faq.id}`;
    const payload = {
      ...faq,
      updatedAt: new Date().toISOString(),
      updatedBy: auth.currentUser?.email || 'admin'
    };
    try {
      await setDoc(doc(db, 'faqs', faq.id), payload, { merge: true });
      await this.logAction(
        'FAQ_UPDATED',
        'faq',
        faq.id,
        `تحديث سؤال شائع: ${faq.questionAr.substring(0, 40)}...`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, p);
    }
  },

  async archiveFAQ(faqId: string, questionAr: string): Promise<void> {
    const p = `faqs/${faqId}`;
    try {
      await updateDoc(doc(db, 'faqs', faqId), {
        status: 'archived',
        updatedAt: new Date().toISOString()
      });
      await this.logAction(
        'FAQ_ARCHIVED',
        'faq',
        faqId,
        `أرشفة سؤال شائع: ${questionAr.substring(0, 30)}`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, p);
    }
  },

  async restoreFAQ(faqId: string, questionAr: string): Promise<void> {
    const p = `faqs/${faqId}`;
    try {
      await updateDoc(doc(db, 'faqs', faqId), {
        status: 'active',
        updatedAt: new Date().toISOString()
      });
      await this.logAction(
        'FAQ_RESTORED',
        'faq',
        faqId,
        `استعادة سؤال شائع: ${questionAr.substring(0, 30)}`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, p);
    }
  },

  // ==========================================
  // 6. Community Tips Moderation
  // ==========================================
  async getAllCommunityTips(): Promise<any[]> {
    const p = 'communityTips';
    try {
      const snap = await getDocs(collection(db, p));
      if (!snap.empty) {
        return snap.docs.map(d => {
          const data = d.data() || {};
          return {
            id: d.id, // Ensure 'id' is ALWAYS the true Firestore Document Key
            authorId: data.authorId || '',
            authorName: data.authorName || 'طالب',
            authorYear: data.authorYear || '',
            courseId: data.courseId || '',
            courseNameAr: data.courseNameAr || '',
            content: data.content || '',
            category: data.category || 'study_tip',
            likesCount: typeof data.likesCount === 'number' ? data.likesCount : 0,
            likedBy: Array.isArray(data.likedBy) ? data.likedBy : [],
            dislikesCount: typeof data.dislikesCount === 'number' ? data.dislikesCount : 0,
            dislikedBy: Array.isArray(data.dislikedBy) ? data.dislikedBy : [],
            status: data.status || 'active',
            createdAt: data.createdAt || ''
          };
        });
      }
      return [];
    } catch (error) {
      console.warn('Failed to list community tips from Firestore:', error);
      return [];
    }
  },

  async deleteCommunityTip(tipId: string, tipContentPreview: string = ''): Promise<void> {
    const p = `communityTips/${tipId}`;
    try {
      await deleteDoc(doc(db, 'communityTips', tipId));
      this.logAction(
        'TIP_DELETED',
        'community_tip',
        tipId,
        `حذف نصيحة طلابية نهائياً من قاعدة البيانات: ${(tipContentPreview || '').substring(0, 30)}`
      ).catch(() => null);
    } catch (error) {
      console.error("DELETE TIP ERROR", error);
      handleFirestoreError(error, OperationType.DELETE, p);
    }
  },

  async purgeSyntheticMockTips(): Promise<number> {
    const mockIds = [
      'tip-official-welcome-2026',
      'tip-official-graduation-proj',
      'tip-official-dsp-matlab'
    ];
    let removedCount = 0;
    for (const id of mockIds) {
      try {
        const ref = doc(db, 'communityTips', id);
        const s = await getDoc(ref);
        if (s.exists()) {
          await deleteDoc(ref);
          removedCount++;
        }
      } catch (err) {
        console.warn(`Could not purge mock tip ${id}:`, err);
      }
    }
    return removedCount;
  },

  async archiveCommunityTip(tipId: string, tipContentPreview: string): Promise<void> {
    const p = `communityTips/${tipId}`;
    const data = {
      status: 'archived',
      updatedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'communityTips', tipId), data, { merge: true });
      this.logAction(
        'TIP_ARCHIVED',
        'community_tip',
        tipId,
        `حجب نصيحة طلابية: ${(tipContentPreview || '').substring(0, 30)}`
      ).catch(() => null);
    } catch (error) {
      console.error("ARCHIVE UPDATE FAILED", error);
      handleFirestoreError(error, OperationType.UPDATE, p);
    }
  },

  async restoreCommunityTip(tipId: string, tipContentPreview: string): Promise<void> {
    const p = `communityTips/${tipId}`;
    const data = {
      status: 'active',
      updatedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'communityTips', tipId), data, { merge: true });
      this.logAction(
        'TIP_RESTORED',
        'community_tip',
        tipId,
        `استعادة نصيحة طلابية: ${(tipContentPreview || '').substring(0, 30)}`
      ).catch(() => null);
    } catch (error) {
      console.error("RESTORE TIP ERROR", error);
      handleFirestoreError(error, OperationType.UPDATE, p);
    }
  },

  // ==========================================
  // 7. Student Directory & Profiles (Read-Only)
  // ==========================================
  async getStudents(): Promise<AdminStudentRecord[]> {
    const p = 'students';
    try {
      await ensureFirebaseAuth();
      const [snap, authIndexSnap, dirSnap] = await Promise.all([
        getDocs(collection(db, p)).catch(() => ({ docs: [] } as any)),
        getDocs(collection(db, 'student_auth_index')).catch(() => ({ docs: [] } as any)),
        getDoc(doc(db, 'site_stats', 'students_directory')).catch(() => null)
      ]);

      const map = new Map<string, AdminStudentRecord>();

      snap.docs.forEach((d: any) => {
        const data = d.data() as Partial<AdminStudentRecord>;
        map.set(d.id, {
          uid: d.id,
          ...data
        });
      });

      authIndexSnap.docs.forEach((d: any) => {
        const data = d.data();
        const uid = data.uid || d.id;
        if (!map.has(uid) && !map.has(d.id)) {
          const studentPayload = data.studentData || data;
          map.set(uid, {
            uid,
            ...studentPayload,
            username: data.username || studentPayload.username,
            authProvider: 'local'
          });
        }
      });

      // Hydrate from shared directory if direct students collection was restricted for supervisor
      if (dirSnap && dirSnap.exists()) {
        const list = (dirSnap.data()?.students || []) as AdminStudentRecord[];
        list.forEach((st: any) => {
          const id = st.uid || st.id;
          if (id && !map.has(id)) {
            map.set(id, { ...st, uid: id });
          }
        });
      }

      const results = Array.from(map.values())
        .filter(s => {
          const email = (s.email || '').toLowerCase().trim();
          const name = (s.displayName || '').toLowerCase().trim();
          const isOwnerAccount = 
            email === 'marwa.mgd.shmdeen@gmail.com' ||
            email.includes('marwa.mgd.shmdeen') ||
            (s.role as any) === 'super_admin' ||
            (s as any).isOwner === true ||
            name.includes('المهندسة مروة') ||
            name.includes('مدير المنصة');
          return !isOwnerAccount;
        });

      // If results were obtained directly from live collections, sync to shared directory
      if (snap.docs.length > 0 && results.length > 0) {
        setDoc(doc(db, 'site_stats', 'students_directory'), {
          students: results,
          totalCount: results.length,
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch(() => null);
      }

      return results;
    } catch (error) {
      console.warn('Failed to list students from Firestore, attempting fallback:', error);
      try {
        const dirSnap = await getDoc(doc(db, 'site_stats', 'students_directory'));
        if (dirSnap.exists()) {
          const list = (dirSnap.data()?.students || []) as AdminStudentRecord[];
          return list.filter(s => {
            const email = (s.email || '').toLowerCase().trim();
            return !email.includes('marwa.mgd.shmdeen');
          });
        }
      } catch {}
      return [];
    }
  },

  async getStudentById(uid: string): Promise<AdminStudentRecord | null> {
    const p = `students/${uid}`;
    try {
      const snap = await getDoc(doc(db, 'students', uid));
      if (!snap.exists()) return null;
      return {
        uid: snap.id,
        ...(snap.data() as Omit<AdminStudentRecord, 'uid'>)
      };
    } catch (error) {
      console.warn('Failed to get student document by id:', error);
      return null;
    }
  },

  async getStudentCommunityTips(studentUid: string): Promise<CommunityTip[]> {
    const p = 'communityTips';
    try {
      const q = query(collection(db, p), where('authorId', '==', studentUid));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<CommunityTip, 'id'>)
      }));
    } catch (error) {
      console.warn('Failed to list student tips from Firestore:', error);
      return [];
    }
  },

  // ==========================================
  // 8. Develop / Skills Management
  // ==========================================
  async getSkills(): Promise<SkillCourse[]> {
    const p = 'developSkills';
    try {
      const snap = await getDocs(collection(db, p));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as SkillCourse));
    } catch (error) {
      console.warn('Failed to list develop skills from Firestore:', error);
      return [];
    }
  },

  async saveSkill(skill: SkillCourse): Promise<void> {
    const p = `developSkills/${skill.id}`;
    try {
      await setDoc(doc(db, 'developSkills', skill.id), skill, { merge: true });
      await this.logAction('COURSE_UPDATED', 'course', skill.id, `تحديث مهارة طور نفسك: ${skill.titleAr}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, p);
    }
  },

  async deleteSkill(id: string): Promise<void> {
    const p = `developSkills/${id}`;
    try {
      await deleteDoc(doc(db, 'developSkills', id));
      await this.logAction('COURSE_ARCHIVED', 'course', id, `حذف مهارة طور نفسك: ${id}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, p);
    }
  }
};
