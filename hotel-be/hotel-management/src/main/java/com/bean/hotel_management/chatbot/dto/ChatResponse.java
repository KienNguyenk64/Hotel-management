package com.bean.hotel_management.chatbot.dto;

import com.bean.hotel_management.chatbot.model.MessageCard;
import com.bean.hotel_management.chatbot.model.MessageType;
import com.bean.hotel_management.chatbot.model.QuickReply;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatResponse {

    private String sessionId;
    private String message;
    private MessageType messageType;

    // Rich content
    private List<QuickReply> quickReplies;
    private List<MessageCard> cards;
    private String imageUrl;

    // Metadata
    private String intentDetected;
    private Double confidence;
    private Boolean needsHumanSupport;
    private LocalDateTime timestamp;
}
