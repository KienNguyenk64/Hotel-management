package com.bean.hotel_management.room.model;

import lombok.Getter;

@Getter
public enum RoomType {
    STANDARD("Standard Room", "Phòng tiêu chuẩn"),
    SUPERIOR("Superior Room", "Phòng cao cấp"),
    DELUXE("Deluxe Room", "Phòng sang trọng"),
    SUITE("Suite Room", "Phòng Suite"),
    EXECUTIVE("Executive Room", "Phòng điều hành"),
    PRESIDENTIAL("Presidential Suite", "Phòng Tổng thống"),
    FAMILY("Family Room", "Phòng gia đình"),
    HONEYMOON("Honeymoon Suite", "Phòng tân hôn");

    private final String displayName;
    private final String vietnameseName;

    RoomType(String displayName, String vietnameseName) {
        this.displayName = displayName;
        this.vietnameseName = vietnameseName;
    }

}