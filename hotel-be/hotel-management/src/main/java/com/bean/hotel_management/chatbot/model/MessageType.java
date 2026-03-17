package com.bean.hotel_management.chatbot.model;

import lombok.Getter;

@Getter
public enum MessageType {
    TEXT("Text", "Văn bản"),
    IMAGE("Image", "Hình ảnh"),
    QUICK_REPLY("Quick Reply", "Trả lời nhanh"),
    CARD("Card", "Thẻ thông tin"),
    TYPING("Typing", "Đang gõ");

    private final String displayName;
    private final String vietnameseName;

    MessageType(String displayName, String vietnameseName) {
        this.displayName = displayName;
        this.vietnameseName = vietnameseName;
    }
}