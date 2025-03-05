import React from 'react';

const SkipLink = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-blue-600 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      Saltar al contenido principal
    </a>
  );
};

export default SkipLink;