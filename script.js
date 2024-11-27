// Initialize DOM references object
const dom = {};

// Application State
let currentView = 'landing';
let currentCategory = "Bundled Products";
let cartItems = [];
let currentFilters = {
    status: "All",
    sort: "Alphabetical"
};

// Admin State
let adminData = {
    apps: [],
    bundled: []
};

// Card Icons
const cardIcons = ['📊', '📈', '🔄', '📱', '💼', '🔍', '📋', '💡', '🎯', '⚡️', '🛠️', '🔐', '📡', '📑', '🔔', '💫', '🎨', '🔮'];

// Product Data Structure
const products = {
    "Bundled Products": [
        { title: "Csuite", developer: "Invent", thumbnail: "csuite", installed: true, popularity: 90 },
        { title: "Advisor Portal", developer: "Invent", thumbnail: "advisor_portal", installed: false, popularity: 85 },
        { title: "Client Portal", developer: "Invent", thumbnail: "client_portal", installed: false, popularity: 80 },
    ],
    "Data Apps": [
        { title: "Data Insights", developer: "Invent", thumbnail: "data_insights", installed: false, popularity: 70 },
        { title: "Market Analyzer", developer: "MarketSoft", thumbnail: "market_analyzer", installed: false, popularity: 68 },
        { title: "Data Warehouse", developer: "Invent", thumbnail: "data_warehouse", installed: true, popularity: 75 },
        { title: "Analytics Suite", developer: "DataTech", thumbnail: "analytics", installed: false, popularity: 72 },
    ],
    "CRM": [
        { title: "ClientMaster", developer: "CRMSolutions", thumbnail: "clientmaster", installed: false, popularity: 65 },
        { title: "RelationshipPro", developer: "RelaTech", thumbnail: "relationshippro", installed: false, popularity: 60 },
    ],
    "Financial Planning": [
        { title: "FuturePlanner", developer: "FinPlanTech", thumbnail: "futureplanner", installed: false, popularity: 70 },
        { title: "WealthMapper", developer: "WealthTech", thumbnail: "wealthmapper", installed: false, popularity: 68 },
        { title: "RetirementPlus", developer: "WealthTech", thumbnail: "retirementplus", installed: false, popularity: 66 },
    ],
    "Portfolio Management": [
        { title: "PortfolioGenius", developer: "PortfolioPro", thumbnail: "portfoliogenius", installed: true, popularity: 80 },
        { title: "ReportWizard", developer: "ReportTech", thumbnail: "reportwizard", installed: false, popularity: 75 },
    ],
    "Trading & Rebalancing": [
        { title: "TradeOptimizer", developer: "TradeTech", thumbnail: "tradeoptimizer", installed: false, popularity: 70 },
        { title: "RebalancePro", developer: "BalanceSoft", thumbnail: "rebalancepro", installed: false, popularity: 65 },
    ],
    "Risk Analysis": [
        { title: "RiskRadar", developer: "RiskTech", thumbnail: "riskradar", installed: false, popularity: 60 },
        { title: "ThreatDetector", developer: "SecurityPro", thumbnail: "threatdetector", installed: false, popularity: 55 },
    ]
};

// Initialize DOM references
function initializeDomReferences() {
    const elements = [
        'landingPage', 'marketplaceView', 'adminView', 'categoryView', 'appPage', 'cartPage',
        'productGrid', 'categoryTitle', 'notification', 'globalSearch', 'statusFilter',
        'sortOptions', 'cartCount', 'appsList', 'bundlesList', 'microappsList', 'dataappsList',
        'appForm', 'bundleForm', 'appFormData'
    ];

    elements.forEach(id => {
        dom[id] = document.getElementById(id);
    });
}

