import React from 'react';
import { PROMOTIONS } from '../services/mockData';
import { Tag, Calendar, Copy, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb';

export const Promotions: React.FC = () => {
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-lux-50 font-sans pt-24 pb-20 animate-fade-in">
        <div className="max-w-7xl mx-auto px-6 mb-6">
            <Breadcrumb items={[{ label: 'Ưu đãi' }]} />
        </div>

        {/* Header */}
        <div className="bg-lux-900 py-16 text-center text-white relative overflow-hidden">
             <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1571896349842-68c894913d3b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
             <div className="relative z-10 px-4">
                 <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Ưu đãi độc quyền</h1>
                 <p className="text-lux-200 max-w-2xl mx-auto">Săn ngay các gói khuyến mãi hấp dẫn nhất dành riêng cho bạn.</p>
             </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {PROMOTIONS.map(promo => (
                    <div key={promo.id} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-lux-100 group flex flex-col">
                        <div className="h-64 overflow-hidden relative">
                             <img src={promo.image} alt={promo.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
                             <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                                 Giảm {promo.discount}
                             </div>
                        </div>
                        <div className="p-8 flex-1 flex flex-col">
                            <h3 className="text-2xl font-serif font-bold text-lux-900 mb-3 group-hover:text-lux-500 transition-colors">{promo.title}</h3>
                            <p className="text-lux-600 mb-6 flex-1">{promo.description}</p>
                            
                            <div className="bg-lux-50 p-4 rounded-xl border border-lux-200 mb-6">
                                <div className="flex justify-between items-center text-sm text-lux-500 mb-2">
                                    <span className="flex items-center gap-1"><Tag size={14}/> Mã ưu đãi</span>
                                    <span className="flex items-center gap-1"><Calendar size={14}/> HSD: {promo.validUntil}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-white border border-lux-200 border-dashed rounded-lg py-2 px-3 text-center font-mono font-bold text-lux-900 text-lg">
                                        {promo.code}
                                    </div>
                                    <button 
                                        onClick={() => handleCopy(promo.code)}
                                        className="p-2.5 bg-lux-900 text-white rounded-lg hover:bg-lux-800 transition-colors"
                                        title="Sao chép mã"
                                    >
                                        {copiedCode === promo.code ? <CheckCircle2 size={20}/> : <Copy size={20}/>}
                                    </button>
                                </div>
                            </div>

                            <button 
                                onClick={() => navigate('/rooms')}
                                className="w-full py-3 border border-lux-900 text-lux-900 rounded-xl font-bold hover:bg-lux-900 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                Đặt phòng ngay <ArrowRight size={18}/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};