import React, { useState, useEffect, useRef } from "react";
import * as ReactRouterDOM from "react-router-dom";
const { useNavigate } = ReactRouterDOM;
import {
  User,
  MapPin,
  Calendar,
  CreditCard,
  Clock,
  Gift,
  Settings,
  Lock,
  Save,
  Loader2,
  CheckCircle2,
  X,
  Thermometer,
  Accessibility,
  Armchair,
  BedDouble,
  Star,
  History,
  Sparkles,
  ArrowRight,
  Mail,
  Phone,
  Hash,
  Upload,
  Camera,
  Trash2,
} from "lucide-react";
import { UserDashboardData, UserPreferences } from "../types";
import { useAuth } from "../context/AuthContext";
import { dashboardApi, authApi, userApi } from "../services/api";

// --- Components ---

const PreferenceSelector = ({
  icon: Icon,
  label,
  value,
  options,
  onChange,
}: {
  icon: any;
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}) => (
  <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-indigo-200 hover:shadow-md transition-all duration-300">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">
          {label}
        </p>
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="appearance-none bg-transparent font-bold text-slate-700 outline-none cursor-pointer text-sm w-full pr-4 z-10 relative"
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  </div>
);

const SectionHeader = ({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description?: string;
}) => (
  <div className="mb-6">
    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
        <Icon size={20} />
      </div>
      {title}
    </h3>
    {description && (
      <p className="text-sm text-slate-500 ml-11 mt-1">{description}</p>
    )}
  </div>
);

