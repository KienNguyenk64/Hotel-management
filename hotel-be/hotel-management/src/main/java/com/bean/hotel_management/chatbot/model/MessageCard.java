package com.bean.hotel_management.chatbot.model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageCard {
    private String title;
    private String subtitle;
    private String imageUrl;
    private String buttonText;
    private String buttonAction;
    private String buttonLink;
}