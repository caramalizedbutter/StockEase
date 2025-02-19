document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Create ripple effect
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            
            // Position the ripple
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            this.appendChild(ripple);
            
            // Remove ripple after animation
            setTimeout(() => ripple.remove(), 600);
        });
    });

    const stockData = {
        low: [
            { name: 'Printer Paper A4', quantity: 5 },
            { name: 'Blue Ink Cartridge', quantity: 3 },
            { name: 'Staples Box', quantity: 2 }
        ],
        running: [
            { name: 'Sticky Notes', quantity: 15 },
            { name: 'Ballpoint Pens', quantity: 20 },
            { name: 'Notebooks', quantity: 12 }
        ],
        available: [
            { name: 'File Folders', quantity: 150 },
            { name: 'Paper Clips', quantity: 500 },
            { name: 'Pencils', quantity: 200 }
        ]
    };
    
    stockData.all = [
        ...stockData.low,
        ...stockData.running,
        ...stockData.available
      ];
  
      function getStatusClass(status) {
        switch(status) {
          case 'low': return 'status-low';
          case 'running': return 'status-running';
          case 'available': return 'status-available';
          default: return '';
        }
      }
  
      function showStock(type) {
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

    let low = document.getElementById('low');
    let running = document.getElementById('running');
    let available = document.getElementById('available');

    low.addEventListener('click', () => showStock('low'));
    running.addEventListener('click', () => showStock('running'));
    available.addEventListener('click', () => showStock('available'));

    // Search functionality
    const searchBar = document.querySelector('.search-bar');
    searchBar.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
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
    const products = {
        '123456': { name: 'Printer Paper A4', price: 9.99 },
        '789012': { name: 'Blue Ink Cartridge', price: 24.99 },
        '345678': { name: 'Staples Box', price: 4.99 },
        '901234': { name: 'Sticky Notes', price: 3.99 }
    };

    let cart = [];
    let lastScannedCode = null;
    let scanCooldown = false;
    const COOLDOWN_DURATION = 2000; // 2 seconds cooldown
    const checkoutBtn = document.getElementById('checkout-btn');
    checkoutBtn.addEventListener('click', () => checkout());

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
        function onScanSuccess(decodeText, decodeResult) {
            // Check if we're in cooldown or if this is the same code as last time
            if (scanCooldown || decodeText === lastScannedCode) {
                return;
            }

            // Set cooldown and last scanned code
            scanCooldown = true;
            lastScannedCode = decodeText;

            // Process the scanned code
            handleScan(decodeText);

            // Reset cooldown after duration
            setTimeout(() => {
                scanCooldown = false;
                lastScannedCode = null;
            }, COOLDOWN_DURATION);
        }

        let htmlscanner = new Html5QrcodeScanner(
            "my-qr-reader",
            { fps: 10, qrbox: 250 }
        );
        htmlscanner.render(onScanSuccess);
    });

    const shadedReason = document.getElementById("qr-shaded-region");
    if(shadedReason)shadedReason.remove();

    // Manual input handler remains the same
    const scanInput = document.getElementById('scan-input');
    scanInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            handleScan(this.value);
            this.value = '';
        }
    });

    // Rest of the functions remain the same
    function handleScan(barcode) {
        if (products[barcode]) {
            addToCart(barcode);
        } else {
            alert('Product not found!');
        }
    }

    function addToCart(barcode) {
        const product = products[barcode];
        const existingItem = cart.find(item => item.barcode === barcode);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                barcode,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }

        updateDisplay();
    }

    function updateQuantity(index, change) {
        cart[index].quantity += change;
        if (cart[index].quantity < 1) {
            cart.splice(index, 1);
        }
        updateDisplay();
    }

    function updateDisplay() {
        const productList = document.getElementById('productList');
        productList.innerHTML = cart.map((item, index) => `
        <div class="stock-item2">
            <div class="stock-flex">
                <span>${item.name}</span>
                <span>₹${item.price.toFixed(2)}</span>
            </div>
            <div class="stock-flex2">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" id="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
                <button class="quantity-btn remove-btn" onclick="updateQuantity(${index}, -${item.quantity})">×</button>
            </div>
        </div>
  `).join('');

        updateSummary();
    }

    function updateSummary() {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

        document.getElementById('total').textContent = `$${total.toFixed(2)}`;
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

    const sections = ["dashboard", "billing", "add-stock", "inventory", "profile"];
    const icons = ["dashboard-icon", "billing-icon", "add-stock-icon", "inventory-icon", "profile-icon"];

    icons.forEach((icon, index) => {
        document.getElementById(icon).addEventListener("click", function () {
            // Hide all sections
            sections.forEach(section => {
                document.getElementById(section).style.display = "none";
            });

            // Show the clicked section
            document.getElementById(sections[index]).style.display = "block";
        });
    });

    // Set the default section to be visible
    document.getElementById("dashboard").style.display = "block";
    
});