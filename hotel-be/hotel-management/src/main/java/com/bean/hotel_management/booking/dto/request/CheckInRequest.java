package com.bean.hotel_management.booking.dto.request;

import com.bean.hotel_management.booking.model.GuestInfo;
import com.bean.hotel_management.booking.model.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckInRequest {

    @NotNull(message = "Phương thức thanh toán đặt cọc không được để trống")
    private PaymentMethod depositPaymentMethod;

    private String depositTransactionId;

    @Valid
    @NotNull(message = "Thông tin xác thực khách không được để trống")
    private GuestInfo guestVerification;

    private String specialNotes;
}