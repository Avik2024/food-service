// Menu categories
const categories = [
    {
        id: 'all',
        name: 'All Items',
        icon: 'fas fa-utensils'
    },
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
        icon: 'fas fa-bowl-rice'
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

// Cart array to store items
let cart = [];
let currentFilter = 'all';

// Initialize the page
window.onload = function() {
    displayCategories();
    displayMenu();
    setupEventListeners();
};

// Display categories
function displayCategories() {
    const categoryGrid = document.querySelector('.category-grid');
    if (!categoryGrid) return;

    categories.forEach(category => {
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        categoryItem.innerHTML = `
            <i class="${category.icon}"></i>
            <span>${category.name}</span>
        `;
        categoryItem.addEventListener('click', () => filterMenu(category.id));
        categoryGrid.appendChild(categoryItem);
    });
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
            <img src="${item.image}" alt="${item.name}" onerror="handleImageError(this)">
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

// Filter menu items
function filterMenu(category) {
    currentFilter = category;
    displayMenu();
    
    // Update active state of filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.dataset.filter === category) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
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

// Add to cart function
function addToCart(itemId) {
    const item = menuItems.find(item => item.id === itemId);
    if (item) {
        cart.push(item);
        updateCartDisplay();
        // Show some feedback
        showToast('Item added to cart!');
    }
}

// Update cart display
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartCount = document.getElementById('cartCount');
    
    if (cartItems && cartTotal && cartCount) {
        cartItems.innerHTML = '';
        let total = 0;
        
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>$${item.price.toFixed(2)}</p>
                </div>
            `;
            cartItems.appendChild(cartItem);
            total += item.price;
        });
        
        cartTotal.textContent = `$${total.toFixed(2)}`;
        cartCount.textContent = cart.length;
    }
}

// Show toast message
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 2000);
    }, 100);
}

// Toggle cart sidebar
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
        cartSidebar.classList.toggle('open');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Add event listeners for filter buttons
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', () => filterMenu(button.dataset.filter));
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

// Handle image errors
function handleImageError(img) {
    img.onerror = null; // Prevent infinite loop
    img.src = '/images/placeholder.svg';
}
