package com.bean.hotel_management.room.model;

import lombok.Getter;

@Getter
public enum BedType {
    SINGLE("Single Bed", "Giường đơn", 1),
    DOUBLE("Double Bed", "Giường đôi", 2),
    QUEEN("Queen Bed", "Giường Queen", 2),
    KING("King Bed", "Giường King", 2),
    TWIN("Twin Beds", "2 giường đơn", 2),
    BUNK("Bunk Bed", "Giường tầng", 2);

    private final String displayName;
    private final String vietnameseName;
    private final int capacity;

    BedType(String displayName, String vietnameseName, int capacity) {
        this.displayName = displayName;
        this.vietnameseName = vietnameseName;
        this.capacity = capacity;
    }
}