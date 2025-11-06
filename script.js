/**
 * Main application logic.
 * This script waits for the DOM to be loaded, then
 * initializes all event listeners.
 */

// Function to run all our setup
function initializeApp() {
  
  // --- 1. Header Scroll Effect ---
  const header = document.getElementById('main-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // --- 2. Mobile Menu Toggle ---
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIconOpen = document.getElementById('mobile-menu-icon-open');
  const menuIconClose = document.getElementById('mobile-menu-icon-close');

  const toggleMobileMenu = () => {
    mobileMenu.classList.toggle('hidden-item');
    menuIconOpen.classList.toggle('hidden-item');
    menuIconClose.classList.toggle('hidden-item');
  };
  
  if (mobileMenuButton) {
    mobileMenuButton.addEventListener('click', toggleMobileMenu);
  }

  // --- 3. Page Navigation Logic ---
  const allPages = document.querySelectorAll('.page');
  const allNavLinks = document.querySelectorAll('.nav-link');
  const allMobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  const setActivePage = (pageId) => {
    // Hide all pages
    allPages.forEach(page => {
      page.classList.remove('active');
    });
    
    // Show the target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
      targetPage.classList.add('active');
    } else {
      // Fallback to home if pageId is invalid
      document.getElementById('home').classList.add('active');
      pageId = 'home';
    }

    // Update active state for all desktop nav links
    allNavLinks.forEach(link => {
      if (link.dataset.page === pageId) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
    
    // Update active state for all mobile nav links
    allMobileNavLinks.forEach(link => {
      if (link.dataset.page === pageId) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
    
    // Close mobile menu if it's open
    if (mobileMenu && !mobileMenu.classList.contains('hidden-item')) {
      toggleMobileMenu();
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
  };

  // Add click listeners to all nav links (desktop and mobile)
  const allLinks = [...allNavLinks, ...allMobileNavLinks];
  allLinks.forEach(link => {
    // Only add listeners to links that navigate pages
    if (link.dataset.page) {
      link.addEventListener('click', (e) => {
        e.preventDefault(); // Stop the browser from adding #hash
        const pageId = e.currentTarget.dataset.page;
        setActivePage(pageId);
        // We can still set the hash for bookmarking
        if (history.pushState) {
          history.pushState(null, null, `#${pageId}`);
        } else {
          window.location.hash = pageId;
        }
      });
    }
  });
  
  // Check hash on initial page load
  const currentHash = window.location.hash.substring(1);
  if (currentHash && document.getElementById(currentHash)) {
    setActivePage(currentHash);
  } else {
    setActivePage('home'); // Default to home
  }

  // --- 4. Design Page: Filter Logic ---
  const designFilterButtons = document.querySelectorAll('.design-filter-btn');
  const designGridContainers = document.querySelectorAll('.design-grid-container');

  designFilterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetGridId = button.dataset.grid; // e.g., "design-grid-social"

      // 1. Update button 'active' state
      designFilterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // 2. Hide all grid containers
      designGridContainers.forEach(container => {
        container.classList.remove('active');
      });
      
      // 3. Show the target grid container
      const targetGrid = document.getElementById(targetGridId);
      if (targetGrid) {
        targetGrid.classList.add('active');
      }
    });
  });

  // --- 5. Design Modal Logic ---
  const designModal = document.getElementById('design-modal');
  const modalImg = document.getElementById('modal-img');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  const closeModal = () => {
    designModal.classList.add('hidden-item');
  };

  // Event listener for opening the modal
  document.querySelectorAll('.design-item').forEach(item => {
    item.addEventListener('click', () => {
      const imgSrc = item.dataset.img;
      if (imgSrc) {
        modalImg.src = imgSrc;
        const thumbnailImg = item.querySelector('img');
        if (thumbnailImg) {
          modalImg.alt = thumbnailImg.alt;
        } else {
          modalImg.alt = "Enlarged design view";
        }
        designModal.classList.remove('hidden-item');
      }
    });
  });

  modalCloseBtn.addEventListener('click', closeModal);

  designModal.addEventListener('click', (event) => {
    if (event.target === designModal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !designModal.classList.contains('hidden-item')) {
      closeModal();
    }
  });
  
  // ==========================================================
  // START: UPDATED Contact Form Logic (Section 6)
  // ==========================================================
  
  // --- 6. Contact Form Logic (with Formspree AJAX) ---
  const contactForm = document.querySelector('.contact-form'); // Use class selector
  const formStatus = document.getElementById('form-status');
  
  if(contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault(); // Stop the form from refreshing the page
      
      const form = e.target;
      const data = new FormData(form);
      
      // Show "sending" state (optional)
      formStatus.textContent = "Sending...";
      formStatus.classList.remove('hidden-item');

      // Send data to Formspree using fetch
      fetch(form.action, {
        method: form.method,
        body: data,
        headers: {
            'Accept': 'application/json'
        }
      }).then(response => {
        if (response.ok) {
          // Show success message
          formStatus.textContent = "Message sent successfully!";
          contactForm.reset(); // Clear the form
        } else {
          // Handle server errors
          response.json().then(data => {
            if (Object.hasOwn(data, 'errors')) {
              formStatus.textContent = data["errors"].map(error => error["message"]).join(", ");
            } else {
              formStatus.textContent = "Oops! There was a problem submitting your form";
            }
          });
        }
      }).catch(error => {
        // Handle network errors
        formStatus.textContent = "Oops! There was a network error.";
      });
      
      // Hide status message after 5 seconds
      setTimeout(() => {
        formStatus.classList.add('hidden-item');
        formStatus.textContent = "Message sent successfully!"; // Reset text
      }, 5000);
    });
  }
  
  // ==========================================================
  // END: UPDATED Contact Form Logic
  // ==========================================================


  // ==========================================================
  // START: Home Page Design Carousel (No Lag)
  // ==========================================================
  
  // --- 7. Home Page Design Carousel (No Loop, Starts at 3rd) ---
  const carouselTrack = document.getElementById('design-carousel-track');
  const prevBtn = document.getElementById('carousel-prev-btn');
  const nextBtn = document.getElementById('carousel-next-btn');
  
  // Check if we are on a page with the carousel
  if (carouselTrack) {
    const slides = Array.from(carouselTrack.children);
    const slideCount = slides.length;
    
    let currentIndex = 2; // Start on the 3rd image (index 2)
    let isMobile = window.innerWidth <= 768;

    // Function to update the carousel's state
    const updateCarousel = (isAnimated = true) => {
      // Set transition style
      if (!isAnimated) {
        carouselTrack.style.transition = 'none';
      } else {
        carouselTrack.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
      }
      
      isMobile = window.innerWidth <= 768; // Check mobile status
      
      // --- 1. Calculate the 'move'
      const activeSlide = slides[currentIndex];
      if (!activeSlide) return; 

      const viewportCenter = carouselTrack.parentElement.offsetWidth / 2;
      const slideCenter = activeSlide.offsetLeft + (activeSlide.offsetWidth / 2);
      const moveDistance = viewportCenter - slideCenter;
      
      if (isMobile) {
         carouselTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
      } else {
         carouselTrack.style.transform = `translateX(${moveDistance}px)`;
      }

      // --- 2. Update 'active' class (for desktop)
      if (!isMobile) {
        slides.forEach((slide, index) => {
          if (index === currentIndex) {
            slide.classList.add('active');
          } else {
            slide.classList.remove('active');
          }
        });
      }
      
      // --- 3. Arrow Hiding Logic
      if (currentIndex === 0) {
        prevBtn.style.display = 'none';
      } else {
        prevBtn.style.display = 'flex';
      }
      
      if (currentIndex === slideCount - 1) {
        nextBtn.style.display = 'none';
      } else {
        nextBtn.style.display = 'flex';
      }
    };

    // --- 4. Add Event Listeners (with guards)
    nextBtn.addEventListener('click', () => {
      if (currentIndex < slideCount - 1) {
        currentIndex++;
        updateCarousel(true); // Animate this click
      }
    });

    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel(true); // Animate this click
      }
    });

    // --- 5. CORRECTED Initial call & Resize handler ---
    
    // Run immediately (no animation)
    updateCarousel(false); 

    // Add a listener to window.onload. This fires AFTER all images
    // are loaded, so it's the safest time to do a final check.
    window.addEventListener('load', () => {
      updateCarousel(false);
    });

    // Also update on resize (no animation)
    window.addEventListener('resize', () => {
      updateCarousel(false);
    });
  }
  
  // ==========================================================
  // END: Home Page Design Carousel
  // ==========================================================


} // <-- This is the FINAL closing brace of initializeApp()

// Wait for the DOM to be fully loaded, then start the app
document.addEventListener('DOMContentLoaded', initializeApp);