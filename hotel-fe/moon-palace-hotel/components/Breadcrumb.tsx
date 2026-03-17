import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbProps {
  items: { label: string; path?: string }[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center text-sm text-lux-500 mb-6 font-medium animate-fade-in">
      <Link to="/" className="hover:text-lux-900 transition-colors flex items-center gap-1">
        <Home size={14} /> Trang chủ
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight size={14} className="mx-2 text-lux-300" />
          {item.path ? (
            <Link to={item.path} className="hover:text-lux-900 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-lux-900 font-bold">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
};