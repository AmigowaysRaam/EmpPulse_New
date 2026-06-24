import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDuVauH1Z1_x4zkRfG5Mg8I6rKf4JJNu9c",
  authDomain: "yuvarajscaffoldingtrader-e2bfb.firebaseapp.com",
  projectId: "yuvarajscaffoldingtrader-e2bfb",
  storageBucket: "yuvarajscaffoldingtrader-e2bfb.firebasestorage.app",
  messagingSenderId: "382702972047",
  appId: "1:382702972047:android:09d2861bbdf99f0d7694fa"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export default app;