package com.bean.hotel_management.dashboard.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomStats {
    private Integer totalRooms;
    private Integer availableRooms;
    private Integer occupiedRooms;
    private Integer maintenanceRooms;
    private Integer cleaningRooms;
    private Double occupancyRate;
    private Double averageRoomPrice;
    private String mostBookedRoomId;
    private String mostBookedRoomName;
    private List<RoomTypeDistribution> roomTypeDistribution;
}