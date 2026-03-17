package com.bean.hotel_management.booking.controller;

import com.bean.hotel_management.booking.dto.response.BookingResponse;
import com.bean.hotel_management.booking.dto.request.*;
import com.bean.hotel_management.booking.dto.response.BookingStatistics;
import com.bean.hotel_management.booking.model.BookingStatus;
import com.bean.hotel_management.booking.model.ServiceCharge;
import com.bean.hotel_management.booking.service.IBookingService;
import com.bean.hotel_management.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Validated
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin("*")
public class BookingController {

    private final IBookingService bookingService;


    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ADMIN')")
    @Operation(summary = "Tạo booking mới")
    public ResponseEntity<ApiResponse> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();
        BookingResponse booking = bookingService.createBooking(request, userEmail);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đặt phòng thành công", booking));
    }

    @PostMapping("/group")
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ADMIN')")
    @Operation(summary = "Đặt nhiều phòng cùng lúc (Group Booking)")
    public ResponseEntity<ApiResponse> createGroupBooking(
            @Valid @RequestBody GroupBookingRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();
        List<BookingResponse> bookings = bookingService.createGroupBooking(request, userEmail);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đặt " + bookings.size() + " phòng thành công", bookings));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ADMIN')")
    @Operation(summary = "Cập nhật booking")
    public ResponseEntity<ApiResponse> updateBooking(
            @PathVariable String id,
            @Valid @RequestBody UpdateBookingRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();
        BookingResponse booking = bookingService.updateBooking(id, request, userEmail);

        return ResponseEntity.ok(
                ApiResponse.success("Cập nhật booking thành công", booking));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ADMIN')")
    @Operation(summary = "Hủy booking")
    public ResponseEntity<ApiResponse> cancelBooking(
            @PathVariable String id,
            @Valid @RequestBody CancelBookingRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();
        BookingResponse booking = bookingService.cancelBooking(id, request, userEmail);

        return ResponseEntity.ok(
                ApiResponse.success("Hủy booking thành công", booking));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ADMIN')")
    @Operation(summary = "Lấy thông tin booking theo ID")
    public ResponseEntity<ApiResponse> getBookingById(@PathVariable String id) {
        BookingResponse booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy thông tin booking thành công", booking));
    }

    @GetMapping("/number/{bookingNumber}")
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ADMIN')")
    @Operation(summary = "Lấy thông tin booking theo số booking")
    public ResponseEntity<ApiResponse> getBookingByNumber(@PathVariable String bookingNumber) {
        BookingResponse booking = bookingService.getBookingByNumber(bookingNumber);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy thông tin booking thành công", booking));
    }

    @GetMapping("/my-bookings")
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ADMIN')")
    @Operation(summary = "Lấy danh sách booking của user")
    public ResponseEntity<ApiResponse> getMyBookings(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size,
            @RequestParam(defaultValue = "createdDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder,
            Authentication authentication) {

        String userEmail = authentication.getName();
        Page<BookingResponse> bookings = bookingService.getUserBookings(
                userEmail, page, size, sortBy, sortOrder);

        return ResponseEntity.ok(
                ApiResponse.success("Lấy danh sách booking thành công", bookings));
    }

    @GetMapping("/my-bookings/history")
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ADMIN')")
    @Operation(summary = "Lấy lịch sử booking của user")
    public ResponseEntity<ApiResponse> getMyBookingHistory(Authentication authentication) {
        String userEmail = authentication.getName();
        List<BookingResponse> bookings = bookingService.getUserBookingHistory(userEmail);

        return ResponseEntity.ok(
                ApiResponse.success("Lấy lịch sử booking thành công", bookings));
    }

    @GetMapping("/my-bookings/upcoming")
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ADMIN')")
    @Operation(summary = "Lấy danh sách booking sắp tới của user")
    public ResponseEntity<ApiResponse> getUpcomingBookings(Authentication authentication) {
        String userEmail = authentication.getName();
        List<BookingResponse> bookings = bookingService.getUpcomingBookings(userEmail);

        return ResponseEntity.ok(
                ApiResponse.success("Lấy danh sách booking sắp tới thành công", bookings));
    }

    @PostMapping("/check-availability")
    @Operation(summary = "Kiểm tra tính khả dụng của phòng")
    public ResponseEntity<ApiResponse> checkAvailability(
            @Valid @RequestBody CheckAvailabilityRequest request) {

        boolean available = bookingService.checkAvailability(request);
        String message = available ? "Phòng còn trống" : "Phòng không khả dụng";

        return ResponseEntity.ok(ApiResponse.success(message, available));
    }

    @GetMapping("/room/{roomId}/unavailable-dates")
    @Operation(summary = "Lấy danh sách ngày unavailable")
    public ResponseEntity<ApiResponse> getUnavailableDates(
            @PathVariable String roomId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<LocalDate> unavailableDates = bookingService.getUnavailableDates(
                roomId, startDate, endDate);

        return ResponseEntity.ok(
                ApiResponse.success("Lấy danh sách ngày unavailable thành công",
                        unavailableDates));
    }

    @PostMapping("/{id}/payment")
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ADMIN')")
    @Operation(summary = "Xử lý thanh toán cho booking")
    public ResponseEntity<ApiResponse> processPayment(
            @PathVariable String id,
            @Valid @RequestBody PaymentRequest request) {

        BookingResponse booking = bookingService.processPayment(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Thanh toán thành công", booking));
    }

    @PostMapping("/{id}/deposit")
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ADMIN')")
    @Operation(summary = " Thanh toán đặt cọc")
    public ResponseEntity<ApiResponse> processDeposit(
            @PathVariable String id,
            @Valid @RequestBody PaymentRequest request) {

        BookingResponse booking = bookingService.processDepositPayment(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Thanh toán đặt cọc thành công", booking));
    }


    @PostMapping("/admin/search")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Tìm kiếm booking với các tiêu chí nâng cao (bao gồm CCCD)")
    public ResponseEntity<ApiResponse> searchBookings(
            @Valid @RequestBody BookingSearchRequest request) {

        Page<BookingResponse> bookings = bookingService.searchBookings(request);
        return ResponseEntity.ok(
                ApiResponse.success("Tìm kiếm booking thành công", bookings));
    }

    @GetMapping("/admin/cccd/{cccdNumber}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Tìm kiếm booking theo CCCD/CMND")
    public ResponseEntity<ApiResponse> searchByCccd(@PathVariable String cccdNumber) {
        List<BookingResponse> bookings = bookingService.searchByCccdNumber(cccdNumber);
        return ResponseEntity.ok(
                ApiResponse.success("Tìm thấy bookings thành công", bookings));
    }

    @GetMapping("/admin/group/{groupBookingId}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lấy tất cả booking trong group")
    public ResponseEntity<ApiResponse> getGroupBookings(@PathVariable String groupBookingId) {
        List<BookingResponse> bookings = bookingService.getGroupBookings(groupBookingId);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy group bookings thành công", bookings));
    }

    @GetMapping("/admin/status/{status}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lấy bookings theo status")
    public ResponseEntity<ApiResponse> getBookingsByStatus(@PathVariable BookingStatus status) {
        List<BookingResponse> bookings = bookingService.getBookingsByStatus(status);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy danh sách booking theo status thành công", bookings));
    }

    @GetMapping("/admin/room/{roomId}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lấy bookings theo phòng")
    public ResponseEntity<ApiResponse> getBookingsByRoom(@PathVariable String roomId) {
        List<BookingResponse> bookings = bookingService.getBookingsByRoom(roomId);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy danh sách booking theo phòng thành công", bookings));
    }

    @PatchMapping("/admin/{id}/confirm")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Xác nhận booking")
    public ResponseEntity<ApiResponse> confirmBooking(@PathVariable String id) {
        BookingResponse booking = bookingService.confirmBooking(id);
        return ResponseEntity.ok(
                ApiResponse.success("Xác nhận booking thành công", booking));
    }

    @PatchMapping("/admin/{id}/check-in")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = " Check-in với thông tin bổ sung")
    public ResponseEntity<ApiResponse> checkIn(
            @PathVariable String id,
            @Valid @RequestBody CheckInRequest request) {

        BookingResponse booking = bookingService.checkIn(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Check-in thành công", booking));
    }

    @PatchMapping("/admin/{id}/check-out")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Check-out")
    public ResponseEntity<ApiResponse> checkOut(@PathVariable String id) {
        BookingResponse booking = bookingService.checkOut(id);
        return ResponseEntity.ok(
                ApiResponse.success("Check-out thành công", booking));
    }

    @PatchMapping("/admin/{id}/no-show")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Đánh dấu no-show")
    public ResponseEntity<ApiResponse> markAsNoShow(@PathVariable String id) {
        BookingResponse booking = bookingService.markAsNoShow(id);
        return ResponseEntity.ok(
                ApiResponse.success("Đánh dấu no-show thành công", booking));
    }

    @PatchMapping("/admin/{id}/complete")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Hoàn thành booking")
    public ResponseEntity<ApiResponse> completeBooking(@PathVariable String id) {
        BookingResponse booking = bookingService.completeBooking(id);
        return ResponseEntity.ok(
                ApiResponse.success("Hoàn thành booking thành công", booking));
    }

    @PostMapping("/admin/{id}/refund")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Hoàn tiền cho booking")
    public ResponseEntity<ApiResponse> refundPayment(@PathVariable String id) {
        BookingResponse booking = bookingService.refundPayment(id);
        return ResponseEntity.ok(
                ApiResponse.success("Hoàn tiền thành công", booking));
    }

    @PostMapping("/admin/{id}/service-charges")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Thêm phí dịch vụ (minibar, giặt ủi, spa...)")
    public ResponseEntity<ApiResponse> addServiceCharge(
            @PathVariable String id,
            @Valid @RequestBody AddServiceChargeRequest request) {

        BookingResponse booking = bookingService.addServiceCharge(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Thêm phí dịch vụ thành công", booking));
    }

    @GetMapping("/admin/{id}/service-charges")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Xem danh sách phí dịch vụ")
    public ResponseEntity<ApiResponse> getServiceCharges(@PathVariable String id) {
        List<ServiceCharge> charges = bookingService.getBookingServiceCharges(id);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy danh sách phí dịch vụ thành công", charges));
    }

    @DeleteMapping("/admin/{id}/service-charges/{chargeIndex}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Xóa phí dịch vụ")
    public ResponseEntity<ApiResponse> removeServiceCharge(@PathVariable String id,
                                                           @PathVariable int chargeIndex) {

        BookingResponse booking = bookingService.removeServiceCharge(id, chargeIndex);
        return ResponseEntity.ok(ApiResponse.success("Xóa phí dịch vụ thành công", booking));
    }

    @PatchMapping("/admin/{id}/approve-early-checkin")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Duyệt early check-in")
    public ResponseEntity<ApiResponse> approveEarlyCheckIn(
            @PathVariable String id,
            @RequestParam Double fee) {

        BookingResponse booking = bookingService.approveEarlyCheckIn(id, fee);
        return ResponseEntity.ok(
                ApiResponse.success("Duyệt early check-in thành công", booking));
    }

    @PatchMapping("/admin/{id}/approve-late-checkout")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Duyệt late check-out")
    public ResponseEntity<ApiResponse> approveLateCheckOut(
            @PathVariable String id,
            @RequestParam Double fee) {

        BookingResponse booking = bookingService.approveLateCheckOut(id, fee);
        return ResponseEntity.ok(
                ApiResponse.success("Duyệt late check-out thành công", booking));
    }

    @PatchMapping("/admin/{id}/notes")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Thêm ghi chú admin")
    public ResponseEntity<ApiResponse> addAdminNotes(
            @PathVariable String id,
            @RequestParam String notes) {

        BookingResponse booking = bookingService.addAdminNotes(id, notes);
        return ResponseEntity.ok(
                ApiResponse.success("Thêm ghi chú thành công", booking));
    }

    @PatchMapping("/admin/{id}/discount")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Áp dụng discount cho booking")
    public ResponseEntity<ApiResponse> applyDiscount(
            @PathVariable String id,
            @RequestParam @Min(0) Double discountAmount) {

        BookingResponse booking = bookingService.applyDiscount(id, discountAmount);
        return ResponseEntity.ok(
                ApiResponse.success("Áp dụng discount thành công", booking));
    }


    @GetMapping("/admin/statistics")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lấy thống kê booking")
    public ResponseEntity<ApiResponse> getStatistics() {
        BookingStatistics stats = bookingService.getBookingStatistics();
        return ResponseEntity.ok(
                ApiResponse.success("Lấy thống kê booking thành công", stats));
    }

    @GetMapping("/admin/today/check-ins")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lấy danh sách check-ins hôm nay")
    public ResponseEntity<ApiResponse> getTodayCheckIns() {
        List<BookingResponse> bookings = bookingService.getTodayCheckIns();
        return ResponseEntity.ok(
                ApiResponse.success("Lấy danh sách check-in hôm nay thành công", bookings));
    }

    @GetMapping("/admin/today/check-outs")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lấy danh sách check-outs hôm nay")
    public ResponseEntity<ApiResponse> getTodayCheckOuts() {
        List<BookingResponse> bookings = bookingService.getTodayCheckOuts();
        return ResponseEntity.ok(
                ApiResponse.success("Lấy danh sách check-out hôm nay thành công", bookings));
    }

    @GetMapping("/admin/revenue/total")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lấy tổng doanh thu")
    public ResponseEntity<ApiResponse> getTotalRevenue() {
        Double revenue = bookingService.getTotalRevenue();
        return ResponseEntity.ok(
                ApiResponse.success("Lấy tổng doanh thu thành công", revenue));
    }

    @GetMapping("/admin/revenue/range")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = " Lấy doanh thu theo khoảng thời gian")
    public ResponseEntity<ApiResponse> getRevenueByRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        Map<String, Double> revenue = bookingService.getRevenueByDateRange(startDate, endDate);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy doanh thu thành công", revenue));
    }

    @GetMapping("/admin/bookings-by-source")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Thống kê booking theo nguồn (website, app, phone...)")
    public ResponseEntity<ApiResponse> getBookingsBySource() {
        Map<String, Long> stats = bookingService.getBookingsBySource();
        return ResponseEntity.ok(
                ApiResponse.success("Lấy thống kê theo nguồn thành công", stats));
    }

    @GetMapping("/admin/occupancy-rate")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lấy occupancy rate trong khoảng thời gian")
    public ResponseEntity<ApiResponse> getOccupancyRate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        Double rate = bookingService.getOccupancyRate(startDate, endDate);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy occupancy rate thành công", rate));
    }


    @GetMapping("/admin/housekeeping/needs-cleaning")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lấy danh sách phòng cần dọn dẹp")
    public ResponseEntity<ApiResponse> getRoomsNeedingCleaning() {
        List<BookingResponse> bookings = bookingService.getRoomsNeedingCleaning();
        return ResponseEntity.ok(
                ApiResponse.success("Lấy danh sách phòng cần dọn thành công", bookings));
    }

    @PatchMapping("/admin/{id}/mark-cleaned")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Đánh dấu phòng đã dọn xong")
    public ResponseEntity<ApiResponse> markRoomAsCleaned(@PathVariable String id) {
        BookingResponse booking = bookingService.markRoomAsCleaned(id);
        return ResponseEntity.ok(
                ApiResponse.success("Đánh dấu phòng đã dọn xong", booking));
    }


    @PostMapping("/admin/{id}/send-confirmation")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = " Gửi email xác nhận booking")
    public ResponseEntity<ApiResponse> sendConfirmationEmail(@PathVariable String id) {
        bookingService.sendBookingConfirmationEmail(id);
        return ResponseEntity.ok(
                ApiResponse.success("Gửi email xác nhận thành công", null));
    }

    @PostMapping("/admin/{id}/send-reminder")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Gửi email nhắc nhở check-in")
    public ResponseEntity<ApiResponse> sendCheckInReminder(@PathVariable String id) {
        bookingService.sendCheckInReminder(id);
        return ResponseEntity.ok(
                ApiResponse.success("Gửi email nhắc nhở thành công", null));
    }

    @PostMapping("/admin/send-bulk-reminders")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Gửi email nhắc nhở hàng loạt")
    public ResponseEntity<ApiResponse> sendBulkReminders() {
        bookingService.sendBulkReminders();
        return ResponseEntity.ok(
                ApiResponse.success("Gửi email nhắc nhở hàng loạt thành công", null));
    }


    @GetMapping("/admin/reports/daily")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Báo cáo hoạt động hàng ngày")
    public ResponseEntity<ApiResponse> getDailyReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        Map<String, Object> report = bookingService.getDailyOperationsReport(date);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy báo cáo hàng ngày thành công", report));
    }

    @GetMapping("/admin/reports/monthly")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Báo cáo hoạt động hàng tháng")
    public ResponseEntity<ApiResponse> getMonthlyReport(
            @RequestParam int year,
            @RequestParam int month) {

        Map<String, Object> report = bookingService.getMonthlyReport(year, month);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy báo cáo hàng tháng thành công", report));
    }
}