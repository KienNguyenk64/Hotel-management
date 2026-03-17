package com.bean.hotel_management.booking.model;

import lombok.Getter;

@Getter
public enum BookingPaymentStatus {
    UNPAID("Unpaid", "Chưa thanh toán"),
    PARTIALLY_PAID("Partially Paid", "Đã thanh toán một phần"),
    PAID("Paid", "Đã thanh toán"),
    REFUNDED("Refunded", "Đã hoàn tiền"),
    FAILED("Failed", "Thanh toán thất bại");

    private final String displayName;
    private final String vietnameseName;

    BookingPaymentStatus(String displayName, String vietnameseName) {
        this.displayName = displayName;
        this.vietnameseName = vietnameseName;
    }
}