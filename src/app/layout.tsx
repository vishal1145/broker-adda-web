// Server Component (default)
import React from 'react';
import './globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import furnitureData from './data/furnitureData.json';
import ConditionalLayout from './components/ConditionalLayout';

export const metadata = {
  title: "Byron Bay Real Estate | Coastal Homes & Luxury Apartments",
  description: 'Search homes for sale and rent in Byron Bay and across NSW, VIC & QLD. Beachfront houses, luxury apartments, and family properties with expert local guidance.',
  icons: {
    apple: '/real-estate-logo-house-logo-home-logo-sign-symbol-free-vector-removebg-preview.png'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Font Awesome is now imported via package */}
        <link rel="apple-touch-icon" href="/real-estate-logo-house-logo-home-logo-sign-symbol-free-vector-removebg-preview.png" />
      </head>
      <body>
        <ConditionalLayout 
          navbarData={furnitureData.navigation}
          footerData={furnitureData.footer}
        >
          {children}
        </ConditionalLayout>
      </body>
    </html>
  );
}
