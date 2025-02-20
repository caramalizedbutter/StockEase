document.addEventListener("DOMContentLoaded", function () {
    const API_BASE_URL = "https://stockease-1.onrender.com";
    let authToken = localStorage.getItem('token') || '';
    
    // Initialize empty cart if not exists
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }

    // Navigation ripple effect
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });

    async function getStockData() {
        try {
            const response = await fetch(`${API_BASE_URL}/inventory`, {
                headers: {
                    'Authorization': authToken,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Failed to fetch inventory');
            const items = await response.json();
        const stockData = {
            low: [],
            running: [],
            available: [],
            all: items
        };

            items.forEach(item => {
            if (item.quantity <= 5) {
                stockData.low.push({
                    name: item.productName,
                    quantity: item.quantity,
                    status: 'low'
                });
            } else if (item.quantity <= 20) {
                stockData.running.push({
                    name: item.productName,
                    quantity: item.quantity,
                    status: 'running'
                });
            } else {
                stockData.available.push({
                    name: item.productName,
                    quantity: item.quantity,
                    status: 'available'
                });
            }
        });

            return stockData;
        } catch (error) {
            console.error('Error fetching inventory:', error);
            alert('Failed to load inventory data');
            return { low: [], running: [], available: [], all: [] };
        }
    }

    function getStatusClass(status) {
        switch(status) {
            case 'low': return 'status-low';
            case 'running': return 'status-running';
            case 'available': return 'status-available';
            default: return '';
        }
    }

    function showStock(type) {
        const stockData = getStockData();
        const stockList = document.getElementById('stockList');
        stockList.classList.remove('visible');
        
        setTimeout(() => {
            stockList.innerHTML = stockData[type]
                .map(item => `
                    <div class="stock-item">
                        <span class="span">
                            <span class="status-indicator ${getStatusClass(item.status)}"></span>
                            ${item.name}
                        </span>
                        <span class="quantity-badge">${item.quantity} units</span>
                    </div>
                `).join('');
            
            stockList.classList.add('visible');
        }, 300);
    }

    // Initialize with all products
    showStock('all');

    // Event listeners for stock filters
    document.getElementById('low').addEventListener('click', () => showStock('low'));
    document.getElementById('running').addEventListener('click', () => showStock('running'));
    document.getElementById('available').addEventListener('click', () => showStock('available'));

    // Search functionality
    const searchBar = document.querySelector('.search-bar');
    searchBar.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const stockData = getStockData();
        const filteredItems = stockData.all.filter(item => 
            item.name.toLowerCase().includes(searchTerm)
        );

        const stockList = document.getElementById('stockList');
        stockList.classList.remove('visible');
        
        setTimeout(() => {
            stockList.innerHTML = filteredItems
                .map(item => `
                    <div class="stock-item">
                        <span class="span">
                            <span class="status-indicator ${getStatusClass(item.status)}"></span>
                            ${item.name}
                        </span>
                        <span class="quantity-badge">${item.quantity} units</span>
                    </div>
                `).join('');
            
            stockList.classList.add('visible');
        }, 300);
    });




















    // Billing System Variables
let cart = [];
let lastScannedCode = null;
let scanCooldown = false;
const COOLDOWN_DURATION = 2000;
    
    // Initialize checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
checkoutBtn.addEventListener('click', () => checkout());
    
// Handle manual input
const scanInput = document.getElementById('scan-input');
scanInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        handleBillingScan(this.value);
        this.value = '';
    }
});

