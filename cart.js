function loadCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const container = document.getElementById('cart-container');
  const totalEl = document.getElementById('cart-total');
  container.innerHTML = '';

  let total = 0;

  if (cart.length === 0) {
    document.getElementById('empty-message').style.display = 'block';
  } else {
    document.getElementById('empty-message').style.display = 'none';
  }

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
          <input type="number" min="1" value="${item.quantity}" onchange="setQuantity(${index}, this.value)" style="width:50px; text-align:center;">
          <button onclick="changeQuantity(${index}, 1)">+</button>
          <button class="remove-button" onclick="removeItem(${index})">Remove</button>
        </div>
      </div>
    `;
    container.appendChild(div);
  });

  totalEl.textContent = total.toFixed(2);
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

function setQuantity(index, value) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  let qty = parseInt(value, 10);
  if (isNaN(qty) || qty < 1) qty = 1;
  cart[index].quantity = qty;
  localStorage.setItem('cart', JSON.stringify(cart));
  loadCart();
}

function removeItem(index) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  loadCart();
}

function clearCart() {
  localStorage.removeItem('cart');
  loadCart();
}

window.addEventListener('DOMContentLoaded', loadCart);
