import { db, auth } from './firebase-config.js';
import { doc, setDoc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

export async function addToCart(productId, productData) {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");

    // Reference to the specific product in THIS user's cart
    const cartItemRef = doc(db, 'users', user.uid, 'cart', productId);
    const cartSnap = await getDoc(cartItemRef);

    if (cartSnap.exists()) {
        // If it's already in the cart, just bump the quantity
        await updateDoc(cartItemRef, {
            quantity: increment(1)
        });
    } else {
        // If it's new, save the whole product snapshot
        await setDoc(cartItemRef, {
            ...productData,
            quantity: 1,
            addedAt: new Date()
        });
    }
}