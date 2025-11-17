'use client'
import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const TabsBar = ({ activeTab, setActiveTab, sortBy, sortOrder, onSortChange }) => {
  const router = useRouter()
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false)
  const sortDropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setIsSortDropdownOpen(false)
      }
    }

    if (isSortDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSortDropdownOpen])

  const handleTabClick = (tabId) => {
    // Update state immediately to prevent flicker
    setActiveTab(tabId)
    
    // Update URL with tab query parameter (use replaceState to avoid history entry)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location)
      url.searchParams.set('tab', tabId)
      // Use replaceState instead of push to avoid creating history entries and prevent flicker
      window.history.replaceState({}, '', url.toString())
      
      // Dispatch custom event to notify parent component of manual tab change
      // This helps prevent URL polling from overriding the manual change
      window.dispatchEvent(new CustomEvent('tabChanged', { detail: { tab: tabId } }));
    }
  }

  // Get sort display text
  const getSortDisplayText = () => {
    if (!sortBy || sortBy === 'default' || sortBy === null) {
      // Default text based on active tab
      if (activeTab === 'properties') return 'Newest First'
      if (activeTab === 'brokers') return 'Top Rated'
      if (activeTab === 'leads') return 'Newest'
      return 'Sort'
    }
    
    if (sortBy === 'price') {
      return sortOrder === 'asc' ? 'Price: Low to High' : 'Price: High to Low'
    }
    if (sortBy === 'createdAt' || sortBy === 'date-added') {
      return sortOrder === 'desc' ? 'Newest First' : 'Oldest First'
    }
    if (sortBy === 'bedrooms') {
      return sortOrder === 'desc' ? 'Bedrooms: High to Low' : 'Bedrooms: Low to High'
    }
    if (sortBy === 'rating') {
      return sortOrder === 'desc' || sortOrder === 'high' ? 'Top Rated' : 'Lowest Rated'
    }
    if (sortBy === 'name') {
      return sortOrder === 'asc' ? 'Name (A-Z)' : 'Name (Z-A)'
    }
    
    // Default text based on active tab
    if (activeTab === 'properties') return 'Newest First'
    if (activeTab === 'brokers') return 'Top Rated'
    if (activeTab === 'leads') return 'Newest'
    return 'Sort'
  }

  // Get sort options based on active tab (without Relevance)
  const getSortOptions = () => {
    switch (activeTab) {
      case 'properties':
        return [
          { value: 'createdAt-desc', label: 'Newest First', sortBy: 'createdAt', sortOrder: 'desc' },
          { value: 'createdAt-asc', label: 'Oldest First', sortBy: 'createdAt', sortOrder: 'asc' },
          { value: 'price-asc', label: 'Price: Low to High', sortBy: 'price', sortOrder: 'asc' },
          { value: 'price-desc', label: 'Price: High to Low', sortBy: 'price', sortOrder: 'desc' },
          { value: 'bedrooms-desc', label: 'Bedrooms: High to Low', sortBy: 'bedrooms', sortOrder: 'desc' },
          { value: 'bedrooms-asc', label: 'Bedrooms: Low to High', sortBy: 'bedrooms', sortOrder: 'asc' }
        ]
      case 'brokers':
        return [
          { value: 'rating-high', label: 'Top Rated', sortBy: 'rating', sortOrder: 'desc' },
          { value: 'rating-low', label: 'Lowest Rated', sortBy: 'rating', sortOrder: 'asc' },
          { value: 'newest', label: 'Newest', sortBy: 'createdAt', sortOrder: 'desc' },
          { value: 'oldest', label: 'Oldest', sortBy: 'createdAt', sortOrder: 'asc' }
        ]
      case 'leads':
        return [
          { value: 'newest', label: 'Newest', sortBy: 'createdAt', sortOrder: 'desc' },
          { value: 'oldest', label: 'Oldest', sortBy: 'createdAt', sortOrder: 'asc' }
        ]
      default:
        return []
    }
  }

  const handleSortSelect = (option) => {
    if (onSortChange) {
      console.log('✅ Calling onSortChange with:', { sortBy: option.sortBy, sortOrder: option.sortOrder });
      onSortChange(option.sortBy, option.sortOrder);
    } else {
      console.warn('⚠️ onSortChange is not defined');
    }
    setIsSortDropdownOpen(false);
  }

  return (
    <div className=" bg-white mb-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 px-2 md:px-0">
        {/* ==== Left Tabs ==== */}
      <div className="flex items-center bg-[#F3F4F6FF] overflow-hidden w-full sm:w-auto">
  {[
    { id: 'brokers', label: 'Broker' },
    { id: 'leads', label: 'Lead Enquiry' },
    { id: 'properties', label: 'Property Details' },
  ].map((tab) => (
    <button
      key={tab.id}
      onClick={() => handleTabClick(tab.id)}
      className={`px-3 md:px-4 py-2 font-inter text-xs md:text-sm font-medium leading-[20px] md:leading-[22px] transition-colors
        ${
          activeTab === tab.id
            ? 'bg-[#0A421E] text-white'
            : 'bg-transparent text-[#565D6D] hover:text-[#171A1F]'
        }`}
    >
      {tab.label}
    </button>
  ))}
</div>

        {/* ==== Right Controls ==== */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Sort By Dropdown */}
          <div className="relative flex-1 sm:flex-initial" ref={sortDropdownRef}>
            <button
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className="flex items-center justify-center gap-2 w-full sm:w-[183.3px] h-10 px-3 rounded-md border border-[#DEE1E6FF] bg-white
                         font-inter text-sm leading-[22px] font-medium text-[#171A1FFF]
                         hover:bg-white hover:text-[#171A1FFF]
                         active:bg-white active:text-[#171A1FFF]
                         disabled:opacity-40 transition-colors"
            >
              <svg
                className="w-4 h-4 fill-[#171A1FFF]"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
              <span className="flex-1 text-left">{getSortDisplayText()}</span>
              <svg
                className={`w-3 h-3 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Sort Dropdown Menu */}
            {isSortDropdownOpen && (
              <div className="absolute right-0 mt-2 w-[200px] bg-white border border-[#DEE1E6FF] rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="py-1">
                  {getSortOptions().map((option, index) => {
                    // Check if this option is selected
                    // For brokers tab, if sortBy is null, first option (Top Rated) should be considered selected
                    let isSelected = false;
                    if (activeTab === 'brokers' && !sortBy && !sortOrder && index === 0) {
                      // Default to "Top Rated" when no sort is selected
                      isSelected = true;
                    } else {
                      isSelected = sortBy === option.sortBy && sortOrder === option.sortOrder;
                    }
                    
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleSortSelect(option)}
                        className={`w-full text-left px-4 py-2.5 text-sm font-inter leading-[20px] transition-colors ${
                          isSelected 
                            ? 'text-[#0A421E] font-semibold bg-[#ECFDF5]' 
                            : 'text-[#171A1FFF] hover:bg-gray-50'
                        } ${index === 0 ? '' : 'border-t border-gray-100'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option.label}</span>
                          {isSelected && (
                            <svg className="w-4 h-4 text-[#0A421E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Horizontal divider below tabs */}
      <div className="border-b border-gray-200 my-4"></div>
    </div>
  )
}

export default TabsBar
