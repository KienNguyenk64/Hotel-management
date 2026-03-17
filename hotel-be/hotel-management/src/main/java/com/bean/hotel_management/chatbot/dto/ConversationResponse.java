package com.bean.hotel_management.chatbot.dto;

import com.bean.hotel_management.chatbot.model.ChatMessage;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationResponse {

    private String id;
    private String sessionId;
    private String userId;
    private String userName;

    private List<ChatMessage> messages;

    private String status;
    private String category;

    private LocalDateTime startedAt;
    private LocalDateTime lastMessageAt;

    private Boolean needsHumanSupport;
    private Integer totalMessages;
}
