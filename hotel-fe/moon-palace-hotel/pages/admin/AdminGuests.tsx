import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Mail, Phone, ChevronLeft, ChevronRight, 
  Filter, Plus, Shield, ShieldAlert, CheckCircle, 
  Edit3, Lock, Unlock, Loader2, X, User as UserIcon, Trash2,
  Ban, Calendar, CreditCard, Clock, History, DollarSign, MapPin
} from 'lucide-react';
import { adminUserApi, bookingApi } from '../../services/api';
import { User, Role, UserFilterParams, Booking } from '../../types';

export const AdminGuests: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const [filters, setFilters] = useState<UserFilterParams>({
    page: 0,
    size: 10,
    sortBy: 'createdDate',
    sortOrder: 'desc',
    keyword: '',
    role: '',
    isActive: undefined,
    isLocked: undefined
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<Partial<User>>({});
  const [password, setPassword] = useState(''); 
  const [isSaving, setIsSaving] = useState(false);

  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [historyBookings, setHistoryBookings] = useState<Booking[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [focusedUser, setFocusedUser] = useState<User | null>(null);

  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminUserApi.getUsers(filters);
      if (response.data.status === 'success') {
        setUsers(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
        setTotalElements(response.data.data.totalElements);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, keyword: e.target.value, page: 0 }));
  };

  const handleFilterChange = (key: keyof UserFilterParams, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 0 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };


  const handleToggleLock = async (user: User, e: React.MouseEvent) => {
    e.stopPropagation();
    const previousUsers = [...users];
    const newIsLocked = !user.isLocked;
    
    setUsers(currentUsers => 
      currentUsers.map(u => u.id === user.id ? { ...u, isLocked: newIsLocked } : u)
    );

    try {
      if (user.isLocked) {
        await adminUserApi.unlock(user.id);
        showNotification('Đã mở khóa tài khoản', 'success');
      } else {
        await adminUserApi.lock(user.id);
        showNotification('Đã khóa tài khoản', 'success');
      }
    } catch (error) {
      setUsers(previousUsers);
      showNotification('Thao tác thất bại', 'error');
    }
  };

  const handleToggleActive = async (user: User, e: React.MouseEvent) => {
    e.stopPropagation();
    if (user.isLocked) {
        showNotification('Vui lòng mở khóa tài khoản trước khi kích hoạt', 'error');
        return;
    }

    const previousUsers = [...users];
    const newIsActive = !user.isActive;

    setUsers(currentUsers => 
      currentUsers.map(u => u.id === user.id ? { ...u, isActive: newIsActive } : u)
    );

    try {
      if (user.isActive) {
        await adminUserApi.deactivate(user.id);
        showNotification('Đã vô hiệu hóa', 'success');
      } else {
        await adminUserApi.activate(user.id);
        showNotification('Đã kích hoạt', 'success');
      }
    } catch (error) {
      setUsers(previousUsers);
      showNotification('Thao tác thất bại', 'error');
    }
  };

  const handleDeleteUser = async (user: User, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!window.confirm(`CẢNH BÁO: Bạn có chắc chắn muốn xóa người dùng "${user.fullName}"? Hành động này không thể hoàn tác.`)) {
          return;
      }

      try {
          await adminUserApi.deactivate(user.id);
          setUsers(users.filter(u => u.id !== user.id));
          setTotalElements(prev => prev - 1);
          showNotification('Đã xóa người dùng', 'success');
      } catch (error) {
          showNotification('Không thể xóa người dùng này (có thể do ràng buộc dữ liệu)', 'error');
      }
  };

  const handleViewHistory = async (user: User) => {
      setFocusedUser(user);
      setShowHistoryDrawer(true);
      setHistoryLoading(true);
      setHistoryBookings([]); 

      try {
          const response = await bookingApi.search({ 
              userId: user.id,
              page: 0, 
              size: 50,
              sortOrder: 'desc',
              sortBy: 'createdDate' 
          });
          if (response.data.status === 'success') {
              setHistoryBookings(response.data.data.content);
          }
      } catch (error) {
          console.error("Failed to fetch history", error);
          showNotification('Không thể tải lịch sử đặt phòng', 'error');
      } finally {
          setHistoryLoading(false);
      }
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedUser({ role: Role.USER, isActive: true, isLocked: false });
    setPassword('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalMode('edit');
    setSelectedUser({ ...user });
    setPassword('');
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (modalMode === 'create') {
        await adminUserApi.addUser({ ...selectedUser, password });
        showNotification('Thêm người dùng thành công', 'success');
      } else {
        const updatePayload = {
            fullName: selectedUser.fullName,
            phoneNumber: selectedUser.phoneNumber,
            email: selectedUser.email,
            cccdNumber: selectedUser.cccdNumber,
            address: selectedUser.address,
            username: selectedUser.username,
            role: selectedUser.role
        };
        await adminUserApi.updateById(selectedUser.id!, updatePayload);
        showNotification('Cập nhật thành công', 'success');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Có lỗi xảy ra';
      showNotification(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
        case 'ADMIN': return 'bg-purple-100 text-purple-700 border-purple-200';
        case 'STAFF': return 'bg-blue-100 text-blue-700 border-blue-200';
        default: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
  };

  const getRoleLabel = (role: string) => {
    switch(role) {
        case 'ADMIN': return 'Quản trị viên';
        case 'STAFF': return 'Nhân viên';
        default: return 'Khách hàng';
    }
  }

  const getBookingStatusStyles = (status: string) => {
    switch(status) {
        case 'CONFIRMED': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', dot: 'bg-blue-500' };
        case 'COMPLETED': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', dot: 'bg-emerald-500' };
        case 'CANCELLED': return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', dot: 'bg-rose-500' };
        case 'PENDING': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', dot: 'bg-amber-500' };
        case 'CHECKED_IN': return { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', dot: 'bg-indigo-500' };
        default: return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100', dot: 'bg-slate-400' };
    }
  };

  const calculateUserStats = (bookings: Booking[]) => {
      const total = bookings.length;
      const spent = bookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
      const completed = bookings.filter(b => b.status === 'COMPLETED').length;
      return { total, spent, completed };
  }

  const userStats = calculateUserStats(historyBookings);

  return (
    <div className="animate-fade-in pb-10 relative font-sans text-slate-800 bg-slate-50 min-h-screen p-6">
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
        <div className="max-w-7xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Quản lý người dùng</h1>
                    <p className="text-slate-500 font-medium">Hệ thống quản lý tài khoản, phân quyền và bảo mật.</p>
                </div>
                <button 
                    onClick={handleOpenCreate}
                    className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 transform active:scale-95 duration-200"
                >
                    <Plus size={18}/> 
                    <span>Thêm mới</span>
                </button>
            </header>

            {/* Filter Bar */}
            <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-2">
                 {/* Search */}
                 <div className="flex-1 relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none">
                        <Search size={18}/>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm thành viên..."
                        value={filters.keyword}
                        onChange={handleSearchChange}
                        className="w-full pl-11 pr-4 py-3 bg-transparent border-none rounded-xl focus:ring-0 text-slate-700 font-medium placeholder:text-slate-400"
                    />
                </div>
                
                <div className="h-px md:h-auto w-full md:w-px bg-slate-100 mx-2"></div>
                
                {/* Filters */}
                <div className="flex gap-2 p-1">
                    <div className="relative min-w-[160px]">
                        <select 
                            className="w-full appearance-none pl-4 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-600 text-sm font-bold cursor-pointer transition-all"
                            value={filters.role || ''}
                            onChange={(e) => handleFilterChange('role', e.target.value)}
                        >
                            <option value="">Tất cả vai trò</option>
                            <option value="ADMIN">Quản trị viên</option>
                            <option value="STAFF">Nhân viên</option>
                            <option value="USER">Khách hàng</option>
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14}/>
                    </div>

                    <div className="relative min-w-[160px]">
                        <select 
                            className="w-full appearance-none pl-4 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-600 text-sm font-bold cursor-pointer transition-all"
                            value={filters.isLocked === undefined ? '' : filters.isLocked.toString()}
                            onChange={(e) => handleFilterChange('isLocked', e.target.value === '' ? undefined : e.target.value === 'true')}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="false">Đang hoạt động</option>
                            <option value="true">Đã khóa</option>
                        </select>
                        <Shield className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14}/>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] flex flex-col">
                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <Loader2 size={40} className="animate-spin mb-4 text-indigo-500"/>
                        <p className="font-medium text-slate-500">Đang đồng bộ dữ liệu...</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-[40%] pl-8">Thành viên</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Vai trò</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider pr-8">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {users.length > 0 ? (
                                    users.map(user => (
                                        <tr 
                                            key={user.id} 
                                            onClick={() => handleViewHistory(user)}
                                            className={`transition-all duration-200 cursor-pointer group/row ${
                                                user.isLocked 
                                                    ? 'bg-slate-50' 
                                                    : 'hover:bg-indigo-50/30'
                                            }`}
                                        >
                                            <td className="px-6 py-4 pl-8">
                                                <div className={`flex items-center gap-4 transition-all duration-300 ${user.isLocked ? 'opacity-80' : 'opacity-100'}`}>
                                                    <div className="relative">
                                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 uppercase font-bold text-lg overflow-hidden shadow-sm transition-all
                                                            ${user.isLocked 
                                                                ? 'bg-slate-100 text-slate-400 border-slate-200' 
                                                                : 'bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 border-indigo-100'
                                                            }`}>
                                                            {user.avatarUrl ? (
                                                                <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                                                            ) : (
                                                                user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'
                                                            )}
                                                        </div>
                                                        {user.isLocked && (
                                                            <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
                                                                <Lock size={16} className="text-rose-600 drop-shadow-sm"/>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className={`font-bold text-[15px] flex items-center gap-2 ${user.isLocked ? 'text-slate-500' : 'text-slate-900'}`}>
                                                            {user.fullName} 
                                                        </div>
                                                        <div className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                                                            <span className="text-indigo-400">@</span>{user.username}
                                                        </div>
                                                        <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-1 font-medium">
                                                            <span className="flex items-center gap-1 hover:text-indigo-600 transition-colors cursor-default"><Mail size={10} className="text-slate-300 group-hover:text-indigo-400"/> {user.email}</span>
                                                            <span className="w-0.5 h-3 bg-slate-200"></span>
                                                            <span className="flex items-center gap-1 hover:text-indigo-600 transition-colors cursor-default"><Phone size={10} className="text-slate-300 group-hover:text-indigo-400"/> {user.phoneNumber}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap align-middle">
                                                <span className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${user.isLocked ? 'bg-slate-100 text-slate-400 border-slate-200' : getRoleBadge(user.role)}`}>
                                                    {getRoleLabel(user.role)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center align-middle">
                                                <div className="flex flex-col items-center gap-2" onClick={e => e.stopPropagation()}>
                                                     {user.isLocked ? (
                                                         <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-full text-xs font-bold border border-rose-100 shadow-sm animate-pulse-fast">
                                                             <Lock size={12}/>
                                                             <span>ĐÃ KHÓA</span>
                                                         </div>
                                                     ) : (
                                                         <button 
                                                            onClick={(e) => handleToggleActive(user, e)}
                                                            className={`w-10 h-5 rounded-full relative transition-all duration-300 focus:outline-none ring-offset-2 focus:ring-2 focus:ring-indigo-100 ${user.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                                            title={user.isActive ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
                                                         >
                                                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${user.isActive ? 'translate-x-5.5 left-0' : 'translate-x-0.5 left-0'}`} />
                                                         </button>
                                                     )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right align-middle pr-8">
                                                <div className="flex items-center justify-end gap-2 opacity-70 group-hover/row:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={(e) => handleOpenEdit(user, e)}
                                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="Chỉnh sửa thông tin"
                                                    >
                                                        <Edit3 size={16}/>
                                                    </button>
                                                    <button 
                                                        onClick={(e) => handleToggleLock(user, e)}
                                                        className={`p-2 rounded-lg transition-colors ${
                                                            user.isLocked 
                                                                ? 'text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600' 
                                                                : 'text-amber-400 hover:bg-amber-50 hover:text-amber-600'
                                                        }`}
                                                        title={user.isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                                                    >
                                                        {user.isLocked ? <Unlock size={16}/> : <Lock size={16}/>}
                                                    </button>
                                                    <button 
                                                        onClick={(e) => handleDeleteUser(user, e)}
                                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                        title="Xóa người dùng"
                                                    >
                                                        <Trash2 size={16}/>
                                                    </button>
                                                    
                                                    <div className="w-px h-4 bg-slate-200 mx-1"></div>
                                                    
                                                    <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
                                                        <History size={14}/> Lịch sử
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                                    <UserIcon size={32}/>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-700">Không tìm thấy kết quả</p>
                                                    <p className="text-sm text-slate-400 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!isLoading && totalElements > 0 && (
                    <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between">
                        <span className="text-sm text-slate-500 font-medium">
                            Hiển thị <strong>{filters.page! * filters.size! + 1}-{Math.min((filters.page! + 1) * filters.size!, totalElements)}</strong> / <strong>{totalElements}</strong> kết quả
                        </span>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => handlePageChange(filters.page! - 1)}
                                disabled={filters.page === 0}
                                className="w-8 h-8 flex items-center justify-center border border-slate-200 bg-white rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft size={16}/>
                            </button>
                            
                            <div className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold border border-indigo-100 min-w-[32px] text-center">
                                {filters.page! + 1}
                            </div>
                            <span className="text-slate-400 text-sm font-medium">/ {totalPages}</span>

                            <button 
                                 onClick={() => handlePageChange(filters.page! + 1)}
                                 disabled={filters.page! + 1 >= totalPages}
                                 className="w-8 h-8 flex items-center justify-center border border-slate-200 bg-white rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight size={16}/>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Modal: Create/Edit User */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-scale-up">
                    <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                            {modalMode === 'create' ? (
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Plus size={18}/></div>
                            ) : (
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Edit3 size={18}/></div>
                            )}
                            {modalMode === 'create' ? 'Thêm người dùng mới' : 'Cập nhật thông tin'}
                        </h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-full transition-all">
                            <X size={20}/>
                        </button>
                    </div>
                    
                    <form onSubmit={handleSaveUser} className="p-8 space-y-5">
                        <div className="grid grid-cols-2 gap-5">
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Họ và tên <span className="text-rose-500">*</span></label>
                                <input 
                                    type="text" required
                                    value={selectedUser.fullName || ''}
                                    onChange={e => setSelectedUser({...selectedUser, fullName: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm font-medium text-slate-700 placeholder:text-slate-300 transition-all"
                                    placeholder="Ví dụ: Nguyễn Văn A"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tên đăng nhập <span className="text-rose-500">*</span></label>
                                <input 
                                    type="text" required
                                    value={selectedUser.username || ''}
                                    onChange={e => setSelectedUser({...selectedUser, username: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm font-medium text-slate-700 placeholder:text-slate-300 transition-all"
                                    placeholder="username123"
                                    disabled={modalMode === 'edit'}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email <span className="text-rose-500">*</span></label>
                            <input 
                                type="email" required
                                value={selectedUser.email || ''}
                                onChange={e => setSelectedUser({...selectedUser, email: e.target.value})}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm font-medium text-slate-700 placeholder:text-slate-300 transition-all"
                                placeholder="example@email.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Số điện thoại <span className="text-rose-500">*</span></label>
                            <input 
                                type="tel" required
                                value={selectedUser.phoneNumber || ''}
                                onChange={e => setSelectedUser({...selectedUser, phoneNumber: e.target.value})}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm font-medium text-slate-700 placeholder:text-slate-300 transition-all"
                                placeholder="0912345678"
                            />
                        </div>

                         <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Số CCCD/ CMND <span className="text-rose-500">*</span></label>
                            <input 
                                type="text" required
                                value={selectedUser.cccdNumber || ''}
                                onChange={e => setSelectedUser({...selectedUser, cccdNumber: e.target.value})}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm font-medium text-slate-700 placeholder:text-slate-300 transition-all"
                                placeholder="034 xxx xxx xxx"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Địa chỉ <span className="text-rose-500">*</span></label>
                            <input 
                                type="text" required
                                value={selectedUser.address || ''}
                                onChange={e => setSelectedUser({...selectedUser, address: e.target.value})}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm font-medium text-slate-700 placeholder:text-slate-300 transition-all"
                                placeholder="số 123, đường ABC, quận XYZ, Hà Nội"
                            />
                        </div>

                        {modalMode === 'create' && (
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Mật khẩu <span className="text-rose-500">*</span></label>
                                <input 
                                    type="password" required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm font-medium text-slate-700 placeholder:text-slate-300 transition-all"
                                    placeholder="Tối thiểu 6 ký tự"
                                    minLength={6}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Vai trò <span className="text-rose-500">*</span></label>
                            <div className="relative">
                                <select
                                    value={selectedUser.role}
                                    onChange={e => setSelectedUser({...selectedUser, role: e.target.value as Role})}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm font-medium text-slate-700 cursor-pointer appearance-none"
                                >
                                    <option value={Role.USER}>Khách hàng (USER)</option>
                                    <option value={Role.STAFF}>Nhân viên (STAFF)</option>
                                    <option value={Role.ADMIN}>Quản trị viên (ADMIN)</option>
                                </select>
                                <ChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 -rotate-90 text-slate-400 pointer-events-none" size={16}/>
                            </div>
                        </div>

                        <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100 mt-2">
                            <button 
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                type="submit"
                                disabled={isSaving}
                                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
                            >
                                {isSaving && <Loader2 size={16} className="animate-spin"/>}
                                {modalMode === 'create' ? 'Tạo tài khoản' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Booking History Slide-Over Drawer (Redesigned) */}
        <div 
            className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-500 ${showHistoryDrawer ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        >
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-500"
                onClick={() => setShowHistoryDrawer(false)}
            ></div>

            {/* Drawer Content */}
            <div 
                className={`w-full max-w-lg bg-white h-full shadow-2xl transform transition-transform duration-500 ease-out-expo flex flex-col relative z-10 ${showHistoryDrawer ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header Profile Section */}
                <div className="relative bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    
                    <button 
                        onClick={() => setShowHistoryDrawer(false)} 
                        className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white backdrop-blur-md"
                    >
                        <X size={20}/>
                    </button>

                    <div className="flex items-center gap-5 relative z-10 mt-2">
                        <div className="w-20 h-20 rounded-2xl bg-white p-0.5 shadow-xl shrink-0 overflow-hidden">
                            <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-slate-300 font-bold text-3xl">
                                {focusedUser?.avatarUrl ? (
                                    <img src={focusedUser.avatarUrl} className="w-full h-full object-cover"/>
                                ) : (
                                    focusedUser?.fullName?.charAt(0) || 'U'
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold tracking-tight">{focusedUser?.fullName}</h3>
                            <p className="text-indigo-100 font-medium opacity-90">{focusedUser?.email}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider border border-white/10">
                                    {focusedUser?.role}
                                </span>
                                {focusedUser?.isLocked && (
                                    <span className="px-2.5 py-1 bg-rose-500/80 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-rose-400/50">
                                        <Lock size={10}/> Locked
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 mt-8 relative z-10">
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/5">
                            <span className="block text-2xl font-bold">{userStats.total}</span>
                            <span className="text-[10px] text-indigo-100 font-bold uppercase tracking-wider opacity-80">Bookings</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/5">
                            <span className="block text-2xl font-bold">{userStats.completed}</span>
                            <span className="text-[10px] text-indigo-100 font-bold uppercase tracking-wider opacity-80">Completed</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/5">
                            <span className="block text-2xl font-bold flex items-center justify-center gap-0.5">
                                <span className="text-lg opacity-80">$</span>{userStats.spent.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-indigo-100 font-bold uppercase tracking-wider opacity-80">Total Spent</span>
                        </div>
                    </div>
                </div>

                {/* Timeline Content */}
                <div className="flex-1 overflow-y-auto bg-slate-50 p-6 relative custom-scrollbar">
                    {historyLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
                             <Loader2 size={40} className="animate-spin text-indigo-500"/>
                             <p className="text-sm font-bold text-slate-500">Đang tải lịch sử giao dịch...</p>
                        </div>
                    ) : historyBookings.length > 0 ? (
                        <div className="relative">
                            {/* Vertical Line */}
                            <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-indigo-100 rounded-full"></div>
                            
                            <div className="space-y-8">
                                {historyBookings.map((booking, idx) => {
                                    const styles = getBookingStatusStyles(booking.status);
                                    return (
                                        <div key={booking.id || idx} className="relative pl-12 group animate-fade-in-up" style={{animationDelay: `${idx * 50}ms`}}>
                                            {/* Timeline Dot */}
                                            <div className={`absolute left-[13px] top-6 w-3.5 h-3.5 rounded-full border-[3px] border-white shadow-sm z-10 ring-4 ring-slate-50 transition-all group-hover:scale-110 ${styles.dot}`}></div>
                                            
                                            {/* Date Label */}
                                            <div className="text-[10px] font-bold text-slate-400 mb-1.5 ml-1 uppercase tracking-wider flex items-center gap-1">
                                                <Clock size={10}/>
                                                {new Date(booking.createdDate).toLocaleDateString()}
                                            </div>

                                            {/* Card */}
                                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                                                <div className="p-5">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h4 className="font-bold text-slate-900 text-lg leading-tight mb-1">{booking.roomName || 'Phòng nghỉ'}</h4>
                                                            <div className="flex items-center gap-2">
                                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-mono font-bold">#{booking.bookingNumber}</span>
                                                            </div>
                                                        </div>
                                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${styles.bg} ${styles.text} ${styles.border}`}>
                                                            {booking.status}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-3 text-sm text-slate-600 mb-4 bg-slate-50/80 p-3 rounded-xl">
                                                        <Calendar size={16} className="text-indigo-400"/>
                                                        <div className="flex items-center gap-2 font-medium">
                                                            <span>{booking.checkInDate}</span>
                                                            <ChevronRight size={14} className="text-slate-300"/>
                                                            <span>{booking.checkOutDate}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                                        <div className="flex items-center gap-1.5 text-xs font-bold">
                                                            <MapPin size={12} className="text-slate-400"/>
                                                            <span className="text-slate-500">Moon Palace</span>
                                                        </div>
                                                        <div className="text-xl font-extrabold text-slate-900 flex items-center">
                                                            <span className="text-sm font-medium text-slate-400 mr-1">$</span>
                                                            {booking.totalAmount?.toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-slate-300">
                             <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <History size={40} className="opacity-50"/>
                             </div>
                             <p className="font-bold text-slate-500 text-lg">Chưa có lịch sử</p>
                             <p className="text-sm text-slate-400 mt-2 max-w-[200px] text-center">Khách hàng này chưa thực hiện bất kỳ giao dịch đặt phòng nào.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};