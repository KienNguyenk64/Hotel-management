package com.bean.hotel_management.booking.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingStatistics {

    private Integer totalBookings;
    private Integer pendingBookings;
    private Integer confirmedBookings;
    private Integer checkedInBookings;
    private Integer completedBookings;
    private Integer cancelledBookings;

    private Double totalRevenue;
    private Double paidRevenue;
    private Double unpaidRevenue;

    private Integer todayCheckIns;
    private Integer todayCheckOuts;

    private Double averageBookingValue;
    private Double cancellationRate;
    private Double occupancyRate;
}