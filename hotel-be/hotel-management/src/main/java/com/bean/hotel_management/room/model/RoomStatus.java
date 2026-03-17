package com.bean.hotel_management.room.model;

import lombok.Getter;

@Getter
public enum RoomStatus {
    AVAILABLE("Available", "Còn trống"),
    OCCUPIED("Occupied", "Đang có khách"),
    RESERVED("Reserved", "Đã đặt trước"),
    MAINTENANCE("Maintenance", "Đang bảo trì"),
    CLEANING("Cleaning", "Đang dọn dẹp"),
    OUT_OF_SERVICE("Out of Service", "Ngừng hoạt động");

    private final String displayName;
    private final String vietnameseName;

    RoomStatus(String displayName, String vietnameseName) {
        this.displayName = displayName;
        this.vietnameseName = vietnameseName;
    }
}
