package com.bean.hotel_management.dashboard.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OverviewStats {
    private Integer totalRooms;
    private Integer availableRooms;
    private Integer occupiedRooms;
    private Double occupancyRate;
    private Integer todayCheckIns;
    private Integer todayCheckOuts;
    private Integer pendingBookings;
    private Double todayRevenue;
}
