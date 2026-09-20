import { 
  db, 
  auth, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from '../lib/firebase';
import { GraduationProject } from '../types/graduationProject';
import { GRADUATION_PROJECTS_DATA } from '../data/graduationProjects';
import { adminRepository } from './admin/adminRepository';

const LOCAL_STORAGE_KEY = 'ece_graduation_projects_cache_v1';
const FIRESTORE_COLLECTION = 'graduation_projects';

export const graduationProjectRepository = {
  getCachedProjects(): GraduationProject[] {
    if (typeof window === 'undefined') return GRADUATION_PROJECTS_DATA;
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to read local graduation projects cache:', e);
    }
    return GRADUATION_PROJECTS_DATA;
  },

  setLocalProjects(projects: GraduationProject[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.warn('Failed to write local graduation projects cache:', e);
    }
  },

  async getProjects(): Promise<GraduationProject[]> {
    try {
      const querySnapshot = await getDocs(collection(db, FIRESTORE_COLLECTION));
      if (!querySnapshot.empty) {
        const projects: GraduationProject[] = [];
        querySnapshot.forEach((docSnap) => {
          projects.push({ id: docSnap.id, ...docSnap.data() } as GraduationProject);
        });
        this.setLocalProjects(projects);
        return projects;
      } else {
        // If collection is empty in Firestore, seed it with initial default data if admin or return fallback
        return this.getCachedProjects();
      }
    } catch (error) {
      console.warn('Firestore fetch for graduation projects unavailable, using local cache:', error);
      return this.getCachedProjects();
    }
  },

  async saveProject(project: GraduationProject): Promise<void> {
    const now = new Date().toISOString();
    const payload: GraduationProject = {
      ...project,
      updatedAt: now,
      createdAt: project.createdAt || now,
      active: project.active ?? true
    };

    const currentList = this.getCachedProjects();
    const existingIndex = currentList.findIndex(p => p.id === payload.id);
    let nextList: GraduationProject[];
    if (existingIndex >= 0) {
      nextList = currentList.map(p => p.id === payload.id ? payload : p);
    } else {
      nextList = [payload, ...currentList];
    }
    this.setLocalProjects(nextList);

    try {
      const docRef = doc(db, FIRESTORE_COLLECTION, payload.id);
      await setDoc(docRef, payload, { merge: true });

      await adminRepository.logAction(
        'COURSE_UPDATED',
        'course',
        payload.id,
        `تعديل/إضافة مشروع تخرج: ${payload.titleAr}`
      );
    } catch (error) {
      console.warn('Failed to save graduation project to Firestore:', error);
      throw error;
    }
  },

  async deleteProject(projectId: string): Promise<void> {
    const currentList = this.getCachedProjects();
    const nextList = currentList.filter(p => p.id !== projectId);
    this.setLocalProjects(nextList);

    try {
      const docRef = doc(db, FIRESTORE_COLLECTION, projectId);
      await deleteDoc(docRef);

      await adminRepository.logAction(
        'COURSE_UPDATED',
        'course',
        projectId,
        `حذف مشروع تخرج بالمعرف: ${projectId}`
      );
    } catch (error) {
      console.warn('Failed to delete graduation project from Firestore:', error);
      throw error;
    }
  },

  subscribe(callback: (projects: GraduationProject[]) => void): () => void {
    callback(this.getCachedProjects());

    try {
      const colRef = collection(db, FIRESTORE_COLLECTION);
      const unsub = onSnapshot(colRef, (snapshot) => {
        if (!snapshot.empty) {
          const projects: GraduationProject[] = [];
          snapshot.forEach((docSnap) => {
            projects.push({ id: docSnap.id, ...docSnap.data() } as GraduationProject);
          });
          this.setLocalProjects(projects);
          callback(projects);
        }
      }, (err) => {
        console.warn('Graduation projects subscription notice:', err.message);
      });
      return unsub;
    } catch (e) {
      console.warn('Failed to subscribe to graduation projects:', e);
      return () => {};
    }
  }
};
