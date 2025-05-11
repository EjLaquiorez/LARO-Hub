document.addEventListener('DOMContentLoaded', function() {
    // Get all sport icons
    const sportIcons = document.querySelectorAll('.sport-icon');
    const sportNameElement = document.querySelector('.sport-row p');
    
    // Sport data for different sports
    const sportData = {
        basketball: {
            name: 'BASKETBALL',
            position: 'POINT GUARD',
            chartData: [10, 5] // Wins, Losses
        },
        football: {
            name: 'FOOTBALL',
            position: 'STRIKER',
            chartData: [8, 7] // Wins, Losses
        },
        volleyball: {
            name: 'VOLLEYBALL',
            position: 'SETTER',
            chartData: [6, 4] // Wins, Losses
        },
        tennis: {
            name: 'TENNIS',
            position: 'SINGLES',
            chartData: [12, 3] // Wins, Losses
        }
    };
    
    // Add click event to each sport icon
    sportIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            // Remove active class from all icons
            sportIcons.forEach(i => i.classList.remove('active'));
            
            // Add active class to clicked icon
            this.classList.add('active');
            
            // Get sport type from data attribute
            const sportType = this.getAttribute('data-sport');
            
            // Update sport name and position
            sportNameElement.textContent = sportData[sportType].name;
            document.querySelector('.position-row p').textContent = sportData[sportType].position;
            
            // Update chart data
            updateChartData(sportData[sportType].chartData);
        });
    });
    
    // Function to update chart data
    function updateChartData(data) {
        // Get the chart instance
        const chartInstance = Chart.getChart('donutChart');
        
        if (chartInstance) {
            // Update data
            chartInstance.data.datasets[0].data = data;
            
            // Update chart
            chartInstance.update();
        }
    }
});
