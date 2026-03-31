import { roomApi } from "./services/api";
import { Room } from "./types";

/* ================================================================
   STATIC DATA — trích xuất trực tiếp từ các trang About, Contact,
   Home, Services để chatbot hiểu đúng thông tin khách sạn.
   ================================================================ */

// ── About Page Data ──────────────────────────────────────────────
const aboutData = {
  hotelName: "Moon Light Hotel",
  foundedYear: 2015,
  ceoFounder: "Park. Kien",
  generalManager: "Johny Trương",
  headChef: "Mason Nguyễn",
  mission:
    "Mang đến cho du khách những trải nghiệm vượt trên cả sự mong đợi, kết hợp giữa kiến trúc đương đại và dịch vụ tận tâm chuẩn mực quốc tế.",
  description:
    "Được thành lập vào năm 2015, Moon light hotel không chỉ là một khách sạn, mà là biểu tượng của sự thanh lịch và tinh tế. Lấy cảm hứng từ vẻ đẹp huyền bí và êm dịu của ánh trăng, chúng tôi tạo ra một không gian nơi thời gian như ngừng lại.",
  culinaryPhilosophy:
    "Tại MoonLight, chúng tôi tin rằng món ăn ngon bắt đầu từ nguyên liệu sạch. Các đầu bếp hợp tác trực tiếp với các nông trại hữu cơ địa phương để mang đến những hương vị tươi mới nhất mỗi ngày.",
  coreValues: [
    "Đẳng cấp 5 sao – Mọi chi tiết nhỏ nhất đều được chăm chút kỹ lưỡng.",
    "Tận tâm – Phục vụ khách hàng bằng cả trái tim và sự thấu hiểu.",
    "Riêng tư – Đảm bảo sự an toàn và không gian riêng tư tuyệt đối.",
    "Sẵn sàng 24/7 – Luôn có mặt bất cứ khi nào bạn cần.",
  ],
  milestones: [
    "2018 – Khu nghỉ dưỡng mới xuất sắc nhất (Travel & Leisure Châu Á)",
    "2020 – Top 10 Khách sạn Xanh (loại bỏ 100% rác nhựa dùng một lần)",
    "2022 – Michelin Key Award (1 sao Michelin cho nhà hàng Moonlight, thực đơn Fusion Á-Âu)",
    "2023 – Luxury Hotel of The Year",
  ],
};

// ── Contact Page Data ────────────────────────────────────────────
const contactData = {
  hotline: "+84 909 336 888",
  email: "contact@moonlight.com",
  address: "Số 8 Đường Trường Sa, Đà Nẵng, Việt Nam",
  workingHours: "Thứ 2 - Chủ Nhật, Mở cửa 24/24",
  supportNote: "Hỗ trợ đặt phòng 24/7, phản hồi email trong vòng 2 giờ",
  contactSubjects: [
    "Tư vấn chung",
    "Hỗ trợ đặt phòng",
    "Tổ chức sự kiện",
    "Góp ý / Khiếu nại",
  ],
  faqs: [
    {
      q: "Tôi có thể đặt phòng khách sạn bằng cách nào?",
      a: "Bạn có thể đặt phòng trực tiếp trên website của MoonLight bằng cách chọn ngày nhận phòng, ngày trả phòng và loại phòng mong muốn. Ngoài ra, bạn cũng có thể liên hệ với chúng tôi qua điện thoại hoặc email.",
    },
    {
      q: "Giờ nhận phòng và trả phòng là khi nào?",
      a: "Giờ nhận phòng (Check-in) tiêu chuẩn là 14:00 và giờ trả phòng (Check-out) là 12:00 trưa. Quý khách có nhu cầu nhận phòng sớm hoặc trả phòng muộn vui lòng liên hệ trước.",
    },
    {
      q: "Khách sạn có bãi đỗ xe không?",
      a: "Chúng tôi có hầm đỗ xe rộng rãi miễn phí 24/7 dành cho khách lưu trú, có khu vực riêng cho xe máy và ô tô.",
    },
    {
      q: "Khách sạn có phục vụ ăn uống không?",
      a: "Chúng tôi có nhiều nhà hàng và quầy bar phục vụ các món ăn đa dạng, từ ẩm thực địa phương đến quốc tế. Quý khách có thể thưởng thức bữa ăn tại nhà hàng hoặc đặt room service.",
    },
  ],
};

// ── Home Page Data ───────────────────────────────────────────────
const homeData = {
  tagline:
    "Chào mừng bạn đến với MoonLight – nơi mang đến trải nghiệm nghỉ dưỡng sang trọng, tiện nghi và thoải mái.",
  rating: "Được đánh giá 4.9/5 trên TripAdvisor và Booking.com",
  starRating: "Khách sạn 5 sao sang trọng",
  highlights: [
    "View Ngắm Trăng – Ban công rộng với tầm nhìn hướng biển, tối ưu cho những đêm trăng lãng mạn.",
    "Ẩm Thực Tinh Tế – Thưởng thức tinh hoa ẩm thực Á-Âu tại nhà hàng Moonlight trên tầng thượng.",
    "Tiện Nghi Hiện Đại – Smart TV, Wifi tốc độ cao và hệ thống điều khiển phòng thông minh 1 chạm.",
  ],
  memberPromotion: "Đăng ký thành viên để nhận ưu đãi lên đến 20% cho lần đặt phòng đầu tiên.",
};

