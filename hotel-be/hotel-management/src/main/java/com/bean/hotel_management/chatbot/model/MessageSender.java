package com.bean.hotel_management.chatbot.model;

import lombok.Getter;

@Getter
public enum MessageSender {
    USER("User", "Người dùng"),
    BOT("Bot", "Chatbot"),
    STAFF("Staff", "Nhân viên");

    private final String displayName;
    private final String vietnameseName;

    MessageSender(String displayName, String vietnameseName) {
        this.displayName = displayName;
        this.vietnameseName = vietnameseName;
    }
}