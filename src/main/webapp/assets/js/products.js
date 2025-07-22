// Products JavaScript - Customer Dashboard Style
document.addEventListener('DOMContentLoaded', () => {
    console.log('📚 Products page loaded');
    
    // Get base URL
    const contextPath = window.location.pathname.split('/')[1];
    const baseUrl = '/' + contextPath;
    
    // Default image URL
    const defaultImage = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
    
    // Get all product cards
    let allProducts = Array.from(document.querySelectorAll('.product-card'));
    
    // Initialize
    loadCartCount();
    
    // Check and update out of stock products
    allProducts.forEach(product => {
        const stock = parseInt(product.dataset.stock) || 0;
        if (stock === 0) {
            updateOutOfStockDisplay(product, true);
        }
    });
    
    // Enhanced out-of-stock display method (from customer dashboard)
    function updateOutOfStockDisplay(productElement, isOutOfStock) {
        const stockDiv = productElement.querySelector('.product-stock');
        const addToCartBtn = productElement.querySelector('.add-to-cart');
        
        if (isOutOfStock) {
            // Update stock display
            if (stockDiv) {
                stockDiv.className = 'product-stock out-of-stock';
                stockDiv.innerHTML = '<i class="fas fa-box"></i><span>Out of Stock (0 available)</span>';
            }
            
            // Update button
            if (addToCartBtn) {
                addToCartBtn.disabled = true;
                addToCartBtn.textContent = 'Out of Stock';
                addToCartBtn.style.backgroundColor = '#ccc';
                addToCartBtn.style.cursor = 'not-allowed';
                addToCartBtn.style.opacity = '0.6';
            }
            
            // Add visual indicator to product card
            productElement.classList.add('out-of-stock-product');
            productElement.style.opacity = '0.8';
            
        } else {
            // Update stock display
            if (stockDiv) {
                stockDiv.className = 'product-stock in-stock';
                const stock = productElement.dataset.stock || '1';
                stockDiv.innerHTML = `<i class="fas fa-box"></i><span>In Stock (${stock} available)</span>`;
            }
            
            // Update button
            if (addToCartBtn) {
                addToCartBtn.disabled = false;
                addToCartBtn.textContent = 'Add to Cart';
                addToCartBtn.style.backgroundColor = '';
                addToCartBtn.style.cursor = 'pointer';
                addToCartBtn.style.opacity = '1';
            }
            
            // Remove visual indicator
            productElement.classList.remove('out-of-stock-product');
            productElement.style.opacity = '1';
        }
    }
    
    // Truncate text helper function
    function truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
    
    // Update all product descriptions to truncate
    allProducts.forEach(product => {
        const descriptionEl = product.querySelector('.product-description');
        if (descriptionEl) {
            const fullText = descriptionEl.textContent;
            descriptionEl.textContent = truncateText(fullText, 80);
        }
    });
    
    // Search products
    window.searchProducts = function() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        filterAndDisplay();
    };
    
    // Filter products by category
    window.filterProducts = function() {
        filterAndDisplay();
    };
    
    // Sort products
    window.sortProducts = function() {
        const sortBy = document.getElementById('sortSelect').value;
        const grid = document.getElementById('productsGrid');
        const visibleProducts = Array.from(grid.querySelectorAll('.product-card:not([style*="none"])'));
        
        visibleProducts.sort((a, b) => {
            switch(sortBy) {
                case 'newest':
                    return parseInt(b.dataset.id) - parseInt(a.dataset.id);
                case 'price-low':
                    return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
                case 'price-high':
                    return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
                case 'name':
                    return a.dataset.title.localeCompare(b.dataset.title);
                default:
                    return 0;
            }
        });
        
        // Reorder in DOM
        visibleProducts.forEach(product => grid.appendChild(product));
    };
    
    // Clear all filters
    window.clearFilters = function() {
        document.getElementById('searchInput').value = '';
        document.getElementById('categoryFilter').value = '';
        document.getElementById('sortSelect').value = 'newest';
        filterAndDisplay();
    };
    
    // Filter and display products
    function filterAndDisplay() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const selectedCategory = document.getElementById('categoryFilter').value;
        
        let visibleCount = 0;
        
        allProducts.forEach(product => {
            let show = true;
            
            // Search filter
            if (searchTerm) {
                const title = product.dataset.title;
                const author = product.dataset.author;
                if (!title.includes(searchTerm) && !author.includes(searchTerm)) {
                    show = false;
                }
            }
            
            // Category filter
            if (selectedCategory && product.dataset.category !== selectedCategory) {
                show = false;
            }
            
            // Show/hide product
            if (show) {
                product.style.display = 'block';
                visibleCount++;
            } else {
                product.style.display = 'none';
            }
        });
        
        // Update count
        document.getElementById('productsCount').textContent = `Showing ${visibleCount} products`;
        
        // Sort after filtering
        if (visibleCount > 0) {
            sortProducts();
        }
    }
    
    // Add to cart function (Customer Dashboard style)
    window.addToCart = function(productId) {
        console.log('🛒 Adding product to cart:', productId);
        
        // Check if product is in stock before adding
        const productElement = document.querySelector(`[data-id="${productId}"]`);
        if (productElement) {
            const stock = parseInt(productElement.dataset.stock) || 0;
            if (stock === 0) {
                showToast('❌ Product is out of stock', 'error');
                return;
            }
        }
        
        showLoading();
        
        fetch(`${baseUrl}/customer/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                productId: productId,
                quantity: 1
            })
        })
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.success) {
                showToast('✅ Product added to cart!', 'success');
                updateCartCount();
            } else {
                showToast('❌ ' + data.message, 'error');
            }
        })
        .catch(error => {
            hideLoading();
            console.error('❌ Add to cart error:', error);
            showToast('❌ Error adding to cart', 'error');
        });
    };
    
    // Load cart count
    function loadCartCount() {
        fetch(`${baseUrl}/customer/cart/count`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateCartCountDisplay(data.count || 0);
            }
        })
        .catch(error => {
            console.error('❌ Cart count error:', error);
        });
    }
    
    // Update cart count
    function updateCartCount() {
        loadCartCount();
    }
    
    // Update cart count display
    function updateCartCountDisplay(count) {
        const cartCountEl = document.getElementById('cartCount');
        if (cartCountEl) {
            cartCountEl.textContent = count;
            cartCountEl.style.display = count > 0 ? 'flex' : 'none';
        }
    }
    
    // Open cart sidebar
    window.openCart = function() {
        console.log('🛒 Opening cart sidebar');
        loadCartItems();
        
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.add('open');
            overlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    };
    
    // Close cart sidebar
    window.closeCart = function() {
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
            document.body.style.overflow = 'auto';
        }
    };
    
    // Load cart items
    function loadCartItems() {
        fetch(`${baseUrl}/customer/cart/items`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const cartItems = data.items || [];
                displayCartItems(cartItems);
                updateCartTotal(cartItems);
            } else {
                console.error('❌ Cart items error:', data.message);
            }
        })
        .catch(error => {
            console.error('❌ Cart items fetch error:', error);
            displayCartItems([]);
            updateCartTotal([]);
        });
    }
    
    // Display cart items
    function displayCartItems(cartItems) {
        const cartItemsContainer = document.getElementById('cartItems');
        if (!cartItemsContainer) return;
        
        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 15px;"></i>
                    <p>Your cart is empty</p>
                </div>
            `;
            return;
        }
        
        cartItemsContainer.innerHTML = cartItems.map(item => `
            <div class="cart-item">
                <img src="${getProductImage(item.imagePath)}" alt="${item.title}" class="cart-item-image">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">Rs. ${item.price}</div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" onclick="updateCartItemQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateCartItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        <button class="quantity-btn" onclick="removeFromCart(${item.id})" style="margin-left: 10px; color: #e74c3c;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Get product image URL
    function getProductImage(imagePath) {
        if (!imagePath || imagePath.trim() === '') {
            return defaultImage;
        }
        
        if (imagePath.startsWith('data:image/')) {
            return imagePath;
        }
        
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        
        return baseUrl + '/' + imagePath;
    }
    
    // Update cart total
    function updateCartTotal(cartItems) {
        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const cartTotalEl = document.getElementById('cartTotal');
        if (cartTotalEl) {
            cartTotalEl.textContent = total.toFixed(2);
        }
    }
    
    // Update cart item quantity
    window.updateCartItemQuantity = function(itemId, newQuantity) {
        if (newQuantity < 1) {
            removeFromCart(itemId);
            return;
        }
        
        fetch(`${baseUrl}/customer/cart/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                cartItemId: itemId,
                quantity: newQuantity
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadCartItems();
                updateCartCount();
            } else {
                showToast('❌ ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('❌ Update cart error:', error);
            showToast('❌ Error updating cart', 'error');
        });
    };
    
    // Remove from cart
    window.removeFromCart = function(itemId) {
        fetch(`${baseUrl}/customer/cart/remove`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                cartItemId: itemId
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast('✅ Item removed from cart', 'success');
                loadCartItems();
                updateCartCount();
            } else {
                showToast('❌ ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('❌ Remove from cart error:', error);
            showToast('❌ Error removing item', 'error');
        });
    };
    
    // Go to checkout
    window.goToCheckout = function() {
        const cartItemsContainer = document.getElementById('cartItems');
        if (cartItemsContainer && cartItemsContainer.querySelector('.empty-cart')) {
            showToast('❌ Your cart is empty', 'error');
            return;
        }
        
        window.location.href = 'cart.jsp';
    };
    
    // Utility functions
    function showLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.style.display = 'flex';
    }
    
    function hideLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.style.display = 'none';
    }
    
    function showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        if (toast && toastMessage) {
            toastMessage.textContent = message;
            toast.className = `toast ${type} show`;
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
        
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
    }
    
    window.hideToast = function() {
        const toast = document.getElementById('toast');
        if (toast) toast.classList.remove('show');
    };
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCart();
        }
    });
    
    // Global functions
    window.updateOutOfStockDisplay = updateOutOfStockDisplay;
    
    console.log('✅ Products page initialized with stock display');
});