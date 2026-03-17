import React, { useState } from 'react';
import { Save, Lock, Globe, Bell, CreditCard, Building, Loader2, CheckCircle2 } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'rooms' | 'security'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  }

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-lux-900 mb-1">Cài đặt hệ thống</h1>
        <p className="text-lux-500">Quản lý cấu hình toàn bộ khách sạn.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:w-64 flex-shrink-0">
               <nav className="flex flex-col gap-2">
                   <button 
                    onClick={() => setActiveTab('general')}
                    className={`text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'general' ? 'bg-lux-900 text-white shadow-md' : 'text-lux-600 hover:bg-white hover:text-lux-900'}`}
                   >
                       <Globe size={18}/> Thông tin chung
                   </button>
                   <button 
                    onClick={() => setActiveTab('rooms')}
                    className={`text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'rooms' ? 'bg-lux-900 text-white shadow-md' : 'text-lux-600 hover:bg-white hover:text-lux-900'}`}
                   >
                       <Building size={18}/> Quản lý phòng
                   </button>
                   <button 
                    onClick={() => setActiveTab('security')}
                    className={`text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'security' ? 'bg-lux-900 text-white shadow-md' : 'text-lux-600 hover:bg-white hover:text-lux-900'}`}
                   >
                       <Lock size={18}/> Bảo mật & Admin
                   </button>
               </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white p-8 rounded-3xl border border-lux-200 shadow-sm">
               {activeTab === 'general' && (
                   <div className="space-y-6 animate-fade-in">
                       <h2 className="text-xl font-bold text-lux-900 mb-6 pb-4 border-b border-lux-50">Thông tin khách sạn</h2>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                               <label className="block text-sm font-bold text-lux-700 mb-2">Tên khách sạn</label>
                               <input type="text" defaultValue="Moon Palace Hotel" className="w-full p-3 bg-lux-50 border border-lux-200 rounded-xl outline-none focus:border-lux-500" />
                           </div>
                           <div>
                               <label className="block text-sm font-bold text-lux-700 mb-2">Email liên hệ</label>
                               <input type="email" defaultValue="contact@moonpalace.com" className="w-full p-3 bg-lux-50 border border-lux-200 rounded-xl outline-none focus:border-lux-500" />
                           </div>
                           <div className="md:col-span-2">
                               <label className="block text-sm font-bold text-lux-700 mb-2">Địa chỉ</label>
                               <input type="text" defaultValue="123 Đường Ánh Trăng, Quận 1, TP. Hồ Chí Minh" className="w-full p-3 bg-lux-50 border border-lux-200 rounded-xl outline-none focus:border-lux-500" />
                           </div>
                           <div>
                               <label className="block text-sm font-bold text-lux-700 mb-2">Số điện thoại</label>
                               <input type="text" defaultValue="+84 909 123 456" className="w-full p-3 bg-lux-50 border border-lux-200 rounded-xl outline-none focus:border-lux-500" />
                           </div>
                           <div>
                               <label className="block text-sm font-bold text-lux-700 mb-2">Tiền tệ</label>
                               <select className="w-full p-3 bg-lux-50 border border-lux-200 rounded-xl outline-none focus:border-lux-500 font-bold">
                                   <option value="USD">USD ($)</option>
                                   <option value="VND">VND (₫)</option>
                               </select>
                           </div>
                       </div>
                       
                       <div className="pt-6">
                           <h3 className="font-bold text-lux-900 mb-4 flex items-center gap-2"><Bell size={18}/> Cấu hình thông báo</h3>
                           <div className="space-y-3">
                               <label className="flex items-center gap-3 cursor-pointer">
                                   <input type="checkbox" defaultChecked className="w-5 h-5 accent-lux-900"/>
                                   <span className="text-sm text-lux-700">Gửi email xác nhận khi có booking mới</span>
                               </label>
                               <label className="flex items-center gap-3 cursor-pointer">
                                   <input type="checkbox" className="w-5 h-5 accent-lux-900"/>
                                   <span className="text-sm text-lux-700">Thông báo khi phòng sắp hết</span>
                               </label>
                           </div>
                       </div>
                   </div>
               )}

               {activeTab === 'rooms' && (
                   <div className="space-y-6 animate-fade-in">
                       <h2 className="text-xl font-bold text-lux-900 mb-6 pb-4 border-b border-lux-50">Cấu hình giá & Phòng</h2>
                       <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl text-yellow-800 text-sm mb-6">
                           Lưu ý: Thay đổi giá tại đây sẽ áp dụng cho tất cả các booking mới kể từ thời điểm lưu.
                       </div>

                       <div className="space-y-4">
                           {['Suite', 'Deluxe', 'Standard', 'Penthouse'].map(type => (
                               <div key={type} className="flex items-center justify-between p-4 border border-lux-100 rounded-xl hover:bg-lux-50 transition-colors">
                                   <div>
                                       <p className="font-bold text-lux-900">{type}</p>
                                       <p className="text-xs text-lux-400">Giá cơ bản / đêm</p>
                                   </div>
                                   <div className="flex items-center gap-2">
                                       <span className="font-bold text-lux-500">$</span>
                                       <input type="number" defaultValue={type === 'Penthouse' ? 1200 : type === 'Suite' ? 350 : 200} className="w-24 p-2 border border-lux-200 rounded-lg text-right font-bold text-lux-900 outline-none focus:border-lux-500" />
                                   </div>
                               </div>
                           ))}
                       </div>
                       
                       <div className="pt-6">
                           <h3 className="font-bold text-lux-900 mb-4">Phụ phí</h3>
                           <div className="grid grid-cols-2 gap-4">
                               <div>
                                   <label className="block text-sm font-bold text-lux-700 mb-2">Thuế VAT (%)</label>
                                   <input type="number" defaultValue="10" className="w-full p-3 bg-lux-50 border border-lux-200 rounded-xl outline-none focus:border-lux-500" />
                               </div>
                               <div>
                                   <label className="block text-sm font-bold text-lux-700 mb-2">Phí dịch vụ (%)</label>
                                   <input type="number" defaultValue="5" className="w-full p-3 bg-lux-50 border border-lux-200 rounded-xl outline-none focus:border-lux-500" />
                               </div>
                           </div>
                       </div>
                   </div>
               )}

               {activeTab === 'security' && (
                   <div className="space-y-6 animate-fade-in">
                       <h2 className="text-xl font-bold text-lux-900 mb-6 pb-4 border-b border-lux-50">Bảo mật tài khoản</h2>
                       
                       <div>
                           <label className="block text-sm font-bold text-lux-700 mb-2">Đổi mật khẩu Admin</label>
                           <div className="space-y-3">
                               <input type="password" placeholder="Mật khẩu hiện tại" className="w-full p-3 bg-lux-50 border border-lux-200 rounded-xl outline-none focus:border-lux-500" />
                               <input type="password" placeholder="Mật khẩu mới" className="w-full p-3 bg-lux-50 border border-lux-200 rounded-xl outline-none focus:border-lux-500" />
                               <input type="password" placeholder="Xác nhận mật khẩu mới" className="w-full p-3 bg-lux-50 border border-lux-200 rounded-xl outline-none focus:border-lux-500" />
                           </div>
                       </div>

                       <div className="pt-6 border-t border-lux-50">
                           <h3 className="font-bold text-lux-900 mb-4 flex items-center gap-2"><CreditCard size={18}/> Cổng thanh toán</h3>
                           <div className="flex items-center justify-between p-4 border border-lux-100 rounded-xl">
                               <div className="flex items-center gap-3">
                                   <div className="w-10 h-6 bg-blue-600 rounded text-white text-[8px] flex items-center justify-center font-bold">STRIPE</div>
                                   <span className="font-bold text-lux-900">Stripe Payments</span>
                               </div>
                               <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" defaultChecked className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lux-500"></div>
                                </label>
                           </div>
                           <div className="flex items-center justify-between p-4 border border-lux-100 rounded-xl mt-3">
                               <div className="flex items-center gap-3">
                                   <div className="w-10 h-6 bg-yellow-400 rounded text-blue-800 text-[8px] flex items-center justify-center font-bold">PAYPAL</div>
                                   <span className="font-bold text-lux-900">PayPal</span>
                               </div>
                               <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lux-500"></div>
                                </label>
                           </div>
                       </div>
                   </div>
               )}

               <div className="pt-8 border-t border-lux-50 mt-8 flex justify-end gap-3">
                   <button className="px-6 py-3 text-lux-600 font-bold hover:bg-lux-50 rounded-xl transition-colors">Hủy bỏ</button>
                   <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-8 py-3 bg-lux-900 text-white font-bold rounded-xl hover:bg-lux-800 transition-colors shadow-lg shadow-lux-900/10 flex items-center gap-2 min-w-[160px] justify-center"
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>}
                        {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                   </button>
               </div>
               
               {saveSuccess && (
                   <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-xl flex items-center gap-2 justify-center font-bold animate-fade-in">
                       <CheckCircle2 size={18}/> Cập nhật cài đặt thành công!
                   </div>
               )}
          </div>
      </div>
    </div>
  );
};