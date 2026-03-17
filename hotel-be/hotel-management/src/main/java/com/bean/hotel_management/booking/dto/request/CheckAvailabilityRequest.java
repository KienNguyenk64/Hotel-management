package com.bean.hotel_management.booking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckAvailabilityRequest {

    @NotBlank(message = "Room ID không được để trống")
    private String roomId;

    @NotNull(message = "Ngày check-in không được để trống")
    private LocalDate checkInDate;

    @NotNull(message = "Ngày check-out không được để trống")
    private LocalDate checkOutDate;
}