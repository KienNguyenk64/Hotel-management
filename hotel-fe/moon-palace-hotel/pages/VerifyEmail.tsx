import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ArrowLeft, Mail, ArrowRight } from 'lucide-react';
import { authApi } from '../services/api';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'instruction' | 'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Đang xác thực email của bạn...');
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  useEffect(() => {
    // Nếu vừa đăng ký xong, hiển thị hướng dẫn kiểm tra email
    if (location.state?.isChecking) {
      setStatus('instruction');
      setResendEmail(location.state?.email || '');
      return;
    }

    if (!token) {
      setStatus('error');
      setMessage('Liên kết xác thực không hợp lệ hoặc bị thiếu.');
      return;
    }

    const verify = async () => {
      setStatus('loading');
      try {
        const response = await authApi.verifyEmail(token);
        if (response.data.status === 'success') {
          setStatus('success');
          setMessage('Email đã được xác thực thành công! Bạn có thể đăng nhập ngay bây giờ.');
          // Tự động chuyển hướng sau 3 giây
          setTimeout(() => {
            navigate('/login', { state: { verified: true } });
          }, 3000);
        } else {
          setStatus('error');
          setMessage(response.data.message || 'Xác thực thất bại. Token có thể đã hết hạn.');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Có lỗi xảy ra trong quá trình xác thực.');
      }
    };

    verify();
  }, [token, location.state]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendStatus('sending');
    try {
      await authApi.sendVerificationEmail(resendEmail);
      setResendStatus('sent');
    } catch (err) {
      setResendStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1120] relative overflow-hidden font-sans p-4">
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[80px]"></div>
      </div>

      <button onClick={() => navigate('/')} className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-white/70 font-bold text-sm hover:bg-white/10 hover:text-white transition-all">
        <ArrowLeft size={16}/> Trang chủ
      </button>

      <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl shadow-black/50 w-full max-w-md z-10 border border-slate-100 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500"></div>

        {status === 'instruction' && (
          <div className="flex flex-col items-center py-6 animate-fade-in">
            <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner text-indigo-600">
              <Mail size={40} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">Xác thực Email của bạn</h2>
            <p className="text-slate-500 mb-8 font-medium leading-relaxed">
              Chúng tôi đã gửi một liên kết xác thực đến <br/>
              <strong className="text-slate-900">{resendEmail}</strong>. <br/>
              Vui lòng kiểm tra hộp thư để hoàn tất đăng ký.
            </p>
            <div className="w-full space-y-4">
              <button
                onClick={() => window.open('https://mail.google.com', '_blank')}
                className="w-full bg-[#0B1120] hover:bg-slate-800 text-white py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
              >
                Mở Gmail <ArrowRight size={18} />
              </button>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-2">Không nhận được email?</p>
                <button 
                  onClick={handleResend}
                  disabled={resendStatus === 'sending' || resendStatus === 'sent'}
                  className="text-indigo-600 text-sm font-bold hover:underline disabled:text-slate-400"
                >
                  {resendStatus === 'sending' ? 'Đang gửi...' : resendStatus === 'sent' ? 'Đã gửi lại!' : 'Gửi lại email xác thực'}
                </button>
              </div>
            </div>
          </div>
        )}

        {status === 'loading' && (
          <div className="flex flex-col items-center py-10">
            <div className="relative mb-8">
              <div className="w-20 h-20 border-4 border-slate-100 rounded-full"></div>
              <div className="w-20 h-20 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
              <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500" size={32} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Đang xác thực</h2>
            <p className="text-slate-500 font-medium">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center py-8 animate-fade-in">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <CheckCircle2 size={48} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">Thành công!</h2>
            <p className="text-slate-500 mb-8 font-medium leading-relaxed">{message}</p>
            <button
              onClick={() => navigate('/login', { state: { verified: true } })}
              className="w-full bg-[#0B1120] hover:bg-slate-800 text-white py-4 rounded-xl font-bold shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1 active:translate-y-0"
            >
              Đăng nhập ngay
            </button>
            <p className="mt-4 text-xs text-slate-400 italic">Tự động chuyển hướng sau giây lát...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center py-4 animate-fade-in">
            <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <XCircle size={48} className="text-rose-500" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Xác thực thất bại</h2>
            <p className="text-rose-500 mb-8 font-bold bg-rose-50 px-4 py-2 rounded-lg text-sm">{message}</p>
            
            <div className="w-full bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <p className="text-slate-500 text-xs font-bold uppercase mb-4 tracking-wider">Liên kết hết hạn? Gửi lại email:</p>
              
              {resendStatus === 'sent' ? (
                <div className="p-4 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 size={18}/> Đã gửi email xác thực mới!
                </div>
              ) : (
                <form onSubmit={handleResend} className="space-y-3">
                  <div className="relative">
                     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                     <input 
                        type="email" 
                        required
                        placeholder="Nhập email của bạn"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                     />
                  </div>
                  <button 
                    type="submit" 
                    disabled={resendStatus === 'sending'}
                    className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors text-sm flex items-center justify-center gap-2 shadow-lg"
                  >
                    {resendStatus === 'sending' ? <Loader2 size={16} className="animate-spin"/> : 'Gửi lại mã xác thực'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
