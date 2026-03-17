package com.bean.hotel_management.dashboard.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDashboardResponse {
    private UserStats userStats;
    private List<RecentBooking> recentBookings;
    private List<UpcomingBooking> upcomingBookings;
    private List<RecommendedRoom> recommendedRooms;
    private UserActivitySummary activitySummary;
}
