import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function inspect() {
  console.log('Target Database:', firebaseConfig.firestoreDatabaseId);
  const collections = [
    'students',
    'guest_visitors',
    'communityTips',
    'student_auth_index',
    'moderators',
    'admins',
    'courses',
    'software',
    'site_stats',
    'system_config'
  ];

  for (const col of collections) {
    try {
      const snap = await getDocs(collection(db, col));
      console.log(`Collection [${col}]: ${snap.size} documents`);
      if (snap.size > 0 && snap.size <= 5) {
        snap.forEach(d => console.log(`  - Doc ID: ${d.id}, Data:`, JSON.stringify(d.data()).substring(0, 150)));
      } else if (snap.size > 5) {
        console.log(`  - Sample Doc IDs:`, snap.docs.slice(0, 5).map(d => d.id));
      }
    } catch (err: any) {
      console.log(`Collection [${col}] ERROR:`, err.message);
    }
  }

  // Check specific docs
  try {
    const siteStatsDoc = await getDoc(doc(db, 'site_stats', 'visitors'));
    console.log('site_stats/visitors exists:', siteStatsDoc.exists(), siteStatsDoc.data());
  } catch (e: any) {
    console.log('site_stats/visitors error:', e.message);
  }

  try {
    const sysModDoc = await getDoc(doc(db, 'system_config', 'moderators_list'));
    console.log('system_config/moderators_list exists:', sysModDoc.exists(), sysModDoc.data());
  } catch (e: any) {
    console.log('system_config/moderators_list error:', e.message);
  }
}

inspect().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
