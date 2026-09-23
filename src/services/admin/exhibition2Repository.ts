import { 
  db, 
  auth, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot 
} from '../../lib/firebase';
import { Exhibition2FullConfig } from '../../types/exhibition2';
import { DEFAULT_EXHIBITION2_CONFIG } from '../../data/defaultExhibition2';
import { adminRepository } from './adminRepository';
import { CANONICAL_PRODUCTION_URL } from '../../lib/firebase';

const LOCAL_STORAGE_KEY = 'ece_exhibition2_config_v1';
const FIRESTORE_DOC_PATH = 'system_config';
const FIRESTORE_DOC_ID = 'exhibition2_config';

function normalizeConfig(data: Partial<Exhibition2FullConfig>): Exhibition2FullConfig {
  const roadmapScene = { ...DEFAULT_EXHIBITION2_CONFIG.roadmapScene, ...(data.roadmapScene || {}) };
  if (!roadmapScene.qrUrl || roadmapScene.qrUrl.includes('damascusuniversity.sy') || roadmapScene.qrUrl.includes('localhost')) {
    roadmapScene.qrUrl = CANONICAL_PRODUCTION_URL;
  }

  return {
    ...DEFAULT_EXHIBITION2_CONFIG,
    ...data,
    scenes: data.scenes || DEFAULT_EXHIBITION2_CONFIG.scenes,
    playback: { ...DEFAULT_EXHIBITION2_CONFIG.playback, ...(data.playback || {}) },
    heroScene: { ...DEFAULT_EXHIBITION2_CONFIG.heroScene, ...(data.heroScene || {}) },
    whyEceScene: { ...DEFAULT_EXHIBITION2_CONFIG.whyEceScene, ...(data.whyEceScene || {}) },
    journeyScene: { ...DEFAULT_EXHIBITION2_CONFIG.journeyScene, ...(data.journeyScene || {}) },
    projectsScene: { ...DEFAULT_EXHIBITION2_CONFIG.projectsScene, ...(data.projectsScene || {}) },
    fitQuizScene: { ...DEFAULT_EXHIBITION2_CONFIG.fitQuizScene, ...(data.fitQuizScene || {}) },
    roadmapScene,
    comparisonScene: { ...DEFAULT_EXHIBITION2_CONFIG.comparisonScene, ...(data.comparisonScene || {}) }
  };
}

export const exhibition2Repository = {
  /**
   * Get cached or fallback configuration synchronously
   */
  getCachedConfig(): Exhibition2FullConfig {
    if (typeof window === 'undefined') return DEFAULT_EXHIBITION2_CONFIG;
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return normalizeConfig(parsed);
      }
    } catch (e) {
      console.warn('Failed to load local exhibition 2 config:', e);
    }
    return DEFAULT_EXHIBITION2_CONFIG;
  },

  /**
   * Save config to local cache
   */
  setLocalConfig(config: Exhibition2FullConfig): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.warn('Failed to cache exhibition 2 config:', e);
    }
  },

  /**
   * Fetch current configuration from Cloud Firestore (or local fallback)
   */
  async getConfig(): Promise<Exhibition2FullConfig> {
    try {
      const docRef = doc(db, FIRESTORE_DOC_PATH, FIRESTORE_DOC_ID);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as Partial<Exhibition2FullConfig>;
        const merged = normalizeConfig(data);
        this.setLocalConfig(merged);
        return merged;
      }
    } catch (error) {
      console.warn('Firestore fetch for exhibition 2 config unavailable, using local cache:', error);
    }

    return this.getCachedConfig();
  },

  /**
   * Save and persist modified exhibition 2 configuration to Firestore and LocalStorage
   */
  async saveConfig(config: Exhibition2FullConfig): Promise<void> {
    const now = new Date().toISOString();
    const updatedConfig: Exhibition2FullConfig = {
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
        'exhibition2_config',
        `تم تحديث شرائح ومحتوى وضع الملتقى 2 المعرضي (${updatedConfig.scenes.length} مشاهد سينمائية)`
      );
    } catch (error) {
      console.warn('Failed to save exhibition 2 config to Firestore, saved locally:', error);
    }
  },

  /**
   * Reset exhibition 2 configuration to official default content
   */
  async resetToDefaults(): Promise<Exhibition2FullConfig> {
    const defaults = { ...DEFAULT_EXHIBITION2_CONFIG };
    await this.saveConfig(defaults);
    return defaults;
  },

  /**
   * Realtime subscription for Exhibition 2 mode and Admin preview
   */
  subscribe(callback: (config: Exhibition2FullConfig) => void): () => void {
    callback(this.getCachedConfig());

    try {
      const docRef = doc(db, FIRESTORE_DOC_PATH, FIRESTORE_DOC_ID);
      const unsub = onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as Partial<Exhibition2FullConfig>;
            const merged = normalizeConfig(data);
            this.setLocalConfig(merged);
            callback(merged);
          }
        },
        (error) => {
          console.warn('Realtime subscription error for exhibition 2 config:', error);
        }
      );
      return unsub;
    } catch (error) {
      console.warn('Failed to attach realtime listener for exhibition 2:', error);
      return () => {};
    }
  }
};
