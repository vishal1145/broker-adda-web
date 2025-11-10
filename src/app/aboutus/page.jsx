import AboutUs from './AboutUs';

export const metadata = {
  title: 'About Us | Broker Gully Real Estate',
  description: 'Learn about Broker Gully - your trusted real estate platform connecting buyers, sellers, and brokers. Discover our mission, values, and commitment to transforming the real estate industry.',
};

// Prevent pre-render collection errors
export const dynamic = 'force-dynamic';

export default function AboutUsPage() {
  return <AboutUs />;
}


