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

// Render the cart items
function renderCart() {
  const cart = loadCart();
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

// Initialize cart display on page load
renderCart();
