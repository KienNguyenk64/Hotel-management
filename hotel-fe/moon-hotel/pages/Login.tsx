import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Moon, Eye, EyeOff, ArrowLeft, Loader2, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Role } from '../types';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    // Kiểm tra nếu được điều hướng từ trang xác thực thành công
    if (location.state?.verified) {
      setShowSuccessAlert(true);
      const timer = setTimeout(() => setShowSuccessAlert(false), 5000);
      window.history.replaceState({}, document.title);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { username, password });

      if (response.data?.status === 'success' || response.data?.data?.token) {
        setSuccessMsg('Đăng nhập thành công!');
        const { token, user } = response.data.data;
        login(token, user);

        const userRole = (user.role || '').toUpperCase();
        const destination = userRole === 'ADMIN' ? '/dashboard' : '/profile';

        setTimeout(() => navigate(destination, { replace: true }), 800);
      } else {
        setError(response.data?.message || 'Đăng nhập thất bại.');
      }
    } catch (err: any) {
      if (err.response?.status === 401) setError('Sai tên đăng nhập hoặc mật khẩu.');
      else setError(err.response?.data?.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1120] relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[80px]"></div>
      </div>

      {showSuccessAlert && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in-right">
          <div className="bg-emerald-500 text-white rounded-xl shadow-2xl p-4 flex items-center gap-3 pr-8 backdrop-blur-md border border-white/20">
            <CheckCircle className="text-white" size={20} />
            <div>
                <h3 className="font-bold">Xác thực thành công!</h3>
                <p className="text-xs text-emerald-100">Tài khoản của bạn đã sẵn sàng sử dụng.</p>
            </div>
            <button onClick={() => setShowSuccessAlert(false)} className="absolute top-2 right-2 text-white/70 hover:text-white"><X size={16}/></button>
          </div>
        </div>
      )}

      <button onClick={() => navigate('/')} className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-white/70 font-bold text-sm hover:bg-white/10 hover:text-white transition-all">
        <ArrowLeft size={16}/> Trang chủ
      </button>

      <div className="bg-white rounded-[2rem] shadow-2xl shadow-black/50 w-full max-md z-10 overflow-hidden relative mx-4 max-w-md">
        <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
        
        <div className="p-8 md:p-12">
            <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-2xl mb-6 shadow-inner text-indigo-600">
                <Moon size={32} className="fill-current" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">Đăng nhập</h1>
            <p className="text-slate-500 font-medium">Tiếp tục hành trình thượng lưu của bạn</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Tên đăng nhập</label>
                <div className="relative group">
                <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Mail size={20} />
                </div>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl outline-none transition-all text-slate-900 font-bold"
                    placeholder="username"
                    required
                />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Mật khẩu</label>
                <Link to="/forgot-password" university-className="text-xs text-indigo-600 font-bold hover:underline">Quên mật khẩu?</Link>
                </div>
                <div className="relative group">
                <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Lock size={20} />
                </div>
                <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl outline-none transition-all text-slate-900 font-bold"
                    placeholder="••••••••"
                    required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 text-rose-600 text-sm font-bold rounded-xl flex items-center gap-3 animate-fade-in border border-rose-100">
                <AlertTriangle size={18} className="shrink-0"/> {error}
                </div>
            )}

            {successMsg && (
                <div className="p-4 bg-emerald-50 text-emerald-600 text-sm font-bold rounded-xl flex items-center gap-3 animate-fade-in border border-emerald-100">
                <Loader2 size={18} className="shrink-0 animate-spin"/> {successMsg}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0B1120] hover:bg-slate-800 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
                {loading ? <Loader2 size={24} className="animate-spin" /> : <>Đăng nhập <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
            </button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm font-medium">
                Chưa có tài khoản? <Link to="/register" className="text-indigo-600 font-bold hover:underline">Đăng ký thành viên</Link>
            </p>
            </div>
        </div>
      </div>
      
      <style>{`
        @keyframes slide-in-right { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-in-right { animation: slide-in-right 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};
