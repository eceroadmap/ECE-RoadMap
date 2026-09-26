import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, query, where } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function testRules() {
  console.log('Testing Firestore read/write capabilities on DB:', firebaseConfig.firestoreDatabaseId);

  // 1. Can we read system_config?
  try {
    const s = await getDoc(doc(db, 'system_config', 'moderators_list'));
    console.log('Read system_config/moderators_list: SUCCESS, data:', s.data());
  } catch (e: any) {
    console.log('Read system_config/moderators_list: FAILED:', e.message);
  }

  // 2. Can we read site_stats/visitors?
  try {
    const s = await getDoc(doc(db, 'site_stats', 'visitors'));
    console.log('Read site_stats/visitors: SUCCESS, data:', s.data());
  } catch (e: any) {
    console.log('Read site_stats/visitors: FAILED:', e.message);
  }

  // 3. Can we read communityTips?
  try {
    const s = await getDocs(collection(db, 'communityTips'));
    console.log('Read communityTips: SUCCESS, count:', s.size);
  } catch (e: any) {
    console.log('Read communityTips: FAILED:', e.message);
  }

  // 4. Can we read courses?
  try {
    const s = await getDocs(collection(db, 'courses'));
    console.log('Read courses: SUCCESS, count:', s.size);
  } catch (e: any) {
    console.log('Read courses: FAILED:', e.message);
  }

  // 5. Can we read software?
  try {
    const s = await getDocs(collection(db, 'software'));
    console.log('Read software: SUCCESS, count:', s.size);
  } catch (e: any) {
    console.log('Read software: FAILED:', e.message);
  }

  // 6. Can we read students?
  try {
    const s = await getDocs(collection(db, 'students'));
    console.log('Read students: SUCCESS, count:', s.size);
  } catch (e: any) {
    console.log('Read students: FAILED:', e.message);
  }

  // 7. Can we read guest_visitors?
  try {
    const s = await getDocs(collection(db, 'guest_visitors'));
    console.log('Read guest_visitors: SUCCESS, count:', s.size);
  } catch (e: any) {
    console.log('Read guest_visitors: FAILED:', e.message);
  }

  // 8. Can we read admins?
  try {
    const s = await getDocs(collection(db, 'admins'));
    console.log('Read admins: SUCCESS, count:', s.size);
  } catch (e: any) {
    console.log('Read admins: FAILED:', e.message);
  }

  // 9. Can we read moderators?
  try {
    const s = await getDocs(collection(db, 'moderators'));
    console.log('Read moderators: SUCCESS, count:', s.size);
  } catch (e: any) {
    console.log('Read moderators: FAILED:', e.message);
  }
}

testRules().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
