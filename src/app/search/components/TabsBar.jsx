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
    setActiveTab(tabId)
    
    // Update URL with tab query parameter
    if (typeof window !== 'undefined') {
      const url = new URL(window.location)
      url.searchParams.set('tab', tabId)
      router.push(url.toString(), { scroll: false })
    }
  }

  // Get sort display text
  const getSortDisplayText = () => {
    if (!sortBy || sortBy === 'default') {
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
          { value: 'oldest', label: 'Oldest', sortBy: 'createdAt', sortOrder: 'asc' },
          { value: 'name-asc', label: 'Name (A-Z)', sortBy: 'name', sortOrder: 'asc' },
          { value: 'name-desc', label: 'Name (Z-A)', sortBy: 'name', sortOrder: 'desc' }
        ]
      default:
        return []
    }
  }

  const handleSortSelect = (option) => {
    if (onSortChange) {
      onSortChange(option.sortBy, option.sortOrder)
    }
    setIsSortDropdownOpen(false)
  }

  return (
    <div className=" bg-white mb-4">
      <div className="flex items-center justify-between px-2">
        {/* ==== Left Tabs ==== */}
      <div className="flex items-center bg-[#F3F4F6FF]  overflow-hidden">
  {[
    { id: 'brokers', label: 'Broker' },
    { id: 'leads', label: 'Lead Enquiry' },
    { id: 'properties', label: 'Property Details' },
  ].map((tab) => (
    <button
      key={tab.id}
      onClick={() => handleTabClick(tab.id)}
      className={`px-4 py-2 font-inter text-sm font-medium leading-[22px] transition-colors
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
        <div className="flex items-center gap-2">
          {/* Sort By Dropdown */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className="flex items-center justify-center gap-2 w-[183.3px] h-10 px-3 rounded-md border border-[#DEE1E6FF] bg-white
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
                    const isSelected = sortBy === option.sortBy && sortOrder === option.sortOrder
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


          {/* Filter */}
          <button className="p-2 text-[#171A1FFF] hover:text-gray-900 transition-colors">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </button>

          {/* Grid */}
          <button className="p-2 text-[#171A1FFF] hover:text-gray-900 transition-colors">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </button>

          {/* Calendar */}
          <button className="p-2 text-[#171A1FFF] hover:text-gray-900 transition-colors">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>
      </div>
      {/* Horizontal divider below tabs */}
      <div className="border-b border-gray-200 my-4"></div>
    </div>
  )
}

export default TabsBar
