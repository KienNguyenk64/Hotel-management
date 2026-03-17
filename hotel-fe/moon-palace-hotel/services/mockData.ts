import { Booking, Review, User, Room, RoomType, RoomStatus, BookingStatus, PaymentStatus, BedType, RoomView } from '../types';

export const REVENUE_DATA: MonthlyRevenue[] = [
  { name: 'Thg 1', revenue: 45000, bookings: 120 },
  { name: 'Thg 2', revenue: 52000, bookings: 132 },
  { name: 'Thg 3', revenue: 48000, bookings: 115 },
  { name: 'Thg 4', revenue: 61000, bookings: 150 },
  { name: 'Thg 5', revenue: 55000, bookings: 140 },
  { name: 'Thg 6', revenue: 75000, bookings: 180 },
];

export const ROOM_STATUS_DATA: RoomStat[] = [
  { name: 'Đã đặt', value: 65, color: '#0F172A' },
  { name: 'Trống', value: 25, color: '#D4AF37' },
  { name: 'Bảo trì', value: 10, color: '#94A3B8' },
];

export const ROOM_DATA: Room[] = [
  {
    id: 'RM-101',
    roomNumber: '101',
    name: 'Moonlight Suite',
    type: RoomType.SUITE,
    typeDisplay: 'Suite',
    description: 'Phòng Suite sang trọng với tầm nhìn hướng biển tuyệt đẹp.',
    pricePerNight: 350,
    size: 60,
    bedCount: 1,
    bedType: BedType.KING,
    maxOccupancy: 2,
    floor: 1,
    view: RoomView.SEA,
    amenities: ['Wifi', 'TV', 'Minibar', 'Bathtub'],
    images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1000&auto=format&fit=crop'],
    thumbnailImage: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1000&auto=format&fit=crop',
    status: RoomStatus.AVAILABLE,
    isActive: true,
    isFeatured: true,
    allowSmoking: false,
    hasBathroom: true,
    hasBalcony: true,
    hasKitchen: false,
    averageRating: 4.8,
    totalReviews: 120
  },
  {
    id: 'RM-104',
    roomNumber: '104',
    name: 'Star View Deluxe',
    type: RoomType.DELUXE,
    typeDisplay: 'Deluxe',
    description: 'Phòng Deluxe rộng rãi, thiết kế hiện đại.',
    pricePerNight: 200,
    size: 45,
    bedCount: 1,
    bedType: 'Queen Size',
    maxOccupancy: 2,
    floor: 1,
    view: 'City View',
    amenities: ['Wifi', 'TV', 'Minibar'],
    images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1000&auto=format&fit=crop'],
    thumbnailImage: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1000&auto=format&fit=crop',
    status: RoomStatus.AVAILABLE,
    isActive: true,
    isFeatured: false,
    allowSmoking: false,
    hasBathroom: true,
    hasBalcony: false,
    hasKitchen: false,
    averageRating: 4.5,
    totalReviews: 85
  },
  {
      id: 'RM-205',
      roomNumber: '205',
      name: 'Galaxy Penthouse',
      type: RoomType.PRESIDENTIAL,
      typeDisplay: 'Penthouse',
      description: 'Penthouse đẳng cấp thượng lưu.',
      pricePerNight: 1200,
      size: 150,
      bedCount: 2,
      bedType: 'King Size',
      maxOccupancy: 4,
      floor: 10,
      view: 'Panoramic View',
      amenities: ['Wifi', 'TV', 'Minibar', 'Jacuzzi', 'Private Pool'],
      images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1000&auto=format&fit=crop'],
      thumbnailImage: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1000&auto=format&fit=crop',
      status: RoomStatus.AVAILABLE,
      isActive: true,
      isFeatured: true,
      allowSmoking: true,
      hasBathroom: true,
      hasBalcony: true,
      hasKitchen: true,
      averageRating: 5.0,
      totalReviews: 30
    },
    {
      id: 'RM-302',
      roomNumber: '302',
      name: 'Aurora Family Room',
      type: RoomType.FAMILY,
      typeDisplay: 'Family',
      description: 'Phòng gia đình ấm cúng.',
      pricePerNight: 250,
      size: 55,
      bedCount: 2,
      bedType: 'Queen Size',
      maxOccupancy: 4,
      floor: 3,
      view: 'Garden View',
      amenities: ['Wifi', 'TV', 'Minibar'],
      images: ['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=1000&auto=format&fit=crop'],
      thumbnailImage: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=1000&auto=format&fit=crop',
      status: RoomStatus.OCCUPIED,
      isActive: true,
      isFeatured: false,
      allowSmoking: false,
      hasBathroom: true,
      hasBalcony: true,
      hasKitchen: false,
      averageRating: 4.7,
      totalReviews: 50
    },
     {
      id: 'RM-401',
      roomNumber: '401',
      name: 'Ocean Premier',
      type: RoomType.SUPERIOR,
      typeDisplay: 'Superior',
      description: 'Phòng Superior với tầm nhìn ra đại dương.',
      pricePerNight: 220,
      size: 50,
      bedCount: 1,
      bedType: 'King Size',
      maxOccupancy: 2,
      floor: 4,
      view: 'Ocean View',
      amenities: ['Wifi', 'TV', 'Minibar'],
      images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000&auto=format&fit=crop'],
      thumbnailImage: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000&auto=format&fit=crop',
      status: RoomStatus.AVAILABLE,
      isActive: true,
      isFeatured: true,
      allowSmoking: false,
      hasBathroom: true,
      hasBalcony: true,
      hasKitchen: false,
      averageRating: 4.6,
      totalReviews: 65
    },
    {
        id: 'RM-505',
        roomNumber: '505',
        name: 'Royal Suite',
        type: RoomType.SUITE,
        typeDisplay: 'Suite',
        description: 'Phòng Royal Suite phong cách hoàng gia.',
        pricePerNight: 450,
        size: 70,
        bedCount: 1,
        bedType: 'King Size',
        maxOccupancy: 2,
        floor: 5,
        view: 'City View',
        amenities: ['Wifi', 'TV', 'Minibar', 'Bathtub'],
        images: ['https://images.unsplash.com/photo-1631049552057-403cdb8f0658?q=80&w=1000&auto=format&fit=crop'],
        thumbnailImage: 'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?q=80&w=1000&auto=format&fit=crop',
        status: RoomStatus.AVAILABLE,
        isActive: true,
        isFeatured: false,
        allowSmoking: false,
        hasBathroom: true,
        hasBalcony: true,
        hasKitchen: false,
        averageRating: 4.9,
        totalReviews: 40
    }
];