// Main Navigation Functions
function selectView(view) {
    [dom.landingPage, dom.marketplaceView, dom.adminView].forEach(el => {
        if (el) el.style.display = 'none';
    });

    switch(view) {
        case 'landing':
            if (dom.landingPage) dom.landingPage.style.display = 'block';
            break;
        case 'marketplace':
            if (dom.marketplaceView) {
                dom.marketplaceView.style.display = 'block';
                showCategory('Bundled Products');
            }
            break;
        case 'admin':
            if (dom.adminView) {
                dom.adminView.style.display = 'block';
                showAdminSection('bundled');
            }
            break;
    }

    currentView = view;
}

// Event Listeners Setup
function setupEventListeners() {
    // Main navigation
    document.getElementById('enterMarketplace')?.addEventListener('click', () => selectView('marketplace'));
    document.getElementById('enterAdmin')?.addEventListener('click', () => selectView('admin'));
    
    // Back buttons
    document.getElementById('marketplaceBack')?.addEventListener('click', () => selectView('landing'));
    document.getElementById('adminBack')?.addEventListener('click', () => selectView('landing'));

    // Category selection
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', () => {
            const category = item.dataset.category;
            if (category) showCategory(category);
        });
    });

    // Cart
    document.getElementById('cartButton')?.addEventListener('click', showCartPage);

    // Admin sections
    document.querySelectorAll('.admin-nav-button').forEach(button => {
        button.addEventListener('click', () => {
            const section = button.dataset.section;
            if (section) showAdminSection(section);
        });
    });

    // Admin actions
    document.getElementById('addApp')?.addEventListener('click', () => showAppForm());
    document.getElementById('addAppData')?.addEventListener('click', () => showAppForm(null, 'Data Apps'));
    document.getElementById('addBundle')?.addEventListener('click', () => showBundleForm());

    // Micro Apps Category Filter
    document.getElementById('microappCategoryFilter')?.addEventListener('change', e => {
        renderAdminMicroApps(e.target.value);
    });

    // Filters
    dom.statusFilter?.addEventListener('change', e => {
        currentFilters.status = e.target.value;
        applyFilters();
    });

    dom.sortOptions?.addEventListener('change', e => {
        currentFilters.sort = e.target.value;
        applyFilters();
    });

    // Search
    dom.globalSearch?.addEventListener('input', e => {
        performGlobalSearch(e.target.value);
    });
}

// Marketplace Functions
function showCategory(category) {
    currentCategory = category;
    
    if (dom.categoryView) dom.categoryView.style.display = 'block';
    if (dom.appPage) dom.appPage.style.display = 'none';
    if (dom.cartPage) dom.cartPage.style.display = 'none';
    
    if (dom.categoryTitle) dom.categoryTitle.textContent = category;
    
    highlightCurrentCategory(category);
    resetFilters();
    renderProducts(products[category] || []);
}

function highlightCurrentCategory(category) {
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.toggle('category-active', item.dataset.category === category);
    });
}

function renderProducts(productList, isSearchResult = false) {
    if (!dom.productGrid) return;
    
    dom.productGrid.innerHTML = productList.length === 0 
        ? `<div class="no-results">
            <h3>No products available</h3>
            <p>Try different filters or browse other categories</p>
           </div>`
        : '';

    productList.forEach(product => {
        const tile = createProductTile(product, isSearchResult);
        dom.productGrid.appendChild(tile);
    });
}

function createProductTile(product, showCategory = false) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.addEventListener('click', () => showAppPage(product.title));
    
    tile.innerHTML = `
        ${product.installed ? '<div class="installed-badge">✓ Installed</div>' : ''}
        <div class="tile-image">
            ${getRandomIcon()}
        </div>
        <div class="tile-info">
            <h3 class="tile-title">${product.title}</h3>
            <div class="tile-developer">${product.developer}</div>
            ${showCategory ? `<div class="tile-category">in ${product.category}</div>` : ''}
        </div>
        <div class="tile-description">
            ${getShortDescription(product.title)}
        </div>
    `;

    return tile;
}

function showAppPage(title) {
    const product = findProduct(title);
    if (!product) return;

    if (dom.categoryView) dom.categoryView.style.display = 'none';
    if (dom.appPage) {
        dom.appPage.style.display = 'block';
        dom.appPage.innerHTML = generateAppPageHTML(product);
    }
    if (dom.cartPage) dom.cartPage.style.display = 'none';
}

