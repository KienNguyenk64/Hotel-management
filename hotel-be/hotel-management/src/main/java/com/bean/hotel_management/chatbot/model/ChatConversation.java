package com.bean.hotel_management.chatbot.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;


@Document(collection = "chat_conversations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatConversation {

    @Id
    private String id;

    private String sessionId; // Unique session identifier
    private String userId; // Null for guest users
    private String userEmail;
    private String userName;

    private List<ChatMessage> messages;

    private ConversationStatus status;
    private String category; // BOOKING, ROOM_INFO, FACILITY, COMPLAINT, etc.

    private LocalDateTime startedAt;
    private LocalDateTime lastMessageAt;
    private LocalDateTime closedAt;

    private Boolean needsHumanSupport;
    private String assignedStaffId;

    private Integer totalMessages;
    private Double satisfactionRating; // 1-5 stars
    private String feedback;
}