async function handleBillingScan(barcode) {
    try {
        const response = await fetch(`${API_BASE_URL}/inventory`, {
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to fetch inventory');
        
        const items = await response.json();
        const product = items.find(item => item.barcode === barcode);

        if (product) {
            if (product.quantity > 0) {
                addToCart(barcode);
            } else {
                alert('Product out of stock!');
            }
        } else {
            alert('Product not found!');
        }
    } catch (error) {
        console.error('Error handling barcode scan:', error);
        alert('Failed to process barcode scan');
    }
}

async function addToCart(barcode) {
    try {
        const response = await fetch(`${API_BASE_URL}/inventory`, {
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to fetch inventory');
        
        const items = await response.json();
        const product = items.find(item => item.barcode === barcode);
        
        if (!product) {
            alert('Product not found!');
            return;
        }

        const existingCartItem = cart.find(item => item.barcode === barcode);

        if (existingCartItem) {
            if (existingCartItem.quantity < product.quantity) {
                existingCartItem.quantity++;
                await decreaseInventoryQuantity(barcode);
            } else {
                alert('Cannot add more items than available in stock!');
            }
        } else {
            cart.push({
                barcode,
                name: product.productName,
                price: product.price,
                quantity: 1
            });
            await decreaseInventoryQuantity(barcode);
        }

        updateDisplay();
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add item to cart');
    }
}

async function decreaseInventoryQuantity(barcode) {
    try {
        const response = await fetch(`${API_BASE_URL}/inventory/${barcode}/decrease`, {
            method: 'PUT',
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to decrease inventory quantity');
    } catch (error) {
        console.error('Error decreasing inventory quantity:', error);
        throw error;
    }
}

async function increaseInventoryQuantity(barcode, amount = 1) {
    try {
        const response = await fetch(`${API_BASE_URL}/inventory/${barcode}/increase`, {
            method: 'PUT',
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount })
        });
        if (!response.ok) throw new Error('Failed to increase inventory quantity');
    } catch (error) {
        console.error('Error increasing inventory quantity:', error);
        throw error;
    }
}

function updateDisplay() {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';

    cart.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'stock-item2';
        itemDiv.innerHTML = `
            <div class="stock-flex">
                <span>${item.name}</span>
                <span>₹${parseFloat(item.price).toFixed(2)}</span>
            </div>
            <div class="stock-flex2">
                <div class="quantity-controls">
                    <button class="quantity-btn decrease" data-index="${index}">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn increase" data-index="${index}">+</button>
                </div>
                <button class="quantity-btn remove-btn" data-index="${index}">×</button>
            </div>
        `;

        // Add event listeners for this item's buttons
        const decreaseBtn = itemDiv.querySelector('.decrease');
        const increaseBtn = itemDiv.querySelector('.increase');
        const removeBtn = itemDiv.querySelector('.remove-btn');

        decreaseBtn.addEventListener('click', () => decreaseQuantity(index));
        increaseBtn.addEventListener('click', () => increaseQuantity(index));
        removeBtn.addEventListener('click', () => removeItem(index));

        productList.appendChild(itemDiv);
    });

    updateSummary();
}

async function decreaseQuantity(index) {
    const item = cart[index];
    if (item.quantity > 1) {
        item.quantity--;
        await increaseInventoryQuantity(item.barcode);
        updateDisplay();
    } else {
        removeItem(index);
    }
}

async function increaseQuantity(index) {
    const item = cart[index];
    try {
        const response = await fetch(`${API_BASE_URL}/inventory/${item.barcode}`, {
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to fetch product');
        
        const product = await response.json();
        
        if (product && product.quantity > 0) {
            item.quantity++;
            await decreaseInventoryQuantity(item.barcode);
            updateDisplay();
        } else {
            alert('No more stock available!');
        }
    } catch (error) {
        console.error('Error increasing quantity:', error);
        alert('Failed to increase quantity');
    }
}

function removeItem(index) {
    const item = cart[index];
    increaseInventoryQuantity(item.barcode, item.quantity);
    cart.splice(index, 1);
    updateDisplay();
}

function updateSummary() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    document.getElementById('total').textContent = `₹${total.toFixed(2)}`;
    document.getElementById('itemCount').textContent = `${itemCount} item${itemCount !== 1 ? 's' : ''}`;
}

function checkout() {
    if (cart.length === 0) {
        alert('Cart is empty!');
        return;
    }

    alert('Order placed successfully!');
    cart = [];
    updateDisplay();
}

// Initialize billing scanner
function initializeBillingScanner() {
    function onBillingScanSuccess(decodeText, decodeResult) {
        if (scanCooldown || decodeText === lastScannedCode) {
            return;
        }

        scanCooldown = true;
        lastScannedCode = decodeText;

        handleBillingScan(decodeText);

        setTimeout(() => {
            scanCooldown = false;
            lastScannedCode = null;
        }, COOLDOWN_DURATION);
    }

    let htmlscanner = new Html5QrcodeScanner(
        "my-qr-reader",
        { fps: 10, qrbox: 250 }
    );
    htmlscanner.render(onBillingScanSuccess);
}
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
 // Section Management
const sections = ["dashboard", "billing", "add-stock", "inventory", "profile"];
const icons = ["dashboard-icon", "billing-icon", "add-stock-icon", "inventory-icon", "profile-icon"];

icons.forEach((icon, index) => {
    document.getElementById(icon).addEventListener("click", function () {
        sections.forEach(section => {
            document.getElementById(section).style.display = "none";
        });

        let stopBtn = document.querySelectorAll('#html5-qrcode-button-camera-stop');
        stopBtn.forEach(btn => btn.click());

        document.getElementById(sections[index]).style.display = "block";
        
        // Reinitialize billing scanner if switching to billing section
        if (sections[index] === "billing") {
            initializeBillingScanner();
        }
    });
});
    
    // Set default section
    document.getElementById("dashboard").style.display = "block";

    scanCooldown = false;
    lastScannedCode = null;

    function handleScan(decodeText) {
        const items = JSON.parse(localStorage.getItem('inventoryItems') || '[]');
        const existingProduct = items.find(item => item.barcode === decodeText);

        document.getElementById('barcodeInput').value = decodeText;

        if (existingProduct) {
            document.getElementById('productName').value = existingProduct.productName;
            document.getElementById('productName').readOnly = true;
            document.getElementById('price').value = existingProduct.price;
            document.getElementById('price').readOnly = true;
            document.getElementById('expiryDate').value = existingProduct.expiryDate;
            document.getElementById('quantity').value = '';
            showNotification('Product found! Update the quantity.', 'info');
        } else {
            document.getElementById('productName').value = '';
            document.getElementById('productName').readOnly = false;
            document.getElementById('price').value = '';
            document.getElementById('price').readOnly = false;
            document.getElementById('expiryDate').value = '';
            document.getElementById('quantity').value = '';
        }
        
        document.getElementById(existingProduct ? 'quantity' : 'productName').focus();
    }

    function updateItemsList() {
        const items = JSON.parse(localStorage.getItem('inventoryItems') || '[]');
        const itemsList = document.getElementById('itemsList');
        itemsList.innerHTML = '';
        
        items.forEach(item => {
            const listItem = document.createElement('div');
            listItem.className = 'product-item2';
            
            const expiryDate = new Date(item.expiryDate);
            const formattedDate = expiryDate.toLocaleDateString();
            
            listItem.innerHTML = `
                <div>
                    <h3>${item.productName}</h3>
                    <p>Barcode: ${item.barcode}</p>
                    <p>Quantity: ${item.quantity}</p>
                    <p>Price: ₹${parseFloat(item.price).toFixed(2)}</p>
                    <p>Expiry Date: ${formattedDate}</p>
                </div>
            `;
            
            itemsList.appendChild(listItem);
        });
    }

    // Add event listeners for the new buttons
    document.getElementById('clearDisplay').addEventListener('click', function() {
        document.getElementById('itemsList').innerHTML = '';
    });

    document.getElementById('showItems').addEventListener('click', function() {
        updateItemsList();
    });

    function domReady(fn) {
        if (
            document.readyState === "complete" ||
            document.readyState === "interactive"
        ) {
            setTimeout(fn, 1000);
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    domReady(function () {
        const html5QrcodeScanner = new Html5QrcodeScanner(
            "my-qr-reader2",
            { fps: 10, qrbox: 250 }
        );

        function onScanSuccess(decodeText, decodeResult) {
            if (scanCooldown || decodeText === lastScannedCode) {
                return;
            }

            scanCooldown = true;
            lastScannedCode = decodeText;

            handleScan(decodeText);

            setTimeout(() => {
                scanCooldown = false;
                lastScannedCode = null;
            }, COOLDOWN_DURATION);
        }

        html5QrcodeScanner.render(onScanSuccess, (error) => {
            console.warn(`Code scan error = ${error}`);
        });

        updateItemsList();
    });

    document.getElementById('stockForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const barcode = document.getElementById('barcodeInput').value;
        const productName = document.getElementById('productName').value;
        const newQuantity = parseInt(document.getElementById('quantity').value);
        const price = parseFloat(document.getElementById('price').value);
        const expiryDate = document.getElementById('expiryDate').value;
        
        if (!barcode || !productName || !newQuantity || !price || !expiryDate) {
            alert('Please fill all fields');
            return;
        }
        
        const items = JSON.parse(localStorage.getItem('inventoryItems') || '[]');
        const existingProductIndex = items.findIndex(item => item.barcode === barcode);

        if (existingProductIndex !== -1) {
            items[existingProductIndex].quantity = 
                parseInt(items[existingProductIndex].quantity) + newQuantity;
        } else {
            items.unshift({
                barcode,
                productName,
                quantity: newQuantity,
                price,
                expiryDate,
                timestamp: Date.now()
            });
        }

        localStorage.setItem('inventoryItems', JSON.stringify(items));
        updateItemsList();
        
        document.getElementById('stockForm').reset();
        document.getElementById('productName').readOnly = false;
        document.getElementById('price').readOnly = false;
    });
});
