// IMPORTANT: Keep script type as module
// DO NOT REMOVE THIS IMPORT
import { setupCart } from './cart-logic.js';

const mainGrid = document.getElementById('product-grid');
const sortSelect = document.getElementById('sort-select');
const paginationContainer = document.getElementById('pagination-container');

let currentPage = 1;
let hasNextPage = false;
const productsPerPage = 12; 

function createProductElement(id, product) {
    const productDiv = document.createElement('div');
    productDiv.className = 'product';
    productDiv.dataset.price = product.price;
    productDiv.dataset.date = product.date;
    productDiv.dataset.sales = product.sales;
    productDiv.dataset.stock = product.stock;

    const productDate = new Date(product.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const isNew = productDate > thirtyDaysAgo;

    let imageAndTitleHTML;
    const imageHTML = `<img src="${product.image}" alt="${product.name}" />`;
    const titleHTML = `<h3>${product.name}</h3>`;

    if (product.page_url) {
        imageAndTitleHTML = `<a href="${product.page_url}">${imageHTML}${titleHTML}</a>`;
    } else {
        imageAndTitleHTML = imageHTML + titleHTML;
    }
    
    productDiv.innerHTML = `
        ${isNew ? '<div class="new-badge">New</div>' : ''}
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

async function fetchAndRenderProducts(page = 1, sortCriteria = 'newest') {
    currentPage = page;
    try {
        const response = await fetch(`https://clokka-backend.onrender.com/api/products?page=${page}&limit=${productsPerPage}&sort=${sortCriteria}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const productsData = data.products;

        // Sort: in-stock products first
        productsData.sort((a, b) => {
            const aInStock = parseInt(a.stock) > 0;
            const bInStock = parseInt(b.stock) > 0;
            return (bInStock ? 1 : 0) - (aInStock ? 1 : 0);
        });

        hasNextPage = data.hasNextPage;
        currentPage =
