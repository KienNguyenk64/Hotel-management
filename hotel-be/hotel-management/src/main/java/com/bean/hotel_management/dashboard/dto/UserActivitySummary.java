package com.bean.hotel_management.dashboard.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserActivitySummary {
    private Integer totalNightsStayed;
    private String favoriteRoomType;
    private Double averageBookingValue;
    private LocalDate lastBookingDate;
    private LocalDate memberSince;
    private Integer consecutiveBookings;
}