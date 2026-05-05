
import React, { useRef, useState } from 'react';
import { Camera, Loader2, Trash2, User as UserIcon } from 'lucide-react';
import { userApi } from '../services/api';

interface AvatarUploadProps {
  currentUrl?: string;
  name: string;
  onUploadSuccess: (newUrl: string) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ currentUrl, name, onUploadSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local Preview
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const response = await userApi.uploadAvatar(file);
      if (response.data.status === 'success' && response.data.data.avatarUrl) {
        onUploadSuccess(response.data.data.avatarUrl);
      }
    } catch (error) {
      console.error("Avatar upload failed", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Gỡ ảnh đại diện?")) {
      setIsUploading(true);
      try {
        await userApi.deleteAvatar();
        setPreviewUrl(null);
        onUploadSuccess('');
      } catch (error) {
        console.error("Avatar delete failed", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const displayUrl = previewUrl || currentUrl;

  return (
    <div className="relative group">
      <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-slate-800 shadow-2xl overflow-hidden relative bg-slate-900 flex items-center justify-center">
        {displayUrl ? (
          <img src={displayUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <UserIcon className="w-1/2 h-1/2 text-slate-700" />
        )}
        
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className="animate-spin text-white" size={24} />
          </div>
        )}

        <button 
          onClick={() => fileInputRef.current?.click()}
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
        >
          <Camera className="text-white" size={24} />
        </button>
      </div>

      {currentUrl && !isUploading && (
        <button 
          onClick={handleDelete}
          className="absolute -top-1 -right-1 p-2 bg-rose-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-600 active:scale-90"
          title="Xóa ảnh"
        >
          <Trash2 size={14} />
        </button>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*" 
      />
    </div>
  );
};

export default AvatarUpload;
