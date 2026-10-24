import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB3gmwLVd6ASfCmoybXLW7WFGafZFMSkdI",
  authDomain: "hidroponik-skripsi-b82d7.firebaseapp.com",
  databaseURL: "https://hidroponik-skripsi-b82d7-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "hidroponik-skripsi-b82d7",
  storageBucket: "hidroponik-skripsi-b82d7.firebasestorage.app",
  messagingSenderId: "502838614791",
  appId: "1:502838614791:web:7d110285f8baf470fe83a2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const paths = {
  "nutrisi-a": "Pompa/Nutrisi A",
  "nutrisi-b": "Pompa/Nutrisi B",
  "ph-up": "Pompa/pH-Up",
  "ph-down": "Pompa/pH-Down"
};

export async function loginWithFirebase(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}
export async function logoutFirebase() { await signOut(auth); }
export function watchPumps(callback, onError) {
  return onValue(ref(db, "Pompa"), snapshot => callback(snapshot.val() || {}), onError);
}
export async function setPump(name, isOn) {
  const path = paths[name];
  if (!path) throw new Error("Nama pompa tidak dikenal: " + name);
  if (!auth.currentUser) throw new Error("Belum login ke Firebase Authentication.");
  // Jangan izinkan pH Up dan pH Down ON bersamaan.
  if (isOn && (name === "ph-up" || name === "ph-down")) {
    const other = name === "ph-up" ? "Pompa/pH-Down" : "Pompa/pH-Up";
    const otherSnap = await new Promise((resolve, reject) => {
      const unsub = onValue(ref(db, other), s => { unsub(); resolve(s); }, e => { unsub(); reject(e); }, { onlyOnce: true });
    });
    if (otherSnap.val() === true) throw new Error("Matikan pompa pH yang berlawanan terlebih dahulu.");
  }
  await set(ref(db, path), Boolean(isOn));
}
export function watchAuth(callback) { return onAuthStateChanged(auth, callback); }
window.sgFirebase = { loginWithFirebase, logoutFirebase, watchPumps, setPump, watchAuth };
