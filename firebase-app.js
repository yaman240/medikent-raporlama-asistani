import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDVzPiLxGhAXruBvI1w17rIDuIP_ciz8wI",
  authDomain: "medikent-raporlama-asistani.firebaseapp.com",
  projectId: "medikent-raporlama-asistani",
  storageBucket: "medikent-raporlama-asistani.firebasestorage.app",
  messagingSenderId: "192985289829",
  appId: "1:192985289829:web:dc98f066290d04be1ea28c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const loginOverlay = document.getElementById("loginOverlay");
const loginStatus = document.getElementById("loginStatus");
const googleLoginBtn = document.getElementById("googleLoginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userName = document.getElementById("userName");
const syncBadge = document.getElementById("syncBadge");

window.medikentCloud = {
  enabled: false,
  currentUser: null,
  async loadActivities(){ return []; },
  async saveActivity(){},
  async deleteActivity(){},
  async uploadActivities(){ return 0; },
  async loadDepartments(){ return []; },
  async saveDepartment(){},
  async loadDoctors(){ return []; },
  async saveDoctor(){}
};

googleLoginBtn.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    console.error(err);
    loginStatus.textContent = "Giriş başarısız: " + (err.message || err);
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.medikentCloud.enabled = false;
    window.medikentCloud.currentUser = null;
    userName.textContent = "";
    logoutBtn.classList.add("hidden");
    syncBadge.textContent = "Oturum Kapalı";
    syncBadge.classList.add("offline");
    loginOverlay.classList.remove("hidden");
    loginStatus.textContent = "Devam etmek için Google hesabınızla giriş yapın.";
    return;
  }

  window.medikentCloud.enabled = true;
  window.medikentCloud.currentUser = user;

  userName.textContent = user.displayName || user.email || "";
  logoutBtn.classList.remove("hidden");
  syncBadge.textContent = "Firebase Aktif";
  syncBadge.classList.remove("offline");
  loginOverlay.classList.add("hidden");

  window.medikentCloud.loadActivities = async () => {
    const snap = await getDocs(collection(db, "activities"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  };

  window.medikentCloud.saveActivity = async (activity) => {
    const payload = {
      ...activity,
      updatedByUid: user.uid,
      updatedByEmail: user.email || "",
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, "activities", activity.id), payload, { merge: true });
  };

  window.medikentCloud.deleteActivity = async (id) => {
    await deleteDoc(doc(db, "activities", id));
  };

  window.medikentCloud.uploadActivities = async (rows) => {
    let count = 0;
    for (const activity of rows) {
      await window.medikentCloud.saveActivity(activity);
      count++;
    }
    return count;
  };

  window.medikentCloud.loadDepartments = async () => {
    const snap = await getDocs(collection(db, "departments"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  };

  window.medikentCloud.saveDepartment = async (department) => {
    await setDoc(doc(db, "departments", department.id), {
      ...department,
      updatedAt: new Date().toISOString(),
      updatedByUid: user.uid
    }, { merge: true });
  };

  window.medikentCloud.loadDoctors = async () => {
    const snap = await getDocs(collection(db, "doctors"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  };

  window.medikentCloud.saveDoctor = async (doctor) => {
    await setDoc(doc(db, "doctors", doctor.id), {
      ...doctor,
      updatedAt: new Date().toISOString(),
      updatedByUid: user.uid
    }, { merge: true });
  };

  window.dispatchEvent(new CustomEvent("medikent-cloud-ready"));
});
