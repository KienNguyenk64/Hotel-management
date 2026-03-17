package com.bean.hotel_management.booking.dto.request;

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
public class GroupBookingRequest {

    @NotNull(message = "Danh sách phòng không được để trống")
    @Size(min = 2, max = 10, message = "Group booking từ 2-10 phòng")
    private List<@NotBlank String> roomIds;

    @NotNull(message = "Ngày check-in không được để trống")
    @FutureOrPresent(message = "Ngày check-in phải là hôm nay hoặc trong tương lai")
    private LocalDate checkInDate;

    @NotNull(message = "Ngày check-out không được để trống")
    @Future(message = "Ngày check-out phải trong tương lai")
    private LocalDate checkOutDate;

    @NotNull(message = "Thông tin khách cho từng phòng không được để trống")
    private List<@Valid CreateBookingRequest> roomBookings;

    private String groupName; // Tên nhóm (công ty, đoàn du lịch...)
    private String groupContactPerson;
    private String groupContactPhone;
    private String groupContactEmail;

    private String specialRequests;
}