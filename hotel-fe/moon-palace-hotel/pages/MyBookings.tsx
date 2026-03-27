import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { bookingApi, roomApi } from "../services/api";
import { Booking, BookingStatus, PaymentStatus } from "../types";
import {
  Calendar,
  MapPin,
  Clock,
  ChevronRight,
  Download,
  MessageSquare,
  AlertCircle,
  CalendarX,
  Loader2,
  X,
  CheckCircle,
  Shield,
  CreditCard,
  BedDouble,
  Users,
  FileText,
  Phone,
} from "lucide-react";

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop";

export const MyBookings: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "upcoming" | "history" | "cancelled"
  >("upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [roomImages, setRoomImages] = useState<Record<string, string>>({});

  // Modal & Notification
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingApi.getMyBookings(0, 100);
      if (response.data.status === "success") {
        const fetchedBookings = response.data.data.content;
        setBookings(fetchedBookings);

        const uniqueRoomIds = [
          ...new Set(
            fetchedBookings.map((b: Booking) => b.roomId).filter(Boolean),
          ),
        ];
        const imageResults = await Promise.allSettled(
          uniqueRoomIds.map((id: string) => roomApi.getById(id)),
        );

        const imageMap: Record<string, string> = {};
        imageResults.forEach((result, index) => {
          if (
            result.status === "fulfilled" &&
            result.value.data.status === "success"
          ) {
            const room = result.value.data.data;
            imageMap[uniqueRoomIds[index]] =
              room.thumbnailImage || room.images?.[0] || PLACEHOLDER_IMG;
          } else {
            imageMap[uniqueRoomIds[index]] = PLACEHOLDER_IMG;
          }
        });
        setRoomImages(imageMap);
      }
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCancelBooking = async (id: string) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn hủy đặt phòng này không? Hành động này không thể hoàn tác.",
      )
    )
      return;

    setActionLoading(id);
    try {
      const response = await bookingApi.cancel(
        id,
        "Khách hàng yêu cầu hủy qua website",
      );
      if (response.data.status === "success") {
        showNotification("Hủy phòng thành công.", "success");
        if (selectedBooking && selectedBooking.id === id) {
          setSelectedBooking(null);
        }
        fetchBookings();
      }
    } catch (error) {
      console.error("Failed to cancel", error);
      showNotification(
        "Không thể hủy phòng. Vui lòng liên hệ bộ phận hỗ trợ.",
        "error",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === "upcoming") {
      return (
        booking.status === BookingStatus.CONFIRMED ||
        booking.status === BookingStatus.PENDING
      );
    }
    if (activeTab === "history") {
      return (
        booking.status === BookingStatus.COMPLETED ||
        booking.status === BookingStatus.CHECKED_OUT ||
        booking.status === BookingStatus.CHECKED_IN
      );
    }
    if (activeTab === "cancelled") {
      return (
        booking.status === BookingStatus.CANCELLED ||
        booking.status === BookingStatus.NO_SHOW ||
        booking.status === BookingStatus.FAILED
      );
    }
    return false;
  });

  const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return {
          text: "Chờ xác nhận",
          class: "bg-amber-100 text-amber-700 border-amber-200",
        };
      case BookingStatus.CONFIRMED:
        return {
          text: "Đã xác nhận",
          class: "bg-blue-100 text-blue-700 border-blue-200",
        };
      case BookingStatus.CHECKED_IN:
        return {
          text: "Đang lưu trú",
          class: "bg-indigo-100 text-indigo-700 border-indigo-200",
        };
      case BookingStatus.COMPLETED:
      case BookingStatus.CHECKED_OUT:
        return {
          text: "Hoàn thành",
          class: "bg-emerald-100 text-emerald-700 border-emerald-200",
        };
      case BookingStatus.CANCELLED:
        return {
          text: "Đã hủy",
          class: "bg-rose-100 text-rose-700 border-rose-200",
        };
      default:
        return {
          text: status,
          class: "bg-slate-100 text-slate-700 border-slate-200",
        };
    }
  };

  const getPaymentStatus = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return {
          text: "Đã thanh toán",
          class: "text-emerald-600 bg-emerald-50",
        };
      case PaymentStatus.PARTIALLY_PAID:
        return { text: "Đã cọc", class: "text-amber-600 bg-amber-50" };
      case PaymentStatus.REFUNDED:
        return { text: "Đã hoàn tiền", class: "text-purple-600 bg-purple-50" };
      default:
        return { text: "Chưa thanh toán", class: "text-rose-600 bg-rose-50" };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 font-sans animate-fade-in">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-24 right-6 z-[60] px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-slide-in-right ${
            notification.type === "success"
              ? "bg-white border-emerald-100 text-emerald-700"
              : "bg-white border-rose-100 text-rose-700"
          }`}
        >
          <div
            className={`p-1 rounded-full ${notification.type === "success" ? "bg-emerald-100" : "bg-rose-100"}`}
          >
            {notification.type === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <Shield size={18} />
            )}
          </div>
          <span className="text-sm font-bold">{notification.message}</span>
        </div>
      )}

      {/* Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedBooking(null)}
          ></div>
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 backdrop-blur-md">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Booking #{selectedBooking.bookingNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  {new Date(selectedBooking.createdDate).toLocaleString(
                    "vi-VN",
                  )}
                </p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {/* Status Banner */}
              <div className="flex flex-wrap gap-4 justify-between items-center mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase border ${getStatusLabel(selectedBooking.status).class}`}
                  >
                    {getStatusLabel(selectedBooking.status).text}
                  </div>
                  <div
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${getPaymentStatus(selectedBooking.paymentStatus).class}`}
                  >
                    {getPaymentStatus(selectedBooking.paymentStatus).text}
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-xs text-slate-400 font-bold uppercase mb-0.5">
                    Tổng cộng
                  </span>
                  <span className="text-2xl font-bold text-slate-900">
                    {selectedBooking.totalAmount.toLocaleString()} ₫
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <BedDouble size={18} className="text-indigo-500" /> Thông
                    tin phòng
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold">
                        Loại phòng
                      </p>
                      <p className="font-bold text-slate-900 text-lg">
                        {selectedBooking.roomName}
                      </p>
                      <p className="text-sm text-slate-500">
                        Phòng số: {selectedBooking.roomNumber}
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">
                          Check-in
                        </p>
                        <p className="font-bold text-slate-700">
                          {selectedBooking.checkInDate}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">
                          Check-out
                        </p>
                        <p className="font-bold text-slate-700">
                          {selectedBooking.checkOutDate}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Users size={18} className="text-indigo-500" /> Khách hàng
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Người đặt:</span>
                      <span className="font-bold text-slate-900">
                        {selectedBooking.userFullName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Số điện thoại:</span>
                      <span className="font-bold text-slate-900">
                        {selectedBooking.userPhoneNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Email:</span>
                      <span className="font-bold text-slate-900">
                        {selectedBooking.userEmail}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Số lượng:</span>
                      <span className="font-bold text-slate-900">
                        {selectedBooking.numberOfGuests} Người lớn,{" "}
                        {selectedBooking.numberOfChildren} Trẻ em
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedBooking.specialRequests && (
                <div className="mt-8">
                  <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <MessageSquare size={18} className="text-indigo-500" /> Yêu
                    cầu đặc biệt
                  </h4>
                  <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-sm text-indigo-900">
                    "{selectedBooking.specialRequests}"
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-white transition-colors"
              >
                Đóng
              </button>

              {selectedBooking.status === BookingStatus.CONFIRMED &&
                selectedBooking.paymentStatus !== PaymentStatus.PAID && (
                  <button
                    onClick={() =>
                      navigate(`/payment?bookingId=${selectedBooking.id}`)
                    }
                    className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2"
                  >
                    <CreditCard size={16} /> Thanh toán ngay
                  </button>
                )}

              {selectedBooking.canCancel && (
                <button
                  onClick={() => handleCancelBooking(selectedBooking.id)}
                  disabled={actionLoading === selectedBooking.id}
                  className="px-5 py-2.5 bg-rose-50 text-rose-600 border border-rose-100 font-bold rounded-xl hover:bg-rose-100 transition-colors flex items-center gap-2"
                >
                  {actionLoading === selectedBooking.id && (
                    <Loader2 size={16} className="animate-spin" />
                  )}{" "}
                  Hủy phòng
                </button>
              )}
              {(selectedBooking.status === BookingStatus.COMPLETED ||
                selectedBooking.status === BookingStatus.CANCELLED) && (
                <button
                  onClick={() => navigate(`/room/${selectedBooking.roomId}`)}
                  className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
                >
                  Đặt lại phòng này
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Lịch sử đặt phòng
          </h1>
          <p className="text-slate-500">
            Quản lý các chuyến đi và trải nghiệm của bạn tại MoonLight.
          </p>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-white rounded-xl border border-slate-200 shadow-sm w-fit mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === "upcoming" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
          >
            Đang đặt phòng
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === "history" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
          >
            Lịch sử
          </button>
          <button
            onClick={() => setActiveTab("cancelled")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === "cancelled" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
          >
            Đã hủy
          </button>
        </div>

        {/* List */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2
                className="animate-spin text-indigo-500 mb-4"
                size={40}
              />
              <p className="font-medium">Đang tải danh sách...</p>
            </div>
          ) : filteredBookings.length > 0 ? (
            filteredBookings.map((booking: Booking) => {
              const statusInfo = getStatusLabel(booking.status);
              const displayImage =
                roomImages[booking.roomId] || booking.image || PLACEHOLDER_IMG;
              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row group"
                >
                  {/* Image Section */}
                  <div className="md:w-72 h-48 md:h-auto relative overflow-hidden bg-slate-100">
                    <img
                      src={displayImage}
                      alt={booking.roomName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = PLACEHOLDER_IMG;
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm border ${statusInfo.class}`}
                      >
                        {statusInfo.text}
                      </span>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="p-6 md:p-8 flex-1 flex flex-col">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                          {booking.roomName}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-mono text-slate-500 font-bold">
                            #{booking.bookingNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={16} className="text-indigo-500" />{" "}
                            {booking.checkInDate} - {booking.checkOutDate}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block text-2xl font-bold text-slate-900">
                          {booking.totalAmount.toLocaleString()}
                          <span className="font-bold font-mono text-indigo-600 ml-1 text-{8px}">
                            VND
                          </span>
                        </span>
                        {booking.status !== BookingStatus.CANCELLED && (
                          <span
                            className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded font-bold ${booking.paymentStatus === "PAID" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
                          >
                            {booking.paymentStatus === "PAID"
                              ? "Đã thanh toán"
                              : "Chưa thanh toán"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-50 flex flex-wrap gap-3 items-center mt-auto">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="px-4 py-2 bg-slate-50 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors flex items-center gap-2"
                      >
                        <FileText size={16} /> Xem chi tiết
                      </button>

                      {activeTab === "upcoming" && (
                        <>
                          {booking.canCancel && (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              disabled={actionLoading === booking.id}
                              className="px-4 py-2 border border-rose-100 text-rose-600 rounded-xl text-sm font-bold hover:bg-rose-50 transition-colors flex items-center gap-2 ml-auto"
                            >
                              {actionLoading === booking.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <X size={16} />
                              )}{" "}
                              Hủy phòng
                            </button>
                          )}
                          {/* Payment Button */}
                          {booking.status === BookingStatus.CONFIRMED &&
                            booking.paymentStatus !== PaymentStatus.PAID && (
                              <button
                                onClick={() =>
                                  navigate(`/payment?bookingId=${booking.id}`)
                                }
                                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2 ml-auto"
                              >
                                <CreditCard size={16} /> Thanh toán
                              </button>
                            )}
                        </>
                      )}

                      {(activeTab === "history" ||
                        activeTab === "cancelled") && (
                        <>
                          {booking.status === BookingStatus.COMPLETED && (
                            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors flex items-center gap-2">
                              <Download size={16} /> Hóa đơn
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/room/${booking.roomId}`)}
                            className="ml-auto px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 flex items-center gap-2"
                          >
                            Đặt lại <ChevronRight size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                {activeTab === "cancelled" ? (
                  <CalendarX size={40} />
                ) : (
                  <AlertCircle size={40} />
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Chưa có dữ liệu
              </h3>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">
                {activeTab === "upcoming"
                  ? "Bạn chưa có kế hoạch nghỉ dưỡng nào sắp tới."
                  : activeTab === "history"
                    ? "Bạn chưa hoàn thành chuyến đi nào."
                    : "Bạn chưa hủy chuyến đi nào."}
              </p>
              {activeTab !== "cancelled" && (
                <button
                  onClick={() => navigate("/rooms")}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                  Khám phá phòng nghỉ
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