// Helper to create mock booking with defaults
const createMockBooking = (data: Partial<Booking>): Booking => ({
  id: 'BK-MOCK',
  bookingNumber: 'BK-MOCK',
  userId: 'U-MOCK',
  userEmail: 'guest@example.com',
  userFullName: 'Guest Name',
  userPhoneNumber: '0000000000',
  roomId: 'RM-MOCK',
  roomNumber: '100',
  roomName: 'Mock Room',
  checkInDate: '2023-01-01',
  checkOutDate: '2023-01-02',
  numberOfGuests: 2,
  numberOfChildren: 0,
  roomPricePerNight: 100,
  numberOfNights: 1,
  subtotal: 100,
  taxAmount: 10,
  serviceCharge: 5,
  discount: 0,
  totalAmount: 115,
  paymentStatus: PaymentStatus.PAID,
  status: BookingStatus.CONFIRMED,
  createdDate: '2023-01-01',
  canCancel: false,
  canCheckIn: false,
  canCheckOut: false,
  canReview: false,
  ...data
} as Booking);

// Mock Bookings with static data (decoupled from ROOM_DATA)
export const RECENT_BOOKINGS: Booking[] = [
  createMockBooking({
    id: 'BK-1001',
    bookingNumber: 'BK-1001',
    roomId: 'RM-101',
    roomName: 'Moonlight Suite',
    checkInDate: '2023-10-25',
    checkOutDate: '2023-10-28',
    status: BookingStatus.CONFIRMED,
    totalAmount: 450,
    guestName: 'Nguyễn Văn A',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1000&auto=format&fit=crop'
  }),
  createMockBooking({
    id: 'BK-1002',
    bookingNumber: 'BK-1002',
    roomId: 'RM-205',
    roomName: 'Galaxy Penthouse',
    checkInDate: '2023-10-26',
    checkOutDate: '2023-10-30',
    status: BookingStatus.PENDING,
    totalAmount: 2100,
    guestName: 'Trần Thị B',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1000&auto=format&fit=crop'
  }),
  createMockBooking({
    id: 'BK-1003',
    bookingNumber: 'BK-1003',
    roomId: 'RM-104',
    roomName: 'Star View Deluxe',
    checkInDate: '2023-10-20',
    checkOutDate: '2023-10-22',
    status: BookingStatus.COMPLETED,
    totalAmount: 200,
    guestName: 'Lê Văn C',
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1000&auto=format&fit=crop'
  }),
];

