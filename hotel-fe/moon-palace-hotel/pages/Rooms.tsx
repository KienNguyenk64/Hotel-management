import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomApi } from '../services/api';
import { Room, RoomType } from '../types';
import {
  Filter,
  ChevronDown,
  Star,
  Users,
  Maximize,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  TrendingUp,
  Sparkles,
  X,
  SlidersHorizontal,
  DollarSign
} from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';

/* ================= CONSTANTS ================= */

const ROOM_TYPE_LABELS: Record<string, string> = {
  All: 'Tất cả',
  STANDARD: 'Phòng tiêu chuẩn',
  SUPERIOR: 'Phòng cao cấp',
  DELUXE: 'Phòng sang trọng',
  SUITE: 'Phòng suite',
  EXECUTIVE: 'Phòng điều hành',
  PRESIDENTIAL: 'Phòng tổng thống',
  FAMILY: 'Phòng gia đình',
  HONEYMOON: 'Phòng tân hôn'
};

const PRICE_RANGES = [
  { value: 'ALL', label: 'Tất cả mức giá', min: 0, max: Infinity },
  { value: 'UNDER_1M', label: 'Dưới 1 triệu', min: 0, max: 1000000 },
  { value: '1M_5M', label: '1 - 5 triệu', min: 1000000, max: 5000000 },
  { value: 'ABOVE_5M', label: 'Trên 5 triệu', min: 5000000, max: Infinity }
];



const RoomSkeleton = () => (
  <div className="bg-white rounded-3xl overflow-hidden border border-gray-200 animate-pulse">
    <div className="h-72 bg-gray-200" />
    <div className="p-6 space-y-4">
      <div className="h-6 bg-gray-200 rounded w-2/3" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="flex gap-2">
        <div className="h-8 bg-gray-200 rounded w-20" />
        <div className="h-8 bg-gray-200 rounded w-20" />
      </div>
      <div className="h-12 bg-gray-200 rounded" />
    </div>
  </div>
);


