import { db, auth } from "./firebase-config.js";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  increment,
  getDoc,
  getDocs,
  addDoc,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { initAuth } from "./auth.js";

// Initialize auth first
initAuth({ requireAuth: true });

const cartDisplay = document.getElementById("cart-display");
const grandTotalEl = document.getElementById("grand-total");
const subtotalEl = document.getElementById("subtotal");

onAuthStateChanged(auth, (user) => {
  if (user) {
    const cartRef = collection(db, "users", user.uid, "cart");

    onSnapshot(cartRef, (snapshot) => {
      renderCart(snapshot);
    });
  } else {
    window.location.href = "login.html";
  }
});

//  render the cart
function renderCart(snapshot) {
  cartDisplay.innerHTML = "";
  let total = 0;

  // if cart is empty
  if (snapshot.empty) {
    cartDisplay.innerHTML =
      '<p class="empty-msg">Your bag is currently empty.</p>';
    updateTotals(0);
    return;
  }

  snapshot.forEach((doc) => {
    const item = doc.data();
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const itemRow = document.createElement("div");
    itemRow.className = "cart-item";

    itemRow.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-info">
                <h3>${item.name}</h3>
                <p>R${item.price.toFixed(2)}</p>
            </div>
            <div class="item-quantity-controls">
                <button class="qty-btn" onclick="updateQty('${doc.id}', -1)">−</button>
                <span class="qty-value">${item.quantity}</span>
                <button class="qty-btn" onclick="updateQty('${doc.id}', 1)">+</button>
            </div>
            <div class="item-subtotal">
                R${itemTotal.toFixed(2)}
            </div>
        `;
    cartDisplay.appendChild(itemRow);
  });

  updateTotals(total);
}

//  Update total
function updateTotals(total) {
  const formattedTotal = `R${total.toFixed(2)}`;
  if (subtotalEl) subtotalEl.innerText = formattedTotal;
  if (grandTotalEl) grandTotalEl.innerText = formattedTotal;
}

// Update quantity
window.updateQty = async (id, change) => {
  const user = auth.currentUser;
  if (!user) return;

  const itemRef = doc(db, "users", user.uid, "cart", id);

  try {
    const docSnap = await getDoc(itemRef);
    const currentQty = docSnap.data().quantity;

    if (currentQty <= 1 && change === -1) {
      if (confirm("Remove this item from your bag?")) {
        await deleteDoc(itemRef);
      }
      return;
    }

    await updateDoc(itemRef, {
      quantity: increment(change),
    });
  } catch (error) {
    console.error("Error updating quantity:", error);
  }
};

// Remove item
window.removeItem = async (id) => {
  const user = auth.currentUser;
  await deleteDoc(doc(db, "users", user.uid, "cart", id));
};

// Handle checkout
window.handleCheckout = () => {
  const user = auth.currentUser;
  if (!user) {
    alert("Please log in to continue.");
    return;
  }

  window.location.href = "checkout.html";
};
