package com.bean.hotel_management.booking.mapper;

import com.bean.hotel_management.user.model.User;
import com.bean.hotel_management.booking.dto.response.BookingResponse;
import com.bean.hotel_management.booking.dto.request.CreateBookingRequest;
import com.bean.hotel_management.booking.model.Booking;
import com.bean.hotel_management.booking.model.BookingPaymentStatus;
import com.bean.hotel_management.booking.model.BookingStatus;
import com.bean.hotel_management.room.model.Room;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import static com.bean.hotel_management.booking.constants.BookingConstants.Pricing.*;

@Component
public class BookingMapper {

    public Booking toEntity(CreateBookingRequest request, User user, Room room, String bookingNumber) {
        int numberOfNights = (int) ChronoUnit.DAYS.between(
                request.getCheckInDate(),
                request.getCheckOutDate()
        );

        double subtotal = room.getPricePerNight() * numberOfNights;
        double taxAmount = subtotal * TAX_RATE;
        double serviceCharge = subtotal * SERVICE_CHARGE_RATE;
        double totalAmount = subtotal + taxAmount + serviceCharge;

        return Booking.builder()
                .bookingNumber(bookingNumber)
                .userId(user.getId())
                .userEmail(user.getEmail())
                .userFullName(user.getFullName())
                .userPhoneNumber(user.getPhoneNumber())
                .primaryGuest(request.getPrimaryGuest())
                .additionalGuests(request.getAdditionalGuests())
                .roomId(room.getId())
                .roomNumber(room.getRoomNumber())
                .roomName(room.getName())
                .roomType(room.getType() != null ? room.getType().name() : null)
                .checkInDate(request.getCheckInDate())
                .checkOutDate(request.getCheckOutDate())
                .numberOfGuests(request.getNumberOfGuests())
                .numberOfChildren(request.getNumberOfChildren() != null ? request.getNumberOfChildren() : 0)
                .roomPricePerNight(room.getPricePerNight())
                .numberOfNights(numberOfNights)
                .subtotal(subtotal)
                .taxAmount(taxAmount)
                .serviceCharge(serviceCharge)
                .discount(0.0)
                .additionalChargesTotal(0.0)
                .totalAmount(totalAmount)
                .paymentStatus(BookingPaymentStatus.UNPAID)
                .status(BookingStatus.PENDING)
                .specialRequests(request.getSpecialRequests())
                .addedServices(request.getAddedServices())
                .hasReview(false)
                .isGroupBooking(false)
                .isEarlyCheckIn(request.getIsEarlyCheckIn() != null ? request.getIsEarlyCheckIn() : false)
                .isLateCheckOut(request.getIsLateCheckOut() != null ? request.getIsLateCheckOut() : false)
                .depositPaid(false)
                .roomCleanedAfterCheckout(false)
                .confirmationEmailSent(false)
                .reminderEmailSent(false)
                .createdDate(LocalDateTime.now())
                .build();
    }

