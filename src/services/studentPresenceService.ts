import { 
  db, 
  auth, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot 
} from '../lib/firebase';
import { guestVisitorService } from './guestVisitorService';

const PRESENCE_HEARTBEAT_INTERVAL_MS = 60 * 1000; // 60 seconds
const ONLINE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

class StudentPresenceService {
  private heartbeatTimer: any = null;
  private lastSentTime = 0;
  private isListening = false;

  public startHeartbeat() {
    if (this.isListening || typeof window === 'undefined') return;
    this.isListening = true;

    // Send initial ping on startup
    this.sendPing();

    // Heartbeat every 60s
    this.heartbeatTimer = setInterval(() => {
      this.sendPing();
    }, PRESENCE_HEARTBEAT_INTERVAL_MS);

    // Also ping on user interaction (throttled to at most once per 30s)
    const handleUserActivity = () => {
      const now = Date.now();
      if (now - this.lastSentTime > 30000) {
        this.sendPing();
      }
    };

    window.addEventListener('click', handleUserActivity, { passive: true });
    window.addEventListener('keydown', handleUserActivity, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.sendPing();
      }
    });
  }

  public async sendPing() {
    const user = auth.currentUser;
    const guest = guestVisitorService.getStoredGuest();
    const now = new Date().toISOString();
    this.lastSentTime = Date.now();

    const targetUid = user?.uid || guest?.id;
    if (!targetUid) return;

    try {
      // 1. Update in student document if signed in
      if (user?.uid) {
        setDoc(doc(db, 'students', user.uid), {
          lastActiveAt: now,
          updatedAt: now
        }, { merge: true }).catch(() => {});
      }

      // 2. Update in guest visitor document if guest
      if (guest?.id) {
        setDoc(doc(db, 'guest_visitors', guest.id), {
          lastActiveAt: now
        }, { merge: true }).catch(() => {});
      }

      // 3. Update dedicated presence record
      setDoc(doc(db, 'user_presence', targetUid), {
        uid: targetUid,
        displayName: user?.displayName || guest?.fullName || 'طالب',
        isGuest: !user?.uid,
        lastActiveAt: now,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
      }, { merge: true }).catch(() => {});
    } catch {}
  }

  /**
   * Calculates whether a timestamp is considered "Online Now" (< 5 mins) and formats relative Arabic time
   */
  public getPresenceStatus(
    lastActiveAt?: string | null,
    lastSyncedAt?: string | null,
    updatedAt?: string | null,
    createdAt?: string | null
  ): {
    isOnline: boolean;
    statusLabelAr: string;
    relativeTimeAr: string;
    exactDateFormatted: string;
  } {
    const targetTimestamp = lastActiveAt || lastSyncedAt || updatedAt || createdAt;

    if (!targetTimestamp) {
      return {
        isOnline: false,
        statusLabelAr: 'غير متصل',
        relativeTimeAr: 'غير معروف',
        exactDateFormatted: 'غير مسجل'
      };
    }

    try {
      const timeMs = new Date(targetTimestamp).getTime();
      const nowMs = Date.now();
      const diffMs = nowMs - timeMs;

      // Exact formatted date (e.g. 26 أيلول 2026 - 15:30)
      const exactDate = new Date(timeMs).toLocaleString('ar-SY', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // If active in last 5 minutes -> Online Now
      if (diffMs < ONLINE_THRESHOLD_MS && diffMs >= -60000) {
        return {
          isOnline: true,
          statusLabelAr: 'نشط الآن',
          relativeTimeAr: 'الآن',
          exactDateFormatted: exactDate
        };
      }

      // Relative Arabic time calculation
      const diffMinutes = Math.floor(diffMs / (60 * 1000));
      const diffHours = Math.floor(diffMs / (3600 * 1000));
      const diffDays = Math.floor(diffMs / (24 * 3600 * 1000));

      let relativeTime = '';
      if (diffMinutes < 1) {
        relativeTime = 'منذ لحظات';
      } else if (diffMinutes === 1) {
        relativeTime = 'منذ دقيقة واحدة';
      } else if (diffMinutes === 2) {
        relativeTime = 'منذ دقيقتين';
      } else if (diffMinutes <= 10) {
        relativeTime = `منذ ${diffMinutes} دقائق`;
      } else if (diffMinutes < 60) {
        relativeTime = `منذ ${diffMinutes} دقيقة`;
      } else if (diffHours === 1) {
        relativeTime = 'منذ ساعة واحدة';
      } else if (diffHours === 2) {
        relativeTime = 'منذ ساعتين';
      } else if (diffHours <= 10) {
        relativeTime = `منذ ${diffHours} ساعات`;
      } else if (diffHours < 24) {
        relativeTime = `منذ ${diffHours} ساعة`;
      } else if (diffDays === 1) {
        relativeTime = 'منذ يوم أمس';
      } else if (diffDays === 2) {
        relativeTime = 'منذ يومين';
      } else if (diffDays <= 10) {
        relativeTime = `منذ ${diffDays} أيام`;
      } else {
        relativeTime = `منذ ${diffDays} يوماً`;
      }

      return {
        isOnline: false,
        statusLabelAr: `آخر ظهور: ${relativeTime}`,
        relativeTimeAr: relativeTime,
        exactDateFormatted: exactDate
      };
    } catch {
      return {
        isOnline: false,
        statusLabelAr: 'غير متصل',
        relativeTimeAr: 'غير معروف',
        exactDateFormatted: 'غير مسجل'
      };
    }
  }
}

export const studentPresenceService = new StudentPresenceService();
