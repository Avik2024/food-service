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
    }
];

// Menu items
const menuItems = [
    {
        id: 1,
        name: "Margherita Pizza",
        description: "Fresh tomatoes, mozzarella, and basil",
        price: 12.99,
        category: "pizza",
        image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80",
        rating: 4.5,
        preparationTime: "20-25 mins"
    },
    {
        id: 2,
        name: "Pepperoni Pizza",
        description: "Classic pepperoni with extra cheese",
        price: 14.99,
        category: "pizza",
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80",
        rating: 4.8,
        preparationTime: "20-25 mins"
    },
    {
        id: 3,
        name: "Classic Burger",
        description: "Beef patty with lettuce, tomato, and special sauce",
        price: 9.99,
        category: "burger",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
        rating: 4.3,
        preparationTime: "15-20 mins"
    },
    {
        id: 4,
        name: "Chicken Burger",
        description: "Grilled chicken with avocado and bacon",
        price: 11.99,
        category: "burger",
        image: "https://images.unsplash.com/photo-1513185158878-8d8c2a2a3da3?auto=format&fit=crop&w=600&q=80",
        rating: 4.6,
        preparationTime: "15-20 mins"
    },
    {
        id: 5,
        name: "Pad Thai",
        description: "Rice noodles with shrimp and peanuts",
        price: 13.99,
        category: "asian",
        image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=600&q=80",
        rating: 4.7,
        preparationTime: "20-25 mins"
    },
    {
        id: 6,
        name: "Chicken Fried Rice",
        description: "Wok-fried rice with vegetables and egg",
        price: 11.99,
        category: "asian",
        image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80",
        rating: 4.4,
        preparationTime: "15-20 mins"
    },
    {
        id: 7,
        name: "Chocolate Cake",
        description: "Rich chocolate layer cake with ganache",
        price: 6.99,
        category: "dessert",
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80",
        rating: 4.9,
        preparationTime: "5-10 mins"
    },
    {
        id: 8,
        name: "Ice Cream Sundae",
        description: "Vanilla ice cream with hot fudge and nuts",
        price: 5.99,
        category: "dessert",
        image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80",
        rating: 4.5,
        preparationTime: "5-10 mins"
    }
];

let cart = [];
let currentFilter = 'all';

// Stripe test public key - replace with your actual test key
const stripe = Stripe('pk_test_TYooMQauvdEDq54NiTphI7jx');
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
function displayMenu() {
    const menuGrid = document.getElementById('menuGrid');
    if (!menuGrid) return;

    menuGrid.innerHTML = '';
    const filteredItems = currentFilter === 'all' 
        ? menuItems 
        : menuItems.filter(item => item.category === currentFilter);

    filteredItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="menu-item-content">
                <h3>${item.name}</h3>
                <div class="rating">
                    ${getRatingStars(item.rating)}
                    <span>${item.rating}</span>
                </div>
                <p>${item.description}</p>
                <div class="menu-item-footer">
                    <p class="price">$${item.price.toFixed(2)}</p>
                    <p class="preparation-time"><i class="fas fa-clock"></i> ${item.preparationTime}</p>
                </div>
                <button onclick="addToCart(${item.id})">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        `;
        menuGrid.appendChild(menuItem);
    });
}

// Generate rating stars
function getRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
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
window.onload = function() {
    displayCategories();
    displayMenu();
    
    // Add event listeners for filter buttons
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', () => filterMenu(button.dataset.filter));
    });
};
