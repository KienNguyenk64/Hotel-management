import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Plus, Minus, HelpCircle } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // FAQ State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: 'General', message: '' });
      setTimeout(() => setIsSuccess(false), 5000);
    }, 1500);
  };

  const faqs = [
    {
      question: "Tôi có thể đặt phòng khách sạn bằng cách nào?",
      answer: "Bạn có thể đặt phòng trực tiếp trên website của MoonLight bằng cách chọn ngày nhận phòng, ngày trả phòng và loại phòng mong muốn. Ngoài ra, bạn cũng có thể liên hệ với chúng tôi qua điện thoại hoặc email để được hỗ trợ đặt phòng nhanh chóng."
    },
    {
      question: "Giờ nhận phòng và trả phòng là khi nào?",
      answer: "Giờ nhận phòng (Check-in) tiêu chuẩn là 14:00 và giờ trả phòng (Check-out) là 12:00 trưa. Quý khách có nhu cầu nhận phòng sớm hoặc trả phòng muộn vui lòng liên hệ trước để được hỗ trợ."
    },
    {
      question: "Khách sạn có bãi đỗ xe không?",
      answer: "Chúng tôi có hầm đỗ xe rộng rãi miễn phí 24/7 dành cho khách lưu trú, có khu vực riêng cho xe máy và ô tô."
    },
    {
      question: "Khách sạn có phục vụ ăn uống không?",
      answer: "Chúng tôi có nhiều nhà hàng và quầy bar phục vụ các món ăn đa dạng, từ ẩm thực địa phương đến quốc tế. Quý khách có thể thưởng thức bữa ăn tại nhà hàng hoặc nhận phòng tại phòng."
    }
  ];

  return (
    <div className="min-h-screen bg-lux-50 font-sans pt-24 pb-20 animate-fade-in">
      <div className="max-w-7xl mx-auto px-6 mb-6">
          <Breadcrumb items={[{ label: 'Liên hệ' }]} />
      </div>

      {/* Header */}
      <div className="bg-lux-900 py-16 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
        <div className="relative z-10 px-4">
            <span className="text-lux-500 font-bold uppercase tracking-widest text-sm mb-4 block">Hỗ trợ 24/7</span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Liên hệ & Tư vấn</h1>
            <p className="text-lux-200 max-w-2xl mx-auto text-lg font-serif">
                Đội ngũ MoonLight luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn.
            </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          
          {/* Form (Left) */}
          <div className="bg-white rounded-3xl shadow-lg shadow-lux-200/50 border border-lux-100 p-8 md:p-10 h-fit">
              <h2 className="text-2xl font-serif font-bold text-lux-900 mb-6 flex items-center gap-3">
                  <MessageSquare size={28} className="text-lux-500"/> Gửi tin nhắn
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label className="block text-sm font-bold text-lux-700 mb-2">Họ và tên</label>
                          <input 
                            required
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full p-3 bg-lux-50 border border-lux-200 rounded-xl outline-none focus:border-lux-500" 
                            placeholder="Nguyễn Văn A"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-lux-700 mb-2">Số điện thoại</label>
                          <input 
                            required
                            type="tel" 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full p-3 bg-lux-50 border border-lux-200 rounded-xl outline-none focus:border-lux-500" 
                            placeholder="0909 xxx xxx"
                          />
                      </div>
                  </div>

                  <div>
                      <label className="block text-sm font-bold text-lux-700 mb-2">Email</label>
                      <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full p-3 bg-lux-50 border border-lux-200 rounded-xl outline-none focus:border-lux-500" 
                        placeholder="email@example.com"
                      />
                  </div>

                  <div>
                      <label className="block text-sm font-bold text-lux-700 mb-2">Chủ đề</label>
                      <select 
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        className="w-full p-3 bg-lux-50 border border-lux-200 rounded-xl outline-none focus:border-lux-500 font-medium"
                      >
                          <option value="General">Tư vấn chung</option>
                          <option value="Booking">Hỗ trợ đặt phòng</option>
                          <option value="Events">Tổ chức sự kiện</option>
                          <option value="Feedback">Góp ý / Khiếu nại</option>
                      </select>
                  </div>

                  <div>
                      <label className="block text-sm font-bold text-lux-700 mb-2">Nội dung</label>
                      <textarea 
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        className="w-full p-3 bg-lux-50 border border-lux-200 rounded-xl outline-none focus:border-lux-500" 
                        placeholder="Hãy cho chúng tôi biết nhu cầu của bạn..."
                      ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-lux-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-lux-800 transition-all shadow-xl shadow-lux-900/20 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                      {isSubmitting ? 'Đang gửi...' : (
                          <>
                            Gửi tin nhắn <Send size={20}/>
                          </>
                      )}
                  </button>

                  {isSuccess && (
                      <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 font-bold text-center animate-fade-in">
                          Tin nhắn của bạn đã được gửi thành công!
                      </div>
                  )}
              </form>
          </div>

          {/* Contact Info & Map (Right) */}
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-lux-100 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-lux-50 rounded-full flex items-center justify-center text-lux-900 mb-4">
                        <Phone size={24}/>
                    </div>
                    <h3 className="font-bold text-lux-900 mb-2">Hotline</h3>
                    <p className="text-lux-600 font-medium">+84 909 336 888</p>
                    <p className="text-xs text-lux-400 mt-1">Hỗ trợ đặt phòng 24/7</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-lux-100 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-lux-50 rounded-full flex items-center justify-center text-lux-900 mb-4">
                        <Mail size={24}/>
                    </div>
                    <h3 className="font-bold text-lux-900 mb-2">Email</h3>
                    <p className="text-lux-600 font-medium">contact@moonlight.com</p>
                    <p className="text-xs text-lux-400 mt-1">Phản hồi trong vòng 2 giờ</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-lux-100 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-lux-50 rounded-full flex items-center justify-center text-lux-900 mb-4">
                        <MapPin size={24}/>
                    </div>
                    <h3 className="font-bold text-lux-900 mb-2">Địa chỉ</h3>
                    <p className="text-lux-600 font-medium">Số 8 Đường Trường Sa</p>
                    <p className="text-xs text-lux-400 mt-1">Đà Nẵng, Việt Nam</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-lux-100 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-lux-50 rounded-full flex items-center justify-center text-lux-900 mb-4">
                        <Clock size={24}/>
                    </div>
                    <h3 className="font-bold text-lux-900 mb-2">Giờ làm việc</h3>
                    <p className="text-lux-600 font-medium">Thứ 2 - Chủ Nhật</p>
                    <p className="text-xs text-lux-400 mt-1">Mở cửa 24/24</p>
                </div>
            </div>

            {/* Google Map Embed */}
            <div className="bg-white p-2 rounded-3xl border border-lux-200 shadow-sm h-80 overflow-hidden relative">
                <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d27752.741752219124!2d108.14710785979425!3d16.09285374907821!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3142199898d48767%3A0xabebcf7854c96763!2zQsOjaSBiaeG7g24gTmd1eeG7hW4gVOG6pXQgVGjDoG5o!5e1!3m2!1svi!2s!4v1773493921250!5m2!1svi!2s" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy"
                    title="Moon Palace Location"
                    className="rounded-2xl"
                ></iframe>
            </div>
          </div>
        </div>

        {/* FAQ Section Integrated */}
        <div id="faq" className="max-w-4xl mx-auto pt-16 border-t border-lux-200">
            <div className="text-center mb-12">
                 <h2 className="text-3xl font-serif font-bold text-lux-900 mb-4 flex items-center justify-center gap-3">
                    <HelpCircle size={32} className="text-lux-500"/>
                    Câu hỏi thường gặp
                 </h2>
                 <p className="text-lux-500">Tìm kiếm nhanh câu trả lời cho những vấn đề phổ biến nhất.</p>
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-lux-100">
                 {faqs.map((item, idx) => (
                    <div key={idx} className="border-b border-lux-100 last:border-none">
                        <button 
                            className="w-full py-6 flex items-center justify-between text-left group"
                            onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                        >
                            <span className={`text-lg font-serif font-bold transition-colors ${openFaqIndex === idx ? 'text-lux-900' : 'text-lux-700 group-hover:text-lux-900'}`}>
                                {item.question}
                            </span>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${openFaqIndex === idx ? 'bg-lux-900 text-white rotate-180' : 'bg-lux-50 text-lux-500 group-hover:bg-lux-200'}`}>
                                {openFaqIndex === idx ? <Minus size={16} /> : <Plus size={16} />}
                            </div>
                        </button>
                        <div 
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaqIndex === idx ? 'max-h-40 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}
                        >
                            <p className="text-lux-600 leading-relaxed pr-8">
                                {item.answer}
                            </p>
                        </div>
                    </div>
                 ))}
            </div>
        </div>

      </div>
    </div>
  );
};