import React, { useState, useEffect } from 'react';
import { adminRoomApi, roomApi } from '../../services/api';
import { Room, RoomType, RoomStatus, CreateRoomRequest, BedType, RoomView } from '../../types';
import { 
  Plus, Edit2, Trash2, XCircle, Search, Filter, Loader2, 
  AlertTriangle, Image as ImageIcon, Check, Eye, ChevronLeft, ChevronRight, 
  RotateCcw, Archive, Star, X, Wifi, Wind, CheckCircle, ShieldAlert, BedDouble,
  Upload, ImagePlus, Trash
} from 'lucide-react';

// Extended type to handle form state including optional isActive for edits
type RoomFormState = CreateRoomRequest & { isActive?: boolean };

const INITIAL_ROOM_STATE: RoomFormState = {
  roomNumber: '',
  name: '',
  type: RoomType.STANDARD,
  description: '',
  pricePerNight: 500000,
  size: 25,
  bedCount: 1,
  bedType: BedType.QUEEN,
  maxOccupancy: 2,
  floor: 1,
  view: RoomView.CITY,
  amenities: [],
  // images: [],
  // thumbnailImage: '',
  allowSmoking: false,
  hasBathroom: true,
  hasBalcony: false,
  hasKitchen: false,
  notes: '',
  imageFiles: [],
  isActive: true
};

const COMMON_AMENITIES = [
  "WiFi tốc độ cao", "Điều hòa 2 chiều", "TV màn hình phẳng", 
  "Minibar", "Két sắt an toàn", "Máy sấy tóc", 
  "Áo choàng tắm", "Dép đi trong nhà", "Ấm đun nước", "Bàn làm việc"
];

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop';

