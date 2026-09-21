import { 
  db, 
  auth, 
  signInWithGoogle, 
  signOutUser,
  doc, 
  getDoc,
  setDoc, 
  onSnapshot, 
  collection, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  increment,
  onAuthStateChanged,
  User 
} from '../lib/firebase';
import { studentRepository } from './studentRepository';
import { CommunityTip, StudentProfile, CourseProgressStatus, SavedLaptopRecord } from '../types/student';

export type CloudSyncStatus = 'synced' | 'syncing' | 'local_only' | 'offline_error';

export interface TipsStateCallback {
  tips: CommunityTip[];
  isLoading: boolean;
  error: string | null;
}

class FirebaseSyncService {
  private currentUser: User | null = null;
  private sessionUser: { uid: string; email: string | null; displayName: string | null } | null = null;
  private syncStatus: CloudSyncStatus = 'local_only';
  private lastSyncedAt: string | null = null;
  private isSyncingFromRemote = false;
  private unsubscribeFirestore: (() => void) | null = null;
  private authListeners: Set<(user: User | null) => void> = new Set();
  private statusListeners: Set<(status: CloudSyncStatus) => void> = new Set();
  private syncTimeListeners: Set<(time: string | null) => void> = new Set();

  constructor() {
    try {
      this.lastSyncedAt = localStorage.getItem('ece_last_synced_at') || null;
      const storedSession = localStorage.getItem('ece_authenticated_student_session');
      if (storedSession) {
        this.sessionUser = JSON.parse(storedSession);
        if (this.sessionUser) {
          this.syncStatus = 'synced';
        }
      }
    } catch {
      this.lastSyncedAt = null;
      this.sessionUser = null;
    }
    this.init();
  }

