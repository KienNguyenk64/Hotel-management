package com.bean.hotel_management.chatbot.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FAQResponse {

    private String id;
    private String question;
    private String answer;
    private String category;
    private Integer helpfulCount;
    private Integer notHelpfulCount;
    private Double helpfulRate;
}