function generateAppPageHTML(product) {
    return `
        <div class="app-header">
            <div class="app-title-section">
                <div class="title-status">
                    <h1>${product.title}</h1>
                    ${product.installed ? 
                        '<span class="installed-badge">✓ Installed</span>' : 
                        `<button onclick="addToCart('${product.title}')" class="get-app-btn">Get App</button>`
                    }
                </div>
            </div>
            
            <div class="developer-info">
                <div class="developer-details">
                    <h2>${product.developer}</h2>
                    <p>${getDeveloperInfo(product.developer)}</p>
                </div>
            </div>

            <div class="tags">
                ${getTags(product.title).map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>

        <div class="app-content">
            <div class="app-description">
                <h3>About this App</h3>
                <p>${getFullDescription(product.title)}</p>
                
                <div class="app-metrics">
                    <div class="popularity-metric">
                        <label>Popularity</label>
                        <div class="popularity-bar-container">
                            <div class="popularity-bar" style="width: ${product.popularity}%"></div>
                        </div>
                        <span>${product.popularity}% of users have this app</span>
                    </div>
                </div>
            </div>

            <div class="app-preview">
                <h3>Preview</h3>
                <div class="preview-icon">
                    ${getRandomIcon()}
                </div>
            </div>
        </div>

        <div class="dependencies">
            <h3>Dependencies</h3>
            <div class="dependencies-cards">
                ${renderDependencyCard('Invent Data Lake', true)}
                ${renderDependencyCard('Invent Organization Management', true)}
                ${renderDependencyCard('Invent Data Egress', false)}
            </div>
        </div>

        <div class="installed-apps">
            <h3>Installed Apps</h3>
            <p>These are the apps that come with this bundled product.</p>
            ${renderAppCategories('Installed')}
        </div>

        <div class="available-apps">
            <h3>Available Apps</h3>
            <p>These apps are available to be added to this bundled product.</p>
            ${renderAppCategories('Available')}
        </div>
    `;
}

function renderDependencyCard(name, available) {
    return `
        <div class="dependency-card ${available ? 'available' : 'not-available'}">
            <div class="dependency-icon">
                ${available ? '✅' : '❌'}
            </div>
            <div class="dependency-info">
                <h4>${name}</h4>
            </div>
        </div>
    `;
}

function renderAppCategories(status) {
    const categories = ['CRM', 'Financial Planning', 'Portfolio Management', 'Trading & Rebalancing', 'Risk Analysis'];
    return categories.map(category => `
        <div class="category-group">
            <div class="category-header" onclick="toggleCategory('${status}-${category}')">
                <span class="category-icon">🔹</span>
                ${category}
            </div>
            <div id="${status}-${category}" class="category-apps" style="display: none;">
                ${renderAppsByCategory(category, status)}
            </div>
        </div>
    `).join('');
}

function renderAppsByCategory(category, status) {
    let apps = products[category] || [];
    apps = apps.filter(app => {
        if (status === 'Installed') {
            return app.installed;
        } else {
            return !app.installed;
        }
    });
    return apps.map(app => `
        <div class="app-card">
            <div class="app-icon">
                ${getRandomIcon()}
            </div>
            <div class="app-info">
                <h5>${app.title}</h5>
                <p>${app.developer}</p>
            </div>
        </div>
    `).join('');
}

function toggleCategory(id) {
    const categoryDiv = document.getElementById(id);
    if (categoryDiv) {
        categoryDiv.style.display = categoryDiv.style.display === 'none' ? 'block' : 'none';
    }
}

// Search Functions
function performGlobalSearch(searchTerm) {
    if (!searchTerm) {
        showCategory(currentCategory);
        return;
    }

    searchTerm = searchTerm.toLowerCase();
    let searchResults = [];

    for (const category in products) {
        const categoryResults = products[category].filter(product => 
            product.title.toLowerCase().includes(searchTerm) ||
            product.developer.toLowerCase().includes(searchTerm) ||
            getShortDescription(product.title).toLowerCase().includes(searchTerm)
        );
        
        categoryResults.forEach(product => {
            searchResults.push({
                ...product,
                category
            });
        });
    }

    showSearchResults(searchResults, searchTerm);
}

