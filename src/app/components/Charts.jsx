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

const primary = '#0055AA';
const palette = ['#0055AA', '#22c55e', '#f59e0b', '#ef4444'];

const leadsLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const leadsData = [140, 165, 180, 210, 175, 220];

const sourcesLabels = ['Website', 'Referral', 'Open House', 'Social Media'];
const sourcesData = [45, 25, 10, 20];

const dealsLabels = leadsLabels;
const dealsData = [5, 6, 7, 6, 9, 11];

export default function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="rounded-[14px] border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-3 text-sm font-medium text-gray-900">Leads by Month</div>
        <div className="h-48">
          <Bar
            data={{
              labels: leadsLabels,
              datasets: [
                {
                  label: 'Leads',
                  data: leadsData,
                  backgroundColor: primary,
                  borderRadius: 6,
                  borderSkipped: false,
                },
              ],
            }}
            options={{
              maintainAspectRatio: false,
              plugins: { legend: { display: false }, tooltip: { enabled: true } },
              scales: {
                x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 12 } } },
                y: { grid: { color: '#eef2f7' }, ticks: { color: '#9ca3af', font: { size: 11 } } },
              },
            }}
          />
        </div>
      </div>

      <div className="rounded-[14px] border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-3 text-sm font-medium text-gray-900">Lead Sources</div>
        <div className="h-48">
          <Pie
            data={{
              labels: sourcesLabels,
              datasets: [
                {
                  data: sourcesData,
                  backgroundColor: palette,
                  borderColor: '#ffffff',
                  borderWidth: 2,
                },
              ],
            }}
            options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' }, tooltip: { enabled: true } } }}
          />
        </div>
      </div>

      <div className="rounded-[14px] border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-3 text-sm font-medium text-gray-900">Closed Deals Trend</div>
        <div className="h-48">
          <Line
            data={{
              labels: dealsLabels,
              datasets: [
                {
                  label: 'Deals',
                  data: dealsData,
                  borderColor: primary,
                  backgroundColor: 'rgba(0,85,170,0.08)',
                  tension: 0.35,
                  fill: true,
                  pointRadius: 2,
                  pointHoverRadius: 4,
                },
              ],
            }}
            options={{
              maintainAspectRatio: false,
              plugins: { legend: { display: false }, tooltip: { enabled: true } },
              scales: {
                x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 12 } } },
                y: { grid: { color: '#eef2f7' }, ticks: { color: '#9ca3af', font: { size: 11 } } },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}



