import React from 'react';
import { Moon, Star, Shield, Heart, Clock, ChefHat, Instagram } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const About: React.FC = () => {
  const navigate = useNavigate();

  const milestones = [
    {
      year: '2018',
      title: 'Khu nghỉ dưỡng mới xuất sắc nhất',
      desc: 'Được bình chọn bởi tạp chí Travel & Leisure Châu Á nhờ kiến trúc độc đáo hòa mình với thiên nhiên.',
      img: 'https://images.unsplash.com/photo-1678913308053-316cee77afe9?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
      year: '2020',
      title: 'Top 10 Khách sạn Xanh',
      desc: 'Chứng nhận về bảo vệ môi trường và phát triển bền vững, loại bỏ 100% rác thải nhựa dùng một lần.',
      img: 'https://images.unsplash.com/photo-1534600449025-f819812e82d4?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
      year: '2022',
      title: 'Michelin Key Award',
      desc: 'Nhà hàng Moonlight vinh dự nhận 1 sao Michelin đầu tiên cho thực đơn Fusion Á - Âu.',
      img: 'https://images.unsplash.com/photo-1564759296729-771e78c26df7?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
      year: '2023',
      title: 'Luxury Hotel of The Year',
      desc: 'Giải thưởng danh giá nhất trong ngành dịch vụ lưu trú, khẳng định vị thế dẫn đầu của Moon Palace.',
      img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    }
  ];

  return (
    <div className="min-h-screen bg-lux-50 font-sans pt-20 animate-fade-in pb-20">
      {/* Hero */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-lux-900">
           <img 
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop" 
            alt="Hotel Lobby" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
           />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6">Câu chuyện của chúng tôi</h1>
            <p className="text-lux-100 text-lg md:text-xl font-light">Hành trình kiến tạo không gian nghỉ dưỡng đẳng cấp dưới ánh trăng</p>
        </div>
      </div>

      {/* Mission */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
                <span className="text-lux-500 font-bold uppercase tracking-widest text-sm">Về Moon Palace</span>
                <h2 className="text-4xl font-serif font-bold text-lux-900 mt-2 mb-6">Nơi sang trọng trở thành tiêu chuẩn</h2>
                <p className="text-lux-600 mb-6 leading-relaxed">
                    Được thành lập vào năm 2015, Moon Palace không chỉ là một khách sạn, mà là biểu tượng của sự thanh lịch và tinh tế. Lấy cảm hứng từ vẻ đẹp huyền bí và êm dịu của ánh trăng, chúng tôi tạo ra một không gian nơi thời gian như ngừng lại.
                </p>
                <p className="text-lux-600 mb-6 leading-relaxed">
                    Sứ mệnh của chúng tôi là mang đến cho du khách những trải nghiệm vượt trên cả sự mong đợi, kết hợp giữa kiến trúc đương đại và dịch vụ tận tâm chuẩn mực quốc tế.
                </p>
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-lux-100 rounded-full">
                         <Moon size={32} className="text-lux-900" fill="#D4AF37"/>
                    </div>
                    <div>
                        <p className="font-bold text-lux-900 text-lg">CEO & Founder</p>
                        <p className="text-lux-500 font-serif italic">Alexander H.</p>
                    </div>
                </div>
            </div>
            <div className="relative">
                <img src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1000&auto=format&fit=crop" alt="Interior" className="rounded-3xl shadow-2xl z-10 relative border border-lux-100"/>
                <div className="absolute -bottom-10 -left-10 w-full h-full bg-lux-200 rounded-3xl -z-0 hidden md:block"></div>
            </div>
        </div>
      </section>

      {/* Culinary Philosophy */}
      <section className="py-20 bg-lux-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div>
                      <div className="flex items-center gap-3 mb-4 text-lux-500">
                          <ChefHat size={32} />
                          <span className="font-bold uppercase tracking-widest text-sm">Triết lý ẩm thực</span>
                      </div>
                      <h2 className="text-4xl font-serif font-bold mb-6">Từ nông trại đến bàn ăn</h2>
                      <p className="text-lux-200 mb-6 leading-relaxed">
                          Tại Moon Palace, chúng tôi tin rằng món ăn ngon bắt đầu từ nguyên liệu sạch. Các đầu bếp của chúng tôi hợp tác trực tiếp với các nông trại hữu cơ địa phương để mang đến những hương vị tươi mới nhất mỗi ngày.
                      </p>
                      <button 
                        onClick={() => navigate('/menu')}
                        className="px-8 py-3 border border-white/30 rounded-full hover:bg-white hover:text-lux-900 transition-all font-bold"
                      >
                          Khám phá thực đơn
                      </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop" className="rounded-2xl shadow-lg transform translate-y-8" alt="Food 1"/>
                      <img src="https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?q=80&w=1000&auto=format&fit=crop" className="rounded-2xl shadow-lg" alt="Food 2"/>
                  </div>
              </div>
          </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 text-center">
              <span className="text-lux-500 font-bold uppercase tracking-widest text-sm block mb-4">Đội ngũ lãnh đạo</span>
              <h2 className="text-4xl font-serif font-bold text-lux-900 mb-16">Những người kiến tạo giấc mơ</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                      { name: "Alexander H.", role: "Founder & CEO", img: "https://randomuser.me/api/portraits/men/32.jpg" },
                      { name: "Sarah Jenkins", role: "General Manager", img: "https://randomuser.me/api/portraits/women/44.jpg" },
                      { name: "Michael Chen", role: "Head Chef", img: "https://randomuser.me/api/portraits/men/85.jpg" }
                  ].map((member, idx) => (
                      <div key={idx} className="group cursor-pointer">
                          <div className="w-48 h-48 mx-auto rounded-full overflow-hidden mb-6 border-4 border-lux-50 shadow-xl relative">
                              <img src={member.img} alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110"/>
                              <div className="absolute inset-0 bg-lux-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                          <h3 className="text-xl font-bold text-lux-900 mb-1">{member.name}</h3>
                          <p className="text-lux-500 text-sm font-medium">{member.role}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Awards & Achievements Timeline (Enhanced with Images) */}
      <section className="py-20 bg-lux-50 border-t border-lux-100">
          <div className="max-w-6xl mx-auto px-6">
              <div className="text-center mb-16">
                  <h2 className="text-4xl font-serif font-bold text-lux-900">Giải thưởng & Thành tựu</h2>
                  <p className="text-lux-500 mt-4">Sự công nhận cho những nỗ lực không ngừng nghỉ</p>
              </div>

              <div className="relative">
                   {/* Center Line */}
                   <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-lux-200 via-lux-500 to-lux-200 md:-translate-x-1/2"></div>
                   
                   <div className="space-y-12 md:space-y-24">
                       {milestones.map((item, index) => (
                           <div key={index} className={`relative flex flex-col md:flex-row items-center gap-8 md:gap-0 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                               
                               {/* Image Side */}
                               <div className="w-full md:w-1/2 pl-12 md:pl-0 md:px-12">
                                   <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white rotate-1 hover:rotate-0 transition-transform duration-500 group">
                                       <img src={item.img} alt={item.title} className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"/>
                                   </div>
                               </div>

                               {/* Center Dot */}
                               <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 bg-lux-900 border-4 border-lux-100 rounded-full flex items-center justify-center z-10 shadow-lg">
                                    <div className="w-2 h-2 bg-lux-500 rounded-full"></div>
                               </div>

                               {/* Text Side */}
                               <div className={`w-full md:w-1/2 pl-12 md:pl-0 md:px-12 ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                                    <span className="text-6xl font-serif font-bold text-lux-100 absolute -z-10 -mt-10 select-none opacity-50">{item.year}</span>
                                    <span className="text-lux-500 font-bold text-xl block mb-2 relative">{item.year}</span>
                                    <h3 className="text-2xl font-bold text-lux-900 mb-3">{item.title}</h3>
                                    <p className="text-lux-600 leading-relaxed">{item.desc}</p>
                               </div>

                           </div>
                       ))}
                   </div>
              </div>
          </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
               <div className="flex justify-between items-end mb-12">
                   <div>
                       <span className="text-lux-500 font-bold uppercase tracking-widest text-sm">Thư viện ảnh</span>
                       <h2 className="text-4xl font-serif font-bold text-lux-900 mt-2">Góc nhìn Moon Palace</h2>
                   </div>
                   <button className="flex items-center gap-2 text-lux-900 font-bold hover:text-lux-600 transition-colors">
                       <Instagram size={20}/> Theo dõi @moonpalace
                   </button>
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-2 gap-4 h-[600px]">
                   <div className="col-span-2 row-span-2 rounded-2xl overflow-hidden relative group">
                       <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Main"/>
                       <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                   </div>
                   <div className="rounded-2xl overflow-hidden relative group">
                       <img src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Pool"/>
                   </div>
                   <div className="rounded-2xl overflow-hidden relative group">
                        <img src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Room"/>
                   </div>
                   <div className="col-span-2 rounded-2xl overflow-hidden relative group">
                        <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Dining"/>
                   </div>
               </div>
          </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-lux-50">
          <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                  <h2 className="text-4xl font-serif font-bold text-lux-900">Giá trị cốt lõi</h2>
                  <div className="w-20 h-1 bg-lux-500 mx-auto mt-4"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {[
                      { icon: Star, title: "Đẳng cấp 5 sao", desc: "Mọi chi tiết nhỏ nhất đều được chăm chút kỹ lưỡng." },
                      { icon: Heart, title: "Tận tâm", desc: "Phục vụ khách hàng bằng cả trái tim và sự thấu hiểu." },
                      { icon: Shield, title: "Riêng tư", desc: "Đảm bảo sự an toàn và không gian riêng tư tuyệt đối." },
                      { icon: Clock, title: "Sẵn sàng 24/7", desc: "Luôn có mặt bất cứ khi nào bạn cần." }
                  ].map((item, idx) => (
                      <div key={idx} className="text-center p-8 rounded-2xl bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-lux-100">
                          <div className="w-16 h-16 bg-lux-50 rounded-full flex items-center justify-center text-lux-900 mx-auto mb-6 shadow-sm group-hover:bg-lux-900 group-hover:text-lux-500">
                              <item.icon size={28}/>
                          </div>
                          <h3 className="text-xl font-bold text-lux-900 mb-3">{item.title}</h3>
                          <p className="text-lux-600 text-sm">{item.desc}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>
    </div>
  );
};