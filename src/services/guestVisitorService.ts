import { db, collection, addDoc, doc, setDoc, getDocs, query, orderBy, limit, ensureFirebaseAuth } from '../lib/firebase';
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
      const snap = await getDocs(colRef);
      const list: GuestVisitorRecord[] = [];
      snap.forEach((d) => {
        list.push({ ...(d.data() as GuestVisitorRecord), id: d.id });
      });
      return list
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, count);
    } catch (e) {
      console.warn('Could not fetch guest list:', e);
      return [];
    }
  }
};