function showSearchResults(results, searchTerm) {
    if (dom.categoryTitle) {
        dom.categoryTitle.textContent = `Search Results for "${searchTerm}"`;
    }
    renderProducts(results, true);
}

// Filter Functions
function applyFilters() {
    let filteredProducts = products[currentCategory] || [];

    if (currentFilters.status !== "All") {
        filteredProducts = filteredProducts.filter(product => {
            switch(currentFilters.status) {
                case "Installed": return product.installed;
                case "Available": return !product.installed;
                case "Popular": return product.popularity >= 70;
                default: return true;
            }
        });
    }

    filteredProducts.sort((a, b) => {
        switch(currentFilters.sort) {
            case "Alphabetical":
                return a.title.localeCompare(b.title);
            case "Popularity":
                return b.popularity - a.popularity;
            default: return 0;
        }
    });

    renderProducts(filteredProducts);
}

function resetFilters() {
    currentFilters = {
        status: "All",
        sort: "Alphabetical"
    };
    
    if (dom.statusFilter) dom.statusFilter.value = "All";
    if (dom.sortOptions) dom.sortOptions.value = "Alphabetical";
}

// Cart Functions
function showCartPage() {
    if (dom.categoryView) dom.categoryView.style.display = "none";
    if (dom.appPage) dom.appPage.style.display = "none";
    if (dom.cartPage) {
        dom.cartPage.style.display = "block";
        cartItems.length === 0 ? renderEmptyCart() : renderCart();
    }
}

function renderCart() {
    if (!dom.cartPage) return;
    
    const cartProducts = cartItems.map(findProduct).filter(Boolean);
    
    dom.cartPage.innerHTML = `
        <h2>Your Cart (${cartProducts.length} items)</h2>
        <div class="cart-items">
            ${cartProducts.map(product => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-icon">${getRandomIcon()}</div>
                        <div class="cart-item-details">
                            <h3>${product.title}</h3>
                            <p>${product.developer}</p>
                        </div>
                    </div>
                    <button onclick="removeFromCart('${product.title}')" class="remove-button">
                        Remove
                    </button>
                </div>
            `).join('')}
        </div>
        <div class="cart-actions">
            <button onclick="checkout()" class="checkout-button">
                Proceed to Checkout
            </button>
        </div>
    `;
}

function renderEmptyCart() {
    if (!dom.cartPage) return;
    
    dom.cartPage.innerHTML = `
        <div class="empty-cart">
            <h3>Your Cart is Empty</h3>
            <p>Browse the marketplace to add apps to your cart</p>
            <button onclick="showCategory('Bundled Products')" class="browse-button">
                Browse Apps
            </button>
        </div>
    `;
}

function addToCart(title) {
    if (cartItems.includes(title)) {
        showNotification('This item is already in your cart', 'warning');
        return;
    }
    
    cartItems.push(title);
    updateCartCount();
    showNotification('Item added to cart');
}

function removeFromCart(title) {
    cartItems = cartItems.filter(item => item !== title);
    updateCartCount();
    showCartPage();
    showNotification('Item removed from cart');
}

function updateCartCount() {
    if (dom.cartCount) {
        dom.cartCount.textContent = cartItems.length;
    }
}

function checkout() {
    if (cartItems.length === 0) {
        showNotification('Your cart is empty', 'warning');
        return;
    }
    
    showNotification('Processing your order...', 'success');
    setTimeout(() => {
        cartItems.forEach(title => {
            const product = findProduct(title);
            if (product) product.installed = true;
        });
        cartItems = [];
        updateCartCount();
        showCartPage();
        showNotification('Thank you for your order!', 'success');
        saveToLocalStorage();
    }, 2000);
}

// Admin Functions
function showAdminSection(section) {
    document.querySelectorAll('.admin-section').forEach(s => {
        s.style.display = 'none';
    });

    const targetSectionId = `admin${section.charAt(0).toUpperCase() + section.slice(1)}`;
    const targetSection = document.getElementById(targetSectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        if (section === 'bundled') {
            renderAdminBundledProducts();
        } else if (section === 'microapps') {
            renderAdminMicroApps();
        } else if (section === 'dataapps') {
            renderAdminDataApps();
        }
    }

    // Update active state of nav buttons
    document.querySelectorAll('.admin-nav-button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === section);
    });
}

function renderAdminBundledProducts() {
    const container = document.getElementById('bundlesList');
    if (!container) return;

    const items = getBundledProducts();

    container.innerHTML = items.map(item => `
        <div class="admin-item fade-in">
            <div class="admin-item-header">
                <h3>${item.title}</h3>
                <p>${item.developer}</p>
            </div>
            <div class="admin-item-actions">
                <button onclick="editItem('bundled', '${item.title}')" class="edit-button">
                    Edit
                </button>
                <button onclick="deleteItem('bundled', '${item.title}')" class="delete-button">
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

