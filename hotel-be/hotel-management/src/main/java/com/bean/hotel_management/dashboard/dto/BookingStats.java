package com.bean.hotel_management.dashboard.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingStats {
    private Integer totalBookings;
    private Integer thisMonthBookings;
    private Integer pendingBookings;
    private Integer confirmedBookings;
    private Integer cancelledBookings;
    private Double cancellationRate;
    private Double averageBookingValue;
    private Integer averageStayDuration;

    // Comparison with previous period
    private Double bookingGrowthRate;
    private Integer bookingGrowthCount;
}
