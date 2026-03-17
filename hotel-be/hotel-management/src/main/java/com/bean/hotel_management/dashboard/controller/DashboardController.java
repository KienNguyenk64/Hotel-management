package com.bean.hotel_management.dashboard.controller;

import com.bean.hotel_management.common.dto.ApiResponse;
import com.bean.hotel_management.dashboard.dto.*;
import com.bean.hotel_management.dashboard.service.IDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final IDashboardService dashboardService;


    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lấy admin dashboard",
            description = "Lấy dữ liệu dashboard tổng quan cho admin hoặc staff.")
    public ResponseEntity<ApiResponse> getAdminDashboard() {
        AdminDashboardResponse dashboard = dashboardService.getAdminDashboard();
        return ResponseEntity.ok(
                ApiResponse.success("Lấy admin dashboard thành công", dashboard));
    }


    @PostMapping("/admin/filter")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lấy admin dashboard với bộ lọc",
            description = "Lấy dữ liệu dashboard tổng quan cho admin hoặc staff với các bộ lọc tùy chọn.")
    public ResponseEntity<ApiResponse> getAdminDashboardWithFilter(
            @RequestBody DashboardFilterRequest filter) {

        AdminDashboardResponse dashboard = dashboardService.getAdminDashboard(filter);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy admin dashboard thành công", dashboard));
    }

    @GetMapping("/admin/overview")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lấy overview statistics",
            description = "Lấy các thống kê tổng quan về hệ thống.")
    public ResponseEntity<ApiResponse> getOverviewStats() {
        OverviewStats stats = dashboardService.getOverviewStats();
        return ResponseEntity.ok(
                ApiResponse.success("Lấy overview stats thành công", stats));
    }


    @GetMapping("/admin/stats/bookings")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lấy booking statistics",
            description = "Lấy các thống kê về booking trong hệ thống.")
    public ResponseEntity<ApiResponse> getBookingStats(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        if (startDate == null) startDate = LocalDate.now().withDayOfMonth(1);
        if (endDate == null) endDate = LocalDate.now();

        BookingStats stats = dashboardService.getBookingStats(startDate, endDate);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy booking stats thành công", stats));
    }


    @GetMapping("/admin/stats/rooms")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lấy room statistics",
            description = "Lấy các thống kê về phòng trong hệ thống.")
    public ResponseEntity<ApiResponse> getRoomStats() {
        RoomStats stats = dashboardService.getRoomStats();
        return ResponseEntity.ok(
                ApiResponse.success("Lấy room stats thành công", stats));
    }


    @GetMapping("/admin/stats/revenue")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lấy revenue statistics",
            description = "Lấy các thống kê về doanh thu trong hệ thống.")
    public ResponseEntity<ApiResponse> getRevenueStats(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        if (startDate == null) startDate = LocalDate.now().withDayOfMonth(1);
        if (endDate == null) endDate = LocalDate.now();

        RevenueStats stats = dashboardService.getRevenueStats(startDate, endDate);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy revenue stats thành công", stats));
    }


    @GetMapping("/admin/recent-bookings")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lấy recent bookings",
            description = "Lấy danh sách các booking gần đây.")
    public ResponseEntity<ApiResponse> getRecentBookings(
            @RequestParam(defaultValue = "10") Integer limit) {

        List<RecentBooking> bookings = dashboardService.getRecentBookings(limit);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy recent bookings thành công", bookings));
    }


    @GetMapping("/admin/today-activities")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lấy today's activities",
            description = "Lấy danh sách các hoạt động diễn ra trong ngày hôm nay.")
    public ResponseEntity<ApiResponse> getTodayActivities() {
        List<TodayActivity> activities = dashboardService.getTodayActivities();
        return ResponseEntity.ok(
                ApiResponse.success("Lấy today activities thành công", activities));
    }


    @GetMapping("/admin/charts/revenue")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lấy revenue chart",
            description = "Lấy dữ liệu biểu đồ doanh thu theo khoảng thời gian và nhóm theo ngày, tuần hoặc tháng.")
    public ResponseEntity<ApiResponse> getRevenueChart(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "DAY") String groupBy) {

        List<ChartData> chartData = dashboardService.getRevenueChart(
                startDate, endDate, groupBy);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy revenue chart thành công", chartData));
    }


    @GetMapping("/admin/charts/booking-trend")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lấy booking trend chart",
            description = "Lấy dữ liệu biểu đồ xu hướng đặt phòng theo khoảng thời gian và nhóm theo ngày, tuần hoặc tháng.")
    public ResponseEntity<ApiResponse> getBookingTrendChart(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "DAY") String groupBy) {

        List<ChartData> chartData = dashboardService.getBookingTrendChart(
                startDate, endDate, groupBy);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy booking trend chart thành công", chartData));
    }


    @GetMapping("/admin/charts/room-occupancy")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lấy room occupancy chart",
            description = "Lấy dữ liệu biểu đồ tỷ lệ sử dụng phòng theo khoảng thời gian.")
    public ResponseEntity<ApiResponse> getRoomOccupancyChart(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<ChartData> chartData = dashboardService.getRoomOccupancyChart(
                startDate, endDate);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy room occupancy chart thành công", chartData));
    }


    @GetMapping("/admin/charts/revenue-by-room-type")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lấy revenue by room type",
            description = "Lấy dữ liệu doanh thu phân theo loại phòng trong khoảng thời gian.")
    public ResponseEntity<ApiResponse> getRevenueByRoomType(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<ChartData> chartData = dashboardService.getRevenueByRoomType(
                startDate, endDate);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy revenue by room type thành công", chartData));
    }


    @GetMapping("/admin/charts/booking-status")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lấy booking status distribution",
            description = "Lấy dữ liệu phân phối trạng thái booking.")
    public ResponseEntity<ApiResponse> getBookingStatusDistribution() {
        List<ChartData> chartData = dashboardService.getBookingStatusDistribution();
        return ResponseEntity.ok(
                ApiResponse.success("Lấy booking status distribution thành công",
                        chartData));
    }


    @GetMapping("/admin/charts/payment-methods")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lấy payment method distribution",
            description = "Lấy dữ liệu phân phối phương thức thanh toán trong khoảng thời gian.")
    public ResponseEntity<ApiResponse> getPaymentMethodDistribution(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<ChartData> chartData = dashboardService.getPaymentMethodDistribution(
                startDate, endDate);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy payment method distribution thành công",
                        chartData));
    }


    @GetMapping("/admin/analytics/top-rooms")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lấy top performing rooms",
            description = "Lấy danh sách các phòng có hiệu suất hoạt động tốt nhất.")
    public ResponseEntity<ApiResponse> getTopPerformingRooms(
            @RequestParam(defaultValue = "10") Integer limit) {

        List<ChartData> data = dashboardService.getTopPerformingRooms(limit);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy top performing rooms thành công", data));
    }


    @GetMapping("/admin/analytics/peak-times")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lấy peak booking times",
            description = "Lấy dữ liệu về các khung giờ đặt phòng cao điểm.")
    public ResponseEntity<ApiResponse> getPeakBookingTimes() {
        List<ChartData> data = dashboardService.getPeakBookingTimes();
        return ResponseEntity.ok(
                ApiResponse.success("Lấy peak booking times thành công", data));
    }

    @GetMapping("/admin/analytics/avg-length-of-stay")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lấy average length of stay",
            description = "Lấy dữ liệu về độ dài lưu trú trung bình trong khoảng thời gian.")
    public ResponseEntity<ApiResponse> getAverageLengthOfStay(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        Double avgStay = dashboardService.getAverageLengthOfStay(startDate, endDate);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy average length of stay thành công", avgStay));
    }


    @GetMapping("/admin/analytics/cancellation-trends")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lấy cancellation trends",
            description = "Lấy dữ liệu về xu hướng hủy phòng trong khoảng thời gian.")
    public ResponseEntity<ApiResponse> getCancellationTrends(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<ChartData> data = dashboardService.getCancellationTrends(startDate, endDate);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy cancellation trends thành công", data));
    }


    @GetMapping("/user")
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ADMIN')")
    @Operation(summary = "Lấy user dashboard",
            description = "Lấy dữ liệu dashboard cá nhân cho user.")
    public ResponseEntity<ApiResponse> getUserDashboard(Authentication authentication) {
        String userEmail = authentication.getName();
        UserDashboardResponse dashboard = dashboardService.getUserDashboard(userEmail);

        return ResponseEntity.ok(
                ApiResponse.success("Lấy user dashboard thành công", dashboard));
    }


    @GetMapping("/user/stats")
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ADMIN')")
    @Operation(summary = "Lấy user statistics",
            description = "Lấy các thống kê cá nhân cho user.")
    public ResponseEntity<ApiResponse> getUserStats(Authentication authentication) {
        String userEmail = authentication.getName();
        UserStats stats = dashboardService.getUserStats(userEmail);

        return ResponseEntity.ok(
                ApiResponse.success("Lấy user stats thành công", stats));
    }


    @GetMapping("/user/activity-summary")
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ADMIN')")
    @Operation(summary = "Lấy user activity summary",
            description = "Lấy tóm tắt hoạt động cá nhân cho user.")
    public ResponseEntity<ApiResponse> getUserActivitySummary(Authentication authentication) {
        String userEmail = authentication.getName();
        UserActivitySummary summary = dashboardService.getUserActivitySummary(userEmail);

        return ResponseEntity.ok(
                ApiResponse.success("Lấy user activity summary thành công", summary));
    }


    @GetMapping("/user/recommended-rooms")
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ADMIN')")
    @Operation(summary = "Lấy recommended rooms",
            description = "Lấy danh sách các phòng được đề xuất cho user.")
    public ResponseEntity<ApiResponse> getRecommendedRooms(Authentication authentication) {
        String userEmail = authentication.getName();
        List<RecommendedRoom> rooms = dashboardService.getRecommendedRooms(userEmail);

        return ResponseEntity.ok(
                ApiResponse.success("Lấy recommended rooms thành công", rooms));
    }


    @GetMapping("/public/stats")
    @Operation(summary = "Lấy public statistics",
            description = "Lấy các thống kê công khai không nhạy cảm về hệ thống.")
    public ResponseEntity<ApiResponse> getPublicStats() {
        OverviewStats stats = dashboardService.getOverviewStats();

        // Trả về những thông tin công khai
        return ResponseEntity.ok(
                ApiResponse.success("Lấy public stats thành công", Map.of(
                        "totalRooms", stats.getTotalRooms(),
                        "availableRooms", stats.getAvailableRooms()
                )));
    }
}