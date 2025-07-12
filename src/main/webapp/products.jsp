<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ page import="com.pahanaedu.dao.ItemDAO, com.pahanaedu.dao.CategoryDAO" %>
<%@ page import="com.pahanaedu.models.Item, com.pahanaedu.models.Category" %>
<%@ page import="java.util.List" %>

<%
// Check authentication
if (session.getAttribute("user") == null || !"CUSTOMER".equals(session.getAttribute("userRole"))) {
    response.sendRedirect("login-signup.jsp");
    return;
}

// Load data
ItemDAO itemDAO = new ItemDAO();
CategoryDAO categoryDAO = new CategoryDAO();
List<Item> products = itemDAO.getActiveItems();
List<Category> categories = categoryDAO.getActiveCategories();

request.setAttribute("products", products);
request.setAttribute("categories", categories);
%>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Products - Pahana Edu</title>
    <link rel="stylesheet" href="assets/css/products-style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-logo">
                <h2>📚 Pahana Edu</h2>
            </div>
            <div class="nav-menu">
			    <a href="customer-dashboard.jsp">Home</a>
			    <a href="products.jsp" class="active">Products</a>
			    <a href="customer-dashboard.jsp#about">About</a>
			    <a href="customer-dashboard.jsp#contact">Contact</a>
			</div>
            
            <div class="nav-actions">
                <div class="search-box">
                    <input type="text" id="searchInput" placeholder="Search books..." onkeyup="searchProducts()">
                    <button onclick="searchProducts()"><i class="fas fa-search"></i></button>
                </div>
                
                <div class="cart-icon" onclick="openCart()">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="cart-count" id="cartCount">0</span>
                </div>
                
                <div class="user-menu">
                    <span>Hello, ${sessionScope.userName}</span>
                    <div class="dropdown">
                        <i class="fas fa-user"></i>
                        <div class="dropdown-content">
                            <a href="profile.jsp">Profile</a>
                            <a href="orders.jsp">Orders</a>
                            <a href="logout">Logout</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <!-- Header -->
    <div class="page-header">
        <div class="container">
            <h1>Our Book Collection</h1>
            <p>Discover amazing books for every reader</p>
        </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
        <div class="container">
            <!-- Filters -->
            <div class="filters-section">
                <div class="filter-group">
                    <label>Category:</label>
                    <select id="categoryFilter" onchange="filterProducts()">
                        <option value="">All Categories</option>
                        <c:forEach var="category" items="${categories}">
                            <option value="${category.id}">${category.name}</option>
                        </c:forEach>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label>Sort by:</label>
                    <select id="sortSelect" onchange="sortProducts()">
                        <option value="newest">Newest First</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="name">Name A-Z</option>
                    </select>
                </div>
                
                <button class="clear-btn" onclick="clearFilters()">Clear All</button>
            </div>

            <!-- Products Count -->
            <div class="products-info">
                <span id="productsCount">Showing ${products.size()} products</span>
            </div>

            <!-- Products Grid -->
            <div class="products-grid" id="productsGrid">
                <c:choose>
                    <c:when test="${empty products}">
                        <div class="empty-state">
                            <i class="fas fa-book"></i>
                            <h3>No products available</h3>
                            <p>Check back later for new arrivals!</p>
                        </div>
                    </c:when>
                    <c:otherwise>
                        <c:forEach var="product" items="${products}">
                            <div class="product-card" 
                                 data-id="${product.id}"
                                 data-title="${product.title.toLowerCase()}"
                                 data-author="${product.author.toLowerCase()}"
                                 data-category="${product.categoryId}"
                                 data-price="${product.offerPrice != null ? product.offerPrice : product.price}">
                                
                                <div class="product-image">
                                    <img src="${product.imagePath.startsWith('data:image/') ? product.imagePath : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'}" 
                                         alt="${product.title}"
                                         onerror="this.src='https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'">
                                    
                                    <c:if test="${product.offerPrice != null}">
                                        <div class="sale-badge">SALE</div>
                                    </c:if>
                                    
                                    <c:if test="${product.stock == 0}">
                                        <div class="stock-badge">OUT OF STOCK</div>
                                    </c:if>
                                </div>
                                
                                <div class="product-info">
                                    <h3 class="product-title">${product.title}</h3>
                                    <p class="product-author">by ${product.author}</p>
                                    
                                    <div class="product-price">
                                        <c:choose>
                                            <c:when test="${product.offerPrice != null}">
                                                <span class="offer-price">Rs. ${product.offerPrice}</span>
                                                <span class="original-price">Rs. ${product.price}</span>
                                            </c:when>
                                            <c:otherwise>
                                                <span class="current-price">Rs. ${product.price}</span>
                                            </c:otherwise>
                                        </c:choose>
                                    </div>
                                    
                                    <div class="product-stock">
                                        <c:choose>
                                            <c:when test="${product.stock > 10}">
                                                <span class="stock-good">In Stock</span>
                                            </c:when>
                                            <c:when test="${product.stock > 0}">
                                                <span class="stock-low">Only ${product.stock} left</span>
                                            </c:when>
                                            <c:otherwise>
                                                <span class="stock-out">Out of Stock</span>
                                            </c:otherwise>
                                        </c:choose>
                                    </div>
                                    
                                    <button class="add-to-cart-btn" 
                                            onclick="addToCart(${product.id})"
                                            ${product.stock == 0 ? 'disabled' : ''}>
                                        <i class="fas fa-cart-plus"></i>
                                        ${product.stock == 0 ? 'Out of Stock' : 'Add to Cart'}
                                    </button>
                                </div>
                            </div>
                        </c:forEach>
                    </c:otherwise>
                </c:choose>
            </div>
        </div>
    </div>

    <!-- Cart Sidebar -->
    <div class="cart-sidebar" id="cartSidebar">
        <div class="cart-header">
            <h3>Shopping Cart</h3>
            <button class="close-cart" onclick="closeCart()">×</button>
        </div>
        
        <div class="cart-items" id="cartItems">
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
            </div>
        </div>
        
        <div class="cart-footer">
            <div class="cart-total">
                <strong>Total: Rs. <span id="cartTotal">0.00</span></strong>
            </div>
            <button class="checkout-btn" onclick="goToCheckout()">
                Proceed to Checkout
            </button>
        </div>
    </div>

    <!-- Cart Overlay -->
    <div class="cart-overlay" id="cartOverlay" onclick="closeCart()"></div>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>📚 Pahana Edu</h3>
                    <p>Your trusted online bookstore</p>
                </div>
                <div class="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="customer-dashboard.jsp">Home</a></li>
                        <li><a href="products.jsp">Products</a></li>
                        <li><a href="contact.jsp">Contact</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Contact</h4>
                    <p><i class="fas fa-phone"></i> +94 11 234 5678</p>
                    <p><i class="fas fa-envelope"></i> info@pahanaedu.lk</p>
                </div>
            </div>
        </div>
    </footer>

    <!-- Toast Notification -->
    <div class="toast" id="toast">
        <span id="toastMessage"></span>
        <button onclick="hideToast()">×</button>
    </div>

    <script src="assets/js/products.js"></script>
</body>
</html>