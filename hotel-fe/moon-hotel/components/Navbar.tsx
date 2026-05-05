import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Moon,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  CalendarDays,
  CalendarCheck,
  Bell,
  Tag,
} from "lucide-react";
import { Role } from "../types";
import { useAuth } from "../context/AuthContext";

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsUserDropdownOpen(false);
    navigate("/");
  };

  const handleLinkClick = (path: string) => {
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `hover:text-lux-900 transition-all cursor-pointer ${isActive ? "text-lux-900 font-bold border-b-2 border-lux-500" : ""}`;

  const avatarUrl =
    user?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "User")}&background=D4AF37&color=fff`;

  // Helper to check for ADMIN role robustly
  const isAdmin =
    user?.role === Role.ADMIN ||
    (user?.role as string)?.toUpperCase() === "ADMIN";

  return (
    <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md border-b border-lux-100 shadow-sm transition-all h-20">
      <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
        {/* Logo - Single Line */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => {
            navigate("/");
            handleLinkClick("/");
          }}
        >
          <div className="w-10 h-10 bg-lux-900 rounded-full flex items-center justify-center text-lux-500 shadow-lg shadow-lux-900/20 group-hover:scale-105 transition-transform">
            <Moon size={24} fill="#D4AF37" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-serif font-bold text-lux-900 leading-none">
              Moon
              <span className="text-lux-500">Light</span>
            </span>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex gap-6 text-lux-600 font-medium text-sm uppercase tracking-wide items-center whitespace-nowrap">
          <NavLink
            to="/"
            className={navLinkClass}
            onClick={() => handleLinkClick("/")}
          >
            Trang chủ
          </NavLink>
          <NavLink
            to="/about"
            className={navLinkClass}
            onClick={() => handleLinkClick("/about")}
          >
            Giới thiệu
          </NavLink>
          <NavLink
            to="/rooms"
            className={navLinkClass}
            onClick={() => handleLinkClick("/rooms")}
          >
            Phòng & Suites
          </NavLink>
          <NavLink
            to="/promotions"
            className={navLinkClass}
            onClick={() => handleLinkClick("/promotions")}
          >
            <span className="flex items-center gap-1 text-red-600 font-bold">
              <Tag size={14} /> Ưu đãi
            </span>
          </NavLink>
          <NavLink
            to="/services"
            className={navLinkClass}
            onClick={() => handleLinkClick("/services")}
          >
            Dịch vụ
          </NavLink>
          <NavLink
            to="/blog"
            className={navLinkClass}
            onClick={() => handleLinkClick("/blog")}
          >
            Tin tức
          </NavLink>
          <NavLink
            to="/contact"
            className={navLinkClass}
            onClick={() => handleLinkClick("/contact")}
          >
            Liên hệ
          </NavLink>
        </div>

        {/* Auth / User Menu */}
        <div className="hidden lg:flex items-center gap-4">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <button className="w-10 h-10 rounded-full hover:bg-lux-50 flex items-center justify-center text-lux-600 hover:text-lux-900 transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
              </button>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full border border-lux-100 hover:bg-lux-50 transition-all group"
                >
                  <div className="w-9 h-9 rounded-full bg-lux-100 overflow-hidden border border-lux-200 group-hover:border-lux-500 transition-colors">
                    <img
                      src={avatarUrl}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <span className="block text-xs text-lux-400 font-bold uppercase">
                      Xin chào
                    </span>
                    <span className="block text-sm font-bold text-lux-900 max-w-[100px] truncate">
                      {user.username}
                    </span>
                  </div>
                </button>

                {/* Dropdown Content */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-lux-100 py-2 animate-fade-in origin-top-right overflow-hidden">
                    <div className="px-4 py-3 border-b border-lux-50 bg-lux-50/50">
                      <p className="text-sm font-bold text-lux-900 truncate">
                        {user.email}
                      </p>
                      <p className="text-xs text-lux-500 uppercase">
                        {user.role}
                      </p>
                    </div>

                    <div className="py-2">
                      {isAdmin ? (
                        <button
                          onClick={() => navigate("/dashboard")}
                          className="w-full text-left px-4 py-2 text-sm text-lux-700 hover:bg-lux-50 hover:text-lux-900 flex items-center gap-2"
                        >
                          <LayoutDashboard size={16} /> Dashboard
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => navigate("/profile")}
                            className="w-full text-left px-4 py-2 text-sm text-lux-700 hover:bg-lux-50 hover:text-lux-900 flex items-center gap-2"
                          >
                            <UserIcon size={16} /> Trang cá nhân
                          </button>
                          <button
                            onClick={() => navigate("/my-bookings")}
                            className="w-full text-left px-4 py-2 text-sm text-lux-700 hover:bg-lux-50 hover:text-lux-900 flex items-center gap-2"
                          >
                            <CalendarDays size={16} /> Đặt phòng của tôi
                          </button>
                        </>
                      )}
                    </div>

                    <div className="border-t border-lux-50 pt-1 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut size={16} /> Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Book Now Button next to User */}
              {!isAdmin && (
                <button
                  onClick={() => navigate("/rooms")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-lux-500 text-lux-900 font-bold text-sm hover:bg-lux-400 transition-all shadow-lg shadow-lux-500/20 hover:-translate-y-0.5"
                >
                  <CalendarCheck size={16} />
                  Đặt phòng
                </button>
              )}
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/login")}
                className="px-5 py-2.5 rounded-full text-lux-900 font-bold text-sm hover:bg-lux-50 transition-colors"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-6 py-2.5 rounded-full bg-lux-900 text-white font-bold text-sm hover:bg-lux-800 transition-colors shadow-lg shadow-lux-900/20"
              >
                Đăng ký
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-lux-900"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-white border-b border-lux-100 p-6 shadow-xl flex flex-col gap-4 animate-fade-in h-[calc(100vh-80px)] overflow-y-auto">
          <NavLink
            to="/"
            onClick={() => handleLinkClick("/")}
            className="text-lux-900 font-medium py-2 border-b border-lux-50"
          >
            Trang chủ
          </NavLink>
          <NavLink
            to="/about"
            onClick={() => handleLinkClick("/about")}
            className="text-lux-900 font-medium py-2 border-b border-lux-50"
          >
            Giới thiệu
          </NavLink>
          <NavLink
            to="/rooms"
            onClick={() => handleLinkClick("/rooms")}
            className="text-lux-900 font-medium py-2 border-b border-lux-50"
          >
            Phòng & Suites
          </NavLink>
          <NavLink
            to="/promotions"
            onClick={() => handleLinkClick("/promotions")}
            className="text-red-600 font-bold py-2 border-b border-lux-50 flex items-center gap-2"
          >
            <Tag size={16} /> Ưu đãi
          </NavLink>
          <NavLink
            to="/services"
            onClick={() => handleLinkClick("/services")}
            className="text-lux-900 font-medium py-2 border-b border-lux-50"
          >
            Dịch vụ
          </NavLink>
          <NavLink
            to="/blog"
            onClick={() => handleLinkClick("/blog")}
            className="text-lux-900 font-medium py-2 border-b border-lux-50"
          >
            Tin tức
          </NavLink>
          <NavLink
            to="/contact"
            onClick={() => handleLinkClick("/contact")}
            className="text-lux-900 font-medium py-2 border-b border-lux-50"
          >
            Liên hệ
          </NavLink>

          <div className="mt-4">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-3 mb-4 p-4 bg-lux-50 rounded-xl">
                  <img
                    src={avatarUrl}
                    alt="User"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-lux-900">{user.fullName}</p>
                    <p className="text-xs text-lux-500">{user.role}</p>
                  </div>
                </div>
                {isAdmin ? (
                  <button
                    onClick={() => {
                      navigate("/dashboard");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-3 text-left font-bold text-lux-700"
                  >
                    Dashboard Quản trị
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-3 text-left font-bold text-lux-700 border-b border-lux-50"
                    >
                      Trang cá nhân
                    </button>
                    <button
                      onClick={() => {
                        navigate("/my-bookings");
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-3 text-left font-bold text-lux-700 border-b border-lux-50"
                    >
                      Lịch sử đặt phòng
                    </button>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full py-3 text-left font-bold text-red-500 mt-2"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    navigate("/login");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-3 text-center rounded-xl bg-lux-50 text-lux-900 font-bold"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => {
                    navigate("/register");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-3 text-center rounded-xl bg-lux-900 text-white font-bold"
                >
                  Đăng ký
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
