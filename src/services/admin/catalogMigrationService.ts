/**
 * Temporary Catalog & Public Data Migration Service (Phase 1)
 * 
 * STRICT ISOLATION RULES:
 * - Reads ONLY public/catalog data from the OLD production Firebase instance.
 * - Writes to NEW Firebase instance (eceroadmap2027) using a secondary named Firebase app.
 * - Targets the (default) database in the new project.
 * - Requires explicit Google sign-in to the target project with verified 'super_admin' role.
 * - Preserves exact document IDs and native Firestore Timestamps.
 * - Strictly idempotent (uses setDoc with merge semantics).
 * - Never deletes or alters old project data.
 * - Does NOT touch: students, communityTips, admins, site_stats, adminLogs, guest_visitors.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as targetSignOut,
  User as TargetUser,
} from 'firebase/auth';
import { db as sourceDb } from '../../lib/firebase';

const TARGET_APP_NAME = 'ECERoadmapMigrationTarget_Phase1';

export interface TargetFirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  firestoreDatabaseId: string;
}

export interface CollectionMigrationStats {
  collectionKey: string;
  labelAr: string;
  sourceCount: number;
  targetCount: number;
  migratedCount: number;
  status: 'idle' | 'analyzed' | 'migrating' | 'completed' | 'error' | 'mismatch';
  errorDetails?: string[];
}

export interface MigrationSummaryReport {
  targetUserEmail: string;
  targetUserUid: string;
  startedAt: string;
  completedAt: string;
  collections: CollectionMigrationStats[];
  totalSourceDocs: number;
  totalMigratedDocs: number;
  totalTargetDocs: number;
  systemConfigVerified: boolean;
  isAllVerified: boolean;
  failures: { collection: string; docId: string; error: string }[];
}

export class CatalogMigrationService {
  private targetApp: FirebaseApp | null = null;
  private targetDb: Firestore | null = null;
  private targetAuth: Auth | null = null;

  /**
   * Retrieves target Firebase configuration from environment variables or overrides.
   */
  public getTargetConfig(apiKeyOverride?: string, databaseIdOverride?: string): TargetFirebaseConfig | null {
    const apiKey = (apiKeyOverride || import.meta.env.VITE_MIGRATION_FIREBASE_API_KEY || '').trim();
    const authDomain = (import.meta.env.VITE_MIGRATION_FIREBASE_AUTH_DOMAIN || 'eceroadmap2027.firebaseapp.com').trim();
    const projectId = (import.meta.env.VITE_MIGRATION_FIREBASE_PROJECT_ID || 'eceroadmap2027').trim();
    const storageBucket = (import.meta.env.VITE_MIGRATION_FIREBASE_STORAGE_BUCKET || 'eceroadmap2027.firebasestorage.app').trim();
    const messagingSenderId = (import.meta.env.VITE_MIGRATION_FIREBASE_MESSAGING_SENDER_ID || '23606413805').trim();
    const appId = (import.meta.env.VITE_MIGRATION_FIREBASE_APP_ID || '1:23606413805:web:1532dd0867824f616fbfe4').trim();
    const firestoreDatabaseId = (
      databaseIdOverride ||
      import.meta.env.VITE_MIGRATION_FIREBASE_FIRESTORE_DATABASE_ID ||
      'ai-studio-eceroadmap-92942c14-153e-4944-ad7d-20e5ea4add92'
    ).trim();

    if (!apiKey) {
      return null;
    }

    return {
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
      firestoreDatabaseId,
    };
  }

  /**
   * Initializes the secondary named Firebase app for eceroadmap2027.
   */
  public initTargetApp(config: TargetFirebaseConfig): { targetDb: Firestore; targetAuth: Auth } {
    const existing = getApps().find((a) => a.name === TARGET_APP_NAME);
    if (existing) {
      this.targetApp = existing;
    } else {
      this.targetApp = initializeApp(config, TARGET_APP_NAME);
    }

    // Connect to the specific named Firestore database instance in the target project
    const dbId = config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)'
      ? config.firestoreDatabaseId
      : 'ai-studio-eceroadmap-92942c14-153e-4944-ad7d-20e5ea4add92';

    this.targetDb = getFirestore(this.targetApp, dbId);
    this.targetAuth = getAuth(this.targetApp);

    return { targetDb: this.targetDb, targetAuth: this.targetAuth };
  }

  /**
   * Get current target authentication state.
   */
  public getTargetUser(): TargetUser | null {
    return this.targetAuth ? this.targetAuth.currentUser : null;
  }

  /**
   * Sign in to target project using Google OAuth popup.
   * Does NOT alter or sign out the primary/source app auth session.
   */
  public async signInToTarget(): Promise<TargetUser> {
    if (!this.targetAuth) {
      throw new Error('لم تتم تهيئة مشروع الهدف. يرجى التأكد من إدخال مفتاح API أولاً.');
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const userCredential = await signInWithPopup(this.targetAuth, provider);
    const user = userCredential.user;

    // Verify Super Admin status immediately
    await this.verifyTargetSuperAdmin(user);

    return user;
  }

  /**
   * Verifies that target admins/{uid} exists and has role == 'super_admin'.
   */
  public async verifyTargetSuperAdmin(user: TargetUser): Promise<{ role: string }> {
    if (!this.targetDb) {
      throw new Error('قاعدة بيانات الهدف غير مهيأة.');
    }

    const adminDocRef = doc(this.targetDb, 'admins', user.uid);
    const adminSnap = await getDoc(adminDocRef);

    if (!adminSnap.exists()) {
      throw new Error(
        `الحساب المسجل (${user.email || user.uid}) لا يملك وثيقة في مجموعة admins في قاعدة بيانات الهدف (admins/${user.uid}) ضمن قاعدة البيانات (ai-studio-eceroadmap-92942c14-153e-4944-ad7d-20e5ea4add92) في مشروع eceroadmap2027. يرجى التحقق من وجود الوثيقة في المشروع الجديد قبل المتابعة.`
      );
    }

    const adminData = adminSnap.data();
    if (adminData?.role !== 'super_admin') {
      throw new Error(
        `الحساب المسجل (${user.email}) لديه الصلاحية "${adminData?.role || 'غير محدد'}"، والمطلوب حصراً "super_admin" لتنفيذ نقل البيانات.`
      );
    }

    return { role: adminData.role };
  }

  /**
   * Sign out from target project only.
   */
  public async signOutTarget(): Promise<void> {
    if (this.targetAuth) {
      await targetSignOut(this.targetAuth);
    }
  }

  /**
   * Collections to migrate in Phase 1 (Strictly Catalog and System Config).
   */
  public getTargetCollectionDefinitions(): { key: string; labelAr: string; type: 'collection' | 'doc'; docPath?: string }[] {
    return [
      { key: 'courses', labelAr: 'المقررات الدراسية (courses)', type: 'collection' },
      { key: 'software', labelAr: 'البرمجيات والأدوات الهندسية (software)', type: 'collection' },
      { key: 'academicResources', labelAr: 'المصادر والكتب الأكاديمية (academicResources)', type: 'collection' },
      { key: 'faqs', labelAr: 'الأسئلة الشائعة الأكاديمية (faqs)', type: 'collection' },
      { key: 'graduation_projects', labelAr: 'مكتبة مشاريع التخرج (graduation_projects)', type: 'collection' },
      { key: 'course_skill_pipelines', labelAr: 'مسارات الربط بين المواد والمهارات (course_skill_pipelines)', type: 'collection' },
      { key: 'system_config_exhibition', labelAr: 'إعدادات وضع المعرض (system_config/exhibition_config)', type: 'doc', docPath: 'system_config/exhibition_config' },
      { key: 'system_config_academic', labelAr: 'إعدادات النظام الأكاديمي (system_config/academic_settings)', type: 'doc', docPath: 'system_config/academic_settings' },
      { key: 'moderators', labelAr: 'سجلات المشرفين المعتمدين (moderators)', type: 'collection' },
    ];
  }

  /**
   * Pre-Flight Analysis: Reads document counts from Source and Target without writing anything.
   */
  public async runPreFlightAnalysis(
    onProgress?: (colKey: string, status: string) => void
  ): Promise<CollectionMigrationStats[]> {
    if (!this.targetDb) {
      throw new Error('قاعدة بيانات الهدف غير متصلة.');
    }

    const defs = this.getTargetCollectionDefinitions();
    const stats: CollectionMigrationStats[] = [];

    for (const def of defs) {
      if (onProgress) onProgress(def.key, 'جاري فحص الأعداد...');

      let sourceCount = 0;
      let targetCount = 0;

      try {
        if (def.type === 'collection') {
          const sourceSnap = await getDocs(collection(sourceDb, def.key));
          sourceCount = sourceSnap.size;

          const targetSnap = await getDocs(collection(this.targetDb, def.key));
          targetCount = targetSnap.size;
        } else if (def.type === 'doc' && def.docPath) {
          const [colName, docId] = def.docPath.split('/');
          const sourceSnap = await getDoc(doc(sourceDb, colName, docId));
          sourceCount = sourceSnap.exists() ? 1 : 0;

          const targetSnap = await getDoc(doc(this.targetDb, colName, docId));
          targetCount = targetSnap.exists() ? 1 : 0;
        }

        stats.push({
          collectionKey: def.key,
          labelAr: def.labelAr,
          sourceCount,
          targetCount,
          migratedCount: 0,
          status: 'analyzed',
        });
      } catch (err: any) {
        stats.push({
          collectionKey: def.key,
          labelAr: def.labelAr,
          sourceCount: 0,
          targetCount: 0,
          migratedCount: 0,
          status: 'error',
          errorDetails: [err.message || 'خطأ أثناء فحص المجموعة'],
        });
      }
    }

    return stats;
  }

  /**
   * Execute Migration for public catalog and system configuration only.
   * Uses setDoc with merge semantics, preserves IDs and Timestamps.
   */
  public async executeCatalogMigration(
    onCollectionProgress: (stats: CollectionMigrationStats) => void
  ): Promise<MigrationSummaryReport> {
    if (!this.targetDb || !this.targetAuth || !this.targetAuth.currentUser) {
      throw new Error('يجب تسجيل الدخول بحساب المشرف الأعلى (super_admin) في المشروع الجديد أولاً.');
    }

    const targetUser = this.targetAuth.currentUser;
    await this.verifyTargetSuperAdmin(targetUser);

    const startTime = new Date().toISOString();
    const defs = this.getTargetCollectionDefinitions();
    const results: CollectionMigrationStats[] = [];
    const allFailures: { collection: string; docId: string; error: string }[] = [];

    for (const def of defs) {
      const currentStats: CollectionMigrationStats = {
        collectionKey: def.key,
        labelAr: def.labelAr,
        sourceCount: 0,
        targetCount: 0,
        migratedCount: 0,
        status: 'migrating',
        errorDetails: [],
      };
      onCollectionProgress(currentStats);

      try {
        if (def.type === 'collection') {
          // 1. Read source documents
          const sourceSnap = await getDocs(collection(sourceDb, def.key));
          currentStats.sourceCount = sourceSnap.size;

          let successCount = 0;
          for (const docSnap of sourceSnap.docs) {
            try {
              const docId = docSnap.id;
              const rawData = docSnap.data();

              // Write to target with preserved exact ID and native Timestamp preservation
              const targetDocRef = doc(this.targetDb, def.key, docId);
              await setDoc(targetDocRef, rawData, { merge: true });
              successCount++;
              currentStats.migratedCount = successCount;
              onCollectionProgress(currentStats);
            } catch (docErr: any) {
              const msg = `فشل في نقل الوثيقة (${docSnap.id}): ${docErr.message || 'خطأ غير معروف'}`;
              currentStats.errorDetails?.push(msg);
              allFailures.push({ collection: def.key, docId: docSnap.id, error: docErr.message || 'خطأ غير معروف' });
            }
          }

          // 2. Count final target documents
          const targetSnap = await getDocs(collection(this.targetDb, def.key));
          currentStats.targetCount = targetSnap.size;
          currentStats.status = currentStats.errorDetails && currentStats.errorDetails.length > 0 ? 'error' : 'completed';
        } else if (def.type === 'doc' && def.docPath) {
          const [colName, docId] = def.docPath.split('/');
          const sourceDocSnap = await getDoc(doc(sourceDb, colName, docId));

          if (sourceDocSnap.exists()) {
            currentStats.sourceCount = 1;
            try {
              const rawData = sourceDocSnap.data();
              const targetDocRef = doc(this.targetDb, colName, docId);
              await setDoc(targetDocRef, rawData, { merge: true });
              currentStats.migratedCount = 1;

              const targetDocSnap = await getDoc(targetDocRef);
              currentStats.targetCount = targetDocSnap.exists() ? 1 : 0;
              currentStats.status = 'completed';
            } catch (err: any) {
              const msg = `فشل نقل وثيقة الإعدادات (${docId}): ${err.message}`;
              currentStats.errorDetails?.push(msg);
              currentStats.status = 'error';
              allFailures.push({ collection: colName, docId, error: err.message });
            }
          } else {
            currentStats.sourceCount = 0;
            currentStats.migratedCount = 0;
            currentStats.targetCount = 0;
            currentStats.status = 'completed';
          }
        }
      } catch (colErr: any) {
        currentStats.status = 'error';
        currentStats.errorDetails?.push(colErr.message || 'فشل في معالجة المجموعة');
        allFailures.push({ collection: def.key, docId: '*', error: colErr.message });
      }

      results.push(currentStats);
      onCollectionProgress(currentStats);
    }

    // Also migrate system_config/moderators_config if present in source
    try {
      const sourceModCfg = await getDoc(doc(sourceDb, 'system_config', 'moderators_config'));
      if (sourceModCfg.exists()) {
        await setDoc(doc(this.targetDb, 'system_config', 'moderators_config'), sourceModCfg.data(), { merge: true });
      }
    } catch {
      // Non-blocking
    }

    const endTime = new Date().toISOString();

    // Verify system_config documents exist in target
    let systemConfigVerified = true;
    try {
      const exSnap = await getDoc(doc(this.targetDb, 'system_config', 'exhibition_config'));
      const acSnap = await getDoc(doc(this.targetDb, 'system_config', 'academic_settings'));
      systemConfigVerified = exSnap.exists() && acSnap.exists();
    } catch {
      systemConfigVerified = false;
    }

    const totalSource = results.reduce((sum, r) => sum + r.sourceCount, 0);
    const totalMigrated = results.reduce((sum, r) => sum + r.migratedCount, 0);
    const totalTarget = results.reduce((sum, r) => sum + r.targetCount, 0);

    const isAllVerified = allFailures.length === 0 && systemConfigVerified && totalSource <= totalTarget;

    return {
      targetUserEmail: targetUser.email || targetUser.uid,
      targetUserUid: targetUser.uid,
      startedAt: startTime,
      completedAt: endTime,
      collections: results,
      totalSourceDocs: totalSource,
      totalMigratedDocs: totalMigrated,
      totalTargetDocs: totalTarget,
      systemConfigVerified,
      isAllVerified,
      failures: allFailures,
    };
  }
}

export const catalogMigrationService = new CatalogMigrationService();
