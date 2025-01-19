// Menu categories
const categories = [
    {
        id: 'pizza',
        name: 'Pizza',
        icon: 'fas fa-pizza-slice'
    },
    {
        id: 'burger',
        name: 'Burgers',
        icon: 'fas fa-hamburger'
    },
    {
        id: 'asian',
        name: 'Asian',
        icon: 'fas fa-utensils'
    },
    {
        id: 'dessert',
        name: 'Desserts',
        icon: 'fas fa-ice-cream'
    },
    {
        id: 'burgers',
        name: 'Burgers',
        icon: 'fas fa-hamburger'
    },
    {
        id: 'wraps',
        name: 'Wraps',
        icon: 'fas fa-hamburger'
    },
    {
        id: 'sides',
        name: 'Sides',
        icon: 'fas fa-hamburger'
    },
    {
        id: 'salads',
        name: 'Salads',
        icon: 'fas fa-hamburger'
    }
];

// Menu items data
const menuItems = [
    {
        id: 1,
        name: "Classic Chicken Burger",
        price: 12.99,
        image: "/images/chicken-burger.jpg",
        category: "burgers",
        rating: 4.5,
        prepTime: "15-20 min",
        description: "Juicy chicken patty with fresh lettuce, tomatoes, and our special sauce"
    },
    {
        id: 2,
        name: "Margherita Pizza",
        price: 14.99,
        image: "/images/margherita-pizza.jpg",
        category: "pizza",
        rating: 4.7,
        prepTime: "20-25 min",
        description: "Classic Italian pizza with fresh mozzarella, tomatoes, and basil"
    },
    {
        id: 3,
        name: "Vegetarian Wrap",
        price: 9.99,
        image: "/images/veg-wrap.jpg",
        category: "wraps",
        rating: 4.3,
        prepTime: "10-15 min",
        description: "Fresh vegetables, hummus, and feta cheese in a wheat tortilla"
    },
    {
        id: 4,
        name: "Double Cheese Burger",
        price: 15.99,
        image: "/images/cheese-burger.jpg",
        category: "burgers",
        rating: 4.8,
        prepTime: "15-20 min",
        description: "Two beef patties with melted cheddar and special sauce"
    },
    {
        id: 5,
        name: "Pepperoni Pizza",
        price: 16.99,
        image: "/images/pepperoni-pizza.jpg",
        category: "pizza",
        rating: 4.6,
        prepTime: "20-25 min",
        description: "Classic pepperoni pizza with extra cheese and Italian herbs"
    },
    {
        id: 6,
        name: "Chicken Caesar Wrap",
        price: 11.99,
        image: "/images/caesar-wrap.jpg",
        category: "wraps",
        rating: 4.4,
        prepTime: "10-15 min",
        description: "Grilled chicken with romaine lettuce and Caesar dressing"
    },
    {
        id: 7,
        name: "Spicy Chicken Wings",
        price: 13.99,
        image: "/images/chicken-wings.jpg",
        category: "sides",
        rating: 4.7,
        prepTime: "15-20 min",
        description: "Crispy wings tossed in our signature spicy sauce"
    },
    {
        id: 8,
        name: "Greek Salad",
        price: 10.99,
        image: "/images/greek-salad.jpg",
        category: "salads",
        rating: 4.5,
        prepTime: "5-10 min",
        description: "Fresh vegetables, olives, and feta cheese with olive oil dressing"
    }
];

let cart = [];
let currentFilter = 'all';

// Stripe test public key - replace with your actual test key
const stripe = Stripe(process.env.STRIPE_PUBLIC_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx');
let elements;

// Initialize Stripe Elements
async function initializePayment() {
    try {
        const response = await fetch('/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                amount: Math.round(parseFloat(document.getElementById('cartTotal').textContent) * 100),
                currency: 'usd'
            })
        });
        
        const { clientSecret } = await response.json();
        
        const appearance = {
            theme: 'stripe',
            variables: {
                colorPrimary: '#ff4757',
            }
        };
        
        elements = stripe.elements({ appearance, clientSecret });
        const paymentElement = elements.create('payment');
        paymentElement.mount('#payment-element');

        // Add form submission handler
        const form = document.getElementById('payment-form');
        form.addEventListener('submit', handlePaymentSubmission);
    } catch (error) {
        console.error('Payment initialization error:', error);
        showNotification('Unable to initialize payment. Please try again.', 'error');
    }
}

