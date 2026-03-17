package com.bean.hotel_management.dashboard.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerformanceMetrics {
    private Double averageResponseTime;
    private Integer totalApiCalls;
    private Double systemUptime;
    private Integer activeUsers;
    private Integer concurrentBookings;
}