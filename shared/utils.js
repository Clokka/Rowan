// This file is used to manage the cart items in the browser's local storage.
// It is used to add items to the cart, remove items from the cart, and update the quantity of items in the cart.
// It is also used to calculate the total price of the cart and synchronize the cart items across different tabs/windows.
export let cartItems = JSON.parse(localStorage.getItem('cart')) || [];

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cartItems));
  // Dispatch a custom event to notify other parts of the app that the cart has changed
  document.dispatchEvent(new Event('cartUpdated'));
}

export function getCartItems() {
  return cartItems;
}

export function addItemToCart(product) {
  const existingItem = cartItems.find(item => item.id === product.id);
  if (existingItem) {
    existingItem.quantity += product.quantity || 1;
  } else {
    cartItems.push({ ...product, quantity: product.quantity || 1 });
  }
  saveCart();
}

export function removeItem(productId) {
  cartItems = cartItems.filter(item => item.id !== productId);
  saveCart();
}

export function updateQuantity(productId, quantity) {
  const item = cartItems.find(item => item.id === productId);
  if (item) {
    item.quantity = parseInt(quantity, 10);
    if (item.quantity <= 0) {
      removeItem(productId);
    } else {
      saveCart();
    }
  }
}

export function calculateTotal() {
  return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
}

// Synchronizing cart items across different tabs/windows
window.addEventListener('storage', (event) => {
  if (event.key === 'cart') {
    cartItems = JSON.parse(event.newValue) || [];
    document.dispatchEvent(new Event('cartUpdated'));
  }
}); 