// Password toggle functionality
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggleButton = passwordInput.nextElementSibling;
    const icon = toggleButton.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Navbar scroll effect
function handleNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// Form validation and UI enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Navbar scroll effect
    window.addEventListener('scroll', handleNavbarScroll);
    
    // Form loading states
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                submitButton.classList.add('loading');
            }
        });
    });
    
    // Password strength indicator (only on register page)
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const requirements = document.querySelector('.password-requirements');
            if (requirements) {
                const items = requirements.querySelectorAll('li');
                // 6-8 characters
                if (password.length >= 6 && password.length <= 8) {
                    items[0].style.color = 'var(--success-color)';
                    items[0].innerHTML = '<i class="fas fa-check"></i> 6-8 characters';
                } else {
                    items[0].style.color = 'var(--error-color)';
                    items[0].innerHTML = '<i class="fas fa-times"></i> 6-8 characters';
                }
                // Uppercase
                if (/[A-Z]/.test(password)) {
                    items[1].style.color = 'var(--success-color)';
                    items[1].innerHTML = '<i class="fas fa-check"></i> One uppercase letter';
                } else {
                    items[1].style.color = 'var(--error-color)';
                    items[1].innerHTML = '<i class="fas fa-times"></i> One uppercase letter';
                }
                // Lowercase
                if (/[a-z]/.test(password)) {
                    items[2].style.color = 'var(--success-color)';
                    items[2].innerHTML = '<i class="fas fa-check"></i> One lowercase letter';
                } else {
                    items[2].style.color = 'var(--error-color)';
                    items[2].innerHTML = '<i class="fas fa-times"></i> One lowercase letter';
                }
                // Number
                if (/\d/.test(password)) {
                    items[3].style.color = 'var(--success-color)';
                    items[3].innerHTML = '<i class="fas fa-check"></i> One number';
                } else {
                    items[3].style.color = 'var(--error-color)';
                    items[3].innerHTML = '<i class="fas fa-times"></i> One number';
                }
            }
        });
    }
    
    // Real-time email validation
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            const email = this.value;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (email && !emailRegex.test(email)) {
                this.style.borderColor = 'var(--error-color)';
                showFieldError(this, 'Please enter a valid email address');
            } else if (email) {
                this.style.borderColor = 'var(--success-color)';
                removeFieldError(this);
            }
        });
    }
    
    // Auto-dismiss alerts
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => {
                alert.remove();
            }, 300);
        }, 5000);
    });
    
    // Add animation to elements when they come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.feature-card, .auth-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Add typing effect to hero title
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        let i = 0;
        
        function typeWriter() {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        }
        
        // Start typing effect after a short delay
        setTimeout(typeWriter, 500);
    }
});

// Utility functions
function showFieldError(field, message) {
    // Remove existing error
    removeFieldError(field);
    
    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.color = 'var(--error-color)';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    field.parentNode.appendChild(errorDiv);
}

function removeFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}