export const ADMIN_BOOKINGS: Booking[] = [
  ...RECENT_BOOKINGS,
  createMockBooking({
    id: 'BK-1004',
    bookingNumber: 'BK-1004',
    roomId: 'RM-302',
    roomName: 'Aurora Family Room',
    checkInDate: '2023-11-01',
    checkOutDate: '2023-11-05',
    status: BookingStatus.CONFIRMED,
    totalAmount: 1000,
    guestName: 'Phạm Thị D',
    image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=1000&auto=format&fit=crop'
  }),
  createMockBooking({
    id: 'BK-1005',
    bookingNumber: 'BK-1005',
    roomId: 'RM-401',
    roomName: 'Ocean Premier',
    checkInDate: '2023-11-10',
    checkOutDate: '2023-11-12',
    status: BookingStatus.CANCELLED,
    totalAmount: 440,
    guestName: 'Hoàng Văn E',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000&auto=format&fit=crop'
  }),
  createMockBooking({
    id: 'BK-1006',
    bookingNumber: 'BK-1006',
    roomId: 'RM-505',
    roomName: 'Royal Suite',
    checkInDate: '2023-12-24',
    checkOutDate: '2023-12-26',
    status: BookingStatus.PENDING,
    totalAmount: 1200,
    guestName: 'John Smith',
    image: 'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?q=80&w=1000&auto=format&fit=crop'
  })
];

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: 'Standard' | 'Silver' | 'Gold' | 'Diamond' | 'Platinum';
  totalSpent: number;
  lastStay: string;
  avatar: string;
}

export const GUEST_DATA: Guest[] = [
  {
    id: 'GU-001',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@gmail.com',
    phone: '0909 111 222',
    tier: 'Gold',
    totalSpent: 4500,
    lastStay: '2023-10-28',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: 'GU-002',
    name: 'Trần Thị B',
    email: 'tranthib@gmail.com',
    phone: '0909 333 444',
    tier: 'Platinum',
    totalSpent: 12500,
    lastStay: '2023-09-15',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    id: 'GU-003',
    name: 'Lê Văn C',
    email: 'levanc@gmail.com',
    phone: '0909 555 666',
    tier: 'Standard',
    totalSpent: 850,
    lastStay: '2023-10-22',
    avatar: 'https://randomuser.me/api/portraits/men/85.jpg'
  },
  {
    id: 'GU-004',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 234 567 890',
    tier: 'Silver',
    totalSpent: 2100,
    lastStay: '2023-08-05',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg'
  },
   {
    id: 'GU-005',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+44 20 7123 4567',
    tier: 'Diamond',
    totalSpent: 25000,
    lastStay: '2023-11-01',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
  }
];

export const USER_HISTORY: Booking[] = [
  createMockBooking({
    id: 'BK-998',
    bookingNumber: 'BK-998',
    roomId: 'RM-101',
    roomName: 'Moonlight Suite',
    checkInDate: '2023-08-15',
    checkOutDate: '2023-08-18',
    status: BookingStatus.COMPLETED,
    totalAmount: 1050,
    guestName: 'Khách Hàng Thân Thiết',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1000&auto=format&fit=crop'
  }),
  createMockBooking({
    id: 'BK-850',
    bookingNumber: 'BK-850',
    roomId: 'RM-302',
    roomName: 'Aurora Family Room',
    checkInDate: '2023-01-10',
    checkOutDate: '2023-01-15',
    status: BookingStatus.COMPLETED,
    totalAmount: 1250,
    guestName: 'Khách Hàng Thân Thiết',
    image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=1000&auto=format&fit=crop'
  }),
  createMockBooking({
    id: 'BK-1050',
    bookingNumber: 'BK-1050',
    roomId: 'RM-104',
    roomName: 'Star View Deluxe',
    checkInDate: '2023-12-24',
    checkOutDate: '2023-12-26',
    status: BookingStatus.CONFIRMED,
    totalAmount: 360,
    guestName: 'Khách Hàng Thân Thiết',
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1000&auto=format&fit=crop'
  })
];