// ── Services Page Data ───────────────────────────────────────────
const servicesData = [
  {
    name: "Moonlight Spa & Wellness",
    description:
      "Tái tạo năng lượng với các liệu pháp trị liệu cổ truyền kết hợp công nghệ hiện đại.",
    features: ["Massage đá nóng", "Xông hơi thảo dược", "Chăm sóc da mặt", "Yoga buổi sáng"],
  },
  {
    name: "Nhà hàng The Eclipse",
    description:
      "Hành trình ẩm thực tinh tế từ Á sang Âu, được chế biến bởi các đầu bếp Michelin. Tận hưởng bữa tối lãng mạn dưới ánh nến và bầu trời sao.",
    features: ["Fine Dining", "Hầm rượu vang", "Private Room", "View toàn cảnh"],
  },
  {
    name: "Hồ bơi Vô cực Horizon",
    description:
      "Hồ bơi nước mặn vô cực trên tầng thượng, nơi mặt nước hòa quyện với bầu trời. Quầy bar bên hồ bơi phục vụ cocktail nhiệt đới suốt cả ngày.",
    features: ["Hồ bơi nước ấm", "Pool Bar", "Ghế tắm nắng VIP", "Khăn tắm miễn phí"],
  },
  {
    name: "Hội nghị & Sự kiện",
    description:
      "Không gian sang trọng với sức chứa lên đến 500 khách, trang thiết bị âm thanh ánh sáng tối tân. Nơi lý tưởng cho đám cưới trong mơ hay hội nghị cấp cao.",
    features: [
      "Sảnh tiệc lớn",
      "Trang trí theo yêu cầu",
      "Catering đa dạng",
      "Đội ngũ tổ chức chuyên nghiệp",
    ],
  },
];

// ── Rooms Page — static labels ───────────────────────────────────
const roomTypeLabels: Record<string, string> = {
  STANDARD: "Phòng tiêu chuẩn",
  SUPERIOR: "Phòng cao cấp",
  DELUXE: "Phòng sang trọng",
  SUITE: "Phòng suite",
  EXECUTIVE: "Phòng điều hành",
  PRESIDENTIAL: "Phòng tổng thống",
  FAMILY: "Phòng gia đình",
  HONEYMOON: "Phòng tân hôn",
};

const priceRanges = [
  "Dưới 1 triệu VNĐ",
  "1 - 5 triệu VNĐ",
  "Trên 5 triệu VNĐ",
];

/* ================================================================
   BUILD STATIC CONTEXT — phần không cần API
   ================================================================ */

function buildStaticContext(): string {
  const sections: string[] = [];

  // Introduction
  sections.push(`Giới thiệu:
Tôi là chatbot hỗ trợ của ${aboutData.hotelName}, sẵn sàng giúp bạn đặt phòng, tìm hiểu về phòng nghỉ, dịch vụ, tiện ích và mọi thông tin liên quan đến khách sạn.`);

  // About
  sections.push(`Về khách sạn:
- Tên: ${aboutData.hotelName}
- Năm thành lập: ${aboutData.foundedYear}
- CEO & Founder: ${aboutData.ceoFounder}
- General Manager: ${aboutData.generalManager}
- Head Chef: ${aboutData.headChef}
- Mô tả: ${aboutData.description}
- Sứ mệnh: ${aboutData.mission}
- Triết lý ẩm thực: ${aboutData.culinaryPhilosophy}
- Xếp hạng: ${homeData.starRating}
- Đánh giá: ${homeData.rating}`);

  // Core Values
  sections.push(`Giá trị cốt lõi:
${aboutData.coreValues.map((v) => `- ${v}`).join("\n")}`);

  // Milestones
  sections.push(`Giải thưởng & Thành tựu:
${aboutData.milestones.map((m) => `- ${m}`).join("\n")}`);

  // Contact
  sections.push(`Thông tin liên hệ:
- Hotline: ${contactData.hotline} (hỗ trợ đặt phòng 24/7)
- Email: ${contactData.email} (phản hồi trong vòng 2 giờ)
- Địa chỉ: ${contactData.address}
- Giờ làm việc: ${contactData.workingHours}
- Website: https://www.moonlighthotel.com`);

  // Home highlights
  sections.push(`Điểm nổi bật:
${homeData.highlights.map((h) => `- ${h}`).join("\n")}
- ${homeData.memberPromotion}`);

  // Services
  sections.push(`Dịch vụ & Tiện ích:
${servicesData
      .map(
        (s) =>
          `• ${s.name}: ${s.description}\n  Tính năng: ${s.features.join(", ")}`
      )
      .join("\n")}`);

  // Room types available
  sections.push(`Các loại phòng có sẵn:
${Object.entries(roomTypeLabels)
      .map(([key, label]) => `- ${label} (${key})`)
      .join("\n")}
Khoảng giá tham khảo: ${priceRanges.join(" | ")}`);

  // FAQ
  sections.push(`Câu hỏi thường gặp (FAQ):
${contactData.faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n")}`);

  // Booking guide
  sections.push(`Hướng dẫn đặt phòng:
1. Truy cập trang "Phòng nghỉ" trên website
2. Lọc theo loại phòng, khoảng giá hoặc sắp xếp theo giá
3. Nhấn "Xem chi tiết" để xem thông tin chi tiết phòng
4. Chọn ngày nhận phòng, ngày trả phòng, số lượng khách
5. Nhấn "Đặt phòng ngay" và điền thông tin cá nhân
6. Thanh toán đặt cọc 30% để xác nhận đặt phòng
Hỗ trợ các phương thức thanh toán: Tiền mặt, Thẻ tín dụng, Chuyển khoản ngân hàng, MoMo, VNPay, ZaloPay`);

  // Cancellation policy
  sections.push(`Chính sách hủy phòng:
- Khách hàng có thể hủy phòng khi đặt phòng đang ở trạng thái PENDING hoặc CONFIRMED
- Hủy trước 3 ngày check-in: miễn phí
- Hủy trong vòng 1-3 ngày trước check-in: phí 30% tổng tiền
- Hủy trong ngày check-in: phí 50% tổng tiền
- Không thể hủy khi đã check-in`);

  // Instruction for chatbot
  sections.push(`Lưu ý cho chatbot:
- Luôn trả lời bằng tiếng Việt trừ khi khách hỏi bằng tiếng Anh
- Khi trả lời về phòng, hãy sử dụng thông tin phòng động bên dưới (nếu có)
- Nếu khách hỏi giá phòng, luôn hiển thị đơn vị VNĐ
- Hướng dẫn khách truy cập website hoặc liên hệ hotline khi cần hỗ trợ thêm
- Không bịa đặt thông tin, chỉ trả lời dựa trên dữ liệu được cung cấp`);

  return sections.join("\n\n");
}

