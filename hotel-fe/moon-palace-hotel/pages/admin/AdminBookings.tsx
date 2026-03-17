import React, { useState, useEffect, useCallback } from 'react';
import { 
  CalendarDays, Search, Filter, CheckCircle, XCircle, MoreHorizontal, 
  FileText, Loader2, LogIn, LogOut, Info, Calendar, Download, 
  Users, X, Phone, Shield, CreditCard, Activity, AlertCircle, ArrowRight,
  Plus, Tag, CreditCard as CardIcon, Search as SearchIcon, ScanLine,
  DollarSign, PieChart, MessageSquare
} from 'lucide-react';
import { bookingApi } from '../../services/api';
import { Booking, BookingStatus, PaymentStatus, BookingStats, BookingSearchCriteria, ServiceCharge } from '../../types';

type SearchMode = 'GENERAL' | 'BOOKING_ID' | 'CCCD';

export const AdminBookings: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [stats, setStats] = useState<BookingStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [searchMode, setSearchMode] = useState<SearchMode>('GENERAL');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [filterPayment, setFilterPayment] = useState<string>('All');
    
    const getToday = () => new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState<string>(getToday());
    const [endDate, setEndDate] = useState<string>(getToday());
    const [useDateFilter, setUseDateFilter] = useState(true);

    const [showCheckInModal, setShowCheckInModal] = useState(false);
    const [checkInBookingId, setCheckInBookingId] = useState<string | null>(null);
    const [checkInData, setCheckInData] = useState({
        depositPaymentMethod: 'CASH' as const,
        depositTransactionId: '',
        specialNotes: ''
    });

  // Modal & Notification
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [modalTab, setModalTab] = useState<'OVERVIEW' | 'SERVICES' | 'INVOICE'>('OVERVIEW');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Service Charge State
  const [newService, setNewService] = useState<Partial<ServiceCharge>>({ serviceType: 'MINIBAR', quantity: 1, amount: 0, description: '' });
  const [addingService, setAddingService] = useState(false);

  // --- Fetch Data ---
  const fetchStats = async () => {
      try {
          const response = await bookingApi.getStatistics();
          if (response.data.status === 'success') {
              setStats(response.data.data);
          }
      } catch (error) {
          console.error("Failed to fetch stats", error);
      }
  };

  const fetchBookings = useCallback(async () => {
      setLoading(true);
      try {
          const criteria: BookingSearchCriteria = {
              page: page,
              size: 10,
              sortBy: 'createdDate',
              sortOrder: 'desc',
          };

          // Map search term based on mode
          if (searchTerm) {
              if (searchMode === 'BOOKING_ID') {
                  criteria.bookingNumber = searchTerm;
              } else if (searchMode === 'CCCD') {
                  criteria.cccdNumber = searchTerm;
              } else {
                  criteria.keyword = searchTerm;
              }
          }

          if (filterStatus !== 'All') {
              criteria.status = filterStatus as BookingStatus;
          }

          if (filterPayment !== 'All') {
              criteria.paymentStatus = filterPayment as PaymentStatus;
          }

          if (useDateFilter) {
              criteria.checkInDateFrom = startDate;
              criteria.checkInDateTo = endDate;
          }

          const response = await bookingApi.search(criteria);

          if (response.data.status === "success") {
              setBookings(response.data.data.content);
              setTotalPages(response.data.data.totalPages);
          }
      } catch (error) {
          console.error("Failed to fetch bookings", error);
          showNotification("Không thể tải danh sách đơn đặt phòng", 'error');
      } finally {
          setLoading(false);
      }
  }, [page, filterStatus, filterPayment, useDateFilter, startDate, endDate, searchTerm, searchMode]);


  

  useEffect(() => {
      fetchBookings();
      fetchStats(); 
  }, [fetchBookings]);

  // --- Handlers ---
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setPage(0);
      fetchBookings();
  }

  const refreshSelectedBooking = async (id: string) => {
      const updated = await bookingApi.getById(id);
      if(updated.data.status === 'success') {
          setSelectedBooking(updated.data.data);
      }
  }

      const handleAction = async (id: string, action: 'confirm' | 'check-in' | 'check-out' | 'cancel', e?: React.MouseEvent) => {
        e?.stopPropagation();
        
        if (action === 'check-in') {
            setCheckInBookingId(id);
            setShowCheckInModal(true);
            return;
        }
        
        if (!window.confirm("Bạn có chắc chắn muốn thực hiện hành động này?")) return;
        
        setActionLoading(id);
        try {
            let response;
            if (action === 'confirm') {
                response = await bookingApi.confirm(id);
            } 
            else if (action === 'check-out') {
                response = await bookingApi.checkOut(id);
            } 
            else if (action === 'cancel') {
                response = await bookingApi.cancel(id, "Admin hủy từ Dashboard");
            }

            if (response?.data.status === "success") {
                showNotification("Thao tác thành công!", 'success');
                fetchBookings();
                fetchStats();
                if (selectedBooking && selectedBooking.id === id) {
                    refreshSelectedBooking(id);
                }
            }
        } catch (error: any) {
            console.error(`Failed to ${action}`, error);
            const errorMsg = error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
            showNotification(errorMsg, 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleCheckIn = async () => {
        if (!checkInBookingId) return;
        
        setActionLoading(checkInBookingId);
        try {
            const booking = bookings.find(b => b.id === checkInBookingId);
            
            const requestData = {
                depositPaymentMethod: checkInData.depositPaymentMethod,
                depositTransactionId: checkInData.depositTransactionId || undefined,
                guestVerification: {
                    fullName: booking?.userFullName || '',
                    cccdNumber: booking?.primaryGuest?.cccdNumber || '',
                    phoneNumber: booking?.userPhoneNumber || ''
                },
                specialNotes: checkInData.specialNotes || undefined
            };
            
            const response = await bookingApi.checkIn(checkInBookingId, requestData);
            
            if (response.data.status === "success") {
                showNotification("Check-in thành công!", 'success');
                setShowCheckInModal(false);
                setCheckInBookingId(null);
                setCheckInData({ depositPaymentMethod: 'CASH', depositTransactionId: '', specialNotes: '' });
                fetchBookings();
                fetchStats();
                if (selectedBooking && selectedBooking.id === checkInBookingId) {
                    refreshSelectedBooking(checkInBookingId);
                }
            }
        } catch (error: any) {
            console.error('Failed to check-in', error);
            const errorMsg = error.response?.data?.message || "Có lỗi xảy ra khi check-in.";
            showNotification(errorMsg, 'error');
        } finally {
            setActionLoading(null);
        }
    };

  const handleAddService = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedBooking) return;
      setAddingService(true);
      try {
          await bookingApi.addServiceCharge(selectedBooking.id, newService);
          showNotification('Đã thêm phí dịch vụ', 'success');
          setNewService({ serviceType: 'MINIBAR', quantity: 1, amount: 0, description: '' }); 
          refreshSelectedBooking(selectedBooking.id);
          fetchBookings(); 
      } catch (error) {
          showNotification('Không thể thêm dịch vụ', 'error');
      } finally {
          setAddingService(false);
      }
  };

  const handleExportCSV = () => {
    if (bookings.length === 0) {
        showNotification("Không có dữ liệu để xuất.", 'error');
        return;
    }
    const headers = ["Mã Booking", "Khách hàng", "SĐT", "Phòng", "Check-in", "Check-out", "Tổng tiền", "Thanh toán", "Trạng thái"];
    const csvContent = [
        headers.join(","),
        ...bookings.map(b => [
            b.bookingNumber,
            `"${b.userFullName}"`,
            `'${b.userPhoneNumber}`, 
            `"${b.roomName} (${b.roomNumber})"`,
            b.checkInDate,
            b.checkOutDate,
            b.totalAmount,
            b.paymentStatus,
            b.status
        ].join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `bookings_export_${getToday()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const setDateFilterMode = (mode: 'TODAY' | 'ALL') => {
      if (mode === 'TODAY') {
          setStartDate(getToday());
          setEndDate(getToday());
          setUseDateFilter(true);
      } else {
          setUseDateFilter(false);
      }
      setPage(0);
  };

  const getStatusBadge = (status: BookingStatus) => {
      switch (status) {
          case BookingStatus.PENDING: return <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg text-xs font-bold flex items-center w-fit gap-1"><Info size={12}/> Chờ duyệt</span>;
          case BookingStatus.CONFIRMED: return <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold flex items-center w-fit gap-1"><CheckCircle size={12}/> Đã xác nhận</span>;
          case BookingStatus.CHECKED_IN: return <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold flex items-center w-fit gap-1"><LogIn size={12}/> Đang ở</span>;
          case BookingStatus.CHECKED_OUT: return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center w-fit gap-1"><LogOut size={12}/> Đã trả</span>;
          case BookingStatus.COMPLETED: return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center w-fit gap-1"><CheckCircle size={12}/> Hoàn thành</span>;
          case BookingStatus.CANCELLED: return <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center w-fit gap-1"><XCircle size={12}/> Đã hủy</span>;
          default: return <span className="px-2.5 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-xs font-bold">{status}</span>;
      }
  }

  const getPaymentBadge = (status: PaymentStatus) => {
      switch (status) {
          case PaymentStatus.PAID: return <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 uppercase tracking-wide">Đã thanh toán</span>;
          case PaymentStatus.PARTIALLY_PAID: return <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 uppercase tracking-wide">Cọc một phần</span>;
          case PaymentStatus.REFUNDED: return <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-100 uppercase tracking-wide">Đã hoàn tiền</span>;
          default: return <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-100 uppercase tracking-wide">Chưa thanh toán</span>;
      }
  }

  return (
    <div className="animate-fade-in max-w-[1600px] mx-auto p-4 md:p-6 font-sans text-slate-800 pb-20">
      
      {notification && (
            <div className={`fixed top-6 right-6 z-[60] px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-slide-in-right ${
                notification.type === 'success' ? 'bg-white border-emerald-100 text-emerald-700' : 'bg-white border-rose-100 text-rose-700'
            }`}>
                <div className={`p-1 rounded-full ${notification.type === 'success' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                    {notification.type === 'success' ? <CheckCircle size={18}/> : <Shield size={18}/>}
                </div>
                <span className="text-sm font-bold">{notification.message}</span>
            </div>
      )}

      {/* --- HEADER & STATS --- */}
      <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Quản lý Đặt phòng</h1>
                <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><Activity size={16} className="text-indigo-500"/> Hôm nay:</span>
                    <span className="flex items-center gap-1"><LogIn size={14} className="text-emerald-500"/> {stats?.todayCheckIns || 0} Check-in</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span className="flex items-center gap-1"><LogOut size={14} className="text-orange-500"/> {stats?.todayCheckOuts || 0} Check-out</span>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={handleExportCSV} className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2 text-sm">
                    <Download size={16}/> Xuất Báo Cáo
                </button>
            </div>
          </div>

          {/* KPI Cards Mini */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg"><Calendar size={20}/></div>
                  <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Tổng Booking</p>
                      <p className="text-lg font-bold text-slate-900">{stats?.totalBookings || 0}</p>
                  </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg"><AlertCircle size={20}/></div>
                  <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Chờ xử lý</p>
                      <p className="text-lg font-bold text-slate-900">{stats?.pendingBookings || 0}</p>
                  </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg"><DollarSign size={20}/></div>
                  <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Doanh thu (Paid)</p>
                      <p className="text-lg font-bold text-slate-900">{stats?.paidRevenue?.toLocaleString() || 0}đ</p>
                  </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                  <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg"><PieChart size={20}/></div>
                  <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Công suất</p>
                      <p className="text-lg font-bold text-slate-900">{stats?.occupancyRate || 0}%</p>
                  </div>
              </div>
          </div>
      </div>

      {/* --- COMMAND BAR (Filters & Search) --- */}
      <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 mb-6">
        <form onSubmit={handleSearchSubmit} className="flex flex-col xl:flex-row gap-2">
            
            {/* Search Group */}
            <div className="flex-1 flex flex-col md:flex-row gap-2 p-1">
                {/* Search Type Selector */}
                <div className="relative md:w-40 bg-slate-50 rounded-xl p-1 flex">
                    <select 
                        value={searchMode}
                        onChange={(e) => setSearchMode(e.target.value as SearchMode)}
                        className="w-full bg-transparent text-xs font-bold text-slate-600 outline-none px-2 appearance-none cursor-pointer text-center"
                    >
                        <option value="GENERAL">Tìm chung</option>
                        <option value="BOOKING_ID">Mã Booking</option>
                        <option value="CCCD">Số CCCD</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Filter size={12} className="text-slate-400"/>
                    </div>
                </div>

                {/* Search Input */}
                <div className="relative flex-1">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        {searchMode === 'CCCD' ? <ScanLine size={18}/> : searchMode === 'BOOKING_ID' ? <Tag size={18}/> : <SearchIcon size={18}/>}
                    </div>
                    <input 
                        type="text" 
                        placeholder={searchMode === 'CCCD' ? 'Nhập số căn cước công dân...' : searchMode === 'BOOKING_ID' ? 'Nhập mã booking (VD: BK...)' : 'Tìm tên khách, SĐT...'}
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium placeholder:text-slate-400"
                    />
                </div>
            </div>

            <div className="w-px bg-slate-100 hidden xl:block my-2"></div>

            {/* Filters Group */}
            <div className="flex flex-col md:flex-row gap-2 p-1">
                <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }} className="h-[42px] bg-slate-50 hover:bg-slate-100 rounded-xl px-4 text-xs font-bold text-slate-600 outline-none cursor-pointer border border-transparent focus:border-indigo-200">
                    <option value="All">Tất cả trạng thái</option>
                    {Object.values(BookingStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <select value={filterPayment} onChange={(e) => { setFilterPayment(e.target.value); setPage(0); }} className="h-[42px] bg-slate-50 hover:bg-slate-100 rounded-xl px-4 text-xs font-bold text-slate-600 outline-none cursor-pointer border border-transparent focus:border-indigo-200">
                    <option value="All">Thanh toán</option>
                    {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <div className={`flex items-center gap-2 bg-slate-50 rounded-xl px-2 transition-all ${!useDateFilter ? 'opacity-50' : ''}`}>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-xs font-bold text-slate-600 outline-none w-24 py-2.5"/>
                    <ArrowRight size={12} className="text-slate-300"/>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-xs font-bold text-slate-600 outline-none w-24 py-2.5"/>
                </div>
                
                <button type="button" onClick={() => setUseDateFilter(!useDateFilter)} className={`p-2.5 rounded-xl transition-colors ${useDateFilter ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    <CalendarDays size={18}/>
                </button>

                <button type="submit" className="h-[42px] px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all flex items-center gap-2">
                    Lọc
                </button>
            </div>
        </form>
      </div>

      {/* --- TABLE CONTENT --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-visible min-h-[500px] flex flex-col">
        {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                 <Loader2 className="animate-spin text-indigo-500 mb-4" size={40}/>
                 <p className="font-bold text-slate-500">Đang tải dữ liệu...</p>
            </div>
        ) : (
            <>
                <div className="flex-1 overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider pl-8">Booking ID</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Khách hàng</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Lịch trình & Phòng</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Thanh toán</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider pr-8">Hành động</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                    {bookings.length > 0 ? (
                        bookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-indigo-50/30 transition-colors group cursor-pointer" onClick={() => setSelectedBooking(booking)}>
                            <td className="px-6 py-4 whitespace-nowrap align-middle pl-8">
                                <span className="block text-sm font-bold text-indigo-600 font-mono group-hover:text-indigo-700 transition-colors">#{booking.bookingNumber}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 block">{new Date(booking.createdDate).toLocaleDateString('vi-VN')}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap align-middle">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">
                                        {booking.userFullName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-900">{booking.userFullName}</div>
                                        <div className="text-xs text-slate-500 flex items-center gap-1 font-medium"><Phone size={10}/> {booking.userPhoneNumber}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap align-middle">
                                <div className="text-sm font-bold text-slate-800 mb-1">{booking.roomName}</div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                    <Calendar size={12} className="text-indigo-400"/> 
                                    <span>{new Date(booking.checkInDate).toLocaleDateString('vi-VN')}</span>
                                    <ArrowRight size={10} className="text-slate-300"/>
                                    <span>{new Date(booking.checkOutDate).toLocaleDateString('vi-VN')}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap align-middle">
                                <div className="text-sm font-bold text-slate-900 font-mono mb-1">{booking.totalAmount.toLocaleString()} ₫</div>
                                {getPaymentBadge(booking.paymentStatus)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap align-middle text-center">{getStatusBadge(booking.status)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right align-middle pr-8" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100">
                                    {booking.status === BookingStatus.PENDING && (
                                        <>
                                            <button onClick={(e) => handleAction(booking.id, 'confirm', e)} disabled={!!actionLoading} className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-200 hover:bg-emerald-600 transition-all flex items-center gap-1">
                                                {actionLoading === booking.id ? <Loader2 size={12} className="animate-spin"/> : <CheckCircle size={12}/>} Duyệt
                                            </button>
                                            <button onClick={(e) => handleAction(booking.id, 'cancel', e)} disabled={!!actionLoading} className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                                <XCircle size={18}/>
                                            </button>
                                        </>
                                    )}
                                    {booking.status === BookingStatus.CONFIRMED && (
                                        <button onClick={(e) => handleAction(booking.id, 'check-in', e)} disabled={!!actionLoading} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-1.5">
                                            {actionLoading === booking.id ? <Loader2 size={12} className="animate-spin"/> : <LogIn size={12}/>} Check-in
                                        </button>
                                    )}
                                    {booking.status === BookingStatus.CHECKED_IN && (
                                        <button onClick={(e) => handleAction(booking.id, 'check-out', e)} disabled={!!actionLoading} className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-bold shadow-md shadow-orange-200 hover:bg-orange-600 transition-all flex items-center gap-1.5">
                                            {actionLoading === booking.id ? <Loader2 size={12} className="animate-spin"/> : <LogOut size={12}/>} Check-out
                                        </button>
                                    )}
                                    <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                        <MoreHorizontal size={18}/>
                                    </button>
                                </div>
                            </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-500"><div className="flex flex-col items-center justify-center"><div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300"><Search size={32}/></div><p className="font-bold">Không tìm thấy đơn đặt phòng nào.</p><p className="text-sm mt-1">Thử thay đổi bộ lọc ngày hoặc trạng thái.</p><button onClick={() => setDateFilterMode('ALL')} className="mt-4 text-indigo-600 font-bold hover:underline text-sm">Xem tất cả thời gian</button></div></td></tr>
                    )}
                    </tbody>
                </table>
                </div>
                
                {/* Pagination */}
                {bookings.length > 0 && (
                    <div className="bg-white px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Trang {page + 1} / {totalPages || 1}</span>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors">Trước</button>
                            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors">Sau</button>
                        </div>
                    </div>
                )}
            </>
        )}
      </div>

      {/* --- BOOKING DETAIL MODAL --- */}
      {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedBooking(null)}></div>
              <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
                  
                  {/* Modal Header */}
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <div className="flex items-center gap-4">
                          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm text-indigo-600">
                              <FileText size={24}/>
                          </div>
                          <div>
                              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                  #{selectedBooking.bookingNumber}
                                  {getStatusBadge(selectedBooking.status)}
                              </h3>
                              <p className="text-xs text-slate-500 font-medium mt-0.5">{new Date(selectedBooking.createdDate).toLocaleString('vi-VN')}</p>
                          </div>
                      </div>
                      <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X size={20}/></button>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-slate-100 px-6 bg-white sticky top-0 z-20">
                      {['OVERVIEW', 'SERVICES', 'INVOICE'].map((tab) => (
                          <button 
                            key={tab}
                            onClick={() => setModalTab(tab as any)}
                            className={`px-4 py-3 text-sm font-bold border-b-2 transition-all ${modalTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                          >
                              {tab === 'OVERVIEW' ? 'Thông tin chung' : tab === 'SERVICES' ? 'Dịch vụ & Phụ phí' : 'Hóa đơn'}
                          </button>
                      ))}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                      
                      {/* --- OVERVIEW TAB --- */}
                      {modalTab === 'OVERVIEW' && (
                          <div className="space-y-6 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Guest Info Card */}
                                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                                            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><Users size={14}/></div> Thông tin khách
                                        </h4>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-500 font-medium">Họ tên</span><span className="font-bold text-slate-900">{selectedBooking.userFullName}</span></div>
                                            <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-500 font-medium">SĐT</span><span className="font-bold text-slate-900">{selectedBooking.userPhoneNumber}</span></div>
                                            <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-500 font-medium">Email</span><span className="font-bold text-slate-900">{selectedBooking.userEmail}</span></div>
                                            <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-500 font-medium">CCCD</span><span className="font-bold text-slate-900">{selectedBooking.primaryGuest?.cccdNumber || 'N/A'}</span></div>
                                            <div className="flex justify-between pt-1"><span className="text-slate-500 font-medium">Khách</span><span className="font-bold text-slate-900">{selectedBooking.numberOfGuests} lớn, {selectedBooking.numberOfChildren} trẻ</span></div>
                                        </div>
                                    </div>

                                    {/* Room Info Card */}
                                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                                            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><Calendar size={14}/></div> Chi tiết phòng
                                        </h4>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-500 font-medium">Phòng</span><span className="font-bold text-slate-900">{selectedBooking.roomName}</span></div>
                                            <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-500 font-medium">Số phòng</span><span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs">#{selectedBooking.roomNumber}</span></div>
                                            <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-500 font-medium">Check-in</span><span className="font-bold text-emerald-600">{new Date(selectedBooking.checkInDate).toLocaleDateString('vi-VN')}</span></div>
                                            <div className="flex justify-between pt-1"><span className="text-slate-500 font-medium">Check-out</span><span className="font-bold text-rose-600">{new Date(selectedBooking.checkOutDate).toLocaleDateString('vi-VN')}</span></div>
                                        </div>
                                    </div>
                                </div>

                                {selectedBooking.specialRequests && (
                                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-sm text-amber-800">
                                        <div className="font-bold mb-1 flex items-center gap-1.5"><MessageSquare size={16}/> Yêu cầu đặc biệt:</div>
                                        <p className="italic pl-5">"{selectedBooking.specialRequests}"</p>
                                    </div>
                                )}
                          </div>
                      )}

                      {modalTab === 'SERVICES' && (
                          <div className="animate-fade-in space-y-6">
                              
                              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                                      <h4 className="font-bold text-slate-700 text-sm uppercase">Dịch vụ đã sử dụng</h4>
                                      <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg">Tổng: ${(selectedBooking.additionalChargesTotal || 0).toLocaleString()}</span>
                                  </div>
                                  <div className="divide-y divide-slate-100">
                                      {selectedBooking.additionalCharges && selectedBooking.additionalCharges.length > 0 ? (
                                          selectedBooking.additionalCharges.map((charge, idx) => (
                                              <div key={idx} className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors">
                                                  <div className="flex items-center gap-3">
                                                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500"><Tag size={16}/></div>
                                                      <div>
                                                          <p className="text-sm font-bold text-slate-900">{charge.serviceType}</p>
                                                          <p className="text-xs text-slate-500">{charge.description || 'Không có mô tả'}</p>
                                                      </div>
                                                  </div>
                                                  <div className="text-right">
                                                      <p className="font-bold text-slate-900 font-mono">${charge.amount.toLocaleString()}</p>
                                                      <p className="text-xs text-slate-500">x{charge.quantity}</p>
                                                  </div>
                                              </div>
                                          ))
                                      ) : (
                                          <div className="p-8 text-center text-slate-400 text-sm">Chưa có dịch vụ nào được thêm.</div>
                                      )}
                                  </div>
                              </div>

                              {/* Add Service Form */}
                              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                  <h5 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Plus size={16} className="text-indigo-600"/> Thêm dịch vụ mới</h5>
                                  <form onSubmit={handleAddService} className="grid grid-cols-12 gap-4">
                                      <div className="col-span-4">
                                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Loại dịch vụ</label>
                                          <select 
                                            className="w-full p-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-100 font-medium bg-slate-50"
                                            value={newService.serviceType}
                                            onChange={e => setNewService({...newService, serviceType: e.target.value})}
                                          >
                                              <option value="MINIBAR">Minibar</option>
                                              <option value="LAUNDRY">Giặt ủi</option>
                                              <option value="SPA">Spa</option>
                                              <option value="DINING">Nhà hàng</option>
                                              <option value="OTHER">Khác</option>
                                          </select>
                                      </div>
                                      <div className="col-span-8 md:col-span-5">
                                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mô tả</label>
                                          <input 
                                            type="text" placeholder="Ví dụ: Nước ngọt, Mì ly..." 
                                            className="w-full p-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-100 font-medium"
                                            value={newService.description}
                                            onChange={e => setNewService({...newService, description: e.target.value})}
                                            required
                                          />
                                      </div>
                                      <div className="col-span-6 md:col-span-3">
                                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Giá tiền</label>
                                          <input 
                                            type="number" placeholder="0" 
                                            className="w-full p-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-100 font-medium"
                                            value={newService.amount || ''}
                                            onChange={e => setNewService({...newService, amount: Number(e.target.value)})}
                                            required
                                          />
                                      </div>
                                      <div className="col-span-6 md:col-span-12 flex justify-end items-end">
                                          <button type="submit" disabled={addingService} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
                                              {addingService ? <Loader2 size={16} className="animate-spin"/> : 'Thêm'}
                                          </button>
                                      </div>
                                  </form>
                              </div>
                          </div>
                      )}

                      {/* --- INVOICE TAB --- */}
                      {modalTab === 'INVOICE' && (
                          <div className="animate-fade-in space-y-4">
                              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                  <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">Giá phòng ({selectedBooking.numberOfNights} đêm)</span>
                                        <span className="font-bold text-slate-900">${((selectedBooking.roomPricePerNight || 0) * (selectedBooking.numberOfNights || 1)).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">Thuế & Phí dịch vụ (15%)</span>
                                        <span className="font-bold text-slate-900">${((selectedBooking.taxAmount || 0) + (selectedBooking.serviceCharge || 0)).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">Phụ phí phát sinh</span>
                                        <span className="font-bold text-slate-900">${(selectedBooking.additionalChargesTotal || 0).toLocaleString()}</span>
                                    </div>
                                    {selectedBooking.discount > 0 && (
                                        <div className="flex justify-between items-center text-sm bg-emerald-50 p-2 rounded-lg text-emerald-700">
                                            <span className="font-bold">Giảm giá khuyến mãi</span>
                                            <span className="font-bold">-${selectedBooking.discount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    
                                    <div className="border-t border-slate-100 pt-4 mt-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-lg font-bold text-slate-900">Tổng thanh toán</span>
                                            <span className="text-3xl font-serif font-bold text-indigo-600">${selectedBooking.totalAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-end mt-2">
                                            {getPaymentBadge(selectedBooking.paymentStatus)}
                                        </div>
                                    </div>
                                  </div>
                              </div>
            
                              {/* <div className="flex justify-end gap-3">
                                  {/* <button className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
                                      <Info size={16}/> Gửi hóa đơn qua Email
                                  </button> */}
                                  {/* <button className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg">
                                      <Download size={16}/> Xuất PDF
                                  </button> */}
        
                          </div>
                      )}
                  </div>

                  {/* Footer Actions */}
                  <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 z-10 relative">
                      {selectedBooking.status === BookingStatus.PENDING && (
                          <>
                              <button onClick={() => handleAction(selectedBooking.id, 'cancel')} className="px-5 py-2.5 border border-rose-100 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-colors">Từ chối</button>
                              <button onClick={() => handleAction(selectedBooking.id, 'confirm')} className="px-6 py-2.5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200">Duyệt Booking</button>
                          </>
                      )}
                      {selectedBooking.status === BookingStatus.CONFIRMED && (
                          <button onClick={() => handleAction(selectedBooking.id, 'check-in')} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2">
                              <LogIn size={18}/> Check-in Khách
                          </button>
                      )}
                      {selectedBooking.status === BookingStatus.CHECKED_IN && (
                          <button onClick={() => handleAction(selectedBooking.id, 'check-out')} className="px-6 py-2.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200 flex items-center gap-2">
                              <LogOut size={18}/> Check-out & Thanh toán
                          </button>
                      )}
                      <button onClick={() => setSelectedBooking(null)} className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">Đóng</button>
                  </div>
              </div>
          </div>
      )}

        {showCheckInModal && checkInBookingId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCheckInModal(false)}></div>
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative z-10 animate-scale-in">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <LogIn size={24} className="text-blue-600"/>
                        Xác nhận Check-in
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Booking: <span className="font-mono font-bold text-indigo-600">
                            {bookings.find(b => b.id === checkInBookingId)?.bookingNumber}
                        </span>
                    </p>
                </div>
                
                <div className="p-6 space-y-4">
                    {/* Guest Info Display */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Thông tin khách</p>
                        <div className="space-y-1 text-sm">
                            <p><span className="text-slate-500">Họ tên:</span> <span className="font-bold">
                                {bookings.find(b => b.id === checkInBookingId)?.userFullName}
                            </span></p>
                            <p><span className="text-slate-500">CCCD:</span> <span className="font-bold font-mono">
                                {bookings.find(b => b.id === checkInBookingId)?.primaryGuest?.cccdNumber || 'N/A'}
                            </span></p>
                            <p><span className="text-slate-500">SĐT:</span> <span className="font-bold">
                                {bookings.find(b => b.id === checkInBookingId)?.userPhoneNumber}
                            </span></p>
                        </div>
                    </div>

                    {/* Deposit Payment Method */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Phương thức thanh toán đặt cọc
                        </label>
                        <select 
                            value={checkInData.depositPaymentMethod}
                            onChange={(e) => setCheckInData({...checkInData, depositPaymentMethod: e.target.value as any})}
                            className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 text-sm font-medium"
                        >
                            <option value="CASH">Tiền mặt</option>
                            <option value="CREDIT_CARD">Thẻ tín dụng</option>
                            <option value="DEBIT_CARD">Thẻ ghi nợ</option>
                            <option value="BANK_TRANSFER">Chuyển khoản</option>
                            <option value="E_WALLET">Ví điện tử</option>
                        </select>
                    </div>

                    {/* Transaction ID (optional) */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Mã giao dịch (tùy chọn)
                        </label>
                        <input 
                            type="text"
                            placeholder="VD: TXN123456..."
                            value={checkInData.depositTransactionId}
                            onChange={(e) => setCheckInData({...checkInData, depositTransactionId: e.target.value})}
                            className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                        />
                    </div>

                    {/* Special Notes */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Ghi chú đặc biệt (tùy chọn)
                        </label>
                        <textarea 
                            placeholder="VD: Khách đến sớm, yêu cầu phòng tầng cao..."
                            value={checkInData.specialNotes}
                            onChange={(e) => setCheckInData({...checkInData, specialNotes: e.target.value})}
                            rows={3}
                            className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 text-sm resize-none"
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                    <button 
                        onClick={() => {
                            setShowCheckInModal(false);
                            setCheckInBookingId(null);
                            setCheckInData({ depositPaymentMethod: 'CASH', depositTransactionId: '', specialNotes: '' });
                        }}
                        className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                        disabled={!!actionLoading}
                    >
                        Hủy
                    </button>
                    <button 
                        onClick={handleCheckIn}
                        disabled={!!actionLoading}
                        className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2 disabled:opacity-50"
                    >
                        {actionLoading ? (
                            <>
                                <Loader2 size={18} className="animate-spin"/>
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <LogIn size={18}/>
                                Xác nhận Check-in
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )}
    </div>
  );
};