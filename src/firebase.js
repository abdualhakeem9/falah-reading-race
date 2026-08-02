// ═══════════════════════════════════════════════════════════
//  firebase.js — كل منطق Firebase في مكان واحد
// ═══════════════════════════════════════════════════════════
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  initializeFirestore,
  collection, doc,
  getDoc, setDoc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, where,
  serverTimestamp, increment,
} from 'firebase/firestore';

// ── إعداد Firebase (يُقرأ من .env) ─────────────────────────
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  useFetchStreams: false,
});

export const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase().trim();

// ── المصادقة ─────────────────────────────────────────────────
export const fbLogin    = (email, pw) => signInWithEmailAndPassword(auth, email, pw);
export const fbRegister = (email, pw) => createUserWithEmailAndPassword(auth, email, pw);
export const fbLogout   = ()          => signOut(auth);
export const onAuthChange = (cb)      => onAuthStateChanged(auth, cb);

// ── قراءة وكتابة بيانات المستخدم ────────────────────────────
export const getUser = (uid)         => getDoc(doc(db, 'users', uid));
export const saveUser = (uid, data)  => setDoc(doc(db, 'users', uid), data, { merge: true });

// ── إضافة قراءة معلقة ───────────────────────────────────────
export const addReading = (data) =>
  addDoc(collection(db, 'readings'), {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp(),
  });

// ── موافقة المشرف على قراءة ─────────────────────────────────
export const approveReading = async (readingId, studentUid, km) => {
  await updateDoc(doc(db, 'readings', readingId), { status: 'approved' });
  await updateDoc(doc(db, 'users', studentUid),   { km: increment(km) });
};

// ── رفض قراءة ───────────────────────────────────────────────
export const rejectReading = (readingId) =>
  updateDoc(doc(db, 'readings', readingId), { status: 'rejected' });

// ── موافقة على تسجيل طالب ───────────────────────────────────
export const approveRegistration = async (pendingId, studentUid) => {
  await updateDoc(doc(db, 'users', studentUid), { approved: true });
  await deleteDoc(doc(db, 'pendingRegistrations', pendingId));
};

// ── رفض تسجيل ───────────────────────────────────────────────
export const rejectRegistration = async (pendingId, studentUid) => {
  await updateDoc(doc(db, 'users', studentUid), { approved: false, rejected: true });
  await deleteDoc(doc(db, 'pendingRegistrations', pendingId));
};

// ── منح كيلومترات مكافأة ────────────────────────────────────
export const awardKm = (uid, km) =>
  updateDoc(doc(db, 'users', uid), { km: increment(km) });

// ── إضافة طلب تسجيل معلق (مع uid لربطه بحساب Auth) ─────────
export const addPendingReg = (uid, data) =>
  addDoc(collection(db, 'pendingRegistrations'), {
    uid,
    ...data,
    createdAt: serverTimestamp(),
  });

// ── تعيين أجمل فائدة اليوم ──────────────────────────────────
export const setTopBenefit   = (data) => setDoc(doc(db, 'settings', 'topBenefit'), data);
export const clearTopBenefit = ()     => deleteDoc(doc(db, 'settings', 'topBenefit'));

// ══════════════════════════════════════════════════════════════
//  مستمعون حي (Real-time listeners) — يُحدَّثون تلقائياً
// ══════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════
//  مستمعون حي — بدون compound indexes (فلترة وترتيب في الكود)
// ══════════════════════════════════════════════════════════════

// الطلاب: query بسيطة (حقل واحد فقط) + فلترة وترتيب في الكود
export const listenStudents = (cb) => {
  const q = query(
    collection(db, 'users'),
    where('approved', '==', true)   // حقل واحد → لا يحتاج composite index
  );
  return onSnapshot(q, snap => {
    const students = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(u => u.role === 'student')     // فلترة في الكود
      .sort((a, b) => (b.km || 0) - (a.km || 0)); // ترتيب في الكود
    cb(students);
  });
};

// القراءات المعلقة: حقل واحد + ترتيب في الكود
export const listenPendingReadings = (cb) => {
  const q = query(
    collection(db, 'readings'),
    where('status', '==', 'pending')
  );
  return onSnapshot(q, snap => {
    const readings = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    cb(readings);
  });
};

// القراءات المعتمدة (الفوائد): حقل واحد + ترتيب في الكود
export const listenApprovedReadings = (cb) => {
  const q = query(
    collection(db, 'readings'),
    where('status', '==', 'approved')
  );
  return onSnapshot(q, snap => {
    const readings = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    cb(readings);
  });
};

// طلبات التسجيل: collection كاملة + ترتيب في الكود
export const listenPendingRegs = (cb) =>
  onSnapshot(collection(db, 'pendingRegistrations'), snap => {
    const regs = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    cb(regs);
  });

// أجمل فائدة اليوم
export const listenTopBenefit = (cb) =>
  onSnapshot(doc(db, 'settings', 'topBenefit'), snap =>
    cb(snap.exists() ? snap.data() : null)
  );
