package com.bean.hotel_management.chatbot.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "faqs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FAQ {

    @Id
    private String id;

    private String question;
    private String answer;
    private List<String> keywords; // For matching
    private List<String> alternativeQuestions;

    private String category;
    private Integer priority;
    private Boolean isActive;

    private Integer viewCount;
    private Integer helpfulCount;
    private Integer notHelpfulCount;

    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
}