function loadCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const container = document.getElementById('cart-container');
  const totalEl = document.getElementById('cart-total');
  container.innerHTML = '';

  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div class="item-details">
        <span class="item-title">${item.name}</span>
        <span class="item-price">$${item.price.toFixed(2)}</span>
        <div class="quantity-controls">
          <button onclick="changeQuantity(${index}, -1)">−</button>
          <span>${item.quantity}</span>
          <button onclick="changeQuantity(${index}, 1)">+</button>
          <button class="remove-button" onclick="removeItem(${index})">Remove</button>
        </div>
      </div>
    `;
    container.appendChild(div);
  });

  totalEl.textContent = total.toFixed(2);

  // Show eBay fallback message
  document.getElementById('ebay-message').style.display = cart.length > 0 ? 'block' : 'none';
}

function changeQuantity(index, delta) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  loadCart();
}

function removeItem(index) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  loadCart();
}

window.addEventListener('DOMContentLoaded', loadCart);
