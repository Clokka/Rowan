// cart.js

// Get cart from localStorage or start with empty array
function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

// Save cart back to localStorage
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Add item to cart (check if already exists)
function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart(cart);
}

// Remove item by ID
function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  saveCart(cart);
}

// Clear entire cart
function clearCart() {
  localStorage.removeItem('cart');
}

// Render cart to a container element
function renderCart(containerId) {
  const container = document.getElementById(containerId);
  const cart = getCart();
  container.innerHTML = '';

  if (cart.length === 0) {
    container.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }

  let total = 0;

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div class="details">
        <h3>${item.name}</h3>
        <p>£${item.price.toFixed(2)} x ${item.quantity} = £${itemTotal.toFixed(2)}</p>
        <button onclick="removeFromCart('${item.id}'); renderCart('cart-items')">Remove</button>
      </div>
    `;
    container.appendChild(div);
  });

  const totalDiv = document.createElement('div');
  totalDiv.className = 'cart-total';
  totalDiv.innerHTML = `<h2>Total: £${total.toFixed(2)}</h2>`;
  container.appendChild(totalDiv);
}