function renderAdminMicroApps(category = 'All') {
    const container = document.getElementById('microappsList');
    if (!container) return;

    let items = getMicroApps();

    if (category !== 'All') {
        items = items.filter(app => app.category === category);
    }

    container.innerHTML = items.map(item => `
        <div class="admin-item fade-in">
            <div class="admin-item-header">
                <h3>${item.title}</h3>
                <p>${item.developer}</p>
                <p>Category: ${item.category}</p>
            </div>
            <div class="admin-item-actions">
                <button onclick="editItem('microapps', '${item.title}')" class="edit-button">
                    Edit
                </button>
                <button onclick="deleteItem('microapps', '${item.title}')" class="delete-button">
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

function renderAdminDataApps() {
    const container = document.getElementById('dataappsList');
    if (!container) return;

    const items = products['Data Apps'] || [];

    container.innerHTML = items.map(item => `
        <div class="admin-item fade-in">
            <div class="admin-item-header">
                <h3>${item.title}</h3>
                <p>${item.developer}</p>
            </div>
            <div class="admin-item-actions">
                <button onclick="editItem('dataapps', '${item.title}')" class="edit-button">
                    Edit
                </button>
                <button onclick="deleteItem('dataapps', '${item.title}')" class="delete-button">
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

function getBundledProducts() {
    return products['Bundled Products'] || [];
}

function getMicroApps() {
    return Object.entries(products)
        .filter(([key]) => ['CRM', 'Financial Planning', 'Portfolio Management', 'Trading & Rebalancing', 'Risk Analysis'].includes(key))
        .flatMap(([category, apps]) => apps.map(app => ({ ...app, category })));
}

function editItem(section, title) {
    let item;
    if (section === 'bundled') {
        item = products['Bundled Products'].find(p => p.title === title);
        showBundleForm(item);
    } else if (section === 'microapps') {
        item = getMicroApps().find(p => p.title === title);
        showAppForm(item, item.category);
    } else if (section === 'dataapps') {
        item = products['Data Apps'].find(p => p.title === title);
        showAppForm(item, 'Data Apps');
    }
}

function deleteItem(section, title) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    if (section === 'bundled') {
        const index = products['Bundled Products'].findIndex(p => p.title === title);
        if (index >= 0) products['Bundled Products'].splice(index, 1);
        renderAdminBundledProducts();
    } else if (section === 'microapps') {
        for (const category in products) {
            if (['CRM', 'Financial Planning', 'Portfolio Management', 'Trading & Rebalancing', 'Risk Analysis'].includes(category)) {
                const index = products[category].findIndex(p => p.title === title);
                if (index >= 0) products[category].splice(index, 1);
            }
        }
        renderAdminMicroApps();
    } else if (section === 'dataapps') {
        const index = products['Data Apps'].findIndex(p => p.title === title);
        if (index >= 0) products['Data Apps'].splice(index, 1);
        renderAdminDataApps();
    }

    showNotification(`${section === 'bundled' ? 'Bundle' : 'App'} deleted successfully`);
    saveToLocalStorage();
}

function showAppForm(app = null, category = 'Data Apps') {
    const container = category === 'Data Apps' ? document.getElementById('appFormData') : document.getElementById('appForm');
    if (!container) return;

    container.style.display = 'block';
    container.innerHTML = createAppFormHTML(app, category);
}

function showBundleForm(bundle = null) {
    const container = document.getElementById('bundleForm');
    if (!container) return;

    container.style.display = 'block';
    container.innerHTML = createBundleFormHTML(bundle);
}

function createAppFormHTML(app, category) {
    const categories = ['Data Apps', 'CRM', 'Financial Planning', 'Portfolio Management', 'Trading & Rebalancing', 'Risk Analysis'];

    return `
        <h3>${app ? 'Edit App' : 'Add New App'}</h3>
        <form onsubmit="saveApp(event, '${category}')">
            <div class="form-group">
                <label class="form-label">App Name</label>
                <input type="text" class="form-input" name="title" value="${app?.title || ''}" required>
            </div>

            <div class="form-group">
                <label class="form-label">Developer</label>
                <input type="text" class="form-input" name="developer" value="${app?.developer || ''}" required>
            </div>

            <div class="form-group">
                <label class="form-label">Category</label>
                <select name="category" class="form-input" required>
                    ${categories.map(cat => `
                        <option value="${cat}" ${cat === category ? 'selected' : ''}>${cat}</option>
                    `).join('')}
                </select>
            </div>

            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-input" name="description" rows="3" required>${app ? getShortDescription(app.title) : ''}</textarea>
            </div>

            <div class="form-group">
                <label class="form-label">Popularity (0-100)</label>
                <input type="number" class="form-input" name="popularity" min="0" max="100" value="${app?.popularity || 50}" required>
            </div>

            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" name="installed" ${app?.installed ? 'checked' : ''}>
                    Installed
                </label>
            </div>

            <div class="form-actions">
                <button type="button" onclick="cancelEdit()" class="cancel-button">Cancel</button>
                <button type="submit" class="save-button">Save App</button>
            </div>
        </form>
    `;
}

function createBundleFormHTML(bundle) {
    const apps = getApps();

    return `
        <h3>${bundle ? 'Edit Bundle' : 'Add New Bundle'}</h3>
        <form onsubmit="saveBundle(event)">
            <div class="form-group">
                <label class="form-label">Bundle Name</label>
                <input type="text" class="form-input" name="title" value="${bundle?.title || ''}" required>
            </div>

            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-input" name="description" rows="3" required>${bundle ? getShortDescription(bundle.title) : ''}</textarea>
            </div>

            <div class="form-group">
                <label class="form-label">Included Apps</label>
                <div class="checkbox-grid">
                    ${apps.map(app => `
                        <label class="checkbox-label">
                            <input type="checkbox" name="includedApps" value="${app.title}" ${bundle?.includedApps?.includes(app.title) ? 'checked' : ''}>
                            ${app.title}
                        </label>
                    `).join('')}
                </div>
            </div>

            <div class="form-actions">
                <button type="button" onclick="cancelEdit()" class="cancel-button">Cancel</button>
                <button type="submit" class="save-button">Save Bundle</button>
            </div>
        </form>
    `;
}

function getApps() {
    return Object.entries(products)
        .filter(([key]) => key !== 'Bundled Products')
        .flatMap(([category, apps]) => apps);
}

function saveApp(event, category) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const app = {
        title: formData.get('title'),
        developer: formData.get('developer'),
        description: formData.get('description'),
        popularity: Number(formData.get('popularity')),
        installed: formData.get('installed') === 'on',
        thumbnail: formData.get('title').toLowerCase().replace(/\s+/g, '_')
    };

    const selectedCategory = formData.get('category') || category;

    let targetCategory = selectedCategory;
    if (!products[targetCategory]) products[targetCategory] = [];

    const existingIndex = products[targetCategory].findIndex(p => p.title === app.title);
    if (existingIndex >= 0) {
        products[targetCategory][existingIndex] = app;
    } else {
        products[targetCategory].push(app);
    }

    cancelEdit();
    if (selectedCategory === 'Data Apps') {
        renderAdminDataApps();
    } else {
        renderAdminMicroApps();
    }
    showNotification('App saved successfully');
    saveToLocalStorage();
}

