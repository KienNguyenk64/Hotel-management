package com.bean.hotel_management.booking.dto.request;

import com.bean.hotel_management.booking.model.BookingPaymentStatus;
import com.bean.hotel_management.booking.model.BookingStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingSearchRequest {

    private String keyword; // Tìm theo booking number, tên khách, email, phone

    private String cccdNumber; // Tìm theo CMND/CCCD

    private String userId;
    private String roomId;
    private String roomNumber;
    private String bookingNumber;

    private BookingStatus status;
    private BookingPaymentStatus paymentStatus;

    private LocalDate checkInDateFrom;
    private LocalDate checkInDateTo;
    private LocalDate checkOutDateFrom;
    private LocalDate checkOutDateTo;
    private LocalDate createdDateFrom;
    private LocalDate createdDateTo;

    private Double minAmount;
    private Double maxAmount;

    private String bookingSource;
    private Boolean isGroupBooking;
    private String groupBookingId;

    private Boolean hasReview;
    private Boolean depositPaid;
    private Boolean isEarlyCheckIn;
    private Boolean isLateCheckOut;

    private String sortBy;
    private String sortOrder;

    @Min(value = 0, message = "Page phải >= 0")
    private Integer page;

    @Min(value = 1, message = "Size phải >= 1")
    @Max(value = 100, message = "Size tối đa 100")
    private Integer size;
}