// Handle payment form submission
async function handlePaymentSubmission(e) {
    e.preventDefault();
    setLoading(true);

    const form = document.getElementById('payment-form');
    const submitButton = document.getElementById('submit-payment');
    submitButton.disabled = true;

    try {
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/payment-success?amount=${document.getElementById('cartTotal').textContent}`,
            },
        });

        if (error) {
            const messageContainer = document.getElementById('payment-message');
            messageContainer.textContent = error.message;
            messageContainer.classList.add('error');
            window.location.href = '/payment-failure';
        }
    } catch (error) {
        const messageContainer = document.getElementById('payment-message');
        messageContainer.textContent = 'An unexpected error occurred.';
        messageContainer.classList.add('error');
        window.location.href = '/payment-failure';
    }

    submitButton.disabled = false;
    setLoading(false);
}

// Handle the checkout process
async function initiateCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }

    try {
        // Show payment form
        document.querySelector('.checkout-btn').style.display = 'none';
        const paymentForm = document.getElementById('payment-form');
        paymentForm.classList.remove('hidden');
        
        // Initialize Stripe Elements
        await initializePayment();
        
    } catch (error) {
        showNotification('Unable to initialize payment. Please try again.', 'error');
        console.error('Payment initialization error:', error);
    }
}

// Handle successful payment
function handleSuccessfulPayment() {
    const messageContainer = document.getElementById('payment-message');
    messageContainer.textContent = 'Payment successful! Processing your order...';
    messageContainer.classList.add('success');
    
    // Clear cart and show success message
    cart = [];
    updateCart();
    showNotification('Order placed successfully! Thank you for your purchase.', 'success');
    
    // Reset payment form
    setTimeout(() => {
        document.getElementById('payment-form').classList.add('hidden');
        document.querySelector('.checkout-btn').style.display = 'block';
        toggleCart();
    }, 2000);
}

// Set loading state
function setLoading(isLoading) {
    const submitButton = document.getElementById('submit-payment');
    const spinner = document.getElementById('spinner');
    const buttonText = document.getElementById('button-text');

    if (isLoading) {
        submitButton.disabled = true;
        spinner.classList.remove('hidden');
        buttonText.classList.add('hidden');
    } else {
        submitButton.disabled = false;
        spinner.classList.add('hidden');
        buttonText.classList.remove('hidden');
    }
}

// Display categories
function displayCategories() {
    const categoryGrid = document.querySelector('.category-grid');
    if (!categoryGrid) return;

    categories.forEach(category => {
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        categoryItem.innerHTML = `
            <i class="${category.icon}"></i>
            <h3>${category.name}</h3>
        `;
        categoryItem.addEventListener('click', () => filterMenu(category.id));
        categoryGrid.appendChild(categoryItem);
    });
}

// Filter menu items
function filterMenu(category) {
    currentFilter = category;
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === category);
    });
    displayMenu();
}

// Display menu items
function displayMenu(category = 'all') {
    console.log('Displaying menu for category:', category);
    
    const menuGrid = document.getElementById('menuGrid');
    if (!menuGrid) {
        console.error('Menu grid element not found!');
        return;
    }
    
    console.log('Menu grid found, clearing contents...');
    menuGrid.innerHTML = '';

    const filteredItems = category === 'all' 
        ? menuItems 
        : menuItems.filter(item => item.category === category);
    
    console.log('Filtered items:', filteredItems.length);

    filteredItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.innerHTML = `
            <div class="item-image">
                <img src="${item.image}" alt="${item.name}" onerror="handleImageError(this)">
            </div>
            <div class="item-content">
                <div class="item-header">
                    <h3>${item.name}</h3>
                    <div class="item-rating">
                        ${getRatingStars(item.rating)}
                        <span class="prep-time"><i class="far fa-clock"></i> ${item.prepTime}</span>
                    </div>
                </div>
                <p class="item-description">${item.description}</p>
                <div class="item-footer">
                    <span class="price">$${item.price.toFixed(2)}</span>
                    <button onclick="addToCart(${item.id})" class="add-to-cart-btn">
                        <i class="fas fa-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        `;
        menuGrid.appendChild(menuItem);
    });
    
    console.log('Menu items added to grid');
}