function saveBundle(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const includedApps = Array.from(form.querySelectorAll('input[name="includedApps"]:checked'))
        .map(input => input.value);

    const bundle = {
        title: formData.get('title'),
        developer: 'Invent',
        description: formData.get('description'),
        popularity: Number(formData.get('popularity') || 50),
        installed: formData.get('installed') === 'on',
        thumbnail: formData.get('title').toLowerCase().replace(/\s+/g, '_'),
        includedApps
    };

    const existingIndex = products['Bundled Products'].findIndex(p => p.title === bundle.title);
    if (existingIndex >= 0) {
        products['Bundled Products'][existingIndex] = bundle;
    } else {
        products['Bundled Products'].push(bundle);
    }

    cancelEdit();
    renderAdminBundledProducts();
    showNotification('Bundle saved successfully');
    saveToLocalStorage();
}

function cancelEdit() {
    const appForm = document.getElementById('appForm');
    const appFormData = document.getElementById('appFormData');
    const bundleForm = document.getElementById('bundleForm');
    if (appForm) appForm.style.display = 'none';
    if (appFormData) appFormData.style.display = 'none';
    if (bundleForm) bundleForm.style.display = 'none';
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) return;

    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.className = 'notification';
    }, 3000);
}

// Helper Functions
function getRandomIcon() {
    return cardIcons[Math.floor(Math.random() * cardIcons.length)];
}

