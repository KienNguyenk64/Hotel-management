export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  STAFF = 'STAFF'
}

export interface UserPreferences {
  roomTemperature?: string;
  pillowType?: 'Soft' | 'Firm' | 'Feather' | 'Hypoallergenic';
  floorPreference?: 'Low' | 'High' | 'Ground';
  dietaryRestrictions?: string;
  specialRequests?: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  username: string;
  phoneNumber: string;
  role: Role;
  address: string;
  cccdNumber?: string;
  isLocked?: boolean;
  isActive?: boolean;
  avatarUrl?: string;
  createdDate?: string; 
  preferences?: UserPreferences;
}

export interface UserFilterParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  keyword?: string;
  role?: string;
  isActive?: boolean;
  isLocked?: boolean;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// --- Room Management Types ---

export enum RoomType {
  STANDARD = 'STANDARD',
  SUPERIOR = 'SUPERIOR',
  DELUXE = 'DELUXE',
  SUITE = 'SUITE',
  EXECUTIVE = 'EXECUTIVE',
  PRESIDENTIAL = 'PRESIDENTIAL',
  FAMILY = 'FAMILY',
  HONEYMOON = 'HONEYMOON'
}

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  MAINTENANCE = 'MAINTENANCE',
  CLEANING = 'CLEANING',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE'
}

export enum RoomView {
  CITY = 'CITY',
  SEA = 'SEA',
  GARDEN = 'GARDEN',
  POOL = 'POOL',
  MOUNTAIN = 'MOUNTAIN',
  COURTYARD = 'COURTYARD',
  NO_VIEW = 'NO_VIEW'
}

export enum BedType {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
  QUEEN = 'QUEEN',
  KING = 'KING',
  TWIN = 'TWIN',
  BUNK = 'BUNK'
}

export const RoomTypeDisplay: Record<RoomType, string> = {
  [RoomType.STANDARD]: 'Phòng tiêu chuẩn',
  [RoomType.SUPERIOR]: 'Phòng cao cấp',
  [RoomType.DELUXE]: 'Phòng sang trọng',
  [RoomType.SUITE]: 'Phòng Suite',
  [RoomType.EXECUTIVE]: 'Phòng điều hành',
  [RoomType.PRESIDENTIAL]: 'Phòng Tổng thống',
  [RoomType.FAMILY]: 'Phòng gia đình',
  [RoomType.HONEYMOON]: 'Phòng tân hôn'
};

export const RoomStatusDisplay: Record<RoomStatus, string> = {
  [RoomStatus.AVAILABLE]: 'Còn trống',
  [RoomStatus.OCCUPIED]: 'Đang có khách',
  [RoomStatus.RESERVED]: 'Đã đặt trước',
  [RoomStatus.MAINTENANCE]: 'Đang bảo trì',
  [RoomStatus.CLEANING]: 'Đang dọn dẹp',
  [RoomStatus.OUT_OF_SERVICE]: 'Ngừng hoạt động'
};



export const RoomViewDisplay: Record<RoomView, string> = {
  [RoomView.CITY]: 'View thành phố',
  [RoomView.SEA]: 'View biển',
  [RoomView.GARDEN]: 'View vườn',
  [RoomView.POOL]: 'View hồ bơi',
  [RoomView.MOUNTAIN]: 'View núi',
  [RoomView.COURTYARD]: 'View sân trong',
  [RoomView.NO_VIEW]: 'Không có view'
};

export const BedTypeDisplay: Record<BedType, string> = {
  [BedType.SINGLE]: 'Giường đơn',
  [BedType.DOUBLE]: 'Giường đôi',
  [BedType.QUEEN]: 'Giường Queen',
  [BedType.KING]: 'Giường King',
  [BedType.TWIN]: '2 giường đơn',
  [BedType.BUNK]: 'Giường tầng'
};

export interface Room {
  id: string;
  roomNumber: string;
  name: string;
  type: RoomType;
  description: string;
  pricePerNight: number;
  size: number;
  bedCount: number;
  bedType: BedType;
  maxOccupancy: number;
  floor: number;
  view: RoomView;
  amenities: string[];
  images: string[];
  thumbnailImage: string;
  status: RoomStatus;
  isActive: boolean;
  isFeatured: boolean;
  allowSmoking: boolean;
  hasBathroom: boolean;
  hasBalcony: boolean;
  hasKitchen: boolean;
  