export const Rooms: React.FC = () => {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterType, setFilterType] = useState<string>('All');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc' | 'default'>('default');
  const [priceRange, setPriceRange] = useState<string>('ALL');

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [typeOpen, setTypeOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const priceDropdownRef = useRef<HTMLDivElement>(null);

  const pageSize = 6;
  const roomTypes = ['All', ...Object.values(RoomType)];

  const hasActiveFilter =
    filterType !== 'All' || priceSort !== 'default' || priceRange !== 'ALL';


  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const sort = priceSort === 'default' ? 'createdDate' : 'pricePerNight';
        const order = priceSort === 'default' ? 'desc' : priceSort;

        const response =
          filterType !== 'All'
            ? await roomApi.search({
                type: filterType as RoomType,
                page: currentPage,
                size: pageSize,
                sortBy: sort,
                sortOrder: order as any
              })
            : await roomApi.getAll(currentPage, pageSize, sort, order);

        if (response.data.status === 'success') {
          let availableRooms = response.data.data.content.filter(
            (room: Room) => room.status === 'AVAILABLE'
          );

          availableRooms = availableRooms.filter(room => {
            const priceVND = room.pricePerNight ;
            const range = PRICE_RANGES.find(r => r.value === priceRange);
            if (!range || range.value === 'ALL') return true;
            return priceVND >= range.min && priceVND < range.max;
          });

          setRooms(availableRooms);
          setTotalPages(response.data.data.totalPages);
        }
      } catch (err) {
        console.error('Failed to fetch rooms', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [currentPage, filterType, priceSort, priceRange]);

  useEffect(() => {
    setCurrentPage(0);
  }, [filterType, priceSort, priceRange]);


  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setTypeOpen(false);
      }
      if (priceDropdownRef.current && !priceDropdownRef.current.contains(e.target as Node)) {
        setPriceOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getDisplayImage = (room: Room) =>
    room.images?.[0] ||
    room.thumbnailImage ||
    'https://images.unsplash.com/photo-1566073771259-6a8506099945';

    const moneyUSD = 26000;
  const formatVND = (usdPrice: number) => {
    return (usdPrice).toLocaleString('vi-VN');
  };

  const formatUSD = (usdPrice: number) => {
    return (usdPrice/moneyUSD).toLocaleString('vi-VN');
  };
  const clearAllFilters = () => {
    setFilterType('All');
    setPriceRange('ALL');
    setPriceSort('default');
  };

  const selectedPriceLabel = PRICE_RANGES.find(r => r.value === priceRange)?.label || 'Tất cả';


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
        <Breadcrumb items={[{ label: 'Phòng nghỉ & Suites' }]} />
      </div>


      <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          
          <div className="hidden md:flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-sm shadow-md">
                <SlidersHorizontal size={18} /> Bộ lọc
              </div>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setTypeOpen(!typeOpen)}
                  className={`flex items-center gap-2 px-5 py-2.5 min-w-[200px] border-2 rounded-xl font-semibold text-sm transition-all shadow-sm
                    ${filterType !== 'All' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-300 bg-white hover:border-gray-400'}`}
                >
                  <Filter size={16} />
                  {ROOM_TYPE_LABELS[filterType]}
                  <ChevronDown
                    size={16}
                    className={`ml-auto transition-transform ${typeOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {typeOpen && (
                  <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-2xl border-2 border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {roomTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => {
                          setFilterType(type);
                          setTypeOpen(false);
                        }}
                        className={`w-full px-5 py-3 text-left text-sm font-semibold transition-colors flex items-center gap-2
                          ${filterType === type
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                            : 'hover:bg-gray-100'}`}
                      >
                        {filterType === type && <Sparkles size={14} className="fill-current" />}
                        {ROOM_TYPE_LABELS[type]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Range Dropdown */}
              <div className="relative" ref={priceDropdownRef}>
                <button
                  onClick={() => setPriceOpen(!priceOpen)}
                  className={`flex items-center gap-2 px-5 py-2.5 min-w-[200px] border-2 rounded-xl font-semibold text-sm transition-all shadow-sm
                    ${priceRange !== 'ALL' 
                      ? 'border-green-500 bg-green-50 text-green-700' 
                      : 'border-gray-300 bg-white hover:border-gray-400'}`}
                >
                  <DollarSign size={16} />
                  {selectedPriceLabel}
                  <ChevronDown
                    size={16}
                    className={`ml-auto transition-transform ${priceOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {priceOpen && (
                  <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-2xl border-2 border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {PRICE_RANGES.map(range => (
                      <button
                        key={range.value}
                        onClick={() => {
                          setPriceRange(range.value);
                          setPriceOpen(false);
                        }}
                        className={`w-full px-5 py-3 text-left text-sm font-semibold transition-colors flex items-center gap-2
                          ${priceRange === range.value
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                            : 'hover:bg-gray-100'}`}
                      >
                        {priceRange === range.value && <Sparkles size={14} className="fill-current" />}
                        {range.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Sort */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-600">Sắp xếp:</span>
              <select
                value={priceSort}
                onChange={e => setPriceSort(e.target.value as any)}
                className="px-4 py-2.5 border-2 border-gray-300 rounded-xl text-sm font-semibold bg-white hover:border-gray-400 transition-colors cursor-pointer shadow-sm"
              >
                <option value="default"> Mặc định</option>
                <option value="asc"> Giá tăng dần</option>
                <option value="desc"> Giá giảm dần</option>
              </select>
            </div>
          </div>

          {/* Mobile Filter Button */}
          <div className="md:hidden flex items-center justify-between">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-sm shadow-md"
            >
              <SlidersHorizontal size={18} /> Bộ lọc & Sắp xếp
              {hasActiveFilter && (
                <span className="bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  !
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Bộ lọc & Sắp xếp</h3>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-2">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Room Type */}
              <div>
                <label className="block text-sm font-bold mb-3 text-gray-700">Loại phòng</label>
                <div className="grid grid-cols-2 gap-2">
                  {roomTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all
                        ${filterType === type
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                          : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                      {ROOM_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-bold mb-3 text-gray-700">Khoảng giá</label>
                <div className="space-y-2">
                  {PRICE_RANGES.map(range => (
                    <button
                      key={range.value}
                      onClick={() => setPriceRange(range.value)}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left
                        ${priceRange === range.value
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                          : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-bold mb-3 text-gray-700">Sắp xếp</label>
                <select
                  value={priceSort}
                  onChange={e => setPriceSort(e.target.value as any)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold"
                >
                  <option value="default">⭐ Mặc định</option>
                  <option value="asc">💰 Giá tăng dần</option>
                  <option value="desc">💎 Giá giảm dần</option>
                </select>
              </div>

              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold shadow-lg"
              >
                Áp dụng bộ lọc
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ACTIVE FILTERS ================= */}

      {hasActiveFilter && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-gray-600">Đang lọc:</span>
            {filterType !== 'All' && (
              <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-bold shadow-md flex items-center gap-2">
                {ROOM_TYPE_LABELS[filterType]}
                <X size={14} className="cursor-pointer hover:scale-110 transition-transform" onClick={() => setFilterType('All')} />
              </span>
            )}
            {priceRange !== 'ALL' && (
              <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-sm font-bold shadow-md flex items-center gap-2">
                {selectedPriceLabel}
                <X size={14} className="cursor-pointer hover:scale-110 transition-transform" onClick={() => setPriceRange('ALL')} />
              </span>
            )}
            {priceSort !== 'default' && (
              <span className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full text-sm font-bold shadow-md flex items-center gap-2">
                {priceSort === 'asc' ? 'Giá tăng' : 'Giá giảm'}
                <X size={14} className="cursor-pointer hover:scale-110 transition-transform" onClick={() => setPriceSort('default')} />
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-sm font-bold text-red-600 hover:text-red-700 hover:underline transition-all flex items-center gap-1"
            >
              <X size={16} /> Xóa tất cả
            </button>
          </div>
        </div>
      )}

      {/* ================= ROOM GRID ================= */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[...Array(6)].map((_, i) => (
              <RoomSkeleton key={i} />
            ))}
          </div>
        ) : rooms.length ? (
          <>
            {/* Results Count */}
            <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp size={16} />
              <span className="font-semibold">Tìm thấy {rooms.length} phòng</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
              {rooms.map((room, index) => (
                <div
                  key={room.id}
                  className="group bg-white rounded-3xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 overflow-hidden animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Image */}
                  <div
                    onClick={() => navigate(`/room/${room.id}`)}
                    className="relative h-72 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={getDisplayImage(room)}
                      alt={room.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Badge */}
                    {room.averageRating >= 4.5 && (
                      <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                        <Sparkles size={12} className="fill-current" /> Đề xuất
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-serif font-bold mb-3 group-hover:text-blue-600 transition-colors">{room.name}</h3>
                    
                    <div className="flex gap-4 text-xs font-semibold text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Maximize size={14} className="text-blue-500" />
                        {room.size}m²
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={14} className="text-green-500" />
                        {room.maxOccupancy} người
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-500 fill-yellow-400" />
                        {room.averageRating || 5.0}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">{room.description}</p>

                    <div className="flex flex-col gap-2 pt-4 border-t-2 border-gray-100">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {formatVND(room.pricePerNight)}
                        </span>
                        <span className="text-xs text-gray-500 font-semibold"> VNĐ/ đêm</span>
                      </div>
                      <span className="text-xs text-gray-500">≈ ${formatUSD(room.pricePerNight).toLocaleString()}</span>
                      
                      <button
                        onClick={() => navigate(`/room/${room.id}`)}
                        className="mt-2 w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group"
                      >
                        Xem chi tiết 
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                <button
                  disabled={currentPage === 0}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="p-3 border-2 border-gray-300 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all shadow-md"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">
                    <span className="text-blue-600">{currentPage + 1}</span>
                    <span className="text-gray-400 mx-2">/</span>
                    <span className="text-gray-600">{totalPages}</span>
                  </span>
                </div>
                
                <button
                  disabled={currentPage === totalPages - 1}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="p-3 border-2 border-gray-300 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all shadow-md"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 animate-in fade-in duration-500">
            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <ImageOff size={48} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Không tìm thấy phòng</h3>
            <p className="text-gray-500 mb-6">Thử điều chỉnh bộ lọc để xem thêm kết quả</p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}
      </div>
    </div>
  );
};