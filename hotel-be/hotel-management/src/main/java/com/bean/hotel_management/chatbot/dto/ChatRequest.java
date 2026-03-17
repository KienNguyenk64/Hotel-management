package com.bean.hotel_management.chatbot.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRequest {

    @NotBlank(message = "Message không được để trống")
    private String message;

    private String sessionId; // For continuing conversation
    private String userId; // Optional, for logged-in users
    private String context; // BOOKING, ROOM_INQUIRY, GENERAL
}