    public BookingResponse toResponse(Booking booking) {
        // Tính số ngày còn lại đến ngày check-in
        Long daysUntilCheckIn = null;
        if (booking.getCheckInDate() != null) {
            daysUntilCheckIn = ChronoUnit.DAYS.between(LocalDate.now(), booking.getCheckInDate());
        }

        // Tổng số phòng trong đặt phòng nhóm (nếu có)
        Integer totalRoomsInGroup = null;
        if (Boolean.TRUE.equals(booking.getIsGroupBooking()) && booking.getGroupBookingId() != null) {
            // Logic để lấy tổng số phòng trong đặt phòng nhóm từ groupBookingId
            // Ví dụ, gọi dịch vụ GroupBookingService để lấy thông tin
            // totalRoomsInGroup = groupBookingService.getTotalRooms(booking.getGroupBookingId());
            totalRoomsInGroup = 1;
        }

        return BookingResponse.builder()
                .id(booking.getId())
                .bookingNumber(booking.getBookingNumber())
                .userId(booking.getUserId())
                .userEmail(booking.getUserEmail())
                .userFullName(booking.getUserFullName())
                .userPhoneNumber(booking.getUserPhoneNumber())
                .primaryGuest(booking.getPrimaryGuest())
                .additionalGuests(booking.getAdditionalGuests())
                .roomId(booking.getRoomId())
                .roomNumber(booking.getRoomNumber())
                .roomName(booking.getRoomName())
                .roomType(booking.getRoomType())
                .groupBookingId(booking.getGroupBookingId())
                .isGroupBooking(booking.getIsGroupBooking())
                .totalRoomsInGroup(totalRoomsInGroup)
                .checkInDate(booking.getCheckInDate())
                .checkOutDate(booking.getCheckOutDate())
                .actualCheckInTime(booking.getActualCheckInTime())
                .actualCheckOutTime(booking.getActualCheckOutTime())
                .isEarlyCheckIn(booking.getIsEarlyCheckIn())
                .earlyCheckInFee(booking.getEarlyCheckInFee())
                .isLateCheckOut(booking.getIsLateCheckOut())
                .lateCheckOutFee(booking.getLateCheckOutFee())
                .numberOfGuests(booking.getNumberOfGuests())
                .numberOfChildren(booking.getNumberOfChildren())
                .roomPricePerNight(booking.getRoomPricePerNight())
                .numberOfNights(booking.getNumberOfNights())
                .subtotal(booking.getSubtotal())
                .taxAmount(booking.getTaxAmount())
                .serviceCharge(booking.getServiceCharge())
                .discount(booking.getDiscount())
                .additionalCharges(booking.getAdditionalCharges())
                .additionalChargesTotal(booking.getAdditionalChargesTotal())
                .totalAmount(booking.getTotalAmount())
                .paymentStatus(booking.getPaymentStatus())
                .paymentStatusDisplay(booking.getPaymentStatus().getVietnameseName())
                .paymentMethod(booking.getPaymentMethod())
                .paymentMethodDisplay(booking.getPaymentMethod() != null
                        ? booking.getPaymentMethod().getVietnameseName() : null)
                .paymentTransactionId(booking.getPaymentTransactionId())
                .paymentDate(booking.getPaymentDate())
                .depositAmount(booking.getDepositAmount())
                .depositPaid(booking.getDepositPaid())
                .depositPaidDate(booking.getDepositPaidDate())
                .status(booking.getStatus())
                .statusDisplay(booking.getStatus().getVietnameseName())
                .specialRequests(booking.getSpecialRequests())
                .addedServices(booking.getAddedServices())
                .cancelledAt(booking.getCancelledAt())
                .cancellationReason(booking.getCancellationReason())
                .cancellationFee(booking.getCancellationFee())
                .hasReview(booking.getHasReview())
                .reviewId(booking.getReviewId())
                .createdDate(booking.getCreatedDate())
                .updatedDate(booking.getUpdatedDate())
                .confirmedDate(booking.getConfirmedDate())
                .adminNotes(booking.getAdminNotes())
                .bookingSource(booking.getBookingSource())
                .canCancel(canCancel(booking))
                .canCheckIn(canCheckIn(booking))
                .canCheckOut(canCheckOut(booking))
                .canReview(canReview(booking))
                .canAddServiceCharges(canAddServiceCharges(booking))
                .daysUntilCheckIn(daysUntilCheckIn)
                .build();
    }

    // Kiểm tra có thể hủy đặt phòng không
    private Boolean canCancel(Booking booking) {
        return booking.getStatus() == BookingStatus.PENDING
                || booking.getStatus() == BookingStatus.CONFIRMED;
    }

    // Kiểm tra có thể check-in không
    private Boolean canCheckIn(Booking booking) {
        LocalDate today = LocalDate.now();
        return booking.getStatus() == BookingStatus.CONFIRMED
                && !booking.getCheckInDate().isAfter(today);
    }

    // Kiểm tra có thể check-out không
    private Boolean canCheckOut(Booking booking) {
        return booking.getStatus() == BookingStatus.CHECKED_IN;
    }

    // Kiểm tra có thể đánh giá không
    private Boolean canReview(Booking booking) {
        return (booking.getStatus() == BookingStatus.CHECKED_OUT
                || booking.getStatus() == BookingStatus.COMPLETED)
                && !booking.getHasReview();
    }

    // Kiểm tra có thể thêm phí dịch vụ không
    private Boolean canAddServiceCharges(Booking booking) {
        return booking.getStatus() == BookingStatus.CHECKED_IN
                || booking.getStatus() == BookingStatus.CHECKED_OUT;
    }
}