"use client";
import React from 'react';
import siteConfig, { SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_ADDRESS } from '../config/siteConfig';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
const Footer = ({ data = { logo: { text: '', accent: '' }, description: '', links: { Company: [], 'Customer Services': [], 'Our Information': [], 'Contact Info': [] }, copyright: '' } }) => {
    const router = useRouter();

  // Build contact info from config if not provided via props
  const contactLinks = (data?.links?.['Contact Info'] && data.links['Contact Info'].length > 0)
    ? data.links['Contact Info']
    : [
        { name: SUPPORT_PHONE, href: `tel:${SUPPORT_PHONE.replace(/\s+/g, '')}` },
        { name: SUPPORT_EMAIL, href: `mailto:${SUPPORT_EMAIL}` },
        { name: SUPPORT_ADDRESS, href: '' },
      ];

  return (
    <footer className="bg-green-900 text-white">
      <div className="px-4 md:px-[6rem] py-12">
        <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Logo and Description */}
          <div className="md:text-left">
            <div className="flex items-center -mt-6">
              <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
                <div className="w-20 h-20 rounded-full flex overflow-hidden mt-6">
                  <img
                    src="/BROKER_GULLY_FINAL_LOGO_ICON_JPG__1_-removebg-preview.png"
                    alt="Logo"
                    className="w-12 h-12 object-contain cursor-pointer"
                  />
                </div>
                <h1 className="text-xl text-white font-medium mr-6 whitespace-nowrap -ml-4">
                  {data.logo.text}
                </h1>
              </div>
            </div>
            <p className="text-sm text-gray-300 -mt-2">{data.description}</p>
            <div className="flex justify-center md:justify-start space-x-2 mt-2">
              {[
                { name: 'Facebook', icon: 'fab fa-facebook-f', url: 'https://facebook.com/yourpage' },
                { name: 'Twitter', icon: 'fab fa-twitter', url: 'https://twitter.com/yourhandle' },
                { name: 'Instagram', icon: 'fab fa-instagram', url: 'https://instagram.com/yourprofile' },
              ].map((item, index) => (
                <a key={index} href={item.url} target="_blank" rel="noopener noreferrer">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-sm">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#1e4d2b] flex items-center justify-center shadow-md">
                      <div className="bg-white w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center">
                        <i className={`${item.icon} text-[#1e4d2b] text-xs md:text-sm`}></i>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Customer Services + About Us */}
          <div className="text-left">
            <h3 className="text-lg mb-4 mt-4">Customer Services</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {data.links['Customer Services'].map((link, index) => (
                <li key={index}>
                  {link.href.startsWith('http') || link.href.startsWith('mailto:') || link.href.startsWith('tel:') ? (
                    <a href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined} rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}>{link.name}</a>
                  ) : (
                    <Link href={link.href} className="hover:text-white transition-colors">{link.name}</Link>
                  )}
                </li>
              ))}
              {/* Add About Us link from Company */}
              {data.links.Company && data.links.Company.find(link => link.name === 'About Us') && (
                data.links.Company.filter(link => link.name === 'About Us').map((link, index) => (
                  <li key={`about-${index}`}>
                    {link.href.startsWith('http') || link.href.startsWith('mailto:') || link.href.startsWith('tel:') ? (
                      <a href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined} rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}>{link.name}</a>
                    ) : (
                      <Link href={link.href} className="hover:text-white transition-colors">{link.name}</Link>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Our Information + Blog + Contact Us */}
          <div className="text-left">
            <h3 className="text-lg mb-4 mt-4">Our Information</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {data.links['Our Information'].map((link, index) => (
                <li key={index}>
                  {link.href.startsWith('http') || link.href.startsWith('mailto:') || link.href.startsWith('tel:') ? (
                    <a href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined} rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}>{link.name}</a>
                  ) : (
                    <Link href={link.href} className="hover:text-white transition-colors">{link.name}</Link>
                  )}
                </li>
              ))}
              {/* Add Blog and Contact Us links */}
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">Blogs</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-left">
            <h3 className="text-lg mb-4 mt-4">Contact Info</h3>
            <ul className="space-y-2 text-sm text-gray-300 cursor-pointer">
              {contactLinks.map((link, index) => {
                const rawHref = link?.href || '';
                const isMailByName = typeof link?.name === 'string' && /@/.test(link.name);
                const isTelByName = typeof link?.name === 'string' && /\d{6,}/.test(link.name.replace(/\s+/g, ''));
                let href = rawHref;
                if (!href) {
                  href = isMailByName
                    ? `mailto:${link.name}`
                    : isTelByName
                    ? `tel:${link.name.replace(/\s+/g, '')}`
                    : '';
                } else if (!/^mailto:|^tel:|^https?:\//i.test(href)) {
                  // If href exists but lacks protocol, infer
                  href = /@/.test(href)
                    ? `mailto:${href}`
                    : /\d{6,}/.test(href.replace(/\s+/g, ''))
                    ? `tel:${href.replace(/\s+/g, '')}`
                    : href;
                }
                return (
                  <li key={index}>
                    {href ? (
                      <a href={href}>{link.name}</a>
                    ) : (
                      <span>{link.name}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="bg-yellow-400 text-sm text-gray-900 mt-12 py-4 px-4 md:px-[6rem]">
        <div className=" mx-auto flex flex-col sm:flex-row justify-between items-center">
          <p className="mb-2 sm:mb-0">{data.copyright}</p>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;
