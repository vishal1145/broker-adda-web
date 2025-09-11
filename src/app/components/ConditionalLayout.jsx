'use client';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function ConditionalLayout({ children, navbarData, footerData }) {
  const pathname = usePathname();
  
  // Pages where we don't want navbar and footer
  const hideNavbarFooterPages = ['/signup', '/login', '/verify-code'];
  
  const shouldHideNavbarFooter = hideNavbarFooterPages.includes(pathname);

  return (
    <>
      {!shouldHideNavbarFooter && <Navbar data={navbarData} />}
      <main className="min-h-screen">{children}</main>
      {!shouldHideNavbarFooter && <Footer data={footerData} />}
    </>
  );
}
