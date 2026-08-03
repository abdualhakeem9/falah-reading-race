// ═══════════════════════════════════════════════════════════
//  firebase.js — Realtime Database
// ═══════════════════════════════════════════════════════════
import { initializeApp } from 'firebase/app';
import {
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged,
} from 'firebase/auth';
import {
  getDatabase, ref, get, set, update, remove, push,
  onValue, query, orderByChild, equalTo, serverTimestamp,
} from 'firebase/database';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
databaseURL:       'https://falah-reading-race-default-rtdb.firebaseio.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase().trim();

// ── المصادقة ─────────────────────────────────────────────────
export const fbLogin    = (email, pw) => signInWithEmailAndPassword(auth, email, pw);
export const fbRegister = (email, pw) => createUserWithEmailAndPassword(auth, email, pw);
export const fbLogout   = ()          => signOut(auth);
export const onAuthChange = (cb)      => onAuthStateChanged(auth, cb);

// ── بيانات المستخدم ─────────────────────────────────────────
export const getUser = async (uid) => {
  const snap = await get(ref(db, 'users/' + uid));
  return { exists: () => snap.exists(), data: () => snap.val() };
};
export const saveUser = (uid, data) => update(ref(db, 'users/' + uid), data);

// ── إضافة قراءة ─────────────────────────────────────────────
export const addReading = (data) =>
  push(ref(db, 'readings'), { ...data, status: 'pending', createdAt: serverTimestamp() });

// ── موافقة على قراءة ────────────────────────────────────────
export const approveReading = async (readingId, studentUid, km) => {
  await update(ref(db, 'readings/' + readingId), { status: 'approved' });
  const snap = await get(ref(db, 'users/' + studentUid + '/km'));
  await set(ref(db, 'users/' + studentUid + '/km'), (snap.val() || 0) + km);
};

export const rejectReading = (readingId) =>
  update(ref(db, 'readings/' + readingId), { status: 'rejected' });

// ── منح كيلومترات ───────────────────────────────────────────
export const awardKm = async (uid, km) => {
  const snap = await get(ref(db, 'users/' + uid + '/km'));
  await set(ref(db, 'users/' + uid + '/km'), (snap.val() || 0) + km);
};

// ── أجمل فائدة ──────────────────────────────────────────────
export const setTopBenefit   = (data) => set(ref(db, 'settings/topBenefit'), data);
export const clearTopBenefit = ()     => remove(ref(db, 'settings/topBenefit'));

// ══════════════════════════════════════════════════════════════
//  مستمعون حي
// ══════════════════════════════════════════════════════════════
const toArray = (val) =>
  val ? Object.entries(val).map(([id, v]) => ({ id, ...v })) : [];

export const listenStudents = (cb) =>
  onValue(ref(db, 'users'), snap => {
    cb(toArray(snap.val())
      .filter(u => u.role === 'student' && u.approved === true)
      .sort((a, b) => (b.km || 0) - (a.km || 0)));
  });

export const listenPendingReadings = (cb) =>
  onValue(ref(db, 'readings'), snap => {
    cb(toArray(snap.val())
      .filter(r => r.status === 'pending')
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
  });

export const listenApprovedReadings = (cb) =>
  onValue(ref(db, 'readings'), snap => {
    cb(toArray(snap.val())
      .filter(r => r.status === 'approved')
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
  });

export const listenTopBenefit = (cb) =>
  onValue(ref(db, 'settings/topBenefit'), snap => cb(snap.exists() ? snap.val() : null));
