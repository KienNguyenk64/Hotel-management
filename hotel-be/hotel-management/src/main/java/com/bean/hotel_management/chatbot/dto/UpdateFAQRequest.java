package com.bean.hotel_management.chatbot.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateFAQRequest {

    private String question;
    private String answer;
    private List<String> keywords;
    private List<String> alternativeQuestions;
    private String category;
    private Integer priority;
    private Boolean isActive;
}
