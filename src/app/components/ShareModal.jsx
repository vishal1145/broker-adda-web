"use client";
import React, { useState } from 'react';
import { FaTimes, FaCopy, FaCheck, FaFacebook, FaWhatsapp, FaInstagram } from 'react-icons/fa';

const ShareModal = ({ isOpen, onClose, url }) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const shareLinks = [
        {
            name: 'Facebook',
            icon: FaFacebook,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        },
        {
            name: 'WhatsApp',
            icon: FaWhatsapp,
            color: 'text-green-500',
            bg: 'bg-green-50',
            url: `https://wa.me/?text=${encodeURIComponent(url)}`
        },
        // Instagram doesn't have a direct web share URL like others, usually just opens the app or copies link
        // For web, we can't easily share directly to story/feed via URL scheme without native sharing
        // We'll just keep the button as requested, maybe pointing to instagram or just a placeholder if no direct API
        {
            name: 'Instagram',
            icon: FaInstagram,
            color: 'text-pink-600',
            bg: 'bg-pink-50',
            url: 'https://www.instagram.com/' // Placeholder as direct sharing is limited
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Share Property</h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Social Icons */}
                    <div className="flex justify-center gap-6">
                        {shareLinks.map((platform) => (
                            <a
                                key={platform.name}
                                href={platform.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className={`w-14 h-14 flex items-center justify-center rounded-full ${platform.bg} ${platform.color} transition-transform group-hover:scale-110`}>
                                    <platform.icon size={28} />
                                </div>
                                <span className="text-xs font-medium text-gray-600">{platform.name}</span>
                            </a>
                        ))}
                    </div>

                    {/* Copy Link */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Page Link</label>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                            <input
                                type="text"
                                value={url}
                                readOnly
                                className="flex-1 bg-transparent border-none text-sm text-gray-600 focus:ring-0 px-2"
                            />
                            <button
                                onClick={handleCopy}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${copied
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {copied ? <FaCheck size={16} /> : <FaCopy size={16} />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
