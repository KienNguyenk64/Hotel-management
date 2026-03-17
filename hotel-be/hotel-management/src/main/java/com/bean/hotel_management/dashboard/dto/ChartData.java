package com.bean.hotel_management.dashboard.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChartData {
    private String label;
    private Double value;
    private Integer count;
    private String category;
}