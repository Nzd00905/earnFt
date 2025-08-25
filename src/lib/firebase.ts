// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyByUVKzu1tmH3UaU5QmV925Mspxdt1jp8Y",
  authDomain: "peppy-sensor-458718-q1.firebaseapp.com",
  projectId: "peppy-sensor-458718-q1",
  storageBucket: "peppy-sensor-458718-q1.appspot.com",
  messagingSenderId: "965440283845",
  appId: "1:965440283845:web:e3dc5e394d81f907003cac",
  measurementId: "G-R05HVFK6T3"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);


export { app, db, auth };
