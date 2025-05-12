const centerTextPlugin = {
    id: 'centerText',
    beforeDraw(chart) {
        const { width, height, ctx } = chart;
        ctx.restore();

        // Calculate responsive font size based on chart dimensions
        // Use a more responsive approach for smaller screens
        const fontSize = Math.min(width, height) / 8;
        const fontSizeEm = (fontSize / 16).toFixed(2); // Convert to em for better scaling
        ctx.font = `bold ${fontSizeEm}em 'cocogoose'`;

        // Create gradient for text
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(1, '#ffc925');
        ctx.fillStyle = gradient;

        ctx.textBaseline = "middle";
        ctx.textAlign = "center"; // Center text horizontally

        const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
        const value = chart.data.datasets[0].data[0];
        const percentage = ((value / total) * 100).toFixed(1) + '%';

        // Center position
        const textX = width / 2;
        const textY = height / 2;

        // Add text shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;

        ctx.fillText(percentage, textX, textY);

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.save();
    }
};

const ctx = document.getElementById('donutChart').getContext('2d');
new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Wins', 'Losses'],
        datasets: [{
            data: [10, 5],
            backgroundColor: [
                'rgba(255, 201, 37, 1)',
                'rgba(255, 255, 255, 0.8)',
            ],
            borderWidth: 0,
            hoverBackgroundColor: [
                'rgba(255, 201, 37, 0.9)',
                'rgba(255, 255, 255, 0.9)',
            ],
            hoverBorderWidth: 2,
            hoverBorderColor: [
                'rgba(255, 255, 255, 0.8)',
                'rgba(0, 0, 0, 0.1)',
            ]
        }]
    },
    options: {
        cutout: '75%',
        radius: '90%',
        responsive: true,
        maintainAspectRatio: true,
        animation: false, // Disable all animations
        layout: {
            padding: {
                top: 5,
                right: 5,
                bottom: 5,
                left: 5
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: {
                    family: 'cocogoose',
                    size: 12
                },
                bodyFont: {
                    family: 'cocogoose',
                    size: 10
                },
                padding: 8,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1) + '%';
                        return `${label}: ${value} (${percentage})`;
                    }
                }
            }
        },
        // Ensure chart is properly sized on all devices
        onResize: function(chart, size) {
            // Recalculate font size when chart is resized
            chart.update();
        }
    },
    plugins: [centerTextPlugin]
});
