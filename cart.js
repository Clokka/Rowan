```
📁 /cart/Cart.js
```
```javascript
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
    window.location.href = 'checkout/index.html';
  });
}

function calculateTotal() {
  return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
}
```

```
📁 /cart/cart.css
```
```css
.cart-item {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
}
.cart-item img {
  width: 100px;
}
.cart-total {
  margin-top: 2rem;
  font-weight: bold;
}
```

```
📁 /checkout/Checkout.js
```
```javascript
// checkout/Checkout.js
import './checkout.css';
import { cartItems } from '../shared/utils.js';

export function renderCheckout(containerId = 'app') {
  const container = document.getElementById(containerId);
  container.innerHTML = `
    <div class="express-checkout">
      <button>Shop Pay</button>
      <button>PayPal</button>
      <button>GPay</button>
    </div>
    <hr />
    <form class="checkout-form">
      <h3>Contact</h3>
      <input type="email" placeholder="Email or mobile" required />

      <h3>Delivery</h3>
      <input type="text" placeholder="First name" />
      <input type="text" placeholder="Last name" />
      <input type="text" placeholder="Address" required />
      <input type="text" placeholder="City" required />
      <input type="text" placeholder="ZIP Code" required />

      <h3>Payment</h3>
      <input type="text" placeholder="Card number" required />
      <input type="text" placeholder="Expiration date (MM/YY)" required />
      <input type="text" placeholder="CVC" required />

      <label><input type="checkbox" checked /> Use shipping as billing</label>
      <button type="submit">Pay Now</button>
    </form>
  `;
}
```

```
📁 /checkout/checkout.css
```
```css
.checkout-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 400px;
  margin: auto;
}
.checkout-form input {
  padding: 0.5rem;
  font-size: 1rem;
}
.express-checkout {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1rem;
}
```

```
📁 /shared/utils.js
```
```javascript
export let cartItems = [
  { id: '1', name: 'T-Shirt', price: 20, quantity: 1, image: 'https://via.placeholder.com/100' },
  { id: '2', name: 'Jeans', price: 40, quantity: 1, image: 'https://via.placeholder.com/100' },
];

export function removeItem(id) {
  cartItems = cartItems.filter(item => item.id !== id);
}

export function updateQuantity(id, quantity) {
  const item = cartItems.find(i => i.id === id);
  if (item) item.quantity = quantity;
}
```

```
📁 index.html
```
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cart</title>
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="cart/cart.css">
</head>
<body>
  <div id="app"></div>
  <script type="module" src="app.js"></script>
</body>
</html>
```

```
📁 style.css
```
```css
body {
  font-family: sans-serif;
  padding: 2rem;
  background: #f9f9f9;
}
```

```
📁 app.js
```
```javascript
import { renderCart } from './cart/Cart.js';

// Entry point
renderCart();
```

```
📁 /checkout/index.html
```
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Checkout</title>
  <link rel="stylesheet" href="checkout.css">
</head>
<body>
  <div id="app"></div>
  <script type="module">
    import { renderCheckout } from './Checkout.js';
    renderCheckout();
  </script>
</body>
</html>
```

Let me know if you want this as another downloadable ZIP file.
