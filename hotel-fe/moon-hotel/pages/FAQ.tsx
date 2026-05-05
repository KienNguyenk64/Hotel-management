import React, { useState } from 'react';
import { Plus, Minus, HelpCircle, Search } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-lux-100 last:border-none">
      <button 
        className="w-full py-6 flex items-center justify-between text-left group"
        onClick={onClick}
      >
        <span className={`text-lg font-serif font-bold transition-colors ${isOpen ? 'text-lux-900' : 'text-lux-700 group-hover:text-lux-900'}`}>
          {question}
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-lux-900 text-white rotate-180' : 'bg-lux-50 text-lux-500 group-hover:bg-lux-200'}`}>
            {isOpen ? <Minus size={16} /> : <Plus size={16} />}
        </div>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-lux-600 leading-relaxed pr-8">
          {answer}
        </p>
      </div>
    </div>
  );
};

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: "Đặt phòng & Thanh toán",
      items: [
        {
          question: "Tôi có cần đặt cọc trước không?",
          answer: "Tại Moon Palace, chúng tôi áp dụng chính sách 'Thanh toán tại khách sạn' cho hầu hết các hạng phòng tiêu chuẩn. Tuy nhiên, với các hạng phòng cao cấp (Penthouse, Presidential Suite), quý khách có thể cần đặt cọc 30% để giữ phòng."
        },
        {
          question: "Chính sách hủy phòng như thế nào?",
          answer: "Quý khách có thể hủy phòng miễn phí trước 48 giờ so với giờ nhận phòng. Hủy trong vòng 48 giờ sẽ tính phí 1 đêm nghỉ."
        },
        {
          question: "Giá phòng đã bao gồm thuế và phí chưa?",
          answer: "Giá hiển thị trên website chưa bao gồm 10% VAT và 5% phí dịch vụ. Tổng chi phí sẽ được hiển thị rõ ràng tại bước xác nhận đặt phòng."
        }
      ]
    },
    {
      category: "Dịch vụ & Tiện ích",
      items: [
        {
          question: "Giờ nhận phòng và trả phòng là khi nào?",
          answer: "Giờ nhận phòng (Check-in) tiêu chuẩn là 14:00 và giờ trả phòng (Check-out) là 12:00 trưa. Quý khách có nhu cầu nhận phòng sớm hoặc trả phòng muộn vui lòng liên hệ trước để được hỗ trợ (có thể áp dụng phụ phí)."
        },
        {
          question: "Khách sạn có bãi đỗ xe không?",
          answer: "Chúng tôi có hầm đỗ xe rộng rãi miễn phí 24/7 dành cho khách lưu trú, có khu vực riêng cho xe máy và ô tô."
        },
        {
          question: "Bữa sáng được phục vụ vào thời gian nào?",
          answer: "Nhà hàng Moonlight phục vụ Buffet sáng từ 06:00 đến 10:00 hàng ngày với đa dạng các món Á - Âu."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-lux-50 font-sans pt-20 animate-fade-in pb-20">
      {/* Header */}
      <div className="bg-lux-900 py-16 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10 px-4">
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Câu hỏi thường gặp</h1>
              <p className="text-lux-200 max-w-2xl mx-auto">Chúng tôi ở đây để giải đáp mọi thắc mắc của bạn về trải nghiệm tại Moon Palace.</p>
              
              <div className="max-w-md mx-auto mt-8 relative">
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm câu hỏi..." 
                    className="w-full pl-12 pr-4 py-3 rounded-full text-lux-900 focus:outline-none focus:ring-4 focus:ring-lux-500/50 shadow-lg"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-lux-400" size={20}/>
              </div>
          </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {faqs.map((section, idx) => (
            <div key={idx} className="mb-12">
                <h2 className="text-xl font-bold text-lux-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <HelpCircle size={20}/> {section.category}
                </h2>
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-lux-100">
                    {section.items.map((item, itemIdx) => {
                        const uniqueIndex = idx * 10 + itemIdx;
                        return (
                            <FAQItem 
                                key={uniqueIndex}
                                question={item.question}
                                answer={item.answer}
                                isOpen={openIndex === uniqueIndex}
                                onClick={() => setOpenIndex(openIndex === uniqueIndex ? null : uniqueIndex)}
                            />
                        )
                    })}
                </div>
            </div>
        ))}

        <div className="text-center mt-12 bg-white p-8 rounded-3xl border border-lux-100 shadow-sm">
            <h3 className="text-2xl font-serif font-bold text-lux-900 mb-3">Vẫn còn thắc mắc?</h3>
            <p className="text-lux-600 mb-6">Nếu bạn không tìm thấy câu trả lời, hãy liên hệ trực tiếp với đội ngũ hỗ trợ của chúng tôi.</p>
            <div className="flex justify-center gap-4">
                <button className="px-6 py-3 bg-lux-900 text-white rounded-full font-bold hover:bg-lux-800 transition-colors">Chat ngay</button>
                <button className="px-6 py-3 border border-lux-200 text-lux-900 rounded-full font-bold hover:bg-lux-50 transition-colors">Gửi Email</button>
            </div>
        </div>
      </div>
    </div>
  );
};