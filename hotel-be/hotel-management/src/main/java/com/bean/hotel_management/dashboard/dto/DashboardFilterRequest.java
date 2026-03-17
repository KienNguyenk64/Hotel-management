package com.bean.hotel_management.dashboard.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardFilterRequest {
    private LocalDate startDate;
    private LocalDate endDate;
    private String period; // TODAY, WEEK, MONTH, YEAR, CUSTOM
    private String groupBy; // DAY, WEEK, MONTH
}