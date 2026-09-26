import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function testSiteStatsWrite() {
  try {
    await setDoc(doc(db, 'site_stats', 'platform_stats_test'), {
      test: true,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log('Write to site_stats: SUCCESS!');
    const snap = await getDoc(doc(db, 'site_stats', 'platform_stats_test'));
    console.log('Read back: SUCCESS!', snap.data());
  } catch (e: any) {
    console.log('Write to site_stats FAILED:', e.message);
  }
}

testSiteStatsWrite().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
