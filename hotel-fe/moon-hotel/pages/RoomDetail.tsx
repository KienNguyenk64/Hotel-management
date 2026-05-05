import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { roomApi, reviewApi } from "../services/api";
import { Room, ReviewResponse, Reply } from "../types";
import {
  ArrowLeft,
  Star,
  Users,
  Maximize,
  CalendarCheck,
  Phone,
  CheckCircle2,
  Wifi,
  Coffee,
  Monitor,
  Wind,
  ChevronRight,
  Sun,
  Award,
  ShieldCheck,
  MessageSquare,
  Reply as ReplyIcon,
  Utensils,
  Flower2,
  X,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Edit2,
  Trash2,
  Mail,
  MapPin,
} from "lucide-react";
import { Breadcrumb } from "../components/Breadcrumb";

export const RoomDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | undefined>(undefined);
  const [activeImage, setActiveImage] = useState<string>("");
  const [similarRooms, setSimilarRooms] = useState<Room[]>([]);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Review Form State
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  // Edit Review State
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editComment, setEditComment] = useState("");

  // Reply State
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>(
    {},
  );
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Edit Reply State
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editReplyContent, setEditReplyContent] = useState("");

  // User Info Popover State
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });

  // Get current user
  const getCurrentUser = () => {
    const userStr = localStorage.getItem("lux_user");
    return userStr ? JSON.parse(userStr) : null;
  };

  const currentUser = getCurrentUser();
  const isAdmin =
    currentUser?.role === "ADMIN" || currentUser?.role === "STAFF";

  const getDisplayImage = (roomData: Room | any): string => {
    if (roomData.images && roomData.images.length > 0 && roomData.images[0])
      return roomData.images[0];
    if (roomData.thumbnailImage) return roomData.thumbnailImage;
    return "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop";
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await roomApi.getById(id);
        if (response.data.status === "success") {
          const fetchedRoom = response.data.data;
          setRoom(fetchedRoom);
          setActiveImage(getDisplayImage(fetchedRoom));

          if (fetchedRoom.reviews && fetchedRoom.reviews.length > 0) {
            setReviews(fetchedRoom.reviews);
          }

          const similarRes = await roomApi.getByType(fetchedRoom.type);
          if (similarRes.data.status === "success") {
            setSimilarRooms(
              similarRes.data.data.filter((r) => r.id !== id).slice(0, 3),
            );
          }
        }
      } catch (error) {
        console.error("Error fetching room details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleBooking = () => {
    const isLoggedIn = localStorage.getItem("lux_token");
    if (room) {
      if (!isLoggedIn) {
        navigate("/login", { state: { from: `/booking?roomId=${room.id}` } });
      } else {
        navigate(`/booking?roomId=${room.id}`);
      }
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    setReviewSuccess(null);

    const isLoggedIn = localStorage.getItem("lux_token");
    if (!isLoggedIn) {
      navigate("/login", { state: { from: `/room/${id}` } });
      return;
    }

    if (!userComment.trim()) {
      setReviewError("Vui lòng nhập nội dung đánh giá");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const response = await reviewApi.create({
        roomId: id!,
        rating: userRating,
        comment: userComment.trim(),
      });

      if (response.data.status === "success") {
        setReviewSuccess(
          "Đánh giá của bạn đã được gửi thành công và đang chờ duyệt!",
        );
        setUserComment("");
        setUserRating(5);
        setShowReviewForm(false);

        setTimeout(() => {
          setReviewSuccess(null);
          fetchRoomData();
        }, 2000);
      }
    } catch (error: any) {
      console.error("Error submitting review:", error);
      const errorMsg =
        error.response?.data?.message ||
        "Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại!";
      setReviewError(errorMsg);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleEditReview = async (reviewId: string) => {
    if (!editComment.trim()) return;

    try {
      const response = await reviewApi.update(reviewId, editComment.trim());
      if (response.data.status === "success") {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId ? { ...r, comment: editComment.trim() } : r,
          ),
        );
        setEditingReviewId(null);
        setEditComment("");
      }
    } catch (error: any) {
      console.error("Error updating review:", error);
      alert(
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật đánh giá!",
      );
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) return;

    try {
      const response = await reviewApi.delete(reviewId);
      if (response.data.status === "success") {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      }
    } catch (error: any) {
      console.error("Error deleting review:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra khi xóa đánh giá!");
    }
  };

  const handleSubmitReply = async (reviewId: string) => {
    const isLoggedIn = localStorage.getItem("lux_token");
    if (!isLoggedIn) {
      navigate("/login", { state: { from: `/room/${id}` } });
      return;
    }

    if (!replyContent[reviewId]?.trim()) return;

    setIsSubmittingReply(true);
    try {
      const response = await reviewApi.createReply(reviewId, {
        content: replyContent[reviewId].trim(),
      });

      if (response.data.status === "success") {
        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review.id === reviewId
              ? { ...review, replies: response.data.data.replies || [] }
              : review,
          ),
        );
        setReplyContent({ ...replyContent, [reviewId]: "" });
        setActiveReplyId(null);
      }
    } catch (error: any) {
      console.error("Error submitting reply:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra khi gửi phản hồi!");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleEditReply = async (replyId: string) => {
    if (!editReplyContent.trim()) return;

    try {
      const response = await reviewApi.updateReply(
        replyId,
        editReplyContent.trim(),
      );
      if (response.data.status === "success") {
        setReviews((prev) =>
          prev.map((review) => ({
            ...review,
            replies: review.replies.map((r) =>
              r.id === replyId ? { ...r, content: editReplyContent.trim() } : r,
            ),
          })),
        );
        setEditingReplyId(null);
        setEditReplyContent("");
      }
    } catch (error: any) {
      console.error("Error updating reply:", error);
      alert(
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật phản hồi!",
      );
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phản hồi này?")) return;

    try {
      const response = await reviewApi.deleteReply(replyId);
      if (response.data.status === "success") {
        setReviews((prev) =>
          prev.map((review) => ({
            ...review,
            replies: review.replies.filter((r) => r.id !== replyId),
          })),
        );
      }
    } catch (error: any) {
      console.error("Error deleting reply:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra khi xóa phản hồi!");
    }
  };

  const fetchRoomData = async () => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const response = await roomApi.getById(id);
      if (response.data.status === "success" && response.data.data.reviews) {
        setReviews(
          response.data.data.reviews.filter(
            (r: any) => r.reviewStatus === "APPROVED",
          ),
        );
      }
    } catch (error) {
      console.error("Error refreshing reviews:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Vừa xong";
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays < 7) return `${diffDays} ngày trước`;

      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getAmenityIcon = (text: string): React.JSX.Element => {
    const lower = text.toLowerCase();
    if (lower.includes("wifi")) return <Wifi size={18} />;
    if (lower.includes("bed") || lower.includes("giường"))
      return <Sun size={18} />;
    if (lower.includes("bar") || lower.includes("bếp") || lower.includes("ăn"))
      return <Coffee size={18} />;
    if (lower.includes("tv") || lower.includes("màn hình"))
      return <Monitor size={18} />;
    if (lower.includes("hồ bơi") || lower.includes("tắm"))
      return <Wind size={18} />;
    return <CheckCircle2 size={18} />;
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!room) return;
    const allImages = [
      ...new Set([...(room.images || []), room.thumbnailImage]),
    ].filter(Boolean);
    const currentIndex = allImages.indexOf(activeImage);
    const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
    setActiveImage(allImages[prevIndex]);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!room) return;
    const allImages = [
      ...new Set([...(room.images || []), room.thumbnailImage]),
    ].filter(Boolean);
    const currentIndex = allImages.indexOf(activeImage);
    const nextIndex = (currentIndex + 1) % allImages.length;
    setActiveImage(allImages[nextIndex]);
  };

  const handleUserHover = (
    userId: string,
    userName: string,
    event: React.MouseEvent,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPopoverPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8,
    });
    setHoveredUserId(userId);
  };

  const canEditReview = (review: ReviewResponse) => {
    return currentUser && review.userId === currentUser.id;
  };

  const canDeleteReview = (review: ReviewResponse) => {
    return currentUser && (review.userId === currentUser.id || isAdmin);
  };

  const canEditReply = (reply: Reply) => {
    return currentUser && reply.userId === currentUser.id;
  };

  const canDeleteReply = (reply: Reply) => {
    return currentUser && (reply.userId === currentUser.id || isAdmin);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-lux-50 pt-24 pb-20 max-w-7xl mx-auto px-4 md:px-6 animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="aspect-video bg-gray-200 rounded-3xl"></div>
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-24 h-24 bg-gray-200 rounded-2xl"
                ></div>
              ))}
            </div>
            <div className="h-40 bg-gray-200 rounded-3xl"></div>
          </div>
          <div className="space-y-6">
            <div className="h-80 bg-gray-200 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-lux-50 font-sans pt-20">
        <div className="text-center p-8">
          <h2 className="text-2xl font-serif font-bold text-lux-900 mb-4">
            Không tìm thấy phòng
          </h2>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-lux-900 text-white rounded-full font-bold hover:bg-lux-800 transition-colors"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lux-50 pb-20 animate-fade-in font-sans selection:bg-lux-200 pt-24">
      {/* User Info Popover */}
      {hoveredUserId && (
        <div
          className="fixed z-[70] animate-fade-in"
          style={{
            left: `${popoverPosition.x}px`,
            top: `${popoverPosition.y}px`,
            transform: "translateX(-50%)",
          }}
          onMouseLeave={() => setHoveredUserId(null)}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-lux-200 p-4 w-64 animate-scale-in">
            {reviews.find((r) => r.userId === hoveredUserId) &&
              (() => {
                const user = reviews.find((r) => r.userId === hoveredUserId)!;
                return (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={
                          user.userAvatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(user.userFullName)}&background=D4AF37&color=fff`
                        }
                        alt={user.userFullName}
                        className="w-12 h-12 rounded-full border-2 border-lux-200 shadow-sm"
                      />
                      <div>
                        <h4 className="font-bold text-lux-900">
                          {user.userFullName}
                        </h4>
                        <p className="text-xs text-lux-400">Khách hàng</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-lux-600">
                        <Mail size={12} className="text-lux-400" />
                        <span>{user.userEmail}</span>
                      </div>
                      <div className="flex items-center gap-2 text-lux-600">
                        <Phone size={12} className="text-lux-400" />
                        <span>{user.userPhoneNumber}</span>
                      </div>
                    </div>
                  </>
                );
              })()}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center backdrop-blur-sm animate-fade-in"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all transform hover:scale-110"
          >
            <X size={32} />
          </button>

          <button
            onClick={handlePrevImage}
            className="absolute left-4 md:left-8 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all transform hover:scale-110"
          >
            <ChevronLeft size={40} />
          </button>

          <img
            src={activeImage}
            alt={room.name}
            className="max-w-[90vw] max-h-[90vh] object-contain shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={handleNextImage}
            className="absolute right-4 md:right-8 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all transform hover:scale-110"
          >
            <ChevronRight size={40} />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm font-bold bg-black/50 px-4 py-2 rounded-full backdrop-blur">
            {room.name}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-6">
        <Breadcrumb
          items={[
            { label: "Phòng nghỉ & Suites", path: "/rooms" },
            { label: room.name },
          ]}
        />
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-lux-600 hover:text-lux-900 font-bold transition-colors group mt-2"
        >
          <ArrowLeft
            className="group-hover:-translate-x-1 transition-transform"
            size={20}
          />
          Quay lại
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <div className="space-y-4">
              <div
                className="rounded-3xl overflow-hidden shadow-xl shadow-lux-200/50 border border-lux-100 aspect-video md:aspect-[16/10] relative group bg-white cursor-zoom-in"
                onClick={() => setLightboxOpen(true)}
              >
                <img
                  src={activeImage}
                  alt={room.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop";
                  }}
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-xs font-bold text-lux-900 uppercase tracking-wider shadow-sm">
                  {room.typeDisplay || room.type}
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full font-bold text-lux-900 shadow-lg flex items-center gap-2">
                    <Maximize size={16} /> Xem toàn màn hình
                  </div>
                </div>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {[...new Set([...(room.images || []), room.thumbnailImage])]
                  .filter(Boolean)
                  .map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`relative flex-shrink-0 w-24 h-24 md:w-32 md:h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 transform hover:scale-105 ${
                        activeImage === img
                          ? "border-lux-500 ring-4 ring-lux-500/10 opacity-100 scale-105"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`View ${idx}`}
                        className="w-full h-full object-cover"
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    </button>
                  ))}
              </div>
            </div>

            {/* Highlights */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-lux-100 shadow-sm">
              <h3 className="font-serif font-bold text-2xl text-lux-900 mb-6">
                Điểm nổi bật
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center p-4 bg-lux-50 rounded-2xl hover:bg-lux-100 transition-all transform hover:scale-105 cursor-default">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-lux-500 shadow-sm mb-3 animate-bounce-slow">
                    <Sun size={24} />
                  </div>
                  <h4 className="font-bold text-lux-900 mb-1">
                    View {room.viewDisplay || room.view}
                  </h4>
                  <p className="text-xs text-lux-600">Tầm nhìn tuyệt đẹp.</p>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-lux-50 rounded-2xl hover:bg-lux-100 transition-all transform hover:scale-105 cursor-default">
                  <div
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-lux-500 shadow-sm mb-3 animate-bounce-slow"
                    style={{ animationDelay: "0.1s" }}
                  >
                    <Award size={24} />
                  </div>
                  <h4 className="font-bold text-lux-900 mb-1">
                    Nội Thất Cao Cấp
                  </h4>
                  <p className="text-xs text-lux-600">
                    Giường {room.bedTypeDisplay || room.bedType}.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-lux-50 rounded-2xl hover:bg-lux-100 transition-all transform hover:scale-105 cursor-default">
                  <div
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-lux-500 shadow-sm mb-3 animate-bounce-slow"
                    style={{ animationDelay: "0.2s" }}
                  >
                    <ShieldCheck size={24} />
                  </div>
                  <h4 className="font-bold text-lux-900 mb-1">
                    Tiện Nghi Đầy Đủ
                  </h4>
                  <p className="text-xs text-lux-600">
                    {room.hasBalcony ? "Có ban công, " : ""}{" "}
                    {room.hasBathroom ? "Phòng tắm riêng" : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-lux-100 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-2xl font-serif font-bold text-lux-900 mb-4">
                Mô tả chi tiết
              </h2>
              <p className="text-lux-600 leading-relaxed text-lg">
                {room.description}
              </p>
              {room.notes && (
                <div className="mt-4 p-4 bg-lux-50 rounded-xl border border-lux-200 animate-fade-in">
                  <p className="text-sm text-lux-700 italic">
                    Note: {room.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Amenities */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-lux-100 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-serif font-bold text-2xl text-lux-900 mb-6">
                Tiện nghi phòng
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                {room.amenities.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-3 hover:bg-lux-50 rounded-xl transition-all transform hover:scale-105 group cursor-default"
                  >
                    <div className="w-10 h-10 rounded-full bg-lux-100 flex items-center justify-center text-lux-600 shrink-0 group-hover:bg-lux-900 group-hover:text-white transition-all duration-300 group-hover:rotate-12">
                      {getAmenityIcon(amenity)}
                    </div>
                    <div>
                      <p className="font-bold text-lux-900 text-sm">
                        {amenity}
                      </p>
                      <p className="text-xs text-lux-400">Tiêu chuẩn 5 sao</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Review Section - Enhanced */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-lux-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-lux-900 mb-2">
                    Đánh giá từ khách hàng
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400">
                      <Star fill="currentColor" size={20} />
                    </div>
                    <span className="font-bold text-lux-900 text-lg">
                      {room.averageRating?.toFixed(1) || "5.0"}
                    </span>
                    <span className="text-lux-500">
                      ({room.totalReviews || reviews.length} lượt đánh giá)
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const isLoggedIn = localStorage.getItem("lux_token");
                    if (!isLoggedIn) {
                      navigate("/login", { state: { from: `/room/${id}` } });
                      return;
                    }
                    setShowReviewForm(!showReviewForm);
                  }}
                  className="px-4 py-2 bg-lux-900 text-white rounded-xl font-bold text-sm hover:bg-lux-800 transition-all flex items-center gap-2 shadow-lg shadow-lux-900/10 transform hover:scale-105"
                >
                  <MessageSquare size={16} /> Viết đánh giá
                </button>
              </div>

              {/* Success/Error Messages */}
              {reviewSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 animate-fade-in">
                  <CheckCircle2
                    size={20}
                    className="text-green-600 shrink-0 mt-0.5"
                  />
                  <p className="text-sm text-green-800 font-medium">
                    {reviewSuccess}
                  </p>
                </div>
              )}

              {reviewError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fade-in">
                  <AlertCircle
                    size={20}
                    className="text-red-600 shrink-0 mt-0.5"
                  />
                  <p className="text-sm text-red-800 font-medium">
                    {reviewError}
                  </p>
                </div>
              )}

              {/* Review Form */}
              {showReviewForm && (
                <form
                  onSubmit={handleSubmitReview}
                  className="mb-8 bg-lux-50 p-6 rounded-2xl border border-lux-100 animate-slide-down"
                >
                  <h4 className="font-bold text-lux-900 mb-4">
                    Chia sẻ trải nghiệm của bạn
                  </h4>
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-lux-500 uppercase tracking-wider mb-2">
                      Đánh giá của bạn
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setUserRating(star)}
                          className="focus:outline-none hover:scale-125 transition-transform"
                        >
                          <Star
                            size={24}
                            className={`${star <= userRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300"} transition-all`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-lux-500 uppercase tracking-wider mb-2">
                      Bình luận
                    </label>
                    <textarea
                      required
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      rows={3}
                      className="w-full p-3 rounded-xl border border-lux-200 outline-none focus:border-lux-500 text-sm focus:ring-2 focus:ring-lux-200 transition-all"
                      placeholder="Hãy cho chúng tôi biết cảm nhận của bạn..."
                    ></textarea>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowReviewForm(false);
                        setReviewError(null);
                      }}
                      className="px-4 py-2 text-lux-600 font-bold text-sm hover:bg-lux-100 rounded-lg transition-all"
                    >
                      Hủy
                    </button>
                    <button
                      disabled={isSubmittingReview}
                      type="submit"
                      className="px-6 py-2 bg-lux-900 text-white rounded-xl font-bold text-sm hover:bg-lux-800 disabled:opacity-70 flex items-center gap-2 transition-all transform hover:scale-105"
                    >
                      {isSubmittingReview && (
                        <Loader2 size={14} className="animate-spin" />
                      )}
                      {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              {reviewsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-lux-500" size={32} />
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.length > 0 ? (
                    reviews.map((review, idx) => (
                      <div
                        key={review.id}
                        className="border-b border-lux-50 last:border-0 pb-6 last:pb-0 animate-fade-in-up hover:bg-lux-50 p-4 rounded-xl transition-all"
                        style={{ animationDelay: `${idx * 0.1}s` }}
                      >
                        <div className="flex gap-4">
                          <div
                            className="relative cursor-pointer group"
                            onMouseEnter={(e) =>
                              handleUserHover(
                                review.userId,
                                review.userFullName,
                                e,
                              )
                            }
                            onMouseLeave={() => setHoveredUserId(null)}
                          >
                            <img
                              src={
                                review?.userAvatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(review.userFullName)}&background=D4AF37&color=fff`
                              }
                              className="w-10 h-10 rounded-full object-cover border-2 border-lux-100 group-hover:border-lux-500 transition-all group-hover:scale-110"
                              alt={review.userFullName}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <h4
                                  className="font-bold text-lux-900 text-sm cursor-pointer hover:text-lux-600 transition-colors inline-block"
                                  onMouseEnter={(e) =>
                                    handleUserHover(
                                      review.userId,
                                      review.userFullName,
                                      e,
                                    )
                                  }
                                  onMouseLeave={() => setHoveredUserId(null)}
                                >
                                  {review.userFullName}
                                </h4>
                                <span className="text-xs text-lux-400 ml-2">
                                  {formatDate(review.createdDate)}
                                </span>
                              </div>
                              {(canEditReview(review) ||
                                canDeleteReview(review)) && (
                                <div className="flex gap-1">
                                  {canEditReview(review) && (
                                    <button
                                      onClick={() => {
                                        setEditingReviewId(review.id);
                                        setEditComment(review.comment);
                                      }}
                                      className="p-1.5 text-lux-400 hover:text-lux-600 hover:bg-lux-100 rounded-lg transition-all"
                                      title="Chỉnh sửa"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                  )}
                                  {canDeleteReview(review) && (
                                    <button
                                      onClick={() =>
                                        handleDeleteReview(review.id)
                                      }
                                      className="p-1.5 text-lux-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                      title="Xóa"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-0.5 mb-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  className={`${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"} transition-all`}
                                />
                              ))}
                            </div>

                            {editingReviewId === review.id ? (
                              <div className="animate-fade-in bg-white p-3 rounded-xl border border-lux-200 mb-3">
                                <textarea
                                  className="w-full p-2 border border-lux-300 rounded-lg text-sm focus:outline-none focus:border-lux-500 mb-2"
                                  rows={3}
                                  value={editComment}
                                  onChange={(e) =>
                                    setEditComment(e.target.value)
                                  }
                                ></textarea>
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => {
                                      setEditingReviewId(null);
                                      setEditComment("");
                                    }}
                                    className="px-3 py-1 bg-lux-50 border border-lux-200 text-lux-600 text-xs font-bold rounded-lg hover:bg-lux-100 transition-all"
                                  >
                                    Hủy
                                  </button>
                                  <button
                                    onClick={() => handleEditReview(review.id)}
                                    className="px-3 py-1 bg-lux-900 text-white text-xs font-bold rounded-lg hover:bg-lux-800 transition-all"
                                  >
                                    Lưu
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-lux-700 text-sm leading-relaxed mb-3">
                                {review.comment}
                              </p>
                            )}

                            {/* Replies */}
                            {review.replies && review.replies.length > 0 && (
                              <div className="space-y-2 mt-3">
                                {review.replies.map((reply: Reply) => (
                                  <div
                                    key={reply.id}
                                    className="bg-lux-50 p-3 rounded-xl border border-lux-100 flex gap-3 hover:bg-lux-100 transition-all group"
                                  >
                                    <div className="w-6 h-6 rounded-full bg-lux-900 flex items-center justify-center text-white shrink-0 mt-0.5">
                                      <ReplyIcon size={12} />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex justify-between items-start mb-1">
                                        <p className="text-xs font-bold text-lux-900">
                                          {reply.userFullName}
                                        </p>
                                        {(canEditReply(reply) ||
                                          canDeleteReply(reply)) && (
                                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {canEditReply(reply) && (
                                              <button
                                                onClick={() => {
                                                  setEditingReplyId(reply.id);
                                                  setEditReplyContent(
                                                    reply.content,
                                                  );
                                                }}
                                                className="p-1 text-lux-400 hover:text-lux-600 hover:bg-lux-200 rounded transition-all"
                                                title="Chỉnh sửa"
                                              >
                                                <Edit2 size={12} />
                                              </button>
                                            )}
                                            {canDeleteReply(reply) && (
                                              <button
                                                onClick={() =>
                                                  handleDeleteReply(reply.id)
                                                }
                                                className="p-1 text-lux-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                                title="Xóa"
                                              >
                                                <Trash2 size={12} />
                                              </button>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      {editingReplyId === reply.id ? (
                                        <div className="animate-fade-in">
                                          <textarea
                                            className="w-full p-2 border border-lux-300 rounded-lg text-xs focus:outline-none focus:border-lux-500 mb-2 bg-white"
                                            rows={2}
                                            value={editReplyContent}
                                            onChange={(e) =>
                                              setEditReplyContent(
                                                e.target.value,
                                              )
                                            }
                                          ></textarea>
                                          <div className="flex gap-2 justify-end">
                                            <button
                                              onClick={() => {
                                                setEditingReplyId(null);
                                                setEditReplyContent("");
                                              }}
                                              className="px-2 py-1 bg-white border border-lux-200 text-lux-600 text-xs font-bold rounded hover:bg-lux-50 transition-all"
                                            >
                                              Hủy
                                            </button>
                                            <button
                                              onClick={() =>
                                                handleEditReply(reply.id)
                                              }
                                              className="px-2 py-1 bg-lux-900 text-white text-xs font-bold rounded hover:bg-lux-800 transition-all"
                                            >
                                              Lưu
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <p className="text-xs text-lux-600 leading-relaxed">
                                            {reply.content}
                                          </p>
                                          <span className="text-[10px] text-lux-400 mt-1 block">
                                            {formatDate(reply.createdDate)}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Reply Form */}
                            {activeReplyId === review.id ? (
                              <div className="mt-3 animate-slide-down bg-lux-50 p-3 rounded-xl border border-lux-200">
                                <textarea
                                  className="w-full p-2 border border-lux-300 rounded-lg text-xs focus:outline-none focus:border-lux-500 mb-2 bg-white transition-all"
                                  placeholder="Nhập phản hồi..."
                                  rows={2}
                                  value={replyContent[review.id] || ""}
                                  onChange={(e) =>
                                    setReplyContent({
                                      ...replyContent,
                                      [review.id]: e.target.value,
                                    })
                                  }
                                ></textarea>
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => {
                                      setActiveReplyId(null);
                                      setReplyContent({
                                        ...replyContent,
                                        [review.id]: "",
                                      });
                                    }}
                                    className="px-3 py-1 bg-white border border-lux-200 text-lux-600 text-xs font-bold rounded-lg hover:bg-lux-50 transition-all"
                                  >
                                    Hủy
                                  </button>
                                  <button
                                    onClick={() => handleSubmitReply(review.id)}
                                    disabled={isSubmittingReply}
                                    className="px-3 py-1 bg-lux-900 text-white text-xs font-bold rounded-lg hover:bg-lux-800 disabled:opacity-70 flex items-center gap-1 transition-all transform hover:scale-105"
                                  >
                                    {isSubmittingReply && (
                                      <Loader2
                                        size={10}
                                        className="animate-spin"
                                      />
                                    )}
                                    Gửi
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  const isLoggedIn =
                                    localStorage.getItem("lux_token");
                                  if (!isLoggedIn) {
                                    navigate("/login", {
                                      state: { from: `/room/${id}` },
                                    });
                                    return;
                                  }
                                  setActiveReplyId(review.id);
                                }}
                                className="text-xs font-bold text-lux-500 hover:text-lux-900 flex items-center gap-1 mt-2 transition-all px-2 py-1 hover:bg-lux-100 rounded-lg w-fit transform hover:scale-105"
                              >
                                <ReplyIcon size={12} /> Trả lời
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 animate-fade-in">
                      <div className="w-16 h-16 bg-lux-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MessageSquare size={32} className="text-lux-300" />
                      </div>
                      <p className="text-lux-500">
                        Chưa có đánh giá nào. Hãy là người đầu tiên trải nghiệm!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Booking Card */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg shadow-lux-200/50 border border-lux-100 top-24 hover:shadow-xl transition-shadow">
              <div className="mb-6 border-b border-lux-50 pb-6">
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-lux-900 leading-tight mb-2">
                  {room.name}
                </h1>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="text-yellow-400 fill-yellow-400" size={18} />
                  <span className="font-bold text-lux-900">
                    {room.averageRating?.toFixed(1) || "5.0"}
                  </span>
                  <span className="text-xs text-lux-400">
                    ({room.totalReviews || reviews.length} đánh giá)
                  </span>
                </div>

                <div className="flex items-end gap-2">
                  <span className="text-4xl font-serif font-bold text-lux-900">
                    {room.pricePerNight.toLocaleString()}
                  </span>
                  <span className="text-lux-500 font-medium mb-1">
                    {" "}
                    VNĐ / đêm
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-lux-50 rounded-xl hover:bg-lux-100 transition-all transform hover:scale-105 cursor-default">
                  <Maximize className="text-lux-400" size={20} />
                  <div>
                    <p className="text-xs text-lux-400 uppercase font-bold">
                      Diện tích
                    </p>
                    <p className="text-lux-900 font-bold">{room.size} m²</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-lux-50 rounded-xl hover:bg-lux-100 transition-all transform hover:scale-105 cursor-default">
                  <Users className="text-lux-400" size={20} />
                  <div>
                    <p className="text-xs text-lux-400 uppercase font-bold">
                      Sức chứa
                    </p>
                    <p className="text-lux-900 font-bold">
                      {room.maxOccupancy} Người
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBooking}
                className="w-full bg-lux-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-lux-800 transition-all shadow-xl shadow-lux-900/20 flex items-center justify-center gap-2 group transform hover:scale-105 active:scale-95"
              >
                <CalendarCheck size={20} />
                Đặt phòng ngay
              </button>
              <p className="text-xs text-center text-lux-400 mt-3 flex items-center justify-center gap-1">
                <CheckCircle2 size={12} /> Xác nhận tức thì • Không cần thẻ tín
                dụng
              </p>
            </div>

            {/* Cross-sell Services */}
            <div className="bg-white p-6 rounded-3xl border border-lux-100 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-serif font-bold text-xl text-lux-900 mb-4">
                Nâng tầm trải nghiệm
              </h3>
              <div className="space-y-3">
                <div
                  onClick={() => navigate("/menu")}
                  className="flex items-center gap-3 p-3 bg-lux-50 rounded-xl cursor-pointer hover:bg-lux-100 transition-all transform hover:scale-105 group"
                >
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-lux-500 group-hover:text-lux-900 transition-all group-hover:rotate-12">
                    <Utensils size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-lux-900 text-sm">
                      Đặt bàn tối
                    </p>
                    <p className="text-xs text-lux-500">Nhà hàng The Eclipse</p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="ml-auto text-lux-300 group-hover:text-lux-500 group-hover:translate-x-1 transition-all"
                  />
                </div>
                <div
                  onClick={() => navigate("/services")}
                  className="flex items-center gap-3 p-3 bg-lux-50 rounded-xl cursor-pointer hover:bg-lux-100 transition-all transform hover:scale-105 group"
                >
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-lux-500 group-hover:text-lux-900 transition-all group-hover:rotate-12">
                    <Flower2 size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-lux-900 text-sm">
                      Spa & Relax
                    </p>
                    <p className="text-xs text-lux-500">
                      Giảm 20% cho khách đặt phòng
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="ml-auto text-lux-300 group-hover:text-lux-500 group-hover:translate-x-1 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-lux-50 to-white p-6 rounded-2xl border border-lux-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-all transform hover:scale-105 cursor-default">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-lux-500 shadow-md border border-lux-50 animate-pulse">
                <Phone size={24} />
              </div>
              <div>
                <p className="font-serif font-bold text-lux-900 text-lg">
                  0909 123 456
                </p>
                <p className="text-xs text-lux-500 uppercase tracking-wider font-bold">
                  Hỗ trợ 24/7
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Rooms */}
        <div className="mt-20 pt-10 border-t border-lux-100">
          <h2 className="text-3xl font-serif font-bold text-lux-900 mb-8">
            Có thể bạn sẽ thích
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {similarRooms.map((similar, idx) => (
              <div
                key={similar.id}
                onClick={() => navigate(`/room/${similar.id}`)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-lux-100 hover:shadow-xl transition-all cursor-pointer group transform hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={getDisplayImage(similar)}
                    alt={similar.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop";
                    }}
                  />
                  <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-lg text-xs font-bold text-lux-900">
                    {similar.typeDisplay || similar.type}
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-lux-900 text-lg mb-1 group-hover:text-lux-500 transition-colors">
                    {similar.name}
                  </h4>
                  <div className="flex justify-between items-center">
                    <span className="text-lux-500 font-bold">
                      {similar.pricePerNight.toLocaleString()}
                      <span className="text-xs text-lux-400 font-normal">
                        VND /đêm
                      </span>
                    </span>
                    <div className="w-8 h-8 rounded-full bg-lux-50 flex items-center justify-center text-lux-900 group-hover:bg-lux-900 group-hover:text-white transition-all group-hover:rotate-45">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
