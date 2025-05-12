/**
 * Clear Storage Utility
 * Adds a floating button to clear localStorage for testing purposes
 */

document.addEventListener('DOMContentLoaded', function() {
    // Create the clear button element
    const clearButton = document.createElement('button');
    clearButton.id = 'clear-storage-btn';
    clearButton.innerHTML = 'Clear Storage';
    clearButton.style.position = 'fixed';
    clearButton.style.bottom = '20px';
    clearButton.style.right = '20px';
    clearButton.style.zIndex = '9999';
    clearButton.style.padding = '10px 15px';
    clearButton.style.backgroundColor = '#AD2831';
    clearButton.style.color = 'white';
    clearButton.style.border = 'none';
    clearButton.style.borderRadius = '5px';
    clearButton.style.cursor = 'pointer';
    clearButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
    clearButton.style.fontFamily = 'Arial, sans-serif';
    clearButton.style.fontWeight = 'bold';

    // Add hover effect
    clearButton.onmouseover = function() {
        this.style.backgroundColor = '#c13039';
    };
    clearButton.onmouseout = function() {
        this.style.backgroundColor = '#AD2831';
    };

    // Add click event to clear localStorage
    clearButton.addEventListener('click', function() {
        // Get the number of items in localStorage
        const itemCount = Object.keys(localStorage).length;
        
        // Clear localStorage
        localStorage.clear();
        
        // Show confirmation
        alert(`Storage cleared! ${itemCount} items removed.`);
        
        // Reload the page to apply changes
        window.location.reload();
    });

    // Add the button to the page
    document.body.appendChild(clearButton);
});
