import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function testWrite() {
  try {
    await setDoc(doc(db, 'system_config', 'test_write'), {
      updatedAt: new Date().toISOString(),
      test: true
    }, { merge: true });
    console.log('Write to system_config: SUCCESS');
    const snap = await getDoc(doc(db, 'system_config', 'test_write'));
    console.log('Read back: SUCCESS', snap.data());
  } catch (e: any) {
    console.log('Write to system_config FAILED:', e.message);
  }
}

testWrite().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
