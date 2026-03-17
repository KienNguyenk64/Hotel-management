import React, { useState, useEffect } from 'react';
// Fix: Use namespace import for react-router-dom to resolve "no exported member" errors
import * as ReactRouterDOM from 'react-router-dom';
const { useLocation, useNavigate } = ReactRouterDOM;
import { Calendar, Users, CreditCard, CheckCircle2, AlertCircle, ArrowLeft, Loader2, Info, User, Phone, Mail, MapPin } from 'lucide-react';
import { roomApi, bookingApi } from '../services/api';
// Use RoomResponse instead of Room to match API data structure
import { RoomResponse, GuestInfo } from '../types';
import { useAuth } from '../context/AuthContext';
import { Breadcrumb } from '../components/Breadcrumb';

export const BookingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryParams = new URLSearchParams(location.search);
  const roomId = queryParams.get('roomId');

  // Fix: changed state type to RoomResponse to include typeDisplay and other API fields
  const [room, setRoom] = useState<RoomResponse | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Date calculations
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];

  // State structured to match CreateBookingRequest
  const [checkInDate, setCheckInDate] = useState(today);
  const [checkOutDate, setCheckOutDate] = useState(tomorrow);
  const [guests, setGuests] = useState(1);
  const [children, setChildren] = useState(0);
  const [notes, setNotes] = useState('');
  
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      address: user?.address || '',
      nationality: 'Vietnam',
      cccdNumber: user?.cccdNumber || ''
  });
  
  const [successData, setSuccessData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Check Auth on Mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('lux_token');
    if (!isLoggedIn) {
        navigate('/login', { state: { from: location.pathname + location.search } });
        return;
    }

    if (!roomId) {
        setLoading(false);
        return;
    }

    const fetchRoom = async () => {
        try {
            const response = await roomApi.getById(roomId);
            if (response.data.status === "success") {
                // Fix: setRoom now accepts RoomResponse
                setRoom(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching room for booking", error);
            setError("Không thể tải thông tin phòng. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }
    fetchRoom();
  }, [roomId, navigate, location, user]);

  const handleGuestInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuestInfo({ ...guestInfo, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const calculateDays = () => {
      const start = new Date(checkInDate);
      const end = new Date(checkOutDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return diffDays > 0 ? diffDays : 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
        setError("Ngày trả phòng phải sau ngày nhận phòng.");
        return;
    }
    if (!guestInfo.fullName || !guestInfo.phoneNumber || !guestInfo.email) {
        setError("Vui lòng điền đầy đủ thông tin khách hàng.");
        return;
    }

    setSubmitting(true);

    try {
        // 1. Check availability
        const availResponse = await bookingApi.checkAvailability({
            roomId: roomId!,
            checkInDate: checkInDate,
            checkOutDate: checkOutDate
        });

        if (!availResponse.data.data) {
            setError("Phòng này không còn trống trong khoảng thời gian bạn chọn.");
            setSubmitting(false);
            return;
        }

        // 2. Create Booking Payload
        const payload = {
            roomId: roomId!,
            checkInDate: checkInDate,
            checkOutDate: checkOutDate,
            numberOfGuests: Number(guests),
            numberOfChildren: Number(children),
            primaryGuest: guestInfo, // Correct nested object
            specialRequests: notes,
            bookingSource: 'WEBSITE'
        };

        const bookingResponse = await bookingApi.create(payload);

        if (bookingResponse.data.status === "success") {
            setSuccessData(bookingResponse.data.data);
            window.scrollTo(0, 0);
        } else {
            setError(bookingResponse.data.message || "Đặt phòng thất bại.");
        }

    } catch (err: any) {
        console.error("Booking Error:", err);
        setError(err.response?.data?.message || "Có lỗi xảy ra trong quá trình đặt phòng.");
    } finally {
        setSubmitting(false);
    }
  };

  if (loading) {
      return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-indigo-500" size={48}/></div>;
  }

  if (successData) {
    return (
        <div className="min-h-screen bg-slate-50 pt-24 flex items-center justify-center px-4 animate-fade-in">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl text-center max-w-lg w-full border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-indigo-500"></div>
                
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6 shadow-inner">
                    <CheckCircle2 size={40} />
                </div>
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Đặt phòng thành công!</h2>
                <p className="text-lg font-bold text-slate-700 mb-4">Mã số: <span className="font-mono text-indigo-600">#{successData.bookingNumber}</span></p>
                <p className="text-slate-600 mb-8 text-sm">Cảm ơn bạn đã lựa chọn Moon Palace. Thông tin chi tiết đã được gửi tới email <b>{guestInfo.email}</b>.</p>
                
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mb-8 text-left text-sm space-y-2">
                    <p className="flex justify-between"><span className="text-slate-500">Tổng tiền:</span> <span className="font-bold text-slate-900 text-lg">${successData.totalAmount.toLocaleString()}</span></p>
                    <p className="flex justify-between"><span className="text-slate-500">Check-in:</span> <span className="font-bold text-slate-700">{successData.checkInDate}</span></p>
                    <p className="flex justify-between"><span className="text-slate-500">Trạng thái:</span> <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-bold">{successData.statusDisplay || 'Chờ xác nhận'}</span></p>
                </div>

                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => navigate(`/payment?bookingId=${successData.id}`)}
                        className="w-full px-6 py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                    >
                        <CreditCard size={18}/> Thanh toán ngay
                    </button>
                    <div className="flex gap-3">
                        <button onClick={() => navigate('/my-bookings')} className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors">Quản lý đơn</button>
                        <button onClick={() => navigate('/')} className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors">Về trang chủ</button>
                    </div>
                </div>
            </div>
        </div>
    )
  }
  
  if (!room) {
      return (
          <div className="min-h-screen pt-24 text-center bg-slate-50 flex flex-col items-center justify-center">
              <p className="text-slate-600 mb-4">Vui lòng chọn phòng trước khi đặt.</p>
              <button onClick={() => navigate('/')} className="px-6 py-3 bg-indigo-600 text-white rounded-xl">Về trang chủ</button>
          </div>
      );
  }

  const totalDays = calculateDays();
  const subTotal = room.pricePerNight * totalDays;
  const tax = subTotal * 0.1; // 10% VAT
  const serviceCharge = subTotal * 0.05; // 5% Service Charge
  const total = subTotal + tax + serviceCharge;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-24 pb-20 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
            <Breadcrumb items={[
                { label: 'Phòng nghỉ', path: '/rooms' },
                { label: room.name, path: `/room/${room.id}` },
                { label: 'Đặt phòng' }
            ]} />
            
            <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold mb-8 transition-colors group"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform"/> Quay lại
            </button>

            <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-8">Hoàn tất đặt phòng</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Booking Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        
                        {/* Section 1: Room Details (Simplified) */}
                        <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Calendar size={20} className="text-indigo-500"/> Chi tiết lưu trú
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Ngày nhận phòng</label>
                                    <input 
                                        required 
                                        min={today}
                                        value={checkInDate} 
                                        onChange={(e) => setCheckInDate(e.target.value)} 
                                        type="date" 
                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-medium text-slate-700" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Ngày trả phòng</label>
                                    <input 
                                        required 
                                        min={checkInDate}
                                        value={checkOutDate} 
                                        onChange={(e) => setCheckOutDate(e.target.value)} 
                                        type="date" 
                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-medium text-slate-700" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Người lớn</label>
                                    <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-medium text-slate-700 cursor-pointer">
                                        {Array.from({length: room.maxOccupancy}, (_, i) => i + 1).map(n => (
                                            <option key={n} value={n}>{n} Người</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Trẻ em (0-12 tuổi)</label>
                                    <select value={children} onChange={(e) => setChildren(Number(e.target.value))} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-medium text-slate-700 cursor-pointer">
                                        {[0,1,2,3,4].map(n => <option key={n} value={n}>{n} Trẻ em</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Guest Info */}
                        <div className="p-6 md:p-8">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <User size={20} className="text-indigo-500"/> Thông tin khách hàng
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Họ và tên <span className="text-rose-500">*</span></label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                                        <input required name="fullName" value={guestInfo.fullName} onChange={handleGuestInfoChange} type="text" className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium" placeholder="Nguyễn Văn A" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Số điện thoại <span className="text-rose-500">*</span></label>
                                    <div className="relative">
                                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                                        <input required name="phoneNumber" value={guestInfo.phoneNumber} onChange={handleGuestInfoChange} type="tel" className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium" placeholder="0909 xxx xxx" />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Email <span className="text-rose-500">*</span></label>
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                                        <input required name="email" value={guestInfo.email} onChange={handleGuestInfoChange} type="email" className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium" placeholder="email@example.com" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">CMND/CCCD</label>
                                    <input name="cccdNumber" value={guestInfo.cccdNumber} onChange={handleGuestInfoChange} type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium" placeholder="0123456789" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Quốc tịch</label>
                                    <input name="nationality" value={guestInfo.nationality} onChange={handleGuestInfoChange} type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium" placeholder="Vietnam" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Địa chỉ</label>
                                    <div className="relative">
                                        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                                        <input name="address" value={guestInfo.address} onChange={handleGuestInfoChange} type="text" className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium" placeholder="Địa chỉ liên hệ" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Yêu cầu đặc biệt</label>
                                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium" placeholder="Ví dụ: Phòng không hút thuốc, check-in sớm..."></textarea>
                            </div>

                            {error && (
                                <div className="mt-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-start gap-3 animate-fade-in">
                                    <AlertCircle size={20} className="shrink-0 mt-0.5"/>
                                    <span className="text-sm font-medium">{error}</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100">
                             <div className="flex items-start gap-3 mb-6">
                                <Info size={20} className="text-indigo-600 mt-0.5 shrink-0"/>
                                <p className="text-sm text-slate-600">Bằng việc chọn "Xác nhận đặt phòng", bạn đồng ý với các điều khoản và quy định của Moon Palace. Đơn đặt phòng sẽ được giữ trong 24h chờ thanh toán.</p>
                            </div>

                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="w-full bg-[#0B1120] text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 disabled:opacity-70 flex items-center justify-center gap-2 group"
                            >
                                {submitting ? <Loader2 className="animate-spin" /> : <>Xác nhận đặt phòng <CheckCircle2 size={20} className="group-hover:scale-110 transition-transform"/></>}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right: Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 sticky top-24">
                        <h3 className="font-serif font-bold text-slate-900 text-xl mb-6">Tóm tắt đơn phòng</h3>
                        
                        <div className="flex gap-4 mb-6">
                            <img 
                                src={room.thumbnailImage || room.images[0] || 'https://via.placeholder.com/150'} 
                                alt={room.name} 
                                className="w-20 h-20 rounded-xl object-cover shadow-sm" 
                            />
                            <div>
                                <h4 className="font-bold text-slate-900 line-clamp-2 leading-tight mb-1">{room.name}</h4>
                                <span className="text-[10px] font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{room.typeDisplay || room.type}</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-6 border-t border-b border-slate-50 py-6">
                            <div className="flex justify-between text-slate-600 text-sm">
                                <span>Giá phòng ({totalDays} đêm)</span>
                                <span className="font-medium font-mono">${subTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 text-sm">
                                <span>VAT (10%)</span>
                                <span className="font-medium font-mono">${tax.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 text-sm">
                                <span>Phí dịch vụ (5%)</span>
                                <span className="font-medium font-mono">${serviceCharge.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-end mb-2">
                            <span className="font-bold text-slate-900">Tổng cộng</span>
                            <span className="text-3xl font-serif font-bold text-indigo-600">{total.toLocaleString()}vn₫</span>
                        </div>
                        <p className="text-xs text-slate-400 text-right">Đã bao gồm thuế và phí</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};