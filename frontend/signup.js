document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('signup-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Reset previous errors
        resetErrors();
        
        // Get all form inputs
        const name = document.getElementById('name');
        const phone = document.getElementById('phone');
        const username = document.getElementById('username');
        const email = document.getElementById('email');
        const password = document.getElementById('password');
        const storeName = document.getElementById('store-name');
        const storeAddress = document.getElementById('store-address');
        
        // Validate inputs
        let isValid = true;
        
        if (!validateName(name.value)) {
            showError(name, 'Please enter a valid full name');
            isValid = false;
        }
        
        if (!validatePhone(phone.value)) {
            showError(phone, 'Please enter a valid phone number');
            isValid = false;
        }
        
        if (!validateUsername(username.value)) {
            showError(username, 'Username must be 3-30 characters, letters, numbers, and underscores only');
            isValid = false;
        }
        
        if (!validateEmail(email.value)) {
            showError(email, 'Please enter a valid email address');
            isValid = false;
        }
        
        if (!validatePassword(password.value)) {
            showError(password, 'Password must be at least 8 characters with letters, numbers, and symbols');
            isValid = false;
        }
        
        if (storeName.value.trim().length < 2) {
            showError(storeName, 'Please enter a valid store name');
            isValid = false;
        }
        
        if (storeAddress.value.trim().length < 10) {
            showError(storeAddress, 'Please enter a complete store address');
            isValid = false;
        }
        
        if (!isValid) return;
        window.location.href = "signin.html";
        // // Show loading state
        // const button = document.querySelector('.signup-button');
        // button.classList.add('loading');
        // button.textContent = 'Creating Account...';
        
        // // Simulate API call
        // setTimeout(() => {
        //     button.classList.remove('loading');
        //     button.textContent = 'Create Account';
        //     console.log('Account created successfully');
        //     // You would typically redirect here
        // }, 2000);
    });

    // Validation functions
    function validateName(name) {
        return name.trim().length >= 2 && /^[a-zA-Z\s'-]+$/.test(name);
    }

    function validatePhone(phone) {
        return /^[\d\s-+()]{10,}$/.test(phone);
    }

    function validateUsername(username) {
        return /^[a-zA-Z0-9_]{3,30}$/.test(username);
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validatePassword(password) {
        return password.length >= 8 && 
               /[A-Z]/.test(password) && 
               /[a-z]/.test(password) && 
               /[0-9]/.test(password) && 
               /[^A-Za-z0-9]/.test(password);
    }

    function showError(input, message) {
        input.classList.add('error');
        const errorElement = input.nextElementSibling;
        if (errorElement.classList.contains('error-message')) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        } else {
            const nextError = errorElement.nextElementSibling;
            if (nextError && nextError.classList.contains('error-message')) {
                nextError.textContent = message;
                nextError.style.display = 'block';
            }
        }
        input.parentElement.classList.add('shake');
        
        setTimeout(() => {
            input.parentElement.classList.remove('shake');
        }, 500);
    }

    function resetErrors() {
        document.querySelectorAll('.form-input').forEach(input => {
            input.classList.remove('error');
            const parent = input.parentElement;
            const errorElement = parent.querySelector('.error-message');
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        });
    }

    // Add focus effects for inputs
    document.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
});