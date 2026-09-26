import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function testSiteStats() {
  try {
    const snap = await getDoc(doc(db, 'site_stats', 'visitors'));
    console.log('Read site_stats/visitors: SUCCESS', snap.data());
  } catch (e: any) {
    console.log('Read site_stats/visitors FAILED:', e.message);
  }

  try {
    const snap = await getDoc(doc(db, 'site_stats', 'platform_stats'));
    console.log('Read site_stats/platform_stats exists:', snap.exists(), snap.data());
  } catch (e: any) {
    console.log('Read site_stats/platform_stats FAILED:', e.message);
  }
}

testSiteStats().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
