import React, { useState } from 'react';
import { MENU_ITEMS } from '../services/mockData';
import { ChefHat, Star, Wine, Coffee, Utensils, ArrowLeft, ArrowRight, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb';

export const DiningMenu: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<'Starter' | 'Main' | 'Dessert' | 'Wine'>('Main');

  const filteredItems = MENU_ITEMS.filter(item => item.category === activeCategory);

  const categories = [
      { id: 'Starter', label: 'Khai vị', icon: Coffee, desc: 'Khởi đầu nhẹ nhàng' },
      { id: 'Main', label: 'Món chính', icon: Utensils, desc: 'Hương vị tuyệt hảo' },
      { id: 'Dessert', label: 'Tráng miệng', icon: Star, desc: 'Ngọt ngào kết thúc' },
      { id: 'Wine', label: 'Rượu vang', icon: Wine, desc: 'Bộ sưu tập quý' },
  ];

  return (
    <div className="min-h-screen bg-lux-50 font-sans pt-24 pb-20 animate-fade-in text-lux-900">
      <div className="max-w-7xl mx-auto px-6 mb-6">
          <Breadcrumb items={[{ label: 'Dịch vụ', path: '/services' }, { label: 'Nhà hàng' }]} />
      </div>
        
      {/* Header with Parallax-like effect */}
      <div className="relative h-[400px] flex items-center justify-center overflow-hidden mb-16">
          <div className="absolute inset-0 bg-lux-900">
             <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover opacity-40" alt="Restaurant Background" />
          </div>
          <div className="relative z-10 text-center px-4 max-w-4xl animate-fade-in-up">
               <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 text-white text-xs font-bold uppercase tracking-widest shadow-lg">
                    <ChefHat size={16}/> The Eclipse Restaurant
               </div>
               <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4 drop-shadow-lg">Thực đơn Thượng hạng</h1>
               <p className="text-lux-100 text-lg md:text-xl font-light leading-relaxed drop-shadow-md">
                   Sự giao thoa tinh tế giữa ẩm thực Á - Âu trong không gian sang trọng bậc nhất.
               </p>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        
        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {categories.map(cat => (
                <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id as any)}
                    className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 border ${
                        activeCategory === cat.id 
                        ? 'bg-lux-900 text-white shadow-xl shadow-lux-900/20 scale-105 border-lux-900' 
                        : 'bg-white text-lux-500 border-lux-100 hover:border-lux-500 hover:text-lux-900 hover:shadow-md'
                    }`}
                >
                    <cat.icon size={24} strokeWidth={1.5}/>
                    <div className="text-center">
                        <span className="block font-serif font-bold text-lg">{cat.label}</span>
                        <span className={`text-[10px] uppercase tracking-wider ${activeCategory === cat.id ? 'text-lux-300' : 'text-lux-400'}`}>{cat.desc}</span>
                    </div>
                </button>
            ))}
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
            {filteredItems.map(item => (
                <div key={item.id} className="group flex gap-6 items-start animate-fade-in">
                    <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-white shadow-lg shrink-0 relative group-hover:scale-105 transition-transform duration-500">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
                        {item.isChefChoice && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                                <div className="bg-yellow-400 text-lux-900 p-1.5 rounded-full shadow-lg">
                                    <Star size={16} fill="currentColor"/>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 pt-2">
                         <div className="flex justify-between items-baseline mb-2 border-b border-lux-200 pb-2 border-dashed">
                             <h3 className="text-2xl font-serif font-bold text-lux-900 group-hover:text-lux-500 transition-colors">{item.name}</h3>
                             <span className="text-xl font-bold text-lux-900">${item.price}</span>
                         </div>
                         <p className="text-lux-600 text-sm leading-relaxed mb-3 italic">{item.description}</p>
                         {item.isChefChoice && (
                             <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-full uppercase tracking-wider border border-yellow-100">
                                 <ChefHat size={12}/> Gợi ý của Bếp trưởng
                             </span>
                         )}
                    </div>
                </div>
            ))}
        </div>

        {/* Footer Actions */}
        <div className="mt-20 p-8 bg-lux-100 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 border border-lux-200">
            <div>
                 <p className="font-bold text-lux-900 text-lg mb-1 flex items-center gap-2"><Sun size={20}/> Bữa trưa: 11:00 - 14:00</p>
                 <p className="font-bold text-lux-900 text-lg flex items-center gap-2"><Moon size={20}/> Bữa tối: 18:00 - 22:00</p>
                 <p className="text-lux-500 text-sm mt-2 italic">* Giá chưa bao gồm 10% VAT và 5% phí phục vụ.</p>
            </div>
            <button 
                onClick={() => navigate('/booking?type=dining')}
                className="px-10 py-4 bg-lux-900 text-white rounded-full font-bold text-lg hover:bg-lux-800 transition-all shadow-xl shadow-lux-900/20 flex items-center gap-2"
            >
                <Utensils size={20}/> Đặt bàn ngay
            </button>
        </div>
      </div>
    </div>
  );
};