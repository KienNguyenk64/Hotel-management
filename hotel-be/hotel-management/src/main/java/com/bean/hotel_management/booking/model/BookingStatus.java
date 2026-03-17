package com.bean.hotel_management.booking.model;

import lombok.Getter;

@Getter
public enum BookingStatus {
    PENDING("Pending", "Chờ xác nhận"),
    CONFIRMED("Confirmed", "Đã xác nhận"),
    CHECKED_IN("Checked In", "Đã check-in"),
    CHECKED_OUT("Checked Out", "Đã check-out"),
    CANCELLED("Cancelled", "Đã hủy"),
    NO_SHOW("No Show", "Không đến"),
    COMPLETED("Completed", "Hoàn thành");

    private final String displayName;
    private final String vietnameseName;

    BookingStatus(String displayName, String vietnameseName) {
        this.displayName = displayName;
        this.vietnameseName = vietnameseName;
    }
}