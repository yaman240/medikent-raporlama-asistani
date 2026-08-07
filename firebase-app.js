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

/*
  FIREBASE AYARI:
  Aşağıdaki değerleri Firebase Console > Project settings > Your apps > Web app
  bölümünden alın ve buraya yapıştırın.
*/
const firebaseConfig = {
  apiKey: "AIzaSyDVzPiLxGhAXruBvI1w17rIDuIP_ciz8wI",
  authDomain: "medikent-raporlama-asistani.firebaseapp.com",
  projectId: "medikent-raporlama-asistani",
  storageBucket: "medikent-raporlama-asistani.firebasestorage.app",
  messagingSenderId: "192985289829",
  appId: "1:192985289829:web:dc98f066290d04be1ea28c"
};

const configured = !Object.values(firebaseConfig).some(v => String(v).startsWith("BURAYA_"));

const loginOverlay = document.getElementById("loginOverlay");
const loginStatus = document.getElementById("loginStatus");
const googleLoginBtn = document.getElementById("googleLoginBtn");
const localModeBtn = document.getElementById("localModeBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userName = document.getElementById("userName");
const syncBadge = document.getElementById("syncBadge");

window.medikentCloud = {
  enabled: false,
  currentUser: null,
  async loadActivities(){ return null; },
  async saveActivity(){},
  async deleteActivity(){},
  async uploadActivities(){ return 0; }
};

function enterLocalMode(){
  loginOverlay.classList.add("hidden");
  syncBadge.textContent = "Yerel Mod";
  syncBadge.classList.add("offline");
  window.dispatchEvent(new CustomEvent("medikent-cloud-ready"));
}

if(!configured){
  loginStatus.innerHTML = "<b>Firebase henüz yapılandırılmadı.</b><br>Uygulama şimdilik yerel modda çalışabilir.";
  localModeBtn.classList.remove("hidden");
  localModeBtn.onclick = enterLocalMode;
}else{
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const provider = new GoogleAuthProvider();

  googleLoginBtn.classList.remove("hidden");
  loginStatus.textContent = "Devam etmek için Google hesabınızla giriş yapın.";

  googleLoginBtn.onclick = async ()=>{
    try{
      await signInWithPopup(auth, provider);
    }catch(err){
      alert("Giriş başarısız: " + err.message);
    }
  };

  logoutBtn.onclick = ()=>signOut(auth);

  onAuthStateChanged(auth, async user=>{
    if(!user){
      window.medikentCloud.enabled = false;
      window.medikentCloud.currentUser = null;
      userName.textContent = "";
      logoutBtn.classList.add("hidden");
      loginOverlay.classList.remove("hidden");
      return;
    }

    window.medikentCloud.currentUser = user;
    window.medikentCloud.enabled = true;
    userName.textContent = user.displayName || user.email || "";
    logoutBtn.classList.remove("hidden");
    syncBadge.textContent = "Firebase Aktif";
    syncBadge.classList.remove("offline");
    loginOverlay.classList.add("hidden");

    window.medikentCloud.loadActivities = async ()=>{
      const snap = await getDocs(collection(db, "activities"));
      return snap.docs.map(d=>({id:d.id,...d.data()}));
    };

    window.medikentCloud.saveActivity = async activity=>{
      const payload = {
        ...activity,
        updatedByUid: user.uid,
        updatedByEmail: user.email || "",
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, "activities", activity.id), payload, {merge:true});
    };

    window.medikentCloud.deleteActivity = async id=>{
      await deleteDoc(doc(db, "activities", id));
    };

    window.medikentCloud.uploadActivities = async rows=>{
      let count = 0;
      for(const activity of rows){
        await window.medikentCloud.saveActivity(activity);
        count++;
      }
      return count;
    };

    window.dispatchEvent(new CustomEvent("medikent-cloud-ready"));
  });
}
