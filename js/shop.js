import { db } from "./firebase-config.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { initAuth, handleSignOut } from "./auth.js";
import { addToCart } from "./cart-logic.js";

// Setup Navbar & Auth
initAuth({ requireAuth: false });
window.handleSignOut = handleSignOut;

// Define DOM elements
const productGrid = document.getElementById("product-grid");
const filterBtns = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById('product-search');

// Local state to store products for instant filtering
let allProducts = [];

/**
 * 1. Initial Data Load
 * Fetches all products once to allow for instant local searching.
 */
async function loadProducts() {
  if (!productGrid) return;
  productGrid.innerHTML = '<div class="loader">Retrieving drops...</div>';

  try {
    const snapshot = await getDocs(collection(db, "products"));
    // Map Firestore docs to a clean array with IDs
    allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Initial display of all products
    renderProducts(allProducts);
  } catch (error) {
    console.error("Firestore Error:", error);
    productGrid.innerHTML = "<p>Error loading products.</p>";
  }
}

/**
 * 2. Hybrid Filter & Search Logic
 * Combines category selection and text search into a single filtered list.
 */
function filterAndSearch() {
  const searchTerm = searchInput.value.toLowerCase();
  
  // Find which category button is currently active
  const activeBtn = document.querySelector('.filter-btn.active');
  const activeCategory = activeBtn ? activeBtn.dataset.category : "All";

  const filtered = allProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm);
    // Check if category matches or if "All" is selected
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  renderProducts(filtered);
}

/**
 * 3. Render Product Grid
 * Clears the grid and rebuilds it based on the current filtered list.
 */
function renderProducts(productsList) {
  productGrid.innerHTML = ""; // Clear existing cards

  if (productsList.length === 0) {
    productGrid.innerHTML = "<p class='no-results'>No drops found matching your search.</p>";
    return;
  }

  productsList.forEach((product) => {
    renderProductCard(product.id, product);
  });
}

/**
 * 4. Create Individual Product Card
 */
function renderProductCard(id, data) {
  const card = document.createElement("div");
  card.className = "product-card";

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

// --- Event Listeners ---

// Real-time search as user types
if (searchInput) {
    searchInput.addEventListener('input', filterAndSearch);
}

// Category button handling
filterBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    // UI Update: Toggle active class
    filterBtns.forEach((b) => b.classList.remove("active"));
    e.target.classList.add("active");
    
    // Logic: Re-run the filter
    filterAndSearch();
  });
});

// Global Cart Function
window.handleAddToCart = async (productId, name, price, image) => {
  try {
    await addToCart(productId, { name, price, image });
  } catch (error) {
    console.error("Cart error: ", error);
    alert("Please sign in to add items to your cart.");
  }
};

// Start the app
loadProducts();