import { db } from './firebase-config.js';
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { initAuth, handleSignOut } from './auth.js';

// 1. Initialize Navbar & Sign Out
initAuth({ requireAuth: false });
window.handleSignOut = handleSignOut;

const productGrid = document.getElementById('product-grid');
const filterBtns = document.querySelectorAll('.filter-btn');

// 2. Fetch Products from Firestore
async function loadProducts(category = 'all') {
    productGrid.innerHTML = '<div class="loader">Loading...</div>';
    
    try {
        let q = collection(db, "products");
        
        // If a specific category is selected, filter the query
        if (category !== 'all') {
            q = query(collection(db, "products"), where("category", "==", category));
        }

        const querySnapshot = await getDocs(q);
        productGrid.innerHTML = ''; // Clear loader

        querySnapshot.forEach((doc) => {
            renderProductCard(doc.id, doc.data());
        });
    } catch (error) {
        console.error("Firestore Error:", error);
        productGrid.innerHTML = '<p>Error loading products.</p>';
    }
}

// 3. Create Product Card HTML
function renderProductCard(id, data) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-image">
            <img src="${data.imageURL}" alt="${data.name}">
        </div>
        <div class="product-details">
            <h3>${data.name}</h3>
            <p class="price">R${data.price}</p>
            <button onclick="addToCart('${id}')" class="add-btn">ADD TO CART</button>
        </div>
    `;
    productGrid.appendChild(card);
}

// 4. Handle Category Filtering
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        loadProducts(e.target.dataset.category);
    });
});

// 5. Global Cart Function (Placeholder for Phase 4)
window.addToCart = (productId) => {
    console.log("Added to cart:", productId);
    alert("Item added to cart!");
};

// Initial load
loadProducts();