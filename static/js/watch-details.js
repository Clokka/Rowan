document.addEventListener('DOMContentLoaded', () => {
    // If you are running locally, use http://127.0.0.1:5000
    // If you are deploying online for production, use https://clokka-backend.onrender.com
    const API_BASE_URL = 'https://clokka-backend.onrender.com';

    const path = window.location.pathname;
    const currentPage = path.split("/").pop();
    let currentProduct; // This will be populated by the API call
    let selectedColorIndex = 0;
    let images = [];
    let currentIndex = 0;

    const mainImage = document.getElementById('main-image');
    const videoContainer = document.getElementById('video-container');
    const leftArrow = document.querySelector('.arrow-left');
    const rightArrow = document.querySelector('.arrow-right');
    const tabs = document.querySelectorAll('.tab-button');
    const tabContent = document.getElementById('tab-content');
    const colorSelectorContainer = document.getElementById('color-selector');

    async function fetchProductData() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/product-by-url?url=${currentPage}`);
            if (!response.ok) {
                throw new Error(`Product not found for URL: ${currentPage}`);
            }
            currentProduct = await response.json();
            initializePage();
        } catch (error) {
            console.error('Failed to fetch product data:', error);
            tabContent.innerHTML = `<p style="color: red;">Failed to load product details. Please try again later.</p>`;
        }
    }

    function initializePage() {
        // Set document title and main heading from product data
        document.title = `${currentProduct.name} - CLOKKA`;
        const mainHeading = document.querySelector('h1');
        if(mainHeading) {
            mainHeading.textContent = currentProduct.name;
        }

        // Initialize gallery with the correct set of images (color or base)
        if (currentProduct && currentProduct.colors && currentProduct.colors.length > 0) {
            images = currentProduct.colors[selectedColorIndex].images;
        } else if (currentProduct) {
            images = currentProduct.images;
        }

        updateGallery();
        renderColorSelectors();
        renderAttributes(); // Initialize with the attributes tab
    }
    
    // Most functions (updateGallery, renderColorSelectors, renderAttributes, etc.) remain the same
    // but will now use the dynamically fetched `currentProduct`.
    
    function updateGallery() {
        if (!images || images.length === 0) {
            mainImage.style.display = 'block';
            mainImage.src = 'https://via.placeholder.com/500x500.png?text=No+Image+Available'; // Placeholder
            mainImage.alt = "No image available";
            videoContainer.style.display = "none";
            return;
        }

        const currentAsset = images[currentIndex];
        
        if (typeof currentAsset === 'string' && currentAsset.endsWith('.mp4')) {
            mainImage.style.display = "none";
            videoContainer.style.display = "flex";
            const videoElement = videoContainer.querySelector('video');
            if (videoElement) {
                const sourceElement = videoElement.querySelector('source');
                if (sourceElement) {
                    sourceElement.src = `../${currentAsset}`;
                    videoElement.load();
                }
            }
        } else {
            videoContainer.style.display = "none";
            mainImage.style.display = "block";
            mainImage.src = currentAsset;
            mainImage.alt = `${currentProduct.name} image ${currentIndex + 1}`;
        }
    }
    
    leftArrow.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateGallery();
    });
    
    rightArrow.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % images.length;
        updateGallery();
    });
    
    function renderColorSelectors() {
        if (!currentProduct || !currentProduct.colors || currentProduct.colors.length <= 1) {
            if (colorSelectorContainer) {
                colorSelectorContainer.style.display = 'none';
            }
            return;
        }
        
        colorSelectorContainer.style.display = 'flex';
        let html = '';
        currentProduct.colors.forEach((color, index) => {
            const colorValue = color.attributes && color.attributes.Color ? color.attributes.Color.toLowerCase() : '#ccc';
            html += `<button class="color-swatch ${index === selectedColorIndex ? 'active' : ''}" 
                             data-color-index="${index}" 
                             style="background-color: ${colorValue};" 
                             aria-label="Select color ${color.colorName}"
                             title="${color.colorName}">
                       ${color.colorName}
                     </button>`;
        });
        colorSelectorContainer.innerHTML = html;
    
        const swatches = colorSelectorContainer.querySelectorAll('.color-swatch');
        swatches.forEach(swatch => {
            swatch.addEventListener('click', (e) => {
                selectedColorIndex = parseInt(e.target.dataset.colorIndex, 10);
                
                images = currentProduct.colors[selectedColorIndex].images;
                currentIndex = 0;
                updateGallery();
                renderAttributes();
    
                colorSelectorContainer.querySelector('.active').classList.remove('active');
                e.target.classList.add('active');
            });
        });
    }

    function renderAttributes() {
        if (!currentProduct) return;
    
        let productAttributes = { ...currentProduct.attributes };
        if (currentProduct.colors && currentProduct.colors.length > 0) {
            const selectedColor = currentProduct.colors[selectedColorIndex];
            if (selectedColor && selectedColor.attributes) {
                productAttributes = { ...productAttributes, ...selectedColor.attributes };
            }
        }
    
        let html = `<table>`;
        for (const [key, value] of Object.entries(productAttributes)) {
            html += `<tr><th>${key}</th><td>${value}</td></tr>`;
        }
        html += `</table>`;
        tabContent.innerHTML = html;
        tabContent.setAttribute('aria-labelledby', 'tab-btn-attributes');
    }

    function renderDescription() {
        tabContent.textContent = (currentProduct.description || "No description available.").trim();
        tabContent.setAttribute('aria-labelledby', 'tab-btn-description');
    }

    function renderPerformance() {
        const performanceTabs = [
            { id: "waterproof", label: "Waterproof Depth", content: "Water resistant up to 3ATM (30 meters). Not suitable for swimming or diving." },
            { id: "movement", label: "Movement Type", content: "Quartz movement offers precise and reliable timekeeping." },
            { id: "battery", label: "Battery Life", content: "Battery lasts approximately 2 years under normal usage." },
            { id: "material", label: "Material Quality", content: "High quality ALLOY case and stainless steel band provide durability and a luxurious feel." }
        ];

        let subButtonsHtml = '<div class="performance-subbuttons">';
        performanceTabs.forEach((tab, idx) => {
            subButtonsHtml += `<button class="performance-subbutton${idx === 0 ? ' active' : ''}" data-subtab="${tab.id}" role="tab" aria-selected="${idx === 0}" aria-controls="performance-tab-${tab.id}">${tab.label}</button>`;
        });
        subButtonsHtml += '</div>';
        
        let firstContent = `<div id="performance-tab-${performanceTabs[0].id}" role="tabpanel">${performanceTabs[0].content}</div>`;
        tabContent.innerHTML = subButtonsHtml + firstContent;
        tabContent.setAttribute('aria-labelledby', 'tab-btn-performance');

        const subButtons = tabContent.querySelectorAll('.performance-subbutton');
        subButtons.forEach(button => {
            button.addEventListener('click', () => {
                subButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                const subTabId = button.getAttribute('data-subtab');
                const subTabContent = performanceTabs.find(t => t.id === subTabId).content;
                
                const existingPanels = tabContent.querySelectorAll('[role="tabpanel"]');
                existingPanels.forEach(panel => panel.remove());
                
                const newPanel = document.createElement('div');
                newPanel.id = `performance-tab-${subTabId}`;
                newPanel.setAttribute('role', 'tabpanel');
                newPanel.textContent = subTabContent;
                tabContent.appendChild(newPanel);
            });
        });
    }

    function renderSupplier() {
        const supplierInfo = {
            name: "Shenzhen Poedagar Watch Co., Ltd.",
            location: "Guangdong, China",
            website: "https://www.poedagar.com",
            contact: "contact@poedagar.com",
            phone: "+86 755 1234 5678"
        };
        tabContent.innerHTML = `
            <p><strong>Supplier Name:</strong> ${supplierInfo.name}</p>
            <p><strong>Location:</strong> ${supplierInfo.location}</p>
            <p><strong>Website:</strong> <a href="${supplierInfo.website}" target="_blank" rel="noopener noreferrer">${supplierInfo.website}</a></p>
            <p><strong>Contact Email:</strong> <a href="mailto:${supplierInfo.contact}">${supplierInfo.contact}</a></p>
            <p><strong>Phone:</strong> ${supplierInfo.phone}</p>
        `;
        tabContent.setAttribute('aria-labelledby', 'tab-btn-supplier');
    }
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelector('.tab-button.active').classList.remove('active');
            tab.classList.add('active');
    
            const tabName = tab.getAttribute('data-tab');
            if (tabName === 'attributes') renderAttributes();
            else if (tabName === 'description') renderDescription();
            else if (tabName === 'performance') renderPerformance();
            else if (tabName === 'supplier') renderSupplier();
        });
    });

    fetchProductData();
}); 