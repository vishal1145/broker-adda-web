import React, { useState, useEffect } from 'react';
import { FaWhatsapp, FaFacebook, FaInstagram, FaCopy, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const ShareModal = ({ isOpen, onClose, propertyUrl }) => {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(propertyUrl);
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = (platform) => {
        const encodedUrl = encodeURIComponent(propertyUrl);
        let shareUrl = '';

        switch (platform) {
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodedUrl}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
                break;
            case 'instagram':
                // Instagram doesn't have a direct web share API for posts like others
                // We'll just copy the link and notify the user
                handleCopy();
                toast('Link copied! Open Instagram to paste.', {
                    icon: '📸',
                });
                return;
            default:
                return;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-2xl w-full max-w-md shadow-xl transform transition-all scale-100 opacity-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Share Property</h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Copy Link Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Property Link</label>
                        <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg bg-gray-50">
                            <input
                                type="text"
                                readOnly
                                value={propertyUrl}
                                className="flex-1 bg-transparent border-none text-sm text-gray-600 focus:ring-0 truncate"
                            />
                            <button
                                onClick={handleCopy}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${copied
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>

                    {/* Social Share Buttons */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Share via</label>
                        <div className="grid grid-cols-3 gap-4">
                            <button
                                onClick={() => handleShare('whatsapp')}
                                className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl hover:bg-green-50 transition-colors group"
                            >
                                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-colors">
                                    <FaWhatsapp size={20} />
                                </div>
                                <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">WhatsApp</span>
                            </button>

                            <button
                                onClick={() => handleShare('facebook')}
                                className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
                            >
                                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1877F2]/10 text-[#1877F2] group-hover:bg-[#1877F2] group-hover:text-white transition-colors">
                                    <FaFacebook size={20} />
                                </div>
                                <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">Facebook</span>
                            </button>

                            <button
                                onClick={() => handleShare('instagram')}
                                className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl hover:bg-pink-50 transition-colors group"
                            >
                                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#E4405F]/10 text-[#E4405F] group-hover:bg-[#E4405F] group-hover:text-white transition-colors">
                                    <FaInstagram size={20} />
                                </div>
                                <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">Instagram</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
