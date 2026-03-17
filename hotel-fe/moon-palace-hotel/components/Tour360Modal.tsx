import React from 'react';
import { X, Moon, Loader2 } from 'lucide-react';

interface Tour360ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Tour360Modal: React.FC<Tour360ModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = React.useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-lux-900/95 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full h-full max-w-7xl max-h-[90vh] bg-black rounded-3xl overflow-hidden shadow-2xl border border-lux-500/30 flex flex-col">
        
        {/* Header */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
           <div className="flex items-center gap-2 pointer-events-auto">
              <div className="bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20">
                  <Moon size={20} className="text-lux-500" fill="#D4AF37"/>
              </div>
              <div>
                  <h3 className="text-white font-serif font-bold text-lg leading-none">Moon Palace</h3>
                  <p className="text-lux-200 text-xs uppercase tracking-widest">Virtual Tour 360°</p>
              </div>
           </div>
           
           <button 
             onClick={onClose}
             className="pointer-events-auto w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all hover:rotate-90"
           >
             <X size={24} />
           </button>
        </div>

        {/* Loader */}
        {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-0">
                <Loader2 size={48} className="animate-spin text-lux-500 mb-4" />
                <p className="text-lux-200 font-light tracking-widest">Đang tải không gian thực tế ảo...</p>
            </div>
        )}

        {/* 360 Iframe - Using a reliable public Hotel Suite demo (Matterport) */}
        <iframe 
            src="https://my.matterport.com/show/?m=S523J724424&play=1"
            className="w-full h-full flex-1 relative z-10"
            allow="vr; xr; accelerometer; gyroscope; autoplay;"
            frameBorder="0"
            onLoad={() => setIsLoading(false)}
            allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};