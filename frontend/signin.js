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
            alert("Your QR is: " + decodeText);
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

    //  Single event listener for the form
    document.getElementById('signin-form').addEventListener('submit', async function(e) {
        e.preventDefault();

        const identifier = document.getElementById('identifier').value.trim();
        const password = document.getElementById('password').value.trim();
        const button = document.querySelector('.signin-button');

        // Reset previous errors
        resetErrors();

        // Validate identifier (username or email)
        if (!isValidIdentifier(identifier)) {
            showError(document.getElementById('identifier'), 'Please enter a valid username or email address');
            return;
        }

        // Validate password
        if (password.length < 8) {
            showError(document.getElementById('password'), 'Password must be at least 8 characters');
            return;
        }

        // Determine whether identifier is email or username
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
        const loginData = isEmail 
            ? { email: identifier, password } 
            : { username: identifier, password };

        // Disable button to prevent multiple clicks
        button.disabled = true;
        button.textContent = "Signing in...";

        try {
            const response = await fetch('https://stockease-1.onrender.com/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Store token in local storage (optional)
            localStorage.setItem('token', data.token);

            // Redirect to dashboard or homepage
            window.location.href = '/dashboard.html';
        } catch (error) {
            showError(document.getElementById('identifier'), error.message);
        } finally {
            button.disabled = false;
            button.textContent = "Sign In";
        }
    });

    function isValidIdentifier(identifier) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const usernamePattern = /^[a-zA-Z0-9_-]{3,30}$/;
        return emailPattern.test(identifier) || usernamePattern.test(identifier);
    }

    function showError(input, message) {
        input.classList.add('error');
        const errorElement = input.parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        input.parentElement.classList.add('shake');
        setTimeout(() => {
            input.parentElement.classList.remove('shake');
        }, 500);
    }

    function resetErrors() {
        document.querySelectorAll('.form-input').forEach(input => {
            input.classList.remove('error');
            const errorElement = input.parentElement.querySelector('.error-message');
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        });
    }

    document.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
});
