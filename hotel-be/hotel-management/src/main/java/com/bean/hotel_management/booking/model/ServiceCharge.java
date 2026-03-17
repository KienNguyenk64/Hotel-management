package com.bean.hotel_management.booking.model;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceCharge {
    private String serviceType; // MINIBAR, LAUNDRY, ROOM_SERVICE, SPA, PARKING
    private String description;
    private Double amount;
    private Integer quantity;
    private LocalDateTime chargeDate;
    private String addedBy; // Staff ID
}