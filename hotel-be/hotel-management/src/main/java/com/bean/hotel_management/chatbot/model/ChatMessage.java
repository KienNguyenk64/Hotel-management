package com.bean.hotel_management.chatbot.model;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    private String id;
    private String content;
    private MessageType type; // TEXT, IMAGE, QUICK_REPLY, CARD
    private MessageSender sender; // USER, BOT, STAFF
    private LocalDateTime timestamp;

    // For rich messages
    private List<QuickReply> quickReplies;
    private List<MessageCard> cards;
    private String imageUrl;

    // Bot metadata
    private String intentDetected;
    private Double confidence;
    private Boolean isHelpful; // User feedback on bot response
}