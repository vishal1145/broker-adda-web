import React from 'react';
import HeaderFile from '../components/Header';
import Search from './Search';

const SearchPage = () => {
  const headerData = {
    title: 'Search Properties',
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: 'Search', href: '/search' }
    ]
  };

  return (
    <div className="min-h-screen bg-white">
      <HeaderFile data={headerData} />
      <Search />
    </div>
  );
};

export default SearchPage;
