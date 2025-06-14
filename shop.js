// IMPORTANT: Keep script type as module
// DO NOT REMOVE THIS IMPORT
import { setupCart } from './cart-logic.js';

const mainGrid = document.getElementById('product-grid');
const oneRowGrid = document.getElementById('product-grid-one-row');
const sortSelect = document.getElementById('sort-select');

function createProductElement(id, product) {
    const productDiv = document.createElement('div');
    productDiv.className = 'product';
    productDiv.dataset.price = product.price;
    productDiv.dataset.date = product.date;
    productDiv.dataset.sales = product.sales;
    productDiv.dataset.stock = product.stock;

    let imageAndTitleHTML;
    const imageHTML = `<img src="${product.image}" alt="${product.name}" />`;
    const titleHTML = `<h3>${product.name}</h3>`;

    if (product.page_url) {
    imageAndTitleHTML = `<a href="${product.page_url}">${imageHTML}${titleHTML}</a>`;
    } else {
    imageAndTitleHTML = imageHTML + titleHTML;
    }
    
    productDiv.innerHTML = `
    <div class="new-badge">New</div>
    ${imageAndTitleHTML}
    <p>£${product.price.toFixed(2)}</p>
    <p class="review">★★★★★ (5/5)</p>
    <button class="add-to-basket"
            data-id="${id}"
            data-name="${product.name}"
            data-price="${product.price}"
            data-image="${product.image}">
        Add to Cart
    </button>
    `;
    return productDiv;
}

function handleStockDisplay() {
    document.querySelectorAll('.product').forEach(product => {
    if (product.dataset.stock === "0") {
        product.classList.add('out-of-stock');
        const badge = document.createElement('div');
        badge.className = 'stock-badge';
        badge.innerText = 'Out of Stock';
        product.appendChild(badge);

        const btn = product.querySelector('.add-to-basket');
        btn.disabled = true;
        btn.innerText = 'Out of Stock';
    }
    });
}

function sortProducts(criteria) {
    const products = Array.from(mainGrid.children);
    products.sort((a, b) => {
    switch (criteria) {
        case 'newest':
        return new Date(b.dataset.date) - new Date(a.dataset.date);
        case 'price-low':
        return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
        case 'price-high':
        return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
        case 'bestselling':
        return parseInt(b.dataset.sales) - parseInt(a.dataset.sales);
        default:
        return 0;
    }
    });
    products.forEach(prod => mainGrid.appendChild(prod));
}

async function fetchAndRenderProducts() {
    try {
    const response = await fetch('https://clokka-backend.onrender.com/api/products');
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const productsData = await response.json();

    mainGrid.innerHTML = '';
    oneRowGrid.innerHTML = '';

    const productEntries = Object.entries(productsData).sort(([idA], [idB]) => parseInt(idA) - parseInt(idB));

    productEntries.forEach(([id, product]) => {
        const productElement = createProductElement(id, product);
        if (parseInt(id) <= 5) {
        mainGrid.appendChild(productElement);
        } else {
        oneRowGrid.appendChild(productElement);
        }
    });

    handleStockDisplay();
    sortProducts(sortSelect.value);
    setupCart();
    
    } catch (error) {
    console.error("Could not fetch and render products:", error);
    mainGrid.innerHTML = "<p>Error loading products. Please try again later.</p>";
    }
}

sortSelect.addEventListener('change', () => {
    sortProducts(sortSelect.value);
});

document.addEventListener('DOMContentLoaded', fetchAndRenderProducts);