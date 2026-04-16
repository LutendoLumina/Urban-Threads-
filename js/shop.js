import { db } from './firebase-config.js';
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { initAuth, handleSignOut } from './auth.js';
import { addToCart } from './cart-logic.js';

// 1. Setup Navbar & Auth (Only call initAuth ONCE)
initAuth({ requireAuth: false });
window.handleSignOut = handleSignOut;

// 2. Define DOM elements FIRST before using them
const productGrid = document.getElementById('product-grid');
const filterBtns = document.querySelectorAll('.filter-btn');

// 3. Fetch Products from Firestore
async function loadProducts(category = 'all') {
    if (!productGrid) return; // Safety check
    
    productGrid.innerHTML = '<div class="loader">Loading...</div>';
    
    try {
        let q = collection(db, "products");
        
        if (category !== 'all') {
            q = query(collection(db, "products"), where("category", "==", category));
        }

        const querySnapshot = await getDocs(q);
        productGrid.innerHTML = ''; 

        querySnapshot.forEach((doc) => {
            renderProductCard(doc.id, doc.data());
        });
    } catch (error) {
        console.error("Firestore Error:", error);
        productGrid.innerHTML = '<p>Error loading products.</p>';
    }
}

// 4. Create Product Card HTML
function renderProductCard(id, data) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Note: Ensure your Firestore field is "image" or "imageURL" - be consistent!
    const imgPath = data.image || data.imageURL; 

    card.innerHTML = `
        <div class="product-image">
            <img src="${imgPath}" alt="${data.name}">
        </div>
        <div class="product-details">
            <h3>${data.name}</h3>
            <p class="price">R${data.price}</p>
            <button onclick="handleAddToCart('${id}', '${data.name}', ${data.price}, '${imgPath}')" class="add-btn">
                ADD TO CART
            </button>
        </div>
    `;
    productGrid.appendChild(card);
}

// 5. Global Cart Function
window.handleAddToCart = async (productId, name, price, image) => {
    try {
        // This calls the logic from cart-logic.js
        await addToCart(productId, { name, price, image });
    } catch (error) {
        console.error("Cart error: ", error);
        alert("Please sign in to add items to your cart.");
    }
};

// 6. Handle Category Filtering
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        loadProducts(e.target.dataset.category);
    });
});

// 7. Initial load (Call this LAST)
loadProducts();