  reviewIds: string[];
  averageRating?: number;
  totalReviews?: number;
  
  totalBookings?: number;
  lastBookedDate?: string;
  
  createdDate?: string;
  updatedDate?: string;
  createdBy?: string;
  notes?: string;
}

// Room Response 
export interface RoomResponse {
  id: string;
  roomNumber: string;
  name: string;
  type: RoomType;
  typeDisplay?: string;
  description: string;
  pricePerNight: number;
  size: number;
  bedCount: number;
  bedType: BedType;
  bedTypeDisplay?: string;
  maxOccupancy: number;
  floor: number;
  view: RoomView;
  viewDisplay?: string;
  amenities: string[];
  images: string[];
  thumbnailImage: string;
  status: RoomStatus;
  statusDisplay?: string;
  isActive: boolean;
  isFeatured: boolean;
  allowSmoking: boolean;
  hasBathroom: boolean;
  hasBalcony: boolean;
  hasKitchen: boolean;
  
  reviewIds?: string[];
  reviews?: ReviewResponse[];
  averageRating?: number;
  totalReviews?: number;
  
  totalBookings?: number;
  lastBookedDate?: string;
  
  createdDate?: string;
  updatedDate?: string;
  notes?: string;
}





export interface RoomSearchRequest {
  type?: RoomType;
  status?: RoomStatus;
  view?: RoomView;
  minPrice?: number;
  maxPrice?: number;
  minOccupancy?: number;
  floor?: number;
  isFeatured?: boolean;
  allowSmoking?: boolean;
  hasBalcony?: boolean;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

export interface SearchRoomCriteria {
  type?: RoomType;
  status?: RoomStatus;
  view?: RoomView;
  minPrice?: number;
  maxPrice?: number;
  minOccupancy?: number;
  floor?: number;
  isFeatured?: boolean;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  size?: number;
  
  checkInDate?: string;
  checkOutDate?: string;
  adults?: number;
  children?: number;
  roomTypes?: RoomType[];
  amenities?: string[];
}

export interface RoomTypeStats {
  type: RoomType;
  count: number;
  available: number;
  averagePrice: number;
}

export interface RoomStatistics {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  maintenanceRooms: number;
  cleaningRooms: number;
  
  averagePrice: number;
  highestPrice: number;
  lowestPrice: number;
  
  totalRevenue: number;
  averageRating: number;
  
  totalBookings: number;
  
  roomTypeStats: RoomTypeStats[];
}

export interface CreateRoomRequest {
  roomNumber: string;
  name: string;
  type: RoomType;
  description: string;
  pricePerNight: number;
  size: number;
  bedCount: number;
  bedType: string;
  maxOccupancy: number;
  floor: number;
  view?: string;
  amenities: string[];
  allowSmoking?: boolean;
  hasBathroom: boolean;
  hasBalcony?: boolean;
  hasKitchen?: boolean;
  notes?: string;
  imageFiles: File[]; 
  thumbnailImage?: File; 
}

export interface UpdateRoomRequest {
  name?: string;
  description?: string;
  floor?: number;
  pricePerNight?: number;
  view?: string;
  amenities?: string[];
  allowSmoking?: boolean;
  hasBalcony?: boolean;
  hasKitchen?: boolean;
  isFeatured?: boolean;
  notes?: string;
  images?: File[];
  thumbnailImage?: File;
  keepImageUrls?: string[]; // URL ảnh cũ muốn giữ lại khi edit
}

export const getRoomTypeDisplay = (type: RoomType): string => {
  return RoomTypeDisplay[type] || type;
};

export const getRoomStatusDisplay = (status: RoomStatus): string => {
  return RoomStatusDisplay[status] || status;
};

export const getRoomViewDisplay = (view: RoomView): string => {
  return RoomViewDisplay[view] || view;
};

export const getBedTypeDisplay = (bedType: BedType): string => {
  return BedTypeDisplay[bedType] || bedType;
};

// --- Booking Management Types ---

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  COMPLETED = 'COMPLETED',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED'
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  E_WALLET = 'E_WALLET',
  PAYPAL = 'PAYPAL',
}


export interface GuestInfo {
  fullName: string;
  phoneNumber?: string;
  email?: string;
  cccdNumber?: string;
  nationality?: string;
  address?: string;
}

