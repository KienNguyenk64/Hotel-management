package com.bean.hotel_management.chatbot.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateFAQRequest {

    @NotBlank(message = "Câu hỏi không được để trống")
    private String question;

    @NotBlank(message = "Câu trả lời không được để trống")
    private String answer;

    private List<String> keywords;
    private List<String> alternativeQuestions;
    private String category;
    private Integer priority;
}
