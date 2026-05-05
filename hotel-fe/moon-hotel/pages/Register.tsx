import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Moon, ArrowLeft, Eye, EyeOff, Phone, Loader2, AlertTriangle, CreditCard, MapPin, ArrowRight } from 'lucide-react';
import api from '../services/api';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    cccdNumber: '',
    address: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/register', formData);
      if (response.data.status === 'success') {
        // Điều hướng tới trang VerifyEmail với trạng thái 'instruction'
        navigate('/verify-email', { 
          state: { 
            email: formData.email,
            isChecking: true 
          } 
        });
      } else {
        setError(response.data.message || 'Đăng ký thất bại');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1120] relative overflow-hidden font-sans py-10">
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-20 right-20 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[80px]"></div>
      </div>

      <button onClick={() => navigate('/')} className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-white/70 font-bold text-sm hover:bg-white/10 hover:text-white transition-all">
        <ArrowLeft size={16}/> Trang chủ
      </button>

      <div className="bg-white rounded-[2rem] shadow-2xl shadow-black/50 w-full max-w-2xl z-10 overflow-hidden relative mx-4">
        <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500"></div>
        
        <div className="p-8 md:p-10">
            <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-50 rounded-2xl mb-4 shadow-inner text-indigo-600">
                <Moon size={28} className="fill-current" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-slate-900">Tạo tài khoản thành viên</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Trải nghiệm kỳ nghỉ tại Moon Light</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Họ và tên</label>
                <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                        <User size={18} />
                    </div>
                    <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all text-slate-900 text-sm font-bold"
                    placeholder="Nguyễn Văn A"
                    required
                    />
                </div>
                </div>
                <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Tên đăng nhập</label>
                <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                        <User size={18} />
                    </div>
                    <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all text-slate-900 text-sm font-bold"
                    placeholder="username"
                    required
                    />
                </div>
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label>
                <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Mail size={18} />
                </div>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all text-slate-900 text-sm font-bold"
                    placeholder="email@example.com"
                    required
                />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Số điện thoại</label>
                    <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                        <Phone size={18} />
                    </div>
                    <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all text-slate-900 text-sm font-bold"
                        placeholder="0909 xxx xxx"
                        required
                    />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">CMND/CCCD</label>
                    <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                        <CreditCard size={18} />
                    </div>
                    <input
                        type="text"
                        name="cccdNumber"
                        value={formData.cccdNumber}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all text-slate-900 text-sm font-bold"
                        placeholder="0123456789"
                        required
                    />
                    </div>
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Địa chỉ</label>
                <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <MapPin size={18} />
                </div>
                <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all text-slate-900 text-sm font-bold"
                    placeholder="Địa chỉ liên hệ"
                    required
                />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Mật khẩu</label>
                <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Lock size={18} />
                </div>
                <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all text-slate-900 text-sm font-bold"
                    placeholder="Tối thiểu 8 ký tự"
                    required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold flex items-center gap-2 rounded-xl animate-fade-in">
                <AlertTriangle size={18} className="shrink-0"/> {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-[#0B1120] hover:bg-slate-800 text-white py-4 rounded-xl font-bold shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 size={20} className="animate-spin" /> : 'Đăng ký thành viên'}
            </button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-slate-100">
            <p className="text-slate-500 text-sm font-medium">
                Đã có tài khoản? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Đăng nhập</Link>
            </p>
            </div>
        </div>
      </div>
    </div>
  );
};
