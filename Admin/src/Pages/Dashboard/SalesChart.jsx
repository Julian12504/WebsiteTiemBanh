import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Đăng ký các thành phần cần thiết của Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SalesChart = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: 'Doanh thu',
        data: data.map(item => item.revenue),
        borderColor: '#591b0d',
        backgroundColor: 'rgba(89, 27, 13, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Số đơn hàng',
        data: data.map(item => item.orders),
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.0)',
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Doanh thu (VNĐ)',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Số lượng đơn hàng',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 20,
          boxHeight: 10,
          color: '#333',
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            if (context.dataset.label === 'Doanh thu') {
              return `Doanh thu: ${context.parsed.y.toLocaleString('vi-VN')} ₫`;
            }
            if (context.dataset.label === 'Số đơn hàng') {
              return `Số đơn hàng: ${context.parsed.y}`;
            }
            return context.parsed.y;
          },
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default SalesChart;
