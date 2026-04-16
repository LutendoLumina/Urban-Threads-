import { db, auth } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  collection,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// ── AUTH STATE LISTENER ──
export function initAuth({ requireAuth = false } = {}) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      updateNavbar(user);
      // Start the cart counter only if we have a user
      startCartListener(user.uid);
    } else {
      updateNavbar(null);
      resetCartCounter();
      if (requireAuth) {
        window.location.href = "login.html";
      }
    }
  });
}

// ── CART COUNTER LOGIC ──
// js/auth.js snippet
export function startCartListener(uid) {
  const cartCountEl = document.getElementById("cart-count");
  if (!cartCountEl) return;

  const cartRef = collection(db, "users", uid, "cart");

  onSnapshot(cartRef, (snapshot) => {
    let totalItems = 0;
    snapshot.forEach((doc) => {
      totalItems += doc.data().quantity || 0;
    });
    cartCountEl.innerText = totalItems;
    cartCountEl.style.display = totalItems > 0 ? "flex" : "none";
  });
}

function resetCartCounter() {
  const cartCountEl = document.getElementById("cart-count");
  if (cartCountEl) {
    cartCountEl.innerText = "0";
    cartCountEl.style.display = "none";
  }
}

// ── UPDATE NAVBAR ──
function updateNavbar(user) {
  const userDisplay = document.getElementById("nav-user");
  const signOutBtn = document.getElementById("nav-signout");
  const signInBtn = document.getElementById("nav-signin");

  if (user) {
    const name = user.displayName ? user.displayName.split(" ")[0] : user.email.split("@")[0];
    if (userDisplay) userDisplay.textContent = `Hi, ${name}`;
    if (signOutBtn) signOutBtn.style.display = "inline-flex";
    if (signInBtn) signInBtn.style.display = "none";
  } else {
    if (userDisplay) userDisplay.textContent = "";
    if (signOutBtn) signOutBtn.style.display = "none";
    if (signInBtn) signInBtn.style.display = "inline-flex";
  }
}

// ── SIGN OUT ──
export async function handleSignOut() {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (err) {
    console.error("Sign out error:", err);
  }
}

// ── GET CURRENT USER ──
export function getCurrentUser() {
  return auth.currentUser;
}

// Attach to window for HTML onclick attributes
window.handleSignOut = handleSignOut;