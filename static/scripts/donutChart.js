const centerTextPlugin = {
    id: 'centerText',
    beforeDraw(chart) {
      const { width, height, ctx } = chart;
      ctx.restore();
      const fontSize = (height / 100).toFixed(2);
      ctx.font = fontSize + "em 'cocogoose'";
      ctx.fillStyle = "white"; 
      ctx.textBaseline = "middle";
  
      const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
      const value = chart.data.datasets[0].data[0]; 
      const percentage = ((value / total) * 100).toFixed(1) + '%';
  
      const textX = Math.round((width - ctx.measureText(percentage).width) / 2);
      const textY = height / 2;
  
      ctx.fillText(percentage, textX, textY);
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
          'rgb(255, 255, 255)',
        ],
        borderWidth: 0
      }]
    },
    options: {
      cutout: '70%',
      plugins: {
        legend: {
          display: false 
        }
      }
    },
    plugins: [centerTextPlugin]
  });
  