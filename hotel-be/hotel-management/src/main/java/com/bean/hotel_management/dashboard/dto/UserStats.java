package com.bean.hotel_management.dashboard.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStats {
    private Integer totalBookings;
    private Integer upcomingBookings;
    private Integer completedBookings;
    private Integer cancelledBookings;
    private Double totalSpent;
    private Double averageSpent;
    private Integer loyaltyPoints;
    private String membershipTier;
}