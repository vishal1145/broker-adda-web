import AboutUs from './AboutUs';

export const metadata = {
  title: 'About Us',
};

// Prevent pre-render collection errors
export const dynamic = 'force-dynamic';

export default function AboutUsPage() {
  return <AboutUs />;
}