export const AdminRooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterFloor, setFilterFloor] = useState<string>('All');
  const [showTrash, setShowTrash] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT' | 'VIEW'>('CREATE');
  
  // View Modal State
  const [activeViewImage, setActiveViewImage] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState<RoomFormState>(INITIAL_ROOM_STATE);
  const [currentStatus, setCurrentStatus] = useState<RoomStatus>(RoomStatus.AVAILABLE); 
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);
  
  // Helpers for inputs
  const [amenityInput, setAmenityInput] = useState('');
  const [imageInput, setImageInput] = useState('');

  // Image upload state
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailIndex, setThumbnailIndex] = useState<number>(0);
  // Ảnh server hiện tại (khi EDIT) - track những ảnh còn giữ lại
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingThumbnailIndex, setExistingThumbnailIndex] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  const [modalLoading, setModalLoading] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await roomApi.getAll(page, 10, 'createdDate', 'desc');
      if (response.data?.data) {
        setRooms(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch rooms", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // --- Amenities Logic ---
  const handleAddAmenity = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (amenityInput.trim() && !formData.amenities.includes(amenityInput.trim())) {
      setFormData(prev => ({ ...prev, amenities: [...prev.amenities, amenityInput.trim()] }));
      setAmenityInput('');
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    setFormData(prev => ({ ...prev, amenities: prev.amenities.filter(a => a !== amenity) }));
  };

  const toggleCommonAmenity = (amenity: string) => {
    if (formData.amenities.includes(amenity)) {
      handleRemoveAmenity(amenity);
    } else {
      setFormData(prev => ({ ...prev, amenities: [...prev.amenities, amenity] }));
    }
  };

  // --- Images Logic ---
  const handleAddImage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (imageInput.trim()) {
      setFormData(prev => ({ ...prev, images: [...prev.images, imageInput.trim()] }));
      setImageInput('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  // --- File Upload Handlers ---
  // Compress ảnh xuống < 4MB trước khi upload
  const compressImage = (file: File, maxSizeMB = 4): Promise<File> => {
    return new Promise((resolve) => {
      if (file.size <= maxSizeMB * 1024 * 1024) { resolve(file); return; }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let { width, height } = img;
          const MAX_DIM = 1920;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) { height = Math.round((height * MAX_DIM) / width); width = MAX_DIM; }
            else { width = Math.round((width * MAX_DIM) / height); height = MAX_DIM; }
          }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, width, height);
          const tryCompress = (quality: number) => {
            canvas.toBlob((blob) => {
              if (!blob) { resolve(file); return; }
              if (blob.size <= maxSizeMB * 1024 * 1024 || quality <= 0.1) {
                resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg", lastModified: Date.now() }));
              } else { tryCompress(quality - 0.1); }
            }, "image/jpeg", quality);
          };
          tryCompress(0.85);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const processFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (validFiles.length === 0) return;
    const compressedFiles = await Promise.all(validFiles.map(f => compressImage(f)));
    const newPreviews: string[] = [];
    let loaded = 0;
    compressedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        loaded++;
        if (loaded === compressedFiles.length) {
          setImageFiles(prev => [...prev, ...compressedFiles]);
          setImagePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    e.target.value = ''; // reset input để có thể chọn lại cùng file
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveUploadedImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    if (thumbnailIndex === index) setThumbnailIndex(0);
    else if (thumbnailIndex > index) setThumbnailIndex(prev => prev - 1);
  };

  const handleSetThumbnail = (index: number) => {
    setThumbnailIndex(index);
  };

  const prepareFormForEdit = (room: Room) => {
    setEditingId(room.id);
    setCurrentStatus(room.status);
    setFormData({
      roomNumber: room.roomNumber,
      name: room.name,
      type: room.type,
      description: room.description,
      pricePerNight: room.pricePerNight,
      size: room.size,
      bedCount: room.bedCount,
      bedType: room.bedType,
      maxOccupancy: room.maxOccupancy,
      floor: room.floor,
      view: room.view,
      amenities: room.amenities || [],
      images: room.images || [],
      thumbnailImage: room.thumbnailImage,
      allowSmoking: room.allowSmoking,
      hasBathroom: room.hasBathroom,
      hasBalcony: room.hasBalcony,
      hasKitchen: room.hasKitchen,
      notes: room.notes || '',
      isActive: room.isActive
    });
    setAmenityInput('');
    setImageInput('');
  };

  const openAddModal = () => {
    setModalMode('CREATE');
    setFormData(INITIAL_ROOM_STATE);
    setCurrentStatus(RoomStatus.AVAILABLE);
    setAmenityInput('');
    setImageInput('');
    setImageFiles([]);
    setImagePreviews([]);
    setThumbnailFile(null);
    setThumbnailIndex(0);
    setExistingImages([]);
    setExistingThumbnailIndex(0);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setModalMode('EDIT');
    prepareFormForEdit(room);
    setImageFiles([]);
    setImagePreviews([]);
    setThumbnailFile(null);
    setThumbnailIndex(0);
    // Load ảnh server hiện tại vào state
    const imgs = room.images && room.images.length > 0 ? room.images.filter(Boolean) : (room.thumbnailImage ? [room.thumbnailImage] : []);
    setExistingImages(imgs);
    setExistingThumbnailIndex(0);
    setIsModalOpen(true);
  };

  const openViewModal = (room: Room) => {
    setModalMode('VIEW');
    setViewingRoom(room);
    const initialImg = (room.images && room.images.length > 0 && room.images[0]) 
      ? room.images[0] 
      : (room.thumbnailImage || '');
    setActiveViewImage(initialImg);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.roomNumber.match(/^[0-9]{3,4}$/)) {
      showNotification("Số phòng phải là 3-4 chữ số (VD: 101, 1002)", 'error');
      return;
    }
    if (formData.amenities.length === 0) {
      showNotification("Vui lòng thêm ít nhất 1 tiện nghi", 'error');
      return;
    }

    setModalLoading(true);

    try {
      if (modalMode === 'CREATE') {
        const createPayload: CreateRoomRequest = {
          roomNumber: formData.roomNumber,
          name: formData.name,
          type: formData.type,
          description: formData.description,
          pricePerNight: Number(formData.pricePerNight),
          size: Number(formData.size),
          bedCount: Number(formData.bedCount),
          bedType: formData.bedType,
          maxOccupancy: Number(formData.maxOccupancy),
          floor: Number(formData.floor),
          view: formData.view,
          amenities: formData.amenities,
          allowSmoking: formData.allowSmoking,
          hasBathroom: formData.hasBathroom,
          hasBalcony: formData.hasBalcony,
          hasKitchen: formData.hasKitchen,
          notes: formData.notes,
          imageFiles: imageFiles,
          thumbnailImage: imageFiles.length > 0 ? imageFiles[thumbnailIndex] : undefined,
        };
        await adminRoomApi.create(createPayload);
        showNotification("Tạo phòng mới thành công!", 'success');
      } else if (modalMode === 'EDIT' && editingId) {
        const updatePayload: any = {
          name: formData.name,
          description: formData.description,
          floor: Number(formData.floor),
          pricePerNight: Number(formData.pricePerNight),
          view: formData.view,
          amenities: formData.amenities,
          allowSmoking: formData.allowSmoking,
          hasBalcony: formData.hasBalcony,
          hasKitchen: formData.hasKitchen,
          notes: formData.notes,
          // Danh sách URL ảnh cũ còn giữ lại
          keepImageUrls: existingImages,
        };
        // Nếu có upload ảnh mới thì thêm vào
        if (imageFiles.length > 0) {
          updatePayload.images = imageFiles;
          updatePayload.thumbnailImage = imageFiles[thumbnailIndex];
        }
        await adminRoomApi.update(editingId, updatePayload);
        
        // Update status if changed
        const originalRoom = rooms.find(r => r.id === editingId);
        if (originalRoom && originalRoom.status !== currentStatus) {
            await adminRoomApi.updateStatus(editingId, currentStatus);
        }

        showNotification("Cập nhật phòng thành công!", 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error("Error saving room", err);
      const serverMsg = err.response?.data?.message || "Có lỗi xảy ra khi lưu phòng.";
      showNotification(serverMsg, 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phòng này?")) {
      try {
        await adminRoomApi.delete(id);
        showNotification("Đã xóa phòng thành công", 'success');
        fetchData();
      } catch (error) {
        showNotification("Không thể xóa phòng.", 'error');
      }
    }
  };

  const handleRestore = async (id: string) => {
      if (window.confirm("Khôi phục phòng này hoạt động trở lại?")) {
          try {
              await adminRoomApi.toggleActive(id);
              await adminRoomApi.updateStatus(id, RoomStatus.AVAILABLE);
              showNotification("Đã khôi phục phòng", 'success');
              fetchData();
          } catch (error) {
              showNotification("Không thể khôi phục phòng.", 'error');
          }
      }
  };

  const handleToggleFeatured = async (room: Room) => {
      // Optimistic Update
      const updatedRooms = rooms.map(r => r.id === room.id ? {...r, isFeatured: !r.isFeatured} : r);
      setRooms(updatedRooms);
      
      try {
          await adminRoomApi.toggleFeatured(room.id);
          showNotification(room.isFeatured ? "Đã bỏ nổi bật" : "Đã đánh dấu nổi bật", 'success');
      } catch (error) {
          // Rollback
          fetchData();
          showNotification("Lỗi khi cập nhật trạng thái nổi bật", 'error');
      }
  }

  const getDisplayImage = (room: Room) => {
    if (room.images && room.images.length > 0 && room.images[0]) return room.images[0];
    if (room.thumbnailImage) return room.thumbnailImage;
    return PLACEHOLDER_IMG;
  };

  const getStatusBadge = (status: RoomStatus) => {
    switch(status) {
      case RoomStatus.AVAILABLE: return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> Trống</span>;
      case RoomStatus.OCCUPIED: return <span className="px-2.5 py-1 bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1"><ShieldAlert size={12}/> Đã có khách</span>;
      case RoomStatus.MAINTENANCE: return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold flex items-center gap-1"><RotateCcw size={12}/> Bảo trì</span>;
      case RoomStatus.CLEANING: return <span className="px-2.5 py-1 bg-cyan-100 text-cyan-700 border border-cyan-200 rounded-lg text-xs font-bold flex items-center gap-1"><Wind size={12}/> Dọn dẹp</span>;
      default: return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-bold">{status}</span>;
    }
  };

  // Extract unique floors for filter
  const uniqueFloors = Array.from(new Set(rooms.map(r => r.floor))).sort((a, b) => Number(a) - Number(b));

  // Filter rooms locally for active/trash views
  const displayedRooms = rooms.filter(r => 
    (showTrash ? !r.isActive : r.isActive) && // Filter active vs deleted
    (filterType === 'All' || r.type === filterType) &&
    (filterStatus === 'All' || r.status === filterStatus) &&
    (filterFloor === 'All' || r.floor.toString() === filterFloor) && // Floor Filter
    (searchTerm === '' || r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.roomNumber.includes(searchTerm))
  );

  return (
    <div className="max-w-[1600px] mx-auto p-6 font-sans text-slate-800 animate-fade-in">
       {/* Notification Toast */}
       {notification && (
            <div className={`fixed top-6 right-6 z-[60] px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-slide-in-right ${
                notification.type === 'success' ? 'bg-white border-emerald-100 text-emerald-700' : 'bg-white border-rose-100 text-rose-700'
            }`}>
                <div className={`p-1 rounded-full ${notification.type === 'success' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                    {notification.type === 'success' ? <CheckCircle size={18}/> : <ShieldAlert size={18}/>}
                </div>
                <span className="text-sm font-bold">{notification.message}</span>
            </div>
        )}

      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Quản lý Phòng</h1>
          <p className="text-slate-500">Danh sách toàn bộ phòng nghỉ trong hệ thống.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200 transform active:scale-95 duration-200"
        >
          <Plus size={20}/> Thêm phòng mới
        </button>
      </header>

      {/* Tabs & Controls */}
      <div className="flex gap-1 mb-0 border-b border-slate-200">
          <button 
              onClick={() => setShowTrash(false)}
              className={`px-6 py-3 font-bold text-sm rounded-t-xl transition-colors ${!showTrash ? 'bg-white text-indigo-600 border border-slate-200 border-b-white translate-y-[1px]' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
          >
              Danh sách phòng
          </button>
          <button 
              onClick={() => setShowTrash(true)}
              className={`px-6 py-3 font-bold text-sm rounded-t-xl transition-colors flex items-center gap-2 ${showTrash ? 'bg-white text-red-600 border border-slate-200 border-b-white translate-y-[1px]' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
          >
              <Archive size={16}/> Phòng bị xóa
          </button>
      </div>

      <div className="bg-white p-4 rounded-b-2xl rounded-tr-2xl shadow-sm border border-slate-200 border-t-0 mb-6 flex flex-col xl:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên phòng, số phòng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
        
        {/* Filters Wrapper */}
        <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
            {/* Type Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter size={18} className="text-slate-500 shrink-0"/>
            <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 font-bold focus:outline-none cursor-pointer w-full hover:bg-slate-50 transition-colors"
            >
                <option value="All">Tất cả loại phòng</option>
                {Object.values(RoomType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            </div>
            
            {/* Status Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-slate-400 font-bold text-xs shrink-0 px-2">Trạng thái:</span>
            <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 font-bold focus:outline-none cursor-pointer w-full hover:bg-slate-50 transition-colors"
            >
                <option value="All">Tất cả</option>
                {Object.values(RoomStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            </div>

            {/* Floor Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-slate-400 font-bold text-xs shrink-0 px-2">Tầng:</span>
            <select 
                value={filterFloor}
                onChange={(e) => setFilterFloor(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 font-bold focus:outline-none cursor-pointer w-full hover:bg-slate-50 transition-colors"
            >
                <option value="All">Tất cả</option>
                {uniqueFloors.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-indigo-500" size={40}/></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Thông tin phòng</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Giá & Trạng thái</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tiện nghi</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Nổi bật</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayedRooms.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                        {showTrash ? "Danh sách phòng bị xóa trống." : "Không tìm thấy phòng nào."}
                    </td>
                  </tr>
                )}
                {displayedRooms.map(room => {
                  const displayImg = getDisplayImage(room);
                  return (
                    <tr key={room.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0 relative">
                            <img 
                            src={displayImg} 
                            alt={room.roomNumber} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.src = PLACEHOLDER_IMG;
                            }}
                            />
                            <div className="absolute top-0.5 left-0.5 bg-black/60 text-white text-[9px] font-bold px-1 rounded">
                              #{room.roomNumber}
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{room.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                              <span className="font-semibold text-indigo-600">{room.type}</span> • Tầng {room.floor}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-700 font-mono font-bold mb-1">
                          {room.pricePerNight.toLocaleString('vi-VN')} <span className="text-xs text-slate-400 font-sans">VNĐ</span>
                        </div>
                        {getStatusBadge(room.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs text-slate-600">
                          <span className="mb-1 font-medium">{room.maxOccupancy} Khách • {room.size}m²</span>
                          <div className="flex gap-1 flex-wrap">
                            {room.amenities.slice(0, 2).map((a, i) => (
                              <span key={i} className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">{a}</span>
                            ))}
                            {room.amenities.length > 2 && <span className="text-[10px] text-slate-400">+{room.amenities.length - 2}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                          <button 
                             onClick={() => handleToggleFeatured(room)}
                             className={`p-2 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 ${room.isFeatured ? 'text-yellow-400 hover:bg-yellow-50' : 'text-slate-300 hover:text-yellow-400 hover:bg-yellow-50'}`}
                             title={room.isFeatured ? "Bỏ nổi bật" : "Đánh dấu nổi bật"}
                          >
                              <Star size={18} fill={room.isFeatured ? "currentColor" : "none"}/>
                          </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openViewModal(room)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors" title="Xem chi tiết">
                            <Eye size={18}/>
                          </button>
                          
                          {/* Active Mode Actions */}
                          {!showTrash && (
                              <>
                                <button onClick={() => openEditModal(room)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Sửa">
                                    <Edit2 size={18}/>
                                </button>
                                <button onClick={() => handleDelete(room.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa tạm thời">
                                    <Trash2 size={18}/>
                                </button>
                              </>
                          )}

                          {/* Trash Mode Actions */}
                          {showTrash && (
                              <button onClick={() => handleRestore(room.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Khôi phục">
                                  <RotateCcw size={18}/>
                              </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
          <span className="text-xs text-slate-500 font-bold">Trang {page + 1} / {totalPages || 1}</span>
          <div className="flex gap-2">
            <button 
              disabled={page === 0} 
              onClick={() => setPage(p => p - 1)}
              className="p-2 border border-slate-200 rounded-lg bg-white disabled:opacity-50 hover:bg-slate-50 text-slate-600"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              disabled={page >= totalPages - 1} 
              onClick={() => setPage(p => p + 1)}
              className="p-2 border border-slate-200 rounded-lg bg-white disabled:opacity-50 hover:bg-slate-50 text-slate-600"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Modal (Create / Edit / View) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border shadow-sm ${
                  modalMode === 'CREATE' ? 'bg-green-50 border-green-100 text-green-600' :
                  modalMode === 'EDIT' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                  'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  {modalMode === 'CREATE' && <Plus size={20}/>}
                  {modalMode === 'EDIT' && <Edit2 size={20}/>}
                  {modalMode === 'VIEW' && <Eye size={20}/>}
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {modalMode === 'CREATE' && 'Thêm phòng mới'}
                  {modalMode === 'EDIT' && 'Cập nhật thông tin phòng'}
                  {modalMode === 'VIEW' && 'Chi tiết phòng'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-900">
                <XCircle size={24} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 bg-white">
              
              {modalMode === 'VIEW' && viewingRoom ? (
                // VIEW MODE
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Gallery Section */}
                    <div className="w-full md:w-1/3 space-y-4">
                      {/* Main Image */}
                      <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative shadow-sm group">
                        <img 
                          src={activeViewImage || PLACEHOLDER_IMG} 
                          alt="Room Main" 
                          className="w-full h-full object-cover transition-all duration-300"
                          onError={(e) => {
                              e.currentTarget.src = PLACEHOLDER_IMG;
                          }}
                        />
                         <div className="absolute top-3 right-3">
                             {viewingRoom.isFeatured && (
                                 <div className="bg-yellow-400 text-white p-2 rounded-full shadow-lg">
                                     <Star size={16} fill="white"/>
                                 </div>
                             )}
                         </div>
                         <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                           {getStatusBadge(viewingRoom.status)}
                        </div>
                      </div>
                      
                      {/* Thumbnail Strip */}
                      <div className="grid grid-cols-4 gap-2">
                        {[...new Set([...(viewingRoom.images || []), viewingRoom.thumbnailImage])].filter(Boolean).map((img, i) => (
                           <div 
                              key={i}
                              onClick={() => setActiveViewImage(img)}
                              className={`aspect-square rounded-lg overflow-hidden border cursor-pointer transition-all ${activeViewImage === img ? 'border-indigo-500 ring-2 ring-indigo-500/20 opacity-100' : 'border-slate-200 opacity-60 hover:opacity-100'}`}
                           >
                              <img 
                                src={img} 
                                className="w-full h-full object-cover" 
                                alt={`Thumbnail ${i}`} 
                                onError={(e) => e.currentTarget.style.display = 'none'}
                              />
                           </div>
                        ))}
                      </div>
                    </div>

                    <div className="w-full md:w-2/3 space-y-6">
                      <div>
                         <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                           {viewingRoom.name}
                           <span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">#{viewingRoom.roomNumber}</span>
                         </h2>
                         <div className="text-indigo-600 font-bold text-lg mt-1">{viewingRoom.pricePerNight.toLocaleString()} VNĐ <span className="text-sm font-normal text-slate-500">/đêm</span></div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div><span className="text-slate-500 text-xs uppercase font-bold">Loại:</span> <span className="font-medium">{viewingRoom.type}</span></div>
                        <div><span className="text-slate-500 text-xs uppercase font-bold">Tầng:</span> <span className="font-medium">{viewingRoom.floor}</span></div>
                        <div><span className="text-slate-500 text-xs uppercase font-bold">Diện tích:</span> <span className="font-medium">{viewingRoom.size}m²</span></div>
                        <div><span className="text-slate-500 text-xs uppercase font-bold">Sức chứa:</span> <span className="font-medium">{viewingRoom.maxOccupancy} người</span></div>
                        <div><span className="text-slate-500 text-xs uppercase font-bold">Giường:</span> <span className="font-medium">{viewingRoom.bedCount}x {viewingRoom.bedType}</span></div>
                        <div><span className="text-slate-500 text-xs uppercase font-bold">Hướng:</span> <span className="font-medium">{viewingRoom.view}</span></div>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><Wifi size={16}/> Tiện nghi</h4>
                        <div className="flex flex-wrap gap-2">
                          {viewingRoom.amenities.map((a, i) => (
                            <span key={i} className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium text-sm border border-indigo-100">{a}</span>
                          ))}
                        </div>
                      </div>

                      <div>
                         <h4 className="font-bold text-slate-900 mb-1">Mô tả</h4>
                         <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{viewingRoom.description}</p>
                      </div>
                      
                      {viewingRoom.notes && (
                         <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg text-yellow-800 text-sm flex gap-2">
                             <AlertTriangle size={16} className="shrink-0 mt-0.5"/>
                             <div>
                                 <span className="font-bold">Ghi chú:</span> {viewingRoom.notes}
                             </div>
                         </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // CREATE / EDIT MODE
                <form id="roomForm" onSubmit={handleSubmit} className="space-y-8">
                  {/* Section 1: Basic & Status */}
                  <div>
                    <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                         <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thông tin cơ bản</h4>
                         {modalMode === 'EDIT' && (
                             <div className="flex items-center gap-2">
                                 <span className="text-xs font-bold text-slate-500">Trạng thái:</span>
                                 <select 
                                     value={currentStatus}
                                     onChange={(e) => setCurrentStatus(e.target.value as RoomStatus)}
                                     className="text-xs font-bold p-1.5 rounded border border-slate-200 bg-slate-50 focus:border-indigo-500 outline-none"
                                 >
                                     {Object.values(RoomStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                 </select>
                             </div>
                         )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Số phòng *</label>
                          <input 
                            required 
                            type="text" 
                            name="roomNumber"
                            value={formData.roomNumber} 
                            onChange={handleInputChange} 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-mono font-bold text-center" 
                            placeholder="101"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">3-4 chữ số</p>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Tên phòng *</label>
                          <input 
                            required 
                            type="text" 
                            name="name"
                            value={formData.name} 
                            onChange={handleInputChange} 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-bold" 
                            placeholder="Deluxe Ocean View"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Loại phòng</label>
                          <select name="type" value={formData.type} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 cursor-pointer">
                            {Object.values(RoomType).map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-700 mb-1.5">Giá / đêm (VNĐ) *</label>
                           <input 
                              required 
                              type="number" 
                              name="pricePerNight"
                              value={formData.pricePerNight} 
                              onChange={handleInputChange} 
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-right font-mono"
                           />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Details */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Chi tiết kỹ thuật</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Diện tích (m²)</label>
                          <input type="number" name="size" value={formData.size} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"/>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Sức chứa (Người)</label>
                          <input type="number" name="maxOccupancy" value={formData.maxOccupancy} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"/>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Tầng</label>
                          <input type="number" name="floor" value={formData.floor} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"/>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Số giường</label>
                          <input type="number" name="bedCount" value={formData.bedCount} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"/>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Loại giường</label>
                          <select name="bedType" value={formData.bedType} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 cursor-pointer">
                            {Object.values(BedType).map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Hướng nhìn</label>
                          <select name="view" value={formData.view} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 cursor-pointer">
                            {Object.values(RoomView).map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                    </div>
                    
                    {/* Features Checkboxes */}
                    <div className="flex flex-wrap gap-4 mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                       <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 rounded transition-colors">
                          <input type="checkbox" name="hasBathroom" checked={formData.hasBathroom} onChange={handleInputChange} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"/>
                          <span className="text-sm font-medium text-slate-700">Phòng tắm riêng</span>
                       </label>
                       <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 rounded transition-colors">
                          <input type="checkbox" name="hasBalcony" checked={formData.hasBalcony || false} onChange={handleInputChange} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"/>
                          <span className="text-sm font-medium text-slate-700">Ban công</span>
                       </label>
                       <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 rounded transition-colors">
                          <input type="checkbox" name="hasKitchen" checked={formData.hasKitchen || false} onChange={handleInputChange} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"/>
                          <span className="text-sm font-medium text-slate-700">Bếp</span>
                       </label>
                       <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 rounded transition-colors">
                          <input type="checkbox" name="allowSmoking" checked={formData.allowSmoking || false} onChange={handleInputChange} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"/>
                          <span className="text-sm font-medium text-slate-700">Hút thuốc</span>
                       </label>
                        {/* isActive checkbox for Edit/Create */}
                        <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 rounded transition-colors">
                          <input type="checkbox" name="isActive" checked={formData.isActive || false} onChange={handleInputChange} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"/>
                          <span className="text-sm font-medium text-slate-700">Kích hoạt</span>
                       </label>
                    </div>
                  </div>

                  {/* Section 3: Smart Amenities & Description */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Nội dung & Tiện nghi</h4>
                    <div className="space-y-6">
                      
                      {/* Amenities Tag Input */}
                      <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Tiện nghi (Nhấn Enter để thêm)</label>
                          <div className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                              <div className="flex flex-wrap gap-2 mb-2">
                                  {formData.amenities.map((amenity, idx) => (
                                      <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-700 shadow-sm animate-scale-up">
                                          {amenity}
                                          <button type="button" onClick={() => handleRemoveAmenity(amenity)} className="hover:text-red-500"><X size={14}/></button>
                                      </span>
                                  ))}
                                  <input 
                                      type="text" 
                                      value={amenityInput}
                                      onChange={e => setAmenityInput(e.target.value)}
                                      onKeyDown={e => e.key === 'Enter' && handleAddAmenity(e)}
                                      className="bg-transparent outline-none flex-1 min-w-[150px] text-sm p-1"
                                      placeholder="Thêm tiện nghi..."
                                  />
                              </div>
                          </div>
                          {/* Common Amenities Suggestions */}
                          <div className="mt-3 flex flex-wrap gap-2">
                              {COMMON_AMENITIES.map(a => (
                                  <button 
                                    key={a}
                                    type="button"
                                    onClick={() => toggleCommonAmenity(a)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${formData.amenities.includes(a) ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'}`}
                                  >
                                      {formData.amenities.includes(a) ? '-' : '+'} {a}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Mô tả chi tiết</label>
                        <textarea 
                          required 
                          rows={4} 
                          name="description"
                          value={formData.description} 
                          onChange={handleInputChange} 
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-sm"
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Image Upload Manager */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                      Hình ảnh phòng
                    </h4>

                    {/* Drag & Drop Upload Zone */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 ${
                        isDragging
                          ? 'border-indigo-400 bg-indigo-50 scale-[1.01]'
                          : 'border-slate-200 bg-slate-50/60 hover:border-indigo-300 hover:bg-indigo-50/30'
                      }`}
                    >
                      <label className="flex flex-col items-center justify-center gap-3 py-10 cursor-pointer">
                        <div className={`p-4 rounded-2xl transition-colors ${isDragging ? 'bg-indigo-100 text-indigo-500' : 'bg-white text-slate-400 border border-slate-200 shadow-sm'}`}>
                          <Upload size={28} />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-slate-700">
                            {isDragging ? 'Thả ảnh vào đây...' : 'Kéo & thả ảnh hoặc nhấn để chọn'}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP • Nhiều file cùng lúc</p>
                        </div>
                        <span className="px-5 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 flex items-center gap-2">
                          <ImagePlus size={16}/> Chọn ảnh từ máy
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleFileInputChange}
                        />
                      </label>
                    </div>

                    {/* Edit mode: existing images from server - có thể xóa từng ảnh */}
                    {modalMode === 'EDIT' && existingImages.length > 0 && (
                      <div className="mt-5">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold text-slate-600 flex items-center gap-2">
                            <ImageIcon size={14} className="text-slate-400"/> Ảnh hiện tại ({existingImages.length})
                            <span className="text-slate-400 font-normal">• Nhấn để đặt đại diện · Hover để xóa</span>
                          </p>
                          <button
                            type="button"
                            onClick={() => setExistingImages([])}
                            className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1 px-2 py-1 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash size={12}/> Xóa tất cả
                          </button>
                        </div>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                          {existingImages.map((img, idx) => (
                            <div
                              key={idx}
                              onClick={() => setExistingThumbnailIndex(idx)}
                              className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-150 group ${
                                existingThumbnailIndex === idx && imagePreviews.length === 0
                                  ? 'border-indigo-500 ring-2 ring-indigo-500/25 shadow-lg shadow-indigo-100'
                                  : 'border-slate-200 hover:border-indigo-300'
                              }`}
                            >
                              <img src={img} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG; }}/>
                              {/* Thumbnail badge */}
                              {existingThumbnailIndex === idx && imagePreviews.length === 0 && (
                                <div className="absolute top-1.5 left-1.5 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                  <Star size={8} fill="white"/> ĐẠI DIỆN
                                </div>
                              )}
                              {/* Remove button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExistingImages(prev => prev.filter((_, i) => i !== idx));
                                  if (existingThumbnailIndex === idx) setExistingThumbnailIndex(0);
                                  else if (existingThumbnailIndex > idx) setExistingThumbnailIndex(prev => prev - 1);
                                }}
                                className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
                              >
                                <X size={12}/>
                              </button>
                              <div className="absolute bottom-1 right-1.5 text-[9px] font-bold text-white/80 bg-black/40 rounded px-1">{idx + 1}</div>
                            </div>
                          ))}
                        </div>
                        {imagePreviews.length === 0 && (
                          <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2 text-slate-600 text-xs font-medium">
                            <Star size={13} fill="currentColor" className="text-indigo-400 shrink-0"/>
                            Ảnh đại diện: <span className="font-bold">Ảnh số {existingThumbnailIndex + 1}</span>
                            <span className="text-slate-400 ml-auto">Upload ảnh mới bên dưới để thêm vào</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* New uploaded images preview */}
                    {imagePreviews.length > 0 && (
                      <div className="mt-5">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold text-slate-700 flex items-center gap-2">
                            <Check size={14} className="text-emerald-500"/> {imagePreviews.length} ảnh đã chọn
                            <span className="text-slate-400 font-normal">• Nhấn để đặt làm ảnh đại diện</span>
                          </p>
                          <button
                            type="button"
                            onClick={() => { setImageFiles([]); setImagePreviews([]); setThumbnailIndex(0); }}
                            className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1 px-2 py-1 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash size={12}/> Xóa tất cả
                          </button>
                        </div>

                        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                          {imagePreviews.map((preview, idx) => (
                            <div
                              key={idx}
                              onClick={() => handleSetThumbnail(idx)}
                              className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-150 group ${
                                thumbnailIndex === idx
                                  ? 'border-indigo-500 ring-2 ring-indigo-500/25 shadow-lg shadow-indigo-100'
                                  : 'border-slate-200 hover:border-indigo-300'
                              }`}
                            >
                              <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-105"/>

                              {/* Thumbnail badge */}
                              {thumbnailIndex === idx && (
                                <div className="absolute top-1.5 left-1.5 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                  <Star size={8} fill="white"/> ĐẠI DIỆN
                                </div>
                              )}

                              {/* Remove button */}
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleRemoveUploadedImage(idx); }}
                                className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
                              >
                                <X size={12}/>
                              </button>

                              {/* Index number */}
                              <div className="absolute bottom-1 right-1.5 text-[9px] font-bold text-white/80 bg-black/40 rounded px-1">
                                {idx + 1}
                              </div>
                            </div>
                          ))}

                          {/* Add more button */}
                          <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/40 transition-all text-slate-400 hover:text-indigo-500">
                            <Plus size={20}/>
                            <span className="text-[10px] font-bold mt-1">Thêm</span>
                            <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileInputChange}/>
                          </label>
                        </div>

                        {/* Info bar */}
                        <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-2 text-indigo-700 text-xs font-medium">
                          <Star size={13} fill="currentColor" className="text-indigo-400 shrink-0"/>
                          Ảnh đại diện: <span className="font-bold">Ảnh số {thumbnailIndex + 1}</span>
                          <span className="text-indigo-400 ml-auto">Nhấn vào ảnh để chọn đại diện</span>
                        </div>
                      </div>
                    )}

                    {/* Empty state */}
                    {imagePreviews.length === 0 && existingImages.length === 0 && (
                      <div className="mt-4 flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-xs">
                        <AlertTriangle size={14} className="shrink-0"/>
                        <span>{modalMode === 'EDIT' ? 'Đã xóa hết ảnh cũ. Upload ảnh mới bên trên để thay thế.' : 'Chưa có ảnh nào. Phòng sẽ hiển thị ảnh mặc định.'}</span>
                      </div>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            {modalMode !== 'VIEW' && (
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 border border-slate-200 bg-white rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition-colors">
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  form="roomForm" 
                  disabled={modalLoading}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-200 transition-colors"
                >
                  {modalLoading ? <Loader2 className="animate-spin" size={20}/> : <Check size={20}/>}
                  {modalMode === 'CREATE' ? 'Tạo phòng ngay' : 'Lưu thay đổi'}
                </button>
              </div>
            )}
            {modalMode === 'VIEW' && (
               <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                 <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                   Đóng
                 </button>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};