  private init() {
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      if (user) {
        this.sessionUser = null;
        try {
          localStorage.removeItem('ece_authenticated_student_session');
        } catch {}
      }
      this.notifyAuthListeners();

      if (user) {
        await this.handleUserSignIn(user);
      } else if (!this.sessionUser) {
        this.handleUserSignOut();
      }
    });
  }

  public setAuthenticatedStudentSession(student: { uid: string; email?: string | null; displayName?: string | null } | null) {
    if (student && student.uid) {
      this.sessionUser = {
        uid: student.uid,
        email: student.email || null,
        displayName: student.displayName || null
      };
      try {
        localStorage.setItem('ece_authenticated_student_session', JSON.stringify(this.sessionUser));
      } catch {}
      this.setSyncStatus('synced');
      this.notifyAuthListeners();
    } else {
      this.sessionUser = null;
      try {
        localStorage.removeItem('ece_authenticated_student_session');
      } catch {}
      if (!this.currentUser) {
        this.handleUserSignOut();
      }
    }
  }

  public getSyncStatus(): CloudSyncStatus {
    return this.syncStatus;
  }

  public getLastSyncedAt(): string | null {
    return this.lastSyncedAt;
  }

  private setSyncStatus(status: CloudSyncStatus) {
    this.syncStatus = status;
    this.statusListeners.forEach((cb) => cb(status));
  }

  private setLastSyncedAt(time: string | null) {
    this.lastSyncedAt = time;
    try {
      if (time) {
        localStorage.setItem('ece_last_synced_at', time);
      } else {
        localStorage.removeItem('ece_last_synced_at');
      }
    } catch {
      // safe fallback
    }
    this.syncTimeListeners.forEach((cb) => cb(time));
  }

  public subscribeStatus(callback: (status: CloudSyncStatus) => void) {
    this.statusListeners.add(callback);
    callback(this.syncStatus);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  public subscribeLastSynced(callback: (time: string | null) => void) {
    this.syncTimeListeners.add(callback);
    callback(this.lastSyncedAt);
    return () => {
      this.syncTimeListeners.delete(callback);
    };
  }

  private notifyAuthListeners() {
    const userToReport = this.getUser();
    this.authListeners.forEach((cb) => cb(userToReport as User | null));
  }

  public subscribeAuth(callback: (user: User | null) => void) {
    this.authListeners.add(callback);
    callback(this.getUser() as User | null);
    return () => {
      this.authListeners.delete(callback);
    };
  }

  public getUser(): User | null {
    if (this.currentUser) return this.currentUser;
    if (this.sessionUser) {
      return {
        uid: this.sessionUser.uid,
        email: this.sessionUser.email,
        displayName: this.sessionUser.displayName,
        photoURL: null
      } as unknown as User;
    }
    return null;
  }

  public async signInWithGoogle(): Promise<User | null> {
    this.setSyncStatus('syncing');
    try {
      const user = await signInWithGoogle();
      if (!user) {
        this.setSyncStatus(this.currentUser || this.sessionUser ? 'synced' : 'local_only');
      }
      return user;
    } catch (err) {
      this.setSyncStatus(this.currentUser || this.sessionUser ? 'synced' : 'local_only');
      throw err;
    }
  }

  public async signOut(): Promise<void> {
    try {
      await signOutUser();
    } catch {}
    this.sessionUser = null;
    try {
      localStorage.removeItem('ece_authenticated_student_session');
    } catch {}
    this.handleUserSignOut();
    this.notifyAuthListeners();
  }

  private handleUserSignOut() {
    if (this.unsubscribeFirestore) {
      this.unsubscribeFirestore();
      this.unsubscribeFirestore = null;
    }
    this.setSyncStatus('local_only');
  }

  /**
   * Safe migration and merge strategy when a student connects Google account:
   * 1. Preserves local journey (never wipes progress).
   * 2. If cloud profile does not exist: migrates local journey to cloud.
   * 3. If cloud profile exists: merges local and cloud journeys:
   *    - Union completed courses from either side.
   *    - Preserve in-progress or important course states.
   *    - Preserve saved laptop specs (preferring newer evaluation).
   * 4. Updates local repository to match the unified merged state.
   */
  private async handleUserSignIn(user: User) {
    this.setSyncStatus('syncing');

    if (this.unsubscribeFirestore) {
      this.unsubscribeFirestore();
      this.unsubscribeFirestore = null;
    }

    const userDocRef = doc(db, 'students', user.uid);
    const now = new Date().toISOString();

    try {
      // Fetch cloud document for this student
      const docSnap = await getDoc(userDocRef);
      const localProfile = studentRepository.getProfile();
      const localProgress = studentRepository.getCourseProgress();
      const localLaptop = studentRepository.getSavedLaptop();
      const localGrades = studentRepository.getAcademicGrades();
      const localWorkspace = studentRepository.getGraduationWorkspace();

      if (docSnap.exists()) {
        const remoteData = docSnap.data();

        // Safe merge course progress (Union strategy)
        const mergedProgress: Record<string, CourseProgressStatus> = {
          ...(remoteData.coursesProgress || {})
        };

        Object.entries(localProgress).forEach(([cId, status]) => {
          // If already in merged and one is completed, prefer completed
          if (mergedProgress[cId] === 'completed' || status === 'completed') {
            mergedProgress[cId] = 'completed';
          } else if (status === 'to_study' || mergedProgress[cId] === 'to_study') {
            mergedProgress[cId] = 'to_study';
          } else if (status === 'important' || mergedProgress[cId] === 'important') {
            mergedProgress[cId] = 'important';
          } else {
            mergedProgress[cId] = status;
          }
        });

        // Merge academic grades (prefer newer grade update)
        const mergedGrades: Record<string, any> = {
          ...(remoteData.academicGrades || {})
        };
        Object.entries(localGrades).forEach(([cId, localG]) => {
          if (!mergedGrades[cId]) {
            mergedGrades[cId] = localG;
          } else {
            const remoteTime = new Date(mergedGrades[cId].updatedAt || 0).getTime();
            const localTime = new Date(localG.updatedAt || 0).getTime();
            mergedGrades[cId] = localTime >= remoteTime ? localG : mergedGrades[cId];
          }
        });

        // Merge graduation workspace (union starred projects, merge custom ideas)
        const remoteWs = remoteData.graduationWorkspace || {};
        const mergedStarred = Array.from(new Set([
          ...(remoteWs.starredProjectIds || []),
          ...(localWorkspace.starredProjectIds || [])
        ]));
        const mergedWorkspace = {
          ...remoteWs,
          ...localWorkspace,
          starredProjectIds: mergedStarred,
          savedAt: now
        };

        // Determine profile merge
        const remoteUpdated = remoteData.updatedAt ? new Date(remoteData.updatedAt).getTime() : 0;
        const localUpdated = localProfile.updatedAt ? new Date(localProfile.updatedAt).getTime() : 0;

        let mergedProfile: StudentProfile;
        if (remoteUpdated > localUpdated && remoteData.academicYear) {
          mergedProfile = {
            ...localProfile,
            currentYear: remoteData.currentYear || localProfile.currentYear,
            academicYear: remoteData.academicYear || localProfile.academicYear,
            academicSemester: remoteData.academicSemester || localProfile.academicSemester,
            role: remoteData.role || localProfile.role,
            roleLabelAr: remoteData.roleLabelAr || localProfile.roleLabelAr,
            username: localProfile.username || remoteData.username || undefined,
            accountPassword: localProfile.accountPassword || remoteData.accountPassword || undefined,
            targetFocusTrack: remoteData.targetFocusTrack || localProfile.targetFocusTrack,
            onboardingCompleted: remoteData.onboardingCompleted ?? localProfile.onboardingCompleted,
            updatedAt: remoteData.updatedAt
          };
        } else {
          mergedProfile = {
            ...localProfile,
            username: localProfile.username || remoteData.username || undefined,
            accountPassword: localProfile.accountPassword || remoteData.accountPassword || undefined,
            updatedAt: now
          };
        }

        // Merge saved laptop
        let mergedLaptop: SavedLaptopRecord | null = localLaptop;
        if (remoteData.savedLaptop && !localLaptop) {
          mergedLaptop = remoteData.savedLaptop;
        } else if (remoteData.savedLaptop && localLaptop) {
          const remoteLapTime = new Date(remoteData.savedLaptop.savedAt || 0).getTime();
          const localLapTime = new Date(localLaptop.savedAt || 0).getTime();
          mergedLaptop = remoteLapTime > localLapTime ? remoteData.savedLaptop : localLaptop;
        }

        // Apply merged data to local storage repository
        this.isSyncingFromRemote = true;
        try {
          studentRepository.saveProfile(mergedProfile);
          Object.entries(mergedProgress).forEach(([cId, status]) => {
            studentRepository.setCourseStatus(cId, status);
          });
          studentRepository.setAllGrades(mergedGrades);
          studentRepository.saveGraduationWorkspace(mergedWorkspace);
          if (mergedLaptop) {
            studentRepository.saveLaptop(mergedLaptop.specs, mergedLaptop.evaluation);
          }
        } finally {
          this.isSyncingFromRemote = false;
        }

        // Save unified merged state to Firestore
        const cloudRecord = {
          uid: user.uid,
          displayName: user.displayName || remoteData.displayName || null,
          email: user.email || remoteData.email || null,
          username: mergedProfile.username || null,
          accountPassword: mergedProfile.accountPassword || null,
          academicYear: mergedProfile.academicYear,
          currentYear: mergedProfile.currentYear,
          academicSemester: mergedProfile.academicSemester,
          role: mergedProfile.role,
          roleLabelAr: mergedProfile.roleLabelAr,
          targetFocusTrack: mergedProfile.targetFocusTrack || null,
          onboardingCompleted: mergedProfile.onboardingCompleted,
          coursesProgress: mergedProgress,
          academicGrades: mergedGrades,
          graduationWorkspace: mergedWorkspace,
          savedLaptop: mergedLaptop,
          createdAt: remoteData.createdAt || localProfile.createdAt || now,
          updatedAt: now,
          lastSyncedAt: now
        };

        if (mergedProfile.username && mergedProfile.accountPassword) {
          try {
            const { studentAuthService } = await import('./studentAuthService');
            studentAuthService.registerStudentAccount({
              ...cloudRecord,
              email: user.email || remoteData.email,
              displayName: user.displayName || remoteData.displayName || mergedProfile.name,
              username: mergedProfile.username,
              accountPassword: mergedProfile.accountPassword
            });
          } catch {}
        }

        await setDoc(userDocRef, cloudRecord, { merge: true });

      } else {
        // Initial migration: Upload existing local anonymous progress to the cloud document
        await setDoc(userDocRef, {
          uid: user.uid,
          displayName: user.displayName || null,
          email: user.email || null,
          username: localProfile.username || null,
          accountPassword: localProfile.accountPassword || null,
          academicYear: localProfile.academicYear,
          currentYear: localProfile.currentYear,
          academicSemester: localProfile.academicSemester,
          role: localProfile.role,
          roleLabelAr: localProfile.roleLabelAr,
          targetFocusTrack: localProfile.targetFocusTrack || null,
          onboardingCompleted: localProfile.onboardingCompleted,
          coursesProgress: localProgress,
          academicGrades: localGrades,
          graduationWorkspace: localWorkspace,
          savedLaptop: localLaptop,
          createdAt: localProfile.createdAt || now,
          updatedAt: now,
          lastSyncedAt: now
        });
      }

      this.setLastSyncedAt(now);
      this.setSyncStatus('synced');

      // Setup real-time listener for multi-device sync
      this.unsubscribeFirestore = onSnapshot(userDocRef, (snap) => {
        if (!snap.exists() || this.isSyncingFromRemote) return;

        const data = snap.data();
        this.isSyncingFromRemote = true;
        try {
          if (data.academicYear) {
            studentRepository.saveProfile({
              academicYear: data.academicYear,
              currentYear: data.currentYear,
              academicSemester: data.academicSemester,
              role: data.role,
              roleLabelAr: data.roleLabelAr,
              targetFocusTrack: data.targetFocusTrack,
              onboardingCompleted: data.onboardingCompleted,
              updatedAt: data.updatedAt
            });
          }
          if (data.coursesProgress) {
            Object.entries(data.coursesProgress).forEach(([cId, status]) => {
              studentRepository.setCourseStatus(cId, status as CourseProgressStatus);
            });
          }
          if (data.academicGrades) {
            studentRepository.setAllGrades(data.academicGrades);
          }
          if (data.graduationWorkspace) {
            studentRepository.saveGraduationWorkspace(data.graduationWorkspace);
          }
          if (data.savedLaptop) {
            studentRepository.saveLaptop(data.savedLaptop.specs, data.savedLaptop.evaluation);
          }
          if (data.lastSyncedAt) {
            this.setLastSyncedAt(data.lastSyncedAt);
          }
        } finally {
          this.isSyncingFromRemote = false;
        }
      }, (err) => {
        console.warn('Realtime sync snapshot notice:', err.message);
        this.setSyncStatus('offline_error');
      });

    } catch (err: any) {
      console.warn('Initial cloud sync notice (operating in local fallback):', err?.message || err);
      this.setSyncStatus('offline_error');
    }
  }

  /**
   * Push changes from local store to cloud if student is authenticated
   */
  public async pushLocalToCloud() {
    if (!this.currentUser || this.isSyncingFromRemote) return;

    const now = new Date().toISOString();
    try {
      const profile = studentRepository.getProfile();
      const coursesProgress = studentRepository.getCourseProgress();
      const savedLaptop = studentRepository.getSavedLaptop();
      const academicGrades = studentRepository.getAcademicGrades();
      const graduationWorkspace = studentRepository.getGraduationWorkspace();

      const userDocRef = doc(db, 'students', this.currentUser.uid);
      const studentPayload = {
        uid: this.currentUser.uid,
        displayName: this.currentUser.displayName || profile.name || null,
        email: this.currentUser.email || profile.email || null,
        username: profile.username || null,
        accountPassword: profile.accountPassword || null,
        academicYear: profile.academicYear,
        currentYear: profile.currentYear,
        academicSemester: profile.academicSemester,
        role: profile.role,
        roleLabelAr: profile.roleLabelAr,
        targetFocusTrack: profile.targetFocusTrack || null,
        onboardingCompleted: profile.onboardingCompleted,
        coursesProgress,
        academicGrades,
        graduationWorkspace,
        savedLaptop,
        updatedAt: now,
        lastSyncedAt: now
      };

      if (profile.username && profile.accountPassword) {
        try {
          const { studentAuthService } = await import('./studentAuthService');
          studentAuthService.registerStudentAccount({
            ...studentPayload,
            email: this.currentUser.email || profile.email,
            displayName: this.currentUser.displayName || profile.name
          });
        } catch {}
      }

      await setDoc(userDocRef, studentPayload, { merge: true });

      this.setLastSyncedAt(now);
      this.setSyncStatus('synced');
    } catch (err: any) {
      console.warn('Notice: push to cloud failed (local state preserved):', err?.message || err);
      this.setSyncStatus('offline_error');
    }
  }

  // --- Community Tips Operations ---

  public subscribeCommunityTips(callback: (state: TipsStateCallback) => void) {
    try {
      callback({ tips: [], isLoading: true, error: null });

      const getLocalTips = (): CommunityTip[] => {
        try {
          const raw = localStorage.getItem('ece_local_community_tips_v1');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
          }
        } catch {}
        return [];
      };

      const tipsCol = collection(db, 'communityTips');
      const q = query(tipsCol, orderBy('createdAt', 'desc'));

      return onSnapshot(q, (snapshot) => {
        const firestoreTips: CommunityTip[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<CommunityTip, 'id'>)
        }));

        const localTips = getLocalTips();
        const mergedMap = new Map<string, CommunityTip>();
        [...firestoreTips, ...localTips].forEach(t => {
          if (!mergedMap.has(t.id)) {
            mergedMap.set(t.id, t);
          }
        });

        const tips = Array.from(mergedMap.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback({ tips, isLoading: false, error: null });

        // Background sync local tips to Firestore
        setTimeout(async () => {
          try {
            const firestoreIds = new Set(snapshot.docs.map(d => d.id));
            for (const t of localTips) {
              if (!firestoreIds.has(t.id)) {
                await setDoc(doc(db, 'communityTips', t.id), {
                  authorId: t.authorId,
                  authorName: t.authorName,
                  authorYear: t.authorYear,
                  courseId: t.courseId,
                  courseNameAr: t.courseNameAr || null,
                  content: t.content,
                  category: t.category,
                  likesCount: t.likesCount || 0,
                  likedBy: t.likedBy || [],
                  dislikesCount: t.dislikesCount || 0,
                  dislikedBy: t.dislikedBy || [],
                  createdAt: t.createdAt
                }, { merge: true });
              }
            }
          } catch (syncErr) {
            console.warn('Background sync of local tips:', syncErr);
          }
        }, 1200);
      }, (err) => {
        console.warn('Notice when fetching community tips from Firestore, using local tips:', err.message);
        const localTips = getLocalTips();
        callback({ tips: localTips, isLoading: false, error: null });
      });
    } catch (e: any) {
      console.warn('Failed to subscribe to community tips:', e);
      const localTips = (() => {
        try { return JSON.parse(localStorage.getItem('ece_local_community_tips_v1') || '[]'); } catch { return []; }
      })();
      callback({ tips: localTips, isLoading: false, error: null });
      return () => {};
    }
  }

  public async addCommunityTip(tipData: {
    authorName: string;
    authorYear: string | number;
    courseId?: string;
    courseNameAr?: string;
    content: string;
    category: 'study_tip' | 'exam_advice' | 'lab_work' | 'resource';
  }): Promise<string> {
    const sanitizedName = tipData.authorName.trim().slice(0, 60) || 'طالب هندسة اتصالات';
    const sanitizedContent = tipData.content.trim().slice(0, 2000);

    if (sanitizedContent.length < 5) {
      throw new Error('CONTENT_TOO_SHORT');
    }

    const authorId = this.currentUser?.uid || this.sessionUser?.uid || 'guest-' + Math.random().toString(36).substring(2, 9);
    const newTipId = 'tip-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

    const tipRecord: CommunityTip = {
      id: newTipId,
      authorId,
      authorName: sanitizedName,
      authorYear: tipData.authorYear as any,
      courseId: tipData.courseId || 'general',
      courseNameAr: tipData.courseNameAr || undefined,
      content: sanitizedContent,
      category: tipData.category,
      likesCount: 0,
      likedBy: [],
      dislikesCount: 0,
      dislikedBy: [],
      createdAt: new Date().toISOString()
    };

    // 1. Save in localStorage first for instant publication
    try {
      const existingLocal = JSON.parse(localStorage.getItem('ece_local_community_tips_v1') || '[]');
      localStorage.setItem('ece_local_community_tips_v1', JSON.stringify([tipRecord, ...existingLocal]));
    } catch {}

    // 2. Try writing to Firestore (non-blocking)
    try {
      const tipsCol = collection(db, 'communityTips');
      const docRef = await addDoc(tipsCol, {
        authorId: tipRecord.authorId,
        authorName: tipRecord.authorName,
        authorYear: tipRecord.authorYear,
        courseId: tipRecord.courseId,
        courseNameAr: tipRecord.courseNameAr,
        content: tipRecord.content,
        category: tipRecord.category,
        likesCount: 0,
        likedBy: [],
        dislikesCount: 0,
        dislikedBy: [],
        createdAt: tipRecord.createdAt
      });
      return docRef.id;
    } catch (err: any) {
      console.warn('Firestore addCommunityTip caught (saved locally):', err?.message);
      return newTipId;
    }
  }

  public async toggleLikeTip(tipId: string, currentLiked: boolean, currentDisliked: boolean = false): Promise<void> {
    if (!this.currentUser) {
      throw new Error('AUTH_REQUIRED');
    }

    const uid = this.currentUser.uid;
    const tipRef = doc(db, 'communityTips', tipId);

    const updates: Record<string, any> = {};

    if (currentLiked) {
      // Remove upvote
      updates.likesCount = increment(-1);
      updates.likedBy = arrayRemove(uid);
    } else {
      // Add upvote
      updates.likesCount = increment(1);
      updates.likedBy = arrayUnion(uid);

      // If was disliked, remove dislike
      if (currentDisliked) {
        updates.dislikesCount = increment(-1);
        updates.dislikedBy = arrayRemove(uid);
      }
    }

    await updateDoc(tipRef, updates);
  }

  public async toggleDislikeTip(tipId: string, currentDisliked: boolean, currentLiked: boolean = false): Promise<void> {
    if (!this.currentUser) {
      throw new Error('AUTH_REQUIRED');
    }

    const uid = this.currentUser.uid;
    const tipRef = doc(db, 'communityTips', tipId);

    const updates: Record<string, any> = {};

    if (currentDisliked) {
      // Remove downvote
      updates.dislikesCount = increment(-1);
      updates.dislikedBy = arrayRemove(uid);
    } else {
      // Add downvote
      updates.dislikesCount = increment(1);
      updates.dislikedBy = arrayUnion(uid);

      // If was liked, remove like
      if (currentLiked) {
        updates.likesCount = increment(-1);
        updates.likedBy = arrayRemove(uid);
      }
    }

    await updateDoc(tipRef, updates);
  }
}

export const firebaseSyncService = new FirebaseSyncService();
