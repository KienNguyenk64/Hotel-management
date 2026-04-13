import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { bookingApi, paymentApi } from '../services/api';
import { Booking, PaymentMethod as PaymentMethodEnum } from '../types';
import { 
  CreditCard, QrCode, Wallet, ChevronLeft, ShieldCheck, 
  Loader2, CheckCircle2, AlertCircle, Copy, Check, Home, ChevronRight
} from 'lucide-react';

type PaymentMethodType = 'CREDIT_CARD' | 'BANK_TRANSFER' | 'E_WALLET';

export const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const bookingId = queryParams.get('bookingId');

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('CREDIT_CARD');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!bookingId) {
      navigate('/my-bookings');
      return;
    }

    const fetchBooking = async () => {
      try {
        const response = await bookingApi.getById(bookingId);
        if (response.data.status === 'success') {
          const data = response.data.data;
          setBooking(data);
          
          // Check if already paid
          if (data.paymentStatus === 'PAID') {
             setPaymentSuccess(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch booking", error);
        setError("Không tìm thấy thông tin đơn đặt phòng.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, navigate]);

  const mapPaymentMethod = (method: PaymentMethodType): PaymentMethodEnum => {
    const mapping: Record<PaymentMethodType, PaymentMethodEnum> = {
      'CREDIT_CARD': PaymentMethodEnum.CREDIT_CARD,
      'BANK_TRANSFER': PaymentMethodEnum.BANK_TRANSFER,
      'E_WALLET': PaymentMethodEnum.E_WALLET
    };
    return mapping[method];
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
        if (selectedMethod === 'E_WALLET') {
            const response = await paymentApi.createVnPayUrl({ bookingId: bookingId! });
            if (response.data.status === 'success' && response.data.data?.vnpayUrl) {
                window.location.href = response.data.data.vnpayUrl;
                return; // Do not set processing to false, wait for redirect
            } else {
                throw new Error("Không thể tạo kết nối đến VNPay");
            }
        }

        // Call real payment API
        const paymentMethod = mapPaymentMethod(selectedMethod);
        const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const response = await bookingApi.payRemaining(
          bookingId!,
          paymentMethod,
          transactionId
        );

        if (response.data.status === 'success') {
          setPaymentSuccess(true);
          window.scrollTo(0, 0);
        } else {
          throw new Error(response.data.message || 'Payment failed');
        }
    } catch (err: any) {
        console.error('Payment error:', err);
        // const errorMsg = err.response?.data?.message || 
        const errorMsg = err.response?.data?.message || err.message || 
          "Giao dịch thất bại. Vui lòng kiểm tra lại thông tin thẻ hoặc thử phương thức khác.";
        setError(errorMsg);
    } finally {
        setProcessing(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
      navigator.clipboard.writeText(text);
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-500" size={40}/>
      </div>
    );
  }

  if (!booking) return null;

  if (paymentSuccess) {
      return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-20 flex items-center justify-center px-4 animate-fade-in">
            <div className="bg-white w-full max-w-lg p-8 rounded-3xl shadow-xl text-center border border-slate-100">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 animate-scale-up">
                    <CheckCircle2 size={40}/>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Thanh toán thành công!</h2>
                <p className="text-slate-500 mb-8">
                    Cảm ơn bạn đã thanh toán cho đơn đặt phòng <strong>#{booking.bookingNumber}</strong>. 
                    Hóa đơn điện tử đã được gửi đến email của bạn.
                </p>
                <div className="flex gap-4 justify-center">
                    <button 
                      onClick={() => navigate('/my-bookings')} 
                      className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        Xem đơn đặt phòng
                    </button>
                    <button 
                      onClick={() => navigate('/')} 
                      className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 font-sans animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6 font-medium">
            <button onClick={() => navigate('/')} className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                <Home size={14}/> Trang chủ
            </button>
            <ChevronRight size={14} className="text-slate-300"/>
            <button onClick={() => navigate('/my-bookings')} className="hover:text-indigo-600 transition-colors">
                Đặt phòng của tôi
            </button>
            <ChevronRight size={14} className="text-slate-300"/>
            <span className="text-slate-900 font-bold">Thanh toán</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold text-slate-900">Thanh toán đơn phòng</h1>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-500 font-medium">
                <ShieldCheck size={16} className="text-emerald-500"/> Thanh toán bảo mật
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Payment Methods */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Method Selection */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900">Chọn phương thức thanh toán</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button 
                                onClick={() => setSelectedMethod('CREDIT_CARD')}
                                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${selectedMethod === 'CREDIT_CARD' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:border-slate-300 text-slate-600'}`}
                            >
                                <CreditCard size={28}/>
                                <span className="text-sm font-bold">Thẻ Quốc tế</span>
                            </button>
                            <button 
                                onClick={() => setSelectedMethod('BANK_TRANSFER')}
                                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${selectedMethod === 'BANK_TRANSFER' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:border-slate-300 text-slate-600'}`}
                            >
                                <QrCode size={28}/>
                                <span className="text-sm font-bold">Chuyển khoản / QR</span>
                            </button>
                            <button 
                                onClick={() => setSelectedMethod('E_WALLET')}
                                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${selectedMethod === 'E_WALLET' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:border-slate-300 text-slate-600'}`}
                            >
                                <Wallet size={28}/>
                                <span className="text-sm font-bold">Ví điện tử</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Payment Form Area */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 animate-fade-in-up">
                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-start gap-3">
                            <AlertCircle size={20} className="shrink-0 mt-0.5"/>
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    {selectedMethod === 'CREDIT_CARD' && (
                        <form onSubmit={handleProcessPayment} className="space-y-6">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-slate-900">Thông tin thẻ</h3>
                                <div className="flex gap-2">
                                    <div className="h-6 w-10 bg-slate-100 rounded"></div>
                                    <div className="h-6 w-10 bg-slate-100 rounded"></div>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Số thẻ</label>
                                    <div className="relative">
                                        <input 
                                          type="text" 
                                          placeholder="0000 0000 0000 0000" 
                                          className="w-full p-3 pl-12 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
                                          required
                                        />
                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Ngày hết hạn</label>
                                        <input 
                                          type="text" 
                                          placeholder="MM/YY" 
                                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
                                          required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">CVC/CVV</label>
                                        <input 
                                          type="text" 
                                          placeholder="123" 
                                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
                                          required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tên chủ thẻ</label>
                                    <input 
                                      type="text" 
                                      placeholder="NGUYEN VAN A" 
                                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl uppercase focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
                                      required
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={processing}
                                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {processing ? <Loader2 className="animate-spin"/> : <ShieldCheck size={20}/>}
                                {processing ? 'Đang xử lý...' : `Thanh toán ${booking.totalAmount.toLocaleString()}đ`}
                            </button>
                            <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
                                <ShieldCheck size={12}/> Giao dịch được bảo mật và mã hóa SSL 256-bit
                            </p>
                        </form>
                    )}

                    {selectedMethod === 'BANK_TRANSFER' && (
                        <div className="text-center space-y-6">
                            <div className="bg-slate-50 p-6 rounded-2xl inline-block border border-slate-200">
                                <div className="w-48 h-48 bg-white mx-auto mb-4 flex items-center justify-center border border-slate-100 rounded-xl">
                                    <QrCode size={100} className="text-slate-800"/>
                                </div>
                                <p className="text-sm font-bold text-slate-700">Quét mã QR để thanh toán nhanh</p>
                            </div>
                            
                            <div className="text-left bg-indigo-50 p-6 rounded-2xl space-y-3 border border-indigo-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-500">Ngân hàng</span>
                                    <span className="font-bold text-slate-900">MB Bank</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-500">Số tài khoản</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900 font-mono">999988886666</span>
                                        <button 
                                          onClick={() => handleCopy('999988886666', 'account')} 
                                          className="text-indigo-600 hover:text-indigo-800 relative"
                                        >
                                            {copied === 'account' ? <Check size={14}/> : <Copy size={14}/>}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-500">Chủ tài khoản</span>
                                    <span className="font-bold text-slate-900 uppercase">Moon Palace Hotel</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-indigo-200">
                                    <span className="text-sm text-slate-500">Nội dung CK</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-indigo-700 font-mono">{booking.bookingNumber}</span>
                                        <button 
                                          onClick={() => handleCopy(booking.bookingNumber, 'content')} 
                                          className="text-indigo-600 hover:text-indigo-800 relative"
                                        >
                                            {copied === 'content' ? <Check size={14}/> : <Copy size={14}/>}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button 
                              onClick={handleProcessPayment} 
                              disabled={processing}
                              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {processing && <Loader2 size={20} className="animate-spin"/>}
                                Tôi đã chuyển khoản
                            </button>
                        </div>
                    )}

                    {selectedMethod === 'E_WALLET' && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Wallet size={32} className="text-slate-400"/>
                            </div>
                            <p className="text-slate-500 font-medium">Đang kết nối với cổng thanh toán ví điện tử...</p>
                            <button 
                              onClick={handleProcessPayment} 
                              disabled={processing}
                              className="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg flex items-center justify-center gap-2 mx-auto disabled:opacity-70"
                            >
                                {processing && <Loader2 size={20} className="animate-spin"/>}
                                Tiếp tục
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Booking Summary */}
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 sticky top-24">
                    <h3 className="font-bold text-slate-900 text-xl mb-6 font-serif">Thông tin đơn phòng</h3>
                    
                    <div className="flex gap-4 mb-6 pb-6 border-b border-slate-100">
                        <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 relative">
                             {booking.room?.thumbnailImage || booking.room?.images?.[0] ? (
                                <img 
                                  src={booking.room.thumbnailImage || booking.room.images[0]} 
                                  className="w-full h-full object-cover" 
                                  alt="Room"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100 font-bold text-xs">IMG</div>';
                                  }}
                                />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100 font-bold text-xs">
                                    IMG
                                </div>
                             )}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-900 leading-tight mb-1 line-clamp-2">{booking.roomName}</h4>
                            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Phòng {booking.roomNumber}</span>
                        </div>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Mã đặt phòng</span>
                            <span className="font-bold text-slate-900 font-mono">#{booking.bookingNumber}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Khách hàng</span>
                            <span className="font-bold text-slate-900">{booking.userFullName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Nhận phòng</span>
                            <span className="font-bold text-slate-900">{new Date(booking.checkInDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Trả phòng</span>
                            <span className="font-bold text-slate-900">{new Date(booking.checkOutDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Số đêm</span>
                            <span className="font-bold text-slate-900">{booking.numberOfNights || 1}</span>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                        <div className="flex justify-between items-end mb-2">
                            <span className="font-bold text-slate-900">Tổng thanh toán</span>
                            <span className="text-2xl font-bold text-indigo-600">{booking.totalAmount.toLocaleString()}đ</span>
                        </div>
                        <p className="text-xs text-slate-400 text-right">Đã bao gồm thuế và phí dịch vụ</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};