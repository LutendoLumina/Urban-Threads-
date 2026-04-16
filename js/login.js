import { auth } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const provider = new GoogleAuthProvider();

onAuthStateChanged(auth, (user) => {
  if (user) window.location.href = "index.html";
});

function showError(msg) {
  const el = document.getElementById("error-msg");
  el.textContent = msg;
  el.classList.add("show");
}

function hideError() {
  document.getElementById("error-msg").classList.remove("show");
}

window.switchTab = function (tab) {
  hideError();
  const isLogin = tab === "login";
  document.getElementById("login-form").classList.toggle("active", isLogin);
  document.getElementById("signup-form").classList.toggle("active", !isLogin);
  document.getElementById("form-title").textContent = isLogin
    ? "WELCOME BACK"
    : "JOIN THE CREW";
  document.getElementById("form-subtitle").textContent = isLogin
    ? "Sign in to your account to continue."
    : "Create your account — it's free.";
  document.getElementById("switch-text").innerHTML = isLogin
    ? "Don't have an account? <a onclick=\"switchTab('signup')\">Sign up for free</a>"
    : "Already have an account? <a onclick=\"switchTab('login')\">Sign in</a>";
  document.querySelectorAll(".tab-btn").forEach((btn, i) => {
    btn.classList.toggle("active", isLogin ? i === 0 : i === 1);
  });
};

window.handleLogin = async function () {
  hideError();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  if (!email || !password) return showError("Please fill in all fields.");
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "index.html";
  } catch (err) {
    showError(getFriendlyError(err.code));
  }
};

window.handleSignup = async function () {
  hideError();
  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  if (!name || !email || !password)
    return showError("Please fill in all fields.");
  if (password.length < 6)
    return showError("Password must be at least 6 characters.");
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    window.location.href = "index.html";
  } catch (err) {
    showError(getFriendlyError(err.code));
  }
};

window.handleGoogle = async function () {
  hideError();
  try {
    await signInWithPopup(auth, provider);
    window.location.href = "index.html";
  } catch (err) {
    showError(getFriendlyError(err.code));
  }
};

function getFriendlyError(code) {
  const errors = {
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/popup-closed-by-user": "Google sign-in was cancelled.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/invalid-credential": "Invalid email or password.",
  };
  return errors[code] || "Something went wrong. Please try again.";
}
