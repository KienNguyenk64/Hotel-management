import React, { useEffect, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, Legend
} from 'recharts';
import { 
  TrendingUp, Users, CalendarCheck, DollarSign, 
  LogIn, LogOut, Home, Bell, Loader2, Calendar, Filter,
  ArrowUpRight, ArrowDownRight, ChevronRight, Star, RefreshCcw, Activity, Clock, BarChart3,
  MoreHorizontal, CreditCard, CheckCircle2, AlertCircle, X, FileText, Phone, Mail, MapPin, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi, bookingApi } from '../services/api';
import { AdminDashboardData, Booking } from '../types';

// --- Skeleton Components ---
const SkeletonCard = () => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-40 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="w-12 h-12 bg-slate-100 rounded-2xl"></div>
      <div className="w-16 h-6 bg-slate-100 rounded-full"></div>
    </div>
    <div className="h-4 w-24 bg-slate-100 rounded mb-2"></div>
    <div className="h-8 w-32 bg-slate-100 rounded"></div>
  </div>
);

const SkeletonChart = () => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-[400px] animate-pulse">
        <div className="flex justify-between mb-8">
            <div className="h-6 w-48 bg-slate-100 rounded"></div>
            <div className="h-8 w-32 bg-slate-100 rounded-lg"></div>
        </div>
        <div className="h-[300px] bg-slate-50 rounded-xl"></div>
    </div>
);

