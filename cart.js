const cartContainer = document.getElementById('cart-container');
const totalPriceEl = document.getElementById('total-price');

// Load cart from localStorage or empty array
function loadCart() {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
}

// Save cart to localStorage
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Add item to cart with quantity merge logic
function addToCart(product) {
  const cart = loadCart();

  // Check if the product is already in the cart
  const existingItemIndex = cart.findIndex(item => item.id === product.id);

  if (existingItemIndex > -1) {
    // If already in cart, increase quantity
    cart[existingItemIndex].quantity += 1;
  } else {
    // If new item, set quantity to 1 and add it
    product.quantity = 1;
    product.img = product.image || product.img || ''; // fallback for image key
    cart.push(product);
  }

  saveCart(cart);
}

// Render the cart items on the page
function renderCart() {
  const cart = loadCart();
  if (!cartContainer || !totalPriceEl) return;

  cartContainer.innerHTML = '';

  if (cart.length === 0) {
    cartContainer.innerHTML = '<p>Your cart is empty.</p>';
    totalPriceEl.textContent = '£0.00';
    return;
  }

  cart.forEach((item, index) => {
    const itemEl = document.createElement('div');
    itemEl.classList.add('cart-item');
    itemEl.innerHTML = `
      <img src="${item.img}" alt="${item.name}" class="cart-item-img" />
      <div class="cart-item-details">
        <h4>${item.name}</h4>
        <p>Price: £${item.price.toFixed(2)}</p>
        <label>
          Quantity: 
          <input type="number" min="1" value="${item.quantity}" data-index="${index}" class="quantity-input" />
        </label>
        <button data-index="${index}" class="remove-btn">Remove</button>
      </div>
    `;
    cartContainer.appendChild(itemEl);
  });

  updateTotalPrice();
  setupEventListeners();
}

// Update total price display
function updateTotalPrice() {
  const cart = loadCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  totalPriceEl.textContent = `£${total.toFixed(2)}`;
}

// Set up event listeners for quantity changes and remove buttons
function setupEventListeners() {
  // Quantity inputs
  document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const index = e.target.dataset.index;
      let newQty = parseInt(e.target.value);
      if (isNaN(newQty) || newQty < 1) newQty = 1;

      const cart = loadCart();
      cart[index].quantity = newQty;
      saveCart(cart);
      updateTotalPrice();
    });
  });

  // Remove buttons
  document.querySelectorAll('.remove-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const index = e.target.dataset.index;
      const cart = loadCart();
      cart.splice(index, 1);
      saveCart(cart);
      renderCart();
    });
  });
}

// Render cart if cartContainer exists (i.e., on cart.html)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('cart-container')) {
      renderCart();
    }
  });
} else {
  if (document.getElementById('cart-container')) {
    renderCart();
  }
}
