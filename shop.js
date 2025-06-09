// Get cart count badge element
const cartCountEl = document.getElementById('cart-count');

// Load cart from localStorage or initialize empty array
function loadCart() {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
}

// Save cart array to localStorage
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Update cart count badge
function updateCartCount() {
  const cart = loadCart();
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  if (count > 0) {
    cartCountEl.style.display = 'flex';
    cartCountEl.textContent = count;
  } else {
    cartCountEl.style.display = 'none';
  }
}

// Add product to cart (or increase quantity if already added)
function addToCart(product) {
  const cart = loadCart();

  // Use a unique key for the product (preferably a real ID if available)
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
  updateCartCount();
}

// Setup buttons to add to cart
document.querySelectorAll('.add-to-basket').forEach(button => {
  button.addEventListener('click', () => {
    const productEl = button.closest('.product');

    if (!productEl) return;

    const titleEl = productEl.querySelector('h3');
    const priceEl = productEl.querySelector('p');
    const imgEl = productEl.querySelector('img');

    if (!titleEl || !priceEl || !imgEl) return;

    const name = titleEl.textContent.trim();
    const price = parseFloat(priceEl.textContent.replace('£', '').trim());
    const img = imgEl.src;
    const id = name.toLowerCase().replace(/\s+/g, '-'); // Fallback ID based on name

    const product = { id, name, price, img };

    addToCart(product);
  });
});

// Initialize cart count on page load
updateCartCount();
