package com.bean.hotel_management.room.model;

import lombok.Getter;

@Getter
public enum RoomView {
    CITY("City View", "View thành phố"),
    GARDEN("Garden View", "View vườn"),
    POOL("Pool View", "View hồ bơi"),
    SEA("Sea View", "View biển"),
    MOUNTAIN("Mountain View", "View núi"),
    COURTYARD("Courtyard View", "View sân trong"),
    NO_VIEW("No View", "Không có view");

    private final String displayName;
    private final String vietnameseName;

    RoomView(String displayName, String vietnameseName) {
        this.displayName = displayName;
        this.vietnameseName = vietnameseName;
    }

}