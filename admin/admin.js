document.addEventListener('DOMContentLoaded', () => {
    // If you are running locally, use http://127.0.0.1:5000
    // If you are deploying online for production, use https://clokka-backend.onrender.com
    const API_BASE_URL = 'https://clokka-backend.onrender.com';
    let ADMIN_API_KEY = sessionStorage.getItem('adminApiKey');
    let productBeingEdited = null;

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
            alert('Admin Password is required to manage products.');
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
                    <td data-label="Price (£)">${(product.price || 0).toFixed(2)}</td>
                    <td data-label="Stock">${product.stock ?? 'N/A'}</td>
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
            alert('Could not delete product. Is your Admin Password correct?');
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
            document.getElementById('edit-image').value = product.image || '';
            document.getElementById('edit-page_url').value = product.page_url || '';
            document.getElementById('edit-description').value = product.description || '';
            document.getElementById('edit-attributes').value = JSON.stringify(product.attributes || {}, null, 2);
    
            // Handle color variants
            const editColorContainer = document.getElementById('edit-color-variants-container');
            editColorContainer.innerHTML = ''; // Clear previous variants
            if (product.colors && product.colors.length > 0) {
                product.colors.forEach(color => addEditColorVariantForm(color));
            }

            toggleEditModalFields(); // Hide/show fields based on color variants
            modal.style.display = 'flex';
            productBeingEdited = product;
    
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

        document.getElementById('edit-add-color-btn').addEventListener('click', () => {
            addEditColorVariantForm();
            toggleEditModalFields();
        });

        const editColorContainer = document.getElementById('edit-color-variants-container');
        editColorContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-color-variant-btn')) {
                e.target.closest('.color-variant-group').remove();
                toggleEditModalFields();
            }
        });

        document.getElementById('editProductForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            const productId = document.getElementById('edit-productId').value;
            const editColorContainer = document.getElementById('edit-color-variants-container');
            
            const updatedProduct = { ...productBeingEdited }; // Start with existing data to prevent loss

            // Update from form
            updatedProduct.name = document.getElementById('edit-name').value;
            updatedProduct.price = parseFloat(document.getElementById('edit-price').value); // Always get global price
            updatedProduct.image = document.getElementById('edit-image').value;
            updatedProduct.page_url = document.getElementById('edit-page_url').value || null;
            updatedProduct.description = document.getElementById('edit-description').value;
            try {
                updatedProduct.attributes = JSON.parse(document.getElementById('edit-attributes').value);
            } catch(e) {
                alert('Attributes field contains invalid JSON.');
                return;
            }
            
            const colorGroups = editColorContainer.querySelectorAll('.color-variant-group');

            if (colorGroups.length === 0) {
                alert('A product must have at least one color variant.');
                return;
            }

            updatedProduct.colors = [];
            colorGroups.forEach(group => {
                const colorVariant = {
                    colorName: group.querySelector('.colorName').value,
                    stock: parseInt(group.querySelector('.colorStock').value),
                    images: group.querySelector('.colorImages').value.split(',').map(img => img.trim()),
                    attributes: { Color: group.querySelector('.colorName').value }
                };
                updatedProduct.colors.push(colorVariant);
            });
            updatedProduct.stock = null;

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
                alert('Could not update product. Check console and Admin Password.');
            }
        });
    }

    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        promptForApiKey();

        const colorVariantsContainer = document.getElementById('color-variants-container');
        const addColorVariantBtn = document.getElementById('add-color-variant-btn');

        const originalPriceGroup = document.getElementById('price').parentElement.parentElement;
        const originalImageGroup = document.getElementById('image').parentElement;


        const toggleOriginalFields = () => {
            if(originalPriceGroup) originalPriceGroup.style.display = 'block'; 
            if(originalImageGroup) originalImageGroup.style.display = 'block'; 
        };

        const addColorVariantForm = (color = {}) => {
            const variantId = "new-" + Date.now();
            const newVariant = document.createElement('div');
            newVariant.classList.add('color-variant-group');
            newVariant.innerHTML = `
                <h4>New Color</h4>
                <div class="form-group">
                    <label for="colorName-${variantId}">Color Name</label>
                    <input type="text" id="colorName-${variantId}" class="colorName" value="${color.colorName || ''}" required>
                </div>
                <div class="form-group">
                    <label for="colorStock-${variantId}">Stock</label>
                    <input type="number" id="colorStock-${variantId}" class="colorStock" value="${color.stock ?? ''}" required>
                </div>
                <div class="form-group">
                    <label for="colorImages-${variantId}">Image URLs (comma-separated)</label>
                    <input type="text" id="colorImages-${variantId}" class="colorImages" value="${(color.images || []).join(', ')}" required>
                </div>
                <button type="button" class="admin-btn btn-danger remove-color-variant-btn">Remove Color</button>
            `;
            colorVariantsContainer.appendChild(newVariant);
            toggleOriginalFields();
        };

        // Add one color form by default
        addColorVariantForm();

        addColorVariantBtn.addEventListener('click', () => addColorVariantForm());

        colorVariantsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-color-variant-btn')) {
                e.target.closest('.color-variant-group').remove();
                toggleOriginalFields();
            }
        });

        addProductForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!ADMIN_API_KEY) {
                alert('API Key is required to add a product.');
                return;
            }

            const newProduct = {
                name: document.getElementById('name').value,
                price: parseFloat(document.getElementById('price').value),
                image: document.getElementById('image').value,
                date: document.getElementById('date').value,
                sales: parseInt(document.getElementById('sales').value),
                page_url: document.getElementById('page_url').value || null,
                colors: []
            };

            const colorGroups = colorVariantsContainer.querySelectorAll('.color-variant-group');
            if (colorGroups.length === 0) {
                alert('A product must have at least one color variant.');
                return;
            }
            
            colorGroups.forEach(group => {
                const colorVariant = {
                    colorName: group.querySelector('.colorName').value,
                    stock: parseInt(group.querySelector('.colorStock').value),
                    images: group.querySelector('.colorImages').value.split(',').map(img => img.trim()),
                    attributes: {
                        Color: group.querySelector('.colorName').value
                    }
                };
                newProduct.colors.push(colorVariant);
            });
            
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

    // This function will be used by both add and edit forms
    const addEditColorVariantForm = (color = {}) => {
        const variantId = color.colorName ? `edit-${color.colorName.replace(/ /g, '-')}` : `edit-new-${Date.now()}`;
        const container = document.getElementById('edit-color-variants-container');
        const newVariant = document.createElement('div');
        newVariant.classList.add('color-variant-group');
        newVariant.innerHTML = `
            <h4>${color.colorName || 'New Color'}</h4>
            <div class="form-group">
                <label for="colorName-${variantId}">Color Name</label>
                <input type="text" id="colorName-${variantId}" class="colorName" value="${color.colorName || ''}" required>
            </div>
            <div class="form-group">
                <label for="colorStock-${variantId}">Stock</label>
                <input type="number" id="colorStock-${variantId}" class="colorStock" value="${color.stock ?? ''}" required>
            </div>
            <div class="form-group">
                <label for="colorImages-${variantId}">Image URLs (comma-separated)</label>
                <input type="text" id="colorImages-${variantId}" class="colorImages" value="${(color.images || []).join(', ')}" required>
            </div>
            <button type="button" class="admin-btn btn-danger remove-color-variant-btn">Remove Color</button>
        `;
        container.appendChild(newVariant);
    };

    const toggleEditModalFields = () => {
        const editColorContainer = document.getElementById('edit-color-variants-container');
    
        const editPriceGroup = document.getElementById('edit-price').parentElement;
        const editImageGroup = document.getElementById('edit-image').parentElement;
    
        if (editPriceGroup) editPriceGroup.style.display = 'block'; // Always show price
        if (editImageGroup) editImageGroup.style.display = 'block'; // Always show image
    };
});