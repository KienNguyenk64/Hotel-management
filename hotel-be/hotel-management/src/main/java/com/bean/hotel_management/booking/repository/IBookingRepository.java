package com.bean.hotel_management.booking.repository;

import com.bean.hotel_management.booking.model.Booking;
import com.bean.hotel_management.booking.model.BookingPaymentStatus;
import com.bean.hotel_management.booking.model.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface IBookingRepository extends MongoRepository<Booking, String> {


    Optional<Booking> findByBookingNumber(String bookingNumber);

    List<Booking> findByUserId(String userId);

    Page<Booking> findByUserId(String userId, Pageable pageable);

    List<Booking> findByRoomId(String roomId);

    // CCCD SEARCH
    @Query("{ 'primaryGuest.cccdNumber': ?0 }")
    List<Booking> findByPrimaryGuestCccdNumber(String cccdNumber);

    @Query("{ $or: [ " +
            "{ 'primaryGuest.cccdNumber': ?0 }, " +
            "{ 'additionalGuests.cccdNumber': ?0 } " +
            "]}")
    List<Booking> findByAnyCccdNumber(String cccdNumber);


    @Query("{ $or: [ " +
            "{ 'bookingNumber': { $regex: ?0, $options: 'i' } }, " +
            "{ 'userFullName': { $regex: ?0, $options: 'i' } }, " +
            "{ 'userEmail': { $regex: ?0, $options: 'i' } }, " +
            "{ 'userPhoneNumber': { $regex: ?0, $options: 'i' } }, " +
            "{ 'primaryGuest.fullName': { $regex: ?0, $options: 'i' } }, " +
            "{ 'primaryGuest.phoneNumber': { $regex: ?0, $options: 'i' } }, " +
            "{ 'primaryGuest.email': { $regex: ?0, $options: 'i' } } " +
            "]}")
    Page<Booking> searchByKeyword(String keyword, Pageable pageable);

    // Group Booking Queries
    List<Booking> findByGroupBookingId(String groupBookingId);

    @Query("{ 'groupBookingId': ?0, 'status': { $nin: ['CANCELLED'] } }")
    List<Booking> findActiveBookingsByGroupId(String groupBookingId);


    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByUserIdAndStatus(String userId, BookingStatus status);

    Long countByStatus(BookingStatus status);


    List<Booking> findByPaymentStatus(BookingPaymentStatus paymentStatus);

    Long countByPaymentStatus(BookingPaymentStatus paymentStatus);

    @Query("{ 'depositPaid': false, 'status': { $in: ['CONFIRMED', 'PENDING'] } }")
    List<Booking> findBookingsWithUnpaidDeposit();


    List<Booking> findByCheckInDate(LocalDate checkInDate);

    List<Booking> findByCheckOutDate(LocalDate checkOutDate);

    @Query("{ 'checkInDate': { $gte: ?0, $lte: ?1 } }")
    List<Booking> findByCheckInDateBetween(LocalDate startDate, LocalDate endDate);

    @Query("{ 'checkOutDate': { $gte: ?0, $lte: ?1 } }")
    List<Booking> findByCheckOutDateBetween(LocalDate startDate, LocalDate endDate);


    @Query("{ " +
            "'roomId': ?0, " +
            "'status': { $in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] }, " +
            "$or: [" +
            "  { 'checkInDate': { $lt: ?2 }, 'checkOutDate': { $gt: ?1 } }, " +
            "  { 'checkInDate': { $gte: ?1, $lt: ?2 } }, " +
            "  { 'checkOutDate': { $gt: ?1, $lte: ?2 } } " +
            "]" +
            "}")
    List<Booking> findOverlappingBookings(String roomId, LocalDate checkInDate, LocalDate checkOutDate);


    @Query("{ 'status': { $in: ['CHECKED_OUT', 'COMPLETED'] }, 'paymentStatus': 'PAID' }")
    List<Booking> findCompletedPaidBookings();

    @Query("{ 'paymentStatus': 'PAID', 'paymentDate': { $gte: ?0, $lte: ?1 } }")
    List<Booking> findPaidBookingsByDateRange(LocalDateTime startDate, LocalDateTime endDate);


    @Query("{ 'checkInDate': ?0, 'status': { $in: ['CONFIRMED', 'PENDING'] } }")
    List<Booking> findTodayCheckIns(LocalDate today);

    @Query("{ 'checkOutDate': ?0, 'status': 'CHECKED_IN' }")
    List<Booking> findTodayCheckOuts(LocalDate today);


    @Query("{ 'userId': ?0, 'status': { $in: ['CHECKED_OUT', 'COMPLETED'] } }")
    List<Booking> findUserBookingHistory(String userId);

    @Query("{ " +
            "'userId': ?0, " +
            "'checkInDate': { $gte: ?1 }, " +
            "'status': { $ne: 'CANCELLED' } " +
            "}")
    List<Booking> findUpcomingBookingsByUser(String userId, LocalDate fromDate);


    Long countByUserIdAndStatus(String userId, BookingStatus status);

    @Query(value = "{ 'status': { $in: ['CHECKED_OUT', 'COMPLETED'] }, 'paymentStatus': 'PAID' }",
            count = true)
    Long countCompletedPaidBookings();


    @Query("{ 'userId': ?0, 'hasReview': false, 'status': { $in: ['CHECKED_OUT', 'COMPLETED'] } }")
    List<Booking> findBookingsNeedingReview(String userId);


    @Query("{ 'confirmationEmailSent': false, 'status': 'CONFIRMED' }")
    List<Booking> findBookingsNeedingConfirmationEmail();

    @Query("{ " +
            "'reminderEmailSent': false, " +
            "'status': 'CONFIRMED', " +
            "'checkInDate': { $gte: ?0, $lte: ?1 } " +
            "}")
    List<Booking> findBookingsNeedingReminder(LocalDate startDate, LocalDate endDate);


    @Query("{ 'status': 'CHECKED_OUT', 'roomCleanedAfterCheckout': false }")
    List<Booking> findRoomsNeedingCleaning();


    Long countByBookingSource(String bookingSource);

    List<Booking> findByBookingSource(String bookingSource, Pageable pageable);
}