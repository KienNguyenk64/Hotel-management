package com.bean.hotel_management.dashboard.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardResponse {
    private OverviewStats overviewStats;
    private BookingStats bookingStats;
    private RoomStats roomStats;
    private RevenueStats revenueStats;
    private List<RecentBooking> recentBookings;
    private List<TodayActivity> todayActivities;
    private List<ChartData> revenueChart;
    private List<ChartData> bookingTrendChart;
    private List<ChartData> roomOccupancyChart;
}
