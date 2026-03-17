import React from 'react';
import { Sparkles, Utensils, Waves, Music, ArrowRight, Calendar, Wine, Flower2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb';

export const Services: React.FC = () => {
  const navigate = useNavigate();

  const handleBookService = (serviceId: string) => {
      const isLoggedIn = localStorage.getItem('lux_role');
      if (!isLoggedIn) {
          navigate('/login', { state: { from: `/book-service?type=${serviceId}` } });
      } else {
          navigate(`/book-service?type=${serviceId}`); 
      }
  }

  const services = [
    {
      id: 'spa',
      title: "Moonlight Spa & Wellness",
      description: "Tái tạo năng lượng với các liệu pháp trị liệu cổ truyền kết hợp công nghệ hiện đại. Không gian yên tĩnh tuyệt đối giúp bạn tìm lại sự cân bằng.",
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop",
      icon: Flower2,
      features: ["Massage đá nóng", "Xông hơi thảo dược", "Chăm sóc da mặt", "Yoga buổi sáng"]
    },
    {
      id: 'dining',
      title: "Nhà hàng The Eclipse",
      description: "Hành trình ẩm thực tinh tế từ Á sang Âu, được chế biến bởi các đầu bếp Michelin. Tận hưởng bữa tối lãng mạn dưới ánh nến và bầu trời sao.",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop",
      icon: Utensils,
      features: ["Fine Dining", "Hầm rượu vang", "Private Room", "View toàn cảnh"]
    },
    {
      id: 'pool',
      title: "Hồ bơi Vô cực Horizon",
      description: "Hồ bơi nước mặn vô cực trên tầng thượng, nơi mặt nước hòa quyện với bầu trời. Quầy bar bên hồ bơi phục vụ cocktail nhiệt đới suốt cả ngày.",
      image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=2070&auto=format&fit=crop",
      icon: Waves,
      features: ["Hồ bơi nước ấm", "Pool Bar", "Ghế tắm nắng VIP", "Khăn tắm miễn phí"]
    },
    {
      id: 'events',
      title: "Hội nghị & Sự kiện",
      description: "Không gian sang trọng với sức chứa lên đến 500 khách, trang thiết bị âm thanh ánh sáng tối tân. Nơi lý tưởng cho đám cưới trong mơ hay hội nghị cấp cao.",
      image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098&auto=format&fit=crop",
      icon: Music,
      features: ["Sảnh tiệc lớn", "Trang trí theo yêu cầu", "Catering đa dạng", "Đội ngũ tổ chức chuyên nghiệp"]
    }
  ];

  return (
    <div className="min-h-screen bg-lux-50 font-sans pt-24 pb-20 animate-fade-in pb-20">
      <div className="max-w-7xl mx-auto px-6 mb-6">
          <Breadcrumb items={[{ label: 'Dịch vụ' }]} />
      </div>

      {/* Hero Section */}
      <div className="bg-lux-900 py-20 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://images.unsplash.com/photo-1561501900-3701fa6a0864?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
        <div className="relative z-10 px-4">
            <span className="text-lux-500 font-bold uppercase tracking-widest text-sm mb-4 block">Trải nghiệm thượng lưu</span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">Dịch vụ & Tiện ích</h1>
            <p className="text-lux-200 max-w-2xl mx-auto text-lg font-light">
                Tại Moon Palace, mỗi khoảnh khắc đều được chăm chút để trở thành kỷ niệm khó quên.
            </p>
        </div>
      </div>

      {/* Services List */}
      <div className="max-w-7xl mx-auto px-6 py-16 space-y-24">
        {services.map((service, index) => (
          <div key={service.id} className={`flex flex-col md:flex-row gap-12 items-center ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
             
             {/* Image */}
             <div className="w-full md:w-1/2 relative group">
                <div className="absolute inset-0 bg-lux-900 rounded-3xl transform translate-x-3 translate-y-3 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-500"></div>
                <div className="relative rounded-3xl overflow-hidden h-[400px] shadow-2xl">
                    <img 
                        src={service.image} 
                        alt={service.title} 
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                </div>
             </div>

             {/* Content */}
             <div className="w-full md:w-1/2 space-y-6">
                <div className="w-16 h-16 bg-lux-50 rounded-2xl flex items-center justify-center text-lux-900 shadow-sm border border-lux-100">
                    <service.icon size={32} strokeWidth={1.5} />
                </div>
                <h2 className="text-4xl font-serif font-bold text-lux-900">{service.title}</h2>
                <p className="text-lux-600 text-lg leading-relaxed">{service.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                    {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-lux-700 font-medium">
                            <Sparkles size={16} className="text-lux-500" />
                            <span>{feature}</span>
                        </div>
                    ))}
                </div>

                <div className="pt-4 flex gap-4">
                    <button 
                        onClick={() => handleBookService(service.id)}
                        className="px-8 py-3 bg-white border border-lux-900 text-lux-900 rounded-full font-bold hover:bg-lux-900 hover:text-white transition-all flex items-center gap-2"
                    >
                        Đặt dịch vụ <ArrowRight size={18}/>
                    </button>
                    {service.id === 'dining' && (
                        <button 
                            onClick={() => navigate('/menu')}
                            className="px-8 py-3 bg-lux-900 text-white rounded-full font-bold hover:bg-lux-800 transition-all flex items-center gap-2"
                        >
                            <Utensils size={18}/> Xem Menu
                        </button>
                    )}
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-lux-100 py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
              <Wine size={48} className="text-lux-500 mx-auto mb-6" strokeWidth={1} />
              <h2 className="text-3xl font-serif font-bold text-lux-900 mb-4">Bạn có yêu cầu đặc biệt?</h2>
              <p className="text-lux-600 mb-8">
                  Cho dù là một buổi cầu hôn lãng mạn trên bãi biển hay một bữa tiệc sinh nhật riêng tư, đội ngũ tổ chức sự kiện của chúng tôi luôn sẵn sàng hiện thực hóa ý tưởng của bạn.
              </p>
              <button 
                onClick={() => handleBookService('events')}
                className="px-8 py-4 bg-lux-900 text-white rounded-full font-bold hover:bg-lux-800 transition-all shadow-lg shadow-lux-900/20"
              >
                  Liên hệ tư vấn ngay
              </button>
          </div>
      </div>
    </div>
  );
};