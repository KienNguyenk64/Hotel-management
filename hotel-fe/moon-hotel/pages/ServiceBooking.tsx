import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Clock, Users, Utensils, Flower2, Music, CheckCircle2, ArrowLeft, AlignLeft } from 'lucide-react';

export const ServiceBooking: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialType = queryParams.get('type') || 'spa';

  const [serviceType, setServiceType] = useState(initialType);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    guests: 2,
    request: '',
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auth Guard
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('lux_role');
    if (!isLoggedIn) {
        navigate('/login', { state: { from: `/book-service?type=${serviceType}` } });
    }
  }, [navigate, serviceType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
    }, 1500);
  };

  const services = [
      { id: 'spa', label: 'Spa & Wellness', icon: Flower2, desc: 'Liệu trình thư giãn 60-90 phút' },
      { id: 'dining', label: 'Nhà hàng Eclipse', icon: Utensils, desc: 'Đặt bàn trưa hoặc tối' },
      { id: 'events', label: 'Tổ chức sự kiện', icon: Music, desc: 'Hội nghị, Tiệc cưới, Gala' },
  ];

  if (isSuccess) {
      return (
        <div className="min-h-screen bg-lux-50 pt-24 flex items-center justify-center px-4">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl text-center max-w-lg animate-fade-in-up border border-lux-100">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                    <CheckCircle2 size={40} />
                </div>
                <h2 className="text-3xl font-serif font-bold text-lux-900 mb-4">Yêu cầu đã được gửi!</h2>
                <p className="text-lux-600 mb-8">
                    Cảm ơn bạn đã đặt dịch vụ <b>{services.find(s => s.id === serviceType)?.label}</b>. 
                    Nhân viên của chúng tôi sẽ liên hệ xác nhận trong vòng 30 phút.
                </p>
                <button onClick={() => navigate('/')} className="px-6 py-3 bg-lux-900 text-white rounded-xl font-bold hover:bg-lux-800 transition-colors">Về trang chủ</button>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-lux-50 font-sans pt-24 pb-20 animate-fade-in">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
            <div className="bg-white rounded-3xl shadow-lg shadow-lux-200/50 border border-lux-100 overflow-hidden">
                <div className="bg-lux-900 p-8 text-white text-center">
                    <h1 className="text-3xl font-serif font-bold mb-2">Đặt Dịch vụ</h1>
                    <p className="text-lux-200">Trải nghiệm những tiện ích đẳng cấp tại Moon Palace</p>
                </div>

                <div className="p-8">
                    {/* Service Type Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {services.map(s => (
                            <button
                                key={s.id}
                                onClick={() => setServiceType(s.id)}
                                className={`p-4 rounded-xl border text-left transition-all ${
                                    serviceType === s.id 
                                    ? 'bg-lux-50 border-lux-500 ring-1 ring-lux-500' 
                                    : 'bg-white border-lux-100 hover:bg-lux-50'
                                }`}
                            >
                                <s.icon size={24} className={`mb-3 ${serviceType === s.id ? 'text-lux-900' : 'text-lux-400'}`}/>
                                <div className={`font-bold text-sm ${serviceType === s.id ? 'text-lux-900' : 'text-lux-600'}`}>{s.label}</div>
                                <div className="text-xs text-lux-400 mt-1">{s.desc}</div>
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-lux-700 mb-2 flex items-center gap-2">
                                    <Calendar size={16}/> Ngày sử dụng
                                </label>
                                <input 
                                    type="date" 
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                                    className="w-full p-3 bg-lux-50 border border-lux-200 rounded-xl outline-none focus:border-lux-500" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-lux-700 mb-2 flex items-center gap-2">
                                    <Clock size={16}/> Thời gian
                                </label>
                                <input 
                                    type="time" 
                                    required
                                    value={formData.time}
                                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                                    className="w-full p-3 bg-lux-50 border border-lux-200 rounded-xl outline-none focus:border-lux-500" 
                                />
                            </div>
                        </div>

                        <div>
                             <label className="block text-sm font-bold text-lux-700 mb-2 flex items-center gap-2">
                                    <Users size={16}/> Số lượng người
                            </label>
                            <select 
                                value={formData.guests}
                                onChange={(e) => setFormData({...formData, guests: parseInt(e.target.value)})}
                                className="w-full p-3 bg-lux-50 border border-lux-200 rounded-xl outline-none focus:border-lux-500"
                            >
                                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                                    <option key={n} value={n}>{n} Người</option>
                                ))}
                                <option value={11}>Trên 10 người (Liên hệ trực tiếp)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-lux-700 mb-2 flex items-center gap-2">
                                <AlignLeft size={16}/> Ghi chú / Yêu cầu đặc biệt
                            </label>
                            <textarea 
                                rows={4}
                                value={formData.request}
                                onChange={(e) => setFormData({...formData, request: e.target.value})}
                                className="w-full p-3 bg-lux-50 border border-lux-200 rounded-xl outline-none focus:border-lux-500"
                                placeholder="Ví dụ: Tôi bị dị ứng đậu phộng, Cần ghế trẻ em..."
                            ></textarea>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full bg-lux-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-lux-800 transition-all shadow-xl shadow-lux-900/20 disabled:opacity-70"
                        >
                            {isSubmitting ? 'Đang gửi...' : 'Xác nhận đặt dịch vụ'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
  );
};