package com.bean.hotel_management.dashboard.service;

import com.bean.hotel_management.dashboard.dto.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface IDashboardService {


    AdminDashboardResponse getAdminDashboard();

    AdminDashboardResponse getAdminDashboard(DashboardFilterRequest filter);

    OverviewStats getOverviewStats();

    BookingStats getBookingStats(LocalDate startDate, LocalDate endDate);

    RoomStats getRoomStats();

    RevenueStats getRevenueStats(LocalDate startDate, LocalDate endDate);

    List<RecentBooking> getRecentBookings(Integer limit);

    List<TodayActivity> getTodayActivities();

    List<ChartData> getRevenueChart(LocalDate startDate, LocalDate endDate, String groupBy);

    List<ChartData> getBookingTrendChart(LocalDate startDate, LocalDate endDate, String groupBy);

    List<ChartData> getRoomOccupancyChart(LocalDate startDate, LocalDate endDate);

    List<ChartData> getRevenueByRoomType(LocalDate startDate, LocalDate endDate);

    List<ChartData> getBookingStatusDistribution();

    List<ChartData> getPaymentMethodDistribution(LocalDate startDate, LocalDate endDate);

    UserDashboardResponse getUserDashboard(String userEmail);

    UserStats getUserStats(String userEmail);

    UserActivitySummary getUserActivitySummary(String userEmail);

    List<RecommendedRoom> getRecommendedRooms(String userEmail);

    List<ChartData> getTopPerformingRooms(Integer limit);

    List<ChartData> getGuestDemographics();

    List<ChartData> getPeakBookingTimes();

    Double getAverageLengthOfStay(LocalDate startDate, LocalDate endDate);

    List<ChartData> getCancellationTrends(LocalDate startDate, LocalDate endDate);

    Map<String, Object> comparePerformance(
            LocalDate period1Start, LocalDate period1End,
            LocalDate period2Start, LocalDate period2End
    );

    Map<String, Object> getYearOverYearComparison(Integer year);
}