// --- Stat Card Component ---
const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, subValue }: { title: string, value: string, icon: any, trend?: 'up' | 'down', trendValue?: string, color: string, subValue?: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
    {/* Background Icon Decor */}
    <div className={`absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform group-hover:scale-110 duration-500 ${color.replace('bg-', 'text-')}`}>
        <Icon size={120} />
    </div>
    
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`p-3.5 rounded-2xl ${color} bg-opacity-10 text-opacity-100 group-hover:scale-110 transition-transform shadow-sm`}>
        <Icon size={24} className={color.replace('bg-', 'text-').replace('/10', '')} />
      </div>
      {trend && (
        <span className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-full border ${trend === 'up' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
          {trend === 'up' ? <ArrowUpRight size={14} className="mr-1"/> : <ArrowDownRight size={14} className="mr-1"/>}
          {trendValue}
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 relative z-10">{title}</h3>
    <p className="text-3xl font-sans font-extrabold text-slate-900 relative z-10 tracking-tight">{value}</p>
    {subValue && <p className="text-xs text-slate-400 mt-2 font-medium relative z-10 flex items-center gap-1">{subValue}</p>}
  </div>
);

// --- Custom Tooltip for Chart ---
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-100">
          <p className="text-slate-500 text-xs font-bold mb-2 uppercase tracking-wider">{label}</p>
          {payload.map((entry: any, index: number) => (
             <p key={index} className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                {entry.name}: 
                <span className="font-mono text-indigo-600">{entry.value.toLocaleString()}</span>
             </p>
          ))}
        </div>
      );
    }
    return null;
  };

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState<'WEEK' | 'MONTH' | 'YEAR'>('MONTH');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chartTab, setChartTab] = useState<'REVENUE' | 'BOOKINGS'>('REVENUE');

  // Booking Modal State
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loadingBookingDetail, setLoadingBookingDetail] = useState(false);

  const fetchData = async () => {
      if (!isRefreshing) setLoading(true);
      
      try {
          const endDate = new Date();
          const startDate = new Date();
          let groupBy: 'DAY' | 'WEEK' | 'MONTH' = 'DAY';

          if (filterPeriod === 'WEEK') {
              startDate.setDate(endDate.getDate() - 7);
              groupBy = 'DAY';
          }
          if (filterPeriod === 'MONTH') {
              startDate.setMonth(endDate.getMonth() - 1);
              groupBy = 'DAY';
          }
          if (filterPeriod === 'YEAR') {
              startDate.setFullYear(endDate.getFullYear() - 1);
              groupBy = 'MONTH';
          }

          const response = await dashboardApi.getAdminDashboardFiltered({
              period: 'CUSTOM',
              startDate: startDate.toISOString().split('T')[0],
              endDate: endDate.toISOString().split('T')[0],
              groupBy: groupBy
          });

          if (response.data.status === 'success') {
              setData(response.data.data);
          }
      } catch (error) {
          console.error("Failed to fetch dashboard data", error);
      } finally {
          setLoading(false);
          setIsRefreshing(false);
      }
  };

  useEffect(() => {
      fetchData();
  }, [filterPeriod]);

  const handleRefresh = () => {
      setIsRefreshing(true);
      fetchData();
  };

  const handleViewBooking = async (bookingId: string) => {
      setLoadingBookingDetail(true);
      // Create a temporary object to show the modal immediately while fetching
      // We search in recentBookings first to find basic info
      const basicInfo = data?.recentBookings.find((b: any) => b.bookingId === bookingId || b.id === bookingId);
      if (basicInfo) {
          // This is a Partial<Booking> but enough to open modal
          // setSelectedBooking(basicInfo as any); 
      }
      
      try {
          const response = await bookingApi.getById(bookingId);
          if (response.data.status === 'success') {
              setSelectedBooking(response.data.data);
          }
      } catch (error) {
          console.error("Failed to load booking details", error);
      } finally {
          setLoadingBookingDetail(false);
      }
  };

  const formatDateLabel = (val: string) => {
      try {
          const date = new Date(val);
          if (isNaN(date.getTime())) return val;
          if (filterPeriod === 'YEAR') return date.toLocaleDateString('vi-VN', { month: 'short' });
          return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      } catch (e) {
          return val;
      }
  };

  // Safe checks for data availability
  const revenueChartData = data?.revenueChart || [];
  const bookingChartData = data?.bookingTrendChart || [];
  const roomStats = data?.roomStats || { occupiedRooms: 0, availableRooms: 0, maintenanceRooms: 0, cleaningRooms: 0, totalRooms: 0 };
  
  const roomStatusData = [
      { name: 'Đã đặt', value: roomStats.occupiedRooms, color: '#4F46E5' }, // indigo-600
      { name: 'Trống', value: roomStats.availableRooms, color: '#10B981' }, // emerald-500
      { name: 'Bảo trì', value: roomStats.maintenanceRooms + roomStats.cleaningRooms, color: '#94A3B8' }, // slate-400
  ];

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto animate-fade-in font-sans text-slate-800">
      
      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedBooking(null)}></div>
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm text-indigo-600">
                            <FileText size={22}/>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                Chi tiết đơn #{selectedBooking.bookingNumber}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">Tạo lúc: {new Date(selectedBooking.createdDate).toLocaleString('vi-VN')}</p>
                        </div>
                    </div>
                    <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X size={20}/></button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Status Card */}
                        <div className="col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${
                                    selectedBooking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-600' :
                                    selectedBooking.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' :
                                    selectedBooking.status === 'CANCELLED' ? 'bg-rose-100 text-rose-600' :
                                    'bg-amber-100 text-amber-600'
                                }`}>
                                    <CheckCircle2 size={20}/>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Trạng thái</p>
                                    <p className="font-bold text-slate-900">{selectedBooking.status}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-400 uppercase">Thanh toán</p>
                                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold ${
                                    selectedBooking.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                }`}>
                                    {selectedBooking.paymentStatus}
                                </span>
                            </div>
                        </div>

                        {/* Guest Info */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                            <h4 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
                                <Users size={16} className="text-indigo-500"/> Thông tin khách
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 shrink-0">
                                        {selectedBooking.userFullName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">{selectedBooking.userFullName}</p>
                                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                            <Mail size={10}/> {selectedBooking.userEmail}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                            <Phone size={10}/> {selectedBooking.userPhoneNumber}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Room Info */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                            <h4 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
                                <Home size={16} className="text-indigo-500"/> Phòng nghỉ
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Phòng:</span>
                                    <span className="font-bold text-slate-900">{selectedBooking.roomName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Số hiệu:</span>
                                    <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 rounded text-xs">#{selectedBooking.roomNumber}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-slate-50 mt-2">
                                    <span className="text-slate-500">Check-in:</span>
                                    <span className="font-medium text-emerald-600">{new Date(selectedBooking.checkInDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Check-out:</span>
                                    <span className="font-medium text-rose-600">{new Date(selectedBooking.checkOutDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financials */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-500">Giá phòng ({selectedBooking.numberOfNights} đêm)</span>
                            <span className="font-bold text-slate-900">${((selectedBooking.roomPricePerNight || 0) * (selectedBooking.numberOfNights || 1)).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-500">Dịch vụ & Phụ phí</span>
                            <span className="font-bold text-slate-900">${(selectedBooking.additionalChargesTotal || 0).toLocaleString()}</span>
                        </div>
                        <div className="border-t border-slate-200 mt-3 pt-3 flex justify-between items-end">
                            <span className="font-bold text-lg text-slate-900">Tổng cộng</span>
                            <span className="font-serif font-bold text-2xl text-indigo-600">{selectedBooking.totalAmount.toLocaleString()}vn₫</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
                    <button onClick={() => setSelectedBooking(null)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm">
                        Đóng
                    </button>
                    <button 
                        onClick={() => navigate('/bookings')} 
                        className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors text-sm shadow-lg shadow-indigo-200 flex items-center gap-2"
                    >
                        Quản lý chi tiết <ExternalLink size={16}/>
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                Tổng quan quản trị
                {isRefreshing && <Loader2 size={20} className="animate-spin text-indigo-500"/>}
            </h1>
            <p className="text-slate-500">Xin chào, đây là tình hình hoạt động của Moon Palace hôm nay.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                {[
                    { key: 'WEEK', label: '7 Ngày' },
                    { key: 'MONTH', label: 'Tháng này' },
                    { key: 'YEAR', label: 'Năm nay' }
                ].map((item) => (
                    <button
                        key={item.key}
                        onClick={() => setFilterPeriod(item.key as any)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            filterPeriod === item.key 
                            ? 'bg-indigo-900 text-white shadow-md' 
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
            <button 
                onClick={handleRefresh}
                className={`p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors shadow-sm ${isRefreshing ? 'cursor-not-allowed opacity-70' : ''}`}
                title="Làm mới dữ liệu"
                disabled={isRefreshing}
            >
                <RefreshCcw size={20} className={isRefreshing ? 'animate-spin' : ''}/>
            </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading ? (
            <>
                <SkeletonCard/><SkeletonCard/><SkeletonCard/><SkeletonCard/>
            </>
        ) : (
            <>
                <StatCard 
                    title="Doanh thu tổng" 
                    value={`$${(data?.revenueStats?.totalRevenue || 0).toLocaleString()}`} 
                    subValue={`Thực thu: $${(data?.revenueStats?.paidRevenue || 0).toLocaleString()}`}
                    icon={DollarSign} 
                    trend="up"
                    trendValue={`${data?.revenueStats?.revenueGrowthRate || 0}%`}
                    color="bg-emerald-500"
                />
                <StatCard 
                    title="Đặt phòng mới" 
                    value={(data?.bookingStats?.totalBookings || 0).toString()} 
                    subValue={`${data?.bookingStats?.completedBookings || 0} hoàn thành`}
                    icon={CalendarCheck} 
                    trend="up"
                    trendValue={`${data?.bookingStats?.bookingGrowthRate || 0}%`}
                    color="bg-blue-500"
                />
                <StatCard 
                    title="Check-in Hôm nay" 
                    value={(data?.overviewStats?.todayCheckIns || 0).toString()} 
                    subValue={`${data?.overviewStats?.todayCheckOuts || 0} Check-out`}
                    icon={LogIn} 
                    color="bg-amber-500"
                />
                <StatCard 
                    title="Tỷ lệ lấp đầy" 
                    value={`${((data?.overviewStats?.occupancyRate || 0) * 100).toFixed(0)}%`} 
                    subValue={`${data?.roomStats?.availableRooms || 0} phòng trống`}
                    icon={Home} 
                    trend={(data?.overviewStats?.occupancyRate || 0) > 0.7 ? 'up' : 'down'}
                    trendValue="Mục tiêu 70%"
                    color="bg-indigo-500"
                />
            </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        {/* Main Chart Section (2/3 width) */}
        <div className="xl:col-span-2">
            {loading ? <SkeletonChart/> : (
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-[450px]">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                {chartTab === 'REVENUE' ? 'Biểu đồ dòng tiền' : 'Xu hướng đặt phòng'}
                            </h3>
                            {chartTab === 'REVENUE' ? (
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                        Tổng phát sinh
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        Đã thanh toán (Thực tế)
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 mt-1">Dữ liệu phân tích theo thời gian thực</p>
                            )}
                        </div>
                        
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button
                                onClick={() => setChartTab('REVENUE')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                                    chartTab === 'REVENUE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <DollarSign size={14}/> Tài chính
                            </button>
                            <button
                                onClick={() => setChartTab('BOOKINGS')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                                    chartTab === 'BOOKINGS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <BarChart3 size={14}/> Đặt phòng
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            {chartTab === 'REVENUE' ? (
                                <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis 
                                        dataKey="label" 
                                        stroke="#94a3b8" 
                                        fontSize={11} 
                                        tickLine={false} 
                                        axisLine={false} 
                                        tickFormatter={formatDateLabel}
                                        dy={10}
                                    />
                                    <YAxis 
                                        stroke="#94a3b8" 
                                        fontSize={11} 
                                        tickLine={false} 
                                        axisLine={false} 
                                        tickFormatter={(val) => `$${val/1000}k`} 
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="value" 
                                        name="Tổng doanh thu"
                                        stroke="#4F46E5" 
                                        strokeWidth={3} 
                                        fillOpacity={1} 
                                        fill="url(#colorRevenue)" 
                                        activeDot={{ r: 6, strokeWidth: 0, fill: '#4F46E5' }}
                                    />
                                    {/* Note: Ideally we would have a second Area/Line for 'paidValue' if API supported it. 
                                        For now, the legend explains the data context. */}
                                </AreaChart>
                            ) : (
                                <BarChart data={bookingChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis 
                                        dataKey="label" 
                                        stroke="#94a3b8" 
                                        fontSize={11} 
                                        tickLine={false} 
                                        axisLine={false} 
                                        tickFormatter={formatDateLabel}
                                        dy={10}
                                    />
                                    <YAxis 
                                        stroke="#94a3b8" 
                                        fontSize={11} 
                                        tickLine={false} 
                                        axisLine={false} 
                                    />
                                    <Tooltip 
                                        cursor={{ fill: '#f8fafc' }}
                                        content={<CustomTooltip />}
                                    />
                                    <Bar 
                                        dataKey="value" 
                                        name="Số lượng đơn" 
                                        fill="#6366f1" 
                                        radius={[6, 6, 0, 0]} 
                                        barSize={40}
                                    />
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                    {chartTab === 'REVENUE' && (
                        <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-2">
                            <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0"/>
                            <p className="text-xs text-amber-800 leading-relaxed">
                                <strong>Lưu ý:</strong> Biểu đồ hiển thị tổng giá trị đặt phòng phát sinh (bao gồm cả chưa thanh toán). 
                                Thực thu hiện tại là <span className="font-bold text-emerald-700">${(data?.revenueStats?.paidRevenue || 0).toLocaleString()}</span>. 
                                Khoản chờ thu là <span className="font-bold text-orange-700">${(data?.revenueStats?.unpaidRevenue || 0).toLocaleString()}</span>.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Side Panel (Room Status & Activity) */}
        <div className="space-y-8 flex flex-col">
            {/* Room Status */}
            {loading ? <div className="bg-white p-6 rounded-3xl h-[280px] animate-pulse"></div> : (
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-[280px]">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Trạng thái phòng</h3>
                    <div className="flex-1 relative min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={roomStatusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={65}
                                outerRadius={85}
                                paddingAngle={5}
                                dataKey="value"
                                cornerRadius={6}
                                stroke="none"
                            >
                            {roomStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <span className="text-3xl font-extrabold text-slate-900">{roomStats.totalRooms}</span>
                            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Tổng phòng</span>
                        </div>
                    </div>
                    <div className="flex justify-center gap-4 mt-2">
                        {roomStatusData.map((item) => (
                            <div key={item.name} className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="text-xs text-slate-600 font-bold">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Today Activities */}
            {loading ? <div className="bg-white p-6 rounded-3xl h-[300px] animate-pulse"></div> : (
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex-1 min-h-[300px]">
                    <div className="flex justify-between items-center mb-5">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Activity size={18} className="text-indigo-500"/> Hoạt động hôm nay
                        </h3>
                    </div>
                    <div className="space-y-5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {data?.todayActivities && data.todayActivities.length > 0 ? data.todayActivities.map((activity: any, idx: number) => (
                            <div key={idx} className="flex gap-4 items-start group">
                                <div className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ring-4 ring-opacity-20 transition-all group-hover:ring-opacity-40 ${
                                    activity.type === 'BOOKING' ? 'bg-blue-500 ring-blue-500' : 
                                    activity.type === 'CHECK_IN' ? 'bg-emerald-500 ring-emerald-500' : 
                                    activity.type === 'CHECK_OUT' ? 'bg-amber-500 ring-amber-500' : 'bg-slate-400 ring-slate-400'
                                }`}></div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-700 leading-snug group-hover:text-indigo-600 transition-colors">
                                        {activity.description || "Hoạt động không xác định"}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <div className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded text-[10px] text-slate-500 font-medium border border-slate-100">
                                            <Clock size={10}/> {activity.time}
                                        </div>
                                        {activity.staffName && (
                                            <span className="text-[10px] text-slate-400 font-medium">bởi {activity.staffName}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                                <Bell size={32} className="mb-2 opacity-20"/>
                                <p className="text-sm">Chưa có hoạt động nào hôm nay.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Recent Bookings - Refined UI with Quick View */}
      <div className="grid grid-cols-1 gap-8">
          {loading ? <div className="bg-white p-6 rounded-3xl h-64 animate-pulse"></div> : (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Đặt phòng gần đây</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Các giao dịch đặt phòng mới nhất được cập nhật.</p>
                      </div>
                      <button onClick={() => navigate('/admin/bookings')} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors px-4 py-2 bg-indigo-50 rounded-xl hover:bg-indigo-100">
                          Xem tất cả <ChevronRight size={16}/>
                      </button>
                  </div>
                  
                  {/* Card/List View for better UX than simple table */}
                  <div className="p-4 space-y-3">
                      {loadingBookingDetail && (
                          <div className="fixed inset-0 z-[60] bg-white/50 backdrop-blur-sm flex items-center justify-center">
                              <Loader2 className="animate-spin text-indigo-600" size={40}/>
                          </div>
                      )}
                      
                      {data?.recentBookings && data.recentBookings.length > 0 ? data.recentBookings.map((booking: any) => (
                          <div 
                            key={booking.bookingId} 
                            onClick={() => handleViewBooking(booking.bookingId || booking.id)} 
                            className="group flex flex-col md:flex-row items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-indigo-100 hover:shadow-md hover:bg-slate-50/50 transition-all cursor-pointer gap-4 relative"
                          >
                              {/* Left: Info */}
                              <div className="flex items-center gap-4 w-full md:w-auto">
                                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold shrink-0 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                      {booking.guestName?.charAt(0) || 'G'}
                                  </div>
                                  <div className="min-w-[180px]">
                                      <div className="flex items-center gap-2">
                                          <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-700 transition-colors">{booking.guestName}</h4>
                                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-mono border border-slate-200">#{booking.bookingNumber}</span>
                                      </div>
                                      <p className="text-xs text-slate-500 mt-0.5">{booking.roomName} • {booking.roomNumber}</p>
                                  </div>
                              </div>

                              {/* Middle: Dates & Status */}
                              <div className="flex flex-wrap items-center gap-4 md:gap-8 w-full md:w-auto flex-1 md:justify-center">
                                  <div className="flex items-center gap-2 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                                      <Calendar size={14} className="text-indigo-400"/>
                                      <span className="font-medium">{new Date(booking.checkInDate).toLocaleDateString('vi-VN')}</span>
                                      <span className="text-slate-300">→</span>
                                      <span className="font-medium">{new Date(booking.checkOutDate).toLocaleDateString('vi-VN')}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${
                                          booking.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                          booking.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                          booking.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                          booking.status === 'CHECKED_IN' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                          'bg-rose-50 text-rose-600 border-rose-100'
                                      }`}>
                                          <span className={`w-1.5 h-1.5 rounded-full ${
                                              booking.status === 'CONFIRMED' ? 'bg-blue-500' :
                                              booking.status === 'COMPLETED' ? 'bg-emerald-500' :
                                              booking.status === 'PENDING' ? 'bg-amber-500' :
                                              booking.status === 'CHECKED_IN' ? 'bg-indigo-500' :
                                              'bg-rose-500'
                                          }`}></span>
                                          {booking.status}
                                      </span>
                                  </div>
                              </div>

                              {/* Right: Price & Actions */}
                              <div className="flex items-center justify-between w-full md:w-auto gap-6 pl-4 md:pl-0 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                                  <div className="text-right">
                                      <p className="font-bold text-slate-900 text-sm">${booking.totalAmount.toLocaleString()}</p>
                                      <p className="text-[10px] text-slate-400 font-medium">Tổng thanh toán</p>
                                  </div>
                                  <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all opacity-0 group-hover:opacity-100" title="Xem nhanh">
                                      <MoreHorizontal size={20}/>
                                  </button>
                              </div>
                          </div>
                      )) : (
                          <div className="text-center py-16 text-slate-400 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                              <div className="flex flex-col items-center justify-center">
                                  <Calendar className="mb-3 opacity-30" size={40}/>
                                  <p>Chưa có dữ liệu đặt phòng gần đây.</p>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};