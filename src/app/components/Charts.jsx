'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const primary = '#1f5fd1';                 // rich blue to match screenshot
const palette = ['#1f5fd1', '#22c55e', '#f59e0b', '#ef4444'];

const leadsLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const leadsData   = [120, 145, 165, 185, 160, 200];

const sourcesLabels = ['Website', 'Referral', 'Social', 'Other'];
const sourcesData   = [42, 23, 21, 14];

const dealsLabels = ['Jan'];               // slim sparkline look (single x tick like the image)
const dealsData   = [5, 6, 7, 6, 8];       // short series – we’ll hide most ticks

export default function DashboardCharts() {
  return (
    <section className="space-y-3">
    

      {/* Cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Leads by Month (shorter card, chunky rounded bars) */}
        <div className="bg-white rounded-[10px] border border-gray-200 p-4"
             style={{height: 230}}>
          <div className="mb-2 text-[14px] font-medium text-gray-900">Leads by Month</div>
          <div className="h-[160px]">
            <Bar
              data={{
                labels: leadsLabels,
                datasets: [{
                  label: 'Leads',
                  data: leadsData,
                  backgroundColor: primary,
                  borderRadius: 2,                // rounded tops
                  borderSkipped: false,
                  barPercentage: 0.6,             // thicker bars
                  categoryPercentage: 0.55,
                  maxBarThickness: 28,
                }],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: true } },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { color: '#64748b', font: { size: 12 } },
                  },
                  y: {
                    beginAtZero: true,
                    grid: { color: '#eef2f7' },
                    ticks: { color: '#9ca3af', font: { size: 12 }, stepSize: 55 },
                    suggestedMax: 220,           // tops around 220 like the image scale
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Lead Sources (tight donut ring, legend below) */}
        <div className="bg-white rounded-[10px] border border-gray-200 p-4"
             style={{height: 230}}>
          <div className="mb-2 text-[14px] font-medium text-gray-900">Lead Sources</div>
          <div className="h-[180px]">
            <Pie
              data={{
                labels: sourcesLabels,
                datasets: [{
                  data: sourcesData,
                  backgroundColor: [primary, '#22c55e', '#f59e0b', '#ef4444'],
                  borderColor: '#ffffff',
                  borderWidth: 3,
                  cutout: '68%',                 // thinner inner hole -> thicker ring
                }],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { padding: 8, usePointStyle: true, boxWidth: 6, font: { size: 12 } },
                  },
                  tooltip: { enabled: true },
                },
              }}
            />
          </div>
        </div>

        {/* Closed Deal (slim sparkline style, short y-range) */}
        <div className="bg-white rounded-[10px] border border-gray-200 p-4"
             style={{height: 230}}>
          <div className="mb-2 text-[14px] font-medium text-gray-900">Closed Deal</div>
          <div className="h-[180px]">
            <Line
              data={{
                labels: Array(dealsData.length).fill('Jan'), // only show "Jan" like the screenshot
                datasets: [{
                  data: dealsData,
                  borderColor: primary,
                  backgroundColor: 'transparent',
                  tension: 0.35,
                  pointRadius: 2,
                  pointHoverRadius: 3,
                  pointBorderWidth: 2,
                  pointBackgroundColor: '#fff',
                  pointBorderColor: primary,
                }],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: true } },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: {
                      color: '#64748b',
                      font: { size: 12 },
                      maxRotation: 0,
                      autoSkip: true,
                      autoSkipPadding: 20,
                    },
                  },
                  y: {
                    min: 5,
                    max: 11,                     // tick labels 11, 9, 7, 5 like the image
                    ticks: { color: '#9ca3af', font: { size: 10 }, stepSize: 2 },
                    grid: { color: '#eef2f7' },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
