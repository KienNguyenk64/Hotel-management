import React, { useState } from 'react';
import { X, Image, Maximize2 } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';

const GALLERY_IMAGES = [
    { src: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop', category: 'Exterior', title: 'Toàn cảnh Moon Palace' },
    { src: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2070&auto=format&fit=crop', category: 'Rooms', title: 'Moonlight Suite' },
    { src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop', category: 'Dining', title: 'The Eclipse Restaurant' },
    { src: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=2070&auto=format&fit=crop', category: 'Pool', title: 'Hồ bơi vô cực' },
    { src: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070&auto=format&fit=crop', category: 'Rooms', title: 'Phòng khách Deluxe' },
    { src: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2070&auto=format&fit=crop', category: 'Dining', title: 'Món ăn Fusion' },
    { src: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop', category: 'Wellness', title: 'Spa & Wellness' },
    { src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop', category: 'Exterior', title: 'Sảnh chính' },
    { src: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop', category: 'Exterior', title: 'Khu nghỉ dưỡng về đêm' },
    { src: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=2070&auto=format&fit=crop', category: 'Dining', title: 'Tráng miệng Moon Cake' },
];

const CATEGORIES = ['All', 'Exterior', 'Rooms', 'Dining', 'Pool', 'Wellness'];

export const Gallery: React.FC = () => {
    const [filter, setFilter] = useState('All');
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    const filteredImages = filter === 'All' 
        ? GALLERY_IMAGES 
        : GALLERY_IMAGES.filter(img => img.category === filter);

    return (
        <div className="min-h-screen bg-lux-50 font-sans pt-24 pb-20 animate-fade-in">
            <div className="max-w-7xl mx-auto px-6 mb-6">
                <Breadcrumb items={[{ label: 'Thư viện ảnh' }]} />
            </div>

             {/* Header */}
            <div className="bg-lux-900 py-16 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
                <div className="relative z-10 px-4">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Thư viện ảnh</h1>
                    <p className="text-lux-200 max-w-2xl mx-auto">Khám phá từng góc cạnh tinh tế của Moon Palace qua ống kính nghệ thuật.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Filter Tabs */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                                filter === cat 
                                ? 'bg-lux-900 text-white shadow-lg shadow-lux-900/20' 
                                : 'bg-white text-lux-600 border border-lux-200 hover:bg-lux-50'
                            }`}
                        >
                            {cat === 'All' ? 'Tất cả' : cat}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                    {filteredImages.map((img, idx) => (
                        <div key={idx} className="break-inside-avoid relative group rounded-2xl overflow-hidden cursor-pointer" onClick={() => setLightboxImage(img.src)}>
                            <img src={img.src} alt={img.title} className="w-full h-auto transform transition-transform duration-700 group-hover:scale-110"/>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                                <Maximize2 size={32} className="mb-2"/>
                                <p className="font-bold text-lg font-serif">{img.title}</p>
                                <p className="text-xs uppercase tracking-widest text-lux-200">{img.category}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredImages.length === 0 && (
                    <div className="text-center py-20">
                        <Image size={48} className="text-lux-300 mx-auto mb-4"/>
                        <p className="text-lux-500">Chưa có hình ảnh cho danh mục này.</p>
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            {lightboxImage && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-fade-in" onClick={() => setLightboxImage(null)}>
                    <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                        <X size={40}/>
                    </button>
                    <img src={lightboxImage} alt="Fullscreen" className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"/>
                </div>
            )}
        </div>
    );
};