function getShortDescription(title) {
    const descriptions = {
        "Csuite": "Complete executive suite for wealth management leadership with real-time analytics and decision-making tools.",
        "Advisor Portal": "Comprehensive platform for financial advisors with portfolio management and client engagement tools.",
        "Client Portal": "Secure and intuitive interface for client portfolio access and communication.",
        "Data Insights": "AI-powered analytics platform for actionable financial insights.",
        "Market Analyzer": "Real-time market analysis with predictive modeling capabilities.",
        "Data Warehouse": "Enterprise-grade data storage and analytics solution.",
        "Analytics Suite": "Comprehensive analytics toolkit for wealth management professionals.",
        "ClientMaster": "Advanced CRM solution optimized for wealth management.",
        "RelationshipPro": "AI-enhanced client relationship management platform.",
        "FuturePlanner": "Sophisticated financial planning and modeling tool.",
        "WealthMapper": "Visual wealth planning and strategy mapping system.",
        "RetirementPlus": "Advanced retirement planning and analysis platform.",
        "PortfolioGenius": "Intelligent portfolio management and optimization system.",
        "ReportWizard": "Automated financial reporting and documentation tool.",
        "TradeOptimizer": "AI-driven trading strategy optimization platform.",
        "RebalancePro": "Automated portfolio rebalancing with tax optimization.",
        "RiskRadar": "Comprehensive risk analysis and monitoring system.",
        "ThreatDetector": "Advanced security and risk detection platform."
    };
    return descriptions[title] || "Innovative wealth management solution.";
}

function getDeveloperInfo(developer) {
    const info = {
        "Invent": "Leading innovator in wealth management technology, known for enterprise-grade solutions.",
        "MarketSoft": "Specialists in market analysis and trading technology solutions.",
        "DataTech": "Experts in data analytics and business intelligence solutions.",
        "CRMSolutions": "Specialized in client relationship management for finance.",
        "RelaTech": "Innovators in AI-powered relationship management solutions.",
        "FinPlanTech": "Experts in financial planning and analysis tools.",
        "WealthTech": "Specialists in wealth management technology solutions.",
        "PortfolioPro": "Leaders in portfolio management solutions.",
        "ReportTech": "Experts in automated financial reporting.",
        "TradeTech": "Specialists in trading and investment technology.",
        "BalanceSoft": "Leaders in portfolio balancing solutions.",
        "RiskTech": "Experts in risk analysis and management.",
        "SecurityPro": "Specialists in financial security solutions."
    };
    return info[developer] || "Experienced wealth management solution provider.";
}

