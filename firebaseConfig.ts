import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAu1mLzhzY4c3Dkq6_C_WO1Qu4MYg4heo4",
    authDomain: "ci-skincare-digital-platform.firebaseapp.com",
    projectId: "ci-skincare-digital-platform",
    storageBucket: "ci-skincare-digital-platform.firebasestorage.app",
    messagingSenderId: "548529405621",
    appId: "1:548529405621:web:e75bb0f3e76d080826c8fc"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
