package com.bean.hotel_management.chatbot.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "chat_intents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatIntent {

    @Id
    private String id;

    private String intentName; // GREETING, BOOKING_INQUIRY, ROOM_INFO, etc.
    private String description;

    private List<String> trainingPhrases; // Example user inputs
    private List<String> responses; // Bot responses

    private List<String> requiredParameters; // e.g., checkInDate, roomType
    private String followUpIntent;

    private Boolean isActive;
    private Integer usageCount;
}
