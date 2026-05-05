import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Home, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-lux-50 px-4 text-center font-sans">
      <div className="mb-8 relative">
          <div className="text-9xl font-serif font-bold text-lux-100 select-none">404</div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
             <Moon size={64} className="text-lux-900 fill-lux-500" />
          </div>
      </div>
      
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-lux-900 mb-4">
        Trang không tìm thấy
      </h1>
      <p className="text-lux-500 max-w-md mb-10 leading-relaxed">
        Có vẻ như bạn đã đi lạc vào vùng tối của mặt trăng. Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="px-8 py-3 rounded-full border border-lux-200 text-lux-700 font-bold hover:bg-lux-100 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft size={20} /> Quay lại
        </button>
        <button 
          onClick={() => navigate('/')}
          className="px-8 py-3 rounded-full bg-lux-900 text-white font-bold hover:bg-lux-800 transition-colors shadow-lg shadow-lux-900/20 flex items-center justify-center gap-2"
        >
          <Home size={20} /> Về Trang chủ
        </button>
      </div>
    </div>
  );
};