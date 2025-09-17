// Server Component (default)
import React from 'react';
import './globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import furnitureData from './data/furnitureData.json';
import ConditionalLayout from './components/ConditionalLayout';
import { AuthProvider } from './contexts/AuthContext';

export const metadata = {
  title: "Broker Adda Real Estate | Coastal Homes & Luxury Apartments",
  description: 'Search homes for sale and rent in A-17, Tajganj, Agra Beachfront houses, luxury apartments, and family properties with expert local guidance.',
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
