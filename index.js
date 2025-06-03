// Client logos data
const clientLogos = [
    { name: 'Tarayummy', logo: 'pfps/tarayummy.jpg', channelLink: 'https://www.youtube.com/@tarayummy' },
    { name: 'Jake Webber', logo: 'pfps/jake webber.jpg', channelLink: 'https://www.youtube.com/@Jakewebber9' },
    { name: 'Connor Sinann', logo: 'pfps/connor sinann.jpg', channelLink: 'https://www.youtube.com/@connorsinann' },
    { name: 'Hew Moran', logo: 'pfps/hew moran.jpg', channelLink: 'https://www.youtube.com/@HewMoran' },
    { name: 'Larry King', logo: 'pfps/larry king.jpg', channelLink: 'https://www.youtube.com/@LarryKingExclusive' },
    { name: 'Chronic', logo: 'pfps/chronic.jpg', channelLink: 'https://www.youtube.com/@ChronicIRL' },
    { name: 'Jake Webber Live', logo: 'pfps/jake webber live.jpg', channelLink: 'https://www.youtube.com/@JakeWebberLive' },
    { name: 'Dom Brack', logo: 'pfps/dom brack.jpg', channelLink: 'https://www.youtube.com/@DominicBrack' },
    { name: 'Gavin Magnus', logo: 'pfps/gavin magnus.jpg', channelLink: 'https://www.youtube.com/@GavinMagnusOfficial' },
    { name: 'Matt Radiant', logo: 'pfps/mattradiant.jpg', channelLink: 'https://www.youtube.com/@Matt.Radiant' },
    { name: 'Deuce', logo: 'pfps/deuce.jpg', channelLink: 'https://www.youtube.com/@Deuce.YouTube' },
    { name: 'Tarayummy Live', logo: 'pfps/tarayummylive.jpg', channelLink: 'https://www.youtube.com/@tarayummylive' },
    { name: 'Adrian Watts', logo: 'pfps/adrian watts.jpg', channelLink: 'https://www.youtube.com/@itsadrianwatts' },
    { name: 'Sernando', logo: 'pfps/Sernando.webp', channelLink: 'https://www.youtube.com/@Sernando' }
];

// Initialize carousel with better performance
function initCarousel() {
    const carouselTrack = document.querySelector('.carousel-track');
    if (!carouselTrack) return;
    
    // Create logo elements with links
    clientLogos.forEach(client => {
        const logoDiv = document.createElement('div');
        logoDiv.className = 'carousel-item';
        logoDiv.innerHTML = `
            <a href="${client.channelLink}" target="_blank">
                <img src="${client.logo}" alt="${client.name}" loading="lazy">
            </a>`;
        carouselTrack.appendChild(logoDiv);
    });

    // Clone items multiple times for smoother infinite scroll
    const items = Array.from(carouselTrack.children);
    // Clone the items 3 times to ensure smooth looping
    for (let i = 0; i < 3; i++) {
        items.forEach(item => {
            const clone = item.cloneNode(true);
            carouselTrack.appendChild(clone);
        });
    }

    // Calculate total width for animation
    const totalWidth = (items.length * 220); // 200px width + 20px gap
    carouselTrack.style.setProperty('--total-width', `${totalWidth}px`);
    
    // Start animation
    requestAnimationFrame(() => {
        carouselTrack.classList.add('animate');
    });

    // Reset animation when it completes to create seamless loop
    carouselTrack.addEventListener('animationend', () => {
        carouselTrack.classList.remove('animate');
        // Use requestAnimationFrame to ensure smooth transition
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                carouselTrack.classList.add('animate');
            });
        });
    });
}

// Lazy load images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    if ('loading' in HTMLImageElement.prototype) {
        // Browser supports lazy loading
        return;
    } else {
        // Fallback for browsers that don't support lazy loading
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
}

// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Smooth scroll with debouncing
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', debounce(function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href'))?.scrollIntoView({
            behavior: 'smooth'
        });
    }, 100));
});

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add loading attribute to images
    document.querySelectorAll('img').forEach(img => {
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
        // Add width and height attributes to prevent layout shifts
        if (!img.hasAttribute('width')) {
            img.setAttribute('width', '800');
            img.setAttribute('height', '450');
        }
    });

    // Initialize features
    initCarousel();
    lazyLoadImages();
    initContactForm();
});

// Contact Form Functionality
function initContactForm() {
    emailjs.init('528mNb5rsXFiU2uwd');
    
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = document.querySelector('.btn-text');
    const btnLoading = document.querySelector('.btn-loading');
    const formStatus = document.getElementById('form-status');
    
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const name = formData.get('name').trim();
        const email = formData.get('email').trim();
        const message = formData.get('message').trim();
        
        if (!name || !email || !message) {
            showFormStatus('Please fill in all fields.', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showFormStatus('Please enter a valid email address.', 'error');
            return;
        }
        
        setLoadingState(true);
        
        try {
            const response = await emailjs.send(
                'service_fqh0j1s',
                'template_ou8blqh',
                {
                    from_name: name,
                    from_email: email,
                    message: message,
                    to_email: 'editedbyalert@gmail.com'
                }
            );
            
            console.log('Email sent successfully:', response);
            showFormStatus('Message sent successfully! I\'ll get back to you soon.', 'success');
            form.reset();
            
        } catch (error) {
            console.error('Error sending email:', error);
            showFormStatus('Sorry, there was an error sending your message. Please try again or contact me directly.', 'error');
        } finally {
            setLoadingState(false);
        }
    });
    
    function setLoadingState(isLoading) {
        submitBtn.disabled = isLoading;
        if (isLoading) {
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
        } else {
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    }
    
    function showFormStatus(message, type) {
        formStatus.textContent = message;
        formStatus.className = `form-status ${type}`;
        formStatus.style.display = 'block';
        
        if (type === 'success') {
            setTimeout(() => {
                formStatus.style.display = 'none';
            }, 5000);
        }
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}
