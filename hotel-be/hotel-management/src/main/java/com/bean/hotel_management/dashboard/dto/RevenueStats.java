package com.bean.hotel_management.dashboard.dto;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueStats {
    private Double totalRevenue;
    private Double thisMonthRevenue;
    private Double thisYearRevenue;
    private Double todayRevenue;
    private Double averageDailyRevenue;
    private Double paidRevenue;
    private Double unpaidRevenue;

    // Comparison with previous period
    private Double revenueGrowthRate;
    private Double revenueGrowthAmount;

    // Revenue by payment method
    private Map<String, Double> revenueByPaymentMethod;
}