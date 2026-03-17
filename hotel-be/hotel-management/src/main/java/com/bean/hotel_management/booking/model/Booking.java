package com.bean.hotel_management.booking.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import jakarta.validation.constraints.FutureOrPresent;



@Document(collection = "bookings")
// Tạo index để tối ưu hóa các truy vấn phổ biến
@CompoundIndexes({
        @CompoundIndex(name = "room_dates_idx", def = "{'roomId': 1, 'checkInDate': 1, 'checkOutDate': 1}"),
        @CompoundIndex(name = "user_status_idx", def = "{'userId': 1, 'status': 1}"),
        @CompoundIndex(name = "dates_status_idx", def = "{'checkInDate': 1, 'checkOutDate': 1, 'status': 1}")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    private String id;

    @NotBlank(message = "Mã đặt phòng không được để trống")
    @Indexed(unique = true)
    private String bookingNumber; // BK20250101001


    // User info
    @NotBlank(message = "User ID không được để trống")
    @Indexed
    private String userId;
    private String userEmail;
    private String userFullName;
    private String userPhoneNumber;

    // Guest Information (người ở thực tế - có thể khác với người đặt)
    private GuestInfo primaryGuest;
    private List<GuestInfo> additionalGuests;


    // Room info
    @NotBlank(message = "Room ID không được để trống")
    @Indexed
    private String roomId;
    private String roomNumber;
    private String roomName;
    private String roomType;

    // Group booking
    private String groupBookingId; // ID chung cho nhóm phòng đặt cùng lúc
    private Boolean isGroupBooking;

    // Stay details
    @NotNull(message = "Ngày check-in không được để trống")
    @FutureOrPresent(message = "Ngày nhận phòng không được là ngày trong quá khứ")
    @Indexed
    private LocalDate checkInDate;

    @NotNull(message = "Ngày check-out không được để trống")
    @Indexed
    private LocalDate checkOutDate;

    private LocalDateTime actualCheckInTime;
    private LocalDateTime actualCheckOutTime;

    // Early/Late policies
    private Boolean isEarlyCheckIn;
    private Double earlyCheckInFee;
    private Boolean isLateCheckOut;
    private Double lateCheckOutFee;

    // Guest information
    @NotNull(message = "Số lượng khách không được để trống")
    @Min(value = 1, message = "Số lượng khách phải >= 1")
    private Integer numberOfGuests;

    @Min(value = 0, message = "Số lượng trẻ em phải >= 0")
    private Integer numberOfChildren;

    // Price & Charges
    @NotNull(message = "Giá phòng không được để trống")
    private Double roomPricePerNight;

    @NotNull(message = "Số đêm không được để trống")
    private Integer numberOfNights;

    private Double subtotal; // roomPricePerNight * numberOfNights
    private Double taxAmount; // 10% VAT
    private Double serviceCharge; // 5% service charge
    private Double discount;

    // Additional charges
    @Builder.Default
    private List<ServiceCharge> additionalCharges = new ArrayList<>();
    private Double additionalChargesTotal;

    private Double totalAmount;

    // Payment Information
    @Indexed
    private BookingPaymentStatus paymentStatus;
    private PaymentMethod paymentMethod;
    private String paymentTransactionId;
    private LocalDateTime paymentDate;

    // Deposit & Pre-authorization
    private Double depositAmount;
    private Boolean depositPaid;
    private LocalDateTime depositPaidDate;
    private String depositTransactionId;

    private Double preAuthAmount; // Số tiền giữ tạm (credit card)
    private String preAuthTransactionId;

    // Booking Status
    @NotNull(message = "Trạng thái đặt phòng không được để trống")
    @Indexed
    private BookingStatus status;

    // Special requests
    private String specialRequests;
    private List<String> addedServices; // VD: breakfast, airport pickup

    // Cancellation Information
    private LocalDateTime cancelledAt;
    private String cancellationReason;
    private String cancelledBy; // User ID or Admin ID
    private Double cancellationFee;

    // Review Information
    private Boolean hasReview;
    private String reviewId;

    // Timestamps
    @Indexed
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
    private LocalDateTime confirmedDate;

    // Notes
    private String adminNotes;
    private String internalNotes; // Ghi chú nội bộ (không hiển thị cho khách)

    // Source tracking
    private String bookingSource; // WEBSITE, MOBILE_APP, PHONE, WALK_IN, OTA
    private String createdBy; // USER or STAFF ID

    // Housekeeping
    private Boolean roomCleanedAfterCheckout;

    // Email confirmations
    private Boolean confirmationEmailSent;
    private Boolean reminderEmailSent;
}