/* ================================================================
   BUILD DYNAMIC ROOM CONTEXT — gọi API để lấy phòng thực tế
   ================================================================ */

function formatRoomInfo(room: Room): string {
  const amenities = room.amenities?.length ? room.amenities.join(", ") : "N/A";
  const typeLabel = roomTypeLabels[room.type] || room.type;
  const price = room.pricePerNight.toLocaleString("vi-VN");

  return [
    `  - Tên: ${room.name} (${room.roomNumber})`,
    `    Loại: ${typeLabel}`,
    `    Giá: ${price} VNĐ/đêm`,
    `    Diện tích: ${room.size}m²`,
    `    Sức chứa tối đa: ${room.maxOccupancy} người`,
    `    Số giường: ${room.bedCount} (${room.bedType || "N/A"})`,
    `    View: ${room.view || "N/A"}`,
    `    Tiện nghi: ${amenities}`,
    `    Đánh giá: ${room.averageRating || "Chưa có"}/5 (${room.totalReviews || 0} đánh giá)`,
    `    Mô tả: ${room.description}`,
  ].join("\n");
}

async function fetchDynamicRoomContext(): Promise<string> {
  try {
    const response = await roomApi.getAvailable();
    if (response.data.status === "success" && response.data.data.length > 0) {
      const rooms = response.data.data;
      const roomTexts = rooms.map(formatRoomInfo).join("\n\n");
      return `\n\nDanh sách phòng hiện có (${rooms.length} phòng đang trống):\n${roomTexts}`;
    }
  } catch (error) {
    console.warn("Chatbot: Không thể lấy dữ liệu phòng từ API, sử dụng thông tin tĩnh.", error);
  }

  // Fallback: sử dụng thông tin tĩnh
  return `\n\nThông tin phòng tham khảo:
- Phòng tiêu chuẩn (Standard): từ 500.000 VNĐ/đêm, tiện nghi cơ bản, Wi-Fi miễn phí
- Phòng sang trọng (Deluxe): từ 1.200.000 VNĐ/đêm, view thành phố, minibar
- Phòng Suite: từ 3.000.000 VNĐ/đêm, phòng khách riêng, tiện nghi cao cấp
- Phòng gia đình (Family): từ 2.000.000 VNĐ/đêm, rộng rãi, phù hợp gia đình
- Phòng tổng thống (Presidential): từ 10.000.000 VNĐ/đêm, đẳng cấp thượng lưu
(Lưu ý: Giá có thể thay đổi, vui lòng kiểm tra trên website để có giá chính xác nhất)`;
}

/* ================================================================
   PUBLIC API
   ================================================================ */

/** Văn bản tĩnh — dùng làm tin nhắn ẩn đầu tiên ngay khi khởi tạo chat */
export const companyInfo: string = buildStaticContext();

/** Lấy full context bao gồm dữ liệu phòng động từ API (async) */
export async function getFullCompanyContext(): Promise<string> {
  const staticPart = buildStaticContext();
  const dynamicRoomPart = await fetchDynamicRoomContext();
  return staticPart + dynamicRoomPart;
}

