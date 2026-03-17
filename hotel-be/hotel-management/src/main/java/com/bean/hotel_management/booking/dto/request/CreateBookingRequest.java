package com.bean.hotel_management.booking.dto.request;

import com.bean.hotel_management.booking.model.GuestInfo;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBookingRequest {

    @NotBlank(message = "Room ID không được để trống")
    private String roomId;

    @NotNull(message = "Ngày check-in không được để trống")
    @FutureOrPresent(message = "Ngày check-in phải là hôm nay hoặc trong tương lai")
    private LocalDate checkInDate;

    @NotNull(message = "Ngày check-out không được để trống")
    @Future(message = "Ngày check-out phải trong tương lai")
    private LocalDate checkOutDate;

    @NotNull(message = "Số lượng khách không được để trống")
    @Min(value = 1, message = "Số lượng khách phải >= 1")
    @Max(value = 10, message = "Số lượng khách tối đa 10")
    private Integer numberOfGuests;

    @Min(value = 0, message = "Số lượng trẻ em phải >= 0")
    @Max(value = 5, message = "Số lượng trẻ em tối đa 5")
    private Integer numberOfChildren;

    // Guest information (người ở thực tế)
    @Valid
    @NotNull(message = "Thông tin khách chính không được để trống")
    private GuestInfo primaryGuest;

    private List<@Valid GuestInfo> additionalGuests;

    // Special options
    private Boolean isEarlyCheckIn;
    private Boolean isLateCheckOut;

    private String specialRequests;
    private List<String> addedServices;

    // Booking for someone else
    private Boolean bookingForOthers; // Đặt phòng cho người khác

    // Source
    private String bookingSource; // WEBSITE, MOBILE_APP, PHONE, WALK_IN
}