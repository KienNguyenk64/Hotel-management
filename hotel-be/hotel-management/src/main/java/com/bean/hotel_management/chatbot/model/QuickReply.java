package com.bean.hotel_management.chatbot.model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuickReply {
    private String text;
    private String value;
    private String icon;
}