# 🏨 QuanLyWebKhachSan (Hotel Management System)

Dự án quản lý website khách sạn chính quy, bao gồm hai phần chính: Back-end (Spring Boot) và Front-end (React.js + Vite).

---

## 🗂️ Cấu trúc Project

Dự án được triển khai dưới dạng **Monorepo** chức năng cơ bản, chia thành 2 thư mục độc lập:

### 1. `hotel-be` (Back-end)

API RESTful được xây dựng bằng thiết kế hướng Domain-driven hoặc MVC cơ bản của Spring Boot.

- **Ngôn ngữ & Framework**: Java 17, Spring Boot 3.5.7.
- **Database**:
  - **MongoDB**: Cơ sở dữ liệu chính lưu trữ thông tin phòng, user, đặt phòng (`mongodb://localhost:27017/hotel-management`).
  - **Redis (Jedis)**: Sử dụng làm bộ nhớ đệm (caching) và hỗ trợ quản lý hiệu suất (`localhost:6379`).
- **Bảo mật**: Spring Security, JWT Token, OAuth2 (Google, Facebook, Github).
- **Tích hợp bên thứ 3 (3rd-party Services)**:
  - **VNPay Sandbox**: Cổng thanh toán hóa đơn.
  - **Cloudinary**: Lưu trữ, quản lý hình ảnh (avatar, ảnh phòng...).
  - **Gmail SMTP**: Gửi email xác thực, đặt phòng.

### 2. `hotel-fe/moon-palace-hotel` (Front-end)

Giao diện người dùng Web App bao gồm cả trang dành cho khách hàng và trang quản trị (Admin Dashboard).

- **Ngôn ngữ & Framework**: TypeScript, React 19, Vite.
- **Styling**: Tailwind CSS (Tailwind-merge).
- **Các thư viện chính**:
  - `react-router-dom`: Quản lý điều hướng.
  - `axios`: Tương tác với API.
  - `recharts`: Vẽ biểu đồ cho trang quản trị.
  - `lucide-react`: Hệ thống icon chuẩn xác.
  - `motion`: Tạo hiệu ứng animation (micro-animations).

---

## 🚀 Cách cài đặt (Local Development)

### Yêu cầu hệ thống (Prerequisites)

- **Node.js** (Khuyến nghị v18 trở lên).
- **Java JDK 17**.
- **MongoDB** (Đang chạy ở port 27017).
- **Redis Server** (Đang chạy ở port 6379).
- **Git** (Tuỳ chọn để clone dự án).

### Bước 1: Khởi động Back-end (`hotel-be`)

1. Mở terminal và di chuyển đến thư mục Back-end:
   ```bash
   cd hotel-be/hotel-management
   ```
2. Kiểm tra/Tùy chỉnh cấu hình trong file `src/main/resources/application.yml` (các thông số MongoDB, Redis, JWT Secret, Cloudinary API, VNPay TmnCode).
3. Chạy project thông qua Maven Wrapper:
   - **Windows**:
     ```bash
     mvnw.cmd spring-boot:run
     ```
   - **Mac/Linux**:
     ```bash
     ./mvnw spring-boot:run
     ```
4. Server back-end sẽ khởi động tại `http://localhost:8080`. API Console Swagger (nếu có) thông thường tại `http://localhost:8080/swagger-ui/index.html`.

### Bước 2: Khởi động Front-end (`hotel-fe`)

1. Mở terminal mới và di chuyển đến thư mục Front-end:
   ```bash
   cd hotel-fe/moon-palace-hotel
   ```
2. Cài đặt các thư viện phụ thuộc của Node.js:
   ```bash
   npm install
   ```
3. Chạy môi trường phát triển (Development server):
   ```bash
   npm run dev
   ```
4. Truy cập giao diện ứng dụng ở trình duyệt theo URL: `http://localhost:5173/`.

---

## 🌍 Triển khai (Deployment)

### 1. Build & Deploy Back-end (Môi trường Production)

1. Trong file `application.yml`, đổi địa chỉ database hoặc redis thành địa chỉ Production.
2. Build source code ra file `.jar` có thể thực thi:
   ```bash
   mvnw clean package -DskipTests
   ```
3. File `.jar` sẽ được tạo ra trong thư mục `target/`.
4. Deploy file `hotel-management-0.0.1-SNAPSHOT.jar` lên các Server/VPS (AWS, DigitalOcean, VPS Linux) và chạy bằng câu lệnh:
   ```bash
   java -jar target/hotel-management-0.0.1-SNAPSHOT.jar
   ```

### 2. Build & Deploy Front-end (Môi trường Production)

1. Điều chỉnh đường dẫn API (nếu có .env) là địa chỉ URL API Server Production.
2. Build source code Front-end sang file tĩnh (static files):
   ```bash
   npm run build
   ```
3. Một thư mục `dist/` sẽ xuất hiện chứa mã HTML/CSS/JS đã tối ưu.
4. Tải các file trong thư mục `dist/` lên các nền tảng Hosting Frontend (Vercel, Netlify) hoặc cấu hình trong Nginx/Apache.

---

## 🔑 Tài khoản mặc định

Dự án cung cấp sẵn một tài khoản Admin dùng để test tính năng quản trị:

- **Email**: `admin@gmail.com`
- **Mật khẩu**: `Admin123@`
