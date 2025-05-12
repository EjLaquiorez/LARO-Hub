document.addEventListener("DOMContentLoaded", function() {
    // Get all tabs and tab content
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Add click event listener to each tab
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Get the data-tab attribute value
            const tabId = tab.getAttribute('data-tab');
            
            // Remove active class from all tabs and tab contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to the clicked tab and corresponding content
            tab.classList.add('active');
            document.querySelector(`.${tabId}-content`).classList.add('active');
        });
    });
});
