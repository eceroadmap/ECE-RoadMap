import { 
  db, 
  doc, 
  onSnapshot, 
  runTransaction, 
  serverTimestamp 
} from '../lib/firebase';

const ECE_SESSION_VISITOR_KEY = 'ece_session_visitor_number';
const ECE_SESSION_UUID_KEY = 'ece_session_visitor_uuid';

export interface VisitorInfo {
  visitorNumber: number | null;
  formattedNumber: string;
  isFirstVisit: boolean;
  totalCount: number;
  isLoading: boolean;
}

class VisitorCounterService {
  private cachedInfo: VisitorInfo = {
    visitorNumber: null,
    formattedNumber: '...',
    isFirstVisit: false,
    totalCount: 1,
    isLoading: true
  };
  private listeners: Array<(info: VisitorInfo) => void> = [];
  private isProcessingIncrement = false;

  constructor() {
    this.initVisitor();
  }

  private async initVisitor() {
    if (typeof window === 'undefined') {
      this.cachedInfo = {
        visitorNumber: 1,
        formattedNumber: '#1',
        isFirstVisit: false,
        totalCount: 1,
        isLoading: false
      };
      return;
    }

    try {
      // Clean up legacy persistent localStorage key if present
      localStorage.removeItem('ece_assigned_visitor_number');

      // Check current session storage
      const sessionAssignedNumber = sessionStorage.getItem(ECE_SESSION_VISITOR_KEY);

      if (sessionAssignedNumber) {
        // This session was already counted! Do not re-increment on page refresh or navigation
        const parsed = parseInt(sessionAssignedNumber, 10);
        const validNum = isNaN(parsed) || parsed < 1 ? 1 : parsed;

        this.cachedInfo = {
          visitorNumber: validNum,
          formattedNumber: `#${validNum.toLocaleString('en-US')}`,
          isFirstVisit: false,
          totalCount: validNum,
          isLoading: false
        };
        this.notifyListeners();

        // Continue listening for any global visitor updates
        this.listenToGlobalStats();
        return;
      }

      // New session opened! (e.g., user opened browser, or closed session and returned)
      const sessionUuid = sessionStorage.getItem(ECE_SESSION_UUID_KEY) || 
        (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sess-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
      sessionStorage.setItem(ECE_SESSION_UUID_KEY, sessionUuid);

      // Increment visitor counter in Firestore for this new session
      await this.registerNewSessionVisit();
    } catch (e) {
      console.warn('Visitor counter initialization error:', e);
      if (!this.cachedInfo.visitorNumber) {
        this.cachedInfo = {
          visitorNumber: 1,
          formattedNumber: '#1',
          isFirstVisit: true,
          totalCount: 1,
          isLoading: false
        };
        this.notifyListeners();
      }
    }
  }

  private async registerNewSessionVisit(): Promise<void> {
    if (this.isProcessingIncrement) return;
    this.isProcessingIncrement = true;

    try {
      const statsDocRef = doc(db, 'site_stats', 'visitors');

      const assignedNumber = await runTransaction(db, async (transaction) => {
        const statsDoc = await transaction.get(statsDocRef);

        if (!statsDoc.exists()) {
          // Starting from 1 for the very first visit
          transaction.set(statsDocRef, {
            totalVisits: 1,
            createdAt: serverTimestamp(),
            lastVisitedAt: serverTimestamp()
          });
          return 1;
        } else {
          const data = statsDoc.data();
          const currentTotal = typeof data.totalVisits === 'number' && data.totalVisits >= 1 ? data.totalVisits : 0;
          const newNumber = currentTotal + 1;
          transaction.update(statsDocRef, {
            totalVisits: newNumber,
            lastVisitedAt: serverTimestamp()
          });
          return newNumber;
        }
      });

      // Save into sessionStorage so this session keeps this number without incrementing on refresh
      sessionStorage.setItem(ECE_SESSION_VISITOR_KEY, assignedNumber.toString());

      this.cachedInfo = {
        visitorNumber: assignedNumber,
        formattedNumber: `#${assignedNumber.toLocaleString('en-US')}`,
        isFirstVisit: true,
        totalCount: assignedNumber,
        isLoading: false
      };
      this.notifyListeners();

      // Listen for future global stats
      this.listenToGlobalStats();
    } catch (error) {
      console.warn('Could not register visitor via Firestore transaction, fallback to session count:', error);
      const fallbackNum = 1;
      sessionStorage.setItem(ECE_SESSION_VISITOR_KEY, fallbackNum.toString());
      this.cachedInfo = {
        visitorNumber: fallbackNum,
        formattedNumber: `#${fallbackNum}`,
        isFirstVisit: true,
        totalCount: fallbackNum,
        isLoading: false
      };
      this.notifyListeners();
    } finally {
      this.isProcessingIncrement = false;
    }
  }

  private listenToGlobalStats() {
    try {
      const statsDocRef = doc(db, 'site_stats', 'visitors');
      onSnapshot(statsDocRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const remoteTotal = typeof data.totalVisits === 'number' ? data.totalVisits : this.cachedInfo.totalCount;
          if (remoteTotal !== this.cachedInfo.totalCount) {
            this.cachedInfo = {
              ...this.cachedInfo,
              totalCount: remoteTotal
            };
            this.notifyListeners();
          }
        }
      }, () => {
        // Silently ignore snapshot errors when offline
      });
    } catch {
      // Ignore
    }
  }

  public getVisitorInfo(): VisitorInfo {
    return this.cachedInfo;
  }

  public subscribe(listener: (info: VisitorInfo) => void): () => void {
    this.listeners.push(listener);
    listener(this.cachedInfo);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((l) => l(this.cachedInfo));
  }
}

export const visitorCounterService = new VisitorCounterService();
