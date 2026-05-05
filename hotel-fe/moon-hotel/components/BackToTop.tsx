import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-500 transform ${
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-6 opacity-0 pointer-events-none'
      }`}
    >
      <button
        onClick={scrollToTop}
        className="w-12 h-12 bg-white text-gray-900 border border-gray-200 rounded-full shadow-xl hover:bg-gray-900 hover:text-white transition-all focus:outline-none flex items-center justify-center relative overflow-hidden group"
        title="Lên đầu trang"
        aria-label="Back to top"
      >
        <div className="absolute inset-0 bg-gray-900 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        <ArrowUp
          size={20}
          className="relative z-10 transition-transform duration-300 group-hover:-translate-y-1"
        />
      </button>
    </div>
  );
};
