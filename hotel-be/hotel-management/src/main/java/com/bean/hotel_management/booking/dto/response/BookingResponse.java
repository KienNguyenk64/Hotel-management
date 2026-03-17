package com.bean.hotel_management.booking.dto.response;

import com.bean.hotel_management.booking.model.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {

    private String id;
    private String bookingNumber;

    // User information
    private String userId;
    private String userEmail;
    private String userFullName;
    private String userPhoneNumber;

    // Guest information
    private GuestInfo primaryGuest;
    private List<GuestInfo> additionalGuests;

    // Room information
    private String roomId;
    private String roomNumber;
    private String roomName;
    private String roomType;

    // Group booking
    private String groupBookingId;
    private Boolean isGroupBooking;
    private Integer totalRoomsInGroup;

    // Booking dates
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private LocalDateTime actualCheckInTime;
    private LocalDateTime actualCheckOutTime;

    // Early/Late
    private Boolean isEarlyCheckIn;
    private Double earlyCheckInFee;
    private Boolean isLateCheckOut;
    private Double lateCheckOutFee;

    // Guest count
    private Integer numberOfGuests;
    private Integer numberOfChildren;

    // Pricing
    private Double roomPricePerNight;
    private Integer numberOfNights;
    private Double subtotal;
    private Double taxAmount;
    private Double serviceCharge;
    private Double discount;
    private List<ServiceCharge> additionalCharges;
    private Double additionalChargesTotal;
    private Double totalAmount;

    // Payment
    private BookingPaymentStatus paymentStatus;
    private String paymentStatusDisplay;
    private PaymentMethod paymentMethod;
    private String paymentMethodDisplay;
    private String paymentTransactionId;
    private LocalDateTime paymentDate;

    // Deposit
    private Double depositAmount;
    private Boolean depositPaid;
    private LocalDateTime depositPaidDate;

    // Status
    private BookingStatus status;
    private String statusDisplay;
    private String statusColor;

    // Special requests
    private String specialRequests;
    private List<String> addedServices;

    // Cancellation
    private LocalDateTime cancelledAt;
    private String cancellationReason;
    private Double cancellationFee;

    // Review
    private Boolean hasReview;
    private String reviewId;

    // Timestamps
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
    private LocalDateTime confirmedDate;

    // Admin
    private String adminNotes;
    private String bookingSource;

    // Computed fields
    private Boolean canCancel;
    private Boolean canCheckIn;
    private Boolean canCheckOut;
    private Boolean canReview;
    private Boolean canAddServiceCharges;

    // Days until check-in
    private Long daysUntilCheckIn;
}