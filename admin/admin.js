document.addEventListener('DOMContentLoaded', () => {
    // If you are running locally, use http://127.0.0.1:5000
    // If you are deploying online for production, use https://clokka-backend.onrender.com
    const API_BASE_URL = 'https://clokka-backend.onrender.com';
    let ADMIN_API_KEY = sessionStorage.getItem('adminApiKey');

    const promptForApiKey = () => {
        if (!ADMIN_API_KEY) {
            ADMIN_API_KEY = prompt('Enter your Admin Password:');
            if (ADMIN_API_KEY) {
                sessionStorage.setItem('adminApiKey', ADMIN_API_KEY);
            }
        }
    };

    if (document.getElementById('product-list')) {
        promptForApiKey();
        if (ADMIN_API_KEY) {
            fetchAndDisplayProducts();
        } else {
            alert('API Key is required to manage products.');
        }
    }

    async function fetchAndDisplayProducts() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/products?limit=100`);
            if (!response.ok) throw new Error('Failed to fetch products');
            
            const data = await response.json();
            const productList = document.getElementById('product-list');
            productList.innerHTML = '';

            data.products.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td data-label="Name">${product.name}</td>
                    <td data-label="Price (£)">${product.price.toFixed(2)}</td>
                    <td data-label="Stock">${product.stock}</td>
                    <td data-label="Sales">${product.sales}</td>
                    <td data-label="Actions" class="actions">
                        <button class="btn-edit" data-id="${product.id}">Edit</button>
                        <button class="btn-delete" data-id="${product.id}">Delete</button>
                    </td>
                `;
                productList.appendChild(row);
            });
        } catch (error) {
            console.error('Error:', error);
            alert('Could not fetch products. Check the console for details.');
        }
    }

    document.body.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn-delete')) {
            const productId = event.target.dataset.id;
            handleDelete(productId);
        }
        if (event.target.classList.contains('btn-edit')) {
            const productId = event.target.dataset.id;
            handleEdit(productId);
        }
    });
    
    async function handleDelete(productId) {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/products/${productId}`, {
                method: 'DELETE',
                headers: { 'X-API-Key': ADMIN_API_KEY }
            });
            if (!response.ok) throw new Error('Failed to delete product');
            
            alert('Product deleted successfully!');
            fetchAndDisplayProducts();
        } catch (error) {
            console.error('Error:', error);
            alert('Could not delete product. Is your API Key correct?');
        }
    }

    const modal = document.getElementById('editProductModal');
    const closeButton = document.querySelector('.close-button');

    async function handleEdit(productId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
            if (!response.ok) {
                throw new Error('Could not fetch product details.');
            }
            const product = await response.json();
    
            document.getElementById('edit-productId').value = product.id;
            document.getElementById('edit-name').value = product.name;
            document.getElementById('edit-price').value = product.price;
            document.getElementById('edit-stock').value = product.stock;
            document.getElementById('edit-image').value = product.image;
            document.getElementById('edit-page_url').value = product.page_url || '';
    
            modal.style.display = 'block';
    
        } catch (error) {
            console.error('Error preparing edit modal:', error);
            alert('Could not load product data for editing.');
        }
    }

    if(modal) {
        closeButton.onclick = () => modal.style.display = 'none';
        window.onclick = (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        };

        document.getElementById('editProductForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            const productId = document.getElementById('edit-productId').value;
            
            const updatedProduct = {
                name: document.getElementById('edit-name').value,
                price: parseFloat(document.getElementById('edit-price').value),
                stock: parseInt(document.getElementById('edit-stock').value),
                image: document.getElementById('edit-image').value,
                page_url: document.getElementById('edit-page_url').value || null
            };
        
            try {
                const response = await fetch(`${API_BASE_URL}/api/admin/products/${productId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': ADMIN_API_KEY
                    },
                    body: JSON.stringify(updatedProduct)
                });
                if (!response.ok) throw new Error('Failed to update product');
        
                alert('Product updated successfully!');
                modal.style.display = 'none';
                fetchAndDisplayProducts();
            } catch (error) {
                console.error('Error:', error);
                alert('Could not update product. Check console and API Key.');
            }
        });
    }

    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        promptForApiKey();
        addProductForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!ADMIN_API_KEY) {
                alert('API Key is required to add a product.');
                return;
            }

            const newProduct = {
                name: document.getElementById('name').value,
                price: parseFloat(document.getElementById('price').value),
                stock: parseInt(document.getElementById('stock').value),
                image: document.getElementById('image').value,
                date: document.getElementById('date').value,
                sales: parseInt(document.getElementById('sales').value),
                page_url: document.getElementById('page_url').value || null
            };
            
            try {
                const response = await fetch(`${API_BASE_URL}/api/admin/products`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': ADMIN_API_KEY
                    },
                    body: JSON.stringify(newProduct)
                });
                if (response.status !== 201) throw new Error('Failed to add product');
                
                alert('Product added successfully!');
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Error:', error);
                alert('Could not add product. Check the console and ensure your API key is correct.');
            }
        });
    }
});