export interface ServiceCharge {
  serviceType: string;
  description: string;
  amount: number;
  quantity: number;
  chargeDate: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  bookingCode?: string; // Legacy field
  
  // User info
  userId: string;
  userEmail: string;
  userFullName: string;
  userPhoneNumber: string;
  
  // Room info
  roomId: string;
  roomNumber: string;
  roomName: string;
  room?: Room;
  
  // Guest Info
  primaryGuest: GuestInfo;
  additionalGuests: GuestInfo[];

  // Group Info
  isGroupBooking: boolean;
  groupBookingId?: string;

  // Dates
  checkInDate: string;
  checkOutDate: string;
  actualCheckInTime?: string;
  actualCheckOutTime?: string;
  
  // Guest Counts
  numberOfGuests: number;
  numberOfChildren: number;
  adults?: number; // Legacy alias
  children?: number; // Legacy alias

  // Pricing
  roomPricePerNight: number;
  numberOfNights: number;
  
  subtotal: number;
  taxAmount: number;
  serviceCharge: number;
  discount: number;
  
  // Additional Charges
  additionalCharges: ServiceCharge[];
  additionalChargesTotal: number;

  totalAmount: number;
  totalPrice?: number; // Legacy alias

  // Deposit
  depositAmount: number;
  depositPaid: boolean;
  depositPaidDate?: string;

  // Payment
  paymentStatus: PaymentStatus;
  paymentStatusDisplay?: string;
  paymentMethod?: PaymentMethod;
  paymentTransactionId?: string;
  
  // Status
  status: BookingStatus;
  statusDisplay?: string;
  statusColor?: string;
  
  // Requests & Options
  specialRequests?: string;
  addedServices?: string[];
  isEarlyCheckIn?: boolean;
  earlyCheckInFee?: number;
  isLateCheckOut?: boolean;
  lateCheckOutFee?: number;

  // Cancellation
  cancellationReason?: string;
  cancelledAt?: string;
  
  // Metadata
  bookingSource?: string;
  createdDate: string;
  updatedDate?: string;
  adminNotes?: string;
  
  // Permissions / Computed
  canCancel: boolean;
  canCheckIn: boolean;
  canCheckOut: boolean;
  canReview: boolean;
  daysUntilCheckIn?: number;
  
  // Helper for UI
  guestName?: string; // Legacy helper
  image?: string; // Legacy helper
}

export interface CreateBookingRequest {
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  numberOfChildren: number;
  
  primaryGuest: GuestInfo;
  additionalGuests?: GuestInfo[];
  
  specialRequests?: string;
  addedServices?: string[];
  
  isEarlyCheckIn?: boolean;
  isLateCheckOut?: boolean;
  bookingSource?: string;

  // Legacy fields to maintain compatibility if UI hasn't fully updated
  adults?: number;
  children?: number;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}

export interface CreateGroupBookingRequest {
  roomIds: string[];
  checkInDate: string;
  checkOutDate: string;
  groupName: string;
  groupContactPerson: string;
  groupContactPhone: string;
  groupContactEmail: string;
  roomBookings: {
      roomId: string;
      numberOfGuests: number;
      primaryGuest: GuestInfo;
  }[];
  specialRequests?: string;
}

export interface BookingSearchCriteria {
  userId?: string;
  roomId?: string;
  bookingNumber?: string;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  checkInDateFrom?: string;
  checkInDateTo?: string;
  checkOutDateFrom?: string;
  checkOutDateTo?: string;
  
  keyword?: string;
  checkInFrom?: string; // Legacy alias
  checkInTo?: string; // Legacy alias
  
  minAmount?: number;
  maxAmount?: number;
  bookingSource?: string;
  isGroupBooking?: boolean;
  cccdNumber?: string;

  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

export interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  checkedInBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  
  totalRevenue: number;
  paidRevenue: number;
  unpaidRevenue: number;
  
  todayCheckIns: number;
  todayCheckOuts: number;
  
  averageBookingValue: number;
  cancellationRate: number;
  occupancyRate: number;
}


export interface DailyReport {
    expectedCheckIns: number;
    checkInsList: Booking[];
    expectedCheckOuts: number;
    checkOutsList: Booking[];
    dailyRevenue: number;
    paymentsCount: number;
    occupancyRate: number;
    occupiedRooms: number;
    totalRooms: number;
    roomsNeedingCleaning: number;
}

