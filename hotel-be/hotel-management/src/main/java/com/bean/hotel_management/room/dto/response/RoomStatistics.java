package com.bean.hotel_management.room.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomStatistics {

    private Integer totalRooms;
    private Integer availableRooms;
    private Integer occupiedRooms;
    private Integer maintenanceRooms;
    private Integer cleaningRooms;

    private Double averagePrice;
    private Double highestPrice;
    private Double lowestPrice;

    private Double totalRevenue;
    private Double averageRating;

    private Integer totalBookings;

    private List<RoomTypeStats> roomTypeStats;
}