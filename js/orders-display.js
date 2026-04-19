import { db, auth } from "./firebase-config.js";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const ordersList = document.getElementById("orders-list");

onAuthStateChanged(auth, async (user) => {
  if (user) {
    renderOrders(user.uid);
  } else {
    window.location.href = "login.html";
  }
});

async function renderOrders(uid) {
  try {
    // Query the orders subcollection, sorted by date
    const ordersRef = collection(db, "users", uid, "orders");
    const q = query(ordersRef, orderBy("date", "desc"));
    const snapshot = await getDocs(q);

    ordersList.innerHTML = "";

    if (snapshot.empty) {
      ordersList.innerHTML = "<p>You haven't placed any orders yet.</p>";
      return;
    }

    snapshot.forEach((doc) => {
      const order = doc.data();
      const orderDate = order.date.toDate().toLocaleDateString();

      const orderCard = document.createElement("div");
      orderCard.className = "order-card";
      orderCard.innerHTML = `
    <div class="order-header-info">
        <span>ORDER ID: ${doc.id.substring(0, 8).toUpperCase()}</span>
        <span>DATE: ${orderDate}</span>
    </div>
    <div class="order-body">
        ${order.items
          .map(
            (item) => `
            <div class="order-item-detail">
                <span>${item.name} x ${item.quantity}</span>
                <span>R${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `,
          )
          .join("")}
        <div class="order-total-row">
            TOTAL: ${order.total}
        </div>
    </div>
`;
      ordersList.appendChild(orderCard);
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    ordersList.innerHTML = "<p>Failed to load order history.</p>";
  }
}
