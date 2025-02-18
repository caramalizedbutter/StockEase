document.addEventListener("DOMContentLoaded", function () {
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
            alert("You Qr is : " + decodeText, decodeResult);
        }

        let htmlscanner = new Html5QrcodeScanner(
            "my-qr-reader",
            { fps: 10, qrbos: 250 }
        );
        htmlscanner.render(onScanSuccess);
    });

    document.getElementById("signin-using-username").addEventListener("click", function () {
        document.getElementById("qr").style.display = "none";
        document.getElementById("user").style.display = "block";
        let stopButton = document.getElementById("html5-qrcode-button-camera-stop");
        if (stopButton) {
            stopButton.click();
        }
    });
    document.getElementById("signin-using-qr").addEventListener("click", function () {
        document.getElementById("qr").style.display = "block";
        document.getElementById("user").style.display = "none";

    });
    document.getElementById('signin-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const identifier = document.getElementById('identifier');
        const password = document.getElementById('password');
        const button = document.querySelector('.signin-button');
        
        // Reset previous errors
        resetErrors();
        
        // Validate identifier (username or email)
        if (!isValidIdentifier(identifier.value)) {
            showError(identifier, 'Please enter a valid username or email address');
            return;
        }
        
        // Validate password
        if (password.value.length < 8) {
            showError(password, 'Password must be at least 8 characters');
            return;
        }
    });

    function isValidIdentifier(identifier) {
        // Check if it's a valid email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Check if it's a valid username (alphanumeric, underscore, hyphen, 3-30 chars)
        const usernamePattern = /^[a-zA-Z0-9_-]{3,30}$/;
        
        return emailPattern.test(identifier) || usernamePattern.test(identifier);
    }

    function showError(input, message) {
        input.classList.add('error');

        // Find the nearest error message div inside the same form-group
        const errorElement = input.parentElement.querySelector('.error-message');

        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block'; // Make it visible
        }

        // Add a shake effect for better UX
        input.parentElement.classList.add('shake');
        setTimeout(() => {
            input.parentElement.classList.remove('shake');
        }, 500);
        }

        function resetErrors() {
        document.querySelectorAll('.form-input').forEach(input => {
            input.classList.remove('error');
        
            // Find the nearest error message div inside the same form-group
            const errorElement = input.parentElement.querySelector('.error-message');
        
            if (errorElement) {
                errorElement.style.display = 'none'; // Hide error messages
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