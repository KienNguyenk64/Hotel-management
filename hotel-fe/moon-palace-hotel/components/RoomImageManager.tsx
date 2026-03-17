
import React, { useState } from 'react';
import { Upload, X, Star, Image as ImageIcon, Plus } from 'lucide-react';

interface RoomImageManagerProps {
  existingImages: string[];
  newFiles: File[];
  thumbnailIndex: number; // Index in the combined array [existing, new]
  onFilesChange: (files: File[]) => void;
  onExistingRemove: (url: string) => void;
  onThumbnailSelect: (index: number) => void;
}

const RoomImageManager: React.FC<RoomImageManagerProps> = ({
  existingImages,
  newFiles,
  thumbnailIndex,
  onFilesChange,
  onExistingRemove,
  onThumbnailSelect
}) => {
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Fix: Explicitly cast to File[] to ensure the type is correctly inferred as File (which extends Blob)
    const files = Array.from(e.target.files || []) as File[];
    if (!files.length) return;

    onFilesChange([...newFiles, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      // Fix: Ensure file is treated as a Blob for readAsDataURL
      reader.readAsDataURL(file);
    });
  };

  const removeNewFile = (idx: number) => {
    const updatedFiles = newFiles.filter((_, i) => i !== idx);
    const updatedPreviews = previews.filter((_, i) => i !== idx);
    onFilesChange(updatedFiles);
    setPreviews(updatedPreviews);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thư viện hình ảnh</h4>
        <label className="cursor-pointer bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-100 transition-colors">
          <Upload size={16} /> Tải lên
          <input type="file" multiple className="hidden" accept="image/*" onChange={handleFileAdd} />
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Existing Images */}
        {existingImages.map((url, idx) => (
          <div key={`exist-${idx}`} className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
            <img src={url} className="w-full h-full object-cover" alt="Room" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <button 
              onClick={() => onExistingRemove(url)}
              className="absolute top-2 right-2 p-1.5 bg-white/90 text-rose-500 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50"
            >
              <X size={14} />
            </button>

            <button 
              onClick={() => onThumbnailSelect(idx)}
              className={`absolute bottom-2 left-2 p-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5 text-[10px] font-bold ${
                thumbnailIndex === idx ? 'bg-amber-400 text-white' : 'bg-white/90 text-slate-500 hover:text-amber-500 opacity-0 group-hover:opacity-100'
              }`}
            >
              <Star size={12} fill={thumbnailIndex === idx ? 'white' : 'none'} /> {thumbnailIndex === idx ? 'Ảnh bìa' : 'Đặt làm bìa'}
            </button>
          </div>
        ))}

        {/* New File Previews */}
        {previews.map((src, idx) => {
          const actualIdx = existingImages.length + idx;
          return (
            <div key={`new-${idx}`} className="group relative aspect-square rounded-2xl overflow-hidden bg-emerald-50 border border-emerald-100 shadow-sm">
              <img src={src} className="w-full h-full object-cover" alt="New Upload" />
              <div className="absolute inset-0 bg-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <button 
                onClick={() => removeNewFile(idx)}
                className="absolute top-2 right-2 p-1.5 bg-white/90 text-rose-500 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50"
              >
                <X size={14} />
              </button>

              <button 
                onClick={() => onThumbnailSelect(actualIdx)}
                className={`absolute bottom-2 left-2 p-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5 text-[10px] font-bold ${
                  thumbnailIndex === actualIdx ? 'bg-amber-400 text-white' : 'bg-white/90 text-slate-500 hover:text-amber-500 opacity-0 group-hover:opacity-100'
                }`}
              >
                <Star size={12} fill={thumbnailIndex === actualIdx ? 'white' : 'none'} /> {thumbnailIndex === actualIdx ? 'Ảnh bìa' : 'Đặt làm bìa'}
              </button>

              <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-emerald-500 text-white text-[8px] font-bold rounded uppercase">Mới</div>
            </div>
          );
        })}

        {/* Add Empty State */}
        {existingImages.length === 0 && previews.length === 0 && (
          <label className="col-span-full aspect-[3/1] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition-all">
            <ImageIcon size={32} className="mb-2 opacity-30" />
            <span className="text-sm font-bold">Chưa có ảnh nào. Click để tải lên.</span>
            <input type="file" multiple className="hidden" accept="image/*" onChange={handleFileAdd} />
          </label>
        )}
      </div>
    </div>
  );
};

export default RoomImageManager;
