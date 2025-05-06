
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDoH_EiX_xZsgftK09sEqOWMljfLCMzZ28",
  authDomain: "skillbarter-39a67.firebaseapp.com",
  projectId: "skillbarter-39a67",
  storageBucket: "skillbarter-39a67.firebasestorage.app",
  messagingSenderId: "57001719673",
  appId: "1:57001719673:web:06c73dd5db0a431f2021a8",
  measurementId: "G-L6GWKQS89C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };
