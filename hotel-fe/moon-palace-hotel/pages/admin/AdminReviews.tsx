import React, { useState, useEffect, useMemo } from "react";
import {
  MessageSquare,
  Star,
  CheckCircle,
  EyeOff,
  Reply,
  ExternalLink,
  Filter,
  AlertCircle,
  BedDouble,
  ChevronDown,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { reviewApi, roomApi } from "../../services/api";
import { ReviewResponse, RoomResponse, ReviewStatus } from "../../types";
import { useNavigate } from "react-router-dom";

export const AdminReviews: React.FC = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"All" | ReviewStatus>("All");
  const [filterRoom, setFilterRoom] = useState<string>("All");
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [openReplyId, setOpenReplyId] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch reviews and rooms
  useEffect(() => {
    fetchData();
  }, [currentPage, filterStatus, filterRoom]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch rooms for filter dropdown
      const roomsRes = await roomApi.getAll(0, 100);
      if (roomsRes.data.status === "success") {
        setRooms(roomsRes.data.data.content);
      }

      // Build filter params
      const params: any = {
        page: currentPage,
        size: 10,
        sortBy: "createdDate",
        sortOrder: "desc" as const,
      };

      if (filterStatus !== "All") {
        params.status = filterStatus;
      }

      if (filterRoom !== "All") {
        params.roomId = filterRoom;
      }

      // Fetch all reviews via search endpoint (assuming backend has this)
      // If no search endpoint, we'll fetch from rooms
      const reviewsData: ReviewResponse[] = [];

      // Fetch reviews from each room
      for (const room of rooms) {
        try {
          const roomDetail = await roomApi.getById(room.id);
          if (
            roomDetail.data.status === "success" &&
            roomDetail.data.data.reviews
          ) {
            reviewsData.push(...roomDetail.data.data.reviews);
          }
        } catch (err) {
          console.error(`Error fetching reviews for room ${room.id}:`, err);
        }
      }

      // Apply filters
      let filtered = reviewsData;
      if (filterStatus !== "All") {
        filtered = filtered.filter((r) => r.reviewStatus === filterStatus);
      }
      if (filterRoom !== "All") {
        filtered = filtered.filter((r) => r.roomId === filterRoom);
      }

      // Sort by date
      filtered.sort(
        (a, b) =>
          new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime(),
      );

      setReviews(filtered);
      setTotalPages(Math.ceil(filtered.length / 10));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Advanced Filtering (client-side for now)
  const filteredReviews = useMemo(() => {
    let result = reviews;

    // Pagination
    const start = currentPage * 10;
    const end = start + 10;
    return result.slice(start, end);
  }, [reviews, currentPage]);

  // Calculate Average Rating
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const handleStatusChange = async (id: string, newStatus: ReviewStatus) => {
    setProcessingIds((prev) => new Set(prev).add(id));
    try {
      const response = await reviewApi.updateStatus(id, newStatus);
      if (response.data.status === "success") {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, reviewStatus: newStatus } : r,
          ),
        );
      }
    } catch (error: any) {
      console.error("Error updating status:", error);
      alert(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi cập nhật trạng thái!",
      );
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleReplySubmit = async (reviewId: string) => {
    if (!replyText[reviewId]?.trim()) return;

    setProcessingIds((prev) => new Set(prev).add(reviewId));
    try {
      const response = await reviewApi.createReply(reviewId, {
        content: replyText[reviewId].trim(),
      });

      if (response.data.status === "success") {
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? response.data.data : r)),
        );
        setReplyText({ ...replyText, [reviewId]: "" });
        setOpenReplyId(null);
      }
    } catch (error: any) {
      console.error("Error submitting reply:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra khi gửi phản hồi!");
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
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

  const getRoomImage = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room)
      return "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop";
    return (
      room.images?.[0] ||
      room.thumbnailImage ||
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop"
    );
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chờ duyệt";
      case "APPROVED":
        return "Đã duyệt";
      case "REJECTED":
        return "Đã ẩn";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-600";
      case "APPROVED":
        return "text-green-600";
      case "REJECTED":
        return "text-red-500";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">
              Đánh giá & Phản hồi
            </h1>
            <p className="text-lux-500">
              Quản lý tiếng nói của khách hàng và chất lượng dịch vụ.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => fetchData()}
              disabled={loading}
              className="p-3 bg-white border border-lux-200 rounded-xl hover:bg-lux-50 transition-colors disabled:opacity-50"
              title="Làm mới"
            >
              <RefreshCw
                size={18}
                className={`text-lux-600 ${loading ? "animate-spin" : ""}`}
              />
            </button>

            <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-lux-200 shadow-sm">
              <div className="text-right">
                <p className="text-xs text-lux-500 font-bold uppercase tracking-wider">
                  Đánh giá TB
                </p>
                <div className="flex items-center gap-1 justify-end">
                  <span className="text-2xl font-serif font-bold text-lux-900">
                    {averageRating}
                  </span>
                  <Star
                    size={16}
                    className="text-yellow-400 fill-yellow-400 mb-1"
                  />
                </div>
              </div>
              <div className="h-8 w-px bg-lux-100"></div>
              <div className="text-right">
                <p className="text-xs text-lux-500 font-bold uppercase tracking-wider">
                  Tổng số
                </p>
                <p className="text-2xl font-serif font-bold text-lux-900">
                  {reviews.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-lux-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <span className="text-sm font-bold text-lux-600 shrink-0 mr-2">
              Trạng thái:
            </span>
            {[
              { value: "All", label: "Tất cả" },
              { value: "PENDING", label: "Chờ duyệt" },
              { value: "APPROVED", label: "Đã duyệt" },
              { value: "REJECTED", label: "Đã ẩn" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => {
                  setFilterStatus(f.value as any);
                  setCurrentPage(0);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  filterStatus === f.value
                    ? "bg-lux-900 text-white shadow-md"
                    : "bg-lux-50 text-lux-600 hover:bg-lux-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter size={18} className="text-lux-500 shrink-0" />
            <div className="relative w-full md:w-64">
              <select
                value={filterRoom}
                onChange={(e) => {
                  setFilterRoom(e.target.value);
                  setCurrentPage(0);
                }}
                className="w-full appearance-none bg-lux-50 border border-lux-200 text-lux-900 text-sm font-bold rounded-xl px-4 py-2 pr-10 outline-none focus:border-lux-500 cursor-pointer transition-colors"
              >
                <option value="All">Tất cả các phòng</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-lux-400 pointer-events-none"
              />
            </div>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-lux-500" size={48} />
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review) => {
                const isProcessing = processingIds.has(review.id);

                return (
                  <div
                    key={review.id}
                    className="bg-white rounded-2xl border border-lux-200 shadow-sm relative transition-all hover:shadow-md overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Room Context Section */}
                      <div className="bg-lux-50 p-6 md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r border-lux-100 flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-lux-500 mb-1">
                          <BedDouble size={16} />
                          <span className="text-xs font-bold uppercase tracking-wider">
                            Phòng được review
                          </span>
                        </div>

                        <div
                          onClick={() => navigate(`/room/${review.roomId}`)}
                          className="group cursor-pointer"
                        >
                          <div className="aspect-video rounded-lg overflow-hidden mb-3 border border-lux-200 relative">
                            <img
                              src={getRoomImage(review.roomId)}
                              alt={review.roomName}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop";
                              }}
                            />
                          </div>
                          <h4 className="font-bold text-lux-900 text-sm group-hover:text-lux-600 transition-colors flex items-center gap-1">
                            {review.roomName}{" "}
                            <ExternalLink
                              size={12}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          </h4>
                          <p className="text-xs text-lux-400 mt-1">
                            Loại: {review.roomType}
                          </p>
                        </div>
                      </div>

                      {/* Review Content Section */}
                      <div className="p-6 flex-1 flex flex-col">
                        {/* User Header */}
                        <div className="flex items-center gap-3 mb-4">
                          <img
                            src={
                              review.userAvatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(review.userFullName)}&background=D4AF37&color=fff`
                            }
                            alt={review.userFullName}
                            className="w-10 h-10 rounded-full object-cover border border-lux-100 shadow-sm"
                          />
                          <div>
                            <h4 className="font-bold text-lux-900 text-sm">
                              {review.userFullName}
                            </h4>
                            <p className="text-xs text-lux-500">
                              {formatDate(review.createdDate)}
                            </p>
                          </div>
                          <div className="ml-auto flex gap-0.5 bg-lux-50 px-2 py-1 rounded-lg border border-lux-100">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={`${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="relative pl-4 border-l-2 border-lux-200 mb-4">
                            <p className="text-lux-800 leading-relaxed italic">
                              "{review.comment}"
                            </p>
                          </div>

                          {/* Replies */}
                          {review.replies && review.replies.length > 0 && (
                            <div className="space-y-2 mb-4">
                              {review.replies.map((reply) => (
                                <div
                                  key={reply.id}
                                  className="bg-lux-50 p-4 rounded-xl border border-lux-100 flex gap-3 animate-fade-in"
                                >
                                  <div className="w-8 h-8 rounded-full bg-lux-900 flex items-center justify-center text-white shrink-0">
                                    <Reply size={14} />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-xs font-bold text-lux-900 mb-1">
                                      {reply.userFullName}
                                    </p>
                                    <p className="text-sm text-lux-600">
                                      {reply.content}
                                    </p>
                                    <span className="text-[10px] text-lux-400 mt-1 block">
                                      {formatDate(reply.createdDate)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Reply Form */}
                          {openReplyId === review.id ? (
                            <div className="mt-4 animate-fade-in bg-lux-50 p-4 rounded-xl border border-lux-200">
                              <textarea
                                className="w-full p-3 border border-lux-300 rounded-xl text-sm focus:outline-none focus:border-lux-500 focus:ring-2 focus:ring-lux-200 mb-3 bg-white"
                                placeholder="Nhập nội dung phản hồi khách hàng..."
                                rows={3}
                                value={replyText[review.id] || ""}
                                onChange={(e) =>
                                  setReplyText({
                                    ...replyText,
                                    [review.id]: e.target.value,
                                  })
                                }
                              ></textarea>
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => {
                                    setOpenReplyId(null);
                                    setReplyText({
                                      ...replyText,
                                      [review.id]: "",
                                    });
                                  }}
                                  disabled={isProcessing}
                                  className="px-4 py-2 bg-white border border-lux-200 text-lux-600 text-xs font-bold rounded-lg hover:bg-lux-50 disabled:opacity-50"
                                >
                                  Hủy
                                </button>
                                <button
                                  onClick={() => handleReplySubmit(review.id)}
                                  disabled={isProcessing}
                                  className="px-4 py-2 bg-lux-900 text-white text-xs font-bold rounded-lg hover:bg-lux-800 disabled:opacity-70 flex items-center gap-2"
                                >
                                  {isProcessing && (
                                    <Loader2
                                      size={12}
                                      className="animate-spin"
                                    />
                                  )}
                                  Gửi phản hồi
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setOpenReplyId(review.id)}
                              disabled={isProcessing}
                              className="text-xs font-bold text-lux-500 hover:text-lux-900 flex items-center gap-1 mt-2 transition-colors px-3 py-1.5 hover:bg-lux-50 rounded-lg w-fit disabled:opacity-50"
                            >
                              <Reply size={14} /> Trả lời đánh giá này
                            </button>
                          )}
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-4 mt-4 border-t border-lux-50 flex items-center justify-between">
                          <div className="text-xs font-bold text-lux-400 uppercase tracking-wider">
                            Trạng thái:{" "}
                            <span
                              className={getStatusColor(review.reviewStatus)}
                            >
                              {getStatusDisplay(review.reviewStatus)}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {review.reviewStatus === "PENDING" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    review.id,
                                    "APPROVED" as ReviewStatus,
                                  )
                                }
                                disabled={isProcessing}
                                className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-colors border border-green-200 disabled:opacity-50"
                              >
                                {isProcessing ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <CheckCircle size={14} />
                                )}{" "}
                                Duyệt
                              </button>
                            )}
                            {review.reviewStatus !== "REJECTED" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    review.id,
                                    "REJECTED" as ReviewStatus,
                                  )
                                }
                                disabled={isProcessing}
                                className="px-3 py-1.5 bg-lux-50 text-lux-500 hover:text-lux-900 hover:bg-lux-100 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-colors border border-lux-200 disabled:opacity-50"
                              >
                                {isProcessing ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <EyeOff size={14} />
                                )}{" "}
                                Ẩn
                              </button>
                            )}
                            {review.reviewStatus === "REJECTED" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    review.id,
                                    "APPROVED" as ReviewStatus,
                                  )
                                }
                                disabled={isProcessing}
                                className="px-3 py-1.5 bg-lux-50 text-lux-500 hover:text-green-700 hover:bg-green-50 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-colors border border-lux-200 hover:border-green-200 disabled:opacity-50"
                              >
                                {isProcessing ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <CheckCircle size={14} />
                                )}{" "}
                                Hiện lại
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-lux-200">
                <div className="w-16 h-16 bg-lux-50 rounded-full flex items-center justify-center text-lux-300 mx-auto mb-4">
                  <MessageSquare size={32} />
                </div>
                <p className="text-lux-500 font-medium mb-2">
                  Không tìm thấy đánh giá nào.
                </p>
                <button
                  onClick={() => {
                    setFilterStatus("All");
                    setFilterRoom("All");
                    setCurrentPage(0);
                  }}
                  className="text-lux-900 font-bold text-sm hover:underline"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-8">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2 bg-white border border-lux-200 rounded-lg text-sm font-bold text-lux-900 hover:bg-lux-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>

              <span className="text-sm font-bold text-lux-600 px-4">
                Trang {currentPage + 1} / {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
                }
                disabled={currentPage === totalPages - 1}
                className="px-4 py-2 bg-white border border-lux-200 rounded-lg text-sm font-bold text-lux-900 hover:bg-lux-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
