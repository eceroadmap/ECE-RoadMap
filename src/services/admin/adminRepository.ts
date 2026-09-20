import { 
  db, 
  auth, 
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

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
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
      handleFirestoreError(error, OperationType.LIST, p);
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
      handleFirestoreError(error, OperationType.LIST, p);
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
      handleFirestoreError(error, OperationType.LIST, p);
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
      handleFirestoreError(error, OperationType.LIST, p);
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
      handleFirestoreError(error, OperationType.LIST, p);
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
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, p);
      return [];
    }
  },

  async archiveCommunityTip(tipId: string, tipContentPreview: string): Promise<void> {
    const p = `communityTips/${tipId}`;
    try {
      await updateDoc(doc(db, 'communityTips', tipId), {
        status: 'archived',
        updatedAt: new Date().toISOString()
      });
      await this.logAction(
        'TIP_ARCHIVED',
        'community_tip',
        tipId,
        `حجب نصيحة طلابية: ${tipContentPreview.substring(0, 30)}`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, p);
    }
  },

  async restoreCommunityTip(tipId: string, tipContentPreview: string): Promise<void> {
    const p = `communityTips/${tipId}`;
    try {
      await updateDoc(doc(db, 'communityTips', tipId), {
        status: 'active',
        updatedAt: new Date().toISOString()
      });
      await this.logAction(
        'TIP_RESTORED',
        'community_tip',
        tipId,
        `استعادة نصيحة طلابية: ${tipContentPreview.substring(0, 30)}`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, p);
    }
  },

  // ==========================================
  // 7. Student Directory & Profiles (Read-Only)
  // ==========================================
  async getStudents(): Promise<AdminStudentRecord[]> {
    const p = 'students';
    try {
      const snap = await getDocs(collection(db, p));
      return snap.docs.map(d => ({
        uid: d.id,
        ...(d.data() as Omit<AdminStudentRecord, 'uid'>)
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, p);
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
      handleFirestoreError(error, OperationType.GET, p);
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
      handleFirestoreError(error, OperationType.LIST, p);
      return [];
    }
  }
};
