"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
const Footer = ({ data = { logo: { text: '', accent: '' }, description: '', links: { Company: [], 'Customer Services': [], 'Our Information': [], 'Contact Info': [] }, copyright: '' } }) => {
    const router = useRouter();

  return (
    <footer className="bg-green-900 text-white">
      <div className="px-14 py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-4 ">
          {/* Logo and Description */}
          <div className=" md:text-left md:col-span-1 ">
            <div className="flex items-center justify-center -mt-6">
              <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
                <div className="w-20 h-20 rounded-full flex  overflow-hidden mt-6">
                  <img
                    src="/House and Handshake Logo (1).png"
                    alt="Logo"
                    className="w-15 h-15 object-contain cursor-pointer"
                  />
                </div>
                <h1 className="text-3xl text-white font-medium mr-6 whitespace-nowrap -ml-4">
                  {data.logo.text}
                </h1>
              </div>
            </div>
            <p className="text-sm text-gray-300 -mt-2">{data.description}</p>
            <div className="flex justify-center md:justify-start space-x-2 mt-2">
              {[
                { name: 'Facebook', icon: 'fab fa-facebook-f', url: 'https://facebook.com/yourpage' },
                { name: 'Twitter', icon: 'fab fa-twitter', url: 'https://twitter.com/yourhandle' },
                // { name: 'Pinterest', icon: 'fab fa-pinterest-p', url: 'https://pinterest.com/yourpage' },
                { name: 'Instagram', icon: 'fab fa-instagram', url: 'https://instagram.com/yourprofile' },
                // { name: 'YouTube', icon: 'fab fa-youtube', url: 'https://youtube.com/yourchannel' }
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

          {/* Company */}
          <div className="text-left">
            <h3 className="text-lg mb-4 mt-4">Company</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {data.links.Company.map((link, index) => (
                <li key={index}>
                  {link.href.startsWith('http') || link.href.startsWith('mailto:') || link.href.startsWith('tel:') ? (
                    <a href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined} rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}>{link.name}</a>
                  ) : (
                    <Link href={link.href} className="hover:text-white transition-colors">{link.name}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Services */}
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
            </ul>
          </div>

          {/* Our Information */}
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
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-left">
            <h3 className="text-lg mb-4 mt-4">Contact Info</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {data.links['Contact Info'].map((link, index) => (
                <li key={index}>
                  {link.href.startsWith('tel:') || link.href.startsWith('mailto:') ? (
                    <a href={link.href}>{link.name}</a>
                  ) : (
                    <span>{link.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="bg-yellow-400 text-sm text-gray-900 mt-12 py-4 px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
          <p className="mb-2 sm:mb-0">{data.copyright}</p>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;
