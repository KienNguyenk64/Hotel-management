package com.bean.hotel_management.dashboard.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomTypeDistribution {
    private String roomType;
    private Integer totalRooms;
    private Integer availableRooms;
    private Double occupancyRate;
    private Double averagePrice;
}