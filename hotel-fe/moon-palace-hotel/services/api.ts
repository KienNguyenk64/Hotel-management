import axios from "axios";
import {
  ApiResponse,
  Page,
  RoomStatus,
  User,
  Booking,
  CreateBookingRequest,
  BookingSearchCriteria,
  BookingStats,
  AdminDashboardData,
  DashboardFilterRequest,
  UserDashboardData,
  PublicStats,
  ChatSession,
  UserFilterParams,
  ResetPasswordRequest,
  CreateGroupBookingRequest,
  PaymentMethod,
  DailyReport,
  MonthlyReport,
  ServiceCharge,
  RoomType,
  RoomResponse,
  RoomSearchRequest,
  RoomStatistics,
  CreateReviewRequest,
  ReviewResponse,
  CreateReplyRequest,
  ReviewFilterParams,
  CreateRoomRequest,
  UpdateRoomRequest,
} from "../types";

const api = axios.create({
  // baseURL: 'https://api.moonelia.site/api',
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("lux_token");

    const NO_TOKEN_PATHS = [
      "/auth/login",
      "/auth/register",
      "/auth/user/login",
      "/auth/userlogin",
      "/auth/logout",
      "/auth/forgot-password",
      "/bookings/check-availability",
      "/bookings/room/",
      "/rooms/featured",
      "/rooms/available",
      "/rooms/search",
      "/rooms/type/",
      "/rooms/floor/",
      "/rooms/price-range",
      "/rooms/occupancy/",
      "/rooms/room-number/",
      "/rooms/check-availability/",
      "/dashboard/public",
    ];

    // Dùng exact match hoặc startsWith thay vì includes để tránh /rooms match /rooms/admin
    const isNoTokenPath =
      NO_TOKEN_PATHS.some((path) => config.url?.includes(path)) ||
      /^\/rooms\/[^a][^d]/.test(config.url || "") || // match /rooms/:id (public)
      config.url === "/rooms" || // exact match GET all rooms (public)
      /^\/rooms\?/.test(config.url || ""); // match /rooms?page=...

    if (
      isNoTokenPath ||
      !token ||
      token === "null" ||
      token === "undefined" ||
      token.trim() === ""
    ) {
      delete config.headers.Authorization;
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.warn("401 Unauthorized - likely expired token");
      return Promise.reject(error);
    }

    if (status === 403) {
      localStorage.removeItem("lux_token");
      localStorage.removeItem("lux_user");

      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;

// ==================== AUTH API ====================
export const authApi = {
  login: (data: any) => api.post("/auth/login", data),
  register: (data: any) => api.post("/auth/register", data),
  loginWithGoogle: (data: { token: string; provider: string; code?: string }) =>
    api.post("/auth/login/google", data),
  loginWithFacebook: (data: {
    token: string;
    provider: string;
    code?: string;
  }) => api.post("/auth/login/facebook", data),
  loginWithGitHub: (data: { token: string; provider: string; code?: string }) =>
    api.post("/auth/login/github", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
  forgotPassword: (email: string) =>
    api.post(`/auth/forgot-password?email=${email}`),
  changePassword: (data: any) => api.post("/auth/change-password", data),
  refreshToken: (refreshToken: string) =>
    api.post("/auth/refresh", null, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    }),
  resetPassword: (criteria: ResetPasswordRequest) =>
    api.post("/auth/reset-password", criteria),
  verifyEmail: (token: string) => api.get(`/auth/verify-email?token=${token}`),
  sendVerificationEmail: (email: string) =>
    api.post(`/auth/send-verification-email?email=${email}`),
};

// ==================== ROOM API (PUBLIC) ====================
export const roomApi = {
  // Public endpoints - không cần authentication
  getAll: (
    page = 0,
    size = 10,
    sortBy = "createdDate",
    sortOrder = "desc",
    includeReviews = false,
  ) =>
    api.get<ApiResponse<Page<RoomResponse>>>(
      `/rooms?page=${page}&size=${size}&sortBy=${sortBy}&sortOrder=${sortOrder}&includeReviews=${includeReviews}`,
    ),

  getById: (id: string) => api.get<ApiResponse<RoomResponse>>(`/rooms/${id}`),

  getByNumber: (roomNumber: string) =>
    api.get<ApiResponse<RoomResponse>>(`/rooms/room-number/${roomNumber}`),

  search: (criteria: RoomSearchRequest) =>
    api.post<ApiResponse<Page<RoomResponse>>>("/rooms/search", criteria),

  getFeatured: () => api.get<ApiResponse<RoomResponse[]>>("/rooms/featured"),

  getAvailable: () => api.get<ApiResponse<RoomResponse[]>>("/rooms/available"),

  getByType: (type: RoomType) =>
    api.get<ApiResponse<RoomResponse[]>>(`/rooms/type/${type}`),

  getByFloor: (floor: number) =>
    api.get<ApiResponse<RoomResponse[]>>(`/rooms/floor/${floor}`),

  getByPriceRange: (minPrice: number, maxPrice: number) =>
    api.get<ApiResponse<RoomResponse[]>>(
      `/rooms/price-range?minPrice=${minPrice}&maxPrice=${maxPrice}`,
    ),

  getByOccupancy: (minOccupancy: number) =>
    api.get<ApiResponse<RoomResponse[]>>(`/rooms/occupancy/${minOccupancy}`),

  checkAvailability: (id: string) =>
    api.get<ApiResponse<boolean>>(`/rooms/check-availability/${id}`),
};

// ==================== ADMIN ROOM API ====================

export const adminRoomApi = {
  // CRUD Operations with FormData
  create: (data: CreateRoomRequest) => {
    const formData = new FormData();

    formData.append("roomNumber", data.roomNumber);
    formData.append("name", data.name);
    formData.append("type", data.type);
    formData.append("size", String(data.size));
    formData.append("floor", String(data.floor));
    formData.append("pricePerNight", String(data.pricePerNight));
    formData.append("maxOccupancy", String(data.maxOccupancy));
    formData.append("bedType", data.bedType);
    formData.append("bedCount", String(data.bedCount));
    formData.append("description", data.description);

    data.amenities.forEach((a) => {
      formData.append("amenities", a);
    });

    data.imageFiles.forEach((file) => {
      formData.append("imageFiles", file);
    });

    if (data.thumbnailImage) {
      formData.append("thumbnailImage", data.thumbnailImage);
    }

    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    return api.post("/rooms/admin", formData, {
      headers: { "Content-Type": undefined },
    });
  },

  update: (id: string, data: UpdateRoomRequest) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "images") {
        (value as File[]).forEach((file) => formData.append("images", file));
      } else if (key === "amenities") {
        (value as string[]).forEach((item) =>
          formData.append("amenities", item),
        );
      } else if (key === "keepImageUrls") {
        (value as string[]).forEach((url) =>
          formData.append("keepImageUrls", url),
        );
      } else if (key === "thumbnailImage") {
        formData.append("thumbnailImage", value as File);
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    return api.put<ApiResponse<RoomResponse>>(`/rooms/admin/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  delete: (id: string) => api.delete<ApiResponse<null>>(`/rooms/admin/${id}`),

  // Status Management
  updateStatus: (id: string, status: RoomStatus) =>
    api.patch<ApiResponse<RoomResponse>>(
      `/rooms/admin/${id}/status?status=${status}`,
    ),

  markAsAvailable: (id: string) =>
    api.patch<ApiResponse<RoomResponse>>(`/rooms/admin/${id}/available`),

  markAsOccupied: (id: string) =>
    api.patch<ApiResponse<RoomResponse>>(`/rooms/admin/${id}/occupied`),

  markAsMaintenance: (id: string) =>
    api.patch<ApiResponse<RoomResponse>>(`/rooms/admin/${id}/maintenance`),

  markAsCleaning: (id: string) =>
    api.patch<ApiResponse<RoomResponse>>(`/rooms/admin/${id}/cleaning`),

  // Toggle Features
  toggleFeatured: (id: string) =>
    api.patch<ApiResponse<RoomResponse>>(`/rooms/admin/${id}/toggle-featured`),

  toggleActive: (id: string) =>
    api.patch<ApiResponse<RoomResponse>>(`/rooms/admin/${id}/toggle-active`),

  // Images Management - Updated to use files instead of URLs
  addImages: (id: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    return api.post<ApiResponse<RoomResponse>>(
      `/rooms/admin/${id}/images`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
  },

  removeImage: (id: string, imageUrl: string) =>
    api.delete<ApiResponse<RoomResponse>>(
      `/rooms/admin/${id}/images?imageUrl=${encodeURIComponent(imageUrl)}`,
    ),

  setThumbnail: (id: string, imageUrl: string) =>
    api.patch<ApiResponse<RoomResponse>>(
      `/rooms/admin/${id}/thumbnail?imageUrl=${encodeURIComponent(imageUrl)}`,
    ),

  addAmenities: (id: string, amenities: string[]) =>
    api.post<ApiResponse<RoomResponse>>(
      `/rooms/admin/${id}/amenities`,
      amenities,
    ),

  removeAmenity: (id: string, amenity: string) =>
    api.delete<ApiResponse<RoomResponse>>(
      `/rooms/admin/${id}/amenities?amenity=${encodeURIComponent(amenity)}`,
    ),

  updatePrice: (id: string, price: number) =>
    api.patch<ApiResponse<RoomResponse>>(
      `/rooms/admin/${id}/price?price=${price}`,
    ),

  getStatistics: () =>
    api.get<ApiResponse<RoomStatistics>>("/rooms/admin/statistics"),

  getByStatus: (status: RoomStatus) =>
    api.get<ApiResponse<RoomResponse[]>>(`/rooms/admin/status/${status}`),

  countByStatus: (status: RoomStatus) =>
    api.get<ApiResponse<number>>(`/rooms/admin/count/status/${status}`),

  countByType: (type: RoomType) =>
    api.get<ApiResponse<number>>(`/rooms/admin/count/type/${type}`),

  getAveragePrice: () =>
    api.get<ApiResponse<number>>("/rooms/admin/average-price"),
};

// ==================== REVIEW API ====================
export const reviewApi = {
  getById: (reviewId: string) =>
    api.get<ApiResponse<ReviewResponse>>(`/reviews/${reviewId}`),

  create: (data: CreateReviewRequest) =>
    api.post<ApiResponse<ReviewResponse>>("/reviews", data),

  update: (id: string, comment: string) =>
    api.put<ApiResponse<ReviewResponse>>(
      `/reviews/${id}/update?comment=${encodeURIComponent(comment)}`,
    ),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/reviews/${id}/delete`),

  createReply: (reviewId: string, data: CreateReplyRequest) =>
    api.post<ApiResponse<ReviewResponse>>(`/reviews/${reviewId}/reply`, data),

  updateReply: (replyId: string, content: string) =>
    api.put<ApiResponse<ReviewResponse>>(
      `/reviews/${replyId}/update-reply?content=${encodeURIComponent(content)}`,
    ),

  deleteReply: (replyId: string) =>
    api.delete<ApiResponse<null>>(`/reviews/${replyId}/delete-reply`),

  // Admin endpoints
  updateStatus: (id: string, status: string) =>
    api.put<ApiResponse<ReviewResponse>>(
      `/reviews/update-status/${id}?status=${status}`,
    ),
};

// ==================== BOOKING API ====================
export const bookingApi = {
  // --- USER ENDPOINTS ---
  create: (data: CreateBookingRequest) =>
    api.post<ApiResponse<Booking>>("/bookings", data),

  createGroup: (data: CreateGroupBookingRequest) =>
    api.post<ApiResponse<Booking[]>>("/bookings/group", data),

  getById: (id: string) => api.get<ApiResponse<Booking>>(`/bookings/${id}`),

  getByNumber: (bookingNumber: string) =>
    api.get<ApiResponse<Booking>>(`/bookings/number/${bookingNumber}`),

  cancel: (id: string, reason: string) =>
    api.post<ApiResponse<Booking>>(`/bookings/${id}/cancel`, {
      cancellationReason: reason,
    }),

  update: (id: string, data: Partial<Booking>) =>
    api.put<ApiResponse<Booking>>(`/bookings/${id}`, data),

  getMyBookings: (
    page = 0,
    size = 10,
    sortBy = "createdDate",
    sortOrder = "desc",
  ) =>
    api.get<ApiResponse<Page<Booking>>>(
      `/bookings/my-bookings?page=${page}&size=${size}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
    ),

  getUpcoming: () =>
    api.get<ApiResponse<Booking[]>>("/bookings/my-bookings/upcoming"),

  getHistory: () =>
    api.get<ApiResponse<Booking[]>>("/bookings/my-bookings/history"),

  checkAvailability: (data: {
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
  }) => api.post<ApiResponse<boolean>>("/bookings/check-availability", data),

  getUnavailableDates: (roomId: string, startDate: string, endDate: string) =>
    api.get<ApiResponse<string[]>>(
      `/bookings/room/${roomId}/unavailable-dates?startDate=${startDate}&endDate=${endDate}`,
    ),

  payDeposit: (id: string, method: PaymentMethod, transactionId?: string) =>
    api.post<ApiResponse<any>>(`/bookings/${id}/deposit`, {
      paymentMethod: method,
      paymentTransactionId: transactionId,
    }),

  payRemaining: (id: string, method: PaymentMethod, transactionId?: string) =>
    api.post<ApiResponse<any>>(`/bookings/${id}/payment`, {
      paymentMethod: method,
      paymentTransactionId: transactionId,
    }),

  // --- ADMIN ENDPOINTS ---
  search: (criteria: BookingSearchCriteria) =>
    api.post<ApiResponse<Page<Booking>>>("/bookings/admin/search", criteria),

  searchByCCCD: (cccd: string) =>
    api.get<ApiResponse<Booking[]>>(`/bookings/admin/cccd/${cccd}`),

  getGroupBookings: (groupBookingId: string) =>
    api.get<ApiResponse<Booking[]>>(`/bookings/admin/group/${groupBookingId}`),

  getByStatus: (status: string) =>
    api.get<ApiResponse<Booking[]>>(`/bookings/admin/status/${status}`),

  confirm: (id: string) =>
    api.patch<ApiResponse<Booking>>(`/bookings/admin/${id}/confirm`),

  checkIn: (id: string, data?: any) =>
    api.patch<ApiResponse<Booking>>(`/bookings/admin/${id}/check-in`, data),

  checkOut: (id: string) =>
    api.patch<ApiResponse<Booking>>(`/bookings/admin/${id}/check-out`),

  approveEarlyCheckIn: (id: string, fee: number) =>
    api.patch<ApiResponse<Booking>>(
      `/bookings/admin/${id}/approve-early-checkin?fee=${fee}`,
    ),

  approveLateCheckOut: (id: string, fee: number) =>
    api.patch<ApiResponse<Booking>>(
      `/bookings/admin/${id}/approve-late-checkout?fee=${fee}`,
    ),

  applyDiscount: (id: string, discountAmount: number) =>
    api.patch<ApiResponse<Booking>>(
      `/bookings/admin/${id}/discount?discountAmount=${discountAmount}`,
    ),

  addAdminNotes: (id: string, notes: string) =>
    api.patch<ApiResponse<Booking>>(
      `/bookings/admin/${id}/notes?notes=${encodeURIComponent(notes)}`,
    ),

  markNoShow: (id: string) =>
    api.patch<ApiResponse<Booking>>(`/bookings/admin/${id}/no-show`),

  complete: (id: string) =>
    api.patch<ApiResponse<Booking>>(`/bookings/admin/${id}/complete`),

  refund: (id: string) =>
    api.post<ApiResponse<any>>(`/bookings/admin/${id}/refund`),

  // Service Charges
  addServiceCharge: (id: string, charge: Partial<ServiceCharge>) =>
    api.post<ApiResponse<Booking>>(
      `/bookings/admin/${id}/service-charges`,
      charge,
    ),

  getServiceCharges: (id: string) =>
    api.get<ApiResponse<ServiceCharge[]>>(
      `/bookings/admin/${id}/service-charges`,
    ),

  removeServiceCharge: (id: string, chargeIndex: number) =>
    api.delete<ApiResponse<any>>(
      `/bookings/admin/${id}/service-charges/${chargeIndex}`,
    ),

  // Housekeeping
  getNeedsCleaning: () =>
    api.get<ApiResponse<any[]>>("/bookings/admin/housekeeping/needs-cleaning"),

  markCleaned: (id: string) =>
    api.patch<ApiResponse<any>>(`/bookings/admin/${id}/mark-cleaned`),

  // Stats & Reports
  getStatistics: () =>
    api.get<ApiResponse<BookingStats>>("/bookings/admin/statistics"),

  getTodayCheckIns: () =>
    api.get<ApiResponse<Booking[]>>("/bookings/admin/today/check-ins"),

  getTodayCheckOuts: () =>
    api.get<ApiResponse<Booking[]>>("/bookings/admin/today/check-outs"),

  getTotalRevenue: () =>
    api.get<ApiResponse<number>>("/bookings/admin/revenue/total"),

  getRevenueByRange: (startDate: string, endDate: string) =>
    api.get<ApiResponse<any>>(
      `/bookings/admin/revenue/range?startDate=${startDate}&endDate=${endDate}`,
    ),

  getBookingsBySource: () =>
    api.get<ApiResponse<Record<string, number>>>(
      "/bookings/admin/bookings-by-source",
    ),

  getOccupancyRate: (startDate: string, endDate: string) =>
    api.get<ApiResponse<number>>(
      `/bookings/admin/occupancy-rate?startDate=${startDate}&endDate=${endDate}`,
    ),

  getDailyReport: (date: string) =>
    api.get<ApiResponse<DailyReport>>(
      `/bookings/admin/reports/daily?date=${date}`,
    ),

  getMonthlyReport: (year: number, month: number) =>
    api.get<ApiResponse<MonthlyReport>>(
      `/bookings/admin/reports/monthly?year=${year}&month=${month}`,
    ),

  // Emails
  sendConfirmationEmail: (id: string) =>
    api.post<ApiResponse<any>>(`/bookings/admin/${id}/send-confirmation`),

  sendReminderEmail: (id: string) =>
    api.post<ApiResponse<any>>(`/bookings/admin/${id}/send-reminder`),

  sendBulkReminders: () =>
    api.post<ApiResponse<any>>("/bookings/admin/send-bulk-reminders"),
};

// ==================== USER API ====================
export const userApi = {
  getProfile: () => api.get<ApiResponse<User>>("/users/me"),

  updateProfile: (data: Partial<User>) =>
    api.put<ApiResponse<User>>("/users/update-profile", data),

  // Updated avatar methods to use FormData
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.put<ApiResponse<User>>("/users/upload-avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deleteAvatar: () => api.delete<ApiResponse<User>>("/users/delete-avatar"),
};

// ==================== ADMIN USER API ====================
export const adminUserApi = {
  getUsers: (params: UserFilterParams) => {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined)
      queryParams.append("page", params.page.toString());
    if (params.size !== undefined)
      queryParams.append("size", params.size.toString());
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
    if (params.keyword) queryParams.append("keyword", params.keyword);
    if (params.role) queryParams.append("role", params.role);
    if (params.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());
    if (params.isLocked !== undefined)
      queryParams.append("isLocked", params.isLocked.toString());

    return api.get<ApiResponse<Page<User>>>(
      `/users/admin?${queryParams.toString()}`,
    );
  },

  getById: (id: string) => api.get<ApiResponse<User>>(`/users/admin/${id}`),

  addUser: (data: Partial<User> & { password?: string }) =>
    api.post<ApiResponse<User>>("/users/admin", data),

  updateById: (id: string, data: Partial<User>) =>
    api.put<ApiResponse<User>>(`/users/admin/${id}`, data),

  deactivate: (id: string) =>
    api.delete<ApiResponse<User>>(`/users/admin/${id}/deactivate`),

  activate: (id: string) =>
    api.put<ApiResponse<User>>(`/users/admin/${id}/activate`),

  lock: (id: string) => api.put<ApiResponse<User>>(`/users/admin/${id}/lock`),

  unlock: (id: string) =>
    api.put<ApiResponse<User>>(`/users/admin/${id}/unlock`),
};

// ==================== DASHBOARD API ====================
export const dashboardApi = {
  getAdminDashboard: () =>
    api.get<ApiResponse<AdminDashboardData>>("/dashboard/admin"),

  getAdminDashboardFiltered: (filter: DashboardFilterRequest) =>
    api.post<ApiResponse<AdminDashboardData>>(
      "/dashboard/admin/filter",
      filter,
    ),

  getOverviewStats: () =>
    api.get<ApiResponse<any>>("/dashboard/admin/overview"),

  getBookingStats: (params?: { startDate?: string; endDate?: string }) =>
    api.get<ApiResponse<any>>("/dashboard/admin/stats/bookings", { params }),

  getRoomStats: () => api.get<ApiResponse<any>>("/dashboard/admin/stats/rooms"),

  getRevenueStats: (params?: { startDate?: string; endDate?: string }) =>
    api.get<ApiResponse<any>>("/dashboard/admin/stats/revenue", { params }),

  getRecentBookings: (limit = 10) =>
    api.get<ApiResponse<any>>(
      `/dashboard/admin/recent-bookings?limit=${limit}`,
    ),

  getTodayActivities: () =>
    api.get<ApiResponse<any>>("/dashboard/admin/today-activities"),

  getRevenueChart: (params: {
    startDate: string;
    endDate: string;
    groupBy?: string;
  }) =>
    api.get<ApiResponse<any>>("/dashboard/admin/charts/revenue", { params }),

  getBookingTrendChart: (params: {
    startDate: string;
    endDate: string;
    groupBy?: string;
  }) =>
    api.get<ApiResponse<any>>("/dashboard/admin/charts/booking-trend", {
      params,
    }),

  getRoomOccupancyChart: (params: { startDate: string; endDate: string }) =>
    api.get<ApiResponse<any>>("/dashboard/admin/charts/room-occupancy", {
      params,
    }),

  getUserDashboard: () =>
    api.get<ApiResponse<UserDashboardData>>("/dashboard/user"),

  getUserStats: () => api.get<ApiResponse<any>>("/dashboard/user/stats"),

  getPublicStats: () =>
    api.get<ApiResponse<PublicStats>>("/dashboard/public/stats"),
};

// ==================== CHATBOT API ====================
export const chatbotApi = {
  startSession: (userId?: string, userName?: string) =>
    api.post<ApiResponse<ChatSession>>(
      `/chatbot/start?userId=${userId || ""}&userName=${userName || ""}`,
    ),

  sendMessage: (data: {
    message: string;
    sessionId: string;
    userId?: string;
    context?: string;
  }) =>
    api.post<
      ApiResponse<{
        sessionId: string;
        message: string;
        messageType: string;
        quickReplies: any[];
        cards: any[];
      }>
    >("/chatbot/chat", data),

  getConversationHistory: (sessionId: string) =>
    api.get<ApiResponse<ChatSession>>(`/chatbot/conversation/${sessionId}`),

  endSession: (sessionId: string) =>
    api.post<ApiResponse<null>>(`/chatbot/end/${sessionId}`),

  submitFeedback: (data: {
    sessionId: string;
    rating: number;
    feedback?: string;
    wasHelpful?: boolean;
  }) => api.post<ApiResponse<null>>("/chatbot/feedback", data),
};

// ==================== PAYMENT API ====================
export const paymentApi = {
  processPayment: (data: {
    bookingId: string;
    amount: number;
    method: string;
  }) => api.post<ApiResponse<any>>("/payments/process", data),

  createVnPayUrl: (data: { bookingId: string }) => 
    api.post<ApiResponse<{ vnpayUrl: string }>>("/payments/vnpay/create-url", data),

  simulatePayment: (bookingId: string) =>
    new Promise<ApiResponse<any>>((resolve) => {
      setTimeout(() => {
        resolve({
          status: "success",
          message: "Payment processed successfully",
          data: { transactionId: "TXN-" + Date.now(), bookingId },
        });
      }, 2000);
    }),
};
