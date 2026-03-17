package com.bean.hotel_management.booking.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddServiceChargeRequest {

    @NotBlank(message = "Service type không được để trống")
//    @Pattern(regexp = "MINIBAR|LAUNDRY|ROOM_SERVICE|SPA|PARKING|PHONE|OTHER",
//            message = "Service type không hợp lệ")
    private String serviceType;

    @NotBlank(message = "Mô tả không được để trống")
    private String description;

    @NotNull(message = "Số tiền không được để trống")
    @Min(value = 0, message = "Số tiền phải >= 0")
    private Double amount;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng phải >= 1")
    private Integer quantity;
}