export const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "overview" | "settings" | "history"
  >("overview");

  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  // Avatar Upload State
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Profile Form State
  const [profile, setProfile] = useState({
    fullName: "",
    phone: "",
    email: "",
    username: "",
    address: "",
    cccdNumber: "",
  });

  // Preferences State
  const [preferences, setPreferences] = useState<UserPreferences>({
    roomTemperature: "24°C",
    pillowType: "Soft",
    floorPreference: "High",
    dietaryRestrictions: "",
    specialRequests: "",
  });

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.fullName || "",
        phone: user.phoneNumber || "",
        email: user.email || "",
        username: user.username || "",
        address: user.address || "",
        cccdNumber: user.cccdNumber || "",
      });
      if (user.preferences) {
        setPreferences((prev) => ({ ...prev, ...user.preferences }));
      }
      // Set avatar preview from user data
      if (user.avatarUrl) {
        setAvatarPreview(user.avatarUrl);
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const dashResponse = await dashboardApi.getUserDashboard();
        if (dashResponse.data.status === "success") {
          setDashboardData(dashResponse.data.data);
        }
      } catch (error) {
        console.error("Failed to load user data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showNotification("Vui lòng chọn file ảnh hợp lệ", "error");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification("Kích thước ảnh không được vượt quá 5MB", "error");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload immediately
    handleUploadAvatar(file);
  };

  const handleUploadAvatar = async (file: File) => {
    setIsUploadingAvatar(true);
    try {
      const response = await userApi.uploadAvatar(file);
      if (response.data.status === "success") {
        showNotification("Cập nhật avatar thành công!", "success");
        // Update user context if needed
        window.location.reload(); // Or update context
      }
    } catch (error: any) {
      console.error("Avatar upload failed:", error);
      showNotification(
        error.response?.data?.message || "Upload avatar thất bại",
        "error",
      );
      // Reset preview on error
      setAvatarPreview(user?.avatarUrl || null);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa avatar?")) return;

    setIsUploadingAvatar(true);
    try {
      await userApi.deleteAvatar();
      showNotification("Đã xóa avatar", "success");
      setAvatarPreview(null);
      window.location.reload();
    } catch (error) {
      showNotification("Không thể xóa avatar", "error");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const updatePayload = {
        fullName: profile.fullName,
        phoneNumber: profile.phone,
        email: profile.email,
        username: profile.username,
        address: profile.address,
        cccdNumber: profile.cccdNumber,
        preferences: preferences,
      };

      await userApi.updateProfile(updatePayload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({
        type: "error",
        text: "Mật khẩu mới phải có ít nhất 6 ký tự.",
      });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "Mật khẩu xác nhận không khớp.",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await authApi.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      if (response.data.status === "success") {
        setPasswordMessage({
          type: "success",
          text: "Đổi mật khẩu thành công!",
        });
        setPasswordForm({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setPasswordMessage({
          type: "error",
          text: response.data.message || "Đổi mật khẩu thất bại.",
        });
      }
    } catch (err: any) {
      setPasswordMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "Mật khẩu cũ không đúng hoặc có lỗi xảy ra.",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) return null;
  const avatarUrl =
    avatarPreview ||
    user.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=0F172A&color=fff&bold=true`;

  return (
    <div className="bg-slate-50 min-h-screen pb-12 font-sans">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-[60] px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-slide-in-right ${
            notification.type === "success"
              ? "bg-white border-emerald-100 text-emerald-700"
              : "bg-white border-rose-100 text-rose-700"
          }`}
        >
          <div
            className={`p-1 rounded-full ${notification.type === "success" ? "bg-emerald-100" : "bg-rose-100"}`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 size={18} />
            ) : (
              <X size={18} />
            )}
          </div>
          <span className="text-sm font-bold">{notification.message}</span>
        </div>
      )}

      {/* --- HERO SECTION --- */}
      <div className="relative bg-[#0B1120] pb-32 pt-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-900/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-8">
            {/* Avatar with Upload Controls */}
            <div className="relative group">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-slate-800 shadow-2xl overflow-hidden relative bg-slate-900">
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 className="animate-spin text-white" size={32} />
                  </div>
                )}
              </div>

              <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-indigo-50 transition-colors disabled:opacity-50"
                  title="Tải ảnh lên"
                >
                  <Camera size={18} className="text-indigo-600" />
                </button>
                {user.avatarUrl && (
                  <button
                    onClick={handleDeleteAvatar}
                    disabled={isUploadingAvatar}
                    className="p-2 bg-white rounded-full shadow-lg hover:bg-rose-50 transition-colors disabled:opacity-50"
                    title="Xóa avatar"
                  >
                    <Trash2 size={18} className="text-rose-600" />
                  </button>
                )}
              </div>

              <div className="absolute bottom-1 right-1 p-2 bg-emerald-500 rounded-full border-4 border-[#0B1120] shadow-sm">
                <CheckCircle2 size={16} className="text-white" />
              </div>
            </div>

            <div className="text-center md:text-left flex-1 pb-2">
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
                {user.fullName}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-400 text-sm">
                <span className="flex items-center gap-2">
                  <Mail size={16} className="text-indigo-400" /> {user.email}
                </span>
                <span className="flex items-center gap-2">
                  <Phone size={16} className="text-emerald-400" />{" "}
                  {user.phoneNumber || "Cập nhật số điện thoại"}
                </span>
              </div>
            </div>

            {dashboardData && (
              <div className="flex gap-4">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4 text-center min-w-[120px]">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Hạng thành viên
                  </p>
                  <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
                    {dashboardData.userStats.membershipTier}
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4 text-center min-w-[120px]">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Điểm tích lũy
                  </p>
                  <p className="text-xl font-bold text-white">
                    {dashboardData.userStats.loyaltyPoints.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex justify-center md:justify-start">
            <div className="inline-flex bg-slate-800/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "overview" ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
              >
                <Sparkles size={16} /> Tổng quan
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "history" ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
              >
                <History size={16} /> Lịch sử
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "settings" ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
              >
                <Settings size={16} /> Cài đặt
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-8 relative z-20">
        {loading ? (
          <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 flex flex-col justify-center items-center min-h-[400px]">
            <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
            <p className="text-slate-400 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {activeTab === "overview" && dashboardData && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                {/* LEFT COLUMN: UPCOMING & RECENT */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Upcoming Booking Card */}
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Calendar className="text-indigo-500" /> Chuyến đi sắp tới
                    </h3>
                    {dashboardData.upcomingBookings &&
                    dashboardData.upcomingBookings.length > 0 ? (
                      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden group hover:shadow-2xl transition-all duration-500">
                        <div className="relative h-48 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent z-10"></div>
                          <img
                            src={
                              dashboardData.upcomingBookings[0].roomImage ||
                              "https://via.placeholder.com/800x400"
                            }
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            alt="Room"
                          />
                          <div className="absolute bottom-4 left-6 z-20">
                            <h4 className="text-white text-2xl font-bold mb-1">
                              {dashboardData.upcomingBookings[0].roomName}
                            </h4>
                            <p className="text-slate-300 text-sm flex items-center gap-2">
                              <MapPin size={14} /> Moon Palace Luxury Resort
                            </p>
                          </div>
                          <div className="absolute top-4 right-4 z-20 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl text-center">
                            <span className="block text-xl font-bold leading-none">
                              {
                                dashboardData.upcomingBookings[0]
                                  .daysUntilCheckIn
                              }
                            </span>
                            <span className="text-[10px] uppercase font-bold text-slate-200">
                              Ngày nữa
                            </span>
                          </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase">
                              Check-in
                            </p>
                            <p className="font-bold text-slate-900 text-lg">
                              {dashboardData.upcomingBookings[0].checkInDate}
                            </p>
                            <p className="text-xs text-slate-500">
                              Sau 14:00 PM
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase">
                              Thời gian lưu trú
                            </p>
                            <p className="font-bold text-slate-900 text-lg">
                              {dashboardData.upcomingBookings[0].nights} Đêm
                            </p>
                            <p className="text-xs text-slate-500">
                              Check-out 12:00 PM
                            </p>
                          </div>
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() => navigate("/my-bookings")}
                              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                            >
                              Xem chi tiết <ArrowRight size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 rounded-3xl p-8 border border-dashed border-slate-300 text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 shadow-sm">
                          <Calendar size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">
                          Chưa có chuyến đi nào
                        </h3>
                        <p className="text-slate-500 mb-6 max-w-md mx-auto">
                          Hãy lên kế hoạch cho kỳ nghỉ dưỡng tiếp theo của bạn
                          tại Moon Palace.
                        </p>
                        <button
                          onClick={() => navigate("/rooms")}
                          className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 transition-all"
                        >
                          Đặt phòng ngay
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Recommendations */}
                  <div>
                    <div className="flex justify-between items-end mb-4">
                      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles
                          className="text-amber-500"
                          fill="currentColor"
                        />{" "}
                        Gợi ý cho bạn
                      </h3>
                      <button
                        onClick={() => navigate("/rooms")}
                        className="text-sm font-bold text-indigo-600 hover:text-indigo-700"
                      >
                        Xem tất cả
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {dashboardData.recommendedRooms &&
                      dashboardData.recommendedRooms.length > 0 ? (
                        dashboardData.recommendedRooms.map((room) => (
                          <div
                            key={room.roomId}
                            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                            onClick={() => navigate(`/room/${room.roomId}`)}
                          >
                            <div className="relative rounded-xl overflow-hidden aspect-[4/3] mb-4">
                              <img
                                src={room.thumbnailImage}
                                alt={room.roomName}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                              <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-bold">
                                ${room.pricePerNight}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-lg truncate mb-1">
                                {room.roomName}
                              </h4>
                              <p className="text-sm text-slate-500 font-medium mb-3">
                                {room.roomType}
                              </p>
                              {room.matchReason && (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold">
                                  <Star size={12} fill="currentColor" />{" "}
                                  {room.matchReason}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-8 text-slate-400">
                          <p>
                            Chưa có gợi ý phù hợp. Hãy trải nghiệm thêm để chúng
                            tôi hiểu bạn hơn.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: STATS & OFFERS */}
                <div className="space-y-6">
                  {/* Membership Mini Card */}
                  <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                    <h3 className="font-bold text-slate-900 text-lg mb-6">
                      Thống kê hoạt động
                    </h3>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <CheckCircle2 size={24} />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-400 uppercase">
                            Hoàn thành
                          </p>
                          <p className="text-xl font-bold text-slate-900">
                            {dashboardData.userStats.completedBookings}{" "}
                            <span className="text-sm text-slate-400 font-medium">
                              chuyến đi
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                          <CreditCard size={24} />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-400 uppercase">
                            Chi tiêu
                          </p>
                          <p className="text-xl font-bold text-slate-900">
                            $
                            {dashboardData.userStats.totalSpent.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                          <X size={24} />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-400 uppercase">
                            Đã hủy
                          </p>
                          <p className="text-xl font-bold text-slate-900">
                            {dashboardData.userStats.cancelledBookings}{" "}
                            <span className="text-sm text-slate-400 font-medium">
                              lần
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rewards Box */}
                  <div className="bg-gradient-to-br from-[#0B1120] to-[#1e293b] rounded-3xl p-6 shadow-xl text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl -mr-16 -mt-16 opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500 rounded-full blur-3xl -ml-16 -mb-16 opacity-20 group-hover:opacity-40 transition-opacity"></div>

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                          <Gift size={24} className="text-amber-400" />
                        </div>
                        <span className="text-xs font-bold bg-amber-400 text-slate-900 px-2 py-1 rounded-lg">
                          GOLD TIER
                        </span>
                      </div>
                      <h3 className="font-bold text-xl mb-2">Ưu đãi của bạn</h3>
                      <p className="text-slate-400 text-sm mb-6">
                        Bạn có 2 voucher chưa sử dụng cho kỳ nghỉ tiếp theo.
                      </p>

                      <button className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors">
                        Xem ví ưu đãi
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- HISTORY TAB --- */}
            {activeTab === "history" && (
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-fade-in min-h-[500px]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    <History size={20} className="text-indigo-500" /> Lịch sử
                    đặt phòng
                  </h3>
                  <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg">
                    Tải xuống báo cáo
                  </button>
                </div>
                <div className="p-6">
                  {dashboardData?.recentBookings &&
                  dashboardData.recentBookings.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.recentBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex flex-col md:flex-row items-center justify-between bg-white border border-slate-100 p-4 rounded-2xl hover:border-indigo-200 hover:shadow-lg transition-all group"
                        >
                          <div className="flex items-center gap-6 w-full md:w-auto">
                            <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 shadow-sm">
                              {booking.room ? (
                                <img
                                  src={booking.room.thumbnailImage}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <BedDouble className="w-full h-full p-6 text-slate-300" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-lg">
                                {booking.roomName}
                              </h4>
                              <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-500">
                                <span className="flex items-center gap-1 font-mono">
                                  <Hash size={12} /> {booking.bookingNumber}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span>
                                  {booking.checkInDate} — {booking.checkOutDate}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between w-full md:w-auto gap-8 mt-4 md:mt-0 border-t md:border-t-0 border-slate-50 pt-4 md:pt-0">
                            <div className="text-right">
                              <p className="font-bold text-slate-900 text-lg">
                                {booking.totalAmount.toLocaleString()}
                                <span className="text-xs ml-1">VND</span>
                              </p>
                              <span
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                                  booking.status === "COMPLETED"
                                    ? "bg-emerald-100 text-emerald-600"
                                    : booking.status === "CANCELLED"
                                      ? "bg-rose-100 text-rose-600"
                                      : "bg-amber-100 text-amber-600"
                                }`}
                              >
                                {booking.status}
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                navigate(`/room/${booking.roomId}`)
                              }
                              className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-900/20"
                            >
                              Đặt lại
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <History size={40} />
                      </div>
                      <h4 className="text-lg font-bold text-slate-900">
                        Chưa có lịch sử
                      </h4>
                      <p className="text-slate-500">
                        Bạn chưa thực hiện giao dịch nào.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* --- SETTINGS TAB --- */}
            {activeTab === "settings" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
                {/* Main Settings Form */}
                <div className="lg:col-span-8 space-y-8">
                  {/* Personal Info */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                    <SectionHeader
                      icon={User}
                      title="Thông tin cá nhân"
                      description="Cập nhật thông tin định danh của bạn."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                          Họ tên
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={profile.fullName}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                fullName: e.target.value,
                              })
                            }
                            className="w-full p-3 pl-10 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                          />
                          <User
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                          Tên đăng nhập
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={profile.username}
                            disabled
                            className="w-full p-3 pl-10 bg-slate-50/50 rounded-xl border border-slate-200 text-sm font-bold text-slate-400 cursor-not-allowed"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                            @
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                          Email
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={profile.email}
                            disabled
                            className="w-full p-3 pl-10 bg-slate-50/50 rounded-xl border border-slate-200 text-sm font-bold text-slate-400 cursor-not-allowed"
                          />
                          <Mail
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                          Số điện thoại
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={profile.phone}
                            onChange={(e) =>
                              setProfile({ ...profile, phone: e.target.value })
                            }
                            className="w-full p-3 pl-10 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                          />
                          <Phone
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                          Địa chỉ
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={profile.address}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                address: e.target.value,
                              })
                            }
                            className="w-full p-3 pl-10 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                          />
                          <MapPin
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stay Preferences */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                    <SectionHeader
                      icon={Armchair}
                      title="Sở thích lưu trú"
                      description="Tùy chỉnh trải nghiệm phòng theo ý muốn của bạn."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <PreferenceSelector
                        icon={Thermometer}
                        label="Nhiệt độ phòng"
                        value={preferences.roomTemperature || "24°C"}
                        options={["18°C", "20°C", "22°C", "24°C", "26°C"]}
                        onChange={(v) =>
                          setPreferences({ ...preferences, roomTemperature: v })
                        }
                      />
                      <PreferenceSelector
                        icon={Moon}
                        label="Loại gối"
                        value={preferences.pillowType || "Soft"}
                        options={["Soft", "Firm", "Feather", "Hypoallergenic"]}
                        onChange={(v) =>
                          setPreferences({
                            ...preferences,
                            pillowType: v as any,
                          })
                        }
                      />
                      <PreferenceSelector
                        icon={Accessibility}
                        label="Tầng ưu tiên"
                        value={preferences.floorPreference || "High"}
                        options={["Low", "High", "Ground"]}
                        onChange={(v) =>
                          setPreferences({
                            ...preferences,
                            floorPreference: v as any,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Save Actions */}
                  <div className="flex items-center justify-end gap-4 pt-4">
                    {saveSuccess && (
                      <span className="text-emerald-600 text-sm font-bold flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg animate-fade-in">
                        <CheckCircle2 size={16} /> Đã lưu thay đổi
                      </span>
                    )}
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-indigo-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Save size={18} />
                      )}{" "}
                      Lưu hồ sơ
                    </button>
                  </div>
                </div>

                {/* Security Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full">
                    <SectionHeader
                      icon={Lock}
                      title="Bảo mật"
                      description="Thay đổi mật khẩu đăng nhập."
                    />

                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">
                          Mật khẩu hiện tại
                        </label>
                        <input
                          type="password"
                          value={passwordForm.oldPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              oldPassword: e.target.value,
                            })
                          }
                          className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-rose-300 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">
                          Mật khẩu mới
                        </label>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              newPassword: e.target.value,
                            })
                          }
                          className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-rose-300 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">
                          Xác nhận mật khẩu
                        </label>
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-rose-300 transition-all"
                        />
                      </div>

                      {passwordMessage && (
                        <div
                          className={`p-3 rounded-lg text-xs font-bold flex items-start gap-2 ${passwordMessage.type === "success" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
                        >
                          {passwordMessage.type === "success" ? (
                            <CheckCircle2
                              size={14}
                              className="mt-0.5 shrink-0"
                            />
                          ) : (
                            <X size={14} className="mt-0.5 shrink-0" />
                          )}
                          {passwordMessage.text}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className="w-full py-3 mt-2 bg-slate-900 text-white hover:bg-slate-800 font-bold rounded-xl transition-colors shadow-lg shadow-slate-900/10"
                      >
                        {isChangingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
