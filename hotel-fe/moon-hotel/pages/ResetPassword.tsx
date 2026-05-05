import React, { useState } from 'react';
// Fix: Use namespace import for react-router-dom to resolve "no exported member" errors
import * as ReactRouterDOM from 'react-router-dom';
const { useNavigate, useSearchParams } = ReactRouterDOM;
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertTriangle, Key, ArrowLeft } from 'lucide-react';
import { authApi } from '../services/api';

export const ResetPassword: React.FC = () => {

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [newPassword, setnewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');


  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setStatus('error');
      setErrorMessage('Token không hợp lệ.');
      return;
    }
    if (newPassword.length < 6) {
      setStatus('error');
      setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus('error');
      setErrorMessage('Mật khẩu xác nhận không khớp.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await authApi.resetPassword({ token, newPassword, confirmPassword });
      if (response.data.status === 'success') {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(response.data.message || 'Đặt lại mật khẩu thất bại.');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.response?.data?.message || 'Token hết hạn hoặc không hợp lệ.');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1120] font-sans p-4 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-20 left-20 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-20 right-20 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[80px]"></div>
        </div>
        
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-100 relative z-10">
           <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-amber-500" />
           </div>
           <h2 className="text-xl font-bold text-slate-900 mb-2">Đường dẫn không hợp lệ</h2>
           <p className="text-slate-500 mb-6 text-sm">Vui lòng kiểm tra lại đường dẫn trong email của bạn hoặc thử yêu cầu lại.</p>
           <button onClick={() => navigate('/')} className="px-6 py-3 bg-[#0B1120] text-white rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 transition-all">Về trang chủ</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1120] relative overflow-hidden font-sans p-4">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-20 left-20 w-[300px] h-[300px] bg-emerald-600/10 rounded-full blur-[80px]"></div>
      </div>

      <button onClick={() => navigate('/')} className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-white/70 font-bold text-sm hover:bg-white/10 hover:text-white transition-all">
        <ArrowLeft size={16}/> Trang chủ
      </button>

      <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl shadow-black/50 w-full max-w-md z-10 overflow-hidden relative mx-4">
        {/* Top Gradient Line */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500"></div>

        {status === 'success' ? (
          <div className="text-center animate-fade-in py-4">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 mx-auto shadow-inner">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">Đổi mật khẩu thành công!</h2>
            <p className="text-slate-500 mb-8 font-medium text-sm">Mật khẩu của bạn đã được cập nhật. Hãy đăng nhập để tiếp tục trải nghiệm.</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-[#0B1120] hover:bg-slate-800 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1 active:translate-y-0"
            >
              Đăng nhập ngay
            </button>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-50 rounded-2xl mb-4 shadow-inner text-indigo-600">
                <Key size={28} />
              </div>
              <h1 className="text-2xl font-serif font-bold text-slate-900 mb-2">Đặt lại mật khẩu</h1>
              <p className="text-slate-500 text-sm font-medium">Nhập mật khẩu mới cho tài khoản của bạn</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Mật khẩu mới</label>
                <div className="relative group">
                  <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setnewPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all text-slate-900 font-bold text-sm"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Xác nhận mật khẩu</label>
                <div className="relative group">
                    <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                        <Lock size={20} />
                    </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all text-slate-900 font-bold text-sm"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {status === 'error' && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm flex items-start gap-2 rounded-xl font-bold animate-fade-in">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5"/>
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-[#0B1120] hover:bg-slate-800 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 size={20} className="animate-spin" /> Đang xử lý...
                  </>
                ) : (
                  'Lưu mật khẩu mới'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};