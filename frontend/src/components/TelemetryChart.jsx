// frontend/src/components/TelemetryChart.jsx
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function TelemetryChart({ type = 'line', labels, values, title, datasetLabel = 'Consumption (kWh)' }) {
  // Dark mode chart options
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: type === 'doughnut',
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          font: {
            family: 'Outfit, sans-serif',
            size: 11
          },
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#38bdf8',
        borderColor: '#334155',
        borderWidth: 1,
        titleFont: { family: 'Outfit, sans-serif' },
        bodyFont: { family: 'Inter, sans-serif' },
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: type === 'doughnut' ? {} : {
      x: {
        grid: {
          color: 'rgba(51, 65, 85, 0.25)',
          drawBorder: false
        },
        ticks: {
          color: '#64748b',
          font: {
            family: 'Outfit, sans-serif',
            size: 10
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(51, 65, 85, 0.25)',
          drawBorder: false
        },
        ticks: {
          color: '#64748b',
          font: {
            family: 'Outfit, sans-serif',
            size: 10
          }
        }
      }
    }
  };

  // Setup dataset colors
  let chartData = {};

  if (type === 'doughnut') {
    chartData = {
      labels: labels || [],
      datasets: [
        {
          label: datasetLabel,
          data: values || [],
          backgroundColor: [
            'rgba(25, 139, 245, 0.85)', // Azure 500
            '#10b981',                  // Emerald
            '#f59e0b',                  // Amber
            '#ec4899',                  // Pink
            '#8b5cf6',                  // Violet
          ],
          borderColor: '#0f172a',
          borderWidth: 2,
          hoverOffset: 4
        }
      ]
    };
  } else {
    // Line or Bar chart
    chartData = {
      labels: labels || [],
      datasets: [
        {
          fill: type === 'line',
          label: datasetLabel,
          data: values || [],
          borderColor: '#38bdf8', // Cyan 400
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
            gradient.addColorStop(1, 'rgba(56, 189, 248, 0)');
            return gradient;
          },
          borderWidth: 3,
          pointBackgroundColor: '#0ea5e9',
          pointBorderColor: '#0f172a',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#0ea5e9',
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.35
        }
      ]
    };
  }

  return (
    <div className="w-full h-64">
      {type === 'line' && <Line data={chartData} options={defaultOptions} />}
      {type === 'bar' && <Bar data={chartData} options={defaultOptions} />}
      {type === 'doughnut' && (
        <div className="max-w-[240px] mx-auto h-full flex items-center justify-center">
          <Doughnut data={chartData} options={defaultOptions} />
        </div>
      )}
    </div>
  );
}