function getTags(title) {
    const tags = {
        "Csuite": ["Executive", "Analytics", "Strategy", "Enterprise"],
        "Advisor Portal": ["Portfolio", "Client Management", "Analytics", "Reporting"],
        "Client Portal": ["Self-Service", "Communication", "Security", "Portfolio"],
        "Data Insights": ["AI", "Analytics", "Big Data", "Insights"],
        "Market Analyzer": ["Markets", "Analysis", "Real-time", "Trading"],
        "Data Warehouse": ["Storage", "Analytics", "Enterprise", "Integration"],
        "Analytics Suite": ["Business Intelligence", "Reporting", "Analysis", "Enterprise"],
        "ClientMaster": ["CRM", "Client Management", "Analytics", "Automation"],
        "RelationshipPro": ["AI", "CRM", "Client Relations", "Automation"],
        "FuturePlanner": ["Planning", "Analysis", "Strategy", "Retirement"],
        "WealthMapper": ["Visualization", "Planning", "Strategy", "Wealth"],
        "RetirementPlus": ["Retirement", "Planning", "Analysis", "Strategy"],
        "PortfolioGenius": ["Portfolio", "Management", "Optimization", "Analytics"],
        "ReportWizard": ["Reporting", "Automation", "Compliance", "Documents"],
        "TradeOptimizer": ["Trading", "AI", "Optimization", "Analytics"],
        "RebalancePro": ["Portfolio", "Rebalancing", "Automation", "Tax"],
        "RiskRadar": ["Risk", "Analysis", "Monitoring", "Compliance"],
        "ThreatDetector": ["Security", "Risk", "Detection", "Protection"]
    };
    return tags[title] || ["Wealth Management", "Innovation", "Technology", "Solution"];
}

function getPrerequisites(title) {
    const prerequisites = {
        "Csuite": [
            { name: "Data Warehouse", available: true },
            { name: "Identity Management", available: true },
            { name: "Analytics Engine", available: true }
        ],
        "Advisor Portal": [
            { name: "Identity Management", available: true },
            { name: "Data Warehouse", available: true },
            { name: "Client Management System", available: false }
        ],
        "Client Portal": [
            { name: "Identity Management", available: true },
            { name: "Data Access Layer", available: true },
            { name: "Security Framework", available: false }
        ],
        // Additional prerequisites for other apps...
    };
    return prerequisites[title] || [
        { name: "Data Access Layer", available: true },
        { name: "Basic Integration", available: true }
    ];
}

function getFullDescription(title) {
    return getShortDescription(title) + ` This powerful solution integrates seamlessly with your existing workflow and provides comprehensive analytics, reporting, and management capabilities. Built with the latest technology and designed for optimal user experience, it helps streamline operations and improve decision-making processes.`;
}

function findProduct(title) {
    for (const category in products) {
        const product = products[category].find(p => p.title === title);
        if (product) return { ...product, category };
    }
    return null;
}

// Storage Functions
function saveToLocalStorage() {
    try {
        localStorage.setItem('marketplaceData', JSON.stringify(products));
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function loadFromLocalStorage() {
    try {
        const savedProducts = localStorage.getItem('marketplaceData');
        const savedCart = localStorage.getItem('cartItems');
        
        if (savedProducts) {
            Object.assign(products, JSON.parse(savedProducts));
        }
        
        if (savedCart) {
            cartItems = JSON.parse(savedCart);
            updateCartCount();
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initializeDomReferences();
    loadFromLocalStorage();
    setupEventListeners();
    selectView('landing');
    updateCartCount();
});
