/**
 * @file cart-logic.js
 * @description Handles all cart functionality, including adding items and updating the count badge.
 * @warning This is a critical part of the application. Please do not modify this file.
 */
import { addItemToCart } from '../../shared/utils.js';

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const badge = document.getElementById('cart-count');
  if (badge) {
    if (totalCount > 0) {
      badge.textContent = totalCount;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
}

function initializeCartButtons() {
  document.querySelectorAll('.add-to-basket').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.dataset.id;
      const name = button.dataset.name;
      const price = parseFloat(button.dataset.price);
      const image = button.dataset.image;

      if (id && name && !isNaN(price) && image) {
        addItemToCart({ id, name, price, image });
        updateCartCount();
      } else {
        console.error('Product data is missing or invalid for item ID:', id);
        alert('Could not add item to cart. Product data is incomplete.');
      }
    });
  });
}

// This function initializes everything this module needs to do.
export function setupCart() {
  initializeCartButtons();
  document.addEventListener('cartUpdated', updateCartCount);
  updateCartCount();
} 