export const REVIEWS_DATA: Review[] = [
  {
    id: 'RV-01',
    roomId: 'RM-101',
    roomName: 'Moonlight Suite',
    userName: 'Sarah Jenkins',
    userAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 5,
    comment: 'Một trải nghiệm tuyệt vời! Cảnh đêm từ phòng Moonlight Suite thực sự ngoạn mục.',
    date: '2023-10-10',
    status: 'Approved',
    reply: 'Cảm ơn bà Sarah đã dành lời khen!'
  },
  {
    id: 'RV-02',
    roomId: 'RM-104',
    roomName: 'Star View Deluxe',
    userName: 'Minh Hoàng',
    userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 4,
    comment: 'Không gian sang trọng, yên tĩnh. Đồ ăn sáng rất ngon.',
    date: '2023-09-28',
    status: 'Approved',
    reply: 'Chào anh Hoàng, cảm ơn góp ý của anh.'
  },
  {
    id: 'RV-04',
    roomId: 'RM-101',
    roomName: 'Moonlight Suite',
    userName: 'John Doe',
    userAvatar: 'https://randomuser.me/api/portraits/men/44.jpg',
    rating: 3,
    comment: 'Phòng đẹp nhưng check-in hơi lâu. Cần cải thiện quy trình này.',
    date: 'Vừa xong',
    status: 'Pending',
    isNew: true
  }
];

export interface ServiceRequest {
  id: string;
  room: string;
  type: 'Maintenance' | 'Housekeeping' | 'Concierge' | 'Room Service';
  detail: string;
  time: string;
  status: 'Pending' | 'In Progress' | 'Completed';
}

export const SERVICE_REQUESTS: ServiceRequest[] = [
  { id: 'SR-001', room: '101', type: 'Housekeeping', detail: 'Yêu cầu thêm khăn tắm', time: '5 phút trước', status: 'Pending' },
  { id: 'SR-002', room: '205', type: 'Room Service', detail: 'Champagne & Dâu tây', time: '12 phút trước', status: 'In Progress' },
];

export const HOUSEKEEPING_STATS = { clean: 45, dirty: 12, inspecting: 5, cleaning: 8 };
export const TODAY_OPS = { arrivals: 15, departures: 12, inHouse: 85, available: 18 };

export interface MenuItem {
  id: string;
  category: 'Starter' | 'Main' | 'Dessert' | 'Wine';
  name: string;
  price: number;
  description: string;
  image: string;
  isChefChoice?: boolean;
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'M-01',
    category: 'Starter',
    name: 'Súp Vi Cá Hạng Nhất',
    price: 45,
    description: 'Nước dùng thượng hạng ninh trong 48h.',
    image: 'https://images.unsplash.com/photo-1547592166-23acbe3a624b?q=80&w=600&auto=format&fit=crop',
    isChefChoice: true
  }
];

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  author: string;
  category: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Top 5 bãi biển hoang sơ gần Moon Palace',
    excerpt: 'Khám phá những viên ngọc ẩn giấu.',
    image: 'https://images.unsplash.com/photo-1519046904884-53103b34b271?q=80&w=2070&auto=format&fit=crop',
    date: '15/10/2023',
    author: 'Sarah Jenkins',
    category: 'Du lịch'
  }
];

export interface Promotion {
  id: string;
  title: string;
  description: string;
  image: string;
  code: string;
  discount: string;
  validUntil: string;
}

export const PROMOTIONS: Promotion[] = [
  {
    id: 'summer',
    title: 'Summer Vibes 2024',
    description: 'Tận hưởng mùa hè rực rỡ.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop',
    code: 'SUMMER2024',
    discount: '20%',
    validUntil: '31/08/2024'
  }
];