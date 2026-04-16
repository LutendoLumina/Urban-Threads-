import { auth } from './firebase-config.js';
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// ── AUTH STATE LISTENER ──
// Call this on every page. Pass in:
//   requireAuth: true  → redirect to login if not signed in (cart page)
//   requireAuth: false → just update the navbar (index, shop)
export function initAuth({ requireAuth = false } = {}) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      updateNavbar(user);
    } else {
      updateNavbar(null);
      if (requireAuth) {
        window.location.href = 'login.html';
      }
    }
  });
}

// ── UPDATE NAVBAR ──
function updateNavbar(user) {
  const userDisplay = document.getElementById('nav-user');
  const signOutBtn  = document.getElementById('nav-signout');
  const signInBtn   = document.getElementById('nav-signin');

  if (user) {
    // Show name (from Google or signup) or fall back to email
    const name = user.displayName
      ? user.displayName.split(' ')[0]   // first name only
      : user.email;

    if (userDisplay) userDisplay.textContent = `Hi, ${name}`;
    if (signOutBtn)  signOutBtn.style.display = 'inline-flex';
    if (signInBtn)   signInBtn.style.display  = 'none';
  } else {
    if (userDisplay) userDisplay.textContent  = '';
    if (signOutBtn)  signOutBtn.style.display = 'none';
    if (signInBtn)   signInBtn.style.display  = 'inline-flex';
  }
}

// ── SIGN OUT ──
export async function handleSignOut() {
  try {
    await signOut(auth);
    window.location.href = 'index.html';
  } catch (err) {
    console.error('Sign out error:', err);
  }
}

// ── GET CURRENT USER ──
// Use this in shop.js and cart.js when you need the uid
export function getCurrentUser() {
  return auth.currentUser;
}

window.handleSignOut = handleSignOut;