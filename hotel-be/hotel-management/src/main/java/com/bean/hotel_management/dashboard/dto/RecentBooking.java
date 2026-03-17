package com.bean.hotel_management.dashboard.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecentBooking {
    private String bookingId;
    private String bookingNumber;
    private String roomName;
    private String roomNumber;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private String status;
    private String statusColor;
    private Double totalAmount;
    private String guestName;
    private String guestEmail;
}