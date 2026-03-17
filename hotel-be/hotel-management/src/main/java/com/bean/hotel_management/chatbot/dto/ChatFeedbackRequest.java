package com.bean.hotel_management.chatbot.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatFeedbackRequest {

    @NotBlank(message = "Session ID không được để trống")
    private String sessionId;

    private Double rating; // 1-5 stars
    private String feedback;
    private Boolean wasHelpful;
}
