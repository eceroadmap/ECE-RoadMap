import { db, collection, addDoc, doc, setDoc, getDocs, getDoc, query, orderBy, limit, ensureFirebaseAuth } from '../lib/firebase';
import { studentRepository } from './studentRepository';
import { AcademicYearNumber } from '../types';

export interface GuestVisitorRecord {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  academicYear?: AcademicYearNumber | string;
  createdAt: string;
  userAgent?: string;
}

const STORAGE_KEY = 'ece_guest_visitor_record';

export const guestVisitorService = {
  getStoredGuest(): GuestVisitorRecord | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async registerGuest(data: {
    firstName: string;
    lastName: string;
    academicYear?: AcademicYearNumber | string;
  }): Promise<GuestVisitorRecord> {
    const trimmedFirst = data.firstName.trim();
    const trimmedLast = data.lastName.trim();
    const fullName = `${trimmedFirst} ${trimmedLast}`;
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    const record: GuestVisitorRecord = {
      id: guestId,
      firstName: trimmedFirst,
      lastName: trimmedLast,
      fullName,
      academicYear: data.academicYear || 1,
      createdAt: now,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
    };

    // 1. Save to local storage for instant session continuity
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch (e) {
      console.warn('Local storage save warning:', e);
    }

    // 2. Update student profile locally
    const yearNumber = typeof data.academicYear === 'number' 
      ? data.academicYear 
      : (data.academicYear === 'graduate' ? 5 : (parseInt(String(data.academicYear)) || 1));

    studentRepository.saveProfile({
      name: fullName,
      academicYear: (yearNumber >= 1 && yearNumber <= 5 ? yearNumber : 1) as AcademicYearNumber,
      currentYear: data.academicYear === 'graduate' ? 'graduate' : ((yearNumber >= 1 && yearNumber <= 5 ? yearNumber : 1) as AcademicYearNumber),
      onboardingCompleted: true,
      role: data.academicYear === 'graduate' ? 'graduate' : (yearNumber === 1 ? 'freshman' : 'current'),
      roleLabelAr: data.academicYear === 'graduate' ? 'مهندس خريج' : `طالب سنة ${yearNumber}`
    });

    // 3. Persist to Firestore database in 'guest_visitors' collection
    try {
      const guestDocRef = doc(db, 'guest_visitors', guestId);
      await setDoc(guestDocRef, {
        id: guestId,
        firstName: trimmedFirst,
        lastName: trimmedLast,
        fullName,
        academicYear: data.academicYear || 1,
        createdAt: now,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
      });
    } catch (firestoreError) {
      console.warn('Firestore guest registration notice:', firestoreError);
      // We do not fail the user login even if offline; local record is already set!
    }

    // 4. Update shared students directory in site_stats so all supervisors immediately see new students
    try {
      const dirRef = doc(db, 'site_stats', 'students_directory');
      const dirSnap = await getDoc(dirRef);
      const existing = dirSnap.exists() ? (dirSnap.data().students || []) : [];
      const updated = [
        {
          uid: guestId,
          displayName: fullName,
          email: null,
          academicYear: yearNumber,
          currentYear: data.academicYear === 'graduate' ? 'graduate' : yearNumber,
          academicSemester: 1,
          role: data.academicYear === 'graduate' ? 'graduate' : (yearNumber === 1 ? 'freshman' : 'current'),
          roleLabelAr: data.academicYear === 'graduate' ? 'مهندس خريج' : (yearNumber === 1 ? 'طالب مستجد' : `طالب سنة ${yearNumber}`),
          coursesCount: 0,
          completedCoursesCount: 0,
          onboardingCompleted: true,
          createdAt: now,
          authProvider: 'guest'
        },
        ...existing.filter((s: any) => (s.uid || s.id) !== guestId)
      ];
      await setDoc(dirRef, {
        students: updated,
        totalCount: updated.length,
        updatedAt: now
      }, { merge: true });
    } catch (e) {
      console.warn('Update shared students directory notice:', e);
    }

    return record;
  },

  clearGuest() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  },

  async updateStoredGuest(updated: Partial<GuestVisitorRecord>): Promise<void> {
    const stored = this.getStoredGuest();
    if (!stored) return;
    const next: GuestVisitorRecord = { ...stored, ...updated };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      if (stored.id) {
        const guestDocRef = doc(db, 'guest_visitors', stored.id);
        await setDoc(guestDocRef, {
          ...next,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (e) {
      console.warn('Could not update guest visitor in Firestore:', e);
    }
  },

  async fetchRecentGuests(count: number = 100): Promise<GuestVisitorRecord[]> {
    try {
      await ensureFirebaseAuth();
      const colRef = collection(db, 'guest_visitors');
      const snap = await getDocs(colRef).catch(() => ({ forEach: () => {}, empty: true } as any));
      const list: GuestVisitorRecord[] = [];
      snap.forEach((d: any) => {
        list.push({ ...(d.data() as GuestVisitorRecord), id: d.id });
      });

      // If direct read yielded empty or was blocked by security rules for supervisor,
      // seamlessly hydrate from verified shared students directory in site_stats
      if (list.length === 0) {
        try {
          const dirSnap = await getDoc(doc(db, 'site_stats', 'students_directory'));
          if (dirSnap.exists()) {
            const dirStudents = (dirSnap.data()?.students || []) as any[];
            dirStudents.forEach((st) => {
              if (st.authProvider === 'guest' || !st.email) {
                const nameParts = (st.displayName || '').split(' ');
                list.push({
                  id: st.uid || st.id,
                  firstName: nameParts[0] || 'طالب',
                  lastName: nameParts.slice(1).join(' ') || '',
                  fullName: st.displayName || 'طالب زائر',
                  academicYear: st.academicYear || 1,
                  createdAt: st.createdAt || new Date().toISOString()
                });
              }
            });
          }
        } catch (dirErr) {
          console.warn('Fallback shared directory read for guests caught:', dirErr);
        }
      }

      return list
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, count);
    } catch (e) {
      console.warn('Could not fetch guest list:', e);
      return [];
    }
  }
};
