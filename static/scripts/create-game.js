/**
 * Create Game Module
 * Handles the create game form and submission
 */

document.addEventListener('DOMContentLoaded', () => {
    // Get form elements
    const createGameForm = document.getElementById('invitation-form');
    const createGameSubmitBtn = document.getElementById('create-game-submit-btn');
    const createGamePopup = document.getElementById('create-game-popup');
    
    if (!createGameForm || !createGameSubmitBtn) return;
    
    // Add form validation
    createGameForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Validate form
        if (validateCreateGameForm()) {
            // Submit form
            handleCreateGameSubmit();
        }
    });
    
    // Add validation to date input
    const dateInput = document.getElementById('invitation-date');
    if (dateInput) {
        // Set min date to today
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        
        dateInput.addEventListener('change', function() {
            validateDate(this);
        });
    }
    
    // Add validation to time input
    const timeInput = document.getElementById('invitation-time');
    if (timeInput) {
        timeInput.addEventListener('change', function() {
            validateTime(this);
        });
    }
    
    // Handle location card selection
    const locationCards = document.querySelectorAll('.location-card');
    locationCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove selected class from all cards
            locationCards.forEach(c => c.classList.remove('selected'));
            // Add selected class to clicked card
            this.classList.add('selected');
            
            // Update hidden court input
            const courtIdInput = document.getElementById('court-id');
            if (courtIdInput) {
                courtIdInput.value = this.getAttribute('data-court-id');
            }
        });
    });
    
    // Handle create game form submission
    if (createGameSubmitBtn) {
        createGameSubmitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Validate form
            if (validateCreateGameForm()) {
                // Submit form
                handleCreateGameSubmit();
            }
        });
    }
    
    /**
     * Validate the create game form
     * @returns {boolean} Whether the form is valid
     */
    function validateCreateGameForm() {
        // Get form values
        const date = document.getElementById('invitation-date').value;
        const time = document.getElementById('invitation-time').value;
        const gameType = document.getElementById('game-type').value;
        const eventName = document.getElementById('event-name').value;
        const selectedLocation = document.querySelector('.location-card.selected');
        
        // Validate required fields
        if (!date || !time || !gameType || !eventName) {
            showFormError('Please fill in all required fields');
            return false;
        }
        
        // Validate date
        if (!validateDate(document.getElementById('invitation-date'))) {
            return false;
        }
        
        // Validate time
        if (!validateTime(document.getElementById('invitation-time'))) {
            return false;
        }
        
        // Validate location
        if (!selectedLocation) {
            showFormError('Please select a location');
            return false;
        }
        
        return true;
    }
    
    /**
     * Validate date input
     * @param {HTMLInputElement} dateInput - Date input element
     * @returns {boolean} Whether the date is valid
     */
    function validateDate(dateInput) {
        if (!dateInput) return false;
        
        const selectedDate = new Date(dateInput.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            dateInput.setCustomValidity('Please select a future date');
            showFormError('Date cannot be in the past');
            return false;
        } else {
            dateInput.setCustomValidity('');
            return true;
        }
    }
    
    /**
     * Validate time input
     * @param {HTMLInputElement} timeInput - Time input element
     * @returns {boolean} Whether the time is valid
     */
    function validateTime(timeInput) {
        if (!timeInput) return false;
        
        const dateInput = document.getElementById('invitation-date');
        if (!dateInput) return true;
        
        const selectedDate = new Date(dateInput.value);
        const today = new Date();
        
        // Only validate time if the date is today
        if (selectedDate.toDateString() === today.toDateString()) {
            const selectedTime = timeInput.value;
            const [hours, minutes] = selectedTime.split(':').map(Number);
            const selectedDateTime = new Date(selectedDate);
            selectedDateTime.setHours(hours, minutes, 0, 0);
            
            if (selectedDateTime <= new Date()) {
                timeInput.setCustomValidity('Please select a future time');
                showFormError('Time must be in the future for today\'s date');
                return false;
            } else {
                timeInput.setCustomValidity('');
                return true;
            }
        }
        
        return true;
    }
    
    /**
     * Show form error message
     * @param {string} message - Error message
     */
    function showFormError(message) {
        // Check if error element exists
        let errorElement = document.getElementById('create-game-error');
        
        if (!errorElement) {
            // Create error element
            errorElement = document.createElement('div');
            errorElement.id = 'create-game-error';
            errorElement.className = 'form-error';
            
            // Insert before form
            createGameForm.parentNode.insertBefore(errorElement, createGameForm);
        }
        
        // Update error message
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Hide after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
    
    /**
     * Handle create game form submission
     */
    async function handleCreateGameSubmit() {
        try {
            // Show loading state
            const submitBtn = document.getElementById('create-game-submit-btn');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="bi bi-arrow-repeat spinning"></i> Creating...';
            
            // Get form data
            const formData = new FormData(createGameForm);
            const gameData = {
                title: formData.get('event-name'),
                date: formData.get('invitation-date'),
                time: formData.get('invitation-time'),
                game_type: formData.get('game-type'),
                description: formData.get('event-notes'),
                court_id: formData.get('court-id') || document.querySelector('.location-card.selected')?.getAttribute('data-court-id'),
                max_participants: 10, // Default to 10 players
                status: 'pending'
            };
            
            // Create game using game service
            const createdGame = await window.gameService.createGame(gameData);
            
            // Show success message
            showSuccessMessage('Game created successfully!');
            
            // Close popup after delay
            setTimeout(() => {
                // Close popup
                if (createGamePopup) {
                    createGamePopup.style.display = 'none';
                }
                
                // Reset form
                createGameForm.reset();
                
                // Clear selected location
                document.querySelectorAll('.location-card').forEach(c => c.classList.remove('selected'));
                
                // Refresh upcoming games
                if (typeof displayUpcomingGames === 'function') {
                    displayUpcomingGames(true);
                }
            }, 2000);
        } catch (error) {
            console.error('Error creating game:', error);
            showFormError('Failed to create game: ' + (error.message || 'Unknown error'));
            
            // Reset button
            const submitBtn = document.getElementById('create-game-submit-btn');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Game';
        }
    }
    
    /**
     * Show success message
     * @param {string} message - Success message
     */
    function showSuccessMessage(message) {
        // Check if success element exists
        let successElement = document.getElementById('create-game-success');
        
        if (!successElement) {
            // Create success element
            successElement = document.createElement('div');
            successElement.id = 'create-game-success';
            successElement.className = 'form-success';
            
            // Insert before form
            createGameForm.parentNode.insertBefore(successElement, createGameForm);
        }
        
        // Update success message
        successElement.textContent = message;
        successElement.style.display = 'block';
    }
});

// Add hidden court ID input to the form
document.addEventListener('DOMContentLoaded', () => {
    const invitationForm = document.getElementById('invitation-form');
    if (invitationForm && !document.getElementById('court-id')) {
        const courtIdInput = document.createElement('input');
        courtIdInput.type = 'hidden';
        courtIdInput.id = 'court-id';
        courtIdInput.name = 'court-id';
        invitationForm.appendChild(courtIdInput);
    }
});
