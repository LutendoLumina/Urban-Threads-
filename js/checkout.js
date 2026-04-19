import { db, auth } from "./firebase-config.js";
import { collection, getDocs, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// 1. INITIALIZE STRIPE 
// Replace the string below with your ACTUAL pk_test_... key from your dashboard
const stripe = Stripe('pk_test_51TLhqlCY6NbIX42SJI3mIY9HT6Y3PHCjG8XBDxtLkzXQXiPz3ixsxhj6oC2hCh50KaarDfCcpJoTM3QStq7dXaI800EKGn1Cy5'); 
const elements = stripe.elements();

// Create the card element with basic styling for a dark theme
const card = elements.create('card', {
    style: {
        base: {
            color: '#ffffff',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': { color: '#aab7c4' }
        },
        invalid: { color: '#fa755a', iconColor: '#fa755a' }
    }
});

// Mount the Stripe card element into the div in your HTML
card.mount('#card-element');

// 2. RENDER THE SUMMARY ON LOAD
onAuthStateChanged(auth, async (user) => {
    if (user) {
        loadCheckoutSummary(user);
    } else {
        window.location.href = "login.html";
    }
});

async function loadCheckoutSummary(user) {
    const summaryContainer = document.getElementById("checkout-items-list");
    const totalEl = document.getElementById("checkout-grand-total");
    
    const cartRef = collection(db, "users", user.uid, "cart");
    const snapshot = await getDocs(cartRef);
    
    let total = 0;
    summaryContainer.innerHTML = ""; 

    snapshot.forEach((itemDoc) => {
        const item = itemDoc.data();
        const subtotal = item.price * item.quantity;
        total += subtotal;

        summaryContainer.innerHTML += `
            <div class="summary-item" style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <span>${item.name} (x${item.quantity})</span>
                <span>R${subtotal.toFixed(2)}</span>
            </div>`;
    });
    totalEl.innerText = `R${total.toFixed(2)}`;
}

// 3. HANDLE STRIPE PAYMENT & FIREBASE ORDER
const form = document.getElementById('checkout-form');

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const user = auth.currentUser;

    // Use Stripe to create a Payment Method (Verifies the card locally)
    const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: card,
        billing_details: {
            name: document.getElementById('full-name').value,
            email: document.getElementById('email').value
        }
    });

    if (error) {
        // Show error in the #card-errors div
        const errorElement = document.getElementById('card-errors');
        errorElement.textContent = error.message;
    } else {
        // Stripe verified the test card (4242)! 
        // Now we process the database logic
        await finalizeFirebaseOrder(user);
    }
});

async function finalizeFirebaseOrder(user) {
    try {
        const cartRef = collection(db, "users", user.uid, "cart");
        const snapshot = await getDocs(cartRef);
        
        if (snapshot.empty) return;

        const orderData = {
            items: snapshot.docs.map(d => d.data()),
            totalAmount: document.getElementById('checkout-grand-total').innerText,
            shippingAddress: document.getElementById('address').value,
            createdAt: new Date(),
            status: "Paid"
        };

        // 1. Save permanent record to 'orders'
        await addDoc(collection(db, "users", user.uid, "orders"), orderData);

        // 2. Clear the cart
        const deletePromises = snapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
        await Promise.all(deletePromises);

        // 3. Redirect to success
        window.location.href = "success.html";
        
    } catch (err) {
        console.error("Order processing failed:", err);
        alert("There was an error saving your order. Please try again.");
    }
}