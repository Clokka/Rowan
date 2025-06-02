
// cart/Cart.js
import { cartItems, removeItem, updateQuantity } from '../shared/utils.js';

export function renderCart(containerId = 'app') {
  const container = document.getElementById(containerId);
  container.innerHTML = `
    <h2>Your Cart</h2>
    <div id="cart-items">
      ${cartItems.map(item => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" />
          <div>
            <h4>${item.name}</h4>
            <p>$${item.price}</p>
            <input type="number" min="1" value="${item.quantity}" data-id="${item.id}" class="qty" />
            <button data-id="${item.id}" class="remove">Remove</button>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="cart-total">
      <p>Total: $<span id="total">${calculateTotal()}</span></p>
      <button id="checkout">Continue to Checkout</button>
    </div>
  `;

  // Events
  document.querySelectorAll('.remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      removeItem(e.target.dataset.id);
      renderCart();
    });
  });

  document.querySelectorAll('.qty').forEach(input => {
    input.addEventListener('change', (e) => {
      updateQuantity(e.target.dataset.id, parseInt(e.target.value));
      renderCart();
    });
  });

  document.getElementById('checkout').addEventListener('click', () => {
    window.location.href = '../checkout/index.html';
  });
}

function calculateTotal() {
  return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
}
