import { useState, useEffect } from 'react';
import { 
  db, 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  ensureFirebaseAuth,
  auth,
  addDoc
} from '../lib/firebase';
import { 
  RecommendedLaptopModel, 
  DepartmentRecommendedSpecs, 
  LaptopSpecs, 
  LaptopEvaluationResult 
} from '../types/laptop';
import { 
  DEFAULT_RECOMMENDED_LAPTOPS, 
  DEFAULT_DEPARTMENT_SPECS, 
  evaluateLaptop 
} from '../data/laptopRules';

type Listener<T> = (data: T) => void;

class LaptopAdvisorService {
  private laptopsMap = new Map<string, RecommendedLaptopModel>();
  private deptSpecs: DepartmentRecommendedSpecs = { ...DEFAULT_DEPARTMENT_SPECS };

  private laptopsListeners = new Set<Listener<RecommendedLaptopModel[]>>();
  private specsListeners = new Set<Listener<DepartmentRecommendedSpecs>>();

  private initialized = false;
  private unsubscribers: Array<() => void> = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    DEFAULT_RECOMMENDED_LAPTOPS.forEach((laptop) => {
      this.laptopsMap.set(laptop.id, {
        ...laptop,
        status: 'active',
        updatedAt: laptop.updatedAt || new Date().toISOString()
      });
    });
  }

  public initRealTimeSync() {
    if (this.initialized) return;
    this.initialized = true;

    ensureFirebaseAuth().catch(() => null);

    // 1. Listen to 'laptop_models' collection
    try {
      const unsubLaptops = onSnapshot(
        collection(db, 'laptop_models'),
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            const data = change.doc.data() as RecommendedLaptopModel;
            const laptopId = change.doc.id;

            if (change.type === 'removed') {
              const base = DEFAULT_RECOMMENDED_LAPTOPS.find((l) => l.id === laptopId);
              if (base) {
                this.laptopsMap.set(laptopId, { ...base, status: 'active' });
              } else {
                this.laptopsMap.delete(laptopId);
              }
            } else {
              const existing = this.laptopsMap.get(laptopId);
              this.laptopsMap.set(laptopId, {
                ...(existing || {}),
                ...data,
                id: laptopId
              });
            }
          });
          this.notifyLaptopsListeners();
        },
        () => {}
      );
      this.unsubscribers.push(unsubLaptops);
    } catch {}

    // 2. Listen to shared channel 'site_stats/laptop_config'
    try {
      const unsubConfig = onSnapshot(
        doc(db, 'site_stats', 'laptop_config'),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() || {};
            if (data.departmentSpecs) {
              this.deptSpecs = {
                ...DEFAULT_DEPARTMENT_SPECS,
                ...data.departmentSpecs
              };
              this.notifySpecsListeners();
            }

            if (data.customModels && typeof data.customModels === 'object') {
              Object.entries(data.customModels).forEach(([key, val]) => {
                if (val && typeof val === 'object') {
                  const existing = this.laptopsMap.get(key);
                  this.laptopsMap.set(key, {
                    ...(existing || {}),
                    ...(val as RecommendedLaptopModel),
                    id: key
                  });
                }
              });
              this.notifyLaptopsListeners();
            }
          }
        },
        () => {}
      );
      this.unsubscribers.push(unsubConfig);
    } catch {}
  }

  // ==========================================
  // Getters & Subscriptions
  // ==========================================
  public getLaptops(): RecommendedLaptopModel[] {
    return Array.from(this.laptopsMap.values());
  }

  public getDepartmentSpecs(): DepartmentRecommendedSpecs {
    return { ...this.deptSpecs };
  }

  public subscribeLaptops(listener: Listener<RecommendedLaptopModel[]>): () => void {
    this.initRealTimeSync();
    this.laptopsListeners.add(listener);
    listener(this.getLaptops());
    return () => {
      this.laptopsListeners.delete(listener);
    };
  }

  public subscribeDepartmentSpecs(listener: Listener<DepartmentRecommendedSpecs>): () => void {
    this.initRealTimeSync();
    this.specsListeners.add(listener);
    listener(this.getDepartmentSpecs());
    return () => {
      this.specsListeners.delete(listener);
    };
  }

  private notifyLaptopsListeners() {
    const list = this.getLaptops();
    this.laptopsListeners.forEach((l) => {
      try {
        l(list);
      } catch {}
    });
  }

  private notifySpecsListeners() {
    const specs = this.getDepartmentSpecs();
    this.specsListeners.forEach((l) => {
      try {
        l(specs);
      } catch {}
    });
  }

  // ==========================================
  // Mutations & Admin Actions
  // ==========================================
  public async saveLaptopModel(model: RecommendedLaptopModel): Promise<void> {
    const user = auth.currentUser;
    const authorEmail = user?.email || 'admin';
    const now = new Date().toISOString();

    const payload: RecommendedLaptopModel = {
      ...model,
      status: model.status || 'active',
      updatedAt: now,
      updatedBy: authorEmail
    };

    // 1. Local Optimistic Update
    this.laptopsMap.set(payload.id, payload);
    this.notifyLaptopsListeners();

    // 2. Dual-Persist
    try {
      await setDoc(doc(db, 'laptop_models', payload.id), payload, { merge: true });
    } catch {}

    try {
      await setDoc(doc(db, 'site_stats', 'laptop_config'), {
        customModels: {
          [payload.id]: payload
        },
        lastUpdatedAt: now,
        lastUpdatedBy: authorEmail
      }, { merge: true });
    } catch {}

    // 3. Log
    try {
      await addDoc(collection(db, 'adminLogs'), {
        adminUid: user?.uid || 'system',
        adminEmail: authorEmail,
        actionType: 'LAPTOP_MODEL_UPDATED',
        targetContentType: 'laptop',
        targetDocId: payload.id,
        details: `تحديث نموذج لابتوب موصى به: ${payload.name}`,
        timestamp: now
      });
    } catch {}
  }

  public async deleteLaptopModel(modelId: string, modelName: string): Promise<void> {
    const user = auth.currentUser;
    const now = new Date().toISOString();

    this.laptopsMap.delete(modelId);
    this.notifyLaptopsListeners();

    try {
      await deleteDoc(doc(db, 'laptop_models', modelId));
    } catch {}

    try {
      await setDoc(doc(db, 'site_stats', 'laptop_config'), {
        customModels: {
          [modelId]: null
        },
        lastUpdatedAt: now
      }, { merge: true });
    } catch {}

    try {
      await addDoc(collection(db, 'adminLogs'), {
        adminUid: user?.uid || 'system',
        adminEmail: user?.email || 'admin',
        actionType: 'LAPTOP_MODEL_DELETED',
        targetContentType: 'laptop',
        targetDocId: modelId,
        details: `حذف نموذج لابتوب: ${modelName}`,
        timestamp: now
      });
    } catch {}
  }

  public async saveDepartmentSpecs(specs: Partial<DepartmentRecommendedSpecs>): Promise<void> {
    const user = auth.currentUser;
    const authorEmail = user?.email || 'admin';
    const now = new Date().toISOString();

    const updated: DepartmentRecommendedSpecs = {
      ...this.deptSpecs,
      ...specs,
      updatedAt: now,
      updatedBy: authorEmail
    };

    this.deptSpecs = updated;
    this.notifySpecsListeners();

    try {
      await setDoc(doc(db, 'site_stats', 'laptop_config'), {
        departmentSpecs: updated,
        lastUpdatedAt: now,
        lastUpdatedBy: authorEmail
      }, { merge: true });
    } catch {}

    try {
      await addDoc(collection(db, 'adminLogs'), {
        adminUid: user?.uid || 'system',
        adminEmail: authorEmail,
        actionType: 'LAPTOP_SPECS_UPDATED',
        targetContentType: 'laptop_config',
        targetDocId: 'departmentSpecs',
        details: `تحديث معايير وتوصيات لابتوب القسم (التخزين 1TB / الرام 16GB)`,
        timestamp: now
      });
    } catch {}
  }
}

export const laptopAdvisorService = new LaptopAdvisorService();

/**
 * React Hook for Real-time Recommended Laptops
 */
export function useLiveRecommendedLaptops(): RecommendedLaptopModel[] {
  const [laptops, setLaptops] = useState<RecommendedLaptopModel[]>(() => laptopAdvisorService.getLaptops());

  useEffect(() => {
    const unsub = laptopAdvisorService.subscribeLaptops((latest) => {
      setLaptops(latest);
    });
    return unsub;
  }, []);

  return laptops;
}

/**
 * React Hook for Real-time Department Baseline Recommended Specs
 */
export function useLiveDepartmentSpecs(): DepartmentRecommendedSpecs {
  const [specs, setSpecs] = useState<DepartmentRecommendedSpecs>(() => laptopAdvisorService.getDepartmentSpecs());

  useEffect(() => {
    const unsub = laptopAdvisorService.subscribeDepartmentSpecs((latest) => {
      setSpecs(latest);
    });
    return unsub;
  }, []);

  return specs;
}
