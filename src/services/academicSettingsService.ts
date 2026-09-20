import { 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  auth 
} from '../lib/firebase';
import { adminRepository } from './admin/adminRepository';

export interface AcademicSettings {
  maxGrade: number;
  passingGrade: number;
  calculationMethod: 'simple_average' | 'weighted_average';
  updatedAt?: string;
  updatedBy?: string;
}

const LOCAL_STORAGE_KEY = 'ece_academic_settings_v1';
const FIRESTORE_DOC_PATH = 'system_config';
const FIRESTORE_DOC_ID = 'academic_settings';

export const DEFAULT_ACADEMIC_SETTINGS: AcademicSettings = {
  maxGrade: 100,
  passingGrade: 60,
  calculationMethod: 'simple_average'
};

export const academicSettingsService = {
  getLocalSettings(): AcademicSettings {
    if (typeof window === 'undefined') return DEFAULT_ACADEMIC_SETTINGS;
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_ACADEMIC_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to load local academic settings:', e);
    }
    return DEFAULT_ACADEMIC_SETTINGS;
  },

  setLocalSettings(settings: AcademicSettings): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save local academic settings:', e);
    }
  },

  async getSettings(): Promise<AcademicSettings> {
    try {
      const docRef = doc(db, FIRESTORE_DOC_PATH, FIRESTORE_DOC_ID);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as Partial<AcademicSettings>;
        const merged: AcademicSettings = {
          ...DEFAULT_ACADEMIC_SETTINGS,
          ...data
        };
        this.setLocalSettings(merged);
        return merged;
      }
    } catch (error) {
      console.warn('Firestore fetch for academic settings unavailable, using local cache:', error);
    }
    return this.getLocalSettings();
  },

  async saveSettings(settings: AcademicSettings): Promise<void> {
    const now = new Date().toISOString();
    const updated: AcademicSettings = {
      ...settings,
      updatedAt: now,
      updatedBy: auth.currentUser?.email || 'admin'
    };

    this.setLocalSettings(updated);

    try {
      const docRef = doc(db, FIRESTORE_DOC_PATH, FIRESTORE_DOC_ID);
      await setDoc(docRef, updated, { merge: true });
      
      await adminRepository.logAction(
        'COURSE_UPDATED',
        'course',
        'academic_settings',
        `تحديث الإعدادات الأكاديمية: الحد الأقصى ${updated.maxGrade}، علامة النجاح ${updated.passingGrade}`
      );
    } catch (error) {
      console.warn('Failed to save academic settings to Firestore (local cache saved):', error);
      throw error;
    }
  }
};
