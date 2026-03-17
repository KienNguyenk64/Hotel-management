package com.bean.hotel_management.booking.service;

import com.bean.hotel_management.booking.dto.response.*;
import com.bean.hotel_management.booking.dto.request.*;
import com.bean.hotel_management.booking.model.BookingStatus;
import com.bean.hotel_management.booking.model.ServiceCharge;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface IBookingService {


    BookingResponse createBooking(CreateBookingRequest request, String userEmail);

    List<BookingResponse> createGroupBooking(GroupBookingRequest request, String userEmail);

    BookingResponse updateBooking(String bookingId, UpdateBookingRequest request, String userEmail);

    BookingResponse cancelBooking(String bookingId, CancelBookingRequest request, String userEmail);

    BookingResponse getBookingById(String bookingId);

    BookingResponse getBookingByNumber(String bookingNumber);


    Page<BookingResponse> getUserBookings(String userEmail, int page, int size, String sortBy, String sortOrder);

    List<BookingResponse> getUserBookingHistory(String userEmail);

    List<BookingResponse> getUpcomingBookings(String userEmail);

    List<BookingResponse> searchByCccdNumber(String cccdNumber);

    Page<BookingResponse> searchBookings(BookingSearchRequest request);

    List<BookingResponse> getBookingsByStatus(BookingStatus status);

    List<BookingResponse> getBookingsByRoom(String roomId);

    List<BookingResponse> getGroupBookings(String groupBookingId);

    boolean checkAvailability(CheckAvailabilityRequest request);

    List<LocalDate> getUnavailableDates(String roomId, LocalDate startDate, LocalDate endDate);

    Map<String, Boolean> checkMultipleRoomsAvailability(List<String> roomIds, LocalDate checkIn, LocalDate checkOut);


    BookingResponse confirmBooking(String bookingId);

    BookingResponse checkIn(String bookingId, CheckInRequest request);

    BookingResponse checkOut(String bookingId);

    BookingResponse markAsNoShow(String bookingId);

    BookingResponse completeBooking(String bookingId);

    BookingResponse processPayment(String bookingId, PaymentRequest request);

    BookingResponse processDepositPayment(String bookingId, PaymentRequest request);

    BookingResponse refundPayment(String bookingId);


    BookingResponse addServiceCharge(String bookingId, AddServiceChargeRequest request);

    BookingResponse removeServiceCharge(String bookingId, int chargeIndex);

    List<ServiceCharge> getBookingServiceCharges(String bookingId);

    Double calculateTotalServiceCharges(String bookingId);

    BookingStatistics getBookingStatistics();

    List<BookingResponse> getTodayCheckIns();

    List<BookingResponse> getTodayCheckOuts();

    Double getTotalRevenue();

    Map<String, Double> getRevenueByDateRange(LocalDate startDate, LocalDate endDate);

    Map<String, Long> getBookingsBySource();

    Double getOccupancyRate(LocalDate startDate, LocalDate endDate);

    BookingResponse addAdminNotes(String bookingId, String notes);

    BookingResponse applyDiscount(String bookingId, Double discountAmount);

    BookingResponse approveEarlyCheckIn(String bookingId, Double fee);

    BookingResponse approveLateCheckOut(String bookingId, Double fee);


    void sendBookingConfirmationEmail(String bookingId);

    void sendCheckInReminder(String bookingId);

    // Gửi nhắc nhở hàng loạt cho các booking sắp đến hạn check-in trong ngày
    void sendBulkReminders();


    List<BookingResponse> getRoomsNeedingCleaning();

    BookingResponse markRoomAsCleaned(String bookingId);


    Map<String, Object> getDailyOperationsReport(LocalDate date);

    Map<String, Object> getMonthlyReport(int year, int month);
}