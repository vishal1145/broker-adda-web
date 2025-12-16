'use client';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import BrokersChatList from './BrokersChatList';

export default function ConditionalLayout({ children, navbarData, footerData }) {
  const pathname = usePathname();
  
  // Pages where we don't want navbar and footer
  const hideNavbarFooterPages = ['/signup', '/login', '/verify-code'];
  const noPaddingPages = ['/signup', '/login'];
  
  const shouldHideNavbarFooter = hideNavbarFooterPages.includes(pathname);
  const shouldRemoveMainPadding = noPaddingPages.includes(pathname);

  return (
    <>
      {!shouldHideNavbarFooter && <Navbar data={navbarData} />}
      <main
        className={`min-h-screen px-1 md:px-4 lg:px-[6rem] ${
          shouldRemoveMainPadding ? '' : 'pt-20 py-8'
        }`}
      >
        {children}
      </main>
      {!shouldHideNavbarFooter && <Footer data={footerData} />}
      <BrokersChatList />
    </>
  );
}
