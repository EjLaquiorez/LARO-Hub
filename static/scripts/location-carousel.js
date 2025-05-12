/**
 * Location Carousel Functionality
 * Handles the carousel for location selection in the Create Game modal
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get carousel elements
    const carousel = document.querySelector('.location-carousel');
    const cardsContainer = document.querySelector('.location-cards');
    const cards = document.querySelectorAll('.location-card');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const indicators = document.querySelectorAll('.carousel-indicators .indicator');
    
    // Initialize variables
    let currentIndex = 0;
    const totalCards = cards.length;
    
    // Set initial state
    updateCarousel();
    
    // Add event listeners for navigation buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            currentIndex = (currentIndex - 1 + totalCards) % totalCards;
            updateCarousel();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            currentIndex = (currentIndex + 1) % totalCards;
            updateCarousel();
        });
    }
    
    // Add event listeners for indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', function() {
            currentIndex = index;
            updateCarousel();
        });
    });
    
    // Add event listeners for cards
    cards.forEach((card, index) => {
        card.addEventListener('click', function() {
            // First navigate to this card if it's not the current one
            if (index !== currentIndex) {
                currentIndex = index;
                updateCarousel();
            }
            
            // Then handle the selection
            cards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    
    // Function to update carousel position and state
    function updateCarousel() {
        // Update cards container position
        const translateValue = -currentIndex * (100 / totalCards);
        cardsContainer.style.transform = `translateX(${translateValue}%)`;
        
        // Update active card
        cards.forEach((card, index) => {
            if (index === currentIndex) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
        
        // Update indicators
        indicators.forEach((indicator, index) => {
            if (index === currentIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
    
    // Add touch swipe functionality for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    if (carousel) {
        carousel.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
        
        carousel.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);
    }
    
    function handleSwipe() {
        const swipeThreshold = 50; // Minimum distance to be considered a swipe
        
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swipe left - go to next
            currentIndex = (currentIndex + 1) % totalCards;
            updateCarousel();
        } else if (touchEndX > touchStartX + swipeThreshold) {
            // Swipe right - go to previous
            currentIndex = (currentIndex - 1 + totalCards) % totalCards;
            updateCarousel();
        }
    }
});
