package com.bean.hotel_management.dashboard.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TodayActivity {
    private String type; // CHECK_IN, CHECK_OUT, NEW_BOOKING, CANCELLATION
    private String bookingNumber;
    private String roomNumber;
    private String guestName;
    private String time;
    private String status;
}
