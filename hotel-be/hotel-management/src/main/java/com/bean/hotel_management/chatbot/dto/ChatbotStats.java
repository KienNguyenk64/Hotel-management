package com.bean.hotel_management.chatbot.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatbotStats {

    private Integer totalConversations;
    private Integer activeConversations;
    private Integer resolvedConversations;
    private Integer transferredToHuman;

    private Double averageSatisfactionRating;
    private Double resolutionRate;
    private Double transferRate;

    private Integer totalMessages;
    private Double averageMessagesPerConversation;
    private Double averageResponseTime;

    private List<CategoryStats> categoryStats;
    private List<IntentStats> intentStats;
}
