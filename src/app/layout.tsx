// Server Component (default)
import React from 'react';
import './globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import furnitureData from './data/furnitureData.json';
import ConditionalLayout from './components/ConditionalLayout';
import { AuthProvider } from './contexts/AuthContext';

export const metadata = {
  title: "Broker Adda Real Estate | Coastal Homes & Luxury Apartments",
  description: 'Search homes for sale and rent in A-17, Tajganj, Agra. Beachfront houses, luxury apartments, and family properties with expert local guidance.',
  icons: {
    icon: '/House and Handshake Logo (1).png',
    shortcut: '/House and Handshake Logo (1).png',
    apple: '/House and Handshake Logo (1).png',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inria+Serif:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap" rel="stylesheet" />
        {/* Font Awesome is now imported via package */}
        <link rel="icon" type="image/png" href="/House and Handshake Logo (1).png" />
        <link rel="shortcut icon" type="image/png" href="/House and Handshake Logo (1).png" />
        <link rel="apple-touch-icon" href="/House and Handshake Logo (1).png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10b981" />
      </head>
      <body>
        <AuthProvider>
          <ConditionalLayout 
            navbarData={furnitureData.navigation}
            footerData={furnitureData.footer}
          >
            {children}
          </ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
