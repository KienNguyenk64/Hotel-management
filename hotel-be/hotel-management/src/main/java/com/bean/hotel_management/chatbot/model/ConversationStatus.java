package com.bean.hotel_management.chatbot.model;

import lombok.Getter;

@Getter
public enum ConversationStatus {
    ACTIVE("Active", "Đang hoạt động"),
    WAITING("Waiting", "Đang chờ"),
    RESOLVED("Resolved", "Đã giải quyết"),
    CLOSED("Closed", "Đã đóng"),
    TRANSFERRED("Transferred", "Chuyển nhân viên");

    private final String displayName;
    private final String vietnameseName;

    ConversationStatus(String displayName, String vietnameseName) {
        this.displayName = displayName;
        this.vietnameseName = vietnameseName;
    }
}