'use client';

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Filler);

const primary = '#1f5fd1';                 // rich blue to match screenshot
const palette = ['#1f5fd1', '#22c55e', '#f59e0b', '#ef4444'];

// Default/fallback data for leads
const defaultLeadsLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const defaultLeadsData   = [120, 145, 165, 185, 160, 200, 180, 195, 210, 190, 175, 220];

// Default/fallback data for properties
const defaultPropertyLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const defaultPropertyData   = [15, 18, 22, 20, 25, 28, 30, 27, 32, 35, 30, 28];

export default function DashboardCharts() {
  const [leadsLabels, setLeadsLabels] = useState(defaultLeadsLabels);
  const [leadsData, setLeadsData] = useState(defaultLeadsData);
  const [closedLeadsData, setClosedLeadsData] = useState([80, 95, 110, 120, 105, 140, 125, 135, 150, 130, 115, 160]);
  const [leadsLoading, setLeadsLoading] = useState(true);

  const [propertyLabels, setPropertyLabels] = useState(defaultPropertyLabels);
  const [propertyData, setPropertyData] = useState(defaultPropertyData);
  const [propertyLoading, setPropertyLoading] = useState(true);

  // Debug: Log state changes
  useEffect(() => {
    //// console.log('Leads chart state updated - Labels:', leadsLabels, 'Data:', leadsData, 'Loading:', leadsLoading);
  }, [leadsLabels, leadsData, leadsLoading]);

  // Fetch leads by month data from API
  useEffect(() => {
    const fetchLeadsByMonth = async () => {
      try {
        setLeadsLoading(true);
        const token = typeof window !== 'undefined' 
          ? localStorage.getItem('token') || localStorage.getItem('authToken')
          : null;
        
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://broker-adda-be.algofolks.com/api';
        
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        };

        const response = await fetch(`${apiUrl}/leads/by-month`, {
          method: 'GET',
          headers
        });

        if (!response.ok) {
          throw new Error('Failed to fetch leads by month data');
        }

        const data = await response.json();
       // console.log('Leads by month API response:', data);

        // Handle API response structure: { success: true, data: [...] }
        let leadsByMonthData = null;
        if (data?.data && Array.isArray(data.data)) {
          leadsByMonthData = data.data;
        } else if (Array.isArray(data)) {
          leadsByMonthData = data;
        } else {
          leadsByMonthData = [];
        }

       // console.log('Extracted leadsByMonthData:', leadsByMonthData);

        // Transform API data to chart format
        // API format: [{ year: 2025, month: 1, monthName: "Jan", count: 0 }, ...]
        if (Array.isArray(leadsByMonthData) && leadsByMonthData.length > 0) {
          // Sort by month number to ensure correct order
          const sorted = leadsByMonthData.sort((a, b) => {
            const monthA = a.month || 0;
            const monthB = b.month || 0;
            return monthA - monthB;
          });

         // console.log('Sorted leads data:', sorted);

          // Use monthName if available, otherwise map from month number
          const transformedLabels = sorted.map(item => {
            if (item.monthName) {
              return item.monthName;
            }
            const monthNum = item.month || 1;
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return monthNames[monthNum - 1] || monthNames[0];
          });
          
          // Use count field directly
          const transformedData = sorted.map(item => item.count || 0);
          
          // Extract closedCount from API response
          const transformedClosedData = sorted.map(item => item.closedCount || 0);

         // console.log('Transformed labels:', transformedLabels);
         // console.log('Transformed data:', transformedData);
         // console.log('Transformed closed leads data:', transformedClosedData);

          setLeadsLabels(transformedLabels);
          setLeadsData(transformedData);
          setClosedLeadsData(transformedClosedData);
        } else {
          console.warn('No valid leads data found, using defaults');
          // If no valid data, keep defaults
          setLeadsLabels(defaultLeadsLabels);
          setLeadsData(defaultLeadsData);
          setClosedLeadsData([80, 95, 110, 120, 105, 140, 125, 135, 150, 130, 115, 160]);
        }
      } catch (err) {
        console.error('Error fetching leads by month:', err);
        // Keep default data on error
        setLeadsLabels(defaultLeadsLabels);
        setLeadsData(defaultLeadsData);
        setClosedLeadsData([80, 95, 110, 120, 105, 140, 125, 135, 150, 130, 115, 160]);
      } finally {
        setLeadsLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      fetchLeadsByMonth();
    }
  }, []);

  // Fetch properties by month data from API
  useEffect(() => {
    const fetchPropertiesByMonth = async () => {
      try {
        setPropertyLoading(true);
        const token = typeof window !== 'undefined' 
          ? localStorage.getItem('token') || localStorage.getItem('authToken')
          : null;
        
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://broker-adda-be.algofolks.com/api';
        
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        };

        const response = await fetch(`${apiUrl}/properties/by-month`, {
          method: 'GET',
          headers
        });

        if (!response.ok) {
          throw new Error('Failed to fetch properties by month data');
        }

        const data = await response.json();
       // console.log('Properties by month API response:', data);

        // Handle API response structure: { success: true, data: [...] }
        let propertiesByMonthData = null;
        if (data?.data && Array.isArray(data.data)) {
          propertiesByMonthData = data.data;
        } else if (Array.isArray(data)) {
          propertiesByMonthData = data;
        } else {
          propertiesByMonthData = [];
        }

        // Transform API data to chart format
        // API format: [{ year: 2025, month: 1, monthName: "Jan", count: 0 }, ...]
        if (Array.isArray(propertiesByMonthData) && propertiesByMonthData.length > 0) {
          // Sort by month number to ensure correct order
          const sorted = propertiesByMonthData.sort((a, b) => {
            const monthA = a.month || 0;
            const monthB = b.month || 0;
            return monthA - monthB;
          });

          // Use monthName if available, otherwise map from month number
          const transformedLabels = sorted.map(item => {
            if (item.monthName) {
              return item.monthName;
            }
            const monthNum = item.month || 1;
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return monthNames[monthNum - 1] || monthNames[0];
          });
          
          // Use count field directly
          const transformedData = sorted.map(item => item.count || 0);

          setPropertyLabels(transformedLabels);
          setPropertyData(transformedData);
        } else {
          // If no valid data, keep defaults
          setPropertyLabels(defaultPropertyLabels);
          setPropertyData(defaultPropertyData);
        }
      } catch (err) {
        console.error('Error fetching properties by month:', err);
        // Keep default data on error
        setPropertyLabels(defaultPropertyLabels);
        setPropertyData(defaultPropertyData);
      } finally {
        setPropertyLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      fetchPropertiesByMonth();
    }
  }, []);
  return (
    <section className="space-y-3">
    

      {/* Cards row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Leads by Month (shorter card, chunky rounded bars) */}
        <div className="bg-white rounded-[10px] border border-gray-200 p-4"
             style={{height: 230}}>
          <div className="mb-2 text-[14px] font-medium text-gray-900">Enquiries  by Month</div>
          <div className="h-[160px]">
            {leadsLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-pulse text-gray-400 text-sm">Loading chart data...</div>
              </div>
            ) : leadsLabels.length > 0 && leadsData.length > 0 ? (
              <Bar
                key={`leads-chart-${leadsData.join('-')}`}
                data={{
                  labels: leadsLabels,
                  datasets: [
                    {
                      label: 'Leads',
                      data: leadsData,
                      backgroundColor: primary,
                      borderRadius: 2,                // rounded tops
                      borderSkipped: false,
                      barPercentage: 0.6,             // thicker bars
                      categoryPercentage: 0.8,
                      maxBarThickness: 20,
                    },
                    {
                      label: 'Closed Leads',
                      data: closedLeadsData,
                      backgroundColor: '#ef4444',     // red color
                      borderRadius: 2,                // rounded tops
                      borderSkipped: false,
                      barPercentage: 0.6,             // thicker bars
                      categoryPercentage: 0.8,
                      maxBarThickness: 20,
                    },
                  ],
                }}
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: { legend: { display: false }, tooltip: { enabled: true } },
                  scales: {
                    x: {
                      grid: { display: false },
                      ticks: { 
                        color: '#64748b', 
                        font: { size: 10 },
                        maxRotation: 45,
                        minRotation: 45,
                      },
                    },
                    y: {
                      beginAtZero: true,
                      grid: { color: '#eef2f7' },
                      ticks: { 
                        color: '#9ca3af', 
                        font: { size: 12 },
                        stepSize: (() => {
                          const maxLeads = leadsData.length > 0 ? Math.max(...leadsData) : 0;
                          const maxClosed = closedLeadsData.length > 0 ? Math.max(...closedLeadsData) : 0;
                          const maxValue = Math.max(maxLeads, maxClosed);
                          if (maxValue === 0) return 1;
                          if (maxValue <= 5) return 1;
                          if (maxValue <= 20) return 5;
                          if (maxValue <= 50) return 10;
                          return 50;
                        })(),
                      },
                      suggestedMax: (() => {
                        const maxLeads = leadsData.length > 0 ? Math.max(...leadsData) : 0;
                        const maxClosed = closedLeadsData.length > 0 ? Math.max(...closedLeadsData) : 0;
                        const maxValue = Math.max(maxLeads, maxClosed);
                        if (maxValue === 0) return 5;
                        if (maxValue <= 5) return Math.max(maxValue + 2, 5);
                        if (maxValue <= 20) return Math.max(maxValue + 5, 10);
                        if (maxValue <= 50) return Math.max(maxValue + 10, 20);
                        return Math.max(maxValue * 1.2, 250);
                      })(),
                    },
                  },
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-gray-400 text-sm">No data available</div>
              </div>
            )}
          </div>
        </div>

        {/* Property by Month (Jan to Dec) - Line Chart */}
        <div className="bg-white rounded-[10px] border border-gray-200 p-4"
             style={{height: 230}}>
          <div className="mb-2 text-[14px] font-medium text-gray-900">Property by Month</div>
          <div className="h-[160px]">
            {propertyLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-pulse text-gray-400 text-sm">Loading chart data...</div>
              </div>
            ) : (
              <Line
                data={{
                  labels: propertyLabels,
                  datasets: [{
                    label: 'Properties',
                    data: propertyData,
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#22c55e',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                  }],
                }}
                options={{
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { display: false }, 
                    tooltip: { 
                      enabled: true,
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: 10,
                      titleFont: { size: 12 },
                      bodyFont: { size: 11 },
                    } 
                  },
                  scales: {
                    x: {
                      grid: { display: false },
                      ticks: { 
                        color: '#64748b', 
                        font: { size: 10 },
                        maxRotation: 45,
                        minRotation: 45,
                      },
                    },
                    y: {
                      beginAtZero: true,
                      grid: { color: '#eef2f7' },
                      ticks: { color: '#9ca3af', font: { size: 12 }, stepSize: 10 },
                      suggestedMax: propertyData.length > 0 ? Math.max(...propertyData, 40) : 40,
                    },
                  },
                }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