export interface MonthlyReport {
    totalBookings: number;
    bookingsByStatus: Record<string, number>;
    totalRevenue: number;
    averageBookingValue: number;
    occupancyRate: number;
    cancellationRate: number;
    bookingsBySource: Record<string, number>;
    topRooms: Record<string, number>;
}

// --- Common Types ---

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiResponse<T> {
  status: 'success' | 'fail';
  message: string;
  data: T;
}

// --- Review ---

export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export const ReviewStatusDisplay: Record<ReviewStatus, string> = {
  [ReviewStatus.PENDING]: 'Chờ duyệt',
  [ReviewStatus.APPROVED]: 'Đã duyệt',
  [ReviewStatus.REJECTED]: 'Bị từ chối'
};

export interface Reply {
  id: string;
  reviewId: string;
  userId: string;
  userFullName: string;
  userAvatar?: string;
  userEmail: string;
  userPhoneNumber: string;
  content: string;
  createdDate: string;
}

export interface Review {
  id: string;

  userId: string;
  userFullName: string;
  userAvatar?: string;
  userEmail: string;
  userPhoneNumber: string;

  roomId: string;
  roomNumber: string;
  roomName: string;
  roomType: string;

  rating: number;
  comment: string;

  status: ReviewStatus;
  reviewStatus?: string; 

  createdDate: string;
  updatedDate?: string;

  replyIds: string[];

  statusDisplay?: string;
  date?: string;
  isNew?: boolean;
  isEditable?: boolean;
}

export interface CreateReviewRequest {
  roomId: string;
  rating: number;
  comment: string;
}

export interface CreateReplyRequest {
  content: string;
}

export interface ReviewResponse {
  id: string;
  
  userId: string;
  userFullName: string;
  userAvatar?: string;
  userPhoneNumber: string;
  userEmail: string;

  roomId: string;
  roomNumber: string;
  roomName: string;
  roomType: string;

  comment: string;
  rating: number;
  reviewStatus: string;

  createdDate: string;
  updatedDate?: string;

  replies: Reply[];
}

export interface ReviewFilterParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  roomId?: string;
  userId?: string;
  status?: ReviewStatus;
  minRating?: number;
  maxRating?: number;
  keyword?: string;
}


// --- Dashboard Types ---

export interface AdminDashboardData {
  overviewStats: any;
  bookingStats: any;
  roomStats: any;
  revenueStats: any;
  
  totalRevenue?: number;
  totalBookings?: number;
  totalRooms?: number;
  activeRooms?: number;
  occupancyRate?: number;
  
  revenueChart: any[];
  bookingTrendChart: any[];
  roomOccupancyChart: any[];
  
  recentBookings: any[];
  todayActivities: any[];
}

export interface DashboardFilterRequest {
  startDate?: string;
  endDate?: string;
  period?: 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'CUSTOM';
  groupBy?: 'DAY' | 'WEEK' | 'MONTH';
}

export interface RecommendedRoom {
  roomId: string;
  roomName: string;
  roomType: string;
  thumbnailImage: string;
  pricePerNight: number;
  rating: number;
  matchReason?: string;
}

export interface UserDashboardData {
  userStats: {
    totalSpent: number;
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    loyaltyPoints: number;
    membershipTier: 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
    totalNightsStayed: number;
  };
  recentBookings: Booking[];
  upcomingBookings: any[];
  recommendedRooms: RecommendedRoom[];
  activitySummary: any;
}

export interface PublicStats {
    totalRooms: number;
    availableRooms: number;
    happyGuests?: number;
    yearsOfOperation?: number;
    averageRating?: number;
}

// --- Chatbot Types ---

export interface ChatSession {
  sessionId: string;
  userId?: string;
  userName?: string;
  messages?: any[];
  status?: string;
  createdAt?: string;
}

export interface ChatMessage {
  id?: string;
  content?: string; 
  message?: string; 
  type: 'TEXT' | 'IMAGE' | 'QUICK_REPLY' | 'CARD' | 'TYPING';
  sender?: 'USER' | 'BOT' | 'STAFF';
  role?: 'user' | 'model'; 
  timestamp?: string;
  quickReplies?: any[];
  cards?: any[];
}
