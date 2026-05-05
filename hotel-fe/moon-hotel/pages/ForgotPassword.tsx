import React, { useState } from 'react';
// Fix: Use namespace import for react-router-dom to resolve "no exported member" errors
import * as ReactRouterDOM from 'react-router-dom';
const { useNavigate, Link } = ReactRouterDOM;
import { Mail, ArrowLeft, Moon, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { authApi } from '../services/api';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call actual API
      const response = await authApi.forgotPassword(email);
      
      if (response.data.status === 'success') {
         setSubmitted(true);
      } else {
         setError(response.data.message || 'Không tìm thấy email hoặc có lỗi xảy ra.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1120] relative overflow-hidden font-sans p-4">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
            <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]"></div>
        </div>

        <button 
            onClick={() => navigate('/')}
            className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-white/70 font-bold text-sm hover:bg-white/10 hover:text-white transition-all group"
        >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/>
            <span>Trang chủ</span>
        </button>
        
      <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl shadow-black/50 w-full max-w-md z-10 overflow-hidden relative mx-4">
        {/* Top Gradient Line */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500"></div>
        
        {!submitted ? (
            <div className="animate-fade-in">
                <div className="text-center mb-8">
                     <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-50 rounded-2xl mb-4 shadow-inner text-indigo-600">
                        <Moon size={28} className="fill-current" />
                    </div>
                    <h1 className="text-2xl font-serif font-bold text-slate-900 mb-2">Quên mật khẩu?</h1>
                    <p className="text-slate-500 text-sm font-medium">Nhập email để nhận liên kết khôi phục</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Email đăng ký</label>
                      <div className="relative group">
                        <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                            <Mail size={20} />
                        </div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all text-slate-900 font-bold text-sm"
                            placeholder="ten@gmail.com"
                            required
                        />
                      </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm flex items-start gap-2 rounded-xl font-bold animate-fade-in">
                      <AlertTriangle size={18} className="shrink-0 mt-0.5"/>
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#0B1120] hover:bg-slate-800 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                  >
                      {loading ? (
                        <>
                           <Loader2 size={20} className="animate-spin" /> Đang gửi...
                        </>
                      ) : (
                        'Gửi yêu cầu'
                      )}
                  </button>
                </form>
                
                 <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <Link to="/login" className="text-indigo-600 text-sm hover:text-indigo-800 font-bold flex items-center justify-center gap-1 transition-colors">
                        <ArrowLeft size={16} /> Quay lại đăng nhập
                    </Link>
                </div>
            </div>
        ) : (
            <div className="text-center py-6 animate-fade-in">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full mb-6 shadow-inner">
                    <CheckCircle size={40} className="text-emerald-500" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">Đã gửi email!</h2>
                <p className="text-slate-500 mb-8 font-medium leading-relaxed text-sm">
                   Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến <strong className="text-slate-900">{email}</strong>. 
                   <br/>Vui lòng kiểm tra hộp thư đến (và thư rác).
                </p>
                <div className="space-y-3">
                    <button 
                        onClick={() => navigate('/login')}
                        className="w-full px-8 py-3.5 bg-[#0B1120] text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg"
                    >
                        Về trang đăng nhập
                    </button>
                    <button 
                        onClick={() => { setSubmitted(false); setError(''); }}
                        className="w-full px-8 py-3.5 bg-transparent text-slate-500 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm"
                    >
                        Thử lại với email khác
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};