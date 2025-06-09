const cartContainer = document.getElementById('cart-container');
const totalPriceEl = document.getElementById('cart-total');

// Load cart from localStorage or empty array
function loadCart() {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
}

// Save cart to localStorage
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Add item to cart or increase quantity
function addToCart(product) {
  const cart = loadCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    product.quantity = 1;
    product.img = product.image || product.img || '';
    cart.push(product);
  }
  saveCart(cart);
}

// Render the cart items on the page
function renderCart() {
  if (!cartContainer || !totalPriceEl) return;

  const cart = loadCart();

  cartContainer.innerHTML = '';

  if (cart.length === 0) {
    cartContainer.innerHTML = `<p class="empty-message">Your basket is empty.</p>`;
    totalPriceEl.textContent = 'Total: £0.00';
    return;
  }

  cart.forEach((item, index) => {
    const itemEl = document.createElement('div');
    itemEl.classList.add('cart-item');

    itemEl.innerHTML = `
      <img src="${item.img}" alt="${item.name}" />
      <div class="cart-details">
        <h3>${item.name}</h3>
        <p>Price: £${item.price.toFixed(2)}</p>
        <p>Quantity: 
          <input type="number" min="1" value="${item.quantity}" data-index="${index}" class="quantity-input" />
        </p>
      </div>
      <div class="cart-actions">
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
  totalPriceEl.textContent = `Total: £${total.toFixed(2)}`;
}

// Setup event listeners for quantity inputs and remove buttons
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

// Render cart on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderCart);
} else {
  renderCart();
}
