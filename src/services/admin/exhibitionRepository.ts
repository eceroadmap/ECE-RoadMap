import { useState, useEffect } from 'react';
import { 
  db, 
  auth, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot 
} from '../../lib/firebase';
import { ExhibitionFullConfig } from '../../types/exhibition';
import { DEFAULT_EXHIBITION_CONFIG } from '../../data/defaultExhibition';
import { adminRepository } from './adminRepository';
import { CANONICAL_PRODUCTION_URL } from '../../lib/firebase';

const LOCAL_STORAGE_KEY = 'ece_exhibition_config_v2';
const FIRESTORE_DOC_PATH = 'system_config';
const FIRESTORE_DOC_ID = 'exhibition_config';

function normalizeConfig(data: Partial<ExhibitionFullConfig>): ExhibitionFullConfig {
  const qrPortal = { ...DEFAULT_EXHIBITION_CONFIG.qrPortal, ...(data.qrPortal || {}) };
  if (!qrPortal.customQrUrl || qrPortal.customQrUrl.includes('damascusuniversity.sy') || qrPortal.customQrUrl.includes('localhost')) {
    qrPortal.customQrUrl = CANONICAL_PRODUCTION_URL;
  }

  return {
    ...DEFAULT_EXHIBITION_CONFIG,
    ...data,
    isVisibleToStudents: data.isVisibleToStudents !== undefined ? data.isVisibleToStudents : true,
    slides: data.slides || DEFAULT_EXHIBITION_CONFIG.slides,
    hero: { ...DEFAULT_EXHIBITION_CONFIG.hero, ...(data.hero || {}) },
    journey: { ...DEFAULT_EXHIBITION_CONFIG.journey, ...(data.journey || {}) },
    skills: { ...DEFAULT_EXHIBITION_CONFIG.skills, ...(data.skills || {}) },
    software: { ...DEFAULT_EXHIBITION_CONFIG.software, ...(data.software || {}) },
    graduationProjects: { ...DEFAULT_EXHIBITION_CONFIG.graduationProjects, ...(data.graduationProjects || {}) },
    careers: { ...DEFAULT_EXHIBITION_CONFIG.careers, ...(data.careers || {}) },
    qrPortal
  };
}

export const exhibitionRepository = {
  /**
   * Get cached or fallback configuration synchronously
   */
  getCachedConfig(): ExhibitionFullConfig {
    if (typeof window === 'undefined') return DEFAULT_EXHIBITION_CONFIG;
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return normalizeConfig(parsed);
      }
    } catch (e) {
      console.warn('Failed to load local exhibition config:', e);
    }
    return DEFAULT_EXHIBITION_CONFIG;
  },

  /**
   * Save config to local cache
   */
  setLocalConfig(config: ExhibitionFullConfig): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.warn('Failed to cache exhibition config:', e);
    }
  },

  /**
   * Fetch current configuration from Cloud Firestore (or local fallback)
   */
  async getConfig(): Promise<ExhibitionFullConfig> {
    try {
      const docRef = doc(db, FIRESTORE_DOC_PATH, FIRESTORE_DOC_ID);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as Partial<ExhibitionFullConfig>;
        const merged = normalizeConfig(data);
        this.setLocalConfig(merged);
        return merged;
      }
    } catch (error) {
      console.warn('Firestore fetch for exhibition config unavailable, using local cache:', error);
    }

    return this.getCachedConfig();
  },

  /**
   * Save and persist modified exhibition configuration to Firestore and LocalStorage
   */
  async saveConfig(config: ExhibitionFullConfig): Promise<void> {
    const now = new Date().toISOString();
    const updatedConfig: ExhibitionFullConfig = {
      ...config,
      updatedAt: now,
      updatedBy: auth.currentUser?.email || 'admin'
    };

    // Save locally immediately
    this.setLocalConfig(updatedConfig);

    // Save to Cloud Firestore
    try {
      const docRef = doc(db, FIRESTORE_DOC_PATH, FIRESTORE_DOC_ID);
      await setDoc(docRef, updatedConfig, { merge: true });
      
      // Log admin audit activity
      await adminRepository.logAction(
        'CURRICULUM_SEEDED',
        'system',
        'exhibition_config',
        `تم تحديث شرائح ومحتوى وضع الملتقى (${updatedConfig.slides.length} شرائح)`
      );
    } catch (error) {
      console.warn('Failed to save exhibition config to Firestore, saved locally:', error);
    }
  },

  /**
   * Reset exhibition configuration to official default content
   */
  async resetToDefaults(): Promise<ExhibitionFullConfig> {
    const defaults = { ...DEFAULT_EXHIBITION_CONFIG };
    await this.saveConfig(defaults);
    return defaults;
  },

  /**
   * Realtime subscription for Exhibition mode and Admin preview
   */
  subscribe(callback: (config: ExhibitionFullConfig) => void): () => void {
    // Fire initial state immediately
    callback(this.getCachedConfig());

    try {
      const docRef = doc(db, FIRESTORE_DOC_PATH, FIRESTORE_DOC_ID);
      const unsub = onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as Partial<ExhibitionFullConfig>;
            const merged = normalizeConfig(data);
            this.setLocalConfig(merged);
            callback(merged);
          }
        },
        (error) => {
          console.warn('Exhibition config subscription fallback to local cache:', error);
        }
      );

      return unsub;
    } catch (e) {
      console.warn('Failed to establish Firestore onSnapshot for exhibition config:', e);
      return () => {};
    }
  }
};

/**
 * React Hook for Realtime Exhibition Mode Configuration & Student Visibility
 */
export function useLiveExhibitionConfig(): ExhibitionFullConfig {
  const [config, setConfig] = useState<ExhibitionFullConfig>(() => exhibitionRepository.getCachedConfig());

  useEffect(() => {
    const unsub = exhibitionRepository.subscribe((loaded) => {
      if (loaded) setConfig(loaded);
    });
    return unsub;
  }, []);

  return config;
}
