import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Moon,
  Star,
  Coffee,
  Wifi,
  ArrowRight,
  ChevronRight,
  Video,
  X,
  ChevronLeft,
  Quote,
  Loader2,
} from "lucide-react";
import { REVIEWS_DATA } from "../services/mockData";
import { roomApi } from "../services/api";
import { Room } from "../types";

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [featuredRooms, setFeaturedRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Auto-slide reviews
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % REVIEWS_DATA.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Featured Rooms from API
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await roomApi.getFeatured();

        if (response.data.status === "success") {
          // Lọc các phòng có trạng thái "available"
          const availableRooms = response.data.data.filter(
            (room) => room.status === "AVAILABLE",
          );

          // Giới hạn 4 phòng nếu nhiều hơn
          if (availableRooms.length > 4) {
            setFeaturedRooms(availableRooms.slice(0, 4));
          } else {
            setFeaturedRooms(availableRooms);
          }
        }
      } catch (error) {
        console.error("Failed to fetch featured rooms", error);
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchFeatured();
  }, []);

  const nextReview = () => {
    setCurrentReviewIndex((prev) => (prev + 1) % REVIEWS_DATA.length);
  };

  const prevReview = () => {
    setCurrentReviewIndex(
      (prev) => (prev - 1 + REVIEWS_DATA.length) % REVIEWS_DATA.length,
    );
  };

  return (
    <div className="min-h-screen bg-lux-50 font-sans selection:bg-lux-200 pt-20">
      {/* Video Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-4xl bg-black rounded-2xl shadow-2xl overflow-hidden aspect-video border border-lux-500/30">
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-lux-500 hover:text-lux-900 transition-colors"
            >
              <X size={24} />
            </button>
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/cdKx1Zv3YKs?si=IWuLlkUPoUSnsdZB"
              title="Moon Palace Tour"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
          <div
            className="absolute inset-0 -z-10"
            onClick={() => setIsVideoOpen(false)}
          ></div>
        </div>
      )}

      {/* Hero Section */}
      <header className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-lux-900">
          <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-lux-900/30 via-transparent to-lux-50"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-0">
          <div className="inline-flex flex-col items-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6 animate-fade-in">
            {/* 5 sao */}
            <div className="flex gap-1">
              <Star size={16} className="text-lux-500 fill-lux-500" />
              <Star size={16} className="text-lux-500 fill-lux-500" />
              <Star size={16} className="text-lux-500 fill-lux-500" />
              <Star size={16} className="text-lux-500 fill-lux-500" />
              <Star size={16} className="text-lux-500 fill-lux-500" />
            </div>

            {/* text */}
            <span className="text-white text-xs font-bold uppercase tracking-widest">
              Khách sạn 5 sao sang trọng
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-xl animate-fade-in">
            Moon
            <span className="text-lux-500">Light</span>
          </h1>

          <p className="text-lux-100 text-lg md:text-2xl mb-10 max-w-2xl mx-auto font-light font-serif leading-relaxed drop-shadow-md animate-fade-in">
            Chào mừng bạn đến với MoonLight – nơi mang đến trải nghiệm nghỉ
            dưỡng sang trọng, tiện nghi và thoải mái.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center animate-fade-in">
            <button
              onClick={() => navigate("/rooms")}
              className="px-8 py-4 bg-lux-500 text-lux-900 rounded-full font-bold text-lg hover:bg-lux-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-lux-500/30 hover:-translate-y-1"
            >
              Đặt phòng ngay <ArrowRight size={20} />
            </button>
            <button
              onClick={() => setIsVideoOpen(true)}
              className="px-8 py-4 bg-white/10 border border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/20 transition-all backdrop-blur-md flex items-center justify-center gap-2"
            >
              <Video size={20} />
              Xem Review
            </button>
          </div>
        </div>
      </header>

      {/* Intro/Features */}
      <section id="about" className="py-24 bg-white relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border border-lux-50 z-10">
          <Moon size={40} className="text-lux-900" fill="#D4AF37" />
        </div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl font-serif font-bold text-lux-900 mb-4">
              Trải nghiệm khác biệt
            </h2>
            <p className="text-lux-600">
              Chúng tôi không chỉ cung cấp chỗ nghỉ, chúng tôi mang đến một
              phong cách sống. Từ kiến trúc độc đáo đến dịch vụ tận tâm.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Moon,
                title: "View Ngắm Trăng",
                desc: "Ban công rộng với tầm nhìn hướng biển, tối ưu cho những đêm trăng lãng mạn.",
                link: "/rooms",
              },
              {
                icon: Coffee,
                title: "Ẩm Thực Tinh Tế",
                desc: "Thưởng thức tinh hoa ẩm thực Á - Âu tại nhà hàng Moonlight trên tầng thượng.",
                link: "/menu",
              },
              {
                icon: Wifi,
                title: "Tiện Nghi Hiện Đại",
                desc: "Smart TV, Wifi tốc độ cao và hệ thống điều khiển phòng thông minh 1 chạm.",
                link: "/services",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                onClick={() => navigate(feature.link)}
                className="group p-8 rounded-3xl bg-lux-50 border border-lux-100 hover:bg-white hover:shadow-xl hover:shadow-lux-200/50 transition-all duration-300 cursor-pointer"
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-lux-900 shadow-sm mb-6 group-hover:scale-110 transition-transform border border-lux-100">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-serif font-bold text-lux-900 mb-3 flex items-center gap-2">
                  {feature.title}{" "}
                  <ArrowRight
                    size={16}
                    className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-lux-500"
                  />
                </h3>
                <p className="text-lux-600 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Room Showcase - Dynamic from API */}
      <section id="rooms" className="py-24 bg-lux-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <span className="text-lux-500 font-bold tracking-widest uppercase text-sm">
                Bộ sưu tập nổi bật
              </span>
              <h2 className="text-4xl font-serif font-bold text-lux-900 mt-2">
                Nghỉ dưỡng đẳng cấp
              </h2>
            </div>
            <button
              onClick={() => navigate("/rooms")}
              className="flex items-center gap-2 text-lux-900 font-bold hover:text-lux-600 transition-colors"
            >
              Xem tất cả <ArrowRight size={18} />
            </button>
          </div>

          {loadingRooms ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-lux-500" size={40} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredRooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-lux-200/50 transition-all duration-500 group border border-lux-100 flex flex-col h-full"
                >
                  <div
                    className="relative overflow-hidden h-64 cursor-pointer"
                    onClick={() => navigate(`/room/${room.id}`)}
                  >
                    <img
                      src={
                        room.thumbnailImage ||
                        room.images[0] ||
                        "https://via.placeholder.com/400x300"
                      }
                      alt={room.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-lux-900 shadow-sm">
                      {room.typeDisplay || room.type}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3
                        className="text-xl font-serif font-bold text-lux-900 group-hover:text-lux-500 transition-colors cursor-pointer"
                        onClick={() => navigate(`/room/${room.id}`)}
                      >
                        {room.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 mb-4">
                      <Star
                        size={14}
                        className="text-yellow-400 fill-yellow-400"
                      />
                      <span className="text-sm font-bold text-lux-800">
                        {room.averageRating || 5.0}
                      </span>
                      <span className="text-xs text-lux-400">
                        ({room.totalReviews || 0} đánh giá)
                      </span>
                    </div>
                    <p className="text-lux-500 text-sm line-clamp-2 mb-4 flex-1">
                      {room.description}
                    </p>
                    <div className="pt-4 border-t border-lux-50 flex items-center justify-between mt-auto">
                      <div>
                        <span className="text-lg font-bold text-lux-900">
                          {room.pricePerNight.toLocaleString()}
                          <span className="font-bold font-mono text-indigo-600 ml-1 text-sm">
                            VND
                          </span>
                        </span>
                        <span className="text-xs text-lux-400">/đêm</span>
                      </div>
                      <button
                        onClick={() => navigate(`/room/${room.id}`)}
                        className="w-10 h-10 rounded-full bg-lux-50 flex items-center justify-center text-lux-900 hover:bg-lux-900 hover:text-white transition-all"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Reviews Slider Section */}
      <section id="reviews" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-lux-900 mb-4">
              Khách hàng nói gì?
            </h2>
            <div className="flex justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={20}
                  className="text-yellow-400 fill-yellow-400"
                />
              ))}
            </div>
            <p className="text-lux-600">
              Được đánh giá 4.9/5 trên TripAdvisor và Booking.com
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{
                  transform: `translateX(-${currentReviewIndex * 100}%)`,
                }}
              >
                {REVIEWS_DATA.map((review) => (
                  <div key={review.id} className="w-full flex-shrink-0 px-4">
                    <div className="bg-lux-50 p-10 md:p-14 rounded-[3rem] text-center border border-lux-100 relative mx-auto max-w-3xl">
                      <div className="absolute top-8 left-8 text-lux-200">
                        <Quote size={64} fill="currentColor" />
                      </div>

                      <div className="relative z-10">
                        <p className="text-xl md:text-2xl font-serif text-lux-800 italic mb-8 leading-relaxed">
                          "{review.comment}"
                        </p>

                        <div className="flex flex-col items-center">
                          <div className="w-20 h-20 rounded-full p-1 bg-white border border-lux-200 mb-4 shadow-sm">
                            <img
                              src={review.userAvatar}
                              alt={review.userFullName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          </div>
                          <h4 className="font-bold text-lux-900 text-lg">
                            {review.userFullName}
                          </h4>
                          <p className="text-sm text-lux-500 mb-2">
                            {review.roomName}
                          </p>
                          <div className="flex gap-1">
                            {Array.from({ length: review.rating }).map(
                              (_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className="text-yellow-400 fill-yellow-400"
                                />
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={prevReview}
              className="absolute top-1/2 -translate-y-1/2 left-0 md:-left-12 p-3 rounded-full bg-white border border-lux-100 text-lux-900 shadow-lg hover:bg-lux-900 hover:text-white transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextReview}
              className="absolute top-1/2 -translate-y-1/2 right-0 md:-right-12 p-3 rounded-full bg-white border border-lux-100 text-lux-900 shadow-lg hover:bg-lux-900 hover:text-white transition-all"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-lux-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-lux-800 skew-x-12 translate-x-20 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-lux-500 rounded-full blur-[100px] opacity-20"></div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            Sẵn sàng cho kỳ nghỉ trong mơ?
          </h2>
          <p className="text-lux-200 text-lg mb-10">
            Đăng ký thành viên ngay hôm nay để nhận ưu đãi lên đến 20% cho lần
            đặt phòng đầu tiên.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="px-10 py-4 bg-lux-500 text-lux-900 font-bold text-lg rounded-full hover:bg-lux-400 transition-colors shadow-xl shadow-lux-500/20"
          >
            Đăng ký ngay
          </button>
        </div>
      </section>
    </div>
  );
};
