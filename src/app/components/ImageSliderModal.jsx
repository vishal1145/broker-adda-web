"use client";
import React, { useState, useEffect } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const ImageSliderModal = ({ isOpen, onClose, images, initialIndex = 0 }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, initialIndex]);

    if (!isOpen || !images || images.length === 0) return null;

    const handlePrevious = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowLeft') handlePrevious(e);
        if (e.key === 'ArrowRight') handleNext(e);
        if (e.key === 'Escape') onClose();
    };

    useEffect(() => {
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, currentIndex]); // Re-bind if needed, though mostly stable

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-50"
            >
                <FaTimes size={32} />
            </button>

            {/* Navigation Buttons */}
            <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-50 hidden md:block"
            >
                <FaChevronLeft size={40} />
            </button>

            <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-50 hidden md:block"
            >
                <FaChevronRight size={40} />
            </button>

            {/* Main Image */}
            <div
                className="relative w-full h-full flex items-center justify-center p-4 md:p-12"
                onClick={e => e.stopPropagation()}
            >
                <img
                    src={images[currentIndex]}
                    alt={`Property image ${currentIndex + 1}`}
                    className="max-w-full max-h-full object-contain select-none"
                />

                {/* Image Counter */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 text-white text-sm rounded-full backdrop-blur-md">
                    {currentIndex + 1} / {images.length}
                </div>
            </div>

            {/* Thumbnail Strip (Optional, can be added if needed, keeping simple for now as per request "slider image modal") */}
        </div>
    );
};

export default ImageSliderModal;
