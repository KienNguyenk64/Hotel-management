package com.bean.hotel_management.review.model;

import lombok.Getter;

@Getter
public enum ReviewStatus {
    PENDING("Pending", "Chờ duyệt"),
    APPROVED("Approved", "Đã duyệt"),
    REJECTED("Rejected", "Bị từ chối");

    private final String displayName;
    private final String vietnameseName;

    ReviewStatus(String displayName, String vietnameseName) {
        this.displayName = displayName;
        this.vietnameseName = vietnameseName;
    }

}