// Get rating stars HTML
function getRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHTML = '';
    
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    
    return `<div class="stars">${starsHTML}</div>`;
}

// Toggle cart sidebar
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    cartSidebar.classList.toggle('active');
}

// Add item to cart
function addToCart(itemId) {
    const item = menuItems.find(item => item.id === itemId);
    if (item) {
        const existingItem = cart.find(cartItem => cartItem.id === itemId);
        if (existingItem) {
            existingItem.quantity += 1;
            showNotification(`Added another ${item.name} to cart!`);
        } else {
            cart.push({ ...item, quantity: 1 });
            showNotification(`${item.name} added to cart!`);
        }
        
        // Animate cart icon
        const cartIcon = document.querySelector('.cart-icon');
        cartIcon.style.transform = 'scale(1.2)';
        setTimeout(() => {
            cartIcon.style.transform = 'scale(1)';
        }, 200);

        updateCart();
        toggleCart(); // Show cart sidebar when item is added
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="${type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'}"></i>
        ${message}
    `;
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 2000);
    }, 100);
}

// Update cart display
function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartTotal = document.getElementById('cartTotal');
    const deliveryFee = parseFloat(document.getElementById('deliveryFee').textContent);
    
    cartItems.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p>$${item.price.toFixed(2)} × ${item.quantity}</p>
            </div>
            <div class="cart-item-actions">
                <p>$${itemTotal.toFixed(2)}</p>
                <div class="quantity-controls">
                    <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <button onclick="removeFromCart(${item.id})" class="remove-btn" title="Remove item">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });

    const total = subtotal + deliveryFee;
    
    // Update cart count with animation
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Update totals with animation
    cartSubtotal.textContent = subtotal.toFixed(2);
    cartTotal.textContent = total.toFixed(2);

    // Show empty cart message if needed
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-basket"></i>
                <p>Your cart is empty</p>
                <button onclick="scrollToMenu()" class="primary-btn">
                    <i class="fas fa-utensils"></i> Browse Menu
                </button>
            </div>
        `;
    }
}

// Update item quantity
function updateQuantity(itemId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(itemId);
        return;
    }
    
    const item = cart.find(item => item.id === itemId);
    if (item) {
        item.quantity = newQuantity;
        updateCart();
    }
}

// Remove item from cart
function removeFromCart(itemId) {
    const item = cart.find(item => item.id === itemId);
    if (item) {
        showNotification(`${item.name} removed from cart`, 'error');
    }
    cart = cart.filter(item => item.id !== itemId);
    updateCart();
}

// Checkout function
function checkout() {
    initiateCheckout();
}

// Scroll to menu section
function scrollToMenu() {
    document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    initializeMenu();
});

// Initialize menu and setup event listeners
function initializeMenu() {
    console.log('Initializing menu...');
    displayMenu('all');
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Add event listeners for filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    console.log('Filter buttons found:', filterButtons.length);
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log('Filter clicked:', this.getAttribute('data-category'));
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Get the category from the button's data attribute
            const category = this.getAttribute('data-category');
            // Display filtered menu items
            displayMenu(category);
        });
    });

    // Cart button click event
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', toggleCart);
    }

    // Close cart button click event
    const closeCartBtn = document.getElementById('closeCart');
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', toggleCart);
    }
}
