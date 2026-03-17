import React from 'react';
import { Moon, Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-lux-900 text-white pt-16 pb-8 border-t border-lux-800 font-sans">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lux-900">
                <Moon size={24} fill="#D4AF37" />
              </div>
              <span className="text-2xl font-serif font-bold text-white">
                Moon
                <span className="text-lux-500">Light</span>
              </span>
            </div>
            <p className="text-lux-300 text-sm leading-relaxed mb-6">
              Nơi trải nghiệm sự sang trọng và yên bình giao thoa. Khám phá vẻ đẹp của ánh trăng ngay tại phòng nghỉ của bạn.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-lux-800 flex items-center justify-center text-lux-300 hover:bg-lux-500 hover:text-lux-900 transition-all">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-lux-800 flex items-center justify-center text-lux-300 hover:bg-lux-500 hover:text-lux-900 transition-all">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-lux-800 flex items-center justify-center text-lux-300 hover:bg-lux-500 hover:text-lux-900 transition-all">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-serif font-bold text-white mb-6">Liên kết</h3>
            <ul className="space-y-4 text-lux-300 text-sm">
              <li><Link to="/about" className="hover:text-lux-500 transition-colors">Về chúng tôi</Link></li>
              <li><Link to="/rooms" className="hover:text-lux-500 transition-colors">Phòng & Suites</Link></li>
              <li><Link to="/gallery" className="hover:text-lux-500 transition-colors">Thư viện ảnh</Link></li>
              <li><Link to="/menu" className="hover:text-lux-500 transition-colors">Nhà hàng</Link></li>
              <li><Link to="/blog" className="hover:text-lux-500 transition-colors">Tin tức & Blog</Link></li>
              <li><Link to="/promotions" className="hover:text-lux-500 transition-colors text-yellow-400 font-bold">Ưu đãi HOT</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-serif font-bold text-white mb-6">Liên hệ</h3>
            <ul className="space-y-4 text-lux-300 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-lux-500 shrink-0 mt-0.5" />
                <span>Số 8 Đường Trường Sa, Đà Nẵng, Việt Nam</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-lux-500 shrink-0" />
                <span>+84 909 336 888</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-lux-500 shrink-0" />
                <span>booking@moonlight.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-serif font-bold text-white mb-6">Bản tin</h3>
            <p className="text-lux-300 text-sm mb-4">Đăng ký ngay hôm nay để nhận những ưu đãi mới nhất.</p>
            <form className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="Email của bạn" 
                className="bg-lux-800 border border-lux-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-lux-500 transition-colors text-sm"
              />
              <button className="bg-lux-500 text-lux-900 font-bold py-3 rounded-xl hover:bg-lux-400 transition-colors text-sm">
                Đăng ký ngay
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-lux-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-lux-400">
          <p>© 2004 MoonLight Hotel. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Điều khoản sử dụng</a>
            <a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a>
          </div>
        </div>
      </div>
    </footer>
  );
};