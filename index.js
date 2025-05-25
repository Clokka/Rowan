import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import ClokkaWebsite from './ClokkaWebsite';
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCZ3j2xm2-DYFxZ7KyMw-tCUllYJtc3uBU",
  authDomain: "clokka.firebaseapp.com",
  projectId: "clokka",
  storageBucket: "clokka.firebasestorage.app",
  messagingSenderId: "861110207927",
  appId: "1:861110207927:web:6b1e0f2e18859d67ab5432",
  measurementId: "G-M8KEW5QG1X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Optional: Make auth accessible globally (for quick access in dev)
window.signInWithGoogle = () => {
  signInWithPopup(auth, provider)
    .then(result => {
      const user = result.user;
      console.log('User signed in:', user);
      alert(`Welcome, ${user.displayName}`);
    })
    .catch(error => {
      console.error(error);
      alert('Login failed: ' + error.message);
    });
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ClokkaWebsite />
  </React.StrictMode>
);
