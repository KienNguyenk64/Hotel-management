import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Users, Settings, LogOut, Moon, UserCircle, Home, ExternalLink, MessageSquare, BedDouble } from 'lucide-react';
import { Role } from '../types';
import { REVIEWS_DATA } from '../services/mockData';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const newReviewsCount = REVIEWS_DATA.filter(r => r.isNew).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium border-l-4 relative ${
      isActive
        ? 'bg-lux-50 border-lux-500 text-lux-900 shadow-sm'
        : 'border-transparent text-lux-600 hover:bg-lux-50 hover:text-lux-800'
    }`;

  if (!user) return null;

  return (
    <aside className="w-64 bg-white h-screen fixed left-0 top-0 border-r border-lux-100 flex flex-col justify-between p-6 z-20 shadow-lg shadow-lux-100/50">
      <div>
        {/* Logo Single Line */}
        <div className="flex items-center gap-2 mb-10 px-2 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-lux-900 rounded-full flex items-center justify-center text-lux-500 shadow-lg shadow-lux-900/20 group-hover:scale-105 transition-transform shrink-0">
            <Moon size={24} fill="#D4AF37" />
          </div>
          <div className="flex items-baseline gap-1">
             <span className="text-xl font-serif font-bold text-lux-900 leading-none">Moon</span>
             <span className="text-lg font-sans text-lux-500 font-bold tracking-widest leading-none">PALACE</span>
          </div>
        </div>

        <nav className="space-y-1">
          <div className="mb-6">
            <div className="px-4 py-2 text-xs font-bold text-lux-400 uppercase tracking-wider">Lối tắt</div>
            <button 
                onClick={() => navigate('/')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-lux-600 hover:bg-lux-50 hover:text-lux-900 transition-colors"
            >
                <Home size={20} />
                <span>Về trang chủ</span>
                <ExternalLink size={14} className="ml-auto opacity-50"/>
            </button>
          </div>

          <div className="border-t border-lux-100 my-2"></div>

          {user.role === Role.ADMIN ? (
            <>
              <div className="px-4 py-2 text-xs font-bold text-lux-400 uppercase tracking-wider mt-4">Quản trị</div>
              <NavLink to="/dashboard" className={linkClass}>
                <LayoutDashboard size={20} />
                <span>Tổng quan</span>
              </NavLink>
              <NavLink to="/admin-rooms" className={linkClass}>
                <BedDouble size={20} />
                <span>Quản lý phòng</span>
              </NavLink>
              <NavLink to="/bookings" className={linkClass}>
                <CalendarDays size={20} />
                <span>Đặt phòng</span>
              </NavLink>
              <NavLink to="/guests" className={linkClass}>
                <Users size={20} />
                <span>Khách hàng</span>
              </NavLink>
              <NavLink to="/admin-reviews" className={linkClass}>
                <MessageSquare size={20} />
                <span>Đánh giá</span>
                {newReviewsCount > 0 && (
                    <span className="absolute right-4 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                        {newReviewsCount}
                    </span>
                )}
              </NavLink>
              <NavLink to="/settings" className={linkClass}>
                <Settings size={20} />
                <span>Cài đặt</span>
              </NavLink>
            </>
          ) : (
             <>
              <div className="px-4 py-2 text-xs font-bold text-lux-400 uppercase tracking-wider mt-4">Cá nhân</div>
              <NavLink to="/profile" className={linkClass}>
                <UserCircle size={20} />
                <span>Hồ sơ & Thẻ</span>
              </NavLink>
              <NavLink to="/my-bookings" className={linkClass}>
                <CalendarDays size={20} />
                <span>Lịch sử nghỉ dưỡng</span>
              </NavLink>
            </>
          )}
        </nav>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-lux-600 hover:bg-red-50 hover:text-red-600 transition-colors mt-auto group"
      >
        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform"/>
        <span>Đăng xuất</span>
      </button>
    </aside>
  );
};