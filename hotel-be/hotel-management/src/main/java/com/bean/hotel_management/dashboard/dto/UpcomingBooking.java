package com.bean.hotel_management.dashboard.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpcomingBooking {
    private String bookingId;
    private String bookingNumber;
    private String roomName;
    private String roomNumber;
    private String roomImage;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer daysUntilCheckIn;
    private String status;
    private Boolean canCancel;
}
