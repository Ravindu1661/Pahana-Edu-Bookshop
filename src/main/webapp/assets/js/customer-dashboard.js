// Customer Dashboard JavaScript
document.addEventListener('DOMContentLoaded', () => {
    console.log('🛒 Customer Dashboard loaded');
    
    // Get base URL
    const contextPath = window.location.pathname.split('/')[1];
    const baseUrl = '/' + contextPath;
    
    // Default image URL
    const defaultImage = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
    
    // Global variables
    let currentUser = null;
    let cartItems = [];
    let categories = [];
    let recentProducts = [];
    let featuredProducts = [];
    
    // Initialize
    initDashboard();
    
    function initDashboard() {
        console.log('🔧 Initializing dashboard...');
        loadUserInfo();
        loadCategories();
        loadRecentProducts();
        loadFeaturedProducts();
        loadCartCount();
        setupEventListeners();
    }
    
    // Load user information
    function loadUserInfo() {
        // User info comes from JSP session
        console.log('👤 User loaded from session');
    }
    
    // Load categories
    function loadCategories() {
        console.log('🏷️ Loading categories...');
        
        fetch(`${baseUrl}/customer/categories`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                categories = data.categories || [];
                displayCategories();
                console.log(`✅ ${categories.length} categories loaded`);
            } else {
                console.error('❌ Categories API error:', data.message);
            }
        })
        .catch(error => {
            console.error('❌ Categories fetch error:', error);
            loadSampleCategories(); // Fallback to sample data
        });
    }
    
    // Load sample categories (fallback)
    function loadSampleCategories() {
        categories = [
            { id: 1, name: 'Fiction', description: 'Novels and stories', icon: 'fas fa-book' },
            { id: 2, name: 'Biography', description: 'Life stories', icon: 'fas fa-user' },
            { id: 3, name: 'Children', description: 'Kids books', icon: 'fas fa-child' },
            { id: 4, name: 'Education', description: 'Learning materials', icon: 'fas fa-graduation-cap' }
        ];
        displayCategories();
    }
    
    // Display categories
    function displayCategories() {
        const categoriesGrid = document.getElementById('categoriesGrid');
        if (!categoriesGrid) return;
        
        categoriesGrid.innerHTML = categories.map(category => `
            <div class="category-card" onclick="viewCategoryProducts(${category.id})">
                <i class="${category.icon || 'fas fa-book'}"></i>
                <h3>${category.name}</h3>
                <p>${category.description || 'Browse ' + category.name + ' books'}</p>
            </div>
        `).join('');
    }
    
    // Load recent products
    function loadRecentProducts() {
        console.log('📚 Loading recent products...');
        
        fetch(`${baseUrl}/customer/products/recent?limit=8`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                recentProducts = data.products || [];
                displayRecentProducts();
                console.log(`✅ ${recentProducts.length} recent products loaded`);
            } else {
                console.error('❌ Recent products API error:', data.message);
            }
        })
        .catch(error => {
            console.error('❌ Recent products fetch error:', error);
            loadSampleProducts('recent');
        });
    }
    
    // Load featured products
    function loadFeaturedProducts() {
        console.log('⭐ Loading featured products...');
        
        fetch(`${baseUrl}/customer/products/featured?limit=6`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                featuredProducts = data.products || [];
                displayFeaturedProducts();
                console.log(`✅ ${featuredProducts.length} featured products loaded`);
            } else {
                console.error('❌ Featured products API error:', data.message);
            }
        })
        .catch(error => {
            console.error('❌ Featured products fetch error:', error);
            loadSampleProducts('featured');
        });
    }
    
    // Load sample products (fallback)
    function loadSampleProducts(type) {
        const sampleProducts = [
            {
                id: 1,
                title: "The Great Gatsby",
                author: "F. Scott Fitzgerald",
                price: 1500,
                offerPrice: 1200,
                imagePath: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                stock: 10
            },
            {
                id: 2,
                title: "To Kill a Mockingbird",
                author: "Harper Lee",
                price: 1800,
                offerPrice: null,
                imagePath: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                stock: 5
            },
            {
                id: 3,
                title: "1984",
                author: "George Orwell",
                price: 1400,
                offerPrice: 1100,
                imagePath: "https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                stock: 8
            }
        ];
        
        if (type === 'recent') {
            recentProducts = sampleProducts;
            displayRecentProducts();
        } else {
            featuredProducts = sampleProducts.slice(0, 2);
            displayFeaturedProducts();
        }
    }
    
    // Display recent products
    function displayRecentProducts() {
        const grid = document.getElementById('recentProductsGrid');
        if (!grid) return;
        
        grid.innerHTML = recentProducts.map(product => createProductCard(product)).join('');
    }
    
    // Display featured products
    function displayFeaturedProducts() {
        const grid = document.getElementById('featuredProductsGrid');
        if (!grid) return;
        
        grid.innerHTML = featuredProducts.map(product => createProductCard(product)).join('');
    }
    
    // Create product card HTML
    function createProductCard(product) {
        const imageUrl = getProductImage(product.imagePath);
        const currentPrice = product.offerPrice || product.price;
        const originalPrice = product.offerPrice ? product.price : null;
        
        return `
            <div class="product-card">
                <img src="${imageUrl}" alt="${product.title}" class="product-image" 
                     onerror="this.src='${defaultImage}'">
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-author">by ${product.author}</p>
                    <div class="product-price">
                        <span class="current-price">Rs. ${currentPrice}</span>
                        ${originalPrice ? `<span class="original-price">Rs. ${originalPrice}</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="add-to-cart" onclick="addToCart(${product.id})" 
                                ${product.stock === 0 ? 'disabled' : ''}>
                            ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Get product image URL
    function getProductImage(imagePath) {
        if (!imagePath || imagePath.trim() === '') {
            return defaultImage;
        }
        
        // Check if it's base64 data
        if (imagePath.startsWith('data:image/')) {
            return imagePath;
        }
        
        // Check if it's a full URL
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        
        // Relative path
        return baseUrl + '/' + imagePath;
    }
    
    // Add to cart function
    function addToCart(productId) {
        console.log('🛒 Adding product to cart:', productId);
        
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
    }
    
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
    function openCart() {
        console.log('🛒 Opening cart sidebar');
        loadCartItems();
        
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.add('open');
            overlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Close cart sidebar
    function closeCart() {
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
            document.body.style.overflow = 'auto';
        }
    }
    
    // Load cart items
    function loadCartItems() {
        fetch(`${baseUrl}/customer/cart/items`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                cartItems = data.items || [];
                displayCartItems();
                updateCartTotal();
            } else {
                console.error('❌ Cart items error:', data.message);
            }
        })
        .catch(error => {
            console.error('❌ Cart items fetch error:', error);
            // Show sample cart for demo
            cartItems = [
                {
                    id: 1,
                    productId: 1,
                    title: "Sample Book",
                    price: 1500,
                    quantity: 1,
                    imagePath: defaultImage
                }
            ];
            displayCartItems();
            updateCartTotal();
        });
    }
    
    // Display cart items
    function displayCartItems() {
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
    
    // Update cart total
    function updateCartTotal() {
        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const cartTotalEl = document.getElementById('cartTotal');
        if (cartTotalEl) {
            cartTotalEl.textContent = total.toFixed(2);
        }
    }
    
    // Update cart item quantity
    function updateCartItemQuantity(itemId, newQuantity) {
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
    }
    
    // Remove from cart
    function removeFromCart(itemId) {
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
    }
    
    // Go to checkout
    function goToCheckout() {
        if (cartItems.length === 0) {
            showToast('❌ Your cart is empty', 'error');
            return;
        }
        
        window.location.href = 'checkout.jsp';
    }
    
    // View category products
    function viewCategoryProducts(categoryId) {
        window.location.href = `products.jsp?category=${categoryId}`;
    }
    
    // Search functionality
    function performSearch() {
        const searchInput = document.getElementById('searchInput');
        const query = searchInput?.value.trim();
        
        if (query) {
            window.location.href = `products.jsp?search=${encodeURIComponent(query)}`;
        }
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Search functionality
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', performSearch);
        }
        
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }
        
        // Close cart on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeCart();
            }
        });
    }
    
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
    
    function hideToast() {
        const toast = document.getElementById('toast');
        if (toast) toast.classList.remove('show');
    }
    
    // Global functions
    window.addToCart = addToCart;
    window.openCart = openCart;
    window.closeCart = closeCart;
    window.updateCartItemQuantity = updateCartItemQuantity;
    window.removeFromCart = removeFromCart;
    window.goToCheckout = goToCheckout;
    window.viewCategoryProducts = viewCategoryProducts;
    window.hideToast = hideToast;
    
    console.log('✅ Customer Dashboard initialized successfully');
});